-- Run this entire file in Supabase SQL Editor before using the site.
create extension if not exists pgcrypto;
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(), title varchar(50), image_path text not null unique,
  image_url text not null, created_at timestamptz not null default now(), uploader_id uuid not null references auth.users(id) on delete cascade
);
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(), photo_id uuid not null references public.photos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, created_at timestamptz not null default now(),
  unique(photo_id,user_id)
);
create index if not exists photos_created_at_idx on public.photos(created_at asc);
create index if not exists likes_photo_id_idx on public.likes(photo_id);
create index if not exists likes_photo_user_idx on public.likes(photo_id,user_id);
alter table public.photos enable row level security;
alter table public.likes enable row level security;
create policy "public reads photos" on public.photos for select using (true);
create policy "anonymous uploads own photos" on public.photos for insert to authenticated with check (uploader_id = auth.uid());
create policy "users read own likes" on public.likes for select to authenticated using (user_id = auth.uid());
-- Likes are only changed through the security-definer function below.
create or replace function public.get_public_photos(p_sort text default 'hot', p_page integer default 1, p_page_size integer default 20)
returns table(id uuid,title varchar,image_path text,image_url text,created_at timestamptz,uploader_id uuid,like_count bigint,rank bigint)
language sql stable security definer set search_path=public as $$
 with scored as (select p.*,count(l.id)::bigint as likes from photos p left join likes l on l.photo_id=p.id group by p.id), ranked as (select *,row_number() over(order by likes desc,created_at asc)::bigint as position from scored)
 select id,title,image_path,image_url,created_at,uploader_id,likes,position from ranked order by case when p_sort='new' then created_at end desc nulls last, case when p_sort='new' then id end desc, case when p_sort<>'new' then likes end desc, case when p_sort<>'new' then created_at end asc offset greatest(p_page-1,0)*least(greatest(p_page_size,1),50) limit least(greatest(p_page_size,1),50);
$$;
create or replace function public.get_photo_detail(p_photo_id uuid)
returns table(id uuid,title varchar,image_path text,image_url text,created_at timestamptz,uploader_id uuid,like_count bigint,rank bigint)
language sql stable security definer set search_path=public as $$ select * from public.get_public_photos('hot',1,50) where id=p_photo_id $$;
-- A separate direct query preserves rank even for records past first 50.
create or replace function public.get_photo_detail(p_photo_id uuid)
returns table(id uuid,title varchar,image_path text,image_url text,created_at timestamptz,uploader_id uuid,like_count bigint,rank bigint)
language sql stable security definer set search_path=public as $$ with scored as(select p.*,count(l.id)::bigint likes from photos p left join likes l on l.photo_id=p.id group by p.id), ranked as(select *,row_number() over(order by likes desc,created_at asc)::bigint position from scored) select id,title,image_path,image_url,created_at,uploader_id,likes,position from ranked where id=p_photo_id $$;
create or replace function public.toggle_photo_like(p_photo_id uuid) returns table(liked boolean,like_count bigint)
language plpgsql security definer set search_path=public as $$ declare v_user uuid:=auth.uid(); begin if v_user is null then raise exception 'authentication required'; end if; if not exists(select 1 from photos where id=p_photo_id) then raise exception 'photo not found'; end if; if exists(select 1 from likes where photo_id=p_photo_id and user_id=v_user) then delete from likes where photo_id=p_photo_id and user_id=v_user; liked:=false; else insert into likes(photo_id,user_id) values(p_photo_id,v_user); liked:=true; end if; select count(*)::bigint into like_count from likes where photo_id=p_photo_id; return next; end; $$;
revoke all on function public.get_public_photos(text,integer,integer) from public;
revoke all on function public.get_photo_detail(uuid) from public;
revoke all on function public.toggle_photo_like(uuid) from public;
grant execute on function public.get_public_photos(text,integer,integer) to anon,authenticated;
grant execute on function public.get_photo_detail(uuid) to anon,authenticated;
grant execute on function public.toggle_photo_like(uuid) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('photos','photos',true,10485760,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=true,file_size_limit=10485760,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
create policy "public reads photo objects" on storage.objects for select using(bucket_id='photos');
create policy "authenticated upload own folder" on storage.objects for insert to authenticated with check(bucket_id='photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "authenticated delete own objects" on storage.objects for delete to authenticated using(bucket_id='photos' and (storage.foldername(name))[1]=auth.uid()::text);



