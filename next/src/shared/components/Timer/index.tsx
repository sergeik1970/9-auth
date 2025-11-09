import React from "react";
import styles from "./index.module.scss";
import clsx from "clsx";

interface TimerProps {
    minutes: number;
    seconds: number;
    isActive: boolean;
    isTimeUp: boolean;
}

export const Timer: React.FC<TimerProps> = ({ minutes, seconds, isActive, isTimeUp }) => {
    const isLowTime = minutes === 0 && seconds < 60;

    return (
        <div
            className={clsx(styles.timer, {
                [styles.low]: isLowTime,
                [styles.timeUp]: isTimeUp,
            })}
        >
            <div className={styles.content}>
                <span className={styles.label}>Время:</span>
                <span className={styles.time}>
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
            </div>
        </div>
    );
};
