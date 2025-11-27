import React, { ReactElement, useEffect, useState } from "react";
import Button from "@/shared/components/Button";
import {
    getTestById,
    getTests,
    selectTest,
    publishTest,
    completeTest,
    archiveTest,
} from "@/shared/store/slices/test";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from "@/shared/store/store";
import { useRouter } from "next/router";
import LoadingState from "@/shared/components/LoadingState";
import TestStatus from "@/shared/components/TestStatus";
import { selectAuth } from "@/shared/store/slices/auth";
import { getTestValidationErrors } from "@/shared/utils/testValidation";

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
    const { selectedTest: test, selectedLoading: isLoading, error } = useSelector(selectTest);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

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
            const errors = getTestValidationErrors({
                title: test.title,
                description: test.description,
                timeLimit: test.timeLimit,
                questions: test.questions || [],
            });
            setValidationErrors(errors);
        }
    }, [test]);

    const handlePublish = async () => {
        if (!test?.id) return;
        if (validationErrors.length > 0) {
            alert("Тест не может быть опубликован. Пожалуйста, исправьте все ошибки валидации.");
            return;
        }
        try {
            setIsPublishing(true);
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
                {onStartTest && test.status === "active" && (
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
                {isOwner &&
                    test.id &&
                    (test.status === "draft" ||
                        test.status === "completed" ||
                        test.status === "archived") && (
                        <Button
                            onClick={handlePublish}
                            disabled={isPublishing || validationErrors.length > 0}
                            variant="primary"
                            title={
                                validationErrors.length > 0
                                    ? "Тест содержит ошибки валидации. Отредактируйте тест перед публикацией."
                                    : ""
                            }
                        >
                            {isPublishing ? "Публикация..." : "Опубликовать"}
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
        </div>
    );
};

export default TestPreview;
