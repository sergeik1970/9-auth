import React, { ReactElement } from "react";
import ProcessBlock from "@/shared/components/ProcessBlock";
import StudentProfileBlock from "@/shared/components/StudentProfileBlock";
import styles from "./index.module.scss";

const ProcessSectionBlock = (): ReactElement => {
    return (
        <div className={styles.processSectionBlock}>
            <div className={styles.processBlockWrapper}>
                <ProcessBlock />
            </div>
            <div className={styles.studentProfileBlockWrapper}>
                <StudentProfileBlock />
            </div>
        </div>
    );
};

export default ProcessSectionBlock;
