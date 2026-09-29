/**
 * ThinkFaster Admin Project Form Controller (Create & Edit)
 * Requirements #39 through #49, #71, #74, #87, #88, #95
 */
import { getProjectById, getCategories, saveProject, uploadImage, getProjects } from '../../js/api.js';
import { generateSlug, generateNextCode, compressImage, showToast, isValidUrl, escapeHTML } from '../../js/utils.js';

let editingProjectId = null;
let currentFeatures = [];
let currentTechnologies = [];
let currentSuitableFor = [];
let currentGallery = [];
let currentCoverUrl = '';

export async function initProjectForm() {
  const urlParams = new URLSearchParams(window.location.search);
  editingProjectId = urlParams.get('id');

  // Load Categories into Select
  const categories = await getCategories({ activeOnly: false });
  const catSelect = document.getElementById('field-category');
  if (catSelect) {
    catSelect.innerHTML = `
      <option value="">-- เลือกหมวดหมู่ --</option>
      ${categories.map(c => `<option value="${escapeHTML(c.id)}" data-name="${escapeHTML(c.name)}">${escapeHTML(c.name)}</option>`).join('')}
    `;
  }

  if (editingProjectId) {
    document.getElementById('form-page-heading').textContent = 'แก้ไขระบบ (Edit Project)';
    document.getElementById('admin-page-title').textContent = 'แก้ไขระบบ';
    await loadExistingProject(editingProjectId);
  } else {
    document.getElementById('form-page-heading').textContent = 'เพิ่มระบบใหม่ (Add Project)';
    document.getElementById('admin-page-title').textContent = 'เพิ่มระบบใหม่';
    // Auto-generate initial Code
    const all = await getProjects({ includeNonPublished: true });
    const nextCode = generateNextCode(all);
    const codeInput = document.getElementById('field-code');
    if (codeInput) codeInput.value = nextCode;

    // Default features & tags
    currentFeatures = [
      'ระบบออกแบบรองรับ 100% Mobile & Desktop',
      'ซอร์สโค้ดสะอาด ปรับแต่งและติดตั้งง่าย'
    ];
    currentTechnologies = ['HTML5', 'Tailwind CSS', 'JavaScript'];
    currentSuitableFor = ['ธุรกิจบริการ', 'ร้านค้าทั่วไป'];
    renderFeaturesList();
    renderTechTags();
    renderSuitableTags();
  }

  setupEventListeners();
}

async function loadExistingProject(id) {
  const p = await getProjectById(id);
  if (!p) {
    showToast('ไม่พบข้อมูลระบบนี้', 'error');
    window.location.href = 'projects.html';
    return;
  }

  // Populate basic inputs
  document.getElementById('field-code').value = p.code || '';
  document.getElementById('field-name').value = p.name || '';
  document.getElementById('field-slug').value = p.slug || '';
  document.getElementById('field-project-type').value = p.project_type || 'Web Application';
  document.getElementById('field-category').value = p.category_id || '';
  document.getElementById('field-short-desc').value = p.short_description || '';
  document.getElementById('field-full-desc').value = p.full_description || '';
  document.getElementById('field-regular-price').value = p.regular_price || 0;
  document.getElementById('field-sale-price').value = p.sale_price !== null && p.sale_price !== undefined ? p.sale_price : '';
  document.getElementById('field-badge').value = p.badge || '';
  document.getElementById('field-status').value = p.status || 'draft';
  document.getElementById('field-sort-order').value = p.sort_order !== undefined ? p.sort_order : 0;
  document.getElementById('field-views').value = p.views !== undefined ? p.views : 0;
  document.getElementById('field-featured').checked = p.is_featured === true;

  document.getElementById('field-demo-url').value = p.demo_url || '';
  document.getElementById('field-video-type').value = p.video_type || 'youtube';
  document.getElementById('field-video-url').value = p.video_url || '';

  document.getElementById('field-seo-title').value = p.seo_title || '';
  document.getElementById('field-meta-desc').value = p.meta_description || '';

  // Cover image
  currentCoverUrl = p.cover_image || '';
  updateCoverPreview(currentCoverUrl);

  // Gallery
  currentGallery = Array.isArray(p.gallery) ? [...p.gallery] : [];
  renderGalleryThumbnails();

  // Dynamic Lists
  currentFeatures = Array.isArray(p.features) ? [...p.features] : [];
  renderFeaturesList();

  currentTechnologies = Array.isArray(p.technologies) ? [...p.technologies] : [];
  renderTechTags();

  currentSuitableFor = Array.isArray(p.suitable_for) ? [...p.suitable_for] : [];
  renderSuitableTags();

  // Setup preview button
  const previewBtn = document.getElementById('btn-preview-project');
  if (previewBtn) {
    previewBtn.href = `../project.html?slug=${encodeURIComponent(p.slug)}`;
    previewBtn.classList.remove('hidden');
  }
}

