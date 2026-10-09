# Spec: Twingate Toggle

Baseline spec of the extension as of 1.2.0. New work should update this file
first, then the code.

## Objective

A GNOME Shell extension that lets a desktop user start and stop the Twingate
Linux client from Quick Settings, without a terminal.

User: one person on their own Linux desktop (GNOME, Wayland or X11) who has
the Twingate client set up and can `sudo`.

User stories:

- As a user, I click the **Twingate** tile to start or stop the client.
- As a user, I can see at a glance whether Twingate is on: the tile is checked
  and a VPN icon shows in the top bar.
- As a user, when `sudo` needs my password, a password window appears.
- As a user, when a start or stop fails, I get a notification that says why.
- As a new user, one script installs the extension and helps me install and
  set up the Twingate client and zenity.

## Tech Stack

- GJS (GNOME JavaScript), ES modules, GNOME Shell extension API for shell
  versions 46, 47, 48 (`metadata.json`)
- GObject Introspection: `Gio`, `GLib`, `GObject`
- systemd over the D-Bus system bus (`twingate.service` unit signals)
- External programs: `twingate` CLI, `sudo`, `zenity` or `/usr/bin/ssh-askpass`
- Bash for `install.sh` and `uninstall.sh`
- No package manager, no build step, no runtime dependencies to install

## Commands

```
Syntax check JS:   node --input-type=module --check < extension.js
Syntax check sh:   bash -n install.sh && bash -n uninstall.sh
Install / update:  ./install.sh        (then log out and back in on Wayland)
Uninstall:         ./uninstall.sh
Extension status:  gnome-extensions info twingate-toggle@local
Logs:              journalctl --user -b | grep -i twingate
Last CLI output:   cat ~/.cache/twingate-toggle.log
```

There is no build. "The build passes" means both syntax checks pass.

## Project Structure

```
extension.js    → the whole extension (toggle, indicator, CLI helpers)
metadata.json   → uuid, supported shell versions, version + version-name
install.sh      → per-user install, client/zenity setup, enable
uninstall.sh    → disable, remove files and cache
README.md       → user docs
CHANGELOG.md    → one section per version-name
SPEC.md         → this file
```

Installed to `${XDG_DATA_HOME:-~/.local/share}/gnome-shell/extensions/twingate-toggle@local/`.
Runtime files in `${XDG_CACHE_HOME:-~/.cache}`: `twingate-toggle.log`,
`twingate-toggle-askpass.sh`.

## Behavior (current, 1.2.0)

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

- A click runs `twingate start` (tile now checked) or `twingate stop`.
- Clicks during a running start/stop are ignored.
- Subtitle shows `starting…` / `stopping…` while it runs.
- `SUDO_ASKPASS` points to a helper that runs zenity (or `ssh-askpass`);
  `DISPLAY` is set if missing (sudo needs it to use askpass).
- CLI output goes to `~/.cache/twingate-toggle.log`, not a pipe, so a
  background child of the CLI cannot block the extension.
- 1.5 s after the command ends, refresh. It failed if the exit code is not 0
  or the state does not match what the user asked. On failure, notify with
  the CLI output (or the exit code if there is none). If there is no askpass
  helper and the output mentions askpass/terminal, add a hint to install
  zenity.

### Disable

- `disable()` destroys the toggle and indicator, unsubscribes the D-Bus
  signal and removes the pending timer. Nothing runs after disable.

### Install script

- Refuses to run as root. Fails if `gnome-shell` is missing.
- Warns if the running shell major version is not in `metadata.json`.
- If `twingate` is missing, offers to install it with the official script.
- If `/etc/twingate/network.conf` is empty or missing, offers
  `sudo twingate setup`.
- If neither zenity nor ssh-askpass exists, offers to install zenity with apt
  or dnf.
- Copies `extension.js` and `metadata.json`, then enables the extension
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

Today there are no automated tests.

- **Every change:** both syntax checks in Commands.
- **Manual check in a real session** (needs log out/in on Wayland, or a nested
  shell: `dbus-run-session -- gnome-shell --nested --wayland`):
  1. Tile shows the right state at login, with Twingate on and off.
  2. Click on → password window → tile checked, top-bar icon visible.
  3. Click off → tile unchecked, icon hidden.
  4. `sudo systemctl stop twingate` in a terminal → tile turns off within ~1 s.
  5. Cancel the password window → notification with the sudo error.
  6. Disable the extension → no errors in `journalctl --user -b`.
- **Proposed (see Open Questions):** move the status parsing into a pure
  function and test it with a small `gjs -m` script with asserts. It is the
  only logic that can be tested without a running shell.

## Boundaries

- **Always:** run both syntax checks before a commit; keep the extension a
  single `extension.js` unless that becomes a real problem; clean up every
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

1. **README is broken.** Commit 141dab7 replaced the first line of the first
   bullet instead of the second, so it now reads "…updates as soon as the
   Twingate service starts or stops. refreshes every 5 seconds." Fix as the
   first task?
2. **Language.** UI text is English, but two strings are French: the password
   prompt (`Mot de passe`) and the zenity hint (`Installe zenity…`). English
   everywhere, French everywhere, or translations (gettext)?
3. **Shell versions.** Only 46–48 are listed. Should 49+ be supported? That
   needs testing on those versions.
4. **Unit tests.** OK to extract the status parsing into a pure function and
   add a `gjs` assert script (no new dependency)?
5. **Uninstall** disables the extension but leaves it in `enabled-extensions`.
   Should it remove the entry too?
6. **Installed copy is old.** `gnome-extensions info` shows version 1 installed;
   the repo is at version 3. Run `./install.sh` and log out/in before manual
   checks.
7. **Scope beyond baseline.** Any new features you want specced (for example
   showing the network name, start at login, a prefs window)? None are in
   scope until you name them.
