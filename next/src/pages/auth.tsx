import React from "react";
import Head from "next/head";
// import Auth from "@shared/components/Auth";
import Auth from "../shared/components/Auth";

const Main = () => {
    return (
        <>
            <Head>
                <title>Авторизация</title>
            </Head>
            <Auth />
        </>
    );
};

export default Main;
