import React, { ReactElement } from "react";
import styles from "./index.module.scss";

interface DueDatePickerProps {
    value?: string;
    onChange: (date: string) => void;
    disabled?: boolean;
}

const DueDatePicker = ({ value, onChange, disabled = false }: DueDatePickerProps): ReactElement => {
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 10);

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        if (newDate) {
            const [dateStr, timeStr] = newDate.split("T");
            const [year, month, day] = dateStr.split("-");
            const [hours, minutes] = timeStr.split(":");

            const date = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                parseInt(hours),
                parseInt(minutes),
            );

            onChange(date.toISOString());
        }
    };

    const formatDateForInput = (isoString?: string): string => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return (
        <input
            type="datetime-local"
            value={formatDateForInput(value)}
            onChange={handleChange}
            min={getMinDateTime()}
            disabled={disabled}
            className={styles.input}
        />
    );
};

export default DueDatePicker;
