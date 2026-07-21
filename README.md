# ui5-version

CLI to detect changed SAPUI5 apps in a monorepo and bump only their `sap.app.applicationVersion.version` in `webapp/manifest.json`.

## Install locally

```bash
npm install -D ui5-version
```

During local development of this starter package, run directly:

```bash
node ./bin/ui5-version.js release --dry-run
```

## Commands

### Interactive release

```bash
npx ui5-version release
```

The CLI detects changed apps under `app/*`, shows each app's current version, and asks whether that app should be bumped as patch, minor, major, or skipped.

### Non-interactive patch for changed apps

```bash
npx ui5-version release patch
```

### Release all apps

```bash
npx ui5-version release --all --type patch
```

### Release one app

```bash
npx ui5-version release --app production-orders --type minor
```

### Dry run

```bash
npx ui5-version release --dry-run
```

## Expected project structure

```txt
app/
  production-orders/
    webapp/
      manifest.json
  schedule-report/
    webapp/
      manifest.json
```

The tool updates this field:

```json
{
  "sap.app": {
    "applicationVersion": {
      "version": "1.0.2"
    }
  }
}
```

## Change detection

By default the tool looks at:

- unstaged tracked git changes
- staged git changes
- untracked git files

Then it maps files under `app/<appName>/...` to the matching `app/<appName>/webapp/manifest.json`.

## Different bump per app

Run:

```bash
npx ui5-version release
```

Example flow:

```txt
production-orders (1.0.2)
  p  patch  1.0.2 -> 1.0.3
  m  minor  1.0.2 -> 1.1.0
  M  major  1.0.2 -> 2.0.0
  s  skip
Select bump type [p/m/M/s]: m

schedule-report (1.3.5)
Select bump type [p/m/M/s]: p
```
# ui5-versioner
