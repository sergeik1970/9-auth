import { useState, useCallback, useEffect } from "react";
import { TestAttempt, TestAnswer } from "@/shared/types/test";

interface UseTestAttemptProps {
    testId: number;
    attemptId?: number;
}

export const useTestAttempt = ({ testId, attemptId }: UseTestAttemptProps) => {
    const [attempt, setAttempt] = useState<TestAttempt | null>(null);
    const [answers, setAnswers] = useState<Map<number, TestAnswer>>(new Map());
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (attemptId) {
            loadAttempt();
        } else {
            createAttempt();
        }
    }, [testId, attemptId]);

    const loadAttempt = useCallback(async () => {
        try {
            const response = await fetch(`/api/tests/${testId}/attempts/${attemptId}`);
            if (!response.ok) throw new Error("Failed to load attempt");
            const data = await response.json();
            setAttempt(data);

            const answersMap = new Map();
            data.answers?.forEach((answer: TestAnswer) => {
                const normalizedAnswer = {
                    ...answer,
                    selectedOptionIds: typeof answer.selectedOptionIds === 'string'
                        ? JSON.parse(answer.selectedOptionIds || '[]')
                        : (Array.isArray(answer.selectedOptionIds) ? answer.selectedOptionIds : [])
                };
                answersMap.set(answer.questionId, normalizedAnswer);
            });
            setAnswers(answersMap);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        }
    }, [testId, attemptId]);

    const createAttempt = useCallback(async () => {
        try {
            const response = await fetch(`/api/tests/${testId}/attempts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to create attempt");
            }
            const data = await response.json();
            setAttempt(data);
            setAnswers(new Map());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        }
    }, [testId]);

    const saveAnswer = useCallback(
        async (
            questionId: number,
            selectedOptionId?: number,
            selectedOptionIds?: number[],
            textAnswer?: string,
        ) => {
            if (!attempt) return;

            setIsSaving(true);
            setError(null);
            try {
                const response = await fetch(
                    `/api/tests/${testId}/attempts/${attempt.id}/answers`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            questionId,
                            selectedOptionId,
                            selectedOptionIds,
                            textAnswer,
                        }),
                    },
                );

                if (!response.ok) throw new Error("Failed to save answer");
                const savedAnswer = await response.json();

                setAnswers((prev) => {
                    const newAnswers = new Map(prev);
                    const normalizedAnswer = {
                        ...savedAnswer,
                        selectedOptionIds: typeof savedAnswer.selectedOptionIds === 'string'
                            ? JSON.parse(savedAnswer.selectedOptionIds || '[]')
                            : (Array.isArray(savedAnswer.selectedOptionIds) ? savedAnswer.selectedOptionIds : [])
                    };
                    newAnswers.set(questionId, normalizedAnswer);
                    return newAnswers;
                });
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setIsSaving(false);
            }
        },
        [testId, attempt],
    );

    const submitTest = useCallback(async () => {
        if (!attempt) return;

        setIsSaving(true);
        try {
            const response = await fetch(`/api/tests/${testId}/attempts/${attempt.id}/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });

            if (!response.ok) throw new Error("Failed to submit test");
            const results = await response.json();
            return results;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            throw err;
        } finally {
            setIsSaving(false);
        }
    }, [testId, attempt]);

    const isAnswered = useCallback((questionId: number) => answers.has(questionId), [answers]);

    return {
        attempt,
        answers,
        isSaving,
        error,
        saveAnswer,
        submitTest,
        isAnswered,
    };
};
