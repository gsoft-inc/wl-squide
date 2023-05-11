// By conventions:
//  - The remote entry point must be "/remoteEntry.js"
//  - The module name must be "register.js"
export interface RemoteDefinition {
    // The base URL of the remote
    url: string;
    // The container name of the remote
    name: string;
}

// By conventions, the remote:
//    - filename is always: "remoteEntry.js"
//    - only expose a single module named "./register"
export const RemoteEntryPoint = "remoteEntry.js";
export const RemoteModuleName = "./register";
