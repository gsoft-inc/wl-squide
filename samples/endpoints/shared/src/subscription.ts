import { createContext, useContext } from "react";

export type SubscriptionStatus = "unknown" | "trial" | "paid" | "not-paid";

export interface Subscription {
    company: string;
    contact: string;
    status: SubscriptionStatus;
}

export const SubscriptionContext = createContext<Subscription | undefined>(undefined);

export function useSubscription() {
    return useContext(SubscriptionContext);
}

export interface ToSubscriptionStatusLabelResources {
    trialLabel: string;
    paidLabel: string;
    notPaidLabel: string;
}

export function toSubscriptionStatusLabel(status: SubscriptionStatus, resources: ToSubscriptionStatusLabelResources) {
    if (!status) {
        return "-";
    }

    switch (status) {
        case "unknown":
            return "-";
        case "trial":
            return resources.trialLabel;
        case "paid":
            return resources.paidLabel;
        case "not-paid":
            return resources.notPaidLabel;
    }
}
