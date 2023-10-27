// @ts-check

import { browserslistToSwc, defineBuildConfig } from "@workleap/swc-configs";

const targets = browserslistToSwc();

/**
 * Temporary transformer to enable loose mode until https://github.com/swc-project/swc/issues/8178 is fixed.
 * @typedef {import("@workleap/swc-configs").SwcConfig} SwcConfig
 * @param {SwcConfig} config
 * @returns {SwcConfig}
 */
function temporaryEnablingLooseMode(config) {
    if (config && config.jsc) {
        config.jsc.loose = true;
    }

    return config;
}

export const swcConfig = defineBuildConfig(targets, {
    transformers: [temporaryEnablingLooseMode]
});
