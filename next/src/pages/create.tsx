import React from "react";
import CreateTest from "@/shared/components/CreateTest";
import DashboardLayout from "@/shared/components/DashboardLayout";
import DashboardHeader from "@/shared/components/DashboardHeader";

const Main = () => {
    return (
        <DashboardLayout>
            {/* <DashboardHeader /> */}
            <CreateTest />
        </DashboardLayout>
    );
};

export default Main;
