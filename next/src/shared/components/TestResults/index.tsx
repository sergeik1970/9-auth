import React, { useState } from "react";
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
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
    const isPassed = results.percentage >= 70;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}м ${secs}с`;
    };

    const getQuestionStatus = (answer: any) => {
        if (answer.isCorrect) return "correct";
        if (answer.isPartiallyCorrect) return "partial";
        return "incorrect";
    };

    const handleQuestionClick = (index: number) => {
        setSelectedQuestionIndex(selectedQuestionIndex === index ? null : index);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.resultSection}>
                    <h1 className={styles.status}>Результаты теста</h1>
                    <div className={styles.statsContainer}>
                        <div className={styles.progressCircle}>
                            <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="54"
                                    fill="none"
                                    stroke={isPassed ? "#10b981" : "#ef4444"}
                                    strokeWidth="8"
                                    strokeDasharray={`${(results.percentage / 100) * 339.292} 339.292`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                />
                            </svg>
                            <div className={styles.percentageText}>
                                <span className={clsx(styles.percentage, isPassed ? styles.passed : styles.failed)}>
                                    {Math.round(results.percentage)}%
                                </span>
                            </div>
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
                    </div>
                </div>

                <div className={styles.questionsNavigation}>
                    <h2>Вопросы теста</h2>
                    <div className={styles.indicators}>
                        {results.answers.map((answer, index) => (
                            <button
                                key={index}
                                className={clsx(styles.indicator, styles[getQuestionStatus(answer)], {
                                    [styles.active]: selectedQuestionIndex === index,
                                })}
                                onClick={() => handleQuestionClick(index)}
                                title={`Вопрос ${index + 1}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    {selectedQuestionIndex !== null && (
                        <div className={styles.questionDetail}>
                            <div className={styles.questionHeader}>
                                <h3>Вопрос {selectedQuestionIndex + 1}</h3>
                                <button
                                    className={styles.closeButton}
                                    onClick={() => setSelectedQuestionIndex(null)}
                                >
                                    ✕
                                </button>
                            </div>
                            <p className={styles.questionText}>
                                {results.answers[selectedQuestionIndex].questionText}
                            </p>
                            {results.answers[selectedQuestionIndex].options &&
                            results.answers[selectedQuestionIndex].options.length > 0 ? (
                                <div className={styles.optionsList}>
                                    {results.answers[selectedQuestionIndex].options.map((option: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={clsx(styles.option, {
                                                [styles.correctOption]: option.isCorrect,
                                                [styles.userSelectedWrong]:
                                                    option.isUserSelected && !option.isCorrect,
                                            })}
                                        >
                                            <span className={styles.optionText}>{option.text}</span>
                                            {option.isCorrect && (
                                                <span className={styles.badge}>Правильный ответ</span>
                                            )}
                                            {option.isUserSelected && !option.isCorrect && (
                                                <span className={styles.badge}>Ваш ответ</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.textAnswers}>
                                    <div className={styles.answerBox}>
                                        <span className={styles.label}>Ваш ответ:</span>
                                        <span className={styles.answerText}>
                                            {results.answers[selectedQuestionIndex].userAnswer || "Не отвечено"}
                                        </span>
                                    </div>
                                    {!results.answers[selectedQuestionIndex].isCorrect && (
                                        <div className={styles.answerBox}>
                                            <span className={styles.label}>Правильный ответ:</span>
                                            <span className={styles.answerText}>
                                                {results.answers[selectedQuestionIndex].correctAnswer}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
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
