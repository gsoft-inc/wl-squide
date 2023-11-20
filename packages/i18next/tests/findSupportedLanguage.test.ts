import { findSupportedLanguage } from "../src/i18nextPlugin.ts";

test("when no user language match the supported languages, return undefined", () => {
    const result = findSupportedLanguage(["fr-CA", "fr"], ["en-US", "en"]);

    expect(result).toBeUndefined();
});

test("when a user language match a supported language, return the matching language", () => {
    const result = findSupportedLanguage(["fr-CA", "fr"], ["en-US", "en", "fr"]);

    expect(result).toBe("fr");
});

test("when multiple user language matches a supported language, return the left most user language", () => {
    const result = findSupportedLanguage(["fr-CA", "en", "fr"], ["en-US", "en", "fr"]);

    expect(result).toBe("en");
});
