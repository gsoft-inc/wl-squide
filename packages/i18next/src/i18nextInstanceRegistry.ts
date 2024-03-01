import type { i18n } from "i18next";

export class i18nextInstanceRegistry {
    readonly #instances: Map<string, i18n> = new Map();

    add(key: string, instance: i18n) {
        if (this.#instances.has(key)) {
            throw new Error(`[squide] An i18next instance has already been registered with the "${key}" key.`);
        }

        this.#instances.set(key, instance);
    }

    getInstance(key: string) {
        return this.#instances.get(key);
    }

    getInstances() {
        return Array.from(this.#instances.values());
    }
}
