// @ts-check

import browsers from "@workleap/browserslist-config";
import { defineBuildConfig } from "@workleap/swc-configs";

export const swcConfig = defineBuildConfig({
    browsers
});
