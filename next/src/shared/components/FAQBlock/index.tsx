import React, { ReactElement, useState } from "react";
import styles from "./index.module.scss";

interface FAQItem {
    question: string;
    answer: string;
}

const FAQBlock = (): ReactElement => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const faqs: FAQItem[] = [
        {
            question: "Нужно ли делиться ссылками?",
            answer: "Нет, тесты автоматически появляются в профиле ученика.",
        },
        {
            question: "Нужно ли устанавливать приложение?",
            answer: "Нет, платформа работает в браузере.",
        },
        {
            question: "Можно ли использовать в школе?",
            answer: "Да, Skorix подходит для учебного процесса.",
        },
    ];

    const toggleExpanded = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <section className={styles.faq} id="faq">
            <div className={styles.container}>
                <h2 className={styles.title}>Часто задаваемые вопросы</h2>
                <p className={styles.subtitle}>Снимаем основные барьеры</p>

                <div className={styles.faqList}>
                    {faqs.map((item, index) => (
                        <div
                            key={index}
                            className={`${styles.faqItem} ${
                                expandedIndex === index ? styles.expanded : ""
                            }`}
                        >
                            <button
                                className={styles.faqQuestion}
                                onClick={() => toggleExpanded(index)}
                            >
                                <span className={styles.questionText}>{item.question}</span>
                                <span className={styles.icon}>
                                    {expandedIndex === index ? "−" : "+"}
                                </span>
                            </button>

                            {expandedIndex === index && (
                                <div className={styles.faqAnswer}>
                                    <p>{item.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQBlock;
