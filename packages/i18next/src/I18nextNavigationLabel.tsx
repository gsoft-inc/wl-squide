import type { i18n } from "i18next";
import { I18nextProvider } from "react-i18next";

export interface I18nextNavigationLabelProps {
    i18nextInstance: i18n;
    resourceKey: string;
}

export function I18nextNavigationLabel({ i18nextInstance, resourceKey }: I18nextNavigationLabelProps) {
    return (
        <I18nextProvider i18n={i18nextInstance}>
            {i18nextInstance.t(resourceKey)}
        </I18nextProvider>
    );
}
