// https://github.com/mswjs/msw/issues/1796

import { TextDecoder, TextEncoder } from "node:util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
