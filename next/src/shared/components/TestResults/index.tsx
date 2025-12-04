import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/shared/store/store";
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
    const userGradingCriteria = useSelector((state: RootState) => state.auth.user?.gradingCriteria);
    const gradingCriteria = (results as any).gradingCriteria || userGradingCriteria;

    const getGrade = (percentage: number): { grade: number; label: string } => {
        if (!gradingCriteria) {
            if (percentage >= 85) return { grade: 5, label: "Отлично" };
            if (percentage >= 70) return { grade: 4, label: "Хорошо" };
            if (percentage >= 50) return { grade: 3, label: "Удовлетворительно" };
            return { grade: 2, label: "Неудовлетворительно" };
        }

        if (percentage >= gradingCriteria.excellent) return { grade: 5, label: "Отлично" };
        if (percentage >= gradingCriteria.good) return { grade: 4, label: "Хорошо" };
        if (percentage >= gradingCriteria.satisfactory)
            return { grade: 3, label: "Удовлетворительно" };
        return { grade: 2, label: "Неудовлетворительно" };
    };

    const getResultColor = (percentage: number) => {
        if (!gradingCriteria) {
            if (percentage >= 85) return "#10b981";
            if (percentage >= 70) return "#eab308";
            if (percentage >= 50) return "#f59e0b";
            return "#ef4444";
        }

        if (percentage >= gradingCriteria.excellent) return "#22c55e";
        if (percentage >= gradingCriteria.good) return "#f59e0b";
        if (percentage >= gradingCriteria.satisfactory) return "#ef4444";
        return "#6b7280";
    };

    const getResultStatus = (percentage: number) => {
        const { grade } = getGrade(percentage);
        switch (grade) {
            case 5:
                return "excellent";
            case 4:
                return "good";
            case 3:
                return "fair";
            default:
                return "poor";
        }
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours}ч`);
        if (mins > 0) parts.push(`${mins}м`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}с`);

        return parts.join(" ");
    };

    const getQuestionStatus = (answer: any) => {
        if (
            !answer.userAnswer &&
            (!answer.options ||
                answer.options.length === 0 ||
                answer.options.every((o: any) => !o.isUserSelected))
        ) {
            return "unanswered";
        }
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
                                    stroke={getResultColor(results.percentage)}
                                    strokeWidth="8"
                                    strokeDasharray={`${(results.percentage / 100) * 339.292} 339.292`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 60 60)"
                                />
                            </svg>
                            <div className={styles.percentageText}>
                                <span
                                    className={clsx(
                                        styles.percentage,
                                        styles[getResultStatus(results.percentage)],
                                    )}
                                >
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
                                <span className={styles.label}>Оценка</span>
                                <span
                                    className={clsx(
                                        styles.value,
                                        styles.grade,
                                        styles[`grade${getGrade(results.percentage).grade}`],
                                    )}
                                >
                                    {getGrade(results.percentage).grade}
                                </span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.label}>Время</span>
                                <span className={styles.value}>
                                    {formatTime(results.timeSpent)}
                                </span>
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
                                className={clsx(
                                    styles.indicator,
                                    styles[getQuestionStatus(answer)],
                                    {
                                        [styles.active]: selectedQuestionIndex === index,
                                    },
                                )}
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
                                (() => {
                                    const hasUserAnswer = results.answers[
                                        selectedQuestionIndex
                                    ].options.some((o: any) => o.isUserSelected);

                                    if (!hasUserAnswer) {
                                        return (
                                            <div className={styles.textAnswers}>
                                                <div
                                                    className={clsx(
                                                        styles.answerBox,
                                                        styles.noAnswer,
                                                    )}
                                                >
                                                    <span className={styles.answerText}>
                                                        Не отвечено
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }

                                    const isCorrect =
                                        results.answers[selectedQuestionIndex].isCorrect;

                                    return (
                                        <div className={styles.optionsList}>
                                            {results.answers[selectedQuestionIndex].options.map(
                                                (option: any, idx: number) => {
                                                    if (!option.isUserSelected) return null;

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={clsx(styles.option, {
                                                                [styles.correctOption]:
                                                                    option.isCorrect,
                                                                [styles.userSelectedWrong]:
                                                                    option.isUserSelected &&
                                                                    !option.isCorrect,
                                                            })}
                                                        >
                                                            <span className={styles.optionText}>
                                                                {option.text}
                                                            </span>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className={styles.textAnswers}>
                                    {results.answers[selectedQuestionIndex].userAnswer && (
                                        <div
                                            className={clsx(styles.answerBox, {
                                                [styles.correctOption]:
                                                    results.answers[selectedQuestionIndex]
                                                        .isCorrect,
                                                [styles.userSelectedWrong]:
                                                    !results.answers[selectedQuestionIndex]
                                                        .isCorrect,
                                            })}
                                        >
                                            <span className={styles.answerText}>
                                                {results.answers[selectedQuestionIndex].userAnswer}
                                            </span>
                                        </div>
                                    )}
                                    {!results.answers[selectedQuestionIndex].userAnswer && (
                                        <div className={clsx(styles.answerBox, styles.noAnswer)}>
                                            <span className={styles.answerText}>Не отвечено</span>
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
