# 导航项目 Vercel + Supabase 迁移需求文档

## 1. 产品概述

本项目旨在将现有的Go + SQLite技术栈的导航工具箱项目迁移到Next.js + Supabase架构，实现在Vercel平台的无服务器部署。
迁移将保持前端React代码基本不变，重点改造后端API和数据库层，提升项目的可扩展性、性能和维护性。
目标是构建一个现代化的、云原生的导航工具平台，支持全球CDN加速和自动扩缩容。

## 2. 核心功能

### 2.1 用户角色

| 角色 | 注册方式 | 核心权限 |
|------|----------|----------|
| 普通用户 | 无需注册，默认访问 | 浏览导航工具、查看分类、使用搜索功能 |
| 管理员 | 用户名密码登录 | 管理工具、分类、设置、广告、SEO等全部功能 |

### 2.2 功能模块

我们的导航工具箱迁移需求包含以下主要页面：
1. **首页**: 工具展示、分类导航、搜索功能、响应式布局
2. **管理后台**: 工具管理、分类管理、系统设置、用户管理
3. **API接口**: RESTful API、认证中间件、数据CRUD操作

### 2.3 页面详情

| 页面名称 | 模块名称 | 功能描述 |
|----------|----------|----------|
| 首页 | 工具展示区 | 展示所有导航工具，支持分类筛选和搜索，响应式卡片布局 |
| 首页 | 分类导航 | 显示工具分类，支持分类切换和隐藏分类管理 |
| 首页 | 搜索功能 | 实时搜索工具名称和描述，支持拼音匹配 |
| 管理后台 | 工具管理 | 添加、编辑、删除、排序工具，批量导入导出功能 |
| 管理后台 | 分类管理 | 创建、修改、删除分类，设置分类排序和可见性 |
| 管理后台 | 系统设置 | 网站标题、图标、备案信息等基础配置 |
| 管理后台 | 用户管理 | 管理员账户信息修改，密码更新 |
| 管理后台 | 广告设置 | Google AdSense、自定义广告代码配置 |
| 管理后台 | SEO设置 | 元标签、关键词、社交媒体标签配置 |
| API接口 | 认证接口 | JWT登录验证，API Token管理 |
| API接口 | 数据接口 | 工具、分类、设置的CRUD操作接口 |
| API接口 | 图片接口 | 工具图标获取和存储接口 |

## 3. 核心流程

### 普通用户流程
用户访问首页 → 浏览工具分类 → 搜索或筛选工具 → 点击工具链接跳转

### 管理员流程
管理员登录 → 进入管理后台 → 管理工具和分类 → 配置系统设置 → 退出登录

### 迁移流程
数据库迁移 → API重构 → 前端适配 → 部署配置 → 测试验证

```mermaid
graph TD
    A[首页] --> B[工具详情]
    A --> C[管理登录]
    C --> D[管理后台]
    D --> E[工具管理]
    D --> F[分类管理]
    D --> G[系统设置]
    D --> H[广告设置]
    D --> I[SEO设置]
    E --> A
    F --> A
    G --> A
```

## 4. 用户界面设计

### 4.1 设计风格

- **主色调**: 蓝色系 (#1890ff) 和中性灰色 (#f5f5f5)
- **按钮样式**: 圆角按钮，悬停效果，Ant Design风格
- **字体**: 系统默认字体栈，14px基础字号
- **布局风格**: 卡片式布局，顶部导航，响应式网格
- **图标风格**: Ant Design Icons，简洁线性图标

### 4.2 页面设计概览

| 页面名称 | 模块名称 | UI元素 |
|----------|----------|--------|
| 首页 | 工具展示区 | 网格布局，卡片组件，悬停效果，工具图标和描述 |
| 首页 | 分类导航 | 水平标签页，激活状态高亮，响应式折叠 |
| 首页 | 搜索功能 | 顶部搜索框，实时下拉建议，清空按钮 |
| 管理后台 | 工具管理 | 表格列表，操作按钮，模态框表单，拖拽排序 |
| 管理后台 | 分类管理 | 简洁列表，内联编辑，开关组件 |
| 管理后台 | 系统设置 | 表单布局，文件上传，预览功能 |

### 4.3 响应式设计

项目采用移动优先的响应式设计，支持桌面端、平板和手机端访问，使用TailwindCSS断点系统实现自适应布局。

## 5. 技术迁移规范

### 5.1 数据库迁移

**Supabase配置信息**:
- Project URL: `https://fmkekjlsfnvubnvurhbt.supabase.co`
- API Key (anon): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZta2VramxzZm52dWJudnVyaGJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjc1NDQsImV4cCI6MjA2ODg0MzU0NH0.WzFGwqoDKG0Sjw1uj5U9rR8dc2qjTja8IRhlynofidA`
- API Key (service_role): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZta2VramxzZm52dWJudnVyaGJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzI2NzU0NCwiZXhwIjoyMDY4ODQzNTQ0fQ.fcRzWgH972dC5r65kSKQbTBWlvE-L3Osk2UQgvsjYn0`

**数据表结构**:
- `nav_user` → `users`: 用户信息表
- `nav_setting` → `settings`: 系统设置表
- `nav_table` → `tools`: 导航工具表
- `nav_catelog` → `categories`: 分类表
- `nav_api_token` → `api_tokens`: API令牌表
- `nav_img` → `images`: 图片存储表
- `nav_ads_settings` → `ads_settings`: 广告设置表
- `nav_seo_settings` → `seo_settings`: SEO设置表

### 5.2 API重构

**Next.js API Routes结构**:
- `/api/auth/login` - 用户登录
- `/api/auth/logout` - 用户登出
- `/api/tools` - 工具CRUD操作
- `/api/categories` - 分类CRUD操作
- `/api/settings` - 系统设置
- `/api/admin/*` - 管理员专用接口

### 5.3 认证系统

使用Next.js内置的认证机制结合Supabase Auth，保持JWT令牌兼容性，确保前端无需大幅修改。

### 5.4 部署配置

**Vercel环境变量**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

**构建配置**:
- 前端构建输出到 `out` 目录
- API Routes自动部署为Serverless Functions
- 静态资源CDN优化