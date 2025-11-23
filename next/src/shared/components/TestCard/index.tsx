import React, { ReactElement } from "react";
import { useRouter } from "next/router";
import { useSelector } from "@/shared/store/store";
import Button from "@/shared/components/Button";
import type { Test } from "@/shared/types/test";
import { isTeacher } from "@/shared/utils/roles";
import styles from "./index.module.scss";
import { User } from "@/shared/types/auth";
import { selectAuth } from "@/shared/store/slices/auth";
import TestStatus, { TestStatus as TestStatusType } from "@/shared/components/TestStatus";

interface TestCardProps {
    test: Test;
    // showCreator?: boolean;
    className?: string;
    creator?: User;
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

const TestCard = ({
    test,
    className,
    creator,
    isActiveAttempt = false,
    attemptId,
}: TestCardProps): ReactElement => {
    const { user } = useSelector(selectAuth);
    const router = useRouter();

    const shouldShowStatus = (status: TestStatusType): boolean => {
        if (status === "draft" && test.creator?.id !== user?.id) {
            return false; // скрываем черновик, если ты не создатель
        }
        return true;
    };

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
                    <TestStatus status={test.status} shouldShow={shouldShowStatus} />
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
                    {user?.role && isTeacher(user.role) && test.creator?.name && (
                        <span className={styles.metaItem}>👨‍🏫 {test.creator.name}</span>
                    )}
                </div>
            </div>

            <div className={styles.testActions}>
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
