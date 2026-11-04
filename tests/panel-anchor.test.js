const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function setup() {
    const document = { hidden: false, addEventListener() {} };
    const context = vm.createContext({
        window: { m: true }, document,
        chrome: { runtime: { getURL: value => value } },
        innerWidth: 2016, innerHeight: 762,
        getComputedStyle: element => element.css
    });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'ct.js'), 'utf8'), context);
    const media = (visible, paused = false) => ({
        isConnected: true, paused,
        css: { display: visible ? 'block' : 'none', visibility: 'visible' },
        getBoundingClientRect: () => ({ left: 347, top: 116,
            width: visible ? 989 : 0, height: visible ? 556 : 0 })
    });
    const old = media(false, true), next = media(true);
    const parent = { isConnected: true, css: { overflowX: 'hidden', overflowY: 'hidden' },
        querySelectorAll: () => [old, next],
        getBoundingClientRect: () => ({ left: 347, top: 116, right: 1336, bottom: 672 }) };
    old.parentElement = next.parentElement = parent;
    const observed = [], unobserved = [];
    const observer = { observe: node => observed.push(node), unobserve: node => unobserved.push(node) };
    const controller = { h: {}, C: true, panelTracker: { resize: observer, intersection: observer } };
    const panel = new context.L(controller, old, 1);
    const style = { display: 'none', transform: 'initial', setProperty(key, value) { this[key] = value; } };
    panel.g = { style };
    panel.inView = false;
    return { panel, old, next, parent, observed, unobserved, media };
}

test('hidden player anchor switches to visible sibling and clears stale intersection state', () => {
    const { panel, next, old, observed, unobserved } = setup();
    panel.s();
    assert.equal(panel.l, next);
    assert.equal(panel.g.style.display, 'block');
    assert.equal(panel.g.style.transform, 'translate3d(355px,124px,0)');
    assert.deepEqual(unobserved, [old, old]);
    assert.deepEqual(observed, [next, next]);
});

test('removed video uses retained parent to find its replacement', () => {
    const { panel, old, next } = setup();
    old.isConnected = false;
    old.parentElement = null;
    panel.s();
    assert.equal(panel.l, next);
    assert.equal(panel.g.style.display, 'block');
});

test('hidden video without a visible replacement remains hidden', () => {
    const { panel, old, parent } = setup();
    parent.querySelectorAll = () => [old];
    panel.s();
    assert.equal(panel.l, old);
    assert.equal(panel.g.style.display, 'none');
});

test('ambiguous sibling videos do not steal the anchor', () => {
    const { panel, old, next, parent, media } = setup();
    parent.querySelectorAll = () => [old, next, media(true)];
    panel.s();
    assert.equal(panel.l, old);
});

test('offscreen but laid-out video keeps its anchor and stays hidden', () => {
    const { panel, old } = setup();
    old.css.display = 'block';
    old.getBoundingClientRect = () => ({ left: 347, top: -700, width: 989, height: 556 });
    panel.s();
    assert.equal(panel.l, old);
    assert.equal(panel.g.style.display, 'none');
});

test('closed panel remains closed after a player switch', () => {
    const { panel, old } = setup();
    panel.closed = true;
    panel.s();
    assert.equal(panel.l, old);
    assert.equal(panel.g.style.display, 'none');
});
