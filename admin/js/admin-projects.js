/**
 * ThinkFaster Admin Projects List Controller
 * Requirements #38, #75, #76, #96
 */
import { getProjects, getCategories, deleteProject, duplicateProject } from '../../js/api.js';
import { formatCurrency, formatDate, escapeHTML, showToast } from '../../js/utils.js';

let allProjects = [];
let allCategories = [];
let currentSearch = '';
let currentCategory = 'all';
let currentStatus = 'all';
let currentSort = 'order';

export async function initAdminProjects() {
  allCategories = await getCategories({ activeOnly: false });
  renderCategoryFilterOptions();

  await loadProjects();
  setupFilterEvents();
}

function renderCategoryFilterOptions() {
  const select = document.getElementById('filter-category');
  if (!select) return;
  select.innerHTML = `
    <option value="all">ทุกหมวดหมู่ (All Categories)</option>
    ${allCategories.map(c => `<option value="${escapeHTML(c.name)}">${escapeHTML(c.name)}</option>`).join('')}
  `;
}

async function loadProjects() {
  const tableBody = document.getElementById('admin-projects-tbody');
  const countEl = document.getElementById('admin-projects-count');
  if (!tableBody) return;

  allProjects = await getProjects({ includeNonPublished: true });

  let filtered = allProjects.filter(p => {
    // Category
    if (currentCategory !== 'all' && (p.category || '').toLowerCase() !== currentCategory.toLowerCase()) {
      return false;
    }
    // Status
    if (currentStatus !== 'all' && p.status !== currentStatus) {
      return false;
    }
    // Search
    if (currentSearch.trim() !== '') {
      const q = currentSearch.toLowerCase();
      const code = (p.code || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      if (!code.includes(q) && !name.includes(q) && !cat.includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (currentSort === 'order') return (a.sort_order || 99) - (b.sort_order || 99);
    if (currentSort === 'code') return (a.code || '').localeCompare(b.code || '');
    if (currentSort === 'newest') return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
    if (currentSort === 'price_desc') {
      const pA = a.sale_price || a.regular_price || 0;
      const pB = b.sale_price || b.regular_price || 0;
      return pB - pA;
    }
    return 0;
  });

  if (countEl) countEl.textContent = `พบ ${filtered.length} รายการ`;

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-slate-400 text-sm">ไม่พบโปรเจกต์ที่ตรงกับเงื่อนไข</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map(p => {
    let statusClass = 'bg-emerald-100 text-emerald-800';
    let statusLabel = 'Published';
    if (p.status === 'draft') {
      statusClass = 'bg-amber-100 text-amber-800';
      statusLabel = 'Draft';
    } else if (p.status === 'coming_soon') {
      statusClass = 'bg-blue-100 text-blue-800';
      statusLabel = 'Coming Soon';
    } else if (p.status === 'archived') {
      statusClass = 'bg-slate-100 text-slate-600';
      statusLabel = 'Archived';
    } else if (p.status === 'hidden') {
      statusClass = 'bg-rose-100 text-rose-700';
      statusLabel = 'Hidden';
    }

    const price = p.sale_price || p.regular_price;

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
        <td class="py-3.5 px-4 font-mono text-xs font-bold text-slate-800">
          #${escapeHTML(p.code || '000')}
        </td>
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-3">
            <img
              src="${escapeHTML(p.cover_image || '')}"
              alt=""
              class="w-12 h-8 object-cover rounded-lg bg-slate-100 shrink-0 border border-slate-200"
              onerror="this.src='https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=120&q=80'"
            />
            <div>
              <a href="project-form.html?id=${p.id}" class="text-sm font-bold text-slate-900 hover:text-blue-600 block line-clamp-1">
                ${escapeHTML(p.name)}
              </a>
              <span class="text-xs text-slate-400">${escapeHTML(p.slug || '')}</span>
            </div>
          </div>
        </td>
        <td class="py-3.5 px-4">
          <span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
            ${escapeHTML(p.category || 'General')}
          </span>
        </td>
        <td class="py-3.5 px-4">
          <div class="text-xs font-bold text-slate-900">${formatCurrency(price, p.currency)}</div>
          ${p.sale_price ? `<div class="text-[10px] text-slate-400 line-through">${formatCurrency(p.regular_price, p.currency)}</div>` : ''}
        </td>
        <td class="py-3.5 px-4">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold ${statusClass}">
            ${statusLabel}
          </span>
        </td>
        <td class="py-3.5 px-4 text-xs text-slate-500">
          ${formatDate(p.updated_at || p.created_at)}
        </td>
        <td class="py-3.5 px-4 text-right">
          <div class="inline-flex items-center gap-1.5">
            <!-- Edit -->
            <a
              href="project-form.html?id=${p.id}"
              class="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="แก้ไขข้อมูล"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </a>

            <!-- Duplicate -->
            <button
              type="button"
              data-duplicate-id="${p.id}"
              class="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="คัดลอก (Duplicate)"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
            </button>

            <!-- Preview -->
            <a
              href="../project.html?slug=${encodeURIComponent(p.slug)}"
              target="_blank"
              class="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="ดูหน้าจริง (Preview)"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </a>

            <!-- Delete / Archive -->
            <button
              type="button"
              data-delete-id="${p.id}"
              data-name="${escapeHTML(p.name)}"
              class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="ลบหรือเก็บเข้ากรุ"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind Duplicate
  tableBody.querySelectorAll('[data-duplicate-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-duplicate-id');
      try {
        const cloned = await duplicateProject(id);
        showToast(`คัดลอกโปรเจกต์เป็น #${cloned.code} สำเร็จ`, 'success');
        await loadProjects();
      } catch (err) {
        showToast('เกิดข้อผิดพลาดในการคัดลอก', 'error');
      }
    });
  });

  // Bind Delete (Requirement #75, #76)
  tableBody.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-delete-id');
      const name = btn.getAttribute('data-name');
      if (confirm(`ยืนยันการลบหรือเก็บเข้ากรุโปรเจกต์ "${name}" ใช่หรือไม่?`)) {
        try {
          await deleteProject(id, false); // soft delete / archive
          showToast(`ย้ายโปรเจกต์ไปยังสถานะ Archived เรียบร้อย`, 'success');
          await loadProjects();
        } catch (err) {
          showToast('ไม่สามารถลบโปรเจกต์ได้', 'error');
        }
      }
    });
  });
}

function setupFilterEvents() {
  const searchInput = document.getElementById('search-input');
  const catSelect = document.getElementById('filter-category');
  const statusSelect = document.getElementById('filter-status');
  const sortSelect = document.getElementById('sort-select');

  let debounce = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        currentSearch = e.target.value;
        loadProjects();
      }, 200);
    });
  }

  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      currentCategory = e.target.value;
      loadProjects();
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      currentStatus = e.target.value;
      loadProjects();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      loadProjects();
    });
  }
}
