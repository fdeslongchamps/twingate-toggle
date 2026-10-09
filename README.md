# Twingate Toggle

A GNOME Shell extension that adds a **Twingate** tile to Quick Settings (the
top-right menu), so you can start and stop the Twingate Linux client with one
click, without opening a terminal.

- The tile shows the current client state (`online`, `not running`, …) and
  refreshes every 5 seconds.
- A small VPN icon appears in the top bar while Twingate is on.
- `twingate start`/`stop` call `sudo`. The extension opens a password window
  (zenity) for this, since there is no terminal to type it in.
- If a command fails, its output is shown as a notification. The last output
  is also saved to `~/.cache/twingate-toggle.log`.

## Requirements

- GNOME Shell 46, 47 or 48
- The [Twingate Linux client](https://www.twingate.com/download), set up with
  `sudo twingate setup` (the install script offers to install the client and
  run the setup if needed)
- `zenity` for the password window (the install script offers to install it)

## Install

```bash
git clone https://github.com/fdeslongchamps/twingate-toggle.git
cd twingate-toggle
./install.sh
```

Then log out and back in (Wayland). On X11 you can press `Alt+F2`, type `r`
and press Enter instead.

To update, `git pull` and run `./install.sh` again, then log out and back in.

## Uninstall

```bash
./uninstall.sh
```

## Troubleshooting

- **The tile doesn't appear:** check it is enabled with
  `gnome-extensions info twingate-toggle@local`, and look for errors with
  `journalctl --user -b | grep -i twingate`.
- **"a terminal is required" error:** install zenity (`sudo apt install zenity`).
- **Tile says "not installed":** the `twingate` command is not in your `PATH`.
