import React, { ReactElement, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "@/shared/store/store";
import { selectAuth } from "@/shared/store/slices/auth";
import { selectTest } from "@/shared/store/slices/test";
import TestPreview from "@/shared/components/TestPreview";
import styles from "./index.module.scss";

const TestDetailPage = (): ReactElement => {
    const router = useRouter();
    const [id, setId] = useState<string | number | null>(null);
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const { user } = useSelector(selectAuth);
    const { selectedTest } = useSelector(selectTest);

    useEffect(() => {
        if (!router.isReady) return;
        const queryId = router.query.id;
        const queryAttemptId = router.query.attemptId;
        if (queryId) {
            const resolvedId = Array.isArray(queryId) ? queryId[0] : queryId;
            setId(resolvedId);
        }
        if (queryAttemptId) {
            const resolvedAttemptId = Array.isArray(queryAttemptId)
                ? queryAttemptId[0]
                : queryAttemptId;
            setAttemptId(Number(resolvedAttemptId));
        }
    }, [router.isReady, router.query.id, router.query.attemptId]);

    const handleStartTest = async () => {
        if (!id) return;

        setIsStarting(true);
        try {
            if (attemptId) {
                await router.push(`/tests/${id}/take/${attemptId}`);
            } else {
                await router.push(`/tests/${id}/take`);
            }
        } catch (error) {
            console.error("Ошибка при переходе к тесту:", error);
            setIsStarting(false);
        }
    };

    const handleError = (error: string) => {
        console.error("Ошибка при загрузке теста", error);
    };

    const isOwner =
        selectedTest &&
        user &&
        (selectedTest.creator?.id === user.id || selectedTest.creatorId === user.id);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backButton} onClick={() => router.back()}>
                    ← Назад
                </button>
                <h1 className={styles.title}>Детали теста</h1>
            </div>
            {id ? (
                <TestPreview
                    testId={Number(id)}
                    isOwner={!!isOwner}
                    onStartTest={handleStartTest}
                    onError={handleError}
                    isStarting={isStarting}
                    isActiveAttempt={!!attemptId}
                />
            ) : (
                <p>Загрузка ID теста...</p>
            )}
        </div>
    );
};

export default TestDetailPage;
