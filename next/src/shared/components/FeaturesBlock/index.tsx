import React, { ReactElement } from "react";
import { Zap, User, BarChart3, Smartphone } from "lucide-react";
import styles from "./index.module.scss";

interface Feature {
    icon: ReactElement;
    title: string;
    description: string;
}

const FeaturesBlock = (): ReactElement => {
    const features: Feature[] = [
        {
            icon: <Zap className={styles.icon} />,
            title: "Быстро",
            description: "Создание теста за 2-3 минуты",
        },
        {
            icon: <User className={styles.icon} />,
            title: "Личные профили",
            description: "Тесты автоматически появляются у учеников",
        },
        {
            icon: <BarChart3 className={styles.icon} />,
            title: "Аналитика",
            description: "Результаты, ошибки и прогресс каждого ученика",
        },
        {
            icon: <Smartphone className={styles.icon} />,
            title: "Доступность",
            description: "Работает на любом устройстве",
        },
    ];

    return (
        <section className={styles.featuresBlock}>
            <div className={styles.container}>
                <h2 className={styles.title}>Ключевые преимущества</h2>
                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.iconWrapper}>{feature.icon}</div>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesBlock;
