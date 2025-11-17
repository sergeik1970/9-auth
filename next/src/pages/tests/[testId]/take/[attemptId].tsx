import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import { TestTaker } from "@/shared/components/TestTaker";
import { Test } from "@/shared/types/test";

const TakeTestWithAttemptPage = () => {
    const router = useRouter();
    const [testId, setTestId] = useState<string | null>(null);
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [test, setTest] = useState<Test | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!router.isReady) return;
        const queryTestId = router.query.testId;
        const queryAttemptId = router.query.attemptId;
        if (queryTestId) {
            setTestId(Array.isArray(queryTestId) ? queryTestId[0] : queryTestId);
        }
        if (queryAttemptId) {
            const parsedAttemptId = parseInt(
                Array.isArray(queryAttemptId) ? queryAttemptId[0] : queryAttemptId,
                10,
            );
            if (!isNaN(parsedAttemptId)) {
                setAttemptId(parsedAttemptId);
            }
        }
    }, [router.isReady, router.query.testId, router.query.attemptId]);

    useEffect(() => {
        if (!testId) return;

        loadTest();
    }, [testId]);

    const loadTest = async () => {
        try {
            const response = await fetch(`/api/tests/${testId}`);
            if (!response.ok) throw new Error("Failed to load test");
            const data = await response.json();
            setTest(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    if (!router.isReady) {
        return <div>Загрузка...</div>;
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div>Загрузка теста...</div>
            </DashboardLayout>
        );
    }

    if (error || !test) {
        return (
            <DashboardLayout>
                <div>Ошибка: {error || "Test not found"}</div>
            </DashboardLayout>
        );
    }

    return (
        <div>
            <TestTaker test={test} attemptId={attemptId || undefined} />
        </div>
    );
};

export default TakeTestWithAttemptPage;
