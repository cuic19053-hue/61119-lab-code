const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./db/connection');
const notesRouter = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件 - 服务前端页面
app.use(express.static(path.join(__dirname, 'public')));

// API 路由
app.use('/api/notes', notesRouter);

// 所有其他路由返回前端页面（SPA 支持）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
async function start() {
  // 测试数据库连接
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('⚠️  无法连接数据库，请检查 .env 配置和 MySQL 服务是否运行');
    console.error('   提示: 运行 mysql -u root -p < db/init.sql 初始化数据库');
    process.exit(1);
  }

  // 绑定 0.0.0.0 允许局域网访问
  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🚀 记事本服务器已启动！');
    console.log(`   本地访问:   http://localhost:${PORT}`);
    console.log(`   局域网访问: http://<你的IP>:${PORT}`);
    console.log('');
    console.log('   提示: 运行 ifconfig | grep "inet " 查看你的局域网 IP');
    console.log('');
  });
}

start();
