var h = chrome.runtime.getURL("img/icon16.png"), q = chrome.runtime.getURL("img/close16.png"), r = { "-1": "none", 1: "" }; function t(c) { return document.getElementById(c) } window.el = t; function u() { var c = document.location.host.toLowerCase(), e = c.length - 12; return 0 <= e && c.indexOf("facebook.com", e) == e } async function y(c) { try { const e = await fetch(c["2"], { mode: "no-cors" }); if (e.ok) { let a = await e.text(); (c.pa || function () { })(a) } } catch (e) { } }
function B(c) { var e = 0, a; var b = 0; for (a = c.length; b < a; b++) { var d = c.charCodeAt(b); e = (e << 5) - e + d; e |= 0 } return e } function C(c) { return !c || 0 > c ? " " : 1E3 > c ? c + " Bytes" : 1E6 > c ? (c / 1024).toFixed(1) + " KB" : 1E9 > c ? (c / 1048576).toFixed(2) + " MB" : (c / 1073741824).toFixed(3) + " GB" } function D(c) { if (!c) return { left: 0, top: 0 }; try { var e = c.getBoundingClientRect(); return e ? { left: Math.round(e.left + window.pageXOffset), top: Math.round(e.top + window.pageYOffset) } : { left: 0, top: 0 } } catch (a) { return { left: 0, top: 0 } } }
function K(c) { return c ? !c.fEx || "VTT" != c.fEx.toUpperCase() && "SRT" != c.fEx.toUpperCase() ? c["4"] || (c.fEx.toUpperCase() || "MP4") + " File  " + (C(c.fS) || c.fDu) : c.fEx.toUpperCase() + " Subtitles File " + (c.fS ? C(c.fS) : " ") : "Media File" } function L(c, e, a) { this.v = c; c.h[a] = this; this.oa = a; this.H = "neatTable" + a; this.L = "neatHCell" + a; this.g = null; this.l = e; this.i = null; this.position = { left: 0, top: 0 }; this.A = -1; this.items = []; this.O = this.N = 0; this.o = this.u = !1 } var M = L.prototype;
M.B = function (c) { var e = Array.prototype.slice.call(arguments); e[2] = e[2].bind(this); c.addEventListener.apply(c, e.slice(1)) }; M.s = function () { this.g && (this.g.style.left = this.position.left + "px", this.g.style.top = this.position.top + "px", this.g.style.zIndex += 500) }; M.S = function (c) { this.I(!0); this.v.ia(this.items[c]) }; M.I = function (c) { if (!c || -1 != this.A) { var e = t(this.H).rows; this.A = c ? -1 : -this.A; for (c = 1; c < e.length; c++)e[c].style.display = r[this.A] } };
M.F = function (c) {
    var e = this, a = t(this.H), b = this.v.K(this.items[c]); var d = a.insertRow(-1); d.cssText = "all:revert;padding:0px;margin:0px;width:100%;line-height:100% !important;height:19px !important"; d.style.display = r[e.A]; a = d.insertCell(0); a.style.cssText = "all:revert;letter-spacing:normal;line-height:100% !important;width:100%;height:19px !important;margin:0px;padding:0px;padding-left:5px;vertical-align:middle;color:black !important;cursor:default;border:dotted 1px black;background:#c9dff2 !important;direction:ltr;text-align:left;font-family:tahoma !important;font-style:normal;font-weight:bold;font-size:7pt !important";
    b = K(b); if (0 == c && 1 == this.items.length) {
        d = document.createElement("TABLE"); d.style.cssText = "all:revert;border-spacing:0px;border-collapse:separate;padding:0px;margin:0px;width:100%;border:solid 1px black;direction:ltr;line-height:100% !important"; var f = d.insertRow(-1); f.style.cssText = "all:revert;padding:0px;margin:0px;line-height:100% !important;height:19px !important"; var g = f.insertCell(-1); g.style.cssText = "all:revert;background:#c9dff2 !important;padding:0px;margin:0px;width:20px;height:19px !important;text-align:center;vertical-align:middle;line-height:100% !important";
        var k = document.createElement("IMG"); k.src = h; k.onclick = function () { alert("NeatDownloadManager Video/Audio Panel.") }; g.appendChild(k); g = f.insertCell(-1); g.id = e.L; g.style.cssText = "all:revert;letter-spacing:normal;padding:0px;margin:0px;vertical-align:middle;color:black !important;cursor:default;background:#c9dff2 !important;direction:ltr;text-align:center;font-family:tahoma !important;font-style:normal;font-weight:bold;font-size:7pt !important;height:19px !important;line-height:100% !important"; g = f.insertCell(-1);
        g.style.cssText = "all:revert;background:#c9dff2 !important;padding:0px;margin:0px;width:20px;height:19px !important;text-align:center;vertical-align:middle;line-height:100% !important"; f = document.createElement("IMG"); f.src = q; f.onclick = function () { e.g.style.display = "none" }; g.appendChild(f); a.appendChild(d); a.style.paddingLeft = "0px"; a = t(e.L); a.innerText = " " + b; a.onmouseover = function () { this.style.color = "red" }; a.onmouseout = function () { this.style.color = "black" }; a.onclick = function () { 0 == e.o && e.S(0); e.o = !1 }
    } else a.innerText =
        " " + (c + 1).toString() + "- " + b, a.onmouseover = function () { this.style.background = "white"; this.style.color = "red" }, a.onmouseout = function () { this.style.background = "#c9dff2"; this.style.color = "black" }, d.onmousedown = function () { e.S(c) }
};
M.J = function (c) {
    var e = this, a = this.v.K(c), b = null, d = this.l ? "absolute" : "fixed"; this.l && !this.u && (b = D(this.l)); b && (this.position = { left: Math.max(0, b.left - 1), top: Math.max(0, b.top - 19 - 4) }); this.g ? this.s() : (this.g = document.createElement("DIV"), this.g.style.cssText = "all:revert;padding:0px;margin:0px;position:" + d + ";z-index:100000000;width:215px;left:" + this.position.left + "px;top:" + this.position.top + "px;direction:ltr;text-align:center;background:#c9dff2 !important;line-height:100% !important;", this.g.id = "neatDiv" +
        this.oa, this.g.style.display = this.v.C ? "" : "none", document.body.appendChild(this.g), b = document.createElement("TABLE"), b.id = this.H, b.style.cssText = "all:revert;border-spacing:0px;border-collapse:separate;padding:0px;margin:0px;line-height:100% !important;direction:ltr;width:100%;", this.g.appendChild(b), this.B(e.g, "mousemove", e.ra), this.B(e.g, "mousedown", e.qa), this.B(e.g, "mouseup", e.P), this.B(e.g, "mouseout", e.sa), this.B(e.g, "mouseover", e.ta), this.i = setTimeout(function () { e.i = null; e.g.style.opacity = .45 },
            3E4)); if (!(-1 < this.items.indexOf(c))) {
                a = K(a); if (this.items.length && (" MP4 File HQ" == a || " MP4 File LQ" == a)) for (b = 0; b < this.items.length; b++)if (a == K(this.v.K(this.items[b]))) { this.items[b] = c; this.g.style.display = this.v.C ? "" : "none"; this.s(); return } this.items.push(c); c = this.items.length - 1; a = t(e.H).rows; var f; c && (f = t(e.L)); 0 == c ? this.F(0) : 1 == c ? (this.F(0), this.F(1), f.onclick = function (g) { g.stopPropagation(); g.preventDefault(); 0 == e.o && e.I(); e.o = !1 }, f.innerText = " 2 Files") : (this.F(c), f.innerText = " " + (c + 1).toString() +
                    " Files"); a[0].style.display = ""
            }
}; M.qa = function (c) { 0 == c.button && (this.u = !0, this.o = !1, this.N = c.clientX, this.O = c.clientY, c.stopPropagation(), c.preventDefault()) }; M.ra = function (c) { if (this.u) { this.I(!0); var e = c.clientX - this.N, a = c.clientY - this.O; !this.o && (this.o = e || a); this.position.left += e; this.position.top += a; this.N = c.clientX; this.O = c.clientY; this.s() } else this.o = !1 };
M.sa = function () { this.u = !1; this.i && (clearTimeout(this.i), this.i = null); var c = this; this.i = setTimeout(function () { c.g.style.opacity = .45; c.i = null }, 15E3) }; M.ta = function () { this.u = !1; this.i && (clearTimeout(this.i), this.i = null); this.g.style.opacity = 1 }; M.P = function () { this.u = !1 };
if (!window.m) {
    var blockedHosts = []; var N = function () {
        this.Y = null; this.D = {}; this.h = {}; this.M = !1; this.U = this.T = -1; this.Counter = 1; this.j = null; this.aa = 0; this.C = !0; this.ea = []; this.port = chrome.runtime.connect({ name: "neat" }); this.ba = Math.ceil(2E6 * Math.random()); this.port.onMessage.addListener(this.V.bind(this)); this.port.onDisconnect.addListener(this.W.bind(this)); chrome.storage.local.get(["blockedHosts"], function (result) { blockedHosts = result.blockedHosts || [] }); chrome.storage.onChanged.addListener(function (changes, namespace) { if (namespace === "local" && changes.blockedHosts) { blockedHosts = changes.blockedHosts.newValue || [] } }); if (u()) { var a = this; this.ma = new window.MutationObserver(function (b) { b.forEach(function (d) { a.ja(d.target) }) }); this.ma.observe(document, { childList: !0, subtree: !0 }) } this.m(window,
            "keydown", this.R, !0); this.m(window, "keyup", this.R, !0); this.m(window, "mouseup", this.P, !0); this.m(window, "resize", this.na); this.m(document, "DOMContentLoaded", this.X); this.m(document, "click", this.la)
    }; window.m = !0; M = N.prototype; M.ka = function (a, b) { b.hd && this.G({ id: B(b.hd), 1: "GET", 2: b.hd, fEx: "mp4", 4: " MP4 File HQ" }, window.location.href, a, !1); b.sd && this.G({ id: B(b.sd), 1: "GET", 2: b.sd, fEx: "mp4", 4: " MP4 File LQ" }, window.location.href, a, !1) }; M.ga = function (a) {
        for (; (a = a.parentElement) && 1 > a.querySelectorAll("video").length;);
        if (a) return a.querySelectorAll("video")[0]
    }; M.da = function (a, b) { var d = this; y({ 2: "https://www.facebook.com/video/embed?video_id=" + b, pa: function (f) { var g = /"sd_src_no_ratelimit":"(.*?)"/.exec(f), k = /"hd_src_no_ratelimit":"(.*?)"/.exec(f); g && g.length || (g = /"sd_src":"(.*?)"/.exec(f)); k && k.length || (k = /"hd_src":"(.*?)"/.exec(f)); f = { sd: g && g.length ? g[1].replace(/\\/g, "") : "", hd: k && k.length ? k[1].replace(/\\/g, "") : "" }; g = d.ga(a); void 0 !== g && d.ka(g, f) } }) }; M.ja = function (a) {
        var b = this; a = a.querySelectorAll('a[href*="/videos/"]');
        a.length && Array.from(a, function (d) { if (!d.getAttribute("NEAT_DM")) { d.setAttribute("NEAT_DM", 1); var f = d.href.match(/.*\/videos\/(\d+)\/.*/i); f && b.da(d, f[1]) } })
    }; M.K = function (a) { return this.D[a] }; M.va = function () { this.port.postMessage([2, this.Y, window.location.href, this.getTitle()]) }; M.X = function () {
        for (var a = this, b = document.getElementsByTagName("SCRIPT"), d, f, g, k = /"progressive":\s*\[/, l = 0; l < b.length; l++)if (d = b[l], 0 <= document.location.host.toLowerCase().indexOf("vimeo") && !d.src && k.test(d.innerText) && (d =
            d.innerText, f = d.indexOf('"progressive"'), !(0 > f || (g = d.indexOf("]", f), 0 > g)))) { d = d.substr(f, g - f + 1); f = null; try { f = JSON.parse("{" + d + "}") } catch (p) { } if (f) { var n = f.progressive; n && setTimeout(function () { for (var p = 0; p < n.length; p++)a.G({ id: B(n[p].url), 1: "GET", 2: n[p].url, fEx: "mp4", 4: "MP4 File " + n[p].quality }, window.location.href, null, !1) }, 2E3); break } }
    }; M.Z = function (a) { var b = this.h[a]; if (b) { try { document.body.removeChild(b.g), b.i && clearTimeout(b.i) } catch (d) { } delete this.h[a] } }; M.ia = function (a) {
        (a = this.D[a]) && this.port.postMessage([6,
            a, window.location.href, this.getTitle(), K(a)])
    }; M.fa = function (a, b) {
        var d = null, f = ["VIDEO", "AUDIO", "OBJECT", "EMBED"]; try {
            var g = document.activeElement, k = 0, l, n, p = g && 0 <= f.indexOf(g.tagName) ? g : null; p ||= (g = document.elementFromPoint(this.T, this.U)) && 0 <= f.indexOf(g.tagName) ? g : null; for (var v = 0; v < f.length; v++) {
                for (var E = document.getElementsByTagName(f[v]), z = 0; z < E.length; z++)if (g = E[z], 3 != v || "application/x-shockwave-flash" == g.type.toLowerCase()) {
                    var A = g.src || g.data; if (A && (A == a || A == b)) { var F = g; break } if (p || G) var G =
                        g; else { var w = g.clientWidth, x = g.clientHeight; if (w && x) { var H = window.getComputedStyle(g); if (!H || "hidden" != H.visibility) { var I = w * x; x < 1.4 * w && w < 3 * x && I > k && (k = I, l = g); n ||= g } } }
                } if (F) break
            } (d = F || p || G || l || n) || (d = document.querySelectorAll("video,audio")[0]); if (!d) return null; if ("EMBED" == d.tagName && !d.clientWidth && !d.clientHeight) { var J = d.parentElement; "OBJECT" == J.tagName && (d = J) } return d
        } catch (O) { return null }
    }; M.ha = function (a) {
        try {
            var b = parseInt(a.getAttribute("JM_NEAT")); b || (b = this.ba << 10 | this.Counter++, a.setAttribute("JM_NEAT",
                b)); return b
        } catch (d) { }
    }; M.getTitle = function () { var a = ""; try { a = document.title || document.getElementsByTagName("title")[0].innerText, a = a.trim() } catch (b) { } return a ? a = a.replace(/[ \t\r\n\u25B6]+/g, " ").trim() : "" }; M.R = function (a) { 8 != a.keyCode && 46 != a.keyCode || this.port.postMessage([4, "keydown" == a.type]) }; M.P = function (a) { 0 == a.button && (this.T = a.clientX, this.U = a.clientY) }; M.na = function () {
        if (!this.M) {
            this.M = !0; var a = this; window.setTimeout(function () {
                for (var b in a.h) {
                    var d = a.h[b], f = null; d.l && (f = D(d.l)); if (f) {
                        try { document.body.removeChild(d.g) } catch (g) { } d.position.left =
                            Math.max(0, f.left - 1); d.position.top = Math.max(0, f.top - 19 - 4); document.body.appendChild(d.g)
                    } d.s()
                } a.M = !1
            }, 500)
        }
    }; function c(a, b) { return 18 > Math.abs(a.left - b.left) && 18 > Math.abs(a.top - b.top) } function e(a) { a = D(a.l); return !a || 0 > a.left || 0 > a.top } M.G = function (a, b, d, f) {
        if (blockedHosts && blockedHosts.length > 0) { var currentHostname = window.location.hostname; var isBlocked = blockedHosts.some(function (host) { var blockRegex = new RegExp("(^|\\.)" + host.replace(/\./g, "\\.") + "$", "i"); return blockRegex.test(currentHostname) }); if (isBlocked) { return } } var g = this, k = -1, l = null, n; f = f && RegExp(".*facebook.com$|.*vimeo.com$|.*youtube.com$", "i").test(window.location.host) && !(a.fEx && "VTT" == a.fEx.toUpperCase()) && !(!a.fS || 5242880 < a.fS); if (a.fEx && ("VTT" == a.fEx.toUpperCase() || "SRT" == a.fEx.toUpperCase())) {
            if (0 <=
                window.location.host.toLowerCase().indexOf("youtube.")) return; this.aa++; if (2 < this.aa) return
        } if (!(0 <= window.location.host.toLowerCase().indexOf("youtube.com"))) {
            a.id || (a.id = B(a["2"])); d ||= this.fa(a["2"], b); if (!d) for (n in this.h) { l = this.h[n]; k = n; break } if (!d && !l) { if (f) return; l = new L(g, null, 0) } else if (!l) if (k = this.ha(d), l = this.h[k], !l) {
                if (f) return; l = new L(g, d, k); b = D(d); d = { left: Math.max(0, b.left - 1), top: Math.max(0, b.top - 19 - 4) }; for (n in this.h) if (n && n != k && (b = this.h[n], c(d, b.position))) {
                    for (d = 0; d < b.items.length; d++)l.J(b.items[d]);
                    this.Z(n); break
                } if (0 != k && this.h[0]) { b = this.h[0]; for (d = 0; d < b.items.length; d++)l.J(b.items[d]); this.Z(0) }
            } else { if (f) { l.s(); return } } else if (f) { l.s(); return } g.D[a.id] = a; l.J(a.id); l.l && e(l) && !this.j && (g.j = setInterval(function () { g.ca(l) }, 1200))
        }
    }; M.ca = function (a) { if (a && a.l) { var b = D(a.l); b && (a.position = { left: Math.max(0, b.left - 1), top: Math.max(0, b.top - 19 - 4) }, a.s()); !b || 0 > b.left || 0 > b.top || (clearInterval(this.j), this.j = null) } else clearInterval(this.j), this.j = null }; M.V = function (a) {
        var b = this; switch (a[0]) {
            case 1: b.G(a[1],
                a[2], null, !0); break; case 3: (a = a[1]) && (b.Y = a); b.va(); break; case 5: b.$(); break; case 11: b.ua(); 0 <= (new URL(window.location.href)).hostname.toLowerCase().indexOf("youtube.") || setTimeout(function () { b.X() }, 2500); break; case 13: a = a[1]; a != b.C && (b.C = a, b.$()); break; case 15: alert("Extension Can't Connect to NeatDownloadManager Application, You Can : \r\n1- Check If NeatDownloadManager is Running.\r\n2- or Hold down Delete-Key and click on the Download link.\r\n3- or Disable NeatDownloadManager Extension temporarily.")
        }
    };
    M.m = function (a) { var b = Array.prototype.slice.call(arguments); b[2] = b[2].bind(this); this.ea.push(b); a.addEventListener.apply(a, b.slice(1)) }; M.la = function () { for (var a in this.h) this.h[a].I(!0) }; M.ua = function () { try { for (var a in this.h) this.h[a].i && clearTimeout(this.h[a].i), document.body.removeChild(this.h[a].g) } catch (b) { } this.h = {}; this.D = {}; this.j && clearInterval(this.j); this.j = null }; M.$ = function () { var a = this.C ? "" : "none"; try { for (var b in this.h) this.h[b].g.style.display = a } catch (d) { } }; M.W = function () {
        this.port =
        chrome.runtime.connect({ name: "neat" }); this.port.onMessage.addListener(this.V.bind(this)); this.port.onDisconnect.addListener(this.W.bind(this))
    }; new N
};

// keydown → sendMessage: SW 端写入 storage.session，避开 content script 的存储访问限制。
// Ctrl/Alt/Meta/Shift 被按下时立即通知 SW，后续 3 秒内所有点击均被绕过。
document.addEventListener("keydown", function(e) {
  if (!(e.ctrlKey || e.altKey || e.metaKey || e.shiftKey)) return;
  chrome.runtime.sendMessage({ action: "__ndm_bypass" });
}, true);