const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function setup(playlist = '#EXTM3U\n#EXTINF:4,\nseg.ts\n#EXT-X-ENDLIST', connect = true, fetchOverride,
    pageUrl = 'https://example.test/', tabTitle = 'Actual Video') {
    const callbacks = {};
    const event = name => ({ addListener(fn) { (callbacks[name] ||= []).push(fn); } });
    const sent = [], wire = [];
    let socket;
    const chrome = {
        storage: { local: { get(_keys, fn) { fn({}); }, set(_value, fn) { fn?.(); } },
            onChanged: event('storageChanged') },
        runtime: { onMessage: event('runtimeMessage'), onConnect: event('connect') },
        tabs: { onActivated: event('tabActivated'), onUpdated: event('tabUpdated'),
            get(_id, fn) { fn({ title: tabTitle, url: pageUrl }); } },
        cookies: { getAll(_options, fn) { fn([]); } },
        contextMenus: { removeAll() {}, create() {}, update() {}, onClicked: event('menuClick') },
        downloads: { onCreated: event('downloadCreated') },
        webRequest: { onBeforeRequest: event('beforeRequest'),
            onBeforeSendHeaders: event('beforeHeaders'), onHeadersReceived: event('headers'),
            onCompleted: event('completed'), onErrorOccurred: event('error') },
        webNavigation: { onHistoryStateUpdated: event('history') },
        action: { onClicked: event('actionClick'), setTitle() {}, setBadgeText() {}, setBadgeBackgroundColor() {} }
    };
    const context = vm.createContext({ chrome, URL, Map, AbortController, Headers,
        setTimeout: (fn, delay) => setTimeout(fn, Math.min(delay, 10)), clearTimeout,
        WebSocket: class { constructor() { socket = this; } send(message) { wire.push(message); } },
        fetch: fetchOverride || (async url => ({ ok: true, headers: { get: () => null }, text: async () =>
            url.endsWith('.m3u8') ? playlist : '' })) });
    context.importScripts = file => vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'bg.js'), 'utf8'), context);
    const port = { sender: { tab: { id: 1, title: 'test', url: pageUrl },
        frameId: 0, url: pageUrl }, onMessage: event('portMessage'),
        onDisconnect: event('disconnect'), postMessage(message) { sent.push(message); } };
    if (connect) callbacks.connect[0](port);
    return { callbacks, sent, wire, context, port, connect: () => callbacks.connect[0](port),
        openNative: () => socket.onopen(), nativeWaiting: () => socket.onmessage({ data: 'waiting' }) };
}

test('reads the Port disconnect error while clearing a cached page connection', () => {
    const { callbacks, context, port } = setup();
    let reads = 0;
    Object.defineProperty(context.chrome.runtime, 'lastError', { get() {
        reads++;
        return { message: 'The page keeping the extension port is moved into back/forward cache' };
    } });
    callbacks.disconnect[0](port);
    assert.equal(reads, 1);
});

function request(callbacks, id, url, type, contentType, length, method = 'GET') {
    const base = { requestId: id, url, tabId: 1, frameId: 0, type,
        method, initiator: 'https://example.test/' };
    callbacks.beforeRequest[0](base);
    callbacks.headers[0]({ ...base, statusCode: 200, statusLine: 'HTTP/1.1 200 OK',
        responseHeaders: [{ name: 'Content-Type', value: contentType },
            { name: 'Content-Length', value: String(length) }] });
}

test('records synchronously, sends playlist address, and ignores fragments', async () => {
    const { callbacks, sent } = setup();
    request(callbacks, 'hls', 'https://cdn.test/media.m3u8', 'xmlhttprequest',
        'application/vnd.apple.mpegurl', 100);
    request(callbacks, 'segment', 'https://cdn.test/seg.ts', 'media', 'video/mp2t', 300);
    await new Promise(resolve => setTimeout(resolve, 20));
    const candidates = sent.filter(message => message[0] === 1).map(message => message[1]);
    assert.deepEqual(candidates.map(candidate => candidate['2']), ['https://cdn.test/media.m3u8']);
    assert.equal(candidates[0]['6'], 'hls');
});

test('small complete MP4 remains discoverable', async () => {
    const { callbacks, sent } = setup();
    request(callbacks, 'small', 'https://cdn.test/short.mp4', 'media', 'video/mp4', 40000);
    await new Promise(resolve => setTimeout(resolve, 20));
    const candidates = sent.filter(message => message[0] === 1).map(message => message[1]);
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0]['2'], 'https://cdn.test/short.mp4');
});

test('HLS master preserves a choice containing alternate audio', async () => {
    const playlist = [
        '#EXTM3U',
        '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="a",NAME="English",LANGUAGE="en",URI="audio.m3u8"',
        '#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1280x720,AUDIO="a"',
        'video.m3u8'
    ].join('\n');
    const { callbacks, sent } = setup(playlist);
    request(callbacks, 'master', 'https://cdn.test/master.m3u8', 'xmlhttprequest',
        'application/vnd.apple.mpegurl', 300);
    await new Promise(resolve => setTimeout(resolve, 20));
    const candidates = sent.filter(message => message[0] === 1).map(message => message[1]);
    assert.deepEqual(candidates.map(candidate => candidate['2']),
        ['https://cdn.test/master.m3u8', 'https://cdn.test/video.m3u8']);
    assert.match(candidates[1]['4'], /1280×720/);
    assert.match(candidates[1]['4'], /audio: en/);
});

