import React, { ReactElement } from "react";
import Link from "next/link";
import styles from "./index.module.scss";

const Footer = (): ReactElement => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.section}>
                        <div className={styles.logo}>
                            <h3 className={styles.logoText}>Skorix</h3>
                        </div>
                        <p className={styles.tagline}>
                            Современная платформа для создания и проведения тестов
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Навигация</h4>
                        <ul className={styles.linkList}>
                            <li>
                                <Link href="/" className={styles.link}>
                                    Главная
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth" className={styles.link}>
                                    Войти
                                </Link>
                            </li>
                            <li>
                                <a href="#features" className={styles.link}>
                                    Преимущества
                                </a>
                            </li>
                            <li>
                                <a href="#contact" className={styles.link}>
                                    Контакты
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Для пользователей</h4>
                        <ul className={styles.linkList}>
                            <li>
                                <Link href="/auth" className={styles.link}>
                                    Как учителю
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth" className={styles.link}>
                                    Как ученику
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth" className={styles.link}>
                                    Как администратору
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>О нас</h4>
                        <ul className={styles.linkList}>
                            <li>
                                <a href="#" className={styles.link}>
                                    О платформе
                                </a>
                            </li>
                            <li>
                                <a href="#" className={styles.link}>
                                    Политика конфиденциальности
                                </a>
                            </li>
                            <li>
                                <a href="#" className={styles.link}>
                                    Условия использования
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>© {currentYear} Skorix. Все права защищены.</p>
                    <div className={styles.socials}>
                        <a href="#" className={styles.socialLink} title="Twitter">
                            𝕏
                        </a>
                        <a href="#" className={styles.socialLink} title="Telegram">
                            ✈️
                        </a>
                        <a href="#" className={styles.socialLink} title="Email">
                            ✉️
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
