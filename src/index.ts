#!/usr/bin/env node
import { spawn } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function detectPackageManager(cwd: string): string {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "bun.lockb"))) return "bun";
  if (existsSync(join(cwd, "bun.lock"))) return "bun";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "package-lock.json"))) return "npm";

  const pkgJsonPath = join(cwd, "package.json");
  if (existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
      if (pkg.packageManager) {
        return pkg.packageManager.split("@")[0];
      }
    } catch {}
  }

  return "npm"; // fallback
}

function loadAliases(): Record<string, string> {
  const aliasPath = join(__dirname, "..", "alias.json"); // always from CLI project root
  if (existsSync(aliasPath)) {
    try {
      return JSON.parse(readFileSync(aliasPath, "utf-8"));
    } catch {
      console.warn("⚠️ Could not parse alias.json, ignoring...");
    }
  }
  return {};
}

function run() {
  const cwd = process.cwd();
  const pm = detectPackageManager(cwd);
  const aliases = loadAliases();

  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(`Package Manager: ${pm}`);
    console.table(aliases);
    process.exit(1);
  }

  let finalArgs: string[];

  if (aliases[args[0]]) {
    const aliasArgs = aliases[args[0]].trim().split(/\s+/);
    finalArgs = ["run", ...aliasArgs];
  } else if (args[0] === "i" || args[0] === "install") {
    finalArgs = ["install"];
  } else {
    finalArgs = ["run", args[0], ...args.slice(1)];
  }

  console.log(`Running: ${pm} ${finalArgs.join(" ")}`);

  const child = spawn(pm, finalArgs, {
    cwd,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

run();
