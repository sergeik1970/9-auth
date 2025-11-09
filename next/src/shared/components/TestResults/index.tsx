import React from "react";
import { TestResults as TestResultsType } from "@/shared/types/test";
import Button from "@/shared/components/Button";
import styles from "./index.module.scss";
import clsx from "clsx";

interface TestResultsProps {
    results: TestResultsType;
    onRetry?: () => void;
    onGoBack?: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({ results, onRetry, onGoBack }) => {
    const isPassed = results.percentage >= 70;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}м ${secs}с`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={clsx(styles.resultSection, styles[isPassed ? "passed" : "failed"])}>
                    <div className={styles.scoreCircle}>
                        <span className={styles.percentage}>{Math.round(results.percentage)}%</span>
                    </div>
                    <h1 className={styles.status}>
                        {isPassed ? "Тест пройден! ✓" : "Тест не пройден ✗"}
                    </h1>
                    <p className={styles.subtitle}>
                        {isPassed
                            ? "Отличная работа! Вы успешно прошли тест."
                            : "Попробуйте ещё раз, чтобы улучшить результат."}
                    </p>
                </div>

                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <span className={styles.label}>Правильных ответов</span>
                        <span className={styles.value}>
                            {results.correctAnswers} / {results.totalQuestions}
                        </span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.label}>Баллы</span>
                        <span className={styles.value}>{results.score}</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.label}>Время</span>
                        <span className={styles.value}>{formatTime(results.timeSpent)}</span>
                    </div>
                </div>

                <div className={styles.answers}>
                    <h2>Анализ ответов</h2>
                    <div className={styles.answersList}>
                        {results.answers.map((answer, index) => (
                            <div
                                key={index}
                                className={clsx(styles.answer, {
                                    [styles.correct]: answer.isCorrect,
                                    [styles.incorrect]: !answer.isCorrect,
                                })}
                            >
                                <div className={styles.answerHeader}>
                                    <span className={styles.answerNumber}>Вопрос {index + 1}</span>
                                    <span className={styles.answerIcon}>
                                        {answer.isCorrect ? "✓" : "✗"}
                                    </span>
                                </div>
                                <p className={styles.questionText}>{answer.questionText}</p>
                                {answer.userAnswer && (
                                    <div className={styles.userAnswerBox}>
                                        <span className={styles.label}>Ваш ответ:</span>
                                        <span>{answer.userAnswer}</span>
                                    </div>
                                )}
                                {!answer.isCorrect && answer.correctAnswer && (
                                    <div className={styles.correctAnswerBox}>
                                        <span className={styles.label}>Правильный ответ:</span>
                                        <span>{answer.correctAnswer}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.actions}>
                    {onRetry && (
                        <Button onClick={onRetry} className={styles.retryBtn}>
                            Пройти заново
                        </Button>
                    )}
                    {onGoBack && (
                        <Button onClick={onGoBack} variant="secondary" className={styles.backBtn}>
                            К списку тестов
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
