# Spec: Twingate Toggle

Baseline spec of the extension as of 1.4.0. New work should update this file
first, then the code.

## Objective

A GNOME Shell extension that lets a desktop user start and stop the Twingate
Linux client from Quick Settings, without a terminal.

User: one person on their own Linux desktop (GNOME, Wayland or X11) who has
the Twingate client set up and can `sudo`.

User stories:

- As a user, I click the **Twingate** tile to start or stop the client.
- As a user, I can see at a glance whether Twingate is on: the tile is checked
  and a Twingate icon shows in the top bar.
- As a user, when starting or stopping needs my password, GNOME's password
  dialog appears.
- As a user, when a start or stop fails, I get a notification that says why.
- As a user, I open the tile's menu and see who I'm signed in as and which
  resources I can reach; clicking a resource copies its address, or signs me
  in to it when it needs authentication.
- As a new user, one script installs the extension and helps me install and
  set up the Twingate client.

## Tech Stack

- GJS (GNOME JavaScript), ES modules, GNOME Shell extension API for shell
  versions 46, 47, 48 (`metadata.json`)
- GObject Introspection: `Gio`, `GLib`, `GObject`
- systemd over the D-Bus system bus (`twingate.service` unit signals)
- systemd `StartUnit`/`StopUnit` over D-Bus, authorized by polkit
- External programs: `twingate` CLI (`status`, `status -v`, `resources`, `auth`)
- Bash for `install.sh` and `uninstall.sh`
- No package manager, no build step, no runtime dependencies to install

## Commands

```
Syntax check JS:   node --input-type=module --check < extension.js
                   node --input-type=module --check < lib.js
Unit tests:        gjs -m test.gjs
Syntax check sh:   bash -n install.sh && bash -n uninstall.sh
Install / update:  ./install.sh        (then log out and back in on Wayland)
Uninstall:         ./uninstall.sh
Extension status:  gnome-extensions info twingate-toggle@local
Logs:              journalctl --user -b | grep -i twingate
```

There is no build. "The build passes" means the syntax checks and `gjs -m test.gjs` pass.

## Project Structure

```
extension.js    → the extension (toggle, menu, indicator, CLI helpers)
twingate-symbolic.svg → tile, menu and top-bar icon (simplified Twingate mark)
lib.js          → pure parsers for `twingate` output (no Shell imports)
test.gjs        → assert-based tests for lib.js
metadata.json   → uuid, supported shell versions, version + version-name
install.sh      → per-user install, client setup, enable
uninstall.sh    → disable, remove files and cache
README.md       → user docs
CHANGELOG.md    → one section per version-name
SPEC.md         → this file
```

Installed to `${XDG_DATA_HOME:-~/.local/share}/gnome-shell/extensions/twingate-toggle@local/`.
No runtime files. `uninstall.sh` still removes the old 1.2.0 cache files
(`twingate-toggle.log`, `twingate-toggle-askpass.sh`).

## Behavior (current, 1.4.0)

### State

- The state comes from `twingate status` output (case-insensitive):
  - contains `online` → **on**
  - contains `starting` or `authenticating` → **on** (transitional), so the
    tile does not flip off while the user logs in
  - anything else → **off**
  - the command cannot run → **off**, subtitle `not installed`
- Subtitle = first line of the status output, cut to 24 characters.
- The top-bar icon is visible exactly when the tile is checked.

### Refresh

- Refresh at startup.
- Refresh 300 ms after any `PropertiesChanged` signal on
  `/org/freedesktop/systemd1/unit/twingate_2eservice` (repeated signals restart
  the 300 ms wait).
- Otherwise poll every 2 s while transitional, every 30 s when not.
- Only one refresh runs at a time. No refresh while a start/stop is running.

### Start / stop

- A click calls systemd `StartUnit` (tile now checked) or `StopUnit` on
  `twingate.service` over the system bus, with interactive authorization, so
  GNOME's polkit dialog asks for the password when needed. A start also
  starts the user unit `twingate-desktop-notifier.service` (Twingate's
  sign-in); if that fails, only a warning is logged.
- Clicks during a running start/stop are ignored.
- Subtitle shows `starting…` / `stopping…` while it runs.
- 1.5 s after the call returns, refresh. It failed if the call threw or the
  state does not match what the user asked. On failure, notify with the
  D-Bus error message, or "Twingate did not start/stop."

### Resources menu (1.4.0)

- The tile is a `QuickMenuToggle`: clicking the tile still starts/stops,
  the arrow opens the menu.
- Menu header: "Twingate", subtitle = first line of `twingate status -v`
  as printed (e.g. `Online: User`); `not installed` if it cannot run.
- Opening the menu runs `twingate resources` once (not on the poll timer)
  and lists one row per resource: name, then alias if set (`-` = none),
  else address.
