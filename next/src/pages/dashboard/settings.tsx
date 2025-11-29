import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Head from "next/head";
import DashboardLayout from "../../shared/components/DashboardLayout";
import EditProfile from "../../shared/components/EditProfile";
import GradingCriteria from "../../shared/components/GradingCriteria";
import { RootState } from "../../shared/store/store";
import { getCurrentUser } from "../../shared/store/slices/auth";
import styles from "../../shared/styles/Settings.module.scss";

export default function SettingsPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const initialized = useSelector((state: RootState) => state.auth.initialized);

    const [activeTab, setActiveTab] = useState<"profile" | "grading">("profile");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (initialized) {
            if (!isAuthenticated) {
                router.push("/auth");
            } else {
                setLoading(false);
            }
        }
    }, [isAuthenticated, initialized, router]);

    if (loading || !user) {
        return (
            <DashboardLayout>
                <div>Загрузка...</div>
            </DashboardLayout>
        );
    }

    const onSuccess = () => {
        dispatch(getCurrentUser() as any);
    };

    return (
        <>
            <Head>
                <title>Настройки</title>
            </Head>
            <DashboardLayout>
                <div className={styles.container}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${
                                activeTab === "profile" ? styles.active : ""
                            }`}
                            onClick={() => setActiveTab("profile")}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    display: "inline",
                                    marginRight: "8px",
                                    verticalAlign: "middle",
                                }}
                            >
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Профиль
                        </button>
                        <button
                            className={`${styles.tab} ${
                                activeTab === "grading" ? styles.active : ""
                            }`}
                            onClick={() => setActiveTab("grading")}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                    display: "inline",
                                    marginRight: "8px",
                                    verticalAlign: "middle",
                                }}
                            >
                                <path d="M10 5H3" />
                                <path d="M12 19H3" />
                                <path d="M14 3v4" />
                                <path d="M16 17v4" />
                                <path d="M21 12h-9" />
                                <path d="M21 19h-5" />
                                <path d="M21 5h-7" />
                                <path d="M8 10v4" />
                                <path d="M8 12H3" />
                            </svg>
                            Критерии оценок
                        </button>
                    </div>

                    <div className={styles.content}>
                        {activeTab === "profile" && (
                            <EditProfile user={user} onSuccess={onSuccess} />
                        )}
                        {activeTab === "grading" && user.role === "teacher" && (
                            <GradingCriteria
                                initialCriteria={user.gradingCriteria}
                                onSuccess={onSuccess}
                            />
                        )}
                        {activeTab === "grading" && user.role !== "teacher" && (
                            <div className={styles.message}>
                                Только учителя могут настраивать критерии оценок
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
