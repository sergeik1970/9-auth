import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.scss";
import { updateGradingCriteria, clearError, clearSuccess } from "../../store/slices/settings";
import {
    selectSettingsLoading,
    selectSettingsError,
    selectSettingsSuccess,
} from "../../store/slices/settings";
import { GradingCriteria } from "../../types/auth";

const DEFAULT_CRITERIA: GradingCriteria = {
    excellent: 90,
    good: 75,
    satisfactory: 60,
    poor: 0,
};

const CRITERIA_COLORS = {
    excellent: "#22c55e",
    good: "#f59e0b",
    satisfactory: "#ef4444",
    poor: "#6b7280",
};

const CRITERIA_LABELS = {
    excellent: "Отлично (5)",
    good: "Хорошо (4)",
    satisfactory: "Удовлетворительно (3)",
    poor: "Неудовлетворительно (2)",
};

interface GradingCriteriaProps {
    initialCriteria?: GradingCriteria | null;
    onClose?: () => void;
    onSuccess?: () => void;
}

export default function GradingCriteriaComponent({
    initialCriteria,
    onClose,
    onSuccess,
}: GradingCriteriaProps) {
    const dispatch = useDispatch();
    const loading = useSelector(selectSettingsLoading);
    const error = useSelector(selectSettingsError);
    const success = useSelector(selectSettingsSuccess);

    const [criteria, setCriteria] = useState<GradingCriteria>(initialCriteria || DEFAULT_CRITERIA);

    const handleChange = (key: keyof GradingCriteria, value: string) => {
        if (value === "") {
            setCriteria((prev) => ({ ...prev, [key]: 0 }));
            return;
        }
        
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue <= 100) {
            setCriteria((prev) => ({ ...prev, [key]: numValue }));
        }
    };

    const incrementValue = (key: keyof GradingCriteria) => {
        setCriteria((prev) => {
            const updated = { ...prev };
            let newValue = Math.min(100, prev[key] + 1);
            updated[key] = newValue;

            if (key === "excellent") {
                if (updated.excellent <= updated.good) {
                    updated.good = updated.excellent - 1;
                    if (updated.good <= updated.satisfactory) {
                        updated.satisfactory = updated.good - 1;
                        if (updated.satisfactory < 0) updated.satisfactory = 0;
                    }
                }
            } else if (key === "good") {
                if (updated.good >= updated.excellent) {
                    updated.good = updated.excellent - 1;
                    if (updated.good < 0) updated.good = 0;
                } else if (updated.good <= updated.satisfactory) {
                    updated.satisfactory = updated.good - 1;
                    if (updated.satisfactory < 0) updated.satisfactory = 0;
                }
            } else if (key === "satisfactory") {
                if (updated.satisfactory >= updated.good) {
                    updated.satisfactory = updated.good - 1;
                    if (updated.satisfactory < 0) updated.satisfactory = 0;
                }
            }

            return updated;
        });
    };

    const decrementValue = (key: keyof GradingCriteria) => {
        setCriteria((prev) => {
            const updated = { ...prev };
            let newValue = Math.max(0, prev[key] - 1);
            updated[key] = newValue;

            if (key === "excellent") {
                if (updated.excellent <= updated.good) {
                    updated.good = updated.excellent - 1;
                    if (updated.good <= updated.satisfactory) {
                        updated.satisfactory = updated.good - 1;
                        if (updated.satisfactory < 0) updated.satisfactory = 0;
                    }
                }
            } else if (key === "good") {
                if (updated.good >= updated.excellent) {
                    updated.good = updated.excellent - 1;
                    if (updated.good < 0) updated.good = 0;
                } else if (updated.good <= updated.satisfactory) {
                    updated.satisfactory = updated.good - 1;
                    if (updated.satisfactory < 0) updated.satisfactory = 0;
                }
            } else if (key === "satisfactory") {
                if (updated.satisfactory >= updated.good) {
                    updated.satisfactory = updated.good - 1;
                    if (updated.satisfactory < 0) updated.satisfactory = 0;
                }
            }

            return updated;
        });
    };

    const isIncrementDisabled = (key: keyof GradingCriteria): boolean => {
        if (key === "excellent" && criteria.excellent >= 100) return true;
        return false;
    };

    const isDecrementDisabled = (key: keyof GradingCriteria): boolean => {
        return false;
    };

    const handleBlur = (key: keyof GradingCriteria) => {
        setCriteria((prev) => {
            const updated = { ...prev };
            let value = updated[key];

            if (key === "poor") {
                updated.poor = 0;
                return updated;
            }

            if (value === 0) {
                if (key === "excellent") {
                    value = Math.round((updated.good + 100) / 2);
                } else if (key === "good") {
                    value = Math.round((updated.excellent + updated.satisfactory) / 2);
                } else if (key === "satisfactory") {
                    value = Math.round((updated.good + updated.poor) / 2);
                }
                updated[key] = value;
            }

            if (key === "excellent") {
                updated.excellent = Math.max(0, Math.min(100, value));
                if (updated.excellent <= updated.good) {
                    updated.good = updated.excellent - 1;
                    if (updated.good <= updated.satisfactory) {
                        updated.satisfactory = updated.good - 1;
                        if (updated.satisfactory < 0) updated.satisfactory = 0;
                    }
                }
            } else if (key === "good") {
                updated.good = Math.max(0, value);
                if (updated.good >= updated.excellent) {
                    updated.good = updated.excellent - 1;
                    if (updated.good < 0) updated.good = 0;
                } else if (updated.good <= updated.satisfactory) {
                    updated.satisfactory = updated.good - 1;
                    if (updated.satisfactory < 0) updated.satisfactory = 0;
                }
            } else if (key === "satisfactory") {
                updated.satisfactory = Math.max(0, value);
                if (updated.satisfactory >= updated.good) {
                    updated.satisfactory = updated.good - 1;
                    if (updated.satisfactory < 0) updated.satisfactory = 0;
                }
            }

            return updated;
        });
    };

    const getValidationError = (): string | null => {
        if (criteria.excellent <= 0 || criteria.excellent > 100) {
            return "Отлично должно быть от 1 до 100";
        }
        if (criteria.good <= 0 || criteria.good > 100) {
            return "Хорошо должно быть от 1 до 100";
        }
        if (criteria.satisfactory <= 0 || criteria.satisfactory > 100) {
            return "Удовлетворительно должно быть от 1 до 100";
        }
        if (criteria.poor < 0 || criteria.poor > 100) {
            return "Неудовлетворительно должно быть от 0 до 100";
        }
        if (
            !(
                criteria.excellent > criteria.good &&
                criteria.good > criteria.satisfactory &&
                criteria.satisfactory > criteria.poor
            )
        ) {
            return "Критерии должны быть в порядке убывания: Отлично > Хорошо > Удовлетворительно > Неудовлетворительно";
        }
        return null;
    };

    const handleSave = () => {
        const validationError = getValidationError();
        if (validationError) {
            alert(validationError);
            return;
        }

        dispatch(updateGradingCriteria({ gradingCriteria: criteria }) as any).then(
            (action: any) => {
                if (action.type === "settings/updateGradingCriteria/fulfilled") {
                    onSuccess?.();
                }
            },
        );
    };

    useEffect(() => {
        return () => {
            dispatch(clearSuccess() as any);
            dispatch(clearError() as any);
        };
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                dispatch(clearSuccess() as any);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, dispatch]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                dispatch(clearError() as any);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    return (
        <div className={styles.container}>
            <h2>Критерии выставления оценок</h2>
            <p>
                Установите проценты для каждой оценки. Они будут применяться ко всем вашим тестам по
                умолчанию.
            </p>

            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>Критерии успешно обновлены</div>}

            <div className={styles.form}>
                <div className={styles.criteriaGrid}>
                    {(
                        Object.entries(CRITERIA_LABELS) as Array<[keyof GradingCriteria, string]>
                    ).map(([key, label]) => (
                        <div key={key} className={styles.criteriaItem}>
                            <label className={styles.label}>
                                <span
                                    className={styles.color}
                                    style={{
                                        background:
                                            CRITERIA_COLORS[key as keyof typeof CRITERIA_COLORS],
                                    }}
                                />
                                {label}
                            </label>
                            <div className={styles.inputWrapper}>
                                <div className={styles.buttonGroup}>
                                    <button
                                        onClick={() => decrementValue(key)}
                                        disabled={loading || isDecrementDisabled(key)}
                                        type="button"
                                    >
                                        −
                                    </button>
                                    <button
                                        onClick={() => incrementValue(key)}
                                        disabled={loading || isIncrementDisabled(key)}
                                        type="button"
                                    >
                                        +
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    value={criteria[key]}
                                    onChange={(e) =>
                                        handleChange(key, e.target.value)
                                    }
                                    onBlur={() => handleBlur(key)}
                                    disabled={loading}
                                />
                                <span className={styles.percent}>%</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.preview}>
                    <h3>Предпросмотр шкалы</h3>
                    <div className={styles.previewBars}>
                        {(
                            Object.entries(CRITERIA_LABELS) as Array<
                                [keyof GradingCriteria, string]
                            >
                        ).map(([key, label]) => (
                            <div key={key} className={styles.bar}>
                                <div className={styles.label}>{label}</div>
                                <div className={styles.barContainer}>
                                    <div
                                        className={styles.barFill}
                                        style={{
                                            width: `${criteria[key]}%`,
                                            background:
                                                CRITERIA_COLORS[
                                                    key as keyof typeof CRITERIA_COLORS
                                                ],
                                        }}
                                    >
                                        {criteria[key] > 15 && <span>{criteria[key]}%</span>}
                                    </div>
                                </div>
                                <div className={styles.percent}>{criteria[key]}%</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.save} onClick={handleSave} disabled={loading}>
                        {loading ? "Сохранение..." : "Сохранить критерии"}
                    </button>
                    {onClose && (
                        <button className={styles.cancel} onClick={onClose} disabled={loading}>
                            Отмена
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
