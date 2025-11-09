import { useEffect, useState, useCallback } from "react";

interface UseTimerProps {
    durationSeconds: number;
    onTimeUp?: () => void;
    autoStart?: boolean;
}

export const useTimer = ({ durationSeconds, onTimeUp, autoStart = true }: UseTimerProps) => {
    const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
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
                if (prev <= 1) {
                    setIsActive(false);
                    onTimeUp?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, remainingSeconds, onTimeUp]);

    const pause = useCallback(() => setIsActive(false), []);
    const resume = useCallback(() => setIsActive(true), []);
    const reset = useCallback(() => {
        setRemainingSeconds(durationSeconds);
        setIsActive(autoStart);
    }, [durationSeconds, autoStart]);

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    return {
        remainingSeconds,
        minutes,
        seconds,
        isActive,
        pause,
        resume,
        reset,
        isTimeUp: remainingSeconds === 0,
    };
};
