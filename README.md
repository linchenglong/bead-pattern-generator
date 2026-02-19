# 拼豆图纸生成器

上传照片或选择内置素材，一键生成带色号标注的拼豆图纸 + 用料清单，方便打印制作。

**线上地址**：https://bead-pattern-generator.netlify.app

## 功能特性

- **图片输入**：支持上传 JPG/PNG/WebP，也可从 5 个分类（萌宠/二次元/风景/花卉/美食）共 66 张内置素材中选择
- **多品牌色板**：Artkal (144色) / Perler (65色) / Hama (52色)，支持切换品牌
- **色彩量化**：基于 CIEDE2000 色差公式，使用 image-q 库进行高质量颜色量化
- **多种模式**：彩色 / 灰度 / 黑白，可选 Floyd-Steinberg 抖动
- **可调参数**：4 档尺寸预设 + 自定义尺寸，8/16/32/64/全色板颜色限制
- **双视图预览**：像素预览图 + 带色号标注的网格图纸（每 5 行/列加粗线）
- **导出下载**：PNG 图纸 + TXT 用料清单
- **使用限制**：每人 1 次免费生成，之后需要兑换码（基于 IP 指纹 + Upstash Redis）
- **管理后台**：`/admin` 页面可批量生成兑换码

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) + React 19 |
| 语言 | TypeScript 5.9 |
| 样式 | Tailwind CSS 4 |
| 字体 | Outfit + JetBrains Mono (Google Fonts) |
| 色彩量化 | image-q (CIEDE2000 + RGBQuant) |
| 数据库 | Upstash Redis (REST API) |
| 认证 | jose (JWT 签发/验证) |
| 部署 | Netlify (@netlify/plugin-nextjs) |

## 项目结构

```
app/
  layout.tsx          根布局，字体配置
  page.tsx             首页，核心业务逻辑编排
  globals.css         全局样式（陶土暖色系主题）
  admin/page.tsx        管理后台（生成/查看兑换码）
  api/
    check-usage/route.ts      检查/消耗免费次数
    redeem/route.ts        兑换码验证
    admin/
    generate/route.ts         批量生成兑换码
      codes/route.ts        查询兑换码列表

components/
  ImageUploader.tsx  拖拽/点击上传图片
  ImageGallery.tsx              内置素材库（分类 Tab + 缩略图网格）
  ConfigPanel.tsx        参数配置面板（尺寸/品牌/颜色模式等）
  BeadPreview.tsx             预览区（像素图 / 网格图纸切换）
  MaterialList.tsx  用料清单表格
  DownloadButton.tsx            下载 PNG 图纸 + TXT 用料清单
  RedeemDialog.tsx              兑换码输入弹窗

lib/
  palette-registry.ts     色板注册表（BeadColor 接口 + 多品牌合并）
  artkal-palette.ts             Artkal 色板数据 (144 色)
  perler-palette.ts             Perler 色板数据 (65 色)
  hama-palette.ts     Hama 色板数据 (52 色)
  palettes.ts         统一导入，触发色板注册副作用
  brand-palettes.ts             旧版兼容入口
  builtin-images.ts             内置图片库数据（66 张 Unsplash 图片）
  quantize.ts 图像量化核心（缩放 → 像素提取 → 量化 → 色板映射）
  grid-renderer.ts          Canvas 渲染器（像素图 / 网格图纸 / 用料文本）
  redis.ts           Upstash Redis 客户端
  usage.ts        免费次数管理 + JWT 签发/验证

netlify.toml     Netlify 构建配置
package.json
tsconfig.json
```

## 核心流程

```
用户选择图片 → Canvas 缩放到目标尺寸 → 提取 RGBA 像素
    ↓
颜色模式预处理（灰度 / 黑白）
    ↓
image-q 提取 N 种主色调（CIEDE2000 + RGBQuant）
    ↓
将主色调映射到最近的拼豆色板颜色（Lab 色差最小化）
    ↓
用映射后的色板对全图做最终量化（支持 Floyd-Steinberg 抖动）
    ↓
输出 BeadColor[][] 矩阵 → 渲染预览 + 统计用料
```

## 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入真实的 Redis URL、Token、JWT Secret、管理密码

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 环境变量

在 `.env.local` 中配置：

| 变量 | 说明 | 示例 |
|------|------|------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST 地址 | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis 鉴权 Token | `AXxx...` |
| `JWT_SECRET` | JWT 签名密钥（至少 32 字符） | `your-random-secret-string-here!!` |
| `ADMIN_PASSWORD` | 管理后台密码 | `my-admin-password` |

> **注意**：Redis 连不上时，所有生成请求会被拒绝（fail-closed 策略）。本地开发如果不需要使用限制功能，需要修改 `check-usage` 路由逻辑直接放行。

## 部署

项目部署在 Netlify，通过 `@netlify/plugin-nextjs` 插件支持 Next.js App Router + API Routes。

```bash
# 构建
npm run build

# 手动部署
npx netlify deploy --prod
```

也可通过 Git push 到 main 分支触发自动部署。

环境变量需在 Netlify Dashboard → Site settings → Environment variables 中配置。

## 管理后台

访问 `/admin` 页面：

1. 输入 `ADMIN_PASSWORD` 登录
2. 设置数量，点击「生成兑换码」
3. 生成的 8 位兑换码存入 Redis，状态为 `unused`
4. 用户兑换后标记为 `used:{timestamp}`，签发 JWT
5. JWT 使用一次后自动清除（一码一次生成）

## 版本记录

- **v0.1.0-beta** (2026-02-19) — 首个可用版本
  - 图片上传 + 内置素材库（5 分类 66 张 Unsplash 图片）
  - Artkal / Perler / Hama 三品牌色板
  - CIEDE2000 量化 + 像素预览 + 网格图纸 + 用料清单
  - 兑换码使用限制系统 + 管理后台

## 回退到稳定版本

```bash
git checkout v0.1.0-beta
```
