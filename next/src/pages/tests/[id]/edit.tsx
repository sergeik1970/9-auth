import React from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "@/shared/store/store";
import { selectAuth } from "@/shared/store/slices/auth";
import { isTeacher } from "@/shared/utils/roles";
import EditTest from "@/shared/components/EditTest";
import DashboardLayout from "@/shared/components/DashboardLayout";

const EditTestPage = () => {
    const router = useRouter();
    const { id } = router.query;
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
        <DashboardLayout>
            <EditTest testId={Number(id)} />
        </DashboardLayout>
    );
};

export default EditTestPage;
