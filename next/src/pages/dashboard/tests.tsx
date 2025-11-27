import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "@/shared/store/store";
import { selectAuth } from "@/shared/store/slices/auth";
import DashboardLayout from "@/shared/components/DashboardLayout";
import DashboardHeader from "@/shared/components/DashboardHeader";
import TestList from "@/shared/components/TestList";

const MyTests = () => {
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);
    const { user } = useSelector(selectAuth);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    if (!router.isReady || !isHydrated) {
        return <div>Загрузка...</div>;
    }

    return (
        <DashboardLayout>
            <DashboardHeader />
            <TestList userRole={user?.role} />
        </DashboardLayout>
    );
};

export default MyTests;
