import React from "react";
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
        <DashboardLayout>
            {/* <DashboardHeader /> */}
            <CreateTest />
        </DashboardLayout>
    );
};

export default Main;
