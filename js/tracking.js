/**
 * ThinkFaster Central Tracking & Analytics Layer
 * Manages Google Tag Manager, GA4, Meta Pixel, and Local Engagement Metrics
 */
import { CONFIG } from './config.js';

// Initialize dataLayer
window.dataLayer = window.dataLayer || [];

/**
 * Log local engagement count for Admin Analytics Dashboard
 */
function recordLocalStat(eventName, data = {}) {
  try {
    const raw = localStorage.getItem(CONFIG.LOCAL_STORAGE_TRACKING_KEY);
    const stats = raw ? JSON.parse(raw) : {
      views: 0,
      demo_clicks: 0,
      copy_clicks: 0,
      contact_clicks: 0,
      line_clicks: 0,
      messenger_clicks: 0,
      phone_clicks: 0,
      projects: {},
      events_log: []
    };

    if (!stats.projects) stats.projects = {};

    const projectKey = data.project_code || data.code || data.project_id;
    if (projectKey) {
      if (!stats.projects[projectKey]) {
        stats.projects[projectKey] = {
          name: data.project_name || '',
          views: 0,
          demo: 0,
          copy: 0,
          contacts: 0
        };
      }
      if (data.project_name && !stats.projects[projectKey].name) {
        stats.projects[projectKey].name = data.project_name;
      }
    }

    if (eventName === 'view_project') {
      stats.views += 1;
      if (projectKey) stats.projects[projectKey].views = (stats.projects[projectKey].views || 0) + 1;
    } else if (eventName === 'click_demo') {
      stats.demo_clicks += 1;
      if (projectKey) stats.projects[projectKey].demo = (stats.projects[projectKey].demo || 0) + 1;
    } else if (eventName === 'copy_project') {
      stats.copy_clicks += 1;
      if (projectKey) stats.projects[projectKey].copy = (stats.projects[projectKey].copy || 0) + 1;
    } else if (eventName === 'click_line' || eventName === 'click_messenger' || eventName === 'click_phone' || eventName === 'click_contact_sticky') {
      stats.contact_clicks += 1;
      if (eventName === 'click_line') stats.line_clicks = (stats.line_clicks || 0) + 1;
      if (eventName === 'click_messenger') stats.messenger_clicks = (stats.messenger_clicks || 0) + 1;
      if (eventName === 'click_phone') stats.phone_clicks = (stats.phone_clicks || 0) + 1;
      if (projectKey) stats.projects[projectKey].contacts = (stats.projects[projectKey].contacts || 0) + 1;
    }

    // Keep last 50 events in log
    stats.events_log.unshift({
      event: eventName,
      data: data,
      timestamp: new Date().toISOString()
    });
    if (stats.events_log.length > 50) {
      stats.events_log = stats.events_log.slice(0, 50);
    }

    localStorage.setItem(CONFIG.LOCAL_STORAGE_TRACKING_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to record local tracking stat', e);
  }
}

/**
 * Central event tracking function
 * Requirement #54, #55
 */
export function trackEvent(eventName, data = {}) {
  // 1. Google Tag Manager / dataLayer
  window.dataLayer.push({
    event: eventName,
    ...data,
    timestamp: new Date().toISOString()
  });

  // 2. Meta Pixel
  if (window.fbq && typeof window.fbq === 'function') {
    if (eventName === 'view_project') {
      window.fbq('track', 'ViewContent', {
        content_name: data.project_name,
        content_category: data.category,
        content_ids: [data.project_code || data.project_id],
        value: data.price || 0,
        currency: 'THB'
      });
    } else if (eventName === 'click_line' || eventName === 'click_messenger' || eventName === 'click_phone') {
      window.fbq('track', 'Contact', {
        content_name: data.project_name || 'General Inquiry',
        channel: eventName.replace('click_', ''),
        value: data.price || 0,
        currency: 'THB'
      });
    } else if (eventName === 'copy_project') {
      window.fbq('track', 'Lead', {
        content_name: data.project_name,
        content_ids: [data.project_code],
        value: data.price || 0,
        currency: 'THB'
      });
    } else {
      window.fbq('trackCustom', eventName, data);
    }
  }

  // 3. TikTok Pixel
  if (window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track(eventName, data);
  }

  // 4. Record local stats for Admin view
  recordLocalStat(eventName, data);

  // Debug logging
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log(`[Tracking Event] ${eventName}:`, data);
  }
}

/**
 * Initialize dynamic scripts for GTM, GA4, Meta Pixel if settings provided
 */
export function initTracking(trackingSettings = {}) {
  if (!trackingSettings) return;

  // GTM
  if (trackingSettings.gtm_id && !document.getElementById('gtm-script')) {
    const gtmScript = document.createElement('script');
    gtmScript.id = 'gtm-script';
    gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${trackingSettings.gtm_id}');`;
    document.head.appendChild(gtmScript);
  }

  // GA4 directly if enabled
  if (trackingSettings.enable_ga4 && trackingSettings.ga4_id && !document.getElementById('ga4-script')) {
    const ga4Script = document.createElement('script');
    ga4Script.id = 'ga4-script';
    ga4Script.async = true;
    ga4Script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingSettings.ga4_id}`;
    document.head.appendChild(ga4Script);

    const ga4Config = document.createElement('script');
    ga4Config.innerHTML = `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingSettings.ga4_id}');`;
    document.head.appendChild(ga4Config);
  }
}
