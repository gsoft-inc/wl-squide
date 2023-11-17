import type { i18n } from "i18next";

export class i18nInstanceRegistry {
    readonly #instances: i18n[] = [];

    add(instance: i18n) {
        this.#instances.push(instance);
    }

    // Must specify the return type, otherwise we get a TS2742: The inferred type cannot be named without a reference to X. This is likely not portable.
    // A type annotation is necessary.
    get instances(): i18n[] {
        return this.#instances;
    }
}
