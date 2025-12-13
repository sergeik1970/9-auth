import React, { ReactElement } from "react";
import Link from "next/link";
import Button from "@/shared/components/Button";
import styles from "./index.module.scss";

const StudentBlock = (): ReactElement => {
    return (
        <section className={styles.studentBlock}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h2 className={styles.title}>Ученик?</h2>
                    <Link href="/auth">
                        <Button variant="primary" size="large">
                            Авторизоваться
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default StudentBlock;
