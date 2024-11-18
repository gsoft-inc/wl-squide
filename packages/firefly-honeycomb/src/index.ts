export {
    setGlobalSpanAttribute,
    setGlobalSpanAttributes,
    type DefineDocumentLoadInstrumentationOptionsFunction,
    type DefineFetchInstrumentationOptionsFunction,
    type DefineUserInteractionInstrumentationOptionsFunction,
    type DefineXmlHttpRequestInstrumentationOptionsFunction,
    type HoneycombSdkInstrumentations,
    type HoneycombSdkOptions,
    type HoneycombSdkOptionsTransformer,
    type RegisterHoneycombInstrumentationOptions
} from "@workleap/honeycomb";
export { popActiveSpan, setActiveSpan } from "./activeSpan.ts";
export { registerHoneycombInstrumentation } from "./registerHoneycombInstrumentation.ts";
export * from "./utils.ts";

