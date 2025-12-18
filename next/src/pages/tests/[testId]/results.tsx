import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector } from "@/shared/store/store";
import { selectAuth } from "@/shared/store/slices/auth";
import DashboardLayout from "@/shared/components/DashboardLayout";
import { TestResults as TestResultsComponent } from "@/shared/components/TestResults";
import { TestResults } from "@/shared/types/test";

const ResultsPage = () => {
    const router = useRouter();
    const { user } = useSelector(selectAuth);
    const [testId, setTestId] = useState<string | null>(null);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [results, setResults] = useState<TestResults | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
    const [attemptsLoaded, setAttemptsLoaded] = useState(false);

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
            const resultsResponse = await fetch(
                `/api/tests/${testId}/attempts/${attemptId}/results`,
            );
            if (!resultsResponse.ok) throw new Error("Failed to load results");
            const resultsData = await resultsResponse.json();
            setResults(resultsData);

            if (user && testId) {
                const testResponse = await fetch(`/api/tests/${testId}`);
                const testData = await testResponse.json();

                const attemptsResponse = await fetch(`/api/tests/${testId}/attempts`, {
                    credentials: "include",
                });
                if (attemptsResponse.ok) {
                    const attempts = await attemptsResponse.json();

                    if (testData.classSchedules) {
                        const userSchedule = testData.classSchedules.find(
                            (s: any) =>
                                s.classNumber === user.classNumber &&
                                s.classLetter?.toUpperCase() === user.classLetter?.toUpperCase(),
                        );

                        if (userSchedule) {
                            const maxAttempts = userSchedule.maxAttempts ?? 1;
                            const completedAttempts = attempts.filter(
                                (attempt: any) =>
                                    attempt.userId === user.id &&
                                    attempt.classNumber === userSchedule.classNumber &&
                                    attempt.classLetter?.toUpperCase() ===
                                        userSchedule.classLetter?.toUpperCase() &&
                                    attempt.status === "completed",
                            ).length;

                            const remaining = Math.max(0, maxAttempts - completedAttempts);
                            setRemainingAttempts(remaining);
                            setAttemptsLoaded(true);
                        }
                    }
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = () => {
        if (remainingAttempts && remainingAttempts > 0) {
            router.push(`/tests/${testId}/take`);
        }
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
                <TestResultsComponent
                    results={results}
                    onRetry={handleRetry}
                    onGoBack={handleGoBack}
                    remainingAttempts={remainingAttempts}
                    attemptsLoaded={attemptsLoaded}
                />
            </DashboardLayout>
        </>
    );
};

export default ResultsPage;
