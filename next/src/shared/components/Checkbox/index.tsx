import React, { ReactElement, useState, useEffect } from "react";
import styles from "./index.module.scss";
import clsx from "clsx";

interface ICheckbox extends React.HTMLAttributes<HTMLInputElement> {
    a?: boolean;
    checked?: boolean;
}

const Checkbox = (props: ICheckbox): ReactElement => {
    const { onChange = () => null, checked = false } = props;
    // const { onChange = () => null, defaultChecked } = props;
    // const [checked, setChecked] = useState(defaultChecked);

    // useEffect(() => {
    //     setChecked(defaultChecked);
    // }, [defaultChecked]);

    const change = (e: any) => {
        onChange(e);
        // setChecked(e.target.checked);
    };

    return (
        <div className={styles["checkbox"]}>
            <label className={clsx({ [styles["checked"]]: checked }, styles["test"])}>
                <input type="checkbox" checked={checked} onChange={change} />
            </label>
        </div>
    );
};

export default Checkbox;
