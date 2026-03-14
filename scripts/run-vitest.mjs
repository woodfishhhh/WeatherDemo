import { spawnSync } from "node:child_process";
import { globSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const vitestPackagePath = require.resolve("vitest/package.json");
const vitestBin = path.join(path.dirname(vitestPackagePath), "vitest.mjs");

const expandArg = (arg) => {
  if (!arg.includes("*")) {
    return [arg];
  }

  const matches = globSync(arg, {
    windowsPathsNoEscape: true,
  });

  return matches.length ? matches : [arg];
};

const forwardedArgs = process.argv.slice(2).flatMap(expandArg);
const result = spawnSync(process.execPath, [vitestBin, ...forwardedArgs], {
  stdio: "inherit",
  env: process.env,
});

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
