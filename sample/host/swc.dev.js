// @ts-check

import browsers from "@workleap/browserslist-config";
import { defineDevConfig } from "@workleap/swc-configs";

export const swcConfig = defineDevConfig({
    browsers
});
