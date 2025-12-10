import React, { ReactElement, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "@/shared/store/store";
import Button from "@/shared/components/Button";
import Modal from "@/shared/components/Modal";
import LoadingState from "@/shared/components/LoadingState";
import TestInfoForm, { TestInfoData } from "@/shared/components/TestInfoForm";
import Questions from "@/shared/components/Questions";
import { QuestionFormData } from "@/shared/types/question";
import { ClassSchedule } from "@/shared/types/test";
import styles from "./index.module.scss";
import {
    getTestById,
    updateTest,
    autoSaveTest,
    saveTestAsDraft,
    recalculateAttempts,
} from "@/shared/store/slices/test";
import { getTestValidationErrors } from "@/shared/utils/testValidation";

interface EditTestProps {
    testId: number;
}

interface SavePayload {
    title: string;
    description: string;
    timeLimit?: number;
    classSchedules: ClassSchedule[];
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
        allowedClasses: [{ classNumber: 1, classLetter: "А" }],
    });
    const [questions, setQuestions] = useState<QuestionFormData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isValidationOpen, setIsValidationOpen] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
    const [saveDraftModalOpen, setSaveDraftModalOpen] = useState(false);
    const [saveDraftModalType, setSaveDraftModalType] = useState<"success" | "error" | null>(null);
    const [saveDraftErrorMessage, setSaveDraftErrorMessage] = useState("");
    const [recalculateModalOpen, setRecalculateModalOpen] = useState(false);
    const [isRecalculating, setIsRecalculating] = useState(false);
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
                allowedClasses: (selectedTest.classSchedules || []).map((cs) => ({
                    classNumber: cs.classNumber,
                    classLetter: cs.classLetter,
                })),
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

    const hasChanges = (): boolean => {
        if (!selectedTest) return false;

        if (
            testInfo.title !== selectedTest.title ||
            testInfo.description !== selectedTest.description ||
            testInfo.timeLimit !== selectedTest.timeLimit
        ) {
            return true;
        }

        const selectedQuestions = selectedTest.questions || [];
        if (questions.length !== selectedQuestions.length) {
            return true;
        }

        for (let i = 0; i < questions.length; i++) {
            const currentQ = questions[i];
            const originalQ = selectedQuestions[i];

            if (
                currentQ.text !== originalQ.text ||
                currentQ.type !== originalQ.type ||
                currentQ.correctTextAnswer !== originalQ.correctTextAnswer
            ) {
                return true;
            }

            const currentOptions = currentQ.options || [];
            const originalOptions = originalQ.options || [];

            if (currentOptions.length !== originalOptions.length) {
                return true;
            }

            for (let j = 0; j < currentOptions.length; j++) {
                const currentOpt = currentOptions[j];
                const originalOpt = originalOptions[j];

                if (
                    currentOpt.text !== originalOpt.text ||
                    currentOpt.isCorrect !== originalOpt.isCorrect
                ) {
                    return true;
                }
            }
        }

        return false;
    };

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
                            classSchedules: selectedTest.classSchedules || [],
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
        if (!hasChanges()) {
            router.push(`/tests/detail?id=${testId}`);
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
                classSchedules: selectedTest?.classSchedules || [],
                questions: questions,
            };

            const result = await dispatch(
                updateTest({
                    testId,
                    testData,
                }),
            ).unwrap();

            setIsConfirmModalOpen(false);

            if (
                hasChanges() &&
                (selectedTest?.status === "active" || selectedTest?.status === "completed")
            ) {
                setRecalculateModalOpen(true);
            } else {
                router.push(`/tests/detail?id=${testId}`);
            }
        } catch (error) {
            console.error("Error saving test:", error);
            setSaveDraftErrorMessage(
                error instanceof Error ? error.message : "Ошибка при сохранении теста",
            );
            setSaveDraftModalType("error");
            setSaveDraftModalOpen(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRecalculate = async (timeRangeHours: number) => {
        setIsRecalculating(true);
        try {
            await dispatch(
                recalculateAttempts({
                    testId,
                    timeRangeHours,
                }),
            ).unwrap();

            setRecalculateModalOpen(false);
            router.push(`/tests/detail?id=${testId}`);
        } catch (error) {
            console.error("Error recalculating attempts:", error);
            setSaveDraftErrorMessage(
                error instanceof Error ? error.message : "Ошибка при перепроверке попыток",
            );
            setSaveDraftModalType("error");
            setSaveDraftModalOpen(true);
            setRecalculateModalOpen(false);
        } finally {
            setIsRecalculating(false);
        }
    };

    const handleSaveDraft = async () => {
        setIsSaving(true);
        try {
            const testData: SavePayload = {
                title: testInfo.title,
                description: testInfo.description,
                timeLimit: testInfo.timeLimit,
                classSchedules: selectedTest?.classSchedules || [],
                questions: questions,
            };

            await dispatch(
                saveTestAsDraft({
                    testId,
                    testData,
                }),
            ).unwrap();

            router.push(`/tests/detail?id=${testId}`);
        } catch (error) {
            console.error("Error saving draft:", error);
            setSaveDraftErrorMessage(
                error instanceof Error ? error.message : "Ошибка при сохранении черновика",
            );
            setSaveDraftModalType("error");
            setSaveDraftModalOpen(true);
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
                    <h1 className={styles.title}>Редактирование теста</h1>
                    <p className={styles.description}>Измените информацию о тесте и вопросы</p>
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

            <Modal
                isOpen={saveDraftModalOpen && saveDraftModalType === "error"}
                title="Ошибка при сохранении"
                message={saveDraftErrorMessage}
                onConfirm={() => setSaveDraftModalOpen(false)}
                onCancel={() => setSaveDraftModalOpen(false)}
                confirmText="ОК"
                cancelText="ОК"
            />

            {recalculateModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.recalculateModal}>
                        <h2>Перепроверить попытки</h2>
                        <p>Выберите, за какой период перепроверить результаты попыток:</p>
                        <div className={styles.recalculateButtonGroup}>
                            <Button
                                onClick={() => handleRecalculate(1)}
                                disabled={isRecalculating}
                                variant="secondary"
                            >
                                За последний час
                            </Button>
                            <Button
                                onClick={() => handleRecalculate(24)}
                                disabled={isRecalculating}
                                variant="secondary"
                            >
                                За последние 24 часа
                            </Button>
                            <Button
                                onClick={() => handleRecalculate(168)}
                                disabled={isRecalculating}
                                variant="secondary"
                            >
                                За последние 7 дней
                            </Button>
                            <Button
                                onClick={() => handleRecalculate(999999)}
                                disabled={isRecalculating}
                                variant="secondary"
                            >
                                За все время
                            </Button>
                            <Button
                                onClick={() => {
                                    setRecalculateModalOpen(false);
                                    router.push(`/tests/detail?id=${testId}`);
                                }}
                                disabled={isRecalculating}
                                variant="outline"
                            >
                                Не перепроверять
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditTest;
