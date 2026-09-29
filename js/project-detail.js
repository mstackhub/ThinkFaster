/**
 * ThinkFaster Project Detail Page Controller
 * Requirements #15 through #29, #117, #118, #119, #122, #123
 */
import { getProjectBySlug, getSimilarProjects, getSettings } from './api.js';
import { renderHeader } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderFloatingContact } from './components/floating-contact.js';
import { renderCookieBanner } from './components/cookie-banner.js';
import { createProjectCardHTML } from './components/project-card.js';
import { openLightbox } from './components/lightbox.js';
import { formatCurrency, escapeHTML, copyToClipboard, showToast } from './utils.js';
import { trackEvent, initTracking } from './tracking.js';

let currentProject = null;
let siteSettings = {};

async function initProjectDetailPage() {
  try {
    renderHeader('projects');
    renderCookieBanner();

    siteSettings = await getSettings();
    renderFooter(siteSettings);
    renderFloatingContact(siteSettings);
    initTracking(siteSettings.tracking);

    const urlParams = new URLSearchParams(window.location.search);
    let slug = window.__PRELOADED_SLUG__ || urlParams.get('slug') || urlParams.get('id');

    // Also check pathname like /project/spa-booking-system or /projects/spa-booking-system
    if (!slug) {
      const segments = window.location.pathname.split('/').filter(Boolean);
      const projIdx = segments.findIndex(s => s === 'project' || s === 'projects');
      if (projIdx !== -1 && segments[projIdx + 1] && segments[projIdx + 1] !== 'index.html') {
        slug = decodeURIComponent(segments[projIdx + 1]);
      }
    }

    if (!slug) {
      window.location.href = '404.html';
      return;
    }

    currentProject = await getProjectBySlug(slug);

    if (!currentProject) {
      // Show 404 state
      document.getElementById('project-detail-loading')?.classList.add('hidden');
      document.getElementById('project-not-found')?.classList.remove('hidden');
      return;
    }

    // Update Document Meta for SEO & OG
    updatePageMeta(currentProject);

    // Render Full Detail
    renderProjectDetail(currentProject);

    // Track detail view
    trackEvent('view_project', {
      project_id: currentProject.id,
      project_code: currentProject.code,
      project_name: currentProject.name,
      category: currentProject.category,
      price: currentProject.sale_price || currentProject.regular_price,
      location: 'detail_page'
    });

    // Load Similar Projects
    await loadSimilarProjects(currentProject);
  } catch (err) {
    console.error('Project Detail Page Error:', err);
    document.getElementById('project-detail-loading')?.classList.add('hidden');
    // If we have currentProject rendered, keep it, otherwise show not found
    if (!currentProject) {
      document.getElementById('project-not-found')?.classList.remove('hidden');
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjectDetailPage);
} else {
  initProjectDetailPage();
}

function updatePageMeta(p) {
  document.title = `${p.name} (#${p.code}) | ThinkFaster`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', p.meta_description || p.short_description || `${p.name} ราคาเริ่มต้น ${formatCurrency(p.sale_price || p.regular_price)}`);
  }
}

