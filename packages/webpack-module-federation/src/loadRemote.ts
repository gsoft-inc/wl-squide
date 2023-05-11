import { isNil } from "@squide/core";

// Webpack globals we need to access when loading Federated Modules dynamically
// See: https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers.
declare function __webpack_init_sharing__(arg: unknown): Promise<void>;
declare let __webpack_share_scopes__: { default: unknown };

interface LoadRemoteScriptOptions {
    timeoutDelay?: number;
}

function loadRemoteScript(url: string, { timeoutDelay = 2000 }: LoadRemoteScriptOptions = {}) {
    return new Promise((resolve, reject) => {
        const element = document.createElement("script");

        element.src = url;
        element.type = "text/javascript";
        element.async = true;

        let timeoutId: number | undefined = undefined;
        let hasCanceled = false;

        function cancel(error: unknown) {
            hasCanceled = true;

            element?.parentElement?.removeChild(element);

            reject({
                error,
                hasCanceled: true
            });
        }

        element.onload = () => {
            clearTimeout(timeoutId);

            element?.parentElement?.removeChild(element);
            resolve({});
        };

        element.onerror = (error: unknown) => {
            if (!hasCanceled) {
                clearTimeout(timeoutId);

                element?.parentElement?.removeChild(element);

                reject({
                    error,
                    hasCanceled: false
                });
            }
        };

        document.head.appendChild(element);

        // Eagerly reject the loading of a script, it's too long when a remote is unavailable.
        timeoutId = setTimeout(() => {
            cancel(new Error(`[squide] Remote script "${url}" time-outed.`));
        }, timeoutDelay);
    });
}

export type LoadRemoteOptions = LoadRemoteScriptOptions;

// Implementation of https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers.
// It's done this way rather than using the managed mecanism provided with ModuleFederationPlugin config because it's doesn't throw an error if a module is not available.
export async function loadRemote(url: string, containerName: string, moduleName: string, options: LoadRemoteOptions = {}) {
    await loadRemoteScript(url, options);

    // Initializes the share scope. It fills the scope with known provided modules from this build and all remotes.
    await __webpack_init_sharing__("default");

    // Retrieve the module federation container.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const container = (window as any)[containerName];

    if (isNil(container)) {
        throw new Error(`[squide] Container "${containerName}" is not available for remote "${url}".`);
    }

    // Initialize the container, it may provide shared modules.
    await container.init(__webpack_share_scopes__.default);

    // Retrieve the module factory.
    const factory = await container.get(moduleName);

    if (isNil(factory)) {
        throw new Error(`[squide] Module "${moduleName}" is not available for container "${containerName}" of remote "${url}".`);
    }

    return factory();
}
