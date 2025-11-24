export interface GradingCriteria {
    excellent: number;
    good: number;
    satisfactory: number;
    poor: number;
}

export interface User {
    id: number;
    email: string;
    name: string;
    role: "student" | "teacher";
    isAdmin?: boolean;
    avatar?: string;
    gradingCriteria?: GradingCriteria | null;
    createdAt: string;
    updatedAt: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    initialized: boolean;
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
