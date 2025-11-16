import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTimer, useTestAttempt } from "@/shared/hooks/test";
import { Timer } from "@/shared/components/Timer";
import { QuestionIndicators } from "@/shared/components/QuestionIndicators";
import QuestionDisplay from "@/shared/components/QuestionDisplay";
import Button from "@/shared/components/Button";
import { Test } from "@/shared/types/test";
import { Question } from "@/shared/types/question";
import styles from "./index.module.scss";
import clsx from "clsx";

interface TestTakerProps {
    test: Test;
}

export const TestTaker: React.FC<TestTakerProps> = ({ test }) => {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentSelectedOptionId, setCurrentSelectedOptionId] = useState<number | undefined>();
    const [currentSelectedOptionIds, setCurrentSelectedOptionIds] = useState<number[]>([]);
    const [currentTextAnswer, setCurrentTextAnswer] = useState<string>("");

    const { attempt, answers, isSaving, isSubmitting, saveAnswer, submitTest, isAnswered } =
        useTestAttempt({
            testId: test.id!,
        });

    const { minutes, seconds, isActive, isTimeUp, pause, resume } = useTimer({
        durationSeconds: (test.timeLimit || 60) * 60,
        onTimeUp: () => handleSubmit(),
    });

    useEffect(() => {
        loadQuestions();
    }, [test.id]);

    useEffect(() => {
        if (isTimeUp && attempt) {
            handleSubmit();
        }
    }, [isTimeUp, attempt]);

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

    const currentQuestion = questions[currentQuestionIndex];
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

    const saveCurrentAnswer = async () => {
        if (!currentQuestion) return;
        await saveAnswer(
            currentQuestion.id!,
            currentSelectedOptionId,
            currentSelectedOptionIds,
            currentTextAnswer,
        );
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

    const handleSubmit = async () => {
        try {
            pause();
            await saveCurrentAnswer();
            const results = await submitTest();
            router.push(`/tests/${test.id}/results?attemptId=${results.attemptId}`);
        } catch (error) {
            console.error("Error submitting test:", error);
            resume();
        }
    };

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
                    <Timer
                        minutes={minutes}
                        seconds={seconds}
                        isActive={isActive}
                        isTimeUp={isTimeUp}
                    />
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
                        <Button
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            variant="secondary"
                        >
                            ← Назад
                        </Button>
                        {currentQuestionIndex === questions.length - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                loading={isSubmitting}
                                className={styles.submitBtn}
                            >
                                Завершить тест
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                disabled={currentQuestionIndex === questions.length - 1}
                            >
                                Далее →
                            </Button>
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
        </div>
    );
};
