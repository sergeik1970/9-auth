import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useTimer, useTestAttempt } from "@/shared/hooks/test";
import { Timer } from "@/shared/components/Timer";
import { QuestionIndicators } from "@/shared/components/QuestionIndicators";
import QuestionDisplay from "@/shared/components/QuestionDisplay";
import Button from "@/shared/components/Button";
import Modal from "@/shared/components/Modal";
import { Test } from "@/shared/types/test";
import { Question } from "@/shared/types/question";
import styles from "./index.module.scss";
import clsx from "clsx";

interface TestTakerProps {
    test: Test;
    attemptId?: number;
}

export const TestTaker: React.FC<TestTakerProps> = ({ test, attemptId }) => {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentSelectedOptionId, setCurrentSelectedOptionId] = useState<number | undefined>();
    const [currentSelectedOptionIds, setCurrentSelectedOptionIds] = useState<number[]>([]);
    const [currentTextAnswer, setCurrentTextAnswer] = useState<string>("");
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        attempt,
        answers,
        isSaving,
        isSubmitting,
        saveAnswer,
        submitTest,
        isAnswered,
        error: attemptError,
        serverTimeOffset,
    } = useTestAttempt({
        testId: test.id!,
        attemptId,
        onAttemptCreated: (newAttemptId: number) => {
            router.replace(`/tests/${test.id}/take/${newAttemptId}`);
        },
        onAttemptUnavailable: (unavailableAttemptId: number) => {
            router.replace(`/tests/${test.id}/results?attemptId=${unavailableAttemptId}`);
        },
    });

    const { hours, minutes, seconds, isActive, isTimeUp, pause, resume } = useTimer({
        durationSeconds: (test.timeLimit || 60) * 60,
        onTimeUp: () => {
            // Will be triggered when time is up
        },
        serverTimeOffset,
        startedAt: attempt?.startedAt ? new Date(attempt.startedAt) : undefined,
    });

    const currentQuestion = questions[currentQuestionIndex];

    const saveCurrentAnswer = useCallback(async () => {
        if (!currentQuestion) return;
        await saveAnswer(
            currentQuestion.id!,
            currentSelectedOptionId,
            currentSelectedOptionIds,
            currentTextAnswer,
        );
    }, [
        currentQuestion,
        saveAnswer,
        currentSelectedOptionId,
        currentSelectedOptionIds,
        currentTextAnswer,
    ]);

    const handleConfirmSubmit = useCallback(async () => {
        if (isSubmitted) return;

        setIsSubmitted(true);
        try {
            pause();
            await saveCurrentAnswer();
            const results = await submitTest();
            router.push(`/tests/${test.id}/results?attemptId=${results.attemptId}`);
        } catch (error) {
            console.error("Error submitting test:", error);
            setIsSubmitted(false);
            resume();
        }
    }, [isSubmitted, pause, saveCurrentAnswer, submitTest, test.id, router, resume]);

    const handleSubmitClick = () => {
        setIsConfirmModalOpen(true);
    };

    useEffect(() => {
        if (isTimeUp && !isSubmitted) {
            handleConfirmSubmit();
        }
    }, [isTimeUp, isSubmitted, handleConfirmSubmit]);

    useEffect(() => {
        loadQuestions();
    }, [test.id]);

    useEffect(() => {
        if (attemptError && attemptError.includes("уже завершена") && attemptId) {
            router.replace(`/tests/${test.id}/results?attemptId=${attemptId}`);
        }
    }, [attemptError, attemptId, test.id, router]);

    useEffect(() => {
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion) {
            const savedAnswer = answers.get(currentQuestion.id!);
            setCurrentSelectedOptionId(savedAnswer?.selectedOptionId);
            setCurrentSelectedOptionIds(
                Array.isArray(savedAnswer?.selectedOptionIds) ? savedAnswer.selectedOptionIds : [],
            );
            setCurrentTextAnswer(savedAnswer?.textAnswer || "");
        }
    }, [currentQuestionIndex, questions, answers]);

    const loadQuestions = async () => {
        try {
            const response = await fetch(`/api/tests/${test.id}/questions`);
            if (!response.ok) throw new Error("Failed to load questions");
            const data = await response.json();
            setQuestions(data);
            setIsLoading(false);
        } catch (error) {
            console.error("Error loading questions:", error);
            setIsLoading(false);
        }
    };

    const answeredSet = new Set(
        Array.from(answers.entries())
            .filter(([_, answer]) => answer)
            .map(([id]) => questions.findIndex((q) => q.id === id))
            .filter((index) => index !== -1),
    );

    const handleAnswerChange = (
        selectedOptionId?: number,
        selectedOptionIds?: number[],
        textAnswer?: string,
    ) => {
        setCurrentSelectedOptionId(selectedOptionId);
        setCurrentSelectedOptionIds(selectedOptionIds || []);
        setCurrentTextAnswer(textAnswer || "");
    };

    const handlePrevious = async () => {
        if (currentQuestionIndex > 0) {
            await saveCurrentAnswer();
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleNext = async () => {
        if (currentQuestionIndex < questions.length - 1) {
            await saveCurrentAnswer();
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handleQuestionJump = (questionIndex: number) => {
        setCurrentQuestionIndex(questionIndex);
    };

    if (attemptError) {
        const isAttemptCompleted = attemptError.includes("уже завершена");
        const isTimeExpired = attemptError.includes("истекло");

        return (
            <div className={styles.loading}>
                <div
                    style={{
                        color: isAttemptCompleted || isTimeExpired ? "#ff9800" : "red",
                        padding: "20px",
                        textAlign: "center",
                    }}
                >
                    <h2>
                        {isAttemptCompleted
                            ? "Попытка завершена"
                            : isTimeExpired
                              ? "Время прохождения истекло"
                              : "Ошибка"}
                    </h2>
                    <p>{attemptError}</p>
                    {(isAttemptCompleted || isTimeExpired) && (
                        <div style={{ marginTop: "20px" }}>
                            {isAttemptCompleted && (
                                <p style={{ fontSize: "14px" }}>Перенаправление на результаты...</p>
                            )}
                            <Button
                                variant="primary"
                                onClick={() => router.push("/")}
                                style={{ marginTop: "20px" }}
                            >
                                На главную
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (isLoading || !attempt) {
        return <div className={styles.loading}>Загрузка теста...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <div className={styles.titleSection}>
                        <h1>{test.title}</h1>
                    </div>
                    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <div style={{ fontSize: "16px", color: "#666", fontWeight: "600" }}>
                                {answeredSet.size}/{questions.length}
                            </div>
                            <Button
                                onClick={handleSubmitClick}
                                loading={isSubmitting}
                                variant="primary"
                            >
                                Завершить тест
                            </Button>
                        </div>
                        <Timer
                            hours={hours}
                            minutes={minutes}
                            seconds={seconds}
                            isActive={isActive}
                            isTimeUp={isTimeUp}
                        />
                    </div>
                </div>
            </div>

            {currentQuestion && (
                <div className={styles.content}>
                    <div className={styles.questionSection}>
                        <div className={styles.questionNumber}>
                            Вопрос {currentQuestionIndex + 1} из {questions.length}
                        </div>
                        <QuestionDisplay
                            question={currentQuestion}
                            selectedOptionId={currentSelectedOptionId}
                            selectedOptionIds={currentSelectedOptionIds}
                            textAnswer={currentTextAnswer}
                            onAnswerChange={handleAnswerChange}
                        />
                    </div>

                    <div className={styles.navigation}>
                        {currentQuestionIndex > 0 && (
                            <Button onClick={handlePrevious} variant="secondary">
                                ← Назад
                            </Button>
                        )}
                        {currentQuestionIndex < questions.length - 1 && (
                            <Button onClick={handleNext}>Далее →</Button>
                        )}
                    </div>

                    <QuestionIndicators
                        totalQuestions={questions.length}
                        currentQuestion={currentQuestionIndex}
                        answeredQuestions={answeredSet}
                        onQuestionClick={handleQuestionJump}
                    />
                </div>
            )}

            <Modal
                isOpen={isConfirmModalOpen}
                title="Завершить тест?"
                message="Вы уверены, что хотите завершить тест?"
                onConfirm={handleConfirmSubmit}
                onCancel={() => setIsConfirmModalOpen(false)}
                confirmText="Завершить"
                cancelText="Вернуться"
            />
        </div>
    );
};
