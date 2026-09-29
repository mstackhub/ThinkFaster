/**
 * ThinkFaster Projects Catalog Page Logic
 */
import { getProjects, getCategories, getSettings } from './api.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { createProjectCardHTML } from './components/project-card.js';
import { renderFloatingContact } from './components/floating-contact.js';
import { renderCookieBanner } from './components/cookie-banner.js';
import { trackEvent, initTracking } from './tracking.js';
import { escapeHTML } from './utils.js';

let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'recommended';
let currentType = 'all';
let currentPriceRange = '';

async function initProjectsPage() {
  renderHeader('projects');
  renderCookieBanner();

  const settings = await getSettings();
  renderFooter(settings);
  renderFloatingContact(settings);
  initTracking(settings.tracking);

  // Parse URL search params
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('category')) {
    currentCategory = urlParams.get('category');
  }
  if (urlParams.has('search')) {
    currentSearch = urlParams.get('search');
    const searchInput = document.getElementById('project-search-input');
    if (searchInput) searchInput.value = currentSearch;
  }
  if (urlParams.has('type')) {
    currentType = urlParams.get('type');
    const typeSelect = document.getElementById('project-type-select');
    if (typeSelect) typeSelect.value = currentType;
  }

  await loadCategoryFilters();
  await loadProjectsGrid();
  setupFilterControls();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectsPage);
} else {
  initProjectsPage();
}

async function loadCategoryFilters() {
  const container = document.getElementById('category-filter-list');
  if (!container) return;

  const categories = await getCategories({ activeOnly: true });

  let html = `
    <button
      type="button"
      data-category="all"
      class="cat-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${currentCategory === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'}"
    >
      ทั้งหมด
    </button>
  `;

  categories.forEach(cat => {
    const isSelected = currentCategory.toLowerCase() === cat.name.toLowerCase() || currentCategory.toLowerCase() === cat.slug.toLowerCase();
    html += `
      <button
        type="button"
        data-category="${escapeHTML(cat.name)}"
        class="cat-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'}"
      >
        ${escapeHTML(cat.name)}
      </button>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      selectCategory(cat);
    });
  });
}

function selectCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(b => {
    const isSelected = b.getAttribute('data-category').toLowerCase() === cat.toLowerCase();
    if (isSelected) {
      b.className = 'cat-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap bg-blue-600 text-white shadow-sm';
    } else {
      b.className = 'cat-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80';
    }
  });

  trackEvent('filter_project', { category: cat });
  loadProjectsGrid();
}

async function loadProjectsGrid() {
  const container = document.getElementById('projects-grid');
  const emptyState = document.getElementById('projects-empty-state');
  const countEl = document.getElementById('projects-count');
  if (!container) return;

  container.innerHTML = renderSkeleton(6);
  if (emptyState) emptyState.classList.add('hidden');

  const projects = await getProjects({
    category: currentCategory === 'all' ? null : currentCategory,
    search: currentSearch,
    type: currentType === 'all' ? null : currentType,
    priceRange: currentPriceRange || null,
    sort: currentSort
  });

  if (countEl) {
    countEl.textContent = `แสดงทั้งหมด ${projects.length} ระบบ`;
  }

  if (projects.length === 0) {
    container.innerHTML = '';
    if (emptyState) {
      emptyState.classList.remove('hidden');
      const isFiltered = currentCategory !== 'all' || !!currentSearch || currentType !== 'all' || !!currentPriceRange;
      if (!isFiltered) {
        emptyState.innerHTML = `
          <div class="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 text-2xl">
            🚀
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-1">กำลังเตรียมเปิดตัวผลงานเร็ว ๆ นี้</h3>
          <p class="text-sm text-slate-500 max-w-md mx-auto mb-6">
            ทีมงานกำลังทยอยลงผลงานระบบเว็บไซต์และเว็บแอปพลิเคชันพร้อมใช้งาน สามารถติดต่อสอบถามหรือสั่งทำระบบเฉพาะทางได้ทันที
          </p>
          <a
            href="contact.html"
            class="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
          >
            ติดต่อสอบถาม / สั่งทำระบบ
          </a>
        `;
      } else {
        emptyState.innerHTML = `
          <div class="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 text-2xl">
            🔍
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-1">ไม่พบระบบที่ตรงกับตัวกรอง</h3>
          <p class="text-sm text-slate-500 max-w-md mx-auto mb-6">
            ลองค้นหาด้วยคำอื่น หรือกดล้างตัวกรองทั้งหมด
          </p>
          <button
            id="btn-reset-filters-page"
            type="button"
            class="inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        `;
        const resetBtn = document.getElementById('btn-reset-filters-page');
        if (resetBtn) {
          resetBtn.onclick = () => {
            currentCategory = 'all';
            currentSearch = '';
            currentType = 'all';
            currentPriceRange = '';
            currentSort = 'recommended';
            document.getElementById('project-search-input').value = '';
            document.getElementById('project-sort-select').value = 'recommended';
            document.getElementById('project-type-select').value = 'all';
            document.getElementById('project-price-select').value = '';
            loadProjectsGrid();
          };
        }
      }
    }
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  container.innerHTML = projects.map(p => createProjectCardHTML(p)).join('');

  // Tracking
  container.querySelectorAll('[data-demo-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      trackEvent('click_demo', {
        project_code: btn.getAttribute('data-code'),
        project_name: btn.getAttribute('data-name'),
        price: Number(btn.getAttribute('data-price')) || 0,
        location: 'catalog_card'
      });
    });
  });

  container.querySelectorAll('.project-card h3 a').forEach(link => {
    link.addEventListener('click', () => {
      trackEvent('click_project_card', {
        project_name: link.textContent.trim(),
        location: 'catalog_grid'
      });
    });
  });
}

function setupFilterControls() {
  const searchInput = document.getElementById('project-search-input');
  const sortSelect = document.getElementById('project-sort-select');
  const typeSelect = document.getElementById('project-type-select');
  const priceSelect = document.getElementById('project-price-select');
  const resetBtn = document.getElementById('btn-reset-filters');

  let debounce = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        currentSearch = e.target.value;
        trackEvent('search_project', { query: currentSearch });
        loadProjectsGrid();
      }, 250);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      trackEvent('sort_project', { sort: currentSort });
      loadProjectsGrid();
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      currentType = e.target.value;
      loadProjectsGrid();
    });
  }

  if (priceSelect) {
    priceSelect.addEventListener('change', (e) => {
      currentPriceRange = e.target.value;
      loadProjectsGrid();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentCategory = 'all';
      currentSearch = '';
      currentType = 'all';
      currentPriceRange = '';
      currentSort = 'recommended';
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = 'recommended';
      if (typeSelect) typeSelect.value = 'all';
      if (priceSelect) priceSelect.value = '';
      selectCategory('all');
    });
  }
}

function renderSkeleton(count = 6) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse flex flex-col h-[380px]">
        <div class="w-full aspect-video-box bg-slate-200 rounded-xl mb-4"></div>
        <div class="w-20 h-4 bg-slate-200 rounded-full mb-3"></div>
        <div class="w-3/4 h-5 bg-slate-200 rounded mb-2"></div>
        <div class="w-full h-3 bg-slate-200 rounded mb-1"></div>
        <div class="w-2/3 h-3 bg-slate-200 rounded mb-4"></div>
        <div class="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div class="w-24 h-6 bg-slate-200 rounded"></div>
          <div class="w-20 h-8 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    `;
  }
  return html;
}
