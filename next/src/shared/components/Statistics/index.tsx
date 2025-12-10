import React, { ReactElement } from "react";
import { AlertTriangle } from "lucide-react";
import styles from "./index.module.scss";

const Statistics = (): ReactElement => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Статистика</h1>
            <div className={styles.banner}>
                <AlertTriangle className={styles.bannerIcon} />
                <div className={styles.bannerContent}>
                    <p className={styles.bannerText}>
                        Этот раздел находится в разработке и может работать с ошибками.
                    </p>
                </div>
            </div>
            <div className={styles.content}>
                <div className={styles.placeholder}>
                    <p>Статистика будет доступна в ближайшее время</p>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
