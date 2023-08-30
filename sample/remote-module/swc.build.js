// @ts-check

import { browserslistToSwc, defineBuildConfig } from "@workleap/swc-configs";

export const swcConfig = defineBuildConfig({
    targets: browserslistToSwc()
});
