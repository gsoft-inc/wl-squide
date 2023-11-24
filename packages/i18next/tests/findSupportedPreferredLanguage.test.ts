import { findSupportedPreferredLanguage } from "../src/i18nextPlugin.ts";

test("when no preferred language match the supported languages, return undefined", () => {
    const result = findSupportedPreferredLanguage(["fr-CA", "fr"], ["en-US", "en"]);

    expect(result).toBeUndefined();
});

test("when a preferred language exactly match a supported language, return the matching language", () => {
    const result = findSupportedPreferredLanguage(["fr-CA", "fr"], ["en-US", "en", "fr-CA", "fr"]);

    expect(result).toBe("fr-CA");
});

test("when no preferred language exactly match the supported languages but a preferred language partially match a supported language, return the partially matching language", () => {
    const result = findSupportedPreferredLanguage(["fr"], ["en-US", "en", "fr-CA"]);

    expect(result).toBe("fr-CA");
});

test("when no preferred language exactly match the supported languages but a supported language partially match a preferred language, return the partially matching language", () => {
    const result = findSupportedPreferredLanguage(["fr-CA"], ["en-US", "en", "fr"]);

    expect(result).toBe("fr");
});

test("when multiple preferred languages exactly match supported languages, return the left most exactly matching preferred language", () => {
    const result = findSupportedPreferredLanguage(["fr-CA", "en-US", "fr"], ["en-US", "en", "fr-CA"]);

    expect(result).toBe("fr-CA");
});

test("when multiple preferred languages partially match supported languages, return the left most partially matching preferred language", () => {
    const result = findSupportedPreferredLanguage(["fr", "en"], ["en", "fr"]);

    expect(result).toBe("fr");
});

test("when multiple preferred languages partially match supported languages but a single preferred language exactly match a supported language, return the exactly matching preferred language", () => {
    const result = findSupportedPreferredLanguage(["fr", "en-US", "en"], ["en-US", "fr-CA"]);

    expect(result).toBe("en-US");
});
