import React, { ButtonHTMLAttributes, ReactElement } from "react";
import styles from "./index.module.scss";
import clsx from "clsx";

interface IButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    types?: "primary";
}

const Button = (props: IButton): ReactElement => {
    const { children, types = "primary", onClick = () => null } = props;
    return (
        <button
            className={clsx(styles["button"], styles[`button-${types}`])}
            type="button"
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default Button;
