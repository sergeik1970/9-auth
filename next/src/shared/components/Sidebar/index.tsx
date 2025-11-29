import React, { ReactElement } from "react";
import { useSelector } from "@/shared/store/store";
import { useRouter } from "next/router";
import { isTeacher, getRoleDisplayName } from "@/shared/utils/roles";
import styles from "./index.module.scss";
import Link from "next/link";
import { selectAuth } from "@/shared/store/slices/auth";

export interface MenuItem {
    icon: string | React.ReactNode;
    label: string;
    href: string;
    active?: boolean;
}

interface SideBarProps {
    isOpen?: boolean;
    onClose?: () => void;
    isDesktop?: boolean;
}

const Sidebar = ({ isOpen = false, onClose, isDesktop = false }: SideBarProps): ReactElement => {
    const { user } = useSelector(selectAuth);
    const router = useRouter();

    const homeIcon = (
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
        >
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
    );

    const settingsIcon = (
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
        >
            <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

    const usersIcon = (
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
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <path d="M16 3.128a4 4 0 0 1 0 7.744" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <circle cx="9" cy="7" r="4" />
        </svg>
    );

    const testsIcon = (
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
        >
            <rect width="8" height="4" x="8" y="2" rx="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5.5" />
            <path d="M4 13.5V6a2 2 0 0 1 2-2h2" />
            <path d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
        </svg>
    );

    const teacherMenuItems: MenuItem[] = [
        { icon: homeIcon, label: "Главная", href: "/dashboard" },
        { icon: testsIcon, label: "Мои тесты", href: "/dashboard/tests" },
        { icon: "📊", label: "Статистика", href: "/dashboard/statistics" },
        { icon: usersIcon, label: "Ученики", href: "/students" },
        { icon: settingsIcon, label: "Настройки", href: "/dashboard/settings" },
    ];

    const studentMenuItems: MenuItem[] = [
        { icon: homeIcon, label: "Главная", href: "/dashboard" },
        { icon: "📝", label: "Доступные тесты", href: "/dashboard/tests" },
        { icon: "📊", label: "Мои результаты", href: "/dashboard/results" },
        { icon: settingsIcon, label: "Настройки", href: "/dashboard/settings" },
    ];

    const menuItems = user?.role && isTeacher(user.role) ? teacherMenuItems : studentMenuItems;

    const getActiveMenuItem = (href: string) => {
        const currentPath = router.asPath;

        if (href === "/dashboard") {
            return currentPath === "/dashboard";
        }

        return currentPath.startsWith(href);
    };

    const handleNavigation = (href: string) => {
        router.push(href);
        if (onClose) {
            onClose();
        }
    };

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
            <div className={styles.sidebarHeader}>
                <div className={styles.logo}>
                    <Link href="/" className={styles.logoLink}>
                        <h2 className={styles.logoText}>Skorix</h2>
                    </Link>
                </div>
                {/* Показываем кнопку закрытия только на мобильных устройствах */}
                {!isDesktop && (
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Закрыть меню"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M18 6L6 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M6 6L18 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                )}
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
