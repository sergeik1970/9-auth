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

const CreateTest = ({ onSuccess, onError }: CreateTestProps): ReactElement => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [testInfo, setTestInfo] = useState<TestInfoData>({
        title: "", // Начальное название пустое
        description: "",
        timeLimit: undefined,
    });
    const [questions, setQuestions] = useState<QuestionFormData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useSelector(selectAuth);

    // Проверка роли
    const hasAccess = user && isTeacher(user.role);

    useEffect(() => {
        if (!hasAccess) {
            router.push("/dashboard");
        }
    }, [hasAccess, router]);

    if (!hasAccess) {
        return <div>Загрузка...</div>; // Или null, но лучше показать что-то
    }

    const handleSubmit = async (e: React.FormEvent) => {
        console.log("Form submitted!");
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

            // После успеха - редирект на dashboard
            router.push("/dashboard");
        } catch (error) {
            // Обработка ошибки
            if (onError) {
                onError(error as string);
            }
        } finally {
            setIsLoading(false);
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

    return (
        <div className={styles.createTest}>
            <div className={styles.header}>
                <h1 className={styles.title}>Создание нового теста</h1>
                <p className={styles.description}>
                    Заполните информацию о тесте и добавьте вопросы
                </p>
            </div>

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
