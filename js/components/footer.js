/**
 * ThinkFaster Footer Component
 * Requirement #33
 */

export function renderFooter(settings = {}) {
  const footerContainer = document.getElementById('site-footer');
  if (!footerContainer) return;

  const contacts = settings.contacts || {};
  const general = settings.general || {};

  const lineUrl = contacts.line?.url || 'https://line.me';
  const messengerUrl = contacts.messenger?.url || 'https://m.me';
  const phone = contacts.phone?.number || '0812345678';
  const phoneDisplay = contacts.phone?.display || '081-234-5678';

  footerContainer.innerHTML = `
    <footer class="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <!-- Brand & About -->
          <div class="lg:col-span-2 space-y-4">
            <a href="index.html" class="inline-block font-extrabold text-2xl tracking-tight text-white hover:text-blue-400 transition-colors">
              ThinkFaster
            </a>
            <p class="text-sm text-slate-400 leading-relaxed max-w-sm">
              ${general.footer_text || 'แพลตฟอร์มศูนย์รวมระบบเว็บไซต์และเว็บแอปพลิเคชันสำเร็จรูปพร้อมใช้งาน ทดลอง Demo จริง และติดต่อสั่งซื้อได้ทันที รวดเร็ว คุ้มค่า ประหยัดเวลา'}
            </p>
            <div class="pt-2">
              <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                พร้อมส่งมอบงานทุกวัน
              </span>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-xs font-semibold text-white uppercase tracking-wider mb-4">เมนูด่วน</h3>
            <ul class="space-y-2.5 text-sm">
              <li><a href="index.html" class="hover:text-white transition-colors">หน้าแรก</a></li>
              <li><a href="projects.html" class="hover:text-white transition-colors">ระบบทั้งหมด</a></li>
              <li><a href="about.html" class="hover:text-white transition-colors">เกี่ยวกับบริการ</a></li>
              <li><a href="contact.html" class="hover:text-white transition-colors">ติดต่อเรา</a></li>
              <li><a href="admin/login.html" class="hover:text-white transition-colors text-slate-500 hover:text-slate-300">เข้าสู่ระบบ Admin</a></li>
            </ul>
          </div>

          <!-- Popular Categories -->
          <div>
            <h3 class="text-xs font-semibold text-white uppercase tracking-wider mb-4">ประเภทยอดนิยม</h3>
            <ul class="space-y-2.5 text-sm">
              <li><a href="projects.html?category=Booking+System" class="hover:text-white transition-colors">ระบบจองคิวออนไลน์</a></li>
              <li><a href="projects.html?category=Restaurant" class="hover:text-white transition-colors">ระบบร้านอาหาร QR Menu</a></li>
              <li><a href="projects.html?category=E-Commerce" class="hover:text-white transition-colors">แคตตาล็อก & ร้านค้าออนไลน์</a></li>
              <li><a href="projects.html?category=Landing+Page" class="hover:text-white transition-colors">Landing Page ปิดการขาย</a></li>
              <li><a href="projects.html?category=Automotive" class="hover:text-white transition-colors">เว็บไซต์เต็นท์รถยนต์</a></li>
            </ul>
          </div>

          <!-- Direct Contact -->
          <div>
            <h3 class="text-xs font-semibold text-white uppercase tracking-wider mb-4">ช่องทางติดต่อด่วน</h3>
            <ul class="space-y-3 text-sm">
              <li>
                <a href="${lineUrl}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2.5 text-emerald-400 hover:text-emerald-300 transition-colors">
                  <span class="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-xs">LINE</span>
                  <span>@thinkfaster</span>
                </a>
              </li>
              <li>
                <a href="${messengerUrl}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2.5 text-blue-400 hover:text-blue-300 transition-colors">
                  <span class="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center font-bold text-xs">FB</span>
                  <span>Facebook Messenger</span>
                </a>
              </li>
              <li>
                <a href="tel:${phone}" class="flex items-center gap-2.5 text-amber-400 hover:text-amber-300 transition-colors">
                  <span class="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-xs">📞</span>
                  <span>${phoneDisplay}</span>
                </a>
              </li>
              <li class="pt-1 text-xs text-slate-500">
                เวลาทำการ: ${contacts.business_hours || '09:00 - 21:00 น.'}
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>${general.copyright || '© 2026 ThinkFaster. All rights reserved.'}</p>
          <div class="flex items-center gap-6">
            <a href="privacy.html" class="hover:text-slate-400 transition-colors">นโยบายความเป็นส่วนตัว (Privacy)</a>
            <a href="terms.html" class="hover:text-slate-400 transition-colors">เงื่อนไขการให้บริการ (Terms)</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}
