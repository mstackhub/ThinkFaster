/**
 * ThinkFaster Project Card Component
 * Requirements: #11, #12, #13, #14, #109
 */
import { formatCurrency, escapeHTML } from '../utils.js';

export function createProjectCardHTML(project) {
  const isComingSoon = project.status === 'coming_soon';
  const hasSale = project.sale_price !== null && project.sale_price !== undefined && project.sale_price < project.regular_price;
  const currentPrice = hasSale ? project.sale_price : project.regular_price;
  const formattedCurrentPrice = formatCurrency(currentPrice, project.currency);
  const formattedRegularPrice = formatCurrency(project.regular_price, project.currency);

  // Badge Styling
  let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
  const badgeText = project.badge || (isComingSoon ? 'Coming Soon' : '');

  if (badgeText === 'Recommended') badgeClass = 'badge-recommended';
  else if (badgeText === 'Best Seller') badgeClass = 'badge-bestseller';
  else if (badgeText === 'New') badgeClass = 'badge-new';
  else if (badgeText === 'Special Price') badgeClass = 'badge-special';
  else if (badgeText === 'Popular') badgeClass = 'badge-popular';
  else if (badgeText === 'Coming Soon') badgeClass = 'badge-comingsoon';

  // Calculate Views Count (Base + Tracked)
  const baseViews = Number(project.views) || 0;
  let trackedViews = 0;
  try {
    const rawTrack = localStorage.getItem('thinkfaster_tracking_v1');
    if (rawTrack) {
      const parsedTrack = JSON.parse(rawTrack);
      trackedViews = Number(parsedTrack.projects?.[project.code]?.views || parsedTrack.projects?.[project.id]?.views) || 0;
    }
  } catch (e) {}
  const totalViews = baseViews + trackedViews;
  const formattedViews = totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + 'k' : totalViews.toLocaleString('th-TH');

  const coverUrl = project.cover_image || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80';
  const detailUrl = `project.html?slug=${encodeURIComponent(project.slug)}`;

  return `
    <article class="project-card bg-white border border-slate-200/90 rounded-2xl overflow-hidden flex flex-col h-full shadow-sm hover:border-slate-300 group">
      <!-- Card Image Header -->
      <div class="relative aspect-video-box bg-slate-100 overflow-hidden">
        <a href="${detailUrl}" class="block w-full h-full cursor-pointer" aria-label="ดูรายละเอียด ${escapeHTML(project.name)}">
          <img
            src="${escapeHTML(coverUrl)}"
            alt="${escapeHTML(project.name)}"
            loading="lazy"
            width="600"
            height="338"
            class="card-cover-img w-full h-full object-cover object-center"
            onerror="this.src='https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'"
          />
        </a>

        <!-- Top Badges Overlay -->
        <div class="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-white shadow-sm">
            #${escapeHTML(project.code || '000')}
          </span>

          ${badgeText ? `
            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm ${badgeClass}">
              ${escapeHTML(badgeText)}
            </span>
          ` : ''}
        </div>

        ${isComingSoon ? `
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <span class="px-4 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-bold uppercase tracking-wider shadow">
              เร็ว ๆ นี้ (Coming Soon)
            </span>
          </div>
        ` : ''}
      </div>

      <!-- Card Body -->
      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <!-- Category & Type -->
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
              ${escapeHTML(project.category || 'General')}
            </span>
            ${project.project_type ? `
              <span class="text-xs text-slate-400">·</span>
              <span class="text-xs font-medium text-slate-500">${escapeHTML(project.project_type)}</span>
            ` : ''}
          </div>

          <!-- Project Name -->
          <h3 class="font-bold text-base sm:text-lg text-slate-900 leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            <a href="${detailUrl}">${escapeHTML(project.name)}</a>
          </h3>

          <!-- Short Description -->
          <p class="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2">
            ${escapeHTML(project.short_description || '')}
          </p>
        </div>

        <!-- Price & CTA Section -->
        <div class="pt-4 border-t border-slate-100 mt-2">
          <div class="flex items-end justify-between mb-4">
            <div>
              <span class="text-xs text-slate-400 block mb-0.5">ราคาพร้อมใช้งาน</span>
              <div class="flex items-baseline gap-2">
                <span class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  ${formattedCurrentPrice}
                </span>
                ${hasSale ? `
                  <span class="text-xs sm:text-sm text-slate-400 line-through">
                    ${formattedRegularPrice}
                  </span>
                ` : ''}
              </div>
            </div>

            <!-- Views Count Badge -->
            <div class="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg shrink-0 shadow-2xs" title="ยอดผู้เข้าชมระบบนี้">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span class="font-bold text-slate-700">${formattedViews}</span>
              <span class="text-[11px] text-slate-400">เข้าชม</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-2">
            <a
              href="${detailUrl}"
              class="w-full inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 transition-colors"
            >
              ดูรายละเอียด
            </a>

            ${isComingSoon || !project.demo_url ? `
              <button
                type="button"
                disabled
                class="w-full inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-medium rounded-xl text-slate-400 bg-slate-100 cursor-not-allowed"
              >
                ไม่มี Demo
              </button>
            ` : `
              <a
                href="${escapeHTML(project.demo_url)}"
                target="_blank"
                rel="noopener noreferrer"
                data-demo-btn
                data-code="${escapeHTML(project.code)}"
                data-name="${escapeHTML(project.name)}"
                data-price="${currentPrice}"
                class="w-full inline-flex items-center justify-center px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 shadow-sm transition-all hover:shadow"
              >
                ดู Demo
                <svg class="w-3.5 h-3.5 ml-1 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            `}
          </div>
        </div>
      </div>
    </article>
  `;
}
