const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase() || '';

export const isUsageStatsConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && ADMIN_EMAIL);

const SESSION_KEY = 'room-contest-admin-session';

async function readResponse(response) {
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    const message = typeof body === 'object' && body
      ? body.msg || body.message || body.error_description || body.error
      : body;
    throw new Error(message || '요청을 처리하지 못했습니다.');
  }

  return body;
}

async function authRequest(path, body) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return readResponse(response);
}

function storeSession(session) {
  const normalized = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at || Math.floor(Date.now() / 1000) + session.expires_in,
    user: session.user,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function signInAdmin(email, password) {
  const session = await authRequest('token?grant_type=password', { email, password });
  return storeSession(session);
}

export function signOutAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
}

async function getValidSession() {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  let session;
  try {
    session = JSON.parse(stored);
  } catch {
    signOutAdmin();
    return null;
  }

  if (session.expires_at > Math.floor(Date.now() / 1000) + 30) return session;
  if (!session.refresh_token) {
    signOutAdmin();
    return null;
  }

  try {
    return await storeSession(await authRequest('token?grant_type=refresh_token', {
      refresh_token: session.refresh_token,
    }));
  } catch {
    signOutAdmin();
    return null;
  }
}

async function restRequest(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return readResponse(response);
}

export async function recordFurnitureUsage(placedItems) {
  if (!isUsageStatsConfigured) {
    throw new Error('관리자 통계 저장 설정이 아직 완료되지 않았습니다. 설정 후 다시 응모해 주세요.');
  }

  const counts = placedItems.reduce((result, item) => {
    result[item.id] = (result[item.id] || 0) + 1;
    return result;
  }, {});

  if (Object.keys(counts).length === 0) return;

  await restRequest('rpc/record_furniture_usage', {
    method: 'POST',
    body: { p_counts: counts },
  });
}

export async function loadFurnitureUsage() {
  const session = await getValidSession();
  if (!session) return { session: null, counts: [] };
  if (session.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    signOutAdmin();
    throw new Error('관리자 계정으로 로그인해 주세요.');
  }

  const counts = await restRequest('furniture_counts?select=item_id,item_name,total&order=item_name.asc', {
    token: session.access_token,
  });
  return { session, counts };
}

export async function resetFurnitureUsage() {
  const session = await getValidSession();
  if (!session || session.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    signOutAdmin();
    throw new Error('관리자 계정으로 다시 로그인해 주세요.');
  }

  await restRequest('rpc/reset_furniture_counts', {
    token: session.access_token,
    method: 'POST',
    body: {},
  });
}
