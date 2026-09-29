/**
 * ThinkFaster Admin Dashboard Controller
 * Requirement #37
 */
import { getProjects, getCategories, getTrackingStats } from '../../js/api.js';
import { formatCurrency, formatDate, escapeHTML } from '../../js/utils.js';

export async function initAdminDashboard() {
  const projects = await getProjects({ includeNonPublished: true });
  const categories = await getCategories({ activeOnly: false });
  const stats = getTrackingStats();

  // Metrics computation
  const total = projects.length;
  const published = projects.filter(p => p.status === 'published').length;
  const draft = projects.filter(p => p.status === 'draft').length;
  const comingSoon = projects.filter(p => p.status === 'coming_soon').length;
  const archived = projects.filter(p => p.status === 'archived' || p.status === 'hidden').length;

  // Update Counters
  document.getElementById('stat-total-projects').textContent = total;
  document.getElementById('stat-published').textContent = published;
  document.getElementById('stat-draft').textContent = draft;
  document.getElementById('stat-coming-soon').textContent = comingSoon;
  document.getElementById('stat-archived').textContent = archived;
  document.getElementById('stat-categories').textContent = categories.length;

  // Engagement tracking stats (Combined project views + tracked sessions)
  const totalBaseViews = projects.reduce((sum, p) => sum + (Number(p.views) || 0), 0);
  const totalViews = totalBaseViews + (stats.views || 0);
  document.getElementById('stat-views').textContent = totalViews.toLocaleString('th-TH');
  document.getElementById('stat-demo-clicks').textContent = (stats.demo_clicks || 0).toLocaleString('th-TH');
  document.getElementById('stat-copy-clicks').textContent = (stats.copy_clicks || 0).toLocaleString('th-TH');
  document.getElementById('stat-contact-clicks').textContent = (stats.contact_clicks || (stats.line_clicks + stats.messenger_clicks + stats.phone_clicks) || 0).toLocaleString('th-TH');

  // Render Per-Project Performance Ranking
  renderProjectPerformance(projects, stats);

  // Recent Projects Table
  const tableBody = document.getElementById('recent-projects-tbody');
  if (tableBody) {
    const recent = [...projects]
      .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))
      .slice(0, 5);

    if (recent.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400 text-sm">ยังไม่มีรายการระบบ</td></tr>`;
      return;
    }

    tableBody.innerHTML = recent.map(p => {
      let statusBadge = '<span class="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">Published</span>';
      if (p.status === 'draft') statusBadge = '<span class="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">Draft</span>';
      if (p.status === 'coming_soon') statusBadge = '<span class="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">Coming Soon</span>';
      if (p.status === 'archived') statusBadge = '<span class="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600">Archived</span>';

      const price = p.sale_price || p.regular_price;

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
          <td class="py-3 px-4 font-mono text-xs font-bold text-slate-700">#${escapeHTML(p.code)}</td>
          <td class="py-3 px-4">
            <div class="flex items-center gap-3">
              <img src="${escapeHTML(p.cover_image || '')}" alt="" class="w-10 h-7 object-cover rounded-md bg-slate-100 shrink-0" onerror="this.src='https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=100&q=80'" />
              <div>
                <a href="project-form.html?id=${p.id}" class="text-sm font-bold text-slate-800 hover:text-blue-600 truncate block max-w-xs">
                  ${escapeHTML(p.name)}
                </a>
                <span class="text-xs text-slate-400">${escapeHTML(p.category || '')}</span>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 text-xs font-semibold text-slate-900">${formatCurrency(price, p.currency)}</td>
          <td class="py-3 px-4">${statusBadge}</td>
          <td class="py-3 px-4 text-xs text-slate-500">${formatDate(p.updated_at || p.created_at)}</td>
          <td class="py-3 px-4 text-right">
            <a href="project-form.html?id=${p.id}" class="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg">
              แก้ไข
            </a>
          </td>
        </tr>
      `;
    }).join('');
  }
}

/**
 * Render Per-Project Performance Ranking & Intent Breakdown Table
 */
function renderProjectPerformance(projects, stats) {
  const tbody = document.getElementById('project-performance-tbody');
  if (!tbody) return;

  let currentSortBy = 'views';

  function getPreparedList() {
    return projects.map(p => {
      const pStat = stats.projects?.[p.code] || stats.projects?.[p.id] || stats.projects?.[p.slug] || { views: 0, demo: 0, copy: 0, contacts: 0 };
      const views = (Number(p.views) || 0) + (Number(pStat.views) || 0);
      const demo = Number(pStat.demo) || 0;
      const copy = Number(pStat.copy) || 0;
      const contacts = Number(pStat.contacts) || 0;
      const totalEngagement = views + (demo * 2) + (copy * 3) + (contacts * 5);

      return {
        ...p,
        views,
        demo,
        copy,
        contacts,
        totalEngagement
      };
    });
  }

  function renderTable(sortBy = 'views') {
    const list = getPreparedList();

    // Sort descending by selected metric
    list.sort((a, b) => {
      if (sortBy === 'views') return b.views - a.views || b.totalEngagement - a.totalEngagement;
      if (sortBy === 'demo') return b.demo - a.demo || b.views - a.views;
      if (sortBy === 'copy') return b.copy - a.copy || b.views - a.views;
      if (sortBy === 'contacts') return b.contacts - a.contacts || b.copy - a.copy;
      return b.totalEngagement - a.totalEngagement;
    });

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-400 text-sm">ยังไม่มีข้อมูลโปรเจกต์</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map((p, index) => {
      const isTop1 = index === 0 && (p[sortBy] > 0 || p.totalEngagement > 0);

      // Rank Badge
      let rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold font-mono">${index + 1}</span>`;
      if (isTop1) {
        rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black shadow-xs">🥇</span>`;
      } else if (index === 1 && (p[sortBy] > 0 || p.totalEngagement > 0)) {
        rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-800 text-xs font-bold">🥈</span>`;
      } else if (index === 2 && (p[sortBy] > 0 || p.totalEngagement > 0)) {
        rankBadge = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-900 text-xs font-bold">🥉</span>`;
      }

      // Intent Level Badge
      let intentBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-400">⚪ ยังไม่มีสถิติ</span>`;
      if (p.contacts > 0) {
        intentBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">🔥 สนใจสูง (มีติดต่อ)</span>`;
      } else if (p.copy > 0) {
        intentBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">📋 สนใจซื้อ (กด Copy)</span>`;
      } else if (p.demo > 0) {
        intentBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">💻 สนใจดู Demo</span>`;
      } else if (p.views > 0) {
        intentBadge = `<span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">👀 มีคนเข้าชม</span>`;
      }

      // Column highlights
      const viewsClass = sortBy === 'views' ? 'bg-blue-50/40 font-bold text-blue-900' : 'text-slate-700';
      const demoClass = sortBy === 'demo' ? 'bg-blue-50/40 font-bold text-blue-900' : 'text-slate-700';
      const copyClass = sortBy === 'copy' ? 'bg-amber-50/40 font-bold text-amber-900' : 'text-slate-700';
      const contactsClass = sortBy === 'contacts' ? 'bg-emerald-50/40 font-bold text-emerald-900' : 'text-slate-700';

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition-colors ${isTop1 ? 'bg-amber-50/20' : ''}">
          <td class="py-3.5 px-4">
            <div class="flex items-center gap-2">
              ${rankBadge}
              <span class="font-mono text-xs font-bold text-slate-500">#${escapeHTML(p.code)}</span>
            </div>
          </td>
          <td class="py-3.5 px-4">
            <div class="flex items-center gap-3">
              <img src="${escapeHTML(p.cover_image || '')}" alt="" class="w-10 h-7 object-cover rounded-md bg-slate-100 shrink-0 border border-slate-200" onerror="this.src='https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=100&q=80'" />
              <div>
                <a href="../project.html?slug=${encodeURIComponent(p.slug)}" target="_blank" class="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors block max-w-xs truncate" title="${escapeHTML(p.name)}">
                  ${escapeHTML(p.name)}
                </a>
                <span class="text-xs text-slate-400">${escapeHTML(p.category || 'General')}</span>
              </div>
            </div>
          </td>
          <td class="py-3.5 px-4 text-center ${viewsClass}">
            <span class="inline-flex items-center gap-1 text-sm ${p.views > 0 ? 'font-black text-slate-900' : 'text-slate-400'}">
              ${p.views}
            </span>
          </td>
          <td class="py-3.5 px-4 text-center ${demoClass}">
            <span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg text-xs ${p.demo > 0 ? 'font-black bg-blue-100 text-blue-800' : 'text-slate-400 bg-slate-50'}">
              ${p.demo}
            </span>
          </td>
          <td class="py-3.5 px-4 text-center ${copyClass}">
            <span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg text-xs ${p.copy > 0 ? 'font-black bg-amber-100 text-amber-800' : 'text-slate-400 bg-slate-50'}">
              ${p.copy}
            </span>
          </td>
          <td class="py-3.5 px-4 text-center ${contactsClass}">
            <span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg text-xs ${p.contacts > 0 ? 'font-black bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300' : 'text-slate-400 bg-slate-50'}">
              ${p.contacts}
            </span>
          </td>
          <td class="py-3.5 px-4 text-center">
            ${intentBadge}
          </td>
          <td class="py-3.5 px-4 text-right">
            <div class="flex items-center justify-end gap-1.5">
              <a href="../project.html?slug=${encodeURIComponent(p.slug)}" target="_blank" class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="ดูหน้าเว็บจริง">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
              <a href="project-form.html?id=${p.id}" class="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg">
                แก้ไข
              </a>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Setup tab buttons
  const tabButtons = document.querySelectorAll('[data-sort-perf]');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('bg-white', 'text-blue-600', 'shadow-xs');
        b.classList.add('hover:text-slate-900');
      });
      btn.classList.add('bg-white', 'text-blue-600', 'shadow-xs');
      btn.classList.remove('hover:text-slate-900');
      currentSortBy = btn.getAttribute('data-sort-perf');
      renderTable(currentSortBy);
    });
  });

  renderTable('views');
}

