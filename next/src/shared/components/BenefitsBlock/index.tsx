import React, { ReactElement } from "react";
import { Users, Award, Check } from "lucide-react";
import styles from "./index.module.scss";

interface Benefit {
    text: string;
}

interface BenefitGroup {
    title: string;
    icon: ReactElement;
    benefits: Benefit[];
}

const BenefitsBlock = (): ReactElement => {
    const groups: BenefitGroup[] = [
        {
            title: "Учителю",
            icon: <Users className={styles.groupIcon} />,
            benefits: [
                { text: "Не нужно рассылать ссылки" },
                { text: "Все ученики в системе" },
                { text: "Чёткий контроль и статистика" },
            ],
        },
        {
            title: "Ученику",
            icon: <Award className={styles.groupIcon} />,
            benefits: [
                { text: "Ничего не нужно искать" },
                { text: "Все тесты в одном месте" },
                { text: "История результатов" },
            ],
        },
    ];

    return (
        <section className={styles.benefits}>
            <div className={styles.container}>
                <h2 className={styles.title}>Почему это удобно</h2>

                <div className={styles.grid}>
                    {groups.map((group, index) => (
                        <div key={index} className={styles.column}>
                            <div className={styles.columnHeader}>
                                <div className={styles.iconWrapper}>{group.icon}</div>
                                <h3 className={styles.columnTitle}>{group.title}</h3>
                            </div>

                            <ul className={styles.benefitsList}>
                                {group.benefits.map((benefit, benefitIndex) => (
                                    <li key={benefitIndex} className={styles.benefitItem}>
                                        <Check className={styles.checkmark} />
                                        <span className={styles.benefitText}>{benefit.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BenefitsBlock;
