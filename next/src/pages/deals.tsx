import React from "react";
import Head from "next/head";
import Deals from "@/shared/pages/Deals";

const Main = () => {
    return (
        <>
            <Head>
                <title>Предложения</title>
            </Head>
            <Deals />
        </>
    );
};

export default Main;
