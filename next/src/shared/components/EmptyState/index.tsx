import React, { ReactElement } from "react";
import Button from "@/shared/components/Button";
import styles from "./index.module.scss";

interface EmptyStateProps {
    title: string;
    message: string;
    actionText?: string;
    onAction?: () => void;
    icon?: string;
    className?: string;
}

const EmptyState = ({
    title,
    message,
    actionText,
    onAction,
    icon,
    className,
}: EmptyStateProps): ReactElement => {
    return (
        <div className={`${styles.emptyState} ${className || ""}`}>
            <div className={styles.icon}>{icon}</div>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.message}>{message}</p>
            {actionText && onAction && (
                <Button variant="primary" size="small" onClick={onAction} className={styles.action}>
                    {actionText}
                </Button>
            )}
        </div>
    );
};

export default EmptyState;
