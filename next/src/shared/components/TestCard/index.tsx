import React, { ReactElement } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "@/shared/store/store";
import Button from "@/shared/components/Button";
import TestStatus from "@/shared/components/TestStatus";
import Link from "next/link";
import type { Test } from "@/shared/types/test";
import { isTeacher } from "@/shared/utils/roles";
import styles from "./index.module.scss";

interface TestCardProps {
    test: Test;
    // showCreator?: boolean;
    className?: string;
    creator: string;
    // onUpdate: () => void;
}

const TestCard = ({ test, className, creator }: TestCardProps): ReactElement => {
    const { user } = useSelector((state) => state.auth);
    const router = useRouter();

    const handleViewTest = () => {
        router.push(`dashboard/tests/detail?id=${test.id}`);
    };

    return (
        <div className={`${styles.testCard} ${className || ""}`}>
            <div className={styles.testInfo}>
                <div className={styles.testHeader}>
                    <h3 className={styles.testName}>{test.title}</h3>
                    <TestStatus status={test.status} />
                </div>

                {test.description && <p className={styles.testDescription}>{test.description}</p>}

                <div className={styles.testMeta}>
                    {/* <span className={styles.metaItem}>📝 {test.questions.length} вопросов</span> */}
                    {test.timeLimit && (
                        <span className={styles.metaItem}>⏱️ {test.timeLimit} мин</span>
                    )}
                    {user?.role && isTeacher(user.role) && (
                        <span className={styles.metaItem}>👨‍🏫 {test.creator.name}</span>
                    )}
                </div>
            </div>

            <div className={styles.testActions}>
                <Button variant="outline" size="small" onClick={handleViewTest}>
                    Подробнее
                </Button>
            </div>
        </div>
    );
};

export default TestCard;
