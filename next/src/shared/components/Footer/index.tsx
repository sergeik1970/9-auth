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
                                <a href="#features" className={styles.link}>
                                    Преимущества
                                </a>
                            </li>
                            <li>
                                <a href="#faq" className={styles.link}>
                                    Вопросы
                                </a>
                            </li>
                            <li>
                                <Link href="/auth" className={styles.link}>
                                    Авторизация
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>О нас</h4>
                        <ul className={styles.linkList}>
                            <li>
                                <a href="#how-it-works" className={styles.link}>
                                    О платформе
                                </a>
                            </li>
                            <li>
                                <Link href="/privacy" className={styles.link}>
                                    Политика конфиденциальности
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>© {currentYear} Skorix. Все права защищены.</p>
                    <p className={styles.copyright}>С наступающим Новым Годом!</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
