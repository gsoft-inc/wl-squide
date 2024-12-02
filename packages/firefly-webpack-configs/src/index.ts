// // Cannot do "export * from "@workleap/webpack-configs"" because it's not well supported by @microsoft/api-extractor.
// export {
//     addAfterModuleRule,
//     addAfterPlugin,
//     addBeforeModuleRule,
//     addBeforePlugin,
//     defineBuildConfig,
//     defineBuildHtmlWebpackPluginConfig,
//     defineDevConfig,
//     defineDevHtmlWebpackPluginConfig,
//     defineFastRefreshPluginConfig,
//     defineMiniCssExtractPluginConfig,
//     findModuleRule,
//     findModuleRules,
//     findPlugin,
//     getOptimizationConfig,
//     matchAssetModuleType,
//     matchConstructorName,
//     matchLoaderName,
//     matchTest,
//     removeModuleRules,
//     removePlugin,
//     replaceModuleRule,
//     replacePlugin,
//     type AssetModuleType,
//     type DefineBuildConfigOptions,
//     type DefineDevConfigOptions,
//     type ModuleRuleMatch,
//     type ModuleRuleMatcher,
//     type OptimizeOption,
//     type PluginMatch,
//     type PluginMatcher,
//     type WebpackConfig,
//     type WebpackConfigTransformer,
//     type WebpackConfigTransformerContext,
//     type WebpackOptimization,
//     type WebpackPlugin,
//     type WithModuleRuleMatcherInfo,
//     type WithPluginMatcherInfo
// } from "@workleap/webpack-configs";

export * from "@workleap/webpack-configs";
export * from "./defineConfig.ts";

