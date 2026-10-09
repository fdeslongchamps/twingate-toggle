// Pure parsers for `twingate` output. No Shell imports, so test.gjs can load it.

export function parseStatus(text) {
    const out = text.trim();
    // Stay "on" while the client starts or waits for authentication,
    // otherwise the tile would flip back off before the user logs in.
    const transitional = /\b(authenticating|starting)\b/i.test(out);
    return {
        on: transitional || /\bonline\b/i.test(out),
        transitional,
        subtitle: out.split('\n')[0].slice(0, 24) || null,
    };
}

// `twingate resources` prints a tab-separated table; '-' marks an empty cell.
export function parseResources(text) {
    const [header, ...rows] = text.split('\n');
    if (!header.startsWith('RESOURCE NAME\t'))
        return [];
    return rows.filter(row => row.trim()).map(row => {
        const [name, address, alias, auth] =
            row.split('\t').map(cell => cell.trim() === '-' ? '' : cell.trim());
        return {name, address, alias: alias ?? '', auth: auth ?? ''};
    });
}
