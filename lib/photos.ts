import {serverSupabase} from "./supabase-server";
import type {Photo,Sort} from "./types";
const valid=(x:unknown):x is Photo=>typeof x==="object"&&x!==null&&typeof (x as Photo).id==="string"&&typeof (x as Photo).like_count==="number";
export async function photos(sort:Sort,page=1){const db=await serverSupabase();const{data,error}=await db.rpc("get_public_photos",{p_sort:sort,p_page:page,p_page_size:20});if(error)throw new Error("暂时无法加载图片，请稍后重试。");return Array.isArray(data)?data.filter(valid):[]}
export async function photo(id:string){const db=await serverSupabase();const{data,error}=await db.rpc("get_photo_detail",{p_photo_id:id});if(error)throw new Error("暂时无法加载图片，请稍后重试。");const result=Array.isArray(data)?data[0]:data;return valid(result)?result:null}
export async function liked(ids:string[]){if(!ids.length)return new Set<string>();const db=await serverSupabase();const{data:{user}}=await db.auth.getUser();if(!user)return new Set<string>();const{data}=await db.from("likes").select("photo_id").in("photo_id",ids);return new Set((data??[]).map(x=>x.photo_id as string))}

