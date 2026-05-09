const API_BASE_URL = '/api';

export const request = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    try {
        const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') window.location.href = '/login';
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'API request failed');
        return data;
    } catch (error) {
        console.error('API error:', error);
        throw error;
    }
};

export const AuthAPI = {
    login: (credentials) => request('/login', { method: 'POST', body: JSON.stringify(credentials) }),
    getProfile: () => request('/profile'),
    updateProfile: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) })
};

export const StatsAPI = {
    getOverview: () => request('/stats/overview'),
    getPersonal: () => request('/stats/personal'),
    getInterviewViz: () => request('/stats/interview-viz')
};

export const InvitationAPI = {
    list: () => request('/invitations'),
    create: (data) => request('/invitations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request('/invitations/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request('/invitations/' + id, { method: 'DELETE' })
};

export const JobAPI = {
    list: () => request('/jobs'),
    create: (data) => request('/jobs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request('/jobs/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request('/jobs/' + id, { method: 'DELETE' })
};

export const MessageAPI = {
    list: () => request('/messages'),
    create: (data) => request('/messages', { method: 'POST', body: JSON.stringify(data) }),
    markRead: (id) => request('/messages/read/' + id, { method: 'POST' }),
    delete: (id) => request('/messages/' + id, { method: 'DELETE' })
};

export const MemoAPI = {
    list: () => request('/memos'),
    create: (data) => request('/memos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request('/memos/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request('/memos/' + id, { method: 'DELETE' })
};

export const FavoriteAPI = {
    list: () => request('/favorites'),
    create: (data) => request('/favorites', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request('/favorites/' + id, { method: 'DELETE' })
};

export const InterviewAPI = {
    list: () => request('/interviews'),
    create: (data) => request('/interviews', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request('/interviews/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request('/interviews/' + id, { method: 'DELETE' })
};

export const OrgAPI = {
    getDepartments: () => request('/departments'),
    getEmployees: () => request('/employees'),
    updateEmployee: (id, data) => request('/employees/' + id, { method: 'PUT', body: JSON.stringify(data) })
};
