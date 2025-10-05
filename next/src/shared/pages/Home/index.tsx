import React, { ReactElement } from "react";
import Header from "@/shared/components/Header";
import styles from "./index.module.scss";

const HomePage = (): ReactElement => {
    return (
        <div className={styles.homePage}>
            <Header />
        </div>
    );
};

export default HomePage;
