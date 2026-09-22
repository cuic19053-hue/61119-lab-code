# 📝 个人记事本 (Notes App)

一个简洁的个人记事本全栈应用，支持笔记的创建、编辑、删除和搜索。

## 技术栈

- **前端**: HTML + CSS + JavaScript（原生，无框架）
- **后端**: Node.js + Express
- **数据库**: MySQL

## 快速开始

### 1. 安装 Node.js

```bash
# 使用 Homebrew 安装
brew install node

# 验证安装
node -v
npm -v
```

### 2. 安装 MySQL

```bash
# 使用 Homebrew 安装
brew install mysql

# 启动 MySQL 服务
brew services start mysql

# 设置 root 密码（首次安装）
mysql_secure_installation
```

### 3. 初始化数据库

```bash
# 使用 root 用户导入数据库脚本
mysql -u root -p < db/init.sql
```

### 4. 配置环境变量

编辑 `.env` 文件，修改数据库密码：

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=notes_db
```

### 5. 安装依赖并启动

```bash
# 安装依赖
npm install

# 启动开发模式（自动重启）
npm run dev

# 或者正式启动
npm start
```

访问 http://localhost:3000 即可使用 🎉

## 部署为持久服务

### 使用 PM2（推荐）

```bash
# 全局安装 PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name notes-app

# 设置开机自启
pm2 startup
pm2 save

# 其他常用命令
pm2 status          # 查看状态
pm2 logs notes-app  # 查看日志
pm2 restart notes-app  # 重启
pm2 stop notes-app     # 停止
```

## 局域网访问

服务器已绑定 `0.0.0.0`，局域网内其他设备可以直接访问。

### 查找服务器 IP

```bash
ifconfig | grep "inet "
# 找到类似 192.168.x.x 的地址
```

### 从其他设备访问

在手机或其他电脑的浏览器中打开：

```
http://192.168.x.x:3000
```

### macOS 防火墙设置

如果无法从其他设备访问，请检查防火墙设置：

1. 系统设置 → 网络 → 防火墙
2. 点击「选项...」
3. 确保 Node.js 被允许接收传入连接

## API 文档

| 方法   | 路径             | 说明                            |
|--------|------------------|---------------------------------|
| GET    | /api/notes       | 获取所有笔记 (支持 ?search=关键词) |
| GET    | /api/notes/:id   | 获取单条笔记                    |
| POST   | /api/notes       | 创建笔记                        |
| PUT    | /api/notes/:id   | 更新笔记                        |
| DELETE | /api/notes/:id   | 删除笔记                        |

### 示例

```bash
# 获取所有笔记
curl http://localhost:3000/api/notes

# 搜索笔记
curl http://localhost:3000/api/notes?search=关键词

# 创建笔记
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "测试笔记", "content": "这是一条测试笔记"}'

# 更新笔记
curl -X PUT http://localhost:3000/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "更新标题", "content": "更新内容"}'

# 删除笔记
curl -X DELETE http://localhost:3000/api/notes/1
```

## 项目结构

```
notes-app/
├── server.js           # Express 服务器入口
├── package.json         # 项目依赖
├── .env                 # 环境变量配置
├── db/
│   ├── connection.js    # MySQL 连接池
│   └── init.sql         # 数据库初始化脚本
├── routes/
│   └── notes.js         # 笔记 API 路由
├── public/              # 前端静态文件
│   ├── index.html       # 页面结构
│   ├── style.css        # 样式
│   ├── app.js           # 前端逻辑
│   └── map.js           # 定位小地图（高德地图）
└── README.md            # 本文件
```

## 定位小地图（高德地图）

页面右下角内置了一个可折叠的定位小地图，基于高德地图 JS API 2.0 实现：

- 自动获取浏览器当前位置，标记定位点并显示精度圈
- 逆地理编码显示当前地址文字
- 定位失败（如拒绝授权）时显示默认位置，可点击地图手动选点
- 支持展开 / 收起，不影响笔记编辑

**配置 key**：到 [高德开放平台](https://lbs.amap.com) 申请「Web端(JS API)」类型的 key，
替换 `public/index.html` 中 `webapi.amap.com/maps` 地址里 `key=` 后面的占位符即可。
建议在高德控制台为该 key 配置域名白名单（安全密钥 jscode 按高德官方指引同步配置）。
