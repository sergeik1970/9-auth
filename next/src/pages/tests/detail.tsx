import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import TestDetailPage from "@/shared/pages/Detail";

const DetailPage = () => {
    const router = useRouter();

    if (!router.isReady) {
        return <div>Загрузка...</div>;
    }

    return (
        <>
            <Head>
                <title>Информация о тесте</title>
            </Head>
            <DashboardLayout>
                <TestDetailPage />
            </DashboardLayout>
        </>
    );
};

export default DetailPage;
