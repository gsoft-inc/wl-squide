// import { BackgroundColorContext, type Session } from "@sample/shared";
// import { InvalidCredentialsError, useAppRouter } from "@sample/shell";
// import { useAreModulesReady } from "@squide/webpack-module-federation";
// import axios from "axios";
// import { useCallback } from "react";
// import { RouterProvider } from "react-router-dom";
// import { sessionManager } from "./session.ts";

// export function App() {
//     // Re-render the app once all the remotes are registered.
//     // Otherwise, the remotes routes won't be added to the router.
//     const areModulesReady = useAreModulesReady();

//     const onLogin = useCallback(async (username: string, password: string) => {
//         try {
//             await axios.post("/login", {
//                 username,
//                 password
//             });

//             // TODO: Removed when the session mecanism is in place.
//             const session: Session = {
//                 user: {
//                     name: username
//                 }
//             };

//             sessionManager.setSession(session);
//         } catch (error: unknown) {
//             if (axios.isAxiosError(error)) {
//                 if (error.response?.status === 401) {
//                     throw new InvalidCredentialsError();
//                 }
//             }

//             throw new Error("An unknown error happened while trying to login a user");
//         }
//     }, []);

//     const onLogout = useCallback(async () => {
//         sessionManager.clearSession();
//     }, []);

//     const router = useAppRouter(onLogin, onLogout, {
//         managedRoutes: [
//             {
//                 index: true,
//                 lazy: () => import("./Home.tsx")
//             }
//         ]
//     });

//     // if (!areModulesReady) {
//     //     return <div>Loading...</div>;
//     // }

//     return (
//         <BackgroundColorContext.Provider value="blue">
//             <RouterProvider
//                 router={router}
//                 fallbackElement={null}
//             />
//         </BackgroundColorContext.Provider>
//     );
// }
