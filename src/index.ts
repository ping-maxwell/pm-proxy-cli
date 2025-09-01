#!/usr/bin/env node
import { spawn } from "child_process";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function detectPackageManager(cwd: string): string {
  const pkgJsonPath = join(cwd, "package.json");
  if (existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
      if (pkg.packageManager) {
        return pkg.packageManager.split("@")[0];
      }
    } catch {}
  }

  if (existsSync(join(cwd, "bun.lockb"))) return "bun";
  if (existsSync(join(cwd, "bun.lock"))) return "bun";
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(join(cwd, "package-lock.json"))) return "npm";

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

function showHelp() {
  console.log(`
Usage: pm [command] [args]

Commands:
  i, install        Install dependencies
  <alias>           Runs the command mapped in alias.json
  <script>          Runs the package.json script

Options:
  -h, --help        Show this help message
  -v, --version     Show CLI version
`);
}

function showVersion() {
  const pkgJsonPath = join(__dirname, "..", "package.json");
  if (existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
      console.log(`V${pkg.version ?? "unknown"}`);
    } catch {
      console.log("Vunknown");
    }
  }
}

function run() {
  const cwd = process.cwd();
  const pm = detectPackageManager(cwd);
  const aliases = loadAliases();

  const args = process.argv.slice(2);
  if (args[0] === "--help" || args[0] === "-h") {
    showHelp();
    process.exit(0);
  }

  if (args[0] === "--version" || args[0] === "-v") {
    showVersion();
    process.exit(0);
  }

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
