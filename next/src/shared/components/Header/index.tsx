import React, { ReactElement } from "react";
import { useSelector, useDispatch } from "@/shared/store/store"; // почему не react-redux
import Button from "@/shared/components/Button"; //
import Link from "next/link";
// import { useAuth } from "@/contexts/AuthContext"; // передалать под useSelector и redux
import { getRoleDisplayName } from "@/shared/utils/roles";
import { logoutUser } from "@/shared/store/slices/auth";
import styles from "./index.module.scss";

const Header = (): ReactElement => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logoutUser());
    };
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.logo}>
                    <Link href={isAuthenticated ? "/dashboard" : "/"} className={styles.logoLink}>
                        <h1 className={styles.logoText}>Skorix</h1>
                    </Link>
                </div>
                <nav className={styles.nav}>
                    <ul className={styles.navList}>
                        <li>
                            <Link href="#features" className={styles.navLink}>
                                Возможности
                            </Link>
                        </li>
                        <li>
                            <Link href="#contact" className={styles.navLink}>
                                Контакты
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div className={styles.authButtons}>
                    {isAuthenticated ? (
                        <div className={styles.userMenu}>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>Привет, {user?.name}!</span>
                                <span className={styles.userRole}>
                                    {user?.role ? getRoleDisplayName(user.role) : "Пользователь"}
                                </span>
                                <Button variant="outline" size="small" onClick={handleLogout}>
                                    Выйти
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link href="/auth">
                                <Button variant="outline" size="small">
                                    Войти
                                </Button>
                            </Link>
                            <Link href="/auth">
                                <Button variant="primary" size="small">
                                    Регистрация
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
