/**
 * ThinkFaster Centralized API & Data Layer
 * Handles data fetching, persistence, Supabase client integration, and Mock fallback.
 */
import { CONFIG } from './config.js';
import { generateNextCode, generateSlug } from './utils.js';

let supabaseClient = null;

/**
 * Initialize Supabase Client if credentials configured
 */
export function getSupabase() {
  if (supabaseClient) return supabaseClient;
  const settings = getLocalSettings();
  const url = settings?.supabase?.url;
  const anonKey = settings?.supabase?.anon_key;

  if (url && anonKey && window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(url, anonKey);
    } catch (e) {
      console.warn('Failed to init Supabase client', e);
    }
  }
  return supabaseClient;
}

/**
 * Helper to fetch static JSON files if localStorage is empty
 */
async function loadSeedData(path, storageKey) {
  const pathsToTry = [
    path,
    path.startsWith('/') ? path.slice(1) : '/' + path,
    window.location.origin + (path.startsWith('/') ? path : '/' + path),
    '../../' + (path.startsWith('/') ? path.slice(1) : path)
  ];

  for (const tryPath of pathsToTry) {
    try {
      const res = await fetch(tryPath);
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(storageKey, JSON.stringify(data));
        return data;
      }
    } catch (_) {}
  }

  console.warn(`Could not load seed data from ${path}`);
  return [];
}

/**
 * Get Settings from localStorage or seed
 */
export function getLocalSettings() {
  const cached = localStorage.getItem(CONFIG.LOCAL_STORAGE_SETTINGS_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }
  return null;
}

/**
 * Fetch Website & Contact Settings
 */
export async function getSettings() {
  let settings = getLocalSettings();
  if (!settings) {
    const pathsToTry = ['/data/settings.json', 'data/settings.json', '../../data/settings.json'];
    for (const p of pathsToTry) {
      try {
        const res = await fetch(p);
        if (res.ok) {
          settings = await res.json();
          localStorage.setItem(CONFIG.LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
          break;
        }
      } catch (_) {}
    }
  }

  // If Supabase is available and settings table configured, sync here
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('settings').select('*').limit(1).maybeSingle();
      if (!error && data && data.setting_value) {
        settings = data.setting_value;
        localStorage.setItem(CONFIG.LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
      }
    } catch (err) {
      console.warn('Supabase settings query fallback to local', err);
    }
  }

  return settings || {};
}

/**
 * Update Website Settings
 */
export async function updateSettings(newSettings) {
  localStorage.setItem(CONFIG.LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(newSettings));
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('settings').upsert({
        id: 'main',
        setting_value: newSettings,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Failed to persist settings to Supabase', e);
    }
  }
  return newSettings;
}

/**
 * Fetch all categories
 */
