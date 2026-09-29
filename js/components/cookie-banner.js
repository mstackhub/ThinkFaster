/**
 * ThinkFaster Cookie Consent Banner
 * Requirement #59
 */

export function renderCookieBanner() {
  const CONSENT_KEY = 'thinkfaster_cookie_consent';
  if (localStorage.getItem(CONSENT_KEY)) return;

  const banner = document.createElement('div');
  banner.id = 'cookie-consent-banner';
  banner.className = 'fixed bottom-4 left-4 right-4 sm:left-6 sm:max-w-md z-50 bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-4 sm:p-5 animate-slide-up';
  banner.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-base">
        🍪
      </div>
      <div class="flex-1">
        <h4 class="text-sm font-bold text-slate-900 mb-1">การใช้งานคุกกี้ (Cookies)</h4>
        <p class="text-xs text-slate-600 leading-relaxed mb-3">
          เว็บไซต์นี้ใช้คุกกี้เพื่อเพิ่มประสิทธิภาพการใช้งาน และวิเคราะห์สถิติเพื่อพัฒนาบริการให้ดียิ่งขึ้น คุณสามารถอ่านรายละเอียดเพิ่มเติมได้ที่
          <a href="privacy.html" class="text-blue-600 underline hover:text-blue-700">นโยบายความเป็นส่วนตัว</a>
        </p>
        <div class="flex items-center gap-2">
          <button id="btn-accept-cookies" type="button" class="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            ยอมรับทั้งหมด
          </button>
          <button id="btn-reject-cookies" type="button" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            เฉพาะที่จำเป็น
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  document.getElementById('btn-accept-cookies').addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'all');
    banner.remove();
  });

  document.getElementById('btn-reject-cookies').addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'essential');
    banner.remove();
  });
}
