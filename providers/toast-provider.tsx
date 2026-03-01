"use client";

import { ToastContainer } from "react-toastify";

export function ToastProvider() {
    return (
        <ToastContainer
            position="bottom-right"
            autoClose={1000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
            theme="light"
            toastStyle={{
                fontSize: "14px",
                fontWeight: 500,
                borderRadius: "12px",
            }}
        />
    );
}
