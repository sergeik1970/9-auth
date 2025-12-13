import React, { ReactElement } from "react";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import styles from "./index.module.scss";
import HeroSection from "@/shared/components/HeroSection";
import FeaturesBlock from "@/shared/components/FeaturesBlock";
import HowItWorksBlock from "@/shared/components/HowItWorksBlock";
import WhoIsItForBlock from "@/shared/components/WhoIsItForBlock";
import DemoTestBlock from "@/shared/components/DemoTestBlock";
import BenefitsBlock from "@/shared/components/BenefitsBlock";
import FAQBlock from "@/shared/components/FAQBlock";
import CTABlock from "@/shared/components/CTABlock";

const HomePage = (): ReactElement => {
    return (
        <div className={styles.homePage}>
            <Header />
            <main className={styles.main}>
                <HeroSection />
                <FeaturesBlock />
                <HowItWorksBlock />
                <WhoIsItForBlock />
                <DemoTestBlock />
                <BenefitsBlock />
                <FAQBlock />
                <CTABlock />
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;
