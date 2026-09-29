/**
 * ThinkFaster Admin Authentication & Route Guard
 * Requirement #34, #35, #75
 */
import { CONFIG } from '../../js/config.js';
import { getSupabase } from '../../js/api.js';

export function getAdminSession() {
  try {
    const raw = localStorage.getItem(CONFIG.LOCAL_STORAGE_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setAdminSession(session) {
  localStorage.setItem(CONFIG.LOCAL_STORAGE_AUTH_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  localStorage.removeItem(CONFIG.LOCAL_STORAGE_AUTH_KEY);
}

/**
 * Route protection guard: redirect to login.html if not authenticated
 */
export async function requireAuth() {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data: { session } } = await sb.auth.getSession();
      if (session) {
        setAdminSession({
          email: session.user.email,
          role: 'admin',
          source: 'supabase',
          expires_at: session.expires_at
        });
        return session;
      }
    } catch (e) {
      console.warn('Supabase auth session check failed', e);
    }
  }

  // Check local session
  const localSession = getAdminSession();
  if (!localSession) {
    window.location.href = 'login.html';
    return null;
  }

  return localSession;
}

/**
 * Logout with confirmation modal (Requirement #75)
 */
export function setupAdminLogout() {
  document.querySelectorAll('[data-admin-logout]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('คุณต้องการออกจากระบบ Admin ใช่หรือไม่?')) {
        const sb = getSupabase();
        if (sb) {
          try { sb.auth.signOut(); } catch (err) {}
        }
        clearAdminSession();
        window.location.href = 'login.html';
      }
    });
  });
}
