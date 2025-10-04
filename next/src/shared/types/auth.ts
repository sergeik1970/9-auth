export interface User {
    id: number;
    email: string;
    name: string;
    isAdmin?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface AuthFormData {
    email: string;
    password: string;
    name?: string;
}

export interface RegisterUserData {
    email: string;
    password: string;
    name: string;
}

export interface LoginUserData {
    email: string;
    password: string;
}
