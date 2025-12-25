import React, { ReactElement } from "react";
import styles from "./index.module.scss";

const StudentProfileBlock = (): ReactElement => {
    return (
        <section className={styles.studentProfileBlock}>
            <div className={styles.container}>
                <h3 className={styles.profileCardLabel}>Профиль ученика</h3>
                <div className={styles.profileCard}>
                    <h3 className={styles.profileTitle}>Мои тесты</h3>
                    <div className={styles.testsList}>
                        <div className={styles.testItem}>
                            <div className={styles.testHeader}>
                                <h4 className={styles.testName}>История России</h4>
                                <span className={`${styles.testStatus} ${styles.statusCompleted}`}>
                                    Завершён
                                </span>
                            </div>
                            <p className={styles.testDate}>20 вопросов · 10 дек</p>
                        </div>
                        <div className={styles.testItem}>
                            <div className={styles.testHeader}>
                                <h4 className={styles.testName}>Английский язык</h4>
                                <span className={`${styles.testStatus} ${styles.statusInProgress}`}>
                                    В процессе
                                </span>
                            </div>
                            <p className={styles.testDate}>15 вопросов · 15 дек</p>
                        </div>
                        <div className={styles.testItem}>
                            <div className={styles.testHeader}>
                                <h4 className={styles.testName}>Математика</h4>
                                <span className={`${styles.testStatus} ${styles.statusNew}`}>
                                    Новый
                                </span>
                            </div>
                            <p className={styles.testDate}>25 вопросов · 18 дек</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StudentProfileBlock;
