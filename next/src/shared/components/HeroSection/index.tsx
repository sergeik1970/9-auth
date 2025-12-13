import React, { ReactElement } from "react";
import Button from "@/shared/components/Button";
import styles from "./index.module.scss";
import Link from "next/link";
import TestIllustation from "@/shared/components/TestIllustation";

const HeroSection = (): ReactElement => {
    return (
        <section className={styles.hero}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>Создавайте онлайн-тесты за минуты</h1>
                    <p className={styles.keyDifferentiator}>
                        Без ссылок — задания автоматически появляются в профиле ученика
                    </p>
                    <p className={styles.description}>
                        Современная платформа для создания, проведения и анализа тестов
                    </p>
                    <div className={styles.actions}>
                        <div className={styles.primaryButtonWrapper}>
                            <Link href="/auth">
                                <Button variant="primary" size="large">
                                    Начать
                                </Button>
                            </Link>
                        </div>
                        <Link href="/auth">
                            <Button variant="primary" size="large">
                                Войти
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className={styles.visual}>
                    <TestIllustation />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