function renderProjectDetail(p) {
  document.getElementById('project-detail-loading')?.classList.add('hidden');
  const mainContainer = document.getElementById('project-detail-content');
  if (!mainContainer) return;
  mainContainer.classList.remove('hidden');

  const hasSale = p.sale_price !== null && p.sale_price !== undefined && p.sale_price < p.regular_price;
  const currentPrice = hasSale ? p.sale_price : p.regular_price;
  const formattedCurrentPrice = formatCurrency(currentPrice, p.currency);
  const formattedRegularPrice = formatCurrency(p.regular_price, p.currency);
  const isComingSoon = p.status === 'coming_soon';

  // 1. Breadcrumb
  document.getElementById('breadcrumb-title').textContent = p.name;
  document.getElementById('breadcrumb-category').textContent = p.category;
  document.getElementById('breadcrumb-category').href = `projects.html?category=${encodeURIComponent(p.category)}`;

  // 2. Hero Info
  document.getElementById('detail-code').textContent = `#${p.code || '000'}`;
  document.getElementById('detail-category').textContent = p.category;
  document.getElementById('detail-type').textContent = p.project_type || 'Web System';
  document.getElementById('detail-name').textContent = p.name;
  document.getElementById('detail-short-desc').textContent = p.short_description || '';

  // Badge
  const badgeEl = document.getElementById('detail-badge');
  if (p.badge) {
    badgeEl.textContent = p.badge;
    badgeEl.classList.remove('hidden');
  } else {
    badgeEl.classList.add('hidden');
  }

  // Views
  const viewsEl = document.getElementById('detail-views-count');
  if (viewsEl) {
    const baseViews = Number(p.views) || 0;
    let trackedViews = 0;
    try {
      const rawTrack = localStorage.getItem('thinkfaster_tracking_v1');
      if (rawTrack) {
        const parsedTrack = JSON.parse(rawTrack);
        trackedViews = Number(parsedTrack.projects?.[p.code]?.views || parsedTrack.projects?.[p.id]?.views) || 0;
      }
    } catch (e) {}
    const totalViews = baseViews + trackedViews;
    viewsEl.textContent = totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + 'k' : totalViews.toLocaleString('th-TH');
  }

  // Demo Button
  const demoBtn = document.getElementById('detail-demo-btn');
  if (p.demo_url && !isComingSoon) {
    demoBtn.href = p.demo_url;
    demoBtn.classList.remove('hidden');
    demoBtn.onclick = () => {
      trackEvent('click_demo', {
        project_code: p.code,
        project_name: p.name,
        price: currentPrice,
        location: 'detail_hero'
      });
    };
  } else {
    demoBtn.classList.add('hidden');
  }

  // 3. Screenshot Gallery
  renderGallery(p);

  // 4. Video Demo
  renderVideoDemo(p);

  // 5. Overview & Descriptions
  const overviewEl = document.getElementById('detail-overview');
  if (overviewEl) {
    // Sanitized multi-line paragraph rendering
    overviewEl.innerHTML = (p.full_description || p.short_description || '')
      .split('\n\n')
      .map(para => `<p class="mb-4 leading-relaxed text-slate-700">${escapeHTML(para)}</p>`)
      .join('');
  }

  // 6. Features List
  const featuresContainer = document.getElementById('detail-features-list');
  if (featuresContainer) {
    const features = Array.isArray(p.features) ? p.features : [];
    if (features.length > 0) {
      featuresContainer.innerHTML = features.map(f => `
        <div class="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <svg class="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="text-sm font-medium text-slate-800 leading-snug">${escapeHTML(f)}</span>
        </div>
      `).join('');
    } else {
      featuresContainer.innerHTML = `<p class="text-xs text-slate-400">ไม่มีรายการฟีเจอร์เพิ่มเติม</p>`;
    }
  }

  // 7. Suitable For Tags
  const suitableContainer = document.getElementById('detail-suitable-tags');
  if (suitableContainer) {
    const suitable = Array.isArray(p.suitable_for) ? p.suitable_for : [];
    if (suitable.length > 0) {
      suitableContainer.innerHTML = suitable.map(s => `
        <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          ✓ ${escapeHTML(s)}
        </span>
      `).join('');
    } else {
      suitableContainer.innerHTML = `<span class="text-xs text-slate-400">เหมาะกับธุรกิจทั่วไป</span>`;
    }
  }

  // 8. Tech Stack Tags
  const techContainer = document.getElementById('detail-tech-tags');
  if (techContainer) {
    const techs = Array.isArray(p.technologies) ? p.technologies : [];
    if (techs.length > 0) {
      techContainer.innerHTML = techs.map(t => `
        <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          ${escapeHTML(t)}
        </span>
      `).join('');
    } else {
      techContainer.innerHTML = `<span class="text-xs text-slate-400">HTML, Tailwind CSS, JavaScript</span>`;
    }
  }

  // 9. Copy Order Message Box
  setupCopyOrderMessage(p, currentPrice);

  // 10. Contact Channel Buttons
  setupContactChannels(p);

  // 11. Mobile Sticky Bar
  setupMobileStickyBar(p, currentPrice, formattedCurrentPrice, isComingSoon);

  // 12. Share Buttons
  setupShareButtons(p);
}

function renderGallery(p) {
  const coverImg = document.getElementById('detail-cover-image');
  const thumbsContainer = document.getElementById('detail-gallery-thumbs');
  const allImages = [p.cover_image, ...(p.gallery || [])].filter(Boolean);

  if (coverImg) {
    coverImg.src = p.cover_image || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80';
    coverImg.alt = p.name;
    coverImg.onclick = () => openLightbox(allImages, 0);
  }

  if (thumbsContainer && allImages.length > 1) {
    thumbsContainer.innerHTML = allImages.map((img, idx) => `
      <button
        type="button"
        class="gallery-thumb-btn w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${idx === 0 ? 'border-blue-600 scale-105' : 'border-slate-200 hover:border-slate-400'}"
        data-index="${idx}"
      >
        <img src="${escapeHTML(img)}" alt="Screenshot ${idx + 1}" class="w-full h-full object-cover" />
      </button>
    `).join('');

    thumbsContainer.querySelectorAll('.gallery-thumb-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (coverImg && allImages[idx]) {
          coverImg.src = allImages[idx];
        }
        thumbsContainer.querySelectorAll('.gallery-thumb-btn').forEach(b => {
          b.className = 'gallery-thumb-btn w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 border-slate-200 hover:border-slate-400';
        });
        btn.className = 'gallery-thumb-btn w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 border-blue-600 scale-105';
      });
    });
  }
}

