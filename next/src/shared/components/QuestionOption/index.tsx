// import React, { ReactElement } from "react";
// import styles from "./index.module.scss";
// import clsx from "clsx";
// import InputText from "../InputText";
// import Button from "../Button";
// import Checkbox from "../Checkbox";
// import { QuestionOptionFormData } from "../../types/question";

// interface IQuestionOption {
//     option: QuestionOptionFormData;
//     isRadio?: boolean;
//     onTextChange: (text: string) => void;
//     onToggleCorrect: () => void;
//     onDelete?: () => void;
//     questionIndex: number;
//     optionIndex: number;
//     totalOptions: number;
//     disabled?: boolean;
// }

// const QuestionOption = (props: IQuestionOption): ReactElement => {
//     const {
//         option,
//         isRadio = false,
//         onTextChange,
//         onToggleCorrect,
//         onDelete,
//         questionIndex,
//         optionIndex,
//         totalOptions,
//         disabled = false,
//     } = props;

//     // Show delete button if: index > 0 (first option always deletable at index 1+) AND total > 2
//     // Actually, based on requirements: only show if index > 1 AND total > 2
//     const canDelete = optionIndex > 1 || totalOptions > 2;

//     const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         onTextChange(e.target.value);
//     };

//     const handleCorrectChange = () => {
//         onToggleCorrect();
//     };

//     return (
//         <div className={styles["option-wrapper"]}>
//             <div className={styles["option-container"]}>
//                 {/* Radio/Checkbox for "is correct" */}
//                 <div className={styles["option-input"]}>
//                     {isRadio ? (
//                         <label className={styles["radio-label"]}>
//                             <input
//                                 type="radio"
//                                 name={`question_${questionIndex}_correct`}
//                                 checked={option.isCorrect}
//                                 onChange={handleCorrectChange}
//                                 className={styles["radio-input"]}
//                                 disabled={disabled}
//                             />
//                             <span className={styles["radio-custom"]}></span>
//                         </label>
//                     ) : (
//                         <Checkbox
//                             checked={option.isCorrect}
//                             onChange={handleCorrectChange}
//                             // disabled={disabled}
//                         />
//                     )}
//                 </div>

//                 {/* Text input */}
//                 <div className={styles["option-text"]}>
//                     <InputText
//                         value={option.text}
//                         onChange={handleTextChange}
//                         placeholder={`Вариант ответа ${optionIndex + 1}`}
//                         disabled={disabled}
//                         data-question={questionIndex}
//                     />
//                 </div>

//                 {/* Delete button */}
//                 {canDelete && onDelete && (
//                     <div className={styles["option-delete"]}>
//                         <Button
//                             variant="outline"
//                             size="small"
//                             onClick={onDelete}
//                             title="Удалить вариант"
//                             disabled={disabled}
//                         >
//                             ✕
//                         </Button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default QuestionOption;

import React, { ReactElement } from "react";
import styles from "./index.module.scss";
import clsx from "clsx";
import InputText from "../InputText";
import Button from "../Button";
import Checkbox from "../Checkbox";
import { QuestionOptionFormData } from "../../types/question";

interface IQuestionOption {
    option: QuestionOptionFormData;
    isRadio?: boolean;
    onTextChange: (text: string) => void;
    onToggleCorrect: () => void;
    onBlur?: () => void;
    onDelete?: () => void;
    questionIndex: number;
    optionIndex: number;
    totalOptions: number;
    disabled?: boolean;
}

const QuestionOption = (props: IQuestionOption): ReactElement => {
    const {
        option,
        isRadio = false,
        onTextChange,
        onToggleCorrect,
        onBlur,
        onDelete,
        questionIndex,
        optionIndex,
        totalOptions,
        disabled = false,
    } = props;

    const canDelete = optionIndex > 1 || totalOptions > 2;

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onTextChange(e.target.value);
    };

    const handleBlur = () => {
        if (onBlur) {
            onBlur();
        }
    };

    const handleCorrectChange = () => {
        onToggleCorrect();
    };

    return (
        <div className={styles["option-wrapper"]}>
            <div className={styles["option-container"]}>
                <div className={styles["option-input"]}>
                    {isRadio ? (
                        <label className={styles["radio-label"]}>
                            <input
                                type="radio"
                                name={`question_${questionIndex}_correct`}
                                checked={option.isCorrect}
                                onChange={handleCorrectChange}
                                className={styles["radio-input"]}
                                disabled={disabled}
                            />
                            <span className={styles["radio-custom"]}></span>
                        </label>
                    ) : (
                        <Checkbox checked={option.isCorrect} onChange={handleCorrectChange} />
                    )}
                </div>

                <div className={styles["option-text"]}>
                    <InputText
                        value={option.text}
                        onChange={handleTextChange}
                        onBlur={handleBlur}
                        placeholder={`Вариант ответа ${optionIndex + 1}`}
                        disabled={disabled}
                        data-question={questionIndex}
                    />
                </div>

                {canDelete && onDelete && (
                    <div className={styles["option-delete"]}>
                        <Button
                            variant="outline"
                            size="small"
                            onClick={onDelete}
                            title="Удалить вариант"
                            disabled={disabled}
                        >
                            ✕
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionOption;
