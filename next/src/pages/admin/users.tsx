import React, { useState, useEffect, ReactElement } from "react";
import DashboardLayout from "@/shared/components/DashboardLayout";
import { useRouter } from "next/router";
import LoadingState from "@/shared/components/LoadingState";
import styles from "./users.module.scss";

interface AdminUser {
    id: number;
    email: string;
    name: string;
    lastName?: string;
    patronymic?: string;
    role: "student" | "teacher" | "admin";
    classNumber?: number;
    classLetter?: string;
    regionId?: number;
    regionName?: string;
    schoolId?: number;
    schoolName?: string;
    completedTests: number;
    totalAttempts: number;
    createdAt: string;
    updatedAt: string;
}

const AdminUsersPage = (): ReactElement => {
    const router = useRouter();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/admin/users");
            if (!response.ok) {
                throw new Error("Failed to load users");
            }
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserClick = (userId: number) => {
        router.push(`/admin/users/${userId}`);
    };

    const getFullName = (user: AdminUser) => {
        const parts = [user.name];
        if (user.lastName) parts.unshift(user.lastName);
        if (user.patronymic) parts.push(user.patronymic);
        return parts.join(" ");
    };

    const getClassString = (user: AdminUser) => {
        if (user.role === "teacher" || user.role === "admin") return "-";
        if (user.classNumber && user.classLetter) {
            return `${user.classNumber}${user.classLetter}`;
        }
        return "-";
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <LoadingState message="Загрузка пользователей..." />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className={styles.container}>
                <h1 className={styles.title}>Управление пользователями</h1>

                {error && <div className={styles.error}>Ошибка: {error}</div>}

                {users.length === 0 ? (
                    <div className={styles.empty}>Нет пользователей</div>
                ) : (
                    <div
                        style={{
                            overflowX: "auto",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: "14px",
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        backgroundColor: "#f9fafb",
                                        borderBottom: "1px solid #e5e7eb",
                                    }}
                                >
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        ФИО
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Email
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Роль
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Класс
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Регион ID
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Регион
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Школа
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "center",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Пройдено тестов
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "center",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Всего попыток
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Дата регистрации
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Последнее изменение
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, idx) => (
                                    <tr
                                        key={user.id}
                                        style={{
                                            borderBottom:
                                                idx < users.length - 1
                                                    ? "1px solid #e5e7eb"
                                                    : "none",
                                            backgroundColor: "#ffffff",
                                            cursor: "pointer",
                                            transition: "background-color 0.2s",
                                        }}
                                        onClick={() => handleUserClick(user.id)}
                                        onMouseEnter={(e) => {
                                            (
                                                e.currentTarget as HTMLTableRowElement
                                            ).style.backgroundColor = "#f3f4f6";
                                        }}
                                        onMouseLeave={(e) => {
                                            (
                                                e.currentTarget as HTMLTableRowElement
                                            ).style.backgroundColor = "#ffffff";
                                        }}
                                    >
                                        <td style={{ padding: "12px", color: "#374151" }}>
                                            {getFullName(user)}
                                        </td>
                                        <td style={{ padding: "12px", color: "#374151" }}>
                                            {user.email}
                                        </td>
                                        <td style={{ padding: "12px", color: "#374151" }}>
                                            {user.role === "teacher" && "Учитель"}
                                            {user.role === "student" && "Ученик"}
                                            {user.role === "admin" && "Администратор"}
                                        </td>
                                        <td style={{ padding: "12px", color: "#374151" }}>
                                            {getClassString(user)}
                                        </td>
                                        <td style={{ padding: "12px", color: "#374151" }}>
                                            {user.regionId || "-"}
                                        </td>
                                        <td style={{ padding: "12px", color: "#374151" }}>
                                            {user.regionName || "-"}
                                        </td>
                                        <td style={{ padding: "12px", color: "#374151" }}>
                                            {user.schoolName || "-"}
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px",
                                                textAlign: "center",
                                                color: "#374151",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {user.completedTests}
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px",
                                                textAlign: "center",
                                                color: "#374151",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {user.totalAttempts}
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px",
                                                color: "#374151",
                                                fontSize: "13px",
                                            }}
                                        >
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px",
                                                color: "#374151",
                                                fontSize: "13px",
                                            }}
                                        >
                                            {formatDate(user.updatedAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminUsersPage;