export async function getCategories(options = { activeOnly: true }) {
  let raw = localStorage.getItem(CONFIG.LOCAL_STORAGE_CATEGORIES_KEY);
  let categories = [];
  if (raw) {
    try { categories = JSON.parse(raw); } catch (e) {}
  }
  if (!categories || categories.length === 0) {
    categories = await loadSeedData('/data/categories.json', CONFIG.LOCAL_STORAGE_CATEGORIES_KEY);
  }

  const sb = getSupabase();
  if (sb) {
    try {
      let query = sb.from('categories').select('*').order('sort_order', { ascending: true });
      if (options.activeOnly) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        categories = data;
        localStorage.setItem(CONFIG.LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
      }
    } catch (err) {
      console.warn('Supabase categories fetch failed, using cache', err);
    }
  }

  if (options.activeOnly) {
    return categories.filter(c => c.is_active !== false).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }
  return categories.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

/**
 * Save / Update Category
 */
export async function saveCategory(categoryData) {
  const categories = await getCategories({ activeOnly: false });
  let saved;

  if (categoryData.id) {
    const idx = categories.findIndex(c => c.id === categoryData.id);
    if (idx !== -1) {
      saved = { ...categories[idx], ...categoryData, updated_at: new Date().toISOString() };
      categories[idx] = saved;
    }
  } else {
    saved = {
      id: 'cat-' + Date.now(),
      name: categoryData.name,
      slug: categoryData.slug || generateSlug(categoryData.name),
      description: categoryData.description || '',
      sort_order: Number(categoryData.sort_order) || categories.length + 1,
      is_active: categoryData.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    categories.push(saved);
  }

  localStorage.setItem(CONFIG.LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('categories').upsert(saved);
    } catch (e) {
      console.warn('Supabase save category error', e);
    }
  }
  return saved;
}

/**
 * Delete Category (Checks if any project is currently using it)
 */
export async function deleteCategory(id) {
  const projects = await getProjects({ includeNonPublished: true });
  const inUse = projects.some(p => p.category_id === id || p.category === id);
  if (inUse) {
    throw new Error('ไม่สามารถลบ Category นี้ได้ เนื่องจากยังมี Project ใช้งานอยู่');
  }

  let categories = await getCategories({ activeOnly: false });
  categories = categories.filter(c => c.id !== id);
  localStorage.setItem(CONFIG.LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('categories').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete category error', e);
    }
  }
  return true;
}

/**
 * Fetch Projects with filtering, search and sorting
 */
export async function getProjects(options = {}) {
  const {
    status = 'published',
    category = null,
    search = '',
    type = null,
    priceRange = null,
    statusFilter = null,
    sort = 'recommended',
    featuredOnly = false,
    includeNonPublished = false,
    limit = null
  } = options;

  let raw = localStorage.getItem(CONFIG.LOCAL_STORAGE_PROJECTS_KEY);
  let projects = [];
  if (raw) {
    try { projects = JSON.parse(raw); } catch (e) {}
  }
  if (!projects || projects.length === 0) {
    projects = await loadSeedData('/data/projects.json', CONFIG.LOCAL_STORAGE_PROJECTS_KEY);
  }

  const sb = getSupabase();
  if (sb) {
    try {
      let q = sb.from('projects').select('*');
      if (!includeNonPublished) {
        q = q.in('status', ['published', 'coming_soon']);
      }
      const { data, error } = await q;
      if (!error && Array.isArray(data)) {
        projects = data;
        localStorage.setItem(CONFIG.LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));
      }
    } catch (e) {
      console.warn('Supabase getProjects error, using local data', e);
    }
  }

  // 1. Filter Status
  let filtered = projects.filter(p => {
    if (includeNonPublished) {
      // In Admin, show everything except hard-deleted
      if (statusFilter && statusFilter !== 'all') {
        return p.status === statusFilter;
      }
      return p.status !== 'archived'; // Default admin view excludes archived unless specified
    }
    // Public view: only 'published' and 'coming_soon'
    if (statusFilter && statusFilter !== 'all') {
      return p.status === statusFilter;
    }
    return p.status === 'published' || p.status === 'coming_soon';
  });

  // 2. Featured only
  if (featuredOnly) {
    filtered = filtered.filter(p => p.is_featured === true && p.status === 'published');
  }

  // 3. Category Filter
  if (category && category !== 'All' && category !== 'all') {
    filtered = filtered.filter(p =>
      (p.category && p.category.toLowerCase() === category.toLowerCase()) ||
      (p.category_id && p.category_id.toLowerCase() === category.toLowerCase()) ||
      (p.slug && p.slug.toLowerCase() === category.toLowerCase())
    );
  }

  // 4. Project Type Filter
  if (type && type !== 'all') {
    filtered = filtered.filter(p => p.project_type && p.project_type.toLowerCase() === type.toLowerCase());
  }

  // 5. Price Range Filter
  if (priceRange) {
    filtered = filtered.filter(p => {
      const price = p.sale_price !== null && p.sale_price !== undefined ? p.sale_price : p.regular_price;
      if (priceRange === 'under_2000') return price < 2000;
      if (priceRange === '2000_5000') return price >= 2000 && price <= 5000;
      if (priceRange === 'over_5000') return price > 5000;
      return true;
    });
  }

  // 6. Search Filter (Project Name, Code, Category, Keyword, Description, Suitable For)
  if (search && search.trim() !== '') {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(p => {
      const name = (p.name || '').toLowerCase();
      const code = (p.code || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const shortDesc = (p.short_description || '').toLowerCase();
      const fullDesc = (p.full_description || '').toLowerCase();
      const suitable = Array.isArray(p.suitable_for) ? p.suitable_for.join(' ').toLowerCase() : '';
      const techs = Array.isArray(p.technologies) ? p.technologies.join(' ').toLowerCase() : '';

      return name.includes(q) ||
             code.includes(q) ||
             cat.includes(q) ||
             shortDesc.includes(q) ||
             fullDesc.includes(q) ||
             suitable.includes(q) ||
             techs.includes(q);
    });
  }

  // 7. Sorting
  filtered.sort((a, b) => {
    const priceA = a.sale_price !== null && a.sale_price !== undefined ? a.sale_price : a.regular_price;
    const priceB = b.sale_price !== null && b.sale_price !== undefined ? b.sale_price : b.regular_price;

    if (sort === 'price_asc') {
      return priceA - priceB;
    }
    if (sort === 'price_desc') {
      return priceB - priceA;
    }
    if (sort === 'newest') {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }
    if (sort === 'popular') {
      // Sort by badge or order
      const weightA = a.badge === 'Best Seller' || a.badge === 'Popular' ? 2 : 1;
      const weightB = b.badge === 'Best Seller' || b.badge === 'Popular' ? 2 : 1;
      return weightB - weightA || (a.sort_order || 99) - (b.sort_order || 99);
    }
    // Default 'recommended'
    if (a.is_featured !== b.is_featured) {
      return a.is_featured ? -1 : 1;
    }
    return (a.sort_order || 99) - (b.sort_order || 99);
  });

  if (limit && limit > 0) {
    return filtered.slice(0, limit);
  }

  return filtered;
}

