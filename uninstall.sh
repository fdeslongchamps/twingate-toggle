#!/usr/bin/env bash
# Removes the Twingate Toggle GNOME Shell extension for the current user.
set -euo pipefail

UUID="twingate-toggle@local"
DEST_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/gnome-shell/extensions/$UUID"
CACHE_DIR="${XDG_CACHE_HOME:-$HOME/.cache}"

gnome-extensions disable "$UUID" 2>/dev/null || true
rm -rf "$DEST_DIR"
rm -f "$CACHE_DIR/twingate-toggle.log" "$CACHE_DIR/twingate-toggle-askpass.sh"

echo "Twingate Toggle removed. Log out and back in to fully unload it."
