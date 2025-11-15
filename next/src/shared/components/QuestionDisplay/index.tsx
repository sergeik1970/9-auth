import React, { ReactElement } from "react";
import styles from "./index.module.scss";
import { Question } from "@/shared/types/question";
import clsx from "clsx";

interface QuestionDisplayProps {
    question: Question;
    selectedOptionId?: number;
    selectedOptionIds?: number[];
    textAnswer?: string;
    onAnswerChange: (
        selectedOptionId?: number,
        selectedOptionIds?: number[],
        textAnswer?: string,
    ) => void;
}
// Вынести в props
const QuestionDisplay = React.forwardRef<HTMLDivElement, QuestionDisplayProps>(
    (
        { question, selectedOptionId, selectedOptionIds = [], textAnswer = "", onAnswerChange },
        ref,
    ): ReactElement => {
        const handleSingleChoice = (optionId: number) => {
            onAnswerChange(optionId, [optionId], undefined);
        };

        const handleMultipleChoice = (optionId: number) => {
            const currentIds = Array.isArray(selectedOptionIds) ? selectedOptionIds : [];
            const newIds = currentIds.includes(optionId)
                ? currentIds.filter((id) => id !== optionId)
                : [...currentIds, optionId];
            onAnswerChange(undefined, newIds, undefined);
        };

        const handleTextAnswer = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            onAnswerChange(undefined, undefined, e.target.value);
        };

        return (
            <div ref={ref} className={styles.questionContainer}>
                <h3 className={styles.questionTitle}>{question.text}</h3>

                {/* Single or Multiple Choice Questions */}
                {(question.type === "single_choice" || question.type === "multiple_choice") &&
                    question.options && (
                        <div className={styles.optionsGroup}>
                            {question.options.map((option) => (
                                <label key={option.id} className={styles.optionLabel}>
                                    <input
                                        type={
                                            question.type === "single_choice" ? "radio" : "checkbox"
                                        }
                                        name={
                                            question.type === "single_choice"
                                                ? `question_${question.id}`
                                                : undefined
                                        }
                                        checked={
                                            question.type === "single_choice"
                                                ? selectedOptionId === option.id
                                                : Array.isArray(selectedOptionIds) &&
                                                  selectedOptionIds.includes(option.id!)
                                        }
                                        onChange={() => {
                                            question.type === "single_choice"
                                                ? handleSingleChoice(option.id!)
                                                : handleMultipleChoice(option.id!);
                                        }}
                                        className={styles.input}
                                    />
                                    <span className={styles.optionText}>{option.text}</span>
                                </label>
                            ))}
                        </div>
                    )}

                {/* Text Input Question */}
                {question.type === "text_input" && (
                    <textarea
                        value={textAnswer}
                        onChange={handleTextAnswer}
                        placeholder="Введите ваш ответ..."
                        className={styles.textarea}
                        rows={4}
                    />
                )}
            </div>
        );
    },
);

QuestionDisplay.displayName = "QuestionDisplay";

export default QuestionDisplay;
