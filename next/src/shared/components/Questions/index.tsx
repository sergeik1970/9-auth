import React, { ReactElement, useCallback } from "react";
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
    const handleAddQuestion = useCallback(() => {
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
    }, [questions, onChange]);

    const handleRemoveQuestion = useCallback(
        (questionIndex: number) => {
            const updated = questions.filter((_, idx) => idx !== questionIndex);
            const reindexed = updated.map((q, idx) => ({ ...q, order: idx }));
            onChange(reindexed);
        },
        [questions, onChange],
    );

    const handleQuestionChange = useCallback(
        (questionIndex: number, field: keyof QuestionFormData, value: any) => {
            const updated = [...questions];
            const currentQuestion = updated[questionIndex];

            if (field === "type") {
                if (value === "text_input") {
                    updated[questionIndex] = {
                        ...currentQuestion,
                        type: value,
                    };
                } else {
                    const existingOptions = currentQuestion.options && currentQuestion.options.length > 0
                        ? currentQuestion.options
                        : [
                            { text: "", isCorrect: false, order: 0 },
                            { text: "", isCorrect: false, order: 1 },
                        ];
                    
                    updated[questionIndex] = {
                        ...currentQuestion,
                        type: value,
                        options: existingOptions,
                    };
                }
            } else {
                updated[questionIndex] = {
                    ...currentQuestion,
                    [field]: value,
                };
            }

            onChange(updated);
        },
        [questions, onChange],
    );

    const handleOptionTextChange = useCallback(
        (questionIndex: number, optionIndex: number, text: string) => {
            const updated = [...questions];
            if (updated[questionIndex].options && updated[questionIndex].options[optionIndex]) {
                updated[questionIndex].options[optionIndex] = {
                    ...updated[questionIndex].options[optionIndex],
                    text,
                };
                onChange(updated);
            }
        },
        [questions, onChange],
    );

    const handleToggleCorrectOption = useCallback(
        (questionIndex: number, optionIndex: number) => {
            const updated = [...questions];
            const question = updated[questionIndex];

            if (question.options) {
                if (question.type === "single_choice") {
                    question.options = question.options.map((opt, idx) => ({
                        ...opt,
                        isCorrect: idx === optionIndex,
                    }));
                } else {
                    question.options[optionIndex] = {
                        ...question.options[optionIndex],
                        isCorrect: !question.options[optionIndex].isCorrect,
                    };
                }
                onChange(updated);
            }
        },
        [questions, onChange],
    );

    const handleRemoveOption = useCallback(
        (questionIndex: number, optionIndex: number) => {
            const updated = [...questions];
            if (updated[questionIndex].options) {
                const removed = updated[questionIndex].options!.filter(
                    (_, idx) => idx !== optionIndex,
                );
                updated[questionIndex].options = removed.map((opt, idx) => ({
                    ...opt,
                    order: idx,
                }));
                onChange(updated);
            }
        },
        [questions, onChange],
    );

    const handleAddOption = useCallback(
        (questionIndex: number) => {
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
        },
        [questions, onChange],
    );

    return (
        <div className={styles.section} id="questions-section">
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
                            <div key={idx} id={`question-${idx}`}>
                                <Question
                                    question={question}
                                    questionIndex={idx}
                                    index={idx}
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
                            </div>
                        ))}
                    </div>

                    <div className={styles.addQuestionBottom}>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddQuestion}
                            disabled={disabled}
                        >
                            Добавить вопрос
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Questions;
