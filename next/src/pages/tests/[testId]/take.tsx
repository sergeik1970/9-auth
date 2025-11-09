import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import { TestTaker } from "@/shared/components/TestTaker";
import { Test } from "@/shared/types/test";

const TakeTestPage = () => {
    const router = useRouter();
    const [testId, setTestId] = useState<string | null>(null);
    const [test, setTest] = useState<Test | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!router.isReady) return;
        const queryTestId = router.query.testId;
        if (queryTestId) {
            setTestId(Array.isArray(queryTestId) ? queryTestId[0] : queryTestId);
        }
    }, [router.isReady, router.query.testId]);

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
            <TestTaker test={test} />
        </div>
    );
};

export default TakeTestPage;
