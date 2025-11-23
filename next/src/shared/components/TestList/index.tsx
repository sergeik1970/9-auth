import React, { ReactElement, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "@/shared/store/store";
import LoadingState from "@/shared/components/LoadingState";
import EmptyState from "@/shared/components/EmptyState";
import TestCard from "@/shared/components/TestCard";
import { isTeacher, type UserRole } from "@/shared/utils/roles";
import { getTests, getActiveAttempts, selectTest } from "@/shared/store/slices/test";
import styles from "./index.module.scss";

interface TestListProps {
    userRole?: UserRole;
    onCreateTest?: () => void;
    onError?: (error: string) => void;
}

const TestList = ({ userRole, onCreateTest, onError }: TestListProps): ReactElement => {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    const {
        items: tests,
        loading: isLoading,
        error,
        activeAttempts,
        activeAttemptsLoading,
    } = useSelector(selectTest);

    console.log("TestList - activeAttempts:", activeAttempts);
    console.log("TestList - activeAttemptsLoading:", activeAttemptsLoading);

    const isUserTeacher = userRole && isTeacher(userRole);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getTests());
        dispatch(getActiveAttempts());
    }, [dispatch]);

    // Обработка ошибок из Redux
    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [error, onError]);

    const handleCreateTest = () => {
        if (onCreateTest) {
            onCreateTest();
        } else {
            router.push("/create");
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        dispatch(getTests());
        dispatch(getActiveAttempts());
        setTimeout(() => setIsRefreshing(false), 600);
    };

    if (isLoading) {
        return <LoadingState message="Загрузка тестов..." />;
    }
    return (
        <div className={styles.testContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>{isUserTeacher ? "Мои тесты" : "Доступные тесты"}</h1>
                <div className={styles.headerActions}>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className={`${styles.refreshIcon} ${isRefreshing ? styles.spinning : ""}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-ccw-icon lucide-refresh-ccw"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                    </button>
                    {/* {isUserTeacher && (
                        <Button variant="primary" onClick={handleCreateTest}>
                            Создать новый тест
                        </Button>
                    )} */}
                </div>
            </div>

            {error && (
                <div className={styles.error}>
                    <span>{error}</span>
                    <Button variant="outline" size="small" onClick={handleRefresh}>
                        Попробовать снова
                    </Button>
                </div>
            )}

            {activeAttempts.length > 0 && (
                <div className={styles.activeAttemptsSection}>
                    <h2 className={styles.sectionTitle}>Начатые тесты</h2>
                    <div className={styles.testList}>
                        {activeAttempts.map((attempt) => (
                            <TestCard
                                key={`attempt-${attempt.id}`}
                                test={attempt.test}
                                creator={attempt.test.creator}
                                onUpdate={handleRefresh}
                                isActiveAttempt={true}
                                attemptId={attempt.id}
                            />
                        ))}
                    </div>
                </div>
            )}

            {tests.length === 0 && activeAttempts.length === 0 ? (
                <EmptyState
                    title={isUserTeacher ? "У вас пока не тестов" : "Нет доступных тестов"}
                    message={
                        isUserTeacher
                            ? "Создайте свой первый тест, чтобы начать работу!"
                            : "Пока нет активных тестов для прохождения"
                    }
                    actionText={isUserTeacher ? "Создать первый тест" : undefined}
                    onAction={isUserTeacher ? handleCreateTest : undefined}
                    icon="📝"
                />
            ) : (
                tests.length > 0 && (
                    <div>
                        {activeAttempts.length > 0 && (
                            <h2 className={styles.sectionTitle}>Все тесты</h2>
                        )}
                        <div className={styles.testList}>
                            {tests.map((test) => (
                                <TestCard
                                    key={test.id}
                                    test={test}
                                    creator={test.creator}
                                    onUpdate={handleRefresh}
                                />
                            ))}
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default TestList;
