import { IDeal } from "@/shared/types/deals";
import React, { ReactElement } from "react";
import styles from "./index.module.scss";
import Button from "@/shared/components/Button";
import { useDispatch } from "@/shared/store/store";
import { deleteDeal } from "@/shared/store/slices/deals/thunks";

const DealsListItem = ({ item }: { item: IDeal }): ReactElement => {
    const dispatch = useDispatch();
    const deleteClick = () => {
        dispatch(deleteDeal({ id: String(item.id) }));
    };

    return (
        <li className={styles["item"]}>
            <span>{item.name}</span>
            <Button onClick={deleteClick}>delete</Button>
        </li>
    );
};

export default DealsListItem;
