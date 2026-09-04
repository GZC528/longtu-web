/* eslint-disable @next/next/no-img-element -- public Supabase URLs have unknown dimensions. */
import Link from "next/link";
import { Empty } from "@/components/photo-card";
import { photos } from "@/lib/photos";
import { countOf, dateOf, titleOf, type Photo } from "@/lib/types";
export const dynamic = "force-dynamic";
async function load(page: number): Promise<{ list: Photo[]; error: boolean }> { try { return { list: await photos("hot", page), error: false }; } catch { return { list: [], error: true }; } }
export default async function Ranking({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1); const data = await load(page);
  return <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><h1 className="text-3xl font-black">龙图排行榜</h1><p className="mt-2 text-stone-600">按点赞数量排名，同分时更早上传的图片优先。</p>
    {data.error ? <p className="mt-8 rounded bg-red-50 p-4 text-red-700">排行榜暂时无法加载，请稍后重试。</p> : !data.list.length ? <Empty ranking /> : <><div className="mt-8 overflow-hidden rounded-lg border border-stone-200 bg-white">{data.list.map((p) => <Link href={`/photo/${p.id}`} key={p.id} className="flex items-center gap-3 border-b border-stone-100 p-3 hover:bg-orange-50 sm:gap-5"><b className="w-10 text-center text-lg">{p.rank === 1 ? "🥇" : p.rank === 2 ? "🥈" : p.rank === 3 ? "🥉" : `#${p.rank}`}</b>{/* Supabase URLs and image dimensions are user generated. */}<img src={p.image_url} alt="" className="h-16 w-20 rounded object-cover sm:h-20 sm:w-28" /><div className="min-w-0 flex-1"><h2 className="truncate font-bold">{titleOf(p.title)}</h2><p className="mt-1 text-xs text-stone-500">{dateOf(p.created_at)}</p></div><b className="text-orange-700">❤️ {countOf(p.like_count)}</b></Link>)}</div><div className="mt-6 flex justify-between"><Link className={`rounded border px-4 py-2 ${page === 1 ? "pointer-events-none opacity-40" : ""}`} href={`/ranking?page=${page - 1}`}>上一页</Link><Link className="rounded border px-4 py-2" href={`/ranking?page=${page + 1}`}>下一页</Link></div></>}
  </div>;
}

