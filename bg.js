importScripts("media.js");
var blockedHosts = [];
var bypassUrls = new Map();
function updateBlockedHosts() {
    chrome.storage.local.get(['blockedHosts'], function (result) {
        blockedHosts = result.blockedHosts || [];
    });
}
updateBlockedHosts();
chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === 'local' && changes.blockedHosts) {
        updateBlockedHosts();
    }
});
function isURLBlocked(url, initiator) {
    if (!blockedHosts || blockedHosts.length === 0) return false;
    var uHost = "", iHost = "";
    try { if (url) uHost = new URL(url).hostname; } catch (e) { }
    try { if (initiator) iHost = new URL(initiator).hostname; } catch (e) { }
    return blockedHosts.some(function (block) {
        // More robust check: exact match or subdomain match
        var blockRegex = new RegExp("(^|\\.)" + block.replace(/\./g, "\\.") + "$", "i");
        return (uHost && blockRegex.test(uHost)) || (iHost && blockRegex.test(iHost));
    });
}
function updateContextMenu(tabId) {
    chrome.tabs.get(tabId, function (tab) {
        if (chrome.runtime.lastError || !tab || !tab.url) return;
        var isBlocked = isURLBlocked(tab.url);
        var title = isBlocked ? "Unblock downloads" : "Block downloads";
        chrome.contextMenus.update("NDM_BlockSite", { title: title });
    });
}
chrome.tabs.onActivated.addListener(function (activeInfo) {
    updateContextMenu(activeInfo.tabId);
});
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.active) {
        updateContextMenu(tabId);
    }
});
// ct.js 通过 sendMessage 通知 SW 写入 bypass 标记（避开 content script 的 storage 访问限制）
chrome.runtime.onMessage.addListener(function (msg, sender) {
    if (msg.action === "__ndm_bypass" && sender.tab && msg.url) {
        var url = normalizeDownloadUrl(msg.url);
        if (url) bypassUrls.set(url, Date.now() + 3000);
    }
});
function normalizeDownloadUrl(value) {
    try {
        var url = new URL(value);
        if (url.protocol !== "http:" && url.protocol !== "https:") return "";
        url.hash = "";
        return url.href;
    } catch (error) { return ""; }
}
function shouldBypassDownload(download) {
    var now = Date.now();
    for (var [url, until] of bypassUrls) if (until < now) bypassUrls.delete(url);
    var original = normalizeDownloadUrl(download.url);
    var final = normalizeDownloadUrl(download.finalUrl);
    var matched = original && bypassUrls.has(original) ? original : final && bypassUrls.has(final) ? final : "";
    if (matched) bypassUrls.delete(matched);
    return Boolean(matched);
}
var h = !1, q = RegExp("^bytes [0-9]+-[0-9]+/([0-9]+)$"), w = "object xmlhttprequest media other main_frame sub_frame image".split(" "), z = ["object", "xmlhttprequest", "media", "other"], A = RegExp("://.+/([^/]+?(?:.([^./]+?))?)(?=[?#]|$)"), aa = [301, 302, 303, 307, 308], ba = RegExp("^(?:application/x-apple-diskimage|application/download|application/force-download|application/x-msdownload|binary/octet-stream)$", "i"), B = RegExp("^(?:FLV|SWF|MP3|MP4|M4V|F4F|F4V|M4A|MPG|MPEG|MPEG4|MPE|AVI|WMV|WMA|WAV|WAVE|ASF|RM|RAM|OGG|OGV|OGM|OGA|MOV|MID|MIDI|3GP|3GPP|QT|WEBM|TS|MKV|AAC|MP2T|MPEGTS|RMVB|VTT|SRT)$",
    "i"), ca = RegExp("^(?:HTM|HTML|MHT|MHTML|SHTML|SHTM|XHT|XHTM|XHTML|XML|TXT|CSS|JS|JSON|GIF|ICO|JPEG|JPG|PNG|WEBP|BMP|SVG|TIF|TIFF|PDF|PHP|ASP|ASPX|EOT|TTF|WOF|WOFF|WOFF2|MSG|PEM|BR|OTF|ACZ|AZC|CGI|TPL|OSD|M3U8|DO|DICT)$", "i"), da = RegExp("^(?:FLV|AVI|MPG|MPE|WMV|QT|MOV|RM|RAM|WMA|MID|MIDI|AAC|MKV|RMVB)$", "i"), C = RegExp("^(?:F4F|MPEGTS|TS|MP2T)$", "i"), E = {
        "application/x-apple-diskimage": "DMG", "application/cert-chain+cbor": "MSG", "application/epub+zip": "EPUB", "application/java-archive": "JAR", "video/x-matroska": "MKV",
        "text/html": "HTML|HTM", "text/css": "CSS", "text/javascript": "JS|JSON", "text/mspg-legacyinfo": "MSI|MSP", "text/plain": "TXT|SRT", "text/srt": "SRT", "text/vtt": "VTT|SRT", "text/xml": "XML|F4M|TTML", "text/x-javascript": "JS|JSON", "text/x-json": "JSON", "application/f4m+xml": "F4M", "application/gzip": "GZ", "application/javascript": "JS", "application/json": "JSON", "application/msword": "DOC|DOCX|DOT|DOTX", "application/pdf": "PDF", "application/ttaf+xml": "DFXP", "application/vnd.apple.mpegurl": "M3U8", "application/zip": "ZIP",
        "application/x-7z-compressed": "7Z", "application/x-aim": "PLJ", "application/x-compress": "Z", "application/x-compress-7z": "7Z", "application/x-compressed": "ARJ", "application/x-gtar": "TAR", "application/x-msi": "MSI", "application/x-msp": "MSP", "application/x-gzip": "GZ", "application/x-gzip-compressed": "GZ", "application/x-javascript": "JS", "application/x-mpegurl": "M3U8", "application/x-msdos-program": "EXE|DLL", "application/vnd.apple.installer+xml": "MPKG", "application/x-ole-storage": "MSI|MSP", "application/x-rar": "RAR",
        "application/x-rar-compressed": "RAR", "application/x-sdlc": "EXE|SDLC", "application/x-shockwave-flash": "SWF", "application/x-silverlight-app": "XAP", "application/x-subrip": "SRT", "application/x-tar": "TAR", "application/x-zip": "ZIP", "application/x-zip-compressed": "ZIP", "video/3gpp": "3GP|3GPP", "video/3gpp2": "3GP|3GPP", "video/avi": "AVI", "video/f4f": "F4F", "video/f4m": "F4M", "video/flv": "FLV", "video/mp2t": "TS|M3U8", "video/mp4": "MP4|M4V", "video/mpeg": "MPG|MPEG|MPE", "video/mpegurl": "M3U8|M3U", "video/mpg4": "MP4|M4V",
        "video/msvideo": "AVI", "video/quicktime": "MOV|QT", "video/webm": "WEBM", "video/x-flash-video": "FLV", "video/x-flv": "FLV", "video/x-mp4": "MP4|M4V", "video/x-mpegurl": "M3U8|M3U", "video/x-mpg4": "MP4|M4V", "video/x-ms-asf": "ASF", "video/x-ms-wmv": "WMV", "video/x-msvideo": "AVI", "audio/3gpp": "3GP|3GPP", "audio/3gpp2": "3GP|3GPP", "audio/mp3": "MP3", "audio/mp4": "M4A|MP4", "audio/mp4a-latm": "M4A|MP4", "audio/mpeg": "MP3", "audio/mpeg4-generic": "M4A|MP4", "audio/mpegurl": "M3U8|M3U", "image/svg+xml": "SVG|SVGZ", "audio/webm": "WEBM",
        "audio/wav": "WAV", "audio/x-mpeg": "MP3", "audio/x-mpegurl": "M3U8|M3U", "audio/x-ms-wma": "WMA", "audio/x-wav": "WAV", "ilm/tm": "MP3", "image/gif": "GIF|GFA", "image/icon": "ICO|CUR", "image/jpg": "JPG|JPEG", "image/jpeg": "JPG|JPEG", "image/png": "PNG|APNG", "image/tiff": "TIF|TIFF", "image/vnd.microsoft.icon": "ICO|CUR", "image/webp": "WEBP", "image/x-icon": "ICO|CUR", "flv-application/octet-stream": "FLV", "image/x-xbitmap": "XBM", "audio/x-mp3": "MP3", "audio/x-hx-aac-adts": "AAC", "audio/aac": "AAC", "audio/x-aac": "AAC", "application/vnd.rn-realmedia-vbr": "RMVB"
    };
