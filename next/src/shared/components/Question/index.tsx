import React, { ReactElement } from "react";
import { QuestionFormData, QuestionType, QuestionOptionFormData } from "@/shared/types/question";
import InputText from "@/shared/components/InputText";
import QuestionHeader from "./components/QuestionHeader";
import QuestionTypeSelector from "./components/QuestionTypeSelector";
import QuestionOptionsSection from "./components/QuestionOptionsSection";
import styles from "./index.module.scss";

export interface QuestionProps {
    question: QuestionFormData;
    questionIndex: number;
    onQuestionChange: (field: keyof QuestionFormData, value: any) => void;
    onOptionTextChange: (optionIndex: number, text: string) => void;
    onToggleCorrectOption: (optionIndex: number) => void;
    onRemoveOption: (optionIndex: number) => void;
    onAddOption: () => void;
    onRemoveQuestion: () => void;
    disabled?: boolean;
}

const Question = ({
    question,
    questionIndex,
    onQuestionChange,
    onOptionTextChange,
    onToggleCorrectOption,
    onRemoveOption,
    onAddOption,
    onRemoveQuestion,
    disabled = false,
}: QuestionProps): ReactElement => {
    const handleTypeChange = (newType: QuestionType) => {
        onQuestionChange("type", newType);

        if (newType === "text_input") {
            onQuestionChange("options", []);
            onQuestionChange("correctTextAnswer", "");
        } else if (newType === "single_choice" || newType === "multiple_choice") {
            onQuestionChange("correctTextAnswer", undefined);
            onQuestionChange("options", [
                { text: "", isCorrect: false, order: 0 },
                { text: "", isCorrect: false, order: 1 },
            ]);
        }
    };

    return (
        <div className={styles.questionCard}>
            <QuestionHeader
                questionIndex={questionIndex}
                onRemove={onRemoveQuestion}
                disabled={disabled}
            />

            <div className={styles.field}>
                <label className={styles.label}>Текст вопроса *</label>
                <textarea
                    className={styles.textarea}
                    value={question.text}
                    onChange={(e) => onQuestionChange("text", e.target.value)}
                    placeholder="Введите текст вопроса"
                    required
                    disabled={disabled}
                    rows={2}
                />
            </div>

            <QuestionTypeSelector
                value={question.type}
                onChange={handleTypeChange}
                disabled={disabled}
            />

            {(question.type === "single_choice" || question.type === "multiple_choice") &&
                question.options && (
                    <QuestionOptionsSection
                        options={question.options}
                        type={question.type}
                        questionIndex={questionIndex}
                        onOptionTextChange={onOptionTextChange}
                        onToggleCorrect={onToggleCorrectOption}
                        onRemoveOption={onRemoveOption}
                        onAddOption={onAddOption}
                        disabled={disabled}
                    />
                )}

            {question.type === "text_input" && (
                <div className={styles.field}>
                    <label className={styles.label}>Правильный ответ *</label>
                    <InputText
                        value={question.correctTextAnswer || ""}
                        onChange={(e) => onQuestionChange("correctTextAnswer", e.target.value)}
                        placeholder="Введите правильный ответ"
                        required
                        disabled={disabled}
                    />
                    <small className={styles.hint}>
                        Ответ будет проверяться без учета регистра и лишних пробелов
                    </small>
                </div>
            )}
        </div>
    );
};

export default Question;
