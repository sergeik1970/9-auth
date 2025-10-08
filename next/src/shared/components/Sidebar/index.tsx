import React, { ReactElement, useState } from "react";
import { useSelector, useDispatch } from "@/shared/store/store";
import { useRouter } from "next/router";
import { isTeacher, getRoleDisplayName } from "@/shared/utils/roles";
import styles from "./index.module.scss";
import Link from "next/link";

export interface MenuItem {
    icon: string;
    label: string;
    href: string;
    active?: boolean;
}

interface SideBarProps {
    className?: string;
}

const Sidebar = (): ReactElement => {
    // Смотреть в 7
    const { user } = useSelector((state) => state.auth);
    // const dispatch = useDispatch();
    const router = useRouter();

    const teacherMenuItems: MenuItem[] = [
        { icon: "🏠", label: "Главная", href: "/dashboard" },
        { icon: "📝", label: "Мои тесты", href: "/dashboard/tests" },
        { icon: "📊", label: "Статистика", href: "/dashboard/statistics" },
        { icon: "👥", label: "Ученики", href: "/dashboard/participants" },
        { icon: "⚙️", label: "Настройки", href: "/dashboard/settings" },
    ];

    const studentMenuItems: MenuItem[] = [
        { icon: "🏠", label: "Главная", href: "/dashboard" },
        { icon: "📝", label: "Доступные тесты", href: "/dashboard/tests" },
        { icon: "📊", label: "Мои результаты", href: "/dashboard/results" },
        { icon: "⚙️", label: "Настройки", href: "/dashboard/settings" },
    ];

    const menuItems = user?.role && isTeacher(user.role) ? teacherMenuItems : studentMenuItems;

    const getActiveMenuItem = (href: string) => {
        const currentPath = router.asPath;

        if (href === "/dashboard" && currentPath === "dashboard") {
            return true;
        }

        if (href === "/dashboard" && currentPath.startsWith("/dashboard")) {
            return true;
        }

        return false;
    };

    const handleNavigation = (href: string) => {
        router.push(href);
    };

    return (
        <aside className={`${styles.sidebar} ${""}`}>
            <div className={styles.logo}>
                <Link href="/" className={styles.logoLink}>
                    <h2 className={styles.logoText}>Skorix</h2>
                </Link>
            </div>

            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <button
                                onClick={() => handleNavigation(item.href)}
                                className={`${styles.navItem} ${getActiveMenuItem(item.href) ? styles.active : ""}`}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                <span className={styles.navLabel}>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className={styles.user}>
                <div className={styles.userAvatar}>👤</div>
                <div className={styles.userInfo}>
                    <div className={styles.userName}>{user?.name || "Пользователь"}</div>
                    <div className={styles.userRole}>
                        {user?.role ? getRoleDisplayName(user.role) : "Пользователь"}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
