export type UserRole = "student" | "teacher" | "admin";

export const isTeacher = (role: UserRole): boolean => {
    return role === "teacher";
};

export const isStudent = (role: UserRole): boolean => {
    return role === "student";
};

export const isAdmin = (role: UserRole): boolean => {
    return role === "admin";
};

export const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
        case "student":
            return "Ученик";
        case "teacher":
            return "Учитель";
        case "admin":
            return "Администратор";
        default:
            return "Неизвестная роль";
    }
};

export const getDashboardTitle = (role: UserRole): string => {
    if (isAdmin(role)) {
        return "Административная панель";
    }
    if (isTeacher(role)) {
        return "Панель учителя";
    }
    return "Панель ученика";
};
