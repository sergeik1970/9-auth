import React, { ReactElement, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "@/shared/store/store";
import Button from "@/shared/components/Button";
import LoadingState from "@/shared/components/LoadingState";
import EmptyState from "@/shared/components/EmptyState";
import TestCard from "@/shared/components/TestCard";
import { isTeacher, type UserRole } from "@/shared/utils/roles";
import { getTests } from "@/shared/store/slices/test";
import { Test } from "@/shared/types/test";
import styles from "./index.module.scss";

interface TestListProps {
    userRole?: UserRole;
    onCreateTest?: () => void;
    onError?: (error: string) => void;
}

const TestList = ({ userRole, onCreateTest, onError }: TestListProps): ReactElement => {
    const router = useRouter();

    const { items: tests, loading: isLoading, error } = useSelector((state) => state.test);

    const isUserTeacher = userRole && isTeacher(userRole);

    const dispatch = useDispatch();
    const loadTests = () => {
        dispatch(getTests());
    };

    useEffect(() => {
        loadTests();
    }, []);

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
        loadTests();
    };
    return (
        <div className={styles.testContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>{isUserTeacher ? "Мои тесты" : "Доступные тесты"}</h1>
                <div className={styles.headerActions}>
                    <Button variant="secondary" onClick={handleRefresh} disabled={isLoading}>
                        Обновить
                    </Button>
                    {isUserTeacher && (
                        <Button variant="primary" onClick={handleCreateTest}>
                            Создать новый тест
                        </Button>
                    )}
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

            {tests.length === 0 ? (
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
            )}
        </div>
    );
};

export default TestList;
