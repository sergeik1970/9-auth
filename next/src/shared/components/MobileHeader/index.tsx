import React, { ReactElement } from "react";
import Link from "next/link";
import styles from "./index.module.scss";

interface MobileHeaderProps {
    onMenuClick: () => void;
}

const MobileHeader = ({ onMenuClick }: MobileHeaderProps): ReactElement => {
    return (
        <div className={styles.mobileHeader}>
            <button className={styles.menuButton} onClick={onMenuClick} aria-label="Меню">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M3 12H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M3 6H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M3 18H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            <Link href="/" className={styles.logo}>
                <h2 className={styles.logoText}>Skorix</h2>
            </Link>
        </div>
    );
};

export default MobileHeader;
