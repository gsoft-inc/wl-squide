import { createContext, useContext } from "react";

export type SubscriptionStatus = "unknown" | "trial" | "paid" | "not-paid";

export interface Subscription {
    status: SubscriptionStatus;
}

export const SubscriptionContext = createContext<Subscription | undefined>(undefined);

export function useSubscription() {
    return useContext(SubscriptionContext);
}

export function toSubscriptionStatusLabel(status?: SubscriptionStatus) {
    if (!status) {
        return "-";
    }

    switch (status) {
        case "unknown":
            return "-";
        case "trial":
            return "Trial";
        case "paid":
            return "Paid";
        case "not-paid":
            return "Not paid";
    }
}
