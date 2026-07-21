const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execFileSync } = require("child_process");

const {
  getLatestUi5Version,
  getLatestLtsUi5Version
} = require("./ui5VersionProvider");    


const VALID_BUMPS = new Set(["patch", "minor", "major", "skip"]);

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    command: args[0],
    appsRoot: "app",
    all: false,
    dryRun: false,
    stage: true,
    noStage: false,
    type: null,
    apps: []
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--root") options.appsRoot = args[++i];
    else if (arg === "--all") options.all = true;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--stage") options.stage = true;
    else if (arg === "--no-stage") {
      options.stage = false;
      options.noStage = true;
    } else if (arg === "--type") options.type = args[++i];
    else if (arg === "--app") options.apps.push(args[++i]);
    else if (["patch", "minor", "major"].includes(arg)) options.type = arg;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`
Usage:
  ui5-version release [patch|minor|major] [options]

Examples:
  ui5-version release
  ui5-version release --dry-run
  ui5-version release patch
  ui5-version release --type minor
  ui5-version release --app production-orders --type patch
  ui5-version release --all --type patch
  ui5-version release --root apps

Options:
  --root <dir>       App root folder. Default: app
  --all              Include all UI5 apps under the app root
  --app <name>       Include a specific app. Can be used multiple times
  --type <type>      Apply one bump type to all selected apps: patch, minor, major
  --dry-run          Print planned changes without writing files
  --stage            Stage changed manifest files. Default: true
  --no-stage         Do not run git add after writing manifests
`);
}

