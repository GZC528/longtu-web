import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
function config() { const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; if (!url || !key) throw new Error("Supabase 尚未配置，请先填写 .env.local。"); return { url, key }; }
export async function serverSupabase() { const { url, key } = config(); const store = await cookies(); return createServerClient(url, key, { cookies: { getAll: () => store.getAll(), setAll: () => {} } }); }
