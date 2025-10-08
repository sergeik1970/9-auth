export type UserRole = "student" | "teacher";

export const isTeacher = (role: UserRole): boolean => {
    return role === "teacher";
};

export const isStudent = (role: UserRole): boolean => {
    return role === "student";
};

export const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
        case "student":
            return "Ученик";
        case "teacher":
            return "Учитель";
        default:
            return "Неизвестная роль";
    }
};

export const getDashboardTitle = (role: UserRole): string => {
    if (isTeacher(role)) {
        return "Панель учителя";
    }
    return "Панель ученика";
};
