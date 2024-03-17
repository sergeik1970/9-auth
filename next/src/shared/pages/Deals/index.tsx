import React, { ReactElement, createRef, useEffect } from "react";
import Button from "@/shared/components/Button";
import { useDispatch } from "@/shared/store/store";
import { getDeals, addDeal } from "@/shared/store/slices/deals/thunks";
import DealsList from "./components/DealsList";

const Deals = (): ReactElement => {
    const dispatch = useDispatch();
    const inputRef = createRef<HTMLInputElement>();

    const click = () => {
        dispatch(addDeal({ name: inputRef.current?.value || "" }));
        if (inputRef.current) inputRef.current.value = "";
    };

    useEffect(() => {
        dispatch(getDeals());
    }, []);

    return (
        <div>
            <Button onClick={click}>add deal</Button>
            <input type="text" ref={inputRef} />
            <DealsList />
        </div>
    );
};

export default Deals;
