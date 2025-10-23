import React, { ReactElement } from "react";
import { QuestionType } from "@/shared/types/question";
import styles from "../index.module.scss";

interface QuestionTypeSelectorProps {
    value: QuestionType;
    onChange: (type: QuestionType) => void;
    disabled?: boolean;
}

const QuestionTypeSelector = ({
    value,
    onChange,
    disabled = false,
}: QuestionTypeSelectorProps): ReactElement => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value as QuestionType);
    };

    return (
        <div className={styles.field}>
            <label className={styles.label}>Тип вопроса</label>
            <select
                className={styles.select}
                value={value}
                onChange={handleChange}
                disabled={disabled}
            >
                <option value="single_choice">Одиночный выбор</option>
                <option value="multiple_choice">Множественный выбор</option>
                <option value="text_input">Текстовый ответ</option>
            </select>
        </div>
    );
};

export default QuestionTypeSelector;
