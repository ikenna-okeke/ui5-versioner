# UI5 Lifecycle

CLI for SAPUI5 developers to manage application versions and SAPUI5 runtime versions across multiple applications.

Perfect for SAP Build Work Zone, SAP BTP HTML5 applications, and SAPUI5 monorepos.

---
## Features

✅ Detect changed SAPUI5 applications automatically using Git

✅ Bump application versions in `manifest.json`

✅ Upgrade SAPUI5 runtime versions

✅ Upgrade to latest SAPUI5 release

✅ Upgrade to latest SAPUI5 LTS (Long Term Maintainance Version) release

✅ Automatically update SAPUI5 bootstrap URLs (inside the index.html file)

✅ Dry-run support

✅ Works with multiple UI5 applications in a monorepo

---

# Installation

```bash
npm install -g ui5-lifecycle
```

Verify installation:

```bash
ui5-lifecycle latest-ui5
```

---

# Why this tool?

Maintaining SAPUI5 applications often requires updating multiple places:

- Application version
- SAPUI5 runtime version
- Bootstrap URL
- Multiple applications in the same repository

UI5 Lifecycle automates these tasks and helps keep everything in sync.

---

# SAP Build Work Zone Runtime Version Management

When an application is deployed to SAP BTP and consumed through SAP Build Work Zone, the SAPUI5 runtime version can be controlled using:

```json
{
  "sap.platform.cf": {
    "ui5VersionNumber": "1.150.0"
  }
}
```

inside the application's `manifest.json`.

Many SAP developers are unaware that this setting controls which SAPUI5 runtime Build Work Zone loads for the application.

UI5 Lifecycle can automatically keep this value up-to-date.

---

# Commands

## Get latest SAPUI5 version

```bash
ui5-lifecycle latest-ui5
```

Example:

```text
1.150.0
```

---

## Get latest SAPUI5 LTS version

```bash
ui5-lifecycle lts-ui5
```

Example:

```text
1.148.5
```

---

## Interactive Application Release

```bash
ui5-lifecycle release
```

Example:
CustomerApp currently Deployed on the BTP has version (1.0.1) and needs a version bump, using the ui5-lifecycle, the versions could be bumped in this manner
```text

p  patch  1.0.1 -> 1.0.2
m  minor  1.0.1 -> 1.1.0
M  major  1.0.1 -> 2.0.0
s  skip

Select bump type [p/m/M/s]:
```

---

## Release All Applications
This is used to upgrade the major, minor or patch version for ALL your applications present in the app folder.

```bash
ui5-lifecycle release --all
```

---

## Release a Specific Application
APPLICATION_NAME is the name of the file in the app folder eg app/customerApp, APPLICATION_NAME becomes customerApp

```bash
ui5-lifecycle release --app APPLICATION_NAME
```

---

## Dry Run Release
Dry run is used to test run the specific command and see how it would work before making actual changes
```bash
ui5-lifecycle release --dry-run
```

No files are modified.

---

## Upgrade to Latest SAPUI5 Runtime
checks and works with the latest ui5 version provided by SAP in https://ui5.sap.com/versionoverview.html.
This command also updates the SAPUI5 Bootstrap URL in the index.html to the latest ui5 version as seen in the "SAPUI5 Bootstrap URL" section below
```bash
ui5-lifecycle upgrade-ui5-latest --all
```

This updates:

```json
{
  "sap.platform.cf": {
    "ui5VersionNumber": "1.150.0"
  }
}
```

---

## Upgrade to Latest SAPUI5 LTS Runtime

```bash
ui5-lifecycle upgrade-ui5-lts --all
```

This updates:

```json
{
  "sap.platform.cf": {
    "ui5VersionNumber": "1.148.5"
  }
}
```
This command also updates the SAPUI5 Bootstrap URL in the index.html to the LTS ui5 version
---

## SAPUI5 Bootstrap URL

Before:

```html
<script
  id="sap-ui-bootstrap"
  src="https://sapui5.hana.ondemand.com/1.149.1/resources/sap-ui-core.js">
```

After:

```html
<script
  id="sap-ui-bootstrap"
  src="https://sapui5.hana.ondemand.com/1.150.0/resources/sap-ui-core.js">
</script>
```

This helps keep the bootstrap URL aligned with the runtime version configured in `manifest.json`.


---

## Dry Run UI5 Upgrade

```bash
ui5-lifecycle upgrade-ui5-latest --all --dry-run
```

or

```bash
ui5-lifecycle upgrade-ui5-lts --all --dry-run
```

No files are modified.

---

# What Gets Updated

## Application Version

Before:

```json
{
  "sap.app": {
    "applicationVersion": {
      "version": "1.0.0"
    }
  }
}
```

After:

```json
{
  "sap.app": {
    "applicationVersion": {
      "version": "1.0.1"
    }
  }
}
```

---

## SAP Build Work Zone Runtime Version

Before:

```json
{
  "sap.platform.cf": {
    "ui5VersionNumber": "1.149.1"
  }
}
```

After:

```json
{
  "sap.platform.cf": {
    "ui5VersionNumber": "1.150.0"
  }
}
```

# Supported Project Structure

```text
app/
├── CustomerApp/
│   └── webapp/
│       ├── manifest.json
│       └── index.html

├── OrderApp/
│   └── webapp/
│       ├── manifest.json
│       └── index.html
```

---

# Change Detection

By default UI5 Lifecycle detects:

- Unstaged Git changes
- Staged Git changes
- Untracked Git files

and maps them to the corresponding UI5 application.

---

# Roadmap

### Completed

- [x] Git-based change detection
- [x] Application version bumping
- [x] Latest SAPUI5 version lookup
- [x] Latest SAPUI5 LTS lookup
- [x] SAPUI5 runtime upgrades
- [x] Bootstrap URL updates
- [x] Dry-run support

### Planned

- [ ] Doctor command
- [ ] Interactive runtime upgrades
- [ ] Configuration file support
- [ ] Additional monorepo customization

---

## Feedback & Support

Found a bug?

Have a feature request?

Have an idea to improve UI5 Lifecycle?

Please create an issue on GitHub:

👉 [Create an Issue](https://github.com/ikenna-okeke/ui5-lifecycle/issues)

I welcome suggestions, feedback, and contributions from the SAPUI5 community.
# License

MIT