import React, { useState, useRef, ReactElement, useEffect, useCallback } from "react";
import styles from "./index.module.scss";

interface TimeLimitPickerProps {
    value?: number;
    onChange: (minutes: number) => void;
    disabled?: boolean;
}

const TIME_PRESETS = [
    { label: "15 минут", value: 15 },
    { label: "30 минут", value: 30 },
    { label: "40 минут", value: 40 },
    { label: "1 час", value: 60 },
    { label: "2 часа", value: 120 },
    { label: "3 часа 55 минут", value: 235 },
];

const TimeLimitPicker: React.FC<TimeLimitPickerProps> = ({ value, onChange, disabled = false }): ReactElement => {
    const [isOpen, setIsOpen] = useState(false);
    const [hours, setHours] = useState("");
    const [minutes, setMinutes] = useState("");
    const hoursInputRef = useRef<HTMLInputElement>(null);
    const minutesInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleInputsClick = () => {
        if (!disabled) {
            setIsOpen(true);
        }
    };

    const handleHoursBlur = () => {
        let validHours = hours;
        if (validHours) {
            const numVal = parseInt(validHours, 10);
            if (numVal > 23) {
                validHours = "23";
            }
            if (validHours.length === 1) {
                validHours = validHours.padStart(2, "0");
            }
            setHours(validHours);
        }
    };

    const handleMinutesBlur = () => {
        let validMinutes = minutes;
        if (validMinutes) {
            const numVal = parseInt(validMinutes, 10);
            if (numVal > 59) {
                validMinutes = "59";
            }
            setMinutes(validMinutes);
        }
    };

    const submitTime = () => {
        updateTime(hours, minutes);
    };

    const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 2);
        setHours(val);
        if (val.length === 2) {
            setTimeout(() => {
                minutesInputRef.current?.focus();
            }, 0);
        }
    };

    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 2);
        setMinutes(val);
        if (val.length === 2) {
            setTimeout(() => {
                minutesInputRef.current?.blur();
                setIsOpen(false);
            }, 0);
        }
    };

    const updateTime = (hrs: string, mins: string) => {
        if (hrs || mins) {
            const h = parseInt(hrs || "0", 10);
            const m = parseInt(mins || "0", 10);
            onChange(h * 60 + m);
        }
    };

    const handlePresetClick = (minutes: number) => {
        onChange(minutes);
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        setHours(String(hrs).padStart(2, "0"));
        setMinutes(String(mins).padStart(2, "0"));
        setIsOpen(false);
    };



    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            submitTime();
            setIsOpen(false);
        }
    }, [hours, minutes]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen, handleClickOutside]);

    useEffect(() => {
        if (!isOpen && value) {
            const hrs = Math.floor(value / 60);
            const mins = value % 60;
            setHours(String(hrs).padStart(2, "0"));
            setMinutes(String(mins).padStart(2, "0"));
        }
    }, [value, isOpen]);

    return (
        <div className={styles.timeLimitPicker} ref={containerRef}>
            <div className={styles.inputContainer} onClick={handleInputsClick}>
                <div className={`${styles.inputDisplay} ${isOpen ? styles.active : ''}`}>
                    <input
                        ref={hoursInputRef}
                        type="text"
                        inputMode="numeric"
                        className={styles.inputField}
                        value={hours}
                        onChange={handleHoursChange}
                        onBlur={handleHoursBlur}
                        placeholder="--"
                        maxLength={2}
                    />
                    <span className={styles.separator}>:</span>
                    <input
                        ref={minutesInputRef}
                        type="text"
                        inputMode="numeric"
                        className={styles.inputField}
                        value={minutes}
                        onChange={handleMinutesChange}
                        onBlur={handleMinutesBlur}
                        placeholder="--"
                        maxLength={2}
                    />
                </div>
            </div>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.presetsList}>
                        {TIME_PRESETS.map((preset) => (
                            <button
                                key={preset.value}
                                className={styles.presetButton}
                                onClick={() => handlePresetClick(preset.value)}
                                type="button"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeLimitPicker;
