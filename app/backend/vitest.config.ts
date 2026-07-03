import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { parse } from "dotenv";
import { defineConfig } from "vitest/config";

const root = dirname(fileURLToPath(import.meta.url));
const env = {
  ...parse(readFileSync(resolve(root, ".env"), "utf-8")),
  ...parse(readFileSync(resolve(root, ".env.test"), "utf-8")),
};

export default defineConfig({
  resolve: {
    alias: [
      { find: /^#app\/(.*)/, replacement: resolve(root, "$1") },
    ],
  },
  test: {
    env,
    include: ["test/**/*.spec.ts"],
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
  },
});
