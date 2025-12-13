import React, { ReactElement } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import styles from "./index.module.scss";

interface Step {
    number: number;
    title: string;
    description?: string;
}

const HowItWorksBlock = (): ReactElement => {
    const steps: Step[] = [
        {
            number: 1,
            title: "Учитель создаёт тест",
            description: "",
        },
        {
            number: 2,
            title: "Назначает его ученикам или классу",
            description: "",
        },
        {
            number: 3,
            title: "Ученики заходят в профиль — тест уже там",
            description: "",
        },
        {
            number: 4,
            title: "Система сохраняет и анализирует результаты",
            description: "",
        },
    ];

    const features = [
        {
            icon: "❌",
            text: "Без рассылок и ссылок",
        },
        {
            icon: "✅",
            text: "Всё через личные кабинеты",
        },
    ];

    return (
        <section className={styles.howItWorks}>
            <div className={styles.container}>
                <h2 className={styles.title}>Как работает Skorix?</h2>

                <div className={styles.stepsContainer}>
                    {steps.map((step, index) => (
                        <div key={step.number}>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>{step.number}</div>
                                <div className={styles.stepContent}>
                                    <h3 className={styles.stepTitle}>{step.title}</h3>
                                    {step.description && (
                                        <p className={styles.stepDescription}>{step.description}</p>
                                    )}
                                </div>
                            </div>
                            {index < steps.length - 1 && <div className={styles.stepDivider} />}
                        </div>
                    ))}
                </div>

                <div className={styles.highlights}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.highlight}>
                            <span className={styles.highlightIcon}>{feature.icon}</span>
                            <span className={styles.highlightText}>{feature.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorksBlock;
