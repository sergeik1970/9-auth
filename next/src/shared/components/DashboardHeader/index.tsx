import React, { ReactElement } from "react";
import Button from "@/shared/components/Button";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "@/shared/store/store";
import { isTeacher, getDashboardTitle } from "@/shared/utils/roles";
import styles from "./index.module.scss";

const DashboardHeader = (): ReactElement => {
    const { user } = useSelector((state) => state.auth);
    const router = useRouter();

    return (
        <div className={styles.header}>
            <h1 className={styles.title}>
                {user?.role ? getDashboardTitle(user.role) : "Панель пользователя"}
            </h1>
            {user?.role && isTeacher(user.role) && (
                <Button
                    className={styles.createButton}
                    variant="primary"
                    onClick={() => router.push("/dashboard/tests/create")}
                >
                    Создать новый тест
                </Button>
            )}
        </div>
    );
};

export default DashboardHeader;
