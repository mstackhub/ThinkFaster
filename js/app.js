/**
 * ThinkFaster Home Page Application Logic
 */
import { getProjects, getCategories, getSettings } from './api.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { createProjectCardHTML } from './components/project-card.js';
import { renderFloatingContact } from './components/floating-contact.js';
import { renderCookieBanner } from './components/cookie-banner.js';
import { trackEvent, initTracking } from './tracking.js';
import { escapeHTML } from './utils.js';

// State
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'recommended';
let currentType = 'all';
let currentPriceRange = '';
let allCategories = [];

async function initHomePage() {
  renderHeader('home');
  renderCookieBanner();

  const settings = await getSettings();
  renderFooter(settings);
  renderFloatingContact(settings);
  initTracking(settings.tracking);

  // Apply Hero Settings if customized
  if (settings.hero) {
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const heroBadge = document.getElementById('hero-badge');
    if (heroTitle && settings.hero.title) {
      const parts = settings.hero.title.split('\n');
      if (parts.length >= 2) {
        const line1 = escapeHTML(parts[0].trim());
        const line2 = escapeHTML(parts.slice(1).join(' ').trim());
        heroTitle.innerHTML = `
          <span class="block whitespace-normal sm:whitespace-nowrap">${line1}</span>
          <span class="inline-block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 pb-2 sm:pb-3">${line2}</span>
        `;
      } else {
        heroTitle.innerHTML = `<span class="block whitespace-normal sm:whitespace-nowrap">${escapeHTML(settings.hero.title)}</span>`;
      }
    }
    if (heroSubtitle && settings.hero.subtitle) heroSubtitle.innerText = settings.hero.subtitle;
    if (heroBadge && settings.hero.badge_text) heroBadge.innerText = settings.hero.badge_text;
  }

  // Load Categories & Projects
  await loadCategoryFilters();
  await loadFeaturedProjects();
  await loadProjectsGrid();

  setupSearchAndFilters();
  setupStepsSlider();
}

function setupStepsSlider() {
  const slider = document.getElementById('steps-slider');
  const prevBtn = document.getElementById('step-prev-btn');
  const nextBtn = document.getElementById('step-next-btn');
  const dots = document.querySelectorAll('.step-dot');

  if (!slider) return;

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      slider.scrollBy({ left: -280, behavior: 'smooth' });
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      slider.scrollBy({ left: 280, behavior: 'smooth' });
    });
  }

  if (dots.length > 0) {
    slider.addEventListener('scroll', () => {
      const scrollLeft = slider.scrollLeft;
      const cardWidth = slider.scrollWidth / 5;
      const activeIdx = Math.min(Math.max(Math.round(scrollLeft / cardWidth), 0), 4);

      dots.forEach((dot, idx) => {
        if (idx === activeIdx) {
          dot.className = 'step-dot w-6 h-2 rounded-full bg-blue-600 transition-all duration-300';
        } else {
          dot.className = 'step-dot w-2 h-2 rounded-full bg-slate-200 transition-all duration-300';
        }
      });
    }, { passive: true });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomePage);
} else {
  initHomePage();
}

/**
 * Load Category Pill Filters (Horizontal Scroll on Mobile)
 */
