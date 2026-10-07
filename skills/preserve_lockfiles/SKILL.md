---
name: preserve-lockfiles
description: >-
  Strict instructions to preserve and protect all package manager lockfiles
  including bun.lock, package-lock.json, pnpm-lock.yaml, and yarn.lock.
  Ensures lockfiles are never deleted, stripped, or removed during development,
  migrations, or refactoring.
---

# Preserve Lockfiles Skill

## Core Requirement
**DO NOT DELETE LOCKFILES.**
Under NO circumstances should any lockfile be deleted, removed, or cleaned up.
This applies to all operations, including:
- Initial project setups
- GitHub import migrations
- Dependency installations and updates
- Code refactoring or cleanup passes

## Protected Files
The following files are strictly protected and MUST NEVER be deleted:
- `bun.lock` / `bun.lockb`
- `package-lock.json`
- `pnpm-lock.yaml`
- `yarn.lock`
- `.yarnrc` / `.yarnrc.yml`

## Rule Precedence
Even if a generic migration guide or cleanup reference suggests removing lockfiles (e.g. `bun.lock`, `pnpm-lock.yaml`, `yarn.lock`), this project explicitly overrides that rule:
1. Always retain `bun.lock` and `package-lock.json`.
2. Do not run commands like `rm bun.lock` or `delete_file` on any lockfile.
3. If an automated script or tool removed them by mistake, revert them immediately.
