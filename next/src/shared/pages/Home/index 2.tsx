import React, { ReactElement } from "react";
import Header from "@/shared/components/Header";
import styles from "./index.module.scss";
import HeroSection from "@/shared/components/HeroSection";

const HomePage = (): ReactElement => {
    return (
        <div className={styles.homePage}>
            <Header />
            <main className={styles.main}>
                <HeroSection />
            </main>
        </div>
    );
};

export default HomePage;
