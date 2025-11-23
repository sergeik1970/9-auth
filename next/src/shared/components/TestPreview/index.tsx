import React, { ReactElement, useEffect } from "react";
import Button from "@/shared/components/Button";
import { getTestById, getTests, selectTest } from "@/shared/store/slices/test";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from "@/shared/store/store";
import { useRouter } from "next/router";
import LoadingState from "@/shared/components/LoadingState";

interface TestPreviewProps {
    isOwner?: boolean;
    isStarting?: boolean;
    onStartTest?: () => void;
    onError?: (error: string) => void;
    testId?: number;
    isActiveAttempt?: boolean;
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

const TestPreview = ({
    isOwner = false,
    isStarting = false,
    onStartTest,
    onError,
    testId,
    isActiveAttempt = false,
}: TestPreviewProps): ReactElement => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { selectedTest: test, selectedLoading: isLoading, error } = useSelector(selectTest);

    // Получаем ID теста из URL, если не передан через props
    const id = testId || (router.query.id ? Number(router.query.id) : undefined);

    useEffect(() => {
        // Загружаем тест при монтировании компонента, если есть ID
        if (id) {
            dispatch(getTestById(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [error, onError]);

    if (isLoading) {
        return <LoadingState message="Загрузка теста..." />;
    }

    if (!test) {
        return <div className={styles.error}>Тест не найден</div>;
    }

    return (
        <div className={styles.content}>
            <div className={styles.info}>
                <h2 className={styles.title}>{test.title}</h2>
                <div className={styles.infoItem}>
                    <strong>Описание:</strong>
                    <p>{test.description || "Описание не указано"}</p>
                </div>
                <div className={styles.infoItem}>
                    <strong>Время на прохождение:</strong>
                    <p>{test.timeLimit ? formatTime(test.timeLimit) : "Не ограничено"}</p>
                </div>

                {/* <div className={styles.infoItem}>
                    <strong>Количество вопросов:</strong>
                    <p>{test.questions.length}</p>
                </div> */}

                {test.creator && (
                    <div className={styles.infoItem}>
                        <strong>Автор:</strong>
                        <p>{test.creator.name}</p>
                    </div>
                )}
            </div>

            {onStartTest && (
                <div className={styles.actions}>
                    <Button
                        onClick={onStartTest}
                        disabled={isStarting}
                        variant={isActiveAttempt ? "primary" : "outline"}
                    >
                        {isStarting
                            ? "Загрузка..."
                            : isActiveAttempt
                              ? "Продолжить тест"
                              : "Начать тест"}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TestPreview;
