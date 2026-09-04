"use client";
import {useState} from "react";
export function ShareButton(){const[done,setDone]=useState(false);async function copy(){try{await navigator.clipboard.writeText(window.location.href);setDone(true);setTimeout(()=>setDone(false),1800)}catch{setDone(false)}}return <button type="button" onClick={copy} className="mt-3 w-full rounded-md border border-stone-300 px-4 py-3 font-bold hover:bg-stone-50">{done?"链接已复制":"复制分享链接"}</button>}
