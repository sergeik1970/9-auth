import React, { ReactElement, useEffect, useState } from "react";
import Button from "@/shared/components/Button";
import {
    getTestById,
    getTests,
    selectTest,
    publishTest,
    completeTest,
    archiveTest,
    getTestAttempts,
    updateTest,
} from "@/shared/store/slices/test";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from "@/shared/store/store";
import { useRouter } from "next/router";
import LoadingState from "@/shared/components/LoadingState";
import TestStatus from "@/shared/components/TestStatus";
import { selectAuth } from "@/shared/store/slices/auth";
import { getTestValidationErrors } from "@/shared/utils/testValidation";
import DueDatePicker from "@/shared/components/DueDatePicker";
import Modal from "@/shared/components/Modal";

interface TestPreviewProps {
    isOwner?: boolean;
    isStarting?: boolean;
    onStartTest?: () => void;
    onError?: (error: string) => void;
    testId?: number;
    isActiveAttempt?: boolean;
}

const getWord = (count: number, words: [string, string, string]): string => {
    const remainder10 = count % 10;
    const remainder100 = count % 100;

    if (remainder100 >= 11 && remainder100 <= 19) {
        return words[2];
    }

    if (remainder10 === 1) {
        return words[0];
    }

    if (remainder10 >= 2 && remainder10 <= 4) {
        return words[1];
    }

    return words[2];
};

const getGradeColor = (percentage: number, gradingCriteria?: any): string => {
    if (!gradingCriteria) {
        if (percentage >= 90) return "#22c55e";
        if (percentage >= 70) return "#eab308";
        if (percentage >= 50) return "#f97316";
        return "#ef4444";
    }

    const { excellent = 90, good = 70, satisfactory = 50 } = gradingCriteria;

    if (percentage >= excellent) return "#22c55e";
    if (percentage >= good) return "#eab308";
    if (percentage >= satisfactory) return "#f97316";
    return "#ef4444";
};

const getGrade = (percentage: number, gradingCriteria?: any): number => {
    if (!gradingCriteria) {
        if (percentage >= 90) return 5;
        if (percentage >= 70) return 4;
        if (percentage >= 50) return 3;
        return 2;
    }

    const { excellent = 90, good = 70, satisfactory = 50 } = gradingCriteria;

    if (percentage >= excellent) return 5;
    if (percentage >= good) return 4;
    if (percentage >= satisfactory) return 3;
    return 2;
};

const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const parts: string[] = [];

    if (hours > 0) {
        parts.push(`${hours} ${getWord(hours, ["час", "часа", "часов"])}`);
    }

    if (mins > 0) {
        parts.push(`${mins} ${getWord(mins, ["минута", "минуты", "минут"])}`);
    }

    return parts.join(" ");
};

const formatTimeSpent = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}ч`);
    if (mins > 0) parts.push(`${mins}м`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}с`);

    return parts.join(" ");
};

