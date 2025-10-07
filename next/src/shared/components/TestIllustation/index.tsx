import React, { ReactElement, useState } from "react";
import styles from "./index.module.scss";

const TestIllustration = (): ReactElement => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showCongrats, setShowCongrats] = useState(false);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

    const correctAnswer = "B";

    const handleOptionClick = (option: string) => {
        if (selectedOption) return;

        setSelectedOption(option);

        if (option === correctAnswer) {
            setShowCongrats(true);
            setShowCorrectAnswer(true);

            setTimeout(() => {
                setShowCongrats(false);
            }, 3000);
        } else {
            setShowCorrectAnswer(true);
        }
    };

    const getOptionClass = (option: string) => {
        if (!selectedOption) return styles.option;

        if (option === selectedOption) {
            return option === correctAnswer
                ? `${styles.option} ${styles.correct}`
                : `${styles.option} ${styles.incorrect}`;
        }

        if (showCorrectAnswer && option === correctAnswer) {
            return `${styles.option} ${styles.correct}`;
        }

        return `${styles.option} ${styles.disabled}`;
    };
    return (
        <div className={styles.illustration}>
            <div className={styles.mockup}>
                <div className={styles.mockupHeader}>
                    <div className={styles.mockupDots}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <div className={styles.mockupContent}>
                    <div className={styles.mockupTitle}>Математика - Тест №1</div>
                    <div className={styles.mockupQuestion}>
                        <div className={styles.questionText}>Решите уравнение: 3x - 7 = 14</div>
                        <div className={styles.options}>
                            <div
                                className={getOptionClass("A")}
                                onClick={() => handleOptionClick("A")}
                            >
                                A) x = 5
                            </div>
                            <div
                                className={getOptionClass("B")}
                                onClick={() => handleOptionClick("B")}
                            >
                                B) x = 7
                            </div>
                            <div
                                className={getOptionClass("C")}
                                onClick={() => handleOptionClick("C")}
                            >
                                C) x = 9
                            </div>
                            <div
                                className={getOptionClass("D")}
                                onClick={() => handleOptionClick("D")}
                            >
                                D) x = 11
                            </div>
                        </div>
                        {showCongrats && (
                            <div className={styles.congratsAnimation}>🎉 Молодец!</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestIllustration;
