import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import CreateTest from "@/shared/components/CreateTest";
import DashboardLayout from "@/shared/components/DashboardLayout";
import DashboardHeader from "@/shared/components/DashboardHeader";

const Main = () => {
    const router = useRouter();

    if (!router.isReady) {
        return <div>Загрузка...</div>;
    }

    return (
        <>
            <Head>
                <title>Создание теста</title>
            </Head>
            <DashboardLayout>
                {/* <DashboardHeader /> */}
                <CreateTest />
            </DashboardLayout>
        </>
    );
};

export default Main;
