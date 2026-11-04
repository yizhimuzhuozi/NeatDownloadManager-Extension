const assert = require('node:assert/strict');
const test = require('node:test');
const media = require('../media.js');

test('recognizes playlists and excludes common streaming fragments', () => {
    assert.equal(media.kind('https://cdn.test/master.m3u8?token=1', 'application/octet-stream'), 'hls');
    assert.equal(media.kind('https://cdn.test/master.m3u?token=1', 'application/octet-stream'), 'hls');
    assert.equal(media.kind('https://cdn.test/opaque', 'application/vnd.apple.mpegurl; charset=utf-8'), 'hls');
    assert.equal(media.kind('https://cdn.test/chunk.m4s', 'video/mp4'), 'segment');
    assert.equal(media.kind('https://cdn.test/videoplayback?range=0-999', 'video/mp4'), 'segment');
    assert.equal(media.kind('https://rr1.googlevideo.com/videoplayback?sabr=1&rn=2',
        'application/vnd.yt-ump'), 'segment');
    assert.equal(media.kind('https://cdn.test/movie.mp4', 'video/mp4'), '');
});

test('parses master playlist variants and independent audio groups', () => {
    const parsed = media.parseHls('https://cdn.test/master.m3u8', [
        '#EXTM3U',
        '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="sound",NAME="English",LANGUAGE="en",URI="a/en.m3u8"',
        '#EXT-X-STREAM-INF:BANDWIDTH=2400000,RESOLUTION=1920x1080,CODECS="avc1.4d401f,mp4a.40.2",AUDIO="sound"',
        'v/1080.m3u8'
    ].join('\n'));
    assert.equal(parsed.variants[0].url, 'https://cdn.test/v/1080.m3u8');
    assert.equal(parsed.variants[0].codecs, 'avc1.4d401f,mp4a.40.2');
    assert.equal(parsed.variants[0].audio[0].url, 'https://cdn.test/a/en.m3u8');
});

test('describes advertised HLS resolution, rates, codecs and tracks', () => {
    const parsed = media.parseHls('https://cdn.test/master.m3u', [
        '#EXTM3U',
        '#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="sound",NAME="English",LANGUAGE="en",URI="audio.m3u8"',
        '#EXT-X-MEDIA:TYPE=SUBTITLES,GROUP-ID="subs",NAME="Chinese",LANGUAGE="zh",URI="subs.m3u8"',
        '#EXT-X-STREAM-INF:BANDWIDTH=3000000,AVERAGE-BANDWIDTH=2400000,RESOLUTION=1920x1080,FRAME-RATE=29.970,VIDEO-RANGE=PQ,CODECS="avc1.640028,mp4a.40.2",AUDIO="sound",SUBTITLES="subs"',
        'video.m3u8'
    ].join('\n'));
    assert.equal(parsed.variants[0].averageBandwidth, 2400000);
    assert.equal(parsed.variants[0].frameRate, 29.97);
    assert.equal(media.variantLabel(parsed.variants[0]),
        'HLS · 1920×1080 · 2.4 Mb/s avg · 3 Mb/s peak · 29.97 fps · PQ · H.264+AAC · audio: en · subs: zh');
});

test('keeps media playlist address for fMP4, byte ranges, and encryption flags', () => {
    const parsed = media.parseHls('https://cdn.test/media.m3u8', [
        '#EXTM3U', '#EXT-X-MAP:URI="init.mp4"',
        '#EXT-X-KEY:METHOD=SAMPLE-AES,KEYFORMAT="com.example.drm"',
        '#EXTINF:4.0,', '#EXT-X-BYTERANGE:400@0', 'part.mp4',
        '#EXT-X-ENDLIST'
    ].join('\n'));
    assert.equal(parsed.url, 'https://cdn.test/media.m3u8');
    assert.equal(parsed.duration, 4);
    assert.equal(parsed.fragmented, true);
    assert.equal(parsed.byterange, true);
    assert.equal(parsed.drm, true);
    assert.equal(parsed.live, false);
    assert.deepEqual(parsed.variants, []);
    assert.equal(media.mediaLabel(parsed), 'HLS playlist · 4 sec · 1 segment · fMP4 · Byte range · DRM');
});

test('HLS filename uses a meaningful title and removes unsafe filename characters', () => {
    assert.equal(media.hlsFilename(['Embed', 'Film: Episode 1 / HD.mp4']),
        'Film Episode 1 HD.ts');
    assert.equal(media.hlsFilename(['Player', 'Untitled']), '');
    assert.ok(Buffer.byteLength(media.hlsFilename(['影片'.repeat(100)])) <= 243);
});

