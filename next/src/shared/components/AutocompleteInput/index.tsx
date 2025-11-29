import React, { useState, useRef, useEffect } from "react";
import styles from "./index.module.scss";

interface AutocompleteInputProps {
    id: string;
    name: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelect?: (value: string) => void;
    suggestions: string[];
    required?: boolean;
    disabled?: boolean;
    minChars?: number;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
    id,
    name,
    placeholder,
    value,
    onChange,
    onSelect,
    suggestions,
    required = false,
    disabled = false,
    minChars = 2,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filtered, setFiltered] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (value.length >= minChars) {
            const filtered = suggestions.filter((item) =>
                item.toLowerCase().includes(value.toLowerCase()),
            );
            setFiltered(filtered);
            if (isFocused) {
                setIsOpen(filtered.length > 0);
            }
            setSelectedIndex(-1);
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
            }
        } else {
            setFiltered([]);
            setIsOpen(false);
        }
    }, [value, suggestions, minChars, isFocused]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    const handleSelect = (item: string) => {
        const event = {
            target: { value: item, name },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
        onSelect?.(item);
        setSelectedIndex(-1);
        setIsOpen(false);
        setIsFocused(false);
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSelect(filtered[selectedIndex]);
                }
                break;
            case "Escape":
                e.preventDefault();
                setIsOpen(false);
                break;
        }
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <input
                type="text"
                id={id}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    setIsFocused(true);
                    if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                        closeTimeoutRef.current = null;
                    }
                    if (value.length >= minChars && filtered.length > 0) {
                        setIsOpen(true);
                    }
                }}
                onBlur={() => {
                    setIsFocused(false);
                    if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                    }
                    closeTimeoutRef.current = setTimeout(() => {
                        setIsOpen(false);
                        closeTimeoutRef.current = null;
                    }, 100);
                }}
                required={required}
                disabled={disabled}
                className={styles.input}
            />
            {isOpen && filtered.length > 0 && (
                <div className={styles.dropdown}>
                    {filtered.slice(0, 10).map((item, index) => (
                        <div
                            key={item}
                            className={`${styles.item} ${
                                index === selectedIndex ? styles.selected : ""
                            }`}
                            onClick={() => handleSelect(item)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AutocompleteInput;
