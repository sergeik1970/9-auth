import React, { ReactElement } from "react";
import TestIllustration from "@/shared/components/TestIllustation";
import styles from "./index.module.scss";

const DemoTestBlock = (): ReactElement => {
    return (
        <section className={styles.demoTest}>
            <div className={styles.container}>
                <h2 className={styles.title}>Пример теста (демо)</h2>
                <p className={styles.subtitle}>Так выглядит тест в профиле ученика</p>

                <div className={styles.illustrationWrapper}>
                    <TestIllustration />
                </div>
            </div>
        </section>
    );
};

export default DemoTestBlock;
