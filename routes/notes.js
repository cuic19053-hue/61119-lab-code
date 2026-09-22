const express = require('express');
const { pool } = require('../db/connection');

const router = express.Router();

// GET /api/notes - 获取所有笔记（支持搜索）
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM notes';
    let params = [];

    if (search) {
      sql += ' WHERE title LIKE ? OR content LIKE ?';
      const keyword = `%${search}%`;
      params = [keyword, keyword];
    }

    sql += ' ORDER BY updated_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('获取笔记失败:', error);
    res.status(500).json({ success: false, message: '获取笔记失败' });
  }
});

// GET /api/notes/:id - 获取单条笔记
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notes WHERE id = ?', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '笔记不存在' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('获取笔记失败:', error);
    res.status(500).json({ success: false, message: '获取笔记失败' });
  }
});

// POST /api/notes - 创建笔记
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: '标题不能为空' });
    }

    const [result] = await pool.query(
      'INSERT INTO notes (title, content) VALUES (?, ?)',
      [title.trim(), content || '']
    );

    const [rows] = await pool.query('SELECT * FROM notes WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('创建笔记失败:', error);
    res.status(500).json({ success: false, message: '创建笔记失败' });
  }
});

// PUT /api/notes/:id - 更新笔记
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: '标题不能为空' });
    }

    const [result] = await pool.query(
      'UPDATE notes SET title = ?, content = ? WHERE id = ?',
      [title.trim(), content || '', req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '笔记不存在' });
    }

    const [rows] = await pool.query('SELECT * FROM notes WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('更新笔记失败:', error);
    res.status(500).json({ success: false, message: '更新笔记失败' });
  }
});

// DELETE /api/notes/:id - 删除笔记
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM notes WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '笔记不存在' });
    }

    res.json({ success: true, message: '笔记已删除' });
  } catch (error) {
    console.error('删除笔记失败:', error);
    res.status(500).json({ success: false, message: '删除笔记失败' });
  }
});

module.exports = router;
