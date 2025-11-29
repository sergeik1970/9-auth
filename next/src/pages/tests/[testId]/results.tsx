import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import { TestResults as TestResultsComponent } from "@/shared/components/TestResults";
import { TestResults } from "@/shared/types/test";

const ResultsPage = () => {
    const router = useRouter();
    const [testId, setTestId] = useState<string | null>(null);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [results, setResults] = useState<TestResults | null>(null);
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
            setAttemptId(Array.isArray(queryAttemptId) ? queryAttemptId[0] : queryAttemptId);
        }
    }, [router.isReady, router.query.testId, router.query.attemptId]);

    useEffect(() => {
        if (!attemptId || !testId) return;

        loadResults();
    }, [attemptId, testId]);

    const loadResults = async () => {
        try {
            const response = await fetch(`/api/tests/${testId}/attempts/${attemptId}/results`);
            if (!response.ok) throw new Error("Failed to load results");
            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = () => {
        router.push(`/tests/${testId}/take`);
    };

    const handleGoBack = () => {
        router.push("/dashboard");
    };

    if (!router.isReady) {
        return <div>Загрузка...</div>;
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div>Загрузка результатов...</div>
            </DashboardLayout>
        );
    }

    if (error || !results) {
        return (
            <DashboardLayout>
                <div>Ошибка: {error || "Results not found"}</div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <Head>
                <title>Результаты</title>
            </Head>
            <DashboardLayout>
                <TestResultsComponent results={results} onRetry={handleRetry} onGoBack={handleGoBack} />
            </DashboardLayout>
        </>
    );
};

export default ResultsPage;
