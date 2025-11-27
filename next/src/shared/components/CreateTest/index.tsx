import React, { ReactElement, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "@/shared/store/store";
import Button from "@/shared/components/Button";
import styles from "./index.module.scss";
import TestInfoForm, { TestInfoData } from "@/shared/components/TestInfoForm";
import Questions from "@/shared/components/Questions";
import { isTeacher } from "@/shared/utils/roles";
import { createTest } from "@/shared/store/slices/test";
import { selectAuth } from "@/shared/store/slices/auth";
import { QuestionFormData } from "@/shared/types/question";
import { getTestValidationErrors } from "@/shared/utils/testValidation";

export interface TestForm {
    title: string;
    description: string;
    timeLimit: number;
    questions: QuestionFormData[];
}

interface CreateTestProps {
    onSuccess?: (testId: string) => void;
    onError?: (error: string) => void;
}

const DRAFT_STORAGE_KEY = "createTest_draft";
const AUTO_SAVE_DELAY = 2000;

const CreateTest = ({ onSuccess, onError }: CreateTestProps): ReactElement => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [testInfo, setTestInfo] = useState<TestInfoData>({
        title: "",
        description: "",
        timeLimit: undefined,
    });
    const [questions, setQuestions] = useState<QuestionFormData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidationOpen, setIsValidationOpen] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
    const { user } = useSelector(selectAuth);

    const hasAccess = user && isTeacher(user.role);

    useEffect(() => {
        if (!hasAccess) {
            router.push("/dashboard");
        }
    }, [hasAccess, router]);

    const saveDraftToStorage = (info: TestInfoData, qs: QuestionFormData[]) => {
        try {
            const draftData = { testInfo: info, questions: qs };
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
            setAutoSaveStatus("saved");
            setTimeout(() => setAutoSaveStatus("idle"), 2000);
        } catch (error) {
            console.error("Error saving draft to localStorage:", error);
        }
    };

    const loadDraftFromStorage = () => {
        try {
            const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (stored) {
                const { testInfo: savedInfo, questions: savedQuestions } = JSON.parse(stored);
                setTestInfo(savedInfo);
                setQuestions(savedQuestions);
            }
        } catch (error) {
            console.error("Error loading draft from localStorage:", error);
        }
    };

    const clearDraftFromStorage = () => {
        try {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
        } catch (error) {
            console.error("Error clearing draft from localStorage:", error);
        }
    };

    useEffect(() => {
        loadDraftFromStorage();
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }

        setAutoSaveStatus("saving");

        const timeout = setTimeout(() => {
            saveDraftToStorage(testInfo, questions);
        }, AUTO_SAVE_DELAY);

        setAutoSaveTimeout(timeout);

        return () => clearTimeout(timeout);
    }, [testInfo, questions]);

    if (!hasAccess) {
        return <div>Загрузка...</div>; // Или null, но лучше показать что-то
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await dispatch(
                createTest({
                    title: testInfo.title,
                    description: testInfo.description,
                    timeLimit: testInfo.timeLimit,
                    questions: questions,
                }),
            ).unwrap();

            clearDraftFromStorage();
            router.push("/dashboard");
        } catch (error) {
            if (onError) {
                onError(error as string);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getValidationErrors = () => {
        return getTestValidationErrors({
            title: testInfo.title,
            description: testInfo.description,
            timeLimit: testInfo.timeLimit,
            questions,
        });
    };

    const validationErrors = getValidationErrors();
    const isFormValid = validationErrors.length === 0;

    const getErrorElementId = (error: string): string => {
        if (error.includes("Название теста")) return "field-title";
        if (error.includes("Описание теста")) return "field-description";
        if (error.includes("Время для прохождения")) return "field-timeLimit";
        if (error.includes("Минимум один вопрос")) return "questions-section";
        if (error.includes("Вопрос")) {
            const match = error.match(/Вопрос (\d+)/);
            if (match) {
                return `question-${parseInt(match[1]) - 1}`;
            }
        }
        return "";
    };

    const handleErrorClick = (error: string) => {
        const elementId = getErrorElementId(error);
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setIsValidationOpen(false);
    };

    return (
        <div className={styles.createTest}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                        }}
                    >
                        <div>
                            <h1 className={styles.title}>Создание нового теста</h1>
                            <p className={styles.description}>
                                Заполните информацию о тесте и добавьте вопросы
                            </p>
                        </div>
                        {autoSaveStatus !== "idle" && (
                            <div
                                style={{
                                    fontSize: "13px",
                                    color: autoSaveStatus === "saved" ? "#22c55e" : "#6b7280",
                                    marginTop: "4px",
                                    fontWeight: 500,
                                }}
                            >
                                {autoSaveStatus === "saving" && "💾 Сохраняется..."}
                                {autoSaveStatus === "saved" && "✓ Сохранено"}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {validationErrors.length > 0 && (
                <div
                    className={`${styles.floatingValidationPanel} ${isValidationOpen ? styles.open : ""}`}
                >
                    <button
                        className={styles.validationToggleButton}
                        onClick={() => setIsValidationOpen(!isValidationOpen)}
                        title="Показать ошибки валидации"
                        type="button"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        <span className={styles.errorCount}>{validationErrors.length}</span>
                    </button>
                    {isValidationOpen && (
                        <div className={styles.validationContent}>
                            <p className={styles.validationTitle}>Не заполнено:</p>
                            <ul>
                                {validationErrors.map((error, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => handleErrorClick(error)}
                                        className={styles.errorItem}
                                    >
                                        {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <TestInfoForm data={testInfo} onChange={setTestInfo} disabled={isLoading} />

                <Questions questions={questions} onChange={setQuestions} disabled={isLoading} />

                <div className={styles.actions}>
                    {validationErrors.length > 0 && (
                        <div className={styles.validationErrors}>
                            <p className={styles.validationTitle}>Не заполнено:</p>
                            <ul>
                                {validationErrors.map((error, idx) => (
                                    <li
                                        key={idx}
                                        onClick={() => handleErrorClick(error)}
                                        className={styles.errorItem}
                                    >
                                        {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <Button type="submit" variant="primary" disabled={isLoading || !isFormValid}>
                        {isLoading ? "Создание..." : "Создать тест"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateTest;
