import React, { ReactElement, useRef, useEffect } from "react";
import { QuestionType, QuestionOptionFormData } from "@/shared/types/question";
import QuestionOption from "@/shared/components/QuestionOption";
import Button from "@/shared/components/Button";
import styles from "../index.module.scss";

interface QuestionOptionsSectionProps {
    options: QuestionOptionFormData[];
    type: QuestionType;
    questionIndex: number;
    index: number;
    onOptionTextChange: (optionIndex: number, text: string) => void;
    onToggleCorrect: (optionIndex: number) => void;
    onRemoveOption: (optionIndex: number) => void;
    onAddOption: () => void;
    disabled?: boolean;
}

const QuestionOptionsSection = ({
    index,
    options,
    type,
    questionIndex,
    onOptionTextChange,
    onToggleCorrect,
    onRemoveOption,
    onAddOption,
    disabled = false,
}: QuestionOptionsSectionProps): ReactElement => {
    const lastInputRef = useRef<HTMLInputElement>(null);

    const getCorrectAnswersCount = (): number => {
        return options.filter((opt) => opt.isCorrect).length;
    };

    const getNonEmptyOptionsCount = (): number => {
        return options.filter((opt) => opt.text.trim() !== "").length;
    };

    const hasCorrectAnswer = (): boolean => {
        return options.some((opt) => opt.isCorrect);
    };

    const handleKeyDown = (optionIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        const lastOptionEmpty =
            options[options.length - 1]?.text.trim() === "" &&
            options.length > 0 &&
            optionIndex === options.length - 1;

        // Auto-add option when filling last empty option
        if (
            lastOptionEmpty &&
            (e.key === " " || /[a-zA-Zа-яА-Я0-9]/.test(e.key)) &&
            options.length < 10
        ) {
            // Option will be added after onChange
        }

        // Arrow up/down navigation
        if (e.key === "ArrowUp" && optionIndex > 0) {
            e.preventDefault();
            const inputs = document.querySelectorAll(
                `input[data-question="${questionIndex}"]`,
            ) as NodeListOf<HTMLInputElement>;
            if (inputs[optionIndex - 1]) {
                inputs[optionIndex - 1].focus();
            }
        } else if (e.key === "ArrowDown" && optionIndex < options.length - 1) {
            e.preventDefault();
            const inputs = document.querySelectorAll(
                `input[data-question="${questionIndex}"]`,
            ) as NodeListOf<HTMLInputElement>;
            if (inputs[optionIndex + 1]) {
                inputs[optionIndex + 1].focus();
            }
        }
    };

    // const handleOptionTextChange = (optionIndex: number, text: string) => {
    //     onOptionTextChange(optionIndex, text);

    //     // Auto-add new option when last option is being filled
    //     const lastOptionIndex = options.length - 1;
    //     if (optionIndex === lastOptionIndex && text.trim() !== "" && options.length < 10) {
    //         onAddOption();
    //     }
    // };

    // const handleOptionTextChange = (optionIndex: number, text: string) => {
    //     onOptionTextChange(optionIndex, text);

    //     const lastOptionIndex = options.length - 1;

    //     // Удалить вариант если полностью стирли его (кроме последнего пустого поля)
    //     if (text.trim() === "" && optionIndex !== lastOptionIndex && options.length > 2) {
    //         onRemoveOption(optionIndex);
    //         return;
    //     }

    //     // Добавить новое поле если вводим в последнее
    //     if (optionIndex === lastOptionIndex && text.trim() !== "" && options.length < 10) {
    //         onAddOption();
    //     }

    //     // Удалить лишние пустые поля с конца (оставить только одно пустое)
    //     if (options.length > 2) {
    //         let emptyCount = 0;
    //         for (let i = options.length - 1; i >= 0; i--) {
    //             if (options[i].text.trim() === "") {
    //                 emptyCount++;
    //                 if (emptyCount > 1) {
    //                     onRemoveOption(i);
    //                 }
    //             } else {
    //                 break;
    //             }
    //         }
    //     }
    // };

    const handleOptionTextChange = (optionIndex: number, text: string) => {
        onOptionTextChange(optionIndex, text);

        const lastOptionIndex = options.length - 1;

        if (optionIndex === lastOptionIndex && text.trim() !== "" && options.length < 10) {
            onAddOption();
        }
    };

    const handleOptionBlur = (optionIndex: number) => {
        const lastOptionIndex = options.length - 1;

        if (
            options[optionIndex].text.trim() === "" &&
            optionIndex !== lastOptionIndex &&
            options.length > 2
        ) {
            onRemoveOption(optionIndex);
            return;
        }

        if (options.length > 2) {
            let emptyCount = 0;
            for (let i = options.length - 1; i >= 0; i--) {
                if (options[i].text.trim() === "") {
                    emptyCount++;
                    if (emptyCount > 1) {
                        onRemoveOption(i);
                    }
                } else {
                    break;
                }
            }
        }
    };

    return (
        <div className={styles.field}>
            <label className={styles.label}>Варианты ответов</label>
            <div className={styles.options}>
                {options.map((option, optionIndex) => (
                    <QuestionOption
                        key={optionIndex}
                        option={option}
                        isRadio={type === "single_choice"}
                        questionIndex={questionIndex}
                        optionIndex={optionIndex}
                        totalOptions={options.length}
                        onTextChange={(text) => handleOptionTextChange(optionIndex, text)}
                        onBlur={() => handleOptionBlur(optionIndex)}
                        onToggleCorrect={() => onToggleCorrect(optionIndex)}
                        onDelete={() => onRemoveOption(optionIndex)}
                        disabled={disabled}
                    />
                ))}
            </div>

            <small className={styles.hint}>
                {type === "single_choice"
                    ? "Нажмите на кружок рядом с единственным правильным ответом."
                    : "Нажмите на квадратики рядом с правильными ответами. Можно выбрать несколько."}{" "}
                Новые варианты добавляются автоматически при заполнении (до 10 вариантов).
                Используйте стрелки ↑↓ для навигации между вариантами.
                {getCorrectAnswersCount() > 0 && (
                    <span className={styles.multipleAnswers}>
                        <br />✓ Выбрано правильных ответов: {getCorrectAnswersCount()} из{" "}
                        {getNonEmptyOptionsCount()}
                    </span>
                )}
                {!hasCorrectAnswer() && (
                    <span className={styles.noAnswers}>
                        <br />
                        ⚠️ Не выбран ни один правильный ответ
                    </span>
                )}
            </small>
        </div>
    );
};

export default QuestionOptionsSection;
