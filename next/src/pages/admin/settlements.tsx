import React, { useState, useEffect, ReactElement } from "react";
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
    region?: Region;
}

const AdminSettlementsPage = (): ReactElement => {
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("");
    const [formData, setFormData] = useState({
        regionId: "",
        name: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [settlementsRes, regionsRes] = await Promise.all([
                fetch("/api/admin/settlements"),
                fetch("/api/admin/regions"),
            ]);

            if (!settlementsRes.ok || !regionsRes.ok) {
                throw new Error("Failed to load data");
            }

            const settlementsData = await settlementsRes.json();
            const regionsData = await regionsRes.json();

            setSettlements(settlementsData);
            setRegions(regionsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSettlement = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.regionId || !formData.name.trim()) {
            setError("Пожалуйста, заполните все поля");
            return;
        }

        try {
            setIsCreating(true);
            setError(null);

            const response = await fetch("/api/admin/settlements", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    regionId: parseInt(formData.regionId),
                    name: formData.name.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create settlement");
            }

            const newSettlement = await response.json();
            setSettlements([...settlements, newSettlement]);
            setFormData({ regionId: "", name: "" });
            setIsModalOpen(false);
            setSuccess("Населённый пункт успешно создан");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsCreating(false);
        }
    };

    const getRegionName = (regionId: number) => {
        return regions.find((r) => r.id === regionId)?.name || "Unknown";
    };

    const filteredSettlements = selectedRegionFilter
        ? settlements.filter((s) => s.regionId === parseInt(selectedRegionFilter))
        : settlements;

    if (isLoading) {
        return (
            <DashboardLayout>
                <LoadingState message="Загрузка населённых пунктов..." />
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
                    <h1 className={styles.title}>Управление населёнными пунктами</h1>
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

                <div
                    style={{
                        marginBottom: "16px",
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                    }}
                >
                    <label
                        style={{
                            fontWeight: 500,
                            color: "#374151",
                        }}
                    >
                        Фильтр по региону:
                    </label>
                    <select
                        value={selectedRegionFilter}
                        onChange={(e) => setSelectedRegionFilter(e.target.value)}
                        style={{
                            padding: "8px 12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "14px",
                            minWidth: "200px",
                        }}
                    >
                        <option value="">Все регионы</option>
                        {regions.map((region) => (
                            <option key={region.id} value={region.id}>
                                {region.name}
                            </option>
                        ))}
                    </select>
                </div>

                {filteredSettlements.length === 0 ? (
                    <div className={styles.empty}>Нет населённых пунктов</div>
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
                                        Регион
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSettlements.map((settlement, idx) => (
                                    <tr
                                        key={settlement.id}
                                        style={{
                                            borderBottom:
                                                idx < filteredSettlements.length - 1
                                                    ? "1px solid #e5e7eb"
                                                    : "none",
                                            backgroundColor: "#ffffff",
                                        }}
                                    >
                                        <td style={{ padding: "12px", color: "#374151" }}>
                                            {settlement.id}
                                        </td>
                                        <td style={{ padding: "12px", color: "#374151" }}>
                                            {settlement.name}
                                        </td>
                                        <td style={{ padding: "12px", color: "#374151" }}>
                                            {getRegionName(settlement.regionId)}
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
                                Создать населённый пункт
                            </h2>

                            <form onSubmit={handleCreateSettlement}>
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

export default AdminSettlementsPage;