const formatDeadline = (dueDateString: string): string => {
    if (!dueDateString) return "";

    const date = new Date(dueDateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
};

const TestPreview = ({
    isOwner = false,
    isStarting = false,
    onStartTest,
    onError,
    testId,
    isActiveAttempt = false,
}: TestPreviewProps): ReactElement => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = useSelector(selectAuth);
    const {
        selectedTest: test,
        selectedLoading: isLoading,
        error,
        testAttempts,
        testAttemptsLoading,
    } = useSelector(selectTest);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [editingDueDate, setEditingDueDate] = useState<string | undefined>(undefined);
    const [showEarlyCompleteModal, setShowEarlyCompleteModal] = useState(false);

    // Получаем ID теста из URL, если не передан через props
    const id = testId || (router.query.id ? Number(router.query.id) : undefined);

    useEffect(() => {
        // Загружаем тест при монтировании компонента, если есть ID
        if (id) {
            dispatch(getTestById(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [error, onError]);

    useEffect(() => {
        if (test) {
            console.log("Test loaded:", { dueDate: test.dueDate, status: test.status });
            const errors = getTestValidationErrors({
                title: test.title,
                description: test.description,
                timeLimit: test.timeLimit,
                questions: test.questions || [],
            });
            setValidationErrors(errors);
            setEditingDueDate(test.dueDate);
        }
    }, [test]);

    useEffect(() => {
        if (id) {
            dispatch(getTestAttempts(id));
        }
    }, [dispatch, id]);

    const handlePublish = async () => {
        if (!test?.id) return;
        if (validationErrors.length > 0) {
            alert("Тест не может быть опубликован. Пожалуйста, исправьте все ошибки валидации.");
            return;
        }

        if (!editingDueDate) {
            alert("Пожалуйста, установите срок выполнения перед публикацией теста.");
            return;
        }

        const now = new Date();
        const minDate = new Date(now.getTime() + 10 * 60 * 1000);
        const selectedDate = new Date(editingDueDate);

        if (selectedDate < minDate) {
            alert("Срок выполнения должен быть не менее чем на 10 минут позже текущего времени.");
            return;
        }

        try {
            setIsPublishing(true);

            await dispatch(
                updateTest({
                    testId: test.id,
                    testData: {
                        title: test.title,
                        description: test.description,
                        timeLimit: test.timeLimit,
                        dueDate: editingDueDate,
                        questions: test.questions || [],
                    },
                }),
            ).unwrap();

            await dispatch(publishTest(test.id)).unwrap();
            await dispatch(getTestById(test.id));
        } catch (err) {
            console.error("Error publishing test:", err);
            alert(err instanceof Error ? err.message : "Ошибка при публикации теста");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleComplete = async () => {
        if (!test?.id) return;
        if (validationErrors.length > 0) {
            alert("Тест не может быть завершен. Пожалуйста, исправьте все ошибки валидации.");
            return;
        }

        if (test.dueDate) {
            const now = new Date();
            const dueDate = new Date(test.dueDate);
            if (now < dueDate) {
                setShowEarlyCompleteModal(true);
                return;
            }
        }

        await proceedWithCompletion();
    };

    const proceedWithCompletion = async () => {
        if (!test?.id) return;
        try {
            setIsCompleting(true);
            await dispatch(completeTest(test.id)).unwrap();
            await dispatch(getTestById(test.id));
        } catch (err) {
            console.error("Error completing test:", err);
            alert(err instanceof Error ? err.message : "Ошибка при завершении теста");
        } finally {
            setIsCompleting(false);
        }
    };

    const handleArchive = async () => {
        if (!test?.id) return;
        if (validationErrors.length > 0) {
            alert("Тест не может быть архивирован. Пожалуйста, исправьте все ошибки валидации.");
            return;
        }
        try {
            setIsArchiving(true);
            await dispatch(archiveTest(test.id)).unwrap();
            await dispatch(getTestById(test.id));
        } catch (err) {
            console.error("Error archiving test:", err);
            alert(err instanceof Error ? err.message : "Ошибка при архивировании теста");
        } finally {
            setIsArchiving(false);
        }
    };

    if (isLoading) {
        return <LoadingState message="Загрузка теста..." />;
    }

    if (!test) {
        return <div className={styles.error}>Тест не найден</div>;
    }

    return (
        <div className={styles.content}>
            <div className={styles.info}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "16px",
                    }}
                >
                    <h2 className={styles.title} style={{ margin: 0 }}>
                        {test.title}
                    </h2>
                    <TestStatus status={test.status} />
                </div>
                <div className={styles.infoItem}>
                    <strong>Описание:</strong>
                    <p>{test.description || "Описание не указано"}</p>
                </div>
                <div className={styles.infoItem}>
                    <strong>Время на прохождение:</strong>
                    <p>{test.timeLimit ? formatTime(test.timeLimit) : "Не ограничено"}</p>
                </div>
                {isOwner && (test.status === "draft" || test.status === "completed") && (
                    <div className={styles.infoItem}>
                        <strong style={{ marginBottom: "12px", display: "block" }}>
                            Срок выполнения:
                        </strong>
                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                            <div style={{ width: "280px" }}>
                                <DueDatePicker
                                    value={editingDueDate}
                                    onChange={setEditingDueDate}
                                    disabled={isPublishing || validationErrors.length > 0}
                                />
                            </div>
                            <Button
                                size="small"
                                onClick={handlePublish}
                                disabled={
                                    isPublishing || validationErrors.length > 0 || !editingDueDate
                                }
                                variant="primary"
                                style={{ whiteSpace: "nowrap" }}
                                title={
                                    !editingDueDate
                                        ? "Установите срок выполнения перед публикацией теста."
                                        : validationErrors.length > 0
                                          ? "Тест содержит ошибки валидации. Отредактируйте тест перед публикацией."
                                          : ""
                                }
                            >
                                {isPublishing ? "Публикация..." : "Опубликовать"}
                            </Button>
                        </div>
                    </div>
                )}
                {(() => {
                    const shouldShowForNonOwner = !isOwner && test.dueDate;
                    const shouldShowForOwner = isOwner && test.status !== "draft" && test.dueDate;

                    console.log("Due date display conditions:", {
                        isOwner,
                        status: test.status,
                        dueDate: test.dueDate,
                        shouldShowForNonOwner,
                        shouldShowForOwner,
                    });

                    if (shouldShowForNonOwner || shouldShowForOwner) {
                        return (
                            <div className={styles.infoItem}>
                                <strong>Срок выполнения:</strong>
                                <p>{formatDeadline(test.dueDate)}</p>
                            </div>
                        );
                    }
                    return null;
                })()}

                {/* <div className={styles.infoItem}>
                    <strong>Количество вопросов:</strong>
                    <p>{test.questions.length}</p>
                </div> */}

                {test.creator && (
                    <div className={styles.infoItem}>
                        <strong>Автор:</strong>
                        <p>{test.creator.name}</p>
                    </div>
                )}
            </div>

            {validationErrors.length > 0 && (
                <div className={styles.validationWarning}>
                    <div
                        style={{
                            color: "#991b1b",
                            fontWeight: 600,
                            marginBottom: "8px",
                            fontSize: "15px",
                        }}
                    >
                        ⚠️ Тест содержит ошибки валидации
                    </div>
                    <ul
                        style={{
                            margin: "0",
                            paddingLeft: "20px",
                            color: "#7f1d1d",
                            fontSize: "14px",
                        }}
                    >
                        {validationErrors.map((error, idx) => (
                            <li key={idx} style={{ marginBottom: "4px" }}>
                                {error}
                            </li>
                        ))}
                    </ul>
                    <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
                        Отредактируйте тест, чтобы исправить ошибки перед изменением статуса.
                    </p>
                </div>
            )}

            <div className={styles.actions}>
                {onStartTest && test.status === "active" && !isOwner && (
                    <Button
                        onClick={onStartTest}
                        disabled={isStarting}
                        variant={isActiveAttempt ? "primary" : "outline"}
                    >
                        {isStarting
                            ? "Загрузка..."
                            : isActiveAttempt
                              ? "Продолжить тест"
                              : "Начать тест"}
                    </Button>
                )}
                {isOwner && test.id && test.status === "active" && (
                    <Button
                        onClick={handleComplete}
                        disabled={isCompleting || validationErrors.length > 0}
                        variant="primary"
                        title={
                            validationErrors.length > 0
                                ? "Тест содержит ошибки валидации. Отредактируйте тест перед завершением."
                                : ""
                        }
                    >
                        {isCompleting ? "Завершение..." : "Завершить"}
                    </Button>
                )}
                {isOwner && test.id && test.status === "completed" && (
                    <Button
                        onClick={handleArchive}
                        disabled={isArchiving || validationErrors.length > 0}
                        variant="primary"
                        title={
                            validationErrors.length > 0
                                ? "Тест содержит ошибки валидации. Отредактируйте тест перед архивированием."
                                : ""
                        }
                    >
                        {isArchiving ? "Архивирование..." : "Архивировать"}
                    </Button>
                )}
                {isOwner && test.id && (
                    <Button onClick={() => router.push(`/tests/${test.id}/edit`)} variant="outline">
                        Редактировать
                    </Button>
                )}
            </div>

            {isOwner && testAttempts && testAttempts.length > 0 && (
                <div style={{ marginTop: "32px" }}>
                    <h3 style={{ marginBottom: "16px", fontSize: "18px", fontWeight: 600 }}>
                        Результаты ({testAttempts.length})
                    </h3>
                    <div
                        style={{
                            overflowX: "auto",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: "14px",
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        backgroundColor: "#f9fafb",
                                        borderBottom: "1px solid #e5e7eb",
                                    }}
                                >
                                    <th
                                        style={{
                                            padding: "12px",
                                            textAlign: "left",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Ученик
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px 6px",
                                            textAlign: "center",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Оценка
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px 8px",
                                            textAlign: "center",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Баллы
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px 8px",
                                            textAlign: "center",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Результат
                                    </th>
                                    <th
                                        style={{
                                            padding: "12px 8px",
                                            textAlign: "center",
                                            fontWeight: 600,
                                            color: "#374151",
                                        }}
                                    >
                                        Время
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {testAttempts.map((attempt: any, idx: number) => (
                                    <tr
                                        key={attempt.id || idx}
                                        style={{
                                            borderBottom: "1px solid #e5e7eb",
                                            transition: "background-color 0.2s ease",
                                            cursor: "pointer",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "transparent";
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: "12px",
                                                color: "#1f2937",
                                            }}
                                        >
                                            {attempt.studentName || "Неизвестный"}
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px 6px",
                                                textAlign: "center",
                                                fontWeight: 600,
                                                fontSize: "14px",
                                                color: getGradeColor(
                                                    attempt.percentage || 0,
                                                    user?.gradingCriteria,
                                                ),
                                                minWidth: "50px",
                                            }}
                                        >
                                            {getGrade(
                                                attempt.percentage || 0,
                                                user?.gradingCriteria,
                                            )}
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px 8px",
                                                textAlign: "center",
                                                color: "#1f2937",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {attempt.correctAnswers || 0}/
                                            {attempt.totalQuestions || 0}
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px 8px",
                                                textAlign: "center",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: "8px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        height: "8px",
                                                        backgroundColor: "#e5e7eb",
                                                        width: "100px",
                                                        borderRadius: "4px",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            height: "100%",
                                                            backgroundColor: getGradeColor(
                                                                attempt.percentage || 0,
                                                                user?.gradingCriteria,
                                                            ),
                                                            width: (attempt.percentage || 0) + "%",
                                                            transition: "width 0.3s ease",
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    style={{
                                                        color: "#6b7280",
                                                        fontSize: "12px",
                                                        minWidth: "35px",
                                                    }}
                                                >
                                                    {attempt.percentage || 0}%
                                                </span>
                                            </div>
                                        </td>
                                        <td
                                            style={{
                                                padding: "12px 8px",
                                                textAlign: "center",
                                                color: "#6b7280",
                                                fontSize: "13px",
                                            }}
                                        >
                                            {attempt.timeSpent
                                                ? formatTimeSpent(attempt.timeSpent)
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal
                isOpen={showEarlyCompleteModal}
                title="Завершить тест раньше срока?"
                message="Вы пытаетесь завершить тест раньше установленного срока. Некоторые ученики могут не успеть закончить свои попытки прохождения теста. Вы уверены, что хотите завершить тест сейчас?"
                onConfirm={() => {
                    setShowEarlyCompleteModal(false);
                    proceedWithCompletion();
                }}
                onCancel={() => {
                    setShowEarlyCompleteModal(false);
                }}
                confirmText="Да, завершить"
                cancelText="Отмена"
            />
        </div>
    );
};

export default TestPreview;
