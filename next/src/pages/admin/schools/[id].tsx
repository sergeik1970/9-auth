import React, { useState, useEffect, ReactElement } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import LoadingState from "@/shared/components/LoadingState";
import styles from "../users/user-detail.module.scss";

interface Region {
    id: number;
    name: string;
}

interface Settlement {
    id: number;
    name: string;
    regionId: number;
}

interface School {
    id: number;
    name: string;
    settlementId: number;
    settlement?: Settlement;
}

const AdminSchoolDetailPage = (): ReactElement => {
    const router = useRouter();
    const { id } = router.query;
    const [school, setSchool] = useState<School | null>(null);
    const [regions, setRegions] = useState<Region[]>([]);
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<School> & { regionId?: number }>({});

    useEffect(() => {
        if (!id) return;
        loadData();
    }, [id]);

    useEffect(() => {
        if (formData.regionId) {
            loadSettlementsByRegion(formData.regionId);
        } else {
            setSettlements([]);
        }
    }, [formData.regionId]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [schoolRes, regionsRes, settlementsRes] = await Promise.all([
                fetch(`/api/admin/schools/${id}`),
                fetch("/api/admin/regions"),
                fetch("/api/admin/settlements"),
            ]);

            if (!schoolRes.ok || !regionsRes.ok || !settlementsRes.ok) {
                throw new Error("Failed to load data");
            }

            const schoolData = await schoolRes.json();
            const regionsData = await regionsRes.json();
            const settlementsData = await settlementsRes.json();

            setSchool(schoolData);
            setRegions(regionsData);
            setSettlements(settlementsData);

            const regionId =
                settlementsData.find((s: Settlement) => s.id === schoolData.settlementId)
                    ?.regionId || "";

            setFormData({
                ...schoolData,
                regionId,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    const loadSettlementsByRegion = async (regionId: number) => {
        try {
            const response = await fetch(`/api/admin/regions/${regionId}/settlements`);

            if (!response.ok) {
                throw new Error("Failed to load settlements");
            }

            const data = await response.json();
            setSettlements(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            setSettlements([]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numericFields = ["regionId", "settlementId"];
        setFormData({
            ...formData,
            [name]: numericFields.includes(name) ? (value ? parseInt(value) : undefined) : value,
        });
    };

    const handleSave = async () => {
        if (!id) return;

        if (!formData.regionId || !formData.settlementId || !formData.name) {
            setError("Пожалуйста, заполните все поля");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            const response = await fetch(`/api/admin/schools/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    regionId: formData.regionId,
                    settlementId: formData.settlementId,
                    name: formData.name,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update school");
            }

            const updated = await response.json();
            setSchool(updated);
            setFormData({ ...updated, regionId: formData.regionId });
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
            const response = await fetch(`/api/admin/schools/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to delete school");
            }

            router.push("/admin/schools");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            setIsSaving(false);
        }
    };

    const getSettlementName = (settlementId: number) => {
        return settlements.find((s) => s.id === settlementId)?.name || "-";
    };

    const getRegionName = (regionId: number) => {
        return regions.find((r) => r.id === regionId)?.name || "-";
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <LoadingState message="Загрузка школы..." />
            </DashboardLayout>
        );
    }

    if (!school) {
        return (
            <DashboardLayout>
                <div className={styles.error}>Школа не найдена</div>
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
                    <h1>Редактирование школы</h1>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Регион</label>
                        <select
                            name="regionId"
                            value={formData.regionId || ""}
                            onChange={handleInputChange}
                        >
                            <option value="">Выберите регион</option>
                            {regions.map((region) => (
                                <option key={region.id} value={region.id}>
                                    {region.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Населённый пункт</label>
                        <select
                            name="settlementId"
                            value={formData.settlementId || ""}
                            onChange={handleInputChange}
                            disabled={!formData.regionId}
                        >
                            <option value="">
                                {formData.regionId
                                    ? "Выберите населённый пункт"
                                    : "Сначала выберите регион"}
                            </option>
                            {settlements.map((settlement) => (
                                <option key={settlement.id} value={settlement.id}>
                                    {settlement.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Название школы</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ""}
                            onChange={handleInputChange}
                            placeholder="Введите название школы"
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
                        Информация о школе
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
                                ID
                            </p>
                            <p style={{ fontSize: "16px", color: "#1f2937", fontWeight: 500 }}>
                                {school.id}
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
                                Название
                            </p>
                            <p style={{ fontSize: "16px", color: "#1f2937", fontWeight: 500 }}>
                                {school.name}
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
                                Населённый пункт
                            </p>
                            <p style={{ fontSize: "16px", color: "#1f2937", fontWeight: 500 }}>
                                {getSettlementName(school.settlementId)}
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
                                {getRegionName(formData.regionId || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {isDeleteModalOpen && (
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
                        onClick={() => setIsDeleteModalOpen(false)}
                    >
                        <div
                            style={{
                                backgroundColor: "white",
                                borderRadius: "8px",
                                padding: "24px",
                                maxWidth: "400px",
                                width: "100%",
                                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2
                                style={{
                                    fontSize: "18px",
                                    fontWeight: 600,
                                    marginBottom: "12px",
                                }}
                            >
                                Удалить школу?
                            </h2>
                            <p
                                style={{
                                    color: "#6b7280",
                                    marginBottom: "24px",
                                }}
                            >
                                Это действие нельзя отменить. Школа &quot;{school.name}&quot; будет
                                удалена.
                            </p>
                            <div
                                style={{
                                    display: "flex",
                                    gap: "12px",
                                    justifyContent: "flex-end",
                                }}
                            >
                                <Button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    variant="outline"
                                    disabled={isSaving}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    variant="primary"
                                    disabled={isSaving}
                                    style={{
                                        backgroundColor: "#ef4444",
                                        color: "white",
                                    }}
                                >
                                    {isSaving ? "Удаление..." : "Удалить"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AdminSchoolDetailPage;
