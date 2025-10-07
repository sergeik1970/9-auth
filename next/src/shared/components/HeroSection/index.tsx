import React, { ReactElement, useState } from "react";
import Button from "@/shared/components/Button";
import styles from "./index.module.scss";
import Link from "next/link";
import TestIllustation from "@/shared/components/TestIllustation";

const HeroSection = (): ReactElement => {
    return (
        <section className={styles.hero}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        Создавайте интеллектуальные тесты за минуты
                        <span className={styles.highlight}> легко и эффективно</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Современная платформа, которая помогает легко создавать, запускать и
                        анализировать тесты. Простые инструменты, надёжная архитектура и умная
                        работа с данными делают процесс тестирования удобным и понятным на каждом
                        этапе.
                    </p>
                    <div className={styles.actions}>
                        <Link href="/auth">
                            <Button variant="primary" size="large">
                                Начать работу
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="outline" size="large">
                                Посмотреть демо
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
