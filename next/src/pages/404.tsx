import Head from "next/head";
import NotFoundPage from "@/shared/pages/NotFound";

const NotFound = () => {
    return (
        <>
            <Head>
                <title>404 - Страница не найдена</title>
            </Head>
            <NotFoundPage />
        </>
    );
};

export default NotFound;
