import React, { ReactElement } from "react";
import Button from "@/shared/components/Button";
import Question from "@/shared/components/Question";
import { QuestionFormData } from "@/shared/types/question";
import styles from "./index.module.scss";

interface QuestionsProps {
    questions: QuestionFormData[];
    onChange: (questions: QuestionFormData[]) => void;
    disabled?: boolean;
}

const Questions: React.FC<QuestionsProps> = ({
    questions,
    onChange,
    disabled = false,
}): ReactElement => {
    // Добавление нового вопроса
    const handleAddQuestion = () => {
        const newQuestion: QuestionFormData = {
            text: "",
            type: "single_choice",
            order: questions.length,
            options: [
                { text: "", isCorrect: false, order: 0 },
                { text: "", isCorrect: false, order: 1 },
            ],
        };
        onChange([...questions, newQuestion]);
    };

    // Удаление вопроса
    const handleRemoveQuestion = (questionIndex: number) => {
        const updated = questions.filter((_, idx) => idx !== questionIndex);
        // Переиндексируем порядок
        const reindexed = updated.map((q, idx) => ({ ...q, order: idx }));
        onChange(reindexed);
    };

    // Изменение поля вопроса (text, type)
    const handleQuestionChange = (
        questionIndex: number,
        field: keyof QuestionFormData,
        value: any,
    ) => {
        const updated = [...questions];

        // Специальная логика для изменения типа
        if (field === "type") {
            if (value === "text_input") {
                updated[questionIndex] = {
                    ...updated[questionIndex],
                    type: value,
                    options: [],
                    correctTextAnswer: "",
                };
            } else {
                updated[questionIndex] = {
                    ...updated[questionIndex],
                    type: value,
                    options: [
                        { text: "", isCorrect: false, order: 0 },
                        { text: "", isCorrect: false, order: 1 },
                    ],
                    correctTextAnswer: undefined,
                };
            }
        } else {
            updated[questionIndex] = {
                ...updated[questionIndex],
                [field]: value,
            };
        }

        onChange(updated);
    };

    // Изменение текста опции
    const handleOptionTextChange = (questionIndex: number, optionIndex: number, text: string) => {
        const updated = [...questions];
        if (updated[questionIndex].options && updated[questionIndex].options[optionIndex]) {
            updated[questionIndex].options[optionIndex] = {
                ...updated[questionIndex].options[optionIndex],
                text,
            };
            onChange(updated);
        }
    };

    // Переключение правильности опции
    const handleToggleCorrectOption = (questionIndex: number, optionIndex: number) => {
        const updated = [...questions];
        const question = updated[questionIndex];

        if (question.options) {
            if (question.type === "single_choice") {
                // Для single choice сбрасываем остальные
                question.options = question.options.map((opt, idx) => ({
                    ...opt,
                    isCorrect: idx === optionIndex,
                }));
            } else {
                // Для multiple choice просто переключаем
                question.options[optionIndex] = {
                    ...question.options[optionIndex],
                    isCorrect: !question.options[optionIndex].isCorrect,
                };
            }
            onChange(updated);
        }
    };

    // Удаление опции
    const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
        const updated = [...questions];
        if (updated[questionIndex].options) {
            const removed = updated[questionIndex].options!.filter((_, idx) => idx !== optionIndex);
            updated[questionIndex].options = removed.map((opt, idx) => ({
                ...opt,
                order: idx,
            }));
            onChange(updated);
        }
    };

    // Добавление опции
    const handleAddOption = (questionIndex: number) => {
        const updated = [...questions];
        const question = updated[questionIndex];
        if (question.options) {
            question.options.push({
                text: "",
                isCorrect: false,
                order: question.options.length,
            });
            onChange(updated);
        }
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Вопросы</h2>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddQuestion}
                    disabled={disabled}
                >
                    Добавить вопрос
                </Button>
            </div>

            {questions.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Пока нет вопросов. Добавьте первый вопрос для начала.</p>
                </div>
            ) : (
                <>
                    <div className={styles.questionsList}>
                        {questions.map((question, idx) => (
                            <Question
                                key={idx}
                                question={question}
                                questionIndex={idx}
                                onQuestionChange={(field, value) =>
                                    handleQuestionChange(idx, field, value)
                                }
                                onOptionTextChange={(optionIndex, text) =>
                                    handleOptionTextChange(idx, optionIndex, text)
                                }
                                onToggleCorrectOption={(optionIndex) =>
                                    handleToggleCorrectOption(idx, optionIndex)
                                }
                                onRemoveOption={(optionIndex) =>
                                    handleRemoveOption(idx, optionIndex)
                                }
                                onAddOption={() => handleAddOption(idx)}
                                onRemoveQuestion={() => handleRemoveQuestion(idx)}
                                disabled={disabled}
                            />
                        ))}
                    </div>

                    <div className={styles.addQuestionBottom}>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddQuestion}
                            disabled={disabled}
                        >
                            Добавить еще один вопрос
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Questions;
