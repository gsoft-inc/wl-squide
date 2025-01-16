import { defineDevConfig } from "@workleap/rslib-configs";
import path from "node:path";

export default defineDevConfig({
    tsconfigPath: path.resolve("./tsconfig.build.json")
});
