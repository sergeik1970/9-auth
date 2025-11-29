import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "@/shared/store/store";
import { selectAuth } from "@/shared/store/slices/auth";
import { isTeacher } from "@/shared/utils/roles";
import EditTest from "@/shared/components/EditTest";
import DashboardLayout from "@/shared/components/DashboardLayout";

const EditTestPage = () => {
    const router = useRouter();
    const { testId } = router.query;
    const { user } = useSelector(selectAuth);

    const hasAccess = user && isTeacher(user.role);

    React.useEffect(() => {
        if (!hasAccess && router.isReady) {
            router.push("/dashboard");
        }
    }, [hasAccess, router]);

    if (!router.isReady || !hasAccess) {
        return <div>Загрузка...</div>;
    }

    return (
        <>
            <Head>
                <title>Редактирование теста</title>
            </Head>
            <DashboardLayout>
                <EditTest testId={Number(testId)} />
            </DashboardLayout>
        </>
    );
};

export default EditTestPage;
