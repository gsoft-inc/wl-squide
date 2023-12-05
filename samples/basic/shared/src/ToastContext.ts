import { createContext, useContext } from "react";

export interface ToastContextType {
    showToast: (text: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useShowToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("Cannot retrieve a ToastContext. Did you forget to define a ToastProvider?");
    }

    return context.showToast;
}
