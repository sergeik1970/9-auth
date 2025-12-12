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
    lastName?: string;
    patronymic?: string;
    regionId?: number;
    settlementId?: number;
    schoolId?: number;
    educationalInstitutionCustom?: string;
    classNumber?: number;
    classLetter?: string;
    role: "student" | "teacher" | "admin";
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
    lastName?: string;
    patronymic?: string;
    region?: string;
    settlement?: string;
    educationalInstitution?: string;
    classNumber?: string;
    classLetter?: string;
    role?: "student" | "teacher" | "admin";
    confirmPassword?: string;
    regionId?: number;
    settlementId?: number;
    schoolId?: number;
    educationalInstitutionCustom?: string;
}

export interface RegisterUserData {
    email: string;
    password: string;
    name: string;
    lastName: string;
    patronymic?: string;
    regionId?: number;
    settlementId?: number;
    schoolId?: number;
    educationalInstitutionCustom?: string;
    classNumber?: number;
    classLetter?: string;
    role: "student" | "teacher" | "admin";
}

export interface LoginUserData {
    email: string;
    password: string;
}
