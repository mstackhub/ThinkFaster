/**
 * ThinkFaster Admin Shared Layout Component
 * Requirement #36: Responsive Sidebar Layout with Mobile Drawer
 */
import { requireAuth, setupAdminLogout, getAdminSession } from './admin-auth.js';

export async function initAdminLayout(activeTab = 'dashboard') {
  // Guard check
  const session = await requireAuth();
  if (!session) return;

  const sidebarContainer = document.getElementById('admin-sidebar-container');
  const topbarContainer = document.getElementById('admin-topbar-container');

  // Ensure body and wrapper lock scroll to content area only
  document.body.classList.add('h-screen', 'overflow-hidden');
  document.body.classList.remove('min-h-screen');

  const adminEmail = session.email || 'admin@thinkfaster.dev';

  if (sidebarContainer) {
    sidebarContainer.className = 'shrink-0';
    sidebarContainer.innerHTML = `
      <!-- Desktop Sidebar -->
      <aside class="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 h-screen sticky top-0 shrink-0 select-none">
        <!-- Brand -->
        <div class="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
          <a href="/admin" class="font-extrabold text-xl tracking-tight text-white">
            ThinkFaster
          </a>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto admin-scroll">
          <a
            href="/admin"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>แดชบอร์ดภาพรวม</span>
          </a>

          <a
            href="/admin/projects"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>รายการระบบ (Projects)</span>
          </a>

          <a
            href="/admin/project-form"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'project-form' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>เพิ่มระบบใหม่</span>
          </a>

          <a
            href="/admin/categories"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>หมวดหมู่ (Categories)</span>
          </a>

          <a
            href="/admin/settings"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>ตั้งค่าเว็บไซต์ & ติดต่อ</span>
          </a>

          <div class="pt-4 mt-4 border-t border-slate-800">
            <a
              href="/"
              target="_blank"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>เปิดดูหน้าเว็บจริง ↗</span>
            </a>
          </div>
        </nav>

        <!-- User Profile & Logout -->
        <div class="p-4 border-t border-slate-800 shrink-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5 truncate">
              <div class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0">
                A
              </div>
              <div class="truncate">
                <div class="text-xs font-semibold text-white truncate">${adminEmail}</div>
                <div class="text-[10px] text-slate-500">Super Administrator</div>
              </div>
            </div>
            <button
              data-admin-logout
              type="button"
              class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="ออกจากระบบ"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    `;
  }

  if (topbarContainer) {
    topbarContainer.className = 'shrink-0';
    topbarContainer.innerHTML = `
      <!-- Topbar Header -->
      <header class="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-xs">
        <div class="flex items-center gap-3">
          <!-- Mobile Drawer Toggle Button -->
          <button id="admin-mobile-toggle" type="button" class="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 class="text-base sm:text-lg font-bold text-slate-800" id="admin-page-title">
            ระบบจัดการหลังบ้าน (Admin)
          </h2>
        </div>

        <div class="flex items-center gap-3">
          <a
            href="/admin/project-form"
            class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            + สร้างโปรเจกต์
          </a>
          <button
            data-admin-logout
            type="button"
            class="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-600 text-xs font-medium transition-colors"
          >
            ออกจากระบบ
          </button>
        </div>
      </header>

      <!-- Mobile Drawer Backdrop & Menu -->
      <div id="admin-mobile-drawer" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs hidden lg:hidden">
        <div class="w-64 bg-slate-900 text-slate-300 h-full flex flex-col p-4 shadow-2xl">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <span class="font-extrabold text-white text-base">ThinkFaster</span>
            <button id="admin-mobile-close" type="button" class="p-1 rounded-lg text-slate-400 hover:text-white">✕</button>
          </div>
          <nav class="flex-1 py-4 space-y-1">
            <a href="/admin" class="block px-3 py-2 rounded-lg text-sm ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}">แดชบอร์ดภาพรวม</a>
            <a href="/admin/projects" class="block px-3 py-2 rounded-lg text-sm ${activeTab === 'projects' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}">รายการระบบ (Projects)</a>
            <a href="/admin/project-form" class="block px-3 py-2 rounded-lg text-sm ${activeTab === 'project-form' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}">เพิ่มระบบใหม่</a>
            <a href="/admin/categories" class="block px-3 py-2 rounded-lg text-sm ${activeTab === 'categories' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}">หมวดหมู่ (Categories)</a>
            <a href="/admin/settings" class="block px-3 py-2 rounded-lg text-sm ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}">ตั้งค่าเว็บไซต์</a>
          </nav>
          <div class="pt-4 border-t border-slate-800">
            <button data-admin-logout type="button" class="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-slate-800">ออกจากระบบ</button>
          </div>
        </div>
      </div>
    `;

    // Mobile drawer toggle
    const toggleBtn = document.getElementById('admin-mobile-toggle');
    const closeBtn = document.getElementById('admin-mobile-close');
    const drawer = document.getElementById('admin-mobile-drawer');

    if (toggleBtn && drawer && closeBtn) {
      toggleBtn.addEventListener('click', () => drawer.classList.remove('hidden'));
      closeBtn.addEventListener('click', () => drawer.classList.add('hidden'));
      drawer.addEventListener('click', (e) => {
        if (e.target === drawer) drawer.classList.add('hidden');
      });
    }
  }

  setupAdminLogout();
  return session;
}
