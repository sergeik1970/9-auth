import { useEffect, useState, useCallback } from "react";

interface UseTimerProps {
    durationSeconds: number;
    onTimeUp?: () => void;
    autoStart?: boolean;
    serverTimeOffset?: number;
    startedAt?: Date;
}

export const useTimer = ({
    durationSeconds,
    onTimeUp,
    autoStart = true,
    serverTimeOffset = 0,
    startedAt,
}: UseTimerProps) => {
    const getServerTime = () => Date.now() + serverTimeOffset;

    const calculateRemainingTime = () => {
        if (!startedAt) return durationSeconds;
        const startTime = new Date(startedAt).getTime();
        const endTime = startTime + durationSeconds * 1000;
        const remaining = Math.max(0, Math.ceil((endTime - getServerTime()) / 1000));
        return remaining;
    };

    const [remainingSeconds, setRemainingSeconds] = useState(calculateRemainingTime());
    const [isActive, setIsActive] = useState(autoStart);

    useEffect(() => {
        if (!isActive || remainingSeconds <= 0) {
            if (remainingSeconds === 0 && isActive) {
                setIsActive(false);
                onTimeUp?.();
            }
            return;
        }

        const interval = setInterval(() => {
            setRemainingSeconds((prev) => {
                const newRemaining = calculateRemainingTime();
                if (newRemaining <= 0) {
                    setIsActive(false);
                    onTimeUp?.();
                    return 0;
                }
                return newRemaining;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, onTimeUp, startedAt, serverTimeOffset, durationSeconds]);

    const pause = useCallback(() => setIsActive(false), []);
    const resume = useCallback(() => setIsActive(true), []);
    const reset = useCallback(() => {
        setRemainingSeconds(calculateRemainingTime());
        setIsActive(autoStart);
    }, [durationSeconds, autoStart, startedAt, serverTimeOffset]);

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    return {
        remainingSeconds,
        hours,
        minutes,
        seconds,
        isActive,
        pause,
        resume,
        reset,
        isTimeUp: remainingSeconds === 0,
    };
};
