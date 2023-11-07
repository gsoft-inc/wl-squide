import type { HttpHandler } from "msw";
import { characterHandlers } from "./characterHandlers.ts";

export const requestHandlers: HttpHandler[] = characterHandlers;
