import { defineJestConfig } from "@workleap/swc-configs";

// const commonJsTransformer: SwcConfigTransformer = config => {
//     return {
//         ...config,
//         module: {
//             // The output module resolution system that the code will be compiled for.
//             type: "commonjs"
//         }
//     };
// };

export const swcConfig = defineJestConfig();