async function loadCategoryFilters() {
  const container = document.getElementById('category-filter-list');
  if (!container) return;

  allCategories = await getCategories({ activeOnly: true });

  let html = `
    <button
      type="button"
      data-category="all"
      class="cat-filter-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap bg-blue-600 text-white shadow-sm"
    >
      ทั้งหมด (All)
    </button>
  `;

  allCategories.forEach(cat => {
    html += `
      <button
        type="button"
        data-category="${escapeHTML(cat.name)}"
        class="cat-filter-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
      >
        ${escapeHTML(cat.name)}
      </button>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.cat-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cat = btn.getAttribute('data-category');
      selectCategory(cat);
    });
  });
}

function selectCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.cat-filter-btn').forEach(b => {
    const isSelected = b.getAttribute('data-category') === cat;
    if (isSelected) {
      b.className = 'cat-filter-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap bg-blue-600 text-white shadow-sm';
    } else {
      b.className = 'cat-filter-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80';
    }
  });

  trackEvent('filter_project', { category: cat });
  loadProjectsGrid();
}

/**
 * Load Featured Projects Section
 */
async function loadFeaturedProjects() {
  const container = document.getElementById('featured-projects-grid');
  if (!container) return;

  const featured = await getProjects({ featuredOnly: true, limit: 3 });
  if (featured.length === 0) {
    document.getElementById('featured-section')?.classList.add('hidden');
    return;
  }

  container.innerHTML = featured.map(p => createProjectCardHTML(p)).join('');
  bindCardInteractions(container);
}

/**
 * Load Main Projects Grid with Skeleton, Empty State and Filtering
 */
async function loadProjectsGrid() {
  const container = document.getElementById('projects-grid');
  const emptyState = document.getElementById('projects-empty-state');
  const resultCount = document.getElementById('projects-result-count');
  if (!container) return;

  // Show Skeleton Loading
  container.innerHTML = renderSkeletonCards(6);
  if (emptyState) emptyState.classList.add('hidden');

  const projects = await getProjects({
    category: currentCategory === 'all' ? null : currentCategory,
    search: currentSearch,
    type: currentType === 'all' ? null : currentType,
    priceRange: currentPriceRange || null,
    sort: currentSort
  });

  if (resultCount) {
    resultCount.textContent = `พบ ${projects.length} ระบบ`;
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
          <h3 class="text-lg font-bold text-slate-800 mb-1">ไม่พบระบบที่ตรงกับคำค้นหา</h3>
          <p class="text-sm text-slate-500 max-w-md mx-auto mb-6">
            ลองเปลี่ยนคำค้นหา หรือกดรีเซ็ตตัวกรองเพื่อดูรายการระบบทั้งหมดที่มีอยู่ในขณะนี้
          </p>
          <button
            id="btn-reset-filters"
            type="button"
            class="inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        `;
        const resetBtn = document.getElementById('btn-reset-filters');
        if (resetBtn) {
          resetBtn.onclick = () => {
            resetAllFilters();
          };
        }
      }
    }
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  container.innerHTML = projects.map(p => createProjectCardHTML(p)).join('');
  bindCardInteractions(container);
}

function resetAllFilters() {
  currentCategory = 'all';
  currentSearch = '';
  currentType = 'all';
  currentPriceRange = '';
  currentSort = 'recommended';

  const searchInput = document.getElementById('project-search-input');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('project-sort-select');
  if (sortSelect) sortSelect.value = 'recommended';

  const typeFilter = document.getElementById('project-type-select');
  if (typeFilter) typeFilter.value = 'all';

  const priceFilter = document.getElementById('project-price-select');
  if (priceFilter) priceFilter.value = '';

  selectCategory('all');
}

/**
 * Bind Click Tracking to Project Cards
 */
function bindCardInteractions(container) {
  container.querySelectorAll('[data-demo-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');
      trackEvent('click_demo', {
        project_code: code,
        project_name: name,
        price: Number(price) || 0,
        location: 'home_card'
      });
    });
  });

  container.querySelectorAll('.project-card h3 a').forEach(link => {
    link.addEventListener('click', () => {
      trackEvent('click_project_card', {
        project_name: link.textContent.trim(),
        location: 'home_grid'
      });
    });
  });
}

/**
 * Setup Search Inputs, Sort Select, and Filters
 */
function setupSearchAndFilters() {
  const searchInput = document.getElementById('project-search-input');
  const sortSelect = document.getElementById('project-sort-select');
  const typeSelect = document.getElementById('project-type-select');
  const priceSelect = document.getElementById('project-price-select');

  let debounceTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearch = e.target.value;
        if (currentSearch.trim().length > 0) {
          trackEvent('search_project', { query: currentSearch });
        }
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
}

/**
 * Skeleton Loader Cards
 */
function renderSkeletonCards(count = 6) {
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
