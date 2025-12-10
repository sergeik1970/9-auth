import React, { ReactElement, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useDispatch, useSelector } from "@/shared/store/store";
import { fetchStudents, selectUsers } from "@/shared/store/slices/users";
import LoadingState from "@/shared/components/LoadingState";
import styles from "./index.module.scss";

const StudentsList = (): ReactElement => {
    const dispatch = useDispatch();
    const { students, loading, error } = useSelector(selectUsers);

    useEffect(() => {
        dispatch(fetchStudents());
    }, [dispatch]);

    if (loading) {
        return <LoadingState message="Загрузка списка студентов..." />;
    }

    if (error) {
        return <div className={styles.error}>Ошибка: {error}</div>;
    }

    if (students.length === 0) {
        return <div className={styles.empty}>Студентов не найдено</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Ученики</h1>
            <div className={styles.banner}>
                <AlertTriangle className={styles.bannerIcon} />
                <div className={styles.bannerContent}>
                    <p className={styles.bannerText}>
                        Этот раздел находится в разработке и может работать с ошибками.
                    </p>
                </div>
            </div>
            <div className={styles.list}>
                {students.map((student) => (
                    <div key={student.id} className={styles.studentCard}>
                        <h3 className={styles.name}>{student.name}</h3>
                        <p className={styles.email}>{student.email}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentsList;
