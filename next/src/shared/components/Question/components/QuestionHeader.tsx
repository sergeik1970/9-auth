import React, { ReactElement } from "react";
import Button from "@/shared/components/Button";
import styles from "../index.module.scss";

interface QuestionHeaderProps {
    questionIndex: number;
    onRemove: () => void;
    disabled?: boolean;
}

const QuestionHeader = ({
    questionIndex,
    onRemove,
    disabled = false,
}: QuestionHeaderProps): ReactElement => {
    return (
        <div className={styles.questionHeader}>
            <h3 className={styles.questionTitle}>Вопрос {questionIndex + 1}</h3>
            <Button
                type="button"
                variant="outline"
                size="small"
                onClick={onRemove}
                disabled={disabled}
            >
                Удалить
            </Button>
        </div>
    );
};

export default QuestionHeader;
