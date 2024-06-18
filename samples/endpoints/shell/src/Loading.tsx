import { useI18nextInstance } from "@squide/i18next";
import { useTranslation } from "react-i18next";
import { i18NextInstanceKey } from "./i18next.ts";

// export function Loading() {
//     const [show, setShow] = useState(false);

//     const i18nextInstance = useI18nextInstance(i18NextInstanceKey);
//     const { t } = useTranslation("AppRouter", { i18n: i18nextInstance });

//     useEffect(() => {
//         const timeoutId = setTimeout(() => {
//             setShow(true);
//         }, 500);

//         return () => {
//             clearTimeout(timeoutId);
//         };
//     }, []);

//     if (show) {
//         return (
//             <div>{t("loadingMessage")}</div>
//         );
//     }

//     return null;
// }

export function Loading() {
    const i18nextInstance = useI18nextInstance(i18NextInstanceKey);
    const { t } = useTranslation("AppRouter", { i18n: i18nextInstance });

    return (
        <div>{t("loadingMessage")}</div>
    );
}