function updateCoverPreview(url) {
  const previewImg = document.getElementById('cover-preview-img');
  const previewBox = document.getElementById('cover-preview-box');
  if (url && url.trim() !== '') {
    previewImg.src = url;
    previewBox.classList.remove('hidden');
  } else {
    previewBox.classList.add('hidden');
  }
}

function renderGalleryThumbnails() {
  const container = document.getElementById('gallery-thumbnails-container');
  if (!container) return;

  if (currentGallery.length === 0) {
    container.innerHTML = `<span class="text-xs text-slate-400">ยังไม่มีรูปภาพ Screenshot ในแกลเลอรี</span>`;
    return;
  }

  container.innerHTML = currentGallery.map((img, idx) => `
    <div class="relative w-24 h-16 rounded-xl overflow-hidden border border-slate-200 group bg-slate-100 shrink-0">
      <img src="${escapeHTML(img)}" alt="" class="w-full h-full object-cover" />
      <button
        type="button"
        data-remove-gallery="${idx}"
        class="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow hover:bg-rose-700"
        title="ลบรูปนี้"
      >
        ✕
      </button>
    </div>
  `).join('');

  container.querySelectorAll('[data-remove-gallery]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-remove-gallery'), 10);
      currentGallery.splice(idx, 1);
      renderGalleryThumbnails();
    });
  });
}

function renderFeaturesList() {
  const container = document.getElementById('features-list-container');
  if (!container) return;

  if (currentFeatures.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 py-2">ยังไม่มีรายการฟีเจอร์ กดปุ่ม "+ เพิ่มฟีเจอร์" ด้านล่าง</p>`;
    return;
  }

  container.innerHTML = currentFeatures.map((feat, idx) => `
    <div class="flex items-center gap-2">
      <input
        type="text"
        value="${escapeHTML(feat)}"
        data-feature-index="${idx}"
        placeholder="พิมพ์รายละเอียดฟีเจอร์..."
        class="flex-1 text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        data-remove-feature="${idx}"
        class="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50"
        title="ลบฟีเจอร์นี้"
      >
        ✕
      </button>
    </div>
  `).join('');

  // Update on input
  container.querySelectorAll('[data-feature-index]').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(input.getAttribute('data-feature-index'), 10);
      currentFeatures[idx] = e.target.value;
    });
  });

  // Remove
  container.querySelectorAll('[data-remove-feature]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-remove-feature'), 10);
      currentFeatures.splice(idx, 1);
      renderFeaturesList();
    });
  });
}

function renderTechTags() {
  const container = document.getElementById('tech-tags-container');
  if (!container) return;
  container.innerHTML = currentTechnologies.map((t, idx) => `
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
      ${escapeHTML(t)}
      <button type="button" data-remove-tech="${idx}" class="text-slate-400 hover:text-rose-600 font-bold ml-1">✕</button>
    </span>
  `).join('');

  container.querySelectorAll('[data-remove-tech]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-remove-tech'), 10);
      currentTechnologies.splice(idx, 1);
      renderTechTags();
    });
  });
}

function renderSuitableTags() {
  const container = document.getElementById('suitable-tags-container');
  if (!container) return;
  container.innerHTML = currentSuitableFor.map((s, idx) => `
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      ${escapeHTML(s)}
      <button type="button" data-remove-suitable="${idx}" class="text-emerald-500 hover:text-rose-600 font-bold ml-1">✕</button>
    </span>
  `).join('');

  container.querySelectorAll('[data-remove-suitable]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-remove-suitable'), 10);
      currentSuitableFor.splice(idx, 1);
      renderSuitableTags();
    });
  });
}

