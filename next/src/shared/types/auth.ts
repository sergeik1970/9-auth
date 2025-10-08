export interface User {
    id: number;
    email: string;
    name: string;
    role: "student" | "teacher";
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
    role?: "student" | "teacher";
    confirmPassword?: string;
}

export interface RegisterUserData {
    email: string;
    password: string;
    name: string;
    role: "student" | "teacher";
}

export interface LoginUserData {
    email: string;
    password: string;
}
