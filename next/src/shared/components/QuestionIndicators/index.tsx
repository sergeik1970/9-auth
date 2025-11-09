import React from "react";
import styles from "./index.module.scss";
import clsx from "clsx";

interface QuestionIndicatorsProps {
    totalQuestions: number;
    currentQuestion: number;
    answeredQuestions: Set<number>;
    onQuestionClick: (questionIndex: number) => void;
}

export const QuestionIndicators: React.FC<QuestionIndicatorsProps> = ({
    totalQuestions,
    currentQuestion,
    answeredQuestions,
    onQuestionClick,
}) => {
    return (
        <div className={styles.indicators}>
            {Array.from({ length: totalQuestions }).map((_, index) => (
                <button
                    key={index}
                    className={clsx(styles.indicator, {
                        [styles.current]: index === currentQuestion,
                        [styles.answered]: answeredQuestions.has(index),
                    })}
                    onClick={() => onQuestionClick(index)}
                    title={`Вопрос ${index + 1}`}
                >
                    {index + 1}
                </button>
            ))}
        </div>
    );
};
