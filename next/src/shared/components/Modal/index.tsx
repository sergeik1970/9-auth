import React, { ReactElement } from "react";
import styles from "./index.module.scss";

interface ModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Завершить",
    cancelText = "Вернуться",
}): ReactElement | null => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.message}>{message}</p>
                <div className={styles.buttons}>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={styles.confirmBtn} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
