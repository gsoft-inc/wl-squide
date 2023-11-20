import { toSubscriptionStatusLabel, useSubscription } from "@endpoints/shared";
import { useI18nextInstance } from "@squide/i18next";
import { useTranslation } from "react-i18next";
import { i18NextInstanceKey } from "./i18next.ts";

export function SubscriptionPage() {
    const i18nextInstance = useI18nextInstance(i18NextInstanceKey);
    const { t } = useTranslation("SubscriptionPage", { i18n: i18nextInstance });

    const subscription = useSubscription();

    const statusLabel = toSubscriptionStatusLabel(subscription!.status, {
        trialLabel: t("trialLabel"),
        paidLabel: t("paidLabel"),
        notPaidLabel: t("notPaidLabel")
    });

    return (
        <>
            <h1>Subscription</h1>
            <p style={{ backgroundColor: "blue", color: "white", width: "fit-content" }}>This page is served by <code>@endpoints/local-module</code></p>
            <div>
                <span>Company: </span><span>{subscription?.company}</span>
            </div>
            <div>
                <span>Contact: </span><span>{subscription?.contact}</span>
            </div>
            <div>
                <span>Status: </span><span>{statusLabel}</span>
            </div>
        </>
    );
}

export const Component = SubscriptionPage;
