const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function setup(options = {}) {
    function target() {
        const listeners = {};
        return { listeners, addEventListener(type, listener) {
            (listeners[type] ||= []).push(listener);
        } };
    }
    const window = target();
    window.location = { href: 'https://example.test/watch', host: 'example.test' };
    const document = target();
    document.location = window.location;
    document.title = 'Example video';
    const ports = [], bypassMessages = [];
    let disconnectError, errorReads = 0, invalidated = false, connectAttempts = 0;
    const chrome = {
        runtime: {
            getURL: name => name,
            sendMessage(message, callback) {
                if (invalidated) throw new Error('Extension context invalidated.');
                bypassMessages.push(message);
                disconnectError = options.deliveryError;
                callback();
                disconnectError = undefined;
            },
            connect() {
                connectAttempts++;
                if (invalidated) throw new Error('Extension context invalidated.');
                const port = { messages: [], disconnected: false,
                    onMessage: { addListener(listener) {
                        if (options.listenerError) throw options.listenerError;
                        port.receive = listener;
                    } },
                    onDisconnect: { addListener(listener) { port.onClosed = listener; } },
                    postMessage(message) {
                        if (invalidated) throw new Error('Extension context invalidated.');
                        if (options.postError) throw options.postError;
                        port.messages.push(message);
                    },
                    disconnect() {
                        if (invalidated) throw new Error('Extension context invalidated.');
                        port.disconnected = true;
                    } };
                ports.push(port);
                return port;
            },
            get lastError() { errorReads++; return disconnectError; }
        },
        storage: { local: { get(_keys, callback) { callback({}); } },
            onChanged: { addListener() {} } }
    };
    const context = vm.createContext({ window, document, chrome, URL, setTimeout, clearTimeout });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'ct.js'), 'utf8'), context);
    return { window, ports, document, bypassMessages,
        invalidate() { invalidated = true; },
        connectAttempts: () => connectAttempts,
        fire(type, event) { for (const listener of window.listeners[type] || []) listener(event); },
        close(port, error) { disconnectError = error; port.onClosed(port); disconnectError = undefined; },
        errorReads: () => errorReads };
}

test('BFCache navigation closes the old port and reconnects once on restore', () => {
    const page = setup();
    assert.equal(page.ports.length, 1);
    const oldPort = page.ports[0];
    page.fire('pagehide', { persisted: true });
    assert.equal(oldPort.disconnected, true);
    page.close(oldPort, { message: 'The page keeping the extension port is moved into back/forward cache' });
    assert.equal(page.errorReads(), 1);
    assert.equal(page.ports.length, 1);

    page.fire('pageshow', { persisted: true });
    assert.equal(page.ports.length, 2);
    page.ports[1].receive([3, 42]);
    assert.deepEqual(Array.from(page.ports[1].messages[0]),
        [2, 42, 'https://example.test/watch', 'Example video']);
});

test('an unexpected disconnect on an active page still reconnects', () => {
    const page = setup();
    page.close(page.ports[0]);
    assert.equal(page.ports.length, 2);
    page.fire('pageshow', { persisted: false });
    assert.equal(page.ports.length, 2);
});

test('a BFCache disconnect waits for page restoration even if pagehide was missed', () => {
    const page = setup();
    page.close(page.ports[0],
        { message: 'The page keeping the extension port is moved into back/forward cache' });
    assert.equal(page.ports.length, 1);
    page.fire('pageshow', { persisted: true });
    assert.equal(page.ports.length, 2);
});

test('pagehide safely releases an invalidated port and does not reconnect on restore', () => {
    const page = setup();
    page.invalidate();
    assert.doesNotThrow(() => page.fire('pagehide', { persisted: true }));
    assert.doesNotThrow(() => page.fire('pagehide', { persisted: true }));
    assert.doesNotThrow(() => page.fire('pageshow', { persisted: true }));
    assert.equal(page.connectAttempts(), 1);
});

test('restoring a cached page after extension reload safely stops reconnecting', () => {
    const page = setup();
    page.fire('pagehide', { persisted: true });
    page.invalidate();
    assert.doesNotThrow(() => page.fire('pageshow', { persisted: true }));
    assert.doesNotThrow(() => page.fire('pageshow', { persisted: false }));
    assert.equal(page.connectAttempts(), 2);
    assert.equal(page.ports.length, 1);
});

test('disconnect after extension reload safely handles a failed reconnect', () => {
    const page = setup();
    page.invalidate();
    assert.doesNotThrow(() => page.close(page.ports[0]));
    assert.doesNotThrow(() => page.fire('pageshow', { persisted: false }));
    assert.equal(page.connectAttempts(), 2);
});


test('listener registration also tolerates extension invalidation', () => {
    const page = setup({ listenerError: new Error('Extension context invalidated.') });
    assert.doesNotThrow(() => page.fire('pageshow', { persisted: true }));
    assert.equal(page.connectAttempts(), 1);
});

test('key events and late messages tolerate an invalidated or absent port', () => {
    const page = setup();
    page.invalidate();
    assert.doesNotThrow(() => page.fire('keydown', { keyCode: 46, type: 'keydown' }));
    assert.doesNotThrow(() => page.fire('keyup', { keyCode: 46, type: 'keyup' }));
    assert.doesNotThrow(() => page.ports[0].receive([3, 42]));
    assert.doesNotThrow(() => page.fire('pagehide', { persisted: true }));
    assert.doesNotThrow(() => page.fire('pageshow', { persisted: true }));
    assert.equal(page.connectAttempts(), 1);
    assert.equal(page.ports[0].messages.length, 0);
});

test('key events during BFCache suspension do not send to a missing port', () => {
    const page = setup();
    page.fire('pagehide', { persisted: true });
    assert.doesNotThrow(() => page.fire('keydown', { keyCode: 46, type: 'keydown' }));
    page.fire('pageshow', { persisted: true });
    page.fire('keydown', { keyCode: 46, type: 'keydown' });
    assert.deepEqual(Array.from(page.ports[1].messages[0]), [4, true]);
});

test('unexpected messaging errors remain visible', () => {
    const error = new Error('Unexpected failure');
    const page = setup({ postError: error });
    assert.throws(() => page.fire('keydown', { keyCode: 46 }), error);
    assert.throws(() => setup({ listenerError: error }), error);
});

test('modifier bypass handles synchronous invalidation and callback delivery failures', () => {
    const page = setup({ deliveryError: { message: 'Receiving end does not exist.' } });
    const event = { ctrlKey: true, target: { closest: () => ({
        protocol: 'https:', href: 'https://example.test/file.zip'
    }) } };
    const click = page.document.listeners.click.at(-1);
    click(event);
    assert.equal(page.bypassMessages.length, 1);
    assert.equal(page.errorReads(), 1);
    page.invalidate();
    assert.doesNotThrow(() => click(event));
    assert.doesNotThrow(() => page.document.listeners.pointerdown[0](event));
    assert.equal(page.bypassMessages.length, 1);
});
