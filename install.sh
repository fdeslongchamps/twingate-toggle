#!/usr/bin/env bash
# Installs the Twingate Toggle GNOME Shell extension for the current user.
set -euo pipefail

UUID="twingate-toggle@local"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/gnome-shell/extensions/$UUID"

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33mwarning:\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31merror:\033[0m %s\n' "$*" >&2; exit 1; }

[ "$(id -u)" -ne 0 ] || die "Run this script as your normal user, not with sudo."

command -v gnome-shell >/dev/null || die "GNOME Shell not found."

shell_major="$(gnome-shell --version | grep -oE '[0-9]+' | head -n1)"
if ! grep -q "\"$shell_major\"" "$SRC_DIR/metadata.json"; then
    warn "GNOME Shell $shell_major is not listed in metadata.json; the extension may not load."
fi

ask() { local answer; read -rp "$1 [Y/n] " answer; [[ ! "$answer" =~ ^[Nn] ]]; }

# Install the Twingate client with the official script if it is missing.
if ! command -v twingate >/dev/null; then
    warn "The 'twingate' client is not installed."
    if ask "Install it now with the official Twingate script (needs sudo)?"; then
        command -v curl >/dev/null || die "curl is needed to download Twingate. Install curl and run this again."
        curl -fsSL https://binaries.twingate.com/client/linux/install.sh | sudo bash
        command -v twingate >/dev/null || die "Twingate install failed. See https://www.twingate.com/download"
        info "Twingate client installed."
    else
        warn "Skipping. Get it later from https://www.twingate.com/download"
    fi
fi

# First-time setup writes the network name to /etc/twingate/network.conf.
if command -v twingate >/dev/null && [ ! -s /etc/twingate/network.conf ]; then
    warn "Twingate has not been set up yet."
    if ask "Run 'sudo twingate setup' now?"; then
        sudo twingate setup
    else
        warn "Skipping. Run 'sudo twingate setup' before using the tile."
    fi
fi

# zenity provides the password window used when twingate calls sudo.
if ! command -v zenity >/dev/null && [ ! -x /usr/bin/ssh-askpass ]; then
    warn "zenity is not installed; it is needed for the password prompt."
    if command -v apt-get >/dev/null; then
        if ask "Install zenity now with apt?"; then
            sudo apt-get install -y zenity
        fi
    elif command -v dnf >/dev/null; then
        if ask "Install zenity now with dnf?"; then
            sudo dnf install -y zenity
        fi
    else
        warn "Install zenity with your package manager."
    fi
fi

version="$(grep -oP '"version-name":\s*"\K[^"]+' "$SRC_DIR/metadata.json" || echo unknown)"
info "Installing Twingate Toggle $version to $DEST_DIR"
mkdir -p "$DEST_DIR"
install -m 644 "$SRC_DIR/extension.js" "$SRC_DIR/metadata.json" "$DEST_DIR/"

# Enable it. If the shell has not seen the extension yet (first install),
# `gnome-extensions enable` fails, so also add it to the enabled list directly;
# it then loads at the next login.
if gnome-extensions enable "$UUID" 2>/dev/null; then
    info "Extension enabled."
    info "If you updated an existing install, log out and back in to load the new version."
else
    current="$(gsettings get org.gnome.shell enabled-extensions)"
    if [[ "$current" != *"'$UUID'"* ]]; then
        if [[ "$current" == "@as []" || "$current" == "[]" ]]; then
            new="['$UUID']"
        else
            new="${current%]}, '$UUID']"
        fi
        gsettings set org.gnome.shell enabled-extensions "$new"
    fi
    info "Extension installed and marked as enabled."
    info "Log out and back in (Wayland) or press Alt+F2, type r, Enter (X11) to load it."
fi

info "Done. Look for the 'Twingate' tile in Quick Settings (top-right menu)."
