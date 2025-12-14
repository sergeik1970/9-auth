import React, { ReactElement } from "react";
import styles from "./index.module.scss";

interface Step {
    number: number;
    title: string;
    description?: string;
}

const ProcessBlock = (): ReactElement => {
    const steps: Step[] = [
        {
            number: 1,
            title: "Учитель создаёт тест",
            description: "За 2–3 минуты, без сложных настроек",
        },
        {
            number: 2,
            title: "Назначает тест ученикам или классу",
            description: "Без ссылок, чатов и копирования",
        },
        {
            number: 3,
            title: "Ученики заходят в профиль",
            description: "Тест уже ждёт их в личном кабинете",
        },
        {
            number: 4,
            title: "Результаты сохраняются автоматически",
            description: "Ошибки и прогресс каждого ученика",
        },
    ];

    return (
        <section className={styles.processBlock}>
            <div className={styles.container}>
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
            </div>
        </section>
    );
};

export default ProcessBlock;
