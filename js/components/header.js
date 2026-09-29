/**
 * ThinkFaster Header Component
 * Responsive, Sticky, Mobile Drawer Navigation
 */

export function renderHeader(activePage = 'home') {
  const headerContainer = document.getElementById('site-header');
  if (!headerContainer) return;

  headerContainer.innerHTML = `
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 sm:h-18">
          <!-- Logo -->
          <a href="index.html" class="font-extrabold text-2xl tracking-tight text-slate-900 hover:text-blue-600 transition-colors">
            ThinkFaster
          </a>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-1 lg:gap-2">
            <a href="index.html" class="px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${activePage === 'home' ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}">
              หน้าแรก
            </a>
            <a href="projects.html" class="px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${activePage === 'projects' ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}">
              ระบบทั้งหมด
            </a>
            <a href="about.html" class="px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${activePage === 'about' ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}">
              เกี่ยวกับบริการ
            </a>
            <a href="contact.html" class="px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${activePage === 'contact' ? 'text-blue-600 bg-blue-50/70 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'}">
              ติดต่อเรา
            </a>
          </nav>

          <!-- Desktop CTA -->
          <div class="hidden md:flex items-center gap-3">
            <a href="projects.html" class="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition-all hover:shadow-md hover:shadow-blue-500/20">
              <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              ดูระบบทั้งหมด
            </a>
          </div>

          <!-- Mobile Hamburger Button -->
          <div class="flex md:hidden items-center">
            <button id="mobile-menu-btn" type="button" class="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Toggle menu">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path id="hamburger-icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path id="close-icon" class="hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div id="mobile-drawer" class="hidden md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-fade-in shadow-xl">
        <a href="index.html" class="block px-3 py-2.5 rounded-lg text-base font-medium ${activePage === 'home' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-700 hover:bg-slate-50'}">
          หน้าแรก
        </a>
        <a href="projects.html" class="block px-3 py-2.5 rounded-lg text-base font-medium ${activePage === 'projects' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-700 hover:bg-slate-50'}">
          ระบบทั้งหมด
        </a>
        <a href="about.html" class="block px-3 py-2.5 rounded-lg text-base font-medium ${activePage === 'about' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-700 hover:bg-slate-50'}">
          เกี่ยวกับบริการ
        </a>
        <a href="contact.html" class="block px-3 py-2.5 rounded-lg text-base font-medium ${activePage === 'contact' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-700 hover:bg-slate-50'}">
          ติดต่อเรา
        </a>
        <div class="pt-3 border-t border-slate-100 flex flex-col gap-2">
          <a href="projects.html" class="w-full flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">
            ดูระบบทั้งหมด
          </a>
          <a href="admin/login.html" class="w-full text-center py-2 text-xs font-medium text-slate-500 hover:text-slate-800">
            ระบบจัดการหลังบ้าน (Admin)
          </a>
        </div>
      </div>
    </header>
  `;

  // Mobile menu toggle logic
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeIcon = document.getElementById('close-icon');

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      const isExpanded = !drawer.classList.contains('hidden');
      if (isExpanded) {
        drawer.classList.add('hidden');
        hamburgerIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
      } else {
        drawer.classList.remove('hidden');
        hamburgerIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
      }
    });
  }
}
