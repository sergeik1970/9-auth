export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

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
        getAttempts: (id: number) => `/api/tests/${id}/attempts`,
    },
    admin: {
        regions: "/api/admin/regions",
        regionSettlements: (regionId: string | number) => `/api/admin/regions/${regionId}/settlements`,
        settlements: "/api/admin/settlements",
        schools: "/api/admin/schools",
        schoolById: (id: string | number) => `/api/admin/schools/${id}`,
        users: "/api/admin/users",
        userById: (id: string | number) => `/api/admin/users/${id}`,
        settlementSchools: (settlementId: string | number) => `/api/admin/settlements/${settlementId}/schools`,
    },
};

export const createApiUrl = (endpoint: string): string => {
    return `${API_BASE_URL}${endpoint}`;
};