test('candidate discovered before content script connects is delivered later', async () => {
    const { callbacks, sent, connect } = setup(undefined, false);
    request(callbacks, 'early', 'https://cdn.test/early.m3u8', 'xmlhttprequest',
        'application/vnd.apple.mpegurl', 100);
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(sent.length, 0);
    connect();
    assert.equal(sent.filter(message => message[0] === 1).length, 1);
});

test('parses a playlist through the originating frame when worker fetch is rejected', async () => {
    const { callbacks, sent } = setup(undefined, true,
        async () => ({ ok: false, status: 403, headers: { get: () => null } }));
    request(callbacks, 'protected', 'https://cdn.test/protected.m3u8',
        'xmlhttprequest', 'application/vnd.apple.mpegurl', 120);
    await new Promise(resolve => setImmediate(resolve));
    const probe = sent.find(message => message[0] === 17);
    assert.equal(probe[2], 'https://cdn.test/protected.m3u8');
    callbacks.portMessage[0]([18, probe[1],
        '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=2000000,RESOLUTION=1280x720\nvideo.m3u8', '']);
    await new Promise(resolve => setImmediate(resolve));
    const candidates = sent.filter(message => message[0] === 1).map(message => message[1]);
    assert.equal(candidates.length, 1);
    assert.match(candidates[0]['4'], /1280×720/);
    assert.equal(candidates[0]['2'], 'https://cdn.test/video.m3u8');
});

test('keeps a concise label and the original URL when both playlist reads fail', async () => {
    const { callbacks, sent } = setup(undefined, true,
        async () => ({ ok: false, status: 403, headers: { get: () => null } }));
    request(callbacks, 'blocked', 'https://cdn.test/blocked.m3u8',
        'xmlhttprequest', 'application/vnd.apple.mpegurl', 120);
    await new Promise(resolve => setImmediate(resolve));
    const probe = sent.find(message => message[0] === 17);
    callbacks.portMessage[0]([18, probe[1], '', 'frame fetch failed']);
    await new Promise(resolve => setImmediate(resolve));
    const candidate = sent.find(message => message[0] === 1)[1];
    assert.equal(candidate['2'], 'https://cdn.test/blocked.m3u8');
    assert.equal(candidate['4'], 'HLS playlist · unverified');
});

test('modifier bypass applies only to the activated link', () => {
    const { callbacks, context } = setup();
    callbacks.runtimeMessage[0]({ action: '__ndm_bypass', url: 'https://cdn.test/file.mp4#section' },
        { tab: { id: 1 } });
    assert.equal(context.shouldBypassDownload({ url: 'https://cdn.test/file.mp4' }), true);
    assert.equal(context.shouldBypassDownload({ url: 'https://cdn.test/other.mp4' }), false);
});

test('YouTube range fragments are not offered as files', async () => {
    const { callbacks, sent } = setup();
    request(callbacks, 'range',
        'https://rr1.googlevideo.com/videoplayback?mime=video%2Fmp4&range=0-499',
        'media', 'video/mp4', 500);
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(sent.filter(message => message[0] === 1).length, 0);
});

test('YouTube SABR playback is not offered as a file or status panel', () => {
    const { callbacks, sent } = setup(undefined, true, undefined,
        'https://www.youtube.com/watch?v=example');
    request(callbacks, 'sabr', 'https://rr1.googlevideo.com/videoplayback?sabr=1&rn=2',
        'xmlhttprequest', 'application/vnd.yt-ump', 4096, 'POST');
    assert.equal(sent.filter(message => message[0] === 17).length, 0);
    assert.equal(sent.filter(message => message[0] === 1).length, 0);
});

test('HLS download suggests the top tab title without forcing a filename', async () => {
    const headRequests = [];
    const { callbacks, wire, openNative, nativeWaiting } = setup(undefined, true,
        async (_url, options) => {
            headRequests.push(options.method);
            return { ok: true, headers: { get(name) {
                return name === 'content-type' ? 'application/vnd.apple.mpegurl' : '100';
            } } };
        },
        'https://site.test/watch/42', '真正的视频名称 - 站点');
    openNative();
    nativeWaiting();
    callbacks.portMessage[0]([6, { 1: 'GET', 2: 'https://cdn.test/master.m3u8',
        6: 'hls', fEx: 'm3u8' }, 'https://player.test/embed/42', 'Embed',
        'HLS playlist', ['Video player']]);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(wire.length, 1);
    assert.doesNotMatch(wire[0], /(?:^|\r\n)3:/);
    assert.match(wire[0], /4:真正的视频名称 - 站点\r\n/);
    assert.deepEqual(headRequests, ['HEAD']);
});