function runGit(args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch (_) {
    return "";
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

//Gets which files have been changed by using the git
function getChangedFiles() {  
  const unstaged = runGit(["diff", "--name-only"]);
  const staged = runGit(["diff", "--cached", "--name-only"]);
  const untracked = runGit(["ls-files", "--others", "--exclude-standard"]);
  return unique(`${unstaged}\n${staged}\n${untracked}`.split("\n").map((x) => x.trim()));
}

function discoverAllApps(appsRoot) {
  if (!fs.existsSync(appsRoot)) return [];

  return fs.readdirSync(appsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(appsRoot, entry.name))
    .filter((appPath) => fs.existsSync(path.join(appPath, "webapp", "manifest.json")));
}

//Gets which apps the changed files belong
function appsFromChangedFiles(files, appsRoot) {
  const apps = new Set();
  const normalizedRoot = normalizePath(appsRoot);

  for (const file of files) {
    const normalized = normalizePath(file);
    const parts = normalized.split("/");
    const rootParts = normalizedRoot.split("/").filter(Boolean);

    if (!startsWithParts(parts, rootParts)) continue;

    const appName = parts[rootParts.length];
    if (!appName) continue;

    const appPath = path.join(appsRoot, appName);
    const manifestPath = path.join(appPath, "webapp", "manifest.json");

    if (fs.existsSync(manifestPath)) {
      apps.add(appPath);
    }
  }

  return [...apps];
}

function normalizePath(value) {
  return value.replace(/\\/g, "/").replace(/^\.\//, "");
}

function startsWithParts(parts, prefixParts) {
  if (parts.length < prefixParts.length) return false;
  return prefixParts.every((part, index) => parts[index] === part);
}

function readManifest(manifestPath) {
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function writeManifest(manifestPath, manifest) {
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

function ensureObject(parent, key) {
  if (
    !parent[key] ||
    typeof parent[key] !== "object" ||
    Array.isArray(parent[key])
  ) {
    parent[key] = {};
  }

  return parent[key];
}

function getApplicationVersion(manifest, manifestPath) {
  const version = manifest["sap.app"]?.applicationVersion?.version;

  if (!version) {
    throw new Error(`Missing sap.app.applicationVersion.version in ${manifestPath}`);
  }

  return version;
}

function bumpVersion(version, bumpType) {
  const clean = version.split("+")[0];
  const match = clean.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    throw new Error(`Invalid semantic version: ${version}. Expected x.y.z`);
  }

  let major = Number(match[1]);
  let minor = Number(match[2]);
  let patch = Number(match[3]);

  if (bumpType === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bumpType === "minor") {
    minor += 1;
    patch = 0;
  } else if (bumpType === "patch") {
    patch += 1;
  } else {
    return version;
  }

  return `${major}.${minor}.${patch}`;
}

function createQuestioner() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return {
    ask(question) {
      return new Promise((resolve) => rl.question(question, resolve));
    },
    close() {
      rl.close();
    }
  };
}

function shortAppName(appPath, appsRoot) {
  return normalizePath(path.relative(appsRoot, appPath));
}

async function chooseBumpTypes(appInfos, options) {
  if (options.type) {
    if (!VALID_BUMPS.has(options.type) || options.type === "skip") {
      throw new Error("--type must be patch, minor, or major");
    }

    return appInfos.map((app) => ({ ...app, bumpType: options.type }));
  }

  const q = createQuestioner();
  const selected = [];

  try {
    for (const app of appInfos) {
      const patch = bumpVersion(app.currentVersion, "patch");
      const minor = bumpVersion(app.currentVersion, "minor");
      const major = bumpVersion(app.currentVersion, "major");

      console.log(`\n${app.name} (${app.currentVersion})`);
      console.log(`  p  patch  ${app.currentVersion} -> ${patch}`);
      console.log(`  m  minor  ${app.currentVersion} -> ${minor}`);
      console.log(`  M  major  ${app.currentVersion} -> ${major}`);
      console.log("  s  skip");

      const answer = (await q.ask("Select bump type [p/m/M/s]: ")).trim();
      const bumpType = normalizeBumpAnswer(answer);

      selected.push({ ...app, bumpType });
    }
  } finally {
    q.close();
  }

  return selected;
}

function normalizeBumpAnswer(answer) {
  if (!answer || answer === "p" || answer.toLowerCase() === "patch") return "patch";
  if (answer === "m" || answer.toLowerCase() === "minor") return "minor";
  if (answer === "M" || answer.toLowerCase() === "major") return "major";
  if (answer === "s" || answer.toLowerCase() === "skip") return "skip";
  throw new Error(`Invalid bump selection: ${answer}`);
}

function stageFile(filePath) {
  try {
    execFileSync("git", ["add", filePath], { stdio: "inherit" });
  } catch (_) {
    console.warn(`Could not stage ${filePath}. You may not be inside a git repository.`);
  }
}

async function upgradeUi5Runtime(
  appInfos,
  strategy,
  options
) {
  const targetVersion =
    strategy === "lts"
      ? await getLatestLtsUi5Version()
      : await getLatestUi5Version();

  console.log("");
  console.log(
    `Using UI5 version: ${targetVersion}`
  );

  const results = [];

  for (const app of appInfos) {
    const result = updateUi5Version(
      app.manifest,
      targetVersion
    );

    results.push({
      app,
      ...result
    });
  }

  console.log("");
  console.log("UI5 Upgrade Summary:");

  
    results.forEach((result) => {
    if (!result.changed) {
        console.log(
        `${result.app.name}: already on ${result.newVersion}`
        );
        return;
    }

    console.log(
        `${result.app.name}: ${result.oldVersion || "<missing>"} -> ${result.newVersion}`
    );
    });


  if (options.dryRun) {
    console.log("");
    console.log(
      "Dry run only. No files were changed."
    );

    return;
  }

  for (const result of results) {
    writeManifest(
      result.app.manifestPath,
      result.app.manifest
    );

    if (options.stage) {
      stageFile(result.app.manifestPath);
    }
  }

  console.log("");
  console.log(
    "Updated sap.platform.cf.ui5VersionNumber successfully."
  );
}

async function release(options) {
  let appPaths;

  if (options.apps.length > 0) {
    appPaths = options.apps.map((appName) => path.join(options.appsRoot, appName));
  } else if (options.all) {
    appPaths = discoverAllApps(options.appsRoot);
  } else {
    appPaths = appsFromChangedFiles(getChangedFiles(), options.appsRoot);
  }

  appPaths = unique(appPaths).filter((appPath) =>
    fs.existsSync(path.join(appPath, "webapp", "manifest.json"))
  );

  if (appPaths.length === 0) {
    console.log("No changed UI5 apps with webapp/manifest.json were detected.");
    console.log("Use --all to release all apps or --app <name> to target a specific app.");
    return;
  }

  const appInfos = appPaths.map((appPath) => {
    const manifestPath = path.join(appPath, "webapp", "manifest.json");
    const manifest = readManifest(manifestPath);
    const currentVersion = getApplicationVersion(manifest, manifestPath);

    return {
      name: shortAppName(appPath, options.appsRoot),
      appPath,
      manifestPath,
      manifest,
      currentVersion
    };
  });

  console.log("\nFound UI5 apps to release:");
  for (const app of appInfos) {
    console.log(`  - ${app.name} (${app.currentVersion})`);
  }

  const selected = await chooseBumpTypes(appInfos, options);
  const planned = selected
    .filter((app) => app.bumpType !== "skip")
    .map((app) => ({
      ...app,
      nextVersion: bumpVersion(app.currentVersion, app.bumpType)
    }));

  if (planned.length === 0) {
    console.log("\nNo apps selected for release.");
    return;
  }

  console.log("\nRelease summary:");
  for (const app of planned) {
    console.log(`  - ${app.name}: ${app.currentVersion} -> ${app.nextVersion} (${app.bumpType})`);
  }

  if (options.dryRun) {
    console.log("\nDry run only. No files were changed.");
    return;
  }

  for (const app of planned) {
    app.manifest["sap.app"].applicationVersion.version = app.nextVersion;
    writeManifest(app.manifestPath, app.manifest);

    if (options.stage) {
      stageFile(app.manifestPath);
    }
  }

  console.log("\nUpdated manifest application versions successfully.");
}


function buildAppInfos(options) {
  let appPaths;

  if (options.apps.length > 0) {
    appPaths = options.apps.map((appName) =>
      path.join(options.appsRoot, appName)
    );
  } else if (options.all) {
    appPaths = discoverAllApps(options.appsRoot);
  } else {
    appPaths = appsFromChangedFiles(
      getChangedFiles(),
      options.appsRoot
    );
  }

  appPaths = unique(appPaths).filter((appPath) =>
    fs.existsSync(
      path.join(
        appPath,
        "webapp",
        "manifest.json"
      )
    )
  );

  return appPaths.map((appPath) => {
    const manifestPath = path.join(
      appPath,
      "webapp",
      "manifest.json"
    );

    const manifest =
      readManifest(manifestPath);

    return {
      name: shortAppName(
        appPath,
        options.appsRoot
      ),
      appPath,
      manifestPath,
      manifest
    };
  });
}


async function main() {
  try {
    const options = parseArgs(process.argv);

    if (options.help || !options.command) {
      printHelp();
      return;
    }
 
    if (options.command === "release") {
        await release(options);
        return;
    }

    if (
    options.command ===
    "upgrade-ui5-latest"
    ) {
        const appInfos =
            buildAppInfos(options);

        await upgradeUi5Runtime(
            appInfos,
            "latest",
            options
        );

        return;
    }

    if (
    options.command ===
    "upgrade-ui5-lts"
    ) {
        const appInfos =
            buildAppInfos(options);

        await upgradeUi5Runtime(
            appInfos,
            "lts",
            options
        );

        return;
    }


    if (options.command === "latest-ui5") {
        console.log(await getLatestUi5Version());
        return;
    }

    if (options.command === "lts-ui5") {
        console.log(await getLatestLtsUi5Version());
        return;
    }

    throw new Error(`Unknown command: ${options.command}`);

  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
}

function updateUi5Version(manifest, version) {
  const sapPlatformCf = ensureObject(
    manifest,
    "sap.platform.cf"
  );

  const oldVersion =
    sapPlatformCf.ui5VersionNumber || null;

  sapPlatformCf.ui5VersionNumber = version;

  return {
    oldVersion,
    newVersion: version,
    changed: oldVersion !== version
  };
}

main();
