"use client";
import {useState} from "react";
import {browserSupabase,ensureAnonymous} from "@/lib/supabase-client";
import {countOf} from "@/lib/types";
type Result={liked:boolean;like_count:number};
const valid=(x:unknown):x is Result=>typeof x==="object"&&x!==null&&typeof (x as Result).liked==="boolean"&&typeof (x as Result).like_count==="number";
export function LikeButton({id,count,initialLiked,large=false}:{id:string;count:number;initialLiked:boolean;large?:boolean}){const[liked,setLiked]=useState(initialLiked),[total,setTotal]=useState(count),[busy,setBusy]=useState(false),[error,setError]=useState("");async function toggle(){if(busy)return;setBusy(true);setError("");try{const db=browserSupabase();await ensureAnonymous(db);const{data,error:rpcError}=await db.rpc("toggle_photo_like",{p_photo_id:id});if(rpcError)throw rpcError;const r=Array.isArray(data)?data[0]:data;if(!valid(r))throw new Error("bad response");setLiked(r.liked);setTotal(r.like_count)}catch{setError("点赞失败，请检查网络后重试。 ")}finally{setBusy(false)}}return <div><button type="button" disabled={busy} onClick={toggle} aria-pressed={liked} className={`${large?"w-full px-5 py-3":"px-3 py-2 text-sm"} inline-flex items-center justify-center gap-2 rounded-md font-bold ${liked?"bg-orange-50 text-orange-700":"bg-stone-100 text-stone-700 hover:bg-orange-50"}`}>{liked?"❤️":"♡"}<span>{busy?"处理中...":large?"给它点赞":countOf(total)}</span>{large&&<span className="font-medium">{countOf(total)} 赞</span>}</button>{error&&<p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}</div>}

