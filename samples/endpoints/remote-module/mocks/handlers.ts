import type { RestHandler } from "msw";
import { episodeHandlers } from "./episodeHandlers.ts";
import { locationHandlers } from "./locationHandlers.ts";

export const requestHandlers: RestHandler[] = [...episodeHandlers, ...locationHandlers];

