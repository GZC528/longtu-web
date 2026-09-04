import Link from "next/link";
import { Empty, PhotoCard } from "@/components/photo-card";
import { liked, photos } from "@/lib/photos";
import type { Photo, Sort } from "@/lib/types";
export const dynamic = "force-dynamic";
async function load(sort: Sort): Promise<{ list: Photo[]; myLikes: Set<string>; error: boolean }> {
  try { const list = await photos(sort); return { list, myLikes: await liked(list.map((p) => p.id)), error: false }; }
  catch { return { list: [], myLikes: new Set<string>(), error: true }; }
}
export default async function Home({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
  const sort: Sort = (await searchParams).sort === "new" ? "new" : "hot";
  const data = await load(sort);
  return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
    <section className="mb-9 rounded-lg bg-stone-900 px-6 py-10 text-white sm:px-10"><p className="text-sm font-bold text-orange-300">图片社区排行榜</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">本周最强龙图</h1><p className="mt-3 text-stone-300">上传你的龙图，让大家来投票。</p><Link href="/upload" className="mt-6 inline-block rounded-md bg-[#e84932] px-4 py-3 font-bold">上传图片</Link></section>
    {data.error ? <p className="rounded-md bg-red-50 p-4 text-red-700">图片暂时无法加载，请检查 Supabase 配置后重试。</p> : <><div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-black">大家都在看</h2><div className="rounded-md bg-stone-100 p-1 text-sm font-bold"><Link className={`inline-block rounded px-3 py-2 ${sort === "hot" ? "bg-white shadow" : "text-stone-500"}`} href="/">🔥 最热门</Link><Link className={`inline-block rounded px-3 py-2 ${sort === "new" ? "bg-white shadow" : "text-stone-500"}`} href="/?sort=new">🆕 最新上传</Link></div></div>{data.list.length ? <div className="grid-photos">{data.list.map((p) => <PhotoCard key={p.id} photo={p} liked={data.myLikes.has(p.id)} />)}</div> : <Empty />}</>}
  </div>;
}
