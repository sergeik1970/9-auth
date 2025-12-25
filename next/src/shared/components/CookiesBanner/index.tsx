import React, { ReactElement, useEffect, useState } from "react";
import Link from "next/link";
import styles from "./index.module.scss";

const CookiesBanner = (): ReactElement | null => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        const cookiesAccepted = document.cookie
            .split("; ")
            .find((row) => row.startsWith("cookies_accepted="));

        if (!cookiesAccepted) {
            setIsOpen(true);
        }
    }, [isClient]);

    const handleAccept = () => {
        document.cookie = "cookies_accepted=true; path=/; max-age=31536000";
        setIsOpen(false);
    };

    if (!isClient || !isOpen) return null;

    return (
        <div className={styles.banner}>
            <div className={styles.content}>
                <p className={styles.text}>
                    Этот сайт использует файлы Cookies и рекомендательные технологии для обеспечения
                    корректной работы, анализа трафика, улучшения пользовательского опыта и удобства
                    пользователей в соответствии с{" "}
                    <Link href="/privacy" className={styles.link}>
                        Политикой обработки ПДН
                    </Link>
                    .
                </p>
                <button className={styles.button} onClick={handleAccept}>
                    ОК
                </button>
            </div>
        </div>
    );
};

export default CookiesBanner;