/**
 * Get single project by slug
 */
export async function getProjectBySlug(slug) {
  if (!slug) return null;
  const projects = await getProjects({ includeNonPublished: true });
  return projects.find(p => p.slug === slug) || null;
}

/**
 * Get single project by ID
 */
export async function getProjectById(id) {
  if (!id) return null;
  const projects = await getProjects({ includeNonPublished: true });
  return projects.find(p => p.id === id) || null;
}

/**
 * Get Similar Projects (Same category or type, excluding current)
 * Requirement #28
 */
export async function getSimilarProjects(currentProject, limit = 3) {
  if (!currentProject) return [];
  const all = await getProjects({ status: 'published' });
  const similar = all.filter(p =>
    p.id !== currentProject.id &&
    (p.category_id === currentProject.category_id ||
     p.category === currentProject.category ||
     p.project_type === currentProject.project_type)
  );

  if (similar.length < limit) {
    // If fewer than limit, fill with other published projects
    const others = all.filter(p => p.id !== currentProject.id && !similar.some(s => s.id === p.id));
    return [...similar, ...others].slice(0, limit);
  }
  return similar.slice(0, limit);
}

/**
 * Save Project (Create or Update)
 */
export async function saveProject(projectData) {
  let raw = localStorage.getItem(CONFIG.LOCAL_STORAGE_PROJECTS_KEY);
  let projects = raw ? JSON.parse(raw) : [];

  let saved;
  const now = new Date().toISOString();

  if (projectData.id) {
    const idx = projects.findIndex(p => p.id === projectData.id);
    if (idx !== -1) {
      saved = {
        ...projects[idx],
        ...projectData,
        updated_at: now
      };
      projects[idx] = saved;
    } else {
      saved = { ...projectData, updated_at: now };
      projects.push(saved);
    }
  } else {
    // Auto-generate code & slug if missing
    const code = projectData.code || generateNextCode(projects);
    const slug = projectData.slug || generateSlug(projectData.name);
    saved = {
      ...projectData,
      id: 'proj-' + Date.now(),
      code,
      slug,
      created_at: now,
      updated_at: now,
      status: projectData.status || 'draft'
    };
    projects.push(saved);
  }

  localStorage.setItem(CONFIG.LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('projects').upsert(saved);
    } catch (e) {
      console.warn('Supabase save project error', e);
    }
  }

  return saved;
}

