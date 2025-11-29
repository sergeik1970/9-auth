import React, { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector } from "@/shared/store/store";
import { selectAuth } from "@/shared/store/slices/auth";
import DashboardLayout from "@/shared/components/DashboardLayout";
import StudentsList from "@/shared/components/StudentsList";
import { isTeacher } from "@/shared/utils/roles";

const StudentsPage = () => {
    const router = useRouter();
    const { user } = useSelector(selectAuth);

    useEffect(() => {
        if (user && !isTeacher(user.role)) {
            router.push("/dashboard");
        }
    }, [user, router]);

    if (!user || !isTeacher(user.role)) {
        return <div>Загрузка...</div>;
    }

    return (
        <>
            <Head>
                <title>Студенты</title>
            </Head>
            <DashboardLayout>
                <StudentsList />
            </DashboardLayout>
        </>
    );
};

export default StudentsPage;
