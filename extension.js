import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {QuickToggle, SystemIndicator} from 'resource:///org/gnome/shell/ui/quickSettings.js';

Gio._promisify(Gio.Subprocess.prototype, 'communicate_utf8_async');
Gio._promisify(Gio.Subprocess.prototype, 'wait_async', 'wait_finish');

const POLL_SECONDS = 5;
const CACHE_DIR = GLib.get_user_cache_dir();
const LOG_PATH = GLib.build_filenamev([CACHE_DIR, 'twingate-toggle.log']);
const ASKPASS_PATH = GLib.build_filenamev([CACHE_DIR, 'twingate-toggle-askpass.sh']);

// The twingate CLI calls sudo internally. Without a terminal, sudo can only
// ask for the password through an "askpass" helper, so we provide one that
// opens a small password window.
function ensureAskpass() {
    let script = null;
    if (GLib.find_program_in_path('zenity')) {
        script = '#!/bin/sh\n' +
            'exec zenity --entry --hide-text --title="Twingate" --text="${1:-Mot de passe}"\n';
    } else if (GLib.file_test('/usr/bin/ssh-askpass', GLib.FileTest.IS_EXECUTABLE)) {
        script = '#!/bin/sh\nexec /usr/bin/ssh-askpass "$@"\n';
    }
    if (!script)
        return false;
    try {
        GLib.file_set_contents(ASKPASS_PATH, script);
        return true;
    } catch (e) {
        console.error(`Twingate toggle: cannot write askpass helper: ${e}`);
        return false;
    }
}

// Short command whose output we read directly (twingate status).
async function runStatus() {
    const proc = Gio.Subprocess.new(
        ['twingate', 'status'],
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_MERGE);
    const [stdout] = await proc.communicate_utf8_async(null, null);
    return stdout ?? '';
}

// start/stop: output goes to a log file, so a background process started by
// the twingate CLI cannot keep us waiting on an open pipe.
async function runAction(sub) {
    const haveAskpass = ensureAskpass();

    const launcher = new Gio.SubprocessLauncher({flags: Gio.SubprocessFlags.NONE});
    if (haveAskpass) {
        launcher.setenv('SUDO_ASKPASS', ASKPASS_PATH, true);
        // sudo only uses an askpass helper without a terminal if DISPLAY is set.
        launcher.setenv('DISPLAY', GLib.getenv('DISPLAY') ?? ':0', false);
    }

    const proc = launcher.spawnv([
        'sh', '-c',
        `chmod 700 "$2" 2>/dev/null; twingate ${sub} >"$1" 2>&1`,
        'sh', LOG_PATH, ASKPASS_PATH,
    ]);
    await proc.wait_async(null);
    // get_exit_status() is only valid if the process exited normally.
    const status = proc.get_if_exited() ? proc.get_exit_status() : -1;

    let output = '';
    try {
        const [ok, bytes] = GLib.file_get_contents(LOG_PATH);
        if (ok)
            output = new TextDecoder().decode(bytes).trim();
    } catch (e) {
        // no log written
    }
    console.log(`Twingate toggle: "twingate ${sub}" exited ${status}: ${output}`);
    return {status, output, haveAskpass};
}

const TwingateToggle = GObject.registerClass(
class TwingateToggle extends QuickToggle {
    constructor() {
        super({
            title: 'Twingate',
            iconName: 'network-vpn-symbolic',
            toggleMode: true,
        });

        this._busy = false;
        this._destroyed = false;

        // 'clicked' only fires on a real user click, not when we set `checked`.
        this.connect('clicked', () => this._onClicked());

        this._refresh();
        this._timeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT, POLL_SECONDS, () => {
                this._refresh();
                return GLib.SOURCE_CONTINUE;
            });
    }

    async _onClicked() {
        if (this._busy)
            return;
        this._busy = true;
        const wantOn = this.checked;
        this.subtitle = wantOn ? 'starting…' : 'stopping…';

        let result = {status: -1, output: '', haveAskpass: true};
        try {
            result = await runAction(wantOn ? 'start' : 'stop');
        } catch (e) {
            console.error(`Twingate toggle: ${e}`);
            result.output = `${e}`;
        }

        // Give the client a moment to change state before reading it,
        // so a slow start isn't reported as a failure.
        await new Promise(resolve => {
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1500, () => {
                resolve();
                return GLib.SOURCE_REMOVE;
            });
        });

        this._busy = false;
        if (this._destroyed)
            return;

        await this._refresh();

        const failed = result.status !== 0 ||
            (wantOn && !this.checked) || (!wantOn && this.checked);
        if (failed) {
            let message = result.output ||
                `The twingate command exited with code ${result.status}.`;
            if (!result.haveAskpass && /askpass|terminal is required/i.test(message))
                message += '\n\nInstalle zenity pour la fenêtre de mot de passe : sudo apt install zenity';
            Main.notify('Twingate', message);
        }
    }

    async _refresh() {
        if (this._busy || this._destroyed)
            return;
        try {
            const out = (await runStatus()).trim();
            if (this._destroyed)
                return;
            // Stay "on" while the client starts or waits for authentication,
            // otherwise the tile would flip back off before the user logs in.
            this.checked = /\b(online|authenticating|starting)\b/i.test(out);
            this.subtitle = out.split('\n')[0].slice(0, 24) || null;
        } catch (e) {
            if (this._destroyed)
                return;
            this.checked = false;
            this.subtitle = 'not installed';
        }
    }

    destroy() {
        this._destroyed = true;
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = 0;
        }
        super.destroy();
    }
});

const TwingateIndicator = GObject.registerClass(
class TwingateIndicator extends SystemIndicator {
    constructor() {
        super();

        // Small icon in the top bar, visible only while Twingate is on.
        this._indicator = this._addIndicator();
        this._indicator.iconName = 'network-vpn-symbolic';

        const toggle = new TwingateToggle();
        toggle.bind_property('checked', this._indicator, 'visible',
            GObject.BindingFlags.SYNC_CREATE);
        this.quickSettingsItems.push(toggle);
    }
});

export default class TwingateToggleExtension extends Extension {
    enable() {
        this._indicator = new TwingateIndicator();
        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
    }

    disable() {
        this._indicator.quickSettingsItems.forEach(item => item.destroy());
        this._indicator.destroy();
        this._indicator = null;
    }
}
