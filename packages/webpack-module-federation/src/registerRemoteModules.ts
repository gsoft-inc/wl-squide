import { RemoteEntryPoint, RemoteModuleName } from "./remoteDefinition.ts";
import { isNil, registerModule } from "@squide/core";

import type { AbstractRuntime } from "@squide/core";
import type { RemoteDefinition } from "./remoteDefinition.ts";
import { loadRemote } from "./loadRemote.ts";

export type RegistrationStatus = "none" | "in-progress" | "ready";

export let registrationStatus: RegistrationStatus = "none";

export interface RegistrationError {
    // The remote base URL
    url: string;
    // The remote container name
    containerName: string;
    // The remote resource module name
    moduleName: string;
    // The registration error
    error: unknown;
}

export interface RegisterRemoteModulesOptions {
    context?: unknown;
}

export async function registerRemoteModules(remotes: RemoteDefinition[], runtime: AbstractRuntime, { context }: RegisterRemoteModulesOptions = {}) {
    if (registrationStatus !== "none") {
        throw new Error("[squide] The \"registerRemoteModules\" function can only be called once.");
    }

    const errors: RegistrationError[] = [];

    runtime.logger.information(`[squide] Found ${remotes.length} remote module${remotes.length !== 1 ? "s" : ""} to register.`);

    registrationStatus = "in-progress";

    await Promise.allSettled(remotes.map(async (x, index) => {
        const remoteUrl = new URL(RemoteEntryPoint, x.url).toString();
        const containerName = x.name;

        try {
            runtime.logger.information(`[squide] ${index + 1}/${remotes.length} Loading module "${RemoteModuleName}" from container "${containerName}" of remote "${remoteUrl}".`);

            const module = await loadRemote(remoteUrl, containerName, RemoteModuleName);

            if (isNil(module.register)) {
                throw new Error(`[squide] A "register" function is not available for module "${RemoteModuleName}" of container "${containerName}" from remote "${remoteUrl}". Make sure your remote "./register.js" file export a function named "register".`);
            }

            runtime.logger.information(`[squide] ${index + 1}/${remotes.length} Registering module "${RemoteModuleName}" from container "${containerName}" of remote "${remoteUrl}".`);

            registerModule(module.register, runtime, context);

            runtime.logger.information(`[squide] ${index + 1}/${remotes.length} container "${containerName}" of remote "${remoteUrl}" has been registered".`);
        } catch (error: unknown) {
            runtime.logger.error(`[squide] An error occured while registering module "${RemoteModuleName}" from container "${containerName}" of remote "${remoteUrl}".`, error);

            errors.push({
                url: remoteUrl,
                containerName,
                moduleName: RemoteModuleName,
                error
            });
        }
    }));

    registrationStatus = "ready";

    return errors;
}