function setupEventListeners() {
  // Auto slug generator from name
  const nameInput = document.getElementById('field-name');
  const slugInput = document.getElementById('field-slug');
  const btnAutoSlug = document.getElementById('btn-auto-slug');

  if (btnAutoSlug && nameInput && slugInput) {
    btnAutoSlug.addEventListener('click', () => {
      slugInput.value = generateSlug(nameInput.value);
    });
  }

  // Add Feature
  document.getElementById('btn-add-feature')?.addEventListener('click', () => {
    currentFeatures.push('');
    renderFeaturesList();
    // Focus last input
    const inputs = document.querySelectorAll('[data-feature-index]');
    if (inputs.length > 0) inputs[inputs.length - 1].focus();
  });

  // Add Tech Tag
  const techInput = document.getElementById('input-new-tech');
  document.getElementById('btn-add-tech')?.addEventListener('click', () => {
    const val = techInput.value.trim();
    if (val && !currentTechnologies.includes(val)) {
      currentTechnologies.push(val);
      renderTechTags();
      techInput.value = '';
    }
  });

  // Add Suitable Tag
  const suitableInput = document.getElementById('input-new-suitable');
  document.getElementById('btn-add-suitable')?.addEventListener('click', () => {
    const val = suitableInput.value.trim();
    if (val && !currentSuitableFor.includes(val)) {
      currentSuitableFor.push(val);
      renderSuitableTags();
      suitableInput.value = '';
    }
  });

  // Cover Image File Upload (Client-side Canvas compression)
  const coverFileInput = document.getElementById('field-cover-file');
  coverFileInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      showToast('กำลังบีบอัดรูปภาพและอัปโหลด...', 'info');
      const compressed = await compressImage(file, 1920, 0.85);
      const uploadedUrl = await uploadImage(compressed, 'cover', editingProjectId || 'new');
      currentCoverUrl = uploadedUrl;
      updateCoverPreview(uploadedUrl);
      showToast('อัปโหลดรูปภาพปกสำเร็จ', 'success');
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการอัปโหลดรูปปก', 'error');
    }
  });

  // Gallery Multiple Files Upload
  const galleryFileInput = document.getElementById('field-gallery-files');
  galleryFileInput?.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    showToast(`กำลังอัปโหลด ${files.length} รูป...`, 'info');
    for (const file of files) {
      try {
        const compressed = await compressImage(file, 1920, 0.82);
        const uploadedUrl = await uploadImage(compressed, 'gallery', editingProjectId || 'new');
        currentGallery.push(uploadedUrl);
      } catch (err) {
        console.error('Gallery image upload failed', err);
      }
    }
    renderGalleryThumbnails();
    showToast('อัปโหลดรูปภาพแกลเลอรีเรียบร้อย', 'success');
  });

  // Form Submit Handler
  const form = document.getElementById('project-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const saveBtn = document.getElementById('btn-save-project');
    const saveSpinner = document.getElementById('save-spinner');
    saveBtn.disabled = true;
    saveSpinner.classList.remove('hidden');

    try {
      const code = document.getElementById('field-code').value.trim();
      const name = document.getElementById('field-name').value.trim();
      let slug = document.getElementById('field-slug').value.trim();
      if (!slug) slug = generateSlug(name);

      const catSelect = document.getElementById('field-category');
      const category_id = catSelect.value;
      const selectedOption = catSelect.options[catSelect.selectedIndex];
      const category = selectedOption ? selectedOption.getAttribute('data-name') || '' : '';

      const project_type = document.getElementById('field-project-type').value;
      const short_description = document.getElementById('field-short-desc').value.trim();
      const full_description = document.getElementById('field-full-desc').value.trim();

      const regular_price = parseFloat(document.getElementById('field-regular-price').value) || 0;
      const saleVal = document.getElementById('field-sale-price').value.trim();
      const sale_price = saleVal !== '' ? parseFloat(saleVal) : null;

      // Price Validation
      if (sale_price !== null && sale_price > regular_price) {
        throw new Error('ราคาโปรโมชัน (Sale Price) ต้องไม่มากกว่าราคาปกติ');
      }

      const badge = document.getElementById('field-badge').value.trim() || null;
      const status = document.getElementById('field-status').value;
      const sort_order = parseInt(document.getElementById('field-sort-order').value, 10) || 0;
      const views = parseInt(document.getElementById('field-views').value, 10) || 0;
      const is_featured = document.getElementById('field-featured').checked;

      const demo_url = document.getElementById('field-demo-url').value.trim();
      if (demo_url && !isValidUrl(demo_url)) {
        throw new Error('Demo URL ต้องเป็น URL ที่ถูกต้อง (ขึ้นต้นด้วย https://)');
      }

      const video_type = document.getElementById('field-video-type').value;
      const video_url = document.getElementById('field-video-url').value.trim();

      const seo_title = document.getElementById('field-seo-title').value.trim();
      const meta_description = document.getElementById('field-meta-desc').value.trim();

      const payload = {
        id: editingProjectId || undefined,
        code,
        name,
        slug,
        category_id,
        category,
        project_type,
        short_description,
        full_description,
        regular_price,
        sale_price,
        currency: 'THB',
        badge,
        status,
        sort_order,
        views,
        is_featured,
        demo_url,
        video_type,
        video_url,
        cover_image: currentCoverUrl,
        gallery: currentGallery,
        features: currentFeatures.filter(f => f.trim() !== ''),
        technologies: currentTechnologies,
        suitable_for: currentSuitableFor,
        seo_title,
        meta_description
      };

      const saved = await saveProject(payload);
      showToast('บันทึกข้อมูลระบบสำเร็จ ✓', 'success');

      setTimeout(() => {
        window.location.href = 'projects.html';
      }, 700);
    } catch (err) {
      showToast(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
      saveBtn.disabled = false;
      saveSpinner.classList.add('hidden');
    }
  });
}
