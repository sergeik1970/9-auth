import "@/styles/globals.scss";
import React, { FC, useEffect } from "react";
import type { AppProps } from "next/app";
import { wrapper, store } from "@/shared/store/store";
import { Provider } from "react-redux";
import { getCurrentUser } from "@/shared/store/slices/auth";

const App: FC<AppProps> = ({ Component, pageProps }) => {
    useEffect(() => {
        store.dispatch(getCurrentUser());
    }, []);
    return (
        <Provider store={store}>
            <Component {...pageProps} />
        </Provider>
    );
};
export default wrapper.withRedux(App);
