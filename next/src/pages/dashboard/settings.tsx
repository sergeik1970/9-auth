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
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const initialized = useSelector(
    (state: RootState) => state.auth.initialized
  );

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
        <title>Настройки - Тестовая платформа</title>
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
              👤 Профиль
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "grading" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("grading")}
            >
              📊 Критерии оценок
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
