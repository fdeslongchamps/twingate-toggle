# Plan: resources menu (1.4.0)

Spec: `SPEC.md` → Behavior → Resources menu.

- [x] 1. Spec: add the resources menu to SPEC.md, close Open Question 4.
- [x] 2. Parsers + tests: `lib.js` with `parseStatus` (moved, unchanged) and
      `parseResources`; `test.gjs` asserts; install.sh copies lib.js. Accept: `gjs -m test.gjs` passes,
      extension uses `parseStatus`.
- [x] 3. Menu toggle: `QuickMenuToggle`, header (status + user), resource rows
      loaded on menu open. Accept: syntax checks pass; manual check 7 shows rows.
- [x] 4. Row actions: click copies alias-or-address; auth status set → `twingate auth <name>`.
      Accept: manual check 7.
- [x] 5. Release: README, CHANGELOG, metadata 1.4.0.
