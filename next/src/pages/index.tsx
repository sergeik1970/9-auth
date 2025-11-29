import Head from "next/head";
import HomePage from "@/shared/pages/Home";
import React from "react";

const Main = () => {
    return (
        <>
            <Head>
                <title>Главная</title>
            </Head>
            <HomePage />
        </>
    );
};

export default Main;
