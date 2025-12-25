import React, { ReactElement } from "react";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import styles from "./index.module.scss";
import HeroSection from "@/shared/components/HeroSection";
import FeaturesBlock from "@/shared/components/FeaturesBlock";
import ProcessTitleBlock from "@/shared/components/ProcessTitleBlock";
import ProcessSectionBlock from "@/shared/components/ProcessSectionBlock";
import WhoIsItForBlock from "@/shared/components/WhoIsItForBlock";
import BenefitsBlock from "@/shared/components/BenefitsBlock";
import FAQBlock from "@/shared/components/FAQBlock";
import CTABlock from "@/shared/components/CTABlock";
import CookiesBanner from "@/shared/components/CookiesBanner";

const HomePage = (): ReactElement => {
    return (
        <div className={styles.homePage}>
            <Header />
            <main className={styles.main}>
                <HeroSection />
                <FeaturesBlock />
                <ProcessTitleBlock />
                <ProcessSectionBlock />
                <WhoIsItForBlock />
                <BenefitsBlock />
                <FAQBlock />
                <CTABlock />
            </main>
            <Footer />
            <CookiesBanner />
        </div>
    );
};

export default HomePage;
