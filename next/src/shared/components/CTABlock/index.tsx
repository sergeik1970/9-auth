import React, { ReactElement } from "react";
import Button from "@/shared/components/Button";
import Link from "next/link";
import styles from "./index.module.scss";

const CTABlock = (): ReactElement => {
    return (
        <section className={styles.cta}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h2 className={styles.title}>Готовы начать?</h2>
                    <p className={styles.subtitle}>Создайте свой первый тест уже сегодня.</p>

                    <div className={styles.actions}>
                        <Link href="/auth">
                            <Button variant="primary" size="large">
                                Начать работу
                            </Button>
                        </Link>
                        <Link href="/auth">
                            <Button variant="primary" size="large">
                                Зарегистрироваться
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTABlock;
