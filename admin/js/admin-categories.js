/**
 * ThinkFaster Admin Categories Controller
 * Requirement #50
 */
import { getCategories, saveCategory, deleteCategory } from '../../js/api.js';
import { generateSlug, showToast, escapeHTML } from '../../js/utils.js';

let categoriesList = [];

export async function initAdminCategories() {
  await loadCategories();
  setupCategoryModal();
}

async function loadCategories() {
  const tbody = document.getElementById('categories-tbody');
  const countEl = document.getElementById('categories-count');
  if (!tbody) return;

  categoriesList = await getCategories({ activeOnly: false });
  if (countEl) countEl.textContent = `ทั้งหมด ${categoriesList.length} หมวดหมู่`;

  if (categoriesList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-400 text-sm">ยังไม่มีหมวดหมู่</td></tr>`;
    return;
  }

  tbody.innerHTML = categoriesList.map(cat => `
    <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
      <td class="py-3.5 px-4 font-mono text-xs font-semibold text-slate-500">${cat.sort_order || 0}</td>
      <td class="py-3.5 px-4 font-bold text-slate-900 text-sm">${escapeHTML(cat.name)}</td>
      <td class="py-3.5 px-4 font-mono text-xs text-slate-400">${escapeHTML(cat.slug)}</td>
      <td class="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">${escapeHTML(cat.description || '-')}</td>
      <td class="py-3.5 px-4">
        ${cat.is_active !== false ?
          '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Active</span>' :
          '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Disabled</span>'
        }
      </td>
      <td class="py-3.5 px-4 text-right">
        <div class="inline-flex items-center gap-1.5">
          <button
            type="button"
            data-edit-cat="${cat.id}"
            class="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="แก้ไข"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button
            type="button"
            data-delete-cat="${cat.id}"
            data-name="${escapeHTML(cat.name)}"
            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="ลบ"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Bind Edit
  tbody.querySelectorAll('[data-edit-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-edit-cat');
      const cat = categoriesList.find(c => c.id === id);
      if (cat) openCategoryModal(cat);
    });
  });

  // Bind Delete with safety validation check (Requirement #50)
  tbody.querySelectorAll('[data-delete-cat]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-delete-cat');
      const name = btn.getAttribute('data-name');
      if (confirm(`คุณต้องการลบหมวดหมู่ "${name}" หรือไม่?`)) {
        try {
          await deleteCategory(id);
          showToast(`ลบหมวดหมู่ "${name}" สำเร็จ`, 'success');
          await loadCategories();
        } catch (err) {
          showToast(err.message || 'ไม่สามารถลบหมวดหมู่ได้', 'error');
        }
      }
    });
  });
}

function setupCategoryModal() {
  const modal = document.getElementById('category-modal');
  const openBtn = document.getElementById('btn-open-add-cat');
  const closeBtn = document.getElementById('btn-close-cat-modal');
  const form = document.getElementById('category-form');

  if (openBtn) {
    openBtn.addEventListener('click', () => openCategoryModal(null));
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('modal-cat-id').value;
    const name = document.getElementById('modal-cat-name').value.trim();
    let slug = document.getElementById('modal-cat-slug').value.trim();
    if (!slug) slug = generateSlug(name);
    const description = document.getElementById('modal-cat-desc').value.trim();
    const sort_order = parseInt(document.getElementById('modal-cat-sort').value, 10) || 0;
    const is_active = document.getElementById('modal-cat-active').checked;

    try {
      await saveCategory({ id: id || undefined, name, slug, description, sort_order, is_active });
      showToast('บันทึกหมวดหมู่เรียบร้อย ✓', 'success');
      modal.classList.add('hidden');
      await loadCategories();
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการบันทึกหมวดหมู่', 'error');
    }
  });
}

function openCategoryModal(cat = null) {
  const modal = document.getElementById('category-modal');
  const title = document.getElementById('modal-cat-title');
  if (!modal) return;

  if (cat) {
    title.textContent = 'แก้ไขหมวดหมู่ (Edit Category)';
    document.getElementById('modal-cat-id').value = cat.id;
    document.getElementById('modal-cat-name').value = cat.name;
    document.getElementById('modal-cat-slug').value = cat.slug;
    document.getElementById('modal-cat-desc').value = cat.description || '';
    document.getElementById('modal-cat-sort').value = cat.sort_order || 0;
    document.getElementById('modal-cat-active').checked = cat.is_active !== false;
  } else {
    title.textContent = 'เพิ่มหมวดหมู่ใหม่ (Add Category)';
    document.getElementById('modal-cat-id').value = '';
    document.getElementById('modal-cat-name').value = '';
    document.getElementById('modal-cat-slug').value = '';
    document.getElementById('modal-cat-desc').value = '';
    document.getElementById('modal-cat-sort').value = categoriesList.length + 1;
    document.getElementById('modal-cat-active').checked = true;
  }

  modal.classList.remove('hidden');
}
