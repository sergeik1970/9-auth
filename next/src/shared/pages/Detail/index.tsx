import React, { ReactElement, useEffect, useState } from "react";
import { useRouter } from "next/router";
import TestPreview from "@/shared/components/TestPreview";
import styles from "./index.module.scss";

const TestDetailPage = (): ReactElement => {
    const router = useRouter();
    const [id, setId] = useState<string | number | null>(null);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        if (!router.isReady) return;
        const queryId = router.query.id;
        if (queryId) {
            const resolvedId = Array.isArray(queryId) ? queryId[0] : queryId;
            setId(resolvedId);
        }
    }, [router.isReady, router.query.id]);

    const handleStartTest = async () => {
        if (!id) return;

        setIsStarting(true);
        try {
            await router.push(`/tests/${id}/take`);
        } catch (error) {
            console.error("Ошибка при переходе к тесту:", error);
            setIsStarting(false);
        }
    };

    const handleError = (error: string) => {
        console.error("Ошибка при загрузке теста", error);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Детали теста</h1>
            {id ? (
                <TestPreview
                    testId={Number(id)}
                    isOwner={true}
                    onStartTest={handleStartTest}
                    onError={handleError}
                    isStarting={isStarting}
                />
            ) : (
                <p>Загрузка ID теста...</p>
            )}
        </div>
    );
};

export default TestDetailPage;
