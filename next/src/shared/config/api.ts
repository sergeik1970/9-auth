export const API_BASE_URL = "";

export const API_ENDPOINTS = {
    auth: {
        login: "/api/auth/login",
        register: "/api/auth/register",
        logout: "/api/auth/logout",
        me: "/api/auth/me",
    },
    tests: {
        getAll: "/api/tests",
        getById: (id: number) => `/api/tests/${id}`,
        create: "/api/tests/create",
        update: (id: number) => `/api/tests/${id}`,
        delete: (id: number) => `/api/tests/${id}`,
    },
};

export const createApiUrl = (endpoint: string): string => {
    return `${API_BASE_URL}${endpoint}`;
};
