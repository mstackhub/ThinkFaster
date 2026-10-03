/**
 * ThinkFaster Floating Contact Button Component
 * Requirements #26, #110
 */
import { trackEvent } from '../tracking.js';

export function renderFloatingContact(settings = {}) {
  const container = document.getElementById('floating-contact-container');
  if (!container) return;

  const contacts = settings.contacts || {};
  const lineUrl = contacts.line?.url || 'https://lin.ee/9rqSSpD';
  const messengerUrl = contacts.messenger?.url || 'https://m.me/1390359610819720';
  const phone = contacts.phone?.number || '0624971498';
  const phoneDisplay = contacts.phone?.display || '062-497-1498';

  container.innerHTML = `
    <!-- Floating Backdrop (closes menu when clicked) -->
    <div id="floating-backdrop" class="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] hidden transition-opacity"></div>

    <!-- Floating Contact Menu & Button -->
    <div class="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end">
      <!-- Expanded Contact Menu -->
      <div id="floating-menu" class="hidden mb-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3 space-y-2 animate-slide-up">
        <div class="px-2 pt-1 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-500">ติดต่อสอบถาม</span>
          <span class="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">ตอบกลับไว</span>
        </div>

        <!-- LINE OA -->
        <a
          href="${lineUrl}"
          target="_blank"
          rel="noopener noreferrer"
          id="float-line-btn"
          class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors group"
        >
          <div class="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
            LINE
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold">LINE Official Account</span>
            <span class="text-[11px] text-slate-500">ทักสอบถามได้ตลอด 24 ชม.</span>
          </div>
        </a>

        <!-- Facebook Messenger -->
        <a
          href="${messengerUrl}"
          target="_blank"
          rel="noopener noreferrer"
          id="float-messenger-btn"
          class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors group"
        >
          <div class="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
            FB
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold">Messenger</span>
            <span class="text-[11px] text-slate-500">แชทผ่านแฟนเพจ Facebook</span>
          </div>
        </a>

        <!-- Phone Call -->
        <a
          href="tel:${phone}"
          id="float-phone-btn"
          class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 text-slate-700 hover:text-amber-800 transition-colors group"
        >
          <div class="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
            📞
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold">โทรศัพท์สายด่วน</span>
            <span class="text-[11px] text-slate-500">${phoneDisplay}</span>
          </div>
        </a>
      </div>

      <!-- Main Trigger Button -->
      <button
        id="floating-trigger-btn"
        type="button"
        class="group relative inline-flex items-center gap-2.5 px-4 py-3.5 sm:px-5 sm:py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
        aria-label="ติดต่อเรา"
      >
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <svg id="float-icon-chat" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <svg id="float-icon-close" class="w-5 h-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span class="font-semibold text-sm tracking-wide">ติดต่อเรา</span>
      </button>
    </div>
  `;

  const triggerBtn = document.getElementById('floating-trigger-btn');
  const menu = document.getElementById('floating-menu');
  const backdrop = document.getElementById('floating-backdrop');
  const iconChat = document.getElementById('float-icon-chat');
  const iconClose = document.getElementById('float-icon-close');

  function openMenu() {
    menu.classList.remove('hidden');
    backdrop.classList.remove('hidden');
    iconChat.classList.add('hidden');
    iconClose.classList.remove('hidden');
  }

  function closeMenu() {
    menu.classList.add('hidden');
    backdrop.classList.add('hidden');
    iconChat.classList.remove('hidden');
    iconClose.classList.add('hidden');
  }

  triggerBtn.addEventListener('click', () => {
    if (menu.classList.contains('hidden')) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  backdrop.addEventListener('click', closeMenu);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
      closeMenu();
    }
  });

  // Tracking clicks
  document.getElementById('float-line-btn')?.addEventListener('click', () => {
    trackEvent('click_line', { location: 'floating_button' });
  });

  document.getElementById('float-messenger-btn')?.addEventListener('click', () => {
    trackEvent('click_messenger', { location: 'floating_button' });
  });

  document.getElementById('float-phone-btn')?.addEventListener('click', () => {
    trackEvent('click_phone', { location: 'floating_button' });
  });
}
