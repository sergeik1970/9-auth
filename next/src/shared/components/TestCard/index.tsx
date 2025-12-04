import React, { ReactElement } from "react";
import { useRouter } from "next/router";
import { useSelector } from "@/shared/store/store";
import { selectAuth } from "@/shared/store/slices/auth";
import Button from "@/shared/components/Button";
import type { Test } from "@/shared/types/test";
import styles from "./index.module.scss";
import TestStatus from "@/shared/components/TestStatus";

interface TestCardProps {
    test: Test;
    className?: string;
    onUpdate: () => void;
    isActiveAttempt?: boolean;
    attemptId?: number;
}

const getWord = (count: number, words: [string, string, string]): string => {
    const remainder10 = count % 10;
    const remainder100 = count % 100;

    if (remainder100 >= 11 && remainder100 <= 19) {
        return words[2];
    }

    if (remainder10 === 1) {
        return words[0];
    }

    if (remainder10 >= 2 && remainder10 <= 4) {
        return words[1];
    }

    return words[2];
};

const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const parts: string[] = [];

    if (hours > 0) {
        parts.push(`${hours} ${getWord(hours, ["час", "часа", "часов"])}`);
    }

    if (mins > 0) {
        parts.push(`${mins} ${getWord(mins, ["минута", "минуты", "минут"])}`);
    }

    return parts.join(" ");
};

const formatDeadline = (dueDateString: string): string => {
    if (!dueDateString) return "";

    const date = new Date(dueDateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
};

const TestCard = ({
    test,
    className,
    isActiveAttempt = false,
    attemptId,
    onUpdate,
}: TestCardProps): ReactElement => {
    const router = useRouter();
    const { user } = useSelector(selectAuth);

    const handleViewTest = () => {
        if (isActiveAttempt && attemptId) {
            router.push(`/tests/detail?id=${test.id}&attemptId=${attemptId}`);
        } else {
            router.push(`/tests/detail?id=${test.id}`);
        }
    };

    return (
        <div className={`${styles.testCard} ${className || ""}`}>
            <div className={styles.testInfo}>
                <div className={styles.testHeader}>
                    <h3 className={styles.testName}>{test.title}</h3>
                </div>

                {test.description && <p className={styles.testDescription}>{test.description}</p>}

                <div className={styles.testMeta}>
                    {/* <span className={styles.metaItem}>📝 {test.questions.length} вопросов</span> */}
                    {test.timeLimit && (
                        <span className={styles.metaItem}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="10" x2="14" y1="2" y2="2" />
                                <line x1="12" x2="15" y1="14" y2="11" />
                                <circle cx="12" cy="14" r="8" />
                            </svg>
                            {formatTime(test.timeLimit)}
                        </span>
                    )}
                    {test.creator?.name && test.creator.id !== user?.id && (
                        <span className={styles.metaItem}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-circle-user-round-icon lucide-circle-user-round"
                            >
                                <path d="M18 20a6 6 0 0 0-12 0" />
                                <circle cx="12" cy="10" r="4" />
                                <circle cx="12" cy="12" r="10" />
                            </svg>
                            {test.creator.name}
                            {test.creator.patronymic && ` ${test.creator.patronymic}`}
                        </span>
                    )}
                    {test.dueDate && (
                        <span className={styles.metaItem}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M8 2v4m8-4v4M3 4.5A2.5 2.5 0 0 1 5.5 2h13A2.5 2.5 0 0 1 21 4.5v15a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 19.5Z" />
                                <line x1="3" x2="21" y1="7" y2="7" />
                            </svg>
                            До: {formatDeadline(test.dueDate)}
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.testActions}>
                <TestStatus status={test.status} />
                <Button
                    variant={isActiveAttempt ? "primary" : "outline"}
                    size="small"
                    onClick={handleViewTest}
                >
                    {isActiveAttempt ? "Продолжить тест" : "Подробнее"}
                </Button>
            </div>
        </div>
    );
};

export default TestCard;
