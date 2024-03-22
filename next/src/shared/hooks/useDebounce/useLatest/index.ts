import { useEffect, useRef, MutableRefObject } from "react";

// Просто удобный хук для хранения вещей, которые не должны пересоздаваться
export const useLatest = <T>(value: T): MutableRefObject<T> => {
    const valueRef = useRef(value);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    return valueRef;
};
