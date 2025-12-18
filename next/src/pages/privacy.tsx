import React from "react";
import Head from "next/head";
import Privacy from "../shared/pages/Privacy";

const PrivacyPage = () => {
    return (
        <>
            <Head>
                <title>Политика конфиденциальности</title>
                <meta name="description" content="Политика конфиденциальности Skorix" />
            </Head>
            <Privacy />
        </>
    );
};

export default PrivacyPage;
