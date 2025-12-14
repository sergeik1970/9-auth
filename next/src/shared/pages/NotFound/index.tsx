import React, { ReactElement } from "react";
import Link from "next/link";
import Button from "@/shared/components/Button";
import styles from "./index.module.scss";

const NotFoundPage = (): ReactElement => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.subtitle}>Страница недоступна</h1>
                <p className={styles.description}>
                    Возможно, у вас нет доступа.
                    <br />
                    Все тесты доступны через личный кабинет.
                </p>
                <Link href="/">
                    <Button variant="primary" size="medium">
                        Вернуться на главную
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
