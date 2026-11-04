// Pure media classification and HLS parsing shared by the service worker and tests.
var NeatMedia = (function () {
    function attributes(input) {
        var result = {}, pattern = /([A-Z0-9-]+)=("(?:[^"\\]|\\.)*"|[^,]*)/g, match;
        while ((match = pattern.exec(input || ""))) {
            result[match[1]] = match[2][0] === '"' ? match[2].slice(1, -1) : match[2];
        }
        return result;
    }

    function kind(url, mime) {
        var path = "";
        try {
            var parsed = new URL(url);
            path = parsed.pathname.toLowerCase();
            if (path.endsWith('/videoplayback') &&
                /(^|\.)googlevideo\.com$/i.test(parsed.hostname) &&
                parsed.searchParams.has('sabr')) return "segment";
            if (path.endsWith('/videoplayback') &&
                (parsed.searchParams.has('range') || parsed.searchParams.has('sq'))) return "segment";
        } catch (e) { }
        mime = (mime || "").split(";", 1)[0].trim().toLowerCase();
        if (/\.(m3u8|m3u)$/.test(path) || /^(application\/(vnd\.apple\.mpegurl|x-mpegurl)|audio\/(mpegurl|x-mpegurl)|video\/(mpegurl|x-mpegurl))$/.test(mime)) return "hls";
        if (/\.(m4s|cmfv|cmfa|mp2t|ts)$/.test(path) || /^(video\/(mp2t|iso\.segment)|audio\/(mp2t|iso\.segment))$/.test(mime)) return "segment";
        return "";
    }

    function hlsFilename(titles) {
        for (var raw of titles || []) {
            if (typeof raw !== "string") continue;
            var name = raw.replace(/[\x00-\x1f\x7f\\/:*?"<>|]/g, " ")
                .replace(/\s+/g, " ").trim()
                .replace(/\.(?:m3u8|mp4|webm|ts)$/i, "")
                .replace(/[. ]+$/g, "");
            if (!name || /^(?:(?:watch|play) )?(?:embed|video|media)(?: player)?$|^(?:player|untitled|index|master)$/i.test(name))
                continue;
            var safe = "", bytes = 0;
            for (var character of name) {
                var code = character.codePointAt(0);
                var width = code <= 0x7f ? 1 : code <= 0x7ff ? 2 : code <= 0xffff ? 3 : 4;
                if (bytes + width > 240) break;
                safe += character;
                bytes += width;
            }
            safe = safe.replace(/[. ]+$/g, "");
            if (safe) return safe + ".ts";
        }
        return "";
    }

    function bitrate(bits) {
        return bits ? (bits / 1000000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "") + " Mb/s" : "";
    }

    function codecNames(codecs) {
        var names = [];
        for (var codec of (codecs || "").split(",")) {
            codec = codec.trim();
            var name = /^(?:avc1|avc3)/i.test(codec) ? "H.264" :
                /^(?:hvc1|hev1)/i.test(codec) ? "H.265" :
                /^av01/i.test(codec) ? "AV1" : /^vp0?9/i.test(codec) ? "VP9" :
                /^mp4a\.40\./i.test(codec) ? "AAC" : /^ec-3/i.test(codec) ? "E-AC-3" :
                /^ac-3/i.test(codec) ? "AC-3" : /^opus/i.test(codec) ? "Opus" : codec;
            if (name && !names.includes(name)) names.push(name);
        }
        return names.join("+");
    }

    function variantLabel(variant) {
        var parts = ["HLS", variant.resolution ? variant.resolution.replace("x", "×") : ""];
        if (variant.averageBandwidth) parts.push(bitrate(variant.averageBandwidth) + " avg");
        if (variant.bandwidth) parts.push(bitrate(variant.bandwidth) + " peak");
        if (variant.frameRate) parts.push(variant.frameRate + " fps");
        if (variant.videoRange) parts.push(variant.videoRange);
        if (variant.codecs) parts.push(codecNames(variant.codecs));
        if (variant.audio.length) parts.push("audio: " + variant.audio.map(function (track) {
            return track.language || track.name;
        }).join(", "));
        if (variant.subtitles.length) parts.push("subs: " + variant.subtitles.map(function (track) {
            return track.language || track.name;
        }).join(", "));
        return parts.filter(Boolean).join(" · ");
    }

    function mediaLabel(parsed) {
        var parts = ["HLS playlist"];
        if (parsed.duration && !parsed.live) parts.push(Math.round(parsed.duration) + " sec");
        if (parsed.segments) parts.push(parsed.segments + (parsed.segments === 1 ? " segment" : " segments"));
        if (parsed.live) parts.push("Live");
        if (parsed.fragmented) parts.push("fMP4");
        if (parsed.byterange) parts.push("Byte range");
        if (parsed.drm) parts.push("DRM");
        else if (parsed.encrypted) parts.push("Encrypted");
        return parts.join(" · ");
    }

    function parseHls(url, text) {
        var lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).map(function (line) { return line.trim(); });
        if (lines[0] !== "#EXTM3U") return null;
        var variants = [], audio = {}, subtitles = {}, pending = null;
        var duration = 0, segments = 0, encrypted = false, drm = false;
        var fragmented = false, byterange = false, live = true;
        lines.forEach(function (line) {
            if (line.indexOf("#EXT-X-MEDIA:") === 0) {
                var group = attributes(line.slice(13));
                var target = group.TYPE === "AUDIO" ? audio : group.TYPE === "SUBTITLES" ? subtitles : null;
                if (target && group["GROUP-ID"]) {
                    (target[group["GROUP-ID"]] ||= []).push({
                        name: group.NAME || "", language: group.LANGUAGE || "",
                        url: group.URI ? new URL(group.URI, url).href : null
                    });
                }
            } else if (line.indexOf("#EXT-X-STREAM-INF:") === 0) {
                pending = attributes(line.slice(18));
            } else if (pending && line && line[0] !== "#") {
                variants.push({ url: new URL(line, url).href, bandwidth: Number(pending.BANDWIDTH) || 0,
                    averageBandwidth: Number(pending["AVERAGE-BANDWIDTH"]) || 0,
                    resolution: pending.RESOLUTION || "", frameRate: Number(pending["FRAME-RATE"]) || 0,
                    videoRange: pending["VIDEO-RANGE"] || "", codecs: pending.CODECS || "",
                    audioGroup: pending.AUDIO || "", subtitleGroup: pending.SUBTITLES || "" });
                pending = null;
            } else if (line.indexOf("#EXTINF:") === 0) {
                duration += Number.parseFloat(line.slice(8)) || 0;
                segments++;
            } else if (line.indexOf("#EXT-X-MAP:") === 0) fragmented = true;
            else if (line.indexOf("#EXT-X-BYTERANGE:") === 0) byterange = true;
            else if (line.indexOf("#EXT-X-KEY:") === 0) {
                var key = attributes(line.slice(11));
                if (key.METHOD && key.METHOD !== "NONE") encrypted = true;
                if (key.KEYFORMAT && key.KEYFORMAT !== "identity") drm = true;
            } else if (line === "#EXT-X-ENDLIST") live = false;
        });
        variants.forEach(function (variant) {
            variant.audio = audio[variant.audioGroup] || [];
            variant.subtitles = subtitles[variant.subtitleGroup] || [];
        });
        return { url: url, variants: variants, audio: audio, subtitles: subtitles,
            duration: duration, segments: segments, fragmented: fragmented,
            byterange: byterange, encrypted: encrypted, drm: drm, live: live };
    }
    return { attributes: attributes, kind: kind, parseHls: parseHls,
        hlsFilename: hlsFilename, variantLabel: variantLabel, mediaLabel: mediaLabel };
})();
if (typeof module !== "undefined") module.exports = NeatMedia;
