import React, { ReactElement, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "@/shared/store/store";
import Button from "@/shared/components/Button";
import styles from "./index.module.scss";
import TestInfoForm, { TestInfoData } from "@/shared/components/TestInfoForm";
import { isTeacher } from "@/shared/utils/roles";
import { createTest } from "@/shared/store/slices/test";

export interface TestForm {
    title: string;
    description: string;
    timeLimit: number;
    // questions: QuestionData[];
}

interface CreateTestProps {
    onSuccess?: (testId: string) => void;
    onError?: (error: string) => void;
}

const CreateTest = ({ onSuccess, onError }: CreateTestProps): ReactElement => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [testInfo, setTestInfo] = useState<TestInfoData>({
        title: "", // Начальное название пустое
        description: "",
        timeLimit: undefined,
    });
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useSelector((state) => state.auth);

    // Проверка роли
    const hasAccess = user && isTeacher(user.role);

    useEffect(() => {
        if (!hasAccess) {
            router.push("/dashboard");
        }
    }, [hasAccess, router]);

    if (!hasAccess) {
        return <div>Загрузка...</div>; // Или null, но лучше показать что-то
    }

    const handleSubmit = async (e: React.FormEvent) => {
        console.log("Form submitted!");
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await dispatch(
                createTest({
                    title: testInfo.title,
                    description: testInfo.description,
                    timeLimit: testInfo.timeLimit,
                }),
            ).unwrap();

            // После успеха - редирект на dashboard
            router.push("/dashboard");
        } catch (error) {
            // Обработка ошибки
            if (onError) {
                onError(error as string);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // const isFormValid = validationErrors.length === 0 && testInfo.title.trim().length > 0 && questions.length > 0;
    return (
        <div className={styles.createTest}>
            <div className={styles.header}>
                <h1 className={styles.title}>Создание нового теста</h1>
                <p className={styles.description}>
                    Заполните информацию о тесте и добавьте вопросы
                </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <TestInfoForm data={testInfo} onChange={setTestInfo} disabled={isLoading} />

                <div className={styles.actions}>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={
                            isLoading || !testInfo.title
                            // questions.length === 0
                        }
                    >
                        {isLoading ? "Создание..." : "Создать тест"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateTest;
