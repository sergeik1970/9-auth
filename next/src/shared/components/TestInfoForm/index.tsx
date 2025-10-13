import React, { HtmlHTMLAttributes, ReactElement } from "react";
import InputText from "@/shared/components/InputText";
import styles from "./index.module.scss";

export interface TestInfoData {
    title: string;
    description: string;
    timeLimit?: number;
}

interface TestInfoFormProps {
    data: TestInfoData;
    onChange: (data: TestInfoData) => void;
    disabled?: boolean;
}

const TestInfoForm = ({ data, onChange, disabled = false }: TestInfoFormProps): ReactElement => {
    const handleTitleChange = (event: React.FormEvent<HTMLInputElement>) => {
        onChange({
            ...data,
            title: event.currentTarget.value,
        });
    };
    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange({
            ...data,
            description: event.target.value,
        });
    };

    const handleTimeLimitChange = (event: React.FormEvent<HTMLInputElement>) => {
        if (!isNaN(Number(event.currentTarget.value))) {
            onChange({
                ...data,
                timeLimit: Number(event.currentTarget.value),
            });
        } else {
            console.log("Invalid input");
        }
    };
    return (
        <div>
            <div className={styles.testInfoForm}>
                <h2 className={styles.sectionTitle}>Основная информация</h2>
                <div className={styles.field}>
                    <label className={styles.label}>Название теста *</label>
                    <InputText
                        value={data.title}
                        onChange={handleTitleChange}
                        placeholder="Введите название теста"
                        required
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Описание</label>
                    <textarea
                        className={styles.textarea}
                        value={data.description}
                        onChange={handleDescriptionChange}
                        placeholder="Введите описание теста"
                        // disabled={disabled}
                        rows={3}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Время на прохождение (минуты)</label>
                    <InputText
                        type="number"
                        value={data.timeLimit?.toString() || ""}
                        onChange={handleTimeLimitChange}
                        placeholder="Не ограничено"
                        min="1"
                        // disabled={disabled}
                    />
                </div>
            </div>
        </div>
    );
};

export default TestInfoForm;
