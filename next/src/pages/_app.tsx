import "@/styles/globals.scss";
import React, { FC, useEffect } from "react";
import type { AppProps } from "next/app";
import { wrapper } from "@/shared/store/store";
import { Provider } from "react-redux";
import { getCurrentUser } from "@/shared/store/slices/auth";

const App: FC<AppProps> = ({ Component, ...rest }) => {
    const { store, props } = wrapper.useWrappedStore(rest);

    useEffect(() => {
        store.dispatch(getCurrentUser());
    }, []);
    return (
        <Provider store={store}>
            <Component {...props.pageProps} />
        </Provider>
    );
};
export default App;
