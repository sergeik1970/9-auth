import React, { ReactElement, useEffect } from "react";
import { useRouter } from "next/router";
import { ClipboardList } from "lucide-react";
import { useSelector, useDispatch } from "@/shared/store/store";
import LoadingState from "@/shared/components/LoadingState";
import EmptyState from "@/shared/components/EmptyState";
import Button from "@/shared/components/Button";
import TestCard from "@/shared/components/TestCard";
import { isTeacher, type UserRole } from "@/shared/utils/roles";
import {
    getTests,
    getAvailableTests,
    getActiveAttempts,
    selectTest,
} from "@/shared/store/slices/test";
import styles from "./index.module.scss";

interface TestListProps {
    userRole?: UserRole;
    onCreateTest?: () => void;
    onError?: (error: string) => void;
    isMainDashboard?: boolean;
}

const TestList = ({
    userRole,
    onCreateTest,
    onError,
    isMainDashboard = false,
}: TestListProps): ReactElement => {
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [isHydrated, setIsHydrated] = React.useState(false);
    const [isDraftsOpen, setIsDraftsOpen] = React.useState(false);
    const [isArchivedOpen, setIsArchivedOpen] = React.useState(false);

    const {
        items: tests,
        loading: isLoading,
        error,
        activeAttempts,
        activeAttemptsLoading,
    } = useSelector(selectTest);

    const isUserTeacher = userRole && isTeacher(userRole);

    const dispatch = useDispatch();

    React.useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isUserTeacher) {
            dispatch(getTests());
        } else {
            dispatch(getAvailableTests());
        }
        dispatch(getActiveAttempts());
    }, [dispatch, isUserTeacher]);

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
        if (isUserTeacher) {
            dispatch(getTests());
        } else {
            dispatch(getAvailableTests());
        }
        dispatch(getActiveAttempts());
        setTimeout(() => setIsRefreshing(false), 600);
    };

    const sortByUpdated = (testArray: typeof tests) => {
        return [...testArray].sort((a, b) => {
            const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return bUpdated - aUpdated;
        });
    };

    const activeTests = sortByUpdated(tests.filter((t) => t.status === "active"));
    const completedTests = sortByUpdated(tests.filter((t) => t.status === "completed"));
    const draftTests = sortByUpdated(tests.filter((t) => t.status === "draft"));
    const archivedTests = sortByUpdated(tests.filter((t) => t.status === "archived"));

    if (isLoading || !isHydrated) {
        return <LoadingState message="Загрузка тестов..." />;
    }

    return (
        <div className={styles.testContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    {isUserTeacher
                        ? isMainDashboard
                            ? "Активные тесты"
                            : "Мои тесты"
                        : "Доступные тесты"}
                </h1>
                <div className={styles.headerActions}>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className={`${styles.refreshIcon} ${isRefreshing ? styles.spinning : ""}`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-refresh-ccw-icon lucide-refresh-ccw"
                        >
                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                            <path d="M16 16h5v5" />
                        </svg>
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
                                onUpdate={handleRefresh}
                                isActiveAttempt={true}
                                attemptId={attempt.id}
                            />
                        ))}
                    </div>
                </div>
            )}

            {isUserTeacher ? (
                // Вид для учителя
                isMainDashboard ? (
                    // На главной странице показываем только активные
                    activeTests.length === 0 ? (
                        <EmptyState
                            title="У вас пока нет тестов"
                            message="Создайте свой первый тест, чтобы начать работу!"
                            actionText="Создать первый тест"
                            onAction={handleCreateTest}
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="64"
                                    height="64"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-clipboard-pen-icon lucide-clipboard-pen"
                                >
                                    <rect width="8" height="4" x="8" y="2" rx="1" />
                                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5.5" />
                                    <path d="M4 13.5V6a2 2 0 0 1 2-2h2" />
                                    <path d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
                                </svg>
                            }
                        />
                    ) : (
                        <div>
                            {/* Активные тесты */}
                            <div className={styles.testSection}>
                                <div className={styles.testList}>
                                    {activeTests.map((test) => (
                                        <TestCard
                                            key={test.id}
                                            test={test}
                                            onUpdate={handleRefresh}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Кнопка Все тесты */}
                            {(completedTests.length > 0 ||
                                draftTests.length > 0 ||
                                archivedTests.length > 0) && (
                                <div className={`${styles.testSection} ${styles.centered}`}>
                                    <Button
                                        variant="primary"
                                        onClick={() => router.push("/dashboard/tests")}
                                    >
                                        Все тесты
                                    </Button>
                                </div>
                            )}
                        </div>
                    )
                ) : // На странице Мои тесты показываем все
                activeTests.length === 0 &&
                  completedTests.length === 0 &&
                  draftTests.length === 0 &&
                  archivedTests.length === 0 ? (
                    <EmptyState
                        title="У вас пока нет тестов"
                        message="Создайте свой первый тест, чтобы начать работу!"
                        actionText="Создать первый тест"
                        onAction={handleCreateTest}
                        icon={
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="64"
                                height="64"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-clipboard-pen-icon lucide-clipboard-pen"
                            >
                                <rect width="8" height="4" x="8" y="2" rx="1" />
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5.5" />
                                <path d="M4 13.5V6a2 2 0 0 1 2-2h2" />
                                <path d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
                            </svg>
                        }
                    />
                ) : (
                    <div>
                        {/* Активные тесты */}
                        {activeTests.length > 0 && (
                            <div className={styles.testSection}>
                                <h2 className={styles.sectionTitle}>Активные тесты</h2>
                                <div className={styles.testList}>
                                    {activeTests.map((test) => (
                                        <TestCard
                                            key={test.id}
                                            test={test}
                                            onUpdate={handleRefresh}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Завершенные тесты */}
                        {completedTests.length > 0 && (
                            <div className={styles.testSection}>
                                <h2 className={styles.sectionTitle}>Завершенные тесты</h2>
                                <div className={styles.testList}>
                                    {completedTests.map((test) => (
                                        <TestCard
                                            key={test.id}
                                            test={test}
                                            onUpdate={handleRefresh}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Черновики */}
                        {draftTests.length > 0 && (
                            <div className={styles.testSection}>
                                <button
                                    className={styles.collapsibleHeader}
                                    onClick={() => setIsDraftsOpen(!isDraftsOpen)}
                                >
                                    <span
                                        className={`${styles.arrow} ${isDraftsOpen ? styles.open : ""}`}
                                    >
                                        ▶
                                    </span>
                                    <h2 className={styles.sectionTitle}>
                                        Черновики ({draftTests.length})
                                    </h2>
                                </button>
                                {isDraftsOpen && (
                                    <div className={styles.testList}>
                                        {draftTests.map((test) => (
                                            <TestCard
                                                key={test.id}
                                                test={test}
                                                onUpdate={handleRefresh}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Архивированные */}
                        {archivedTests.length > 0 && (
                            <div className={styles.testSection}>
                                <button
                                    className={styles.collapsibleHeader}
                                    onClick={() => setIsArchivedOpen(!isArchivedOpen)}
                                >
                                    <span
                                        className={`${styles.arrow} ${isArchivedOpen ? styles.open : ""}`}
                                    >
                                        ▶
                                    </span>
                                    <h2 className={styles.sectionTitle}>
                                        Архивированные ({archivedTests.length})
                                    </h2>
                                </button>
                                {isArchivedOpen && (
                                    <div className={styles.testList}>
                                        {archivedTests.map((test) => (
                                            <TestCard
                                                key={test.id}
                                                test={test}
                                                onUpdate={handleRefresh}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            ) : // Вид для студента
            activeTests.length === 0 && activeAttempts.length === 0 ? (
                <EmptyState
                    title="Нет доступных тестов"
                    message="Пока нет активных тестов для прохождения"
                    icon={<ClipboardList size={48} />}
                />
            ) : (
                <div>
                    {activeAttempts.length > 0 && (
                        <h2 className={styles.sectionTitle}>Все тесты</h2>
                    )}
                    <div className={styles.testList}>
                        {activeTests.map((test) => (
                            <TestCard key={test.id} test={test} onUpdate={handleRefresh} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestList;
