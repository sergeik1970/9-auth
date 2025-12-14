import React, { ReactElement } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import styles from "./index.module.scss";

interface Feature {
    icon: ReactElement;
    text: string;
}

const DifferenceBlock = (): ReactElement => {
    const features = [
        {
            icon: <XCircle className={`${styles.featureIcon} ${styles.featureIconMuted}`} />,
            text: "Ссылки и чаты",
            isMuted: true,
        },
        {
            icon: <CheckCircle2 className={`${styles.featureIcon} ${styles.featureIconBright}`} />,
            text: "Тест сразу в профиле ученика",
            isBright: true,
        },
    ];

    return (
        <section className={styles.differenceBlock}>
            <div className={styles.container}>
                <h3 className={styles.highlightsTitle}>Главное отличие Skorix</h3>
                <div className={styles.highlights}>
                    {features.map((feature, index) => (
                        <div key={index} className={`${styles.highlight} ${feature.isBright ? styles.highlightBright : ''}`}>
                            <div className={styles.highlightIcon}>{feature.icon}</div>
                            <span className={`${styles.highlightText} ${feature.isBright ? styles.highlightTextBright : ''}`}>{feature.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DifferenceBlock;
