import React, { useState, useEffect, ReactElement } from "react";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import LoadingState from "@/shared/components/LoadingState";
import styles from "./users.module.scss";

interface Region {
    id: number;
    name: string;
    settlements?: Array<{ id: number; name: string }>;
}

const AdminRegionsPage = (): ReactElement => {
    const [regions, setRegions] = useState<Region[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/admin/regions");

            if (!response.ok) {
                throw new Error("Failed to load regions");
            }

            const data = await response.json();
            setRegions(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRegion = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError("Пожалуйста, введите название региона");
            return;
        }

        try {
            setIsCreating(true);
            setError(null);

            const response = await fetch("/api/admin/regions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: formData.name.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create region");
            }

            const newRegion = await response.json();
            setRegions([...regions, newRegion]);
            setFormData({ name: "" });
            setIsModalOpen(false);
            setSuccess("Регион успешно создан");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <LoadingState message="Загрузка регионов..." />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className={styles.container}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "24px",
                    }}
                >
                    <h1 className={styles.title}>Управление регионами</h1>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        variant="primary"
                        disabled={isCreating}
                    >
                        + Создать
                    </Button>
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {success && (
                    <div
                        style={{
                            padding: "12px 16px",
                            backgroundColor: "#d1fae5",
                            color: "#065f46",
                            borderRadius: "8px",
                            marginBottom: "16px",
                        }}
                    >
                        {success}
                    </div>
                )}

                {regions.length === 0 ? (
                    <div className={styles.empty}>Нет регионов</div>
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
                                        ID
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Название
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Кол-во поселений
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {regions.map((region, idx) => (
                                    <tr
                                        key={region.id}
                                        style={{
                                            borderBottom:
                                                idx < regions.length - 1
                                                    ? "1px solid #e5e7eb"
                                                    : "none",
                                            backgroundColor: "#ffffff",
                                        }}
                                    >
                                        <td style={{ padding: "12px", color: "#374151" }}>
                                            {region.id}
                                        </td>
                                        <td style={{ padding: "12px", color: "#374151" }}>
                                            {region.name}
                                        </td>
                                        <td style={{ padding: "12px", color: "#374151" }}>
                                            {region.settlements?.length || 0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {isModalOpen && (
                    <div
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1000,
                        }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div
                            style={{
                                backgroundColor: "white",
                                borderRadius: "8px",
                                padding: "24px",
                                maxWidth: "500px",
                                width: "100%",
                                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2
                                style={{
                                    fontSize: "20px",
                                    fontWeight: 600,
                                    marginBottom: "16px",
                                }}
                            >
                                Создать регион
                            </h2>

                            <form onSubmit={handleCreateRegion}>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "16px",
                                    }}
                                >
                                    <div>
                                        <label
                                            style={{
                                                display: "block",
                                                marginBottom: "8px",
                                                fontWeight: 500,
                                                color: "#374151",
                                            }}
                                        >
                                            Название
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    name: e.target.value,
                                                })
                                            }
                                            placeholder="Введите название региона"
                                            style={{
                                                width: "100%",
                                                padding: "8px 12px",
                                                border: "1px solid #d1d5db",
                                                borderRadius: "6px",
                                                fontSize: "14px",
                                                boxSizing: "border-box",
                                            }}
                                        />
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "12px",
                                            justifyContent: "flex-end",
                                            marginTop: "8px",
                                        }}
                                    >
                                        <Button
                                            variant="secondary"
                                            onClick={() => {
                                                setIsModalOpen(false);
                                                setFormData({ name: "" });
                                                setError(null);
                                            }}
                                            disabled={isCreating}
                                            type="button"
                                        >
                                            Отмена
                                        </Button>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={isCreating}
                                        >
                                            {isCreating ? "Создание..." : "Создать"}
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminRegionsPage;
