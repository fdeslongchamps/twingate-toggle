# First-Run Setup Dialog

## Problem Statement

How might we take a stranger from "just enabled the extension" to "connected",
with as little terminal as possible, whether or not Twingate is already
installed?

## Recommended Direction

When the extension is enabled and Twingate is not ready, a setup dialog
(GNOME Shell's own `ModalDialog`, so it lives in `extension.js`) opens over the
desktop. It checks what is missing and shows only those steps.

**The extension itself never runs anything as root.** Every step that needs
admin rights is a "paste this" step: the dialog shows one command, a sentence
on what it does and where it comes from, a **Copy** button and an **Open
Terminal** button. The user pastes it and types their password in the
terminal, as Twingate's own Linux instructions already do. The dialog checks
every few seconds and moves on by itself once the step is done. This keeps the
extension inside the extensions.gnome.org rule on privileged subprocesses.

1. **Install and set up Twingate** (skipped if already set up). Paste step:
   `curl -fsSL https://binaries.twingate.com/client/linux/install.sh | sudo bash && sudo twingate setup`
   (if Twingate is installed but not set up, only `sudo twingate setup`).
   The user answers Twingate's own questions in the terminal, including its
   Terms of Service and the network name.
2. **Don't ask for my password again** (optional, skippable). Paste step that
   adds a polkit rule letting this user start and stop `twingate.service`.
   Skipped: GNOME's own password dialog appears on toggle and remembers the
   password for a few minutes.
3. **Sign in**: the extension starts Twingate's own notifier
   (`twingate-desktop-notifier`, a user service), which shows Twingate's
   sign-in. The dialog closes once connected.

After setup, the tile starts and stops the service through systemd over D-Bus
(`StartUnit`/`StopUnit`). No sudo, zenity or askpass script. If the user
closes the dialog early, the tile reads "Set up Twingate…" and clicking it
reopens the dialog; it never pops up again by itself.

The extension never sees or stores Twingate or company credentials, and never
logs the network name.

## Key Assumptions to Validate

Checked 2026-10-09 on GNOME 46, Twingate CLI 2026.160.6555, by reading the CLI
(`-p`, `--help`, strings in the binary), the official install script and the
extensions.gnome.org review guidelines. Nothing was run as root.

- [x] **Starting the service is enough to connect: mostly yes.**
      `twingate start` checks `systemctl is-active twingate`, runs
      `systemctl start twingate`, then starts the user unit
      `twingate-desktop-notifier` (no root). It also warns if another VPN is
      active (via `nmcli`); we would lose that warning. `stop` is
      `systemctl stop twingate`. Still to confirm with a live start.
- [~] **`twingate setup` without a terminal: possible, fragile.** It needs
      root and asks interactive questions: accept Twingate's Terms of Service
      and Privacy Policy, share crash reports, network name, start now. It
      writes `/etc/twingate/network.conf` and `network-config.json`. Feeding
      answers on stdin breaks if Twingate changes the prompts. The Terms must
      be shown to the user and accepted by them in the dialog, never answered
      automatically.
- [ ] **Stable .deb/.rpm download URL: no.** The official script adds
      Twingate's apt repo (with a GPG key) or rpm repo (`gpgcheck=0`) at
      `packages.twingate.com`, then installs `twingate`. GNOME's installer
      cannot do this alone; installing needs a root shell step.
- [x] **Sign-in: handled by Twingate itself.** The `twingate-desktop-notifier`
      user service shows Twingate's own authentication requests. Starting it
      may be all the dialog needs; no URL scraping. Still to confirm live.
- [~] **extensions.gnome.org review:** "Spawning privileged subprocesses
      should be avoided at all costs. If absolutely necessary, the subprocess
      MUST be run with pkexec and MUST NOT be an executable or script that can
      be modified by a user process." The current sudo + askpass script in
      `~/.cache` would likely be rejected. Adding a package repo or a polkit
      rule needs pkexec on a shell command: a reviewer judgment call.

### What this changes

- Start/stop should call systemd over D-Bus (`StartUnit`/`StopUnit`). GNOME
  then shows its own password dialog (polkit `manage-units` is
  `auth_admin_keep` for the active user: asked once, remembered a few
  minutes). No sudo, zenity or askpass, and it fits the review rules.
- "Never ask again" (the polkit rule) and installing the client conflict
  with the review rules. Decided 2026-10-09: both become paste steps the user
  runs in a terminal, so the extension never runs anything as root.

## MVP Scope

In:

- Detect three states: no client / not set up / set up.
- Setup dialog on first enable, showing only the missing steps.
- Paste steps with Copy and Open Terminal buttons; the dialog advances by
  itself when the step is done.
- Optional "don't ask again" paste step (polkit rule).
- Start/stop through systemd over D-Bus; GNOME's own password dialog. Drop
  askpass, zenity and the French strings.
- Start Twingate's notifier for sign-in.
- The tile shows "Set up Twingate…" and reopens the dialog until setup is done.
- Extension description declares clipboard use (review rule).
- Works on GNOME 46 (the only version tested).

## Not Doing (and Why)

- **Running anything as root from the extension (sudo, pkexec)**: the review
  rules say to avoid it at all costs; a paste step does the same job with the
  user in control.
- **Answering Twingate's setup questions for the user**: they include
  Twingate's Terms of Service, which the user must accept themselves.
- **Settings window (prefs.js)**: more UI to keep working each GNOME release;
  the dialog covers setup. Add later for "Change network".
- **Login form inside the extension**: credentials belong on the identity
  provider's page; handling them would be a security liability.
- **Headless/service-key setup**: for servers, not desktop users.
- **Claiming GNOME 47+ support**: cannot be tested here.
- **Telemetry or logging the network name**: nothing about the user's
  Twingate setup leaves their machine or reaches the repo.

## Open Questions

- Does `install.sh` stay as the GitHub install path, or shrink to "copy files"
  now that the dialog covers setup?
- Polkit rule matching: by user name (the dialog fills it in) or by admin
  group (`sudo` on Debian/Ubuntu, `wheel` on Fedora)? Leaning: user name.
- Which terminal does "Open Terminal" launch (default terminal setting,
  `gnome-terminal`, `kgx`/Console), and what if none is found? Fallback: hide
  the button, keep Copy.
