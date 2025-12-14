import React, { ReactElement } from "react";
import styles from "./index.module.scss";

const ProcessTitleBlock = (): ReactElement => {
    return (
        <section className={styles.processTitleBlock} id="how-it-works">
            <div className={styles.container}>
                <h2 className={styles.title}>Как работает <span className={styles.highlightText}>Skorix</span></h2>
            </div>
        </section>
    );
};

export default ProcessTitleBlock;
