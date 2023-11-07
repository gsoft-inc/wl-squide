import type { HttpHandler } from "msw";
import { episodeHandlers } from "./episodeHandlers.ts";
import { locationHandlers } from "./locationHandlers.ts";

export const requestHandlers: HttpHandler[] = [...episodeHandlers, ...locationHandlers];

