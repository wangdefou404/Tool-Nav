# 数据导入指南

## 概述

本指南将帮助您成功导入工具数据到导航网站。我们已经改进了导入功能，支持更多数据格式并提供更好的错误处理。

## 支持的数据格式

### 标准格式（推荐）

```json
[
  {
    "name": "Google",
    "url": "https://www.google.com",
    "logo": "https://www.google.com/favicon.ico",
    "catelog": "搜索引擎",
    "description": "全球最大的搜索引擎",
    "sort": 1,
    "hide": false
  },
  {
    "name": "GitHub",
    "url": "https://github.com",
    "logo": "https://github.com/favicon.ico",
    "catelog": "开发工具",
    "description": "代码托管平台",
    "sort": 2,
    "hide": false
  }
]
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | String | ✅ | 工具名称 |
| `url` | String | ✅ | 工具链接 |
| `logo` | String | ❌ | 工具图标URL |
| `catelog` | String | ❌ | 分类名称（不存在会自动创建） |
| `description` | String | ❌ | 工具描述 |
| `sort` | Number | ❌ | 排序序号（默认按导入顺序） |
| `hide` | Boolean | ❌ | 是否隐藏（默认false） |

### 兼容格式

我们的转换工具支持以下字段名的自动映射：

- **名称字段**: `name`, `title`, `label`, `siteName`, `site_name`
- **URL字段**: `url`, `link`, `href`, `website`, `site`
- **图标字段**: `logo`, `icon`, `favicon`, `image`, `img`
- **分类字段**: `catelog`, `category`, `type`, `group`, `tag`
- **描述字段**: `description`, `desc`, `summary`, `intro`, `about`

## 使用步骤

### 1. 验证数据格式

首先验证您的JSON文件格式是否正确：

```bash
cd /Users/defou/GitHub/daohang/next-app/scripts
node test-import.js validate /Users/defou/Desktop/WangDefou/tools-0622.json
```

### 2. 转换数据格式（如需要）

如果您的数据格式不是标准格式，可以使用转换工具：

```bash
node convert-data.js /Users/defou/Desktop/WangDefou/tools-0622.json
```

这将生成一个 `tools-0622-converted.json` 文件。

### 3. 复制文件到项目目录

由于安全限制，需要将JSON文件复制到项目目录：

```bash
cp /Users/defou/Desktop/WangDefou/tools-0622.json /Users/defou/GitHub/daohang/next-app/scripts/
```

### 4. 通过管理后台导入

1. 访问 http://localhost:3001/admin
2. 使用账号 `admin` 密码 `admin123` 登录
3. 在工具管理页面找到"导入工具"功能
4. 选择您的JSON文件进行导入

### 5. 或者通过API导入

```bash
# 获取认证token（需要先登录）
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"name":"admin","password":"admin123"}'

# 使用token导入数据
curl -X POST http://localhost:3000/api/admin/importTools \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN_HERE" \
  -d @tools-0622.json
```

## 常见问题

### Q: 导入失败，提示"工具数据格式错误"

**A**: 确保您的JSON文件是数组格式，即使只有一个工具也要用数组包装：
```json
[{"name": "工具名", "url": "https://example.com"}]
```

### Q: 导入失败，提示"缺少必填字段"

**A**: 检查每个工具是否都有 `name` 和 `url` 字段。使用验证工具检查：
```bash
node test-import.js validate your-file.json
```

### Q: 分类不存在怎么办？

**A**: 不用担心！导入时会自动创建不存在的分类。如果没有指定分类，会归入"默认分类"。

### Q: 如何处理重复数据？

**A**: 目前导入会添加新数据，不会检查重复。建议导入前清理数据或在导入后手动删除重复项。

### Q: 导入的工具没有图标怎么办？

**A**: 可以在导入后通过管理后台逐个编辑添加图标，或者在JSON文件中提供图标URL。

## 数据格式转换示例

### 嵌套分类格式转换

如果您的数据是这种格式：
```json
[
  {
    "category": "搜索引擎",
    "sites": [
      {"name": "Google", "url": "https://google.com"},
      {"name": "百度", "url": "https://baidu.com"}
    ]
  }
]
```

转换工具会自动将其转换为标准格式。

### 字段名映射

如果您的数据字段名不同：
```json
[
  {
    "title": "Google",
    "link": "https://google.com",
    "icon": "https://google.com/favicon.ico",
    "category": "搜索"
  }
]
```

转换工具会自动映射为标准字段名。

## 技术支持

如果遇到问题，请检查：

1. JSON文件格式是否正确
2. 必填字段是否完整
3. 服务器是否正常运行
4. 认证token是否有效

可以查看浏览器控制台或服务器日志获取详细错误信息。