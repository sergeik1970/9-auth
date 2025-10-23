import React from "react";
import { useSelector } from "@/shared/store/store";
import { selectAuth } from "@/shared/store/slices/auth";
import DashboardLayout from "@/shared/components/DashboardLayout";
import DashboardHeader from "@/shared/components/DashboardHeader";
import TestList from "@/shared/components/TestList";

const Main = () => {
    const { user } = useSelector(selectAuth);

    console.log("Dashboard - user:", user);
    console.log("Dashboard - user?.role:", user?.role);
    console.log("Dashboard - typeof user?.role:", typeof user?.role);

    return (
        <DashboardLayout>
            <DashboardHeader />
            <TestList userRole={user?.role} />
        </DashboardLayout>
    );
};

export default Main;
