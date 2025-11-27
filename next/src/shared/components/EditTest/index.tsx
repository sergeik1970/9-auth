import React, { ReactElement, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "@/shared/store/store";
import Button from "@/shared/components/Button";
import Modal from "@/shared/components/Modal";
import LoadingState from "@/shared/components/LoadingState";
import TestInfoForm, { TestInfoData } from "@/shared/components/TestInfoForm";
import Questions from "@/shared/components/Questions";
import { QuestionFormData } from "@/shared/types/question";
import styles from "./index.module.scss";
import { getTestById, updateTest, autoSaveTest, saveTestAsDraft } from "@/shared/store/slices/test";
import { getTestValidationErrors } from "@/shared/utils/testValidation";

interface EditTestProps {
    testId: number;
}

interface SavePayload {
    title: string;
    description: string;
    timeLimit?: number;
    questions: QuestionFormData[];
}

const AUTO_SAVE_DELAY = 3000;

const EditTest = ({ testId }: EditTestProps): ReactElement => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [testInfo, setTestInfo] = useState<TestInfoData>({
        title: "",
        description: "",
        timeLimit: undefined,
    });
    const [questions, setQuestions] = useState<QuestionFormData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isValidationOpen, setIsValidationOpen] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
    const { selectedTest } = useSelector((state) => state.test);

    useEffect(() => {
        dispatch(getTestById(testId));
    }, [dispatch, testId]);

    useEffect(() => {
        if (selectedTest) {
            setTestInfo({
                title: selectedTest.title,
                description: selectedTest.description || "",
                timeLimit: selectedTest.timeLimit,
            });

            const formattedQuestions = (selectedTest.questions || []).map((q) => ({
                text: q.text,
                type: q.type as "single_choice" | "multiple_choice" | "text_input",
                order: q.order,
                options: (q.options || []).map((opt) => ({
                    text: opt.text,
                    isCorrect: opt.isCorrect,
                    order: opt.order,
                })),
                correctTextAnswer: q.correctTextAnswer,
            }));
            setQuestions(formattedQuestions);
            setIsLoading(false);
        }
    }, [selectedTest]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }

        if (!selectedTest || isSaving) {
            return;
        }

        setAutoSaveStatus("saving");

        const timeout = setTimeout(async () => {
            try {
                await dispatch(
                    autoSaveTest({
                        testId: selectedTest.id!,
                        testData: {
                            title: testInfo.title,
                            description: testInfo.description,
                            timeLimit: testInfo.timeLimit,
                            questions,
                        },
                    }),
                ).unwrap();

                setAutoSaveStatus("saved");
                setTimeout(() => setAutoSaveStatus("idle"), 2000);
            } catch (error) {
                console.error("Auto-save error:", error);
                setAutoSaveStatus("idle");
            }
        }, AUTO_SAVE_DELAY);

        setAutoSaveTimeout(timeout);

        return () => clearTimeout(timeout);
    }, [testInfo, questions, selectedTest, isSaving, dispatch]);

    const handleSaveClick = () => {
        const errors = getValidationErrors();
        if (errors.length > 0) {
            return;
        }
        setIsConfirmModalOpen(true);
    };

    const handleConfirmSave = async () => {
        setIsSaving(true);
        try {
            const testData: SavePayload = {
                title: testInfo.title,
                description: testInfo.description,
                timeLimit: testInfo.timeLimit,
                questions: questions,
            };

            const result = await dispatch(
                updateTest({
                    testId,
                    testData,
                }),
            ).unwrap();

            router.push("/dashboard");
        } catch (error) {
            console.error("Error saving test:", error);
            alert(error instanceof Error ? error.message : "Ошибка при сохранении теста");
        } finally {
            setIsSaving(false);
            setIsConfirmModalOpen(false);
        }
    };

    const handleSaveDraft = async () => {
        setIsSaving(true);
        try {
            const testData: SavePayload = {
                title: testInfo.title,
                description: testInfo.description,
                timeLimit: testInfo.timeLimit,
                questions: questions,
            };

            await dispatch(
                saveTestAsDraft({
                    testId,
                    testData,
                }),
            ).unwrap();

            alert("Тест сохранен как черновик");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error saving draft:", error);
            alert(error instanceof Error ? error.message : "Ошибка при сохранении черновика");
        } finally {
            setIsSaving(false);
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

    if (isLoading) {
        return <LoadingState message="Загрузка теста..." />;
    }

    return (
        <div className={styles.editTest}>
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
                            <h1 className={styles.title}>Редактирование теста</h1>
                            <p className={styles.description}>
                                Измените информацию о тесте и вопросы
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

            <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
                <TestInfoForm data={testInfo} onChange={setTestInfo} disabled={isSaving} />

                <Questions questions={questions} onChange={setQuestions} disabled={isSaving} />

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
                    <div className={styles.buttonGroup}>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/dashboard")}
                            disabled={isSaving}
                        >
                            Отмена
                        </Button>
                        <Button onClick={handleSaveDraft} variant="outline" disabled={isSaving}>
                            {isSaving ? "Сохранение..." : "Сохранить как черновик"}
                        </Button>
                        <Button
                            onClick={handleSaveClick}
                            variant="primary"
                            disabled={isSaving || !isFormValid}
                        >
                            {isSaving ? "Сохранение..." : "Сохранить изменения"}
                        </Button>
                    </div>
                </div>
            </form>

            <Modal
                isOpen={isConfirmModalOpen}
                title="Сохранить изменения?"
                message="Все изменения будут сохранены. Существующие или начатые попытки могут быть затронуты. Вы уверены?"
                onConfirm={handleConfirmSave}
                onCancel={() => setIsConfirmModalOpen(false)}
                confirmText="Сохранить"
                cancelText="Отмена"
            />
        </div>
    );
};

export default EditTest;
