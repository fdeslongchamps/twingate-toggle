import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import {QuickMenuToggle, SystemIndicator} from 'resource:///org/gnome/shell/ui/quickSettings.js';

import {parseStatus, parseResources, resourceAction} from './lib.js';

Gio._promisify(Gio.Subprocess.prototype, 'communicate_utf8_async');
Gio._promisify(Gio.DBusConnection.prototype, 'call');

// systemd tells us when the service starts/stops; polling only catches
// changes inside the client (authenticating -> online), so it can be slow.
const POLL_MS = 30000;
const FAST_POLL_MS = 2000;
const SIGNAL_DEBOUNCE_MS = 300;
const UNIT_PATH = '/org/freedesktop/systemd1/unit/twingate_2eservice';
// The -symbolic suffix makes the shell recolor it like its own icons.
const ICON = Gio.FileIcon.new(Gio.File.new_for_uri(
    new URL('twingate-symbolic.svg', import.meta.url).href));

// Short command whose output we read directly (twingate status, resources).
async function runTwingate(...args) {
    const proc = Gio.Subprocess.new(
        ['twingate', ...args],
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_MERGE);
    const [stdout] = await proc.communicate_utf8_async(null, null);
    return stdout ?? '';
}

// Start/stop twingate.service through systemd. GNOME's own polkit password
// dialog authorizes it, so no sudo or askpass helper is needed.
async function runAction(sub) {
    const method = sub === 'start' ? 'StartUnit' : 'StopUnit';
    const args = unit => new GLib.Variant('(ss)', [unit, 'replace']);
    await Gio.DBus.system.call('org.freedesktop.systemd1', '/org/freedesktop/systemd1',
        'org.freedesktop.systemd1.Manager', method, args('twingate.service'), null,
        Gio.DBusCallFlags.ALLOW_INTERACTIVE_AUTHORIZATION, -1, null);
    // `twingate start` also starts this user unit, which shows Twingate's sign-in.
    if (sub === 'start') {
        await Gio.DBus.session.call('org.freedesktop.systemd1', '/org/freedesktop/systemd1',
            'org.freedesktop.systemd1.Manager', 'StartUnit',
            args('twingate-desktop-notifier.service'), null,
            Gio.DBusCallFlags.NONE, -1, null).catch(e =>
            console.warn(`Twingate toggle: cannot start the notifier: ${e}`));
    }
}

const TwingateToggle = GObject.registerClass(
class TwingateToggle extends QuickMenuToggle {
    constructor() {
        super({
            title: 'Twingate',
            gicon: ICON,
            toggleMode: true,
        });

        this._busy = false;
        this._refreshing = false;
        this._destroyed = false;
        this._timeoutId = 0;

        // 'clicked' only fires on a real user click, not when we set `checked`.
        this.connect('clicked', () => this._onClicked());

        this.menu.setHeader(ICON, 'Twingate');
        this._resources = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(this._resources);
        // Read resources only when the menu opens, not on the poll timer.
        this.menu.connect('open-state-changed', (menu, open) => {
            if (open)
                this._loadMenu();
        });

        // systemd only emits unit signals once some client has subscribed.
        // shortcut: never Unsubscribe, since that would also drop the shared
        // gnome-shell bus connection's subscription other code may rely on.
        Gio.DBus.system.call('org.freedesktop.systemd1', '/org/freedesktop/systemd1',
            'org.freedesktop.systemd1.Manager', 'Subscribe', null, null,
            Gio.DBusCallFlags.NONE, -1, null, null);
        this._unitSignalId = Gio.DBus.system.signal_subscribe(
            'org.freedesktop.systemd1', 'org.freedesktop.DBus.Properties',
            'PropertiesChanged', UNIT_PATH, null, Gio.DBusSignalFlags.NONE,
            () => this._schedule(SIGNAL_DEBOUNCE_MS));

        this._refresh();
    }

    _schedule(ms) {
        if (this._timeoutId)
            GLib.source_remove(this._timeoutId);
        this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, ms, () => {
            this._timeoutId = 0;
            this._refresh();
            return GLib.SOURCE_REMOVE;
        });
    }

    async _onClicked() {
        if (this._busy)
            return;
        this._busy = true;
        const wantOn = this.checked;
        this.subtitle = wantOn ? 'starting…' : 'stopping…';

        let error = null;
        try {
            await runAction(wantOn ? 'start' : 'stop');
        } catch (e) {
            console.error(`Twingate toggle: ${e}`);
            error = e;
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

        if (error) {
            // Strip the "GDBus.Error:org.freedesktop..." prefix from the message.
            Gio.DBusError.strip_remote_error(error);
            Main.notify('Twingate', error.message);
        } else if (wantOn !== this.checked) {
            Main.notify('Twingate', `Twingate did not ${wantOn ? 'start' : 'stop'}.`);
        }
    }

    async _loadMenu() {
        let header = '', resources = [];
        try {
            const [verbose, table] = await Promise.all(
                [runTwingate('status', '-v'), runTwingate('resources')]);
            header = verbose.trim().split('\n')[0];
            resources = parseResources(table);
        } catch (e) {
            header = 'not installed';
        }
        if (this._destroyed)
            return;

        this.menu.setHeader(ICON, 'Twingate', header);
        this._resources.removeAll();
        for (const r of resources) {
            const item = new PopupMenu.PopupMenuItem(`${r.name}  ${r.alias || r.address}`);
            item.connect('activate', () => this._onResource(r));
            this._resources.addMenuItem(item);
        }
        if (!resources.length) {
            this._resources.addMenuItem(new PopupMenu.PopupMenuItem(
                this.checked ? 'No resources' : this.subtitle ?? 'Off', {reactive: false}));
        }
    }

    _onResource(r) {
        const [action, arg] = resourceAction(r);
        if (action === 'copy') {
            St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, arg);
            return;
        }
        // Not awaited: auth opens the browser and may run until sign-in ends.
        try {
            Gio.Subprocess.new(['twingate', 'auth', arg], Gio.SubprocessFlags.NONE);
        } catch (e) {
            Main.notify('Twingate', `Cannot sign in to ${arg}: ${e.message}`);
        }
    }

    async _refresh() {
        if (this._busy || this._refreshing || this._destroyed)
            return;
        this._refreshing = true;
        let transitional = false;
        try {
            const status = parseStatus(await runTwingate('status'));
            if (this._destroyed)
                return;
            transitional = status.transitional;
            this.checked = status.on;
            this.subtitle = status.subtitle;
        } catch (e) {
            if (this._destroyed)
                return;
            this.checked = false;
            this.subtitle = 'not installed';
        } finally {
            this._refreshing = false;
        }
        // Keep a refresh a systemd signal queued while we were running.
        if (!this._timeoutId)
            this._schedule(transitional ? FAST_POLL_MS : POLL_MS);
    }

    destroy() {
        this._destroyed = true;
        Gio.DBus.system.signal_unsubscribe(this._unitSignalId);
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
        this._indicator.gicon = ICON;

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