function renderVideoDemo(p) {
  const videoSection = document.getElementById('detail-video-section');
  const videoIframe = document.getElementById('detail-video-iframe');
  if (!videoSection || !videoIframe) return;

  if (p.video_url && p.video_url.trim() !== '') {
    videoSection.classList.remove('hidden');
    // Format embed URL if standard YouTube link
    let embedUrl = p.video_url;
    if (embedUrl.includes('watch?v=')) {
      embedUrl = embedUrl.replace('watch?v=', 'embed/');
    } else if (embedUrl.includes('youtu.be/')) {
      embedUrl = embedUrl.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    videoIframe.src = embedUrl;
  } else {
    videoSection.classList.add('hidden');
  }
}

function setupCopyOrderMessage(p, price) {
  const messagePreview = document.getElementById('copy-message-preview');
  const copyBtn = document.getElementById('btn-copy-order-message');
  if (!messagePreview || !copyBtn) return;

  let template = siteSettings.order_template || "Code: {{project_code}}\nProject Name: {{project_name}}\nราคา: {{price}} บาท\nDemo: {{demo_url}}\n\nสนใจสั่งซื้อระบบนี้ครับ/ค่ะ";

  let formattedText = template
    .replace('{{project_code}}', p.code || '')
    .replace('{{project_name}}', p.name || '')
    .replace('{{price}}', new Intl.NumberFormat('th-TH').format(price))
    .replace('{{demo_url}}', p.demo_url || '-');

  if (!p.demo_url) {
    formattedText = formattedText.replace(/Demo:.*\n/, '');
  }

  messagePreview.textContent = formattedText;

  copyBtn.addEventListener('click', async () => {
    const success = await copyToClipboard(formattedText);
    if (success) {
      showToast('คัดลอกข้อความแล้ว ✓ สามารถนำไปวางใน LINE หรือ Messenger ได้ทันที', 'success');
      trackEvent('copy_project', {
        project_id: p.id,
        project_code: p.code,
        project_name: p.name,
        price: price,
        location: 'detail_copy_box'
      });
    } else {
      showToast('ไม่สามารถคัดลอกได้ กรุณาลองใหม่', 'error');
    }
  });
}

function setupContactChannels(p) {
  const lineBtn = document.getElementById('btn-contact-line');
  const messengerBtn = document.getElementById('btn-contact-messenger');
  const phoneBtn = document.getElementById('btn-contact-phone');

  const contacts = siteSettings.contacts || {};

  if (lineBtn && contacts.line) {
    lineBtn.href = contacts.line.url;
    lineBtn.onclick = () => trackEvent('click_line', { project_code: p.code, location: 'detail_page' });
  }

  if (messengerBtn && contacts.messenger) {
    messengerBtn.href = contacts.messenger.url;
    messengerBtn.onclick = () => trackEvent('click_messenger', { project_code: p.code, location: 'detail_page' });
  }

  if (phoneBtn && contacts.phone) {
    phoneBtn.href = `tel:${contacts.phone.number}`;
    phoneBtn.onclick = () => trackEvent('click_phone', { project_code: p.code, location: 'detail_page' });
  }
}

function setupMobileStickyBar(p, price, formattedPrice, isComingSoon) {
  const stickyBar = document.getElementById('mobile-sticky-cta');
  const stickyPrice = document.getElementById('sticky-price');
  const stickyDemo = document.getElementById('sticky-demo-btn');
  const stickyContact = document.getElementById('sticky-contact-btn');

  if (!stickyBar) return;
  stickyBar.classList.remove('hidden');

  if (stickyPrice) stickyPrice.textContent = formattedPrice;

  if (stickyDemo) {
    if (p.demo_url && !isComingSoon) {
      stickyDemo.href = p.demo_url;
      stickyDemo.onclick = () => trackEvent('click_demo', { project_code: p.code, location: 'mobile_sticky' });
    } else {
      stickyDemo.classList.add('hidden');
    }
  }

  if (stickyContact) {
    stickyContact.onclick = () => {
      document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
    };
  }
}

function setupShareButtons(p) {
  const copyLinkBtn = document.getElementById('btn-share-copy-link');
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', async () => {
      const url = window.location.href;
      const success = await copyToClipboard(url);
      if (success) {
        showToast('คัดลอกลิงก์โปรเจกต์แล้ว ✓', 'success');
        trackEvent('share_copy_link', { project_code: p.code });
      }
    });
  }

  const shareFbBtn = document.getElementById('btn-share-fb');
  if (shareFbBtn) {
    shareFbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
  }

  const shareLineBtn = document.getElementById('btn-share-line');
  if (shareLineBtn) {
    shareLineBtn.href = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}`;
  }
}

async function loadSimilarProjects(p) {
  const container = document.getElementById('similar-projects-grid');
  if (!container) return;

  const similar = await getSimilarProjects(p, 3);
  if (similar.length === 0) {
    document.getElementById('similar-projects-section')?.classList.add('hidden');
    return;
  }

  container.innerHTML = similar.map(s => createProjectCardHTML(s)).join('');

  container.querySelectorAll('[data-demo-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      trackEvent('click_demo', {
        project_code: btn.getAttribute('data-code'),
        project_name: btn.getAttribute('data-name'),
        location: 'similar_projects_card'
      });
    });
  });
}
