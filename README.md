# Twingate Toggle

A GNOME Shell extension that adds a **Twingate** tile to Quick Settings (the
top-right menu), so you can start and stop the Twingate Linux client with one
click, without opening a terminal.

- The tile shows whether Twingate is on, and updates as soon as the Twingate
  service starts or stops.
- A small VPN icon appears in the top bar while Twingate is on.
- Starting and stopping go through systemd. GNOME shows its own password
  dialog, and remembers the password for a few minutes. To never be asked,
  answer yes when `install.sh` offers the password-free toggle (one sudo
  password at install; `uninstall.sh` removes it).
- Open the tile's menu (the arrow) to see who you are signed in as and your
  resources. Click a resource to copy its alias or address; if it needs
  authentication, clicking signs you in to it instead.
- If starting or stopping fails, the reason is shown as a notification.

## Requirements

- GNOME Shell 46, 47 or 48
- The [Twingate Linux client](https://www.twingate.com/download), set up with
  `sudo twingate setup` (the install script offers to install the client and
  run the setup if needed)

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
- **Tile says "not installed":** the `twingate` command is not in your `PATH`.
