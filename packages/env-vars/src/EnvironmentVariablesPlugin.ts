import { isNil, Plugin, type Runtime } from "@squide/core";
import { type EnvironmentVariables, EnvironmentVariablesRegistry, type EnvironmentVariablesRegistryKey, type EnvironmentVariablesRegistryValue } from "./EnvironmentVariablesRegistry.ts";

export class EnvironmentVariablesPlugin extends Plugin {
    readonly #environmentVariablesRegistry = new EnvironmentVariablesRegistry();

    constructor(runtime: Runtime) {
        super(EnvironmentVariablesPlugin.name, runtime);
    }

    registerVariable(key: EnvironmentVariablesRegistryKey, value: EnvironmentVariablesRegistryValue) {
        this.#environmentVariablesRegistry.add(key, value);

        this._runtime.logger.debug(`[squide] An environment variable for key "${key}" has been registered with the value "${value}".`);
    }

    registerVariables(variables: Partial<EnvironmentVariables>) {
        this.#environmentVariablesRegistry.addVariables(variables);

        this._runtime.logger.debug("[squide] The following environment variables has been registered:", variables);
    }

    getVariable(key: EnvironmentVariablesRegistryKey) {
        return this.#environmentVariablesRegistry.getVariable(key);
    }

    getVariables() {
        return this.#environmentVariablesRegistry.getVariables();
    }
}

export function getEnvironmentVariablesPlugin(runtime: Runtime) {
    const plugin = runtime.getPlugin(EnvironmentVariablesPlugin.name);

    if (isNil(plugin)) {
        throw new Error("[squide] The getEnvironmentVariablesPlugin function is called but no EnvironmentVariablesPlugin instance has been registered with the runtime.");
    }

    return plugin as EnvironmentVariablesPlugin;
}
