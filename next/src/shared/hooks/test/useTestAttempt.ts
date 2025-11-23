import { useState, useCallback, useEffect } from "react";
import { TestAttempt, TestAnswer } from "@/shared/types/test";
import { useDispatch } from "@/shared/store/store";
import { getActiveAttempts } from "@/shared/store/slices/test";

interface UseTestAttemptProps {
    testId: number;
    attemptId?: number;
    onAttemptCreated?: (attemptId: number) => void;
    onAttemptUnavailable?: (attemptId: number) => void;
}

export const useTestAttempt = ({
    testId,
    attemptId,
    onAttemptCreated,
    onAttemptUnavailable,
}: UseTestAttemptProps) => {
    const dispatch = useDispatch();
    const [attempt, setAttempt] = useState<TestAttempt | null>(null);
    const [answers, setAnswers] = useState<Map<number, TestAnswer>>(new Map());
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);

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
            if (!response.ok) {
                if (response.status === 410 || response.status === 403) {
                    const errorData = await response.json();
                    const errorMessage =
                        errorData.message ||
                        "Время прохождения теста истекло или попытка больше недоступна";

                    if (attemptId && errorMessage.includes("уже завершена")) {
                        onAttemptUnavailable?.(attemptId);
                    }

                    throw new Error(errorMessage);
                }
                throw new Error("Failed to load attempt");
            }
            const data = await response.json();
            const { serverTime, ...attemptData } = data;

            if (serverTime) {
                const offset = serverTime - Date.now();
                setServerTimeOffset(offset);
            }

            setAttempt(attemptData);

            const answersMap = new Map();
            attemptData.answers?.forEach((answer: TestAnswer) => {
                const normalizedAnswer = {
                    ...answer,
                    selectedOptionIds:
                        typeof answer.selectedOptionIds === "string"
                            ? JSON.parse(answer.selectedOptionIds || "[]")
                            : Array.isArray(answer.selectedOptionIds)
                              ? answer.selectedOptionIds
                              : [],
                };
                answersMap.set(answer.questionId, normalizedAnswer);
            });
            setAnswers(answersMap);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        }
    }, [testId, attemptId, onAttemptUnavailable]);

    const createAttempt = useCallback(async () => {
        try {
            const response = await fetch(`/api/tests/${testId}/attempts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({}),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to create attempt");
            }
            const data = await response.json();
            const { serverTime, ...attemptData } = data;

            if (serverTime) {
                const offset = serverTime - Date.now();
                setServerTimeOffset(offset);
            }

            setAttempt(attemptData);
            setAnswers(new Map());
            dispatch(getActiveAttempts());
            if (onAttemptCreated && attemptData.id) {
                onAttemptCreated(attemptData.id);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        }
    }, [testId, onAttemptCreated, dispatch]);

    const saveAnswer = useCallback(
        async (
            questionId: number,
            selectedOptionId?: number,
            selectedOptionIds?: number[],
            textAnswer?: string,
        ) => {
            if (!attempt) return;

            setError(null);

            const newAnswer = {
                questionId,
                selectedOptionId,
                selectedOptionIds: selectedOptionIds || [],
                textAnswer,
            } as unknown as TestAnswer;

            setAnswers((prev) => {
                const newAnswers = new Map(prev);
                newAnswers.set(questionId, newAnswer);
                return newAnswers;
            });

            setIsSaving(true);
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
                        selectedOptionIds:
                            typeof savedAnswer.selectedOptionIds === "string"
                                ? JSON.parse(savedAnswer.selectedOptionIds || "[]")
                                : Array.isArray(savedAnswer.selectedOptionIds)
                                  ? savedAnswer.selectedOptionIds
                                  : [],
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

        setIsSubmitting(true);
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
            setIsSubmitting(false);
        }
    }, [testId, attempt]);

    const isAnswered = useCallback((questionId: number) => answers.has(questionId), [answers]);

    return {
        attempt,
        answers,
        isSaving,
        isSubmitting,
        error,
        saveAnswer,
        submitTest,
        isAnswered,
        serverTimeOffset,
    };
};
