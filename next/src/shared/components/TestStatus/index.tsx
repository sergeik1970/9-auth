import React, { ReactElement } from "react";
import styles from "./index.module.scss";

export type TestStatus = "draft" | "active" | "completed" | "archived";

export interface TestStatusProps {
    status: TestStatus;
    className?: string;
    shouldShow?: (status: TestStatus) => boolean;
}

const TestStatus = ({ status, className, shouldShow }: TestStatusProps): ReactElement => {
    if (shouldShow && !shouldShow(status)) {
        return <></>;
    }

    const getStatusText = (status: TestStatus): string => {
        switch (status) {
            case "draft":
                return "Черновик";
            case "active":
                return "Активный";
            case "completed":
                return "Завершён";
            case "archived":
                return "Архивирован";
            default:
                return status;
        }
    };
    const getStatusClass = (status: TestStatus): string => {
        switch (status) {
            case "draft":
                return styles.statusDraft;
            case "active":
                return styles.statusActive;
            case "completed":
                return styles.statusCompleted;
            case "archived":
                return styles.statusArchived;
            default:
                return "";
        }
    };
    return (
        <span className={`${styles.testStatus} ${getStatusClass(status)} ${className || ""}`}>
            {getStatusText(status)}
        </span>
    );
};

export default TestStatus;
