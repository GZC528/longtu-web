# 龙图网

一个可部署到 Vercel 的公开图片社区。访客无需注册即可用 Supabase 匿名身份上传 JPG/PNG/WEBP 图片、点赞或取消点赞，并实时参与排行榜。

## 技术栈

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS
- Supabase PostgreSQL、Storage、Anonymous Auth
- Vercel 部署

## 本地运行

1. 安装 Node.js 20.9 或更高版本。
2. 在本目录执行 `npm install`。
3. 复制 `.env.example` 为 `.env.local`，填写 Supabase 项目的 URL 和 anon key。
4. 按下一节完成 Supabase 配置。
5. 执行 `npm run dev`，访问 `http://localhost:3000`。

## 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建一个免费项目。
2. 打开 **Authentication > Providers > Anonymous**，启用 `Allow anonymous sign-ins`。
3. 打开 **SQL Editor**，粘贴并执行 [supabase/schema.sql](./supabase/schema.sql) 的全部内容。它会创建 `photos`、`likes`、索引、RLS 策略、`photos` Storage bucket 和点赞/榜单 RPC。
4. 到 **Project Settings > API** 复制 Project URL 与 anon public key，填写 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon-public-key
```

`schema.sql` 会创建公开读取、10MB 限制、仅 JPG/PNG/WEBP 的 `photos` bucket。若你已手动建过 bucket，请确保名字是 `photos`、Public 开启，并保留 SQL 中的 Storage 策略。

不要把 `service_role` key 放进 `.env.local`、Vercel 环境变量或浏览器代码。本站只使用 anon key。

## 数据与安全设计

- `photos.uploader_id` 必须等于 `auth.uid()`，不能冒用别人的上传身份。
- `likes` 有 `(photo_id, user_id)` 唯一约束。
- 浏览器不能直接修改 `likes`；`toggle_photo_like` 在数据库中使用 `auth.uid()` 原子地插入或删除，阻断手工伪造点赞用户。
- 排行榜由数据库按点赞数倒序、上传时间正序计算；每页 20 条，前端不下载全量数据计算。
- 图片存到 Supabase Storage，数据库仅保存 storage path 与公开 URL。

## 检查与构建

```bash
npm run lint
npm run build
npm run start
```

## 部署 Vercel

1. 将 `longtu-web` 推送到 GitHub/GitLab/Bitbucket 仓库。
2. 在 Vercel 点击 **Add New > Project**，导入该仓库，Framework 选择 Next.js。
3. 在 Vercel 的 **Environment Variables** 添加与 `.env.local` 相同的两个 `NEXT_PUBLIC_SUPABASE_*` 变量。
4. 点击 Deploy。之后每次推送主分支会自动部署。
5. 在 Supabase **Authentication > URL Configuration** 将 Vercel 域名加入 Site URL 和 Redirect URLs，方便匿名会话在正式域名正常工作。

## 常见问题

**上传提示失败**：确认 Anonymous provider 已开启，bucket 名为 `photos`，并完整执行了 SQL。

**图片能上传但主页没数据**：确认 `photos` 表的 RLS `public reads photos` 策略和两个 `get_*` 函数已创建。

**点赞数刷新后不对**：确认没有跳过 `toggle_photo_like` 函数与 `likes` 唯一约束；不要直接给客户端开放 `likes` 的 insert/delete 策略。

**部署报环境变量错误**：在 Vercel Preview 与 Production 环境均填写这两个变量，然后重新部署。

## 第二阶段建议

增加举报与内容审核、图片删除/编辑、按时间范围的周榜、分享海报、标签搜索、注册账户和后台审核队列。公开图片站上线前还应配置验证码、上传频率限制与内容安全审核服务。
