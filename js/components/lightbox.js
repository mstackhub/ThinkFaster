/**
 * ThinkFaster Lightbox Component
 * Requirement #18: Screenshot Lightbox with Next, Prev, Close, and ESC navigation
 */
import { trackEvent } from '../tracking.js';

let imagesList = [];
let currentIndex = 0;
let modalElement = null;

export function initLightbox() {
  if (document.getElementById('gallery-lightbox-modal')) return;

  modalElement = document.createElement('div');
  modalElement.id = 'gallery-lightbox-modal';
  modalElement.className = 'fixed inset-0 z-50 modal-backdrop hidden items-center justify-center p-4 sm:p-6 select-none animate-fade-in';
  modalElement.style.display = 'none';
  modalElement.innerHTML = `
    <!-- Close Button -->
    <button
      id="lightbox-close-btn"
      type="button"
      class="absolute top-4 right-4 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer focus:outline-none"
      aria-label="Close Lightbox"
    >
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Prev Button -->
    <button
      id="lightbox-prev-btn"
      type="button"
      class="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer focus:outline-none"
      aria-label="Previous Image"
    >
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- Image Display Container -->
    <div class="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center pointer-events-auto">
      <img
        id="lightbox-current-img"
        src=""
        alt="Preview Screenshot"
        class="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl transition-transform"
      />
      <div id="lightbox-counter" class="mt-3 px-3 py-1 bg-black/70 text-white text-xs font-medium rounded-full">
        1 / 1
      </div>
    </div>

    <!-- Next Button -->
    <button
      id="lightbox-next-btn"
      type="button"
      class="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer focus:outline-none"
      aria-label="Next Image"
    >
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  `;

  document.body.appendChild(modalElement);

  // Event handlers
  document.getElementById('lightbox-close-btn').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    showPrevImage();
  });
  document.getElementById('lightbox-next-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    showNextImage();
  });

  modalElement.addEventListener('click', (e) => {
    if (e.target === modalElement || e.target.id === 'gallery-lightbox-modal') {
      closeLightbox();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (modalElement && modalElement.style.display !== 'none' && !modalElement.classList.contains('hidden')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrevImage();
      if (e.key === 'ArrowRight') showNextImage();
    }
  });
}

export function openLightbox(images = [], initialIndex = 0) {
  if (!images || images.length === 0) return;
  initLightbox();
  imagesList = images;
  currentIndex = initialIndex >= 0 && initialIndex < images.length ? initialIndex : 0;
  updateLightboxView();
  modalElement.classList.remove('hidden');
  modalElement.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  trackEvent('view_gallery', { total_images: imagesList.length, index: currentIndex });
}

export function closeLightbox() {
  if (modalElement) {
    modalElement.classList.add('hidden');
    modalElement.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function updateLightboxView() {
  const img = document.getElementById('lightbox-current-img');
  const counter = document.getElementById('lightbox-counter');
  if (img && imagesList[currentIndex]) {
    img.src = imagesList[currentIndex];
  }
  if (counter) {
    counter.textContent = `${currentIndex + 1} / ${imagesList.length}`;
  }

  // Update button visibility if single image
  const prevBtn = document.getElementById('lightbox-prev-btn');
  const nextBtn = document.getElementById('lightbox-next-btn');
  if (prevBtn && nextBtn) {
    if (imagesList.length <= 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    } else {
      prevBtn.style.display = 'flex';
      nextBtn.style.display = 'flex';
    }
  }
}

function showNextImage() {
  if (imagesList.length <= 1) return;
  currentIndex = (currentIndex + 1) % imagesList.length;
  updateLightboxView();
}

function showPrevImage() {
  if (imagesList.length <= 1) return;
  currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
  updateLightboxView();
}
