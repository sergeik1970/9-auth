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
import { getTestById } from "@/shared/store/slices/test";

interface EditTestProps {
    testId: number;
}

interface SavePayload {
    title: string;
    description?: string;
    timeLimit?: number;
    questions: QuestionFormData[];
}

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
    const { selectedTest } = useSelector((state) => state.test);

    useEffect(() => {
        dispatch(getTestById(testId));
    }, [dispatch, testId]);

    useEffect(() => {
        if (selectedTest) {
            setTestInfo({
                title: selectedTest.title,
                description: selectedTest.description,
                timeLimit: selectedTest.timeLimit,
            });

            const formattedQuestions = selectedTest.questions.map((q) => ({
                id: q.id,
                text: q.text,
                type: q.type as "single_choice" | "multiple_choice" | "text_input",
                order: q.order,
                options: q.options || [],
                correctTextAnswer: q.correctTextAnswer,
            }));
            setQuestions(formattedQuestions);
            setIsLoading(false);
        }
    }, [selectedTest]);

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
            const payload: SavePayload = {
                title: testInfo.title,
                description: testInfo.description,
                timeLimit: testInfo.timeLimit,
                questions: questions,
            };

            const response = await fetch(
                `/api/tests/${testId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(payload),
                },
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Ошибка при сохранении теста");
            }

            router.push("/dashboard");
        } catch (error) {
            console.error("Error saving test:", error);
            alert(error instanceof Error ? error.message : "Ошибка при сохранении теста");
        } finally {
            setIsSaving(false);
            setIsConfirmModalOpen(false);
        }
    };

    const getValidationErrors = () => {
        const errors: string[] = [];

        if (!testInfo.title.trim()) {
            errors.push("Название теста");
        }
        if (!testInfo.timeLimit || testInfo.timeLimit <= 0) {
            errors.push("Время для прохождения теста");
        }
        if (questions.length === 0) {
            errors.push("Минимум один вопрос");
        }

        questions.forEach((question, index) => {
            if (!question.text.trim()) {
                errors.push(`Вопрос ${index + 1}: текст вопроса`);
            }

            if (question.type === "text_input") {
                if (!question.correctTextAnswer?.trim()) {
                    errors.push(`Вопрос ${index + 1}: правильный ответ`);
                }
            } else {
                const filledOptions = question.options?.filter((opt) => opt.text.trim()) || [];

                if (filledOptions.length < 2) {
                    errors.push(`Вопрос ${index + 1}: минимум два варианта ответа`);
                } else {
                    const correctOptions = filledOptions.filter((opt) => opt.isCorrect);
                    if (correctOptions.length === 0) {
                        errors.push(`Вопрос ${index + 1}: не отмечен правильный ответ`);
                    } else if (question.type === "multiple_choice" && correctOptions.length < 2) {
                        errors.push(
                            `Вопрос ${index + 1}: минимум два правильных ответа для множественного выбора`,
                        );
                    }
                }
            }
        });

        return errors;
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
    };

    if (isLoading) {
        return <LoadingState message="Загрузка теста..." />;
    }

    return (
        <div className={styles.editTest}>
            <div className={styles.header}>
                <h1 className={styles.title}>Редактирование теста</h1>
                <p className={styles.description}>Измените информацию о тесте и вопросы</p>
            </div>

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
