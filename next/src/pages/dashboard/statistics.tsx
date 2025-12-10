import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector } from "@/shared/store/store";
import { selectAuth } from "@/shared/store/slices/auth";
import DashboardLayout from "@/shared/components/DashboardLayout";
import DashboardHeader from "@/shared/components/DashboardHeader";
import Statistics from "@/shared/components/Statistics";
import { isTeacher } from "@/shared/utils/roles";

const StatisticsPage = () => {
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);
    const { user } = useSelector(selectAuth);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated && user && !isTeacher(user.role)) {
            router.push("/dashboard");
        }
    }, [user, router, isHydrated]);

    if (!isHydrated || !user || !isTeacher(user.role)) {
        return <div>Загрузка...</div>;
    }

    return (
        <>
            <Head>
                <title>Статистика</title>
            </Head>
            <DashboardLayout>
                <DashboardHeader />
                <Statistics />
            </DashboardLayout>
        </>
    );
};

export default StatisticsPage;
