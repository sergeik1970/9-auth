import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import { Test } from "@/shared/types/test";

const TestTaker = dynamic(
    () =>
        import("@/shared/components/TestTaker").then((mod) => ({
            default: mod.TestTaker,
        })),
    {
        ssr: false,
    },
);

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

        loadTestAndCheckAttempt();
    }, [testId]);

    const loadTestAndCheckAttempt = async () => {
        try {
            const testResponse = await fetch(`/api/tests/${testId}`);
            if (!testResponse.ok) throw new Error("Failed to load test");
            const testData = await testResponse.json();
            setTest(testData);

            const attemptsResponse = await fetch("/api/tests/active-attempts", {
                credentials: "include",
            });
            console.log("Active attempts response:", attemptsResponse.status);
            if (attemptsResponse.ok) {
                const attempts = await attemptsResponse.json();
                console.log("Active attempts:", attempts);
                const activeAttempt = attempts.find(
                    (attempt: any) => attempt.testId === parseInt(testId || "0"),
                );
                console.log("Found active attempt:", activeAttempt);
                if (activeAttempt) {
                    console.log("Redirecting to existing attempt:", activeAttempt.id);
                    router.replace(`/tests/${testId}/take/${activeAttempt.id}`);
                    return;
                }
            } else {
                console.log("Failed to fetch attempts:", attemptsResponse.status);
            }
        } catch (err) {
            console.error("Error in loadTestAndCheckAttempt:", err);
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
