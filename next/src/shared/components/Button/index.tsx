import React, { ButtonHTMLAttributes, ReactElement } from "react";
import styles from "./index.module.scss";
import clsx from "clsx";

interface IButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline" | "secondary";
    size?: "small" | "medium" | "large";
    types?: "primary"; // Оставляем для обратной совместимости
}

const Button = (props: IButton): ReactElement => {
    const {
        children,
        variant = "primary",
        size = "medium",
        types = "primary",
        onClick = () => null,
        className,
        type = "button",
        ...rest
    } = props;

    // Используем types для обратной совместимости, если variant не указан
    const buttonVariant = variant || types;

    return (
        <button
            className={clsx(
                styles["button"],
                styles[`button-${buttonVariant}`],
                styles[`button-${size}`],
                className,
            )}
            type={type}
            onClick={onClick}
            {...rest}
        >
            {children}
        </button>
    );
};

export default Button;

// import React, { ButtonHTMLAttributes, ReactElement } from "react";
// import styles from "./index.module.scss";
// import clsx from "clsx";

// interface IButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//     types?: "primary";
// }

// const Button = (props: IButton): ReactElement => {
//     const { children, types = "primary", onClick = () => null } = props;
//     return (
//         <button
//             className={clsx(styles["button"], styles[`button-${types}`])}
//             type="button"
//             onClick={onClick}
//         >
//             {children}
//         </button>
//     );
// };

// export default Button;
