import React, { ReactElement, useEffect } from "react";
import { useRouter } from "next/router";
import TestPreview from "@/shared/components/TestPreview";

const TestDetailPage = (): ReactElement => {
    const router = useRouter();
    const { id } = router.query;

    const handleStartTest = () => {
        // Логика начала теста
        console.log("Начинаем тест");
    };

    const handleError = (error: string) => {
        console.error("Ошибка при загрузке теста", error);
    };

    return (
        <div className="container">
            <h1>Детали теста</h1>
            {id ? (
                <TestPreview
                    testId={Number(id)}
                    isOwner={true}
                    onStartTest={handleStartTest}
                    onError={handleError}
                />
            ) : (
                <p>Загрузка ID теста...</p>
            )}
        </div>
    );
};

export default TestDetailPage;
