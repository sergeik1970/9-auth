import Head from "next/head";
import HomePage from "@/shared/pages/Home";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "@/shared/store/store";
import { selectAuth } from "@/shared/store/slices/auth";

const Main = () => {
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);
    const { user, isAuthenticated, initialized } = useSelector(selectAuth);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated && initialized && isAuthenticated && user) {
            router.push("/dashboard");
        }
    }, [isHydrated, initialized, isAuthenticated, user, router]);

    if (!isHydrated || !initialized) {
        return (
            <>
                <Head>
                    <title>Главная</title>
                </Head>
                <div>Загрузка...</div>
            </>
        );
    }

    if (isAuthenticated && user) {
        return null;
    }

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
