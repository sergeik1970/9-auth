import React, { useState, useEffect, ReactElement } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import LoadingState from "@/shared/components/LoadingState";
import Modal from "@/shared/components/Modal";
import { User } from "@/shared/types/auth";
import styles from "./user-detail.module.scss";

const AdminUserDetailPage = (): ReactElement => {
    const router = useRouter();
    const { id } = router.query;
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        if (!id) return;
        loadUser();
    }, [id]);

    const loadUser = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/admin/users/${id}`);
            if (!response.ok) {
                throw new Error("Failed to load user");
            }
            const data = await response.json();
            setUser(data);
            setFormData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numericFields = ["classNumber", "regionId", "schoolId", "settlementId"];
        setFormData({
            ...formData,
            [name]: numericFields.includes(name) ? (value ? parseInt(value) : undefined) : value,
        });
    };

    const handleSave = async () => {
        if (!id) return;

        try {
            setIsSaving(true);
            setError(null);
            const response = await fetch(`/api/admin/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update user");
            }

            const updated = await response.json();
            setUser(updated);
            setFormData(updated);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;

        try {
            setIsSaving(true);
            const response = await fetch(`/api/admin/users/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to delete user");
            }

            router.push("/admin/users");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <LoadingState message="Загрузка пользователя..." />
            </DashboardLayout>
        );
    }

    if (!user) {
        return (
            <DashboardLayout>
                <div className={styles.error}>Пользователь не найден</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        ← Назад
                    </button>
                    <h1>Редактирование пользователя</h1>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ""}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Имя</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name || ""}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Фамилия</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName || ""}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Отчество</label>
                        <input
                            type="text"
                            name="patronymic"
                            value={formData.patronymic || ""}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Роль</label>
                        <select
                            name="role"
                            value={formData.role || ""}
                            onChange={handleInputChange}
                        >
                            <option value="student">Ученик</option>
                            <option value="teacher">Учитель</option>
                            <option value="admin">Администратор</option>
                        </select>
                    </div>

                    {formData.role === "student" && (
                        <>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Номер класса</label>
                                    <input
                                        type="number"
                                        name="classNumber"
                                        value={formData.classNumber || ""}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Буква класса</label>
                                    <input
                                        type="text"
                                        name="classLetter"
                                        maxLength={1}
                                        value={formData.classLetter || ""}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>ID Региона</label>
                            <input
                                type="number"
                                name="regionId"
                                value={formData.regionId || ""}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>ID Школы</label>
                            <input
                                type="number"
                                name="schoolId"
                                value={formData.schoolId || ""}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Кастомное учебное заведение</label>
                        <input
                            type="text"
                            name="educationalInstitutionCustom"
                            value={formData.educationalInstitutionCustom || ""}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button onClick={handleSave} disabled={isSaving} variant="primary">
                        {isSaving ? "Сохранение..." : "Сохранить"}
                    </Button>
                    <Button
                        onClick={() => setIsDeleteModalOpen(true)}
                        disabled={isSaving}
                        variant="outline"
                        style={{ color: "#ef4444" }}
                    >
                        Удалить
                    </Button>
                </div>

                <div
                    style={{
                        marginTop: "32px",
                        paddingTop: "32px",
                        borderTop: "1px solid #e5e7eb",
                    }}
                >
                    <h2 style={{ marginBottom: "16px", fontSize: "20px", fontWeight: 600 }}>
                        Информация о пользователе
                    </h2>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: "24px",
                        }}
                    >
                        <div>
                            <p
                                style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    fontWeight: 500,
                                    marginBottom: "4px",
                                }}
                            >
                                ID Региона
                            </p>
                            <p style={{ fontSize: "16px", color: "#1f2937", fontWeight: 500 }}>
                                {(user as any).regionId || "-"}
                            </p>
                        </div>
                        <div>
                            <p
                                style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    fontWeight: 500,
                                    marginBottom: "4px",
                                }}
                            >
                                Регион
                            </p>
                            <p style={{ fontSize: "16px", color: "#1f2937", fontWeight: 500 }}>
                                {(user as any).regionName || "-"}
                            </p>
                        </div>
                        <div>
                            <p
                                style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    fontWeight: 500,
                                    marginBottom: "4px",
                                }}
                            >
                                Школа
                            </p>
                            <p style={{ fontSize: "16px", color: "#1f2937", fontWeight: 500 }}>
                                {(user as any).schoolName || "-"}
                            </p>
                        </div>
                        <div>
                            <p
                                style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    fontWeight: 500,
                                    marginBottom: "4px",
                                }}
                            >
                                Пройдено тестов
                            </p>
                            <p style={{ fontSize: "16px", color: "#1f2937", fontWeight: 500 }}>
                                {(user as any).completedTests || 0}
                            </p>
                        </div>
                        <div>
                            <p
                                style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    fontWeight: 500,
                                    marginBottom: "4px",
                                }}
                            >
                                Всего попыток
                            </p>
                            <p style={{ fontSize: "16px", color: "#1f2937", fontWeight: 500 }}>
                                {(user as any).totalAttempts || 0}
                            </p>
                        </div>
                        <div>
                            <p
                                style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    fontWeight: 500,
                                    marginBottom: "4px",
                                }}
                            >
                                Дата регистрации
                            </p>
                            <p style={{ fontSize: "14px", color: "#1f2937" }}>
                                {new Date((user as any).createdAt).toLocaleDateString("ru-RU", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                        <div>
                            <p
                                style={{
                                    fontSize: "12px",
                                    color: "#6b7280",
                                    fontWeight: 500,
                                    marginBottom: "4px",
                                }}
                            >
                                Последнее изменение
                            </p>
                            <p style={{ fontSize: "14px", color: "#1f2937" }}>
                                {new Date((user as any).updatedAt).toLocaleDateString("ru-RU", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {user.role === "teacher" && (
                    <div className={styles.testsSection}>
                        <h2>Тесты учителя</h2>
                        <p>Учитель создал {user.id} тестов</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onCancel={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Подтверждение удаления"
                message="Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить."
                cancelText="Отмена"
                confirmText={isSaving ? "Удаление..." : "Удалить"}
            />
        </DashboardLayout>
    );
};

export default AdminUserDetailPage;
