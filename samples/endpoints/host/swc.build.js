// @ts-check

import { browserslistToSwc, defineBuildConfig } from "@workleap/swc-configs";

const targets = browserslistToSwc();

console.log("@@@@@@@@@@@@@@@@@@@@@@", targets);

function tempTransformer(config) {
    // config.minify = false;
    // config.jsc.loose = true;

    // config.jsc.transform.react.useBuiltins = false;
    // config.jsc.keepClassNames = true;

    // config.jsc.transform.useDefineForClassFields = false;

    config.jsc.minify.mangle = false;

    return config;
}

export const swcConfig = defineBuildConfig(targets, {
    transformers: [tempTransformer]
});
