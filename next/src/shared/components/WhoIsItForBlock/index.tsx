import React, { ReactElement } from "react";
import { Users, Award, Building2, Lightbulb } from "lucide-react";
import styles from "./index.module.scss";

interface WhoItem {
    icon: ReactElement;
    title: string;
    description: string;
}

const WhoIsItForBlock = (): ReactElement => {
    const items: WhoItem[] = [
        {
            icon: <Users className={styles.icon} />,
            title: "Учителям",
            description: "Контроль знаний без лишней рутины",
        },
        {
            icon: <Award className={styles.icon} />,
            title: "Ученикам",
            description: "Все задания в одном месте",
        },
        {
            icon: <Building2 className={styles.icon} />,
            title: "Школам",
            description: "Единая система тестирования",
        },
        {
            icon: <Lightbulb className={styles.icon} />,
            title: "Репетиторам",
            description: "Онлайн-задания и статистика",
        },
    ];

    return (
        <section className={styles.whoIsItFor}>
            <div className={styles.container}>
                <h2 className={styles.title}>Кому подойдёт платформа</h2>
                <div className={styles.grid}>
                    {items.map((item, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.iconWrapper}>{item.icon}</div>
                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <p className={styles.cardDescription}>{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhoIsItForBlock;
