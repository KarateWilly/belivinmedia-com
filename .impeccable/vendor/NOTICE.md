# Vendored Impeccable detector

This directory contains the deterministic detector used by BELIVIN's release gate and CI.

- Source: locally installed Impeccable skill v4.0.4
- Upstream license: Apache-2.0, as declared by the installed Impeccable `SKILL.md`
- Vendored: 2026-08-14
- Purpose: make `npm run lint:impeccable` reproducible on GitHub Actions without depending on a workstation-only `$HOME/.claude` path.

Update this copy only together with a full local/CI detector comparison and the release-gate bindings.