- Parsing (`parseResources` in `lib.js`): tab-separated, first line is the
  header, columns name / address / alias / auth status, cells trimmed, `-` = empty, blank
  lines skipped. Output without that header (offline, error) → no rows.
- No rows → one insensitive row "No resources" (or the status when off).
- Clicking a row copies alias-or-address to the clipboard. If its auth status
  is not empty, clicking runs `twingate auth <name>` (argv, no shell) instead.
- Status parsing moves to `parseStatus` in `lib.js`, behavior unchanged.

### Disable

- `disable()` destroys the toggle and indicator, unsubscribes the D-Bus
  signal and removes the pending timer. Nothing runs after disable.

### Install script

- Refuses to run as root. Fails if `gnome-shell` is missing.
- Warns if the running shell major version is not in `metadata.json`.
- If `twingate` is missing, offers to install it with the official script.
- If `/etc/twingate/network.conf` is empty or missing, offers
  `sudo twingate setup`.
- If `/etc/polkit-1/rules.d` exists and the rule is not there yet, offers
  `50-twingate-toggle.rules`: lets this user, at an active local session,
  start/stop only `twingate.service` without a password. `uninstall.sh`
  removes it.
- Copies `extension.js`, `lib.js` and `metadata.json`, then enables the extension
  (falls back to editing `enabled-extensions` in gsettings on first install).
- Safe to run again to update.

## Code Style

Match `extension.js`: 4-space indent, single quotes, `const` by default,
`_private` methods, a short comment only for the why.

```js
// Give the client a moment to change state before reading it,
// so a slow start isn't reported as a failure.
await new Promise(resolve => {
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1500, () => {
        resolve();
        return GLib.SOURCE_REMOVE;
    });
});
```

- Log with the prefix `Twingate toggle:`.
- Every timer and signal created must be removed in `destroy()`.
- Shortcuts with a known limit get a `// shortcut: <limit>, <when to upgrade>` comment.
- Every user-visible change: bump `version` and `version-name` in
  `metadata.json` and add a `CHANGELOG.md` section.

## Testing Strategy

- **Every change:** the syntax checks and `gjs -m test.gjs` in Commands.
- **Unit tests:** `lib.js` parsers, with fixtures copied from real
  `twingate` output.
- **Manual check in a real session** (needs log out/in on Wayland, or a nested
  shell: `dbus-run-session -- gnome-shell --nested --wayland`):
  1. Tile shows the right state at login, with Twingate on and off.
  2. Click on → password window → tile checked, top-bar icon visible.
  3. Click off → tile unchecked, icon hidden.
  4. `sudo systemctl stop twingate` in a terminal → tile turns off within ~1 s.
  5. Cancel the password window → notification with the polkit error.
  6. Disable the extension → no errors in `journalctl --user -b`.
  7. Open the menu → user and resources shown; click a row → address in clipboard.

## Boundaries

- **Always:** run both syntax checks before a commit; keep the extension to
  `extension.js` plus the Shell-free `lib.js`; clean up every
  timer/signal on destroy; update README, CHANGELOG and `metadata.json`
  version with user-visible changes.
- **Ask first:** adding a dependency or a build step; adding a supported
  shell version; changing how the password is collected (askpass, sudo,
  pkexec); anything in `install.sh` that runs with `sudo` or downloads code;
  adding settings/prefs UI.
- **Never:** store or log the user's password; run the extension's commands
  through a shell with unquoted user input; write outside the user's cache
  and extension directories; commit secrets.

## Success Criteria

The baseline is met when all of these hold:

1. Both syntax checks pass.
2. All six manual checks in Testing Strategy pass on GNOME Shell 46.
3. After `systemctl start/stop twingate` outside the extension, the tile shows
   the new state within 1 s.
4. With no state change, the extension runs `twingate status` at most once
   every 30 s.
5. README describes the current behavior (it does not today, see Open
   Questions).

## Open Questions

1. **README intro** and 2. **French strings**: resolved in 1.3.0.
3. **Shell versions.** Only 46–48 are listed. Should 49+ be supported? That
   needs testing on those versions.
4. **Unit tests.** Resolved in 1.4.0: `lib.js` + `test.gjs`.
5. **Uninstall** disables the extension but leaves it in `enabled-extensions`.
   Should it remove the entry too?
6. **Installed copy is old.** `gnome-extensions info` shows version 1 installed;
   the repo is at version 3. Run `./install.sh` and log out/in before manual
   checks.
7. **Next feature: first-run setup dialog.** Direction agreed in
   `docs/ideas/first-run-setup.md`: a setup dialog with paste-this terminal
   steps, start/stop through systemd D-Bus, and no root from the extension.
   To be specced here before building.
