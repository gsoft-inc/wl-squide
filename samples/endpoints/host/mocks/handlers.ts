import type { RestHandler } from "msw";
import { characterHandlers } from "./characterHandlers.ts";

export const requestHandlers: RestHandler[] = characterHandlers;
