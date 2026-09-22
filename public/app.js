// ===== API 工具函数 =====
const API_BASE = '/api/notes';

async function api(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || '请求失败');
    return data;
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
}

// ===== 状态 =====
let currentEditId = null;  // 当前编辑的笔记 ID（null 表示新建）
let deleteTargetId = null;  // 待删除的笔记 ID
let searchTimer = null;     // 搜索防抖定时器

// ===== DOM 元素 =====
const notesGrid = document.getElementById('notesGrid');
const notesCount = document.getElementById('notesCount');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const newNoteBtn = document.getElementById('newNoteBtn');

// 编辑弹窗
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const modalClose = document.getElementById('modalClose');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');

// 删除弹窗
const deleteOverlay = document.getElementById('deleteOverlay');
const deleteClose = document.getElementById('deleteClose');
const deleteCancelBtn = document.getElementById('deleteCancelBtn');
const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

// ===== 加载笔记列表 =====
async function loadNotes(search = '') {
  try {
    const url = search ? `${API_BASE}?search=${encodeURIComponent(search)}` : API_BASE;
    const { data } = await api(url);
    renderNotes(data);
  } catch {
    // 错误已在 api() 中处理
  }
}

// ===== 渲染笔记列表 =====
function renderNotes(notes) {
  if (notes.length === 0) {
    notesGrid.innerHTML = '';
    emptyState.style.display = 'block';
    notesCount.textContent = searchInput.value
      ? `没有找到匹配的笔记`
      : '';
    return;
  }

  emptyState.style.display = 'none';
  notesCount.textContent = `共 ${notes.length} 条笔记`;

  notesGrid.innerHTML = notes.map(note => `
    <div class="note-card" data-id="${note.id}" onclick="openEditModal(${note.id})">
      <div class="note-card-title">${escapeHtml(note.title)}</div>
      <div class="note-card-content">${escapeHtml(note.content || '')}</div>
      <div class="note-card-footer">
        <span>${formatDate(note.updated_at)}</span>
        <button class="note-card-delete" onclick="event.stopPropagation(); confirmDelete(${note.id})"
          title="删除">🗑️ 删除</button>
      </div>
    </div>
  `).join('');
}

// ===== 打开编辑弹窗 =====
async function openEditModal(id = null) {
  currentEditId = id;

  if (id) {
    // 编辑已有笔记
    try {
      const { data } = await api(`${API_BASE}/${id}`);
      modalTitle.textContent = '编辑笔记';
      noteTitle.value = data.title;
      noteContent.value = data.content || '';
    } catch {
      return;
    }
  } else {
    // 新建笔记
    modalTitle.textContent = '新建笔记';
    noteTitle.value = '';
    noteContent.value = '';
  }

  modalOverlay.classList.add('active');
  noteTitle.focus();
}

// ===== 关闭编辑弹窗 =====
function closeEditModal() {
  modalOverlay.classList.remove('active');
  currentEditId = null;
}

// ===== 保存笔记 =====
async function saveNote() {
  const title = noteTitle.value.trim();
  const content = noteContent.value;

  if (!title) {
    showToast('请输入笔记标题', 'error');
    noteTitle.focus();
    return;
  }

  try {
    if (currentEditId) {
      await api(`${API_BASE}/${currentEditId}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content }),
      });
      showToast('笔记已更新 ✓');
    } else {
      await api(API_BASE, {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      });
      showToast('笔记已创建 ✓');
    }

    closeEditModal();
    loadNotes(searchInput.value);
  } catch {
    // 错误已在 api() 中处理
  }
}

// ===== 删除确认 =====
function confirmDelete(id) {
  deleteTargetId = id;
  deleteOverlay.classList.add('active');
}

function closeDeleteModal() {
  deleteOverlay.classList.remove('active');
  deleteTargetId = null;
}

async function deleteNote() {
  if (!deleteTargetId) return;

  try {
    await api(`${API_BASE}/${deleteTargetId}`, { method: 'DELETE' });
    showToast('笔记已删除 ✓');
    closeDeleteModal();
    loadNotes(searchInput.value);
  } catch {
    // 错误已在 api() 中处理
  }
}

// ===== 搜索（防抖） =====
function handleSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    loadNotes(searchInput.value.trim());
  }, 300);
}

// ===== 工具函数 =====
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 7) return `${diffDay} 天前`;

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function showToast(message, type = 'success') {
  // 移除已有 toast
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// ===== 事件绑定 =====
newNoteBtn.addEventListener('click', () => openEditModal());
modalClose.addEventListener('click', closeEditModal);
cancelBtn.addEventListener('click', closeEditModal);
saveBtn.addEventListener('click', saveNote);
deleteClose.addEventListener('click', closeDeleteModal);
deleteCancelBtn.addEventListener('click', closeDeleteModal);
deleteConfirmBtn.addEventListener('click', deleteNote);
searchInput.addEventListener('input', handleSearch);

// 点击遮罩关闭弹窗
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeEditModal();
});
deleteOverlay.addEventListener('click', (e) => {
  if (e.target === deleteOverlay) closeDeleteModal();
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
  // Escape 关闭弹窗
  if (e.key === 'Escape') {
    if (deleteOverlay.classList.contains('active')) {
      closeDeleteModal();
    } else if (modalOverlay.classList.contains('active')) {
      closeEditModal();
    }
  }
  // Ctrl/Cmd + Enter 保存笔记
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (modalOverlay.classList.contains('active')) {
      saveNote();
    }
  }
});

// ===== 初始化 =====
loadNotes();
