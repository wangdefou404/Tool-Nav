# 导航网站 Next.js + Supabase 版本

这是将原有的 Go + SQLite 导航网站迁移到 Next.js + Supabase 架构的新版本。

## 技术栈

- **前端**: Next.js 14 + React + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **认证**: JWT + bcrypt
- **部署**: Vercel

## 项目结构

```
next-app/
├── src/
│   ├── app/
│   │   └── api/                 # API Routes
│   │       ├── login/           # 用户登录
│   │       ├── logout/          # 用户登出
│   │       ├── img/             # 图片获取
│   │       ├── seo/             # SEO元标签
│   │       └── admin/           # 管理员API
│   │           ├── all/         # 获取所有数据
│   │           ├── tool/        # 工具管理
│   │           ├── catelog/     # 分类管理
│   │           ├── setting/     # 设置管理
│   │           ├── user/        # 用户管理
│   │           ├── apiToken/    # API Token管理
│   │           ├── upload/      # 文件上传
│   │           ├── exportTools/ # 工具导出
│   │           ├── importTools/ # 工具导入
│   │           ├── ads/         # 广告设置
│   │           └── seo/         # SEO设置
│   └── lib/
│       ├── supabase.ts          # Supabase客户端配置
│       ├── jwt.ts               # JWT工具函数
│       └── auth.ts              # 认证中间件
├── scripts/
│   ├── create-tables.sql        # 数据库表结构
│   └── migrate-data.js          # 数据迁移脚本
├── .env.local                   # 环境变量
├── vercel.json                  # Vercel部署配置
└── package.json
```

## 环境配置

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 创建新项目
2. 获取项目的 URL 和 API Keys
3. 在 Supabase SQL Editor 中执行 `scripts/create-tables.sql` 创建表结构

### 2. 配置环境变量

复制 `.env.local` 文件并填入你的 Supabase 配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 3. 数据迁移（可选）

如果你有原有的 SQLite 数据需要迁移：

```bash
# 确保原有的 nav.db 文件在项目根目录
node scripts/migrate-data.js
```

## API 接口

### 公开接口

- `GET /api` - 获取所有工具和分类数据
- `GET /api/img?url=filename` - 获取图片
- `GET /api/seo/meta` - 获取SEO元标签
- `POST /api/login` - 用户登录
- `GET /api/logout` - 用户登出

### 管理员接口（需要认证）

- `GET /api/admin/all` - 获取所有管理数据
- `POST /api/admin/tool` - 添加工具
- `PUT /api/admin/tool/[id]` - 更新工具
- `DELETE /api/admin/tool/[id]` - 删除工具
- `PUT /api/admin/tools/sort` - 工具排序
- `POST /api/admin/catelog` - 添加分类
- `PUT /api/admin/catelog/[id]` - 更新分类
- `DELETE /api/admin/catelog/[id]` - 删除分类
- `PUT /api/admin/setting` - 更新设置
- `PUT /api/admin/user` - 更新用户信息
- `POST /api/admin/apiToken` - 创建API Token
- `DELETE /api/admin/apiToken/[id]` - 删除API Token
- `POST /api/admin/upload` - 上传文件
- `GET /api/admin/exportTools` - 导出工具
- `POST /api/admin/importTools` - 导入工具
- `GET/PUT /api/admin/ads/settings` - 广告设置
- `GET/PUT /api/admin/seo/settings` - SEO设置

## 部署到 Vercel

### 1. 连接 GitHub 仓库

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目

### 2. 配置环境变量

在 Vercel 项目设置中添加环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

### 3. 部署

Vercel 会自动部署项目。

## 默认账户

- 用户名: `admin`
- 密码: `admin123`

**重要**: 部署后请立即修改默认密码！

## 数据库表结构

### nav_user - 用户表
- id: 主键
- username: 用户名
- password: 密码（bcrypt加密）

### nav_catelog - 分类表
- id: 主键
- name: 分类名称
- sort: 排序
- hide: 是否隐藏

### nav_table - 工具表
- id: 主键
- name: 工具名称
- url: 工具链接
- logo: 工具图标
- catelog: 分类ID
- description: 描述
- sort: 排序
- hide: 是否隐藏

### nav_setting - 设置表
- id: 主键
- favicon: 网站图标
- title: 网站标题
- icp: 备案号
- logo: 网站Logo

### nav_api_token - API Token表
- id: 主键
- name: Token名称
- value: Token值
- disabled: 是否禁用

### nav_img - 图片表
- id: 主键
- name: 文件名
- data: Base64数据
- type: 文件类型
- size: 文件大小

### nav_ads_settings - 广告设置表
- Google AdSense 配置
- Google Analytics 配置
- 自定义广告代码

### nav_seo_settings - SEO设置表
- Meta标签配置
- Open Graph配置
- Twitter Card配置
- 结构化数据

## 注意事项

1. **安全性**: 确保 `SUPABASE_SERVICE_ROLE_KEY` 和 `JWT_SECRET` 的安全
2. **数据库**: Supabase 免费版有一定限制，生产环境建议升级
3. **文件上传**: 当前使用Base64存储在数据库中，大量图片建议使用对象存储
4. **缓存**: 生产环境建议添加适当的缓存策略

## 迁移对比

| 功能 | 原版本 (Go + SQLite) | 新版本 (Next.js + Supabase) |
|------|---------------------|-----------------------------|
| 后端 | Go Gin | Next.js API Routes |
| 数据库 | SQLite | PostgreSQL (Supabase) |
| 认证 | Session | JWT |
| 部署 | 自托管 | Vercel |
| 扩展性 | 有限 | 高 |
| 维护成本 | 高 | 低 |

## 支持

如有问题，请查看：
1. [Next.js 文档](https://nextjs.org/docs)
2. [Supabase 文档](https://supabase.com/docs)
3. [Vercel 文档](https://vercel.com/docs)