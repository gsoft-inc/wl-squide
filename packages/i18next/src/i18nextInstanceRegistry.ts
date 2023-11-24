import type { i18n } from "i18next";

export class i18nextInstanceRegistry {
    readonly #instances: Map<string, i18n> = new Map();

    add(key: string, instance: i18n) {
        this.#instances.set(key, instance);
    }

    getInstance(key: string) {
        return this.#instances.get(key);
    }

    getInstances() {
        return Array.from(this.#instances.values());
    }
}
