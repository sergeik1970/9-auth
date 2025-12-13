import React, { useState, useEffect, ReactElement } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import LoadingState from "@/shared/components/LoadingState";
import styles from "./users.module.scss";

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

const AdminSchoolsPage = (): ReactElement => {
    const router = useRouter();
    const [schools, setSchools] = useState<School[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        regionId: "",
        settlementId: "",
        name: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (formData.regionId) {
            loadSettlementsByRegion(parseInt(formData.regionId));
        } else {
            setSettlements([]);
            setFormData((f) => ({ ...f, settlementId: "" }));
        }
    }, [formData.regionId]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [schoolsRes, regionsRes, settlementsRes] = await Promise.all([
                fetch("/api/admin/schools"),
                fetch("/api/admin/regions"),
                fetch("/api/admin/settlements"),
            ]);

            if (!schoolsRes.ok || !regionsRes.ok || !settlementsRes.ok) {
                throw new Error("Failed to load data");
            }

            const schoolsData = await schoolsRes.json();
            const regionsData = await regionsRes.json();
            const settlementsData = await settlementsRes.json();

            setSchools(schoolsData);
            setRegions(regionsData);
            setSettlements(settlementsData);
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

    const handleCreateSchool = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.regionId || !formData.settlementId || !formData.name.trim()) {
            setError("Пожалуйста, заполните все поля");
            return;
        }

        try {
            setIsCreating(true);
            setError(null);

            const response = await fetch("/api/admin/schools", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    regionId: parseInt(formData.regionId),
                    settlementId: parseInt(formData.settlementId),
                    name: formData.name.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create school");
            }

            const newSchool = await response.json();
            setSchools([...schools, newSchool]);
            setFormData({ regionId: "", settlementId: "", name: "" });
            setIsModalOpen(false);
            setSuccess("Школа успешно создана");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsCreating(false);
        }
    };

    const getSettlementName = (settlementId: number) => {
        return settlements.find((s) => s.id === settlementId)?.name || "Unknown";
    };

    const handleSchoolClick = (schoolId: number) => {
        router.push(`/admin/schools/${schoolId}`);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <LoadingState message="Загрузка школ..." />
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
                    <h1 className={styles.title}>Управление школами</h1>
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

                {schools.length === 0 ? (
                    <div className={styles.empty}>Нет школ</div>
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
                                        Населённый пункт
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {schools.map((school, idx) => (
                                    <tr
                                        key={school.id}
                                        onClick={() => handleSchoolClick(school.id)}
                                        style={{
                                            borderBottom:
                                                idx < schools.length - 1
                                                    ? "1px solid #e5e7eb"
                                                    : "none",
                                            backgroundColor: "#ffffff",
                                            cursor: "pointer",
                                            transition: "background-color 0.2s",
                                        }}
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
                                            {school.id}
                                        </td>
                                        <td style={{ padding: "12px", color: "#374151" }}>
                                            {school.name}
                                        </td>
                                        <td style={{ padding: "12px", color: "#374151" }}>
                                            {getSettlementName(school.settlementId)}
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
                                Создать школу
                            </h2>

                            <form onSubmit={handleCreateSchool}>
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
                                            Регион
                                        </label>
                                        <select
                                            value={formData.regionId}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    regionId: e.target.value,
                                                })
                                            }
                                            style={{
                                                width: "100%",
                                                padding: "8px 12px",
                                                border: "1px solid #d1d5db",
                                                borderRadius: "6px",
                                                fontSize: "14px",
                                            }}
                                        >
                                            <option value="">Выберите регион</option>
                                            {regions.map((region) => (
                                                <option key={region.id} value={region.id}>
                                                    {region.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label
                                            style={{
                                                display: "block",
                                                marginBottom: "8px",
                                                fontWeight: 500,
                                                color: "#374151",
                                            }}
                                        >
                                            Населённый пункт
                                        </label>
                                        <select
                                            value={formData.settlementId}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    settlementId: e.target.value,
                                                })
                                            }
                                            disabled={!formData.regionId}
                                            style={{
                                                width: "100%",
                                                padding: "8px 12px",
                                                border: "1px solid #d1d5db",
                                                borderRadius: "6px",
                                                fontSize: "14px",
                                                opacity: !formData.regionId ? 0.5 : 1,
                                                cursor: !formData.regionId
                                                    ? "not-allowed"
                                                    : "pointer",
                                            }}
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
                                            placeholder="Введите название"
                                            style={{
                                                width: "100%",
                                                padding: "8px 12px",
                                                border: "1px solid #d1d5db",
                                                borderRadius: "6px",
                                                fontSize: "14px",
                                            }}
                                        />
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "12px",
                                            justifyContent: "flex-end",
                                            marginTop: "16px",
                                        }}
                                    >
                                        <Button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            variant="outline"
                                            disabled={isCreating}
                                        >
                                            Отмена
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
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

export default AdminSchoolsPage;
