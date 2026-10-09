// Run with: gjs -m test.gjs
import {parseStatus, parseResources} from './lib.js';

function eq(actual, expected, what) {
    const a = JSON.stringify(actual), e = JSON.stringify(expected);
    if (a !== e)
        throw new Error(`${what}: got ${a}, want ${e}`);
}

eq(parseStatus('online'), {on: true, transitional: false, subtitle: 'online'}, 'online');
eq(parseStatus('Authenticating\nopen the browser'),
    {on: true, transitional: true, subtitle: 'Authenticating'}, 'authenticating');
eq(parseStatus('starting').transitional, true, 'starting');
eq(parseStatus('not running'), {on: false, transitional: false, subtitle: 'not running'}, 'off');
eq(parseStatus('offline').on, false, 'offline is not online');
eq(parseStatus('').subtitle, null, 'empty subtitle');
eq(parseStatus('x'.repeat(30)).subtitle.length, 24, 'subtitle cut to 24');

// Copied from real `twingate resources` output (tabs, padded cells).
const real = 'RESOURCE NAME\tADDRESS       \tALIAS\tAUTH STATUS\n' +
    'Home         \t192.168.2.0/24\t-    \t\n\n';
eq(parseResources(real),
    [{name: 'Home', address: '192.168.2.0/24', alias: '', auth: ''}], 'real output');
eq(parseResources('RESOURCE NAME\tADDRESS\tALIAS\tAUTH STATUS\n' +
    'DB\tdb.internal\tdb.corp\tAuth required\n'),
    [{name: 'DB', address: 'db.internal', alias: 'db.corp', auth: 'Auth required'}], 'alias + auth');
eq(parseResources('Twingate is not running\n'), [], 'no header');
eq(parseResources(''), [], 'empty');

print('ok');
