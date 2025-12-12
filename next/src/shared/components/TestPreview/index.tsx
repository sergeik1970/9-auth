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
import { ClassSchedule } from "@/shared/types/test";

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
    if (!seconds || seconds < 0) return "0с";

    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

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
    const [editingClassSchedules, setEditingClassSchedules] = useState<ClassSchedule[]>([]);
    const [showEarlyCompleteModal, setShowEarlyCompleteModal] = useState(false);
    const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
    const [collapsingStudents, setCollapsingStudents] = useState<Set<string>>(new Set());
    const [errorModal, setErrorModal] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);

    // Получаем ID теста из URL, если не передан через props
    const id = testId || (router.query.id ? Number(router.query.id) : undefined);

    useEffect(() => {
        // Загружаем тест при монтировании компонента, если есть ID
        // Всегда перезагружаем свежие данные, чтобы получить актуальные даты
        if (id) {
            dispatch(getTestById(id));
        }
    }, [dispatch, id]);

    // При фокусе на окно - обновляем данные теста и попыток
    useEffect(() => {
        const handleFocus = () => {
            if (id) {
                dispatch(getTestById(id));
                dispatch(getTestAttempts(id));
            }
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [dispatch, id]);

    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [error, onError]);

    const hasScheduleChanges = (): boolean => {
        if (!test?.classSchedules) return false;
        if (!editingClassSchedules) return false;
        if (test.classSchedules.length !== editingClassSchedules.length) return true;

        return test.classSchedules.some((original, index) => {
            const current = editingClassSchedules[index];
            if (!current) return true;

            return (
                original.classNumber !== current.classNumber ||
                original.classLetter !== current.classLetter ||
                new Date(original.dueDate).getTime() !== new Date(current.dueDate).getTime() ||
                (original.maxAttempts || 1) !== (current.maxAttempts || 1)
            );
        });
    };

    useEffect(() => {
        if (test) {
            const errors = getTestValidationErrors({
                title: test.title,
                description: test.description,
                timeLimit: test.timeLimit,
                questions: test.questions || [],
            });
            setValidationErrors(errors);
            setEditingClassSchedules(test.classSchedules || []);
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
            setErrorModal(
                "Тест не может быть опубликован. Пожалуйста, исправьте все ошибки валидации.",
            );
            return;
        }

        if (!editingClassSchedules || editingClassSchedules.length === 0) {
            setErrorModal(
                "Пожалуйста, выберите хотя бы один класс и установите срок для публикации теста.",
            );
            return;
        }

        const now = new Date();
        const minDate = new Date(now.getTime() + 10 * 60 * 1000);

        for (const schedule of editingClassSchedules) {
            const selectedDate = new Date(schedule.dueDate);
            if (selectedDate < minDate) {
                setErrorModal(
                    `Срок выполнения для класса ${schedule.classNumber}${schedule.classLetter} должен быть не менее чем на 10 минут позже текущего времени.`,
                );
                return;
            }
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
                        classSchedules: editingClassSchedules,
                        questions: test.questions || [],
                    },
                }),
            ).unwrap();

            if (test.status !== "active") {
                await dispatch(publishTest(test.id)).unwrap();
            }

            await dispatch(getTestById(test.id));
        } catch (err) {
            console.error("Error publishing test:", err);
            setErrorModal(err instanceof Error ? err.message : "Ошибка при публикации теста");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleComplete = async () => {
        if (!test?.id) return;
        if (validationErrors.length > 0) {
            setErrorModal(
                "Тест не может быть завершен. Пожалуйста, исправьте все ошибки валидации.",
            );
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
            setErrorModal(err instanceof Error ? err.message : "Ошибка при завершении теста");
        } finally {
            setIsCompleting(false);
        }
    };

    const getBestAttempt = (attempts: any[]): any => {
        if (attempts.length === 0) return null;
        if (attempts.length === 1) return attempts[0];

        return attempts.reduce((best, current) => {
            const bestPercentage = best.percentage || 0;
            const currentPercentage = current.percentage || 0;

            if (currentPercentage > bestPercentage) return current;
            if (currentPercentage < bestPercentage) return best;

            const bestTime = best.timeSpent || 0;
            const currentTime = current.timeSpent || 0;
            return currentTime < bestTime ? current : best;
        });
    };

    const groupAttemptsByStudent = (attempts: any[]) => {
        const grouped: { [key: string]: any[] } = {};

        attempts.forEach((attempt) => {
            const studentName = attempt.studentName || "Неизвестный";
            if (!grouped[studentName]) {
                grouped[studentName] = [];
            }
            grouped[studentName].push(attempt);
        });

        return grouped;
    };

    const toggleStudentExpanded = (studentName: string) => {
        const newExpanded = new Set(expandedStudents);
        if (newExpanded.has(studentName)) {
            const newCollapsing = new Set(collapsingStudents);
            newCollapsing.add(studentName);
            setCollapsingStudents(newCollapsing);

            setTimeout(() => {
                newExpanded.delete(studentName);
                setExpandedStudents(newExpanded);
                setCollapsingStudents(new Set());
            }, 250);
        } else {
            newExpanded.add(studentName);
            setExpandedStudents(newExpanded);
        }
    };

    const getTestClasses = (): string[] => {
        const classesSet = new Set<string>();

        if (test?.classSchedules) {
            test.classSchedules.forEach((schedule) => {
                classesSet.add(`${schedule.classNumber}${schedule.classLetter?.toUpperCase()}`);
            });
        }

        if (testAttempts && testAttempts.length > 0) {
            testAttempts.forEach((attempt) => {
                classesSet.add(`${attempt.classNumber}${attempt.classLetter?.toUpperCase()}`);
            });
        }

        return Array.from(classesSet).sort();
    };

    const filterAttemptsByClass = (attempts: any[], classKey: string | null) => {
        if (!classKey) return attempts;
        return attempts.filter((attempt) => {
            const attemptClass = `${attempt.classNumber}${attempt.classLetter}`;
            return attemptClass === classKey;
        });
    };

    const getUniqueStudentCount = (attempts: any[]): number => {
        const uniqueUserIds = new Set(attempts.map((attempt) => attempt.userId));
        return uniqueUserIds.size;
    };

    const getRemainingAttempts = (schedule?: ClassSchedule): number | null => {
        if (!schedule || schedule.maxAttempts === undefined) return null;

        const studentAttempts = testAttempts.filter(
            (attempt) =>
                attempt.userId === user?.id &&
                attempt.classNumber === schedule.classNumber &&
                attempt.classLetter?.toUpperCase() === schedule.classLetter?.toUpperCase() &&
                attempt.status === "completed",
        ).length;

        return Math.max(0, schedule.maxAttempts - studentAttempts);
    };

    const handleArchive = async () => {
        if (!test?.id) return;
        if (validationErrors.length > 0) {
            setErrorModal(
                "Тест не может быть архивирован. Пожалуйста, исправьте все ошибки валидации.",
            );
            return;
        }
        try {
            setIsArchiving(true);
            await dispatch(archiveTest(test.id)).unwrap();
            await dispatch(getTestById(test.id));
        } catch (err) {
            console.error("Error archiving test:", err);
            setErrorModal(err instanceof Error ? err.message : "Ошибка при архивировании теста");
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

    const userSchedule = test.classSchedules?.[0];

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
                {isOwner &&
                    (test.status === "draft" ||
                        test.status === "active" ||
                        test.status === "completed" ||
                        test.status === "archived") && (
                        <div className={styles.infoItem}>
                            <strong style={{ marginBottom: "12px", display: "block" }}>
                                Классы и сроки выполнения:
                            </strong>
                            <div style={{ marginBottom: "16px" }}>
                                {editingClassSchedules.map((schedule, index) => (
                                    <div
                                        key={`${schedule.classNumber}-${schedule.classLetter}-${index}`}
                                        style={{
                                            display: "flex",
                                            gap: "12px",
                                            alignItems: "flex-end",
                                            marginBottom: "12px",
                                            padding: "12px",
                                            border: "1px solid #ddd",
                                            borderRadius: "4px",
                                            backgroundColor: "#f9f9f9",
                                        }}
                                    >
                                        <div>
                                            <label
                                                style={{
                                                    display: "block",
                                                    marginBottom: "4px",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                Класс
                                            </label>
                                            <div style={{ display: "flex", gap: "4px" }}>
                                                <select
                                                    value={schedule.classNumber}
                                                    onChange={(e) => {
                                                        const updated = [...editingClassSchedules];
                                                        updated[index] = {
                                                            ...updated[index],
                                                            classNumber: parseInt(e.target.value),
                                                        };
                                                        setEditingClassSchedules(updated);
                                                    }}
                                                    disabled={isPublishing}
                                                    style={{
                                                        padding: "6px",
                                                        borderRadius: "4px",
                                                        border: "1px solid #ccc",
                                                    }}
                                                >
                                                    {Array.from(
                                                        { length: 11 },
                                                        (_, i) => i + 1,
                                                    ).map((num) => (
                                                        <option key={num} value={num}>
                                                            {num}
                                                        </option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={schedule.classLetter}
                                                    onChange={(e) => {
                                                        const updated = [...editingClassSchedules];
                                                        updated[index] = {
                                                            ...updated[index],
                                                            classLetter: e.target.value,
                                                        };
                                                        setEditingClassSchedules(updated);
                                                    }}
                                                    disabled={isPublishing}
                                                    style={{
                                                        padding: "6px",
                                                        borderRadius: "4px",
                                                        border: "1px solid #ccc",
                                                    }}
                                                >
                                                    {Array.from({ length: 32 }, (_, i) =>
                                                        String.fromCharCode(1040 + i),
                                                    ).map((letter) => (
                                                        <option key={letter} value={letter}>
                                                            {letter}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <label
                                                style={{
                                                    display: "block",
                                                    marginBottom: "4px",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                Срок выполнения
                                            </label>
                                            <DueDatePicker
                                                value={schedule.dueDate}
                                                onChange={(newDate) => {
                                                    const updated = [...editingClassSchedules];
                                                    updated[index] = {
                                                        ...updated[index],
                                                        dueDate: newDate,
                                                    };
                                                    setEditingClassSchedules(updated);
                                                }}
                                                disabled={isPublishing}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                style={{
                                                    display: "block",
                                                    marginBottom: "4px",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                Попытки
                                            </label>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "4px",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <button
                                                    onClick={() => {
                                                        const updated = [...editingClassSchedules];
                                                        const currentAttempts =
                                                            updated[index].maxAttempts || 1;
                                                        if (currentAttempts > 1) {
                                                            updated[index] = {
                                                                ...updated[index],
                                                                maxAttempts: currentAttempts - 1,
                                                            };
                                                            setEditingClassSchedules(updated);
                                                        }
                                                    }}
                                                    disabled={
                                                        isPublishing ||
                                                        !schedule.maxAttempts ||
                                                        schedule.maxAttempts <= 1
                                                    }
                                                    style={{
                                                        padding: "4px 8px",
                                                        border: "1px solid #ccc",
                                                        borderRadius: "4px",
                                                        backgroundColor: "#fff",
                                                        cursor: "pointer",
                                                        fontSize: "14px",
                                                        fontWeight: "600",
                                                    }}
                                                    title="Уменьшить"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    value={schedule.maxAttempts || 1}
                                                    onChange={(e) => {
                                                        const value = Math.min(
                                                            Math.max(
                                                                parseInt(e.target.value) || 1,
                                                                1,
                                                            ),
                                                            100,
                                                        );
                                                        const updated = [...editingClassSchedules];
                                                        updated[index] = {
                                                            ...updated[index],
                                                            maxAttempts: value,
                                                        };
                                                        setEditingClassSchedules(updated);
                                                    }}
                                                    disabled={isPublishing}
                                                    style={{
                                                        width: "50px",
                                                        padding: "4px",
                                                        border: "1px solid #ccc",
                                                        borderRadius: "4px",
                                                        textAlign: "center",
                                                        fontSize: "14px",
                                                    }}
                                                    min="1"
                                                    max="100"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const updated = [...editingClassSchedules];
                                                        const currentAttempts =
                                                            updated[index].maxAttempts || 1;
                                                        if (currentAttempts < 100) {
                                                            updated[index] = {
                                                                ...updated[index],
                                                                maxAttempts: currentAttempts + 1,
                                                            };
                                                            setEditingClassSchedules(updated);
                                                        }
                                                    }}
                                                    disabled={
                                                        isPublishing ||
                                                        (schedule.maxAttempts || 1) >= 100
                                                    }
                                                    style={{
                                                        padding: "4px 8px",
                                                        border: "1px solid #ccc",
                                                        borderRadius: "4px",
                                                        backgroundColor: "#fff",
                                                        cursor: "pointer",
                                                        fontSize: "14px",
                                                        fontWeight: "600",
                                                    }}
                                                    title="Увеличить"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {editingClassSchedules.length > 1 && (
                                            <button
                                                onClick={() => {
                                                    setEditingClassSchedules(
                                                        editingClassSchedules.filter(
                                                            (_, i) => i !== index,
                                                        ),
                                                    );
                                                }}
                                                disabled={isPublishing}
                                                style={{
                                                    padding: "6px 12px",
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: "#d32f2f",
                                                    fontSize: "16px",
                                                }}
                                                title="Удалить"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        setEditingClassSchedules([
                                            ...editingClassSchedules,
                                            {
                                                classNumber: 1,
                                                classLetter: "А",
                                                dueDate: "",
                                                maxAttempts: 1,
                                            },
                                        ]);
                                    }}
                                    disabled={isPublishing}
                                    style={{
                                        padding: "8px 12px",
                                        border: "1px dashed #999",
                                        borderRadius: "4px",
                                        backgroundColor: "#fff",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                    }}
                                    title="Добавить класс"
                                >
                                    + Добавить класс
                                </button>
                            </div>

                            <div style={{ display: "flex", gap: "12px" }}>
                                {test.status === "active" ? (
                                    hasScheduleChanges() && (
                                        <Button
                                            size="small"
                                            onClick={handlePublish}
                                            disabled={
                                                isPublishing ||
                                                !editingClassSchedules ||
                                                editingClassSchedules.length === 0 ||
                                                editingClassSchedules.some((s) => !s.dueDate)
                                            }
                                            variant="primary"
                                            style={{ whiteSpace: "nowrap" }}
                                            title={
                                                !editingClassSchedules ||
                                                editingClassSchedules.length === 0
                                                    ? "Добавьте хотя бы один класс со сроком выполнения."
                                                    : editingClassSchedules.some((s) => !s.dueDate)
                                                      ? "Установите срок выполнения для всех классов."
                                                      : ""
                                            }
                                        >
                                            {isPublishing ? "Сохранение..." : "Сохранить сроки"}
                                        </Button>
                                    )
                                ) : (
                                    <Button
                                        size="small"
                                        onClick={handlePublish}
                                        disabled={
                                            isPublishing ||
                                            validationErrors.length > 0 ||
                                            !editingClassSchedules ||
                                            editingClassSchedules.length === 0 ||
                                            editingClassSchedules.some((s) => !s.dueDate)
                                        }
                                        variant="primary"
                                        style={{ whiteSpace: "nowrap" }}
                                        title={
                                            !editingClassSchedules ||
                                            editingClassSchedules.length === 0
                                                ? "Добавьте хотя бы один класс со сроком выполнения."
                                                : editingClassSchedules.some((s) => !s.dueDate)
                                                  ? "Установите срок выполнения для всех классов."
                                                  : validationErrors.length > 0
                                                    ? "Тест содержит ошибки валидации. Отредактируйте тест перед публикацией."
                                                    : ""
                                        }
                                    >
                                        {isPublishing ? "Публикация..." : "Опубликовать"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                {(() => {
                    const shouldShow = test.classSchedules && test.classSchedules.length > 0;

                    if (shouldShow) {
                        const userSchedule =
                            test.classSchedules?.find(
                                (s) =>
                                    s.classNumber === user?.classNumber &&
                                    s.classLetter?.toUpperCase() ===
                                        user?.classLetter?.toUpperCase(),
                            ) || test.classSchedules?.[0];

                        // Для студентов показываем только их срок, для учителей - все сроки по классам
                        if (isOwner) {
                            return (
                                <div className={styles.infoItem}>
                                    <strong>Сроки выполнения по классам:</strong>
                                    <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                                        {test.classSchedules?.map((schedule, idx) => (
                                            <li key={idx}>
                                                Класс {schedule.classNumber}
                                                {schedule.classLetter}:{" "}
                                                {formatDeadline(schedule.dueDate)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        } else {
                            // Для студентов показываем только их срок
                            const remainingAttempts = getRemainingAttempts(userSchedule);
                            return (
                                <div className={styles.infoItem}>
                                    <p style={{ margin: 0 }}>
                                        <strong>Срок выполнения</strong> до{" "}
                                        {formatDeadline(userSchedule?.dueDate || "")}
                                    </p>
                                    {remainingAttempts !== null && (
                                        <p
                                            style={{
                                                margin: "8px 0 0 0",
                                                color:
                                                    remainingAttempts === 0 ? "#dc2626" : "#0891b2",
                                            }}
                                        >
                                            <strong>Осталось попыток:</strong> {remainingAttempts}
                                        </p>
                                    )}
                                </div>
                            );
                        }
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
                        <p>
                            {[test.creator.lastName, test.creator.name, test.creator.patronymic]
                                .filter(Boolean)
                                .join(" ")}
                        </p>
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
                {onStartTest &&
                    test.status === "active" &&
                    !isOwner &&
                    (() => {
                        const userSchedule =
                            test.classSchedules?.find(
                                (s) =>
                                    s.classNumber === user?.classNumber &&
                                    s.classLetter?.toUpperCase() ===
                                        user?.classLetter?.toUpperCase(),
                            ) || test.classSchedules?.[0];
                        const remainingAttempts = getRemainingAttempts(userSchedule);
                        const isAttemptsExhausted = remainingAttempts === 0;

                        return (
                            <Button
                                onClick={onStartTest}
                                disabled={isStarting || isAttemptsExhausted}
                                variant={isActiveAttempt ? "primary" : "outline"}
                                title={isAttemptsExhausted ? "Количество попыток исчерпано" : ""}
                            >
                                {isStarting
                                    ? "Загрузка..."
                                    : isAttemptsExhausted
                                      ? "Нет попыток"
                                      : isActiveAttempt
                                        ? "Продолжить тест"
                                        : "Начать тест"}
                            </Button>
                        );
                    })()}
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

            {!isOwner &&
                user &&
                testAttempts &&
                testAttempts.length > 0 &&
                (() => {
                    const studentCompletedAttempts = testAttempts
                        .filter(
                            (attempt) =>
                                attempt.userId === user.id && attempt.status === "completed",
                        )
                        .sort((a, b) => {
                            const dateA = new Date(a.completedAt || 0).getTime();
                            const dateB = new Date(b.completedAt || 0).getTime();
                            return dateB - dateA;
                        });

                    if (studentCompletedAttempts.length === 0) return null;

                    return (
                        <div style={{ marginTop: "32px" }}>
                            <h3 style={{ marginBottom: "16px", fontSize: "18px", fontWeight: 600 }}>
                                Мои результаты ({studentCompletedAttempts.length})
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
                                                Дата и время
                                            </th>
                                            <th
                                                style={{
                                                    padding: "12px 8px",
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
                                        {studentCompletedAttempts.map((attempt, idx) => (
                                            <tr
                                                key={idx}
                                                style={{
                                                    borderBottom:
                                                        idx < studentCompletedAttempts.length - 1
                                                            ? "1px solid #e5e7eb"
                                                            : "none",
                                                    backgroundColor: "#ffffff",
                                                }}
                                            >
                                                <td
                                                    style={{
                                                        padding: "12px",
                                                        color: "#374151",
                                                    }}
                                                >
                                                    {attempt.completedAt
                                                        ? new Date(
                                                              attempt.completedAt,
                                                          ).toLocaleDateString("ru-RU", {
                                                              day: "2-digit",
                                                              month: "2-digit",
                                                              year: "numeric",
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                          })
                                                        : "-"}
                                                </td>
                                                <td
                                                    style={{
                                                        padding: "12px 8px",
                                                        textAlign: "center",
                                                        color: getGradeColor(
                                                            attempt.percentage || 0,
                                                            user?.gradingCriteria,
                                                        ),
                                                        fontWeight: 600,
                                                        fontSize: "16px",
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
                                                        color: "#1f2937",
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
                                                                    width:
                                                                        Math.round(
                                                                            attempt.percentage || 0,
                                                                        ) + "%",
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
                                                            {Math.round(attempt.percentage || 0)}%
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
                                                        ? `${Math.floor(attempt.timeSpent / 60)}м ${
                                                              attempt.timeSpent % 60
                                                          }с`
                                                        : "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })()}

            {isOwner && testAttempts && testAttempts.length > 0 && (
                <div style={{ marginTop: "32px" }}>
                    <h3 style={{ marginBottom: "16px", fontSize: "18px", fontWeight: 600 }}>
                        Результаты (
                        {getUniqueStudentCount(filterAttemptsByClass(testAttempts, selectedClass))}
                        {selectedClass ? ` из ${getUniqueStudentCount(testAttempts)}` : ""})
                    </h3>
                    {getTestClasses().length > 0 && (
                        <div
                            style={{
                                marginBottom: "16px",
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                onClick={() => setSelectedClass(null)}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "6px",
                                    border:
                                        selectedClass === null
                                            ? "2px solid #10b981"
                                            : "1px solid #d1d5db",
                                    backgroundColor: selectedClass === null ? "#ecfdf5" : "#fff",
                                    color: selectedClass === null ? "#10b981" : "#374151",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: selectedClass === null ? 600 : 500,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                Все классы
                            </button>
                            {getTestClasses().map((classKey) => (
                                <button
                                    key={classKey}
                                    onClick={() => setSelectedClass(classKey)}
                                    style={{
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        border:
                                            selectedClass === classKey
                                                ? "2px solid #3b82f6"
                                                : "1px solid #d1d5db",
                                        backgroundColor:
                                            selectedClass === classKey ? "#eff6ff" : "#fff",
                                        color: selectedClass === classKey ? "#3b82f6" : "#374151",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        fontWeight: selectedClass === classKey ? 600 : 500,
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {classKey}
                                </button>
                            ))}
                        </div>
                    )}
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
                                    <th
                                        style={{
                                            padding: "12px 8px",
                                            textAlign: "center",
                                            fontWeight: 600,
                                            color: "#374151",
                                            width: "40px",
                                        }}
                                    ></th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(
                                    groupAttemptsByStudent(
                                        filterAttemptsByClass(testAttempts, selectedClass),
                                    ),
                                )
                                    .sort(([nameA], [nameB]) => {
                                        const firstNameA = (nameA || "").split(" ")[0] || "";
                                        const firstNameB = (nameB || "").split(" ")[0] || "";
                                        return firstNameA.localeCompare(firstNameB, "ru");
                                    })
                                    .map(([studentName, attempts]) => {
                                        const bestAttempt = getBestAttempt(attempts);
                                        const isExpanded = expandedStudents.has(studentName);
                                        const hasMultipleAttempts = attempts.length > 1;

                                        const allAttemptsSorted = attempts.sort(
                                            (a: any, b: any) => {
                                                const dateA = new Date(a.createdAt || 0).getTime();
                                                const dateB = new Date(b.createdAt || 0).getTime();
                                                return dateA - dateB;
                                            },
                                        );

                                        const attemptNumberMap = new Map(
                                            allAttemptsSorted.map((attempt, index) => [
                                                attempt.id,
                                                index + 1,
                                            ]),
                                        );

                                        const otherAttempts = allAttemptsSorted
                                            .filter((a) => a.id !== bestAttempt.id)
                                            .sort(
                                                (a: any, b: any) =>
                                                    (b.percentage || 0) - (a.percentage || 0),
                                            );

                                        return (
                                            <React.Fragment key={studentName}>
                                                <tr
                                                    style={{
                                                        borderBottom: "1px solid #e5e7eb",
                                                        transition: "background-color 0.2s ease",
                                                        cursor: "pointer",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor =
                                                            "#f3f4f6";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor =
                                                            "transparent";
                                                    }}
                                                >
                                                    <td
                                                        style={{
                                                            padding: "12px",
                                                            color: "#1f2937",
                                                        }}
                                                    >
                                                        {isExpanded && hasMultipleAttempts ? (
                                                            <>
                                                                <div>{studentName}</div>
                                                                <div
                                                                    style={{
                                                                        fontSize: "12px",
                                                                        color: "#6b7280",
                                                                        marginTop: "4px",
                                                                    }}
                                                                >
                                                                    Попытка{" "}
                                                                    {attemptNumberMap.get(
                                                                        bestAttempt.id,
                                                                    )}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            studentName
                                                        )}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "12px 6px",
                                                            textAlign: "center",
                                                            fontWeight: 600,
                                                            fontSize: "14px",
                                                            color: getGradeColor(
                                                                bestAttempt.percentage || 0,
                                                                user?.gradingCriteria,
                                                            ),
                                                            minWidth: "50px",
                                                        }}
                                                    >
                                                        {getGrade(
                                                            bestAttempt.percentage || 0,
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
                                                        {bestAttempt.correctAnswers || 0}/
                                                        {bestAttempt.totalQuestions || 0}
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
                                                                        backgroundColor:
                                                                            getGradeColor(
                                                                                bestAttempt.percentage ||
                                                                                    0,
                                                                                user?.gradingCriteria,
                                                                            ),
                                                                        width:
                                                                            Math.round(
                                                                                bestAttempt.percentage ||
                                                                                    0,
                                                                            ) + "%",
                                                                        transition:
                                                                            "width 0.3s ease",
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
                                                                {Math.round(
                                                                    bestAttempt.percentage || 0,
                                                                )}
                                                                %
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
                                                        {bestAttempt.timeSpent
                                                            ? formatTimeSpent(bestAttempt.timeSpent)
                                                            : "—"}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding: "12px 8px",
                                                            textAlign: "center",
                                                            width: "40px",
                                                        }}
                                                    >
                                                        {hasMultipleAttempts && (
                                                            <button
                                                                onClick={() =>
                                                                    toggleStudentExpanded(
                                                                        studentName,
                                                                    )
                                                                }
                                                                style={{
                                                                    background: "none",
                                                                    border: "none",
                                                                    cursor: "pointer",
                                                                    padding: "4px",
                                                                    fontSize: "16px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    transition:
                                                                        "transform 0.2s ease",
                                                                    transform: isExpanded
                                                                        ? "rotate(180deg)"
                                                                        : "rotate(0deg)",
                                                                }}
                                                            >
                                                                ▼
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                                {(isExpanded ||
                                                    collapsingStudents.has(studentName)) &&
                                                    otherAttempts.map(
                                                        (attempt: any, idx: number) => {
                                                            const attemptNumber =
                                                                attemptNumberMap.get(attempt.id) ||
                                                                idx + 1;
                                                            const isCollapsing =
                                                                collapsingStudents.has(studentName);
                                                            return (
                                                                <tr
                                                                    key={`${studentName}-other-${attempt.id}`}
                                                                    style={{
                                                                        borderBottom:
                                                                            "1px solid #e5e7eb",
                                                                        backgroundColor: "#f9fafb",
                                                                        transition:
                                                                            "max-height 0.25s ease-out, opacity 0.25s ease-out",
                                                                        animation: isCollapsing
                                                                            ? "collapseRow 0.25s ease-out forwards"
                                                                            : "slideIn 0.25s ease-out",
                                                                        overflow: "hidden",
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.backgroundColor =
                                                                            "#f3f4f6";
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.currentTarget.style.backgroundColor =
                                                                            "#f9fafb";
                                                                    }}
                                                                >
                                                                    <td
                                                                        style={{
                                                                            padding:
                                                                                "12px 12px 12px 48px",
                                                                            color: "#6b7280",
                                                                            fontSize: "13px",
                                                                        }}
                                                                    >
                                                                        Попытка {attemptNumber}
                                                                    </td>
                                                                    <td
                                                                        style={{
                                                                            padding: "12px 6px",
                                                                            textAlign: "center",
                                                                            fontWeight: 600,
                                                                            fontSize: "14px",
                                                                            color: getGradeColor(
                                                                                attempt.percentage ||
                                                                                    0,
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
                                                                        {attempt.correctAnswers ||
                                                                            0}
                                                                        /
                                                                        {attempt.totalQuestions ||
                                                                            0}
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
                                                                                alignItems:
                                                                                    "center",
                                                                                justifyContent:
                                                                                    "center",
                                                                                gap: "8px",
                                                                            }}
                                                                        >
                                                                            <div
                                                                                style={{
                                                                                    height: "8px",
                                                                                    backgroundColor:
                                                                                        "#e5e7eb",
                                                                                    width: "100px",
                                                                                    borderRadius:
                                                                                        "4px",
                                                                                    overflow:
                                                                                        "hidden",
                                                                                }}
                                                                            >
                                                                                <div
                                                                                    style={{
                                                                                        height: "100%",
                                                                                        backgroundColor:
                                                                                            getGradeColor(
                                                                                                attempt.percentage ||
                                                                                                    0,
                                                                                                user?.gradingCriteria,
                                                                                            ),
                                                                                        width:
                                                                                            Math.round(
                                                                                                attempt.percentage ||
                                                                                                    0,
                                                                                            ) + "%",
                                                                                        transition:
                                                                                            "width 0.3s ease",
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <span
                                                                                style={{
                                                                                    color: "#6b7280",
                                                                                    fontSize:
                                                                                        "12px",
                                                                                    minWidth:
                                                                                        "35px",
                                                                                }}
                                                                            >
                                                                                {Math.round(
                                                                                    attempt.percentage ||
                                                                                        0,
                                                                                )}
                                                                                %
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
                                                                            ? formatTimeSpent(
                                                                                  attempt.timeSpent,
                                                                              )
                                                                            : "—"}
                                                                    </td>
                                                                    <td />
                                                                </tr>
                                                            );
                                                        },
                                                    )}
                                            </React.Fragment>
                                        );
                                    })}
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

            <Modal
                isOpen={!!errorModal}
                title="Ошибка"
                message={errorModal || ""}
                onCancel={() => {
                    setErrorModal(null);
                }}
                onConfirm={() => {}}
                cancelText="Вернуться"
                hideConfirm
            />
        </div>
    );
};

export default TestPreview;
