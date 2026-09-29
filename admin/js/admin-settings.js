/**
 * ThinkFaster Admin Website Settings Controller
 * Requirements #51, #52, #53
 */
import { getSettings, updateSettings } from '../../js/api.js';
import { showToast } from '../../js/utils.js';

let currentSettings = {};

export async function initAdminSettings() {
  currentSettings = await getSettings();
  populateForm(currentSettings);
  setupFormHandlers();
}

function populateForm(s = {}) {
  const g = s.general || {};
  const c = s.contacts || {};
  const t = s.tracking || {};
  const sb = s.supabase || {};

  // General
  document.getElementById('set-site-name').value = g.site_name || '';
  document.getElementById('set-tagline').value = g.site_tagline || '';
  document.getElementById('set-desc').value = g.site_description || '';
  document.getElementById('set-footer-text').value = g.footer_text || '';
  document.getElementById('set-copyright').value = g.copyright || '';

  // Contacts
  document.getElementById('set-line-id').value = c.line?.id || '';
  document.getElementById('set-line-url').value = c.line?.url || '';
  document.getElementById('set-messenger-url').value = c.messenger?.url || '';
  document.getElementById('set-phone-number').value = c.phone?.number || '';
  document.getElementById('set-phone-display').value = c.phone?.display || '';
  document.getElementById('set-email').value = c.email?.address || '';
  document.getElementById('set-business-hours').value = c.business_hours || '';

  // Order Template
  document.getElementById('set-order-template').value = s.order_template || "Code: {{project_code}}\nProject Name: {{project_name}}\nราคา: {{price}} บาท\nDemo: {{demo_url}}\n\nสนใจสั่งซื้อระบบนี้ครับ/ค่ะ";

  // Tracking
  document.getElementById('set-gtm-id').value = t.gtm_id || '';
  document.getElementById('set-ga4-id').value = t.ga4_id || '';
  document.getElementById('set-meta-id').value = t.meta_pixel_id || '';
  document.getElementById('set-tiktok-id').value = t.tiktok_pixel_id || '';

  // Supabase
  document.getElementById('set-sb-url').value = sb.url || '';
  document.getElementById('set-sb-key').value = sb.anon_key || '';
}

function setupFormHandlers() {
  const form = document.getElementById('settings-form');
  const btnTestSb = document.getElementById('btn-test-supabase');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const updated = {
      general: {
        site_name: document.getElementById('set-site-name').value.trim(),
        site_tagline: document.getElementById('set-tagline').value.trim(),
        site_description: document.getElementById('set-desc').value.trim(),
        footer_text: document.getElementById('set-footer-text').value.trim(),
        copyright: document.getElementById('set-copyright').value.trim()
      },
      contacts: {
        line: {
          enabled: true,
          id: document.getElementById('set-line-id').value.trim(),
          url: document.getElementById('set-line-url').value.trim()
        },
        messenger: {
          enabled: true,
          url: document.getElementById('set-messenger-url').value.trim()
        },
        phone: {
          enabled: true,
          number: document.getElementById('set-phone-number').value.trim(),
          display: document.getElementById('set-phone-display').value.trim()
        },
        email: {
          enabled: true,
          address: document.getElementById('set-email').value.trim()
        },
        business_hours: document.getElementById('set-business-hours').value.trim()
      },
      order_template: document.getElementById('set-order-template').value,
      tracking: {
        gtm_id: document.getElementById('set-gtm-id').value.trim(),
        ga4_id: document.getElementById('set-ga4-id').value.trim(),
        meta_pixel_id: document.getElementById('set-meta-id').value.trim(),
        tiktok_pixel_id: document.getElementById('set-tiktok-id').value.trim()
      },
      supabase: {
        url: document.getElementById('set-sb-url').value.trim(),
        anon_key: document.getElementById('set-sb-key').value.trim()
      }
    };

    try {
      await updateSettings(updated);
      showToast('บันทึกการตั้งค่าทั้งหมดเรียบร้อย ✓', 'success');
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า', 'error');
    }
  });

  // Test Supabase connection
  btnTestSb?.addEventListener('click', async () => {
    const url = document.getElementById('set-sb-url').value.trim();
    const key = document.getElementById('set-sb-key').value.trim();

    if (!url || !key) {
      showToast('กรุณากรอก Supabase URL และ Anon Key ก่อนทดสอบ', 'warning');
      return;
    }

    if (!window.supabase) {
      showToast('ไม่พบ Supabase Client library', 'error');
      return;
    }

    try {
      showToast('กำลังเชื่อมต่อ Supabase...', 'info');
      const client = window.supabase.createClient(url, key);
      const { data, error } = await client.from('categories').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      showToast('เชื่อมต่อ Supabase สำเร็จเรียบร้อย! 🎉', 'success');
    } catch (err) {
      showToast('เชื่อมต่อไม่สำเร็จ: ' + (err.message || 'โปรดตรวจสอบ URL และ Key'), 'error');
    }
  });
}
