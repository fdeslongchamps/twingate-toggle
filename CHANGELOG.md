# Changelog

## 1.4.0

- The tile has a menu (the arrow): it shows who you are signed in as and lists
  your Twingate resources. Click a resource to copy its alias or address, or to
  sign in to it when it needs authentication.

## 1.3.0

- Start and stop go through systemd over D-Bus instead of `twingate start/stop`
  with sudo. GNOME's own password dialog asks for the password (and remembers
  it for a few minutes). zenity is no longer needed.
- The install script offers a polkit rule so you can toggle Twingate without
  any password (sudo once at install). `uninstall.sh` removes it.
- Lost: the `twingate start` warning when another VPN is active.

## 1.2.0

- The tile follows the systemd `twingate.service` over D-Bus instead of running
  `twingate status` every 5 seconds. It polls every 2 s only while the client
  is starting or authenticating, otherwise every 30 s.

## 1.1.0

- The install script offers to install the Twingate client if it is missing,
  and to run `sudo twingate setup` if it has not been set up yet.

## 1.0.0

- First release: Quick Settings tile to start and stop the Twingate client.
