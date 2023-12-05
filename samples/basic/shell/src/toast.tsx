import { ToastContext } from "@basic/shared";
import type { AriaToastProps, AriaToastRegionProps } from "@react-aria/toast";
import { useToast, useToastRegion } from "@react-aria/toast";
import { useToastState, type ToastState, type ToastStateProps } from "@react-stately/toast";
import { useCallback, useRef, type MouseEventHandler, type ReactNode } from "react";

export interface ToastProps<T> extends AriaToastProps<T> {
    state: ToastState<T>;
}

export function Toast<T extends ReactNode>({ state, ...props }: ToastProps<T>) {
    const ref = useRef(null);

    const { toastProps, titleProps, closeButtonProps: { onPress, ...closeButtonProps } } = useToast(props, state, ref);

    // useToast returns an "onPress" handler instead of an "onClick" handler. "onPress" is a proprietary handler to @react-aria.
    // Since this example doesn't use react-aria buttons, the "onPress" handler must be proxied by an "onClick" handler.
    const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(event => {
        event.preventDefault();

        // It doesn't matter because useAriaToast doesn't handle the event.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onPress();
    }, [onPress]);

    return (
        <div {...toastProps} ref={ref} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 16px", backgroundColor: "#6a5acd", color: "#fff", borderRadius: "8px" }}>
            <div {...titleProps}>{props.toast.content}</div>
            <button type="button" onClick={handleClick} {...closeButtonProps}>x</button>
        </div>
    );
}

export interface ToastRegionProps<T> extends AriaToastRegionProps {
    state: ToastState<T>;
}

export function ToastRegion<T extends ReactNode>({ state, ...props }: ToastRegionProps<T>) {
    const ref = useRef(null);

    const { regionProps } = useToastRegion(props, state, ref);

    return (
        <div {...regionProps} ref={ref} style={{ position: "fixed", bottom: "16px", right: "16px", display: "flex", gap: "8px", flexDirection: "column" }}>
            {state.visibleToasts.map(toast => (
                <Toast key={toast.key} toast={toast} state={state} />
            ))}
        </div>
    );
}

export interface ToastProviderProps extends ToastStateProps {
    children: ReactNode;
}

export function ToastProvider({ children, ...props }: ToastProviderProps) {
    const state = useToastState<ReactNode>({
        maxVisibleToasts: 5,
        ...props
    });

    const showToast = useCallback((text: string) => {
        state.add(text, { timeout: 5000 });
    }, [state]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {state.visibleToasts.length > 0 && (
                <ToastRegion {...props} state={state} />
            )}
        </ToastContext.Provider>
    );
}
