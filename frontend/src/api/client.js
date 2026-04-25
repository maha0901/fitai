const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.errors?.[0]?.msg || 'Ошибка запроса');
  }
  return data;
}

export const api = {
  auth: {
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/auth/me'),
  },
  user: {
    getFitness: () => request('/user/fitness'),
    updateFitness: (body) => request('/user/fitness', { method: 'PUT', body: JSON.stringify(body) }),
    getWeightHistory: () => request('/user/weight-history'),
    addWeight: (weight) => request('/user/weight', { method: 'POST', body: JSON.stringify({ weight }) }),
    getWorkoutPlans: () => request('/user/workout-plans'),
  },
  ai: {
    getPlan: (message) => request('/ai-plan', { method: 'POST', body: JSON.stringify({ message: message || '' }) }),
    chat: (message) => request('/chat', { method: 'POST', body: JSON.stringify({ message }) }),
    getChatHistory: () => request('/chat-history'),
  },
  admin: {
    getStats: () => request('/admin/stats'),
    getOverview: () => request('/admin/overview'),
    getUsers: (search) => request(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    getUser: (id) => request(`/admin/users/${id}`),
    updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
    getLogs: (limit = 100) => request(`/admin/logs?limit=${limit}`),
    getActivity: (days = 14) => request(`/admin/activity?days=${days}`),
  },
};
