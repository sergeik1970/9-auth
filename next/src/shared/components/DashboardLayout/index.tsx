import React, { ReactNode, ReactElement, useState, useEffect } from "react";
import Sidebar from "@/shared/components/Sidebar";
import MobileHeader from "@/shared/components/MobileHeader";
import styles from "./index.module.scss";

interface DashboardLayoutProps {
    children: ReactNode;
}

// селектор для ошиббок из слайса тестов
const DashboardLayout = ({ children }: DashboardLayoutProps): ReactElement => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);

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
        setIsHydrated(true);

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
            {isHydrated && !isDesktop && <MobileHeader onMenuClick={toggleSidebar} />}

            <div className={styles.layout}>
                <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} isDesktop={isDesktop} />

                {isHydrated && !isDesktop && (
                    <div
                        className={`${styles.overlay} ${isSidebarOpen ? styles.visible : ""}`}
                        onClick={closeSidebar}
                    ></div>
                )}

                <main
                    className={`${styles.main} ${isDesktop && isSidebarOpen ? styles.withSidebar : ""} ${isHydrated && !isDesktop ? styles.withMobileHeader : ""}`}
                >
                    <div className={styles.content}>{children}</div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
