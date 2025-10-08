import React, { ReactNode, ReactElement } from "react";
import Sidebar from "@/shared/components/Sidebar";
import DashboardHeader from "@/shared/components/DashboardHeader";
import styles from "./index.module.scss";

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout = (): ReactElement => {
    return (
        <div className={styles.layout}>
            <Sidebar />
            <main className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.headerActions}>
                        <button className={styles.notificationBtn}>🔔</button>
                        <button className={styles.profileBtn}>
                            <span>👤</span>
                        </button>
                    </div>
                </header>
                <div className={styles.content}>
                    <DashboardHeader />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
