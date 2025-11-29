import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector } from "@/shared/store/store";
import { selectAuth } from "@/shared/store/slices/auth";
import DashboardLayout from "@/shared/components/DashboardLayout";
import DashboardHeader from "@/shared/components/DashboardHeader";
import TestList from "@/shared/components/TestList";

const Main = () => {
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);
    const { user } = useSelector(selectAuth);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    if (!router.isReady || !isHydrated) {
        return <div>Загрузка...</div>;
    }

    console.log("Dashboard - user:", user);
    console.log("Dashboard - user?.role:", user?.role);
    console.log("Dashboard - typeof user?.role:", typeof user?.role);

    return (
        <>
            <Head>
                <title>Панель управления</title>
            </Head>
            <DashboardLayout>
                <DashboardHeader />
                <TestList userRole={user?.role} isMainDashboard={true} />
            </DashboardLayout>
        </>
    );
};

export default Main;
