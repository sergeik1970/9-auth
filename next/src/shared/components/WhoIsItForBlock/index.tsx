import React, { ReactElement } from "react";
import styles from "./index.module.scss";

interface WhoItem {
    emoji: string;
    title: string;
    description: string;
}

const WhoIsItForBlock = (): ReactElement => {
    const items: WhoItem[] = [
        {
            emoji: "👩‍🏫",
            title: "Учителям",
            description: "Контроль знаний без лишней рутины",
        },
        {
            emoji: "🎓",
            title: "Ученикам",
            description: "Все задания в одном месте",
        },
        {
            emoji: "🏫",
            title: "Школам",
            description: "Единая система тестирования",
        },
        {
            emoji: "📚",
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
                            <div className={styles.emoji}>{item.emoji}</div>
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