/**
 * Duplicate a Project (Requirement #96)
 */
export async function duplicateProject(id) {
  const original = await getProjectById(id);
  if (!original) throw new Error('Project not found');

  const raw = localStorage.getItem(CONFIG.LOCAL_STORAGE_PROJECTS_KEY);
  const projects = raw ? JSON.parse(raw) : [];

  const newCode = generateNextCode(projects);
  const newSlug = generateSlug(`${original.slug}-copy-${Date.now().toString().slice(-4)}`);

  const cloned = {
    ...original,
    id: 'proj-' + Date.now(),
    code: newCode,
    name: `${original.name} (Copy)`,
    slug: newSlug,
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  projects.push(cloned);
  localStorage.setItem(CONFIG.LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));

  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('projects').insert(cloned);
    } catch (e) {
      console.warn('Supabase duplicate project error', e);
    }
  }

  return cloned;
}

/**
 * Delete or Soft Delete Project (Requirement #76)
 */
export async function deleteProject(id, hard = false) {
  let raw = localStorage.getItem(CONFIG.LOCAL_STORAGE_PROJECTS_KEY);
  let projects = raw ? JSON.parse(raw) : [];

  if (hard) {
    projects = projects.filter(p => p.id !== id);
  } else {
    // Soft delete / archive
    const idx = projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      projects[idx].status = 'archived';
      projects[idx].updated_at = new Date().toISOString();
    }
  }

  localStorage.setItem(CONFIG.LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));

  const sb = getSupabase();
  if (sb) {
    try {
      if (hard) {
        await sb.from('projects').delete().eq('id', id);
      } else {
        await sb.from('projects').update({ status: 'archived', updated_at: new Date().toISOString() }).eq('id', id);
      }
    } catch (e) {
      console.warn('Supabase delete project error', e);
    }
  }

  return true;
}

/**
 * Upload Image (Supabase Storage bucket 'project-images' or Base64 / Blob fallback)
 * Requirement #48, #91
 */
export async function uploadImage(file, folder = 'cover', projectId = 'temp') {
  const sb = getSupabase();
  const fileExt = file.name.split('.').pop() || 'webp';
  const uniqueName = `projects/${projectId}/${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  if (sb) {
    try {
      const { data, error } = await sb.storage.from('project-images').upload(uniqueName, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (!error && data) {
        const { data: publicUrlData } = sb.storage.from('project-images').getPublicUrl(uniqueName);
        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, falling back to data URL', err);
    }
  }

  // Local fallback: convert to base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.target.result);
    reader.onerror = () => reject(new Error('Failed to read image for local storage'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get Tracking Analytics for Dashboard
 */
export function getTrackingStats() {
  try {
    const raw = localStorage.getItem(CONFIG.LOCAL_STORAGE_TRACKING_KEY);
    return raw ? JSON.parse(raw) : {
      views: 142,
      demo_clicks: 86,
      copy_clicks: 43,
      contact_clicks: 39,
      line_clicks: 25,
      messenger_clicks: 10,
      phone_clicks: 4,
      projects: {},
      events_log: []
    };
  } catch (e) {
    return { views: 0, demo_clicks: 0, copy_clicks: 0, contact_clicks: 0, projects: {}, events_log: [] };
  }
}
