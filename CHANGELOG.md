# Changelog

## 1.2.0

- The tile follows the systemd `twingate.service` over D-Bus instead of running
  `twingate status` every 5 seconds. It polls every 2 s only while the client
  is starting or authenticating, otherwise every 30 s.

## 1.1.0

- The install script offers to install the Twingate client if it is missing,
  and to run `sudo twingate setup` if it has not been set up yet.

## 1.0.0

- First release: Quick Settings tile to start and stop the Twingate client.
