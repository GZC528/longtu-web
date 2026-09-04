"use client";
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="text-3xl font-black">页面暂时无法打开</h1><p className="mt-3 text-stone-600">可能是网络波动或服务暂时不可用，请稍后重试。</p><button type="button" onClick={reset} className="mt-6 rounded-md bg-[#e84932] px-5 py-3 font-bold text-white">重新加载</button></div>;
}
