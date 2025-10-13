// /Users/s.kudashev/Desktop/REACT-PROJECTS/9-auth/next/src/shared/components/DashboardLayout/index.tsx
import React, { ReactNode, ReactElement, useState, useEffect } from "react";
import Sidebar from "@/shared/components/Sidebar";
import DashboardHeader from "@/shared/components/DashboardHeader";
import MobileHeader from "@/shared/components/MobileHeader";
import styles from "./index.module.scss";
import TestList from "../TestList";
import CreateTest from "../CreateTest";

interface DashboardLayoutProps {
    children: ReactNode;
}

// селектор для ошиббок из слайса тестов
const DashboardLayout = ({ children }: DashboardLayoutProps): ReactElement => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    // Определяем, является ли текущий размер экрана десктопным (>1200px)
    useEffect(() => {
        const checkIfDesktop = () => {
            setIsDesktop(window.innerWidth > 1200);
            // Если перешли на десктоп, автоматически открываем сайдбар
            if (window.innerWidth > 1200) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        // Проверяем при первой загрузке
        checkIfDesktop();

        // Добавляем слушатель изменения размера окна
        window.addEventListener("resize", checkIfDesktop);

        // Очищаем слушатель при размонтировании
        return () => window.removeEventListener("resize", checkIfDesktop);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        if (!isDesktop) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className={styles.layoutContainer}>
            {/* MobileHeader теперь вне основного layout и будет фиксирован вверху экрана */}
            {!isDesktop && <MobileHeader onMenuClick={toggleSidebar} />}

            <div className={styles.layout}>
                <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} isDesktop={isDesktop} />

                {!isDesktop && (
                    <div
                        className={`${styles.overlay} ${isSidebarOpen ? styles.visible : ""}`}
                        onClick={closeSidebar}
                    ></div>
                )}

                <main
                    className={`${styles.main} ${isDesktop && isSidebarOpen ? styles.withSidebar : ""} ${!isDesktop ? styles.withMobileHeader : ""}`}
                >
                    <div className={styles.content}>{children}</div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
