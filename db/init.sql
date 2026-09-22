-- 创建数据库
CREATE DATABASE IF NOT EXISTS notes_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE notes_db;

-- 创建笔记表
CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入示例数据
INSERT INTO notes (title, content) VALUES
  ('欢迎使用记事本 📝', '这是你的第一条笔记！\n\n你可以：\n- 点击右上角「新建笔记」创建新笔记\n- 点击笔记卡片查看和编辑\n- 使用搜索框快速查找笔记\n- 点击删除按钮移除不需要的笔记'),
  ('Markdown 小技巧', '虽然本应用不支持 Markdown 渲染，但你可以用简单的文本格式来组织笔记内容。\n\n比如用 - 来列举要点\n用 === 来分隔章节\n用 【】来标注重点');
