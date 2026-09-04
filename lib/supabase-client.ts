import { createBrowserClient } from "@supabase/ssr";
function config() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; if (!url || !key) throw new Error("Supabase 尚未配置，请先填写 .env.local。"); return { url, key }; }
export function browserSupabase() { const { url, key } = config(); return createBrowserClient(url, key); }
export async function ensureAnonymous(client: ReturnType<typeof browserSupabase>) { const { data: { session }, error } = await client.auth.getSession(); if (error) throw error; if (session?.user) return session.user; const { data, error: signInError } = await client.auth.signInAnonymously(); if (signInError || !data.user) throw signInError ?? new Error("无法创建匿名身份"); return data.user; }