function F(a) { return a && unescape(a.split(";", 1).shift().trim()) || "" } function G(a) { return (a = A.exec(a)) ? a[1] || "" : "" } function K(a) { return -1 < a.indexOf(".") ? a.split(".").pop() : "" } function ea(a) { var b; a = a.toUpperCase(); for (b in E) if (-1 < E[b].split("|").indexOf(a)) return b; return "" } function L(a, b) { if (!a) return null; for (var c = 0; c < a.length; c++)if (a[c].name.toLowerCase() == b.toLowerCase()) return a[c].value || a[c].binaryValue || null; return null }
function M() { for (var a = {}, b = 0; b < arguments.length; b++)for (var c in arguments[b]) arguments[b].hasOwnProperty(c) && (a[c] = arguments[b][c]); return a } function N(a, b) { return a && b && 0 == a.indexOf(b) } function O(a, b) { if (!a || !b) return !1; var c = a.length - b.length; return 0 <= c && a.indexOf(b, c) == c } function P(a, b) { return a && b && 0 <= a.indexOf(b) } function Q(a) { return P(a, "://") ? a.split("://", 1).shift().toLowerCase() || "" : "http" }
async function R(a, b) { var c = null, d = {}, e, f = b && b["1"] || "GET"; if (b && (e = b.o)) for (var g = 0; g < e.length; g++)N(e[g].name.toLowerCase(), "x-") && (d[e[g].name] = e[g].value); if ("POST" == f && b) { try { S(b, b), b["10"] && (d["Content-Type"] = b["10"]) } catch (m) { } b && b.postData && (c = b.postData) } try { const m = await fetch(a["2"], { method: f, credentials: "include", headers: new Headers(d), body: c }); if (m.ok) { let u = await m.text(); (a.S || function () { })(u) } } catch (m) { } }
function T() { this["1"] = "GET"; this["2"] = ""; this["3"] = ""; this["4"] = ""; this["5"] = ""; this["6"] = "normal"; this["7"] = 0; this["8"] = ""; this["9"] = ""; this["10"] = ""; this.cookies = this["11"] = ""; this.postData = null }
function U() {
    var a = this.constructor.prototype, b; for (b in a) this[b] = a[b].bind(this); this.H = {}; this.h = {}; this.m = {}; this.hlsSeen = new Map(); this.hlsProbes = new Map(); this.nextHlsProbe = 1; this.sentMedia = new Map(); this.pendingMedia = new Map(); this.fa = 1; this.u = ""; this.C = !1; chrome.contextMenus.removeAll(); chrome.contextMenus.create({ title: "Download", id: "NDM_CtxMenu", contexts: ["link", "image"] }); chrome.contextMenus.create({ id: "NDM_BlockSite", title: "Block downloads", contexts: ["all"] }); this.j(chrome.contextMenus.onClicked, this.W); this.j(chrome.downloads.onCreated, this.X); this.j(chrome.runtime.onConnect, this.Z); this.j(chrome.webRequest.onBeforeRequest, this.T, {
        urls: ["http://*/*", "https://*/*", "ftp://*/*"],
        types: w
    }, ["requestBody"]); this.j(chrome.webRequest.onBeforeSendHeaders, this.U, { urls: ["https://*/*", "http://*/*"], types: w }, ["requestHeaders"]); this.j(chrome.webRequest.onHeadersReceived, this.V, { urls: ["<all_urls>"], types: w }, ["responseHeaders"]); this.j(chrome.webRequest.onCompleted, this.N, { urls: ["<all_urls>"] }); this.j(chrome.webRequest.onErrorOccurred, this.N, { urls: ["<all_urls>"] }); this.j(chrome.webNavigation.onHistoryStateUpdated, this.Y); chrome.action.onClicked.addListener(this.M); this.v = !1; chrome.action.setBadgeBackgroundColor({ color: "#FF3333" });
    this.M(); var c = this; this.F = !0; chrome.storage.local.get(["ShowMediaPanel"], function (d) { -1 == d.ShowMediaPanel && (c.F = !1) }); this.i = this.G = null; this.D = !1; this.L()
} var V = U.prototype; V.M = function () { var a = (this.v = !this.v) ? "" : "Off"; chrome.action.setTitle({ title: this.v ? "" : "Download catcher is Off\r\nClick to toggle catching" }); chrome.action.setBadgeText({ text: a }) }; V.Y = function (a) { var b = this.h[[a.tabId, a.frameId]]; b && b["2"] != a.url && (b.postMessage([11, a.url]), b["2"] = a.url) };
V.X = function (a) {
    if (shouldBypassDownload(a)) return;
    // Added early block check for downloads
    if (isURLBlocked(a.url, a.referrer) || isURLBlocked(a.finalUrl, a.referrer)) {
        return;
    }
    h || !this.v ? this.u = "" : this.u != a.finalUrl && this.u != a.url ? this.u = "" : (this.u = "", chrome.downloads.cancel(a.id), chrome.downloads.erase({ id: a.id }))
};
V.I = async function (a) {
    if (this.D) {
        var b = "1:" + a["1"] + "\r\n"; b += "2:" + a["2"] + "\r\n"; a["3"] && (b += "3:" + a["3"] + "\r\n"); b += "6:" + (a["6"] || "normal") + "\r\n"; a["4"] && (b += "4:" + a["4"] + "\r\n"); if (a.pageUrl) { var c = a.pageUrl, d = ""; c &&= c.trim(); c && (d = (new URL(c)).origin); b += "Origin: " + d + "\r\n" } if (a.pageUrl) { if (c = a.pageUrl) d = c.lastIndexOf("#"), c = 0 > d || d < c.indexOf("?") ? c : c.substr(0, d); b += "Referer: " + c + "\r\n" } a["5"] && (b += "5:" + a["5"] + "\r\n"); a.cookies && (b += "Cookie: " + a.cookies + "\r\n"); a["10"] && (b += "Content-Type: " + a["10"] +
            "\r\n"); a["11"] && (b += "Content-Disposition: " + a["11"] + "\r\n"); a["9"] && (b += "9:" + a["9"] + "\r\n"); for (var e in a) N(e.toLowerCase(), "x-") && (b += e + ": " + a[e] + "\r\n"); "POST" == a["1"] && (a["7"] && (b += "7:" + a["7"] + "\r\n"), a["8"] && (b += "8:" + a["8"] + "\r\n"), b = a.postData ? b + ("__0NeatPostData9__:" + a.postData) : b + "Content-Length: 0\r\n"); if (!(118784 < b.length)) if (a["3"]) this.G.send(b), this.i = null; else if ("POST" == a["1"] || !this.C || a["7"] && a["8"]) "POST" != a["1"] && this.C && (b += "8:" + a["8"] + "\r\n", b += "7:" + a["7"] + "\r\n"), this.G.send(b),
                this.i = null; else try { const f = await fetch(a["2"], { method: "HEAD", credentials: "include" }); f.ok && (a["8"] = a["8"] || f.headers.get("content-type") || "", a["7"] = a["7"] || f.headers.get("Content-Length") || 0, b += "8:" + a["8"] + "\r\n", b += "7:" + a["7"] + "\r\n", this.G.send(b), this.i = null) } catch (f) { }
    } else this.i = a, this.L()
}; V.L = function () { var a = new WebSocket("ws://127.0.0.1:10007/download", "neatextension.v1"); a.onopen = this.ea; a.onclose = this.ba; a.onmessage = this.da; a.onerror = this.ca; this.G = a };
V.ea = function () { this.D = !0; this.i && this.I(this.i) }; V.ba = function () { this.D = !1; this.i = null }; V.da = function (a) { a = a.data; "waiting" == a ? this.C = !0 : "nowaiting" == a ? this.C = !1 : !P(a, "Version") && N(a, "ShowPanelChrome") && (a = "1" == a.split("=")[1], a != this.F && (this.F = a, chrome.storage.local.set({ ka: a ? 1 : -1 }, function () { }), this.ga([13, a]))) }; V.ca = function () { this.D = !1; if (this.i) { var a = this; chrome.tabs.query({ currentWindow: !0, active: !0 }, function (b) { b && b.length && (b = a.h[[b[0].id, 0]]) && b.postMessage([15]) }) } this.i = null };
V.J = function (a) { if (this.i) { var b = ""; if (a && 0 < a.length) for (var c = 0; c < a.length; c++)b += a[c].name + "=" + a[c].value + (c < a.length - 1 ? "; " : ""); b = b.trim(); this.i.cookies = b; this.I(this.i) } }; V.W = function (a, b) { if (a.menuItemId === "NDM_BlockSite") return; var c = Q(a.linkUrl); !c || "ftp" != c && "http" != c && "https" != c || "ftp" == c && !G(a.linkUrl) || (c = new T, c["2"] = a.linkUrl || a.srcUrl, c.pageUrl = a.pageUrl, c["4"] = b && b.title || "", b && b.url && (c["5"] = b.url), !c["5"] && (c["5"] = a.pageUrl), this.i = c, chrome.cookies.getAll({ url: c["2"] }, this.J)) }; function W(a) { this.h = a } var X = W.prototype;
X.j = function (a) { var b = ""; if (!a) return b; if ((a = a.split(",")) && a.length) for (var c = 0; c < a.length; c++) { var d = a[c].split("="); d && 2 == d.length && ("BANDWIDTH" == d[0].toString().trim() && (b += parseInt(parseInt(d[1]) / 1024) + " Kbps "), "RESOLUTION" == d[0].toString().trim() && (b += d[1] + " ")) } return b.trim() };
X.i = function (a, text) {
    var parsed = NeatMedia.parseHls(a["2"], text);
    if (parsed) this.h.emitHls({ url: a["2"], tabId: a.tabId, frameId: a.frameId }, a["8"], parsed);
}; V.A = function (a) {
    var port = this.h[[a.tabId, a.frameId]] || this.h[[a.tabId, 0]];
    if (!a["2"]) return;
    var key = a.tabId + ":" + a.frameId + ":" + a["2"];
    if (!port) {
        this.pendingMedia.set(key, a);
        if (this.pendingMedia.size > 100) this.pendingMedia.delete(this.pendingMedia.keys().next().value);
        return;
    }
    var now = Date.now();
    if (now - (this.sentMedia.get(key) || 0) < 60000) return;
    this.sentMedia.set(key, now);
    if (this.sentMedia.size > 500) for (var entry of this.sentMedia) {
        if (now - entry[1] > 60000) this.sentMedia.delete(entry[0]);
    }
    a.id = key;
    port.postMessage([1, a, port["2"]]);
}; V.N = function (a) { delete this.m[a.requestId] };
V.probeHlsInFrame = function (request) {
    var port = this.h[[request.tabId, request.frameId]];
    if (!port) return Promise.resolve(null);
    var self = this, id = this.nextHlsProbe++;
    return new Promise(function (resolve) {
        var timer = setTimeout(function () {
            self.hlsProbes.delete(id);
            resolve({ error: "frame timeout" });
        }, 8000);
        self.hlsProbes.set(id, { port: port, resolve: resolve, timer: timer });
        try { port.postMessage([17, id, request.url]); }
        catch (error) {
            clearTimeout(timer);
            self.hlsProbes.delete(id);
            resolve({ error: "frame unavailable" });
        }
    });
};
V.processHls = async function (request, mime) {
    var key = request.tabId + ":" + request.frameId + ":" + request.url;
    var now = Date.now();
    if (now - (this.hlsSeen.get(key) || 0) < 30000) return;
    this.hlsSeen.set(key, now);
    if (this.hlsSeen.size > 500) for (var entry of this.hlsSeen) {
        if (now - entry[1] > 30000) this.hlsSeen.delete(entry[0]);
    }
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 8000);
    var parsed = null;
    try {
        var headers = new Headers();
        for (var header of request.headers || [])
            if (/^(?:x-|authorization$|accept$)/i.test(header.name) && header.value)
                headers.set(header.name, header.value);
        var response = await fetch(request.url, { credentials: "include", headers: headers, signal: controller.signal });
        var length = Number(response.headers.get("Content-Length"));
        if (response.ok && (!length || length <= 1048576)) {
            var text = await readPlaylistLimited(response, 1048576);
            if (text !== null) parsed = NeatMedia.parseHls(request.url, text);
            request.fetchError = text === null ? "too large" : parsed ? "" : "invalid playlist";
        } else request.fetchError = response.ok ? "too large" : "HTTP " + response.status;
    } catch (error) { request.fetchError = error.name === "AbortError" ? "timeout" : "fetch failed"; }
    finally { clearTimeout(timeout); }
    if (!parsed) {
        var frameResult = await this.probeHlsInFrame(request);
        if (frameResult) {
            if (frameResult.text) parsed = NeatMedia.parseHls(request.url, frameResult.text);
            if (parsed) request.fetchError = "";
            else {
                var frameError = frameResult.error || "invalid playlist";
                request.fetchError = request.fetchError && request.fetchError !== frameError ?
                    request.fetchError + " / " + frameError : frameError;
            }
        }
    }
    this.emitHls(request, mime, parsed);
};
async function readPlaylistLimited(response, limit) {
    if (!response.body || !response.body.getReader) {
        var text = await response.text();
        return text.length <= limit ? text : null;
    }
    var reader = response.body.getReader(), chunks = [], size = 0;
    try {
        while (true) {
            var chunk = await reader.read();
            if (chunk.done) break;
            size += chunk.value.byteLength;
            if (size > limit) { await reader.cancel(); return null; }
            chunks.push(chunk.value);
        }
        var bytes = new Uint8Array(size), offset = 0;
        for (var part of chunks) { bytes.set(part, offset); offset += part.byteLength; }
        return new TextDecoder().decode(bytes);
    } finally { reader.releaseLock(); }
}
V.emitHls = function (request, mime, parsed) {
    var base = { 1: "GET", 2: request.url, 6: "hls", tabId: request.tabId,
        frameId: request.frameId, fEx: "m3u8", 8: mime,
        4: parsed ? "HLS playlist" : "HLS playlist · unverified" };
    if (request.headers) Y({ o: request.headers }, base);
    if (!parsed || !parsed.variants.length) {
        if (parsed) {
            base["4"] = NeatMedia.mediaLabel(parsed);
            base.fDu = parsed.duration ? Math.round(parsed.duration) + " sec" : "";
        }
        this.A(base);
        return;
    }
    if (Object.keys(parsed.audio).length || Object.keys(parsed.subtitles).length)
        this.A(Object.assign({}, base, { 4: "HLS master · alternate tracks" }));
    for (var variant of parsed.variants) {
        var label = NeatMedia.variantLabel(variant);
        this.A(Object.assign({}, base, { 2: variant.url, 4: label }));
    }
};
function fa(a, b) {
    if (!a) return null; var c = a.raw; if (c) { a = ""; for (b = 0; b < c.length; b++) { var d = c[b].bytes; if (!d) return null; d = new Uint8Array(d); for (var e = d.length, f = 0; f < e; f++)a += String.fromCharCode(d[f]) } return a } c = a.formData; if (!c) return null; e = F(b); a = []; e &&= e.toLowerCase(); if ("application/x-www-form-urlencoded" == e) { for (d in c) for (e = c[d], d = d.split(" ").map(encodeURIComponent).join("+"), b = 0; b < e.length; b++)a.length && a.push("&"), a.push(d, "=", e[b].split(" ").map(encodeURIComponent).join("+")); return a.join("") } if ("multipart/form-data" ==
        e) { (f = Z(b, "boundary")) || (f = "----WebKitFormBoundary" + Math.random().toString(36).substr(2)); for (d in c) for (e = c[d], b = 0; b < e.length; b++)a.push("--", f, '\r\nContent-Disposition: form-data; name="', d, '"\r\n\r\n', e[b], "\r\n"); a.push("--", f, "--\r\n"); return a.join("") } return null
}
V.V = function (a) {
    if (isURLBlocked(a.url, a.initiator)) return; var b, c = a.requestId, d = this; if (b = this.m[c]) {
        var e = a.url, f = a.type, g = 0 <= z.indexOf(f), m = a.method.toUpperCase(), u = Q(e); if (!u || "http" != u && "https" != u || "GET" != m && "POST" != m) delete this.m[c]; else {
            b.B = a.responseHeaders; var n = L(b.B, "Content-Type"), p = F(n).toLowerCase();
            var mediaKind = NeatMedia.kind(a.url, p);
            if (mediaKind === "segment") {
                delete this.m[c]; return;
            }
            if (mediaKind === "hls") {
                delete this.m[c];
                if ((a.statusCode === 200 || a.statusCode === 206) && a.method === "GET")
                    this.processHls({ url: a.url, tabId: a.tabId, frameId: a.frameId, headers: b.o }, n);
                return;
            }
            if ("image" == f && p && N(p.toLowerCase(), "image/")) delete this.m[c]; else {
                var r = L(b.B, "Content-Disposition"), k = "attachment" == F(r).toLowerCase(); a = parseInt(a.statusLine.split(" ", 2).pop()) || 0; b.ha = 0 <= aa.indexOf(a); if (!b.ha) {
                    if (200 == a ||
                        206 == a) {
                        a = L(b.B, "Content-Length"); var l = L(b.B, "Content-Range"), x = null; l && (l = q.exec(l)) && (a = l[1]); a && (x = parseInt(a)); if (0 !== x) if (b["2"] = e, b["8"] = n, b["7"] = x, b.type = f, b.protocol = u, b["1"] = m, b.R = O(f, "_frame"), f = new URL(e), e = f.hostname, f = f.pathname, (m = f.split("/").pop().trim()) && (m = m.split("?").shift().trim()), b.l = m || "", b.s = K(b.l), b.K = Z(r, "filename") || Z(n, "name"), b.P = b.K && K(b.K) || "", n = p ? E[p] : !1, b.O = (n ? n.split("|").shift() : "").toLowerCase(), b.g = b.O || b.P || b.s || "", b.fileName = b.K || b.l || "", b.fileName && (n = b.fileName.lastIndexOf("."),
                            -1 < n && (b.fileName = b.fileName.substr(0, n).trim())), b.fileName && b.g && (b.fileName += "." + b.g), !p && b.g && (p = ea(b.g)), n = "main_frame" == b.type && B.test(b.g) && !C.test(b.g), r = ["js", "txt", "dict"], r = -1 < r.indexOf(b.g) || -1 < r.indexOf(b.s), P(b.l.toLowerCase(), "manif") || P(b.l.toLowerCase(), "favicon.ico") || P(b.l.toLowerCase(), "pem.msg") || O(b.l.toLowerCase(), ".wasm") || P(b.l.toLowerCase(), ".json") || P(b.O.toLowerCase(), "json") || P(b.P.toLowerCase(), "json") || O(b.l.toLowerCase(), ".dict") || !(n || "other" == b.type && B.test(b.g) ||
                                (b.R || !g) && da.test(b.g) || (b.R || "other" == b.type) && (k && !r || ba.test(p) || b.g && !B.test(b.g) && !ca.test(b.g)))) {
                            k = "vtt" == b.g.toLowerCase() || "vtt" == b.s.toLowerCase() || "srt" == b.g.toLowerCase() || "srt" == b.s.toLowerCase(); var H = null; "m3u8" == b.g.toLowerCase() || "m3u8" == b.s.toLowerCase() ? H = new W(this) : k || "POST" == b["1"] || "txt" != b.g.toLowerCase() && "txt" != b.s.toLowerCase() || "xmlhttprequest" != b.type || b["7"] && 307200 < b["7"] || (H = new W(this));
                            if (H) R({ 2: b["2"], S: function (t) { H.i(M({}, b), t) } }, M({}, b)); else if (g && "player.vimeo.com" == e && N(f, "/video/") && "application/json" == p) R({ 2: b["2"], S: function (t) { var y = null; try { y = JSON.parse(t) } catch (D) { } if (y) { var I = y.request.files.progressive; I && setTimeout(function () { for (var D = 0; D < I.length; D++)d.A({ 1: "GET", 2: I[D].url, 6: "media", tabId: b.tabId, frameId: b.frameId, fEx: "mp4", 4: "MP4 File " + I[D].quality }) }, 2500) } } }, b); else if ((g || k) && (B.test(b.g) || B.test(b.s)) && !C.test(b.g) && !("ASF" ==
                                b.g && 256E4 >= b["7"]) && "DCLK-AdSvr" != L(b.B, "Server")) { var J = { 2: b["2"], 6: "media", 1: b["1"], tabId: b.tabId, frameId: b.frameId, fEx: B.test(b.g) ? b.g : b.s, 7: b["7"], 8: b["8"], fS: b["7"], fileName: b.fileName }; "POST" == J["1"] && S(b, J); Y(b, J); setTimeout(function () { d.A(J) }, 2E3) }
                        } else if (h || !this.v) this.u = ""; else {
                            this.u = b["2"]; g = d.h[[b.tabId, b.frameId]]; p = d.h[[b.tabId, 0]]; var v = M(new T, { 2: b["2"], 1: b["1"], 4: p && p["4"] || g && g["4"], 5: p && p["2"] || g && g["2"], 7: b["7"], 8: b["8"], pageUrl: g && g["2"] || b["2"] }); chrome.tabs.query({
                                active: !0,
                                currentWindow: !0
                            }, function (t) { if (t && t.length && (b["2"] == t[0].pendingUrl || b["2"] == t[0].url) && !v["5"] && t[0].openerTabId) { var y = d.h[[t[0].openerTabId, 0]]; v["5"] = y && y["2"]; v["4"] = y && y["4"]; B.test(b.g) && (chrome.tabs.remove(t[0].id), v["6"] = "media") } }); "POST" == v["1"] && S(b, v); Y(b, v); d.i = v; chrome.cookies.getAll({ url: v["2"] }, d.J)
                        }
                    } delete this.m[c]
                }
            }
        }
    }
};
function S(a, b) { var c = L(a.o, "Content-Type"), d = L(a.o, "Content-Disposition"); a = fa(a.ja, c); if (!a || 1 > a.length) a = null; b.postData = a; c && (b["10"] = c.trim()); d && (b["11"] = d.trim()) } function Y(a, b) { if (a.o) for (var c = 0; c < a.o.length; c++)N(a.o[c].name.toLowerCase(), "x-") && (b[a.o[c].name] = a.o[c].value) } V.U = function (a) { if (!(0 > a.tabId || 0 > a.frameId)) { var b = this.m[a.requestId]; b && (b.o = a.requestHeaders) } };
V.T = function (a) {
    // Added early block check
    if (isURLBlocked(a.url, a.initiator)) return ;
    if (!(0 > a.tabId || 0 > a.frameId)) if ("ftp" == Q(a.url)) { if (G(a.url) && !h) { var b = new T, c = this.h[[a.tabId, 0]]; c && c["2"] && (b["5"] = c["2"], b.pageUrl = c["2"]); c && c["4"] && (b["4"] = c["4"]); b["2"] = a.url; this.I(b) } } else b = a.requestId, c = this.m[b] || { id: b, 2: a.url, tabId: a.tabId, frameId: a.frameId }, "POST" == a.method.toUpperCase() && (c.ja = a.requestBody), this.m[b] = c
};
function Z(a, b) { if (!a) return null; b = b.toLowerCase(); a = a.split(";"); a.shift(); for (var c = 0; c < a.length; c++) { var d = a[c], e = d.indexOf("="); if (0 < e) { var f = d.substr(0, e).trim().toLowerCase(), g = "*" == f[f.length - 1]; g && (f = f.substr(0, f.length - 1).trimRight()); if (f == b) return a = d.substr(e + 1).trim(), c = a.length - 1, '"' == a[0] && '"' == a[c] && (a = a.substring(1, c)), g && (a = a.split("'", 3).pop()), unescape(a) } else if (0 > e && d.trim().toLowerCase() == b) return "" } return null } V.j = function (a) { a.addListener.apply(a, Array.prototype.slice.call(arguments).slice(1)) };
V.Z = function (a) { var b = a.sender.tab; if (b && 0 <= b.id) { var c = a.sender.frameId, d = a.id || this.fa++, e = b.id; a.id = d; a["4"] = b.title; a.tabId = e; a.frameId = c; a.ia = 0 == c; a["2"] = a.sender.url || a.ia && b.url || null; a.onMessage.addListener(this.aa.bind(this, a)); a.onDisconnect.addListener(this.$.bind(this, a)); this.H[d] = a; this.h[[e, c]] = a; a.postMessage([3, a.id]); a.postMessage([13, this.F]); a.sender = null; for (var [key, media] of this.pendingMedia) if (media.tabId === e && (media.frameId === c || c === 0)) { this.pendingMedia.delete(key); this.A(media); } } };
V.aa = function (a, b) {
    switch (b[0]) {
        case 18:
            var probe = this.hlsProbes.get(b[1]);
            if (probe && probe.port === a) {
                clearTimeout(probe.timer);
                this.hlsProbes.delete(b[1]);
                probe.resolve({ text: typeof b[2] === "string" && b[2].length <= 1048576 ? b[2] : "",
                    error: b[3] || "too large" });
            }
            break;
        case 2:
            var c = b[2], d = b[3];
            (a = this.H[b[1]]) && c && (a["2"] = c);
            a && d && (a["4"] = d);
            break;
        case 4: h = b[1]; break;
        case 6:
            c = b[1];
            var tabId = a.tabId, topPort = this.h[[tabId, 0]], e = new T;
            e["1"] = c["1"] || "GET";
            e["2"] = c["2"];
            c["3"] && (e["3"] = c["3"]);
            e.pageUrl = b[2];
            e["4"] = b[3] || topPort && topPort["4"] || "";
            e["5"] = topPort && topPort["2"] || e.pageUrl;
            e["9"] = b[4];
            c["7"] && (e["7"] = c["7"]);
            c["8"] && (e["8"] = c["8"]);
            e["6"] = c["6"] || "media";
            if (c.fEx && /^(vtt|srt)$/i.test(c.fEx)) e["6"] = "normal";
            c.postData && (e.postData = c.postData);
            c["10"] && (e["10"] = c["10"]);
            c["11"] && (e["11"] = c["11"]);
            for (d in c) N(d.toLowerCase(), "x-") && (e[d] = c[d]);
            var self = this;
            function send() {
                self.i = e;
                chrome.cookies.getAll({ url: e["2"] }, self.J);
            }
            if (!e["3"] && (e["6"] === "hls" || /^ts$/i.test(c.fEx || ""))) {
                chrome.tabs.get(tabId, function (tab) {
                    var titles = (Array.isArray(b[5]) ? b[5] : []).concat([
                        tab && tab.title, topPort && topPort["4"], b[3]
                    ]);
                    var filename = NeatMedia.hlsFilename(titles);
                    if (filename) {
                        // Field 3 is an explicit output filename and changes the native
                        // download path. Field 4 already supplies NDM's suggested title.
                        e["4"] = filename.slice(0, -3);
                    }
                    send();
                });
            } else send();
            break;
    }
}; V.$ = function (a) { void chrome.runtime.lastError; for (var b in this.h) this.h[b] == a && delete this.h[b]; for (var [id, probe] of this.hlsProbes) if (probe.port === a) { clearTimeout(probe.timer); this.hlsProbes.delete(id); probe.resolve({ error: "frame unavailable" }); } delete this.H[a.id] }; V.la = function (a, b) { var c = this.h; a = a.toString() + ","; for (var d in c) N(d, a) && c[d].postMessage(b) }; V.ga = function (a) { var b = this.h, c; for (c in b) b[c].postMessage(a) }; new U;
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "NDM_BlockSite") {
        var url = tab.url;
        try {
            var hostname = new URL(url).hostname;
            if (hostname) {
                chrome.storage.local.get(["blockedHosts"], function (result) {
                    var hosts = result.blockedHosts || [];
                    var index = hosts.indexOf(hostname);
                    if (index !== -1) { hosts.splice(index, 1); }
                    else { hosts.push(hostname); }
                    // 同步更新内存中的 blockedHosts，确保 updateContextMenu 读到最新值
                    blockedHosts = hosts;
                    chrome.storage.local.set({ blockedHosts: hosts }, function () {
                        updateContextMenu(tab.id);
                    });
                });
            }
        } catch (e) { console.error(e); }
    }
});
