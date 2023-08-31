// @ts-check

import { browserslistToSwc, defineDevConfig } from "@workleap/swc-configs";

export const swcConfig = defineDevConfig({
    targets: browserslistToSwc()
});
