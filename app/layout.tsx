import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
export const metadata: Metadata={title:"龙图网 - 上传你的龙图，让大家来投票",description:"龙图网是一个图片上传与投票排行榜社区，上传你的龙图，看看谁能登上榜首。"};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body><Navbar/><main>{children}</main></body></html>}
