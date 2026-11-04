var h = chrome.runtime.getURL("img/icon16.png"), q = chrome.runtime.getURL("img/close16.png"), r = { "-1": "none", 1: "" }; function t(c) { return document.getElementById(c) } window.el = t; function u() { var c = document.location.host.toLowerCase(), e = c.length - 12; return 0 <= e && c.indexOf("facebook.com", e) == e } async function y(c) { try { const e = await fetch(c["2"], { mode: "no-cors" }); if (e.ok) { let a = await e.text(); (c.pa || function () { })(a) } } catch (e) { } }
function B(c) { var e = 0, a; var b = 0; for (a = c.length; b < a; b++) { var d = c.charCodeAt(b); e = (e << 5) - e + d; e |= 0 } return e } function C(c) { return !c || 0 > c ? " " : 1E3 > c ? c + " Bytes" : 1E6 > c ? (c / 1024).toFixed(1) + " KB" : 1E9 > c ? (c / 1048576).toFixed(2) + " MB" : (c / 1073741824).toFixed(3) + " GB" } function D(c) { if (!c) return { left: 0, top: 0 }; try { var e = c.getBoundingClientRect(); return e ? { left: Math.round(e.left + window.pageXOffset), top: Math.round(e.top + window.pageYOffset) } : { left: 0, top: 0 } } catch (a) { return { left: 0, top: 0 } } }
function K(c) { return c ? !c.fEx || "VTT" != c.fEx.toUpperCase() && "SRT" != c.fEx.toUpperCase() ? c["4"] || (c.fEx.toUpperCase() || "MP4") + " File  " + (C(c.fS) || c.fDu) : c.fEx.toUpperCase() + " Subtitles File " + (c.fS ? C(c.fS) : " ") : "Media File" } function L(controller, media, id) {
    this.v = controller;
    controller.h[id] = this;
    this.oa = id;
    this.l = media;
    this.mediaParent = media && media.parentElement;
    this.g = null;
    this.i = null;
    this.items = [];
    this.position = { left: 0, top: 0 };
    this.closed = false;
}
function neatMediaHasLayout(media) {
    if (!media || !media.isConnected) return false;
    var rect = media.getBoundingClientRect(), style = getComputedStyle(media);
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' &&
        style.visibility !== 'hidden' && style.visibility !== 'collapse';
}
var M = L.prototype;
M.refreshAnchor = function () {
    if (!this.l || neatMediaHasLayout(this.l)) return;
    // Players may retain a hidden video after switching ads or playback engines.
    // Stay within its original container instead of jumping to unrelated videos.
    var parent = this.l.parentElement || this.mediaParent;
    if (!parent || !parent.isConnected || parent === document.body || parent === document.documentElement) return;
    var candidates = Array.from(parent.querySelectorAll('video,audio')).filter(neatMediaHasLayout);
    var playing = candidates.filter(function (media) { return !media.paused; });
    var next = playing.length === 1 ? playing[0] : candidates.length === 1 ? candidates[0] : null;
    if (!next) return;
    var tracker = this.v.panelTracker;
    if (tracker) {
        tracker.resize.unobserve(this.l);
        tracker.intersection.unobserve(this.l);
    }
    this.l = next;
    this.mediaParent = next.parentElement;
    this.clipParents = null;
    this.inView = undefined;
    if (tracker) {
        tracker.resize.observe(next);
        tracker.intersection.observe(next);
    }
};
M.s = function () {
    if (!this.g) return;
    if (!this.closed && this.v.C && !document.hidden) this.refreshAnchor();
    var visible = this.v.C && !this.closed && !document.hidden && this.inView !== false;
    var left = 12, top = 12;
    if (this.l && visible) {
        if (!this.l.isConnected) visible = false;
        else {
            var rect = this.l.getBoundingClientRect();
            var style = getComputedStyle(this.l);
            // Keep the icon inset 8px from the video's upper-left corner.
            left = rect.left + 8;
            top = rect.top + 8;
            visible = rect.width > 0 && rect.height > 0 &&
                style.visibility !== 'hidden' && style.display !== 'none' &&
                top >= 0 && top + 28 <= innerHeight && left >= 0 && left + 30 <= innerWidth;
            if (!this.clipParents) {
                this.clipParents = [];
                for (var parent = this.l.parentElement; parent; parent = parent.parentElement) {
                    // The root scrolling elements are bounded by the viewport above. On
                    // YouTube, body can have zero layout height while its video is visible.
                    if (parent === document.body || parent === document.documentElement) continue;
                    var css = getComputedStyle(parent);
                    var x = /(auto|scroll|hidden|clip)/.test(css.overflowX);
                    var y = /(auto|scroll|hidden|clip)/.test(css.overflowY);
                    if (x || y) this.clipParents.push({ element: parent, x: x, y: y });
                }
            }
            // Hide the toolbar when its anchor is clipped by a scrolling container.
            for (var i = 0; visible && i < this.clipParents.length; i++) {
                var clip = this.clipParents[i];
                var bounds = clip.element.getBoundingClientRect();
                if (clip.y) visible = top >= bounds.top && top + 28 <= bounds.bottom;
                if (clip.x) visible = visible && left >= bounds.left && left + 30 <= bounds.right;
            }
            if (document.fullscreenElement && !document.fullscreenElement.contains(this.g)) visible = false;
        }
    }
    if (visible) {
        this.position = { left: left, top: top };
        var transform = 'translate3d(' + left + 'px,' + top + 'px,0)';
        if (this.g.style.transform !== transform) this.g.style.setProperty('transform', transform, 'important');
    }
    var display = visible ? 'block' : 'none';
    if (this.g.style.display !== display) this.g.style.setProperty('display', display, 'important');
};
M.I = function (collapse) {
    if (this.panel && collapse) this.panel.classList.remove('expanded');
};
M.S = function (index) { this.v.ia(this.items[index]); };
M.create = function () {
    this.g = document.createElement('div');
    this.g.id = 'neatDiv' + this.oa;
    this.g.style.cssText = 'all:initial !important;position:fixed !important;left:0 !important;top:0 !important;width:max-content !important;height:auto !important;z-index:2147483646 !important;pointer-events:none !important;';
    var root = this.g.attachShadow({ mode: 'open' });
    root.innerHTML = `
        <style>
            :host { color-scheme: dark; }
            * { box-sizing: border-box; }
            .panel { font: 12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
                color: #f4f4f5; width: max-content; max-width: calc(100vw - 24px);
                opacity: .32; transition: opacity 160ms ease; pointer-events: auto; }
            .panel:hover, .panel:focus-within, .panel.expanded { opacity: 1; }
            .bar { display: flex; align-items: center; height: 28px; width: max-content;
                background: rgba(24,24,27,.88); border: 1px solid rgba(255,255,255,.12);
                border-radius: 8px; box-shadow: 0 2px 8px #0002; overflow: hidden; }
            button { font: inherit; color: inherit; border: 0; margin: 0; cursor: pointer;
                background: transparent; text-align: left; }
            button:hover { background: #ffffff14; }
            button:focus-visible { outline: 2px solid #a1c9ff; outline-offset: -2px; }
            .trigger { display: flex; align-items: center; gap: 6px; height: 26px; padding: 0 9px; }
            .icon { display: block; width: 16px; height: 16px; fill: currentColor; }
            .close { width: 0; padding: 0; opacity: 0; overflow: hidden; height: 26px; text-align: center; }
            .panel:hover .close, .panel:focus-within .close, .panel.expanded .close { width: 26px; opacity: 1; }
            .details { display: none; padding-top: 6px; width: 248px; max-width: calc(100vw - 24px); }
            .panel:hover .details, .panel:focus-within .details, .panel.expanded .details { display: block; }
            .list { padding: 4px; margin: 0; list-style: none; background: rgba(24,24,27,.96);
                border: 1px solid #ffffff1f; border-radius: 10px; box-shadow: 0 6px 20px #0003;
                max-height: min(240px, 40vh); overflow: auto; overscroll-behavior: contain; }
            .download { display: block; width: 100%; border-radius: 6px; padding: 9px 10px;
                overflow-wrap: anywhere; }
            @media (prefers-reduced-motion: reduce) { .panel { transition: none; } }
        </style>
        <section class="panel" aria-label="Neat Download Manager">
            <div class="bar"><button class="trigger" type="button" aria-label="显示视频下载选项">
                <svg class="icon" viewBox="0 0 1024 1024" aria-hidden="true" focusable="false"><path d="M558 171.2v573.7c0 0.1 0.2 0.2 0.2 0.1l208-216.4c16.8-17.5 44.7-18.1 62.2-1.2 17.5 16.8 18.1 44.7 1.2 62.2L546.5 884.2c-8.3 8.6-19.8 13.5-31.7 13.5-12 0-23.4-4.9-31.7-13.5L198.3 588c-8.2-8.5-12.3-19.5-12.3-30.5 0-11.6 4.5-23.1 13.5-31.7 17.5-16.8 45.4-16.3 62.2 1.2l208 216.4c0.1 0.1 0.2 0 0.2-0.1V170.2c0-23.4 18.3-42.5 41.3-43.9 25.6-1.5 46.8 19.4 46.8 44.9z"/></svg>
            </button><button class="close" type="button" aria-label="隐藏下载浮条" title="隐藏">×</button></div>
            <div class="details"><ul class="list" aria-label="可下载媒体"></ul></div>
        </section>`;
    this.panel = root.querySelector('.panel');
    this.list = root.querySelector('.list');
    var self = this;
    root.querySelector('.trigger').onclick = function () { self.panel.classList.toggle('expanded'); };
    root.querySelector('.close').onclick = function () { self.closed = true; self.s(); };
    this.panel.addEventListener('pointerleave', function () { self.I(true); });
    this.panel.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            self.I(true);
            if (root.activeElement) root.activeElement.blur();
        }
    });
    // Avoid triggering the player's click/drag shortcuts when using our controls.
    ['click', 'pointerdown', 'mousedown', 'dblclick', 'keydown'].forEach(function (type) {
        self.panel.addEventListener(type, function (event) { event.stopPropagation(); });
    });
    document.documentElement.appendChild(this.g);
    this.v.trackPanels();
};
M.J = function (id) {
    if (!this.g) this.create();
    if (this.items.indexOf(id) !== -1) { this.s(); return; }
    var label = K(this.v.K(id));
    var index = this.items.findIndex(function (item) {
        return (label === ' MP4 File HQ' || label === ' MP4 File LQ') && K(this.v.K(item)) === label;
    }, this);
    if (index === -1) this.items.push(id); else this.items[index] = id;
    this.list.replaceChildren();
    var self = this;
    this.items.forEach(function (item, i) {
        var li = document.createElement('li');
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'download';
        button.textContent = K(self.v.K(item));
        button.title = button.textContent;
        button.onclick = function () { self.S(i); };
        li.appendChild(button);
        self.list.appendChild(li);
    });
    this.s();
};
// Coalesce scroll/resize/layout notifications into one update per rendered frame.
// A slow fallback catches position-only changes (for example a moving player).
function NeatPanelTracker(controller) {
    this.controller = controller;
    this.entries = new Map();
    this.frame = null;
    this.timer = null;
    this.schedule = this.schedule.bind(this);
    this.onVisibility = this.onVisibility.bind(this);
    var self = this;
    this.resize = new ResizeObserver(this.schedule);
    this.intersection = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            self.entries.forEach(function (panel) {
                if (panel.l === entry.target) panel.inView = entry.isIntersecting;
            });
        });
        self.schedule();
    });
    this.mutations = new MutationObserver(function (records) {
        // Our own transform/display writes must not schedule another update.
        var relevant = records.some(function (record) {
            if (self.isPanelNode(record.target)) return false;
            if (record.type === 'childList') {
                return Array.from(record.addedNodes).concat(Array.from(record.removedNodes))
                    .some(function (node) { return !self.isPanelNode(node); });
            }
            return true;
        });
        if (!relevant) return;
        self.entries.forEach(function (panel) { panel.clipParents = null; });
        self.schedule();
    });
    document.addEventListener('scroll', this.schedule, { capture: true, passive: true });
    window.addEventListener('resize', this.schedule, { passive: true });
    document.addEventListener('fullscreenchange', this.schedule);
    document.addEventListener('visibilitychange', this.onVisibility);
    if (window.visualViewport) {
        visualViewport.addEventListener('resize', this.schedule, { passive: true });
        visualViewport.addEventListener('scroll', this.schedule, { passive: true });
    }
    this.resize.observe(document.documentElement);
    if (document.body) this.resize.observe(document.body);
    this.mutations.observe(document.documentElement, {
        subtree: true, childList: true, attributes: true,
        attributeFilter: ['class', 'style', 'hidden']
    });
}
NeatPanelTracker.prototype.isPanelNode = function (node) {
    return Array.from(this.entries.values()).some(function (panel) { return panel.g === node; });
};
NeatPanelTracker.prototype.watch = function (panel) {
    if (this.entries.has(panel)) return;
    this.entries.set(panel, panel);
    if (panel.l) {
        this.resize.observe(panel.l);
        this.intersection.observe(panel.l);
    }
    this.schedule();
};
NeatPanelTracker.prototype.unwatch = function (panel) {
    this.entries.delete(panel);
    if (panel.l) {
        this.resize.unobserve(panel.l);
        this.intersection.unobserve(panel.l);
    }
};
NeatPanelTracker.prototype.schedule = function (event) {
    if (document.hidden || this.frame !== null || (event && this.isPanelNode(event.target))) return;
    var self = this;
    this.frame = requestAnimationFrame(function () {
        self.frame = null;
        self.entries.forEach(function (panel) { panel.s(); });
        self.armFallback();
    });
};
NeatPanelTracker.prototype.armFallback = function () {
    clearTimeout(this.timer);
    this.timer = null;
    if (document.hidden || !this.controller.C) return;
    var active = Array.from(this.entries.values()).some(function (panel) {
        return panel.l && panel.l.isConnected && !panel.closed && panel.inView !== false;
    });
    if (active) this.timer = setTimeout(this.schedule, 500);
};
NeatPanelTracker.prototype.onVisibility = function () {
    clearTimeout(this.timer);
    this.timer = null;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    if (!document.hidden) this.schedule();
};
NeatPanelTracker.prototype.dispose = function () {
    this.resize.disconnect();
    this.intersection.disconnect();
    this.mutations.disconnect();
    document.removeEventListener('scroll', this.schedule, true);
    window.removeEventListener('resize', this.schedule);
    document.removeEventListener('fullscreenchange', this.schedule);
    document.removeEventListener('visibilitychange', this.onVisibility);
    if (window.visualViewport) {
        visualViewport.removeEventListener('resize', this.schedule);
        visualViewport.removeEventListener('scroll', this.schedule);
    }
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    clearTimeout(this.timer);
    this.entries.clear();
};
if (!window.m) {
    var blockedHosts = []; var N = function () {
        this.Y = null; this.D = {}; this.h = {}; this.M = !1; this.U = this.T = -1; this.Counter = 1; this.j = null; this.aa = 0; this.C = !0; this.ea = []; this.port = null; this.pageHidden = false; this.connectPort(); this.ba = Math.ceil(2E6 * Math.random()); chrome.storage.local.get(["blockedHosts"], function (result) { blockedHosts = result.blockedHosts || [] }); chrome.storage.onChanged.addListener(function (changes, namespace) { if (namespace === "local" && changes.blockedHosts) { blockedHosts = changes.blockedHosts.newValue || [] } }); if (u()) { var a = this; this.ma = new window.MutationObserver(function (b) { b.forEach(function (d) { a.ja(d.target) }) }); this.ma.observe(document, { childList: !0, subtree: !0 }) } this.m(window,
            "keydown", this.R, !0); this.m(window, "keyup", this.R, !0); this.m(window, "mouseup", this.P, !0); this.m(window, "resize", this.na); this.m(window, "pagehide", this.onPageHide); this.m(window, "pageshow", this.onPageShow); this.m(document, "DOMContentLoaded", this.X); this.m(document, "click", this.la); this.m(document, "play", this.onMediaActive, true); this.m(document, "loadedmetadata", this.onMediaActive, true)
    }; window.m = !0; M = N.prototype; M.ka = function (a, b) { b.hd && this.G({ id: B(b.hd), 1: "GET", 2: b.hd, fEx: "mp4", 4: " MP4 File HQ" }, window.location.href, a, !1); b.sd && this.G({ id: B(b.sd), 1: "GET", 2: b.sd, fEx: "mp4", 4: " MP4 File LQ" }, window.location.href, a, !1) }; M.ga = function (a) {
        for (; (a = a.parentElement) && 1 > a.querySelectorAll("video").length;);
        if (a) return a.querySelectorAll("video")[0]
    }; M.da = function (a, b) { var d = this; y({ 2: "https://www.facebook.com/video/embed?video_id=" + b, pa: function (f) { var g = /"sd_src_no_ratelimit":"(.*?)"/.exec(f), k = /"hd_src_no_ratelimit":"(.*?)"/.exec(f); g && g.length || (g = /"sd_src":"(.*?)"/.exec(f)); k && k.length || (k = /"hd_src":"(.*?)"/.exec(f)); f = { sd: g && g.length ? g[1].replace(/\\/g, "") : "", hd: k && k.length ? k[1].replace(/\\/g, "") : "" }; g = d.ga(a); void 0 !== g && d.ka(g, f) } }) }; M.ja = function (a) {
        var b = this; a = a.querySelectorAll('a[href*="/videos/"]');
        a.length && Array.from(a, function (d) { if (!d.getAttribute("NEAT_DM")) { d.setAttribute("NEAT_DM", 1); var f = d.href.match(/.*\/videos\/(\d+)\/.*/i); f && b.da(d, f[1]) } })
    }; M.K = function (a) { return this.D[a] }; M.va = function () { this.sendPortMessage([2, this.Y, window.location.href, this.getTitle()]) }; M.X = function () {
        for (var a = this, b = document.getElementsByTagName("SCRIPT"), d, f, g, k = /"progressive":\s*\[/, l = 0; l < b.length; l++)if (d = b[l], 0 <= document.location.host.toLowerCase().indexOf("vimeo") && !d.src && k.test(d.innerText) && (d =
            d.innerText, f = d.indexOf('"progressive"'), !(0 > f || (g = d.indexOf("]", f), 0 > g)))) { d = d.substr(f, g - f + 1); f = null; try { f = JSON.parse("{" + d + "}") } catch (p) { } if (f) { var n = f.progressive; n && setTimeout(function () { for (var p = 0; p < n.length; p++)a.G({ id: B(n[p].url), 1: "GET", 2: n[p].url, fEx: "mp4", 4: "MP4 File " + n[p].quality }, window.location.href, null, !1) }, 2E3); break } }
    }; M.Z = function (a) { var b = this.h[a]; if (b) { try { if (this.panelTracker) this.panelTracker.unwatch(b); b.g.remove(); } catch (d) { } delete this.h[a]; if (!Object.keys(this.h).length && this.panelTracker) { this.panelTracker.dispose(); this.panelTracker = null; } } }; M.mediaTitles = function (id) {
        var panel = Object.values(this.h).find(function (entry) { return entry.items.includes(id); });
        var media = panel && panel.l;
        var titles = media ? [media.getAttribute('title'), media.getAttribute('aria-label')] : [];
        for (var selector of ['meta[property="og:video:title"]', 'meta[property="og:title"]',
            'meta[name="twitter:title"]']) {
            var meta = document.querySelector(selector);
            if (meta) titles.push(meta.content);
        }
        return titles.filter(Boolean);
    }; M.ia = function (id) {
        var resource = this.D[id];
        if (resource) this.sendPortMessage([6, resource, window.location.href,
            this.getTitle(), K(resource), this.mediaTitles(id)]);
    }; M.mediaElements = function () {
        var found = Array.from(document.querySelectorAll('video,audio'));
        // Traverse open shadow roots only; closed roots cannot be inspected by a content script.
        var roots = [document], visited = 0;
        while (roots.length && visited < 5000) {
            var root = roots.shift();
            var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
            for (var element = walker.nextNode(); element && visited < 5000; element = walker.nextNode()) {
                visited++;
                if (element.shadowRoot) {
                    found.push.apply(found, element.shadowRoot.querySelectorAll('video,audio'));
                    roots.push(element.shadowRoot);
                }
            }
        }
        return Array.from(new Set(found)).filter(function (element) { return element.isConnected; });
    }; M.fa = function (url, pageUrl) {
        var media = this.mediaElements();
        function matches(element, candidate) {
            if (!candidate) return false;
            var sources = [element.currentSrc, element.src, element.getAttribute('src')];
            for (var source of element.querySelectorAll('source')) sources.push(source.src);
            return sources.some(function (source) {
                try { return source && new URL(source, document.baseURI).href === candidate; }
                catch (error) { return false; }
            });
        }
        var exact = media.find(function (element) { return matches(element, url) || matches(element, pageUrl); });
        if (exact) return exact;
        var clicked = document.elementFromPoint(this.T || -1, this.U || -1);
        if (clicked) {
            var near = media.find(function (element) { return element === clicked || element.contains(clicked); });
            if (near) return near;
        }
        if (this.lastActiveMedia && this.lastActiveMedia.isConnected && !this.lastActiveMedia.paused)
            return this.lastActiveMedia;
        var visible = media.filter(function (element) {
            var box = element.getBoundingClientRect();
            return box.width > 100 && box.height > 60 && box.bottom > 0 && box.top < innerHeight;
        });
        return visible.length === 1 ? visible[0] : null;
    }; M.onMediaActive = function (event) {
        if (event.target instanceof HTMLMediaElement) {
            if (event.type === 'play') this.lastActiveMedia = event.target;
            this.na();
            var panel = this.h[0];
            if (panel && panel.g && !panel.l && this.mediaElements().length === 1) {
                panel.l = event.target;
                if (this.panelTracker) {
                    this.panelTracker.unwatch(panel);
                    this.panelTracker.watch(panel);
                }
                panel.s();
            }
        }
    }; M.ha = function (a) {
        try {
            var b = parseInt(a.getAttribute("JM_NEAT")); b || (b = this.ba << 10 | this.Counter++, a.setAttribute("JM_NEAT",
                b)); return b
        } catch (d) { }
    }; M.getTitle = function () { var a = ""; try { a = document.title || document.getElementsByTagName("title")[0].innerText, a = a.trim() } catch (b) { } return a ? a = a.replace(/[ \t\r\n\u25B6]+/g, " ").trim() : "" }; M.R = function (a) { 8 != a.keyCode && 46 != a.keyCode || this.sendPortMessage([4, "keydown" == a.type]) }; M.P = function (a) { 0 == a.button && (this.T = a.clientX, this.U = a.clientY) }; M.na = function () { if (this.panelTracker) this.panelTracker.schedule(); };
    M.trackPanels = function () {
        if (!this.panelTracker) this.panelTracker = new NeatPanelTracker(this);
        for (var id in this.h) if (this.h[id].g) this.panelTracker.watch(this.h[id]);
    }; M.G = function (resource, pageUrl, anchor) {
        // NDM does not support YouTube playback downloads; keep its player clear.
        if (/(^|\.)(youtube\.com|youtube-nocookie\.com)$/i.test(location.hostname)) return;
        if (blockedHosts.some(function (host) {
            var escaped = host.replace(/\./g, '\\.');
            return new RegExp('(^|\\.)' + escaped + '$', 'i').test(window.location.hostname);
        })) return;
        if (resource.fEx && /^(VTT|SRT)$/i.test(resource.fEx)) {
            if (++this.aa > 2) return;
        }
        resource.id ||= resource["2"];
        anchor ||= this.fa(resource["2"], pageUrl);
        var id = anchor ? this.ha(anchor) : this.h[0] && this.h[0].l ? 'page' : 0;
        var panel = this.h[id] || new L(this, anchor || null, id);
        this.D[resource.id] = resource;
        panel.J(resource.id);
        this.trackPanels();
    }; M.probeHls = async function (id, url) {
        var text = "", error = "", controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, 7000);
        try {
            if (!/^https?:\/\//i.test(url)) throw new Error("invalid URL");
            var response = await fetch(url, { credentials: "include", signal: controller.signal });
            if (!response.ok) error = "HTTP " + response.status;
            else {
                var reader = response.body && response.body.getReader && response.body.getReader();
                if (!reader) {
                    text = await response.text();
                    if (new TextEncoder().encode(text).length > 1048576) { text = ""; error = "too large"; }
                } else {
                    var chunks = [], size = 0;
                    try {
                        while (true) {
                            var part = await reader.read();
                            if (part.done) break;
                            size += part.value.byteLength;
                            if (size > 1048576) { await reader.cancel(); error = "too large"; break; }
                            chunks.push(part.value);
                        }
                        if (!error) {
                            var bytes = new Uint8Array(size), offset = 0;
                            for (var chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
                            text = new TextDecoder().decode(bytes);
                        }
                    } finally { reader.releaseLock(); }
                }
            }
        } catch (failure) { error = failure.name === "AbortError" ? "frame timeout" : "frame fetch failed"; }
        finally { clearTimeout(timer); }
        try { this.sendPortMessage([18, id, text, error]); } catch (failure) { }
    }; M.V = function (a) {
        var b = this; switch (a[0]) {
            case 17: b.probeHls(a[1], a[2]); break;
            case 1: b.G(a[1],
                a[2], null, !0); break; case 3: (a = a[1]) && (b.Y = a); b.va(); break; case 5: b.$(); break; case 11: b.ua(); setTimeout(function () { b.X() }, 2500); break; case 13: a = a[1]; a != b.C && (b.C = a, b.$()); break; case 15: alert("Extension Can't Connect to NeatDownloadManager Application, You Can : \r\n1- Check If NeatDownloadManager is Running.\r\n2- or Hold down Delete-Key and click on the Download link.\r\n3- or Disable NeatDownloadManager Extension temporarily."); break;
        }
    };
    M.m = function (a) { var b = Array.prototype.slice.call(arguments); b[2] = b[2].bind(this); this.ea.push(b); a.addEventListener.apply(a, b.slice(1)) }; M.la = function () { for (var a in this.h) this.h[a].I(!0) }; M.ua = function () {
        for (var id in this.h) if (this.h[id].g) this.h[id].g.remove();
        this.h = {}; this.D = {};
        if (this.panelTracker) this.panelTracker.dispose();
        this.panelTracker = null;
    }; M.$ = function () { this.na(); }; M.connectPort = function () {
        if (this.pageHidden || this.port || this.contextInvalidated) return;
        var port;
        try {
            port = chrome.runtime.connect({ name: "neat" });
            port.onMessage.addListener(this.V.bind(this));
            port.onDisconnect.addListener(this.W.bind(this));
        }
        catch (error) {
            if (!/extension context invalidated/i.test(error.message)) throw error;
            this.contextInvalidated = true;
            return;
        }
        this.port = port;
    }; M.sendPortMessage = function (message) {
        if (this.contextInvalidated || !this.port) return;
        try { this.port.postMessage(message); }
        catch (error) {
            if (!/extension context invalidated|disconnected port/i.test(error.message)) throw error;
            this.port = null;
            if (/extension context invalidated/i.test(error.message)) this.contextInvalidated = true;
        }
    }; M.onPageHide = function () {
        this.pageHidden = true;
        // Clear the reference even when a reload has invalidated the old port.
        var port = this.port;
        this.port = null;
        if (port) {
            try { port.disconnect(); }
            catch (error) {
                if (!/extension context invalidated/i.test(error.message)) throw error;
                this.contextInvalidated = true;
            }
        }
    }; M.onPageShow = function (event) {
        this.pageHidden = false;
        if (event.persisted || !this.port) this.connectPort();
        if (event.persisted) this.na();
    }; M.W = function (port) {
        var error = chrome.runtime.lastError;
        if (this.port !== port) return;
        this.port = null;
        if (error && /back\/forward cache/i.test(error.message)) this.pageHidden = true;
        this.connectPort();
    }; new N
};

// Limit modifier-key bypass to the link the user actually activates.
function notifyBypass(event) {
    if (!(event.ctrlKey || event.altKey || event.metaKey || event.shiftKey)) return;
    var link = event.target.closest && event.target.closest('a[href]');
    if (link && /^https?:$/.test(link.protocol))
        try {
            chrome.runtime.sendMessage({ action: "__ndm_bypass", url: link.href }, function () {
                // Consume delivery failures if the background has gone away.
                void chrome.runtime.lastError;
            });
        } catch (error) {
            if (!/extension context invalidated/i.test(error.message)) throw error;
        }
}
document.addEventListener('pointerdown', notifyBypass, true);
document.addEventListener('click', notifyBypass, true);
