if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue, shared) {
  "use strict";
  function getTarget() {
    if (typeof window !== "undefined") {
      return window;
    }
    if (typeof globalThis !== "undefined") {
      return globalThis;
    }
    if (typeof global !== "undefined") {
      return global;
    }
    if (typeof my !== "undefined") {
      return my;
    }
  }
  class Socket {
    constructor(host) {
      this.sid = "";
      this.ackTimeout = 5e3;
      this.closed = false;
      this._ackTimer = 0;
      this._onCallbacks = {};
      this.host = host;
      setTimeout(() => {
        this.connect();
      }, 50);
    }
    connect() {
      this._socket = uni.connectSocket({
        url: `ws://${this.host}/socket.io/?EIO=4&transport=websocket`,
        multiple: true,
        complete(res) {
        }
      });
      this._socket.onOpen((res) => {
      });
      this._socket.onMessage(({ data }) => {
        if (typeof my !== "undefined") {
          data = data.data;
        }
        if (typeof data !== "string") {
          return;
        }
        if (data[0] === "0") {
          this._send("40");
          const res = JSON.parse(data.slice(1));
          this.sid = res.sid;
        } else if (data[0] + data[1] === "40") {
          this.sid = JSON.parse(data.slice(2)).sid;
          this._trigger("connect");
        } else if (data === "3") {
          this._send("2");
        } else if (data === "2") {
          this._send("3");
        } else {
          const match = /\[.*\]/.exec(data);
          if (!match)
            return;
          try {
            const [event, args] = JSON.parse(match[0]);
            this._trigger(event, args);
          } catch (err) {
            console.error("Vue DevTools onMessage: ", err);
          }
        }
      });
      this._socket.onClose((res) => {
        this.closed = true;
        this._trigger("disconnect", res);
      });
      this._socket.onError((res) => {
        console.error(res.errMsg);
      });
    }
    on(event, callback) {
      (this._onCallbacks[event] || (this._onCallbacks[event] = [])).push(callback);
    }
    emit(event, data) {
      if (this.closed) {
        return;
      }
      this._heartbeat();
      this._send(`42${JSON.stringify(typeof data !== "undefined" ? [event, data] : [event])}`);
    }
    disconnect() {
      clearTimeout(this._ackTimer);
      if (this._socket && !this.closed) {
        this._send("41");
        this._socket.close({});
      }
    }
    _heartbeat() {
      clearTimeout(this._ackTimer);
      this._ackTimer = setTimeout(() => {
        this._socket && this._socket.send({ data: "3" });
      }, this.ackTimeout);
    }
    _send(data) {
      this._socket && this._socket.send({ data });
    }
    _trigger(event, args) {
      const callbacks = this._onCallbacks[event];
      if (callbacks) {
        callbacks.forEach((callback) => {
          callback(args);
        });
      }
    }
  }
  let socketReadyCallback;
  getTarget().__VUE_DEVTOOLS_ON_SOCKET_READY__ = (callback) => {
    socketReadyCallback = callback;
  };
  let targetHost = "";
  const hosts = "192.168.233.1,192.168.119.1,192.168.1.195,172.28.112.1,192.168.208.1".split(",");
  setTimeout(() => {
    uni.request({
      url: `http://${"localhost"}:${9502}`,
      timeout: 1e3,
      success() {
        targetHost = "localhost";
        initSocket();
      },
      fail() {
        if (!targetHost && hosts.length) {
          hosts.forEach((host) => {
            uni.request({
              url: `http://${host}:${9502}`,
              timeout: 1e3,
              success() {
                if (!targetHost) {
                  targetHost = host;
                  initSocket();
                }
              }
            });
          });
        }
      }
    });
  }, 0);
  throwConnectionError();
  function throwConnectionError() {
    setTimeout(() => {
      if (!targetHost) {
        throw new Error("未能获取局域网地址，本地调试服务不可用");
      }
    }, (hosts.length + 1) * 1100);
  }
  function initSocket() {
    getTarget().__VUE_DEVTOOLS_SOCKET__ = new Socket(targetHost + ":" + 8099);
    socketReadyCallback();
  }
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  (function() {
    var __webpack_modules__ = {
      /***/
      "../app-backend-core/lib/hook.js": (
        /*!***************************************!*\
          !*** ../app-backend-core/lib/hook.js ***!
          \***************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.installHook = void 0;
          function installHook(target, isIframe = false) {
            const devtoolsVersion = "6.0";
            let listeners = {};
            function injectIframeHook(iframe) {
              if (iframe.__vdevtools__injected)
                return;
              try {
                iframe.__vdevtools__injected = true;
                const inject = () => {
                  try {
                    iframe.contentWindow.__VUE_DEVTOOLS_IFRAME__ = iframe;
                    const script = iframe.contentDocument.createElement("script");
                    script.textContent = ";(" + installHook.toString() + ")(window, true)";
                    iframe.contentDocument.documentElement.appendChild(script);
                    script.parentNode.removeChild(script);
                  } catch (e) {
                  }
                };
                inject();
                iframe.addEventListener("load", () => inject());
              } catch (e) {
              }
            }
            let iframeChecks = 0;
            function injectToIframes() {
              if (typeof window === "undefined")
                return;
              const iframes = document.querySelectorAll("iframe:not([data-vue-devtools-ignore])");
              for (const iframe of iframes) {
                injectIframeHook(iframe);
              }
            }
            injectToIframes();
            const iframeTimer = setInterval(() => {
              injectToIframes();
              iframeChecks++;
              if (iframeChecks >= 5) {
                clearInterval(iframeTimer);
              }
            }, 1e3);
            if (Object.prototype.hasOwnProperty.call(target, "__VUE_DEVTOOLS_GLOBAL_HOOK__")) {
              if (target.__VUE_DEVTOOLS_GLOBAL_HOOK__.devtoolsVersion !== devtoolsVersion) {
                console.error(`Another version of Vue Devtools seems to be installed. Please enable only one version at a time.`);
              }
              return;
            }
            let hook;
            if (isIframe) {
              const sendToParent = (cb) => {
                try {
                  const hook2 = window.parent.__VUE_DEVTOOLS_GLOBAL_HOOK__;
                  if (hook2) {
                    return cb(hook2);
                  } else {
                    console.warn("[Vue Devtools] No hook in parent window");
                  }
                } catch (e) {
                  console.warn("[Vue Devtools] Failed to send message to parent window", e);
                }
              };
              hook = {
                devtoolsVersion,
                // eslint-disable-next-line accessor-pairs
                set Vue(value) {
                  sendToParent((hook2) => {
                    hook2.Vue = value;
                  });
                },
                // eslint-disable-next-line accessor-pairs
                set enabled(value) {
                  sendToParent((hook2) => {
                    hook2.enabled = value;
                  });
                },
                on(event, fn) {
                  sendToParent((hook2) => hook2.on(event, fn));
                },
                once(event, fn) {
                  sendToParent((hook2) => hook2.once(event, fn));
                },
                off(event, fn) {
                  sendToParent((hook2) => hook2.off(event, fn));
                },
                emit(event, ...args) {
                  sendToParent((hook2) => hook2.emit(event, ...args));
                },
                cleanupBuffer(matchArg) {
                  var _a;
                  return (_a = sendToParent((hook2) => hook2.cleanupBuffer(matchArg))) !== null && _a !== void 0 ? _a : false;
                }
              };
            } else {
              hook = {
                devtoolsVersion,
                Vue: null,
                enabled: void 0,
                _buffer: [],
                store: null,
                initialState: null,
                storeModules: null,
                flushStoreModules: null,
                apps: [],
                _replayBuffer(event) {
                  const buffer = this._buffer;
                  this._buffer = [];
                  for (let i2 = 0, l2 = buffer.length; i2 < l2; i2++) {
                    const allArgs = buffer[i2];
                    allArgs[0] === event ? this.emit.apply(this, allArgs) : this._buffer.push(allArgs);
                  }
                },
                on(event, fn) {
                  const $event = "$" + event;
                  if (listeners[$event]) {
                    listeners[$event].push(fn);
                  } else {
                    listeners[$event] = [fn];
                    this._replayBuffer(event);
                  }
                },
                once(event, fn) {
                  const on = (...args) => {
                    this.off(event, on);
                    return fn.apply(this, args);
                  };
                  this.on(event, on);
                },
                off(event, fn) {
                  event = "$" + event;
                  if (!arguments.length) {
                    listeners = {};
                  } else {
                    const cbs = listeners[event];
                    if (cbs) {
                      if (!fn) {
                        listeners[event] = null;
                      } else {
                        for (let i2 = 0, l2 = cbs.length; i2 < l2; i2++) {
                          const cb = cbs[i2];
                          if (cb === fn || cb.fn === fn) {
                            cbs.splice(i2, 1);
                            break;
                          }
                        }
                      }
                    }
                  }
                },
                emit(event, ...args) {
                  const $event = "$" + event;
                  let cbs = listeners[$event];
                  if (cbs) {
                    cbs = cbs.slice();
                    for (let i2 = 0, l2 = cbs.length; i2 < l2; i2++) {
                      try {
                        const result = cbs[i2].apply(this, args);
                        if (typeof (result === null || result === void 0 ? void 0 : result.catch) === "function") {
                          result.catch((e) => {
                            console.error(`[Hook] Error in async event handler for ${event} with args:`, args);
                            console.error(e);
                          });
                        }
                      } catch (e) {
                        console.error(`[Hook] Error in event handler for ${event} with args:`, args);
                        console.error(e);
                      }
                    }
                  } else {
                    this._buffer.push([event, ...args]);
                  }
                },
                /**
                 * Remove buffered events with any argument that is equal to the given value.
                 * @param matchArg Given value to match.
                 */
                cleanupBuffer(matchArg) {
                  let wasBuffered = false;
                  this._buffer = this._buffer.filter((item) => {
                    if (item.some((arg) => arg === matchArg)) {
                      wasBuffered = true;
                      return false;
                    }
                    return true;
                  });
                  return wasBuffered;
                }
              };
              hook.once("init", (Vue2) => {
                hook.Vue = Vue2;
                if (Vue2) {
                  Vue2.prototype.$inspect = function() {
                    const fn = target.__VUE_DEVTOOLS_INSPECT__;
                    fn && fn(this);
                  };
                }
              });
              hook.on("app:init", (app, version, types) => {
                const appRecord = {
                  app,
                  version,
                  types
                };
                hook.apps.push(appRecord);
                hook.emit("app:add", appRecord);
              });
              hook.once("vuex:init", (store) => {
                hook.store = store;
                hook.initialState = clone(store.state);
                const origReplaceState = store.replaceState.bind(store);
                store.replaceState = (state) => {
                  hook.initialState = clone(state);
                  origReplaceState(state);
                };
                let origRegister, origUnregister;
                if (store.registerModule) {
                  hook.storeModules = [];
                  origRegister = store.registerModule.bind(store);
                  store.registerModule = (path, module, options) => {
                    if (typeof path === "string")
                      path = [path];
                    hook.storeModules.push({
                      path,
                      module,
                      options
                    });
                    origRegister(path, module, options);
                    {
                      console.log("early register module", path, module, options);
                    }
                  };
                  origUnregister = store.unregisterModule.bind(store);
                  store.unregisterModule = (path) => {
                    if (typeof path === "string")
                      path = [path];
                    const key = path.join("/");
                    const index = hook.storeModules.findIndex((m2) => m2.path.join("/") === key);
                    if (index !== -1)
                      hook.storeModules.splice(index, 1);
                    origUnregister(path);
                    {
                      console.log("early unregister module", path);
                    }
                  };
                }
                hook.flushStoreModules = () => {
                  store.replaceState = origReplaceState;
                  if (store.registerModule) {
                    store.registerModule = origRegister;
                    store.unregisterModule = origUnregister;
                  }
                  return hook.storeModules || [];
                };
              });
            }
            {
              uni.syncDataToGlobal({
                __VUE_DEVTOOLS_GLOBAL_HOOK__: hook
              });
            }
            Object.defineProperty(target, "__VUE_DEVTOOLS_GLOBAL_HOOK__", {
              get() {
                return hook;
              }
            });
            if (target.__VUE_DEVTOOLS_HOOK_REPLAY__) {
              try {
                target.__VUE_DEVTOOLS_HOOK_REPLAY__.forEach((cb) => cb(hook));
                target.__VUE_DEVTOOLS_HOOK_REPLAY__ = [];
              } catch (e) {
                console.error("[vue-devtools] Error during hook replay", e);
              }
            }
            const {
              toString: toStringFunction
            } = Function.prototype;
            const {
              create,
              defineProperty,
              getOwnPropertyDescriptor,
              getOwnPropertyNames,
              getOwnPropertySymbols,
              getPrototypeOf
            } = Object;
            const {
              hasOwnProperty: hasOwnProperty2,
              propertyIsEnumerable
            } = Object.prototype;
            const SUPPORTS = {
              SYMBOL_PROPERTIES: typeof getOwnPropertySymbols === "function",
              WEAKSET: typeof WeakSet === "function"
            };
            const createCache = () => {
              if (SUPPORTS.WEAKSET) {
                return /* @__PURE__ */ new WeakSet();
              }
              const object = create({
                add: (value) => object._values.push(value),
                has: (value) => !!~object._values.indexOf(value)
              });
              object._values = [];
              return object;
            };
            const getCleanClone = (object, realm) => {
              if (!object.constructor) {
                return create(null);
              }
              const prototype = object.__proto__ || getPrototypeOf(object);
              if (object.constructor === realm.Object) {
                return prototype === realm.Object.prototype ? {} : create(prototype);
              }
              if (~toStringFunction.call(object.constructor).indexOf("[native code]")) {
                try {
                  return new object.constructor();
                } catch (e) {
                }
              }
              return create(prototype);
            };
            const getObjectCloneLoose = (object, realm, handleCopy, cache) => {
              const clone2 = getCleanClone(object, realm);
              for (const key in object) {
                if (hasOwnProperty2.call(object, key)) {
                  clone2[key] = handleCopy(object[key], cache);
                }
              }
              if (SUPPORTS.SYMBOL_PROPERTIES) {
                const symbols = getOwnPropertySymbols(object);
                if (symbols.length) {
                  for (let index = 0, symbol; index < symbols.length; index++) {
                    symbol = symbols[index];
                    if (propertyIsEnumerable.call(object, symbol)) {
                      clone2[symbol] = handleCopy(object[symbol], cache);
                    }
                  }
                }
              }
              return clone2;
            };
            const getObjectCloneStrict = (object, realm, handleCopy, cache) => {
              const clone2 = getCleanClone(object, realm);
              const properties = SUPPORTS.SYMBOL_PROPERTIES ? [].concat(getOwnPropertyNames(object), getOwnPropertySymbols(object)) : getOwnPropertyNames(object);
              if (properties.length) {
                for (let index = 0, property, descriptor; index < properties.length; index++) {
                  property = properties[index];
                  if (property !== "callee" && property !== "caller") {
                    descriptor = getOwnPropertyDescriptor(object, property);
                    descriptor.value = handleCopy(object[property], cache);
                    defineProperty(clone2, property, descriptor);
                  }
                }
              }
              return clone2;
            };
            const getRegExpFlags = (regExp) => {
              let flags = "";
              if (regExp.global) {
                flags += "g";
              }
              if (regExp.ignoreCase) {
                flags += "i";
              }
              if (regExp.multiline) {
                flags += "m";
              }
              if (regExp.unicode) {
                flags += "u";
              }
              if (regExp.sticky) {
                flags += "y";
              }
              return flags;
            };
            const {
              isArray
            } = Array;
            const GLOBAL_THIS = (() => {
              if (typeof self !== "undefined") {
                return self;
              }
              if (typeof window !== "undefined") {
                return window;
              }
              if (typeof __webpack_require__2.g !== "undefined") {
                return __webpack_require__2.g;
              }
              if (console && console.error) {
                console.error('Unable to locate global object, returning "this".');
              }
            })();
            function clone(object, options = null) {
              const isStrict = !!(options && options.isStrict);
              const realm = options && options.realm || GLOBAL_THIS;
              const getObjectClone = isStrict ? getObjectCloneStrict : getObjectCloneLoose;
              const handleCopy = (object2, cache) => {
                if (!object2 || typeof object2 !== "object" || cache.has(object2)) {
                  return object2;
                }
                if (typeof HTMLElement !== "undefined" && object2 instanceof HTMLElement) {
                  return object2.cloneNode(false);
                }
                const Constructor = object2.constructor;
                if (Constructor === realm.Object) {
                  cache.add(object2);
                  return getObjectClone(object2, realm, handleCopy, cache);
                }
                let clone2;
                if (isArray(object2)) {
                  cache.add(object2);
                  if (isStrict) {
                    return getObjectCloneStrict(object2, realm, handleCopy, cache);
                  }
                  clone2 = new Constructor();
                  for (let index = 0; index < object2.length; index++) {
                    clone2[index] = handleCopy(object2[index], cache);
                  }
                  return clone2;
                }
                if (object2 instanceof realm.Date) {
                  return new Constructor(object2.getTime());
                }
                if (object2 instanceof realm.RegExp) {
                  clone2 = new Constructor(object2.source, object2.flags || getRegExpFlags(object2));
                  clone2.lastIndex = object2.lastIndex;
                  return clone2;
                }
                if (realm.Map && object2 instanceof realm.Map) {
                  cache.add(object2);
                  clone2 = new Constructor();
                  object2.forEach((value, key) => {
                    clone2.set(key, handleCopy(value, cache));
                  });
                  return clone2;
                }
                if (realm.Set && object2 instanceof realm.Set) {
                  cache.add(object2);
                  clone2 = new Constructor();
                  object2.forEach((value) => {
                    clone2.add(handleCopy(value, cache));
                  });
                  return clone2;
                }
                if (realm.Buffer && realm.Buffer.isBuffer(object2)) {
                  clone2 = realm.Buffer.allocUnsafe ? realm.Buffer.allocUnsafe(object2.length) : new Constructor(object2.length);
                  object2.copy(clone2);
                  return clone2;
                }
                if (realm.ArrayBuffer) {
                  if (realm.ArrayBuffer.isView(object2)) {
                    return new Constructor(object2.buffer.slice(0));
                  }
                  if (object2 instanceof realm.ArrayBuffer) {
                    return object2.slice(0);
                  }
                }
                if (
                  // promise-like
                  hasOwnProperty2.call(object2, "then") && typeof object2.then === "function" || // errors
                  object2 instanceof Error || // weakmaps
                  realm.WeakMap && object2 instanceof realm.WeakMap || // weaksets
                  realm.WeakSet && object2 instanceof realm.WeakSet
                ) {
                  return object2;
                }
                cache.add(object2);
                return getObjectClone(object2, realm, handleCopy, cache);
              };
              return handleCopy(object, createCache());
            }
          }
          exports.installHook = installHook;
        }
      ),
      /***/
      "../shared-utils/lib/backend.js": (
        /*!**************************************!*\
          !*** ../shared-utils/lib/backend.js ***!
          \**************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.getCatchedGetters = exports.getCustomStoreDetails = exports.getCustomRouterDetails = exports.isVueInstance = exports.getCustomObjectDetails = exports.getCustomInstanceDetails = exports.getInstanceMap = exports.backendInjections = void 0;
          exports.backendInjections = {
            instanceMap: /* @__PURE__ */ new Map(),
            isVueInstance: () => false,
            getCustomInstanceDetails: () => ({}),
            getCustomObjectDetails: () => void 0
          };
          function getInstanceMap() {
            return exports.backendInjections.instanceMap;
          }
          exports.getInstanceMap = getInstanceMap;
          function getCustomInstanceDetails(instance) {
            return exports.backendInjections.getCustomInstanceDetails(instance);
          }
          exports.getCustomInstanceDetails = getCustomInstanceDetails;
          function getCustomObjectDetails(value, proto) {
            return exports.backendInjections.getCustomObjectDetails(value, proto);
          }
          exports.getCustomObjectDetails = getCustomObjectDetails;
          function isVueInstance(value) {
            return exports.backendInjections.isVueInstance(value);
          }
          exports.isVueInstance = isVueInstance;
          function getCustomRouterDetails(router) {
            return {
              _custom: {
                type: "router",
                display: "VueRouter",
                value: {
                  options: router.options,
                  currentRoute: router.currentRoute
                },
                fields: {
                  abstract: true
                }
              }
            };
          }
          exports.getCustomRouterDetails = getCustomRouterDetails;
          function getCustomStoreDetails(store) {
            return {
              _custom: {
                type: "store",
                display: "Store",
                value: {
                  state: store.state,
                  getters: getCatchedGetters(store)
                },
                fields: {
                  abstract: true
                }
              }
            };
          }
          exports.getCustomStoreDetails = getCustomStoreDetails;
          function getCatchedGetters(store) {
            const getters = {};
            const origGetters = store.getters || {};
            const keys = Object.keys(origGetters);
            for (let i2 = 0; i2 < keys.length; i2++) {
              const key = keys[i2];
              Object.defineProperty(getters, key, {
                enumerable: true,
                get: () => {
                  try {
                    return origGetters[key];
                  } catch (e) {
                    return e;
                  }
                }
              });
            }
            return getters;
          }
          exports.getCatchedGetters = getCatchedGetters;
        }
      ),
      /***/
      "../shared-utils/lib/bridge.js": (
        /*!*************************************!*\
          !*** ../shared-utils/lib/bridge.js ***!
          \*************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.Bridge = void 0;
          const events_1 = __webpack_require__2(
            /*! events */
            "../../node_modules/events/events.js"
          );
          const raf_1 = __webpack_require__2(
            /*! ./raf */
            "../shared-utils/lib/raf.js"
          );
          const BATCH_DURATION = 100;
          class Bridge extends events_1.EventEmitter {
            constructor(wall) {
              super();
              this.setMaxListeners(Infinity);
              this.wall = wall;
              wall.listen((messages) => {
                if (Array.isArray(messages)) {
                  messages.forEach((message) => this._emit(message));
                } else {
                  this._emit(messages);
                }
              });
              this._batchingQueue = [];
              this._sendingQueue = [];
              this._receivingQueue = [];
              this._sending = false;
            }
            on(event, listener) {
              const wrappedListener = async (...args) => {
                try {
                  await listener(...args);
                } catch (e) {
                  console.error(`[Bridge] Error in listener for event ${event.toString()} with args:`, args);
                  console.error(e);
                }
              };
              return super.on(event, wrappedListener);
            }
            send(event, payload) {
              this._batchingQueue.push({
                event,
                payload
              });
              if (this._timer == null) {
                this._timer = setTimeout(() => this._flush(), BATCH_DURATION);
              }
            }
            /**
             * Log a message to the devtools background page.
             */
            log(message) {
              this.send("log", message);
            }
            _flush() {
              if (this._batchingQueue.length)
                this._send(this._batchingQueue);
              clearTimeout(this._timer);
              this._timer = null;
              this._batchingQueue = [];
            }
            // @TODO types
            _emit(message) {
              if (typeof message === "string") {
                this.emit(message);
              } else if (message._chunk) {
                this._receivingQueue.push(message._chunk);
                if (message.last) {
                  this.emit(message.event, this._receivingQueue);
                  this._receivingQueue = [];
                }
              } else if (message.event) {
                this.emit(message.event, message.payload);
              }
            }
            // @TODO types
            _send(messages) {
              this._sendingQueue.push(messages);
              this._nextSend();
            }
            _nextSend() {
              if (!this._sendingQueue.length || this._sending)
                return;
              this._sending = true;
              const messages = this._sendingQueue.shift();
              try {
                this.wall.send(messages);
              } catch (err) {
                if (err.message === "Message length exceeded maximum allowed length.") {
                  this._sendingQueue.splice(0, 0, messages.map((message) => [message]));
                }
              }
              this._sending = false;
              (0, raf_1.raf)(() => this._nextSend());
            }
          }
          exports.Bridge = Bridge;
        }
      ),
      /***/
      "../shared-utils/lib/consts.js": (
        /*!*************************************!*\
          !*** ../shared-utils/lib/consts.js ***!
          \*************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.HookEvents = exports.BridgeSubscriptions = exports.BridgeEvents = exports.BuiltinTabs = void 0;
          (function(BuiltinTabs) {
            BuiltinTabs["COMPONENTS"] = "components";
            BuiltinTabs["TIMELINE"] = "timeline";
            BuiltinTabs["PLUGINS"] = "plugins";
            BuiltinTabs["SETTINGS"] = "settings";
          })(exports.BuiltinTabs || (exports.BuiltinTabs = {}));
          (function(BridgeEvents) {
            BridgeEvents["TO_BACK_SUBSCRIBE"] = "b:subscribe";
            BridgeEvents["TO_BACK_UNSUBSCRIBE"] = "b:unsubscribe";
            BridgeEvents["TO_FRONT_READY"] = "f:ready";
            BridgeEvents["TO_BACK_LOG_DETECTED_VUE"] = "b:log-detected-vue";
            BridgeEvents["TO_BACK_REFRESH"] = "b:refresh";
            BridgeEvents["TO_BACK_TAB_SWITCH"] = "b:tab:switch";
            BridgeEvents["TO_BACK_LOG"] = "b:log";
            BridgeEvents["TO_FRONT_RECONNECTED"] = "f:reconnected";
            BridgeEvents["TO_FRONT_TITLE"] = "f:title";
            BridgeEvents["TO_FRONT_APP_ADD"] = "f:app:add";
            BridgeEvents["TO_BACK_APP_LIST"] = "b:app:list";
            BridgeEvents["TO_FRONT_APP_LIST"] = "f:app:list";
            BridgeEvents["TO_FRONT_APP_REMOVE"] = "f:app:remove";
            BridgeEvents["TO_BACK_APP_SELECT"] = "b:app:select";
            BridgeEvents["TO_FRONT_APP_SELECTED"] = "f:app:selected";
            BridgeEvents["TO_BACK_SCAN_LEGACY_APPS"] = "b:app:scan-legacy";
            BridgeEvents["TO_BACK_COMPONENT_TREE"] = "b:component:tree";
            BridgeEvents["TO_FRONT_COMPONENT_TREE"] = "f:component:tree";
            BridgeEvents["TO_BACK_COMPONENT_SELECTED_DATA"] = "b:component:selected-data";
            BridgeEvents["TO_FRONT_COMPONENT_SELECTED_DATA"] = "f:component:selected-data";
            BridgeEvents["TO_BACK_COMPONENT_EXPAND"] = "b:component:expand";
            BridgeEvents["TO_FRONT_COMPONENT_EXPAND"] = "f:component:expand";
            BridgeEvents["TO_BACK_COMPONENT_SCROLL_TO"] = "b:component:scroll-to";
            BridgeEvents["TO_BACK_COMPONENT_FILTER"] = "b:component:filter";
            BridgeEvents["TO_BACK_COMPONENT_MOUSE_OVER"] = "b:component:mouse-over";
            BridgeEvents["TO_BACK_COMPONENT_MOUSE_OUT"] = "b:component:mouse-out";
            BridgeEvents["TO_BACK_COMPONENT_CONTEXT_MENU_TARGET"] = "b:component:context-menu-target";
            BridgeEvents["TO_BACK_COMPONENT_EDIT_STATE"] = "b:component:edit-state";
            BridgeEvents["TO_BACK_COMPONENT_PICK"] = "b:component:pick";
            BridgeEvents["TO_FRONT_COMPONENT_PICK"] = "f:component:pick";
            BridgeEvents["TO_BACK_COMPONENT_PICK_CANCELED"] = "b:component:pick-canceled";
            BridgeEvents["TO_FRONT_COMPONENT_PICK_CANCELED"] = "f:component:pick-canceled";
            BridgeEvents["TO_BACK_COMPONENT_INSPECT_DOM"] = "b:component:inspect-dom";
            BridgeEvents["TO_FRONT_COMPONENT_INSPECT_DOM"] = "f:component:inspect-dom";
            BridgeEvents["TO_BACK_COMPONENT_RENDER_CODE"] = "b:component:render-code";
            BridgeEvents["TO_FRONT_COMPONENT_RENDER_CODE"] = "f:component:render-code";
            BridgeEvents["TO_FRONT_COMPONENT_UPDATED"] = "f:component:updated";
            BridgeEvents["TO_FRONT_TIMELINE_EVENT"] = "f:timeline:event";
            BridgeEvents["TO_BACK_TIMELINE_LAYER_LIST"] = "b:timeline:layer-list";
            BridgeEvents["TO_FRONT_TIMELINE_LAYER_LIST"] = "f:timeline:layer-list";
            BridgeEvents["TO_FRONT_TIMELINE_LAYER_ADD"] = "f:timeline:layer-add";
            BridgeEvents["TO_BACK_TIMELINE_SHOW_SCREENSHOT"] = "b:timeline:show-screenshot";
            BridgeEvents["TO_BACK_TIMELINE_CLEAR"] = "b:timeline:clear";
            BridgeEvents["TO_BACK_TIMELINE_EVENT_DATA"] = "b:timeline:event-data";
            BridgeEvents["TO_FRONT_TIMELINE_EVENT_DATA"] = "f:timeline:event-data";
            BridgeEvents["TO_BACK_TIMELINE_LAYER_LOAD_EVENTS"] = "b:timeline:layer-load-events";
            BridgeEvents["TO_FRONT_TIMELINE_LAYER_LOAD_EVENTS"] = "f:timeline:layer-load-events";
            BridgeEvents["TO_BACK_TIMELINE_LOAD_MARKERS"] = "b:timeline:load-markers";
            BridgeEvents["TO_FRONT_TIMELINE_LOAD_MARKERS"] = "f:timeline:load-markers";
            BridgeEvents["TO_FRONT_TIMELINE_MARKER"] = "f:timeline:marker";
            BridgeEvents["TO_BACK_DEVTOOLS_PLUGIN_LIST"] = "b:devtools-plugin:list";
            BridgeEvents["TO_FRONT_DEVTOOLS_PLUGIN_LIST"] = "f:devtools-plugin:list";
            BridgeEvents["TO_FRONT_DEVTOOLS_PLUGIN_ADD"] = "f:devtools-plugin:add";
            BridgeEvents["TO_BACK_DEVTOOLS_PLUGIN_SETTING_UPDATED"] = "b:devtools-plugin:setting-updated";
            BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_LIST"] = "b:custom-inspector:list";
            BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_LIST"] = "f:custom-inspector:list";
            BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_ADD"] = "f:custom-inspector:add";
            BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_TREE"] = "b:custom-inspector:tree";
            BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_TREE"] = "f:custom-inspector:tree";
            BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_STATE"] = "b:custom-inspector:state";
            BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_STATE"] = "f:custom-inspector:state";
            BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_EDIT_STATE"] = "b:custom-inspector:edit-state";
            BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_ACTION"] = "b:custom-inspector:action";
            BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_NODE_ACTION"] = "b:custom-inspector:node-action";
            BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_SELECT_NODE"] = "f:custom-inspector:select-node";
            BridgeEvents["TO_BACK_CUSTOM_STATE_ACTION"] = "b:custom-state:action";
          })(exports.BridgeEvents || (exports.BridgeEvents = {}));
          (function(BridgeSubscriptions) {
            BridgeSubscriptions["SELECTED_COMPONENT_DATA"] = "component:selected-data";
            BridgeSubscriptions["COMPONENT_TREE"] = "component:tree";
          })(exports.BridgeSubscriptions || (exports.BridgeSubscriptions = {}));
          (function(HookEvents) {
            HookEvents["INIT"] = "init";
            HookEvents["APP_INIT"] = "app:init";
            HookEvents["APP_ADD"] = "app:add";
            HookEvents["APP_UNMOUNT"] = "app:unmount";
            HookEvents["COMPONENT_UPDATED"] = "component:updated";
            HookEvents["COMPONENT_ADDED"] = "component:added";
            HookEvents["COMPONENT_REMOVED"] = "component:removed";
            HookEvents["COMPONENT_EMIT"] = "component:emit";
            HookEvents["COMPONENT_HIGHLIGHT"] = "component:highlight";
            HookEvents["COMPONENT_UNHIGHLIGHT"] = "component:unhighlight";
            HookEvents["SETUP_DEVTOOLS_PLUGIN"] = "devtools-plugin:setup";
            HookEvents["TIMELINE_LAYER_ADDED"] = "timeline:layer-added";
            HookEvents["TIMELINE_EVENT_ADDED"] = "timeline:event-added";
            HookEvents["CUSTOM_INSPECTOR_ADD"] = "custom-inspector:add";
            HookEvents["CUSTOM_INSPECTOR_SEND_TREE"] = "custom-inspector:send-tree";
            HookEvents["CUSTOM_INSPECTOR_SEND_STATE"] = "custom-inspector:send-state";
            HookEvents["CUSTOM_INSPECTOR_SELECT_NODE"] = "custom-inspector:select-node";
            HookEvents["PERFORMANCE_START"] = "perf:start";
            HookEvents["PERFORMANCE_END"] = "perf:end";
            HookEvents["PLUGIN_SETTINGS_SET"] = "plugin:settings:set";
            HookEvents["FLUSH"] = "flush";
            HookEvents["TRACK_UPDATE"] = "_track-update";
            HookEvents["FLASH_UPDATE"] = "_flash-update";
          })(exports.HookEvents || (exports.HookEvents = {}));
        }
      ),
      /***/
      "../shared-utils/lib/edit.js": (
        /*!***********************************!*\
          !*** ../shared-utils/lib/edit.js ***!
          \***********************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.StateEditor = void 0;
          class StateEditor {
            set(object, path, value, cb = null) {
              const sections = Array.isArray(path) ? path : path.split(".");
              while (sections.length > 1) {
                object = object[sections.shift()];
                if (this.isRef(object)) {
                  object = this.getRefValue(object);
                }
              }
              const field = sections[0];
              if (cb) {
                cb(object, field, value);
              } else if (this.isRef(object[field])) {
                this.setRefValue(object[field], value);
              } else {
                object[field] = value;
              }
            }
            get(object, path) {
              const sections = Array.isArray(path) ? path : path.split(".");
              for (let i2 = 0; i2 < sections.length; i2++) {
                object = object[sections[i2]];
                if (this.isRef(object)) {
                  object = this.getRefValue(object);
                }
                if (!object) {
                  return void 0;
                }
              }
              return object;
            }
            has(object, path, parent = false) {
              if (typeof object === "undefined") {
                return false;
              }
              const sections = Array.isArray(path) ? path.slice() : path.split(".");
              const size = !parent ? 1 : 2;
              while (object && sections.length > size) {
                object = object[sections.shift()];
                if (this.isRef(object)) {
                  object = this.getRefValue(object);
                }
              }
              return object != null && Object.prototype.hasOwnProperty.call(object, sections[0]);
            }
            createDefaultSetCallback(state) {
              return (obj, field, value) => {
                if (state.remove || state.newKey) {
                  if (Array.isArray(obj)) {
                    obj.splice(field, 1);
                  } else {
                    delete obj[field];
                  }
                }
                if (!state.remove) {
                  const target = obj[state.newKey || field];
                  if (this.isRef(target)) {
                    this.setRefValue(target, value);
                  } else {
                    obj[state.newKey || field] = value;
                  }
                }
              };
            }
            isRef(ref) {
              return false;
            }
            setRefValue(ref, value) {
            }
            getRefValue(ref) {
              return ref;
            }
          }
          exports.StateEditor = StateEditor;
        }
      ),
      /***/
      "../shared-utils/lib/env.js": (
        /*!**********************************!*\
          !*** ../shared-utils/lib/env.js ***!
          \**********************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.initEnv = exports.keys = exports.isLinux = exports.isMac = exports.isWindows = exports.isFirefox = exports.isChrome = exports.target = exports.isBrowser = void 0;
          exports.isBrowser = typeof navigator !== "undefined" && typeof window !== "undefined";
          exports.target = exports.isBrowser ? window : typeof globalThis !== "undefined" ? globalThis : typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof my !== "undefined" ? my : {};
          exports.isChrome = typeof exports.target.chrome !== "undefined" && !!exports.target.chrome.devtools;
          exports.isFirefox = exports.isBrowser && navigator.userAgent && navigator.userAgent.indexOf("Firefox") > -1;
          exports.isWindows = exports.isBrowser && navigator.platform.indexOf("Win") === 0;
          exports.isMac = exports.isBrowser && navigator.platform === "MacIntel";
          exports.isLinux = exports.isBrowser && navigator.platform.indexOf("Linux") === 0;
          exports.keys = {
            ctrl: exports.isMac ? "&#8984;" : "Ctrl",
            shift: "Shift",
            alt: exports.isMac ? "&#8997;" : "Alt",
            del: "Del",
            enter: "Enter",
            esc: "Esc"
          };
          function initEnv(Vue2) {
            if (Vue2.prototype.hasOwnProperty("$isChrome"))
              return;
            Object.defineProperties(Vue2.prototype, {
              $isChrome: {
                get: () => exports.isChrome
              },
              $isFirefox: {
                get: () => exports.isFirefox
              },
              $isWindows: {
                get: () => exports.isWindows
              },
              $isMac: {
                get: () => exports.isMac
              },
              $isLinux: {
                get: () => exports.isLinux
              },
              $keys: {
                get: () => exports.keys
              }
            });
            if (exports.isWindows)
              document.body.classList.add("platform-windows");
            if (exports.isMac)
              document.body.classList.add("platform-mac");
            if (exports.isLinux)
              document.body.classList.add("platform-linux");
          }
          exports.initEnv = initEnv;
        }
      ),
      /***/
      "../shared-utils/lib/index.js": (
        /*!************************************!*\
          !*** ../shared-utils/lib/index.js ***!
          \************************************/
        /***/
        function(__unused_webpack_module, exports, __webpack_require__2) {
          var __createBinding = this && this.__createBinding || (Object.create ? function(o2, m2, k2, k22) {
            if (k22 === void 0)
              k22 = k2;
            var desc = Object.getOwnPropertyDescriptor(m2, k2);
            if (!desc || ("get" in desc ? !m2.__esModule : desc.writable || desc.configurable)) {
              desc = {
                enumerable: true,
                get: function() {
                  return m2[k2];
                }
              };
            }
            Object.defineProperty(o2, k22, desc);
          } : function(o2, m2, k2, k22) {
            if (k22 === void 0)
              k22 = k2;
            o2[k22] = m2[k2];
          });
          var __exportStar = this && this.__exportStar || function(m2, exports2) {
            for (var p2 in m2)
              if (p2 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p2))
                __createBinding(exports2, m2, p2);
          };
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          __exportStar(__webpack_require__2(
            /*! ./backend */
            "../shared-utils/lib/backend.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./bridge */
            "../shared-utils/lib/bridge.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./consts */
            "../shared-utils/lib/consts.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./edit */
            "../shared-utils/lib/edit.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./env */
            "../shared-utils/lib/env.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./plugin-permissions */
            "../shared-utils/lib/plugin-permissions.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./plugin-settings */
            "../shared-utils/lib/plugin-settings.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./shared-data */
            "../shared-utils/lib/shared-data.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./shell */
            "../shared-utils/lib/shell.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./storage */
            "../shared-utils/lib/storage.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./transfer */
            "../shared-utils/lib/transfer.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./util */
            "../shared-utils/lib/util.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./raf */
            "../shared-utils/lib/raf.js"
          ), exports);
        }
      ),
      /***/
      "../shared-utils/lib/plugin-permissions.js": (
        /*!*************************************************!*\
          !*** ../shared-utils/lib/plugin-permissions.js ***!
          \*************************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.setPluginPermission = exports.hasPluginPermission = exports.PluginPermission = void 0;
          const shared_data_1 = __webpack_require__2(
            /*! ./shared-data */
            "../shared-utils/lib/shared-data.js"
          );
          (function(PluginPermission) {
            PluginPermission["ENABLED"] = "enabled";
            PluginPermission["COMPONENTS"] = "components";
            PluginPermission["CUSTOM_INSPECTOR"] = "custom-inspector";
            PluginPermission["TIMELINE"] = "timeline";
          })(exports.PluginPermission || (exports.PluginPermission = {}));
          function hasPluginPermission(pluginId, permission) {
            const result = shared_data_1.SharedData.pluginPermissions[`${pluginId}:${permission}`];
            if (result == null)
              return true;
            return !!result;
          }
          exports.hasPluginPermission = hasPluginPermission;
          function setPluginPermission(pluginId, permission, active) {
            shared_data_1.SharedData.pluginPermissions = {
              ...shared_data_1.SharedData.pluginPermissions,
              [`${pluginId}:${permission}`]: active
            };
          }
          exports.setPluginPermission = setPluginPermission;
        }
      ),
      /***/
      "../shared-utils/lib/plugin-settings.js": (
        /*!**********************************************!*\
          !*** ../shared-utils/lib/plugin-settings.js ***!
          \**********************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.getPluginDefaultSettings = exports.setPluginSettings = exports.getPluginSettings = void 0;
          const shared_data_1 = __webpack_require__2(
            /*! ./shared-data */
            "../shared-utils/lib/shared-data.js"
          );
          function getPluginSettings(pluginId, defaultSettings) {
            var _a;
            return {
              ...defaultSettings !== null && defaultSettings !== void 0 ? defaultSettings : {},
              ...(_a = shared_data_1.SharedData.pluginSettings[pluginId]) !== null && _a !== void 0 ? _a : {}
            };
          }
          exports.getPluginSettings = getPluginSettings;
          function setPluginSettings(pluginId, settings) {
            shared_data_1.SharedData.pluginSettings = {
              ...shared_data_1.SharedData.pluginSettings,
              [pluginId]: settings
            };
          }
          exports.setPluginSettings = setPluginSettings;
          function getPluginDefaultSettings(schema) {
            const result = {};
            if (schema) {
              for (const id in schema) {
                const item = schema[id];
                result[id] = item.defaultValue;
              }
            }
            return result;
          }
          exports.getPluginDefaultSettings = getPluginDefaultSettings;
        }
      ),
      /***/
      "../shared-utils/lib/raf.js": (
        /*!**********************************!*\
          !*** ../shared-utils/lib/raf.js ***!
          \**********************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.raf = void 0;
          let pendingCallbacks = [];
          exports.raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame : typeof setImmediate === "function" ? (fn) => {
            if (!pendingCallbacks.length) {
              setImmediate(() => {
                const now = performance.now();
                const cbs = pendingCallbacks;
                pendingCallbacks = [];
                cbs.forEach((cb) => cb(now));
              });
            }
            pendingCallbacks.push(fn);
          } : function(callback) {
            return setTimeout(function() {
              callback(Date.now());
            }, 1e3 / 60);
          };
        }
      ),
      /***/
      "../shared-utils/lib/shared-data.js": (
        /*!******************************************!*\
          !*** ../shared-utils/lib/shared-data.js ***!
          \******************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.SharedData = exports.watchSharedData = exports.destroySharedData = exports.onSharedDataInit = exports.initSharedData = void 0;
          const storage_1 = __webpack_require__2(
            /*! ./storage */
            "../shared-utils/lib/storage.js"
          );
          const env_1 = __webpack_require__2(
            /*! ./env */
            "../shared-utils/lib/env.js"
          );
          const internalSharedData = {
            openInEditorHost: "/",
            componentNameStyle: "class",
            theme: "auto",
            displayDensity: "low",
            timeFormat: "default",
            recordVuex: true,
            cacheVuexSnapshotsEvery: 50,
            cacheVuexSnapshotsLimit: 10,
            snapshotLoading: false,
            componentEventsEnabled: true,
            performanceMonitoringEnabled: true,
            editableProps: false,
            logDetected: true,
            vuexNewBackend: false,
            vuexAutoload: false,
            vuexGroupGettersByModule: true,
            showMenuScrollTip: true,
            timelineTimeGrid: true,
            timelineScreenshots: true,
            menuStepScrolling: env_1.isMac,
            pluginPermissions: {},
            pluginSettings: {},
            pageConfig: {},
            legacyApps: false,
            trackUpdates: true,
            flashUpdates: false,
            debugInfo: false,
            isBrowser: env_1.isBrowser
          };
          const persisted = ["componentNameStyle", "theme", "displayDensity", "recordVuex", "editableProps", "logDetected", "vuexNewBackend", "vuexAutoload", "vuexGroupGettersByModule", "timeFormat", "showMenuScrollTip", "timelineTimeGrid", "timelineScreenshots", "menuStepScrolling", "pluginPermissions", "pluginSettings", "performanceMonitoringEnabled", "componentEventsEnabled", "trackUpdates", "flashUpdates", "debugInfo"];
          const storageVersion = "6.0.0-alpha.1";
          let bridge;
          let persist = false;
          let data;
          let initRetryInterval;
          let initRetryCount = 0;
          const initCbs = [];
          function initSharedData(params) {
            return new Promise((resolve) => {
              bridge = params.bridge;
              persist = !!params.persist;
              if (persist) {
                {
                  console.log("[shared data] Master init in progress...");
                }
                persisted.forEach((key) => {
                  const value = (0, storage_1.getStorage)(`vue-devtools-${storageVersion}:shared-data:${key}`);
                  if (value !== null) {
                    internalSharedData[key] = value;
                  }
                });
                bridge.on("shared-data:load", () => {
                  Object.keys(internalSharedData).forEach((key) => {
                    sendValue(key, internalSharedData[key]);
                  });
                  bridge.send("shared-data:load-complete");
                });
                bridge.on("shared-data:init-complete", () => {
                  {
                    console.log("[shared data] Master init complete");
                  }
                  clearInterval(initRetryInterval);
                  resolve();
                });
                bridge.send("shared-data:master-init-waiting");
                bridge.on("shared-data:minion-init-waiting", () => {
                  bridge.send("shared-data:master-init-waiting");
                });
                initRetryCount = 0;
                clearInterval(initRetryInterval);
                initRetryInterval = setInterval(() => {
                  {
                    console.log("[shared data] Master init retrying...");
                  }
                  bridge.send("shared-data:master-init-waiting");
                  initRetryCount++;
                  if (initRetryCount > 30) {
                    clearInterval(initRetryInterval);
                    console.error("[shared data] Master init failed");
                  }
                }, 2e3);
              } else {
                bridge.on("shared-data:master-init-waiting", () => {
                  bridge.send("shared-data:load");
                  bridge.once("shared-data:load-complete", () => {
                    bridge.send("shared-data:init-complete");
                    resolve();
                  });
                });
                bridge.send("shared-data:minion-init-waiting");
              }
              data = {
                ...internalSharedData
              };
              if (params.Vue) {
                data = params.Vue.observable(data);
              }
              bridge.on("shared-data:set", ({
                key,
                value
              }) => {
                setValue(key, value);
              });
              initCbs.forEach((cb) => cb());
            });
          }
          exports.initSharedData = initSharedData;
          function onSharedDataInit(cb) {
            initCbs.push(cb);
            return () => {
              const index = initCbs.indexOf(cb);
              if (index !== -1)
                initCbs.splice(index, 1);
            };
          }
          exports.onSharedDataInit = onSharedDataInit;
          function destroySharedData() {
            bridge.removeAllListeners("shared-data:set");
            watchers = {};
          }
          exports.destroySharedData = destroySharedData;
          let watchers = {};
          function setValue(key, value) {
            if (persist && persisted.includes(key)) {
              (0, storage_1.setStorage)(`vue-devtools-${storageVersion}:shared-data:${key}`, value);
            }
            const oldValue = data[key];
            data[key] = value;
            const handlers = watchers[key];
            if (handlers) {
              handlers.forEach((h2) => h2(value, oldValue));
            }
            return true;
          }
          function sendValue(key, value) {
            bridge && bridge.send("shared-data:set", {
              key,
              value
            });
          }
          function watchSharedData(prop, handler) {
            const list = watchers[prop] || (watchers[prop] = []);
            list.push(handler);
            return () => {
              const index = list.indexOf(handler);
              if (index !== -1)
                list.splice(index, 1);
            };
          }
          exports.watchSharedData = watchSharedData;
          const proxy = {};
          Object.keys(internalSharedData).forEach((key) => {
            Object.defineProperty(proxy, key, {
              configurable: false,
              get: () => data[key],
              set: (value) => {
                sendValue(key, value);
                setValue(key, value);
              }
            });
          });
          exports.SharedData = proxy;
        }
      ),
      /***/
      "../shared-utils/lib/shell.js": (
        /*!************************************!*\
          !*** ../shared-utils/lib/shell.js ***!
          \************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
        }
      ),
      /***/
      "../shared-utils/lib/storage.js": (
        /*!**************************************!*\
          !*** ../shared-utils/lib/storage.js ***!
          \**************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.clearStorage = exports.removeStorage = exports.setStorage = exports.getStorage = exports.initStorage = void 0;
          const env_1 = __webpack_require__2(
            /*! ./env */
            "../shared-utils/lib/env.js"
          );
          const useStorage = typeof env_1.target.chrome !== "undefined" && typeof env_1.target.chrome.storage !== "undefined";
          let storageData = null;
          function initStorage() {
            return new Promise((resolve) => {
              if (useStorage) {
                env_1.target.chrome.storage.local.get(null, (result) => {
                  storageData = result;
                  resolve();
                });
              } else {
                storageData = {};
                resolve();
              }
            });
          }
          exports.initStorage = initStorage;
          function getStorage(key, defaultValue = null) {
            checkStorage();
            if (useStorage) {
              return getDefaultValue(storageData[key], defaultValue);
            } else {
              try {
                return getDefaultValue(JSON.parse(localStorage.getItem(key)), defaultValue);
              } catch (e) {
              }
            }
          }
          exports.getStorage = getStorage;
          function setStorage(key, val) {
            checkStorage();
            if (useStorage) {
              storageData[key] = val;
              env_1.target.chrome.storage.local.set({
                [key]: val
              });
            } else {
              try {
                localStorage.setItem(key, JSON.stringify(val));
              } catch (e) {
              }
            }
          }
          exports.setStorage = setStorage;
          function removeStorage(key) {
            checkStorage();
            if (useStorage) {
              delete storageData[key];
              env_1.target.chrome.storage.local.remove([key]);
            } else {
              try {
                localStorage.removeItem(key);
              } catch (e) {
              }
            }
          }
          exports.removeStorage = removeStorage;
          function clearStorage() {
            checkStorage();
            if (useStorage) {
              storageData = {};
              env_1.target.chrome.storage.local.clear();
            } else {
              try {
                localStorage.clear();
              } catch (e) {
              }
            }
          }
          exports.clearStorage = clearStorage;
          function checkStorage() {
            if (!storageData) {
              throw new Error("Storage wasn't initialized with 'init()'");
            }
          }
          function getDefaultValue(value, defaultValue) {
            if (value == null) {
              return defaultValue;
            }
            return value;
          }
        }
      ),
      /***/
      "../shared-utils/lib/transfer.js": (
        /*!***************************************!*\
          !*** ../shared-utils/lib/transfer.js ***!
          \***************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.stringifyStrictCircularAutoChunks = exports.parseCircularAutoChunks = exports.stringifyCircularAutoChunks = void 0;
          const MAX_SERIALIZED_SIZE = 512 * 1024;
          function encode(data, replacer, list, seen) {
            let stored, key, value, i2, l2;
            const seenIndex = seen.get(data);
            if (seenIndex != null) {
              return seenIndex;
            }
            const index = list.length;
            const proto = Object.prototype.toString.call(data);
            if (proto === "[object Object]") {
              stored = {};
              seen.set(data, index);
              list.push(stored);
              const keys = Object.keys(data);
              for (i2 = 0, l2 = keys.length; i2 < l2; i2++) {
                key = keys[i2];
                try {
                  value = data[key];
                  if (replacer)
                    value = replacer.call(data, key, value);
                } catch (e) {
                  value = e;
                }
                stored[key] = encode(value, replacer, list, seen);
              }
            } else if (proto === "[object Array]") {
              stored = [];
              seen.set(data, index);
              list.push(stored);
              for (i2 = 0, l2 = data.length; i2 < l2; i2++) {
                try {
                  value = data[i2];
                  if (replacer)
                    value = replacer.call(data, i2, value);
                } catch (e) {
                  value = e;
                }
                stored[i2] = encode(value, replacer, list, seen);
              }
            } else {
              list.push(data);
            }
            return index;
          }
          function decode(list, reviver) {
            let i2 = list.length;
            let j2, k2, data, key, value, proto;
            while (i2--) {
              data = list[i2];
              proto = Object.prototype.toString.call(data);
              if (proto === "[object Object]") {
                const keys = Object.keys(data);
                for (j2 = 0, k2 = keys.length; j2 < k2; j2++) {
                  key = keys[j2];
                  value = list[data[key]];
                  if (reviver)
                    value = reviver.call(data, key, value);
                  data[key] = value;
                }
              } else if (proto === "[object Array]") {
                for (j2 = 0, k2 = data.length; j2 < k2; j2++) {
                  value = list[data[j2]];
                  if (reviver)
                    value = reviver.call(data, j2, value);
                  data[j2] = value;
                }
              }
            }
          }
          function stringifyCircularAutoChunks(data, replacer = null, space = null) {
            let result;
            try {
              result = arguments.length === 1 ? JSON.stringify(data) : JSON.stringify(data, replacer, space);
            } catch (e) {
              result = stringifyStrictCircularAutoChunks(data, replacer, space);
            }
            if (result.length > MAX_SERIALIZED_SIZE) {
              const chunkCount = Math.ceil(result.length / MAX_SERIALIZED_SIZE);
              const chunks = [];
              for (let i2 = 0; i2 < chunkCount; i2++) {
                chunks.push(result.slice(i2 * MAX_SERIALIZED_SIZE, (i2 + 1) * MAX_SERIALIZED_SIZE));
              }
              return chunks;
            }
            return result;
          }
          exports.stringifyCircularAutoChunks = stringifyCircularAutoChunks;
          function parseCircularAutoChunks(data, reviver = null) {
            if (Array.isArray(data)) {
              data = data.join("");
            }
            const hasCircular = /^\s/.test(data);
            if (!hasCircular) {
              return arguments.length === 1 ? JSON.parse(data) : JSON.parse(data, reviver);
            } else {
              const list = JSON.parse(data);
              decode(list, reviver);
              return list[0];
            }
          }
          exports.parseCircularAutoChunks = parseCircularAutoChunks;
          function stringifyStrictCircularAutoChunks(data, replacer = null, space = null) {
            const list = [];
            encode(data, replacer, list, /* @__PURE__ */ new Map());
            return space ? " " + JSON.stringify(list, null, space) : " " + JSON.stringify(list);
          }
          exports.stringifyStrictCircularAutoChunks = stringifyStrictCircularAutoChunks;
        }
      ),
      /***/
      "../shared-utils/lib/util.js": (
        /*!***********************************!*\
          !*** ../shared-utils/lib/util.js ***!
          \***********************************/
        /***/
        function(__unused_webpack_module, exports, __webpack_require__2) {
          var __importDefault = this && this.__importDefault || function(mod) {
            return mod && mod.__esModule ? mod : {
              "default": mod
            };
          };
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.isEmptyObject = exports.copyToClipboard = exports.escape = exports.openInEditor = exports.focusInput = exports.simpleGet = exports.sortByKey = exports.searchDeepInObject = exports.isPlainObject = exports.revive = exports.parse = exports.getCustomRefDetails = exports.getCustomHTMLElementDetails = exports.getCustomFunctionDetails = exports.getCustomComponentDefinitionDetails = exports.getComponentName = exports.reviveSet = exports.getCustomSetDetails = exports.reviveMap = exports.getCustomMapDetails = exports.stringify = exports.specialTokenToString = exports.MAX_ARRAY_SIZE = exports.MAX_STRING_SIZE = exports.SPECIAL_TOKENS = exports.NAN = exports.NEGATIVE_INFINITY = exports.INFINITY = exports.UNDEFINED = exports.inDoc = exports.getComponentDisplayName = exports.kebabize = exports.camelize = exports.classify = void 0;
          const path_1 = __importDefault(__webpack_require__2(
            /*! path */
            "../../node_modules/path-browserify/index.js"
          ));
          const transfer_1 = __webpack_require__2(
            /*! ./transfer */
            "../shared-utils/lib/transfer.js"
          );
          const backend_1 = __webpack_require__2(
            /*! ./backend */
            "../shared-utils/lib/backend.js"
          );
          const shared_data_1 = __webpack_require__2(
            /*! ./shared-data */
            "../shared-utils/lib/shared-data.js"
          );
          const env_1 = __webpack_require__2(
            /*! ./env */
            "../shared-utils/lib/env.js"
          );
          function cached(fn) {
            const cache = /* @__PURE__ */ Object.create(null);
            return function cachedFn(str) {
              const hit = cache[str];
              return hit || (cache[str] = fn(str));
            };
          }
          const classifyRE = /(?:^|[-_/])(\w)/g;
          exports.classify = cached((str) => {
            return str && ("" + str).replace(classifyRE, toUpper);
          });
          const camelizeRE = /-(\w)/g;
          exports.camelize = cached((str) => {
            return str && str.replace(camelizeRE, toUpper);
          });
          const kebabizeRE = /([a-z0-9])([A-Z])/g;
          exports.kebabize = cached((str) => {
            return str && str.replace(kebabizeRE, (_2, lowerCaseCharacter, upperCaseLetter) => {
              return `${lowerCaseCharacter}-${upperCaseLetter}`;
            }).toLowerCase();
          });
          function toUpper(_2, c2) {
            return c2 ? c2.toUpperCase() : "";
          }
          function getComponentDisplayName(originalName, style = "class") {
            switch (style) {
              case "class":
                return (0, exports.classify)(originalName);
              case "kebab":
                return (0, exports.kebabize)(originalName);
              case "original":
              default:
                return originalName;
            }
          }
          exports.getComponentDisplayName = getComponentDisplayName;
          function inDoc(node) {
            if (!node)
              return false;
            const doc = node.ownerDocument.documentElement;
            const parent = node.parentNode;
            return doc === node || doc === parent || !!(parent && parent.nodeType === 1 && doc.contains(parent));
          }
          exports.inDoc = inDoc;
          exports.UNDEFINED = "__vue_devtool_undefined__";
          exports.INFINITY = "__vue_devtool_infinity__";
          exports.NEGATIVE_INFINITY = "__vue_devtool_negative_infinity__";
          exports.NAN = "__vue_devtool_nan__";
          exports.SPECIAL_TOKENS = {
            true: true,
            false: false,
            undefined: exports.UNDEFINED,
            null: null,
            "-Infinity": exports.NEGATIVE_INFINITY,
            Infinity: exports.INFINITY,
            NaN: exports.NAN
          };
          exports.MAX_STRING_SIZE = 1e4;
          exports.MAX_ARRAY_SIZE = 5e3;
          function specialTokenToString(value) {
            if (value === null) {
              return "null";
            } else if (value === exports.UNDEFINED) {
              return "undefined";
            } else if (value === exports.NAN) {
              return "NaN";
            } else if (value === exports.INFINITY) {
              return "Infinity";
            } else if (value === exports.NEGATIVE_INFINITY) {
              return "-Infinity";
            }
            return false;
          }
          exports.specialTokenToString = specialTokenToString;
          class EncodeCache {
            constructor() {
              this.map = /* @__PURE__ */ new Map();
            }
            /**
             * Returns a result unique to each input data
             * @param {*} data Input data
             * @param {*} factory Function used to create the unique result
             */
            cache(data, factory) {
              const cached2 = this.map.get(data);
              if (cached2) {
                return cached2;
              } else {
                const result = factory(data);
                this.map.set(data, result);
                return result;
              }
            }
            clear() {
              this.map.clear();
            }
          }
          const encodeCache = new EncodeCache();
          class ReviveCache {
            constructor(maxSize) {
              this.maxSize = maxSize;
              this.map = /* @__PURE__ */ new Map();
              this.index = 0;
              this.size = 0;
            }
            cache(value) {
              const currentIndex = this.index;
              this.map.set(currentIndex, value);
              this.size++;
              if (this.size > this.maxSize) {
                this.map.delete(currentIndex - this.size);
                this.size--;
              }
              this.index++;
              return currentIndex;
            }
            read(id) {
              return this.map.get(id);
            }
          }
          const reviveCache = new ReviveCache(1e3);
          const replacers = {
            internal: replacerForInternal,
            user: replaceForUser
          };
          function stringify(data, target = "internal") {
            encodeCache.clear();
            return (0, transfer_1.stringifyCircularAutoChunks)(data, replacers[target]);
          }
          exports.stringify = stringify;
          function replacerForInternal(key) {
            var _a;
            const val = this[key];
            const type = typeof val;
            if (Array.isArray(val)) {
              const l2 = val.length;
              if (l2 > exports.MAX_ARRAY_SIZE) {
                return {
                  _isArray: true,
                  length: l2,
                  items: val.slice(0, exports.MAX_ARRAY_SIZE)
                };
              }
              return val;
            } else if (typeof val === "string") {
              if (val.length > exports.MAX_STRING_SIZE) {
                return val.substring(0, exports.MAX_STRING_SIZE) + `... (${val.length} total length)`;
              } else {
                return val;
              }
            } else if (type === "undefined") {
              return exports.UNDEFINED;
            } else if (val === Infinity) {
              return exports.INFINITY;
            } else if (val === -Infinity) {
              return exports.NEGATIVE_INFINITY;
            } else if (type === "function") {
              return getCustomFunctionDetails(val);
            } else if (type === "symbol") {
              return `[native Symbol ${Symbol.prototype.toString.call(val)}]`;
            } else if (val !== null && type === "object") {
              const proto = Object.prototype.toString.call(val);
              if (proto === "[object Map]") {
                return encodeCache.cache(val, () => getCustomMapDetails(val));
              } else if (proto === "[object Set]") {
                return encodeCache.cache(val, () => getCustomSetDetails(val));
              } else if (proto === "[object RegExp]") {
                return `[native RegExp ${RegExp.prototype.toString.call(val)}]`;
              } else if (proto === "[object Date]") {
                return `[native Date ${Date.prototype.toString.call(val)}]`;
              } else if (proto === "[object Error]") {
                return `[native Error ${val.message}<>${val.stack}]`;
              } else if (val.state && val._vm) {
                return encodeCache.cache(val, () => (0, backend_1.getCustomStoreDetails)(val));
              } else if (val.constructor && val.constructor.name === "VueRouter") {
                return encodeCache.cache(val, () => (0, backend_1.getCustomRouterDetails)(val));
              } else if ((0, backend_1.isVueInstance)(val)) {
                return encodeCache.cache(val, () => (0, backend_1.getCustomInstanceDetails)(val));
              } else if (typeof val.render === "function") {
                return encodeCache.cache(val, () => getCustomComponentDefinitionDetails(val));
              } else if (val.constructor && val.constructor.name === "VNode") {
                return `[native VNode <${val.tag}>]`;
              } else if (typeof HTMLElement !== "undefined" && val instanceof HTMLElement) {
                return encodeCache.cache(val, () => getCustomHTMLElementDetails(val));
              } else if (((_a = val.constructor) === null || _a === void 0 ? void 0 : _a.name) === "Store" && val._wrappedGetters) {
                return `[object Store]`;
              } else if (val.currentRoute) {
                return `[object Router]`;
              }
              const customDetails = (0, backend_1.getCustomObjectDetails)(val, proto);
              if (customDetails != null)
                return customDetails;
            } else if (Number.isNaN(val)) {
              return exports.NAN;
            }
            return sanitize(val);
          }
          function replaceForUser(key) {
            let val = this[key];
            const type = typeof val;
            if ((val === null || val === void 0 ? void 0 : val._custom) && "value" in val._custom) {
              val = val._custom.value;
            }
            if (type !== "object") {
              if (val === exports.UNDEFINED) {
                return void 0;
              } else if (val === exports.INFINITY) {
                return Infinity;
              } else if (val === exports.NEGATIVE_INFINITY) {
                return -Infinity;
              } else if (val === exports.NAN) {
                return NaN;
              }
              return val;
            }
            return sanitize(val);
          }
          function getCustomMapDetails(val) {
            const list = [];
            val.forEach((value, key) => list.push({
              key,
              value
            }));
            return {
              _custom: {
                type: "map",
                display: "Map",
                value: list,
                readOnly: true,
                fields: {
                  abstract: true
                }
              }
            };
          }
          exports.getCustomMapDetails = getCustomMapDetails;
          function reviveMap(val) {
            const result = /* @__PURE__ */ new Map();
            const list = val._custom.value;
            for (let i2 = 0; i2 < list.length; i2++) {
              const {
                key,
                value
              } = list[i2];
              result.set(key, revive(value));
            }
            return result;
          }
          exports.reviveMap = reviveMap;
          function getCustomSetDetails(val) {
            const list = Array.from(val);
            return {
              _custom: {
                type: "set",
                display: `Set[${list.length}]`,
                value: list,
                readOnly: true
              }
            };
          }
          exports.getCustomSetDetails = getCustomSetDetails;
          function reviveSet(val) {
            const result = /* @__PURE__ */ new Set();
            const list = val._custom.value;
            for (let i2 = 0; i2 < list.length; i2++) {
              const value = list[i2];
              result.add(revive(value));
            }
            return result;
          }
          exports.reviveSet = reviveSet;
          function basename(filename, ext) {
            return path_1.default.basename(filename.replace(/^[a-zA-Z]:/, "").replace(/\\/g, "/"), ext);
          }
          function getComponentName(options) {
            const name = options.displayName || options.name || options._componentTag;
            if (name) {
              return name;
            }
            const file = options.__file;
            if (file) {
              return (0, exports.classify)(basename(file, ".vue"));
            }
          }
          exports.getComponentName = getComponentName;
          function getCustomComponentDefinitionDetails(def) {
            let display = getComponentName(def);
            if (display) {
              if (def.name && def.__file) {
                display += ` <span>(${def.__file})</span>`;
              }
            } else {
              display = "<i>Unknown Component</i>";
            }
            return {
              _custom: {
                type: "component-definition",
                display,
                tooltip: "Component definition",
                ...def.__file ? {
                  file: def.__file
                } : {}
              }
            };
          }
          exports.getCustomComponentDefinitionDetails = getCustomComponentDefinitionDetails;
          function getCustomFunctionDetails(func) {
            let string = "";
            let matches = null;
            try {
              string = Function.prototype.toString.call(func);
              matches = String.prototype.match.call(string, /\([\s\S]*?\)/);
            } catch (e) {
            }
            const match = matches && matches[0];
            const args = typeof match === "string" ? match : "(?)";
            const name = typeof func.name === "string" ? func.name : "";
            return {
              _custom: {
                type: "function",
                display: `<span style="opacity:.5;">function</span> ${escape2(name)}${args}`,
                tooltip: string.trim() ? `<pre>${string}</pre>` : null,
                _reviveId: reviveCache.cache(func)
              }
            };
          }
          exports.getCustomFunctionDetails = getCustomFunctionDetails;
          function getCustomHTMLElementDetails(value) {
            try {
              return {
                _custom: {
                  type: "HTMLElement",
                  display: `<span class="opacity-30">&lt;</span><span class="text-blue-500">${value.tagName.toLowerCase()}</span><span class="opacity-30">&gt;</span>`,
                  value: namedNodeMapToObject(value.attributes),
                  actions: [{
                    icon: "input",
                    tooltip: "Log element to console",
                    action: () => {
                      console.log(value);
                    }
                  }]
                }
              };
            } catch (e) {
              return {
                _custom: {
                  type: "HTMLElement",
                  display: `<span class="text-blue-500">${String(value)}</span>`
                }
              };
            }
          }
          exports.getCustomHTMLElementDetails = getCustomHTMLElementDetails;
          function namedNodeMapToObject(map) {
            const result = {};
            const l2 = map.length;
            for (let i2 = 0; i2 < l2; i2++) {
              const node = map.item(i2);
              result[node.name] = node.value;
            }
            return result;
          }
          function getCustomRefDetails(instance, key, ref) {
            let value;
            if (Array.isArray(ref)) {
              value = ref.map((r2) => getCustomRefDetails(instance, key, r2)).map((data) => data.value);
            } else {
              let name;
              if (ref._isVue) {
                name = getComponentName(ref.$options);
              } else {
                name = ref.tagName.toLowerCase();
              }
              value = {
                _custom: {
                  display: `&lt;${name}` + (ref.id ? ` <span class="attr-title">id</span>="${ref.id}"` : "") + (ref.className ? ` <span class="attr-title">class</span>="${ref.className}"` : "") + "&gt;",
                  uid: instance.__VUE_DEVTOOLS_UID__,
                  type: "reference"
                }
              };
            }
            return {
              type: "$refs",
              key,
              value,
              editable: false
            };
          }
          exports.getCustomRefDetails = getCustomRefDetails;
          function parse2(data, revive2 = false) {
            return revive2 ? (0, transfer_1.parseCircularAutoChunks)(data, reviver) : (0, transfer_1.parseCircularAutoChunks)(data);
          }
          exports.parse = parse2;
          const specialTypeRE = /^\[native (\w+) (.*?)(<>((.|\s)*))?\]$/;
          const symbolRE = /^\[native Symbol Symbol\((.*)\)\]$/;
          function reviver(key, val) {
            return revive(val);
          }
          function revive(val) {
            if (val === exports.UNDEFINED) {
              return void 0;
            } else if (val === exports.INFINITY) {
              return Infinity;
            } else if (val === exports.NEGATIVE_INFINITY) {
              return -Infinity;
            } else if (val === exports.NAN) {
              return NaN;
            } else if (val && val._custom) {
              const {
                _custom: custom
              } = val;
              if (custom.type === "component") {
                return (0, backend_1.getInstanceMap)().get(custom.id);
              } else if (custom.type === "map") {
                return reviveMap(val);
              } else if (custom.type === "set") {
                return reviveSet(val);
              } else if (custom._reviveId) {
                return reviveCache.read(custom._reviveId);
              } else {
                return revive(custom.value);
              }
            } else if (symbolRE.test(val)) {
              const [, string] = symbolRE.exec(val);
              return Symbol.for(string);
            } else if (specialTypeRE.test(val)) {
              const [, type, string, , details] = specialTypeRE.exec(val);
              const result = new env_1.target[type](string);
              if (type === "Error" && details) {
                result.stack = details;
              }
              return result;
            } else {
              return val;
            }
          }
          exports.revive = revive;
          function sanitize(data) {
            if (!isPrimitive(data) && !Array.isArray(data) && !isPlainObject(data)) {
              return Object.prototype.toString.call(data);
            } else {
              return data;
            }
          }
          function isPlainObject(obj) {
            return Object.prototype.toString.call(obj) === "[object Object]";
          }
          exports.isPlainObject = isPlainObject;
          function isPrimitive(data) {
            if (data == null) {
              return true;
            }
            const type = typeof data;
            return type === "string" || type === "number" || type === "boolean";
          }
          function searchDeepInObject(obj, searchTerm) {
            const seen = /* @__PURE__ */ new Map();
            const result = internalSearchObject(obj, searchTerm.toLowerCase(), seen, 0);
            seen.clear();
            return result;
          }
          exports.searchDeepInObject = searchDeepInObject;
          const SEARCH_MAX_DEPTH = 10;
          function internalSearchObject(obj, searchTerm, seen, depth) {
            if (depth > SEARCH_MAX_DEPTH) {
              return false;
            }
            let match = false;
            const keys = Object.keys(obj);
            let key, value;
            for (let i2 = 0; i2 < keys.length; i2++) {
              key = keys[i2];
              value = obj[key];
              match = internalSearchCheck(searchTerm, key, value, seen, depth + 1);
              if (match) {
                break;
              }
            }
            return match;
          }
          function internalSearchArray(array, searchTerm, seen, depth) {
            if (depth > SEARCH_MAX_DEPTH) {
              return false;
            }
            let match = false;
            let value;
            for (let i2 = 0; i2 < array.length; i2++) {
              value = array[i2];
              match = internalSearchCheck(searchTerm, null, value, seen, depth + 1);
              if (match) {
                break;
              }
            }
            return match;
          }
          function internalSearchCheck(searchTerm, key, value, seen, depth) {
            let match = false;
            let result;
            if (key === "_custom") {
              key = value.display;
              value = value.value;
            }
            (result = specialTokenToString(value)) && (value = result);
            if (key && compare(key, searchTerm)) {
              match = true;
              seen.set(value, true);
            } else if (seen.has(value)) {
              match = seen.get(value);
            } else if (Array.isArray(value)) {
              seen.set(value, null);
              match = internalSearchArray(value, searchTerm, seen, depth);
              seen.set(value, match);
            } else if (isPlainObject(value)) {
              seen.set(value, null);
              match = internalSearchObject(value, searchTerm, seen, depth);
              seen.set(value, match);
            } else if (compare(value, searchTerm)) {
              match = true;
              seen.set(value, true);
            }
            return match;
          }
          function compare(value, searchTerm) {
            return ("" + value).toLowerCase().indexOf(searchTerm) !== -1;
          }
          function sortByKey(state) {
            return state && state.slice().sort((a2, b2) => {
              if (a2.key < b2.key)
                return -1;
              if (a2.key > b2.key)
                return 1;
              return 0;
            });
          }
          exports.sortByKey = sortByKey;
          function simpleGet(object, path) {
            const sections = Array.isArray(path) ? path : path.split(".");
            for (let i2 = 0; i2 < sections.length; i2++) {
              object = object[sections[i2]];
              if (!object) {
                return void 0;
              }
            }
            return object;
          }
          exports.simpleGet = simpleGet;
          function focusInput(el) {
            el.focus();
            el.setSelectionRange(0, el.value.length);
          }
          exports.focusInput = focusInput;
          function openInEditor(file) {
            const fileName = file.replace(/\\/g, "\\\\");
            const src = `fetch('${shared_data_1.SharedData.openInEditorHost}__open-in-editor?file=${encodeURI(file)}').then(response => {
    if (response.ok) {
      console.log('File ${fileName} opened in editor')
    } else {
      const msg = 'Opening component ${fileName} failed'
      const target = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {}
      if (target.__VUE_DEVTOOLS_TOAST__) {
        target.__VUE_DEVTOOLS_TOAST__(msg, 'error')
      } else {
        console.log('%c' + msg, 'color:red')
      }
      console.log('Check the setup of your project, see https://devtools.vuejs.org/guide/open-in-editor.html')
    }
  })`;
            if (env_1.isChrome) {
              env_1.target.chrome.devtools.inspectedWindow.eval(src);
            } else {
              [eval][0](src);
            }
          }
          exports.openInEditor = openInEditor;
          const ESC = {
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "&": "&amp;"
          };
          function escape2(s2) {
            return s2.replace(/[<>"&]/g, escapeChar);
          }
          exports.escape = escape2;
          function escapeChar(a2) {
            return ESC[a2] || a2;
          }
          function copyToClipboard(state) {
            let text;
            if (typeof state !== "object") {
              text = String(state);
            } else {
              text = stringify(state, "user");
            }
            if (typeof document === "undefined")
              return;
            const dummyTextArea = document.createElement("textarea");
            dummyTextArea.textContent = text;
            document.body.appendChild(dummyTextArea);
            dummyTextArea.select();
            document.execCommand("copy");
            document.body.removeChild(dummyTextArea);
          }
          exports.copyToClipboard = copyToClipboard;
          function isEmptyObject(obj) {
            return obj === exports.UNDEFINED || !obj || Object.keys(obj).length === 0;
          }
          exports.isEmptyObject = isEmptyObject;
        }
      ),
      /***/
      "../../node_modules/events/events.js": (
        /*!*******************************************!*\
          !*** ../../node_modules/events/events.js ***!
          \*******************************************/
        /***/
        (module) => {
          var R2 = typeof Reflect === "object" ? Reflect : null;
          var ReflectApply = R2 && typeof R2.apply === "function" ? R2.apply : function ReflectApply2(target, receiver, args) {
            return Function.prototype.apply.call(target, receiver, args);
          };
          var ReflectOwnKeys;
          if (R2 && typeof R2.ownKeys === "function") {
            ReflectOwnKeys = R2.ownKeys;
          } else if (Object.getOwnPropertySymbols) {
            ReflectOwnKeys = function ReflectOwnKeys2(target) {
              return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
            };
          } else {
            ReflectOwnKeys = function ReflectOwnKeys2(target) {
              return Object.getOwnPropertyNames(target);
            };
          }
          function ProcessEmitWarning(warning) {
            if (console && console.warn)
              console.warn(warning);
          }
          var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
            return value !== value;
          };
          function EventEmitter() {
            EventEmitter.init.call(this);
          }
          module.exports = EventEmitter;
          module.exports.once = once;
          EventEmitter.EventEmitter = EventEmitter;
          EventEmitter.prototype._events = void 0;
          EventEmitter.prototype._eventsCount = 0;
          EventEmitter.prototype._maxListeners = void 0;
          var defaultMaxListeners = 10;
          function checkListener(listener) {
            if (typeof listener !== "function") {
              throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
            }
          }
          Object.defineProperty(EventEmitter, "defaultMaxListeners", {
            enumerable: true,
            get: function() {
              return defaultMaxListeners;
            },
            set: function(arg) {
              if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
                throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
              }
              defaultMaxListeners = arg;
            }
          });
          EventEmitter.init = function() {
            if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
              this._events = /* @__PURE__ */ Object.create(null);
              this._eventsCount = 0;
            }
            this._maxListeners = this._maxListeners || void 0;
          };
          EventEmitter.prototype.setMaxListeners = function setMaxListeners(n2) {
            if (typeof n2 !== "number" || n2 < 0 || NumberIsNaN(n2)) {
              throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n2 + ".");
            }
            this._maxListeners = n2;
            return this;
          };
          function _getMaxListeners(that) {
            if (that._maxListeners === void 0)
              return EventEmitter.defaultMaxListeners;
            return that._maxListeners;
          }
          EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
            return _getMaxListeners(this);
          };
          EventEmitter.prototype.emit = function emit(type) {
            var args = [];
            for (var i2 = 1; i2 < arguments.length; i2++)
              args.push(arguments[i2]);
            var doError = type === "error";
            var events = this._events;
            if (events !== void 0)
              doError = doError && events.error === void 0;
            else if (!doError)
              return false;
            if (doError) {
              var er;
              if (args.length > 0)
                er = args[0];
              if (er instanceof Error) {
                throw er;
              }
              var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
              err.context = er;
              throw err;
            }
            var handler = events[type];
            if (handler === void 0)
              return false;
            if (typeof handler === "function") {
              ReflectApply(handler, this, args);
            } else {
              var len = handler.length;
              var listeners = arrayClone(handler, len);
              for (var i2 = 0; i2 < len; ++i2)
                ReflectApply(listeners[i2], this, args);
            }
            return true;
          };
          function _addListener(target, type, listener, prepend) {
            var m2;
            var events;
            var existing;
            checkListener(listener);
            events = target._events;
            if (events === void 0) {
              events = target._events = /* @__PURE__ */ Object.create(null);
              target._eventsCount = 0;
            } else {
              if (events.newListener !== void 0) {
                target.emit(
                  "newListener",
                  type,
                  listener.listener ? listener.listener : listener
                );
                events = target._events;
              }
              existing = events[type];
            }
            if (existing === void 0) {
              existing = events[type] = listener;
              ++target._eventsCount;
            } else {
              if (typeof existing === "function") {
                existing = events[type] = prepend ? [listener, existing] : [existing, listener];
              } else if (prepend) {
                existing.unshift(listener);
              } else {
                existing.push(listener);
              }
              m2 = _getMaxListeners(target);
              if (m2 > 0 && existing.length > m2 && !existing.warned) {
                existing.warned = true;
                var w2 = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
                w2.name = "MaxListenersExceededWarning";
                w2.emitter = target;
                w2.type = type;
                w2.count = existing.length;
                ProcessEmitWarning(w2);
              }
            }
            return target;
          }
          EventEmitter.prototype.addListener = function addListener(type, listener) {
            return _addListener(this, type, listener, false);
          };
          EventEmitter.prototype.on = EventEmitter.prototype.addListener;
          EventEmitter.prototype.prependListener = function prependListener(type, listener) {
            return _addListener(this, type, listener, true);
          };
          function onceWrapper() {
            if (!this.fired) {
              this.target.removeListener(this.type, this.wrapFn);
              this.fired = true;
              if (arguments.length === 0)
                return this.listener.call(this.target);
              return this.listener.apply(this.target, arguments);
            }
          }
          function _onceWrap(target, type, listener) {
            var state = { fired: false, wrapFn: void 0, target, type, listener };
            var wrapped = onceWrapper.bind(state);
            wrapped.listener = listener;
            state.wrapFn = wrapped;
            return wrapped;
          }
          EventEmitter.prototype.once = function once2(type, listener) {
            checkListener(listener);
            this.on(type, _onceWrap(this, type, listener));
            return this;
          };
          EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
            checkListener(listener);
            this.prependListener(type, _onceWrap(this, type, listener));
            return this;
          };
          EventEmitter.prototype.removeListener = function removeListener(type, listener) {
            var list, events, position, i2, originalListener;
            checkListener(listener);
            events = this._events;
            if (events === void 0)
              return this;
            list = events[type];
            if (list === void 0)
              return this;
            if (list === listener || list.listener === listener) {
              if (--this._eventsCount === 0)
                this._events = /* @__PURE__ */ Object.create(null);
              else {
                delete events[type];
                if (events.removeListener)
                  this.emit("removeListener", type, list.listener || listener);
              }
            } else if (typeof list !== "function") {
              position = -1;
              for (i2 = list.length - 1; i2 >= 0; i2--) {
                if (list[i2] === listener || list[i2].listener === listener) {
                  originalListener = list[i2].listener;
                  position = i2;
                  break;
                }
              }
              if (position < 0)
                return this;
              if (position === 0)
                list.shift();
              else {
                spliceOne(list, position);
              }
              if (list.length === 1)
                events[type] = list[0];
              if (events.removeListener !== void 0)
                this.emit("removeListener", type, originalListener || listener);
            }
            return this;
          };
          EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
          EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
            var listeners, events, i2;
            events = this._events;
            if (events === void 0)
              return this;
            if (events.removeListener === void 0) {
              if (arguments.length === 0) {
                this._events = /* @__PURE__ */ Object.create(null);
                this._eventsCount = 0;
              } else if (events[type] !== void 0) {
                if (--this._eventsCount === 0)
                  this._events = /* @__PURE__ */ Object.create(null);
                else
                  delete events[type];
              }
              return this;
            }
            if (arguments.length === 0) {
              var keys = Object.keys(events);
              var key;
              for (i2 = 0; i2 < keys.length; ++i2) {
                key = keys[i2];
                if (key === "removeListener")
                  continue;
                this.removeAllListeners(key);
              }
              this.removeAllListeners("removeListener");
              this._events = /* @__PURE__ */ Object.create(null);
              this._eventsCount = 0;
              return this;
            }
            listeners = events[type];
            if (typeof listeners === "function") {
              this.removeListener(type, listeners);
            } else if (listeners !== void 0) {
              for (i2 = listeners.length - 1; i2 >= 0; i2--) {
                this.removeListener(type, listeners[i2]);
              }
            }
            return this;
          };
          function _listeners(target, type, unwrap) {
            var events = target._events;
            if (events === void 0)
              return [];
            var evlistener = events[type];
            if (evlistener === void 0)
              return [];
            if (typeof evlistener === "function")
              return unwrap ? [evlistener.listener || evlistener] : [evlistener];
            return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
          }
          EventEmitter.prototype.listeners = function listeners(type) {
            return _listeners(this, type, true);
          };
          EventEmitter.prototype.rawListeners = function rawListeners(type) {
            return _listeners(this, type, false);
          };
          EventEmitter.listenerCount = function(emitter, type) {
            if (typeof emitter.listenerCount === "function") {
              return emitter.listenerCount(type);
            } else {
              return listenerCount.call(emitter, type);
            }
          };
          EventEmitter.prototype.listenerCount = listenerCount;
          function listenerCount(type) {
            var events = this._events;
            if (events !== void 0) {
              var evlistener = events[type];
              if (typeof evlistener === "function") {
                return 1;
              } else if (evlistener !== void 0) {
                return evlistener.length;
              }
            }
            return 0;
          }
          EventEmitter.prototype.eventNames = function eventNames() {
            return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
          };
          function arrayClone(arr, n2) {
            var copy = new Array(n2);
            for (var i2 = 0; i2 < n2; ++i2)
              copy[i2] = arr[i2];
            return copy;
          }
          function spliceOne(list, index) {
            for (; index + 1 < list.length; index++)
              list[index] = list[index + 1];
            list.pop();
          }
          function unwrapListeners(arr) {
            var ret = new Array(arr.length);
            for (var i2 = 0; i2 < ret.length; ++i2) {
              ret[i2] = arr[i2].listener || arr[i2];
            }
            return ret;
          }
          function once(emitter, name) {
            return new Promise(function(resolve, reject) {
              function errorListener(err) {
                emitter.removeListener(name, resolver);
                reject(err);
              }
              function resolver() {
                if (typeof emitter.removeListener === "function") {
                  emitter.removeListener("error", errorListener);
                }
                resolve([].slice.call(arguments));
              }
              eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
              if (name !== "error") {
                addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
              }
            });
          }
          function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
            if (typeof emitter.on === "function") {
              eventTargetAgnosticAddListener(emitter, "error", handler, flags);
            }
          }
          function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
            if (typeof emitter.on === "function") {
              if (flags.once) {
                emitter.once(name, listener);
              } else {
                emitter.on(name, listener);
              }
            } else if (typeof emitter.addEventListener === "function") {
              emitter.addEventListener(name, function wrapListener(arg) {
                if (flags.once) {
                  emitter.removeEventListener(name, wrapListener);
                }
                listener(arg);
              });
            } else {
              throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
            }
          }
        }
      ),
      /***/
      "../../node_modules/path-browserify/index.js": (
        /*!***************************************************!*\
          !*** ../../node_modules/path-browserify/index.js ***!
          \***************************************************/
        /***/
        (module) => {
          function assertPath(path) {
            if (typeof path !== "string") {
              throw new TypeError("Path must be a string. Received " + JSON.stringify(path));
            }
          }
          function normalizeStringPosix(path, allowAboveRoot) {
            var res = "";
            var lastSegmentLength = 0;
            var lastSlash = -1;
            var dots = 0;
            var code;
            for (var i2 = 0; i2 <= path.length; ++i2) {
              if (i2 < path.length)
                code = path.charCodeAt(i2);
              else if (code === 47)
                break;
              else
                code = 47;
              if (code === 47) {
                if (lastSlash === i2 - 1 || dots === 1)
                  ;
                else if (lastSlash !== i2 - 1 && dots === 2) {
                  if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                      var lastSlashIndex = res.lastIndexOf("/");
                      if (lastSlashIndex !== res.length - 1) {
                        if (lastSlashIndex === -1) {
                          res = "";
                          lastSegmentLength = 0;
                        } else {
                          res = res.slice(0, lastSlashIndex);
                          lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
                        }
                        lastSlash = i2;
                        dots = 0;
                        continue;
                      }
                    } else if (res.length === 2 || res.length === 1) {
                      res = "";
                      lastSegmentLength = 0;
                      lastSlash = i2;
                      dots = 0;
                      continue;
                    }
                  }
                  if (allowAboveRoot) {
                    if (res.length > 0)
                      res += "/..";
                    else
                      res = "..";
                    lastSegmentLength = 2;
                  }
                } else {
                  if (res.length > 0)
                    res += "/" + path.slice(lastSlash + 1, i2);
                  else
                    res = path.slice(lastSlash + 1, i2);
                  lastSegmentLength = i2 - lastSlash - 1;
                }
                lastSlash = i2;
                dots = 0;
              } else if (code === 46 && dots !== -1) {
                ++dots;
              } else {
                dots = -1;
              }
            }
            return res;
          }
          function _format(sep, pathObject) {
            var dir = pathObject.dir || pathObject.root;
            var base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
            if (!dir) {
              return base;
            }
            if (dir === pathObject.root) {
              return dir + base;
            }
            return dir + sep + base;
          }
          var posix = {
            // path.resolve([from ...], to)
            resolve: function resolve() {
              var resolvedPath = "";
              var resolvedAbsolute = false;
              var cwd;
              for (var i2 = arguments.length - 1; i2 >= -1 && !resolvedAbsolute; i2--) {
                var path;
                if (i2 >= 0)
                  path = arguments[i2];
                else {
                  if (cwd === void 0)
                    cwd = process.cwd();
                  path = cwd;
                }
                assertPath(path);
                if (path.length === 0) {
                  continue;
                }
                resolvedPath = path + "/" + resolvedPath;
                resolvedAbsolute = path.charCodeAt(0) === 47;
              }
              resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
              if (resolvedAbsolute) {
                if (resolvedPath.length > 0)
                  return "/" + resolvedPath;
                else
                  return "/";
              } else if (resolvedPath.length > 0) {
                return resolvedPath;
              } else {
                return ".";
              }
            },
            normalize: function normalize(path) {
              assertPath(path);
              if (path.length === 0)
                return ".";
              var isAbsolute = path.charCodeAt(0) === 47;
              var trailingSeparator = path.charCodeAt(path.length - 1) === 47;
              path = normalizeStringPosix(path, !isAbsolute);
              if (path.length === 0 && !isAbsolute)
                path = ".";
              if (path.length > 0 && trailingSeparator)
                path += "/";
              if (isAbsolute)
                return "/" + path;
              return path;
            },
            isAbsolute: function isAbsolute(path) {
              assertPath(path);
              return path.length > 0 && path.charCodeAt(0) === 47;
            },
            join: function join() {
              if (arguments.length === 0)
                return ".";
              var joined;
              for (var i2 = 0; i2 < arguments.length; ++i2) {
                var arg = arguments[i2];
                assertPath(arg);
                if (arg.length > 0) {
                  if (joined === void 0)
                    joined = arg;
                  else
                    joined += "/" + arg;
                }
              }
              if (joined === void 0)
                return ".";
              return posix.normalize(joined);
            },
            relative: function relative(from, to) {
              assertPath(from);
              assertPath(to);
              if (from === to)
                return "";
              from = posix.resolve(from);
              to = posix.resolve(to);
              if (from === to)
                return "";
              var fromStart = 1;
              for (; fromStart < from.length; ++fromStart) {
                if (from.charCodeAt(fromStart) !== 47)
                  break;
              }
              var fromEnd = from.length;
              var fromLen = fromEnd - fromStart;
              var toStart = 1;
              for (; toStart < to.length; ++toStart) {
                if (to.charCodeAt(toStart) !== 47)
                  break;
              }
              var toEnd = to.length;
              var toLen = toEnd - toStart;
              var length = fromLen < toLen ? fromLen : toLen;
              var lastCommonSep = -1;
              var i2 = 0;
              for (; i2 <= length; ++i2) {
                if (i2 === length) {
                  if (toLen > length) {
                    if (to.charCodeAt(toStart + i2) === 47) {
                      return to.slice(toStart + i2 + 1);
                    } else if (i2 === 0) {
                      return to.slice(toStart + i2);
                    }
                  } else if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i2) === 47) {
                      lastCommonSep = i2;
                    } else if (i2 === 0) {
                      lastCommonSep = 0;
                    }
                  }
                  break;
                }
                var fromCode = from.charCodeAt(fromStart + i2);
                var toCode = to.charCodeAt(toStart + i2);
                if (fromCode !== toCode)
                  break;
                else if (fromCode === 47)
                  lastCommonSep = i2;
              }
              var out = "";
              for (i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2) {
                if (i2 === fromEnd || from.charCodeAt(i2) === 47) {
                  if (out.length === 0)
                    out += "..";
                  else
                    out += "/..";
                }
              }
              if (out.length > 0)
                return out + to.slice(toStart + lastCommonSep);
              else {
                toStart += lastCommonSep;
                if (to.charCodeAt(toStart) === 47)
                  ++toStart;
                return to.slice(toStart);
              }
            },
            _makeLong: function _makeLong(path) {
              return path;
            },
            dirname: function dirname(path) {
              assertPath(path);
              if (path.length === 0)
                return ".";
              var code = path.charCodeAt(0);
              var hasRoot = code === 47;
              var end = -1;
              var matchedSlash = true;
              for (var i2 = path.length - 1; i2 >= 1; --i2) {
                code = path.charCodeAt(i2);
                if (code === 47) {
                  if (!matchedSlash) {
                    end = i2;
                    break;
                  }
                } else {
                  matchedSlash = false;
                }
              }
              if (end === -1)
                return hasRoot ? "/" : ".";
              if (hasRoot && end === 1)
                return "//";
              return path.slice(0, end);
            },
            basename: function basename(path, ext) {
              if (ext !== void 0 && typeof ext !== "string")
                throw new TypeError('"ext" argument must be a string');
              assertPath(path);
              var start = 0;
              var end = -1;
              var matchedSlash = true;
              var i2;
              if (ext !== void 0 && ext.length > 0 && ext.length <= path.length) {
                if (ext.length === path.length && ext === path)
                  return "";
                var extIdx = ext.length - 1;
                var firstNonSlashEnd = -1;
                for (i2 = path.length - 1; i2 >= 0; --i2) {
                  var code = path.charCodeAt(i2);
                  if (code === 47) {
                    if (!matchedSlash) {
                      start = i2 + 1;
                      break;
                    }
                  } else {
                    if (firstNonSlashEnd === -1) {
                      matchedSlash = false;
                      firstNonSlashEnd = i2 + 1;
                    }
                    if (extIdx >= 0) {
                      if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                          end = i2;
                        }
                      } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                      }
                    }
                  }
                }
                if (start === end)
                  end = firstNonSlashEnd;
                else if (end === -1)
                  end = path.length;
                return path.slice(start, end);
              } else {
                for (i2 = path.length - 1; i2 >= 0; --i2) {
                  if (path.charCodeAt(i2) === 47) {
                    if (!matchedSlash) {
                      start = i2 + 1;
                      break;
                    }
                  } else if (end === -1) {
                    matchedSlash = false;
                    end = i2 + 1;
                  }
                }
                if (end === -1)
                  return "";
                return path.slice(start, end);
              }
            },
            extname: function extname(path) {
              assertPath(path);
              var startDot = -1;
              var startPart = 0;
              var end = -1;
              var matchedSlash = true;
              var preDotState = 0;
              for (var i2 = path.length - 1; i2 >= 0; --i2) {
                var code = path.charCodeAt(i2);
                if (code === 47) {
                  if (!matchedSlash) {
                    startPart = i2 + 1;
                    break;
                  }
                  continue;
                }
                if (end === -1) {
                  matchedSlash = false;
                  end = i2 + 1;
                }
                if (code === 46) {
                  if (startDot === -1)
                    startDot = i2;
                  else if (preDotState !== 1)
                    preDotState = 1;
                } else if (startDot !== -1) {
                  preDotState = -1;
                }
              }
              if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
              preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
              preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
                return "";
              }
              return path.slice(startDot, end);
            },
            format: function format(pathObject) {
              if (pathObject === null || typeof pathObject !== "object") {
                throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
              }
              return _format("/", pathObject);
            },
            parse: function parse2(path) {
              assertPath(path);
              var ret = { root: "", dir: "", base: "", ext: "", name: "" };
              if (path.length === 0)
                return ret;
              var code = path.charCodeAt(0);
              var isAbsolute = code === 47;
              var start;
              if (isAbsolute) {
                ret.root = "/";
                start = 1;
              } else {
                start = 0;
              }
              var startDot = -1;
              var startPart = 0;
              var end = -1;
              var matchedSlash = true;
              var i2 = path.length - 1;
              var preDotState = 0;
              for (; i2 >= start; --i2) {
                code = path.charCodeAt(i2);
                if (code === 47) {
                  if (!matchedSlash) {
                    startPart = i2 + 1;
                    break;
                  }
                  continue;
                }
                if (end === -1) {
                  matchedSlash = false;
                  end = i2 + 1;
                }
                if (code === 46) {
                  if (startDot === -1)
                    startDot = i2;
                  else if (preDotState !== 1)
                    preDotState = 1;
                } else if (startDot !== -1) {
                  preDotState = -1;
                }
              }
              if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
              preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
              preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
                if (end !== -1) {
                  if (startPart === 0 && isAbsolute)
                    ret.base = ret.name = path.slice(1, end);
                  else
                    ret.base = ret.name = path.slice(startPart, end);
                }
              } else {
                if (startPart === 0 && isAbsolute) {
                  ret.name = path.slice(1, startDot);
                  ret.base = path.slice(1, end);
                } else {
                  ret.name = path.slice(startPart, startDot);
                  ret.base = path.slice(startPart, end);
                }
                ret.ext = path.slice(startDot, end);
              }
              if (startPart > 0)
                ret.dir = path.slice(0, startPart - 1);
              else if (isAbsolute)
                ret.dir = "/";
              return ret;
            },
            sep: "/",
            delimiter: ":",
            win32: null,
            posix: null
          };
          posix.posix = posix;
          module.exports = posix;
        }
      )
      /******/
    };
    var __webpack_module_cache__ = {};
    function __webpack_require__(moduleId) {
      var cachedModule = __webpack_module_cache__[moduleId];
      if (cachedModule !== void 0) {
        return cachedModule.exports;
      }
      var module = __webpack_module_cache__[moduleId] = {
        /******/
        // no module.id needed
        /******/
        // no module.loaded needed
        /******/
        exports: {}
        /******/
      };
      __webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
      return module.exports;
    }
    (() => {
      __webpack_require__.n = (module) => {
        var getter = module && module.__esModule ? (
          /******/
          () => module["default"]
        ) : (
          /******/
          () => module
        );
        __webpack_require__.d(getter, { a: getter });
        return getter;
      };
    })();
    (() => {
      __webpack_require__.d = (exports, definition) => {
        for (var key in definition) {
          if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
          }
        }
      };
    })();
    (() => {
      __webpack_require__.g = function() {
        if (typeof globalThis === "object")
          return globalThis;
        try {
          return this || new Function("return this")();
        } catch (e) {
          if (typeof window === "object")
            return window;
        }
      }();
    })();
    (() => {
      __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    })();
    (() => {
      __webpack_require__.r = (exports) => {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
          Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(exports, "__esModule", { value: true });
      };
    })();
    var __webpack_exports__ = {};
    (() => {
      /*!*********************!*\
        !*** ./src/hook.ts ***!
        \*********************/
      __webpack_require__.r(__webpack_exports__);
      var _back_hook__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
        /*! @back/hook */
        "../app-backend-core/lib/hook.js"
      );
      var _vue_devtools_shared_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
        /*! @vue-devtools/shared-utils */
        "../shared-utils/lib/index.js"
      );
      (0, _back_hook__WEBPACK_IMPORTED_MODULE_0__.installHook)(_vue_devtools_shared_utils__WEBPACK_IMPORTED_MODULE_1__.target);
    })();
  })();
  (function() {
    var __webpack_modules__ = {
      /***/
      "../api/lib/esm/const.js": (
        /*!*******************************!*\
          !*** ../api/lib/esm/const.js ***!
          \*******************************/
        /***/
        (__unused_webpack_module, __webpack_exports__2, __webpack_require__2) => {
          __webpack_require__2.r(__webpack_exports__2);
          __webpack_require__2.d(__webpack_exports__2, {
            /* harmony export */
            "HOOK_PLUGIN_SETTINGS_SET": () => (
              /* binding */
              HOOK_PLUGIN_SETTINGS_SET
            ),
            /* harmony export */
            "HOOK_SETUP": () => (
              /* binding */
              HOOK_SETUP
            )
            /* harmony export */
          });
          const HOOK_SETUP = "devtools-plugin:setup";
          const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
        }
      ),
      /***/
      "../api/lib/esm/env.js": (
        /*!*****************************!*\
          !*** ../api/lib/esm/env.js ***!
          \*****************************/
        /***/
        (__unused_webpack_module, __webpack_exports__2, __webpack_require__2) => {
          __webpack_require__2.r(__webpack_exports__2);
          __webpack_require__2.d(__webpack_exports__2, {
            /* harmony export */
            "getDevtoolsGlobalHook": () => (
              /* binding */
              getDevtoolsGlobalHook
            ),
            /* harmony export */
            "getTarget": () => (
              /* binding */
              getTarget2
            ),
            /* harmony export */
            "isProxyAvailable": () => (
              /* binding */
              isProxyAvailable
            )
            /* harmony export */
          });
          function getDevtoolsGlobalHook() {
            return getTarget2().__VUE_DEVTOOLS_GLOBAL_HOOK__;
          }
          function getTarget2() {
            return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof my !== "undefined" ? my : {};
          }
          const isProxyAvailable = typeof Proxy === "function";
        }
      ),
      /***/
      "../api/lib/esm/index.js": (
        /*!*******************************!*\
          !*** ../api/lib/esm/index.js ***!
          \*******************************/
        /***/
        (__unused_webpack_module, __webpack_exports__2, __webpack_require__2) => {
          __webpack_require__2.r(__webpack_exports__2);
          __webpack_require__2.d(__webpack_exports__2, {
            /* harmony export */
            "isPerformanceSupported": () => (
              /* reexport safe */
              _time_js__WEBPACK_IMPORTED_MODULE_0__.isPerformanceSupported
            ),
            /* harmony export */
            "now": () => (
              /* reexport safe */
              _time_js__WEBPACK_IMPORTED_MODULE_0__.now
            ),
            /* harmony export */
            "setupDevtoolsPlugin": () => (
              /* binding */
              setupDevtoolsPlugin
            )
            /* harmony export */
          });
          var _env_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__2(
            /*! ./env.js */
            "../api/lib/esm/env.js"
          );
          var _const_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__2(
            /*! ./const.js */
            "../api/lib/esm/const.js"
          );
          var _proxy_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__2(
            /*! ./proxy.js */
            "../api/lib/esm/proxy.js"
          );
          var _time_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__2(
            /*! ./time.js */
            "../api/lib/esm/time.js"
          );
          function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
            const descriptor = pluginDescriptor;
            const target = (0, _env_js__WEBPACK_IMPORTED_MODULE_1__.getTarget)();
            const hook = (0, _env_js__WEBPACK_IMPORTED_MODULE_1__.getDevtoolsGlobalHook)();
            const enableProxy = _env_js__WEBPACK_IMPORTED_MODULE_1__.isProxyAvailable && descriptor.enableEarlyProxy;
            if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
              hook.emit(_const_js__WEBPACK_IMPORTED_MODULE_2__.HOOK_SETUP, pluginDescriptor, setupFn);
            } else {
              const proxy = enableProxy ? new _proxy_js__WEBPACK_IMPORTED_MODULE_3__.ApiProxy(descriptor, hook) : null;
              const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
              list.push({
                pluginDescriptor: descriptor,
                setupFn,
                proxy
              });
              if (proxy)
                setupFn(proxy.proxiedTarget);
            }
          }
        }
      ),
      /***/
      "../api/lib/esm/proxy.js": (
        /*!*******************************!*\
          !*** ../api/lib/esm/proxy.js ***!
          \*******************************/
        /***/
        (__unused_webpack_module, __webpack_exports__2, __webpack_require__2) => {
          __webpack_require__2.r(__webpack_exports__2);
          __webpack_require__2.d(__webpack_exports__2, {
            /* harmony export */
            "ApiProxy": () => (
              /* binding */
              ApiProxy
            )
            /* harmony export */
          });
          var _const_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__2(
            /*! ./const.js */
            "../api/lib/esm/const.js"
          );
          var _time_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__2(
            /*! ./time.js */
            "../api/lib/esm/time.js"
          );
          class ApiProxy {
            constructor(plugin, hook) {
              this.target = null;
              this.targetQueue = [];
              this.onQueue = [];
              this.plugin = plugin;
              this.hook = hook;
              const defaultSettings = {};
              if (plugin.settings) {
                for (const id in plugin.settings) {
                  const item = plugin.settings[id];
                  defaultSettings[id] = item.defaultValue;
                }
              }
              const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
              let currentSettings = Object.assign({}, defaultSettings);
              try {
                const raw = localStorage.getItem(localSettingsSaveId);
                const data = JSON.parse(raw);
                Object.assign(currentSettings, data);
              } catch (e) {
              }
              this.fallbacks = {
                getSettings() {
                  return currentSettings;
                },
                setSettings(value) {
                  try {
                    localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
                  } catch (e) {
                  }
                  currentSettings = value;
                },
                now() {
                  return (0, _time_js__WEBPACK_IMPORTED_MODULE_0__.now)();
                }
              };
              if (hook) {
                hook.on(_const_js__WEBPACK_IMPORTED_MODULE_1__.HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
                  if (pluginId === this.plugin.id) {
                    this.fallbacks.setSettings(value);
                  }
                });
              }
              this.proxiedOn = new Proxy({}, {
                get: (_target, prop) => {
                  if (this.target) {
                    return this.target.on[prop];
                  } else {
                    return (...args) => {
                      this.onQueue.push({
                        method: prop,
                        args
                      });
                    };
                  }
                }
              });
              this.proxiedTarget = new Proxy({}, {
                get: (_target, prop) => {
                  if (this.target) {
                    return this.target[prop];
                  } else if (prop === "on") {
                    return this.proxiedOn;
                  } else if (Object.keys(this.fallbacks).includes(prop)) {
                    return (...args) => {
                      this.targetQueue.push({
                        method: prop,
                        args,
                        resolve: () => {
                        }
                      });
                      return this.fallbacks[prop](...args);
                    };
                  } else {
                    return (...args) => {
                      return new Promise((resolve) => {
                        this.targetQueue.push({
                          method: prop,
                          args,
                          resolve
                        });
                      });
                    };
                  }
                }
              });
            }
            async setRealTarget(target) {
              this.target = target;
              for (const item of this.onQueue) {
                this.target.on[item.method](...item.args);
              }
              for (const item of this.targetQueue) {
                item.resolve(await this.target[item.method](...item.args));
              }
            }
          }
        }
      ),
      /***/
      "../api/lib/esm/time.js": (
        /*!******************************!*\
          !*** ../api/lib/esm/time.js ***!
          \******************************/
        /***/
        (__unused_webpack_module, __webpack_exports__2, __webpack_require__2) => {
          __webpack_require__2.r(__webpack_exports__2);
          __webpack_require__2.d(__webpack_exports__2, {
            /* harmony export */
            "isPerformanceSupported": () => (
              /* binding */
              isPerformanceSupported
            ),
            /* harmony export */
            "now": () => (
              /* binding */
              now
            )
            /* harmony export */
          });
          let supported;
          let perf;
          function isPerformanceSupported() {
            var _a;
            if (supported !== void 0) {
              return supported;
            }
            if (typeof window !== "undefined" && window.performance) {
              supported = true;
              perf = window.performance;
            } else if (typeof __webpack_require__2.g !== "undefined" && ((_a = __webpack_require__2.g.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
              supported = true;
              perf = __webpack_require__2.g.perf_hooks.performance;
            } else {
              supported = false;
            }
            return supported;
          }
          function now() {
            return isPerformanceSupported() ? perf.now() : Date.now();
          }
        }
      ),
      /***/
      "../app-backend-api/lib/api.js": (
        /*!*************************************!*\
          !*** ../app-backend-api/lib/api.js ***!
          \*************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.DevtoolsPluginApiInstance = exports.DevtoolsApi = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const devtools_api_1 = __webpack_require__2(
            /*! @vue/devtools-api */
            "../api/lib/esm/index.js"
          );
          const hooks_1 = __webpack_require__2(
            /*! ./hooks */
            "../app-backend-api/lib/hooks.js"
          );
          const pluginOn = [];
          class DevtoolsApi {
            constructor(backend, ctx) {
              this.stateEditor = new shared_utils_1.StateEditor();
              this.backend = backend;
              this.ctx = ctx;
              this.bridge = ctx.bridge;
              this.on = new hooks_1.DevtoolsHookable(ctx);
            }
            async callHook(eventType, payload, ctx = this.ctx) {
              payload = await this.on.callHandlers(eventType, payload, ctx);
              for (const on of pluginOn) {
                payload = await on.callHandlers(eventType, payload, ctx);
              }
              return payload;
            }
            async transformCall(callName, ...args) {
              const payload = await this.callHook(
                "transformCall",
                {
                  callName,
                  inArgs: args,
                  outArgs: args.slice()
                }
              );
              return payload.outArgs;
            }
            async getAppRecordName(app, defaultName) {
              const payload = await this.callHook(
                "getAppRecordName",
                {
                  app,
                  name: null
                }
              );
              if (payload.name) {
                return payload.name;
              } else {
                return `App ${defaultName}`;
              }
            }
            async getAppRootInstance(app) {
              const payload = await this.callHook(
                "getAppRootInstance",
                {
                  app,
                  root: null
                }
              );
              return payload.root;
            }
            async registerApplication(app) {
              await this.callHook(
                "registerApplication",
                {
                  app
                }
              );
            }
            async walkComponentTree(instance, maxDepth = -1, filter = null, recursively = false) {
              const payload = await this.callHook(
                "walkComponentTree",
                {
                  componentInstance: instance,
                  componentTreeData: null,
                  maxDepth,
                  filter,
                  recursively
                }
              );
              return payload.componentTreeData;
            }
            async visitComponentTree(instance, treeNode, filter = null, app) {
              const payload = await this.callHook(
                "visitComponentTree",
                {
                  app,
                  componentInstance: instance,
                  treeNode,
                  filter
                }
              );
              return payload.treeNode;
            }
            async walkComponentParents(instance) {
              const payload = await this.callHook(
                "walkComponentParents",
                {
                  componentInstance: instance,
                  parentInstances: []
                }
              );
              return payload.parentInstances;
            }
            async inspectComponent(instance, app) {
              const payload = await this.callHook(
                "inspectComponent",
                {
                  app,
                  componentInstance: instance,
                  instanceData: null
                }
              );
              return payload.instanceData;
            }
            async getComponentBounds(instance) {
              const payload = await this.callHook(
                "getComponentBounds",
                {
                  componentInstance: instance,
                  bounds: null
                }
              );
              return payload.bounds;
            }
            async getComponentName(instance) {
              const payload = await this.callHook(
                "getComponentName",
                {
                  componentInstance: instance,
                  name: null
                }
              );
              return payload.name;
            }
            async getComponentInstances(app) {
              const payload = await this.callHook(
                "getComponentInstances",
                {
                  app,
                  componentInstances: []
                }
              );
              return payload.componentInstances;
            }
            async getElementComponent(element) {
              const payload = await this.callHook(
                "getElementComponent",
                {
                  element,
                  componentInstance: null
                }
              );
              return payload.componentInstance;
            }
            async getComponentRootElements(instance) {
              const payload = await this.callHook(
                "getComponentRootElements",
                {
                  componentInstance: instance,
                  rootElements: []
                }
              );
              return payload.rootElements;
            }
            async editComponentState(instance, dotPath, type, state, app) {
              const arrayPath = dotPath.split(".");
              const payload = await this.callHook(
                "editComponentState",
                {
                  app,
                  componentInstance: instance,
                  path: arrayPath,
                  type,
                  state,
                  set: (object, path = arrayPath, value = state.value, cb) => this.stateEditor.set(object, path, value, cb || this.stateEditor.createDefaultSetCallback(state))
                }
              );
              return payload.componentInstance;
            }
            async getComponentDevtoolsOptions(instance) {
              const payload = await this.callHook(
                "getAppDevtoolsOptions",
                {
                  componentInstance: instance,
                  options: null
                }
              );
              return payload.options || {};
            }
            async getComponentRenderCode(instance) {
              const payload = await this.callHook(
                "getComponentRenderCode",
                {
                  componentInstance: instance,
                  code: null
                }
              );
              return {
                code: payload.code
              };
            }
            async inspectTimelineEvent(eventData, app) {
              const payload = await this.callHook(
                "inspectTimelineEvent",
                {
                  event: eventData.event,
                  layerId: eventData.layerId,
                  app,
                  data: eventData.event.data,
                  all: eventData.all
                }
              );
              return payload.data;
            }
            async clearTimeline() {
              await this.callHook(
                "timelineCleared",
                {}
              );
            }
            async getInspectorTree(inspectorId, app, filter) {
              const payload = await this.callHook(
                "getInspectorTree",
                {
                  inspectorId,
                  app,
                  filter,
                  rootNodes: []
                }
              );
              return payload.rootNodes;
            }
            async getInspectorState(inspectorId, app, nodeId) {
              const payload = await this.callHook(
                "getInspectorState",
                {
                  inspectorId,
                  app,
                  nodeId,
                  state: null
                }
              );
              return payload.state;
            }
            async editInspectorState(inspectorId, app, nodeId, dotPath, type, state) {
              const arrayPath = dotPath.split(".");
              await this.callHook(
                "editInspectorState",
                {
                  inspectorId,
                  app,
                  nodeId,
                  path: arrayPath,
                  type,
                  state,
                  set: (object, path = arrayPath, value = state.value, cb) => this.stateEditor.set(object, path, value, cb || this.stateEditor.createDefaultSetCallback(state))
                }
              );
            }
            now() {
              return (0, devtools_api_1.now)();
            }
          }
          exports.DevtoolsApi = DevtoolsApi;
          class DevtoolsPluginApiInstance {
            constructor(plugin, appRecord, ctx) {
              this.bridge = ctx.bridge;
              this.ctx = ctx;
              this.plugin = plugin;
              this.appRecord = appRecord;
              this.backendApi = appRecord.backend.api;
              this.defaultSettings = (0, shared_utils_1.getPluginDefaultSettings)(plugin.descriptor.settings);
              this.on = new hooks_1.DevtoolsHookable(ctx, plugin);
              pluginOn.push(this.on);
            }
            // Plugin API
            async notifyComponentUpdate(instance = null) {
              if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.COMPONENTS))
                return;
              if (instance) {
                this.ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_UPDATED, ...await this.backendApi.transformCall(shared_utils_1.HookEvents.COMPONENT_UPDATED, instance));
              } else {
                this.ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_UPDATED);
              }
            }
            addTimelineLayer(options) {
              if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.TIMELINE))
                return false;
              this.ctx.hook.emit(shared_utils_1.HookEvents.TIMELINE_LAYER_ADDED, options, this.plugin);
              return true;
            }
            addTimelineEvent(options) {
              if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.TIMELINE))
                return false;
              this.ctx.hook.emit(shared_utils_1.HookEvents.TIMELINE_EVENT_ADDED, options, this.plugin);
              return true;
            }
            addInspector(options) {
              if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.CUSTOM_INSPECTOR))
                return false;
              this.ctx.hook.emit(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_ADD, options, this.plugin);
              return true;
            }
            sendInspectorTree(inspectorId) {
              if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.CUSTOM_INSPECTOR))
                return false;
              this.ctx.hook.emit(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_TREE, inspectorId, this.plugin);
              return true;
            }
            sendInspectorState(inspectorId) {
              if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.CUSTOM_INSPECTOR))
                return false;
              this.ctx.hook.emit(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_STATE, inspectorId, this.plugin);
              return true;
            }
            selectInspectorNode(inspectorId, nodeId) {
              if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.CUSTOM_INSPECTOR))
                return false;
              this.ctx.hook.emit(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SELECT_NODE, inspectorId, nodeId, this.plugin);
              return true;
            }
            getComponentBounds(instance) {
              return this.backendApi.getComponentBounds(instance);
            }
            getComponentName(instance) {
              return this.backendApi.getComponentName(instance);
            }
            getComponentInstances(app) {
              return this.backendApi.getComponentInstances(app);
            }
            highlightElement(instance) {
              if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.COMPONENTS))
                return false;
              this.ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_HIGHLIGHT, instance.__VUE_DEVTOOLS_UID__, this.plugin);
              return true;
            }
            unhighlightElement() {
              if (!this.enabled || !this.hasPermission(shared_utils_1.PluginPermission.COMPONENTS))
                return false;
              this.ctx.hook.emit(shared_utils_1.HookEvents.COMPONENT_UNHIGHLIGHT, this.plugin);
              return true;
            }
            getSettings(pluginId) {
              return (0, shared_utils_1.getPluginSettings)(pluginId !== null && pluginId !== void 0 ? pluginId : this.plugin.descriptor.id, this.defaultSettings);
            }
            setSettings(value, pluginId) {
              (0, shared_utils_1.setPluginSettings)(pluginId !== null && pluginId !== void 0 ? pluginId : this.plugin.descriptor.id, value);
            }
            now() {
              return (0, devtools_api_1.now)();
            }
            get enabled() {
              return (0, shared_utils_1.hasPluginPermission)(this.plugin.descriptor.id, shared_utils_1.PluginPermission.ENABLED);
            }
            hasPermission(permission) {
              return (0, shared_utils_1.hasPluginPermission)(this.plugin.descriptor.id, permission);
            }
          }
          exports.DevtoolsPluginApiInstance = DevtoolsPluginApiInstance;
        }
      ),
      /***/
      "../app-backend-api/lib/app-record.js": (
        /*!********************************************!*\
          !*** ../app-backend-api/lib/app-record.js ***!
          \********************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
        }
      ),
      /***/
      "../app-backend-api/lib/backend-context.js": (
        /*!*************************************************!*\
          !*** ../app-backend-api/lib/backend-context.js ***!
          \*************************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.createBackendContext = void 0;
          function createBackendContext(options) {
            return {
              bridge: options.bridge,
              hook: options.hook,
              backends: [],
              appRecords: [],
              currentTab: null,
              currentAppRecord: null,
              currentInspectedComponentId: null,
              plugins: [],
              currentPlugin: null,
              timelineLayers: [],
              nextTimelineEventId: 0,
              timelineEventMap: /* @__PURE__ */ new Map(),
              perfUniqueGroupId: 0,
              customInspectors: [],
              timelineMarkers: []
            };
          }
          exports.createBackendContext = createBackendContext;
        }
      ),
      /***/
      "../app-backend-api/lib/backend.js": (
        /*!*****************************************!*\
          !*** ../app-backend-api/lib/backend.js ***!
          \*****************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.createBackend = exports.defineBackend = exports.BuiltinBackendFeature = void 0;
          const api_1 = __webpack_require__2(
            /*! ./api */
            "../app-backend-api/lib/api.js"
          );
          (function(BuiltinBackendFeature) {
            BuiltinBackendFeature["FLUSH"] = "flush";
          })(exports.BuiltinBackendFeature || (exports.BuiltinBackendFeature = {}));
          function defineBackend(options) {
            return options;
          }
          exports.defineBackend = defineBackend;
          function createBackend(options, ctx) {
            const backend = {
              options,
              api: null
            };
            backend.api = new api_1.DevtoolsApi(backend, ctx);
            options.setup(backend.api);
            return backend;
          }
          exports.createBackend = createBackend;
        }
      ),
      /***/
      "../app-backend-api/lib/global-hook.js": (
        /*!*********************************************!*\
          !*** ../app-backend-api/lib/global-hook.js ***!
          \*********************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
        }
      ),
      /***/
      "../app-backend-api/lib/hooks.js": (
        /*!***************************************!*\
          !*** ../app-backend-api/lib/hooks.js ***!
          \***************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.DevtoolsHookable = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          class DevtoolsHookable {
            constructor(ctx, plugin = null) {
              this.handlers = {};
              this.ctx = ctx;
              this.plugin = plugin;
            }
            hook(eventType, handler, pluginPermision = null) {
              const handlers = this.handlers[eventType] = this.handlers[eventType] || [];
              if (this.plugin) {
                const originalHandler = handler;
                handler = (...args) => {
                  var _a;
                  if (!(0, shared_utils_1.hasPluginPermission)(this.plugin.descriptor.id, shared_utils_1.PluginPermission.ENABLED) || pluginPermision && !(0, shared_utils_1.hasPluginPermission)(this.plugin.descriptor.id, pluginPermision))
                    return;
                  if (!this.plugin.descriptor.disableAppScope && ((_a = this.ctx.currentAppRecord) === null || _a === void 0 ? void 0 : _a.options.app) !== this.plugin.descriptor.app)
                    return;
                  if (!this.plugin.descriptor.disablePluginScope && args[0].pluginId != null && args[0].pluginId !== this.plugin.descriptor.id)
                    return;
                  return originalHandler(...args);
                };
              }
              handlers.push({
                handler,
                plugin: this.ctx.currentPlugin
              });
            }
            async callHandlers(eventType, payload, ctx) {
              if (this.handlers[eventType]) {
                const handlers = this.handlers[eventType];
                for (let i2 = 0; i2 < handlers.length; i2++) {
                  const {
                    handler,
                    plugin
                  } = handlers[i2];
                  try {
                    await handler(payload, ctx);
                  } catch (e) {
                    console.error(`An error occurred in hook '${eventType}'${plugin ? ` registered by plugin '${plugin.descriptor.id}'` : ""} with payload:`, payload);
                    console.error(e);
                  }
                }
              }
              return payload;
            }
            transformCall(handler) {
              this.hook(
                "transformCall",
                handler
              );
            }
            getAppRecordName(handler) {
              this.hook(
                "getAppRecordName",
                handler
              );
            }
            getAppRootInstance(handler) {
              this.hook(
                "getAppRootInstance",
                handler
              );
            }
            registerApplication(handler) {
              this.hook(
                "registerApplication",
                handler
              );
            }
            walkComponentTree(handler) {
              this.hook(
                "walkComponentTree",
                handler,
                shared_utils_1.PluginPermission.COMPONENTS
              );
            }
            visitComponentTree(handler) {
              this.hook(
                "visitComponentTree",
                handler,
                shared_utils_1.PluginPermission.COMPONENTS
              );
            }
            walkComponentParents(handler) {
              this.hook(
                "walkComponentParents",
                handler,
                shared_utils_1.PluginPermission.COMPONENTS
              );
            }
            inspectComponent(handler) {
              this.hook(
                "inspectComponent",
                handler,
                shared_utils_1.PluginPermission.COMPONENTS
              );
            }
            getComponentBounds(handler) {
              this.hook(
                "getComponentBounds",
                handler,
                shared_utils_1.PluginPermission.COMPONENTS
              );
            }
            getComponentName(handler) {
              this.hook(
                "getComponentName",
                handler,
                shared_utils_1.PluginPermission.COMPONENTS
              );
            }
            getComponentInstances(handler) {
              this.hook(
                "getComponentInstances",
                handler,
                shared_utils_1.PluginPermission.COMPONENTS
              );
            }
            getElementComponent(handler) {
              this.hook(
                "getElementComponent",
                handler,
                shared_utils_1.PluginPermission.COMPONENTS
              );
            }
            getComponentRootElements(handler) {
              this.hook(
                "getComponentRootElements",
                handler,
                shared_utils_1.PluginPermission.COMPONENTS
              );
            }
            editComponentState(handler) {
              this.hook(
                "editComponentState",
                handler,
                shared_utils_1.PluginPermission.COMPONENTS
              );
            }
            getComponentDevtoolsOptions(handler) {
              this.hook(
                "getAppDevtoolsOptions",
                handler,
                shared_utils_1.PluginPermission.COMPONENTS
              );
            }
            getComponentRenderCode(handler) {
              this.hook(
                "getComponentRenderCode",
                handler,
                shared_utils_1.PluginPermission.COMPONENTS
              );
            }
            inspectTimelineEvent(handler) {
              this.hook(
                "inspectTimelineEvent",
                handler,
                shared_utils_1.PluginPermission.TIMELINE
              );
            }
            timelineCleared(handler) {
              this.hook(
                "timelineCleared",
                handler,
                shared_utils_1.PluginPermission.TIMELINE
              );
            }
            getInspectorTree(handler) {
              this.hook(
                "getInspectorTree",
                handler,
                shared_utils_1.PluginPermission.CUSTOM_INSPECTOR
              );
            }
            getInspectorState(handler) {
              this.hook(
                "getInspectorState",
                handler,
                shared_utils_1.PluginPermission.CUSTOM_INSPECTOR
              );
            }
            editInspectorState(handler) {
              this.hook(
                "editInspectorState",
                handler,
                shared_utils_1.PluginPermission.CUSTOM_INSPECTOR
              );
            }
            setPluginSettings(handler) {
              this.hook(
                "setPluginSettings",
                handler
              );
            }
          }
          exports.DevtoolsHookable = DevtoolsHookable;
        }
      ),
      /***/
      "../app-backend-api/lib/index.js": (
        /*!***************************************!*\
          !*** ../app-backend-api/lib/index.js ***!
          \***************************************/
        /***/
        function(__unused_webpack_module, exports, __webpack_require__2) {
          var __createBinding = this && this.__createBinding || (Object.create ? function(o2, m2, k2, k22) {
            if (k22 === void 0)
              k22 = k2;
            var desc = Object.getOwnPropertyDescriptor(m2, k2);
            if (!desc || ("get" in desc ? !m2.__esModule : desc.writable || desc.configurable)) {
              desc = {
                enumerable: true,
                get: function() {
                  return m2[k2];
                }
              };
            }
            Object.defineProperty(o2, k22, desc);
          } : function(o2, m2, k2, k22) {
            if (k22 === void 0)
              k22 = k2;
            o2[k22] = m2[k2];
          });
          var __exportStar = this && this.__exportStar || function(m2, exports2) {
            for (var p2 in m2)
              if (p2 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p2))
                __createBinding(exports2, m2, p2);
          };
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          __exportStar(__webpack_require__2(
            /*! ./api */
            "../app-backend-api/lib/api.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./app-record */
            "../app-backend-api/lib/app-record.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./backend */
            "../app-backend-api/lib/backend.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./backend-context */
            "../app-backend-api/lib/backend-context.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./global-hook */
            "../app-backend-api/lib/global-hook.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./hooks */
            "../app-backend-api/lib/hooks.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./plugin */
            "../app-backend-api/lib/plugin.js"
          ), exports);
        }
      ),
      /***/
      "../app-backend-api/lib/plugin.js": (
        /*!****************************************!*\
          !*** ../app-backend-api/lib/plugin.js ***!
          \****************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
        }
      ),
      /***/
      "../app-backend-core/lib/app.js": (
        /*!**************************************!*\
          !*** ../app-backend-core/lib/app.js ***!
          \**************************************/
        /***/
        function(__unused_webpack_module, exports, __webpack_require__2) {
          var __importDefault = this && this.__importDefault || function(mod) {
            return mod && mod.__esModule ? mod : {
              "default": mod
            };
          };
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports._legacy_getAndRegisterApps = exports.removeApp = exports.sendApps = exports.waitForAppsRegistration = exports.getAppRecord = exports.getAppRecordId = exports.mapAppRecord = exports.selectApp = exports.registerApp = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const speakingurl_1 = __importDefault(__webpack_require__2(
            /*! speakingurl */
            "../../node_modules/speakingurl/index.js"
          ));
          const queue_1 = __webpack_require__2(
            /*! ./util/queue */
            "../app-backend-core/lib/util/queue.js"
          );
          const scan_1 = __webpack_require__2(
            /*! ./legacy/scan */
            "../app-backend-core/lib/legacy/scan.js"
          );
          const timeline_1 = __webpack_require__2(
            /*! ./timeline */
            "../app-backend-core/lib/timeline.js"
          );
          const backend_1 = __webpack_require__2(
            /*! ./backend */
            "../app-backend-core/lib/backend.js"
          );
          const global_hook_js_1 = __webpack_require__2(
            /*! ./global-hook.js */
            "../app-backend-core/lib/global-hook.js"
          );
          const jobs = new queue_1.JobQueue();
          let recordId = 0;
          const appRecordPromises = /* @__PURE__ */ new Map();
          async function registerApp(options, ctx) {
            return jobs.queue("regiserApp", () => registerAppJob(options, ctx));
          }
          exports.registerApp = registerApp;
          async function registerAppJob(options, ctx) {
            if (ctx.appRecords.find((a2) => a2.options.app === options.app)) {
              return;
            }
            if (!options.version) {
              throw new Error("[Vue Devtools] Vue version not found");
            }
            const baseFrameworkVersion = parseInt(options.version.substring(0, options.version.indexOf(".")));
            for (let i2 = 0; i2 < backend_1.availableBackends.length; i2++) {
              const backendOptions = backend_1.availableBackends[i2];
              if (backendOptions.frameworkVersion === baseFrameworkVersion) {
                const backend = (0, backend_1.getBackend)(backendOptions, ctx);
                await createAppRecord(options, backend, ctx);
                break;
              }
            }
          }
          async function createAppRecord(options, backend, ctx) {
            var _a, _b, _c;
            const rootInstance = await backend.api.getAppRootInstance(options.app);
            if (rootInstance) {
              if ((await backend.api.getComponentDevtoolsOptions(rootInstance)).hide) {
                options.app._vueDevtools_hidden_ = true;
                return;
              }
              recordId++;
              const name = await backend.api.getAppRecordName(options.app, recordId.toString());
              const id = getAppRecordId(options.app, (0, speakingurl_1.default)(name));
              const [el] = await backend.api.getComponentRootElements(rootInstance);
              const record = {
                id,
                name,
                options,
                backend,
                lastInspectedComponentId: null,
                instanceMap: /* @__PURE__ */ new Map(),
                rootInstance,
                perfGroupIds: /* @__PURE__ */ new Map(),
                iframe: shared_utils_1.isBrowser && el && document !== el.ownerDocument ? (_b = (_a = el.ownerDocument) === null || _a === void 0 ? void 0 : _a.location) === null || _b === void 0 ? void 0 : _b.pathname : null,
                meta: (_c = options.meta) !== null && _c !== void 0 ? _c : {}
              };
              options.app.__VUE_DEVTOOLS_APP_RECORD__ = record;
              const rootId = `${record.id}:root`;
              record.instanceMap.set(rootId, record.rootInstance);
              record.rootInstance.__VUE_DEVTOOLS_UID__ = rootId;
              (0, timeline_1.addBuiltinLayers)(record, ctx);
              ctx.appRecords.push(record);
              if (backend.options.setupApp) {
                backend.options.setupApp(backend.api, record);
              }
              await backend.api.registerApplication(options.app);
              ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_ADD, {
                appRecord: mapAppRecord(record)
              });
              if (appRecordPromises.has(options.app)) {
                for (const r2 of appRecordPromises.get(options.app)) {
                  await r2(record);
                }
              }
              if (ctx.currentAppRecord == null) {
                await selectApp(record, ctx);
              }
            } else if (shared_utils_1.SharedData.debugInfo) {
              console.warn("[Vue devtools] No root instance found for app, it might have been unmounted", options.app);
            }
          }
          async function selectApp(record, ctx) {
            ctx.currentAppRecord = record;
            ctx.currentInspectedComponentId = record.lastInspectedComponentId;
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_SELECTED, {
              id: record.id,
              lastInspectedComponentId: record.lastInspectedComponentId
            });
          }
          exports.selectApp = selectApp;
          function mapAppRecord(record) {
            return {
              id: record.id,
              name: record.name,
              version: record.options.version,
              iframe: record.iframe
            };
          }
          exports.mapAppRecord = mapAppRecord;
          const appIds = /* @__PURE__ */ new Set();
          function getAppRecordId(app, defaultId) {
            if (app.__VUE_DEVTOOLS_APP_RECORD_ID__ != null) {
              return app.__VUE_DEVTOOLS_APP_RECORD_ID__;
            }
            let id = defaultId !== null && defaultId !== void 0 ? defaultId : (recordId++).toString();
            if (defaultId && appIds.has(id)) {
              let count = 1;
              while (appIds.has(`${defaultId}_${count}`)) {
                count++;
              }
              id = `${defaultId}_${count}`;
            }
            appIds.add(id);
            app.__VUE_DEVTOOLS_APP_RECORD_ID__ = id;
            return id;
          }
          exports.getAppRecordId = getAppRecordId;
          async function getAppRecord(app, ctx) {
            var _a;
            const record = (_a = app.__VUE_DEVTOOLS_APP_RECORD__) !== null && _a !== void 0 ? _a : ctx.appRecords.find((ar) => ar.options.app === app);
            if (record) {
              return record;
            }
            if (app._vueDevtools_hidden_)
              return null;
            return new Promise((resolve, reject) => {
              let resolvers = appRecordPromises.get(app);
              let timedOut = false;
              if (!resolvers) {
                resolvers = [];
                appRecordPromises.set(app, resolvers);
              }
              const fn = (record2) => {
                if (!timedOut) {
                  clearTimeout(timer);
                  resolve(record2);
                }
              };
              resolvers.push(fn);
              const timer = setTimeout(() => {
                timedOut = true;
                const index = resolvers.indexOf(fn);
                if (index !== -1)
                  resolvers.splice(index, 1);
                if (shared_utils_1.SharedData.debugInfo) {
                  console.log("Timed out waiting for app record", app);
                }
                reject(new Error(`Timed out getting app record for app`));
              }, 6e4);
            });
          }
          exports.getAppRecord = getAppRecord;
          function waitForAppsRegistration() {
            return jobs.queue("waitForAppsRegistrationNoop", async () => {
            });
          }
          exports.waitForAppsRegistration = waitForAppsRegistration;
          async function sendApps(ctx) {
            const appRecords = [];
            for (const appRecord of ctx.appRecords) {
              appRecords.push(appRecord);
            }
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_LIST, {
              apps: appRecords.map(mapAppRecord)
            });
          }
          exports.sendApps = sendApps;
          function removeAppRecord(appRecord, ctx) {
            try {
              appIds.delete(appRecord.id);
              const index = ctx.appRecords.indexOf(appRecord);
              if (index !== -1)
                ctx.appRecords.splice(index, 1);
              (0, timeline_1.removeLayersForApp)(appRecord.options.app, ctx);
              ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_APP_REMOVE, {
                id: appRecord.id
              });
            } catch (e) {
              if (shared_utils_1.SharedData.debugInfo) {
                console.error(e);
              }
            }
          }
          async function removeApp(app, ctx) {
            try {
              const appRecord = await getAppRecord(app, ctx);
              if (appRecord) {
                removeAppRecord(appRecord, ctx);
              }
            } catch (e) {
              if (shared_utils_1.SharedData.debugInfo) {
                console.error(e);
              }
            }
          }
          exports.removeApp = removeApp;
          let scanTimeout;
          function _legacy_getAndRegisterApps(ctx, clear = false) {
            setTimeout(() => {
              try {
                if (clear) {
                  ctx.appRecords.forEach((appRecord) => {
                    if (appRecord.meta.Vue) {
                      removeAppRecord(appRecord, ctx);
                    }
                  });
                }
                const apps = (0, scan_1.scan)();
                clearTimeout(scanTimeout);
                if (!apps.length) {
                  scanTimeout = setTimeout(() => _legacy_getAndRegisterApps(ctx), 1e3);
                }
                apps.forEach((app) => {
                  const Vue2 = global_hook_js_1.hook.Vue;
                  registerApp({
                    app,
                    types: {},
                    version: Vue2 === null || Vue2 === void 0 ? void 0 : Vue2.version,
                    meta: {
                      Vue: Vue2
                    }
                  }, ctx);
                });
              } catch (e) {
                console.error(`Error scanning for legacy apps:`);
                console.error(e);
              }
            }, 0);
          }
          exports._legacy_getAndRegisterApps = _legacy_getAndRegisterApps;
        }
      ),
      /***/
      "../app-backend-core/lib/backend.js": (
        /*!******************************************!*\
          !*** ../app-backend-core/lib/backend.js ***!
          \******************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.getBackend = exports.availableBackends = void 0;
          const app_backend_api_1 = __webpack_require__2(
            /*! @vue-devtools/app-backend-api */
            "../app-backend-api/lib/index.js"
          );
          const app_backend_vue3_1 = __webpack_require__2(
            /*! @vue-devtools/app-backend-vue3 */
            "../app-backend-vue3/lib/index.js"
          );
          const perf_1 = __webpack_require__2(
            /*! ./perf */
            "../app-backend-core/lib/perf.js"
          );
          exports.availableBackends = [
            // backendVue1,
            // backendVue2,
            app_backend_vue3_1.backend
          ];
          const enabledBackends = /* @__PURE__ */ new Map();
          function getBackend(backendOptions, ctx) {
            let backend;
            if (!enabledBackends.has(backendOptions)) {
              backend = (0, app_backend_api_1.createBackend)(backendOptions, ctx);
              (0, perf_1.handleAddPerformanceTag)(backend, ctx);
              enabledBackends.set(backendOptions, backend);
              ctx.backends.push(backend);
            } else {
              backend = enabledBackends.get(backendOptions);
            }
            return backend;
          }
          exports.getBackend = getBackend;
        }
      ),
      /***/
      "../app-backend-core/lib/component-pick.js": (
        /*!*************************************************!*\
          !*** ../app-backend-core/lib/component-pick.js ***!
          \*************************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const highlighter_1 = __webpack_require__2(
            /*! ./highlighter */
            "../app-backend-core/lib/highlighter.js"
          );
          class ComponentPicker {
            constructor(ctx) {
              this.ctx = ctx;
              this.bindMethods();
            }
            /**
             * Adds event listeners for mouseover and mouseup
             */
            startSelecting() {
              if (!shared_utils_1.isBrowser)
                return;
              window.addEventListener("mouseover", this.elementMouseOver, true);
              window.addEventListener("click", this.elementClicked, true);
              window.addEventListener("mouseout", this.cancelEvent, true);
              window.addEventListener("mouseenter", this.cancelEvent, true);
              window.addEventListener("mouseleave", this.cancelEvent, true);
              window.addEventListener("mousedown", this.cancelEvent, true);
              window.addEventListener("mouseup", this.cancelEvent, true);
            }
            /**
             * Removes event listeners
             */
            stopSelecting() {
              if (!shared_utils_1.isBrowser)
                return;
              window.removeEventListener("mouseover", this.elementMouseOver, true);
              window.removeEventListener("click", this.elementClicked, true);
              window.removeEventListener("mouseout", this.cancelEvent, true);
              window.removeEventListener("mouseenter", this.cancelEvent, true);
              window.removeEventListener("mouseleave", this.cancelEvent, true);
              window.removeEventListener("mousedown", this.cancelEvent, true);
              window.removeEventListener("mouseup", this.cancelEvent, true);
              (0, highlighter_1.unHighlight)();
            }
            /**
             * Highlights a component on element mouse over
             */
            async elementMouseOver(e) {
              this.cancelEvent(e);
              const el = e.target;
              if (el) {
                await this.selectElementComponent(el);
              }
              (0, highlighter_1.unHighlight)();
              if (this.selectedInstance) {
                (0, highlighter_1.highlight)(this.selectedInstance, this.selectedBackend, this.ctx);
              }
            }
            async selectElementComponent(el) {
              for (const backend of this.ctx.backends) {
                const instance = await backend.api.getElementComponent(el);
                if (instance) {
                  this.selectedInstance = instance;
                  this.selectedBackend = backend;
                  return;
                }
              }
              this.selectedInstance = null;
              this.selectedBackend = null;
            }
            /**
             * Selects an instance in the component view
             */
            async elementClicked(e) {
              this.cancelEvent(e);
              if (this.selectedInstance && this.selectedBackend) {
                const parentInstances = await this.selectedBackend.api.walkComponentParents(this.selectedInstance);
                this.ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_PICK, {
                  id: this.selectedInstance.__VUE_DEVTOOLS_UID__,
                  parentIds: parentInstances.map((i2) => i2.__VUE_DEVTOOLS_UID__)
                });
              } else {
                this.ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_PICK_CANCELED, null);
              }
              this.stopSelecting();
            }
            /**
             * Cancel a mouse event
             */
            cancelEvent(e) {
              e.stopImmediatePropagation();
              e.preventDefault();
            }
            /**
             * Bind class methods to the class scope to avoid rebind for event listeners
             */
            bindMethods() {
              this.startSelecting = this.startSelecting.bind(this);
              this.stopSelecting = this.stopSelecting.bind(this);
              this.elementMouseOver = this.elementMouseOver.bind(this);
              this.elementClicked = this.elementClicked.bind(this);
            }
          }
          exports["default"] = ComponentPicker;
        }
      ),
      /***/
      "../app-backend-core/lib/component.js": (
        /*!********************************************!*\
          !*** ../app-backend-core/lib/component.js ***!
          \********************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.sendComponentUpdateTracking = exports.refreshComponentTreeSearch = exports.getComponentInstance = exports.getComponentId = exports.editComponentState = exports.sendEmptyComponentData = exports.markSelectedInstance = exports.sendSelectedComponentData = exports.sendComponentTreeData = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const app_backend_api_1 = __webpack_require__2(
            /*! @vue-devtools/app-backend-api */
            "../app-backend-api/lib/index.js"
          );
          const app_1 = __webpack_require__2(
            /*! ./app */
            "../app-backend-core/lib/app.js"
          );
          const MAX_$VM = 10;
          const $vmQueue = [];
          async function sendComponentTreeData(appRecord, instanceId, filter = "", maxDepth = null, recursively = false, ctx) {
            if (!instanceId || appRecord !== ctx.currentAppRecord)
              return;
            if (instanceId !== "_root" && ctx.currentAppRecord.backend.options.features.includes(app_backend_api_1.BuiltinBackendFeature.FLUSH)) {
              return;
            }
            const instance = getComponentInstance(appRecord, instanceId);
            if (!instance) {
              ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_TREE, {
                instanceId,
                treeData: null,
                notFound: true
              });
            } else {
              if (filter)
                filter = filter.toLowerCase();
              if (maxDepth == null) {
                maxDepth = instance === ctx.currentAppRecord.rootInstance ? 2 : 1;
              }
              const data = await appRecord.backend.api.walkComponentTree(instance, maxDepth, filter, recursively);
              const payload = {
                instanceId,
                treeData: (0, shared_utils_1.stringify)(data)
              };
              ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_TREE, payload);
            }
          }
          exports.sendComponentTreeData = sendComponentTreeData;
          async function sendSelectedComponentData(appRecord, instanceId, ctx) {
            if (!instanceId || appRecord !== ctx.currentAppRecord)
              return;
            const instance = getComponentInstance(appRecord, instanceId);
            if (!instance) {
              sendEmptyComponentData(instanceId, ctx);
            } else {
              if (typeof window !== "undefined") {
                const win = window;
                win.$vm = instance;
                if ($vmQueue[0] !== instance) {
                  if ($vmQueue.length >= MAX_$VM) {
                    $vmQueue.pop();
                  }
                  for (let i2 = $vmQueue.length; i2 > 0; i2--) {
                    win[`$vm${i2}`] = $vmQueue[i2] = $vmQueue[i2 - 1];
                  }
                  win.$vm0 = $vmQueue[0] = instance;
                }
              }
              if (shared_utils_1.SharedData.debugInfo) {
                console.log("[DEBUG] inspect", instance);
              }
              const parentInstances = await appRecord.backend.api.walkComponentParents(instance);
              const payload = {
                instanceId,
                data: await appRecord.backend.api.inspectComponent(instance, ctx.currentAppRecord.options.app),
                parentIds: parentInstances.map((i2) => i2.__VUE_DEVTOOLS_UID__)
              };
              {
                payload.data.isSetup = !!instance.type.setup && !instance.type.render;
              }
              payload.data = (0, shared_utils_1.stringify)(payload.data);
              ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, payload);
              markSelectedInstance(instanceId, ctx);
            }
          }
          exports.sendSelectedComponentData = sendSelectedComponentData;
          function markSelectedInstance(instanceId, ctx) {
            ctx.currentInspectedComponentId = instanceId;
            ctx.currentAppRecord.lastInspectedComponentId = instanceId;
          }
          exports.markSelectedInstance = markSelectedInstance;
          function sendEmptyComponentData(instanceId, ctx) {
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_SELECTED_DATA, {
              instanceId,
              data: null
            });
          }
          exports.sendEmptyComponentData = sendEmptyComponentData;
          async function editComponentState(instanceId, dotPath, type, state, ctx) {
            if (!instanceId)
              return;
            const instance = getComponentInstance(ctx.currentAppRecord, instanceId);
            if (instance) {
              if ("value" in state && state.value != null) {
                state.value = (0, shared_utils_1.parse)(state.value, true);
              }
              await ctx.currentAppRecord.backend.api.editComponentState(instance, dotPath, type, state, ctx.currentAppRecord.options.app);
              await sendSelectedComponentData(ctx.currentAppRecord, instanceId, ctx);
            }
          }
          exports.editComponentState = editComponentState;
          async function getComponentId(app, uid, instance, ctx) {
            try {
              if (instance.__VUE_DEVTOOLS_UID__)
                return instance.__VUE_DEVTOOLS_UID__;
              const appRecord = await (0, app_1.getAppRecord)(app, ctx);
              if (!appRecord)
                return null;
              const isRoot = appRecord.rootInstance === instance;
              return `${appRecord.id}:${isRoot ? "root" : uid}`;
            } catch (e) {
              if (shared_utils_1.SharedData.debugInfo) {
                console.error(e);
              }
              return null;
            }
          }
          exports.getComponentId = getComponentId;
          function getComponentInstance(appRecord, instanceId, ctx) {
            if (instanceId === "_root") {
              instanceId = `${appRecord.id}:root`;
            }
            const instance = appRecord.instanceMap.get(instanceId);
            if (!instance && shared_utils_1.SharedData.debugInfo) {
              console.warn(`Instance uid=${instanceId} not found`);
            }
            return instance;
          }
          exports.getComponentInstance = getComponentInstance;
          async function refreshComponentTreeSearch(ctx) {
            if (!ctx.currentAppRecord.componentFilter)
              return;
            await sendComponentTreeData(ctx.currentAppRecord, "_root", ctx.currentAppRecord.componentFilter, null, false, ctx);
          }
          exports.refreshComponentTreeSearch = refreshComponentTreeSearch;
          async function sendComponentUpdateTracking(instanceId, ctx) {
            if (!instanceId)
              return;
            const payload = {
              instanceId,
              time: Date.now()
              // Use normal date
            };
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_UPDATED, payload);
          }
          exports.sendComponentUpdateTracking = sendComponentUpdateTracking;
        }
      ),
      /***/
      "../app-backend-core/lib/flash.js": (
        /*!****************************************!*\
          !*** ../app-backend-core/lib/flash.js ***!
          \****************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.flashComponent = void 0;
          async function flashComponent(instance, backend) {
            const bounds = await backend.api.getComponentBounds(instance);
            if (bounds) {
              let overlay = instance.__VUE_DEVTOOLS_FLASH;
              if (!overlay) {
                overlay = document.createElement("div");
                instance.__VUE_DEVTOOLS_FLASH = overlay;
                overlay.style.border = "2px rgba(65, 184, 131, 0.7) solid";
                overlay.style.position = "fixed";
                overlay.style.zIndex = "99999999999998";
                overlay.style.pointerEvents = "none";
                overlay.style.borderRadius = "3px";
                overlay.style.boxSizing = "border-box";
                document.body.appendChild(overlay);
              }
              overlay.style.opacity = "1";
              overlay.style.transition = null;
              overlay.style.width = Math.round(bounds.width) + "px";
              overlay.style.height = Math.round(bounds.height) + "px";
              overlay.style.left = Math.round(bounds.left) + "px";
              overlay.style.top = Math.round(bounds.top) + "px";
              requestAnimationFrame(() => {
                overlay.style.transition = "opacity 1s";
                overlay.style.opacity = "0";
              });
              clearTimeout(overlay._timer);
              overlay._timer = setTimeout(() => {
                document.body.removeChild(overlay);
                instance.__VUE_DEVTOOLS_FLASH = null;
              }, 1e3);
            }
          }
          exports.flashComponent = flashComponent;
        }
      ),
      /***/
      "../app-backend-core/lib/global-hook.js": (
        /*!**********************************************!*\
          !*** ../app-backend-core/lib/global-hook.js ***!
          \**********************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.hook = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          exports.hook = shared_utils_1.target.__VUE_DEVTOOLS_GLOBAL_HOOK__;
        }
      ),
      /***/
      "../app-backend-core/lib/highlighter.js": (
        /*!**********************************************!*\
          !*** ../app-backend-core/lib/highlighter.js ***!
          \**********************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.unHighlight = exports.highlight = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const queue_1 = __webpack_require__2(
            /*! ./util/queue */
            "../app-backend-core/lib/util/queue.js"
          );
          let overlay;
          let overlayContent;
          let currentInstance;
          function createOverlay() {
            if (overlay || !shared_utils_1.isBrowser)
              return;
            overlay = document.createElement("div");
            overlay.style.backgroundColor = "rgba(65, 184, 131, 0.35)";
            overlay.style.position = "fixed";
            overlay.style.zIndex = "99999999999998";
            overlay.style.pointerEvents = "none";
            overlay.style.borderRadius = "3px";
            overlayContent = document.createElement("div");
            overlayContent.style.position = "fixed";
            overlayContent.style.zIndex = "99999999999999";
            overlayContent.style.pointerEvents = "none";
            overlayContent.style.backgroundColor = "white";
            overlayContent.style.fontFamily = "monospace";
            overlayContent.style.fontSize = "11px";
            overlayContent.style.padding = "4px 8px";
            overlayContent.style.borderRadius = "3px";
            overlayContent.style.color = "#333";
            overlayContent.style.textAlign = "center";
            overlayContent.style.border = "rgba(65, 184, 131, 0.5) 1px solid";
            overlayContent.style.backgroundClip = "padding-box";
          }
          const jobQueue = new queue_1.JobQueue();
          async function highlight(instance, backend, ctx) {
            await jobQueue.queue("highlight", async () => {
              if (!instance)
                return;
              const bounds = await backend.api.getComponentBounds(instance);
              if (bounds) {
                createOverlay();
                const name = await backend.api.getComponentName(instance) || "Anonymous";
                const pre = document.createElement("span");
                pre.style.opacity = "0.6";
                pre.innerText = "<";
                const text = document.createElement("span");
                text.style.fontWeight = "bold";
                text.style.color = "#09ab56";
                text.innerText = name;
                const post = document.createElement("span");
                post.style.opacity = "0.6";
                post.innerText = ">";
                const size = document.createElement("span");
                size.style.opacity = "0.5";
                size.style.marginLeft = "6px";
                size.appendChild(document.createTextNode((Math.round(bounds.width * 100) / 100).toString()));
                const multiply = document.createElement("span");
                multiply.style.marginLeft = multiply.style.marginRight = "2px";
                multiply.innerText = "×";
                size.appendChild(multiply);
                size.appendChild(document.createTextNode((Math.round(bounds.height * 100) / 100).toString()));
                currentInstance = instance;
                await showOverlay(bounds, [pre, text, post, size]);
              }
              startUpdateTimer(backend);
            });
          }
          exports.highlight = highlight;
          async function unHighlight() {
            await jobQueue.queue("unHighlight", async () => {
              var _a, _b;
              (_a = overlay === null || overlay === void 0 ? void 0 : overlay.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(overlay);
              (_b = overlayContent === null || overlayContent === void 0 ? void 0 : overlayContent.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(overlayContent);
              currentInstance = null;
              stopUpdateTimer();
            });
          }
          exports.unHighlight = unHighlight;
          function showOverlay(bounds, children = null) {
            if (!shared_utils_1.isBrowser || !children.length)
              return;
            positionOverlay(bounds);
            document.body.appendChild(overlay);
            overlayContent.innerHTML = "";
            children.forEach((child) => overlayContent.appendChild(child));
            document.body.appendChild(overlayContent);
            positionOverlayContent(bounds);
          }
          function positionOverlay({
            width = 0,
            height = 0,
            top = 0,
            left = 0
          }) {
            overlay.style.width = Math.round(width) + "px";
            overlay.style.height = Math.round(height) + "px";
            overlay.style.left = Math.round(left) + "px";
            overlay.style.top = Math.round(top) + "px";
          }
          function positionOverlayContent({
            height = 0,
            top = 0,
            left = 0
          }) {
            const contentWidth = overlayContent.offsetWidth;
            const contentHeight = overlayContent.offsetHeight;
            let contentLeft = left;
            if (contentLeft < 0) {
              contentLeft = 0;
            } else if (contentLeft + contentWidth > window.innerWidth) {
              contentLeft = window.innerWidth - contentWidth;
            }
            let contentTop = top - contentHeight - 2;
            if (contentTop < 0) {
              contentTop = top + height + 2;
            }
            if (contentTop < 0) {
              contentTop = 0;
            } else if (contentTop + contentHeight > window.innerHeight) {
              contentTop = window.innerHeight - contentHeight;
            }
            overlayContent.style.left = ~~contentLeft + "px";
            overlayContent.style.top = ~~contentTop + "px";
          }
          async function updateOverlay(backend, ctx) {
            if (currentInstance) {
              const bounds = await backend.api.getComponentBounds(currentInstance);
              if (bounds) {
                const sizeEl = overlayContent.children.item(3);
                const widthEl = sizeEl.childNodes[0];
                widthEl.textContent = (Math.round(bounds.width * 100) / 100).toString();
                const heightEl = sizeEl.childNodes[2];
                heightEl.textContent = (Math.round(bounds.height * 100) / 100).toString();
                positionOverlay(bounds);
                positionOverlayContent(bounds);
              }
            }
          }
          let updateTimer;
          function startUpdateTimer(backend, ctx) {
            stopUpdateTimer();
            updateTimer = setInterval(() => {
              jobQueue.queue("updateOverlay", async () => {
                await updateOverlay(backend);
              });
            }, 1e3 / 30);
          }
          function stopUpdateTimer() {
            clearInterval(updateTimer);
          }
        }
      ),
      /***/
      "../app-backend-core/lib/index.js": (
        /*!****************************************!*\
          !*** ../app-backend-core/lib/index.js ***!
          \****************************************/
        /***/
        function(__unused_webpack_module, exports, __webpack_require__2) {
          var __importDefault = this && this.__importDefault || function(mod) {
            return mod && mod.__esModule ? mod : {
              "default": mod
            };
          };
          var _a, _b;
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.initBackend = void 0;
          const app_backend_api_1 = __webpack_require__2(
            /*! @vue-devtools/app-backend-api */
            "../app-backend-api/lib/index.js"
          );
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const debounce_1 = __importDefault(__webpack_require__2(
            /*! lodash/debounce */
            "../../node_modules/lodash/debounce.js"
          ));
          const throttle_1 = __importDefault(__webpack_require__2(
            /*! lodash/throttle */
            "../../node_modules/lodash/throttle.js"
          ));
          const global_hook_1 = __webpack_require__2(
            /*! ./global-hook */
            "../app-backend-core/lib/global-hook.js"
          );
          const subscriptions_1 = __webpack_require__2(
            /*! ./util/subscriptions */
            "../app-backend-core/lib/util/subscriptions.js"
          );
          const highlighter_1 = __webpack_require__2(
            /*! ./highlighter */
            "../app-backend-core/lib/highlighter.js"
          );
          const timeline_1 = __webpack_require__2(
            /*! ./timeline */
            "../app-backend-core/lib/timeline.js"
          );
          const component_pick_1 = __importDefault(__webpack_require__2(
            /*! ./component-pick */
            "../app-backend-core/lib/component-pick.js"
          ));
          const component_1 = __webpack_require__2(
            /*! ./component */
            "../app-backend-core/lib/component.js"
          );
          const plugin_1 = __webpack_require__2(
            /*! ./plugin */
            "../app-backend-core/lib/plugin.js"
          );
          const devtools_api_1 = __webpack_require__2(
            /*! @vue/devtools-api */
            "../api/lib/esm/index.js"
          );
          const app_1 = __webpack_require__2(
            /*! ./app */
            "../app-backend-core/lib/app.js"
          );
          const inspector_1 = __webpack_require__2(
            /*! ./inspector */
            "../app-backend-core/lib/inspector.js"
          );
          const timeline_screenshot_1 = __webpack_require__2(
            /*! ./timeline-screenshot */
            "../app-backend-core/lib/timeline-screenshot.js"
          );
          const perf_1 = __webpack_require__2(
            /*! ./perf */
            "../app-backend-core/lib/perf.js"
          );
          const page_config_1 = __webpack_require__2(
            /*! ./page-config */
            "../app-backend-core/lib/page-config.js"
          );
          const timeline_marker_1 = __webpack_require__2(
            /*! ./timeline-marker */
            "../app-backend-core/lib/timeline-marker.js"
          );
          const flash_js_1 = __webpack_require__2(
            /*! ./flash.js */
            "../app-backend-core/lib/flash.js"
          );
          let ctx = (_a = shared_utils_1.target.__vdevtools_ctx) !== null && _a !== void 0 ? _a : null;
          let connected = (_b = shared_utils_1.target.__vdevtools_connected) !== null && _b !== void 0 ? _b : false;
          async function initBackend(bridge) {
            await (0, shared_utils_1.initSharedData)({
              bridge,
              persist: false
            });
            shared_utils_1.SharedData.isBrowser = shared_utils_1.isBrowser;
            (0, page_config_1.initOnPageConfig)();
            if (!connected) {
              ctx = shared_utils_1.target.__vdevtools_ctx = (0, app_backend_api_1.createBackendContext)({
                bridge,
                hook: global_hook_1.hook
              });
              shared_utils_1.SharedData.legacyApps = false;
              if (global_hook_1.hook.Vue) {
                connect();
                (0, app_1._legacy_getAndRegisterApps)(ctx, true);
                shared_utils_1.SharedData.legacyApps = true;
              }
              global_hook_1.hook.on(shared_utils_1.HookEvents.INIT, () => {
                (0, app_1._legacy_getAndRegisterApps)(ctx, true);
                shared_utils_1.SharedData.legacyApps = true;
              });
              global_hook_1.hook.on(shared_utils_1.HookEvents.APP_ADD, async (app) => {
                await (0, app_1.registerApp)(app, ctx);
                connect();
              });
              if (global_hook_1.hook.apps.length) {
                global_hook_1.hook.apps.forEach((app) => {
                  (0, app_1.registerApp)(app, ctx);
                  connect();
                });
              }
            } else {
              ctx.bridge = bridge;
              connectBridge();
              ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_RECONNECTED);
            }
          }
          exports.initBackend = initBackend;
          async function connect() {
            if (connected) {
              return;
            }
            connected = shared_utils_1.target.__vdevtools_connected = true;
            await (0, app_1.waitForAppsRegistration)();
            connectBridge();
            ctx.currentTab = shared_utils_1.BuiltinTabs.COMPONENTS;
            global_hook_1.hook.on(shared_utils_1.HookEvents.APP_UNMOUNT, async (app) => {
              await (0, app_1.removeApp)(app, ctx);
            });
            const _sendComponentUpdate = async (appRecord, id) => {
              try {
                if (id && (0, subscriptions_1.isSubscribed)(shared_utils_1.BridgeSubscriptions.SELECTED_COMPONENT_DATA, (sub) => sub.payload.instanceId === id)) {
                  await (0, component_1.sendSelectedComponentData)(appRecord, id, ctx);
                }
                if ((0, subscriptions_1.isSubscribed)(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, (sub) => sub.payload.instanceId === id)) {
                  await (0, component_1.sendComponentTreeData)(appRecord, id, appRecord.componentFilter, 0, false, ctx);
                }
              } catch (e) {
                if (shared_utils_1.SharedData.debugInfo) {
                  console.error(e);
                }
              }
            };
            const sendComponentUpdate = (0, throttle_1.default)(_sendComponentUpdate, 100);
            global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_UPDATED, async (app, uid, parentUid, component) => {
              try {
                if (!app || typeof uid !== "number" && !uid || !component)
                  return;
                let id;
                let appRecord;
                if (app && uid != null) {
                  id = await (0, component_1.getComponentId)(app, uid, component, ctx);
                  appRecord = await (0, app_1.getAppRecord)(app, ctx);
                } else {
                  id = ctx.currentInspectedComponentId;
                  appRecord = ctx.currentAppRecord;
                }
                if (shared_utils_1.SharedData.trackUpdates) {
                  await (0, component_1.sendComponentUpdateTracking)(id, ctx);
                }
                if (shared_utils_1.SharedData.flashUpdates) {
                  await (0, flash_js_1.flashComponent)(component, appRecord.backend);
                }
                await sendComponentUpdate(appRecord, id);
              } catch (e) {
                if (shared_utils_1.SharedData.debugInfo) {
                  console.error(e);
                }
              }
            });
            global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_ADDED, async (app, uid, parentUid, component) => {
              try {
                if (!app || typeof uid !== "number" && !uid || !component)
                  return;
                const id = await (0, component_1.getComponentId)(app, uid, component, ctx);
                const appRecord = await (0, app_1.getAppRecord)(app, ctx);
                if (component) {
                  if (component.__VUE_DEVTOOLS_UID__ == null) {
                    component.__VUE_DEVTOOLS_UID__ = id;
                  }
                  if (!appRecord.instanceMap.has(id)) {
                    appRecord.instanceMap.set(id, component);
                  }
                }
                if (uid !== 0 && parentUid === void 0) {
                  const parentId = `${id.split(":")[0]}:root`;
                  (0, component_1.sendComponentTreeData)(appRecord, parentId, appRecord.componentFilter, null, false, ctx);
                }
                if (false)
                  ;
                if (parentUid != null) {
                  const parentInstances = await appRecord.backend.api.walkComponentParents(component);
                  if (parentInstances.length) {
                    for (let i2 = 0; i2 < parentInstances.length; i2++) {
                      const parentId = await (0, component_1.getComponentId)(app, parentUid, parentInstances[i2], ctx);
                      if (i2 < 2 && (0, subscriptions_1.isSubscribed)(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, (sub) => sub.payload.instanceId === parentId)) {
                        (0, shared_utils_1.raf)(() => {
                          (0, component_1.sendComponentTreeData)(appRecord, parentId, appRecord.componentFilter, null, false, ctx);
                        });
                      }
                      if (shared_utils_1.SharedData.trackUpdates) {
                        await (0, component_1.sendComponentUpdateTracking)(parentId, ctx);
                      }
                    }
                  }
                }
                if (ctx.currentInspectedComponentId === id) {
                  await (0, component_1.sendSelectedComponentData)(appRecord, id, ctx);
                }
                if (shared_utils_1.SharedData.trackUpdates) {
                  await (0, component_1.sendComponentUpdateTracking)(id, ctx);
                }
                if (shared_utils_1.SharedData.flashUpdates) {
                  await (0, flash_js_1.flashComponent)(component, appRecord.backend);
                }
                await (0, component_1.refreshComponentTreeSearch)(ctx);
              } catch (e) {
                if (shared_utils_1.SharedData.debugInfo) {
                  console.error(e);
                }
              }
            });
            global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_REMOVED, async (app, uid, parentUid, component) => {
              try {
                if (!app || typeof uid !== "number" && !uid || !component)
                  return;
                const appRecord = await (0, app_1.getAppRecord)(app, ctx);
                if (uid !== 0 && parentUid === void 0) {
                  const id2 = await (0, component_1.getComponentId)(app, uid, component, ctx);
                  const parentId = `${id2.split(":")[0]}:root`;
                  (0, component_1.sendComponentTreeData)(appRecord, parentId, appRecord.componentFilter, null, false, ctx);
                }
                if (parentUid != null) {
                  const parentInstances = await appRecord.backend.api.walkComponentParents(component);
                  if (parentInstances.length) {
                    const parentId = await (0, component_1.getComponentId)(app, parentUid, parentInstances[0], ctx);
                    if ((0, subscriptions_1.isSubscribed)(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, (sub) => sub.payload.instanceId === parentId)) {
                      (0, shared_utils_1.raf)(async () => {
                        try {
                          (0, component_1.sendComponentTreeData)(await (0, app_1.getAppRecord)(app, ctx), parentId, appRecord.componentFilter, null, false, ctx);
                        } catch (e) {
                          if (shared_utils_1.SharedData.debugInfo) {
                            console.error(e);
                          }
                        }
                      });
                    }
                  }
                }
                const id = await (0, component_1.getComponentId)(app, uid, component, ctx);
                if ((0, subscriptions_1.isSubscribed)(shared_utils_1.BridgeSubscriptions.SELECTED_COMPONENT_DATA, (sub) => sub.payload.instanceId === id)) {
                  await (0, component_1.sendEmptyComponentData)(id, ctx);
                }
                appRecord.instanceMap.delete(id);
                await (0, component_1.refreshComponentTreeSearch)(ctx);
              } catch (e) {
                if (shared_utils_1.SharedData.debugInfo) {
                  console.error(e);
                }
              }
            });
            global_hook_1.hook.on(shared_utils_1.HookEvents.TRACK_UPDATE, (id, ctx2) => {
              (0, component_1.sendComponentUpdateTracking)(id, ctx2);
            });
            global_hook_1.hook.on(shared_utils_1.HookEvents.FLASH_UPDATE, (instance, backend) => {
              (0, flash_js_1.flashComponent)(instance, backend);
            });
            global_hook_1.hook.on(shared_utils_1.HookEvents.PERFORMANCE_START, async (app, uid, vm, type, time) => {
              await (0, perf_1.performanceMarkStart)(app, uid, vm, type, time, ctx);
            });
            global_hook_1.hook.on(shared_utils_1.HookEvents.PERFORMANCE_END, async (app, uid, vm, type, time) => {
              await (0, perf_1.performanceMarkEnd)(app, uid, vm, type, time, ctx);
            });
            global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_HIGHLIGHT, async (instanceId) => {
              await (0, highlighter_1.highlight)(ctx.currentAppRecord.instanceMap.get(instanceId), ctx.currentAppRecord.backend, ctx);
            });
            global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_UNHIGHLIGHT, async () => {
              await (0, highlighter_1.unHighlight)();
            });
            (0, timeline_1.setupTimeline)(ctx);
            global_hook_1.hook.on(shared_utils_1.HookEvents.TIMELINE_LAYER_ADDED, async (options, plugin) => {
              const appRecord = await (0, app_1.getAppRecord)(plugin.descriptor.app, ctx);
              ctx.timelineLayers.push({
                ...options,
                appRecord,
                plugin,
                events: []
              });
              ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_LAYER_ADD, {});
            });
            global_hook_1.hook.on(shared_utils_1.HookEvents.TIMELINE_EVENT_ADDED, async (options, plugin) => {
              await (0, timeline_1.addTimelineEvent)(options, plugin.descriptor.app, ctx);
            });
            global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_ADD, async (options, plugin) => {
              const appRecord = await (0, app_1.getAppRecord)(plugin.descriptor.app, ctx);
              ctx.customInspectors.push({
                ...options,
                appRecord,
                plugin,
                treeFilter: "",
                selectedNodeId: null
              });
              ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_ADD, {});
            });
            global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_TREE, async (inspectorId, plugin) => {
              const inspector = (0, inspector_1.getInspector)(inspectorId, plugin.descriptor.app, ctx);
              if (inspector) {
                await (0, inspector_1.sendInspectorTree)(inspector, ctx);
              } else if (shared_utils_1.SharedData.debugInfo) {
                console.warn(`Inspector ${inspectorId} not found`);
              }
            });
            global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SEND_STATE, async (inspectorId, plugin) => {
              const inspector = (0, inspector_1.getInspector)(inspectorId, plugin.descriptor.app, ctx);
              if (inspector) {
                await (0, inspector_1.sendInspectorState)(inspector, ctx);
              } else if (shared_utils_1.SharedData.debugInfo) {
                console.warn(`Inspector ${inspectorId} not found`);
              }
            });
            global_hook_1.hook.on(shared_utils_1.HookEvents.CUSTOM_INSPECTOR_SELECT_NODE, async (inspectorId, nodeId, plugin) => {
              const inspector = (0, inspector_1.getInspector)(inspectorId, plugin.descriptor.app, ctx);
              if (inspector) {
                await (0, inspector_1.selectInspectorNode)(inspector, nodeId, ctx);
              } else if (shared_utils_1.SharedData.debugInfo) {
                console.warn(`Inspector ${inspectorId} not found`);
              }
            });
            try {
              await (0, plugin_1.addPreviouslyRegisteredPlugins)(ctx);
            } catch (e) {
              console.error(`Error adding previously registered plugins:`);
              console.error(e);
            }
            try {
              await (0, plugin_1.addQueuedPlugins)(ctx);
            } catch (e) {
              console.error(`Error adding queued plugins:`);
              console.error(e);
            }
            global_hook_1.hook.on(shared_utils_1.HookEvents.SETUP_DEVTOOLS_PLUGIN, async (pluginDescriptor, setupFn) => {
              await (0, plugin_1.addPlugin)({
                pluginDescriptor,
                setupFn
              }, ctx);
            });
            shared_utils_1.target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ = true;
            const handleFlush = (0, debounce_1.default)(async () => {
              var _a2;
              if ((_a2 = ctx.currentAppRecord) === null || _a2 === void 0 ? void 0 : _a2.backend.options.features.includes(app_backend_api_1.BuiltinBackendFeature.FLUSH)) {
                await (0, component_1.sendComponentTreeData)(ctx.currentAppRecord, "_root", ctx.currentAppRecord.componentFilter, null, false, ctx);
                if (ctx.currentInspectedComponentId) {
                  await (0, component_1.sendSelectedComponentData)(ctx.currentAppRecord, ctx.currentInspectedComponentId, ctx);
                }
              }
            }, 500);
            global_hook_1.hook.off(shared_utils_1.HookEvents.FLUSH);
            global_hook_1.hook.on(shared_utils_1.HookEvents.FLUSH, handleFlush);
            try {
              await (0, timeline_marker_1.addTimelineMarker)({
                id: "vue-devtools-init-backend",
                time: (0, devtools_api_1.now)(),
                label: "Vue Devtools connected",
                color: 4307075,
                all: true
              }, ctx);
            } catch (e) {
              console.error(`Error while adding devtools connected timeline marker:`);
              console.error(e);
            }
          }
          function connectBridge() {
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_SUBSCRIBE, ({
              type,
              payload
            }) => {
              (0, subscriptions_1.subscribe)(type, payload);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_UNSUBSCRIBE, ({
              type,
              payload
            }) => {
              (0, subscriptions_1.unsubscribe)(type, payload);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TAB_SWITCH, async (tab) => {
              ctx.currentTab = tab;
              await (0, highlighter_1.unHighlight)();
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_APP_LIST, async () => {
              await (0, app_1.sendApps)(ctx);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_APP_SELECT, async (id) => {
              if (id == null)
                return;
              const record = ctx.appRecords.find((r2) => r2.id === id);
              if (record) {
                await (0, app_1.selectApp)(record, ctx);
              } else if (shared_utils_1.SharedData.debugInfo) {
                console.warn(`App with id ${id} not found`);
              }
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_SCAN_LEGACY_APPS, () => {
              if (global_hook_1.hook.Vue) {
                (0, app_1._legacy_getAndRegisterApps)(ctx);
              }
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_TREE, async ({
              instanceId,
              filter,
              recursively
            }) => {
              ctx.currentAppRecord.componentFilter = filter;
              (0, subscriptions_1.subscribe)(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, {
                instanceId
              });
              await (0, component_1.sendComponentTreeData)(ctx.currentAppRecord, instanceId, filter, null, recursively, ctx);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_SELECTED_DATA, async (instanceId) => {
              await (0, component_1.sendSelectedComponentData)(ctx.currentAppRecord, instanceId, ctx);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_EDIT_STATE, async ({
              instanceId,
              dotPath,
              type,
              value,
              newKey,
              remove
            }) => {
              await (0, component_1.editComponentState)(instanceId, dotPath, type, {
                value,
                newKey,
                remove
              }, ctx);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_INSPECT_DOM, async ({
              instanceId
            }) => {
              const instance = (0, component_1.getComponentInstance)(ctx.currentAppRecord, instanceId, ctx);
              if (instance) {
                const [el] = await ctx.currentAppRecord.backend.api.getComponentRootElements(instance);
                if (el) {
                  shared_utils_1.target.__VUE_DEVTOOLS_INSPECT_TARGET__ = el;
                  ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_INSPECT_DOM, null);
                }
              }
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_SCROLL_TO, async ({
              instanceId
            }) => {
              if (!shared_utils_1.isBrowser)
                return;
              const instance = (0, component_1.getComponentInstance)(ctx.currentAppRecord, instanceId, ctx);
              if (instance) {
                const [el] = await ctx.currentAppRecord.backend.api.getComponentRootElements(instance);
                if (el) {
                  if (typeof el.scrollIntoView === "function") {
                    el.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                      inline: "center"
                    });
                  } else {
                    const bounds = await ctx.currentAppRecord.backend.api.getComponentBounds(instance);
                    const scrollTarget = document.createElement("div");
                    scrollTarget.style.position = "absolute";
                    scrollTarget.style.width = `${bounds.width}px`;
                    scrollTarget.style.height = `${bounds.height}px`;
                    scrollTarget.style.top = `${bounds.top}px`;
                    scrollTarget.style.left = `${bounds.left}px`;
                    document.body.appendChild(scrollTarget);
                    scrollTarget.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                      inline: "center"
                    });
                    setTimeout(() => {
                      document.body.removeChild(scrollTarget);
                    }, 2e3);
                  }
                  (0, highlighter_1.highlight)(instance, ctx.currentAppRecord.backend, ctx);
                  setTimeout(() => {
                    (0, highlighter_1.unHighlight)();
                  }, 2e3);
                }
              }
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_RENDER_CODE, async ({
              instanceId
            }) => {
              if (!shared_utils_1.isBrowser)
                return;
              const instance = (0, component_1.getComponentInstance)(ctx.currentAppRecord, instanceId, ctx);
              if (instance) {
                const {
                  code
                } = await ctx.currentAppRecord.backend.api.getComponentRenderCode(instance);
                ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_COMPONENT_RENDER_CODE, {
                  instanceId,
                  code
                });
              }
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_STATE_ACTION, async ({
              value,
              actionIndex
            }) => {
              const rawAction = value._custom.actions[actionIndex];
              const action = (0, shared_utils_1.revive)(rawAction === null || rawAction === void 0 ? void 0 : rawAction.action);
              if (action) {
                try {
                  await action();
                } catch (e) {
                  console.error(e);
                }
              } else {
                console.warn(`Couldn't revive action ${actionIndex} from`, value);
              }
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_MOUSE_OVER, async (instanceId) => {
              await (0, highlighter_1.highlight)(ctx.currentAppRecord.instanceMap.get(instanceId), ctx.currentAppRecord.backend, ctx);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_MOUSE_OUT, async () => {
              await (0, highlighter_1.unHighlight)();
            });
            const componentPicker = new component_pick_1.default(ctx);
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_PICK, () => {
              componentPicker.startSelecting();
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_COMPONENT_PICK_CANCELED, () => {
              componentPicker.stopSelecting();
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_LAYER_LIST, async () => {
              await (0, timeline_1.sendTimelineLayers)(ctx);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_SHOW_SCREENSHOT, async ({
              screenshot
            }) => {
              await (0, timeline_screenshot_1.showScreenshot)(screenshot, ctx);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_CLEAR, async () => {
              await (0, timeline_1.clearTimeline)(ctx);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_EVENT_DATA, async ({
              id
            }) => {
              await (0, timeline_1.sendTimelineEventData)(id, ctx);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_LAYER_LOAD_EVENTS, async ({
              appId,
              layerId
            }) => {
              await (0, timeline_1.sendTimelineLayerEvents)(appId, layerId, ctx);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_TIMELINE_LOAD_MARKERS, async () => {
              await (0, timeline_marker_1.sendTimelineMarkers)(ctx);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_LIST, async () => {
              await (0, inspector_1.sendCustomInspectors)(ctx);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_TREE, async ({
              inspectorId,
              appId,
              treeFilter
            }) => {
              const inspector = await (0, inspector_1.getInspectorWithAppId)(inspectorId, appId, ctx);
              if (inspector) {
                inspector.treeFilter = treeFilter;
                (0, inspector_1.sendInspectorTree)(inspector, ctx);
              } else if (shared_utils_1.SharedData.debugInfo) {
                console.warn(`Inspector ${inspectorId} not found`);
              }
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_STATE, async ({
              inspectorId,
              appId,
              nodeId
            }) => {
              const inspector = await (0, inspector_1.getInspectorWithAppId)(inspectorId, appId, ctx);
              if (inspector) {
                inspector.selectedNodeId = nodeId;
                (0, inspector_1.sendInspectorState)(inspector, ctx);
              } else if (shared_utils_1.SharedData.debugInfo) {
                console.warn(`Inspector ${inspectorId} not found`);
              }
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_EDIT_STATE, async ({
              inspectorId,
              appId,
              nodeId,
              path,
              type,
              payload
            }) => {
              const inspector = await (0, inspector_1.getInspectorWithAppId)(inspectorId, appId, ctx);
              if (inspector) {
                await (0, inspector_1.editInspectorState)(inspector, nodeId, path, type, payload, ctx);
                inspector.selectedNodeId = nodeId;
                await (0, inspector_1.sendInspectorState)(inspector, ctx);
              } else if (shared_utils_1.SharedData.debugInfo) {
                console.warn(`Inspector ${inspectorId} not found`);
              }
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_ACTION, async ({
              inspectorId,
              appId,
              actionIndex,
              actionType,
              args
            }) => {
              const inspector = await (0, inspector_1.getInspectorWithAppId)(inspectorId, appId, ctx);
              if (inspector) {
                const action = inspector[actionType !== null && actionType !== void 0 ? actionType : "actions"][actionIndex];
                try {
                  await action.action(...args !== null && args !== void 0 ? args : []);
                } catch (e) {
                  if (shared_utils_1.SharedData.debugInfo) {
                    console.error(e);
                  }
                }
              } else if (shared_utils_1.SharedData.debugInfo) {
                console.warn(`Inspector ${inspectorId} not found`);
              }
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_LOG, (payload) => {
              let value = payload.value;
              if (payload.serialized) {
                value = (0, shared_utils_1.parse)(value, payload.revive);
              } else if (payload.revive) {
                value = (0, shared_utils_1.revive)(value);
              }
              console[payload.level](value);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_LIST, async () => {
              await (0, plugin_1.sendPluginList)(ctx);
            });
            ctx.bridge.on(shared_utils_1.BridgeEvents.TO_BACK_DEVTOOLS_PLUGIN_SETTING_UPDATED, ({
              pluginId,
              key,
              newValue,
              oldValue
            }) => {
              const settings = (0, shared_utils_1.getPluginSettings)(pluginId);
              ctx.hook.emit(shared_utils_1.HookEvents.PLUGIN_SETTINGS_SET, pluginId, settings);
              ctx.currentAppRecord.backend.api.callHook(
                "setPluginSettings",
                {
                  app: ctx.currentAppRecord.options.app,
                  pluginId,
                  key,
                  newValue,
                  oldValue,
                  settings
                }
              );
            });
          }
        }
      ),
      /***/
      "../app-backend-core/lib/inspector.js": (
        /*!********************************************!*\
          !*** ../app-backend-core/lib/inspector.js ***!
          \********************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.selectInspectorNode = exports.sendCustomInspectors = exports.editInspectorState = exports.sendInspectorState = exports.sendInspectorTree = exports.getInspectorWithAppId = exports.getInspector = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          function getInspector(inspectorId, app, ctx) {
            return ctx.customInspectors.find((i2) => i2.id === inspectorId && i2.appRecord.options.app === app);
          }
          exports.getInspector = getInspector;
          async function getInspectorWithAppId(inspectorId, appId, ctx) {
            for (const i2 of ctx.customInspectors) {
              if (i2.id === inspectorId && i2.appRecord.id === appId) {
                return i2;
              }
            }
            return null;
          }
          exports.getInspectorWithAppId = getInspectorWithAppId;
          async function sendInspectorTree(inspector, ctx) {
            const rootNodes = await inspector.appRecord.backend.api.getInspectorTree(inspector.id, inspector.appRecord.options.app, inspector.treeFilter);
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_TREE, {
              appId: inspector.appRecord.id,
              inspectorId: inspector.id,
              rootNodes
            });
          }
          exports.sendInspectorTree = sendInspectorTree;
          async function sendInspectorState(inspector, ctx) {
            const state = inspector.selectedNodeId ? await inspector.appRecord.backend.api.getInspectorState(inspector.id, inspector.appRecord.options.app, inspector.selectedNodeId) : null;
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_STATE, {
              appId: inspector.appRecord.id,
              inspectorId: inspector.id,
              state: (0, shared_utils_1.stringify)(state)
            });
          }
          exports.sendInspectorState = sendInspectorState;
          async function editInspectorState(inspector, nodeId, dotPath, type, state, ctx) {
            await inspector.appRecord.backend.api.editInspectorState(inspector.id, inspector.appRecord.options.app, nodeId, dotPath, type, {
              ...state,
              value: state.value != null ? (0, shared_utils_1.parse)(state.value, true) : state.value
            });
          }
          exports.editInspectorState = editInspectorState;
          async function sendCustomInspectors(ctx) {
            var _a, _b;
            const inspectors = [];
            for (const i2 of ctx.customInspectors) {
              inspectors.push({
                id: i2.id,
                appId: i2.appRecord.id,
                pluginId: i2.plugin.descriptor.id,
                label: i2.label,
                icon: i2.icon,
                treeFilterPlaceholder: i2.treeFilterPlaceholder,
                stateFilterPlaceholder: i2.stateFilterPlaceholder,
                noSelectionText: i2.noSelectionText,
                actions: (_a = i2.actions) === null || _a === void 0 ? void 0 : _a.map((a2) => ({
                  icon: a2.icon,
                  tooltip: a2.tooltip
                })),
                nodeActions: (_b = i2.nodeActions) === null || _b === void 0 ? void 0 : _b.map((a2) => ({
                  icon: a2.icon,
                  tooltip: a2.tooltip
                }))
              });
            }
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_LIST, {
              inspectors
            });
          }
          exports.sendCustomInspectors = sendCustomInspectors;
          async function selectInspectorNode(inspector, nodeId, ctx) {
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_CUSTOM_INSPECTOR_SELECT_NODE, {
              appId: inspector.appRecord.id,
              inspectorId: inspector.id,
              nodeId
            });
          }
          exports.selectInspectorNode = selectInspectorNode;
        }
      ),
      /***/
      "../app-backend-core/lib/legacy/scan.js": (
        /*!**********************************************!*\
          !*** ../app-backend-core/lib/legacy/scan.js ***!
          \**********************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.scan = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const page_config_1 = __webpack_require__2(
            /*! ../page-config */
            "../app-backend-core/lib/page-config.js"
          );
          const rootInstances = [];
          function scan() {
            rootInstances.length = 0;
            let inFragment = false;
            let currentFragment = null;
            function processInstance(instance) {
              if (instance) {
                if (rootInstances.indexOf(instance.$root) === -1) {
                  instance = instance.$root;
                }
                if (instance._isFragment) {
                  inFragment = true;
                  currentFragment = instance;
                }
                let baseVue = instance.constructor;
                while (baseVue.super) {
                  baseVue = baseVue.super;
                }
                if (baseVue.config && baseVue.config.devtools) {
                  rootInstances.push(instance);
                }
                return true;
              }
            }
            if (shared_utils_1.isBrowser) {
              const walkDocument = (document2) => {
                walk(document2, function(node) {
                  if (inFragment) {
                    if (node === currentFragment._fragmentEnd) {
                      inFragment = false;
                      currentFragment = null;
                    }
                    return true;
                  }
                  const instance = node.__vue__;
                  return processInstance(instance);
                });
              };
              walkDocument(document);
              const iframes = document.querySelectorAll("iframe");
              for (const iframe of iframes) {
                try {
                  walkDocument(iframe.contentDocument);
                } catch (e) {
                }
              }
              const {
                customVue2ScanSelector
              } = (0, page_config_1.getPageConfig)();
              const customTargets = customVue2ScanSelector ? document.querySelectorAll(customVue2ScanSelector) : [];
              for (const customTarget of customTargets) {
                try {
                  walkDocument(customTarget);
                } catch (e) {
                }
              }
            } else {
              if (Array.isArray(shared_utils_1.target.__VUE_ROOT_INSTANCES__)) {
                shared_utils_1.target.__VUE_ROOT_INSTANCES__.map(processInstance);
              }
            }
            return rootInstances;
          }
          exports.scan = scan;
          function walk(node, fn) {
            if (node.childNodes) {
              for (let i2 = 0, l2 = node.childNodes.length; i2 < l2; i2++) {
                const child = node.childNodes[i2];
                const stop = fn(child);
                if (!stop) {
                  walk(child, fn);
                }
              }
            }
            if (node.shadowRoot) {
              walk(node.shadowRoot, fn);
            }
          }
        }
      ),
      /***/
      "../app-backend-core/lib/page-config.js": (
        /*!**********************************************!*\
          !*** ../app-backend-core/lib/page-config.js ***!
          \**********************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.initOnPageConfig = exports.getPageConfig = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          let config = {};
          function getPageConfig() {
            return config;
          }
          exports.getPageConfig = getPageConfig;
          function initOnPageConfig() {
            if (Object.hasOwnProperty.call(shared_utils_1.target, "VUE_DEVTOOLS_CONFIG")) {
              config = shared_utils_1.SharedData.pageConfig = shared_utils_1.target.VUE_DEVTOOLS_CONFIG;
              if (Object.hasOwnProperty.call(config, "openInEditorHost")) {
                shared_utils_1.SharedData.openInEditorHost = config.openInEditorHost;
              }
            }
          }
          exports.initOnPageConfig = initOnPageConfig;
        }
      ),
      /***/
      "../app-backend-core/lib/perf.js": (
        /*!***************************************!*\
          !*** ../app-backend-core/lib/perf.js ***!
          \***************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.handleAddPerformanceTag = exports.performanceMarkEnd = exports.performanceMarkStart = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const timeline_1 = __webpack_require__2(
            /*! ./timeline */
            "../app-backend-core/lib/timeline.js"
          );
          const app_1 = __webpack_require__2(
            /*! ./app */
            "../app-backend-core/lib/app.js"
          );
          const component_1 = __webpack_require__2(
            /*! ./component */
            "../app-backend-core/lib/component.js"
          );
          const subscriptions_1 = __webpack_require__2(
            /*! ./util/subscriptions */
            "../app-backend-core/lib/util/subscriptions.js"
          );
          async function performanceMarkStart(app, uid, instance, type, time, ctx) {
            try {
              if (!shared_utils_1.SharedData.performanceMonitoringEnabled)
                return;
              const appRecord = await (0, app_1.getAppRecord)(app, ctx);
              const componentName = await appRecord.backend.api.getComponentName(instance);
              const groupId = ctx.perfUniqueGroupId++;
              const groupKey = `${uid}-${type}`;
              appRecord.perfGroupIds.set(groupKey, {
                groupId,
                time
              });
              await (0, timeline_1.addTimelineEvent)({
                layerId: "performance",
                event: {
                  time,
                  data: {
                    component: componentName,
                    type,
                    measure: "start"
                  },
                  title: componentName,
                  subtitle: type,
                  groupId
                }
              }, app, ctx);
              if (markEndQueue.has(groupKey)) {
                const {
                  app: app2,
                  uid: uid2,
                  instance: instance2,
                  type: type2,
                  time: time2
                } = markEndQueue.get(groupKey);
                markEndQueue.delete(groupKey);
                await performanceMarkEnd(app2, uid2, instance2, type2, time2, ctx);
              }
            } catch (e) {
              if (shared_utils_1.SharedData.debugInfo) {
                console.error(e);
              }
            }
          }
          exports.performanceMarkStart = performanceMarkStart;
          const markEndQueue = /* @__PURE__ */ new Map();
          async function performanceMarkEnd(app, uid, instance, type, time, ctx) {
            try {
              if (!shared_utils_1.SharedData.performanceMonitoringEnabled)
                return;
              const appRecord = await (0, app_1.getAppRecord)(app, ctx);
              const componentName = await appRecord.backend.api.getComponentName(instance);
              const groupKey = `${uid}-${type}`;
              const groupInfo = appRecord.perfGroupIds.get(groupKey);
              if (!groupInfo) {
                markEndQueue.set(groupKey, {
                  app,
                  uid,
                  instance,
                  type,
                  time
                });
                return;
              }
              const {
                groupId,
                time: startTime
              } = groupInfo;
              const duration = time - startTime;
              await (0, timeline_1.addTimelineEvent)({
                layerId: "performance",
                event: {
                  time,
                  data: {
                    component: componentName,
                    type,
                    measure: "end",
                    duration: {
                      _custom: {
                        type: "Duration",
                        value: duration,
                        display: `${duration} ms`
                      }
                    }
                  },
                  title: componentName,
                  subtitle: type,
                  groupId
                }
              }, app, ctx);
              const tooSlow = duration > 10;
              if (tooSlow || instance.__VUE_DEVTOOLS_SLOW__) {
                let change = false;
                if (tooSlow && !instance.__VUE_DEVTOOLS_SLOW__) {
                  instance.__VUE_DEVTOOLS_SLOW__ = {
                    duration: null,
                    measures: {}
                  };
                }
                const data = instance.__VUE_DEVTOOLS_SLOW__;
                if (tooSlow && (data.duration == null || data.duration < duration)) {
                  data.duration = duration;
                  change = true;
                }
                if (data.measures[type] == null || data.measures[type] < duration) {
                  data.measures[type] = duration;
                  change = true;
                }
                if (change) {
                  const id = await (0, component_1.getComponentId)(app, uid, instance, ctx);
                  if ((0, subscriptions_1.isSubscribed)(shared_utils_1.BridgeSubscriptions.COMPONENT_TREE, (sub) => sub.payload.instanceId === id)) {
                    (0, shared_utils_1.raf)(() => {
                      (0, component_1.sendComponentTreeData)(appRecord, id, ctx.currentAppRecord.componentFilter, null, false, ctx);
                    });
                  }
                }
              }
            } catch (e) {
              if (shared_utils_1.SharedData.debugInfo) {
                console.error(e);
              }
            }
          }
          exports.performanceMarkEnd = performanceMarkEnd;
          function handleAddPerformanceTag(backend, ctx) {
            backend.api.on.visitComponentTree((payload) => {
              if (payload.componentInstance.__VUE_DEVTOOLS_SLOW__) {
                const {
                  duration,
                  measures
                } = payload.componentInstance.__VUE_DEVTOOLS_SLOW__;
                let tooltip = '<div class="grid grid-cols-2 gap-2 font-mono text-xs">';
                for (const type in measures) {
                  const d2 = measures[type];
                  tooltip += `<div>${type}</div><div class="text-right text-black rounded px-1 ${d2 > 30 ? "bg-red-400" : d2 > 10 ? "bg-yellow-400" : "bg-green-400"}">${Math.round(d2 * 1e3) / 1e3} ms</div>`;
                }
                tooltip += "</div>";
                payload.treeNode.tags.push({
                  backgroundColor: duration > 30 ? 16281969 : 16498468,
                  textColor: 0,
                  label: `${Math.round(duration * 1e3) / 1e3} ms`,
                  tooltip
                });
              }
            });
          }
          exports.handleAddPerformanceTag = handleAddPerformanceTag;
        }
      ),
      /***/
      "../app-backend-core/lib/plugin.js": (
        /*!*****************************************!*\
          !*** ../app-backend-core/lib/plugin.js ***!
          \*****************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.serializePlugin = exports.sendPluginList = exports.addPreviouslyRegisteredPlugins = exports.addQueuedPlugins = exports.addPlugin = void 0;
          const app_backend_api_1 = __webpack_require__2(
            /*! @vue-devtools/app-backend-api */
            "../app-backend-api/lib/index.js"
          );
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const app_1 = __webpack_require__2(
            /*! ./app */
            "../app-backend-core/lib/app.js"
          );
          async function addPlugin(pluginQueueItem, ctx) {
            const {
              pluginDescriptor,
              setupFn
            } = pluginQueueItem;
            const plugin = {
              descriptor: pluginDescriptor,
              setupFn,
              error: null
            };
            ctx.currentPlugin = plugin;
            try {
              const appRecord = await (0, app_1.getAppRecord)(plugin.descriptor.app, ctx);
              const api2 = new app_backend_api_1.DevtoolsPluginApiInstance(plugin, appRecord, ctx);
              if (pluginQueueItem.proxy) {
                await pluginQueueItem.proxy.setRealTarget(api2);
              } else {
                setupFn(api2);
              }
            } catch (e) {
              plugin.error = e;
              if (shared_utils_1.SharedData.debugInfo) {
                console.error(e);
              }
            }
            ctx.currentPlugin = null;
            ctx.plugins.push(plugin);
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_ADD, {
              plugin: await serializePlugin(plugin)
            });
            const targetList = shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__ = shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__ || [];
            targetList.push({
              pluginDescriptor,
              setupFn
            });
          }
          exports.addPlugin = addPlugin;
          async function addQueuedPlugins(ctx) {
            if (shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__ && Array.isArray(shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__)) {
              for (const queueItem of shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__) {
                await addPlugin(queueItem, ctx);
              }
              shared_utils_1.target.__VUE_DEVTOOLS_PLUGINS__ = null;
            }
          }
          exports.addQueuedPlugins = addQueuedPlugins;
          async function addPreviouslyRegisteredPlugins(ctx) {
            if (shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__ && Array.isArray(shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__)) {
              for (const queueItem of shared_utils_1.target.__VUE_DEVTOOLS_REGISTERED_PLUGINS__) {
                await addPlugin(queueItem, ctx);
              }
            }
          }
          exports.addPreviouslyRegisteredPlugins = addPreviouslyRegisteredPlugins;
          async function sendPluginList(ctx) {
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_DEVTOOLS_PLUGIN_LIST, {
              plugins: await Promise.all(ctx.plugins.map((p2) => serializePlugin(p2)))
            });
          }
          exports.sendPluginList = sendPluginList;
          async function serializePlugin(plugin) {
            return {
              id: plugin.descriptor.id,
              label: plugin.descriptor.label,
              appId: (0, app_1.getAppRecordId)(plugin.descriptor.app),
              packageName: plugin.descriptor.packageName,
              homepage: plugin.descriptor.homepage,
              logo: plugin.descriptor.logo,
              componentStateTypes: plugin.descriptor.componentStateTypes,
              settingsSchema: plugin.descriptor.settings
            };
          }
          exports.serializePlugin = serializePlugin;
        }
      ),
      /***/
      "../app-backend-core/lib/timeline-builtins.js": (
        /*!****************************************************!*\
          !*** ../app-backend-core/lib/timeline-builtins.js ***!
          \****************************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.builtinLayers = void 0;
          exports.builtinLayers = [{
            id: "mouse",
            label: "Mouse",
            color: 10768815,
            screenshotOverlayRender(event, {
              events
            }) {
              const samePositionEvent = events.find((e) => e !== event && e.renderMeta.textEl && e.data.x === event.data.x && e.data.y === event.data.y);
              if (samePositionEvent) {
                const text2 = document.createElement("div");
                text2.innerText = event.data.type;
                samePositionEvent.renderMeta.textEl.appendChild(text2);
                return false;
              }
              const div = document.createElement("div");
              div.style.position = "absolute";
              div.style.left = `${event.data.x - 4}px`;
              div.style.top = `${event.data.y - 4}px`;
              div.style.width = "8px";
              div.style.height = "8px";
              div.style.borderRadius = "100%";
              div.style.backgroundColor = "rgba(164, 81, 175, 0.5)";
              const text = document.createElement("div");
              text.innerText = event.data.type;
              text.style.color = "#541e5b";
              text.style.fontFamily = "monospace";
              text.style.fontSize = "9px";
              text.style.position = "absolute";
              text.style.left = "10px";
              text.style.top = "10px";
              text.style.padding = "1px";
              text.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
              text.style.borderRadius = "3px";
              div.appendChild(text);
              event.renderMeta.textEl = text;
              return div;
            }
          }, {
            id: "keyboard",
            label: "Keyboard",
            color: 8475055
          }, {
            id: "component-event",
            label: "Component events",
            color: 4307075,
            screenshotOverlayRender: (event, {
              events
            }) => {
              if (!event.meta.bounds || events.some((e) => e !== event && e.layerId === event.layerId && e.renderMeta.drawn && (e.meta.componentId === event.meta.componentId || e.meta.bounds.left === event.meta.bounds.left && e.meta.bounds.top === event.meta.bounds.top && e.meta.bounds.width === event.meta.bounds.width && e.meta.bounds.height === event.meta.bounds.height))) {
                return false;
              }
              const div = document.createElement("div");
              div.style.position = "absolute";
              div.style.left = `${event.meta.bounds.left - 4}px`;
              div.style.top = `${event.meta.bounds.top - 4}px`;
              div.style.width = `${event.meta.bounds.width}px`;
              div.style.height = `${event.meta.bounds.height}px`;
              div.style.borderRadius = "8px";
              div.style.borderStyle = "solid";
              div.style.borderWidth = "4px";
              div.style.borderColor = "rgba(65, 184, 131, 0.5)";
              div.style.textAlign = "center";
              div.style.display = "flex";
              div.style.alignItems = "center";
              div.style.justifyContent = "center";
              div.style.overflow = "hidden";
              const text = document.createElement("div");
              text.style.color = "#267753";
              text.style.fontFamily = "monospace";
              text.style.fontSize = "9px";
              text.style.padding = "1px";
              text.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
              text.style.borderRadius = "3px";
              text.innerText = event.data.event;
              div.appendChild(text);
              event.renderMeta.drawn = true;
              return div;
            }
          }, {
            id: "performance",
            label: "Performance",
            color: 4307050,
            groupsOnly: true,
            skipScreenshots: true,
            ignoreNoDurationGroups: true
          }];
        }
      ),
      /***/
      "../app-backend-core/lib/timeline-marker.js": (
        /*!**************************************************!*\
          !*** ../app-backend-core/lib/timeline-marker.js ***!
          \**************************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.sendTimelineMarkers = exports.addTimelineMarker = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const devtools_api_1 = __webpack_require__2(
            /*! @vue/devtools-api */
            "../api/lib/esm/index.js"
          );
          const timeline_1 = __webpack_require__2(
            /*! ./timeline */
            "../app-backend-core/lib/timeline.js"
          );
          async function addTimelineMarker(options, ctx) {
            var _a;
            if (!ctx.currentAppRecord) {
              options.all = true;
            }
            const marker = {
              ...options,
              appRecord: options.all ? null : ctx.currentAppRecord
            };
            ctx.timelineMarkers.push(marker);
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_MARKER, {
              marker: await serializeMarker(marker),
              appId: (_a = ctx.currentAppRecord) === null || _a === void 0 ? void 0 : _a.id
            });
          }
          exports.addTimelineMarker = addTimelineMarker;
          async function sendTimelineMarkers(ctx) {
            if (!ctx.currentAppRecord)
              return;
            const markers = ctx.timelineMarkers.filter((marker) => marker.all || marker.appRecord === ctx.currentAppRecord);
            const result = [];
            for (const marker of markers) {
              result.push(await serializeMarker(marker));
            }
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_LOAD_MARKERS, {
              markers: result,
              appId: ctx.currentAppRecord.id
            });
          }
          exports.sendTimelineMarkers = sendTimelineMarkers;
          async function serializeMarker(marker) {
            var _a;
            let time = marker.time;
            if ((0, devtools_api_1.isPerformanceSupported)() && time < timeline_1.dateThreshold) {
              time += timeline_1.perfTimeDiff;
            }
            return {
              id: marker.id,
              appId: (_a = marker.appRecord) === null || _a === void 0 ? void 0 : _a.id,
              all: marker.all,
              time: Math.round(time * 1e3),
              label: marker.label,
              color: marker.color
            };
          }
        }
      ),
      /***/
      "../app-backend-core/lib/timeline-screenshot.js": (
        /*!******************************************************!*\
          !*** ../app-backend-core/lib/timeline-screenshot.js ***!
          \******************************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.showScreenshot = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const queue_1 = __webpack_require__2(
            /*! ./util/queue */
            "../app-backend-core/lib/util/queue.js"
          );
          const timeline_builtins_1 = __webpack_require__2(
            /*! ./timeline-builtins */
            "../app-backend-core/lib/timeline-builtins.js"
          );
          let overlay;
          let image;
          let container;
          const jobQueue = new queue_1.JobQueue();
          async function showScreenshot(screenshot, ctx) {
            await jobQueue.queue("showScreenshot", async () => {
              if (screenshot) {
                if (!container) {
                  createElements();
                }
                image.src = screenshot.image;
                image.style.visibility = screenshot.image ? "visible" : "hidden";
                clearContent();
                const events = screenshot.events.map((id) => ctx.timelineEventMap.get(id)).filter(Boolean).map((eventData) => ({
                  layer: timeline_builtins_1.builtinLayers.concat(ctx.timelineLayers).find((layer) => layer.id === eventData.layerId),
                  event: {
                    ...eventData.event,
                    layerId: eventData.layerId,
                    renderMeta: {}
                  }
                }));
                const renderContext = {
                  screenshot,
                  events: events.map(({
                    event
                  }) => event),
                  index: 0
                };
                for (let i2 = 0; i2 < events.length; i2++) {
                  const {
                    layer,
                    event
                  } = events[i2];
                  if (layer.screenshotOverlayRender) {
                    renderContext.index = i2;
                    try {
                      const result = await layer.screenshotOverlayRender(event, renderContext);
                      if (result !== false) {
                        if (typeof result === "string") {
                          container.innerHTML += result;
                        } else {
                          container.appendChild(result);
                        }
                      }
                    } catch (e) {
                      if (shared_utils_1.SharedData.debugInfo) {
                        console.error(e);
                      }
                    }
                  }
                }
                showElement();
              } else {
                hideElement();
              }
            });
          }
          exports.showScreenshot = showScreenshot;
          function createElements() {
            overlay = document.createElement("div");
            overlay.style.position = "fixed";
            overlay.style.zIndex = "9999999999999";
            overlay.style.pointerEvents = "none";
            overlay.style.left = "0";
            overlay.style.top = "0";
            overlay.style.width = "100vw";
            overlay.style.height = "100vh";
            overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
            overlay.style.overflow = "hidden";
            const imageBox = document.createElement("div");
            imageBox.style.position = "relative";
            overlay.appendChild(imageBox);
            image = document.createElement("img");
            imageBox.appendChild(image);
            container = document.createElement("div");
            container.style.position = "absolute";
            container.style.left = "0";
            container.style.top = "0";
            imageBox.appendChild(container);
            const style = document.createElement("style");
            style.innerHTML = ".__vuedevtools_no-scroll { overflow: hidden; }";
            document.head.appendChild(style);
          }
          function showElement() {
            if (!overlay.parentNode) {
              document.body.appendChild(overlay);
              document.body.classList.add("__vuedevtools_no-scroll");
            }
          }
          function hideElement() {
            if (overlay && overlay.parentNode) {
              overlay.parentNode.removeChild(overlay);
              document.body.classList.remove("__vuedevtools_no-scroll");
              clearContent();
            }
          }
          function clearContent() {
            while (container.firstChild) {
              container.removeChild(container.lastChild);
            }
          }
        }
      ),
      /***/
      "../app-backend-core/lib/timeline.js": (
        /*!*******************************************!*\
          !*** ../app-backend-core/lib/timeline.js ***!
          \*******************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.sendTimelineLayerEvents = exports.removeLayersForApp = exports.sendTimelineEventData = exports.clearTimeline = exports.perfTimeDiff = exports.dateThreshold = exports.addTimelineEvent = exports.sendTimelineLayers = exports.addBuiltinLayers = exports.setupTimeline = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const devtools_api_1 = __webpack_require__2(
            /*! @vue/devtools-api */
            "../api/lib/esm/index.js"
          );
          const global_hook_1 = __webpack_require__2(
            /*! ./global-hook */
            "../app-backend-core/lib/global-hook.js"
          );
          const app_1 = __webpack_require__2(
            /*! ./app */
            "../app-backend-core/lib/app.js"
          );
          const timeline_builtins_1 = __webpack_require__2(
            /*! ./timeline-builtins */
            "../app-backend-core/lib/timeline-builtins.js"
          );
          function setupTimeline(ctx) {
            setupBuiltinLayers(ctx);
          }
          exports.setupTimeline = setupTimeline;
          function addBuiltinLayers(appRecord, ctx) {
            for (const layerDef of timeline_builtins_1.builtinLayers) {
              ctx.timelineLayers.push({
                ...layerDef,
                appRecord,
                plugin: null,
                events: []
              });
            }
          }
          exports.addBuiltinLayers = addBuiltinLayers;
          function setupBuiltinLayers(ctx) {
            if (shared_utils_1.isBrowser) {
              ["mousedown", "mouseup", "click", "dblclick"].forEach((eventType) => {
                window.addEventListener(eventType, async (event) => {
                  await addTimelineEvent({
                    layerId: "mouse",
                    event: {
                      time: (0, devtools_api_1.now)(),
                      data: {
                        type: eventType,
                        x: event.clientX,
                        y: event.clientY
                      },
                      title: eventType
                    }
                  }, null, ctx);
                }, {
                  capture: true,
                  passive: true
                });
              });
              ["keyup", "keydown", "keypress"].forEach((eventType) => {
                window.addEventListener(eventType, async (event) => {
                  await addTimelineEvent({
                    layerId: "keyboard",
                    event: {
                      time: (0, devtools_api_1.now)(),
                      data: {
                        type: eventType,
                        key: event.key,
                        ctrlKey: event.ctrlKey,
                        shiftKey: event.shiftKey,
                        altKey: event.altKey,
                        metaKey: event.metaKey
                      },
                      title: event.key
                    }
                  }, null, ctx);
                }, {
                  capture: true,
                  passive: true
                });
              });
            }
            global_hook_1.hook.on(shared_utils_1.HookEvents.COMPONENT_EMIT, async (app, instance, event, params) => {
              try {
                if (!shared_utils_1.SharedData.componentEventsEnabled)
                  return;
                const appRecord = await (0, app_1.getAppRecord)(app, ctx);
                const componentId = `${appRecord.id}:${instance.uid}`;
                const componentDisplay = await appRecord.backend.api.getComponentName(instance) || "<i>Unknown Component</i>";
                await addTimelineEvent({
                  layerId: "component-event",
                  event: {
                    time: (0, devtools_api_1.now)(),
                    data: {
                      component: {
                        _custom: {
                          type: "component-definition",
                          display: componentDisplay
                        }
                      },
                      event,
                      params
                    },
                    title: event,
                    subtitle: `by ${componentDisplay}`,
                    meta: {
                      componentId,
                      bounds: await appRecord.backend.api.getComponentBounds(instance)
                    }
                  }
                }, app, ctx);
              } catch (e) {
                if (shared_utils_1.SharedData.debugInfo) {
                  console.error(e);
                }
              }
            });
          }
          async function sendTimelineLayers(ctx) {
            var _a, _b;
            const layers = [];
            for (const layer of ctx.timelineLayers) {
              try {
                layers.push({
                  id: layer.id,
                  label: layer.label,
                  color: layer.color,
                  appId: (_a = layer.appRecord) === null || _a === void 0 ? void 0 : _a.id,
                  pluginId: (_b = layer.plugin) === null || _b === void 0 ? void 0 : _b.descriptor.id,
                  groupsOnly: layer.groupsOnly,
                  skipScreenshots: layer.skipScreenshots,
                  ignoreNoDurationGroups: layer.ignoreNoDurationGroups
                });
              } catch (e) {
                if (shared_utils_1.SharedData.debugInfo) {
                  console.error(e);
                }
              }
            }
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_LAYER_LIST, {
              layers
            });
          }
          exports.sendTimelineLayers = sendTimelineLayers;
          async function addTimelineEvent(options, app, ctx) {
            const appId = app ? (0, app_1.getAppRecordId)(app) : null;
            const isAllApps = options.all || !app || appId == null;
            const id = ctx.nextTimelineEventId++;
            const eventData = {
              id,
              ...options,
              all: isAllApps
            };
            ctx.timelineEventMap.set(eventData.id, eventData);
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_EVENT, {
              appId: eventData.all ? "all" : appId,
              layerId: eventData.layerId,
              event: mapTimelineEvent(eventData)
            });
            const layer = ctx.timelineLayers.find((l2) => {
              var _a;
              return (isAllApps || ((_a = l2.appRecord) === null || _a === void 0 ? void 0 : _a.options.app) === app) && l2.id === options.layerId;
            });
            if (layer) {
              layer.events.push(eventData);
            } else if (shared_utils_1.SharedData.debugInfo) {
              console.warn(`Timeline layer ${options.layerId} not found`);
            }
          }
          exports.addTimelineEvent = addTimelineEvent;
          const initialTime = Date.now();
          exports.dateThreshold = initialTime - 1e6;
          exports.perfTimeDiff = initialTime - (0, devtools_api_1.now)();
          function mapTimelineEvent(eventData) {
            let time = eventData.event.time;
            if ((0, devtools_api_1.isPerformanceSupported)() && time < exports.dateThreshold) {
              time += exports.perfTimeDiff;
            }
            return {
              id: eventData.id,
              time: Math.round(time * 1e3),
              logType: eventData.event.logType,
              groupId: eventData.event.groupId,
              title: eventData.event.title,
              subtitle: eventData.event.subtitle
            };
          }
          async function clearTimeline(ctx) {
            ctx.timelineEventMap.clear();
            for (const layer of ctx.timelineLayers) {
              layer.events = [];
            }
            for (const backend of ctx.backends) {
              await backend.api.clearTimeline();
            }
          }
          exports.clearTimeline = clearTimeline;
          async function sendTimelineEventData(id, ctx) {
            let data = null;
            const eventData = ctx.timelineEventMap.get(id);
            if (eventData) {
              data = await ctx.currentAppRecord.backend.api.inspectTimelineEvent(eventData, ctx.currentAppRecord.options.app);
              data = (0, shared_utils_1.stringify)(data);
            } else if (shared_utils_1.SharedData.debugInfo) {
              console.warn(`Event ${id} not found`, ctx.timelineEventMap.keys());
            }
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_EVENT_DATA, {
              eventId: id,
              data
            });
          }
          exports.sendTimelineEventData = sendTimelineEventData;
          function removeLayersForApp(app, ctx) {
            const layers = ctx.timelineLayers.filter((l2) => {
              var _a;
              return ((_a = l2.appRecord) === null || _a === void 0 ? void 0 : _a.options.app) === app;
            });
            for (const layer of layers) {
              const index = ctx.timelineLayers.indexOf(layer);
              if (index !== -1)
                ctx.timelineLayers.splice(index, 1);
              for (const e of layer.events) {
                ctx.timelineEventMap.delete(e.id);
              }
            }
          }
          exports.removeLayersForApp = removeLayersForApp;
          function sendTimelineLayerEvents(appId, layerId, ctx) {
            var _a;
            const app = (_a = ctx.appRecords.find((ar) => ar.id === appId)) === null || _a === void 0 ? void 0 : _a.options.app;
            if (!app)
              return;
            const layer = ctx.timelineLayers.find((l2) => {
              var _a2;
              return ((_a2 = l2.appRecord) === null || _a2 === void 0 ? void 0 : _a2.options.app) === app && l2.id === layerId;
            });
            if (!layer)
              return;
            ctx.bridge.send(shared_utils_1.BridgeEvents.TO_FRONT_TIMELINE_LAYER_LOAD_EVENTS, {
              appId,
              layerId,
              events: layer.events.map((e) => mapTimelineEvent(e))
            });
          }
          exports.sendTimelineLayerEvents = sendTimelineLayerEvents;
        }
      ),
      /***/
      "../app-backend-core/lib/util/queue.js": (
        /*!*********************************************!*\
          !*** ../app-backend-core/lib/util/queue.js ***!
          \*********************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.JobQueue = void 0;
          class JobQueue {
            constructor() {
              this.jobs = [];
            }
            queue(id, fn) {
              const job = {
                id,
                fn
              };
              return new Promise((resolve) => {
                const onDone = () => {
                  this.currentJob = null;
                  const nextJob = this.jobs.shift();
                  if (nextJob) {
                    nextJob.fn();
                  }
                  resolve();
                };
                const run = () => {
                  this.currentJob = job;
                  return job.fn().then(onDone).catch((e) => {
                    console.error(`Job ${job.id} failed:`);
                    console.error(e);
                  });
                };
                if (this.currentJob) {
                  this.jobs.push({
                    id: job.id,
                    fn: () => run()
                  });
                } else {
                  run();
                }
              });
            }
          }
          exports.JobQueue = JobQueue;
        }
      ),
      /***/
      "../app-backend-core/lib/util/subscriptions.js": (
        /*!*****************************************************!*\
          !*** ../app-backend-core/lib/util/subscriptions.js ***!
          \*****************************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.isSubscribed = exports.unsubscribe = exports.subscribe = void 0;
          const activeSubs = /* @__PURE__ */ new Map();
          function getSubs(type) {
            let subs = activeSubs.get(type);
            if (!subs) {
              subs = [];
              activeSubs.set(type, subs);
            }
            return subs;
          }
          function subscribe(type, payload) {
            const rawPayload = getRawPayload(payload);
            getSubs(type).push({
              payload,
              rawPayload
            });
          }
          exports.subscribe = subscribe;
          function unsubscribe(type, payload) {
            const rawPayload = getRawPayload(payload);
            const subs = getSubs(type);
            let index;
            while ((index = subs.findIndex((sub) => sub.rawPayload === rawPayload)) !== -1) {
              subs.splice(index, 1);
            }
          }
          exports.unsubscribe = unsubscribe;
          function getRawPayload(payload) {
            const data = Object.keys(payload).sort().reduce((acc, key) => {
              acc[key] = payload[key];
              return acc;
            }, {});
            return JSON.stringify(data);
          }
          function isSubscribed(type, predicate = () => true) {
            return getSubs(type).some(predicate);
          }
          exports.isSubscribed = isSubscribed;
        }
      ),
      /***/
      "../app-backend-vue3/lib/components/data.js": (
        /*!**************************************************!*\
          !*** ../app-backend-vue3/lib/components/data.js ***!
          \**************************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.getCustomInstanceDetails = exports.editState = exports.getCustomObjectDetails = exports.getInstanceDetails = void 0;
          const util_1 = __webpack_require__2(
            /*! ./util */
            "../app-backend-vue3/lib/components/util.js"
          );
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const util_2 = __webpack_require__2(
            /*! ../util */
            "../app-backend-vue3/lib/util.js"
          );
          const vueBuiltins = ["nextTick", "defineComponent", "defineAsyncComponent", "defineCustomElement", "ref", "computed", "reactive", "readonly", "watchEffect", "watchPostEffect", "watchSyncEffect", "watch", "isRef", "unref", "toRef", "toRefs", "isProxy", "isReactive", "isReadonly", "shallowRef", "triggerRef", "customRef", "shallowReactive", "shallowReadonly", "toRaw", "markRaw", "effectScope", "getCurrentScope", "onScopeDispose", "onMounted", "onUpdated", "onUnmounted", "onBeforeMount", "onBeforeUpdate", "onBeforeUnmount", "onErrorCaptured", "onRenderTracked", "onRenderTriggered", "onActivated", "onDeactivated", "onServerPrefetch", "provide", "inject", "h", "mergeProps", "cloneVNode", "isVNode", "resolveComponent", "resolveDirective", "withDirectives", "withModifiers"];
          function getInstanceDetails(instance, ctx) {
            var _a;
            return {
              id: (0, util_1.getUniqueComponentId)(instance, ctx),
              name: (0, util_1.getInstanceName)(instance),
              file: (_a = instance.type) === null || _a === void 0 ? void 0 : _a.__file,
              state: getInstanceState(instance)
            };
          }
          exports.getInstanceDetails = getInstanceDetails;
          function getInstanceState(instance) {
            const mergedType = resolveMergedOptions(instance);
            return processProps(instance).concat(processState(instance), processSetupState(instance), processComputed(instance, mergedType), processAttrs(instance), processProvide(instance), processInject(instance, mergedType), processRefs(instance));
          }
          function processProps(instance) {
            const propsData = [];
            const propDefinitions = instance.type.props;
            for (let key in instance.props) {
              const propDefinition = propDefinitions ? propDefinitions[key] : null;
              key = (0, shared_utils_1.camelize)(key);
              propsData.push({
                type: "props",
                key,
                value: (0, util_2.returnError)(() => instance.props[key]),
                meta: propDefinition ? {
                  type: propDefinition.type ? getPropType(propDefinition.type) : "any",
                  required: !!propDefinition.required,
                  ...propDefinition.default != null ? {
                    default: propDefinition.default.toString()
                  } : {}
                } : {
                  type: "invalid"
                },
                editable: shared_utils_1.SharedData.editableProps
              });
            }
            return propsData;
          }
          const fnTypeRE = /^(?:function|class) (\w+)/;
          function getPropType(type) {
            if (Array.isArray(type)) {
              return type.map((t2) => getPropType(t2)).join(" or ");
            }
            if (type == null) {
              return "null";
            }
            const match = type.toString().match(fnTypeRE);
            return typeof type === "function" ? match && match[1] || "any" : "any";
          }
          function processState(instance) {
            const type = instance.type;
            const props = type.props;
            const getters = type.vuex && type.vuex.getters;
            const computedDefs = type.computed;
            const data = {
              ...instance.data,
              ...instance.renderContext
            };
            return Object.keys(data).filter((key) => !(props && key in props) && !(getters && key in getters) && !(computedDefs && key in computedDefs)).map((key) => ({
              key,
              type: "data",
              value: (0, util_2.returnError)(() => data[key]),
              editable: true
            }));
          }
          function processSetupState(instance) {
            const raw = instance.devtoolsRawSetupState || {};
            return Object.keys(instance.setupState).filter((key) => !vueBuiltins.includes(key) && !key.startsWith("use")).map((key) => {
              var _a, _b, _c, _d;
              const value = (0, util_2.returnError)(() => toRaw(instance.setupState[key]));
              const rawData = raw[key];
              let result;
              let isOther = typeof value === "function" || typeof (value === null || value === void 0 ? void 0 : value.render) === "function" || typeof (value === null || value === void 0 ? void 0 : value.__asyncLoader) === "function";
              if (rawData) {
                const info = getSetupStateInfo(rawData);
                const objectType = info.computed ? "Computed" : info.ref ? "Ref" : info.reactive ? "Reactive" : null;
                const isState = info.ref || info.computed || info.reactive;
                const raw2 = ((_b = (_a = rawData.effect) === null || _a === void 0 ? void 0 : _a.raw) === null || _b === void 0 ? void 0 : _b.toString()) || ((_d = (_c = rawData.effect) === null || _c === void 0 ? void 0 : _c.fn) === null || _d === void 0 ? void 0 : _d.toString());
                if (objectType) {
                  isOther = false;
                }
                result = {
                  ...objectType ? {
                    objectType
                  } : {},
                  ...raw2 ? {
                    raw: raw2
                  } : {},
                  editable: isState && !info.readonly
                };
              }
              const type = isOther ? "setup (other)" : "setup";
              return {
                key,
                value,
                type,
                ...result
              };
            });
          }
          function isRef(raw) {
            return !!raw.__v_isRef;
          }
          function isComputed(raw) {
            return isRef(raw) && !!raw.effect;
          }
          function isReactive(raw) {
            return !!raw.__v_isReactive;
          }
          function isReadOnly(raw) {
            return !!raw.__v_isReadonly;
          }
          function toRaw(value) {
            if (value === null || value === void 0 ? void 0 : value.__v_raw) {
              return value.__v_raw;
            }
            return value;
          }
          function getSetupStateInfo(raw) {
            return {
              ref: isRef(raw),
              computed: isComputed(raw),
              reactive: isReactive(raw),
              readonly: isReadOnly(raw)
            };
          }
          function getCustomObjectDetails(object, proto) {
            var _a, _b, _c, _d;
            const info = getSetupStateInfo(object);
            const isState = info.ref || info.computed || info.reactive;
            if (isState) {
              const objectType = info.computed ? "Computed" : info.ref ? "Ref" : info.reactive ? "Reactive" : null;
              const value = toRaw(info.reactive ? object : object._value);
              const raw = ((_b = (_a = object.effect) === null || _a === void 0 ? void 0 : _a.raw) === null || _b === void 0 ? void 0 : _b.toString()) || ((_d = (_c = object.effect) === null || _c === void 0 ? void 0 : _c.fn) === null || _d === void 0 ? void 0 : _d.toString());
              return {
                _custom: {
                  type: objectType.toLowerCase(),
                  objectType,
                  value,
                  ...raw ? {
                    tooltip: `<span class="font-mono">${raw}</span>`
                  } : {}
                }
              };
            }
            if (typeof object.__asyncLoader === "function") {
              return {
                _custom: {
                  type: "component-definition",
                  display: "Async component definition"
                }
              };
            }
          }
          exports.getCustomObjectDetails = getCustomObjectDetails;
          function processComputed(instance, mergedType) {
            const type = mergedType;
            const computed = [];
            const defs = type.computed || {};
            for (const key in defs) {
              const def = defs[key];
              const type2 = typeof def === "function" && def.vuex ? "vuex bindings" : "computed";
              computed.push({
                type: type2,
                key,
                value: (0, util_2.returnError)(() => instance.proxy[key]),
                editable: typeof def.set === "function"
              });
            }
            return computed;
          }
          function processAttrs(instance) {
            return Object.keys(instance.attrs).map((key) => ({
              type: "attrs",
              key,
              value: (0, util_2.returnError)(() => instance.attrs[key])
            }));
          }
          function processProvide(instance) {
            return Reflect.ownKeys(instance.provides).map((key) => ({
              type: "provided",
              key: key.toString(),
              value: (0, util_2.returnError)(() => instance.provides[key])
            }));
          }
          function processInject(instance, mergedType) {
            if (!(mergedType === null || mergedType === void 0 ? void 0 : mergedType.inject))
              return [];
            let keys = [];
            let defaultValue;
            if (Array.isArray(mergedType.inject)) {
              keys = mergedType.inject.map((key) => ({
                key,
                originalKey: key
              }));
            } else {
              keys = Reflect.ownKeys(mergedType.inject).map((key) => {
                const value = mergedType.inject[key];
                let originalKey;
                if (typeof value === "string" || typeof value === "symbol") {
                  originalKey = value;
                } else {
                  originalKey = value.from;
                  defaultValue = value.default;
                }
                return {
                  key,
                  originalKey
                };
              });
            }
            return keys.map(({
              key,
              originalKey
            }) => ({
              type: "injected",
              key: originalKey && key !== originalKey ? `${originalKey.toString()} ➞ ${key.toString()}` : key.toString(),
              value: (0, util_2.returnError)(() => instance.ctx[key] || instance.provides[originalKey] || defaultValue)
            }));
          }
          function processRefs(instance) {
            return Object.keys(instance.refs).map((key) => ({
              type: "refs",
              key,
              value: (0, util_2.returnError)(() => instance.refs[key])
            }));
          }
          function editState({
            componentInstance,
            path,
            state,
            type
          }, stateEditor, ctx) {
            if (!["data", "props", "computed", "setup"].includes(type))
              return;
            let target;
            const targetPath = path.slice();
            if (Object.keys(componentInstance.props).includes(path[0])) {
              target = componentInstance.props;
            } else if (componentInstance.devtoolsRawSetupState && Object.keys(componentInstance.devtoolsRawSetupState).includes(path[0])) {
              target = componentInstance.devtoolsRawSetupState;
              const currentValue = stateEditor.get(componentInstance.devtoolsRawSetupState, path);
              if (currentValue != null) {
                const info = getSetupStateInfo(currentValue);
                if (info.readonly)
                  return;
              }
            } else {
              target = componentInstance.proxy;
            }
            if (target && targetPath) {
              stateEditor.set(target, targetPath, "value" in state ? state.value : void 0, stateEditor.createDefaultSetCallback(state));
            }
          }
          exports.editState = editState;
          function reduceStateList(list) {
            if (!list.length) {
              return void 0;
            }
            return list.reduce((map, item) => {
              const key = item.type || "data";
              const obj = map[key] = map[key] || {};
              obj[item.key] = item.value;
              return map;
            }, {});
          }
          function getCustomInstanceDetails(instance) {
            if (instance._)
              instance = instance._;
            const state = getInstanceState(instance);
            return {
              _custom: {
                type: "component",
                id: instance.__VUE_DEVTOOLS_UID__,
                display: (0, util_1.getInstanceName)(instance),
                tooltip: "Component instance",
                value: reduceStateList(state),
                fields: {
                  abstract: true
                }
              }
            };
          }
          exports.getCustomInstanceDetails = getCustomInstanceDetails;
          function resolveMergedOptions(instance) {
            const raw = instance.type;
            const {
              mixins,
              extends: extendsOptions
            } = raw;
            const globalMixins = instance.appContext.mixins;
            if (!globalMixins.length && !mixins && !extendsOptions)
              return raw;
            const options = {};
            globalMixins.forEach((m2) => mergeOptions(options, m2));
            mergeOptions(options, raw);
            return options;
          }
          function mergeOptions(to, from, instance) {
            if (typeof from === "function") {
              from = from.options;
            }
            if (!from)
              return to;
            const {
              mixins,
              extends: extendsOptions
            } = from;
            extendsOptions && mergeOptions(to, extendsOptions);
            mixins && mixins.forEach((m2) => mergeOptions(to, m2));
            for (const key of ["computed", "inject"]) {
              if (Object.prototype.hasOwnProperty.call(from, key)) {
                if (!to[key]) {
                  to[key] = from[key];
                } else {
                  Object.assign(to[key], from[key]);
                }
              }
            }
            return to;
          }
        }
      ),
      /***/
      "../app-backend-vue3/lib/components/el.js": (
        /*!************************************************!*\
          !*** ../app-backend-vue3/lib/components/el.js ***!
          \************************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.getInstanceOrVnodeRect = exports.getRootElementsFromComponentInstance = exports.getComponentInstanceFromElement = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const util_1 = __webpack_require__2(
            /*! ./util */
            "../app-backend-vue3/lib/components/util.js"
          );
          function getComponentInstanceFromElement(element) {
            return element.__vueParentComponent;
          }
          exports.getComponentInstanceFromElement = getComponentInstanceFromElement;
          function getRootElementsFromComponentInstance(instance) {
            if ((0, util_1.isFragment)(instance)) {
              return getFragmentRootElements(instance.subTree);
            }
            if (!instance.subTree)
              return [];
            return [instance.subTree.el];
          }
          exports.getRootElementsFromComponentInstance = getRootElementsFromComponentInstance;
          function getFragmentRootElements(vnode) {
            if (!vnode.children)
              return [];
            const list = [];
            for (let i2 = 0, l2 = vnode.children.length; i2 < l2; i2++) {
              const childVnode = vnode.children[i2];
              if (childVnode.component) {
                list.push(...getRootElementsFromComponentInstance(childVnode.component));
              } else if (childVnode.el) {
                list.push(childVnode.el);
              }
            }
            return list;
          }
          function getInstanceOrVnodeRect(instance) {
            const el = instance.subTree.el;
            if (!shared_utils_1.isBrowser) {
              return;
            }
            if (!(0, shared_utils_1.inDoc)(el)) {
              return;
            }
            if ((0, util_1.isFragment)(instance)) {
              return addIframePosition(getFragmentRect(instance.subTree), getElWindow(el));
            } else if (el.nodeType === 1) {
              return addIframePosition(el.getBoundingClientRect(), getElWindow(el));
            } else if (instance.subTree.component) {
              return getInstanceOrVnodeRect(instance.subTree.component);
            }
          }
          exports.getInstanceOrVnodeRect = getInstanceOrVnodeRect;
          function createRect() {
            const rect = {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              get width() {
                return rect.right - rect.left;
              },
              get height() {
                return rect.bottom - rect.top;
              }
            };
            return rect;
          }
          function mergeRects(a2, b2) {
            if (!a2.top || b2.top < a2.top) {
              a2.top = b2.top;
            }
            if (!a2.bottom || b2.bottom > a2.bottom) {
              a2.bottom = b2.bottom;
            }
            if (!a2.left || b2.left < a2.left) {
              a2.left = b2.left;
            }
            if (!a2.right || b2.right > a2.right) {
              a2.right = b2.right;
            }
            return a2;
          }
          let range;
          function getTextRect(node) {
            if (!shared_utils_1.isBrowser)
              return;
            if (!range)
              range = document.createRange();
            range.selectNode(node);
            return range.getBoundingClientRect();
          }
          function getFragmentRect(vnode) {
            const rect = createRect();
            if (!vnode.children)
              return rect;
            for (let i2 = 0, l2 = vnode.children.length; i2 < l2; i2++) {
              const childVnode = vnode.children[i2];
              let childRect;
              if (childVnode.component) {
                childRect = getInstanceOrVnodeRect(childVnode.component);
              } else if (childVnode.el) {
                const el = childVnode.el;
                if (el.nodeType === 1 || el.getBoundingClientRect) {
                  childRect = el.getBoundingClientRect();
                } else if (el.nodeType === 3 && el.data.trim()) {
                  childRect = getTextRect(el);
                }
              }
              if (childRect) {
                mergeRects(rect, childRect);
              }
            }
            return rect;
          }
          function getElWindow(el) {
            return el.ownerDocument.defaultView;
          }
          function addIframePosition(bounds, win) {
            if (win.__VUE_DEVTOOLS_IFRAME__) {
              const rect = mergeRects(createRect(), bounds);
              const iframeBounds = win.__VUE_DEVTOOLS_IFRAME__.getBoundingClientRect();
              rect.top += iframeBounds.top;
              rect.bottom += iframeBounds.top;
              rect.left += iframeBounds.left;
              rect.right += iframeBounds.left;
              if (win.parent) {
                return addIframePosition(rect, win.parent);
              }
              return rect;
            }
            return bounds;
          }
        }
      ),
      /***/
      "../app-backend-vue3/lib/components/filter.js": (
        /*!****************************************************!*\
          !*** ../app-backend-vue3/lib/components/filter.js ***!
          \****************************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.ComponentFilter = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const util_1 = __webpack_require__2(
            /*! ./util */
            "../app-backend-vue3/lib/components/util.js"
          );
          class ComponentFilter {
            constructor(filter) {
              this.filter = filter || "";
            }
            /**
             * Check if an instance is qualified.
             *
             * @param {Vue|Vnode} instance
             * @return {Boolean}
             */
            isQualified(instance) {
              const name = (0, util_1.getInstanceName)(instance);
              return (0, shared_utils_1.classify)(name).toLowerCase().indexOf(this.filter) > -1 || (0, shared_utils_1.kebabize)(name).toLowerCase().indexOf(this.filter) > -1;
            }
          }
          exports.ComponentFilter = ComponentFilter;
        }
      ),
      /***/
      "../app-backend-vue3/lib/components/tree.js": (
        /*!**************************************************!*\
          !*** ../app-backend-vue3/lib/components/tree.js ***!
          \**************************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.ComponentWalker = void 0;
          const util_1 = __webpack_require__2(
            /*! ./util */
            "../app-backend-vue3/lib/components/util.js"
          );
          const filter_1 = __webpack_require__2(
            /*! ./filter */
            "../app-backend-vue3/lib/components/filter.js"
          );
          const el_1 = __webpack_require__2(
            /*! ./el */
            "../app-backend-vue3/lib/components/el.js"
          );
          class ComponentWalker {
            constructor(maxDepth, filter, recursively, api2, ctx) {
              this.ctx = ctx;
              this.api = api2;
              this.maxDepth = maxDepth;
              this.recursively = recursively;
              this.componentFilter = new filter_1.ComponentFilter(filter);
              this.uniAppPageNames = ["Page", "KeepAlive", "AsyncComponentWrapper", "BaseTransition", "Transition"];
            }
            getComponentTree(instance) {
              this.captureIds = /* @__PURE__ */ new Map();
              return this.findQualifiedChildren(instance, 0);
            }
            getComponentParents(instance) {
              this.captureIds = /* @__PURE__ */ new Map();
              const parents = [];
              this.captureId(instance);
              let parent = instance;
              {
                while (parent = parent.parent) {
                  this.captureId(parent);
                  parents.push(parent);
                }
              }
              return parents;
            }
            /**
             * Find qualified children from a single instance.
             * If the instance itself is qualified, just return itself.
             * This is ok because [].concat works in both cases.
             *
             * @param {Vue|Vnode} instance
             * @return {Vue|Array}
             */
            async findQualifiedChildren(instance, depth) {
              var _a;
              if (this.componentFilter.isQualified(instance) && !((_a = instance.type.devtools) === null || _a === void 0 ? void 0 : _a.hide)) {
                return [await this.capture(instance, null, depth)];
              } else if (instance.subTree) {
                const list = this.isKeepAlive(instance) ? this.getKeepAliveCachedInstances(instance) : this.getInternalInstanceChildrenByInstance(instance);
                return this.findQualifiedChildrenFromList(list, depth);
              } else {
                return [];
              }
            }
            /**
             * Iterate through an array of instances and flatten it into
             * an array of qualified instances. This is a depth-first
             * traversal - e.g. if an instance is not matched, we will
             * recursively go deeper until a qualified child is found.
             *
             * @param {Array} instances
             * @return {Array}
             */
            async findQualifiedChildrenFromList(instances, depth) {
              instances = instances.filter((child) => {
                var _a;
                return !(0, util_1.isBeingDestroyed)(child) && !((_a = child.type.devtools) === null || _a === void 0 ? void 0 : _a.hide);
              });
              if (!this.componentFilter.filter) {
                return Promise.all(instances.map((child, index, list) => this.capture(child, list, depth)));
              } else {
                return Array.prototype.concat.apply([], await Promise.all(instances.map((i2) => this.findQualifiedChildren(i2, depth))));
              }
            }
            /**
             * fixed by xxxxxx
             * @param instance
             * @param suspense
             * @returns
             */
            getInternalInstanceChildrenByInstance(instance, suspense = null) {
              if (instance.ctx.$children) {
                return instance.ctx.$children.map((proxy) => proxy.$);
              }
              return this.getInternalInstanceChildren(instance.subTree, suspense);
            }
            /**
             * Get children from a component instance.
             */
            getInternalInstanceChildren(subTree, suspense = null) {
              const list = [];
              if (subTree) {
                if (subTree.component) {
                  this.getInstanceChildrenBySubTreeComponent(list, subTree, suspense);
                } else if (subTree.suspense) {
                  const suspenseKey = !subTree.suspense.isInFallback ? "suspense default" : "suspense fallback";
                  list.push(...this.getInternalInstanceChildren(subTree.suspense.activeBranch, {
                    ...subTree.suspense,
                    suspenseKey
                  }));
                } else if (Array.isArray(subTree.children)) {
                  subTree.children.forEach((childSubTree) => {
                    if (childSubTree.component) {
                      this.getInstanceChildrenBySubTreeComponent(list, childSubTree, suspense);
                    } else {
                      list.push(...this.getInternalInstanceChildren(childSubTree, suspense));
                    }
                  });
                }
              }
              return list.filter((child) => {
                var _a;
                return !(0, util_1.isBeingDestroyed)(child) && !((_a = child.type.devtools) === null || _a === void 0 ? void 0 : _a.hide);
              });
            }
            /**
             * getInternalInstanceChildren by subTree component for uni-app defineSystemComponent
             */
            getInstanceChildrenBySubTreeComponent(list, subTree, suspense) {
              if (subTree.type.__reserved || this.uniAppPageNames.includes(subTree.type.name)) {
                list.push(...this.getInternalInstanceChildren(subTree.component.subTree));
              } else {
                !suspense ? list.push(subTree.component) : list.push({
                  ...subTree.component,
                  suspense
                });
              }
            }
            captureId(instance) {
              if (!instance)
                return null;
              const id = instance.__VUE_DEVTOOLS_UID__ != null ? instance.__VUE_DEVTOOLS_UID__ : (0, util_1.getUniqueComponentId)(instance, this.ctx);
              instance.__VUE_DEVTOOLS_UID__ = id;
              if (this.captureIds.has(id)) {
                return;
              } else {
                this.captureIds.set(id, void 0);
              }
              this.mark(instance);
              return id;
            }
            /**
             * Capture the meta information of an instance. (recursive)
             *
             * @param {Vue} instance
             * @return {Object}
             */
            async capture(instance, list, depth) {
              var _b;
              if (!instance)
                return null;
              const id = this.captureId(instance);
              const name = (0, util_1.getInstanceName)(instance);
              const children = this.getInternalInstanceChildrenByInstance(instance).filter((child) => !(0, util_1.isBeingDestroyed)(child));
              const parents = this.getComponentParents(instance) || [];
              const inactive = !!instance.isDeactivated || parents.some((parent) => parent.isDeactivated);
              const treeNode = {
                uid: instance.uid,
                id,
                name,
                renderKey: (0, util_1.getRenderKey)(instance.vnode ? instance.vnode.key : null),
                inactive,
                hasChildren: !!children.length,
                children: [],
                isFragment: (0, util_1.isFragment)(instance),
                tags: typeof instance.type !== "function" ? [] : [{
                  label: "functional",
                  textColor: 5592405,
                  backgroundColor: 15658734
                }],
                autoOpen: this.recursively
              };
              {
                treeNode.route = instance.attrs.__pagePath || "";
              }
              if (depth < this.maxDepth || instance.type.__isKeepAlive || parents.some((parent) => parent.type.__isKeepAlive)) {
                treeNode.children = await Promise.all(children.map((child, index, list2) => this.capture(child, list2, depth + 1)).filter(Boolean));
              }
              if (this.isKeepAlive(instance)) {
                const cachedComponents = this.getKeepAliveCachedInstances(instance);
                const childrenIds = children.map((child) => child.__VUE_DEVTOOLS_UID__);
                for (const cachedChild of cachedComponents) {
                  if (!childrenIds.includes(cachedChild.__VUE_DEVTOOLS_UID__)) {
                    const node = await this.capture({
                      ...cachedChild,
                      isDeactivated: true
                    }, null, depth + 1);
                    if (node) {
                      treeNode.children.push(node);
                    }
                  }
                }
              }
              const rootElements = (0, el_1.getRootElementsFromComponentInstance)(instance);
              const firstElement = rootElements[0];
              if (firstElement === null || firstElement === void 0 ? void 0 : firstElement.parentElement) {
                const parentInstance = instance.parent;
                const parentRootElements = parentInstance ? (0, el_1.getRootElementsFromComponentInstance)(parentInstance) : [];
                let el = firstElement;
                const indexList = [];
                do {
                  indexList.push(Array.from(el.parentElement.childNodes).indexOf(el));
                  el = el.parentElement;
                } while (el.parentElement && parentRootElements.length && !parentRootElements.includes(el));
                treeNode.domOrder = indexList.reverse();
              } else {
                treeNode.domOrder = [-1];
              }
              if ((_b = instance.suspense) === null || _b === void 0 ? void 0 : _b.suspenseKey) {
                treeNode.tags.push({
                  label: instance.suspense.suspenseKey,
                  backgroundColor: 14979812,
                  textColor: 16777215
                });
                this.mark(instance, true);
              }
              return this.api.visitComponentTree(instance, treeNode, this.componentFilter.filter, this.ctx.currentAppRecord.options.app);
            }
            /**
             * Mark an instance as captured and store it in the instance map.
             *
             * @param {Vue} instance
             */
            mark(instance, force = false) {
              const instanceMap = this.ctx.currentAppRecord.instanceMap;
              if (force || !instanceMap.has(instance.__VUE_DEVTOOLS_UID__)) {
                instanceMap.set(instance.__VUE_DEVTOOLS_UID__, instance);
              }
            }
            isKeepAlive(instance) {
              return instance.type.__isKeepAlive && instance.__v_cache;
            }
            getKeepAliveCachedInstances(instance) {
              return Array.from(instance.__v_cache.values()).map((vnode) => vnode.component).filter(Boolean);
            }
          }
          exports.ComponentWalker = ComponentWalker;
        }
      ),
      /***/
      "../app-backend-vue3/lib/components/util.js": (
        /*!**************************************************!*\
          !*** ../app-backend-vue3/lib/components/util.js ***!
          \**************************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.getComponentInstances = exports.getRenderKey = exports.getUniqueComponentId = exports.getInstanceName = exports.isFragment = exports.getAppRecord = exports.isBeingDestroyed = void 0;
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          const util_1 = __webpack_require__2(
            /*! ../util */
            "../app-backend-vue3/lib/util.js"
          );
          function isBeingDestroyed(instance) {
            return instance._isBeingDestroyed || instance.isUnmounted;
          }
          exports.isBeingDestroyed = isBeingDestroyed;
          function getAppRecord(instance) {
            if (instance.root) {
              return instance.appContext.app.__VUE_DEVTOOLS_APP_RECORD__;
            }
          }
          exports.getAppRecord = getAppRecord;
          function isFragment(instance) {
            var _a;
            const appRecord = getAppRecord(instance);
            if (appRecord) {
              return appRecord.options.types.Fragment === ((_a = instance.subTree) === null || _a === void 0 ? void 0 : _a.type);
            }
          }
          exports.isFragment = isFragment;
          function getInstanceName(instance) {
            var _a, _b, _c;
            const name = getComponentTypeName(instance.type || {});
            if (name)
              return name;
            if (isAppRoot(instance))
              return "Root";
            for (const key in (_b = (_a = instance.parent) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.components) {
              if (instance.parent.type.components[key] === instance.type)
                return saveComponentName(instance, key);
            }
            for (const key in (_c = instance.appContext) === null || _c === void 0 ? void 0 : _c.components) {
              if (instance.appContext.components[key] === instance.type)
                return saveComponentName(instance, key);
            }
            return "Anonymous Component";
          }
          exports.getInstanceName = getInstanceName;
          function saveComponentName(instance, key) {
            instance.type.__vdevtools_guessedName = key;
            return key;
          }
          function getComponentTypeName(options) {
            const name = options.name || options._componentTag || options.__vdevtools_guessedName;
            if (name) {
              return name;
            }
            const file = options.__file;
            if (file) {
              return (0, shared_utils_1.classify)((0, util_1.basename)(file, ".vue"));
            }
          }
          function isAppRoot(instance) {
            return instance.ctx.$mpType === "app";
          }
          function getUniqueComponentId(instance, ctx) {
            const appId = instance.appContext.app.__VUE_DEVTOOLS_APP_RECORD_ID__;
            const instanceId = isAppRoot(instance) ? "root" : instance.uid;
            return `${appId}:${instanceId}`;
          }
          exports.getUniqueComponentId = getUniqueComponentId;
          function getRenderKey(value) {
            if (value == null)
              return;
            const type = typeof value;
            if (type === "number") {
              return value;
            } else if (type === "string") {
              return `'${value}'`;
            } else if (Array.isArray(value)) {
              return "Array";
            } else {
              return "Object";
            }
          }
          exports.getRenderKey = getRenderKey;
          function getComponentInstances(app) {
            const appRecord = app.__VUE_DEVTOOLS_APP_RECORD__;
            const appId = appRecord.id.toString();
            return [...appRecord.instanceMap].filter(([key]) => key.split(":")[0] === appId).map(([, instance]) => instance);
          }
          exports.getComponentInstances = getComponentInstances;
        }
      ),
      /***/
      "../app-backend-vue3/lib/index.js": (
        /*!****************************************!*\
          !*** ../app-backend-vue3/lib/index.js ***!
          \****************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.backend = void 0;
          const app_backend_api_1 = __webpack_require__2(
            /*! @vue-devtools/app-backend-api */
            "../app-backend-api/lib/index.js"
          );
          const tree_1 = __webpack_require__2(
            /*! ./components/tree */
            "../app-backend-vue3/lib/components/tree.js"
          );
          const data_1 = __webpack_require__2(
            /*! ./components/data */
            "../app-backend-vue3/lib/components/data.js"
          );
          const util_1 = __webpack_require__2(
            /*! ./components/util */
            "../app-backend-vue3/lib/components/util.js"
          );
          const el_1 = __webpack_require__2(
            /*! ./components/el */
            "../app-backend-vue3/lib/components/el.js"
          );
          const shared_utils_1 = __webpack_require__2(
            /*! @vue-devtools/shared-utils */
            "../shared-utils/lib/index.js"
          );
          exports.backend = (0, app_backend_api_1.defineBackend)({
            frameworkVersion: 3,
            features: [],
            setup(api2) {
              api2.on.getAppRecordName((payload) => {
                if (payload.app._component) {
                  payload.name = payload.app._component.name;
                }
              });
              api2.on.getAppRootInstance((payload) => {
                var _a, _b, _c, _d;
                if (payload.app._instance) {
                  payload.root = payload.app._instance;
                } else if ((_b = (_a = payload.app._container) === null || _a === void 0 ? void 0 : _a._vnode) === null || _b === void 0 ? void 0 : _b.component) {
                  payload.root = (_d = (_c = payload.app._container) === null || _c === void 0 ? void 0 : _c._vnode) === null || _d === void 0 ? void 0 : _d.component;
                }
              });
              api2.on.walkComponentTree(async (payload, ctx) => {
                const walker = new tree_1.ComponentWalker(payload.maxDepth, payload.filter, payload.recursively, api2, ctx);
                payload.componentTreeData = await walker.getComponentTree(payload.componentInstance);
              });
              api2.on.walkComponentParents((payload, ctx) => {
                const walker = new tree_1.ComponentWalker(0, null, false, api2, ctx);
                payload.parentInstances = walker.getComponentParents(payload.componentInstance);
              });
              api2.on.inspectComponent((payload, ctx) => {
                shared_utils_1.backendInjections.getCustomInstanceDetails = data_1.getCustomInstanceDetails;
                shared_utils_1.backendInjections.getCustomObjectDetails = data_1.getCustomObjectDetails;
                shared_utils_1.backendInjections.instanceMap = ctx.currentAppRecord.instanceMap;
                shared_utils_1.backendInjections.isVueInstance = (val) => val._ && Object.keys(val._).includes("vnode");
                payload.instanceData = (0, data_1.getInstanceDetails)(payload.componentInstance, ctx);
              });
              api2.on.getComponentName((payload) => {
                payload.name = (0, util_1.getInstanceName)(payload.componentInstance);
              });
              api2.on.getComponentBounds((payload) => {
                payload.bounds = (0, el_1.getInstanceOrVnodeRect)(payload.componentInstance);
              });
              api2.on.getElementComponent((payload) => {
                payload.componentInstance = (0, el_1.getComponentInstanceFromElement)(payload.element);
              });
              api2.on.getComponentInstances((payload) => {
                payload.componentInstances = (0, util_1.getComponentInstances)(payload.app);
              });
              api2.on.getComponentRootElements((payload) => {
                payload.rootElements = (0, el_1.getRootElementsFromComponentInstance)(payload.componentInstance);
              });
              api2.on.editComponentState((payload, ctx) => {
                (0, data_1.editState)(payload, api2.stateEditor, ctx);
              });
              api2.on.getComponentDevtoolsOptions((payload) => {
                payload.options = payload.componentInstance.type.devtools;
              });
              api2.on.getComponentRenderCode((payload) => {
                payload.code = !(payload.componentInstance.type instanceof Function) ? payload.componentInstance.render.toString() : payload.componentInstance.type.toString();
              });
              api2.on.transformCall((payload) => {
                if (payload.callName === shared_utils_1.HookEvents.COMPONENT_UPDATED) {
                  const component = payload.inArgs[0];
                  payload.outArgs = [component.appContext.app, component.uid, component.parent ? component.parent.uid : void 0, component];
                }
              });
              api2.stateEditor.isRef = (value) => !!(value === null || value === void 0 ? void 0 : value.__v_isRef);
              api2.stateEditor.getRefValue = (ref) => ref.value;
              api2.stateEditor.setRefValue = (ref, value) => {
                ref.value = value;
              };
            }
          });
        }
      ),
      /***/
      "../app-backend-vue3/lib/util.js": (
        /*!***************************************!*\
          !*** ../app-backend-vue3/lib/util.js ***!
          \***************************************/
        /***/
        function(__unused_webpack_module, exports, __webpack_require__2) {
          var __importDefault = this && this.__importDefault || function(mod) {
            return mod && mod.__esModule ? mod : {
              "default": mod
            };
          };
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.returnError = exports.basename = exports.flatten = void 0;
          const path_1 = __importDefault(__webpack_require__2(
            /*! path */
            "../../node_modules/path-browserify/index.js"
          ));
          function flatten(items) {
            return items.reduce((acc, item) => {
              if (item instanceof Array)
                acc.push(...flatten(item));
              else if (item)
                acc.push(item);
              return acc;
            }, []);
          }
          exports.flatten = flatten;
          function basename(filename, ext) {
            return path_1.default.basename(filename.replace(/^[a-zA-Z]:/, "").replace(/\\/g, "/"), ext);
          }
          exports.basename = basename;
          function returnError(cb) {
            try {
              return cb();
            } catch (e) {
              return e;
            }
          }
          exports.returnError = returnError;
        }
      ),
      /***/
      "../shared-utils/lib/backend.js": (
        /*!**************************************!*\
          !*** ../shared-utils/lib/backend.js ***!
          \**************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.getCatchedGetters = exports.getCustomStoreDetails = exports.getCustomRouterDetails = exports.isVueInstance = exports.getCustomObjectDetails = exports.getCustomInstanceDetails = exports.getInstanceMap = exports.backendInjections = void 0;
          exports.backendInjections = {
            instanceMap: /* @__PURE__ */ new Map(),
            isVueInstance: () => false,
            getCustomInstanceDetails: () => ({}),
            getCustomObjectDetails: () => void 0
          };
          function getInstanceMap() {
            return exports.backendInjections.instanceMap;
          }
          exports.getInstanceMap = getInstanceMap;
          function getCustomInstanceDetails(instance) {
            return exports.backendInjections.getCustomInstanceDetails(instance);
          }
          exports.getCustomInstanceDetails = getCustomInstanceDetails;
          function getCustomObjectDetails(value, proto) {
            return exports.backendInjections.getCustomObjectDetails(value, proto);
          }
          exports.getCustomObjectDetails = getCustomObjectDetails;
          function isVueInstance(value) {
            return exports.backendInjections.isVueInstance(value);
          }
          exports.isVueInstance = isVueInstance;
          function getCustomRouterDetails(router) {
            return {
              _custom: {
                type: "router",
                display: "VueRouter",
                value: {
                  options: router.options,
                  currentRoute: router.currentRoute
                },
                fields: {
                  abstract: true
                }
              }
            };
          }
          exports.getCustomRouterDetails = getCustomRouterDetails;
          function getCustomStoreDetails(store) {
            return {
              _custom: {
                type: "store",
                display: "Store",
                value: {
                  state: store.state,
                  getters: getCatchedGetters(store)
                },
                fields: {
                  abstract: true
                }
              }
            };
          }
          exports.getCustomStoreDetails = getCustomStoreDetails;
          function getCatchedGetters(store) {
            const getters = {};
            const origGetters = store.getters || {};
            const keys = Object.keys(origGetters);
            for (let i2 = 0; i2 < keys.length; i2++) {
              const key = keys[i2];
              Object.defineProperty(getters, key, {
                enumerable: true,
                get: () => {
                  try {
                    return origGetters[key];
                  } catch (e) {
                    return e;
                  }
                }
              });
            }
            return getters;
          }
          exports.getCatchedGetters = getCatchedGetters;
        }
      ),
      /***/
      "../shared-utils/lib/bridge.js": (
        /*!*************************************!*\
          !*** ../shared-utils/lib/bridge.js ***!
          \*************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.Bridge = void 0;
          const events_1 = __webpack_require__2(
            /*! events */
            "../../node_modules/events/events.js"
          );
          const raf_1 = __webpack_require__2(
            /*! ./raf */
            "../shared-utils/lib/raf.js"
          );
          const BATCH_DURATION = 100;
          class Bridge extends events_1.EventEmitter {
            constructor(wall) {
              super();
              this.setMaxListeners(Infinity);
              this.wall = wall;
              wall.listen((messages) => {
                if (Array.isArray(messages)) {
                  messages.forEach((message) => this._emit(message));
                } else {
                  this._emit(messages);
                }
              });
              this._batchingQueue = [];
              this._sendingQueue = [];
              this._receivingQueue = [];
              this._sending = false;
            }
            on(event, listener) {
              const wrappedListener = async (...args) => {
                try {
                  await listener(...args);
                } catch (e) {
                  console.error(`[Bridge] Error in listener for event ${event.toString()} with args:`, args);
                  console.error(e);
                }
              };
              return super.on(event, wrappedListener);
            }
            send(event, payload) {
              this._batchingQueue.push({
                event,
                payload
              });
              if (this._timer == null) {
                this._timer = setTimeout(() => this._flush(), BATCH_DURATION);
              }
            }
            /**
             * Log a message to the devtools background page.
             */
            log(message) {
              this.send("log", message);
            }
            _flush() {
              if (this._batchingQueue.length)
                this._send(this._batchingQueue);
              clearTimeout(this._timer);
              this._timer = null;
              this._batchingQueue = [];
            }
            // @TODO types
            _emit(message) {
              if (typeof message === "string") {
                this.emit(message);
              } else if (message._chunk) {
                this._receivingQueue.push(message._chunk);
                if (message.last) {
                  this.emit(message.event, this._receivingQueue);
                  this._receivingQueue = [];
                }
              } else if (message.event) {
                this.emit(message.event, message.payload);
              }
            }
            // @TODO types
            _send(messages) {
              this._sendingQueue.push(messages);
              this._nextSend();
            }
            _nextSend() {
              if (!this._sendingQueue.length || this._sending)
                return;
              this._sending = true;
              const messages = this._sendingQueue.shift();
              try {
                this.wall.send(messages);
              } catch (err) {
                if (err.message === "Message length exceeded maximum allowed length.") {
                  this._sendingQueue.splice(0, 0, messages.map((message) => [message]));
                }
              }
              this._sending = false;
              (0, raf_1.raf)(() => this._nextSend());
            }
          }
          exports.Bridge = Bridge;
        }
      ),
      /***/
      "../shared-utils/lib/consts.js": (
        /*!*************************************!*\
          !*** ../shared-utils/lib/consts.js ***!
          \*************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.HookEvents = exports.BridgeSubscriptions = exports.BridgeEvents = exports.BuiltinTabs = void 0;
          (function(BuiltinTabs) {
            BuiltinTabs["COMPONENTS"] = "components";
            BuiltinTabs["TIMELINE"] = "timeline";
            BuiltinTabs["PLUGINS"] = "plugins";
            BuiltinTabs["SETTINGS"] = "settings";
          })(exports.BuiltinTabs || (exports.BuiltinTabs = {}));
          (function(BridgeEvents) {
            BridgeEvents["TO_BACK_SUBSCRIBE"] = "b:subscribe";
            BridgeEvents["TO_BACK_UNSUBSCRIBE"] = "b:unsubscribe";
            BridgeEvents["TO_FRONT_READY"] = "f:ready";
            BridgeEvents["TO_BACK_LOG_DETECTED_VUE"] = "b:log-detected-vue";
            BridgeEvents["TO_BACK_REFRESH"] = "b:refresh";
            BridgeEvents["TO_BACK_TAB_SWITCH"] = "b:tab:switch";
            BridgeEvents["TO_BACK_LOG"] = "b:log";
            BridgeEvents["TO_FRONT_RECONNECTED"] = "f:reconnected";
            BridgeEvents["TO_FRONT_TITLE"] = "f:title";
            BridgeEvents["TO_FRONT_APP_ADD"] = "f:app:add";
            BridgeEvents["TO_BACK_APP_LIST"] = "b:app:list";
            BridgeEvents["TO_FRONT_APP_LIST"] = "f:app:list";
            BridgeEvents["TO_FRONT_APP_REMOVE"] = "f:app:remove";
            BridgeEvents["TO_BACK_APP_SELECT"] = "b:app:select";
            BridgeEvents["TO_FRONT_APP_SELECTED"] = "f:app:selected";
            BridgeEvents["TO_BACK_SCAN_LEGACY_APPS"] = "b:app:scan-legacy";
            BridgeEvents["TO_BACK_COMPONENT_TREE"] = "b:component:tree";
            BridgeEvents["TO_FRONT_COMPONENT_TREE"] = "f:component:tree";
            BridgeEvents["TO_BACK_COMPONENT_SELECTED_DATA"] = "b:component:selected-data";
            BridgeEvents["TO_FRONT_COMPONENT_SELECTED_DATA"] = "f:component:selected-data";
            BridgeEvents["TO_BACK_COMPONENT_EXPAND"] = "b:component:expand";
            BridgeEvents["TO_FRONT_COMPONENT_EXPAND"] = "f:component:expand";
            BridgeEvents["TO_BACK_COMPONENT_SCROLL_TO"] = "b:component:scroll-to";
            BridgeEvents["TO_BACK_COMPONENT_FILTER"] = "b:component:filter";
            BridgeEvents["TO_BACK_COMPONENT_MOUSE_OVER"] = "b:component:mouse-over";
            BridgeEvents["TO_BACK_COMPONENT_MOUSE_OUT"] = "b:component:mouse-out";
            BridgeEvents["TO_BACK_COMPONENT_CONTEXT_MENU_TARGET"] = "b:component:context-menu-target";
            BridgeEvents["TO_BACK_COMPONENT_EDIT_STATE"] = "b:component:edit-state";
            BridgeEvents["TO_BACK_COMPONENT_PICK"] = "b:component:pick";
            BridgeEvents["TO_FRONT_COMPONENT_PICK"] = "f:component:pick";
            BridgeEvents["TO_BACK_COMPONENT_PICK_CANCELED"] = "b:component:pick-canceled";
            BridgeEvents["TO_FRONT_COMPONENT_PICK_CANCELED"] = "f:component:pick-canceled";
            BridgeEvents["TO_BACK_COMPONENT_INSPECT_DOM"] = "b:component:inspect-dom";
            BridgeEvents["TO_FRONT_COMPONENT_INSPECT_DOM"] = "f:component:inspect-dom";
            BridgeEvents["TO_BACK_COMPONENT_RENDER_CODE"] = "b:component:render-code";
            BridgeEvents["TO_FRONT_COMPONENT_RENDER_CODE"] = "f:component:render-code";
            BridgeEvents["TO_FRONT_COMPONENT_UPDATED"] = "f:component:updated";
            BridgeEvents["TO_FRONT_TIMELINE_EVENT"] = "f:timeline:event";
            BridgeEvents["TO_BACK_TIMELINE_LAYER_LIST"] = "b:timeline:layer-list";
            BridgeEvents["TO_FRONT_TIMELINE_LAYER_LIST"] = "f:timeline:layer-list";
            BridgeEvents["TO_FRONT_TIMELINE_LAYER_ADD"] = "f:timeline:layer-add";
            BridgeEvents["TO_BACK_TIMELINE_SHOW_SCREENSHOT"] = "b:timeline:show-screenshot";
            BridgeEvents["TO_BACK_TIMELINE_CLEAR"] = "b:timeline:clear";
            BridgeEvents["TO_BACK_TIMELINE_EVENT_DATA"] = "b:timeline:event-data";
            BridgeEvents["TO_FRONT_TIMELINE_EVENT_DATA"] = "f:timeline:event-data";
            BridgeEvents["TO_BACK_TIMELINE_LAYER_LOAD_EVENTS"] = "b:timeline:layer-load-events";
            BridgeEvents["TO_FRONT_TIMELINE_LAYER_LOAD_EVENTS"] = "f:timeline:layer-load-events";
            BridgeEvents["TO_BACK_TIMELINE_LOAD_MARKERS"] = "b:timeline:load-markers";
            BridgeEvents["TO_FRONT_TIMELINE_LOAD_MARKERS"] = "f:timeline:load-markers";
            BridgeEvents["TO_FRONT_TIMELINE_MARKER"] = "f:timeline:marker";
            BridgeEvents["TO_BACK_DEVTOOLS_PLUGIN_LIST"] = "b:devtools-plugin:list";
            BridgeEvents["TO_FRONT_DEVTOOLS_PLUGIN_LIST"] = "f:devtools-plugin:list";
            BridgeEvents["TO_FRONT_DEVTOOLS_PLUGIN_ADD"] = "f:devtools-plugin:add";
            BridgeEvents["TO_BACK_DEVTOOLS_PLUGIN_SETTING_UPDATED"] = "b:devtools-plugin:setting-updated";
            BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_LIST"] = "b:custom-inspector:list";
            BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_LIST"] = "f:custom-inspector:list";
            BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_ADD"] = "f:custom-inspector:add";
            BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_TREE"] = "b:custom-inspector:tree";
            BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_TREE"] = "f:custom-inspector:tree";
            BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_STATE"] = "b:custom-inspector:state";
            BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_STATE"] = "f:custom-inspector:state";
            BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_EDIT_STATE"] = "b:custom-inspector:edit-state";
            BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_ACTION"] = "b:custom-inspector:action";
            BridgeEvents["TO_BACK_CUSTOM_INSPECTOR_NODE_ACTION"] = "b:custom-inspector:node-action";
            BridgeEvents["TO_FRONT_CUSTOM_INSPECTOR_SELECT_NODE"] = "f:custom-inspector:select-node";
            BridgeEvents["TO_BACK_CUSTOM_STATE_ACTION"] = "b:custom-state:action";
          })(exports.BridgeEvents || (exports.BridgeEvents = {}));
          (function(BridgeSubscriptions) {
            BridgeSubscriptions["SELECTED_COMPONENT_DATA"] = "component:selected-data";
            BridgeSubscriptions["COMPONENT_TREE"] = "component:tree";
          })(exports.BridgeSubscriptions || (exports.BridgeSubscriptions = {}));
          (function(HookEvents) {
            HookEvents["INIT"] = "init";
            HookEvents["APP_INIT"] = "app:init";
            HookEvents["APP_ADD"] = "app:add";
            HookEvents["APP_UNMOUNT"] = "app:unmount";
            HookEvents["COMPONENT_UPDATED"] = "component:updated";
            HookEvents["COMPONENT_ADDED"] = "component:added";
            HookEvents["COMPONENT_REMOVED"] = "component:removed";
            HookEvents["COMPONENT_EMIT"] = "component:emit";
            HookEvents["COMPONENT_HIGHLIGHT"] = "component:highlight";
            HookEvents["COMPONENT_UNHIGHLIGHT"] = "component:unhighlight";
            HookEvents["SETUP_DEVTOOLS_PLUGIN"] = "devtools-plugin:setup";
            HookEvents["TIMELINE_LAYER_ADDED"] = "timeline:layer-added";
            HookEvents["TIMELINE_EVENT_ADDED"] = "timeline:event-added";
            HookEvents["CUSTOM_INSPECTOR_ADD"] = "custom-inspector:add";
            HookEvents["CUSTOM_INSPECTOR_SEND_TREE"] = "custom-inspector:send-tree";
            HookEvents["CUSTOM_INSPECTOR_SEND_STATE"] = "custom-inspector:send-state";
            HookEvents["CUSTOM_INSPECTOR_SELECT_NODE"] = "custom-inspector:select-node";
            HookEvents["PERFORMANCE_START"] = "perf:start";
            HookEvents["PERFORMANCE_END"] = "perf:end";
            HookEvents["PLUGIN_SETTINGS_SET"] = "plugin:settings:set";
            HookEvents["FLUSH"] = "flush";
            HookEvents["TRACK_UPDATE"] = "_track-update";
            HookEvents["FLASH_UPDATE"] = "_flash-update";
          })(exports.HookEvents || (exports.HookEvents = {}));
        }
      ),
      /***/
      "../shared-utils/lib/edit.js": (
        /*!***********************************!*\
          !*** ../shared-utils/lib/edit.js ***!
          \***********************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.StateEditor = void 0;
          class StateEditor {
            set(object, path, value, cb = null) {
              const sections = Array.isArray(path) ? path : path.split(".");
              while (sections.length > 1) {
                object = object[sections.shift()];
                if (this.isRef(object)) {
                  object = this.getRefValue(object);
                }
              }
              const field = sections[0];
              if (cb) {
                cb(object, field, value);
              } else if (this.isRef(object[field])) {
                this.setRefValue(object[field], value);
              } else {
                object[field] = value;
              }
            }
            get(object, path) {
              const sections = Array.isArray(path) ? path : path.split(".");
              for (let i2 = 0; i2 < sections.length; i2++) {
                object = object[sections[i2]];
                if (this.isRef(object)) {
                  object = this.getRefValue(object);
                }
                if (!object) {
                  return void 0;
                }
              }
              return object;
            }
            has(object, path, parent = false) {
              if (typeof object === "undefined") {
                return false;
              }
              const sections = Array.isArray(path) ? path.slice() : path.split(".");
              const size = !parent ? 1 : 2;
              while (object && sections.length > size) {
                object = object[sections.shift()];
                if (this.isRef(object)) {
                  object = this.getRefValue(object);
                }
              }
              return object != null && Object.prototype.hasOwnProperty.call(object, sections[0]);
            }
            createDefaultSetCallback(state) {
              return (obj, field, value) => {
                if (state.remove || state.newKey) {
                  if (Array.isArray(obj)) {
                    obj.splice(field, 1);
                  } else {
                    delete obj[field];
                  }
                }
                if (!state.remove) {
                  const target = obj[state.newKey || field];
                  if (this.isRef(target)) {
                    this.setRefValue(target, value);
                  } else {
                    obj[state.newKey || field] = value;
                  }
                }
              };
            }
            isRef(ref) {
              return false;
            }
            setRefValue(ref, value) {
            }
            getRefValue(ref) {
              return ref;
            }
          }
          exports.StateEditor = StateEditor;
        }
      ),
      /***/
      "../shared-utils/lib/env.js": (
        /*!**********************************!*\
          !*** ../shared-utils/lib/env.js ***!
          \**********************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.initEnv = exports.keys = exports.isLinux = exports.isMac = exports.isWindows = exports.isFirefox = exports.isChrome = exports.target = exports.isBrowser = void 0;
          exports.isBrowser = typeof navigator !== "undefined" && typeof window !== "undefined";
          exports.target = exports.isBrowser ? window : typeof globalThis !== "undefined" ? globalThis : typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof my !== "undefined" ? my : {};
          exports.isChrome = typeof exports.target.chrome !== "undefined" && !!exports.target.chrome.devtools;
          exports.isFirefox = exports.isBrowser && navigator.userAgent && navigator.userAgent.indexOf("Firefox") > -1;
          exports.isWindows = exports.isBrowser && navigator.platform.indexOf("Win") === 0;
          exports.isMac = exports.isBrowser && navigator.platform === "MacIntel";
          exports.isLinux = exports.isBrowser && navigator.platform.indexOf("Linux") === 0;
          exports.keys = {
            ctrl: exports.isMac ? "&#8984;" : "Ctrl",
            shift: "Shift",
            alt: exports.isMac ? "&#8997;" : "Alt",
            del: "Del",
            enter: "Enter",
            esc: "Esc"
          };
          function initEnv(Vue2) {
            if (Vue2.prototype.hasOwnProperty("$isChrome"))
              return;
            Object.defineProperties(Vue2.prototype, {
              $isChrome: {
                get: () => exports.isChrome
              },
              $isFirefox: {
                get: () => exports.isFirefox
              },
              $isWindows: {
                get: () => exports.isWindows
              },
              $isMac: {
                get: () => exports.isMac
              },
              $isLinux: {
                get: () => exports.isLinux
              },
              $keys: {
                get: () => exports.keys
              }
            });
            if (exports.isWindows)
              document.body.classList.add("platform-windows");
            if (exports.isMac)
              document.body.classList.add("platform-mac");
            if (exports.isLinux)
              document.body.classList.add("platform-linux");
          }
          exports.initEnv = initEnv;
        }
      ),
      /***/
      "../shared-utils/lib/index.js": (
        /*!************************************!*\
          !*** ../shared-utils/lib/index.js ***!
          \************************************/
        /***/
        function(__unused_webpack_module, exports, __webpack_require__2) {
          var __createBinding = this && this.__createBinding || (Object.create ? function(o2, m2, k2, k22) {
            if (k22 === void 0)
              k22 = k2;
            var desc = Object.getOwnPropertyDescriptor(m2, k2);
            if (!desc || ("get" in desc ? !m2.__esModule : desc.writable || desc.configurable)) {
              desc = {
                enumerable: true,
                get: function() {
                  return m2[k2];
                }
              };
            }
            Object.defineProperty(o2, k22, desc);
          } : function(o2, m2, k2, k22) {
            if (k22 === void 0)
              k22 = k2;
            o2[k22] = m2[k2];
          });
          var __exportStar = this && this.__exportStar || function(m2, exports2) {
            for (var p2 in m2)
              if (p2 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p2))
                __createBinding(exports2, m2, p2);
          };
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          __exportStar(__webpack_require__2(
            /*! ./backend */
            "../shared-utils/lib/backend.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./bridge */
            "../shared-utils/lib/bridge.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./consts */
            "../shared-utils/lib/consts.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./edit */
            "../shared-utils/lib/edit.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./env */
            "../shared-utils/lib/env.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./plugin-permissions */
            "../shared-utils/lib/plugin-permissions.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./plugin-settings */
            "../shared-utils/lib/plugin-settings.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./shared-data */
            "../shared-utils/lib/shared-data.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./shell */
            "../shared-utils/lib/shell.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./storage */
            "../shared-utils/lib/storage.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./transfer */
            "../shared-utils/lib/transfer.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./util */
            "../shared-utils/lib/util.js"
          ), exports);
          __exportStar(__webpack_require__2(
            /*! ./raf */
            "../shared-utils/lib/raf.js"
          ), exports);
        }
      ),
      /***/
      "../shared-utils/lib/plugin-permissions.js": (
        /*!*************************************************!*\
          !*** ../shared-utils/lib/plugin-permissions.js ***!
          \*************************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.setPluginPermission = exports.hasPluginPermission = exports.PluginPermission = void 0;
          const shared_data_1 = __webpack_require__2(
            /*! ./shared-data */
            "../shared-utils/lib/shared-data.js"
          );
          (function(PluginPermission) {
            PluginPermission["ENABLED"] = "enabled";
            PluginPermission["COMPONENTS"] = "components";
            PluginPermission["CUSTOM_INSPECTOR"] = "custom-inspector";
            PluginPermission["TIMELINE"] = "timeline";
          })(exports.PluginPermission || (exports.PluginPermission = {}));
          function hasPluginPermission(pluginId, permission) {
            const result = shared_data_1.SharedData.pluginPermissions[`${pluginId}:${permission}`];
            if (result == null)
              return true;
            return !!result;
          }
          exports.hasPluginPermission = hasPluginPermission;
          function setPluginPermission(pluginId, permission, active) {
            shared_data_1.SharedData.pluginPermissions = {
              ...shared_data_1.SharedData.pluginPermissions,
              [`${pluginId}:${permission}`]: active
            };
          }
          exports.setPluginPermission = setPluginPermission;
        }
      ),
      /***/
      "../shared-utils/lib/plugin-settings.js": (
        /*!**********************************************!*\
          !*** ../shared-utils/lib/plugin-settings.js ***!
          \**********************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.getPluginDefaultSettings = exports.setPluginSettings = exports.getPluginSettings = void 0;
          const shared_data_1 = __webpack_require__2(
            /*! ./shared-data */
            "../shared-utils/lib/shared-data.js"
          );
          function getPluginSettings(pluginId, defaultSettings) {
            var _a;
            return {
              ...defaultSettings !== null && defaultSettings !== void 0 ? defaultSettings : {},
              ...(_a = shared_data_1.SharedData.pluginSettings[pluginId]) !== null && _a !== void 0 ? _a : {}
            };
          }
          exports.getPluginSettings = getPluginSettings;
          function setPluginSettings(pluginId, settings) {
            shared_data_1.SharedData.pluginSettings = {
              ...shared_data_1.SharedData.pluginSettings,
              [pluginId]: settings
            };
          }
          exports.setPluginSettings = setPluginSettings;
          function getPluginDefaultSettings(schema) {
            const result = {};
            if (schema) {
              for (const id in schema) {
                const item = schema[id];
                result[id] = item.defaultValue;
              }
            }
            return result;
          }
          exports.getPluginDefaultSettings = getPluginDefaultSettings;
        }
      ),
      /***/
      "../shared-utils/lib/raf.js": (
        /*!**********************************!*\
          !*** ../shared-utils/lib/raf.js ***!
          \**********************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.raf = void 0;
          let pendingCallbacks = [];
          exports.raf = typeof requestAnimationFrame === "function" ? requestAnimationFrame : typeof setImmediate === "function" ? (fn) => {
            if (!pendingCallbacks.length) {
              setImmediate(() => {
                const now = performance.now();
                const cbs = pendingCallbacks;
                pendingCallbacks = [];
                cbs.forEach((cb) => cb(now));
              });
            }
            pendingCallbacks.push(fn);
          } : function(callback) {
            return setTimeout(function() {
              callback(Date.now());
            }, 1e3 / 60);
          };
        }
      ),
      /***/
      "../shared-utils/lib/shared-data.js": (
        /*!******************************************!*\
          !*** ../shared-utils/lib/shared-data.js ***!
          \******************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.SharedData = exports.watchSharedData = exports.destroySharedData = exports.onSharedDataInit = exports.initSharedData = void 0;
          const storage_1 = __webpack_require__2(
            /*! ./storage */
            "../shared-utils/lib/storage.js"
          );
          const env_1 = __webpack_require__2(
            /*! ./env */
            "../shared-utils/lib/env.js"
          );
          const internalSharedData = {
            openInEditorHost: "/",
            componentNameStyle: "class",
            theme: "auto",
            displayDensity: "low",
            timeFormat: "default",
            recordVuex: true,
            cacheVuexSnapshotsEvery: 50,
            cacheVuexSnapshotsLimit: 10,
            snapshotLoading: false,
            componentEventsEnabled: true,
            performanceMonitoringEnabled: true,
            editableProps: false,
            logDetected: true,
            vuexNewBackend: false,
            vuexAutoload: false,
            vuexGroupGettersByModule: true,
            showMenuScrollTip: true,
            timelineTimeGrid: true,
            timelineScreenshots: true,
            menuStepScrolling: env_1.isMac,
            pluginPermissions: {},
            pluginSettings: {},
            pageConfig: {},
            legacyApps: false,
            trackUpdates: true,
            flashUpdates: false,
            debugInfo: false,
            isBrowser: env_1.isBrowser
          };
          const persisted = ["componentNameStyle", "theme", "displayDensity", "recordVuex", "editableProps", "logDetected", "vuexNewBackend", "vuexAutoload", "vuexGroupGettersByModule", "timeFormat", "showMenuScrollTip", "timelineTimeGrid", "timelineScreenshots", "menuStepScrolling", "pluginPermissions", "pluginSettings", "performanceMonitoringEnabled", "componentEventsEnabled", "trackUpdates", "flashUpdates", "debugInfo"];
          const storageVersion = "6.0.0-alpha.1";
          let bridge;
          let persist = false;
          let data;
          let initRetryInterval;
          let initRetryCount = 0;
          const initCbs = [];
          function initSharedData(params) {
            return new Promise((resolve) => {
              bridge = params.bridge;
              persist = !!params.persist;
              if (persist) {
                {
                  console.log("[shared data] Master init in progress...");
                }
                persisted.forEach((key) => {
                  const value = (0, storage_1.getStorage)(`vue-devtools-${storageVersion}:shared-data:${key}`);
                  if (value !== null) {
                    internalSharedData[key] = value;
                  }
                });
                bridge.on("shared-data:load", () => {
                  Object.keys(internalSharedData).forEach((key) => {
                    sendValue(key, internalSharedData[key]);
                  });
                  bridge.send("shared-data:load-complete");
                });
                bridge.on("shared-data:init-complete", () => {
                  {
                    console.log("[shared data] Master init complete");
                  }
                  clearInterval(initRetryInterval);
                  resolve();
                });
                bridge.send("shared-data:master-init-waiting");
                bridge.on("shared-data:minion-init-waiting", () => {
                  bridge.send("shared-data:master-init-waiting");
                });
                initRetryCount = 0;
                clearInterval(initRetryInterval);
                initRetryInterval = setInterval(() => {
                  {
                    console.log("[shared data] Master init retrying...");
                  }
                  bridge.send("shared-data:master-init-waiting");
                  initRetryCount++;
                  if (initRetryCount > 30) {
                    clearInterval(initRetryInterval);
                    console.error("[shared data] Master init failed");
                  }
                }, 2e3);
              } else {
                bridge.on("shared-data:master-init-waiting", () => {
                  bridge.send("shared-data:load");
                  bridge.once("shared-data:load-complete", () => {
                    bridge.send("shared-data:init-complete");
                    resolve();
                  });
                });
                bridge.send("shared-data:minion-init-waiting");
              }
              data = {
                ...internalSharedData
              };
              if (params.Vue) {
                data = params.Vue.observable(data);
              }
              bridge.on("shared-data:set", ({
                key,
                value
              }) => {
                setValue(key, value);
              });
              initCbs.forEach((cb) => cb());
            });
          }
          exports.initSharedData = initSharedData;
          function onSharedDataInit(cb) {
            initCbs.push(cb);
            return () => {
              const index = initCbs.indexOf(cb);
              if (index !== -1)
                initCbs.splice(index, 1);
            };
          }
          exports.onSharedDataInit = onSharedDataInit;
          function destroySharedData() {
            bridge.removeAllListeners("shared-data:set");
            watchers = {};
          }
          exports.destroySharedData = destroySharedData;
          let watchers = {};
          function setValue(key, value) {
            if (persist && persisted.includes(key)) {
              (0, storage_1.setStorage)(`vue-devtools-${storageVersion}:shared-data:${key}`, value);
            }
            const oldValue = data[key];
            data[key] = value;
            const handlers = watchers[key];
            if (handlers) {
              handlers.forEach((h2) => h2(value, oldValue));
            }
            return true;
          }
          function sendValue(key, value) {
            bridge && bridge.send("shared-data:set", {
              key,
              value
            });
          }
          function watchSharedData(prop, handler) {
            const list = watchers[prop] || (watchers[prop] = []);
            list.push(handler);
            return () => {
              const index = list.indexOf(handler);
              if (index !== -1)
                list.splice(index, 1);
            };
          }
          exports.watchSharedData = watchSharedData;
          const proxy = {};
          Object.keys(internalSharedData).forEach((key) => {
            Object.defineProperty(proxy, key, {
              configurable: false,
              get: () => data[key],
              set: (value) => {
                sendValue(key, value);
                setValue(key, value);
              }
            });
          });
          exports.SharedData = proxy;
        }
      ),
      /***/
      "../shared-utils/lib/shell.js": (
        /*!************************************!*\
          !*** ../shared-utils/lib/shell.js ***!
          \************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
        }
      ),
      /***/
      "../shared-utils/lib/storage.js": (
        /*!**************************************!*\
          !*** ../shared-utils/lib/storage.js ***!
          \**************************************/
        /***/
        (__unused_webpack_module, exports, __webpack_require__2) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.clearStorage = exports.removeStorage = exports.setStorage = exports.getStorage = exports.initStorage = void 0;
          const env_1 = __webpack_require__2(
            /*! ./env */
            "../shared-utils/lib/env.js"
          );
          const useStorage = typeof env_1.target.chrome !== "undefined" && typeof env_1.target.chrome.storage !== "undefined";
          let storageData = null;
          function initStorage() {
            return new Promise((resolve) => {
              if (useStorage) {
                env_1.target.chrome.storage.local.get(null, (result) => {
                  storageData = result;
                  resolve();
                });
              } else {
                storageData = {};
                resolve();
              }
            });
          }
          exports.initStorage = initStorage;
          function getStorage(key, defaultValue = null) {
            checkStorage();
            if (useStorage) {
              return getDefaultValue(storageData[key], defaultValue);
            } else {
              try {
                return getDefaultValue(JSON.parse(localStorage.getItem(key)), defaultValue);
              } catch (e) {
              }
            }
          }
          exports.getStorage = getStorage;
          function setStorage(key, val) {
            checkStorage();
            if (useStorage) {
              storageData[key] = val;
              env_1.target.chrome.storage.local.set({
                [key]: val
              });
            } else {
              try {
                localStorage.setItem(key, JSON.stringify(val));
              } catch (e) {
              }
            }
          }
          exports.setStorage = setStorage;
          function removeStorage(key) {
            checkStorage();
            if (useStorage) {
              delete storageData[key];
              env_1.target.chrome.storage.local.remove([key]);
            } else {
              try {
                localStorage.removeItem(key);
              } catch (e) {
              }
            }
          }
          exports.removeStorage = removeStorage;
          function clearStorage() {
            checkStorage();
            if (useStorage) {
              storageData = {};
              env_1.target.chrome.storage.local.clear();
            } else {
              try {
                localStorage.clear();
              } catch (e) {
              }
            }
          }
          exports.clearStorage = clearStorage;
          function checkStorage() {
            if (!storageData) {
              throw new Error("Storage wasn't initialized with 'init()'");
            }
          }
          function getDefaultValue(value, defaultValue) {
            if (value == null) {
              return defaultValue;
            }
            return value;
          }
        }
      ),
      /***/
      "../shared-utils/lib/transfer.js": (
        /*!***************************************!*\
          !*** ../shared-utils/lib/transfer.js ***!
          \***************************************/
        /***/
        (__unused_webpack_module, exports) => {
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.stringifyStrictCircularAutoChunks = exports.parseCircularAutoChunks = exports.stringifyCircularAutoChunks = void 0;
          const MAX_SERIALIZED_SIZE = 512 * 1024;
          function encode(data, replacer, list, seen) {
            let stored, key, value, i2, l2;
            const seenIndex = seen.get(data);
            if (seenIndex != null) {
              return seenIndex;
            }
            const index = list.length;
            const proto = Object.prototype.toString.call(data);
            if (proto === "[object Object]") {
              stored = {};
              seen.set(data, index);
              list.push(stored);
              const keys = Object.keys(data);
              for (i2 = 0, l2 = keys.length; i2 < l2; i2++) {
                key = keys[i2];
                try {
                  value = data[key];
                  if (replacer)
                    value = replacer.call(data, key, value);
                } catch (e) {
                  value = e;
                }
                stored[key] = encode(value, replacer, list, seen);
              }
            } else if (proto === "[object Array]") {
              stored = [];
              seen.set(data, index);
              list.push(stored);
              for (i2 = 0, l2 = data.length; i2 < l2; i2++) {
                try {
                  value = data[i2];
                  if (replacer)
                    value = replacer.call(data, i2, value);
                } catch (e) {
                  value = e;
                }
                stored[i2] = encode(value, replacer, list, seen);
              }
            } else {
              list.push(data);
            }
            return index;
          }
          function decode(list, reviver) {
            let i2 = list.length;
            let j2, k2, data, key, value, proto;
            while (i2--) {
              data = list[i2];
              proto = Object.prototype.toString.call(data);
              if (proto === "[object Object]") {
                const keys = Object.keys(data);
                for (j2 = 0, k2 = keys.length; j2 < k2; j2++) {
                  key = keys[j2];
                  value = list[data[key]];
                  if (reviver)
                    value = reviver.call(data, key, value);
                  data[key] = value;
                }
              } else if (proto === "[object Array]") {
                for (j2 = 0, k2 = data.length; j2 < k2; j2++) {
                  value = list[data[j2]];
                  if (reviver)
                    value = reviver.call(data, j2, value);
                  data[j2] = value;
                }
              }
            }
          }
          function stringifyCircularAutoChunks(data, replacer = null, space = null) {
            let result;
            try {
              result = arguments.length === 1 ? JSON.stringify(data) : JSON.stringify(data, replacer, space);
            } catch (e) {
              result = stringifyStrictCircularAutoChunks(data, replacer, space);
            }
            if (result.length > MAX_SERIALIZED_SIZE) {
              const chunkCount = Math.ceil(result.length / MAX_SERIALIZED_SIZE);
              const chunks = [];
              for (let i2 = 0; i2 < chunkCount; i2++) {
                chunks.push(result.slice(i2 * MAX_SERIALIZED_SIZE, (i2 + 1) * MAX_SERIALIZED_SIZE));
              }
              return chunks;
            }
            return result;
          }
          exports.stringifyCircularAutoChunks = stringifyCircularAutoChunks;
          function parseCircularAutoChunks(data, reviver = null) {
            if (Array.isArray(data)) {
              data = data.join("");
            }
            const hasCircular = /^\s/.test(data);
            if (!hasCircular) {
              return arguments.length === 1 ? JSON.parse(data) : JSON.parse(data, reviver);
            } else {
              const list = JSON.parse(data);
              decode(list, reviver);
              return list[0];
            }
          }
          exports.parseCircularAutoChunks = parseCircularAutoChunks;
          function stringifyStrictCircularAutoChunks(data, replacer = null, space = null) {
            const list = [];
            encode(data, replacer, list, /* @__PURE__ */ new Map());
            return space ? " " + JSON.stringify(list, null, space) : " " + JSON.stringify(list);
          }
          exports.stringifyStrictCircularAutoChunks = stringifyStrictCircularAutoChunks;
        }
      ),
      /***/
      "../shared-utils/lib/util.js": (
        /*!***********************************!*\
          !*** ../shared-utils/lib/util.js ***!
          \***********************************/
        /***/
        function(__unused_webpack_module, exports, __webpack_require__2) {
          var __importDefault = this && this.__importDefault || function(mod) {
            return mod && mod.__esModule ? mod : {
              "default": mod
            };
          };
          Object.defineProperty(exports, "__esModule", {
            value: true
          });
          exports.isEmptyObject = exports.copyToClipboard = exports.escape = exports.openInEditor = exports.focusInput = exports.simpleGet = exports.sortByKey = exports.searchDeepInObject = exports.isPlainObject = exports.revive = exports.parse = exports.getCustomRefDetails = exports.getCustomHTMLElementDetails = exports.getCustomFunctionDetails = exports.getCustomComponentDefinitionDetails = exports.getComponentName = exports.reviveSet = exports.getCustomSetDetails = exports.reviveMap = exports.getCustomMapDetails = exports.stringify = exports.specialTokenToString = exports.MAX_ARRAY_SIZE = exports.MAX_STRING_SIZE = exports.SPECIAL_TOKENS = exports.NAN = exports.NEGATIVE_INFINITY = exports.INFINITY = exports.UNDEFINED = exports.inDoc = exports.getComponentDisplayName = exports.kebabize = exports.camelize = exports.classify = void 0;
          const path_1 = __importDefault(__webpack_require__2(
            /*! path */
            "../../node_modules/path-browserify/index.js"
          ));
          const transfer_1 = __webpack_require__2(
            /*! ./transfer */
            "../shared-utils/lib/transfer.js"
          );
          const backend_1 = __webpack_require__2(
            /*! ./backend */
            "../shared-utils/lib/backend.js"
          );
          const shared_data_1 = __webpack_require__2(
            /*! ./shared-data */
            "../shared-utils/lib/shared-data.js"
          );
          const env_1 = __webpack_require__2(
            /*! ./env */
            "../shared-utils/lib/env.js"
          );
          function cached(fn) {
            const cache = /* @__PURE__ */ Object.create(null);
            return function cachedFn(str) {
              const hit = cache[str];
              return hit || (cache[str] = fn(str));
            };
          }
          const classifyRE = /(?:^|[-_/])(\w)/g;
          exports.classify = cached((str) => {
            return str && ("" + str).replace(classifyRE, toUpper);
          });
          const camelizeRE = /-(\w)/g;
          exports.camelize = cached((str) => {
            return str && str.replace(camelizeRE, toUpper);
          });
          const kebabizeRE = /([a-z0-9])([A-Z])/g;
          exports.kebabize = cached((str) => {
            return str && str.replace(kebabizeRE, (_2, lowerCaseCharacter, upperCaseLetter) => {
              return `${lowerCaseCharacter}-${upperCaseLetter}`;
            }).toLowerCase();
          });
          function toUpper(_2, c2) {
            return c2 ? c2.toUpperCase() : "";
          }
          function getComponentDisplayName(originalName, style = "class") {
            switch (style) {
              case "class":
                return (0, exports.classify)(originalName);
              case "kebab":
                return (0, exports.kebabize)(originalName);
              case "original":
              default:
                return originalName;
            }
          }
          exports.getComponentDisplayName = getComponentDisplayName;
          function inDoc(node) {
            if (!node)
              return false;
            const doc = node.ownerDocument.documentElement;
            const parent = node.parentNode;
            return doc === node || doc === parent || !!(parent && parent.nodeType === 1 && doc.contains(parent));
          }
          exports.inDoc = inDoc;
          exports.UNDEFINED = "__vue_devtool_undefined__";
          exports.INFINITY = "__vue_devtool_infinity__";
          exports.NEGATIVE_INFINITY = "__vue_devtool_negative_infinity__";
          exports.NAN = "__vue_devtool_nan__";
          exports.SPECIAL_TOKENS = {
            true: true,
            false: false,
            undefined: exports.UNDEFINED,
            null: null,
            "-Infinity": exports.NEGATIVE_INFINITY,
            Infinity: exports.INFINITY,
            NaN: exports.NAN
          };
          exports.MAX_STRING_SIZE = 1e4;
          exports.MAX_ARRAY_SIZE = 5e3;
          function specialTokenToString(value) {
            if (value === null) {
              return "null";
            } else if (value === exports.UNDEFINED) {
              return "undefined";
            } else if (value === exports.NAN) {
              return "NaN";
            } else if (value === exports.INFINITY) {
              return "Infinity";
            } else if (value === exports.NEGATIVE_INFINITY) {
              return "-Infinity";
            }
            return false;
          }
          exports.specialTokenToString = specialTokenToString;
          class EncodeCache {
            constructor() {
              this.map = /* @__PURE__ */ new Map();
            }
            /**
             * Returns a result unique to each input data
             * @param {*} data Input data
             * @param {*} factory Function used to create the unique result
             */
            cache(data, factory) {
              const cached2 = this.map.get(data);
              if (cached2) {
                return cached2;
              } else {
                const result = factory(data);
                this.map.set(data, result);
                return result;
              }
            }
            clear() {
              this.map.clear();
            }
          }
          const encodeCache = new EncodeCache();
          class ReviveCache {
            constructor(maxSize) {
              this.maxSize = maxSize;
              this.map = /* @__PURE__ */ new Map();
              this.index = 0;
              this.size = 0;
            }
            cache(value) {
              const currentIndex = this.index;
              this.map.set(currentIndex, value);
              this.size++;
              if (this.size > this.maxSize) {
                this.map.delete(currentIndex - this.size);
                this.size--;
              }
              this.index++;
              return currentIndex;
            }
            read(id) {
              return this.map.get(id);
            }
          }
          const reviveCache = new ReviveCache(1e3);
          const replacers = {
            internal: replacerForInternal,
            user: replaceForUser
          };
          function stringify(data, target = "internal") {
            encodeCache.clear();
            return (0, transfer_1.stringifyCircularAutoChunks)(data, replacers[target]);
          }
          exports.stringify = stringify;
          function replacerForInternal(key) {
            var _a;
            const val = this[key];
            const type = typeof val;
            if (Array.isArray(val)) {
              const l2 = val.length;
              if (l2 > exports.MAX_ARRAY_SIZE) {
                return {
                  _isArray: true,
                  length: l2,
                  items: val.slice(0, exports.MAX_ARRAY_SIZE)
                };
              }
              return val;
            } else if (typeof val === "string") {
              if (val.length > exports.MAX_STRING_SIZE) {
                return val.substring(0, exports.MAX_STRING_SIZE) + `... (${val.length} total length)`;
              } else {
                return val;
              }
            } else if (type === "undefined") {
              return exports.UNDEFINED;
            } else if (val === Infinity) {
              return exports.INFINITY;
            } else if (val === -Infinity) {
              return exports.NEGATIVE_INFINITY;
            } else if (type === "function") {
              return getCustomFunctionDetails(val);
            } else if (type === "symbol") {
              return `[native Symbol ${Symbol.prototype.toString.call(val)}]`;
            } else if (val !== null && type === "object") {
              const proto = Object.prototype.toString.call(val);
              if (proto === "[object Map]") {
                return encodeCache.cache(val, () => getCustomMapDetails(val));
              } else if (proto === "[object Set]") {
                return encodeCache.cache(val, () => getCustomSetDetails(val));
              } else if (proto === "[object RegExp]") {
                return `[native RegExp ${RegExp.prototype.toString.call(val)}]`;
              } else if (proto === "[object Date]") {
                return `[native Date ${Date.prototype.toString.call(val)}]`;
              } else if (proto === "[object Error]") {
                return `[native Error ${val.message}<>${val.stack}]`;
              } else if (val.state && val._vm) {
                return encodeCache.cache(val, () => (0, backend_1.getCustomStoreDetails)(val));
              } else if (val.constructor && val.constructor.name === "VueRouter") {
                return encodeCache.cache(val, () => (0, backend_1.getCustomRouterDetails)(val));
              } else if ((0, backend_1.isVueInstance)(val)) {
                return encodeCache.cache(val, () => (0, backend_1.getCustomInstanceDetails)(val));
              } else if (typeof val.render === "function") {
                return encodeCache.cache(val, () => getCustomComponentDefinitionDetails(val));
              } else if (val.constructor && val.constructor.name === "VNode") {
                return `[native VNode <${val.tag}>]`;
              } else if (typeof HTMLElement !== "undefined" && val instanceof HTMLElement) {
                return encodeCache.cache(val, () => getCustomHTMLElementDetails(val));
              } else if (((_a = val.constructor) === null || _a === void 0 ? void 0 : _a.name) === "Store" && val._wrappedGetters) {
                return `[object Store]`;
              } else if (val.currentRoute) {
                return `[object Router]`;
              }
              const customDetails = (0, backend_1.getCustomObjectDetails)(val, proto);
              if (customDetails != null)
                return customDetails;
            } else if (Number.isNaN(val)) {
              return exports.NAN;
            }
            return sanitize(val);
          }
          function replaceForUser(key) {
            let val = this[key];
            const type = typeof val;
            if ((val === null || val === void 0 ? void 0 : val._custom) && "value" in val._custom) {
              val = val._custom.value;
            }
            if (type !== "object") {
              if (val === exports.UNDEFINED) {
                return void 0;
              } else if (val === exports.INFINITY) {
                return Infinity;
              } else if (val === exports.NEGATIVE_INFINITY) {
                return -Infinity;
              } else if (val === exports.NAN) {
                return NaN;
              }
              return val;
            }
            return sanitize(val);
          }
          function getCustomMapDetails(val) {
            const list = [];
            val.forEach((value, key) => list.push({
              key,
              value
            }));
            return {
              _custom: {
                type: "map",
                display: "Map",
                value: list,
                readOnly: true,
                fields: {
                  abstract: true
                }
              }
            };
          }
          exports.getCustomMapDetails = getCustomMapDetails;
          function reviveMap(val) {
            const result = /* @__PURE__ */ new Map();
            const list = val._custom.value;
            for (let i2 = 0; i2 < list.length; i2++) {
              const {
                key,
                value
              } = list[i2];
              result.set(key, revive(value));
            }
            return result;
          }
          exports.reviveMap = reviveMap;
          function getCustomSetDetails(val) {
            const list = Array.from(val);
            return {
              _custom: {
                type: "set",
                display: `Set[${list.length}]`,
                value: list,
                readOnly: true
              }
            };
          }
          exports.getCustomSetDetails = getCustomSetDetails;
          function reviveSet(val) {
            const result = /* @__PURE__ */ new Set();
            const list = val._custom.value;
            for (let i2 = 0; i2 < list.length; i2++) {
              const value = list[i2];
              result.add(revive(value));
            }
            return result;
          }
          exports.reviveSet = reviveSet;
          function basename(filename, ext) {
            return path_1.default.basename(filename.replace(/^[a-zA-Z]:/, "").replace(/\\/g, "/"), ext);
          }
          function getComponentName(options) {
            const name = options.displayName || options.name || options._componentTag;
            if (name) {
              return name;
            }
            const file = options.__file;
            if (file) {
              return (0, exports.classify)(basename(file, ".vue"));
            }
          }
          exports.getComponentName = getComponentName;
          function getCustomComponentDefinitionDetails(def) {
            let display = getComponentName(def);
            if (display) {
              if (def.name && def.__file) {
                display += ` <span>(${def.__file})</span>`;
              }
            } else {
              display = "<i>Unknown Component</i>";
            }
            return {
              _custom: {
                type: "component-definition",
                display,
                tooltip: "Component definition",
                ...def.__file ? {
                  file: def.__file
                } : {}
              }
            };
          }
          exports.getCustomComponentDefinitionDetails = getCustomComponentDefinitionDetails;
          function getCustomFunctionDetails(func) {
            let string = "";
            let matches = null;
            try {
              string = Function.prototype.toString.call(func);
              matches = String.prototype.match.call(string, /\([\s\S]*?\)/);
            } catch (e) {
            }
            const match = matches && matches[0];
            const args = typeof match === "string" ? match : "(?)";
            const name = typeof func.name === "string" ? func.name : "";
            return {
              _custom: {
                type: "function",
                display: `<span style="opacity:.5;">function</span> ${escape2(name)}${args}`,
                tooltip: string.trim() ? `<pre>${string}</pre>` : null,
                _reviveId: reviveCache.cache(func)
              }
            };
          }
          exports.getCustomFunctionDetails = getCustomFunctionDetails;
          function getCustomHTMLElementDetails(value) {
            try {
              return {
                _custom: {
                  type: "HTMLElement",
                  display: `<span class="opacity-30">&lt;</span><span class="text-blue-500">${value.tagName.toLowerCase()}</span><span class="opacity-30">&gt;</span>`,
                  value: namedNodeMapToObject(value.attributes),
                  actions: [{
                    icon: "input",
                    tooltip: "Log element to console",
                    action: () => {
                      console.log(value);
                    }
                  }]
                }
              };
            } catch (e) {
              return {
                _custom: {
                  type: "HTMLElement",
                  display: `<span class="text-blue-500">${String(value)}</span>`
                }
              };
            }
          }
          exports.getCustomHTMLElementDetails = getCustomHTMLElementDetails;
          function namedNodeMapToObject(map) {
            const result = {};
            const l2 = map.length;
            for (let i2 = 0; i2 < l2; i2++) {
              const node = map.item(i2);
              result[node.name] = node.value;
            }
            return result;
          }
          function getCustomRefDetails(instance, key, ref) {
            let value;
            if (Array.isArray(ref)) {
              value = ref.map((r2) => getCustomRefDetails(instance, key, r2)).map((data) => data.value);
            } else {
              let name;
              if (ref._isVue) {
                name = getComponentName(ref.$options);
              } else {
                name = ref.tagName.toLowerCase();
              }
              value = {
                _custom: {
                  display: `&lt;${name}` + (ref.id ? ` <span class="attr-title">id</span>="${ref.id}"` : "") + (ref.className ? ` <span class="attr-title">class</span>="${ref.className}"` : "") + "&gt;",
                  uid: instance.__VUE_DEVTOOLS_UID__,
                  type: "reference"
                }
              };
            }
            return {
              type: "$refs",
              key,
              value,
              editable: false
            };
          }
          exports.getCustomRefDetails = getCustomRefDetails;
          function parse2(data, revive2 = false) {
            return revive2 ? (0, transfer_1.parseCircularAutoChunks)(data, reviver) : (0, transfer_1.parseCircularAutoChunks)(data);
          }
          exports.parse = parse2;
          const specialTypeRE = /^\[native (\w+) (.*?)(<>((.|\s)*))?\]$/;
          const symbolRE = /^\[native Symbol Symbol\((.*)\)\]$/;
          function reviver(key, val) {
            return revive(val);
          }
          function revive(val) {
            if (val === exports.UNDEFINED) {
              return void 0;
            } else if (val === exports.INFINITY) {
              return Infinity;
            } else if (val === exports.NEGATIVE_INFINITY) {
              return -Infinity;
            } else if (val === exports.NAN) {
              return NaN;
            } else if (val && val._custom) {
              const {
                _custom: custom
              } = val;
              if (custom.type === "component") {
                return (0, backend_1.getInstanceMap)().get(custom.id);
              } else if (custom.type === "map") {
                return reviveMap(val);
              } else if (custom.type === "set") {
                return reviveSet(val);
              } else if (custom._reviveId) {
                return reviveCache.read(custom._reviveId);
              } else {
                return revive(custom.value);
              }
            } else if (symbolRE.test(val)) {
              const [, string] = symbolRE.exec(val);
              return Symbol.for(string);
            } else if (specialTypeRE.test(val)) {
              const [, type, string, , details] = specialTypeRE.exec(val);
              const result = new env_1.target[type](string);
              if (type === "Error" && details) {
                result.stack = details;
              }
              return result;
            } else {
              return val;
            }
          }
          exports.revive = revive;
          function sanitize(data) {
            if (!isPrimitive(data) && !Array.isArray(data) && !isPlainObject(data)) {
              return Object.prototype.toString.call(data);
            } else {
              return data;
            }
          }
          function isPlainObject(obj) {
            return Object.prototype.toString.call(obj) === "[object Object]";
          }
          exports.isPlainObject = isPlainObject;
          function isPrimitive(data) {
            if (data == null) {
              return true;
            }
            const type = typeof data;
            return type === "string" || type === "number" || type === "boolean";
          }
          function searchDeepInObject(obj, searchTerm) {
            const seen = /* @__PURE__ */ new Map();
            const result = internalSearchObject(obj, searchTerm.toLowerCase(), seen, 0);
            seen.clear();
            return result;
          }
          exports.searchDeepInObject = searchDeepInObject;
          const SEARCH_MAX_DEPTH = 10;
          function internalSearchObject(obj, searchTerm, seen, depth) {
            if (depth > SEARCH_MAX_DEPTH) {
              return false;
            }
            let match = false;
            const keys = Object.keys(obj);
            let key, value;
            for (let i2 = 0; i2 < keys.length; i2++) {
              key = keys[i2];
              value = obj[key];
              match = internalSearchCheck(searchTerm, key, value, seen, depth + 1);
              if (match) {
                break;
              }
            }
            return match;
          }
          function internalSearchArray(array, searchTerm, seen, depth) {
            if (depth > SEARCH_MAX_DEPTH) {
              return false;
            }
            let match = false;
            let value;
            for (let i2 = 0; i2 < array.length; i2++) {
              value = array[i2];
              match = internalSearchCheck(searchTerm, null, value, seen, depth + 1);
              if (match) {
                break;
              }
            }
            return match;
          }
          function internalSearchCheck(searchTerm, key, value, seen, depth) {
            let match = false;
            let result;
            if (key === "_custom") {
              key = value.display;
              value = value.value;
            }
            (result = specialTokenToString(value)) && (value = result);
            if (key && compare(key, searchTerm)) {
              match = true;
              seen.set(value, true);
            } else if (seen.has(value)) {
              match = seen.get(value);
            } else if (Array.isArray(value)) {
              seen.set(value, null);
              match = internalSearchArray(value, searchTerm, seen, depth);
              seen.set(value, match);
            } else if (isPlainObject(value)) {
              seen.set(value, null);
              match = internalSearchObject(value, searchTerm, seen, depth);
              seen.set(value, match);
            } else if (compare(value, searchTerm)) {
              match = true;
              seen.set(value, true);
            }
            return match;
          }
          function compare(value, searchTerm) {
            return ("" + value).toLowerCase().indexOf(searchTerm) !== -1;
          }
          function sortByKey(state) {
            return state && state.slice().sort((a2, b2) => {
              if (a2.key < b2.key)
                return -1;
              if (a2.key > b2.key)
                return 1;
              return 0;
            });
          }
          exports.sortByKey = sortByKey;
          function simpleGet(object, path) {
            const sections = Array.isArray(path) ? path : path.split(".");
            for (let i2 = 0; i2 < sections.length; i2++) {
              object = object[sections[i2]];
              if (!object) {
                return void 0;
              }
            }
            return object;
          }
          exports.simpleGet = simpleGet;
          function focusInput(el) {
            el.focus();
            el.setSelectionRange(0, el.value.length);
          }
          exports.focusInput = focusInput;
          function openInEditor(file) {
            const fileName = file.replace(/\\/g, "\\\\");
            const src = `fetch('${shared_data_1.SharedData.openInEditorHost}__open-in-editor?file=${encodeURI(file)}').then(response => {
    if (response.ok) {
      console.log('File ${fileName} opened in editor')
    } else {
      const msg = 'Opening component ${fileName} failed'
      const target = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {}
      if (target.__VUE_DEVTOOLS_TOAST__) {
        target.__VUE_DEVTOOLS_TOAST__(msg, 'error')
      } else {
        console.log('%c' + msg, 'color:red')
      }
      console.log('Check the setup of your project, see https://devtools.vuejs.org/guide/open-in-editor.html')
    }
  })`;
            if (env_1.isChrome) {
              env_1.target.chrome.devtools.inspectedWindow.eval(src);
            } else {
              [eval][0](src);
            }
          }
          exports.openInEditor = openInEditor;
          const ESC = {
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "&": "&amp;"
          };
          function escape2(s2) {
            return s2.replace(/[<>"&]/g, escapeChar);
          }
          exports.escape = escape2;
          function escapeChar(a2) {
            return ESC[a2] || a2;
          }
          function copyToClipboard(state) {
            let text;
            if (typeof state !== "object") {
              text = String(state);
            } else {
              text = stringify(state, "user");
            }
            if (typeof document === "undefined")
              return;
            const dummyTextArea = document.createElement("textarea");
            dummyTextArea.textContent = text;
            document.body.appendChild(dummyTextArea);
            dummyTextArea.select();
            document.execCommand("copy");
            document.body.removeChild(dummyTextArea);
          }
          exports.copyToClipboard = copyToClipboard;
          function isEmptyObject(obj) {
            return obj === exports.UNDEFINED || !obj || Object.keys(obj).length === 0;
          }
          exports.isEmptyObject = isEmptyObject;
        }
      ),
      /***/
      "../../node_modules/events/events.js": (
        /*!*******************************************!*\
          !*** ../../node_modules/events/events.js ***!
          \*******************************************/
        /***/
        (module) => {
          var R2 = typeof Reflect === "object" ? Reflect : null;
          var ReflectApply = R2 && typeof R2.apply === "function" ? R2.apply : function ReflectApply2(target, receiver, args) {
            return Function.prototype.apply.call(target, receiver, args);
          };
          var ReflectOwnKeys;
          if (R2 && typeof R2.ownKeys === "function") {
            ReflectOwnKeys = R2.ownKeys;
          } else if (Object.getOwnPropertySymbols) {
            ReflectOwnKeys = function ReflectOwnKeys2(target) {
              return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
            };
          } else {
            ReflectOwnKeys = function ReflectOwnKeys2(target) {
              return Object.getOwnPropertyNames(target);
            };
          }
          function ProcessEmitWarning(warning) {
            if (console && console.warn)
              console.warn(warning);
          }
          var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
            return value !== value;
          };
          function EventEmitter() {
            EventEmitter.init.call(this);
          }
          module.exports = EventEmitter;
          module.exports.once = once;
          EventEmitter.EventEmitter = EventEmitter;
          EventEmitter.prototype._events = void 0;
          EventEmitter.prototype._eventsCount = 0;
          EventEmitter.prototype._maxListeners = void 0;
          var defaultMaxListeners = 10;
          function checkListener(listener) {
            if (typeof listener !== "function") {
              throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
            }
          }
          Object.defineProperty(EventEmitter, "defaultMaxListeners", {
            enumerable: true,
            get: function() {
              return defaultMaxListeners;
            },
            set: function(arg) {
              if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
                throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
              }
              defaultMaxListeners = arg;
            }
          });
          EventEmitter.init = function() {
            if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
              this._events = /* @__PURE__ */ Object.create(null);
              this._eventsCount = 0;
            }
            this._maxListeners = this._maxListeners || void 0;
          };
          EventEmitter.prototype.setMaxListeners = function setMaxListeners(n2) {
            if (typeof n2 !== "number" || n2 < 0 || NumberIsNaN(n2)) {
              throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n2 + ".");
            }
            this._maxListeners = n2;
            return this;
          };
          function _getMaxListeners(that) {
            if (that._maxListeners === void 0)
              return EventEmitter.defaultMaxListeners;
            return that._maxListeners;
          }
          EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
            return _getMaxListeners(this);
          };
          EventEmitter.prototype.emit = function emit(type) {
            var args = [];
            for (var i2 = 1; i2 < arguments.length; i2++)
              args.push(arguments[i2]);
            var doError = type === "error";
            var events = this._events;
            if (events !== void 0)
              doError = doError && events.error === void 0;
            else if (!doError)
              return false;
            if (doError) {
              var er;
              if (args.length > 0)
                er = args[0];
              if (er instanceof Error) {
                throw er;
              }
              var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
              err.context = er;
              throw err;
            }
            var handler = events[type];
            if (handler === void 0)
              return false;
            if (typeof handler === "function") {
              ReflectApply(handler, this, args);
            } else {
              var len = handler.length;
              var listeners = arrayClone(handler, len);
              for (var i2 = 0; i2 < len; ++i2)
                ReflectApply(listeners[i2], this, args);
            }
            return true;
          };
          function _addListener(target, type, listener, prepend) {
            var m2;
            var events;
            var existing;
            checkListener(listener);
            events = target._events;
            if (events === void 0) {
              events = target._events = /* @__PURE__ */ Object.create(null);
              target._eventsCount = 0;
            } else {
              if (events.newListener !== void 0) {
                target.emit(
                  "newListener",
                  type,
                  listener.listener ? listener.listener : listener
                );
                events = target._events;
              }
              existing = events[type];
            }
            if (existing === void 0) {
              existing = events[type] = listener;
              ++target._eventsCount;
            } else {
              if (typeof existing === "function") {
                existing = events[type] = prepend ? [listener, existing] : [existing, listener];
              } else if (prepend) {
                existing.unshift(listener);
              } else {
                existing.push(listener);
              }
              m2 = _getMaxListeners(target);
              if (m2 > 0 && existing.length > m2 && !existing.warned) {
                existing.warned = true;
                var w2 = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
                w2.name = "MaxListenersExceededWarning";
                w2.emitter = target;
                w2.type = type;
                w2.count = existing.length;
                ProcessEmitWarning(w2);
              }
            }
            return target;
          }
          EventEmitter.prototype.addListener = function addListener(type, listener) {
            return _addListener(this, type, listener, false);
          };
          EventEmitter.prototype.on = EventEmitter.prototype.addListener;
          EventEmitter.prototype.prependListener = function prependListener(type, listener) {
            return _addListener(this, type, listener, true);
          };
          function onceWrapper() {
            if (!this.fired) {
              this.target.removeListener(this.type, this.wrapFn);
              this.fired = true;
              if (arguments.length === 0)
                return this.listener.call(this.target);
              return this.listener.apply(this.target, arguments);
            }
          }
          function _onceWrap(target, type, listener) {
            var state = { fired: false, wrapFn: void 0, target, type, listener };
            var wrapped = onceWrapper.bind(state);
            wrapped.listener = listener;
            state.wrapFn = wrapped;
            return wrapped;
          }
          EventEmitter.prototype.once = function once2(type, listener) {
            checkListener(listener);
            this.on(type, _onceWrap(this, type, listener));
            return this;
          };
          EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
            checkListener(listener);
            this.prependListener(type, _onceWrap(this, type, listener));
            return this;
          };
          EventEmitter.prototype.removeListener = function removeListener(type, listener) {
            var list, events, position, i2, originalListener;
            checkListener(listener);
            events = this._events;
            if (events === void 0)
              return this;
            list = events[type];
            if (list === void 0)
              return this;
            if (list === listener || list.listener === listener) {
              if (--this._eventsCount === 0)
                this._events = /* @__PURE__ */ Object.create(null);
              else {
                delete events[type];
                if (events.removeListener)
                  this.emit("removeListener", type, list.listener || listener);
              }
            } else if (typeof list !== "function") {
              position = -1;
              for (i2 = list.length - 1; i2 >= 0; i2--) {
                if (list[i2] === listener || list[i2].listener === listener) {
                  originalListener = list[i2].listener;
                  position = i2;
                  break;
                }
              }
              if (position < 0)
                return this;
              if (position === 0)
                list.shift();
              else {
                spliceOne(list, position);
              }
              if (list.length === 1)
                events[type] = list[0];
              if (events.removeListener !== void 0)
                this.emit("removeListener", type, originalListener || listener);
            }
            return this;
          };
          EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
          EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
            var listeners, events, i2;
            events = this._events;
            if (events === void 0)
              return this;
            if (events.removeListener === void 0) {
              if (arguments.length === 0) {
                this._events = /* @__PURE__ */ Object.create(null);
                this._eventsCount = 0;
              } else if (events[type] !== void 0) {
                if (--this._eventsCount === 0)
                  this._events = /* @__PURE__ */ Object.create(null);
                else
                  delete events[type];
              }
              return this;
            }
            if (arguments.length === 0) {
              var keys = Object.keys(events);
              var key;
              for (i2 = 0; i2 < keys.length; ++i2) {
                key = keys[i2];
                if (key === "removeListener")
                  continue;
                this.removeAllListeners(key);
              }
              this.removeAllListeners("removeListener");
              this._events = /* @__PURE__ */ Object.create(null);
              this._eventsCount = 0;
              return this;
            }
            listeners = events[type];
            if (typeof listeners === "function") {
              this.removeListener(type, listeners);
            } else if (listeners !== void 0) {
              for (i2 = listeners.length - 1; i2 >= 0; i2--) {
                this.removeListener(type, listeners[i2]);
              }
            }
            return this;
          };
          function _listeners(target, type, unwrap) {
            var events = target._events;
            if (events === void 0)
              return [];
            var evlistener = events[type];
            if (evlistener === void 0)
              return [];
            if (typeof evlistener === "function")
              return unwrap ? [evlistener.listener || evlistener] : [evlistener];
            return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
          }
          EventEmitter.prototype.listeners = function listeners(type) {
            return _listeners(this, type, true);
          };
          EventEmitter.prototype.rawListeners = function rawListeners(type) {
            return _listeners(this, type, false);
          };
          EventEmitter.listenerCount = function(emitter, type) {
            if (typeof emitter.listenerCount === "function") {
              return emitter.listenerCount(type);
            } else {
              return listenerCount.call(emitter, type);
            }
          };
          EventEmitter.prototype.listenerCount = listenerCount;
          function listenerCount(type) {
            var events = this._events;
            if (events !== void 0) {
              var evlistener = events[type];
              if (typeof evlistener === "function") {
                return 1;
              } else if (evlistener !== void 0) {
                return evlistener.length;
              }
            }
            return 0;
          }
          EventEmitter.prototype.eventNames = function eventNames() {
            return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
          };
          function arrayClone(arr, n2) {
            var copy = new Array(n2);
            for (var i2 = 0; i2 < n2; ++i2)
              copy[i2] = arr[i2];
            return copy;
          }
          function spliceOne(list, index) {
            for (; index + 1 < list.length; index++)
              list[index] = list[index + 1];
            list.pop();
          }
          function unwrapListeners(arr) {
            var ret = new Array(arr.length);
            for (var i2 = 0; i2 < ret.length; ++i2) {
              ret[i2] = arr[i2].listener || arr[i2];
            }
            return ret;
          }
          function once(emitter, name) {
            return new Promise(function(resolve, reject) {
              function errorListener(err) {
                emitter.removeListener(name, resolver);
                reject(err);
              }
              function resolver() {
                if (typeof emitter.removeListener === "function") {
                  emitter.removeListener("error", errorListener);
                }
                resolve([].slice.call(arguments));
              }
              eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
              if (name !== "error") {
                addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
              }
            });
          }
          function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
            if (typeof emitter.on === "function") {
              eventTargetAgnosticAddListener(emitter, "error", handler, flags);
            }
          }
          function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
            if (typeof emitter.on === "function") {
              if (flags.once) {
                emitter.once(name, listener);
              } else {
                emitter.on(name, listener);
              }
            } else if (typeof emitter.addEventListener === "function") {
              emitter.addEventListener(name, function wrapListener(arg) {
                if (flags.once) {
                  emitter.removeEventListener(name, wrapListener);
                }
                listener(arg);
              });
            } else {
              throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
            }
          }
        }
      ),
      /***/
      "../../node_modules/lodash/_Symbol.js": (
        /*!********************************************!*\
          !*** ../../node_modules/lodash/_Symbol.js ***!
          \********************************************/
        /***/
        (module, __unused_webpack_exports, __webpack_require__2) => {
          var root = __webpack_require__2(
            /*! ./_root */
            "../../node_modules/lodash/_root.js"
          );
          var Symbol2 = root.Symbol;
          module.exports = Symbol2;
        }
      ),
      /***/
      "../../node_modules/lodash/_baseGetTag.js": (
        /*!************************************************!*\
          !*** ../../node_modules/lodash/_baseGetTag.js ***!
          \************************************************/
        /***/
        (module, __unused_webpack_exports, __webpack_require__2) => {
          var Symbol2 = __webpack_require__2(
            /*! ./_Symbol */
            "../../node_modules/lodash/_Symbol.js"
          ), getRawTag = __webpack_require__2(
            /*! ./_getRawTag */
            "../../node_modules/lodash/_getRawTag.js"
          ), objectToString = __webpack_require__2(
            /*! ./_objectToString */
            "../../node_modules/lodash/_objectToString.js"
          );
          var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
          var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
          function baseGetTag(value) {
            if (value == null) {
              return value === void 0 ? undefinedTag : nullTag;
            }
            return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
          }
          module.exports = baseGetTag;
        }
      ),
      /***/
      "../../node_modules/lodash/_baseTrim.js": (
        /*!**********************************************!*\
          !*** ../../node_modules/lodash/_baseTrim.js ***!
          \**********************************************/
        /***/
        (module, __unused_webpack_exports, __webpack_require__2) => {
          var trimmedEndIndex = __webpack_require__2(
            /*! ./_trimmedEndIndex */
            "../../node_modules/lodash/_trimmedEndIndex.js"
          );
          var reTrimStart = /^\s+/;
          function baseTrim(string) {
            return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
          }
          module.exports = baseTrim;
        }
      ),
      /***/
      "../../node_modules/lodash/_freeGlobal.js": (
        /*!************************************************!*\
          !*** ../../node_modules/lodash/_freeGlobal.js ***!
          \************************************************/
        /***/
        (module, __unused_webpack_exports, __webpack_require__2) => {
          var freeGlobal = typeof __webpack_require__2.g == "object" && __webpack_require__2.g && __webpack_require__2.g.Object === Object && __webpack_require__2.g;
          module.exports = freeGlobal;
        }
      ),
      /***/
      "../../node_modules/lodash/_getRawTag.js": (
        /*!***********************************************!*\
          !*** ../../node_modules/lodash/_getRawTag.js ***!
          \***********************************************/
        /***/
        (module, __unused_webpack_exports, __webpack_require__2) => {
          var Symbol2 = __webpack_require__2(
            /*! ./_Symbol */
            "../../node_modules/lodash/_Symbol.js"
          );
          var objectProto = Object.prototype;
          var hasOwnProperty2 = objectProto.hasOwnProperty;
          var nativeObjectToString = objectProto.toString;
          var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
          function getRawTag(value) {
            var isOwn = hasOwnProperty2.call(value, symToStringTag), tag = value[symToStringTag];
            try {
              value[symToStringTag] = void 0;
              var unmasked = true;
            } catch (e) {
            }
            var result = nativeObjectToString.call(value);
            if (unmasked) {
              if (isOwn) {
                value[symToStringTag] = tag;
              } else {
                delete value[symToStringTag];
              }
            }
            return result;
          }
          module.exports = getRawTag;
        }
      ),
      /***/
      "../../node_modules/lodash/_objectToString.js": (
        /*!****************************************************!*\
          !*** ../../node_modules/lodash/_objectToString.js ***!
          \****************************************************/
        /***/
        (module) => {
          var objectProto = Object.prototype;
          var nativeObjectToString = objectProto.toString;
          function objectToString(value) {
            return nativeObjectToString.call(value);
          }
          module.exports = objectToString;
        }
      ),
      /***/
      "../../node_modules/lodash/_root.js": (
        /*!******************************************!*\
          !*** ../../node_modules/lodash/_root.js ***!
          \******************************************/
        /***/
        (module, __unused_webpack_exports, __webpack_require__2) => {
          var freeGlobal = __webpack_require__2(
            /*! ./_freeGlobal */
            "../../node_modules/lodash/_freeGlobal.js"
          );
          var freeSelf = typeof self == "object" && self && self.Object === Object && self;
          var root = freeGlobal || freeSelf || Function("return this")();
          module.exports = root;
        }
      ),
      /***/
      "../../node_modules/lodash/_trimmedEndIndex.js": (
        /*!*****************************************************!*\
          !*** ../../node_modules/lodash/_trimmedEndIndex.js ***!
          \*****************************************************/
        /***/
        (module) => {
          var reWhitespace = /\s/;
          function trimmedEndIndex(string) {
            var index = string.length;
            while (index-- && reWhitespace.test(string.charAt(index))) {
            }
            return index;
          }
          module.exports = trimmedEndIndex;
        }
      ),
      /***/
      "../../node_modules/lodash/debounce.js": (
        /*!*********************************************!*\
          !*** ../../node_modules/lodash/debounce.js ***!
          \*********************************************/
        /***/
        (module, __unused_webpack_exports, __webpack_require__2) => {
          var isObject2 = __webpack_require__2(
            /*! ./isObject */
            "../../node_modules/lodash/isObject.js"
          ), now = __webpack_require__2(
            /*! ./now */
            "../../node_modules/lodash/now.js"
          ), toNumber = __webpack_require__2(
            /*! ./toNumber */
            "../../node_modules/lodash/toNumber.js"
          );
          var FUNC_ERROR_TEXT = "Expected a function";
          var nativeMax = Math.max, nativeMin = Math.min;
          function debounce(func, wait, options) {
            var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
            if (typeof func != "function") {
              throw new TypeError(FUNC_ERROR_TEXT);
            }
            wait = toNumber(wait) || 0;
            if (isObject2(options)) {
              leading = !!options.leading;
              maxing = "maxWait" in options;
              maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
              trailing = "trailing" in options ? !!options.trailing : trailing;
            }
            function invokeFunc(time) {
              var args = lastArgs, thisArg = lastThis;
              lastArgs = lastThis = void 0;
              lastInvokeTime = time;
              result = func.apply(thisArg, args);
              return result;
            }
            function leadingEdge(time) {
              lastInvokeTime = time;
              timerId = setTimeout(timerExpired, wait);
              return leading ? invokeFunc(time) : result;
            }
            function remainingWait(time) {
              var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
              return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
            }
            function shouldInvoke(time) {
              var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
              return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
            }
            function timerExpired() {
              var time = now();
              if (shouldInvoke(time)) {
                return trailingEdge(time);
              }
              timerId = setTimeout(timerExpired, remainingWait(time));
            }
            function trailingEdge(time) {
              timerId = void 0;
              if (trailing && lastArgs) {
                return invokeFunc(time);
              }
              lastArgs = lastThis = void 0;
              return result;
            }
            function cancel() {
              if (timerId !== void 0) {
                clearTimeout(timerId);
              }
              lastInvokeTime = 0;
              lastArgs = lastCallTime = lastThis = timerId = void 0;
            }
            function flush() {
              return timerId === void 0 ? result : trailingEdge(now());
            }
            function debounced() {
              var time = now(), isInvoking = shouldInvoke(time);
              lastArgs = arguments;
              lastThis = this;
              lastCallTime = time;
              if (isInvoking) {
                if (timerId === void 0) {
                  return leadingEdge(lastCallTime);
                }
                if (maxing) {
                  clearTimeout(timerId);
                  timerId = setTimeout(timerExpired, wait);
                  return invokeFunc(lastCallTime);
                }
              }
              if (timerId === void 0) {
                timerId = setTimeout(timerExpired, wait);
              }
              return result;
            }
            debounced.cancel = cancel;
            debounced.flush = flush;
            return debounced;
          }
          module.exports = debounce;
        }
      ),
      /***/
      "../../node_modules/lodash/isObject.js": (
        /*!*********************************************!*\
          !*** ../../node_modules/lodash/isObject.js ***!
          \*********************************************/
        /***/
        (module) => {
          function isObject2(value) {
            var type = typeof value;
            return value != null && (type == "object" || type == "function");
          }
          module.exports = isObject2;
        }
      ),
      /***/
      "../../node_modules/lodash/isObjectLike.js": (
        /*!*************************************************!*\
          !*** ../../node_modules/lodash/isObjectLike.js ***!
          \*************************************************/
        /***/
        (module) => {
          function isObjectLike(value) {
            return value != null && typeof value == "object";
          }
          module.exports = isObjectLike;
        }
      ),
      /***/
      "../../node_modules/lodash/isSymbol.js": (
        /*!*********************************************!*\
          !*** ../../node_modules/lodash/isSymbol.js ***!
          \*********************************************/
        /***/
        (module, __unused_webpack_exports, __webpack_require__2) => {
          var baseGetTag = __webpack_require__2(
            /*! ./_baseGetTag */
            "../../node_modules/lodash/_baseGetTag.js"
          ), isObjectLike = __webpack_require__2(
            /*! ./isObjectLike */
            "../../node_modules/lodash/isObjectLike.js"
          );
          var symbolTag = "[object Symbol]";
          function isSymbol(value) {
            return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
          }
          module.exports = isSymbol;
        }
      ),
      /***/
      "../../node_modules/lodash/now.js": (
        /*!****************************************!*\
          !*** ../../node_modules/lodash/now.js ***!
          \****************************************/
        /***/
        (module, __unused_webpack_exports, __webpack_require__2) => {
          var root = __webpack_require__2(
            /*! ./_root */
            "../../node_modules/lodash/_root.js"
          );
          var now = function() {
            return root.Date.now();
          };
          module.exports = now;
        }
      ),
      /***/
      "../../node_modules/lodash/throttle.js": (
        /*!*********************************************!*\
          !*** ../../node_modules/lodash/throttle.js ***!
          \*********************************************/
        /***/
        (module, __unused_webpack_exports, __webpack_require__2) => {
          var debounce = __webpack_require__2(
            /*! ./debounce */
            "../../node_modules/lodash/debounce.js"
          ), isObject2 = __webpack_require__2(
            /*! ./isObject */
            "../../node_modules/lodash/isObject.js"
          );
          var FUNC_ERROR_TEXT = "Expected a function";
          function throttle(func, wait, options) {
            var leading = true, trailing = true;
            if (typeof func != "function") {
              throw new TypeError(FUNC_ERROR_TEXT);
            }
            if (isObject2(options)) {
              leading = "leading" in options ? !!options.leading : leading;
              trailing = "trailing" in options ? !!options.trailing : trailing;
            }
            return debounce(func, wait, {
              "leading": leading,
              "maxWait": wait,
              "trailing": trailing
            });
          }
          module.exports = throttle;
        }
      ),
      /***/
      "../../node_modules/lodash/toNumber.js": (
        /*!*********************************************!*\
          !*** ../../node_modules/lodash/toNumber.js ***!
          \*********************************************/
        /***/
        (module, __unused_webpack_exports, __webpack_require__2) => {
          var baseTrim = __webpack_require__2(
            /*! ./_baseTrim */
            "../../node_modules/lodash/_baseTrim.js"
          ), isObject2 = __webpack_require__2(
            /*! ./isObject */
            "../../node_modules/lodash/isObject.js"
          ), isSymbol = __webpack_require__2(
            /*! ./isSymbol */
            "../../node_modules/lodash/isSymbol.js"
          );
          var NAN = 0 / 0;
          var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
          var reIsBinary = /^0b[01]+$/i;
          var reIsOctal = /^0o[0-7]+$/i;
          var freeParseInt = parseInt;
          function toNumber(value) {
            if (typeof value == "number") {
              return value;
            }
            if (isSymbol(value)) {
              return NAN;
            }
            if (isObject2(value)) {
              var other = typeof value.valueOf == "function" ? value.valueOf() : value;
              value = isObject2(other) ? other + "" : other;
            }
            if (typeof value != "string") {
              return value === 0 ? value : +value;
            }
            value = baseTrim(value);
            var isBinary = reIsBinary.test(value);
            return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
          }
          module.exports = toNumber;
        }
      ),
      /***/
      "../../node_modules/path-browserify/index.js": (
        /*!***************************************************!*\
          !*** ../../node_modules/path-browserify/index.js ***!
          \***************************************************/
        /***/
        (module) => {
          function assertPath(path) {
            if (typeof path !== "string") {
              throw new TypeError("Path must be a string. Received " + JSON.stringify(path));
            }
          }
          function normalizeStringPosix(path, allowAboveRoot) {
            var res = "";
            var lastSegmentLength = 0;
            var lastSlash = -1;
            var dots = 0;
            var code;
            for (var i2 = 0; i2 <= path.length; ++i2) {
              if (i2 < path.length)
                code = path.charCodeAt(i2);
              else if (code === 47)
                break;
              else
                code = 47;
              if (code === 47) {
                if (lastSlash === i2 - 1 || dots === 1)
                  ;
                else if (lastSlash !== i2 - 1 && dots === 2) {
                  if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                      var lastSlashIndex = res.lastIndexOf("/");
                      if (lastSlashIndex !== res.length - 1) {
                        if (lastSlashIndex === -1) {
                          res = "";
                          lastSegmentLength = 0;
                        } else {
                          res = res.slice(0, lastSlashIndex);
                          lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
                        }
                        lastSlash = i2;
                        dots = 0;
                        continue;
                      }
                    } else if (res.length === 2 || res.length === 1) {
                      res = "";
                      lastSegmentLength = 0;
                      lastSlash = i2;
                      dots = 0;
                      continue;
                    }
                  }
                  if (allowAboveRoot) {
                    if (res.length > 0)
                      res += "/..";
                    else
                      res = "..";
                    lastSegmentLength = 2;
                  }
                } else {
                  if (res.length > 0)
                    res += "/" + path.slice(lastSlash + 1, i2);
                  else
                    res = path.slice(lastSlash + 1, i2);
                  lastSegmentLength = i2 - lastSlash - 1;
                }
                lastSlash = i2;
                dots = 0;
              } else if (code === 46 && dots !== -1) {
                ++dots;
              } else {
                dots = -1;
              }
            }
            return res;
          }
          function _format(sep, pathObject) {
            var dir = pathObject.dir || pathObject.root;
            var base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
            if (!dir) {
              return base;
            }
            if (dir === pathObject.root) {
              return dir + base;
            }
            return dir + sep + base;
          }
          var posix = {
            // path.resolve([from ...], to)
            resolve: function resolve() {
              var resolvedPath = "";
              var resolvedAbsolute = false;
              var cwd;
              for (var i2 = arguments.length - 1; i2 >= -1 && !resolvedAbsolute; i2--) {
                var path;
                if (i2 >= 0)
                  path = arguments[i2];
                else {
                  if (cwd === void 0)
                    cwd = process.cwd();
                  path = cwd;
                }
                assertPath(path);
                if (path.length === 0) {
                  continue;
                }
                resolvedPath = path + "/" + resolvedPath;
                resolvedAbsolute = path.charCodeAt(0) === 47;
              }
              resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
              if (resolvedAbsolute) {
                if (resolvedPath.length > 0)
                  return "/" + resolvedPath;
                else
                  return "/";
              } else if (resolvedPath.length > 0) {
                return resolvedPath;
              } else {
                return ".";
              }
            },
            normalize: function normalize(path) {
              assertPath(path);
              if (path.length === 0)
                return ".";
              var isAbsolute = path.charCodeAt(0) === 47;
              var trailingSeparator = path.charCodeAt(path.length - 1) === 47;
              path = normalizeStringPosix(path, !isAbsolute);
              if (path.length === 0 && !isAbsolute)
                path = ".";
              if (path.length > 0 && trailingSeparator)
                path += "/";
              if (isAbsolute)
                return "/" + path;
              return path;
            },
            isAbsolute: function isAbsolute(path) {
              assertPath(path);
              return path.length > 0 && path.charCodeAt(0) === 47;
            },
            join: function join() {
              if (arguments.length === 0)
                return ".";
              var joined;
              for (var i2 = 0; i2 < arguments.length; ++i2) {
                var arg = arguments[i2];
                assertPath(arg);
                if (arg.length > 0) {
                  if (joined === void 0)
                    joined = arg;
                  else
                    joined += "/" + arg;
                }
              }
              if (joined === void 0)
                return ".";
              return posix.normalize(joined);
            },
            relative: function relative(from, to) {
              assertPath(from);
              assertPath(to);
              if (from === to)
                return "";
              from = posix.resolve(from);
              to = posix.resolve(to);
              if (from === to)
                return "";
              var fromStart = 1;
              for (; fromStart < from.length; ++fromStart) {
                if (from.charCodeAt(fromStart) !== 47)
                  break;
              }
              var fromEnd = from.length;
              var fromLen = fromEnd - fromStart;
              var toStart = 1;
              for (; toStart < to.length; ++toStart) {
                if (to.charCodeAt(toStart) !== 47)
                  break;
              }
              var toEnd = to.length;
              var toLen = toEnd - toStart;
              var length = fromLen < toLen ? fromLen : toLen;
              var lastCommonSep = -1;
              var i2 = 0;
              for (; i2 <= length; ++i2) {
                if (i2 === length) {
                  if (toLen > length) {
                    if (to.charCodeAt(toStart + i2) === 47) {
                      return to.slice(toStart + i2 + 1);
                    } else if (i2 === 0) {
                      return to.slice(toStart + i2);
                    }
                  } else if (fromLen > length) {
                    if (from.charCodeAt(fromStart + i2) === 47) {
                      lastCommonSep = i2;
                    } else if (i2 === 0) {
                      lastCommonSep = 0;
                    }
                  }
                  break;
                }
                var fromCode = from.charCodeAt(fromStart + i2);
                var toCode = to.charCodeAt(toStart + i2);
                if (fromCode !== toCode)
                  break;
                else if (fromCode === 47)
                  lastCommonSep = i2;
              }
              var out = "";
              for (i2 = fromStart + lastCommonSep + 1; i2 <= fromEnd; ++i2) {
                if (i2 === fromEnd || from.charCodeAt(i2) === 47) {
                  if (out.length === 0)
                    out += "..";
                  else
                    out += "/..";
                }
              }
              if (out.length > 0)
                return out + to.slice(toStart + lastCommonSep);
              else {
                toStart += lastCommonSep;
                if (to.charCodeAt(toStart) === 47)
                  ++toStart;
                return to.slice(toStart);
              }
            },
            _makeLong: function _makeLong(path) {
              return path;
            },
            dirname: function dirname(path) {
              assertPath(path);
              if (path.length === 0)
                return ".";
              var code = path.charCodeAt(0);
              var hasRoot = code === 47;
              var end = -1;
              var matchedSlash = true;
              for (var i2 = path.length - 1; i2 >= 1; --i2) {
                code = path.charCodeAt(i2);
                if (code === 47) {
                  if (!matchedSlash) {
                    end = i2;
                    break;
                  }
                } else {
                  matchedSlash = false;
                }
              }
              if (end === -1)
                return hasRoot ? "/" : ".";
              if (hasRoot && end === 1)
                return "//";
              return path.slice(0, end);
            },
            basename: function basename(path, ext) {
              if (ext !== void 0 && typeof ext !== "string")
                throw new TypeError('"ext" argument must be a string');
              assertPath(path);
              var start = 0;
              var end = -1;
              var matchedSlash = true;
              var i2;
              if (ext !== void 0 && ext.length > 0 && ext.length <= path.length) {
                if (ext.length === path.length && ext === path)
                  return "";
                var extIdx = ext.length - 1;
                var firstNonSlashEnd = -1;
                for (i2 = path.length - 1; i2 >= 0; --i2) {
                  var code = path.charCodeAt(i2);
                  if (code === 47) {
                    if (!matchedSlash) {
                      start = i2 + 1;
                      break;
                    }
                  } else {
                    if (firstNonSlashEnd === -1) {
                      matchedSlash = false;
                      firstNonSlashEnd = i2 + 1;
                    }
                    if (extIdx >= 0) {
                      if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                          end = i2;
                        }
                      } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                      }
                    }
                  }
                }
                if (start === end)
                  end = firstNonSlashEnd;
                else if (end === -1)
                  end = path.length;
                return path.slice(start, end);
              } else {
                for (i2 = path.length - 1; i2 >= 0; --i2) {
                  if (path.charCodeAt(i2) === 47) {
                    if (!matchedSlash) {
                      start = i2 + 1;
                      break;
                    }
                  } else if (end === -1) {
                    matchedSlash = false;
                    end = i2 + 1;
                  }
                }
                if (end === -1)
                  return "";
                return path.slice(start, end);
              }
            },
            extname: function extname(path) {
              assertPath(path);
              var startDot = -1;
              var startPart = 0;
              var end = -1;
              var matchedSlash = true;
              var preDotState = 0;
              for (var i2 = path.length - 1; i2 >= 0; --i2) {
                var code = path.charCodeAt(i2);
                if (code === 47) {
                  if (!matchedSlash) {
                    startPart = i2 + 1;
                    break;
                  }
                  continue;
                }
                if (end === -1) {
                  matchedSlash = false;
                  end = i2 + 1;
                }
                if (code === 46) {
                  if (startDot === -1)
                    startDot = i2;
                  else if (preDotState !== 1)
                    preDotState = 1;
                } else if (startDot !== -1) {
                  preDotState = -1;
                }
              }
              if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
              preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
              preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
                return "";
              }
              return path.slice(startDot, end);
            },
            format: function format(pathObject) {
              if (pathObject === null || typeof pathObject !== "object") {
                throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
              }
              return _format("/", pathObject);
            },
            parse: function parse2(path) {
              assertPath(path);
              var ret = { root: "", dir: "", base: "", ext: "", name: "" };
              if (path.length === 0)
                return ret;
              var code = path.charCodeAt(0);
              var isAbsolute = code === 47;
              var start;
              if (isAbsolute) {
                ret.root = "/";
                start = 1;
              } else {
                start = 0;
              }
              var startDot = -1;
              var startPart = 0;
              var end = -1;
              var matchedSlash = true;
              var i2 = path.length - 1;
              var preDotState = 0;
              for (; i2 >= start; --i2) {
                code = path.charCodeAt(i2);
                if (code === 47) {
                  if (!matchedSlash) {
                    startPart = i2 + 1;
                    break;
                  }
                  continue;
                }
                if (end === -1) {
                  matchedSlash = false;
                  end = i2 + 1;
                }
                if (code === 46) {
                  if (startDot === -1)
                    startDot = i2;
                  else if (preDotState !== 1)
                    preDotState = 1;
                } else if (startDot !== -1) {
                  preDotState = -1;
                }
              }
              if (startDot === -1 || end === -1 || // We saw a non-dot character immediately before the dot
              preDotState === 0 || // The (right-most) trimmed path component is exactly '..'
              preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
                if (end !== -1) {
                  if (startPart === 0 && isAbsolute)
                    ret.base = ret.name = path.slice(1, end);
                  else
                    ret.base = ret.name = path.slice(startPart, end);
                }
              } else {
                if (startPart === 0 && isAbsolute) {
                  ret.name = path.slice(1, startDot);
                  ret.base = path.slice(1, end);
                } else {
                  ret.name = path.slice(startPart, startDot);
                  ret.base = path.slice(startPart, end);
                }
                ret.ext = path.slice(startDot, end);
              }
              if (startPart > 0)
                ret.dir = path.slice(0, startPart - 1);
              else if (isAbsolute)
                ret.dir = "/";
              return ret;
            },
            sep: "/",
            delimiter: ":",
            win32: null,
            posix: null
          };
          posix.posix = posix;
          module.exports = posix;
        }
      ),
      /***/
      "../../node_modules/speakingurl/index.js": (
        /*!***********************************************!*\
          !*** ../../node_modules/speakingurl/index.js ***!
          \***********************************************/
        /***/
        (module, __unused_webpack_exports, __webpack_require__2) => {
          module.exports = __webpack_require__2(
            /*! ./lib/speakingurl */
            "../../node_modules/speakingurl/lib/speakingurl.js"
          );
        }
      ),
      /***/
      "../../node_modules/speakingurl/lib/speakingurl.js": (
        /*!*********************************************************!*\
          !*** ../../node_modules/speakingurl/lib/speakingurl.js ***!
          \*********************************************************/
        /***/
        function(module, exports) {
          var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
          (function(root) {
            var charMap = {
              // latin
              "À": "A",
              "Á": "A",
              "Â": "A",
              "Ã": "A",
              "Ä": "Ae",
              "Å": "A",
              "Æ": "AE",
              "Ç": "C",
              "È": "E",
              "É": "E",
              "Ê": "E",
              "Ë": "E",
              "Ì": "I",
              "Í": "I",
              "Î": "I",
              "Ï": "I",
              "Ð": "D",
              "Ñ": "N",
              "Ò": "O",
              "Ó": "O",
              "Ô": "O",
              "Õ": "O",
              "Ö": "Oe",
              "Ő": "O",
              "Ø": "O",
              "Ù": "U",
              "Ú": "U",
              "Û": "U",
              "Ü": "Ue",
              "Ű": "U",
              "Ý": "Y",
              "Þ": "TH",
              "ß": "ss",
              "à": "a",
              "á": "a",
              "â": "a",
              "ã": "a",
              "ä": "ae",
              "å": "a",
              "æ": "ae",
              "ç": "c",
              "è": "e",
              "é": "e",
              "ê": "e",
              "ë": "e",
              "ì": "i",
              "í": "i",
              "î": "i",
              "ï": "i",
              "ð": "d",
              "ñ": "n",
              "ò": "o",
              "ó": "o",
              "ô": "o",
              "õ": "o",
              "ö": "oe",
              "ő": "o",
              "ø": "o",
              "ù": "u",
              "ú": "u",
              "û": "u",
              "ü": "ue",
              "ű": "u",
              "ý": "y",
              "þ": "th",
              "ÿ": "y",
              "ẞ": "SS",
              // language specific
              // Arabic
              "ا": "a",
              "أ": "a",
              "إ": "i",
              "آ": "aa",
              "ؤ": "u",
              "ئ": "e",
              "ء": "a",
              "ب": "b",
              "ت": "t",
              "ث": "th",
              "ج": "j",
              "ح": "h",
              "خ": "kh",
              "د": "d",
              "ذ": "th",
              "ر": "r",
              "ز": "z",
              "س": "s",
              "ش": "sh",
              "ص": "s",
              "ض": "dh",
              "ط": "t",
              "ظ": "z",
              "ع": "a",
              "غ": "gh",
              "ف": "f",
              "ق": "q",
              "ك": "k",
              "ل": "l",
              "م": "m",
              "ن": "n",
              "ه": "h",
              "و": "w",
              "ي": "y",
              "ى": "a",
              "ة": "h",
              "ﻻ": "la",
              "ﻷ": "laa",
              "ﻹ": "lai",
              "ﻵ": "laa",
              // Persian additional characters than Arabic
              "گ": "g",
              "چ": "ch",
              "پ": "p",
              "ژ": "zh",
              "ک": "k",
              "ی": "y",
              // Arabic diactrics
              "َ": "a",
              "ً": "an",
              "ِ": "e",
              "ٍ": "en",
              "ُ": "u",
              "ٌ": "on",
              "ْ": "",
              // Arabic numbers
              "٠": "0",
              "١": "1",
              "٢": "2",
              "٣": "3",
              "٤": "4",
              "٥": "5",
              "٦": "6",
              "٧": "7",
              "٨": "8",
              "٩": "9",
              // Persian numbers
              "۰": "0",
              "۱": "1",
              "۲": "2",
              "۳": "3",
              "۴": "4",
              "۵": "5",
              "۶": "6",
              "۷": "7",
              "۸": "8",
              "۹": "9",
              // Burmese consonants
              "က": "k",
              "ခ": "kh",
              "ဂ": "g",
              "ဃ": "ga",
              "င": "ng",
              "စ": "s",
              "ဆ": "sa",
              "ဇ": "z",
              "စျ": "za",
              "ည": "ny",
              "ဋ": "t",
              "ဌ": "ta",
              "ဍ": "d",
              "ဎ": "da",
              "ဏ": "na",
              "တ": "t",
              "ထ": "ta",
              "ဒ": "d",
              "ဓ": "da",
              "န": "n",
              "ပ": "p",
              "ဖ": "pa",
              "ဗ": "b",
              "ဘ": "ba",
              "မ": "m",
              "ယ": "y",
              "ရ": "ya",
              "လ": "l",
              "ဝ": "w",
              "သ": "th",
              "ဟ": "h",
              "ဠ": "la",
              "အ": "a",
              // consonant character combos
              "ြ": "y",
              "ျ": "ya",
              "ွ": "w",
              "ြွ": "yw",
              "ျွ": "ywa",
              "ှ": "h",
              // independent vowels
              "ဧ": "e",
              "၏": "-e",
              "ဣ": "i",
              "ဤ": "-i",
              "ဉ": "u",
              "ဦ": "-u",
              "ဩ": "aw",
              "သြော": "aw",
              "ဪ": "aw",
              // numbers
              "၀": "0",
              "၁": "1",
              "၂": "2",
              "၃": "3",
              "၄": "4",
              "၅": "5",
              "၆": "6",
              "၇": "7",
              "၈": "8",
              "၉": "9",
              // virama and tone marks which are silent in transliteration
              "္": "",
              "့": "",
              "း": "",
              // Czech
              "č": "c",
              "ď": "d",
              "ě": "e",
              "ň": "n",
              "ř": "r",
              "š": "s",
              "ť": "t",
              "ů": "u",
              "ž": "z",
              "Č": "C",
              "Ď": "D",
              "Ě": "E",
              "Ň": "N",
              "Ř": "R",
              "Š": "S",
              "Ť": "T",
              "Ů": "U",
              "Ž": "Z",
              // Dhivehi
              "ހ": "h",
              "ށ": "sh",
              "ނ": "n",
              "ރ": "r",
              "ބ": "b",
              "ޅ": "lh",
              "ކ": "k",
              "އ": "a",
              "ވ": "v",
              "މ": "m",
              "ފ": "f",
              "ދ": "dh",
              "ތ": "th",
              "ލ": "l",
              "ގ": "g",
              "ޏ": "gn",
              "ސ": "s",
              "ޑ": "d",
              "ޒ": "z",
              "ޓ": "t",
              "ޔ": "y",
              "ޕ": "p",
              "ޖ": "j",
              "ޗ": "ch",
              "ޘ": "tt",
              "ޙ": "hh",
              "ޚ": "kh",
              "ޛ": "th",
              "ޜ": "z",
              "ޝ": "sh",
              "ޞ": "s",
              "ޟ": "d",
              "ޠ": "t",
              "ޡ": "z",
              "ޢ": "a",
              "ޣ": "gh",
              "ޤ": "q",
              "ޥ": "w",
              "ަ": "a",
              "ާ": "aa",
              "ި": "i",
              "ީ": "ee",
              "ު": "u",
              "ޫ": "oo",
              "ެ": "e",
              "ޭ": "ey",
              "ޮ": "o",
              "ޯ": "oa",
              "ް": "",
              // Georgian https://en.wikipedia.org/wiki/Romanization_of_Georgian
              // National system (2002)
              "ა": "a",
              "ბ": "b",
              "გ": "g",
              "დ": "d",
              "ე": "e",
              "ვ": "v",
              "ზ": "z",
              "თ": "t",
              "ი": "i",
              "კ": "k",
              "ლ": "l",
              "მ": "m",
              "ნ": "n",
              "ო": "o",
              "პ": "p",
              "ჟ": "zh",
              "რ": "r",
              "ს": "s",
              "ტ": "t",
              "უ": "u",
              "ფ": "p",
              "ქ": "k",
              "ღ": "gh",
              "ყ": "q",
              "შ": "sh",
              "ჩ": "ch",
              "ც": "ts",
              "ძ": "dz",
              "წ": "ts",
              "ჭ": "ch",
              "ხ": "kh",
              "ჯ": "j",
              "ჰ": "h",
              // Greek
              "α": "a",
              "β": "v",
              "γ": "g",
              "δ": "d",
              "ε": "e",
              "ζ": "z",
              "η": "i",
              "θ": "th",
              "ι": "i",
              "κ": "k",
              "λ": "l",
              "μ": "m",
              "ν": "n",
              "ξ": "ks",
              "ο": "o",
              "π": "p",
              "ρ": "r",
              "σ": "s",
              "τ": "t",
              "υ": "y",
              "φ": "f",
              "χ": "x",
              "ψ": "ps",
              "ω": "o",
              "ά": "a",
              "έ": "e",
              "ί": "i",
              "ό": "o",
              "ύ": "y",
              "ή": "i",
              "ώ": "o",
              "ς": "s",
              "ϊ": "i",
              "ΰ": "y",
              "ϋ": "y",
              "ΐ": "i",
              "Α": "A",
              "Β": "B",
              "Γ": "G",
              "Δ": "D",
              "Ε": "E",
              "Ζ": "Z",
              "Η": "I",
              "Θ": "TH",
              "Ι": "I",
              "Κ": "K",
              "Λ": "L",
              "Μ": "M",
              "Ν": "N",
              "Ξ": "KS",
              "Ο": "O",
              "Π": "P",
              "Ρ": "R",
              "Σ": "S",
              "Τ": "T",
              "Υ": "Y",
              "Φ": "F",
              "Χ": "X",
              "Ψ": "PS",
              "Ω": "O",
              "Ά": "A",
              "Έ": "E",
              "Ί": "I",
              "Ό": "O",
              "Ύ": "Y",
              "Ή": "I",
              "Ώ": "O",
              "Ϊ": "I",
              "Ϋ": "Y",
              // Latvian
              "ā": "a",
              // 'č': 'c', // duplicate
              "ē": "e",
              "ģ": "g",
              "ī": "i",
              "ķ": "k",
              "ļ": "l",
              "ņ": "n",
              // 'š': 's', // duplicate
              "ū": "u",
              // 'ž': 'z', // duplicate
              "Ā": "A",
              // 'Č': 'C', // duplicate
              "Ē": "E",
              "Ģ": "G",
              "Ī": "I",
              "Ķ": "k",
              "Ļ": "L",
              "Ņ": "N",
              // 'Š': 'S', // duplicate
              "Ū": "U",
              // 'Ž': 'Z', // duplicate
              // Macedonian
              "Ќ": "Kj",
              "ќ": "kj",
              "Љ": "Lj",
              "љ": "lj",
              "Њ": "Nj",
              "њ": "nj",
              "Тс": "Ts",
              "тс": "ts",
              // Polish
              "ą": "a",
              "ć": "c",
              "ę": "e",
              "ł": "l",
              "ń": "n",
              // 'ó': 'o', // duplicate
              "ś": "s",
              "ź": "z",
              "ż": "z",
              "Ą": "A",
              "Ć": "C",
              "Ę": "E",
              "Ł": "L",
              "Ń": "N",
              "Ś": "S",
              "Ź": "Z",
              "Ż": "Z",
              // Ukranian
              "Є": "Ye",
              "І": "I",
              "Ї": "Yi",
              "Ґ": "G",
              "є": "ye",
              "і": "i",
              "ї": "yi",
              "ґ": "g",
              // Romanian
              "ă": "a",
              "Ă": "A",
              "ș": "s",
              "Ș": "S",
              // 'ş': 's', // duplicate
              // 'Ş': 'S', // duplicate
              "ț": "t",
              "Ț": "T",
              "ţ": "t",
              "Ţ": "T",
              // Russian https://en.wikipedia.org/wiki/Romanization_of_Russian
              // ICAO
              "а": "a",
              "б": "b",
              "в": "v",
              "г": "g",
              "д": "d",
              "е": "e",
              "ё": "yo",
              "ж": "zh",
              "з": "z",
              "и": "i",
              "й": "i",
              "к": "k",
              "л": "l",
              "м": "m",
              "н": "n",
              "о": "o",
              "п": "p",
              "р": "r",
              "с": "s",
              "т": "t",
              "у": "u",
              "ф": "f",
              "х": "kh",
              "ц": "c",
              "ч": "ch",
              "ш": "sh",
              "щ": "sh",
              "ъ": "",
              "ы": "y",
              "ь": "",
              "э": "e",
              "ю": "yu",
              "я": "ya",
              "А": "A",
              "Б": "B",
              "В": "V",
              "Г": "G",
              "Д": "D",
              "Е": "E",
              "Ё": "Yo",
              "Ж": "Zh",
              "З": "Z",
              "И": "I",
              "Й": "I",
              "К": "K",
              "Л": "L",
              "М": "M",
              "Н": "N",
              "О": "O",
              "П": "P",
              "Р": "R",
              "С": "S",
              "Т": "T",
              "У": "U",
              "Ф": "F",
              "Х": "Kh",
              "Ц": "C",
              "Ч": "Ch",
              "Ш": "Sh",
              "Щ": "Sh",
              "Ъ": "",
              "Ы": "Y",
              "Ь": "",
              "Э": "E",
              "Ю": "Yu",
              "Я": "Ya",
              // Serbian
              "ђ": "dj",
              "ј": "j",
              // 'љ': 'lj',  // duplicate
              // 'њ': 'nj', // duplicate
              "ћ": "c",
              "џ": "dz",
              "Ђ": "Dj",
              "Ј": "j",
              // 'Љ': 'Lj', // duplicate
              // 'Њ': 'Nj', // duplicate
              "Ћ": "C",
              "Џ": "Dz",
              // Slovak
              "ľ": "l",
              "ĺ": "l",
              "ŕ": "r",
              "Ľ": "L",
              "Ĺ": "L",
              "Ŕ": "R",
              // Turkish
              "ş": "s",
              "Ş": "S",
              "ı": "i",
              "İ": "I",
              // 'ç': 'c', // duplicate
              // 'Ç': 'C', // duplicate
              // 'ü': 'u', // duplicate, see langCharMap
              // 'Ü': 'U', // duplicate, see langCharMap
              // 'ö': 'o', // duplicate, see langCharMap
              // 'Ö': 'O', // duplicate, see langCharMap
              "ğ": "g",
              "Ğ": "G",
              // Vietnamese
              "ả": "a",
              "Ả": "A",
              "ẳ": "a",
              "Ẳ": "A",
              "ẩ": "a",
              "Ẩ": "A",
              "đ": "d",
              "Đ": "D",
              "ẹ": "e",
              "Ẹ": "E",
              "ẽ": "e",
              "Ẽ": "E",
              "ẻ": "e",
              "Ẻ": "E",
              "ế": "e",
              "Ế": "E",
              "ề": "e",
              "Ề": "E",
              "ệ": "e",
              "Ệ": "E",
              "ễ": "e",
              "Ễ": "E",
              "ể": "e",
              "Ể": "E",
              "ỏ": "o",
              "ọ": "o",
              "Ọ": "o",
              "ố": "o",
              "Ố": "O",
              "ồ": "o",
              "Ồ": "O",
              "ổ": "o",
              "Ổ": "O",
              "ộ": "o",
              "Ộ": "O",
              "ỗ": "o",
              "Ỗ": "O",
              "ơ": "o",
              "Ơ": "O",
              "ớ": "o",
              "Ớ": "O",
              "ờ": "o",
              "Ờ": "O",
              "ợ": "o",
              "Ợ": "O",
              "ỡ": "o",
              "Ỡ": "O",
              "Ở": "o",
              "ở": "o",
              "ị": "i",
              "Ị": "I",
              "ĩ": "i",
              "Ĩ": "I",
              "ỉ": "i",
              "Ỉ": "i",
              "ủ": "u",
              "Ủ": "U",
              "ụ": "u",
              "Ụ": "U",
              "ũ": "u",
              "Ũ": "U",
              "ư": "u",
              "Ư": "U",
              "ứ": "u",
              "Ứ": "U",
              "ừ": "u",
              "Ừ": "U",
              "ự": "u",
              "Ự": "U",
              "ữ": "u",
              "Ữ": "U",
              "ử": "u",
              "Ử": "ư",
              "ỷ": "y",
              "Ỷ": "y",
              "ỳ": "y",
              "Ỳ": "Y",
              "ỵ": "y",
              "Ỵ": "Y",
              "ỹ": "y",
              "Ỹ": "Y",
              "ạ": "a",
              "Ạ": "A",
              "ấ": "a",
              "Ấ": "A",
              "ầ": "a",
              "Ầ": "A",
              "ậ": "a",
              "Ậ": "A",
              "ẫ": "a",
              "Ẫ": "A",
              // 'ă': 'a', // duplicate
              // 'Ă': 'A', // duplicate
              "ắ": "a",
              "Ắ": "A",
              "ằ": "a",
              "Ằ": "A",
              "ặ": "a",
              "Ặ": "A",
              "ẵ": "a",
              "Ẵ": "A",
              "⓪": "0",
              "①": "1",
              "②": "2",
              "③": "3",
              "④": "4",
              "⑤": "5",
              "⑥": "6",
              "⑦": "7",
              "⑧": "8",
              "⑨": "9",
              "⑩": "10",
              "⑪": "11",
              "⑫": "12",
              "⑬": "13",
              "⑭": "14",
              "⑮": "15",
              "⑯": "16",
              "⑰": "17",
              "⑱": "18",
              "⑲": "18",
              "⑳": "18",
              "⓵": "1",
              "⓶": "2",
              "⓷": "3",
              "⓸": "4",
              "⓹": "5",
              "⓺": "6",
              "⓻": "7",
              "⓼": "8",
              "⓽": "9",
              "⓾": "10",
              "⓿": "0",
              "⓫": "11",
              "⓬": "12",
              "⓭": "13",
              "⓮": "14",
              "⓯": "15",
              "⓰": "16",
              "⓱": "17",
              "⓲": "18",
              "⓳": "19",
              "⓴": "20",
              "Ⓐ": "A",
              "Ⓑ": "B",
              "Ⓒ": "C",
              "Ⓓ": "D",
              "Ⓔ": "E",
              "Ⓕ": "F",
              "Ⓖ": "G",
              "Ⓗ": "H",
              "Ⓘ": "I",
              "Ⓙ": "J",
              "Ⓚ": "K",
              "Ⓛ": "L",
              "Ⓜ": "M",
              "Ⓝ": "N",
              "Ⓞ": "O",
              "Ⓟ": "P",
              "Ⓠ": "Q",
              "Ⓡ": "R",
              "Ⓢ": "S",
              "Ⓣ": "T",
              "Ⓤ": "U",
              "Ⓥ": "V",
              "Ⓦ": "W",
              "Ⓧ": "X",
              "Ⓨ": "Y",
              "Ⓩ": "Z",
              "ⓐ": "a",
              "ⓑ": "b",
              "ⓒ": "c",
              "ⓓ": "d",
              "ⓔ": "e",
              "ⓕ": "f",
              "ⓖ": "g",
              "ⓗ": "h",
              "ⓘ": "i",
              "ⓙ": "j",
              "ⓚ": "k",
              "ⓛ": "l",
              "ⓜ": "m",
              "ⓝ": "n",
              "ⓞ": "o",
              "ⓟ": "p",
              "ⓠ": "q",
              "ⓡ": "r",
              "ⓢ": "s",
              "ⓣ": "t",
              "ⓤ": "u",
              "ⓦ": "v",
              "ⓥ": "w",
              "ⓧ": "x",
              "ⓨ": "y",
              "ⓩ": "z",
              // symbols
              "“": '"',
              "”": '"',
              "‘": "'",
              "’": "'",
              "∂": "d",
              "ƒ": "f",
              "™": "(TM)",
              "©": "(C)",
              "œ": "oe",
              "Œ": "OE",
              "®": "(R)",
              "†": "+",
              "℠": "(SM)",
              "…": "...",
              "˚": "o",
              "º": "o",
              "ª": "a",
              "•": "*",
              "၊": ",",
              "။": ".",
              // currency
              "$": "USD",
              "€": "EUR",
              "₢": "BRN",
              "₣": "FRF",
              "£": "GBP",
              "₤": "ITL",
              "₦": "NGN",
              "₧": "ESP",
              "₩": "KRW",
              "₪": "ILS",
              "₫": "VND",
              "₭": "LAK",
              "₮": "MNT",
              "₯": "GRD",
              "₱": "ARS",
              "₲": "PYG",
              "₳": "ARA",
              "₴": "UAH",
              "₵": "GHS",
              "¢": "cent",
              "¥": "CNY",
              "元": "CNY",
              "円": "YEN",
              "﷼": "IRR",
              "₠": "EWE",
              "฿": "THB",
              "₨": "INR",
              "₹": "INR",
              "₰": "PF",
              "₺": "TRY",
              "؋": "AFN",
              "₼": "AZN",
              "лв": "BGN",
              "៛": "KHR",
              "₡": "CRC",
              "₸": "KZT",
              "ден": "MKD",
              "zł": "PLN",
              "₽": "RUB",
              "₾": "GEL"
            };
            var lookAheadCharArray = [
              // burmese
              "်",
              // Dhivehi
              "ް"
            ];
            var diatricMap = {
              // Burmese
              // dependent vowels
              "ာ": "a",
              "ါ": "a",
              "ေ": "e",
              "ဲ": "e",
              "ိ": "i",
              "ီ": "i",
              "ို": "o",
              "ု": "u",
              "ူ": "u",
              "ေါင်": "aung",
              "ော": "aw",
              "ော်": "aw",
              "ေါ": "aw",
              "ေါ်": "aw",
              "်": "်",
              // this is special case but the character will be converted to latin in the code
              "က်": "et",
              "ိုက်": "aik",
              "ောက်": "auk",
              "င်": "in",
              "ိုင်": "aing",
              "ောင်": "aung",
              "စ်": "it",
              "ည်": "i",
              "တ်": "at",
              "ိတ်": "eik",
              "ုတ်": "ok",
              "ွတ်": "ut",
              "ေတ်": "it",
              "ဒ်": "d",
              "ိုဒ်": "ok",
              "ုဒ်": "ait",
              "န်": "an",
              "ာန်": "an",
              "ိန်": "ein",
              "ုန်": "on",
              "ွန်": "un",
              "ပ်": "at",
              "ိပ်": "eik",
              "ုပ်": "ok",
              "ွပ်": "ut",
              "န်ုပ်": "nub",
              "မ်": "an",
              "ိမ်": "ein",
              "ုမ်": "on",
              "ွမ်": "un",
              "ယ်": "e",
              "ိုလ်": "ol",
              "ဉ်": "in",
              "ံ": "an",
              "ိံ": "ein",
              "ုံ": "on",
              // Dhivehi
              "ައް": "ah",
              "ަށް": "ah"
            };
            var langCharMap = {
              "en": {},
              // default language
              "az": {
                // Azerbaijani
                "ç": "c",
                "ə": "e",
                "ğ": "g",
                "ı": "i",
                "ö": "o",
                "ş": "s",
                "ü": "u",
                "Ç": "C",
                "Ə": "E",
                "Ğ": "G",
                "İ": "I",
                "Ö": "O",
                "Ş": "S",
                "Ü": "U"
              },
              "cs": {
                // Czech
                "č": "c",
                "ď": "d",
                "ě": "e",
                "ň": "n",
                "ř": "r",
                "š": "s",
                "ť": "t",
                "ů": "u",
                "ž": "z",
                "Č": "C",
                "Ď": "D",
                "Ě": "E",
                "Ň": "N",
                "Ř": "R",
                "Š": "S",
                "Ť": "T",
                "Ů": "U",
                "Ž": "Z"
              },
              "fi": {
                // Finnish
                // 'å': 'a', duplicate see charMap/latin
                // 'Å': 'A', duplicate see charMap/latin
                "ä": "a",
                // ok
                "Ä": "A",
                // ok
                "ö": "o",
                // ok
                "Ö": "O"
                // ok
              },
              "hu": {
                // Hungarian
                "ä": "a",
                // ok
                "Ä": "A",
                // ok
                // 'á': 'a', duplicate see charMap/latin
                // 'Á': 'A', duplicate see charMap/latin
                "ö": "o",
                // ok
                "Ö": "O",
                // ok
                // 'ő': 'o', duplicate see charMap/latin
                // 'Ő': 'O', duplicate see charMap/latin
                "ü": "u",
                "Ü": "U",
                "ű": "u",
                "Ű": "U"
              },
              "lt": {
                // Lithuanian
                "ą": "a",
                "č": "c",
                "ę": "e",
                "ė": "e",
                "į": "i",
                "š": "s",
                "ų": "u",
                "ū": "u",
                "ž": "z",
                "Ą": "A",
                "Č": "C",
                "Ę": "E",
                "Ė": "E",
                "Į": "I",
                "Š": "S",
                "Ų": "U",
                "Ū": "U"
              },
              "lv": {
                // Latvian
                "ā": "a",
                "č": "c",
                "ē": "e",
                "ģ": "g",
                "ī": "i",
                "ķ": "k",
                "ļ": "l",
                "ņ": "n",
                "š": "s",
                "ū": "u",
                "ž": "z",
                "Ā": "A",
                "Č": "C",
                "Ē": "E",
                "Ģ": "G",
                "Ī": "i",
                "Ķ": "k",
                "Ļ": "L",
                "Ņ": "N",
                "Š": "S",
                "Ū": "u",
                "Ž": "Z"
              },
              "pl": {
                // Polish
                "ą": "a",
                "ć": "c",
                "ę": "e",
                "ł": "l",
                "ń": "n",
                "ó": "o",
                "ś": "s",
                "ź": "z",
                "ż": "z",
                "Ą": "A",
                "Ć": "C",
                "Ę": "e",
                "Ł": "L",
                "Ń": "N",
                "Ó": "O",
                "Ś": "S",
                "Ź": "Z",
                "Ż": "Z"
              },
              "sv": {
                // Swedish
                // 'å': 'a', duplicate see charMap/latin
                // 'Å': 'A', duplicate see charMap/latin
                "ä": "a",
                // ok
                "Ä": "A",
                // ok
                "ö": "o",
                // ok
                "Ö": "O"
                // ok
              },
              "sk": {
                // Slovak
                "ä": "a",
                "Ä": "A"
              },
              "sr": {
                // Serbian
                "љ": "lj",
                "њ": "nj",
                "Љ": "Lj",
                "Њ": "Nj",
                "đ": "dj",
                "Đ": "Dj"
              },
              "tr": {
                // Turkish
                "Ü": "U",
                "Ö": "O",
                "ü": "u",
                "ö": "o"
              }
            };
            var symbolMap = {
              "ar": {
                "∆": "delta",
                "∞": "la-nihaya",
                "♥": "hob",
                "&": "wa",
                "|": "aw",
                "<": "aqal-men",
                ">": "akbar-men",
                "∑": "majmou",
                "¤": "omla"
              },
              "az": {},
              "ca": {
                "∆": "delta",
                "∞": "infinit",
                "♥": "amor",
                "&": "i",
                "|": "o",
                "<": "menys que",
                ">": "mes que",
                "∑": "suma dels",
                "¤": "moneda"
              },
              "cs": {
                "∆": "delta",
                "∞": "nekonecno",
                "♥": "laska",
                "&": "a",
                "|": "nebo",
                "<": "mensi nez",
                ">": "vetsi nez",
                "∑": "soucet",
                "¤": "mena"
              },
              "de": {
                "∆": "delta",
                "∞": "unendlich",
                "♥": "Liebe",
                "&": "und",
                "|": "oder",
                "<": "kleiner als",
                ">": "groesser als",
                "∑": "Summe von",
                "¤": "Waehrung"
              },
              "dv": {
                "∆": "delta",
                "∞": "kolunulaa",
                "♥": "loabi",
                "&": "aai",
                "|": "noonee",
                "<": "ah vure kuda",
                ">": "ah vure bodu",
                "∑": "jumula",
                "¤": "faisaa"
              },
              "en": {
                "∆": "delta",
                "∞": "infinity",
                "♥": "love",
                "&": "and",
                "|": "or",
                "<": "less than",
                ">": "greater than",
                "∑": "sum",
                "¤": "currency"
              },
              "es": {
                "∆": "delta",
                "∞": "infinito",
                "♥": "amor",
                "&": "y",
                "|": "u",
                "<": "menos que",
                ">": "mas que",
                "∑": "suma de los",
                "¤": "moneda"
              },
              "fa": {
                "∆": "delta",
                "∞": "bi-nahayat",
                "♥": "eshgh",
                "&": "va",
                "|": "ya",
                "<": "kamtar-az",
                ">": "bishtar-az",
                "∑": "majmooe",
                "¤": "vahed"
              },
              "fi": {
                "∆": "delta",
                "∞": "aarettomyys",
                "♥": "rakkaus",
                "&": "ja",
                "|": "tai",
                "<": "pienempi kuin",
                ">": "suurempi kuin",
                "∑": "summa",
                "¤": "valuutta"
              },
              "fr": {
                "∆": "delta",
                "∞": "infiniment",
                "♥": "Amour",
                "&": "et",
                "|": "ou",
                "<": "moins que",
                ">": "superieure a",
                "∑": "somme des",
                "¤": "monnaie"
              },
              "ge": {
                "∆": "delta",
                "∞": "usasruloba",
                "♥": "siqvaruli",
                "&": "da",
                "|": "an",
                "<": "naklebi",
                ">": "meti",
                "∑": "jami",
                "¤": "valuta"
              },
              "gr": {},
              "hu": {
                "∆": "delta",
                "∞": "vegtelen",
                "♥": "szerelem",
                "&": "es",
                "|": "vagy",
                "<": "kisebb mint",
                ">": "nagyobb mint",
                "∑": "szumma",
                "¤": "penznem"
              },
              "it": {
                "∆": "delta",
                "∞": "infinito",
                "♥": "amore",
                "&": "e",
                "|": "o",
                "<": "minore di",
                ">": "maggiore di",
                "∑": "somma",
                "¤": "moneta"
              },
              "lt": {
                "∆": "delta",
                "∞": "begalybe",
                "♥": "meile",
                "&": "ir",
                "|": "ar",
                "<": "maziau nei",
                ">": "daugiau nei",
                "∑": "suma",
                "¤": "valiuta"
              },
              "lv": {
                "∆": "delta",
                "∞": "bezgaliba",
                "♥": "milestiba",
                "&": "un",
                "|": "vai",
                "<": "mazak neka",
                ">": "lielaks neka",
                "∑": "summa",
                "¤": "valuta"
              },
              "my": {
                "∆": "kwahkhyaet",
                "∞": "asaonasme",
                "♥": "akhyait",
                "&": "nhin",
                "|": "tho",
                "<": "ngethaw",
                ">": "kyithaw",
                "∑": "paungld",
                "¤": "ngwekye"
              },
              "mk": {},
              "nl": {
                "∆": "delta",
                "∞": "oneindig",
                "♥": "liefde",
                "&": "en",
                "|": "of",
                "<": "kleiner dan",
                ">": "groter dan",
                "∑": "som",
                "¤": "valuta"
              },
              "pl": {
                "∆": "delta",
                "∞": "nieskonczonosc",
                "♥": "milosc",
                "&": "i",
                "|": "lub",
                "<": "mniejsze niz",
                ">": "wieksze niz",
                "∑": "suma",
                "¤": "waluta"
              },
              "pt": {
                "∆": "delta",
                "∞": "infinito",
                "♥": "amor",
                "&": "e",
                "|": "ou",
                "<": "menor que",
                ">": "maior que",
                "∑": "soma",
                "¤": "moeda"
              },
              "ro": {
                "∆": "delta",
                "∞": "infinit",
                "♥": "dragoste",
                "&": "si",
                "|": "sau",
                "<": "mai mic ca",
                ">": "mai mare ca",
                "∑": "suma",
                "¤": "valuta"
              },
              "ru": {
                "∆": "delta",
                "∞": "beskonechno",
                "♥": "lubov",
                "&": "i",
                "|": "ili",
                "<": "menshe",
                ">": "bolshe",
                "∑": "summa",
                "¤": "valjuta"
              },
              "sk": {
                "∆": "delta",
                "∞": "nekonecno",
                "♥": "laska",
                "&": "a",
                "|": "alebo",
                "<": "menej ako",
                ">": "viac ako",
                "∑": "sucet",
                "¤": "mena"
              },
              "sr": {},
              "tr": {
                "∆": "delta",
                "∞": "sonsuzluk",
                "♥": "ask",
                "&": "ve",
                "|": "veya",
                "<": "kucuktur",
                ">": "buyuktur",
                "∑": "toplam",
                "¤": "para birimi"
              },
              "uk": {
                "∆": "delta",
                "∞": "bezkinechnist",
                "♥": "lubov",
                "&": "i",
                "|": "abo",
                "<": "menshe",
                ">": "bilshe",
                "∑": "suma",
                "¤": "valjuta"
              },
              "vn": {
                "∆": "delta",
                "∞": "vo cuc",
                "♥": "yeu",
                "&": "va",
                "|": "hoac",
                "<": "nho hon",
                ">": "lon hon",
                "∑": "tong",
                "¤": "tien te"
              }
            };
            var uricChars = [";", "?", ":", "@", "&", "=", "+", "$", ",", "/"].join("");
            var uricNoSlashChars = [";", "?", ":", "@", "&", "=", "+", "$", ","].join("");
            var markChars = [".", "!", "~", "*", "'", "(", ")"].join("");
            var getSlug = function getSlug2(input, opts) {
              var separator = "-";
              var result = "";
              var diatricString = "";
              var convertSymbols = true;
              var customReplacements = {};
              var maintainCase;
              var titleCase;
              var truncate;
              var uricFlag;
              var uricNoSlashFlag;
              var markFlag;
              var symbol;
              var langChar;
              var lucky;
              var i2;
              var ch;
              var l2;
              var lastCharWasSymbol;
              var lastCharWasDiatric;
              var allowedChars = "";
              if (typeof input !== "string") {
                return "";
              }
              if (typeof opts === "string") {
                separator = opts;
              }
              symbol = symbolMap.en;
              langChar = langCharMap.en;
              if (typeof opts === "object") {
                maintainCase = opts.maintainCase || false;
                customReplacements = opts.custom && typeof opts.custom === "object" ? opts.custom : customReplacements;
                truncate = +opts.truncate > 1 && opts.truncate || false;
                uricFlag = opts.uric || false;
                uricNoSlashFlag = opts.uricNoSlash || false;
                markFlag = opts.mark || false;
                convertSymbols = opts.symbols === false || opts.lang === false ? false : true;
                separator = opts.separator || separator;
                if (uricFlag) {
                  allowedChars += uricChars;
                }
                if (uricNoSlashFlag) {
                  allowedChars += uricNoSlashChars;
                }
                if (markFlag) {
                  allowedChars += markChars;
                }
                symbol = opts.lang && symbolMap[opts.lang] && convertSymbols ? symbolMap[opts.lang] : convertSymbols ? symbolMap.en : {};
                langChar = opts.lang && langCharMap[opts.lang] ? langCharMap[opts.lang] : opts.lang === false || opts.lang === true ? {} : langCharMap.en;
                if (opts.titleCase && typeof opts.titleCase.length === "number" && Array.prototype.toString.call(opts.titleCase)) {
                  opts.titleCase.forEach(function(v2) {
                    customReplacements[v2 + ""] = v2 + "";
                  });
                  titleCase = true;
                } else {
                  titleCase = !!opts.titleCase;
                }
                if (opts.custom && typeof opts.custom.length === "number" && Array.prototype.toString.call(opts.custom)) {
                  opts.custom.forEach(function(v2) {
                    customReplacements[v2 + ""] = v2 + "";
                  });
                }
                Object.keys(customReplacements).forEach(function(v2) {
                  var r2;
                  if (v2.length > 1) {
                    r2 = new RegExp("\\b" + escapeChars(v2) + "\\b", "gi");
                  } else {
                    r2 = new RegExp(escapeChars(v2), "gi");
                  }
                  input = input.replace(r2, customReplacements[v2]);
                });
                for (ch in customReplacements) {
                  allowedChars += ch;
                }
              }
              allowedChars += separator;
              allowedChars = escapeChars(allowedChars);
              input = input.replace(/(^\s+|\s+$)/g, "");
              lastCharWasSymbol = false;
              lastCharWasDiatric = false;
              for (i2 = 0, l2 = input.length; i2 < l2; i2++) {
                ch = input[i2];
                if (isReplacedCustomChar(ch, customReplacements)) {
                  lastCharWasSymbol = false;
                } else if (langChar[ch]) {
                  ch = lastCharWasSymbol && langChar[ch].match(/[A-Za-z0-9]/) ? " " + langChar[ch] : langChar[ch];
                  lastCharWasSymbol = false;
                } else if (ch in charMap) {
                  if (i2 + 1 < l2 && lookAheadCharArray.indexOf(input[i2 + 1]) >= 0) {
                    diatricString += ch;
                    ch = "";
                  } else if (lastCharWasDiatric === true) {
                    ch = diatricMap[diatricString] + charMap[ch];
                    diatricString = "";
                  } else {
                    ch = lastCharWasSymbol && charMap[ch].match(/[A-Za-z0-9]/) ? " " + charMap[ch] : charMap[ch];
                  }
                  lastCharWasSymbol = false;
                  lastCharWasDiatric = false;
                } else if (ch in diatricMap) {
                  diatricString += ch;
                  ch = "";
                  if (i2 === l2 - 1) {
                    ch = diatricMap[diatricString];
                  }
                  lastCharWasDiatric = true;
                } else if (
                  // process symbol chars
                  symbol[ch] && !(uricFlag && uricChars.indexOf(ch) !== -1) && !(uricNoSlashFlag && uricNoSlashChars.indexOf(ch) !== -1)
                ) {
                  ch = lastCharWasSymbol || result.substr(-1).match(/[A-Za-z0-9]/) ? separator + symbol[ch] : symbol[ch];
                  ch += input[i2 + 1] !== void 0 && input[i2 + 1].match(/[A-Za-z0-9]/) ? separator : "";
                  lastCharWasSymbol = true;
                } else {
                  if (lastCharWasDiatric === true) {
                    ch = diatricMap[diatricString] + ch;
                    diatricString = "";
                    lastCharWasDiatric = false;
                  } else if (lastCharWasSymbol && (/[A-Za-z0-9]/.test(ch) || result.substr(-1).match(/A-Za-z0-9]/))) {
                    ch = " " + ch;
                  }
                  lastCharWasSymbol = false;
                }
                result += ch.replace(new RegExp("[^\\w\\s" + allowedChars + "_-]", "g"), separator);
              }
              if (titleCase) {
                result = result.replace(/(\w)(\S*)/g, function(_2, i3, r2) {
                  var j2 = i3.toUpperCase() + (r2 !== null ? r2 : "");
                  return Object.keys(customReplacements).indexOf(j2.toLowerCase()) < 0 ? j2 : j2.toLowerCase();
                });
              }
              result = result.replace(/\s+/g, separator).replace(new RegExp("\\" + separator + "+", "g"), separator).replace(new RegExp("(^\\" + separator + "+|\\" + separator + "+$)", "g"), "");
              if (truncate && result.length > truncate) {
                lucky = result.charAt(truncate) === separator;
                result = result.slice(0, truncate);
                if (!lucky) {
                  result = result.slice(0, result.lastIndexOf(separator));
                }
              }
              if (!maintainCase && !titleCase) {
                result = result.toLowerCase();
              }
              return result;
            };
            var createSlug = function createSlug2(opts) {
              return function getSlugWithConfig(input) {
                return getSlug(input, opts);
              };
            };
            var escapeChars = function escapeChars2(input) {
              return input.replace(/[-\\^$*+?.()|[\]{}\/]/g, "\\$&");
            };
            var isReplacedCustomChar = function(ch, customReplacements) {
              for (var c2 in customReplacements) {
                if (customReplacements[c2] === ch) {
                  return true;
                }
              }
            };
            if (module.exports) {
              module.exports = getSlug;
              module.exports.createSlug = createSlug;
            } else {
              !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
                return getSlug;
              }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== void 0 && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
            }
          })();
        }
      )
      /******/
    };
    var __webpack_module_cache__ = {};
    function __webpack_require__(moduleId) {
      var cachedModule = __webpack_module_cache__[moduleId];
      if (cachedModule !== void 0) {
        return cachedModule.exports;
      }
      var module = __webpack_module_cache__[moduleId] = {
        /******/
        // no module.id needed
        /******/
        // no module.loaded needed
        /******/
        exports: {}
        /******/
      };
      __webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
      return module.exports;
    }
    (() => {
      __webpack_require__.n = (module) => {
        var getter = module && module.__esModule ? (
          /******/
          () => module["default"]
        ) : (
          /******/
          () => module
        );
        __webpack_require__.d(getter, { a: getter });
        return getter;
      };
    })();
    (() => {
      __webpack_require__.d = (exports, definition) => {
        for (var key in definition) {
          if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
          }
        }
      };
    })();
    (() => {
      __webpack_require__.g = function() {
        if (typeof globalThis === "object")
          return globalThis;
        try {
          return this || new Function("return this")();
        } catch (e) {
          if (typeof window === "object")
            return window;
        }
      }();
    })();
    (() => {
      __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    })();
    (() => {
      __webpack_require__.r = (exports) => {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
          Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(exports, "__esModule", { value: true });
      };
    })();
    var __webpack_exports__ = {};
    (() => {
      /*!************************!*\
        !*** ./src/backend.ts ***!
        \************************/
      __webpack_require__.r(__webpack_exports__);
      var _back_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
        /*! @back/index */
        "../app-backend-core/lib/index.js"
      );
      var _vue_devtools_shared_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(
        /*! @vue-devtools/shared-utils */
        "../shared-utils/lib/index.js"
      );
      _vue_devtools_shared_utils__WEBPACK_IMPORTED_MODULE_1__.target.__VUE_DEVTOOLS_ON_SOCKET_READY__(() => {
        const socket = _vue_devtools_shared_utils__WEBPACK_IMPORTED_MODULE_1__.target.__VUE_DEVTOOLS_SOCKET__;
        const connectedMessage = () => {
          if (_vue_devtools_shared_utils__WEBPACK_IMPORTED_MODULE_1__.target.__VUE_DEVTOOLS_TOAST__) {
            _vue_devtools_shared_utils__WEBPACK_IMPORTED_MODULE_1__.target.__VUE_DEVTOOLS_TOAST__("Remote Devtools Connected", "normal");
          }
        };
        const disconnectedMessage = () => {
          if (_vue_devtools_shared_utils__WEBPACK_IMPORTED_MODULE_1__.target.__VUE_DEVTOOLS_TOAST__) {
            _vue_devtools_shared_utils__WEBPACK_IMPORTED_MODULE_1__.target.__VUE_DEVTOOLS_TOAST__("Remote Devtools Disconnected", "error");
          }
        };
        socket.on("connect", () => {
          connectedMessage();
          (0, _back_index__WEBPACK_IMPORTED_MODULE_0__.initBackend)(bridge);
          socket.emit("vue-devtools-init");
        });
        socket.on("disconnect", () => {
          socket.disconnect();
          disconnectedMessage();
        });
        socket.on("vue-devtools-disconnect-backend", () => {
          socket.disconnect();
        });
        const bridge = new _vue_devtools_shared_utils__WEBPACK_IMPORTED_MODULE_1__.Bridge({
          listen(fn) {
            socket.on("vue-message", (data) => fn(data));
          },
          send(data) {
            socket.emit("vue-message", data);
          }
        });
        bridge.on("shutdown", () => {
          socket.disconnect();
          disconnectedMessage();
        });
      });
    })();
  })();
  const ON_SHOW = "onShow";
  const ON_HIDE = "onHide";
  const ON_ERROR = "onError";
  const ON_LOAD = "onLoad";
  const ON_REACH_BOTTOM = "onReachBottom";
  const ON_PULL_DOWN_REFRESH = "onPullDownRefresh";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom2) {
    return shared.isString(component) ? easycom2 : component;
  }
  const createHook = (lifecycle) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onShow = /* @__PURE__ */ createHook(ON_SHOW);
  const onHide = /* @__PURE__ */ createHook(ON_HIDE);
  const onError = /* @__PURE__ */ createHook(ON_ERROR);
  const onLoad = /* @__PURE__ */ createHook(ON_LOAD);
  const onReachBottom = /* @__PURE__ */ createHook(ON_REACH_BOTTOM);
  const onPullDownRefresh = /* @__PURE__ */ createHook(ON_PULL_DOWN_REFRESH);
  const icons = {
    "id": "2852637",
    "name": "uniui图标库",
    "font_family": "uniicons",
    "css_prefix_text": "uniui-",
    "description": "",
    "glyphs": [
      {
        "icon_id": "25027049",
        "name": "yanse",
        "font_class": "color",
        "unicode": "e6cf",
        "unicode_decimal": 59087
      },
      {
        "icon_id": "25027048",
        "name": "wallet",
        "font_class": "wallet",
        "unicode": "e6b1",
        "unicode_decimal": 59057
      },
      {
        "icon_id": "25015720",
        "name": "settings-filled",
        "font_class": "settings-filled",
        "unicode": "e6ce",
        "unicode_decimal": 59086
      },
      {
        "icon_id": "25015434",
        "name": "shimingrenzheng-filled",
        "font_class": "auth-filled",
        "unicode": "e6cc",
        "unicode_decimal": 59084
      },
      {
        "icon_id": "24934246",
        "name": "shop-filled",
        "font_class": "shop-filled",
        "unicode": "e6cd",
        "unicode_decimal": 59085
      },
      {
        "icon_id": "24934159",
        "name": "staff-filled-01",
        "font_class": "staff-filled",
        "unicode": "e6cb",
        "unicode_decimal": 59083
      },
      {
        "icon_id": "24932461",
        "name": "VIP-filled",
        "font_class": "vip-filled",
        "unicode": "e6c6",
        "unicode_decimal": 59078
      },
      {
        "icon_id": "24932462",
        "name": "plus_circle_fill",
        "font_class": "plus-filled",
        "unicode": "e6c7",
        "unicode_decimal": 59079
      },
      {
        "icon_id": "24932463",
        "name": "folder_add-filled",
        "font_class": "folder-add-filled",
        "unicode": "e6c8",
        "unicode_decimal": 59080
      },
      {
        "icon_id": "24932464",
        "name": "yanse-filled",
        "font_class": "color-filled",
        "unicode": "e6c9",
        "unicode_decimal": 59081
      },
      {
        "icon_id": "24932465",
        "name": "tune-filled",
        "font_class": "tune-filled",
        "unicode": "e6ca",
        "unicode_decimal": 59082
      },
      {
        "icon_id": "24932455",
        "name": "a-rilidaka-filled",
        "font_class": "calendar-filled",
        "unicode": "e6c0",
        "unicode_decimal": 59072
      },
      {
        "icon_id": "24932456",
        "name": "notification-filled",
        "font_class": "notification-filled",
        "unicode": "e6c1",
        "unicode_decimal": 59073
      },
      {
        "icon_id": "24932457",
        "name": "wallet-filled",
        "font_class": "wallet-filled",
        "unicode": "e6c2",
        "unicode_decimal": 59074
      },
      {
        "icon_id": "24932458",
        "name": "paihangbang-filled",
        "font_class": "medal-filled",
        "unicode": "e6c3",
        "unicode_decimal": 59075
      },
      {
        "icon_id": "24932459",
        "name": "gift-filled",
        "font_class": "gift-filled",
        "unicode": "e6c4",
        "unicode_decimal": 59076
      },
      {
        "icon_id": "24932460",
        "name": "fire-filled",
        "font_class": "fire-filled",
        "unicode": "e6c5",
        "unicode_decimal": 59077
      },
      {
        "icon_id": "24928001",
        "name": "refreshempty",
        "font_class": "refreshempty",
        "unicode": "e6bf",
        "unicode_decimal": 59071
      },
      {
        "icon_id": "24926853",
        "name": "location-ellipse",
        "font_class": "location-filled",
        "unicode": "e6af",
        "unicode_decimal": 59055
      },
      {
        "icon_id": "24926735",
        "name": "person-filled",
        "font_class": "person-filled",
        "unicode": "e69d",
        "unicode_decimal": 59037
      },
      {
        "icon_id": "24926703",
        "name": "personadd-filled",
        "font_class": "personadd-filled",
        "unicode": "e698",
        "unicode_decimal": 59032
      },
      {
        "icon_id": "24923351",
        "name": "back",
        "font_class": "back",
        "unicode": "e6b9",
        "unicode_decimal": 59065
      },
      {
        "icon_id": "24923352",
        "name": "forward",
        "font_class": "forward",
        "unicode": "e6ba",
        "unicode_decimal": 59066
      },
      {
        "icon_id": "24923353",
        "name": "arrowthinright",
        "font_class": "arrow-right",
        "unicode": "e6bb",
        "unicode_decimal": 59067
      },
      {
        "icon_id": "24923353",
        "name": "arrowthinright",
        "font_class": "arrowthinright",
        "unicode": "e6bb",
        "unicode_decimal": 59067
      },
      {
        "icon_id": "24923354",
        "name": "arrowthinleft",
        "font_class": "arrow-left",
        "unicode": "e6bc",
        "unicode_decimal": 59068
      },
      {
        "icon_id": "24923354",
        "name": "arrowthinleft",
        "font_class": "arrowthinleft",
        "unicode": "e6bc",
        "unicode_decimal": 59068
      },
      {
        "icon_id": "24923355",
        "name": "arrowthinup",
        "font_class": "arrow-up",
        "unicode": "e6bd",
        "unicode_decimal": 59069
      },
      {
        "icon_id": "24923355",
        "name": "arrowthinup",
        "font_class": "arrowthinup",
        "unicode": "e6bd",
        "unicode_decimal": 59069
      },
      {
        "icon_id": "24923356",
        "name": "arrowthindown",
        "font_class": "arrow-down",
        "unicode": "e6be",
        "unicode_decimal": 59070
      },
      {
        "icon_id": "24923356",
        "name": "arrowthindown",
        "font_class": "arrowthindown",
        "unicode": "e6be",
        "unicode_decimal": 59070
      },
      {
        "icon_id": "24923349",
        "name": "arrowdown",
        "font_class": "bottom",
        "unicode": "e6b8",
        "unicode_decimal": 59064
      },
      {
        "icon_id": "24923349",
        "name": "arrowdown",
        "font_class": "arrowdown",
        "unicode": "e6b8",
        "unicode_decimal": 59064
      },
      {
        "icon_id": "24923346",
        "name": "arrowright",
        "font_class": "right",
        "unicode": "e6b5",
        "unicode_decimal": 59061
      },
      {
        "icon_id": "24923346",
        "name": "arrowright",
        "font_class": "arrowright",
        "unicode": "e6b5",
        "unicode_decimal": 59061
      },
      {
        "icon_id": "24923347",
        "name": "arrowup",
        "font_class": "top",
        "unicode": "e6b6",
        "unicode_decimal": 59062
      },
      {
        "icon_id": "24923347",
        "name": "arrowup",
        "font_class": "arrowup",
        "unicode": "e6b6",
        "unicode_decimal": 59062
      },
      {
        "icon_id": "24923348",
        "name": "arrowleft",
        "font_class": "left",
        "unicode": "e6b7",
        "unicode_decimal": 59063
      },
      {
        "icon_id": "24923348",
        "name": "arrowleft",
        "font_class": "arrowleft",
        "unicode": "e6b7",
        "unicode_decimal": 59063
      },
      {
        "icon_id": "24923334",
        "name": "eye",
        "font_class": "eye",
        "unicode": "e651",
        "unicode_decimal": 58961
      },
      {
        "icon_id": "24923335",
        "name": "eye-filled",
        "font_class": "eye-filled",
        "unicode": "e66a",
        "unicode_decimal": 58986
      },
      {
        "icon_id": "24923336",
        "name": "eye-slash",
        "font_class": "eye-slash",
        "unicode": "e6b3",
        "unicode_decimal": 59059
      },
      {
        "icon_id": "24923337",
        "name": "eye-slash-filled",
        "font_class": "eye-slash-filled",
        "unicode": "e6b4",
        "unicode_decimal": 59060
      },
      {
        "icon_id": "24923305",
        "name": "info-filled",
        "font_class": "info-filled",
        "unicode": "e649",
        "unicode_decimal": 58953
      },
      {
        "icon_id": "24923299",
        "name": "reload-01",
        "font_class": "reload",
        "unicode": "e6b2",
        "unicode_decimal": 59058
      },
      {
        "icon_id": "24923195",
        "name": "mic_slash_fill",
        "font_class": "micoff-filled",
        "unicode": "e6b0",
        "unicode_decimal": 59056
      },
      {
        "icon_id": "24923165",
        "name": "map-pin-ellipse",
        "font_class": "map-pin-ellipse",
        "unicode": "e6ac",
        "unicode_decimal": 59052
      },
      {
        "icon_id": "24923166",
        "name": "map-pin",
        "font_class": "map-pin",
        "unicode": "e6ad",
        "unicode_decimal": 59053
      },
      {
        "icon_id": "24923167",
        "name": "location",
        "font_class": "location",
        "unicode": "e6ae",
        "unicode_decimal": 59054
      },
      {
        "icon_id": "24923064",
        "name": "starhalf",
        "font_class": "starhalf",
        "unicode": "e683",
        "unicode_decimal": 59011
      },
      {
        "icon_id": "24923065",
        "name": "star",
        "font_class": "star",
        "unicode": "e688",
        "unicode_decimal": 59016
      },
      {
        "icon_id": "24923066",
        "name": "star-filled",
        "font_class": "star-filled",
        "unicode": "e68f",
        "unicode_decimal": 59023
      },
      {
        "icon_id": "24899646",
        "name": "a-rilidaka",
        "font_class": "calendar",
        "unicode": "e6a0",
        "unicode_decimal": 59040
      },
      {
        "icon_id": "24899647",
        "name": "fire",
        "font_class": "fire",
        "unicode": "e6a1",
        "unicode_decimal": 59041
      },
      {
        "icon_id": "24899648",
        "name": "paihangbang",
        "font_class": "medal",
        "unicode": "e6a2",
        "unicode_decimal": 59042
      },
      {
        "icon_id": "24899649",
        "name": "font",
        "font_class": "font",
        "unicode": "e6a3",
        "unicode_decimal": 59043
      },
      {
        "icon_id": "24899650",
        "name": "gift",
        "font_class": "gift",
        "unicode": "e6a4",
        "unicode_decimal": 59044
      },
      {
        "icon_id": "24899651",
        "name": "link",
        "font_class": "link",
        "unicode": "e6a5",
        "unicode_decimal": 59045
      },
      {
        "icon_id": "24899652",
        "name": "notification",
        "font_class": "notification",
        "unicode": "e6a6",
        "unicode_decimal": 59046
      },
      {
        "icon_id": "24899653",
        "name": "staff",
        "font_class": "staff",
        "unicode": "e6a7",
        "unicode_decimal": 59047
      },
      {
        "icon_id": "24899654",
        "name": "VIP",
        "font_class": "vip",
        "unicode": "e6a8",
        "unicode_decimal": 59048
      },
      {
        "icon_id": "24899655",
        "name": "folder_add",
        "font_class": "folder-add",
        "unicode": "e6a9",
        "unicode_decimal": 59049
      },
      {
        "icon_id": "24899656",
        "name": "tune",
        "font_class": "tune",
        "unicode": "e6aa",
        "unicode_decimal": 59050
      },
      {
        "icon_id": "24899657",
        "name": "shimingrenzheng",
        "font_class": "auth",
        "unicode": "e6ab",
        "unicode_decimal": 59051
      },
      {
        "icon_id": "24899565",
        "name": "person",
        "font_class": "person",
        "unicode": "e699",
        "unicode_decimal": 59033
      },
      {
        "icon_id": "24899566",
        "name": "email-filled",
        "font_class": "email-filled",
        "unicode": "e69a",
        "unicode_decimal": 59034
      },
      {
        "icon_id": "24899567",
        "name": "phone-filled",
        "font_class": "phone-filled",
        "unicode": "e69b",
        "unicode_decimal": 59035
      },
      {
        "icon_id": "24899568",
        "name": "phone",
        "font_class": "phone",
        "unicode": "e69c",
        "unicode_decimal": 59036
      },
      {
        "icon_id": "24899570",
        "name": "email",
        "font_class": "email",
        "unicode": "e69e",
        "unicode_decimal": 59038
      },
      {
        "icon_id": "24899571",
        "name": "personadd",
        "font_class": "personadd",
        "unicode": "e69f",
        "unicode_decimal": 59039
      },
      {
        "icon_id": "24899558",
        "name": "chatboxes-filled",
        "font_class": "chatboxes-filled",
        "unicode": "e692",
        "unicode_decimal": 59026
      },
      {
        "icon_id": "24899559",
        "name": "contact",
        "font_class": "contact",
        "unicode": "e693",
        "unicode_decimal": 59027
      },
      {
        "icon_id": "24899560",
        "name": "chatbubble-filled",
        "font_class": "chatbubble-filled",
        "unicode": "e694",
        "unicode_decimal": 59028
      },
      {
        "icon_id": "24899561",
        "name": "contact-filled",
        "font_class": "contact-filled",
        "unicode": "e695",
        "unicode_decimal": 59029
      },
      {
        "icon_id": "24899562",
        "name": "chatboxes",
        "font_class": "chatboxes",
        "unicode": "e696",
        "unicode_decimal": 59030
      },
      {
        "icon_id": "24899563",
        "name": "chatbubble",
        "font_class": "chatbubble",
        "unicode": "e697",
        "unicode_decimal": 59031
      },
      {
        "icon_id": "24881290",
        "name": "upload-filled",
        "font_class": "upload-filled",
        "unicode": "e68e",
        "unicode_decimal": 59022
      },
      {
        "icon_id": "24881292",
        "name": "upload",
        "font_class": "upload",
        "unicode": "e690",
        "unicode_decimal": 59024
      },
      {
        "icon_id": "24881293",
        "name": "weixin",
        "font_class": "weixin",
        "unicode": "e691",
        "unicode_decimal": 59025
      },
      {
        "icon_id": "24881274",
        "name": "compose",
        "font_class": "compose",
        "unicode": "e67f",
        "unicode_decimal": 59007
      },
      {
        "icon_id": "24881275",
        "name": "qq",
        "font_class": "qq",
        "unicode": "e680",
        "unicode_decimal": 59008
      },
      {
        "icon_id": "24881276",
        "name": "download-filled",
        "font_class": "download-filled",
        "unicode": "e681",
        "unicode_decimal": 59009
      },
      {
        "icon_id": "24881277",
        "name": "pengyouquan",
        "font_class": "pyq",
        "unicode": "e682",
        "unicode_decimal": 59010
      },
      {
        "icon_id": "24881279",
        "name": "sound",
        "font_class": "sound",
        "unicode": "e684",
        "unicode_decimal": 59012
      },
      {
        "icon_id": "24881280",
        "name": "trash-filled",
        "font_class": "trash-filled",
        "unicode": "e685",
        "unicode_decimal": 59013
      },
      {
        "icon_id": "24881281",
        "name": "sound-filled",
        "font_class": "sound-filled",
        "unicode": "e686",
        "unicode_decimal": 59014
      },
      {
        "icon_id": "24881282",
        "name": "trash",
        "font_class": "trash",
        "unicode": "e687",
        "unicode_decimal": 59015
      },
      {
        "icon_id": "24881284",
        "name": "videocam-filled",
        "font_class": "videocam-filled",
        "unicode": "e689",
        "unicode_decimal": 59017
      },
      {
        "icon_id": "24881285",
        "name": "spinner-cycle",
        "font_class": "spinner-cycle",
        "unicode": "e68a",
        "unicode_decimal": 59018
      },
      {
        "icon_id": "24881286",
        "name": "weibo",
        "font_class": "weibo",
        "unicode": "e68b",
        "unicode_decimal": 59019
      },
      {
        "icon_id": "24881288",
        "name": "videocam",
        "font_class": "videocam",
        "unicode": "e68c",
        "unicode_decimal": 59020
      },
      {
        "icon_id": "24881289",
        "name": "download",
        "font_class": "download",
        "unicode": "e68d",
        "unicode_decimal": 59021
      },
      {
        "icon_id": "24879601",
        "name": "help",
        "font_class": "help",
        "unicode": "e679",
        "unicode_decimal": 59001
      },
      {
        "icon_id": "24879602",
        "name": "navigate-filled",
        "font_class": "navigate-filled",
        "unicode": "e67a",
        "unicode_decimal": 59002
      },
      {
        "icon_id": "24879603",
        "name": "plusempty",
        "font_class": "plusempty",
        "unicode": "e67b",
        "unicode_decimal": 59003
      },
      {
        "icon_id": "24879604",
        "name": "smallcircle",
        "font_class": "smallcircle",
        "unicode": "e67c",
        "unicode_decimal": 59004
      },
      {
        "icon_id": "24879605",
        "name": "minus-filled",
        "font_class": "minus-filled",
        "unicode": "e67d",
        "unicode_decimal": 59005
      },
      {
        "icon_id": "24879606",
        "name": "micoff",
        "font_class": "micoff",
        "unicode": "e67e",
        "unicode_decimal": 59006
      },
      {
        "icon_id": "24879588",
        "name": "closeempty",
        "font_class": "closeempty",
        "unicode": "e66c",
        "unicode_decimal": 58988
      },
      {
        "icon_id": "24879589",
        "name": "clear",
        "font_class": "clear",
        "unicode": "e66d",
        "unicode_decimal": 58989
      },
      {
        "icon_id": "24879590",
        "name": "navigate",
        "font_class": "navigate",
        "unicode": "e66e",
        "unicode_decimal": 58990
      },
      {
        "icon_id": "24879591",
        "name": "minus",
        "font_class": "minus",
        "unicode": "e66f",
        "unicode_decimal": 58991
      },
      {
        "icon_id": "24879592",
        "name": "image",
        "font_class": "image",
        "unicode": "e670",
        "unicode_decimal": 58992
      },
      {
        "icon_id": "24879593",
        "name": "mic",
        "font_class": "mic",
        "unicode": "e671",
        "unicode_decimal": 58993
      },
      {
        "icon_id": "24879594",
        "name": "paperplane",
        "font_class": "paperplane",
        "unicode": "e672",
        "unicode_decimal": 58994
      },
      {
        "icon_id": "24879595",
        "name": "close",
        "font_class": "close",
        "unicode": "e673",
        "unicode_decimal": 58995
      },
      {
        "icon_id": "24879596",
        "name": "help-filled",
        "font_class": "help-filled",
        "unicode": "e674",
        "unicode_decimal": 58996
      },
      {
        "icon_id": "24879597",
        "name": "plus-filled",
        "font_class": "paperplane-filled",
        "unicode": "e675",
        "unicode_decimal": 58997
      },
      {
        "icon_id": "24879598",
        "name": "plus",
        "font_class": "plus",
        "unicode": "e676",
        "unicode_decimal": 58998
      },
      {
        "icon_id": "24879599",
        "name": "mic-filled",
        "font_class": "mic-filled",
        "unicode": "e677",
        "unicode_decimal": 58999
      },
      {
        "icon_id": "24879600",
        "name": "image-filled",
        "font_class": "image-filled",
        "unicode": "e678",
        "unicode_decimal": 59e3
      },
      {
        "icon_id": "24855900",
        "name": "locked-filled",
        "font_class": "locked-filled",
        "unicode": "e668",
        "unicode_decimal": 58984
      },
      {
        "icon_id": "24855901",
        "name": "info",
        "font_class": "info",
        "unicode": "e669",
        "unicode_decimal": 58985
      },
      {
        "icon_id": "24855903",
        "name": "locked",
        "font_class": "locked",
        "unicode": "e66b",
        "unicode_decimal": 58987
      },
      {
        "icon_id": "24855884",
        "name": "camera-filled",
        "font_class": "camera-filled",
        "unicode": "e658",
        "unicode_decimal": 58968
      },
      {
        "icon_id": "24855885",
        "name": "chat-filled",
        "font_class": "chat-filled",
        "unicode": "e659",
        "unicode_decimal": 58969
      },
      {
        "icon_id": "24855886",
        "name": "camera",
        "font_class": "camera",
        "unicode": "e65a",
        "unicode_decimal": 58970
      },
      {
        "icon_id": "24855887",
        "name": "circle",
        "font_class": "circle",
        "unicode": "e65b",
        "unicode_decimal": 58971
      },
      {
        "icon_id": "24855888",
        "name": "checkmarkempty",
        "font_class": "checkmarkempty",
        "unicode": "e65c",
        "unicode_decimal": 58972
      },
      {
        "icon_id": "24855889",
        "name": "chat",
        "font_class": "chat",
        "unicode": "e65d",
        "unicode_decimal": 58973
      },
      {
        "icon_id": "24855890",
        "name": "circle-filled",
        "font_class": "circle-filled",
        "unicode": "e65e",
        "unicode_decimal": 58974
      },
      {
        "icon_id": "24855891",
        "name": "flag",
        "font_class": "flag",
        "unicode": "e65f",
        "unicode_decimal": 58975
      },
      {
        "icon_id": "24855892",
        "name": "flag-filled",
        "font_class": "flag-filled",
        "unicode": "e660",
        "unicode_decimal": 58976
      },
      {
        "icon_id": "24855893",
        "name": "gear-filled",
        "font_class": "gear-filled",
        "unicode": "e661",
        "unicode_decimal": 58977
      },
      {
        "icon_id": "24855894",
        "name": "home",
        "font_class": "home",
        "unicode": "e662",
        "unicode_decimal": 58978
      },
      {
        "icon_id": "24855895",
        "name": "home-filled",
        "font_class": "home-filled",
        "unicode": "e663",
        "unicode_decimal": 58979
      },
      {
        "icon_id": "24855896",
        "name": "gear",
        "font_class": "gear",
        "unicode": "e664",
        "unicode_decimal": 58980
      },
      {
        "icon_id": "24855897",
        "name": "smallcircle-filled",
        "font_class": "smallcircle-filled",
        "unicode": "e665",
        "unicode_decimal": 58981
      },
      {
        "icon_id": "24855898",
        "name": "map-filled",
        "font_class": "map-filled",
        "unicode": "e666",
        "unicode_decimal": 58982
      },
      {
        "icon_id": "24855899",
        "name": "map",
        "font_class": "map",
        "unicode": "e667",
        "unicode_decimal": 58983
      },
      {
        "icon_id": "24855825",
        "name": "refresh-filled",
        "font_class": "refresh-filled",
        "unicode": "e656",
        "unicode_decimal": 58966
      },
      {
        "icon_id": "24855826",
        "name": "refresh",
        "font_class": "refresh",
        "unicode": "e657",
        "unicode_decimal": 58967
      },
      {
        "icon_id": "24855808",
        "name": "cloud-upload",
        "font_class": "cloud-upload",
        "unicode": "e645",
        "unicode_decimal": 58949
      },
      {
        "icon_id": "24855809",
        "name": "cloud-download-filled",
        "font_class": "cloud-download-filled",
        "unicode": "e646",
        "unicode_decimal": 58950
      },
      {
        "icon_id": "24855810",
        "name": "cloud-download",
        "font_class": "cloud-download",
        "unicode": "e647",
        "unicode_decimal": 58951
      },
      {
        "icon_id": "24855811",
        "name": "cloud-upload-filled",
        "font_class": "cloud-upload-filled",
        "unicode": "e648",
        "unicode_decimal": 58952
      },
      {
        "icon_id": "24855813",
        "name": "redo",
        "font_class": "redo",
        "unicode": "e64a",
        "unicode_decimal": 58954
      },
      {
        "icon_id": "24855814",
        "name": "images-filled",
        "font_class": "images-filled",
        "unicode": "e64b",
        "unicode_decimal": 58955
      },
      {
        "icon_id": "24855815",
        "name": "undo-filled",
        "font_class": "undo-filled",
        "unicode": "e64c",
        "unicode_decimal": 58956
      },
      {
        "icon_id": "24855816",
        "name": "more",
        "font_class": "more",
        "unicode": "e64d",
        "unicode_decimal": 58957
      },
      {
        "icon_id": "24855817",
        "name": "more-filled",
        "font_class": "more-filled",
        "unicode": "e64e",
        "unicode_decimal": 58958
      },
      {
        "icon_id": "24855818",
        "name": "undo",
        "font_class": "undo",
        "unicode": "e64f",
        "unicode_decimal": 58959
      },
      {
        "icon_id": "24855819",
        "name": "images",
        "font_class": "images",
        "unicode": "e650",
        "unicode_decimal": 58960
      },
      {
        "icon_id": "24855821",
        "name": "paperclip",
        "font_class": "paperclip",
        "unicode": "e652",
        "unicode_decimal": 58962
      },
      {
        "icon_id": "24855822",
        "name": "settings",
        "font_class": "settings",
        "unicode": "e653",
        "unicode_decimal": 58963
      },
      {
        "icon_id": "24855823",
        "name": "search",
        "font_class": "search",
        "unicode": "e654",
        "unicode_decimal": 58964
      },
      {
        "icon_id": "24855824",
        "name": "redo-filled",
        "font_class": "redo-filled",
        "unicode": "e655",
        "unicode_decimal": 58965
      },
      {
        "icon_id": "24841702",
        "name": "list",
        "font_class": "list",
        "unicode": "e644",
        "unicode_decimal": 58948
      },
      {
        "icon_id": "24841489",
        "name": "mail-open-filled",
        "font_class": "mail-open-filled",
        "unicode": "e63a",
        "unicode_decimal": 58938
      },
      {
        "icon_id": "24841491",
        "name": "hand-thumbsdown-filled",
        "font_class": "hand-down-filled",
        "unicode": "e63c",
        "unicode_decimal": 58940
      },
      {
        "icon_id": "24841492",
        "name": "hand-thumbsdown",
        "font_class": "hand-down",
        "unicode": "e63d",
        "unicode_decimal": 58941
      },
      {
        "icon_id": "24841493",
        "name": "hand-thumbsup-filled",
        "font_class": "hand-up-filled",
        "unicode": "e63e",
        "unicode_decimal": 58942
      },
      {
        "icon_id": "24841494",
        "name": "hand-thumbsup",
        "font_class": "hand-up",
        "unicode": "e63f",
        "unicode_decimal": 58943
      },
      {
        "icon_id": "24841496",
        "name": "heart-filled",
        "font_class": "heart-filled",
        "unicode": "e641",
        "unicode_decimal": 58945
      },
      {
        "icon_id": "24841498",
        "name": "mail-open",
        "font_class": "mail-open",
        "unicode": "e643",
        "unicode_decimal": 58947
      },
      {
        "icon_id": "24841488",
        "name": "heart",
        "font_class": "heart",
        "unicode": "e639",
        "unicode_decimal": 58937
      },
      {
        "icon_id": "24839963",
        "name": "loop",
        "font_class": "loop",
        "unicode": "e633",
        "unicode_decimal": 58931
      },
      {
        "icon_id": "24839866",
        "name": "pulldown",
        "font_class": "pulldown",
        "unicode": "e632",
        "unicode_decimal": 58930
      },
      {
        "icon_id": "24813798",
        "name": "scan",
        "font_class": "scan",
        "unicode": "e62a",
        "unicode_decimal": 58922
      },
      {
        "icon_id": "24813786",
        "name": "bars",
        "font_class": "bars",
        "unicode": "e627",
        "unicode_decimal": 58919
      },
      {
        "icon_id": "24813788",
        "name": "cart-filled",
        "font_class": "cart-filled",
        "unicode": "e629",
        "unicode_decimal": 58921
      },
      {
        "icon_id": "24813790",
        "name": "checkbox",
        "font_class": "checkbox",
        "unicode": "e62b",
        "unicode_decimal": 58923
      },
      {
        "icon_id": "24813791",
        "name": "checkbox-filled",
        "font_class": "checkbox-filled",
        "unicode": "e62c",
        "unicode_decimal": 58924
      },
      {
        "icon_id": "24813794",
        "name": "shop",
        "font_class": "shop",
        "unicode": "e62f",
        "unicode_decimal": 58927
      },
      {
        "icon_id": "24813795",
        "name": "headphones",
        "font_class": "headphones",
        "unicode": "e630",
        "unicode_decimal": 58928
      },
      {
        "icon_id": "24813796",
        "name": "cart",
        "font_class": "cart",
        "unicode": "e631",
        "unicode_decimal": 58929
      }
    ]
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const getVal$1 = (val) => {
    const reg = /^[0-9]*$/g;
    return typeof val === "number" || reg.test(val) ? val + "px" : val;
  };
  const _sfc_main$G = {
    name: "UniIcons",
    emits: ["click"],
    props: {
      type: {
        type: String,
        default: ""
      },
      color: {
        type: String,
        default: "#333333"
      },
      size: {
        type: [Number, String],
        default: 16
      },
      customPrefix: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        icons: icons.glyphs
      };
    },
    computed: {
      unicode() {
        let code = this.icons.find((v2) => v2.font_class === this.type);
        if (code) {
          return unescape(`%u${code.unicode}`);
        }
        return "";
      },
      iconSize() {
        return getVal$1(this.size);
      }
    },
    methods: {
      _onClick() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "text",
      {
        style: vue.normalizeStyle({ color: $props.color, "font-size": $options.iconSize }),
        class: vue.normalizeClass(["uni-icons", ["uniui-" + $props.type, $props.customPrefix, $props.customPrefix ? $props.type : ""]]),
        onClick: _cache[0] || (_cache[0] = (...args) => $options._onClick && $options._onClick(...args))
      },
      null,
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0$6 = /* @__PURE__ */ _export_sfc(_sfc_main$G, [["render", _sfc_render$h], ["__scopeId", "data-v-d31e1c47"], ["__file", "F:/HBuilderProjects/FreeMarket/uni_modules/uni-icons/components/uni-icons/uni-icons.vue"]]);
  const _sfc_main$F = {
    name: "UniStatusBar",
    data() {
      return {
        statusBarHeight: 20
      };
    },
    mounted() {
      this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight + "px";
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        style: vue.normalizeStyle({ height: $data.statusBarHeight }),
        class: "uni-status-bar"
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      4
      /* STYLE */
    );
  }
  const statusBar = /* @__PURE__ */ _export_sfc(_sfc_main$F, [["render", _sfc_render$g], ["__scopeId", "data-v-7920e3e0"], ["__file", "F:/HBuilderProjects/FreeMarket/uni_modules/uni-nav-bar/components/uni-nav-bar/uni-status-bar.vue"]]);
  const getVal = (val) => typeof val === "number" ? val + "px" : val;
  const _sfc_main$E = {
    name: "UniNavBar",
    components: {
      statusBar
    },
    emits: ["clickLeft", "clickRight", "clickTitle"],
    props: {
      dark: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: ""
      },
      leftText: {
        type: String,
        default: ""
      },
      rightText: {
        type: String,
        default: ""
      },
      leftIcon: {
        type: String,
        default: ""
      },
      rightIcon: {
        type: String,
        default: ""
      },
      fixed: {
        type: [Boolean, String],
        default: false
      },
      color: {
        type: String,
        default: ""
      },
      backgroundColor: {
        type: String,
        default: ""
      },
      statusBar: {
        type: [Boolean, String],
        default: false
      },
      shadow: {
        type: [Boolean, String],
        default: false
      },
      border: {
        type: [Boolean, String],
        default: true
      },
      height: {
        type: [Number, String],
        default: 44
      },
      leftWidth: {
        type: [Number, String],
        default: 60
      },
      rightWidth: {
        type: [Number, String],
        default: 60
      },
      stat: {
        type: [Boolean, String],
        default: ""
      }
    },
    computed: {
      themeBgColor() {
        if (this.dark) {
          if (this.backgroundColor) {
            return this.backgroundColor;
          } else {
            return this.dark ? "#333" : "#FFF";
          }
        }
        return this.backgroundColor || "#FFF";
      },
      themeColor() {
        if (this.dark) {
          if (this.color) {
            return this.color;
          } else {
            return this.dark ? "#fff" : "#333";
          }
        }
        return this.color || "#333";
      },
      navbarHeight() {
        return getVal(this.height);
      },
      leftIconWidth() {
        return getVal(this.leftWidth);
      },
      rightIconWidth() {
        return getVal(this.rightWidth);
      }
    },
    mounted() {
      if (uni.report && this.stat && this.title !== "") {
        uni.report("title", this.title);
      }
    },
    methods: {
      onClickLeft() {
        this.$emit("clickLeft");
      },
      onClickRight() {
        this.$emit("clickRight");
      },
      onClickTitle() {
        this.$emit("clickTitle");
      }
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_status_bar = vue.resolveComponent("status-bar");
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["uni-navbar", { "uni-dark": $props.dark, "uni-nvue-fixed": $props.fixed }])
      },
      [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["uni-navbar__content", { "uni-navbar--fixed": $props.fixed, "uni-navbar--shadow": $props.shadow, "uni-navbar--border": $props.border }]),
            style: vue.normalizeStyle({ "background-color": $options.themeBgColor })
          },
          [
            $props.statusBar ? (vue.openBlock(), vue.createBlock(_component_status_bar, { key: 0 })) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode(
              "view",
              {
                style: vue.normalizeStyle({ color: $options.themeColor, backgroundColor: $options.themeBgColor, height: $options.navbarHeight }),
                class: "uni-navbar__header"
              },
              [
                vue.createElementVNode(
                  "view",
                  {
                    onClick: _cache[0] || (_cache[0] = (...args) => $options.onClickLeft && $options.onClickLeft(...args)),
                    class: "uni-navbar__header-btns uni-navbar__header-btns-left",
                    style: vue.normalizeStyle({ width: $options.leftIconWidth })
                  },
                  [
                    vue.renderSlot(_ctx.$slots, "left", {}, () => [
                      $props.leftIcon.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "uni-navbar__content_view"
                      }, [
                        vue.createVNode(_component_uni_icons, {
                          color: $options.themeColor,
                          type: $props.leftIcon,
                          size: "20"
                        }, null, 8, ["color", "type"])
                      ])) : vue.createCommentVNode("v-if", true),
                      $props.leftText.length ? (vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          key: 1,
                          class: vue.normalizeClass([{ "uni-navbar-btn-icon-left": !$props.leftIcon.length > 0 }, "uni-navbar-btn-text"])
                        },
                        [
                          vue.createElementVNode(
                            "text",
                            {
                              style: vue.normalizeStyle({ color: $options.themeColor, fontSize: "12px" })
                            },
                            vue.toDisplayString($props.leftText),
                            5
                            /* TEXT, STYLE */
                          )
                        ],
                        2
                        /* CLASS */
                      )) : vue.createCommentVNode("v-if", true)
                    ], true)
                  ],
                  4
                  /* STYLE */
                ),
                vue.createElementVNode("view", {
                  class: "uni-navbar__header-container",
                  onClick: _cache[1] || (_cache[1] = (...args) => $options.onClickTitle && $options.onClickTitle(...args))
                }, [
                  vue.renderSlot(_ctx.$slots, "default", {}, () => [
                    $props.title.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "uni-navbar__header-container-inner"
                    }, [
                      vue.createElementVNode(
                        "text",
                        {
                          class: "uni-nav-bar-text uni-ellipsis-1",
                          style: vue.normalizeStyle({ color: $options.themeColor })
                        },
                        vue.toDisplayString($props.title),
                        5
                        /* TEXT, STYLE */
                      )
                    ])) : vue.createCommentVNode("v-if", true)
                  ], true)
                ]),
                vue.createElementVNode(
                  "view",
                  {
                    onClick: _cache[2] || (_cache[2] = (...args) => $options.onClickRight && $options.onClickRight(...args)),
                    class: "uni-navbar__header-btns uni-navbar__header-btns-right",
                    style: vue.normalizeStyle({ width: $options.rightIconWidth })
                  },
                  [
                    vue.renderSlot(_ctx.$slots, "right", {}, () => [
                      $props.rightIcon.length ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
                        vue.createVNode(_component_uni_icons, {
                          color: $options.themeColor,
                          type: $props.rightIcon,
                          size: "22"
                        }, null, 8, ["color", "type"])
                      ])) : vue.createCommentVNode("v-if", true),
                      $props.rightText.length && !$props.rightIcon.length ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 1,
                        class: "uni-navbar-btn-text"
                      }, [
                        vue.createElementVNode(
                          "text",
                          {
                            class: "uni-nav-bar-right-text",
                            style: vue.normalizeStyle({ color: $options.themeColor })
                          },
                          vue.toDisplayString($props.rightText),
                          5
                          /* TEXT, STYLE */
                        )
                      ])) : vue.createCommentVNode("v-if", true)
                    ], true)
                  ],
                  4
                  /* STYLE */
                )
              ],
              4
              /* STYLE */
            )
          ],
          6
          /* CLASS, STYLE */
        ),
        $props.fixed ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "uni-navbar__placeholder"
        }, [
          $props.statusBar ? (vue.openBlock(), vue.createBlock(_component_status_bar, { key: 0 })) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode(
            "view",
            {
              class: "uni-navbar__placeholder-view",
              style: vue.normalizeStyle({ height: $options.navbarHeight })
            },
            null,
            4
            /* STYLE */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ],
      2
      /* CLASS */
    );
  }
  const __easycom_0$5 = /* @__PURE__ */ _export_sfc(_sfc_main$E, [["render", _sfc_render$f], ["__scopeId", "data-v-26544265"], ["__file", "F:/HBuilderProjects/FreeMarket/uni_modules/uni-nav-bar/components/uni-nav-bar/uni-nav-bar.vue"]]);
  const _sfc_main$D = {
    name: "UniCard",
    emits: ["click"],
    props: {
      title: {
        type: String,
        default: ""
      },
      subTitle: {
        type: String,
        default: ""
      },
      padding: {
        type: String,
        default: "10px"
      },
      margin: {
        type: String,
        default: "15px"
      },
      spacing: {
        type: String,
        default: "0 10px"
      },
      extra: {
        type: String,
        default: ""
      },
      cover: {
        type: String,
        default: ""
      },
      thumbnail: {
        type: String,
        default: ""
      },
      isFull: {
        // 内容区域是否通栏
        type: Boolean,
        default: false
      },
      isShadow: {
        // 是否开启阴影
        type: Boolean,
        default: true
      },
      shadow: {
        type: String,
        default: "0px 0px 3px 1px rgba(0, 0, 0, 0.08)"
      },
      border: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      onClick(type) {
        this.$emit("click", type);
      }
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["uni-card", { "uni-card--full": $props.isFull, "uni-card--shadow": $props.isShadow, "uni-card--border": $props.border }]),
        style: vue.normalizeStyle({ "margin": $props.isFull ? 0 : $props.margin, "padding": $props.spacing, "box-shadow": $props.isShadow ? $props.shadow : "" })
      },
      [
        vue.createCommentVNode(" 封面 "),
        vue.renderSlot(_ctx.$slots, "cover", {}, () => [
          $props.cover ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "uni-card__cover"
          }, [
            vue.createElementVNode("image", {
              class: "uni-card__cover-image",
              mode: "widthFix",
              onClick: _cache[0] || (_cache[0] = ($event) => $options.onClick("cover")),
              src: $props.cover
            }, null, 8, ["src"])
          ])) : vue.createCommentVNode("v-if", true)
        ], true),
        vue.renderSlot(_ctx.$slots, "title", {}, () => [
          $props.title || $props.extra ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "uni-card__header"
          }, [
            vue.createCommentVNode(" 卡片标题 "),
            vue.createElementVNode("view", {
              class: "uni-card__header-box",
              onClick: _cache[1] || (_cache[1] = ($event) => $options.onClick("title"))
            }, [
              $props.thumbnail ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "uni-card__header-avatar"
              }, [
                vue.createElementVNode("image", {
                  class: "uni-card__header-avatar-image",
                  src: $props.thumbnail,
                  mode: "aspectFit"
                }, null, 8, ["src"])
              ])) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("view", { class: "uni-card__header-content" }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-card__header-content-title uni-ellipsis" },
                  vue.toDisplayString($props.title),
                  1
                  /* TEXT */
                ),
                $props.title && $props.subTitle ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "uni-card__header-content-subtitle uni-ellipsis"
                  },
                  vue.toDisplayString($props.subTitle),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ])
            ]),
            vue.createElementVNode("view", {
              class: "uni-card__header-extra",
              onClick: _cache[2] || (_cache[2] = ($event) => $options.onClick("extra"))
            }, [
              vue.createElementVNode(
                "text",
                { class: "uni-card__header-extra-text" },
                vue.toDisplayString($props.extra),
                1
                /* TEXT */
              )
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ], true),
        vue.createCommentVNode(" 卡片内容 "),
        vue.createElementVNode(
          "view",
          {
            class: "uni-card__content",
            style: vue.normalizeStyle({ padding: $props.padding }),
            onClick: _cache[3] || (_cache[3] = ($event) => $options.onClick("content"))
          },
          [
            vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
          ],
          4
          /* STYLE */
        ),
        vue.createElementVNode("view", {
          class: "uni-card__actions",
          onClick: _cache[4] || (_cache[4] = ($event) => $options.onClick("actions"))
        }, [
          vue.renderSlot(_ctx.$slots, "actions", {}, void 0, true)
        ])
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0$4 = /* @__PURE__ */ _export_sfc(_sfc_main$D, [["render", _sfc_render$e], ["__scopeId", "data-v-ae4bee67"], ["__file", "F:/HBuilderProjects/FreeMarket/uni_modules/uni-card/components/uni-card/uni-card.vue"]]);
  const default_avatar = "https://i2.hdslb.com/bfs/face/eaa74bee5a7a0bb937b7128f8b31f4fcf1353e3b.jpg@160w_160h_1c_1s.webp";
  const server = "http://localhost";
  const port = 4e3;
  const socketPath = "/socket";
  const files = "/files";
  const empty_image = {
    name: "empty_image",
    extname: "webp",
    url: "https://i2.hdslb.com/bfs/face/eaa74bee5a7a0bb937b7128f8b31f4fcf1353e3b.jpg@160w_160h_1c_1s.webp"
  };
  const api = {
    prefix: "/api",
    files: {
      prefix: "/files",
      upload_file: "/upload_file"
    },
    user: {
      prefix: "/user",
      login: "/login",
      register: "/register",
      modify_info: "/modify_info",
      create_comment: "/create_comment",
      verify_email: "/verify_email/",
      favorite: "/favorite",
      get_favorite: "/get_favorite",
      get_history: "/get_history",
      search: "/search",
      create_report: "/create_report"
    },
    goods: {
      prefix: "/goods",
      goods_info: "/goods_info",
      add_goods: "/add_goods",
      modify_goods: "/modify_goods",
      goods_display: "/goods_display"
    },
    post: {
      prefix: "/post",
      post_display: "/post_display",
      read_post: "/read_post",
      create_post: "/create_post",
      modify_post: "/modify_post",
      remove_post: "/remove_post"
    },
    favorite: {
      prefix: "/user"
    },
    message: {
      prefix: "/user",
      send: "/send_msg",
      receive: "/receive_msg"
    },
    history: {
      prefix: "/user"
    },
    exchange: {
      prefix: "/user"
    }
  };
  const cfg = {
    default_avatar,
    server,
    port,
    socketPath,
    files,
    empty_image,
    api
  };
  const _sfc_main$C = /* @__PURE__ */ vue.defineComponent({
    __name: "index",
    setup(__props) {
      const ctrl1 = vue.ref(true);
      const app = getApp();
      const goods = vue.ref([]);
      const end_index = vue.ref(0);
      const enableBottomRequest = vue.ref(true);
      onLoad(() => {
        request(true);
        formatAppLog("log", "at pages/index/index.vue:88", "globalData:", app.globalData);
      });
      onShow(() => {
        formatAppLog("log", "at pages/index/index.vue:105", "onShow");
        ctrl1.value = true;
        formatAppLog("log", "at pages/index/index.vue:107", ctrl1.value);
      });
      onHide(() => {
        formatAppLog("log", "at pages/index/index.vue:112", "onHide");
        ctrl1.value = false;
        formatAppLog("log", "at pages/index/index.vue:114", ctrl1.value);
      });
      onReachBottom(() => {
        formatAppLog("log", "at pages/index/index.vue:119", "reach bottom");
        enableBottomRequest.value && request(false);
      });
      onPullDownRefresh(() => {
        formatAppLog("log", "at pages/index/index.vue:124", "pull down refresh");
        request(true);
      });
      function request(type) {
        if (type)
          end_index.value = 0;
        const amount = 4;
        uni.request({
          url: "http://localhost:4000/api/goods/goods_display",
          method: "POST",
          data: {
            "filter": {
              "start_at": end_index.value,
              "amount": amount
            }
          },
          success(res) {
            formatAppLog("log", "at pages/index/index.vue:145", res.data);
            if (res.statusCode === 200) {
              enableBottomRequest.value = res.data.data.length === amount;
              goods.value = type ? res.data.data : goods.value.concat(res.data.data);
              end_index.value = res.data.next_index;
              uni.stopPullDownRefresh();
            }
          }
        });
      }
      function gotoGoods(i2) {
        uni.navigateTo({
          url: "/pages/browse_goods/browse_goods?id=" + i2.goods_id + "&userid=" + getApp().globalData.login.userid
        });
      }
      function gotoSearch() {
        uni.navigateTo({
          url: "/pages/search/search?type=goods",
          animationType: "none"
        });
      }
      function gotoNewGoods() {
        uni.navigateTo({
          url: "/pages/new_goods/new_goods?operation=new"
          // url: "/pages/new_goods/new_goods?operation=modify&goods_id=goods:0fc22747-88f7-434c-834f-7bf536ffca54"
        });
      }
      return (_ctx, _cache) => {
        const _component_uni_nav_bar = resolveEasycom(vue.resolveDynamicComponent("uni-nav-bar"), __easycom_0$5);
        const _component_uni_card = resolveEasycom(vue.resolveDynamicComponent("uni-card"), __easycom_0$4);
        return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
          vue.createVNode(_component_uni_nav_bar, {
            leftIcon: "plusempty",
            onClickLeft: gotoNewGoods,
            statusBar: "",
            fixed: ""
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("view", {
                class: "searchBox",
                onClick: gotoSearch
              }, [
                vue.createCommentVNode(" flex-direction属性为row-reverse "),
                vue.createElementVNode("view", { id: "searchBtn" }, "搜索"),
                vue.createElementVNode("text", null, "search")
              ])
            ]),
            _: 1
            /* STABLE */
          }),
          vue.createElementVNode("view", { class: "random" }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(4, (i2) => {
                return vue.createElementVNode("view", {
                  onClick: ($event) => gotoGoods(i2),
                  class: "random-box"
                }, [
                  vue.createElementVNode("view", { class: "pic" }, [
                    vue.createTextVNode("pic"),
                    vue.createCommentVNode(" pic ")
                  ]),
                  vue.createElementVNode("text", null, [
                    vue.createTextVNode("price"),
                    vue.createCommentVNode(" price ")
                  ])
                ], 8, ["onClick"]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", { class: "list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(goods.value, (i2, index) => {
                return vue.openBlock(), vue.createBlock(_component_uni_card, {
                  cover: vue.unref(cfg).server + `:` + vue.unref(cfg).port + `/` + i2.imgs[0].url || ``,
                  class: "uni-card-o",
                  onClick: ($event) => gotoGoods(i2),
                  key: index
                }, {
                  default: vue.withCtx(() => [
                    vue.createElementVNode(
                      "view",
                      null,
                      vue.toDisplayString(i2.goods_name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      { style: { "font-weight": "bold", "font-size": "20px", "color": "red" } },
                      " ￥" + vue.toDisplayString(i2.price),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 2
                  /* DYNAMIC */
                }, 1032, ["cover", "onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.withDirectives(vue.createElementVNode(
            "view",
            null,
            "再怎么找也没有了",
            512
            /* NEED_PATCH */
          ), [
            [vue.vShow, !enableBottomRequest.value]
          ])
        ]);
      };
    }
  });
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$C, [["__scopeId", "data-v-1cf27b2a"], ["__file", "F:/HBuilderProjects/FreeMarket/pages/index/index.vue"]]);
  const _sfc_main$B = /* @__PURE__ */ vue.defineComponent({
    __name: "discover",
    setup(__props) {
      const appData = getApp().globalData;
      const posts = vue.ref([]);
      const end_index = vue.ref(0);
      const enableBottomRequest = vue.ref(true);
      onPullDownRefresh(() => {
        request(true);
      });
      onReachBottom(() => {
        enableBottomRequest.value && request(false);
      });
      onLoad(() => {
        formatAppLog("log", "at pages/discover/discover.vue:58", "load");
        request(true);
      });
      function request(type) {
        if (type)
          end_index.value = 0;
        const amount = 4;
        uni.request({
          url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.post.prefix + cfg.api.post.post_display,
          method: "POST",
          data: {
            "filter": {
              "satrt_at": end_index.value,
              "amount": amount
            }
          },
          success(res) {
            formatAppLog("log", "at pages/discover/discover.vue:78", res.data);
            if (res.statusCode === 200) {
              enableBottomRequest.value = res.data.data.length === amount;
              posts.value = type ? res.data.data : posts.value.concat(res.data.data);
              end_index.value = res.data.next_index;
              uni.stopPullDownRefresh();
            }
          }
        });
      }
      function goto(url) {
        uni.navigateTo({
          url,
          animationType: "none"
        });
      }
      return (_ctx, _cache) => {
        const _component_uni_nav_bar = resolveEasycom(vue.resolveDynamicComponent("uni-nav-bar"), __easycom_0$5);
        const _component_uni_card = resolveEasycom(vue.resolveDynamicComponent("uni-card"), __easycom_0$4);
        return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
          vue.createVNode(_component_uni_nav_bar, {
            leftIcon: "plusempty",
            onClickLeft: _cache[1] || (_cache[1] = ($event) => goto(`/pages/new_post/new_post`)),
            statusBar: "",
            fixed: ""
          }, {
            default: vue.withCtx(() => [
              vue.createElementVNode("view", {
                class: "searchBox",
                onClick: _cache[0] || (_cache[0] = ($event) => goto(`/pages/search/search?type=posts`))
              }, [
                vue.createCommentVNode(" flex-direction属性为row-reverse "),
                vue.createElementVNode("view", { id: "searchBtn" }, "搜索"),
                vue.createElementVNode("text", null, "search")
              ])
            ]),
            _: 1
            /* STABLE */
          }),
          vue.createElementVNode("view", { class: "B" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(posts.value, (i2, index) => {
                return vue.openBlock(), vue.createBlock(_component_uni_card, {
                  onClick: ($event) => goto(`/pages/browse_post/browse_post?id=` + i2.post_id + `&userid=` + vue.unref(appData).login.userid)
                }, {
                  default: vue.withCtx(() => [
                    vue.createTextVNode(
                      vue.toDisplayString(i2.title),
                      1
                      /* TEXT */
                    )
                  ]),
                  _: 2
                  /* DYNAMIC */
                }, 1032, ["onClick"]);
              }),
              256
              /* UNKEYED_FRAGMENT */
            ))
          ])
        ]);
      };
    }
  });
  const PagesDiscoverDiscover = /* @__PURE__ */ _export_sfc(_sfc_main$B, [["__scopeId", "data-v-7f6951af"], ["__file", "F:/HBuilderProjects/FreeMarket/pages/discover/discover.vue"]]);
  const _sfc_main$A = /* @__PURE__ */ vue.defineComponent({
    __name: "message",
    setup(__props) {
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "content main" });
      };
    }
  });
  const PagesMessageMessage = /* @__PURE__ */ _export_sfc(_sfc_main$A, [["__file", "F:/HBuilderProjects/FreeMarket/pages/message/message.vue"]]);
  class MPAnimation {
    constructor(options, _this) {
      this.options = options;
      this.animation = uni.createAnimation(options);
      this.currentStepAnimates = {};
      this.next = 0;
      this.$ = _this;
    }
    _nvuePushAnimates(type, args) {
      let aniObj = this.currentStepAnimates[this.next];
      let styles = {};
      if (!aniObj) {
        styles = {
          styles: {},
          config: {}
        };
      } else {
        styles = aniObj;
      }
      if (animateTypes1.includes(type)) {
        if (!styles.styles.transform) {
          styles.styles.transform = "";
        }
        let unit = "";
        if (type === "rotate") {
          unit = "deg";
        }
        styles.styles.transform += `${type}(${args + unit}) `;
      } else {
        styles.styles[type] = `${args}`;
      }
      this.currentStepAnimates[this.next] = styles;
    }
    _animateRun(styles = {}, config = {}) {
      let ref = this.$.$refs["ani"].ref;
      if (!ref)
        return;
      return new Promise((resolve, reject) => {
        nvueAnimation.transition(ref, {
          styles,
          ...config
        }, (res) => {
          resolve();
        });
      });
    }
    _nvueNextAnimate(animates, step = 0, fn) {
      let obj = animates[step];
      if (obj) {
        let {
          styles,
          config
        } = obj;
        this._animateRun(styles, config).then(() => {
          step += 1;
          this._nvueNextAnimate(animates, step, fn);
        });
      } else {
        this.currentStepAnimates = {};
        typeof fn === "function" && fn();
        this.isEnd = true;
      }
    }
    step(config = {}) {
      this.animation.step(config);
      return this;
    }
    run(fn) {
      this.$.animationData = this.animation.export();
      this.$.timer = setTimeout(() => {
        typeof fn === "function" && fn();
      }, this.$.durationTime);
    }
  }
  const animateTypes1 = [
    "matrix",
    "matrix3d",
    "rotate",
    "rotate3d",
    "rotateX",
    "rotateY",
    "rotateZ",
    "scale",
    "scale3d",
    "scaleX",
    "scaleY",
    "scaleZ",
    "skew",
    "skewX",
    "skewY",
    "translate",
    "translate3d",
    "translateX",
    "translateY",
    "translateZ"
  ];
  const animateTypes2 = ["opacity", "backgroundColor"];
  const animateTypes3 = ["width", "height", "left", "right", "top", "bottom"];
  animateTypes1.concat(animateTypes2, animateTypes3).forEach((type) => {
    MPAnimation.prototype[type] = function(...args) {
      this.animation[type](...args);
      return this;
    };
  });
  function createAnimation(option, _this) {
    if (!_this)
      return;
    clearTimeout(_this.timer);
    return new MPAnimation(option, _this);
  }
  const _sfc_main$z = {
    name: "uniTransition",
    emits: ["click", "change"],
    props: {
      show: {
        type: Boolean,
        default: false
      },
      modeClass: {
        type: [Array, String],
        default() {
          return "fade";
        }
      },
      duration: {
        type: Number,
        default: 300
      },
      styles: {
        type: Object,
        default() {
          return {};
        }
      },
      customClass: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        isShow: false,
        transform: "",
        opacity: 1,
        animationData: {},
        durationTime: 300,
        config: {}
      };
    },
    watch: {
      show: {
        handler(newVal) {
          if (newVal) {
            this.open();
          } else {
            if (this.isShow) {
              this.close();
            }
          }
        },
        immediate: true
      }
    },
    computed: {
      // 生成样式数据
      stylesObject() {
        let styles = {
          ...this.styles,
          "transition-duration": this.duration / 1e3 + "s"
        };
        let transform = "";
        for (let i2 in styles) {
          let line = this.toLine(i2);
          transform += line + ":" + styles[i2] + ";";
        }
        return transform;
      },
      // 初始化动画条件
      transformStyles() {
        return "transform:" + this.transform + ";opacity:" + this.opacity + ";" + this.stylesObject;
      }
    },
    created() {
      this.config = {
        duration: this.duration,
        timingFunction: "ease",
        transformOrigin: "50% 50%",
        delay: 0
      };
      this.durationTime = this.duration;
    },
    methods: {
      /**
       *  ref 触发 初始化动画
       */
      init(obj = {}) {
        if (obj.duration) {
          this.durationTime = obj.duration;
        }
        this.animation = createAnimation(Object.assign(this.config, obj), this);
      },
      /**
       * 点击组件触发回调
       */
      onClick() {
        this.$emit("click", {
          detail: this.isShow
        });
      },
      /**
       * ref 触发 动画分组
       * @param {Object} obj
       */
      step(obj, config = {}) {
        if (!this.animation)
          return;
        for (let i2 in obj) {
          try {
            if (typeof obj[i2] === "object") {
              this.animation[i2](...obj[i2]);
            } else {
              this.animation[i2](obj[i2]);
            }
          } catch (e) {
            formatAppLog("error", "at uni_modules/uni-transition/components/uni-transition/uni-transition.vue:139", `方法 ${i2} 不存在`);
          }
        }
        this.animation.step(config);
        return this;
      },
      /**
       *  ref 触发 执行动画
       */
      run(fn) {
        if (!this.animation)
          return;
        this.animation.run(fn);
      },
      // 开始过度动画
      open() {
        clearTimeout(this.timer);
        this.transform = "";
        this.isShow = true;
        let { opacity, transform } = this.styleInit(false);
        if (typeof opacity !== "undefined") {
          this.opacity = opacity;
        }
        this.transform = transform;
        this.$nextTick(() => {
          this.timer = setTimeout(() => {
            this.animation = createAnimation(this.config, this);
            this.tranfromInit(false).step();
            this.animation.run();
            this.$emit("change", {
              detail: this.isShow
            });
          }, 20);
        });
      },
      // 关闭过度动画
      close(type) {
        if (!this.animation)
          return;
        this.tranfromInit(true).step().run(() => {
          this.isShow = false;
          this.animationData = null;
          this.animation = null;
          let { opacity, transform } = this.styleInit(false);
          this.opacity = opacity || 1;
          this.transform = transform;
          this.$emit("change", {
            detail: this.isShow
          });
        });
      },
      // 处理动画开始前的默认样式
      styleInit(type) {
        let styles = {
          transform: ""
        };
        let buildStyle = (type2, mode) => {
          if (mode === "fade") {
            styles.opacity = this.animationType(type2)[mode];
          } else {
            styles.transform += this.animationType(type2)[mode] + " ";
          }
        };
        if (typeof this.modeClass === "string") {
          buildStyle(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildStyle(type, mode);
          });
        }
        return styles;
      },
      // 处理内置组合动画
      tranfromInit(type) {
        let buildTranfrom = (type2, mode) => {
          let aniNum = null;
          if (mode === "fade") {
            aniNum = type2 ? 0 : 1;
          } else {
            aniNum = type2 ? "-100%" : "0";
            if (mode === "zoom-in") {
              aniNum = type2 ? 0.8 : 1;
            }
            if (mode === "zoom-out") {
              aniNum = type2 ? 1.2 : 1;
            }
            if (mode === "slide-right") {
              aniNum = type2 ? "100%" : "0";
            }
            if (mode === "slide-bottom") {
              aniNum = type2 ? "100%" : "0";
            }
          }
          this.animation[this.animationMode()[mode]](aniNum);
        };
        if (typeof this.modeClass === "string") {
          buildTranfrom(type, this.modeClass);
        } else {
          this.modeClass.forEach((mode) => {
            buildTranfrom(type, mode);
          });
        }
        return this.animation;
      },
      animationType(type) {
        return {
          fade: type ? 1 : 0,
          "slide-top": `translateY(${type ? "0" : "-100%"})`,
          "slide-right": `translateX(${type ? "0" : "100%"})`,
          "slide-bottom": `translateY(${type ? "0" : "100%"})`,
          "slide-left": `translateX(${type ? "0" : "-100%"})`,
          "zoom-in": `scaleX(${type ? 1 : 0.8}) scaleY(${type ? 1 : 0.8})`,
          "zoom-out": `scaleX(${type ? 1 : 1.2}) scaleY(${type ? 1 : 1.2})`
        };
      },
      // 内置动画类型与实际动画对应字典
      animationMode() {
        return {
          fade: "opacity",
          "slide-top": "translateY",
          "slide-right": "translateX",
          "slide-bottom": "translateY",
          "slide-left": "translateX",
          "zoom-in": "scale",
          "zoom-out": "scale"
        };
      },
      // 驼峰转中横线
      toLine(name) {
        return name.replace(/([A-Z])/g, "-$1").toLowerCase();
      }
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return $data.isShow ? (vue.openBlock(), vue.createElementBlock("view", {
      key: 0,
      ref: "ani",
      animation: $data.animationData,
      class: vue.normalizeClass($props.customClass),
      style: vue.normalizeStyle($options.transformStyles),
      onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
    }, [
      vue.renderSlot(_ctx.$slots, "default")
    ], 14, ["animation"])) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_0$3 = /* @__PURE__ */ _export_sfc(_sfc_main$z, [["render", _sfc_render$d], ["__file", "F:/HBuilderProjects/FreeMarket/uni_modules/uni-transition/components/uni-transition/uni-transition.vue"]]);
  const _sfc_main$y = {
    name: "uniPopup",
    components: {},
    emits: ["change", "maskClick"],
    props: {
      // 开启动画
      animation: {
        type: Boolean,
        default: true
      },
      // 弹出层类型，可选值，top: 顶部弹出层；bottom：底部弹出层；center：全屏弹出层
      // message: 消息提示 ; dialog : 对话框
      type: {
        type: String,
        default: "center"
      },
      // maskClick
      isMaskClick: {
        type: Boolean,
        default: null
      },
      // TODO 2 个版本后废弃属性 ，使用 isMaskClick
      maskClick: {
        type: Boolean,
        default: null
      },
      backgroundColor: {
        type: String,
        default: "none"
      },
      safeArea: {
        type: Boolean,
        default: true
      },
      maskBackgroundColor: {
        type: String,
        default: "rgba(0, 0, 0, 0.4)"
      }
    },
    watch: {
      /**
       * 监听type类型
       */
      type: {
        handler: function(type) {
          if (!this.config[type])
            return;
          this[this.config[type]](true);
        },
        immediate: true
      },
      isDesktop: {
        handler: function(newVal) {
          if (!this.config[newVal])
            return;
          this[this.config[this.type]](true);
        },
        immediate: true
      },
      /**
       * 监听遮罩是否可点击
       * @param {Object} val
       */
      maskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      isMaskClick: {
        handler: function(val) {
          this.mkclick = val;
        },
        immediate: true
      },
      // H5 下禁止底部滚动
      showPopup(show) {
      }
    },
    data() {
      return {
        duration: 300,
        ani: [],
        showPopup: false,
        showTrans: false,
        popupWidth: 0,
        popupHeight: 0,
        config: {
          top: "top",
          bottom: "bottom",
          center: "center",
          left: "left",
          right: "right",
          message: "top",
          dialog: "center",
          share: "bottom"
        },
        maskClass: {
          position: "fixed",
          bottom: 0,
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)"
        },
        transClass: {
          position: "fixed",
          left: 0,
          right: 0
        },
        maskShow: true,
        mkclick: true,
        popupstyle: this.isDesktop ? "fixforpc-top" : "top"
      };
    },
    computed: {
      isDesktop() {
        return this.popupWidth >= 500 && this.popupHeight >= 500;
      },
      bg() {
        if (this.backgroundColor === "" || this.backgroundColor === "none") {
          return "transparent";
        }
        return this.backgroundColor;
      }
    },
    mounted() {
      const fixSize = () => {
        const {
          windowWidth,
          windowHeight,
          windowTop,
          safeArea,
          screenHeight,
          safeAreaInsets
        } = uni.getSystemInfoSync();
        this.popupWidth = windowWidth;
        this.popupHeight = windowHeight + (windowTop || 0);
        if (safeArea && this.safeArea) {
          this.safeAreaInsets = safeAreaInsets.bottom;
        } else {
          this.safeAreaInsets = 0;
        }
      };
      fixSize();
    },
    // TODO vue3
    unmounted() {
      this.setH5Visible();
    },
    created() {
      if (this.isMaskClick === null && this.maskClick === null) {
        this.mkclick = true;
      } else {
        this.mkclick = this.isMaskClick !== null ? this.isMaskClick : this.maskClick;
      }
      if (this.animation) {
        this.duration = 300;
      } else {
        this.duration = 0;
      }
      this.messageChild = null;
      this.clearPropagation = false;
      this.maskClass.backgroundColor = this.maskBackgroundColor;
    },
    methods: {
      setH5Visible() {
      },
      /**
       * 公用方法，不显示遮罩层
       */
      closeMask() {
        this.maskShow = false;
      },
      /**
       * 公用方法，遮罩层禁止点击
       */
      disableMask() {
        this.mkclick = false;
      },
      // TODO nvue 取消冒泡
      clear(e) {
        e.stopPropagation();
        this.clearPropagation = true;
      },
      open(direction) {
        if (this.showPopup) {
          clearTimeout(this.timer);
          this.showPopup = false;
        }
        let innerType = ["top", "center", "bottom", "left", "right", "message", "dialog", "share"];
        if (!(direction && innerType.indexOf(direction) !== -1)) {
          direction = this.type;
        }
        if (!this.config[direction]) {
          formatAppLog("error", "at uni_modules/uni-popup/components/uni-popup/uni-popup.vue:280", "缺少类型：", direction);
          return;
        }
        this[this.config[direction]]();
        this.$emit("change", {
          show: true,
          type: direction
        });
      },
      close(type) {
        this.showTrans = false;
        this.$emit("change", {
          show: false,
          type: this.type
        });
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.showPopup = false;
        }, 300);
      },
      // TODO 处理冒泡事件，头条的冒泡事件有问题 ，先这样兼容
      touchstart() {
        this.clearPropagation = false;
      },
      onTap() {
        if (this.clearPropagation) {
          this.clearPropagation = false;
          return;
        }
        this.$emit("maskClick");
        if (!this.mkclick)
          return;
        this.close();
      },
      /**
       * 顶部弹出样式处理
       */
      top(type) {
        this.popupstyle = this.isDesktop ? "fixforpc-top" : "top";
        this.ani = ["slide-top"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          backgroundColor: this.bg
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
        this.$nextTick(() => {
          if (this.messageChild && this.type === "message") {
            this.messageChild.timerClose();
          }
        });
      },
      /**
       * 底部弹出样式处理
       */
      bottom(type) {
        this.popupstyle = "bottom";
        this.ani = ["slide-bottom"];
        this.transClass = {
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: this.safeAreaInsets + "px",
          backgroundColor: this.bg
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      },
      /**
       * 中间弹出样式处理
       */
      center(type) {
        this.popupstyle = "center";
        this.ani = ["zoom-out", "fade"];
        this.transClass = {
          position: "fixed",
          display: "flex",
          flexDirection: "column",
          bottom: 0,
          left: 0,
          right: 0,
          top: 0,
          justifyContent: "center",
          alignItems: "center"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      },
      left(type) {
        this.popupstyle = "left";
        this.ani = ["slide-left"];
        this.transClass = {
          position: "fixed",
          left: 0,
          bottom: 0,
          top: 0,
          backgroundColor: this.bg,
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      },
      right(type) {
        this.popupstyle = "right";
        this.ani = ["slide-right"];
        this.transClass = {
          position: "fixed",
          bottom: 0,
          right: 0,
          top: 0,
          backgroundColor: this.bg,
          display: "flex",
          flexDirection: "column"
        };
        if (type)
          return;
        this.showPopup = true;
        this.showTrans = true;
      }
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_transition = resolveEasycom(vue.resolveDynamicComponent("uni-transition"), __easycom_0$3);
    return $data.showPopup ? (vue.openBlock(), vue.createElementBlock(
      "view",
      {
        key: 0,
        class: vue.normalizeClass(["uni-popup", [$data.popupstyle, $options.isDesktop ? "fixforpc-z-index" : ""]])
      },
      [
        vue.createElementVNode(
          "view",
          {
            onTouchstart: _cache[1] || (_cache[1] = (...args) => $options.touchstart && $options.touchstart(...args))
          },
          [
            $data.maskShow ? (vue.openBlock(), vue.createBlock(_component_uni_transition, {
              key: "1",
              name: "mask",
              "mode-class": "fade",
              styles: $data.maskClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, null, 8, ["styles", "duration", "show", "onClick"])) : vue.createCommentVNode("v-if", true),
            vue.createVNode(_component_uni_transition, {
              key: "2",
              "mode-class": $data.ani,
              name: "content",
              styles: $data.transClass,
              duration: $data.duration,
              show: $data.showTrans,
              onClick: $options.onTap
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["uni-popup__wrapper", [$data.popupstyle]]),
                    style: vue.normalizeStyle({ backgroundColor: $options.bg }),
                    onClick: _cache[0] || (_cache[0] = (...args) => $options.clear && $options.clear(...args))
                  },
                  [
                    vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
                  ],
                  6
                  /* CLASS, STYLE */
                )
              ]),
              _: 3
              /* FORWARDED */
            }, 8, ["mode-class", "styles", "duration", "show", "onClick"])
          ],
          32
          /* HYDRATE_EVENTS */
        )
      ],
      2
      /* CLASS */
    )) : vue.createCommentVNode("v-if", true);
  }
  const __easycom_3 = /* @__PURE__ */ _export_sfc(_sfc_main$y, [["render", _sfc_render$c], ["__scopeId", "data-v-4dd3c44b"], ["__file", "F:/HBuilderProjects/FreeMarket/uni_modules/uni-popup/components/uni-popup/uni-popup.vue"]]);
  const _sfc_main$x = /* @__PURE__ */ vue.defineComponent({
    __name: "my",
    setup(__props) {
      const isLogin = vue.ref(false);
      const info = vue.ref({});
      const action = vue.ref();
      onLoad(async () => {
        getInfo();
        if (Object.keys(info.value).length !== 0)
          ;
      });
      uni.$on("user", () => getInfo());
      function getInfo() {
        try {
          info.value = getApp().globalData.login;
          formatAppLog("log", "at pages/my/my.vue:114", info.value);
          if (Object.keys(info.value).length !== 0)
            isLogin.value = true;
        } catch (e) {
        }
      }
      function goto(url) {
        uni.navigateTo({
          url
        });
      }
      function gotoEditInfo() {
        uni.navigateTo({
          url: "/pages/edit_info/edit_info"
        });
      }
      function editAvatar() {
        action.value.open("bottom");
      }
      function selecctImage(from) {
        uni.chooseImage({
          count: 1,
          sourceType: from,
          success(res) {
            formatAppLog("log", "at pages/my/my.vue:148", res);
          }
        });
      }
      function logout() {
        try {
          uni.removeStorage({
            key: "user_login",
            success() {
              getApp().globalData.login = {};
              isLogin.value = false;
            }
          });
        } catch (e) {
        }
      }
      return (_ctx, _cache) => {
        const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
        const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_3);
        return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
          vue.createElementVNode("view", { class: "content info" }, [
            vue.createElementVNode(
              "view",
              {
                class: "avatar l-side",
                style: vue.normalizeStyle({
                  backgroundImage: `url(` + (info.value.headImg !== "" ? info.value.headImg : vue.unref(cfg).default_avatar) + `)`
                }),
                onClick: editAvatar
              },
              null,
              4
              /* STYLE */
            ),
            vue.createElementVNode("view", { class: "r-side" }, [
              isLogin.value ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                onClick: gotoEditInfo
              }, [
                vue.createElementVNode(
                  "view",
                  { class: "username" },
                  vue.toDisplayString(info.value.username),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "view",
                  { class: "desc" },
                  vue.toDisplayString(info.value.desc),
                  1
                  /* TEXT */
                )
              ])) : (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
                vue.createElementVNode("button", {
                  onClick: _cache[0] || (_cache[0] = ($event) => goto(`/pages/login/login`))
                }, "登录")
              ]))
            ])
          ]),
          vue.createElementVNode("view", { class: "views" }, [
            vue.createElementVNode("view", {
              class: "menu-items",
              onClick: _cache[1] || (_cache[1] = ($event) => goto(`/pages/favorite/favorite`))
            }, [
              vue.createVNode(_component_uni_icons, {
                size: "35",
                customPrefix: "iconfont",
                type: "icon-favor"
              }),
              vue.createElementVNode("text", null, "我的收藏")
            ]),
            vue.createElementVNode("view", {
              class: "menu-items",
              onClick: _cache[2] || (_cache[2] = ($event) => goto(`/pages/history/history`))
            }, [
              vue.createVNode(_component_uni_icons, {
                size: "35",
                customPrefix: "iconfont",
                type: "icon-lishi"
              }),
              vue.createElementVNode("text", null, "浏览历史")
            ]),
            vue.createElementVNode("view", { class: "menu-items" }, [
              vue.createVNode(_component_uni_icons, {
                size: "35",
                customPrefix: "iconfont",
                type: "icon-tiezi"
              }),
              vue.createElementVNode("text", null, "我的帖子")
            ])
          ]),
          vue.createElementVNode("view", { class: "exchange" }, [
            vue.createElementVNode("view", {
              class: "menu-items",
              onClick: _cache[3] || (_cache[3] = ($event) => goto(`/pages/mygoods/mygoods`))
            }, [
              vue.createVNode(_component_uni_icons, {
                size: "35",
                customPrefix: "iconfont",
                type: "icon-31quanbushangpin"
              }),
              vue.createElementVNode("text", null, "我发布的")
            ]),
            vue.createElementVNode("view", { class: "menu-items" }, [
              vue.createVNode(_component_uni_icons, {
                size: "35",
                customPrefix: "iconfont",
                type: "icon-mairu"
              }),
              vue.createElementVNode("text", null, "我买入的")
            ]),
            vue.createElementVNode("view", { class: "menu-items" }, [
              vue.createVNode(_component_uni_icons, {
                size: "35",
                customPrefix: "iconfont",
                type: "icon-maichu"
              }),
              vue.createElementVNode("text", null, "我卖出的")
            ])
          ]),
          vue.createElementVNode("button", {
            onClick: _cache[4] || (_cache[4] = ($event) => goto(`/pages/settings/settings`))
          }, "设置"),
          isLogin.value ? (vue.openBlock(), vue.createElementBlock("button", {
            key: 0,
            onClick: logout
          }, "退出登录")) : vue.createCommentVNode("v-if", true),
          vue.createVNode(
            _component_uni_popup,
            {
              ref_key: "action",
              ref: action
            },
            {
              default: vue.withCtx(() => [
                vue.createCommentVNode(" 拍照 "),
                vue.createElementVNode("button", {
                  onClick: _cache[5] || (_cache[5] = ($event) => selecctImage(["camera"]))
                }, "拍照"),
                vue.createCommentVNode(" 文件 "),
                vue.createElementVNode("button", {
                  onClick: _cache[6] || (_cache[6] = ($event) => selecctImage(["album"]))
                }, "选择文件")
              ]),
              _: 1
              /* STABLE */
            },
            512
            /* NEED_PATCH */
          )
        ]);
      };
    }
  });
  const PagesMyMy = /* @__PURE__ */ _export_sfc(_sfc_main$x, [["__file", "F:/HBuilderProjects/FreeMarket/pages/my/my.vue"]]);
  const _sfc_main$w = {
    name: "UniSegmentedControl",
    emits: ["clickItem"],
    props: {
      current: {
        type: Number,
        default: 0
      },
      values: {
        type: Array,
        default() {
          return [];
        }
      },
      activeColor: {
        type: String,
        default: "#2979FF"
      },
      styleType: {
        type: String,
        default: "button"
      }
    },
    data() {
      return {
        currentIndex: 0
      };
    },
    watch: {
      current(val) {
        if (val !== this.currentIndex) {
          this.currentIndex = val;
        }
      }
    },
    created() {
      this.currentIndex = this.current;
    },
    methods: {
      _onClick(index) {
        if (this.currentIndex !== index) {
          this.currentIndex = index;
          this.$emit("clickItem", {
            currentIndex: index
          });
        }
      }
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass([[$props.styleType === "text" ? "segmented-control--text" : "segmented-control--button"], "segmented-control"]),
        style: vue.normalizeStyle({ borderColor: $props.styleType === "text" ? "" : $props.activeColor })
      },
      [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($props.values, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: vue.normalizeClass([[
                $props.styleType === "text" ? "" : "segmented-control__item--button",
                index === $data.currentIndex && $props.styleType === "button" ? "segmented-control__item--button--active" : "",
                index === 0 && $props.styleType === "button" ? "segmented-control__item--button--first" : "",
                index === $props.values.length - 1 && $props.styleType === "button" ? "segmented-control__item--button--last" : ""
              ], "segmented-control__item"]),
              key: index,
              style: vue.normalizeStyle({ backgroundColor: index === $data.currentIndex && $props.styleType === "button" ? $props.activeColor : "", borderColor: index === $data.currentIndex && $props.styleType === "text" || $props.styleType === "button" ? $props.activeColor : "transparent" }),
              onClick: ($event) => $options._onClick(index)
            }, [
              vue.createElementVNode("view", null, [
                vue.createElementVNode(
                  "text",
                  {
                    style: vue.normalizeStyle({ color: index === $data.currentIndex ? $props.styleType === "text" ? $props.activeColor : "#fff" : $props.styleType === "text" ? "#000" : $props.activeColor }),
                    class: vue.normalizeClass(["segmented-control__text", $props.styleType === "text" && index === $data.currentIndex ? "segmented-control__item--text" : ""])
                  },
                  vue.toDisplayString(item),
                  7
                  /* TEXT, CLASS, STYLE */
                )
              ])
            ], 14, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$w, [["render", _sfc_render$b], ["__scopeId", "data-v-86aa1171"], ["__file", "F:/HBuilderProjects/FreeMarket/uni_modules/uni-segmented-control/components/uni-segmented-control/uni-segmented-control.vue"]]);
  const _sfc_main$v = /* @__PURE__ */ vue.defineComponent({
    __name: "favorite",
    setup(__props) {
      const favor_list = vue.ref([]);
      const favor_out = vue.ref([]);
      const current = vue.ref(0);
      const type = vue.ref("goods");
      const segItems = vue.ref(["商 品", "帖 子"]);
      onLoad((option) => {
        request();
      });
      function switchSegments(e) {
        formatAppLog("log", "at pages/favorite/favorite.vue:53", e);
        current.value = e.currentIndex;
        if (current.value === 0)
          type.value = "goods";
        else if (current.value === 1)
          type.value = "post";
        request();
      }
      function request() {
        uni.request({
          url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.user.prefix + cfg.api.user.get_favorite,
          method: "POST",
          data: {
            userid: getApp().globalData.login.userid,
            type: type.value
          },
          success(res) {
            formatAppLog("log", "at pages/favorite/favorite.vue:75", res);
            if (res.statusCode === 200) {
              favor_list.value = res.data;
              for (let i2 in favor_list.value) {
                formatAppLog("log", "at pages/favorite/favorite.vue:79", favor_list.value);
                formatAppLog("log", "at pages/favorite/favorite.vue:80", favor_list.value[i2]);
                formatAppLog("log", "at pages/favorite/favorite.vue:81", typeof favor_list.value[i2].refer_to);
              }
              favor_out.value = favor_list.value.map((i2) => {
                i2.isDel = typeof i2.refer_to === "string";
                return i2;
              });
            }
          }
        });
      }
      return (_ctx, _cache) => {
        const _component_uni_segmented_control = resolveEasycom(vue.resolveDynamicComponent("uni-segmented-control"), __easycom_0$2);
        return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
          vue.createVNode(_component_uni_segmented_control, {
            class: "segs",
            current: current.value,
            styleType: "text",
            values: segItems.value,
            onClickItem: switchSegments
          }, null, 8, ["current", "values"]),
          vue.createElementVNode("view", { class: "favorite-list" }, [
            vue.createCommentVNode(" {{favor_out}} "),
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(favor_out.value, (i2, index) => {
                return vue.openBlock(), vue.createElementBlock("view", { class: "favorite-item" }, [
                  vue.createCommentVNode(" string "),
                  i2.isDel ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, " str ")) : (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
                    vue.createTextVNode(
                      vue.toDisplayString(i2) + " ",
                      1
                      /* TEXT */
                    ),
                    vue.createCommentVNode(" img "),
                    vue.createElementVNode("image", {
                      src: vue.unref(cfg).server + `:` + vue.unref(cfg).port + `/` + i2.refer_to.imgs[0].url
                    }, null, 8, ["src"]),
                    vue.createCommentVNode(" desc "),
                    vue.createTextVNode(
                      " " + vue.toDisplayString(i2.refer_to.desc) + " ",
                      1
                      /* TEXT */
                    ),
                    vue.createCommentVNode(" operation ")
                  ]))
                ]);
              }),
              256
              /* UNKEYED_FRAGMENT */
            ))
          ])
        ]);
      };
    }
  });
  const PagesFavoriteFavorite = /* @__PURE__ */ _export_sfc(_sfc_main$v, [["__scopeId", "data-v-8850f19c"], ["__file", "F:/HBuilderProjects/FreeMarket/pages/favorite/favorite.vue"]]);
  const _sfc_main$u = /* @__PURE__ */ vue.defineComponent({
    __name: "exchange",
    setup(__props) {
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view");
      };
    }
  });
  const PagesExchangeExchange = /* @__PURE__ */ _export_sfc(_sfc_main$u, [["__file", "F:/HBuilderProjects/FreeMarket/pages/exchange/exchange.vue"]]);
  const isObject = (val) => val !== null && typeof val === "object";
  const defaultDelimiters = ["{", "}"];
  class BaseFormatter {
    constructor() {
      this._caches = /* @__PURE__ */ Object.create(null);
    }
    interpolate(message, values, delimiters = defaultDelimiters) {
      if (!values) {
        return [message];
      }
      let tokens = this._caches[message];
      if (!tokens) {
        tokens = parse(message, delimiters);
        this._caches[message] = tokens;
      }
      return compile(tokens, values);
    }
  }
  const RE_TOKEN_LIST_VALUE = /^(?:\d)+/;
  const RE_TOKEN_NAMED_VALUE = /^(?:\w)+/;
  function parse(format, [startDelimiter, endDelimiter]) {
    const tokens = [];
    let position = 0;
    let text = "";
    while (position < format.length) {
      let char = format[position++];
      if (char === startDelimiter) {
        if (text) {
          tokens.push({ type: "text", value: text });
        }
        text = "";
        let sub = "";
        char = format[position++];
        while (char !== void 0 && char !== endDelimiter) {
          sub += char;
          char = format[position++];
        }
        const isClosed = char === endDelimiter;
        const type = RE_TOKEN_LIST_VALUE.test(sub) ? "list" : isClosed && RE_TOKEN_NAMED_VALUE.test(sub) ? "named" : "unknown";
        tokens.push({ value: sub, type });
      } else {
        text += char;
      }
    }
    text && tokens.push({ type: "text", value: text });
    return tokens;
  }
  function compile(tokens, values) {
    const compiled = [];
    let index = 0;
    const mode = Array.isArray(values) ? "list" : isObject(values) ? "named" : "unknown";
    if (mode === "unknown") {
      return compiled;
    }
    while (index < tokens.length) {
      const token = tokens[index];
      switch (token.type) {
        case "text":
          compiled.push(token.value);
          break;
        case "list":
          compiled.push(values[parseInt(token.value, 10)]);
          break;
        case "named":
          if (mode === "named") {
            compiled.push(values[token.value]);
          } else {
            {
              console.warn(`Type of token '${token.type}' and format of value '${mode}' don't match!`);
            }
          }
          break;
        case "unknown":
          {
            console.warn(`Detect 'unknown' type of token!`);
          }
          break;
      }
      index++;
    }
    return compiled;
  }
  const LOCALE_ZH_HANS = "zh-Hans";
  const LOCALE_ZH_HANT = "zh-Hant";
  const LOCALE_EN = "en";
  const LOCALE_FR = "fr";
  const LOCALE_ES = "es";
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const hasOwn = (val, key) => hasOwnProperty.call(val, key);
  const defaultFormatter = new BaseFormatter();
  function include(str, parts) {
    return !!parts.find((part) => str.indexOf(part) !== -1);
  }
  function startsWith(str, parts) {
    return parts.find((part) => str.indexOf(part) === 0);
  }
  function normalizeLocale(locale, messages) {
    if (!locale) {
      return;
    }
    locale = locale.trim().replace(/_/g, "-");
    if (messages && messages[locale]) {
      return locale;
    }
    locale = locale.toLowerCase();
    if (locale === "chinese") {
      return LOCALE_ZH_HANS;
    }
    if (locale.indexOf("zh") === 0) {
      if (locale.indexOf("-hans") > -1) {
        return LOCALE_ZH_HANS;
      }
      if (locale.indexOf("-hant") > -1) {
        return LOCALE_ZH_HANT;
      }
      if (include(locale, ["-tw", "-hk", "-mo", "-cht"])) {
        return LOCALE_ZH_HANT;
      }
      return LOCALE_ZH_HANS;
    }
    const lang = startsWith(locale, [LOCALE_EN, LOCALE_FR, LOCALE_ES]);
    if (lang) {
      return lang;
    }
  }
  class I18n {
    constructor({ locale, fallbackLocale, messages, watcher, formater }) {
      this.locale = LOCALE_EN;
      this.fallbackLocale = LOCALE_EN;
      this.message = {};
      this.messages = {};
      this.watchers = [];
      if (fallbackLocale) {
        this.fallbackLocale = fallbackLocale;
      }
      this.formater = formater || defaultFormatter;
      this.messages = messages || {};
      this.setLocale(locale || LOCALE_EN);
      if (watcher) {
        this.watchLocale(watcher);
      }
    }
    setLocale(locale) {
      const oldLocale = this.locale;
      this.locale = normalizeLocale(locale, this.messages) || this.fallbackLocale;
      if (!this.messages[this.locale]) {
        this.messages[this.locale] = {};
      }
      this.message = this.messages[this.locale];
      if (oldLocale !== this.locale) {
        this.watchers.forEach((watcher) => {
          watcher(this.locale, oldLocale);
        });
      }
    }
    getLocale() {
      return this.locale;
    }
    watchLocale(fn) {
      const index = this.watchers.push(fn) - 1;
      return () => {
        this.watchers.splice(index, 1);
      };
    }
    add(locale, message, override = true) {
      const curMessages = this.messages[locale];
      if (curMessages) {
        if (override) {
          Object.assign(curMessages, message);
        } else {
          Object.keys(message).forEach((key) => {
            if (!hasOwn(curMessages, key)) {
              curMessages[key] = message[key];
            }
          });
        }
      } else {
        this.messages[locale] = message;
      }
    }
    f(message, values, delimiters) {
      return this.formater.interpolate(message, values, delimiters).join("");
    }
    t(key, locale, values) {
      let message = this.message;
      if (typeof locale === "string") {
        locale = normalizeLocale(locale, this.messages);
        locale && (message = this.messages[locale]);
      } else {
        values = locale;
      }
      if (!hasOwn(message, key)) {
        console.warn(`Cannot translate the value of keypath ${key}. Use the value of keypath as default.`);
        return key;
      }
      return this.formater.interpolate(message[key], values).join("");
    }
  }
  function watchAppLocale(appVm, i18n) {
    if (appVm.$watchLocale) {
      appVm.$watchLocale((newLocale) => {
        i18n.setLocale(newLocale);
      });
    } else {
      appVm.$watch(() => appVm.$locale, (newLocale) => {
        i18n.setLocale(newLocale);
      });
    }
  }
  function getDefaultLocale() {
    if (typeof uni !== "undefined" && uni.getLocale) {
      return uni.getLocale();
    }
    if (typeof global !== "undefined" && global.getLocale) {
      return global.getLocale();
    }
    return LOCALE_EN;
  }
  function initVueI18n(locale, messages = {}, fallbackLocale, watcher) {
    if (typeof locale !== "string") {
      [locale, messages] = [
        messages,
        locale
      ];
    }
    if (typeof locale !== "string") {
      locale = getDefaultLocale();
    }
    if (typeof fallbackLocale !== "string") {
      fallbackLocale = typeof __uniConfig !== "undefined" && __uniConfig.fallbackLocale || LOCALE_EN;
    }
    const i18n = new I18n({
      locale,
      fallbackLocale,
      messages,
      watcher
    });
    let t2 = (key, values) => {
      if (typeof getApp !== "function") {
        t2 = function(key2, values2) {
          return i18n.t(key2, values2);
        };
      } else {
        let isWatchedAppLocale = false;
        t2 = function(key2, values2) {
          const appVm = getApp().$vm;
          if (appVm) {
            appVm.$locale;
            if (!isWatchedAppLocale) {
              isWatchedAppLocale = true;
              watchAppLocale(appVm, i18n);
            }
          }
          return i18n.t(key2, values2);
        };
      }
      return t2(key, values);
    };
    return {
      i18n,
      f(message, values, delimiters) {
        return i18n.f(message, values, delimiters);
      },
      t(key, values) {
        return t2(key, values);
      },
      add(locale2, message, override = true) {
        return i18n.add(locale2, message, override);
      },
      watch(fn) {
        return i18n.watchLocale(fn);
      },
      getLocale() {
        return i18n.getLocale();
      },
      setLocale(newLocale) {
        return i18n.setLocale(newLocale);
      }
    };
  }
  const pages = [
    {
      path: "pages/index/index",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: true,
        navigationStyle: "custom"
      }
    },
    {
      path: "pages/discover/discover",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: true,
        navigationStyle: "custom"
      }
    },
    {
      path: "pages/message/message",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: true,
        navigationStyle: "custom"
      }
    },
    {
      path: "pages/my/my",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false,
        navigationStyle: "custom"
      }
    },
    {
      path: "pages/favorite/favorite",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/exchange/exchange",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/new_post/new_post",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/new_goods/new_goods",
      style: {
        navigationBarTitleText: "商品",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/chat/chat",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/login/login",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/register/register",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/browse_goods/browse_goods",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/edit_info/edit_info",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/search/search",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/browse_post/browse_post",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/history/history",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: true
      }
    },
    {
      path: "pages/settings/settings",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/mygoods/mygoods",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false
      }
    },
    {
      path: "pages/report/report",
      style: {
        navigationBarTitleText: "",
        enablePullDownRefresh: false
      }
    }
  ];
  const globalStyle = {
    navigationBarTextStyle: "black",
    navigationBarTitleText: "uni-app",
    navigationBarBackgroundColor: "#F8F8F8",
    backgroundColor: "#F8F8F8",
    enablePullDownRefresh: true,
    onReachBottomDistance: 0
  };
  const easycom = {
    autoscan: true
  };
  const tabBar = {
    selectedColor: "#1296db",
    list: [
      {
        text: "主页",
        pagePath: "pages/index/index",
        iconPath: "static/tabBarIcons/home.png",
        selectedIconPath: "static/tabBarIcons/home_fill.png"
      },
      {
        text: "发现",
        pagePath: "pages/discover/discover",
        iconPath: "static/tabBarIcons/attention.png",
        selectedIconPath: "static/tabBarIcons/attention_fill.png"
      },
      {
        text: "消息",
        pagePath: "pages/message/message",
        iconPath: "static/tabBarIcons/message.png",
        selectedIconPath: "static/tabBarIcons/message_fill_light.png"
      },
      {
        text: "我的",
        pagePath: "pages/my/my",
        iconPath: "static/tabBarIcons/my.png",
        selectedIconPath: "static/tabBarIcons/my_fill.png"
      }
    ]
  };
  const uniIdRouter = {};
  const t = {
    pages,
    globalStyle,
    easycom,
    tabBar,
    uniIdRouter
  };
  function n(e) {
    return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
  }
  function s(e, t2, n2) {
    return e(n2 = { path: t2, exports: {}, require: function(e2, t3) {
      return function() {
        throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
      }(null == t3 && n2.path);
    } }, n2.exports), n2.exports;
  }
  var r = s(function(e, t2) {
    var n2;
    e.exports = (n2 = n2 || function(e2, t3) {
      var n3 = Object.create || function() {
        function e3() {
        }
        return function(t4) {
          var n4;
          return e3.prototype = t4, n4 = new e3(), e3.prototype = null, n4;
        };
      }(), s2 = {}, r2 = s2.lib = {}, i2 = r2.Base = { extend: function(e3) {
        var t4 = n3(this);
        return e3 && t4.mixIn(e3), t4.hasOwnProperty("init") && this.init !== t4.init || (t4.init = function() {
          t4.$super.init.apply(this, arguments);
        }), t4.init.prototype = t4, t4.$super = this, t4;
      }, create: function() {
        var e3 = this.extend();
        return e3.init.apply(e3, arguments), e3;
      }, init: function() {
      }, mixIn: function(e3) {
        for (var t4 in e3)
          e3.hasOwnProperty(t4) && (this[t4] = e3[t4]);
        e3.hasOwnProperty("toString") && (this.toString = e3.toString);
      }, clone: function() {
        return this.init.prototype.extend(this);
      } }, o2 = r2.WordArray = i2.extend({ init: function(e3, n4) {
        e3 = this.words = e3 || [], this.sigBytes = n4 != t3 ? n4 : 4 * e3.length;
      }, toString: function(e3) {
        return (e3 || c2).stringify(this);
      }, concat: function(e3) {
        var t4 = this.words, n4 = e3.words, s3 = this.sigBytes, r3 = e3.sigBytes;
        if (this.clamp(), s3 % 4)
          for (var i3 = 0; i3 < r3; i3++) {
            var o3 = n4[i3 >>> 2] >>> 24 - i3 % 4 * 8 & 255;
            t4[s3 + i3 >>> 2] |= o3 << 24 - (s3 + i3) % 4 * 8;
          }
        else
          for (i3 = 0; i3 < r3; i3 += 4)
            t4[s3 + i3 >>> 2] = n4[i3 >>> 2];
        return this.sigBytes += r3, this;
      }, clamp: function() {
        var t4 = this.words, n4 = this.sigBytes;
        t4[n4 >>> 2] &= 4294967295 << 32 - n4 % 4 * 8, t4.length = e2.ceil(n4 / 4);
      }, clone: function() {
        var e3 = i2.clone.call(this);
        return e3.words = this.words.slice(0), e3;
      }, random: function(t4) {
        for (var n4, s3 = [], r3 = function(t5) {
          t5 = t5;
          var n5 = 987654321, s4 = 4294967295;
          return function() {
            var r4 = ((n5 = 36969 * (65535 & n5) + (n5 >> 16) & s4) << 16) + (t5 = 18e3 * (65535 & t5) + (t5 >> 16) & s4) & s4;
            return r4 /= 4294967296, (r4 += 0.5) * (e2.random() > 0.5 ? 1 : -1);
          };
        }, i3 = 0; i3 < t4; i3 += 4) {
          var a3 = r3(4294967296 * (n4 || e2.random()));
          n4 = 987654071 * a3(), s3.push(4294967296 * a3() | 0);
        }
        return new o2.init(s3, t4);
      } }), a2 = s2.enc = {}, c2 = a2.Hex = { stringify: function(e3) {
        for (var t4 = e3.words, n4 = e3.sigBytes, s3 = [], r3 = 0; r3 < n4; r3++) {
          var i3 = t4[r3 >>> 2] >>> 24 - r3 % 4 * 8 & 255;
          s3.push((i3 >>> 4).toString(16)), s3.push((15 & i3).toString(16));
        }
        return s3.join("");
      }, parse: function(e3) {
        for (var t4 = e3.length, n4 = [], s3 = 0; s3 < t4; s3 += 2)
          n4[s3 >>> 3] |= parseInt(e3.substr(s3, 2), 16) << 24 - s3 % 8 * 4;
        return new o2.init(n4, t4 / 2);
      } }, u2 = a2.Latin1 = { stringify: function(e3) {
        for (var t4 = e3.words, n4 = e3.sigBytes, s3 = [], r3 = 0; r3 < n4; r3++) {
          var i3 = t4[r3 >>> 2] >>> 24 - r3 % 4 * 8 & 255;
          s3.push(String.fromCharCode(i3));
        }
        return s3.join("");
      }, parse: function(e3) {
        for (var t4 = e3.length, n4 = [], s3 = 0; s3 < t4; s3++)
          n4[s3 >>> 2] |= (255 & e3.charCodeAt(s3)) << 24 - s3 % 4 * 8;
        return new o2.init(n4, t4);
      } }, l2 = a2.Utf8 = { stringify: function(e3) {
        try {
          return decodeURIComponent(escape(u2.stringify(e3)));
        } catch (e4) {
          throw new Error("Malformed UTF-8 data");
        }
      }, parse: function(e3) {
        return u2.parse(unescape(encodeURIComponent(e3)));
      } }, h2 = r2.BufferedBlockAlgorithm = i2.extend({ reset: function() {
        this._data = new o2.init(), this._nDataBytes = 0;
      }, _append: function(e3) {
        "string" == typeof e3 && (e3 = l2.parse(e3)), this._data.concat(e3), this._nDataBytes += e3.sigBytes;
      }, _process: function(t4) {
        var n4 = this._data, s3 = n4.words, r3 = n4.sigBytes, i3 = this.blockSize, a3 = r3 / (4 * i3), c3 = (a3 = t4 ? e2.ceil(a3) : e2.max((0 | a3) - this._minBufferSize, 0)) * i3, u3 = e2.min(4 * c3, r3);
        if (c3) {
          for (var l3 = 0; l3 < c3; l3 += i3)
            this._doProcessBlock(s3, l3);
          var h3 = s3.splice(0, c3);
          n4.sigBytes -= u3;
        }
        return new o2.init(h3, u3);
      }, clone: function() {
        var e3 = i2.clone.call(this);
        return e3._data = this._data.clone(), e3;
      }, _minBufferSize: 0 });
      r2.Hasher = h2.extend({ cfg: i2.extend(), init: function(e3) {
        this.cfg = this.cfg.extend(e3), this.reset();
      }, reset: function() {
        h2.reset.call(this), this._doReset();
      }, update: function(e3) {
        return this._append(e3), this._process(), this;
      }, finalize: function(e3) {
        return e3 && this._append(e3), this._doFinalize();
      }, blockSize: 16, _createHelper: function(e3) {
        return function(t4, n4) {
          return new e3.init(n4).finalize(t4);
        };
      }, _createHmacHelper: function(e3) {
        return function(t4, n4) {
          return new d2.HMAC.init(e3, n4).finalize(t4);
        };
      } });
      var d2 = s2.algo = {};
      return s2;
    }(Math), n2);
  }), i = r, o = (s(function(e, t2) {
    var n2;
    e.exports = (n2 = i, function(e2) {
      var t3 = n2, s2 = t3.lib, r2 = s2.WordArray, i2 = s2.Hasher, o2 = t3.algo, a2 = [];
      !function() {
        for (var t4 = 0; t4 < 64; t4++)
          a2[t4] = 4294967296 * e2.abs(e2.sin(t4 + 1)) | 0;
      }();
      var c2 = o2.MD5 = i2.extend({ _doReset: function() {
        this._hash = new r2.init([1732584193, 4023233417, 2562383102, 271733878]);
      }, _doProcessBlock: function(e3, t4) {
        for (var n3 = 0; n3 < 16; n3++) {
          var s3 = t4 + n3, r3 = e3[s3];
          e3[s3] = 16711935 & (r3 << 8 | r3 >>> 24) | 4278255360 & (r3 << 24 | r3 >>> 8);
        }
        var i3 = this._hash.words, o3 = e3[t4 + 0], c3 = e3[t4 + 1], p2 = e3[t4 + 2], f2 = e3[t4 + 3], g2 = e3[t4 + 4], m2 = e3[t4 + 5], y2 = e3[t4 + 6], _2 = e3[t4 + 7], w2 = e3[t4 + 8], v2 = e3[t4 + 9], S2 = e3[t4 + 10], b2 = e3[t4 + 11], k2 = e3[t4 + 12], I2 = e3[t4 + 13], T = e3[t4 + 14], C2 = e3[t4 + 15], A2 = i3[0], P2 = i3[1], E2 = i3[2], O = i3[3];
        A2 = u2(A2, P2, E2, O, o3, 7, a2[0]), O = u2(O, A2, P2, E2, c3, 12, a2[1]), E2 = u2(E2, O, A2, P2, p2, 17, a2[2]), P2 = u2(P2, E2, O, A2, f2, 22, a2[3]), A2 = u2(A2, P2, E2, O, g2, 7, a2[4]), O = u2(O, A2, P2, E2, m2, 12, a2[5]), E2 = u2(E2, O, A2, P2, y2, 17, a2[6]), P2 = u2(P2, E2, O, A2, _2, 22, a2[7]), A2 = u2(A2, P2, E2, O, w2, 7, a2[8]), O = u2(O, A2, P2, E2, v2, 12, a2[9]), E2 = u2(E2, O, A2, P2, S2, 17, a2[10]), P2 = u2(P2, E2, O, A2, b2, 22, a2[11]), A2 = u2(A2, P2, E2, O, k2, 7, a2[12]), O = u2(O, A2, P2, E2, I2, 12, a2[13]), E2 = u2(E2, O, A2, P2, T, 17, a2[14]), A2 = l2(A2, P2 = u2(P2, E2, O, A2, C2, 22, a2[15]), E2, O, c3, 5, a2[16]), O = l2(O, A2, P2, E2, y2, 9, a2[17]), E2 = l2(E2, O, A2, P2, b2, 14, a2[18]), P2 = l2(P2, E2, O, A2, o3, 20, a2[19]), A2 = l2(A2, P2, E2, O, m2, 5, a2[20]), O = l2(O, A2, P2, E2, S2, 9, a2[21]), E2 = l2(E2, O, A2, P2, C2, 14, a2[22]), P2 = l2(P2, E2, O, A2, g2, 20, a2[23]), A2 = l2(A2, P2, E2, O, v2, 5, a2[24]), O = l2(O, A2, P2, E2, T, 9, a2[25]), E2 = l2(E2, O, A2, P2, f2, 14, a2[26]), P2 = l2(P2, E2, O, A2, w2, 20, a2[27]), A2 = l2(A2, P2, E2, O, I2, 5, a2[28]), O = l2(O, A2, P2, E2, p2, 9, a2[29]), E2 = l2(E2, O, A2, P2, _2, 14, a2[30]), A2 = h2(A2, P2 = l2(P2, E2, O, A2, k2, 20, a2[31]), E2, O, m2, 4, a2[32]), O = h2(O, A2, P2, E2, w2, 11, a2[33]), E2 = h2(E2, O, A2, P2, b2, 16, a2[34]), P2 = h2(P2, E2, O, A2, T, 23, a2[35]), A2 = h2(A2, P2, E2, O, c3, 4, a2[36]), O = h2(O, A2, P2, E2, g2, 11, a2[37]), E2 = h2(E2, O, A2, P2, _2, 16, a2[38]), P2 = h2(P2, E2, O, A2, S2, 23, a2[39]), A2 = h2(A2, P2, E2, O, I2, 4, a2[40]), O = h2(O, A2, P2, E2, o3, 11, a2[41]), E2 = h2(E2, O, A2, P2, f2, 16, a2[42]), P2 = h2(P2, E2, O, A2, y2, 23, a2[43]), A2 = h2(A2, P2, E2, O, v2, 4, a2[44]), O = h2(O, A2, P2, E2, k2, 11, a2[45]), E2 = h2(E2, O, A2, P2, C2, 16, a2[46]), A2 = d2(A2, P2 = h2(P2, E2, O, A2, p2, 23, a2[47]), E2, O, o3, 6, a2[48]), O = d2(O, A2, P2, E2, _2, 10, a2[49]), E2 = d2(E2, O, A2, P2, T, 15, a2[50]), P2 = d2(P2, E2, O, A2, m2, 21, a2[51]), A2 = d2(A2, P2, E2, O, k2, 6, a2[52]), O = d2(O, A2, P2, E2, f2, 10, a2[53]), E2 = d2(E2, O, A2, P2, S2, 15, a2[54]), P2 = d2(P2, E2, O, A2, c3, 21, a2[55]), A2 = d2(A2, P2, E2, O, w2, 6, a2[56]), O = d2(O, A2, P2, E2, C2, 10, a2[57]), E2 = d2(E2, O, A2, P2, y2, 15, a2[58]), P2 = d2(P2, E2, O, A2, I2, 21, a2[59]), A2 = d2(A2, P2, E2, O, g2, 6, a2[60]), O = d2(O, A2, P2, E2, b2, 10, a2[61]), E2 = d2(E2, O, A2, P2, p2, 15, a2[62]), P2 = d2(P2, E2, O, A2, v2, 21, a2[63]), i3[0] = i3[0] + A2 | 0, i3[1] = i3[1] + P2 | 0, i3[2] = i3[2] + E2 | 0, i3[3] = i3[3] + O | 0;
      }, _doFinalize: function() {
        var t4 = this._data, n3 = t4.words, s3 = 8 * this._nDataBytes, r3 = 8 * t4.sigBytes;
        n3[r3 >>> 5] |= 128 << 24 - r3 % 32;
        var i3 = e2.floor(s3 / 4294967296), o3 = s3;
        n3[15 + (r3 + 64 >>> 9 << 4)] = 16711935 & (i3 << 8 | i3 >>> 24) | 4278255360 & (i3 << 24 | i3 >>> 8), n3[14 + (r3 + 64 >>> 9 << 4)] = 16711935 & (o3 << 8 | o3 >>> 24) | 4278255360 & (o3 << 24 | o3 >>> 8), t4.sigBytes = 4 * (n3.length + 1), this._process();
        for (var a3 = this._hash, c3 = a3.words, u3 = 0; u3 < 4; u3++) {
          var l3 = c3[u3];
          c3[u3] = 16711935 & (l3 << 8 | l3 >>> 24) | 4278255360 & (l3 << 24 | l3 >>> 8);
        }
        return a3;
      }, clone: function() {
        var e3 = i2.clone.call(this);
        return e3._hash = this._hash.clone(), e3;
      } });
      function u2(e3, t4, n3, s3, r3, i3, o3) {
        var a3 = e3 + (t4 & n3 | ~t4 & s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function l2(e3, t4, n3, s3, r3, i3, o3) {
        var a3 = e3 + (t4 & s3 | n3 & ~s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function h2(e3, t4, n3, s3, r3, i3, o3) {
        var a3 = e3 + (t4 ^ n3 ^ s3) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      function d2(e3, t4, n3, s3, r3, i3, o3) {
        var a3 = e3 + (n3 ^ (t4 | ~s3)) + r3 + o3;
        return (a3 << i3 | a3 >>> 32 - i3) + t4;
      }
      t3.MD5 = i2._createHelper(c2), t3.HmacMD5 = i2._createHmacHelper(c2);
    }(Math), n2.MD5);
  }), s(function(e, t2) {
    var n2;
    e.exports = (n2 = i, void function() {
      var e2 = n2, t3 = e2.lib.Base, s2 = e2.enc.Utf8;
      e2.algo.HMAC = t3.extend({ init: function(e3, t4) {
        e3 = this._hasher = new e3.init(), "string" == typeof t4 && (t4 = s2.parse(t4));
        var n3 = e3.blockSize, r2 = 4 * n3;
        t4.sigBytes > r2 && (t4 = e3.finalize(t4)), t4.clamp();
        for (var i2 = this._oKey = t4.clone(), o2 = this._iKey = t4.clone(), a2 = i2.words, c2 = o2.words, u2 = 0; u2 < n3; u2++)
          a2[u2] ^= 1549556828, c2[u2] ^= 909522486;
        i2.sigBytes = o2.sigBytes = r2, this.reset();
      }, reset: function() {
        var e3 = this._hasher;
        e3.reset(), e3.update(this._iKey);
      }, update: function(e3) {
        return this._hasher.update(e3), this;
      }, finalize: function(e3) {
        var t4 = this._hasher, n3 = t4.finalize(e3);
        return t4.reset(), t4.finalize(this._oKey.clone().concat(n3));
      } });
    }());
  }), s(function(e, t2) {
    e.exports = i.HmacMD5;
  })), a = s(function(e, t2) {
    e.exports = i.enc.Utf8;
  }), c = s(function(e, t2) {
    var n2;
    e.exports = (n2 = i, function() {
      var e2 = n2, t3 = e2.lib.WordArray;
      function s2(e3, n3, s3) {
        for (var r2 = [], i2 = 0, o2 = 0; o2 < n3; o2++)
          if (o2 % 4) {
            var a2 = s3[e3.charCodeAt(o2 - 1)] << o2 % 4 * 2, c2 = s3[e3.charCodeAt(o2)] >>> 6 - o2 % 4 * 2;
            r2[i2 >>> 2] |= (a2 | c2) << 24 - i2 % 4 * 8, i2++;
          }
        return t3.create(r2, i2);
      }
      e2.enc.Base64 = { stringify: function(e3) {
        var t4 = e3.words, n3 = e3.sigBytes, s3 = this._map;
        e3.clamp();
        for (var r2 = [], i2 = 0; i2 < n3; i2 += 3)
          for (var o2 = (t4[i2 >>> 2] >>> 24 - i2 % 4 * 8 & 255) << 16 | (t4[i2 + 1 >>> 2] >>> 24 - (i2 + 1) % 4 * 8 & 255) << 8 | t4[i2 + 2 >>> 2] >>> 24 - (i2 + 2) % 4 * 8 & 255, a2 = 0; a2 < 4 && i2 + 0.75 * a2 < n3; a2++)
            r2.push(s3.charAt(o2 >>> 6 * (3 - a2) & 63));
        var c2 = s3.charAt(64);
        if (c2)
          for (; r2.length % 4; )
            r2.push(c2);
        return r2.join("");
      }, parse: function(e3) {
        var t4 = e3.length, n3 = this._map, r2 = this._reverseMap;
        if (!r2) {
          r2 = this._reverseMap = [];
          for (var i2 = 0; i2 < n3.length; i2++)
            r2[n3.charCodeAt(i2)] = i2;
        }
        var o2 = n3.charAt(64);
        if (o2) {
          var a2 = e3.indexOf(o2);
          -1 !== a2 && (t4 = a2);
        }
        return s2(e3, t4, r2);
      }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=" };
    }(), n2.enc.Base64);
  });
  const u = "FUNCTION", l = "OBJECT", h = "CLIENT_DB", d = "pending", p = "fullfilled", f = "rejected";
  function g(e) {
    return Object.prototype.toString.call(e).slice(8, -1).toLowerCase();
  }
  function m(e) {
    return "object" === g(e);
  }
  function y(e) {
    return "function" == typeof e;
  }
  function _(e) {
    return function() {
      try {
        return e.apply(e, arguments);
      } catch (e2) {
        console.error(e2);
      }
    };
  }
  const w = "REJECTED", v = "NOT_PENDING";
  class S {
    constructor({ createPromise: e, retryRule: t2 = w } = {}) {
      this.createPromise = e, this.status = null, this.promise = null, this.retryRule = t2;
    }
    get needRetry() {
      if (!this.status)
        return true;
      switch (this.retryRule) {
        case w:
          return this.status === f;
        case v:
          return this.status !== d;
      }
    }
    exec() {
      return this.needRetry ? (this.status = d, this.promise = this.createPromise().then((e) => (this.status = p, Promise.resolve(e)), (e) => (this.status = f, Promise.reject(e))), this.promise) : this.promise;
    }
  }
  function b(e) {
    return e && "string" == typeof e ? JSON.parse(e) : e;
  }
  const k = true, I = "app", C = b([]), A = I, P = b(""), E = b("[]") || [];
  let x = "";
  try {
    x = "__UNI__DB81A15";
  } catch (e) {
  }
  let R = {};
  function U(e, t2 = {}) {
    var n2, s2;
    return n2 = R, s2 = e, Object.prototype.hasOwnProperty.call(n2, s2) || (R[e] = t2), R[e];
  }
  R = uni._globalUniCloudObj ? uni._globalUniCloudObj : uni._globalUniCloudObj = {};
  const L = ["invoke", "success", "fail", "complete"], N = U("_globalUniCloudInterceptor");
  function D(e, t2) {
    N[e] || (N[e] = {}), m(t2) && Object.keys(t2).forEach((n2) => {
      L.indexOf(n2) > -1 && function(e2, t3, n3) {
        let s2 = N[e2][t3];
        s2 || (s2 = N[e2][t3] = []), -1 === s2.indexOf(n3) && y(n3) && s2.push(n3);
      }(e, n2, t2[n2]);
    });
  }
  function F(e, t2) {
    N[e] || (N[e] = {}), m(t2) ? Object.keys(t2).forEach((n2) => {
      L.indexOf(n2) > -1 && function(e2, t3, n3) {
        const s2 = N[e2][t3];
        if (!s2)
          return;
        const r2 = s2.indexOf(n3);
        r2 > -1 && s2.splice(r2, 1);
      }(e, n2, t2[n2]);
    }) : delete N[e];
  }
  function q(e, t2) {
    return e && 0 !== e.length ? e.reduce((e2, n2) => e2.then(() => n2(t2)), Promise.resolve()) : Promise.resolve();
  }
  function K(e, t2) {
    return N[e] && N[e][t2] || [];
  }
  function M(e) {
    D("callObject", e);
  }
  const j = U("_globalUniCloudListener"), B = "response", $ = "needLogin", W = "refreshToken", z = "clientdb", J = "cloudfunction", H = "cloudobject";
  function G(e) {
    return j[e] || (j[e] = []), j[e];
  }
  function V(e, t2) {
    const n2 = G(e);
    n2.includes(t2) || n2.push(t2);
  }
  function Y(e, t2) {
    const n2 = G(e), s2 = n2.indexOf(t2);
    -1 !== s2 && n2.splice(s2, 1);
  }
  function Q(e, t2) {
    const n2 = G(e);
    for (let e2 = 0; e2 < n2.length; e2++) {
      (0, n2[e2])(t2);
    }
  }
  let X, Z = false;
  function ee() {
    return X || (X = new Promise((e) => {
      Z && e(), function t2() {
        if ("function" == typeof getCurrentPages) {
          const t3 = getCurrentPages();
          t3 && t3[0] && (Z = true, e());
        }
        Z || setTimeout(() => {
          t2();
        }, 30);
      }();
    }), X);
  }
  function te(e) {
    const t2 = {};
    for (const n2 in e) {
      const s2 = e[n2];
      y(s2) && (t2[n2] = _(s2));
    }
    return t2;
  }
  class ne extends Error {
    constructor(e) {
      super(e.message), this.errMsg = e.message || e.errMsg || "unknown system error", this.code = this.errCode = e.code || e.errCode || "SYSTEM_ERROR", this.errSubject = this.subject = e.subject || e.errSubject, this.cause = e.cause, this.requestId = e.requestId;
    }
    toJson(e = 0) {
      if (!(e >= 10))
        return e++, { errCode: this.errCode, errMsg: this.errMsg, errSubject: this.errSubject, cause: this.cause && this.cause.toJson ? this.cause.toJson(e) : this.cause };
    }
  }
  var se = { request: (e) => uni.request(e), uploadFile: (e) => uni.uploadFile(e), setStorageSync: (e, t2) => uni.setStorageSync(e, t2), getStorageSync: (e) => uni.getStorageSync(e), removeStorageSync: (e) => uni.removeStorageSync(e), clearStorageSync: () => uni.clearStorageSync() };
  function re(e) {
    return e && re(e.__v_raw) || e;
  }
  function ie() {
    return { token: se.getStorageSync("uni_id_token") || se.getStorageSync("uniIdToken"), tokenExpired: se.getStorageSync("uni_id_token_expired") };
  }
  function oe({ token: e, tokenExpired: t2 } = {}) {
    e && se.setStorageSync("uni_id_token", e), t2 && se.setStorageSync("uni_id_token_expired", t2);
  }
  let ae, ce;
  function ue() {
    return ae || (ae = uni.getSystemInfoSync()), ae;
  }
  function le() {
    let e, t2;
    try {
      if (uni.getLaunchOptionsSync) {
        if (uni.getLaunchOptionsSync.toString().indexOf("not yet implemented") > -1)
          return;
        const { scene: n2, channel: s2 } = uni.getLaunchOptionsSync();
        e = s2, t2 = n2;
      }
    } catch (e2) {
    }
    return { channel: e, scene: t2 };
  }
  function he() {
    const e = uni.getLocale && uni.getLocale() || "en";
    if (ce)
      return { ...ce, locale: e, LOCALE: e };
    const t2 = ue(), { deviceId: n2, osName: s2, uniPlatform: r2, appId: i2 } = t2, o2 = ["pixelRatio", "brand", "model", "system", "language", "version", "platform", "host", "SDKVersion", "swanNativeVersion", "app", "AppPlatform", "fontSizeSetting"];
    for (let e2 = 0; e2 < o2.length; e2++) {
      delete t2[o2[e2]];
    }
    return ce = { PLATFORM: r2, OS: s2, APPID: i2, DEVICEID: n2, ...le(), ...t2 }, { ...ce, locale: e, LOCALE: e };
  }
  var de = { sign: function(e, t2) {
    let n2 = "";
    return Object.keys(e).sort().forEach(function(t3) {
      e[t3] && (n2 = n2 + "&" + t3 + "=" + e[t3]);
    }), n2 = n2.slice(1), o(n2, t2).toString();
  }, wrappedRequest: function(e, t2) {
    return new Promise((n2, s2) => {
      t2(Object.assign(e, { complete(e2) {
        e2 || (e2 = {});
        const t3 = e2.data && e2.data.header && e2.data.header["x-serverless-request-id"] || e2.header && e2.header["request-id"];
        if (!e2.statusCode || e2.statusCode >= 400)
          return s2(new ne({ code: "SYS_ERR", message: e2.errMsg || "request:fail", requestId: t3 }));
        const r2 = e2.data;
        if (r2.error)
          return s2(new ne({ code: r2.error.code, message: r2.error.message, requestId: t3 }));
        r2.result = r2.data, r2.requestId = t3, delete r2.data, n2(r2);
      } }));
    });
  }, toBase64: function(e) {
    return c.stringify(a.parse(e));
  } }, pe = { "uniCloud.init.paramRequired": "{param} required", "uniCloud.uploadFile.fileError": "filePath should be instance of File" };
  const { t: fe } = initVueI18n({ "zh-Hans": { "uniCloud.init.paramRequired": "缺少参数：{param}", "uniCloud.uploadFile.fileError": "filePath应为File对象" }, "zh-Hant": { "uniCloud.init.paramRequired": "缺少参数：{param}", "uniCloud.uploadFile.fileError": "filePath应为File对象" }, en: pe, fr: { "uniCloud.init.paramRequired": "{param} required", "uniCloud.uploadFile.fileError": "filePath should be instance of File" }, es: { "uniCloud.init.paramRequired": "{param} required", "uniCloud.uploadFile.fileError": "filePath should be instance of File" }, ja: pe }, "zh-Hans");
  var ge = class {
    constructor(e) {
      ["spaceId", "clientSecret"].forEach((t2) => {
        if (!Object.prototype.hasOwnProperty.call(e, t2))
          throw new Error(fe("uniCloud.init.paramRequired", { param: t2 }));
      }), this.config = Object.assign({}, { endpoint: 0 === e.spaceId.indexOf("mp-") ? "https://api.next.bspapp.com" : "https://api.bspapp.com" }, e), this.config.provider = "aliyun", this.config.requestUrl = this.config.endpoint + "/client", this.config.envType = this.config.envType || "public", this.config.accessTokenKey = "access_token_" + this.config.spaceId, this.adapter = se, this._getAccessTokenPromiseHub = new S({ createPromise: () => this.requestAuth(this.setupRequest({ method: "serverless.auth.user.anonymousAuthorize", params: "{}" }, "auth")).then((e2) => {
        if (!e2.result || !e2.result.accessToken)
          throw new ne({ code: "AUTH_FAILED", message: "获取accessToken失败" });
        this.setAccessToken(e2.result.accessToken);
      }), retryRule: v });
    }
    get hasAccessToken() {
      return !!this.accessToken;
    }
    setAccessToken(e) {
      this.accessToken = e;
    }
    requestWrapped(e) {
      return de.wrappedRequest(e, this.adapter.request);
    }
    requestAuth(e) {
      return this.requestWrapped(e);
    }
    request(e, t2) {
      return Promise.resolve().then(() => this.hasAccessToken ? t2 ? this.requestWrapped(e) : this.requestWrapped(e).catch((t3) => new Promise((e2, n2) => {
        !t3 || "GATEWAY_INVALID_TOKEN" !== t3.code && "InvalidParameter.InvalidToken" !== t3.code ? n2(t3) : e2();
      }).then(() => this.getAccessToken()).then(() => {
        const t4 = this.rebuildRequest(e);
        return this.request(t4, true);
      })) : this.getAccessToken().then(() => {
        const t3 = this.rebuildRequest(e);
        return this.request(t3, true);
      }));
    }
    rebuildRequest(e) {
      const t2 = Object.assign({}, e);
      return t2.data.token = this.accessToken, t2.header["x-basement-token"] = this.accessToken, t2.header["x-serverless-sign"] = de.sign(t2.data, this.config.clientSecret), t2;
    }
    setupRequest(e, t2) {
      const n2 = Object.assign({}, e, { spaceId: this.config.spaceId, timestamp: Date.now() }), s2 = { "Content-Type": "application/json" };
      return "auth" !== t2 && (n2.token = this.accessToken, s2["x-basement-token"] = this.accessToken), s2["x-serverless-sign"] = de.sign(n2, this.config.clientSecret), { url: this.config.requestUrl, method: "POST", data: n2, dataType: "json", header: s2 };
    }
    getAccessToken() {
      return this._getAccessTokenPromiseHub.exec();
    }
    async authorize() {
      await this.getAccessToken();
    }
    callFunction(e) {
      const t2 = { method: "serverless.function.runtime.invoke", params: JSON.stringify({ functionTarget: e.name, functionArgs: e.data || {} }) };
      return this.request(this.setupRequest(t2));
    }
    getOSSUploadOptionsFromPath(e) {
      const t2 = { method: "serverless.file.resource.generateProximalSign", params: JSON.stringify(e) };
      return this.request(this.setupRequest(t2));
    }
    uploadFileToOSS({ url: e, formData: t2, name: n2, filePath: s2, fileType: r2, onUploadProgress: i2 }) {
      return new Promise((o2, a2) => {
        const c2 = this.adapter.uploadFile({ url: e, formData: t2, name: n2, filePath: s2, fileType: r2, header: { "X-OSS-server-side-encrpytion": "AES256" }, success(e2) {
          e2 && e2.statusCode < 400 ? o2(e2) : a2(new ne({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
        }, fail(e2) {
          a2(new ne({ code: e2.code || "UPLOAD_FAILED", message: e2.message || e2.errMsg || "文件上传失败" }));
        } });
        "function" == typeof i2 && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((e2) => {
          i2({ loaded: e2.totalBytesSent, total: e2.totalBytesExpectedToSend });
        });
      });
    }
    reportOSSUpload(e) {
      const t2 = { method: "serverless.file.resource.report", params: JSON.stringify(e) };
      return this.request(this.setupRequest(t2));
    }
    async uploadFile({ filePath: e, cloudPath: t2, fileType: n2 = "image", onUploadProgress: s2, config: r2 }) {
      if ("string" !== g(t2))
        throw new ne({ code: "INVALID_PARAM", message: "cloudPath必须为字符串类型" });
      if (!(t2 = t2.trim()))
        throw new ne({ code: "CLOUDPATH_REQUIRED", message: "cloudPath不可为空" });
      if (/:\/\//.test(t2))
        throw new ne({ code: "INVALID_PARAM", message: "cloudPath不合法" });
      const i2 = r2 && r2.envType || this.config.envType, o2 = (await this.getOSSUploadOptionsFromPath({ env: i2, filename: t2 })).result, a2 = "https://" + o2.cdnDomain + "/" + o2.ossPath, { securityToken: c2, accessKeyId: u2, signature: l2, host: h2, ossPath: d2, id: p2, policy: f2, ossCallbackUrl: m2 } = o2, y2 = { "Cache-Control": "max-age=2592000", "Content-Disposition": "attachment", OSSAccessKeyId: u2, Signature: l2, host: h2, id: p2, key: d2, policy: f2, success_action_status: 200 };
      if (c2 && (y2["x-oss-security-token"] = c2), m2) {
        const e2 = JSON.stringify({ callbackUrl: m2, callbackBody: JSON.stringify({ fileId: p2, spaceId: this.config.spaceId }), callbackBodyType: "application/json" });
        y2.callback = de.toBase64(e2);
      }
      const _2 = { url: "https://" + o2.host, formData: y2, fileName: "file", name: "file", filePath: e, fileType: n2 };
      if (await this.uploadFileToOSS(Object.assign({}, _2, { onUploadProgress: s2 })), m2)
        return { success: true, filePath: e, fileID: a2 };
      if ((await this.reportOSSUpload({ id: p2 })).success)
        return { success: true, filePath: e, fileID: a2 };
      throw new ne({ code: "UPLOAD_FAILED", message: "文件上传失败" });
    }
    getTempFileURL({ fileList: e } = {}) {
      return new Promise((t2, n2) => {
        Array.isArray(e) && 0 !== e.length || n2(new ne({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" })), t2({ fileList: e.map((e2) => ({ fileID: e2, tempFileURL: e2 })) });
      });
    }
    async getFileInfo({ fileList: e } = {}) {
      if (!Array.isArray(e) || 0 === e.length)
        throw new ne({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
      const t2 = { method: "serverless.file.resource.info", params: JSON.stringify({ id: e.map((e2) => e2.split("?")[0]).join(",") }) };
      return { fileList: (await this.request(this.setupRequest(t2))).result };
    }
  };
  var me = { init(e) {
    const t2 = new ge(e), n2 = { signInAnonymously: function() {
      return t2.authorize();
    }, getLoginState: function() {
      return Promise.resolve(false);
    } };
    return t2.auth = function() {
      return n2;
    }, t2.customAuth = t2.auth, t2;
  } };
  const ye = "undefined" != typeof location && "http:" === location.protocol ? "http:" : "https:";
  var _e;
  !function(e) {
    e.local = "local", e.none = "none", e.session = "session";
  }(_e || (_e = {}));
  var we = function() {
  };
  const ve = () => {
    let e;
    if (!Promise) {
      e = () => {
      }, e.promise = {};
      const t3 = () => {
        throw new ne({ message: 'Your Node runtime does support ES6 Promises. Set "global.Promise" to your preferred implementation of promises.' });
      };
      return Object.defineProperty(e.promise, "then", { get: t3 }), Object.defineProperty(e.promise, "catch", { get: t3 }), e;
    }
    const t2 = new Promise((t3, n2) => {
      e = (e2, s2) => e2 ? n2(e2) : t3(s2);
    });
    return e.promise = t2, e;
  };
  function Se(e) {
    return void 0 === e;
  }
  function be(e) {
    return "[object Null]" === Object.prototype.toString.call(e);
  }
  var ke;
  function Ie(e) {
    const t2 = (n2 = e, "[object Array]" === Object.prototype.toString.call(n2) ? e : [e]);
    var n2;
    for (const e2 of t2) {
      const { isMatch: t3, genAdapter: n3, runtime: s2 } = e2;
      if (t3())
        return { adapter: n3(), runtime: s2 };
    }
  }
  !function(e) {
    e.WEB = "web", e.WX_MP = "wx_mp";
  }(ke || (ke = {}));
  const Te = { adapter: null, runtime: void 0 }, Ce = ["anonymousUuidKey"];
  class Ae extends we {
    constructor() {
      super(), Te.adapter.root.tcbObject || (Te.adapter.root.tcbObject = {});
    }
    setItem(e, t2) {
      Te.adapter.root.tcbObject[e] = t2;
    }
    getItem(e) {
      return Te.adapter.root.tcbObject[e];
    }
    removeItem(e) {
      delete Te.adapter.root.tcbObject[e];
    }
    clear() {
      delete Te.adapter.root.tcbObject;
    }
  }
  function Pe(e, t2) {
    switch (e) {
      case "local":
        return t2.localStorage || new Ae();
      case "none":
        return new Ae();
      default:
        return t2.sessionStorage || new Ae();
    }
  }
  class Ee {
    constructor(e) {
      if (!this._storage) {
        this._persistence = Te.adapter.primaryStorage || e.persistence, this._storage = Pe(this._persistence, Te.adapter);
        const t2 = `access_token_${e.env}`, n2 = `access_token_expire_${e.env}`, s2 = `refresh_token_${e.env}`, r2 = `anonymous_uuid_${e.env}`, i2 = `login_type_${e.env}`, o2 = `user_info_${e.env}`;
        this.keys = { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2, anonymousUuidKey: r2, loginTypeKey: i2, userInfoKey: o2 };
      }
    }
    updatePersistence(e) {
      if (e === this._persistence)
        return;
      const t2 = "local" === this._persistence;
      this._persistence = e;
      const n2 = Pe(e, Te.adapter);
      for (const e2 in this.keys) {
        const s2 = this.keys[e2];
        if (t2 && Ce.includes(e2))
          continue;
        const r2 = this._storage.getItem(s2);
        Se(r2) || be(r2) || (n2.setItem(s2, r2), this._storage.removeItem(s2));
      }
      this._storage = n2;
    }
    setStore(e, t2, n2) {
      if (!this._storage)
        return;
      const s2 = { version: n2 || "localCachev1", content: t2 }, r2 = JSON.stringify(s2);
      try {
        this._storage.setItem(e, r2);
      } catch (e2) {
        throw e2;
      }
    }
    getStore(e, t2) {
      try {
        if (!this._storage)
          return;
      } catch (e2) {
        return "";
      }
      t2 = t2 || "localCachev1";
      const n2 = this._storage.getItem(e);
      if (!n2)
        return "";
      if (n2.indexOf(t2) >= 0) {
        return JSON.parse(n2).content;
      }
      return "";
    }
    removeStore(e) {
      this._storage.removeItem(e);
    }
  }
  const Oe = {}, xe = {};
  function Re(e) {
    return Oe[e];
  }
  class Ue {
    constructor(e, t2) {
      this.data = t2 || null, this.name = e;
    }
  }
  class Le extends Ue {
    constructor(e, t2) {
      super("error", { error: e, data: t2 }), this.error = e;
    }
  }
  const Ne = new class {
    constructor() {
      this._listeners = {};
    }
    on(e, t2) {
      return function(e2, t3, n2) {
        n2[e2] = n2[e2] || [], n2[e2].push(t3);
      }(e, t2, this._listeners), this;
    }
    off(e, t2) {
      return function(e2, t3, n2) {
        if (n2 && n2[e2]) {
          const s2 = n2[e2].indexOf(t3);
          -1 !== s2 && n2[e2].splice(s2, 1);
        }
      }(e, t2, this._listeners), this;
    }
    fire(e, t2) {
      if (e instanceof Le)
        return console.error(e.error), this;
      const n2 = "string" == typeof e ? new Ue(e, t2 || {}) : e;
      const s2 = n2.name;
      if (this._listens(s2)) {
        n2.target = this;
        const e2 = this._listeners[s2] ? [...this._listeners[s2]] : [];
        for (const t3 of e2)
          t3.call(this, n2);
      }
      return this;
    }
    _listens(e) {
      return this._listeners[e] && this._listeners[e].length > 0;
    }
  }();
  function De(e, t2) {
    Ne.on(e, t2);
  }
  function Fe(e, t2 = {}) {
    Ne.fire(e, t2);
  }
  function qe(e, t2) {
    Ne.off(e, t2);
  }
  const Ke = "loginStateChanged", Me = "loginStateExpire", je = "loginTypeChanged", Be = "anonymousConverted", $e = "refreshAccessToken";
  var We;
  !function(e) {
    e.ANONYMOUS = "ANONYMOUS", e.WECHAT = "WECHAT", e.WECHAT_PUBLIC = "WECHAT-PUBLIC", e.WECHAT_OPEN = "WECHAT-OPEN", e.CUSTOM = "CUSTOM", e.EMAIL = "EMAIL", e.USERNAME = "USERNAME", e.NULL = "NULL";
  }(We || (We = {}));
  const ze = ["auth.getJwt", "auth.logout", "auth.signInWithTicket", "auth.signInAnonymously", "auth.signIn", "auth.fetchAccessTokenWithRefreshToken", "auth.signUpWithEmailAndPassword", "auth.activateEndUserMail", "auth.sendPasswordResetEmail", "auth.resetPasswordWithToken", "auth.isUsernameRegistered"], Je = { "X-SDK-Version": "1.3.5" };
  function He(e, t2, n2) {
    const s2 = e[t2];
    e[t2] = function(t3) {
      const r2 = {}, i2 = {};
      n2.forEach((n3) => {
        const { data: s3, headers: o3 } = n3.call(e, t3);
        Object.assign(r2, s3), Object.assign(i2, o3);
      });
      const o2 = t3.data;
      return o2 && (() => {
        var e2;
        if (e2 = o2, "[object FormData]" !== Object.prototype.toString.call(e2))
          t3.data = { ...o2, ...r2 };
        else
          for (const e3 in r2)
            o2.append(e3, r2[e3]);
      })(), t3.headers = { ...t3.headers || {}, ...i2 }, s2.call(e, t3);
    };
  }
  function Ge() {
    const e = Math.random().toString(16).slice(2);
    return { data: { seqId: e }, headers: { ...Je, "x-seqid": e } };
  }
  class Ve {
    constructor(e = {}) {
      var t2;
      this.config = e, this._reqClass = new Te.adapter.reqClass({ timeout: this.config.timeout, timeoutMsg: `请求在${this.config.timeout / 1e3}s内未完成，已中断`, restrictedMethods: ["post"] }), this._cache = Re(this.config.env), this._localCache = (t2 = this.config.env, xe[t2]), He(this._reqClass, "post", [Ge]), He(this._reqClass, "upload", [Ge]), He(this._reqClass, "download", [Ge]);
    }
    async post(e) {
      return await this._reqClass.post(e);
    }
    async upload(e) {
      return await this._reqClass.upload(e);
    }
    async download(e) {
      return await this._reqClass.download(e);
    }
    async refreshAccessToken() {
      let e, t2;
      this._refreshAccessTokenPromise || (this._refreshAccessTokenPromise = this._refreshAccessToken());
      try {
        e = await this._refreshAccessTokenPromise;
      } catch (e2) {
        t2 = e2;
      }
      if (this._refreshAccessTokenPromise = null, this._shouldRefreshAccessTokenHook = null, t2)
        throw t2;
      return e;
    }
    async _refreshAccessToken() {
      const { accessTokenKey: e, accessTokenExpireKey: t2, refreshTokenKey: n2, loginTypeKey: s2, anonymousUuidKey: r2 } = this._cache.keys;
      this._cache.removeStore(e), this._cache.removeStore(t2);
      let i2 = this._cache.getStore(n2);
      if (!i2)
        throw new ne({ message: "未登录CloudBase" });
      const o2 = { refresh_token: i2 }, a2 = await this.request("auth.fetchAccessTokenWithRefreshToken", o2);
      if (a2.data.code) {
        const { code: e2 } = a2.data;
        if ("SIGN_PARAM_INVALID" === e2 || "REFRESH_TOKEN_EXPIRED" === e2 || "INVALID_REFRESH_TOKEN" === e2) {
          if (this._cache.getStore(s2) === We.ANONYMOUS && "INVALID_REFRESH_TOKEN" === e2) {
            const e3 = this._cache.getStore(r2), t3 = this._cache.getStore(n2), s3 = await this.send("auth.signInAnonymously", { anonymous_uuid: e3, refresh_token: t3 });
            return this.setRefreshToken(s3.refresh_token), this._refreshAccessToken();
          }
          Fe(Me), this._cache.removeStore(n2);
        }
        throw new ne({ code: a2.data.code, message: `刷新access token失败：${a2.data.code}` });
      }
      if (a2.data.access_token)
        return Fe($e), this._cache.setStore(e, a2.data.access_token), this._cache.setStore(t2, a2.data.access_token_expire + Date.now()), { accessToken: a2.data.access_token, accessTokenExpire: a2.data.access_token_expire };
      a2.data.refresh_token && (this._cache.removeStore(n2), this._cache.setStore(n2, a2.data.refresh_token), this._refreshAccessToken());
    }
    async getAccessToken() {
      const { accessTokenKey: e, accessTokenExpireKey: t2, refreshTokenKey: n2 } = this._cache.keys;
      if (!this._cache.getStore(n2))
        throw new ne({ message: "refresh token不存在，登录状态异常" });
      let s2 = this._cache.getStore(e), r2 = this._cache.getStore(t2), i2 = true;
      return this._shouldRefreshAccessTokenHook && !await this._shouldRefreshAccessTokenHook(s2, r2) && (i2 = false), (!s2 || !r2 || r2 < Date.now()) && i2 ? this.refreshAccessToken() : { accessToken: s2, accessTokenExpire: r2 };
    }
    async request(e, t2, n2) {
      const s2 = `x-tcb-trace_${this.config.env}`;
      let r2 = "application/x-www-form-urlencoded";
      const i2 = { action: e, env: this.config.env, dataVersion: "2019-08-16", ...t2 };
      if (-1 === ze.indexOf(e)) {
        const { refreshTokenKey: e2 } = this._cache.keys;
        this._cache.getStore(e2) && (i2.access_token = (await this.getAccessToken()).accessToken);
      }
      let o2;
      if ("storage.uploadFile" === e) {
        o2 = new FormData();
        for (let e2 in o2)
          o2.hasOwnProperty(e2) && void 0 !== o2[e2] && o2.append(e2, i2[e2]);
        r2 = "multipart/form-data";
      } else {
        r2 = "application/json", o2 = {};
        for (let e2 in i2)
          void 0 !== i2[e2] && (o2[e2] = i2[e2]);
      }
      let a2 = { headers: { "content-type": r2 } };
      n2 && n2.onUploadProgress && (a2.onUploadProgress = n2.onUploadProgress);
      const c2 = this._localCache.getStore(s2);
      c2 && (a2.headers["X-TCB-Trace"] = c2);
      const { parse: u2, inQuery: l2, search: h2 } = t2;
      let d2 = { env: this.config.env };
      u2 && (d2.parse = true), l2 && (d2 = { ...l2, ...d2 });
      let p2 = function(e2, t3, n3 = {}) {
        const s3 = /\?/.test(t3);
        let r3 = "";
        for (let e3 in n3)
          "" === r3 ? !s3 && (t3 += "?") : r3 += "&", r3 += `${e3}=${encodeURIComponent(n3[e3])}`;
        return /^http(s)?\:\/\//.test(t3 += r3) ? t3 : `${e2}${t3}`;
      }(ye, "//tcb-api.tencentcloudapi.com/web", d2);
      h2 && (p2 += h2);
      const f2 = await this.post({ url: p2, data: o2, ...a2 }), g2 = f2.header && f2.header["x-tcb-trace"];
      if (g2 && this._localCache.setStore(s2, g2), 200 !== Number(f2.status) && 200 !== Number(f2.statusCode) || !f2.data)
        throw new ne({ code: "NETWORK_ERROR", message: "network request error" });
      return f2;
    }
    async send(e, t2 = {}) {
      const n2 = await this.request(e, t2, { onUploadProgress: t2.onUploadProgress });
      if ("ACCESS_TOKEN_EXPIRED" === n2.data.code && -1 === ze.indexOf(e)) {
        await this.refreshAccessToken();
        const n3 = await this.request(e, t2, { onUploadProgress: t2.onUploadProgress });
        if (n3.data.code)
          throw new ne({ code: n3.data.code, message: n3.data.message });
        return n3.data;
      }
      if (n2.data.code)
        throw new ne({ code: n2.data.code, message: n2.data.message });
      return n2.data;
    }
    setRefreshToken(e) {
      const { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.removeStore(n2), this._cache.setStore(s2, e);
    }
  }
  const Ye = {};
  function Qe(e) {
    return Ye[e];
  }
  class Xe {
    constructor(e) {
      this.config = e, this._cache = Re(e.env), this._request = Qe(e.env);
    }
    setRefreshToken(e) {
      const { accessTokenKey: t2, accessTokenExpireKey: n2, refreshTokenKey: s2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.removeStore(n2), this._cache.setStore(s2, e);
    }
    setAccessToken(e, t2) {
      const { accessTokenKey: n2, accessTokenExpireKey: s2 } = this._cache.keys;
      this._cache.setStore(n2, e), this._cache.setStore(s2, t2);
    }
    async refreshUserInfo() {
      const { data: e } = await this._request.send("auth.getUserInfo", {});
      return this.setLocalUserInfo(e), e;
    }
    setLocalUserInfo(e) {
      const { userInfoKey: t2 } = this._cache.keys;
      this._cache.setStore(t2, e);
    }
  }
  class Ze {
    constructor(e) {
      if (!e)
        throw new ne({ code: "PARAM_ERROR", message: "envId is not defined" });
      this._envId = e, this._cache = Re(this._envId), this._request = Qe(this._envId), this.setUserInfo();
    }
    linkWithTicket(e) {
      if ("string" != typeof e)
        throw new ne({ code: "PARAM_ERROR", message: "ticket must be string" });
      return this._request.send("auth.linkWithTicket", { ticket: e });
    }
    linkWithRedirect(e) {
      e.signInWithRedirect();
    }
    updatePassword(e, t2) {
      return this._request.send("auth.updatePassword", { oldPassword: t2, newPassword: e });
    }
    updateEmail(e) {
      return this._request.send("auth.updateEmail", { newEmail: e });
    }
    updateUsername(e) {
      if ("string" != typeof e)
        throw new ne({ code: "PARAM_ERROR", message: "username must be a string" });
      return this._request.send("auth.updateUsername", { username: e });
    }
    async getLinkedUidList() {
      const { data: e } = await this._request.send("auth.getLinkedUidList", {});
      let t2 = false;
      const { users: n2 } = e;
      return n2.forEach((e2) => {
        e2.wxOpenId && e2.wxPublicId && (t2 = true);
      }), { users: n2, hasPrimaryUid: t2 };
    }
    setPrimaryUid(e) {
      return this._request.send("auth.setPrimaryUid", { uid: e });
    }
    unlink(e) {
      return this._request.send("auth.unlink", { platform: e });
    }
    async update(e) {
      const { nickName: t2, gender: n2, avatarUrl: s2, province: r2, country: i2, city: o2 } = e, { data: a2 } = await this._request.send("auth.updateUserInfo", { nickName: t2, gender: n2, avatarUrl: s2, province: r2, country: i2, city: o2 });
      this.setLocalUserInfo(a2);
    }
    async refresh() {
      const { data: e } = await this._request.send("auth.getUserInfo", {});
      return this.setLocalUserInfo(e), e;
    }
    setUserInfo() {
      const { userInfoKey: e } = this._cache.keys, t2 = this._cache.getStore(e);
      ["uid", "loginType", "openid", "wxOpenId", "wxPublicId", "unionId", "qqMiniOpenId", "email", "hasPassword", "customUserId", "nickName", "gender", "avatarUrl"].forEach((e2) => {
        this[e2] = t2[e2];
      }), this.location = { country: t2.country, province: t2.province, city: t2.city };
    }
    setLocalUserInfo(e) {
      const { userInfoKey: t2 } = this._cache.keys;
      this._cache.setStore(t2, e), this.setUserInfo();
    }
  }
  class et {
    constructor(e) {
      if (!e)
        throw new ne({ code: "PARAM_ERROR", message: "envId is not defined" });
      this._cache = Re(e);
      const { refreshTokenKey: t2, accessTokenKey: n2, accessTokenExpireKey: s2 } = this._cache.keys, r2 = this._cache.getStore(t2), i2 = this._cache.getStore(n2), o2 = this._cache.getStore(s2);
      this.credential = { refreshToken: r2, accessToken: i2, accessTokenExpire: o2 }, this.user = new Ze(e);
    }
    get isAnonymousAuth() {
      return this.loginType === We.ANONYMOUS;
    }
    get isCustomAuth() {
      return this.loginType === We.CUSTOM;
    }
    get isWeixinAuth() {
      return this.loginType === We.WECHAT || this.loginType === We.WECHAT_OPEN || this.loginType === We.WECHAT_PUBLIC;
    }
    get loginType() {
      return this._cache.getStore(this._cache.keys.loginTypeKey);
    }
  }
  class tt extends Xe {
    async signIn() {
      this._cache.updatePersistence("local");
      const { anonymousUuidKey: e, refreshTokenKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e) || void 0, s2 = this._cache.getStore(t2) || void 0, r2 = await this._request.send("auth.signInAnonymously", { anonymous_uuid: n2, refresh_token: s2 });
      if (r2.uuid && r2.refresh_token) {
        this._setAnonymousUUID(r2.uuid), this.setRefreshToken(r2.refresh_token), await this._request.refreshAccessToken(), Fe(Ke), Fe(je, { env: this.config.env, loginType: We.ANONYMOUS, persistence: "local" });
        const e2 = new et(this.config.env);
        return await e2.user.refresh(), e2;
      }
      throw new ne({ message: "匿名登录失败" });
    }
    async linkAndRetrieveDataWithTicket(e) {
      const { anonymousUuidKey: t2, refreshTokenKey: n2 } = this._cache.keys, s2 = this._cache.getStore(t2), r2 = this._cache.getStore(n2), i2 = await this._request.send("auth.linkAndRetrieveDataWithTicket", { anonymous_uuid: s2, refresh_token: r2, ticket: e });
      if (i2.refresh_token)
        return this._clearAnonymousUUID(), this.setRefreshToken(i2.refresh_token), await this._request.refreshAccessToken(), Fe(Be, { env: this.config.env }), Fe(je, { loginType: We.CUSTOM, persistence: "local" }), { credential: { refreshToken: i2.refresh_token } };
      throw new ne({ message: "匿名转化失败" });
    }
    _setAnonymousUUID(e) {
      const { anonymousUuidKey: t2, loginTypeKey: n2 } = this._cache.keys;
      this._cache.removeStore(t2), this._cache.setStore(t2, e), this._cache.setStore(n2, We.ANONYMOUS);
    }
    _clearAnonymousUUID() {
      this._cache.removeStore(this._cache.keys.anonymousUuidKey);
    }
  }
  class nt extends Xe {
    async signIn(e) {
      if ("string" != typeof e)
        throw new ne({ code: "PARAM_ERROR", message: "ticket must be a string" });
      const { refreshTokenKey: t2 } = this._cache.keys, n2 = await this._request.send("auth.signInWithTicket", { ticket: e, refresh_token: this._cache.getStore(t2) || "" });
      if (n2.refresh_token)
        return this.setRefreshToken(n2.refresh_token), await this._request.refreshAccessToken(), Fe(Ke), Fe(je, { env: this.config.env, loginType: We.CUSTOM, persistence: this.config.persistence }), await this.refreshUserInfo(), new et(this.config.env);
      throw new ne({ message: "自定义登录失败" });
    }
  }
  class st extends Xe {
    async signIn(e, t2) {
      if ("string" != typeof e)
        throw new ne({ code: "PARAM_ERROR", message: "email must be a string" });
      const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: "EMAIL", email: e, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token: i2, access_token_expire: o2 } = s2;
      if (r2)
        return this.setRefreshToken(r2), i2 && o2 ? this.setAccessToken(i2, o2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), Fe(Ke), Fe(je, { env: this.config.env, loginType: We.EMAIL, persistence: this.config.persistence }), new et(this.config.env);
      throw s2.code ? new ne({ code: s2.code, message: `邮箱登录失败: ${s2.message}` }) : new ne({ message: "邮箱登录失败" });
    }
    async activate(e) {
      return this._request.send("auth.activateEndUserMail", { token: e });
    }
    async resetPasswordWithToken(e, t2) {
      return this._request.send("auth.resetPasswordWithToken", { token: e, newPassword: t2 });
    }
  }
  class rt extends Xe {
    async signIn(e, t2) {
      if ("string" != typeof e)
        throw new ne({ code: "PARAM_ERROR", message: "username must be a string" });
      "string" != typeof t2 && (t2 = "", console.warn("password is empty"));
      const { refreshTokenKey: n2 } = this._cache.keys, s2 = await this._request.send("auth.signIn", { loginType: We.USERNAME, username: e, password: t2, refresh_token: this._cache.getStore(n2) || "" }), { refresh_token: r2, access_token_expire: i2, access_token: o2 } = s2;
      if (r2)
        return this.setRefreshToken(r2), o2 && i2 ? this.setAccessToken(o2, i2) : await this._request.refreshAccessToken(), await this.refreshUserInfo(), Fe(Ke), Fe(je, { env: this.config.env, loginType: We.USERNAME, persistence: this.config.persistence }), new et(this.config.env);
      throw s2.code ? new ne({ code: s2.code, message: `用户名密码登录失败: ${s2.message}` }) : new ne({ message: "用户名密码登录失败" });
    }
  }
  class it {
    constructor(e) {
      this.config = e, this._cache = Re(e.env), this._request = Qe(e.env), this._onAnonymousConverted = this._onAnonymousConverted.bind(this), this._onLoginTypeChanged = this._onLoginTypeChanged.bind(this), De(je, this._onLoginTypeChanged);
    }
    get currentUser() {
      const e = this.hasLoginState();
      return e && e.user || null;
    }
    get loginType() {
      return this._cache.getStore(this._cache.keys.loginTypeKey);
    }
    anonymousAuthProvider() {
      return new tt(this.config);
    }
    customAuthProvider() {
      return new nt(this.config);
    }
    emailAuthProvider() {
      return new st(this.config);
    }
    usernameAuthProvider() {
      return new rt(this.config);
    }
    async signInAnonymously() {
      return new tt(this.config).signIn();
    }
    async signInWithEmailAndPassword(e, t2) {
      return new st(this.config).signIn(e, t2);
    }
    signInWithUsernameAndPassword(e, t2) {
      return new rt(this.config).signIn(e, t2);
    }
    async linkAndRetrieveDataWithTicket(e) {
      this._anonymousAuthProvider || (this._anonymousAuthProvider = new tt(this.config)), De(Be, this._onAnonymousConverted);
      return await this._anonymousAuthProvider.linkAndRetrieveDataWithTicket(e);
    }
    async signOut() {
      if (this.loginType === We.ANONYMOUS)
        throw new ne({ message: "匿名用户不支持登出操作" });
      const { refreshTokenKey: e, accessTokenKey: t2, accessTokenExpireKey: n2 } = this._cache.keys, s2 = this._cache.getStore(e);
      if (!s2)
        return;
      const r2 = await this._request.send("auth.logout", { refresh_token: s2 });
      return this._cache.removeStore(e), this._cache.removeStore(t2), this._cache.removeStore(n2), Fe(Ke), Fe(je, { env: this.config.env, loginType: We.NULL, persistence: this.config.persistence }), r2;
    }
    async signUpWithEmailAndPassword(e, t2) {
      return this._request.send("auth.signUpWithEmailAndPassword", { email: e, password: t2 });
    }
    async sendPasswordResetEmail(e) {
      return this._request.send("auth.sendPasswordResetEmail", { email: e });
    }
    onLoginStateChanged(e) {
      De(Ke, () => {
        const t3 = this.hasLoginState();
        e.call(this, t3);
      });
      const t2 = this.hasLoginState();
      e.call(this, t2);
    }
    onLoginStateExpired(e) {
      De(Me, e.bind(this));
    }
    onAccessTokenRefreshed(e) {
      De($e, e.bind(this));
    }
    onAnonymousConverted(e) {
      De(Be, e.bind(this));
    }
    onLoginTypeChanged(e) {
      De(je, () => {
        const t2 = this.hasLoginState();
        e.call(this, t2);
      });
    }
    async getAccessToken() {
      return { accessToken: (await this._request.getAccessToken()).accessToken, env: this.config.env };
    }
    hasLoginState() {
      const { refreshTokenKey: e } = this._cache.keys;
      return this._cache.getStore(e) ? new et(this.config.env) : null;
    }
    async isUsernameRegistered(e) {
      if ("string" != typeof e)
        throw new ne({ code: "PARAM_ERROR", message: "username must be a string" });
      const { data: t2 } = await this._request.send("auth.isUsernameRegistered", { username: e });
      return t2 && t2.isRegistered;
    }
    getLoginState() {
      return Promise.resolve(this.hasLoginState());
    }
    async signInWithTicket(e) {
      return new nt(this.config).signIn(e);
    }
    shouldRefreshAccessToken(e) {
      this._request._shouldRefreshAccessTokenHook = e.bind(this);
    }
    getUserInfo() {
      return this._request.send("auth.getUserInfo", {}).then((e) => e.code ? e : { ...e.data, requestId: e.seqId });
    }
    getAuthHeader() {
      const { refreshTokenKey: e, accessTokenKey: t2 } = this._cache.keys, n2 = this._cache.getStore(e);
      return { "x-cloudbase-credentials": this._cache.getStore(t2) + "/@@/" + n2 };
    }
    _onAnonymousConverted(e) {
      const { env: t2 } = e.data;
      t2 === this.config.env && this._cache.updatePersistence(this.config.persistence);
    }
    _onLoginTypeChanged(e) {
      const { loginType: t2, persistence: n2, env: s2 } = e.data;
      s2 === this.config.env && (this._cache.updatePersistence(n2), this._cache.setStore(this._cache.keys.loginTypeKey, t2));
    }
  }
  const ot = function(e, t2) {
    t2 = t2 || ve();
    const n2 = Qe(this.config.env), { cloudPath: s2, filePath: r2, onUploadProgress: i2, fileType: o2 = "image" } = e;
    return n2.send("storage.getUploadMetadata", { path: s2 }).then((e2) => {
      const { data: { url: a2, authorization: c2, token: u2, fileId: l2, cosFileId: h2 }, requestId: d2 } = e2, p2 = { key: s2, signature: c2, "x-cos-meta-fileid": h2, success_action_status: "201", "x-cos-security-token": u2 };
      n2.upload({ url: a2, data: p2, file: r2, name: s2, fileType: o2, onUploadProgress: i2 }).then((e3) => {
        201 === e3.statusCode ? t2(null, { fileID: l2, requestId: d2 }) : t2(new ne({ code: "STORAGE_REQUEST_FAIL", message: `STORAGE_REQUEST_FAIL: ${e3.data}` }));
      }).catch((e3) => {
        t2(e3);
      });
    }).catch((e2) => {
      t2(e2);
    }), t2.promise;
  }, at = function(e, t2) {
    t2 = t2 || ve();
    const n2 = Qe(this.config.env), { cloudPath: s2 } = e;
    return n2.send("storage.getUploadMetadata", { path: s2 }).then((e2) => {
      t2(null, e2);
    }).catch((e2) => {
      t2(e2);
    }), t2.promise;
  }, ct = function({ fileList: e }, t2) {
    if (t2 = t2 || ve(), !e || !Array.isArray(e))
      return { code: "INVALID_PARAM", message: "fileList必须是非空的数组" };
    for (let t3 of e)
      if (!t3 || "string" != typeof t3)
        return { code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" };
    const n2 = { fileid_list: e };
    return Qe(this.config.env).send("storage.batchDeleteFile", n2).then((e2) => {
      e2.code ? t2(null, e2) : t2(null, { fileList: e2.data.delete_list, requestId: e2.requestId });
    }).catch((e2) => {
      t2(e2);
    }), t2.promise;
  }, ut = function({ fileList: e }, t2) {
    t2 = t2 || ve(), e && Array.isArray(e) || t2(null, { code: "INVALID_PARAM", message: "fileList必须是非空的数组" });
    let n2 = [];
    for (let s3 of e)
      "object" == typeof s3 ? (s3.hasOwnProperty("fileID") && s3.hasOwnProperty("maxAge") || t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是包含fileID和maxAge的对象" }), n2.push({ fileid: s3.fileID, max_age: s3.maxAge })) : "string" == typeof s3 ? n2.push({ fileid: s3 }) : t2(null, { code: "INVALID_PARAM", message: "fileList的元素必须是字符串" });
    const s2 = { file_list: n2 };
    return Qe(this.config.env).send("storage.batchGetDownloadUrl", s2).then((e2) => {
      e2.code ? t2(null, e2) : t2(null, { fileList: e2.data.download_list, requestId: e2.requestId });
    }).catch((e2) => {
      t2(e2);
    }), t2.promise;
  }, lt = async function({ fileID: e }, t2) {
    const n2 = (await ut.call(this, { fileList: [{ fileID: e, maxAge: 600 }] })).fileList[0];
    if ("SUCCESS" !== n2.code)
      return t2 ? t2(n2) : new Promise((e2) => {
        e2(n2);
      });
    const s2 = Qe(this.config.env);
    let r2 = n2.download_url;
    if (r2 = encodeURI(r2), !t2)
      return s2.download({ url: r2 });
    t2(await s2.download({ url: r2 }));
  }, ht = function({ name: e, data: t2, query: n2, parse: s2, search: r2 }, i2) {
    const o2 = i2 || ve();
    let a2;
    try {
      a2 = t2 ? JSON.stringify(t2) : "";
    } catch (e2) {
      return Promise.reject(e2);
    }
    if (!e)
      return Promise.reject(new ne({ code: "PARAM_ERROR", message: "函数名不能为空" }));
    const c2 = { inQuery: n2, parse: s2, search: r2, function_name: e, request_data: a2 };
    return Qe(this.config.env).send("functions.invokeFunction", c2).then((e2) => {
      if (e2.code)
        o2(null, e2);
      else {
        let t3 = e2.data.response_data;
        if (s2)
          o2(null, { result: t3, requestId: e2.requestId });
        else
          try {
            t3 = JSON.parse(e2.data.response_data), o2(null, { result: t3, requestId: e2.requestId });
          } catch (e3) {
            o2(new ne({ message: "response data must be json" }));
          }
      }
      return o2.promise;
    }).catch((e2) => {
      o2(e2);
    }), o2.promise;
  }, dt = { timeout: 15e3, persistence: "session" }, pt = {};
  class ft {
    constructor(e) {
      this.config = e || this.config, this.authObj = void 0;
    }
    init(e) {
      switch (Te.adapter || (this.requestClient = new Te.adapter.reqClass({ timeout: e.timeout || 5e3, timeoutMsg: `请求在${(e.timeout || 5e3) / 1e3}s内未完成，已中断` })), this.config = { ...dt, ...e }, true) {
        case this.config.timeout > 6e5:
          console.warn("timeout大于可配置上限[10分钟]，已重置为上限数值"), this.config.timeout = 6e5;
          break;
        case this.config.timeout < 100:
          console.warn("timeout小于可配置下限[100ms]，已重置为下限数值"), this.config.timeout = 100;
      }
      return new ft(this.config);
    }
    auth({ persistence: e } = {}) {
      if (this.authObj)
        return this.authObj;
      const t2 = e || Te.adapter.primaryStorage || dt.persistence;
      var n2;
      return t2 !== this.config.persistence && (this.config.persistence = t2), function(e2) {
        const { env: t3 } = e2;
        Oe[t3] = new Ee(e2), xe[t3] = new Ee({ ...e2, persistence: "local" });
      }(this.config), n2 = this.config, Ye[n2.env] = new Ve(n2), this.authObj = new it(this.config), this.authObj;
    }
    on(e, t2) {
      return De.apply(this, [e, t2]);
    }
    off(e, t2) {
      return qe.apply(this, [e, t2]);
    }
    callFunction(e, t2) {
      return ht.apply(this, [e, t2]);
    }
    deleteFile(e, t2) {
      return ct.apply(this, [e, t2]);
    }
    getTempFileURL(e, t2) {
      return ut.apply(this, [e, t2]);
    }
    downloadFile(e, t2) {
      return lt.apply(this, [e, t2]);
    }
    uploadFile(e, t2) {
      return ot.apply(this, [e, t2]);
    }
    getUploadMetadata(e, t2) {
      return at.apply(this, [e, t2]);
    }
    registerExtension(e) {
      pt[e.name] = e;
    }
    async invokeExtension(e, t2) {
      const n2 = pt[e];
      if (!n2)
        throw new ne({ message: `扩展${e} 必须先注册` });
      return await n2.invoke(t2, this);
    }
    useAdapters(e) {
      const { adapter: t2, runtime: n2 } = Ie(e) || {};
      t2 && (Te.adapter = t2), n2 && (Te.runtime = n2);
    }
  }
  var gt = new ft();
  function mt(e, t2, n2) {
    void 0 === n2 && (n2 = {});
    var s2 = /\?/.test(t2), r2 = "";
    for (var i2 in n2)
      "" === r2 ? !s2 && (t2 += "?") : r2 += "&", r2 += i2 + "=" + encodeURIComponent(n2[i2]);
    return /^http(s)?:\/\//.test(t2 += r2) ? t2 : "" + e + t2;
  }
  class yt {
    post(e) {
      const { url: t2, data: n2, headers: s2 } = e;
      return new Promise((e2, r2) => {
        se.request({ url: mt("https:", t2), data: n2, method: "POST", header: s2, success(t3) {
          e2(t3);
        }, fail(e3) {
          r2(e3);
        } });
      });
    }
    upload(e) {
      return new Promise((t2, n2) => {
        const { url: s2, file: r2, data: i2, headers: o2, fileType: a2 } = e, c2 = se.uploadFile({ url: mt("https:", s2), name: "file", formData: Object.assign({}, i2), filePath: r2, fileType: a2, header: o2, success(e2) {
          const n3 = { statusCode: e2.statusCode, data: e2.data || {} };
          200 === e2.statusCode && i2.success_action_status && (n3.statusCode = parseInt(i2.success_action_status, 10)), t2(n3);
        }, fail(e2) {
          n2(new Error(e2.errMsg || "uploadFile:fail"));
        } });
        "function" == typeof e.onUploadProgress && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((t3) => {
          e.onUploadProgress({ loaded: t3.totalBytesSent, total: t3.totalBytesExpectedToSend });
        });
      });
    }
  }
  const _t = { setItem(e, t2) {
    se.setStorageSync(e, t2);
  }, getItem: (e) => se.getStorageSync(e), removeItem(e) {
    se.removeStorageSync(e);
  }, clear() {
    se.clearStorageSync();
  } };
  var wt = { genAdapter: function() {
    return { root: {}, reqClass: yt, localStorage: _t, primaryStorage: "local" };
  }, isMatch: function() {
    return true;
  }, runtime: "uni_app" };
  gt.useAdapters(wt);
  const vt = gt, St = vt.init;
  vt.init = function(e) {
    e.env = e.spaceId;
    const t2 = St.call(this, e);
    t2.config.provider = "tencent", t2.config.spaceId = e.spaceId;
    const n2 = t2.auth;
    return t2.auth = function(e2) {
      const t3 = n2.call(this, e2);
      return ["linkAndRetrieveDataWithTicket", "signInAnonymously", "signOut", "getAccessToken", "getLoginState", "signInWithTicket", "getUserInfo"].forEach((e3) => {
        var n3;
        t3[e3] = (n3 = t3[e3], function(e4) {
          e4 = e4 || {};
          const { success: t4, fail: s2, complete: r2 } = te(e4);
          if (!(t4 || s2 || r2))
            return n3.call(this, e4);
          n3.call(this, e4).then((e5) => {
            t4 && t4(e5), r2 && r2(e5);
          }, (e5) => {
            s2 && s2(e5), r2 && r2(e5);
          });
        }).bind(t3);
      }), t3;
    }, t2.customAuth = t2.auth, t2;
  };
  var bt = vt;
  var kt = class extends ge {
    getAccessToken() {
      return new Promise((e, t2) => {
        const n2 = "Anonymous_Access_token";
        this.setAccessToken(n2), e(n2);
      });
    }
    setupRequest(e, t2) {
      const n2 = Object.assign({}, e, { spaceId: this.config.spaceId, timestamp: Date.now() }), s2 = { "Content-Type": "application/json" };
      "auth" !== t2 && (n2.token = this.accessToken, s2["x-basement-token"] = this.accessToken), s2["x-serverless-sign"] = de.sign(n2, this.config.clientSecret);
      const r2 = he();
      s2["x-client-info"] = encodeURIComponent(JSON.stringify(r2));
      const { token: i2 } = ie();
      return s2["x-client-token"] = i2, { url: this.config.requestUrl, method: "POST", data: n2, dataType: "json", header: JSON.parse(JSON.stringify(s2)) };
    }
    uploadFileToOSS({ url: e, formData: t2, name: n2, filePath: s2, fileType: r2, onUploadProgress: i2 }) {
      return new Promise((o2, a2) => {
        const c2 = this.adapter.uploadFile({ url: e, formData: t2, name: n2, filePath: s2, fileType: r2, success(e2) {
          e2 && e2.statusCode < 400 ? o2(e2) : a2(new ne({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
        }, fail(e2) {
          a2(new ne({ code: e2.code || "UPLOAD_FAILED", message: e2.message || e2.errMsg || "文件上传失败" }));
        } });
        "function" == typeof i2 && c2 && "function" == typeof c2.onProgressUpdate && c2.onProgressUpdate((e2) => {
          i2({ loaded: e2.totalBytesSent, total: e2.totalBytesExpectedToSend });
        });
      });
    }
    uploadFile({ filePath: e, cloudPath: t2, fileType: n2 = "image", onUploadProgress: s2 }) {
      if (!t2)
        throw new ne({ code: "CLOUDPATH_REQUIRED", message: "cloudPath不可为空" });
      let r2;
      return this.getOSSUploadOptionsFromPath({ cloudPath: t2 }).then((t3) => {
        const { url: i2, formData: o2, name: a2 } = t3.result;
        r2 = t3.result.fileUrl;
        const c2 = { url: i2, formData: o2, name: a2, filePath: e, fileType: n2 };
        return this.uploadFileToOSS(Object.assign({}, c2, { onUploadProgress: s2 }));
      }).then(() => this.reportOSSUpload({ cloudPath: t2 })).then((t3) => new Promise((n3, s3) => {
        t3.success ? n3({ success: true, filePath: e, fileID: r2 }) : s3(new ne({ code: "UPLOAD_FAILED", message: "文件上传失败" }));
      }));
    }
    deleteFile({ fileList: e }) {
      const t2 = { method: "serverless.file.resource.delete", params: JSON.stringify({ fileList: e }) };
      return this.request(this.setupRequest(t2)).then((e2) => {
        if (e2.success)
          return e2.result;
        throw new ne({ code: "DELETE_FILE_FAILED", message: "删除文件失败" });
      });
    }
    getTempFileURL({ fileList: e } = {}) {
      if (!Array.isArray(e) || 0 === e.length)
        throw new ne({ code: "INVALID_PARAM", message: "fileList的元素必须是非空的字符串" });
      const t2 = { method: "serverless.file.resource.getTempFileURL", params: JSON.stringify({ fileList: e }) };
      return this.request(this.setupRequest(t2)).then((e2) => {
        if (e2.success)
          return { fileList: e2.result.fileList.map((e3) => ({ fileID: e3.fileID, tempFileURL: e3.tempFileURL })) };
        throw new ne({ code: "GET_TEMP_FILE_URL_FAILED", message: "获取临时文件链接失败" });
      });
    }
  };
  var It = { init(e) {
    const t2 = new kt(e), n2 = { signInAnonymously: function() {
      return t2.authorize();
    }, getLoginState: function() {
      return Promise.resolve(false);
    } };
    return t2.auth = function() {
      return n2;
    }, t2.customAuth = t2.auth, t2;
  } };
  function Tt({ data: e }) {
    let t2;
    t2 = he();
    const n2 = JSON.parse(JSON.stringify(e || {}));
    if (Object.assign(n2, { clientInfo: t2 }), !n2.uniIdToken) {
      const { token: e2 } = ie();
      e2 && (n2.uniIdToken = e2);
    }
    return n2;
  }
  async function Ct({ name: e, data: t2 } = {}) {
    await this.__dev__.initLocalNetwork();
    const { localAddress: n2, localPort: s2 } = this.__dev__, r2 = { aliyun: "aliyun", tencent: "tcb" }[this.config.provider], i2 = this.config.spaceId, o2 = `http://${n2}:${s2}/system/check-function`, a2 = `http://${n2}:${s2}/cloudfunctions/${e}`;
    return new Promise((t3, n3) => {
      se.request({ method: "POST", url: o2, data: { name: e, platform: A, provider: r2, spaceId: i2 }, timeout: 3e3, success(e2) {
        t3(e2);
      }, fail() {
        t3({ data: { code: "NETWORK_ERROR", message: "连接本地调试服务失败，请检查客户端是否和主机在同一局域网下，自动切换为已部署的云函数。" } });
      } });
    }).then(({ data: e2 } = {}) => {
      const { code: t3, message: n3 } = e2 || {};
      return { code: 0 === t3 ? 0 : t3 || "SYS_ERR", message: n3 || "SYS_ERR" };
    }).then(({ code: n3, message: s3 }) => {
      if (0 !== n3) {
        switch (n3) {
          case "MODULE_ENCRYPTED":
            console.error(`此云函数（${e}）依赖加密公共模块不可本地调试，自动切换为云端已部署的云函数`);
            break;
          case "FUNCTION_ENCRYPTED":
            console.error(`此云函数（${e}）已加密不可本地调试，自动切换为云端已部署的云函数`);
            break;
          case "ACTION_ENCRYPTED":
            console.error(s3 || "需要访问加密的uni-clientDB-action，自动切换为云端环境");
            break;
          case "NETWORK_ERROR": {
            const e2 = "连接本地调试服务失败，请检查客户端是否和主机在同一局域网下";
            throw console.error(e2), new Error(e2);
          }
          case "SWITCH_TO_CLOUD":
            break;
          default: {
            const e2 = `检测本地调试服务出现错误：${s3}，请检查网络环境或重启客户端再试`;
            throw console.error(e2), new Error(e2);
          }
        }
        return this._callCloudFunction({ name: e, data: t2 });
      }
      return new Promise((e2, n4) => {
        const s4 = Tt.call(this, { data: t2 });
        se.request({ method: "POST", url: a2, data: { provider: r2, platform: A, param: s4 }, success: ({ statusCode: t3, data: s5 } = {}) => !t3 || t3 >= 400 ? n4(new ne({ code: s5.code || "SYS_ERR", message: s5.message || "request:fail" })) : e2({ result: s5 }), fail(e3) {
          n4(new ne({ code: e3.code || e3.errCode || "SYS_ERR", message: e3.message || e3.errMsg || "request:fail" }));
        } });
      });
    });
  }
  const At = [{ rule: /fc_function_not_found|FUNCTION_NOT_FOUND/, content: "，云函数[{functionName}]在云端不存在，请检查此云函数名称是否正确以及该云函数是否已上传到服务空间", mode: "append" }];
  var Pt = /[\\^$.*+?()[\]{}|]/g, Et = RegExp(Pt.source);
  function Ot(e, t2, n2) {
    return e.replace(new RegExp((s2 = t2) && Et.test(s2) ? s2.replace(Pt, "\\$&") : s2, "g"), n2);
    var s2;
  }
  const Rt = "request", Ut = "response", Lt = "both";
  const yn = { code: 2e4, message: "System error" }, _n = { code: 20101, message: "Invalid client" };
  function Sn(e) {
    const { errSubject: t2, subject: n2, errCode: s2, errMsg: r2, code: i2, message: o2, cause: a2 } = e || {};
    return new ne({ subject: t2 || n2 || "uni-secure-network", code: s2 || i2 || yn.code, message: r2 || o2, cause: a2 });
  }
  let kn;
  function Pn({ secretType: e } = {}) {
    return e === Rt || e === Ut || e === Lt;
  }
  function En({ name: e, data: t2 = {} } = {}) {
    return "DCloud-clientDB" === e && "encryption" === t2.redirectTo && "getAppClientKey" === t2.action;
  }
  function On({ provider: e, spaceId: t2, functionName: n2 } = {}) {
    const { appId: s2, uniPlatform: r2, osName: i2 } = ue();
    let o2 = r2;
    "app" === r2 && (o2 = i2);
    const a2 = function({ provider: e2, spaceId: t3 } = {}) {
      const n3 = C;
      if (!n3)
        return {};
      e2 = function(e3) {
        return "tencent" === e3 ? "tcb" : e3;
      }(e2);
      const s3 = n3.find((n4) => n4.provider === e2 && n4.spaceId === t3);
      return s3 && s3.config;
    }({ provider: e, spaceId: t2 });
    if (!a2 || !a2.accessControl || !a2.accessControl.enable)
      return false;
    const c2 = a2.accessControl.function || {}, u2 = Object.keys(c2);
    if (0 === u2.length)
      return true;
    const l2 = function(e2, t3) {
      let n3, s3, r3;
      for (let i3 = 0; i3 < e2.length; i3++) {
        const o3 = e2[i3];
        o3 !== t3 ? "*" !== o3 ? o3.split(",").map((e3) => e3.trim()).indexOf(t3) > -1 && (s3 = o3) : r3 = o3 : n3 = o3;
      }
      return n3 || s3 || r3;
    }(u2, n2);
    if (!l2)
      return false;
    if ((c2[l2] || []).find((e2 = {}) => e2.appId === s2 && (e2.platform || "").toLowerCase() === o2.toLowerCase()))
      return true;
    throw console.error(`此应用[appId: ${s2}, platform: ${o2}]不在云端配置的允许访问的应用列表内，参考：https://uniapp.dcloud.net.cn/uniCloud/secure-network.html#verify-client`), Sn(_n);
  }
  function xn({ functionName: e, result: t2, logPvd: n2 }) {
    if (this.__dev__.debugLog && t2 && t2.requestId) {
      const s2 = JSON.stringify({ spaceId: this.config.spaceId, functionName: e, requestId: t2.requestId });
      console.log(`[${n2}-request]${s2}[/${n2}-request]`);
    }
  }
  function Rn(e) {
    const t2 = e.callFunction, n2 = function(n3) {
      const s2 = n3.name;
      n3.data = Tt.call(e, { data: n3.data });
      const r2 = { aliyun: "aliyun", tencent: "tcb", tcb: "tcb" }[this.config.provider], i2 = Pn(n3), o2 = En(n3), a2 = i2 || o2;
      return t2.call(this, n3).then((e2) => (e2.errCode = 0, !a2 && xn.call(this, { functionName: s2, result: e2, logPvd: r2 }), Promise.resolve(e2)), (e2) => (!a2 && xn.call(this, { functionName: s2, result: e2, logPvd: r2 }), e2 && e2.message && (e2.message = function({ message: e3 = "", extraInfo: t3 = {}, formatter: n4 = [] } = {}) {
        for (let s3 = 0; s3 < n4.length; s3++) {
          const { rule: r3, content: i3, mode: o3 } = n4[s3], a3 = e3.match(r3);
          if (!a3)
            continue;
          let c2 = i3;
          for (let e4 = 1; e4 < a3.length; e4++)
            c2 = Ot(c2, `{$${e4}}`, a3[e4]);
          for (const e4 in t3)
            c2 = Ot(c2, `{${e4}}`, t3[e4]);
          return "replace" === o3 ? c2 : e3 + c2;
        }
        return e3;
      }({ message: `[${n3.name}]: ${e2.message}`, formatter: At, extraInfo: { functionName: s2 } })), Promise.reject(e2)));
    };
    e.callFunction = function(t3) {
      const { provider: s2, spaceId: r2 } = e.config, i2 = t3.name;
      let o2, a2;
      if (t3.data = t3.data || {}, e.__dev__.debugInfo && !e.__dev__.debugInfo.forceRemote && E ? (e._callCloudFunction || (e._callCloudFunction = n2, e._callLocalFunction = Ct), o2 = Ct) : o2 = n2, o2 = o2.bind(e), En(t3))
        a2 = n2.call(e, t3);
      else if (Pn(t3)) {
        a2 = new kn({ secretType: t3.secretType, uniCloudIns: e }).wrapEncryptDataCallFunction(n2.bind(e))(t3);
      } else if (On({ provider: s2, spaceId: r2, functionName: i2 })) {
        a2 = new kn({ secretType: t3.secretType, uniCloudIns: e }).wrapVerifyClientCallFunction(n2.bind(e))(t3);
      } else
        a2 = o2(t3);
      return Object.defineProperty(a2, "result", { get: () => (console.warn("当前返回结果为Promise类型，不可直接访问其result属性，详情请参考：https://uniapp.dcloud.net.cn/uniCloud/faq?id=promise"), {}) }), a2;
    };
  }
  kn = class {
    constructor() {
      throw Sn({ message: `Platform ${A} is not enabled, please check whether secure network module is enabled in your manifest.json` });
    }
  };
  const Un = Symbol("CLIENT_DB_INTERNAL");
  function Ln(e, t2) {
    return e.then = "DoNotReturnProxyWithAFunctionNamedThen", e._internalType = Un, e.inspect = null, e.__v_raw = void 0, new Proxy(e, { get(e2, n2, s2) {
      if ("_uniClient" === n2)
        return null;
      if ("symbol" == typeof n2)
        return e2[n2];
      if (n2 in e2 || "string" != typeof n2) {
        const t3 = e2[n2];
        return "function" == typeof t3 ? t3.bind(e2) : t3;
      }
      return t2.get(e2, n2, s2);
    } });
  }
  function Nn(e) {
    return { on: (t2, n2) => {
      e[t2] = e[t2] || [], e[t2].indexOf(n2) > -1 || e[t2].push(n2);
    }, off: (t2, n2) => {
      e[t2] = e[t2] || [];
      const s2 = e[t2].indexOf(n2);
      -1 !== s2 && e[t2].splice(s2, 1);
    } };
  }
  const Dn = ["db.Geo", "db.command", "command.aggregate"];
  function Fn(e, t2) {
    return Dn.indexOf(`${e}.${t2}`) > -1;
  }
  function qn(e) {
    switch (g(e = re(e))) {
      case "array":
        return e.map((e2) => qn(e2));
      case "object":
        return e._internalType === Un || Object.keys(e).forEach((t2) => {
          e[t2] = qn(e[t2]);
        }), e;
      case "regexp":
        return { $regexp: { source: e.source, flags: e.flags } };
      case "date":
        return { $date: e.toISOString() };
      default:
        return e;
    }
  }
  function Kn(e) {
    return e && e.content && e.content.$method;
  }
  class Mn {
    constructor(e, t2, n2) {
      this.content = e, this.prevStage = t2 || null, this.udb = null, this._database = n2;
    }
    toJSON() {
      let e = this;
      const t2 = [e.content];
      for (; e.prevStage; )
        e = e.prevStage, t2.push(e.content);
      return { $db: t2.reverse().map((e2) => ({ $method: e2.$method, $param: qn(e2.$param) })) };
    }
    getAction() {
      const e = this.toJSON().$db.find((e2) => "action" === e2.$method);
      return e && e.$param && e.$param[0];
    }
    getCommand() {
      return { $db: this.toJSON().$db.filter((e) => "action" !== e.$method) };
    }
    get isAggregate() {
      let e = this;
      for (; e; ) {
        const t2 = Kn(e), n2 = Kn(e.prevStage);
        if ("aggregate" === t2 && "collection" === n2 || "pipeline" === t2)
          return true;
        e = e.prevStage;
      }
      return false;
    }
    get isCommand() {
      let e = this;
      for (; e; ) {
        if ("command" === Kn(e))
          return true;
        e = e.prevStage;
      }
      return false;
    }
    get isAggregateCommand() {
      let e = this;
      for (; e; ) {
        const t2 = Kn(e), n2 = Kn(e.prevStage);
        if ("aggregate" === t2 && "command" === n2)
          return true;
        e = e.prevStage;
      }
      return false;
    }
    getNextStageFn(e) {
      const t2 = this;
      return function() {
        return jn({ $method: e, $param: qn(Array.from(arguments)) }, t2, t2._database);
      };
    }
    get count() {
      return this.isAggregate ? this.getNextStageFn("count") : function() {
        return this._send("count", Array.from(arguments));
      };
    }
    get remove() {
      return this.isCommand ? this.getNextStageFn("remove") : function() {
        return this._send("remove", Array.from(arguments));
      };
    }
    get() {
      return this._send("get", Array.from(arguments));
    }
    get add() {
      return this.isCommand ? this.getNextStageFn("add") : function() {
        return this._send("add", Array.from(arguments));
      };
    }
    update() {
      return this._send("update", Array.from(arguments));
    }
    end() {
      return this._send("end", Array.from(arguments));
    }
    get set() {
      return this.isCommand ? this.getNextStageFn("set") : function() {
        throw new Error("JQL禁止使用set方法");
      };
    }
    _send(e, t2) {
      const n2 = this.getAction(), s2 = this.getCommand();
      if (s2.$db.push({ $method: e, $param: qn(t2) }), k) {
        const e2 = s2.$db.find((e3) => "collection" === e3.$method), t3 = e2 && e2.$param;
        t3 && 1 === t3.length && "string" == typeof e2.$param[0] && e2.$param[0].indexOf(",") > -1 && console.warn("检测到使用JQL语法联表查询时，未使用getTemp先过滤主表数据，在主表数据量大的情况下可能会查询缓慢。\n- 如何优化请参考此文档：https://uniapp.dcloud.net.cn/uniCloud/jql?id=lookup-with-temp \n- 如果主表数据量很小请忽略此信息，项目发行时不会出现此提示。");
      }
      return this._database._callCloudFunction({ action: n2, command: s2 });
    }
  }
  function jn(e, t2, n2) {
    return Ln(new Mn(e, t2, n2), { get(e2, t3) {
      let s2 = "db";
      return e2 && e2.content && (s2 = e2.content.$method), Fn(s2, t3) ? jn({ $method: t3 }, e2, n2) : function() {
        return jn({ $method: t3, $param: qn(Array.from(arguments)) }, e2, n2);
      };
    } });
  }
  function Bn({ path: e, method: t2 }) {
    return class {
      constructor() {
        this.param = Array.from(arguments);
      }
      toJSON() {
        return { $newDb: [...e.map((e2) => ({ $method: e2 })), { $method: t2, $param: this.param }] };
      }
    };
  }
  function $n(e, t2 = {}) {
    return Ln(new e(t2), { get: (e2, t3) => Fn("db", t3) ? jn({ $method: t3 }, null, e2) : function() {
      return jn({ $method: t3, $param: qn(Array.from(arguments)) }, null, e2);
    } });
  }
  class Wn extends class {
    constructor({ uniClient: e = {}, isJQL: t2 = false } = {}) {
      this._uniClient = e, this._authCallBacks = {}, this._dbCallBacks = {}, e._isDefault && (this._dbCallBacks = U("_globalUniCloudDatabaseCallback")), t2 || (this.auth = Nn(this._authCallBacks)), this._isJQL = t2, Object.assign(this, Nn(this._dbCallBacks)), this.env = Ln({}, { get: (e2, t3) => ({ $env: t3 }) }), this.Geo = Ln({}, { get: (e2, t3) => Bn({ path: ["Geo"], method: t3 }) }), this.serverDate = Bn({ path: [], method: "serverDate" }), this.RegExp = Bn({ path: [], method: "RegExp" });
    }
    getCloudEnv(e) {
      if ("string" != typeof e || !e.trim())
        throw new Error("getCloudEnv参数错误");
      return { $env: e.replace("$cloudEnv_", "") };
    }
    _callback(e, t2) {
      const n2 = this._dbCallBacks;
      n2[e] && n2[e].forEach((e2) => {
        e2(...t2);
      });
    }
    _callbackAuth(e, t2) {
      const n2 = this._authCallBacks;
      n2[e] && n2[e].forEach((e2) => {
        e2(...t2);
      });
    }
    multiSend() {
      const e = Array.from(arguments), t2 = e.map((e2) => {
        const t3 = e2.getAction(), n2 = e2.getCommand();
        if ("getTemp" !== n2.$db[n2.$db.length - 1].$method)
          throw new Error("multiSend只支持子命令内使用getTemp");
        return { action: t3, command: n2 };
      });
      return this._callCloudFunction({ multiCommand: t2, queryList: e });
    }
  } {
    _parseResult(e) {
      return this._isJQL ? e.result : e;
    }
    _callCloudFunction({ action: e, command: t2, multiCommand: n2, queryList: s2 }) {
      function r2(e2, t3) {
        if (n2 && s2)
          for (let n3 = 0; n3 < s2.length; n3++) {
            const r3 = s2[n3];
            r3.udb && "function" == typeof r3.udb.setResult && (t3 ? r3.udb.setResult(t3) : r3.udb.setResult(e2.result.dataList[n3]));
          }
      }
      const i2 = this, o2 = this._isJQL ? "databaseForJQL" : "database";
      function a2(e2) {
        return i2._callback("error", [e2]), q(K(o2, "fail"), e2).then(() => q(K(o2, "complete"), e2)).then(() => (r2(null, e2), Q(B, { type: z, content: e2 }), Promise.reject(e2)));
      }
      const c2 = q(K(o2, "invoke")), u2 = this._uniClient;
      return c2.then(() => u2.callFunction({ name: "DCloud-clientDB", type: h, data: { action: e, command: t2, multiCommand: n2 } })).then((e2) => {
        const { code: t3, message: n3, token: s3, tokenExpired: c3, systemInfo: u3 = [] } = e2.result;
        if (u3)
          for (let e3 = 0; e3 < u3.length; e3++) {
            const { level: t4, message: n4, detail: s4 } = u3[e3], r3 = console["warn" === t4 ? "error" : t4] || console.log;
            let i3 = "[System Info]" + n4;
            s4 && (i3 = `${i3}
详细信息：${s4}`), r3(i3);
          }
        if (t3) {
          return a2(new ne({ code: t3, message: n3, requestId: e2.requestId }));
        }
        e2.result.errCode = e2.result.errCode || e2.result.code, e2.result.errMsg = e2.result.errMsg || e2.result.message, s3 && c3 && (oe({ token: s3, tokenExpired: c3 }), this._callbackAuth("refreshToken", [{ token: s3, tokenExpired: c3 }]), this._callback("refreshToken", [{ token: s3, tokenExpired: c3 }]), Q(W, { token: s3, tokenExpired: c3 }));
        const l2 = [{ prop: "affectedDocs", tips: "affectedDocs不再推荐使用，请使用inserted/deleted/updated/data.length替代" }, { prop: "code", tips: "code不再推荐使用，请使用errCode替代" }, { prop: "message", tips: "message不再推荐使用，请使用errMsg替代" }];
        for (let t4 = 0; t4 < l2.length; t4++) {
          const { prop: n4, tips: s4 } = l2[t4];
          if (n4 in e2.result) {
            const t5 = e2.result[n4];
            Object.defineProperty(e2.result, n4, { get: () => (console.warn(s4), t5) });
          }
        }
        return function(e3) {
          return q(K(o2, "success"), e3).then(() => q(K(o2, "complete"), e3)).then(() => {
            r2(e3, null);
            const t4 = i2._parseResult(e3);
            return Q(B, { type: z, content: t4 }), Promise.resolve(t4);
          });
        }(e2);
      }, (e2) => {
        /fc_function_not_found|FUNCTION_NOT_FOUND/g.test(e2.message) && console.warn("clientDB未初始化，请在web控制台保存一次schema以开启clientDB");
        return a2(new ne({ code: e2.code || "SYSTEM_ERROR", message: e2.message, requestId: e2.requestId }));
      });
    }
  }
  const zn = "token无效，跳转登录页面", Jn = "token过期，跳转登录页面", Hn = { TOKEN_INVALID_TOKEN_EXPIRED: Jn, TOKEN_INVALID_INVALID_CLIENTID: zn, TOKEN_INVALID: zn, TOKEN_INVALID_WRONG_TOKEN: zn, TOKEN_INVALID_ANONYMOUS_USER: zn }, Gn = { "uni-id-token-expired": Jn, "uni-id-check-token-failed": zn, "uni-id-token-not-exist": zn, "uni-id-check-device-feature-failed": zn };
  function Vn(e, t2) {
    let n2 = "";
    return n2 = e ? `${e}/${t2}` : t2, n2.replace(/^\//, "");
  }
  function Yn(e = [], t2 = "") {
    const n2 = [], s2 = [];
    return e.forEach((e2) => {
      true === e2.needLogin ? n2.push(Vn(t2, e2.path)) : false === e2.needLogin && s2.push(Vn(t2, e2.path));
    }), { needLoginPage: n2, notNeedLoginPage: s2 };
  }
  function Qn(e) {
    return e.split("?")[0].replace(/^\//, "");
  }
  function Xn() {
    return function(e) {
      let t2 = e && e.$page && e.$page.fullPath || "";
      return t2 ? ("/" !== t2.charAt(0) && (t2 = "/" + t2), t2) : t2;
    }(function() {
      const e = getCurrentPages();
      return e[e.length - 1];
    }());
  }
  function Zn() {
    return Qn(Xn());
  }
  function es(e = "", t2 = {}) {
    if (!e)
      return false;
    if (!(t2 && t2.list && t2.list.length))
      return false;
    const n2 = t2.list, s2 = Qn(e);
    return n2.some((e2) => e2.pagePath === s2);
  }
  const ts = !!t.uniIdRouter;
  const { loginPage: ns, routerNeedLogin: ss, resToLogin: rs, needLoginPage: is, notNeedLoginPage: os, loginPageInTabBar: as } = function({ pages: e = [], subPackages: n2 = [], uniIdRouter: s2 = {}, tabBar: r2 = {} } = t) {
    const { loginPage: i2, needLogin: o2 = [], resToLogin: a2 = true } = s2, { needLoginPage: c2, notNeedLoginPage: u2 } = Yn(e), { needLoginPage: l2, notNeedLoginPage: h2 } = function(e2 = []) {
      const t2 = [], n3 = [];
      return e2.forEach((e3) => {
        const { root: s3, pages: r3 = [] } = e3, { needLoginPage: i3, notNeedLoginPage: o3 } = Yn(r3, s3);
        t2.push(...i3), n3.push(...o3);
      }), { needLoginPage: t2, notNeedLoginPage: n3 };
    }(n2);
    return { loginPage: i2, routerNeedLogin: o2, resToLogin: a2, needLoginPage: [...c2, ...l2], notNeedLoginPage: [...u2, ...h2], loginPageInTabBar: es(i2, r2) };
  }();
  if (is.indexOf(ns) > -1)
    throw new Error(`Login page [${ns}] should not be "needLogin", please check your pages.json`);
  function cs(e) {
    const t2 = Zn();
    if ("/" === e.charAt(0))
      return e;
    const [n2, s2] = e.split("?"), r2 = n2.replace(/^\//, "").split("/"), i2 = t2.split("/");
    i2.pop();
    for (let e2 = 0; e2 < r2.length; e2++) {
      const t3 = r2[e2];
      ".." === t3 ? i2.pop() : "." !== t3 && i2.push(t3);
    }
    return "" === i2[0] && i2.shift(), "/" + i2.join("/") + (s2 ? "?" + s2 : "");
  }
  function us(e) {
    const t2 = Qn(cs(e));
    return !(os.indexOf(t2) > -1) && (is.indexOf(t2) > -1 || ss.some((t3) => function(e2, t4) {
      return new RegExp(t4).test(e2);
    }(e, t3)));
  }
  function ls({ redirect: e }) {
    const t2 = Qn(e), n2 = Qn(ns);
    return Zn() !== n2 && t2 !== n2;
  }
  function hs({ api: e, redirect: t2 } = {}) {
    if (!t2 || !ls({ redirect: t2 }))
      return;
    const n2 = function(e2, t3) {
      return "/" !== e2.charAt(0) && (e2 = "/" + e2), t3 ? e2.indexOf("?") > -1 ? e2 + `&uniIdRedirectUrl=${encodeURIComponent(t3)}` : e2 + `?uniIdRedirectUrl=${encodeURIComponent(t3)}` : e2;
    }(ns, t2);
    as ? "navigateTo" !== e && "redirectTo" !== e || (e = "switchTab") : "switchTab" === e && (e = "navigateTo");
    const s2 = { navigateTo: uni.navigateTo, redirectTo: uni.redirectTo, switchTab: uni.switchTab, reLaunch: uni.reLaunch };
    setTimeout(() => {
      s2[e]({ url: n2 });
    });
  }
  function ds({ url: e } = {}) {
    const t2 = { abortLoginPageJump: false, autoToLoginPage: false }, n2 = function() {
      const { token: e2, tokenExpired: t3 } = ie();
      let n3;
      if (e2) {
        if (t3 < Date.now()) {
          const e3 = "uni-id-token-expired";
          n3 = { errCode: e3, errMsg: Gn[e3] };
        }
      } else {
        const e3 = "uni-id-check-token-failed";
        n3 = { errCode: e3, errMsg: Gn[e3] };
      }
      return n3;
    }();
    if (us(e) && n2) {
      n2.uniIdRedirectUrl = e;
      if (G($).length > 0)
        return setTimeout(() => {
          Q($, n2);
        }, 0), t2.abortLoginPageJump = true, t2;
      t2.autoToLoginPage = true;
    }
    return t2;
  }
  function ps() {
    !function() {
      const e2 = Xn(), { abortLoginPageJump: t2, autoToLoginPage: n2 } = ds({ url: e2 });
      t2 || n2 && hs({ api: "redirectTo", redirect: e2 });
    }();
    const e = ["navigateTo", "redirectTo", "reLaunch", "switchTab"];
    for (let t2 = 0; t2 < e.length; t2++) {
      const n2 = e[t2];
      uni.addInterceptor(n2, { invoke(e2) {
        const { abortLoginPageJump: t3, autoToLoginPage: s2 } = ds({ url: e2.url });
        return t3 ? e2 : s2 ? (hs({ api: n2, redirect: cs(e2.url) }), false) : e2;
      } });
    }
  }
  function fs() {
    this.onResponse((e) => {
      const { type: t2, content: n2 } = e;
      let s2 = false;
      switch (t2) {
        case "cloudobject":
          s2 = function(e2) {
            if ("object" != typeof e2)
              return false;
            const { errCode: t3 } = e2 || {};
            return t3 in Gn;
          }(n2);
          break;
        case "clientdb":
          s2 = function(e2) {
            if ("object" != typeof e2)
              return false;
            const { errCode: t3 } = e2 || {};
            return t3 in Hn;
          }(n2);
      }
      s2 && function(e2 = {}) {
        const t3 = G($);
        ee().then(() => {
          const n3 = Xn();
          if (n3 && ls({ redirect: n3 }))
            return t3.length > 0 ? Q($, Object.assign({ uniIdRedirectUrl: n3 }, e2)) : void (ns && hs({ api: "navigateTo", redirect: n3 }));
        });
      }(n2);
    });
  }
  function gs(e) {
    !function(e2) {
      e2.onResponse = function(e3) {
        V(B, e3);
      }, e2.offResponse = function(e3) {
        Y(B, e3);
      };
    }(e), function(e2) {
      e2.onNeedLogin = function(e3) {
        V($, e3);
      }, e2.offNeedLogin = function(e3) {
        Y($, e3);
      }, ts && (U("_globalUniCloudStatus").needLoginInit || (U("_globalUniCloudStatus").needLoginInit = true, ee().then(() => {
        ps.call(e2);
      }), rs && fs.call(e2)));
    }(e), function(e2) {
      e2.onRefreshToken = function(e3) {
        V(W, e3);
      }, e2.offRefreshToken = function(e3) {
        Y(W, e3);
      };
    }(e);
  }
  let ms;
  const ys = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", _s = /^(?:[A-Za-z\d+/]{4})*?(?:[A-Za-z\d+/]{2}(?:==)?|[A-Za-z\d+/]{3}=?)?$/;
  function ws() {
    const e = ie().token || "", t2 = e.split(".");
    if (!e || 3 !== t2.length)
      return { uid: null, role: [], permission: [], tokenExpired: 0 };
    let n2;
    try {
      n2 = JSON.parse((s2 = t2[1], decodeURIComponent(ms(s2).split("").map(function(e2) {
        return "%" + ("00" + e2.charCodeAt(0).toString(16)).slice(-2);
      }).join(""))));
    } catch (e2) {
      throw new Error("获取当前用户信息出错，详细错误信息为：" + e2.message);
    }
    var s2;
    return n2.tokenExpired = 1e3 * n2.exp, delete n2.exp, delete n2.iat, n2;
  }
  ms = "function" != typeof atob ? function(e) {
    if (e = String(e).replace(/[\t\n\f\r ]+/g, ""), !_s.test(e))
      throw new Error("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");
    var t2;
    e += "==".slice(2 - (3 & e.length));
    for (var n2, s2, r2 = "", i2 = 0; i2 < e.length; )
      t2 = ys.indexOf(e.charAt(i2++)) << 18 | ys.indexOf(e.charAt(i2++)) << 12 | (n2 = ys.indexOf(e.charAt(i2++))) << 6 | (s2 = ys.indexOf(e.charAt(i2++))), r2 += 64 === n2 ? String.fromCharCode(t2 >> 16 & 255) : 64 === s2 ? String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255) : String.fromCharCode(t2 >> 16 & 255, t2 >> 8 & 255, 255 & t2);
    return r2;
  } : atob;
  var vs = s(function(e, t2) {
    Object.defineProperty(t2, "__esModule", { value: true });
    const n2 = "chooseAndUploadFile:ok", s2 = "chooseAndUploadFile:fail";
    function r2(e2, t3) {
      return e2.tempFiles.forEach((e3, n3) => {
        e3.name || (e3.name = e3.path.substring(e3.path.lastIndexOf("/") + 1)), t3 && (e3.fileType = t3), e3.cloudPath = Date.now() + "_" + n3 + e3.name.substring(e3.name.lastIndexOf("."));
      }), e2.tempFilePaths || (e2.tempFilePaths = e2.tempFiles.map((e3) => e3.path)), e2;
    }
    function i2(e2, t3, { onChooseFile: s3, onUploadProgress: r3 }) {
      return t3.then((e3) => {
        if (s3) {
          const t4 = s3(e3);
          if (void 0 !== t4)
            return Promise.resolve(t4).then((t5) => void 0 === t5 ? e3 : t5);
        }
        return e3;
      }).then((t4) => false === t4 ? { errMsg: n2, tempFilePaths: [], tempFiles: [] } : function(e3, t5, s4 = 5, r4) {
        (t5 = Object.assign({}, t5)).errMsg = n2;
        const i3 = t5.tempFiles, o2 = i3.length;
        let a2 = 0;
        return new Promise((n3) => {
          for (; a2 < s4; )
            c2();
          function c2() {
            const s5 = a2++;
            if (s5 >= o2)
              return void (!i3.find((e4) => !e4.url && !e4.errMsg) && n3(t5));
            const u2 = i3[s5];
            e3.uploadFile({ filePath: u2.path, cloudPath: u2.cloudPath, fileType: u2.fileType, onUploadProgress(e4) {
              e4.index = s5, e4.tempFile = u2, e4.tempFilePath = u2.path, r4 && r4(e4);
            } }).then((e4) => {
              u2.url = e4.fileID, s5 < o2 && c2();
            }).catch((e4) => {
              u2.errMsg = e4.errMsg || e4.message, s5 < o2 && c2();
            });
          }
        });
      }(e2, t4, 5, r3));
    }
    t2.initChooseAndUploadFile = function(e2) {
      return function(t3 = { type: "all" }) {
        return "image" === t3.type ? i2(e2, function(e3) {
          const { count: t4, sizeType: n3, sourceType: i3 = ["album", "camera"], extension: o2 } = e3;
          return new Promise((e4, a2) => {
            uni.chooseImage({ count: t4, sizeType: n3, sourceType: i3, extension: o2, success(t5) {
              e4(r2(t5, "image"));
            }, fail(e5) {
              a2({ errMsg: e5.errMsg.replace("chooseImage:fail", s2) });
            } });
          });
        }(t3), t3) : "video" === t3.type ? i2(e2, function(e3) {
          const { camera: t4, compressed: n3, maxDuration: i3, sourceType: o2 = ["album", "camera"], extension: a2 } = e3;
          return new Promise((e4, c2) => {
            uni.chooseVideo({ camera: t4, compressed: n3, maxDuration: i3, sourceType: o2, extension: a2, success(t5) {
              const { tempFilePath: n4, duration: s3, size: i4, height: o3, width: a3 } = t5;
              e4(r2({ errMsg: "chooseVideo:ok", tempFilePaths: [n4], tempFiles: [{ name: t5.tempFile && t5.tempFile.name || "", path: n4, size: i4, type: t5.tempFile && t5.tempFile.type || "", width: a3, height: o3, duration: s3, fileType: "video", cloudPath: "" }] }, "video"));
            }, fail(e5) {
              c2({ errMsg: e5.errMsg.replace("chooseVideo:fail", s2) });
            } });
          });
        }(t3), t3) : i2(e2, function(e3) {
          const { count: t4, extension: n3 } = e3;
          return new Promise((e4, i3) => {
            let o2 = uni.chooseFile;
            if ("undefined" != typeof wx && "function" == typeof wx.chooseMessageFile && (o2 = wx.chooseMessageFile), "function" != typeof o2)
              return i3({ errMsg: s2 + " 请指定 type 类型，该平台仅支持选择 image 或 video。" });
            o2({ type: "all", count: t4, extension: n3, success(t5) {
              e4(r2(t5));
            }, fail(e5) {
              i3({ errMsg: e5.errMsg.replace("chooseFile:fail", s2) });
            } });
          });
        }(t3), t3);
      };
    };
  }), Ss = n(vs);
  const bs = "manual";
  function ks(e) {
    return { props: { localdata: { type: Array, default: () => [] }, options: { type: [Object, Array], default: () => ({}) }, spaceInfo: { type: Object, default: () => ({}) }, collection: { type: [String, Array], default: "" }, action: { type: String, default: "" }, field: { type: String, default: "" }, orderby: { type: String, default: "" }, where: { type: [String, Object], default: "" }, pageData: { type: String, default: "add" }, pageCurrent: { type: Number, default: 1 }, pageSize: { type: Number, default: 20 }, getcount: { type: [Boolean, String], default: false }, gettree: { type: [Boolean, String], default: false }, gettreepath: { type: [Boolean, String], default: false }, startwith: { type: String, default: "" }, limitlevel: { type: Number, default: 10 }, groupby: { type: String, default: "" }, groupField: { type: String, default: "" }, distinct: { type: [Boolean, String], default: false }, foreignKey: { type: String, default: "" }, loadtime: { type: String, default: "auto" }, manual: { type: Boolean, default: false } }, data: () => ({ mixinDatacomLoading: false, mixinDatacomHasMore: false, mixinDatacomResData: [], mixinDatacomErrorMessage: "", mixinDatacomPage: {} }), created() {
      this.mixinDatacomPage = { current: this.pageCurrent, size: this.pageSize, count: 0 }, this.$watch(() => {
        var e2 = [];
        return ["pageCurrent", "pageSize", "localdata", "collection", "action", "field", "orderby", "where", "getont", "getcount", "gettree", "groupby", "groupField", "distinct"].forEach((t2) => {
          e2.push(this[t2]);
        }), e2;
      }, (e2, t2) => {
        if (this.loadtime === bs)
          return;
        let n2 = false;
        const s2 = [];
        for (let r2 = 2; r2 < e2.length; r2++)
          e2[r2] !== t2[r2] && (s2.push(e2[r2]), n2 = true);
        e2[0] !== t2[0] && (this.mixinDatacomPage.current = this.pageCurrent), this.mixinDatacomPage.size = this.pageSize, this.onMixinDatacomPropsChange(n2, s2);
      });
    }, methods: { onMixinDatacomPropsChange(e2, t2) {
    }, mixinDatacomEasyGet({ getone: e2 = false, success: t2, fail: n2 } = {}) {
      this.mixinDatacomLoading || (this.mixinDatacomLoading = true, this.mixinDatacomErrorMessage = "", this.mixinDatacomGet().then((n3) => {
        this.mixinDatacomLoading = false;
        const { data: s2, count: r2 } = n3.result;
        this.getcount && (this.mixinDatacomPage.count = r2), this.mixinDatacomHasMore = s2.length < this.pageSize;
        const i2 = e2 ? s2.length ? s2[0] : void 0 : s2;
        this.mixinDatacomResData = i2, t2 && t2(i2);
      }).catch((e3) => {
        this.mixinDatacomLoading = false, this.mixinDatacomErrorMessage = e3, n2 && n2(e3);
      }));
    }, mixinDatacomGet(t2 = {}) {
      let n2 = e.database(this.spaceInfo);
      const s2 = t2.action || this.action;
      s2 && (n2 = n2.action(s2));
      const r2 = t2.collection || this.collection;
      n2 = Array.isArray(r2) ? n2.collection(...r2) : n2.collection(r2);
      const i2 = t2.where || this.where;
      i2 && Object.keys(i2).length && (n2 = n2.where(i2));
      const o2 = t2.field || this.field;
      o2 && (n2 = n2.field(o2));
      const a2 = t2.foreignKey || this.foreignKey;
      a2 && (n2 = n2.foreignKey(a2));
      const c2 = t2.groupby || this.groupby;
      c2 && (n2 = n2.groupBy(c2));
      const u2 = t2.groupField || this.groupField;
      u2 && (n2 = n2.groupField(u2));
      true === (void 0 !== t2.distinct ? t2.distinct : this.distinct) && (n2 = n2.distinct());
      const l2 = t2.orderby || this.orderby;
      l2 && (n2 = n2.orderBy(l2));
      const h2 = void 0 !== t2.pageCurrent ? t2.pageCurrent : this.mixinDatacomPage.current, d2 = void 0 !== t2.pageSize ? t2.pageSize : this.mixinDatacomPage.size, p2 = void 0 !== t2.getcount ? t2.getcount : this.getcount, f2 = void 0 !== t2.gettree ? t2.gettree : this.gettree, g2 = void 0 !== t2.gettreepath ? t2.gettreepath : this.gettreepath, m2 = { getCount: p2 }, y2 = { limitLevel: void 0 !== t2.limitlevel ? t2.limitlevel : this.limitlevel, startWith: void 0 !== t2.startwith ? t2.startwith : this.startwith };
      return f2 && (m2.getTree = y2), g2 && (m2.getTreePath = y2), n2 = n2.skip(d2 * (h2 - 1)).limit(d2).get(m2), n2;
    } } };
  }
  function Is(e) {
    return function(t2, n2 = {}) {
      n2 = function(e2, t3 = {}) {
        return e2.customUI = t3.customUI || e2.customUI, e2.parseSystemError = t3.parseSystemError || e2.parseSystemError, Object.assign(e2.loadingOptions, t3.loadingOptions), Object.assign(e2.errorOptions, t3.errorOptions), "object" == typeof t3.secretMethods && (e2.secretMethods = t3.secretMethods), e2;
      }({ customUI: false, loadingOptions: { title: "加载中...", mask: true }, errorOptions: { type: "modal", retry: false } }, n2);
      const { customUI: s2, loadingOptions: r2, errorOptions: i2, parseSystemError: o2 } = n2, a2 = !s2;
      return new Proxy({}, { get: (s3, c2) => function({ fn: e2, interceptorName: t3, getCallbackArgs: n3 } = {}) {
        return async function(...s4) {
          const r3 = n3 ? n3({ params: s4 }) : {};
          let i3, o3;
          try {
            return await q(K(t3, "invoke"), { ...r3 }), i3 = await e2(...s4), await q(K(t3, "success"), { ...r3, result: i3 }), i3;
          } catch (e3) {
            throw o3 = e3, await q(K(t3, "fail"), { ...r3, error: o3 }), o3;
          } finally {
            await q(K(t3, "complete"), o3 ? { ...r3, error: o3 } : { ...r3, result: i3 });
          }
        };
      }({ fn: async function s4(...u2) {
        let h2;
        a2 && uni.showLoading({ title: r2.title, mask: r2.mask });
        const d2 = { name: t2, type: l, data: { method: c2, params: u2 } };
        "object" == typeof n2.secretMethods && function(e2, t3) {
          const n3 = t3.data.method, s5 = e2.secretMethods || {}, r3 = s5[n3] || s5["*"];
          r3 && (t3.secretType = r3);
        }(n2, d2);
        let p2 = false;
        try {
          h2 = await e.callFunction(d2);
        } catch (e2) {
          p2 = true, h2 = { result: new ne(e2) };
        }
        const { errSubject: f2, errCode: g2, errMsg: m2, newToken: y2 } = h2.result || {};
        if (a2 && uni.hideLoading(), y2 && y2.token && y2.tokenExpired && (oe(y2), Q(W, { ...y2 })), g2) {
          let e2 = m2;
          if (p2 && o2) {
            e2 = (await o2({ objectName: t2, methodName: c2, params: u2, errSubject: f2, errCode: g2, errMsg: m2 })).errMsg || m2;
          }
          if (a2)
            if ("toast" === i2.type)
              uni.showToast({ title: e2, icon: "none" });
            else {
              if ("modal" !== i2.type)
                throw new Error(`Invalid errorOptions.type: ${i2.type}`);
              {
                const { confirm: t3 } = await async function({ title: e3, content: t4, showCancel: n4, cancelText: s5, confirmText: r3 } = {}) {
                  return new Promise((i3, o3) => {
                    uni.showModal({ title: e3, content: t4, showCancel: n4, cancelText: s5, confirmText: r3, success(e4) {
                      i3(e4);
                    }, fail() {
                      i3({ confirm: false, cancel: true });
                    } });
                  });
                }({ title: "提示", content: e2, showCancel: i2.retry, cancelText: "取消", confirmText: i2.retry ? "重试" : "确定" });
                if (i2.retry && t3)
                  return s4(...u2);
              }
            }
          const n3 = new ne({ subject: f2, code: g2, message: m2, requestId: h2.requestId });
          throw n3.detail = h2.result, Q(B, { type: H, content: n3 }), n3;
        }
        return Q(B, { type: H, content: h2.result }), h2.result;
      }, interceptorName: "callObject", getCallbackArgs: function({ params: e2 } = {}) {
        return { objectName: t2, methodName: c2, params: e2 };
      } }) });
    };
  }
  function Ts(e) {
    return U("_globalUniCloudSecureNetworkCache__{spaceId}".replace("{spaceId}", e.config.spaceId));
  }
  async function Cs({ openid: e, callLoginByWeixin: t2 = false } = {}) {
    Ts(this);
    throw new Error(`[SecureNetwork] API \`initSecureNetworkByWeixin\` is not supported on platform \`${A}\``);
  }
  async function As(e) {
    const t2 = Ts(this);
    return t2.initPromise || (t2.initPromise = Cs.call(this, e)), t2.initPromise;
  }
  function Ps(e) {
    return function({ openid: t2, callLoginByWeixin: n2 = false } = {}) {
      return As.call(e, { openid: t2, callLoginByWeixin: n2 });
    };
  }
  async function Es(e, t2) {
    const n2 = `http://${e}:${t2}/system/ping`;
    try {
      const e2 = await (s2 = { url: n2, timeout: 500 }, new Promise((e3, t3) => {
        se.request({ ...s2, success(t4) {
          e3(t4);
        }, fail(e4) {
          t3(e4);
        } });
      }));
      return !(!e2.data || 0 !== e2.data.code);
    } catch (e2) {
      return false;
    }
    var s2;
  }
  async function Os(e) {
    {
      const { osName: e2, osVersion: t3 } = ue();
      "ios" === e2 && function(e3) {
        if (!e3 || "string" != typeof e3)
          return 0;
        const t4 = e3.match(/^(\d+)./);
        return t4 && t4[1] ? parseInt(t4[1]) : 0;
      }(t3) >= 14 && console.warn("iOS 14及以上版本连接uniCloud本地调试服务需要允许客户端查找并连接到本地网络上的设备（仅开发模式生效，发行模式会连接uniCloud云端服务）");
    }
    const t2 = e.__dev__;
    if (!t2.debugInfo)
      return;
    const { address: n2, servePort: s2 } = t2.debugInfo, { address: r2 } = await async function(e2, t3) {
      let n3;
      for (let s3 = 0; s3 < e2.length; s3++) {
        const r3 = e2[s3];
        if (await Es(r3, t3)) {
          n3 = r3;
          break;
        }
      }
      return { address: n3, port: t3 };
    }(n2, s2);
    if (r2)
      return t2.localAddress = r2, void (t2.localPort = s2);
    const i2 = console["error"];
    let o2 = "";
    if ("remote" === t2.debugInfo.initialLaunchType ? (t2.debugInfo.forceRemote = true, o2 = "当前客户端和HBuilderX不在同一局域网下（或其他网络原因无法连接HBuilderX），uniCloud本地调试服务不对当前客户端生效。\n- 如果不使用uniCloud本地调试服务，请直接忽略此信息。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。") : o2 = "无法连接uniCloud本地调试服务，请检查当前客户端是否与主机在同一局域网下。\n- 如需使用uniCloud本地调试服务，请将客户端与主机连接到同一局域网下并重新运行到客户端。", o2 += "\n- 如果在HBuilderX开启的状态下切换过网络环境，请重启HBuilderX后再试\n- 检查系统防火墙是否拦截了HBuilderX自带的nodejs\n- 检查是否错误的使用拦截器修改uni.request方法的参数", 0 === A.indexOf("mp-") && (o2 += "\n- 小程序中如何使用uniCloud，请参考：https://uniapp.dcloud.net.cn/uniCloud/publish.html#useinmp"), !t2.debugInfo.forceRemote)
      throw new Error(o2);
    i2(o2);
  }
  function xs(e) {
    e._initPromiseHub || (e._initPromiseHub = new S({ createPromise: function() {
      let t2 = Promise.resolve();
      var n2;
      n2 = 1, t2 = new Promise((e2) => {
        setTimeout(() => {
          e2();
        }, n2);
      });
      const s2 = e.auth();
      return t2.then(() => s2.getLoginState()).then((e2) => e2 ? Promise.resolve() : s2.signInAnonymously());
    } }));
  }
  const Rs = { tcb: bt, tencent: bt, aliyun: me, private: It };
  let Us = new class {
    init(e) {
      let t2 = {};
      const n2 = Rs[e.provider];
      if (!n2)
        throw new Error("未提供正确的provider参数");
      t2 = n2.init(e), function(e2) {
        const t3 = {};
        e2.__dev__ = t3, t3.debugLog = "app" === A;
        const n3 = P;
        n3 && !n3.code && (t3.debugInfo = n3);
        const s2 = new S({ createPromise: function() {
          return Os(e2);
        } });
        t3.initLocalNetwork = function() {
          return s2.exec();
        };
      }(t2), xs(t2), Rn(t2), function(e2) {
        const t3 = e2.uploadFile;
        e2.uploadFile = function(e3) {
          return t3.call(this, e3);
        };
      }(t2), function(e2) {
        e2.database = function(t3) {
          if (t3 && Object.keys(t3).length > 0)
            return e2.init(t3).database();
          if (this._database)
            return this._database;
          const n3 = $n(Wn, { uniClient: e2 });
          return this._database = n3, n3;
        }, e2.databaseForJQL = function(t3) {
          if (t3 && Object.keys(t3).length > 0)
            return e2.init(t3).databaseForJQL();
          if (this._databaseForJQL)
            return this._databaseForJQL;
          const n3 = $n(Wn, { uniClient: e2, isJQL: true });
          return this._databaseForJQL = n3, n3;
        };
      }(t2), function(e2) {
        e2.getCurrentUserInfo = ws, e2.chooseAndUploadFile = Ss.initChooseAndUploadFile(e2), Object.assign(e2, { get mixinDatacom() {
          return ks(e2);
        } }), e2.importObject = Is(e2), e2.initSecureNetworkByWeixin = Ps(e2);
      }(t2);
      return ["callFunction", "uploadFile", "deleteFile", "getTempFileURL", "downloadFile", "chooseAndUploadFile"].forEach((e2) => {
        if (!t2[e2])
          return;
        const n3 = t2[e2];
        t2[e2] = function() {
          return n3.apply(t2, Array.from(arguments));
        }, t2[e2] = function(e3, t3) {
          return function(n4) {
            let s2 = false;
            if ("callFunction" === t3) {
              const e4 = n4 && n4.type || u;
              s2 = e4 !== u;
            }
            const r2 = "callFunction" === t3 && !s2, i2 = this._initPromiseHub.exec();
            n4 = n4 || {};
            const { success: o2, fail: a2, complete: c2 } = te(n4), l2 = i2.then(() => s2 ? Promise.resolve() : q(K(t3, "invoke"), n4)).then(() => e3.call(this, n4)).then((e4) => s2 ? Promise.resolve(e4) : q(K(t3, "success"), e4).then(() => q(K(t3, "complete"), e4)).then(() => (r2 && Q(B, { type: J, content: e4 }), Promise.resolve(e4))), (e4) => s2 ? Promise.reject(e4) : q(K(t3, "fail"), e4).then(() => q(K(t3, "complete"), e4)).then(() => (Q(B, { type: J, content: e4 }), Promise.reject(e4))));
            if (!(o2 || a2 || c2))
              return l2;
            l2.then((e4) => {
              o2 && o2(e4), c2 && c2(e4), r2 && Q(B, { type: J, content: e4 });
            }, (e4) => {
              a2 && a2(e4), c2 && c2(e4), r2 && Q(B, { type: J, content: e4 });
            });
          };
        }(t2[e2], e2).bind(t2);
      }), t2.init = this.init, t2;
    }
  }();
  (() => {
    const e = E;
    let t2 = {};
    if (e && 1 === e.length)
      t2 = e[0], Us = Us.init(t2), Us._isDefault = true;
    else {
      const t3 = ["auth", "callFunction", "uploadFile", "deleteFile", "getTempFileURL", "downloadFile", "database", "getCurrentUSerInfo", "importObject"];
      let n2;
      n2 = e && e.length > 0 ? "应用有多个服务空间，请通过uniCloud.init方法指定要使用的服务空间" : "应用未关联服务空间，请在uniCloud目录右键关联服务空间", t3.forEach((e2) => {
        Us[e2] = function() {
          return console.error(n2), Promise.reject(new ne({ code: "SYS_ERR", message: n2 }));
        };
      });
    }
    Object.assign(Us, { get mixinDatacom() {
      return ks(Us);
    } }), gs(Us), Us.addInterceptor = D, Us.removeInterceptor = F, Us.interceptObject = M;
  })();
  var Ls = Us;
  const ERR_MSG_OK = "chooseAndUploadFile:ok";
  const ERR_MSG_FAIL = "chooseAndUploadFile:fail";
  function chooseImage(opts) {
    const {
      count,
      sizeType = ["original", "compressed"],
      sourceType = ["album", "camera"],
      extension
    } = opts;
    return new Promise((resolve, reject) => {
      uni.chooseImage({
        count,
        sizeType,
        sourceType,
        extension,
        success(res) {
          resolve(normalizeChooseAndUploadFileRes(res, "image"));
        },
        fail(res) {
          reject({
            errMsg: res.errMsg.replace("chooseImage:fail", ERR_MSG_FAIL)
          });
        }
      });
    });
  }
  function chooseVideo(opts) {
    const {
      camera,
      compressed,
      maxDuration,
      sourceType = ["album", "camera"],
      extension
    } = opts;
    return new Promise((resolve, reject) => {
      uni.chooseVideo({
        camera,
        compressed,
        maxDuration,
        sourceType,
        extension,
        success(res) {
          const {
            tempFilePath,
            duration,
            size,
            height,
            width
          } = res;
          resolve(normalizeChooseAndUploadFileRes({
            errMsg: "chooseVideo:ok",
            tempFilePaths: [tempFilePath],
            tempFiles: [
              {
                name: res.tempFile && res.tempFile.name || "",
                path: tempFilePath,
                size,
                type: res.tempFile && res.tempFile.type || "",
                width,
                height,
                duration,
                fileType: "video",
                cloudPath: ""
              }
            ]
          }, "video"));
        },
        fail(res) {
          reject({
            errMsg: res.errMsg.replace("chooseVideo:fail", ERR_MSG_FAIL)
          });
        }
      });
    });
  }
  function chooseAll(opts) {
    const {
      count,
      extension
    } = opts;
    return new Promise((resolve, reject) => {
      let chooseFile = uni.chooseFile;
      if (typeof wx !== "undefined" && typeof wx.chooseMessageFile === "function") {
        chooseFile = wx.chooseMessageFile;
      }
      if (typeof chooseFile !== "function") {
        return reject({
          errMsg: ERR_MSG_FAIL + " 请指定 type 类型，该平台仅支持选择 image 或 video。"
        });
      }
      chooseFile({
        type: "all",
        count,
        extension,
        success(res) {
          resolve(normalizeChooseAndUploadFileRes(res));
        },
        fail(res) {
          reject({
            errMsg: res.errMsg.replace("chooseFile:fail", ERR_MSG_FAIL)
          });
        }
      });
    });
  }
  function normalizeChooseAndUploadFileRes(res, fileType) {
    res.tempFiles.forEach((item, index) => {
      if (!item.name) {
        item.name = item.path.substring(item.path.lastIndexOf("/") + 1);
      }
      if (fileType) {
        item.fileType = fileType;
      }
      item.cloudPath = Date.now() + "_" + index + item.name.substring(item.name.lastIndexOf("."));
    });
    if (!res.tempFilePaths) {
      res.tempFilePaths = res.tempFiles.map((file) => file.path);
    }
    return res;
  }
  function uploadCloudFiles(files2, max = 5, onUploadProgress) {
    files2 = JSON.parse(JSON.stringify(files2));
    const len = files2.length;
    let count = 0;
    let self2 = this;
    return new Promise((resolve) => {
      while (count < max) {
        next();
      }
      function next() {
        let cur = count++;
        if (cur >= len) {
          !files2.find((item) => !item.url && !item.errMsg) && resolve(files2);
          return;
        }
        const fileItem = files2[cur];
        const index = self2.files.findIndex((v2) => v2.uuid === fileItem.uuid);
        fileItem.url = "";
        delete fileItem.errMsg;
        Ls.uploadFile({
          filePath: fileItem.path,
          cloudPath: fileItem.cloudPath,
          fileType: fileItem.fileType,
          onUploadProgress: (res) => {
            res.index = index;
            onUploadProgress && onUploadProgress(res);
          }
        }).then((res) => {
          fileItem.url = res.fileID;
          fileItem.index = index;
          if (cur < len) {
            next();
          }
        }).catch((res) => {
          fileItem.errMsg = res.errMsg || res.message;
          fileItem.index = index;
          if (cur < len) {
            next();
          }
        });
      }
    });
  }
  function uploadFiles(choosePromise, {
    onChooseFile,
    onUploadProgress
  }) {
    return choosePromise.then((res) => {
      if (onChooseFile) {
        const customChooseRes = onChooseFile(res);
        if (typeof customChooseRes !== "undefined") {
          return Promise.resolve(customChooseRes).then((chooseRes) => typeof chooseRes === "undefined" ? res : chooseRes);
        }
      }
      return res;
    }).then((res) => {
      if (res === false) {
        return {
          errMsg: ERR_MSG_OK,
          tempFilePaths: [],
          tempFiles: []
        };
      }
      return res;
    });
  }
  function chooseAndUploadFile(opts = {
    type: "all"
  }) {
    if (opts.type === "image") {
      return uploadFiles(chooseImage(opts), opts);
    } else if (opts.type === "video") {
      return uploadFiles(chooseVideo(opts), opts);
    }
    return uploadFiles(chooseAll(opts), opts);
  }
  const get_file_ext = (name) => {
    const last_len = name.lastIndexOf(".");
    const len = name.length;
    return {
      name: name.substring(0, last_len),
      ext: name.substring(last_len + 1, len)
    };
  };
  const get_extname = (fileExtname) => {
    if (!Array.isArray(fileExtname)) {
      let extname = fileExtname.replace(/(\[|\])/g, "");
      return extname.split(",");
    } else {
      return fileExtname;
    }
  };
  const get_files_and_is_max = (res, _extname) => {
    let filePaths = [];
    let files2 = [];
    if (!_extname || _extname.length === 0) {
      return {
        filePaths,
        files: files2
      };
    }
    res.tempFiles.forEach((v2) => {
      let fileFullName = get_file_ext(v2.name);
      const extname = fileFullName.ext.toLowerCase();
      if (_extname.indexOf(extname) !== -1) {
        files2.push(v2);
        filePaths.push(v2.path);
      }
    });
    if (files2.length !== res.tempFiles.length) {
      uni.showToast({
        title: `当前选择了${res.tempFiles.length}个文件 ，${res.tempFiles.length - files2.length} 个文件格式不正确`,
        icon: "none",
        duration: 5e3
      });
    }
    return {
      filePaths,
      files: files2
    };
  };
  const get_file_info = (filepath) => {
    return new Promise((resolve, reject) => {
      uni.getImageInfo({
        src: filepath,
        success(res) {
          resolve(res);
        },
        fail(err) {
          reject(err);
        }
      });
    });
  };
  const get_file_data = async (files2, type = "image") => {
    let fileFullName = get_file_ext(files2.name);
    const extname = fileFullName.ext.toLowerCase();
    let filedata = {
      name: files2.name,
      uuid: files2.uuid,
      extname: extname || "",
      cloudPath: files2.cloudPath,
      fileType: files2.fileType,
      url: files2.path || files2.path,
      size: files2.size,
      //单位是字节
      image: {},
      path: files2.path,
      video: {}
    };
    if (type === "image") {
      const imageinfo = await get_file_info(files2.path);
      delete filedata.video;
      filedata.image.width = imageinfo.width;
      filedata.image.height = imageinfo.height;
      filedata.image.location = imageinfo.path;
    } else {
      delete filedata.image;
    }
    return filedata;
  };
  const _sfc_main$t = {
    name: "uploadImage",
    emits: ["uploadFiles", "choose", "delFile"],
    props: {
      filesList: {
        type: Array,
        default() {
          return [];
        }
      },
      disabled: {
        type: Boolean,
        default: false
      },
      disablePreview: {
        type: Boolean,
        default: false
      },
      limit: {
        type: [Number, String],
        default: 9
      },
      imageStyles: {
        type: Object,
        default() {
          return {
            width: "auto",
            height: "auto",
            border: {}
          };
        }
      },
      delIcon: {
        type: Boolean,
        default: true
      },
      readonly: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      styles() {
        let styles = {
          width: "auto",
          height: "auto",
          border: {}
        };
        return Object.assign(styles, this.imageStyles);
      },
      boxStyle() {
        const {
          width = "auto",
          height = "auto"
        } = this.styles;
        let obj = {};
        if (height === "auto") {
          if (width !== "auto") {
            obj.height = this.value2px(width);
            obj["padding-top"] = 0;
          } else {
            obj.height = 0;
          }
        } else {
          obj.height = this.value2px(height);
          obj["padding-top"] = 0;
        }
        if (width === "auto") {
          if (height !== "auto") {
            obj.width = this.value2px(height);
          } else {
            obj.width = "33.3%";
          }
        } else {
          obj.width = this.value2px(width);
        }
        let classles = "";
        for (let i2 in obj) {
          classles += `${i2}:${obj[i2]};`;
        }
        return classles;
      },
      borderStyle() {
        let {
          border
        } = this.styles;
        let obj = {};
        const widthDefaultValue = 1;
        const radiusDefaultValue = 3;
        if (typeof border === "boolean") {
          obj.border = border ? "1px #eee solid" : "none";
        } else {
          let width = border && border.width || widthDefaultValue;
          width = this.value2px(width);
          let radius = border && border.radius || radiusDefaultValue;
          radius = this.value2px(radius);
          obj = {
            "border-width": width,
            "border-style": border && border.style || "solid",
            "border-color": border && border.color || "#eee",
            "border-radius": radius
          };
        }
        let classles = "";
        for (let i2 in obj) {
          classles += `${i2}:${obj[i2]};`;
        }
        return classles;
      }
    },
    methods: {
      uploadFiles(item, index) {
        this.$emit("uploadFiles", item);
      },
      choose() {
        this.$emit("choose");
      },
      delFile(index) {
        this.$emit("delFile", index);
      },
      prviewImage(img, index) {
        let urls = [];
        if (Number(this.limit) === 1 && this.disablePreview && !this.disabled) {
          this.$emit("choose");
        }
        if (this.disablePreview)
          return;
        this.filesList.forEach((i2) => {
          urls.push(i2.url);
        });
        uni.previewImage({
          urls,
          current: index
        });
      },
      value2px(value) {
        if (typeof value === "number") {
          value += "px";
        } else {
          if (value.indexOf("%") === -1) {
            value = value.indexOf("px") !== -1 ? value : value + "px";
          }
        }
        return value;
      }
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-file-picker__container" }, [
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($props.filesList, (item, index) => {
          return vue.openBlock(), vue.createElementBlock(
            "view",
            {
              class: "file-picker__box",
              key: index,
              style: vue.normalizeStyle($options.boxStyle)
            },
            [
              vue.createElementVNode(
                "view",
                {
                  class: "file-picker__box-content",
                  style: vue.normalizeStyle($options.borderStyle)
                },
                [
                  vue.createElementVNode("image", {
                    class: "file-image",
                    src: item.url,
                    mode: "aspectFill",
                    onClick: vue.withModifiers(($event) => $options.prviewImage(item, index), ["stop"])
                  }, null, 8, ["src", "onClick"]),
                  $props.delIcon && !$props.readonly ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "icon-del-box",
                    onClick: vue.withModifiers(($event) => $options.delFile(index), ["stop"])
                  }, [
                    vue.createElementVNode("view", { class: "icon-del" }),
                    vue.createElementVNode("view", { class: "icon-del rotate" })
                  ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true),
                  item.progress && item.progress !== 100 || item.progress === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "file-picker__progress"
                  }, [
                    vue.createElementVNode("progress", {
                      class: "file-picker__progress-item",
                      percent: item.progress === -1 ? 0 : item.progress,
                      "stroke-width": "4",
                      backgroundColor: item.errMsg ? "#ff5a5f" : "#EBEBEB"
                    }, null, 8, ["percent", "backgroundColor"])
                  ])) : vue.createCommentVNode("v-if", true),
                  item.errMsg ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 2,
                    class: "file-picker__mask",
                    onClick: vue.withModifiers(($event) => $options.uploadFiles(item, index), ["stop"])
                  }, " 点击重试 ", 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
                ],
                4
                /* STYLE */
              )
            ],
            4
            /* STYLE */
          );
        }),
        128
        /* KEYED_FRAGMENT */
      )),
      $props.filesList.length < $props.limit && !$props.readonly ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          class: "file-picker__box",
          style: vue.normalizeStyle($options.boxStyle)
        },
        [
          vue.createElementVNode(
            "view",
            {
              class: "file-picker__box-content is-add",
              style: vue.normalizeStyle($options.borderStyle),
              onClick: _cache[0] || (_cache[0] = (...args) => $options.choose && $options.choose(...args))
            },
            [
              vue.renderSlot(_ctx.$slots, "default", {}, () => [
                vue.createElementVNode("view", { class: "icon-add" }),
                vue.createElementVNode("view", { class: "icon-add rotate" })
              ], true)
            ],
            4
            /* STYLE */
          )
        ],
        4
        /* STYLE */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const uploadImage = /* @__PURE__ */ _export_sfc(_sfc_main$t, [["render", _sfc_render$a], ["__scopeId", "data-v-bdfc07e0"], ["__file", "F:/HBuilderProjects/FreeMarket/uni_modules/uni-file-picker/components/uni-file-picker/upload-image.vue"]]);
  const _sfc_main$s = {
    name: "uploadFile",
    emits: ["uploadFiles", "choose", "delFile"],
    props: {
      filesList: {
        type: Array,
        default() {
          return [];
        }
      },
      delIcon: {
        type: Boolean,
        default: true
      },
      limit: {
        type: [Number, String],
        default: 9
      },
      showType: {
        type: String,
        default: ""
      },
      listStyles: {
        type: Object,
        default() {
          return {
            // 是否显示边框
            border: true,
            // 是否显示分隔线
            dividline: true,
            // 线条样式
            borderStyle: {}
          };
        }
      },
      readonly: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      list() {
        let files2 = [];
        this.filesList.forEach((v2) => {
          files2.push(v2);
        });
        return files2;
      },
      styles() {
        let styles = {
          border: true,
          dividline: true,
          "border-style": {}
        };
        return Object.assign(styles, this.listStyles);
      },
      borderStyle() {
        let {
          borderStyle,
          border
        } = this.styles;
        let obj = {};
        if (!border) {
          obj.border = "none";
        } else {
          let width = borderStyle && borderStyle.width || 1;
          width = this.value2px(width);
          let radius = borderStyle && borderStyle.radius || 5;
          radius = this.value2px(radius);
          obj = {
            "border-width": width,
            "border-style": borderStyle && borderStyle.style || "solid",
            "border-color": borderStyle && borderStyle.color || "#eee",
            "border-radius": radius
          };
        }
        let classles = "";
        for (let i2 in obj) {
          classles += `${i2}:${obj[i2]};`;
        }
        return classles;
      },
      borderLineStyle() {
        let obj = {};
        let {
          borderStyle
        } = this.styles;
        if (borderStyle && borderStyle.color) {
          obj["border-color"] = borderStyle.color;
        }
        if (borderStyle && borderStyle.width) {
          let width = borderStyle && borderStyle.width || 1;
          let style = borderStyle && borderStyle.style || 0;
          if (typeof width === "number") {
            width += "px";
          } else {
            width = width.indexOf("px") ? width : width + "px";
          }
          obj["border-width"] = width;
          if (typeof style === "number") {
            style += "px";
          } else {
            style = style.indexOf("px") ? style : style + "px";
          }
          obj["border-top-style"] = style;
        }
        let classles = "";
        for (let i2 in obj) {
          classles += `${i2}:${obj[i2]};`;
        }
        return classles;
      }
    },
    methods: {
      uploadFiles(item, index) {
        this.$emit("uploadFiles", {
          item,
          index
        });
      },
      choose() {
        this.$emit("choose");
      },
      delFile(index) {
        this.$emit("delFile", index);
      },
      value2px(value) {
        if (typeof value === "number") {
          value += "px";
        } else {
          value = value.indexOf("px") !== -1 ? value : value + "px";
        }
        return value;
      }
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-file-picker__files" }, [
      !$props.readonly ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "files-button",
        onClick: _cache[0] || (_cache[0] = (...args) => $options.choose && $options.choose(...args))
      }, [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(` :class="{'is-text-box':showType === 'list'}" `),
      $options.list.length > 0 ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 1,
          class: "uni-file-picker__lists is-text-box",
          style: vue.normalizeStyle($options.borderStyle)
        },
        [
          vue.createCommentVNode(" ,'is-list-card':showType === 'list-card' "),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($options.list, (item, index) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  class: vue.normalizeClass(["uni-file-picker__lists-box", {
                    "files-border": index !== 0 && $options.styles.dividline
                  }]),
                  key: index,
                  style: vue.normalizeStyle(index !== 0 && $options.styles.dividline && $options.borderLineStyle)
                },
                [
                  vue.createElementVNode("view", { class: "uni-file-picker__item" }, [
                    vue.createCommentVNode(` :class="{'is-text-image':showType === 'list'}" `),
                    vue.createCommentVNode(' 	<view class="files__image is-text-image">\r\n						<image class="header-image" :src="item.logo" mode="aspectFit"></image>\r\n					</view> '),
                    vue.createElementVNode(
                      "view",
                      { class: "files__name" },
                      vue.toDisplayString(item.name),
                      1
                      /* TEXT */
                    ),
                    $props.delIcon && !$props.readonly ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "icon-del-box icon-files",
                      onClick: ($event) => $options.delFile(index)
                    }, [
                      vue.createElementVNode("view", { class: "icon-del icon-files" }),
                      vue.createElementVNode("view", { class: "icon-del rotate" })
                    ], 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
                  ]),
                  item.progress && item.progress !== 100 || item.progress === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "file-picker__progress"
                  }, [
                    vue.createElementVNode("progress", {
                      class: "file-picker__progress-item",
                      percent: item.progress === -1 ? 0 : item.progress,
                      "stroke-width": "4",
                      backgroundColor: item.errMsg ? "#ff5a5f" : "#EBEBEB"
                    }, null, 8, ["percent", "backgroundColor"])
                  ])) : vue.createCommentVNode("v-if", true),
                  item.status === "error" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "file-picker__mask",
                    onClick: vue.withModifiers(($event) => $options.uploadFiles(item, index), ["stop"])
                  }, " 点击重试 ", 8, ["onClick"])) : vue.createCommentVNode("v-if", true)
                ],
                6
                /* CLASS, STYLE */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ],
        4
        /* STYLE */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const uploadFile = /* @__PURE__ */ _export_sfc(_sfc_main$s, [["render", _sfc_render$9], ["__scopeId", "data-v-a54939c6"], ["__file", "F:/HBuilderProjects/FreeMarket/uni_modules/uni-file-picker/components/uni-file-picker/upload-file.vue"]]);
  const _sfc_main$r = {
    name: "uniFilePicker",
    components: {
      uploadImage,
      uploadFile
    },
    options: {
      virtualHost: true
    },
    emits: ["select", "success", "fail", "progress", "delete", "update:modelValue", "input"],
    props: {
      modelValue: {
        type: [Array, Object],
        default() {
          return [];
        }
      },
      disabled: {
        type: Boolean,
        default: false
      },
      disablePreview: {
        type: Boolean,
        default: false
      },
      delIcon: {
        type: Boolean,
        default: true
      },
      // 自动上传
      autoUpload: {
        type: Boolean,
        default: true
      },
      // 最大选择个数 ，h5只能限制单选或是多选
      limit: {
        type: [Number, String],
        default: 9
      },
      // 列表样式 grid | list | list-card
      mode: {
        type: String,
        default: "grid"
      },
      // 选择文件类型  image/video/all
      fileMediatype: {
        type: String,
        default: "image"
      },
      // 文件类型筛选
      fileExtname: {
        type: [Array, String],
        default() {
          return [];
        }
      },
      title: {
        type: String,
        default: ""
      },
      listStyles: {
        type: Object,
        default() {
          return {
            // 是否显示边框
            border: true,
            // 是否显示分隔线
            dividline: true,
            // 线条样式
            borderStyle: {}
          };
        }
      },
      imageStyles: {
        type: Object,
        default() {
          return {
            width: "auto",
            height: "auto"
          };
        }
      },
      readonly: {
        type: Boolean,
        default: false
      },
      returnType: {
        type: String,
        default: "array"
      },
      sizeType: {
        type: Array,
        default() {
          return ["original", "compressed"];
        }
      }
    },
    data() {
      return {
        files: [],
        localValue: []
      };
    },
    watch: {
      modelValue: {
        handler(newVal, oldVal) {
          this.setValue(newVal, oldVal);
        },
        immediate: true
      }
    },
    computed: {
      filesList() {
        let files2 = [];
        this.files.forEach((v2) => {
          files2.push(v2);
        });
        return files2;
      },
      showType() {
        if (this.fileMediatype === "image") {
          return this.mode;
        }
        return "list";
      },
      limitLength() {
        if (this.returnType === "object") {
          return 1;
        }
        if (!this.limit) {
          return 1;
        }
        if (this.limit >= 9) {
          return 9;
        }
        return this.limit;
      }
    },
    created() {
      if (!(Ls.config && Ls.config.provider)) {
        this.noSpace = true;
        Ls.chooseAndUploadFile = chooseAndUploadFile;
      }
      this.form = this.getForm("uniForms");
      this.formItem = this.getForm("uniFormsItem");
      if (this.form && this.formItem) {
        if (this.formItem.name) {
          this.rename = this.formItem.name;
          this.form.inputChildrens.push(this);
        }
      }
    },
    methods: {
      /**
       * 公开用户使用，清空文件
       * @param {Object} index
       */
      clearFiles(index) {
        if (index !== 0 && !index) {
          this.files = [];
          this.$nextTick(() => {
            this.setEmit();
          });
        } else {
          this.files.splice(index, 1);
        }
        this.$nextTick(() => {
          this.setEmit();
        });
      },
      /**
       * 公开用户使用，继续上传
       */
      upload() {
        let files2 = [];
        this.files.forEach((v2, index) => {
          if (v2.status === "ready" || v2.status === "error") {
            files2.push(Object.assign({}, v2));
          }
        });
        return this.uploadFiles(files2);
      },
      async setValue(newVal, oldVal) {
        const newData = async (v2) => {
          const reg = /cloud:\/\/([\w.]+\/?)\S*/;
          let url = "";
          if (v2.fileID) {
            url = v2.fileID;
          } else {
            url = v2.url;
          }
          if (reg.test(url)) {
            v2.fileID = url;
            v2.url = await this.getTempFileURL(url);
          }
          if (v2.url)
            v2.path = v2.url;
          return v2;
        };
        if (this.returnType === "object") {
          if (newVal) {
            await newData(newVal);
          } else {
            newVal = {};
          }
        } else {
          if (!newVal)
            newVal = [];
          for (let i2 = 0; i2 < newVal.length; i2++) {
            let v2 = newVal[i2];
            await newData(v2);
          }
        }
        this.localValue = newVal;
        if (this.form && this.formItem && !this.is_reset) {
          this.is_reset = false;
          this.formItem.setValue(this.localValue);
        }
        let filesData = Object.keys(newVal).length > 0 ? newVal : [];
        this.files = [].concat(filesData);
      },
      /**
       * 选择文件
       */
      choose() {
        if (this.disabled)
          return;
        if (this.files.length >= Number(this.limitLength) && this.showType !== "grid" && this.returnType === "array") {
          uni.showToast({
            title: `您最多选择 ${this.limitLength} 个文件`,
            icon: "none"
          });
          return;
        }
        this.chooseFiles();
      },
      /**
       * 选择文件并上传
       */
      chooseFiles() {
        const _extname = get_extname(this.fileExtname);
        Ls.chooseAndUploadFile({
          type: this.fileMediatype,
          compressed: false,
          sizeType: this.sizeType,
          // TODO 如果为空，video 有问题
          extension: _extname.length > 0 ? _extname : void 0,
          count: this.limitLength - this.files.length,
          //默认9
          onChooseFile: this.chooseFileCallback,
          onUploadProgress: (progressEvent) => {
            this.setProgress(progressEvent, progressEvent.index);
          }
        }).then((result) => {
          this.setSuccessAndError(result.tempFiles);
        }).catch((err) => {
          formatAppLog("log", "at uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.vue:364", "选择失败", err);
        });
      },
      /**
       * 选择文件回调
       * @param {Object} res
       */
      async chooseFileCallback(res) {
        const _extname = get_extname(this.fileExtname);
        const is_one = Number(this.limitLength) === 1 && this.disablePreview && !this.disabled || this.returnType === "object";
        if (is_one) {
          this.files = [];
        }
        let {
          filePaths,
          files: files2
        } = get_files_and_is_max(res, _extname);
        if (!(_extname && _extname.length > 0)) {
          filePaths = res.tempFilePaths;
          files2 = res.tempFiles;
        }
        let currentData = [];
        for (let i2 = 0; i2 < files2.length; i2++) {
          if (this.limitLength - this.files.length <= 0)
            break;
          files2[i2].uuid = Date.now();
          let filedata = await get_file_data(files2[i2], this.fileMediatype);
          filedata.progress = 0;
          filedata.status = "ready";
          this.files.push(filedata);
          currentData.push({
            ...filedata,
            file: files2[i2]
          });
        }
        this.$emit("select", {
          tempFiles: currentData,
          tempFilePaths: filePaths
        });
        res.tempFiles = files2;
        if (!this.autoUpload || this.noSpace) {
          res.tempFiles = [];
        }
      },
      /**
       * 批传
       * @param {Object} e
       */
      uploadFiles(files2) {
        files2 = [].concat(files2);
        return uploadCloudFiles.call(this, files2, 5, (res) => {
          this.setProgress(res, res.index, true);
        }).then((result) => {
          this.setSuccessAndError(result);
          return result;
        }).catch((err) => {
          formatAppLog("log", "at uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.vue:430", err);
        });
      },
      /**
       * 成功或失败
       */
      async setSuccessAndError(res, fn) {
        let successData = [];
        let errorData = [];
        let tempFilePath = [];
        let errorTempFilePath = [];
        for (let i2 = 0; i2 < res.length; i2++) {
          const item = res[i2];
          const index = item.uuid ? this.files.findIndex((p2) => p2.uuid === item.uuid) : item.index;
          if (index === -1 || !this.files)
            break;
          if (item.errMsg === "request:fail") {
            this.files[index].url = item.path;
            this.files[index].status = "error";
            this.files[index].errMsg = item.errMsg;
            errorData.push(this.files[index]);
            errorTempFilePath.push(this.files[index].url);
          } else {
            this.files[index].errMsg = "";
            this.files[index].fileID = item.url;
            const reg = /cloud:\/\/([\w.]+\/?)\S*/;
            if (reg.test(item.url)) {
              this.files[index].url = await this.getTempFileURL(item.url);
            } else {
              this.files[index].url = item.url;
            }
            this.files[index].status = "success";
            this.files[index].progress += 1;
            successData.push(this.files[index]);
            tempFilePath.push(this.files[index].fileID);
          }
        }
        if (successData.length > 0) {
          this.setEmit();
          this.$emit("success", {
            tempFiles: this.backObject(successData),
            tempFilePaths: tempFilePath
          });
        }
        if (errorData.length > 0) {
          this.$emit("fail", {
            tempFiles: this.backObject(errorData),
            tempFilePaths: errorTempFilePath
          });
        }
      },
      /**
       * 获取进度
       * @param {Object} progressEvent
       * @param {Object} index
       * @param {Object} type
       */
      setProgress(progressEvent, index, type) {
        this.files.length;
        const percentCompleted = Math.round(progressEvent.loaded * 100 / progressEvent.total);
        let idx = index;
        if (!type) {
          idx = this.files.findIndex((p2) => p2.uuid === progressEvent.tempFile.uuid);
        }
        if (idx === -1 || !this.files[idx])
          return;
        this.files[idx].progress = percentCompleted - 1;
        this.$emit("progress", {
          index: idx,
          progress: parseInt(percentCompleted),
          tempFile: this.files[idx]
        });
      },
      /**
       * 删除文件
       * @param {Object} index
       */
      delFile(index) {
        this.$emit("delete", {
          tempFile: this.files[index],
          tempFilePath: this.files[index].url
        });
        this.files.splice(index, 1);
        this.$nextTick(() => {
          this.setEmit();
        });
      },
      /**
       * 获取文件名和后缀
       * @param {Object} name
       */
      getFileExt(name) {
        const last_len = name.lastIndexOf(".");
        const len = name.length;
        return {
          name: name.substring(0, last_len),
          ext: name.substring(last_len + 1, len)
        };
      },
      /**
       * 处理返回事件
       */
      setEmit() {
        let data = [];
        if (this.returnType === "object") {
          data = this.backObject(this.files)[0];
          this.localValue = data ? data : null;
        } else {
          data = this.backObject(this.files);
          if (!this.localValue) {
            this.localValue = [];
          }
          this.localValue = [...data];
        }
        this.$emit("update:modelValue", this.localValue);
      },
      /**
       * 处理返回参数
       * @param {Object} files
       */
      backObject(files2) {
        let newFilesData = [];
        files2.forEach((v2) => {
          newFilesData.push({
            extname: v2.extname,
            fileType: v2.fileType,
            image: v2.image,
            name: v2.name,
            path: v2.path,
            size: v2.size,
            fileID: v2.fileID,
            url: v2.url
          });
        });
        return newFilesData;
      },
      async getTempFileURL(fileList) {
        fileList = {
          fileList: [].concat(fileList)
        };
        const urls = await Ls.getTempFileURL(fileList);
        return urls.fileList[0].tempFileURL || "";
      },
      /**
       * 获取父元素实例
       */
      getForm(name = "uniForms") {
        let parent = this.$parent;
        let parentName = parent.$options.name;
        while (parentName !== name) {
          parent = parent.$parent;
          if (!parent)
            return false;
          parentName = parent.$options.name;
        }
        return parent;
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_upload_image = vue.resolveComponent("upload-image");
    const _component_upload_file = vue.resolveComponent("upload-file");
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-file-picker" }, [
      $props.title ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "uni-file-picker__header"
      }, [
        vue.createElementVNode(
          "text",
          { class: "file-title" },
          vue.toDisplayString($props.title),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "file-count" },
          vue.toDisplayString($options.filesList.length) + "/" + vue.toDisplayString($options.limitLength),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      $props.fileMediatype === "image" && $options.showType === "grid" ? (vue.openBlock(), vue.createBlock(_component_upload_image, {
        key: 1,
        readonly: $props.readonly,
        "image-styles": $props.imageStyles,
        "files-list": $options.filesList,
        limit: $options.limitLength,
        disablePreview: $props.disablePreview,
        delIcon: $props.delIcon,
        onUploadFiles: $options.uploadFiles,
        onChoose: $options.choose,
        onDelFile: $options.delFile
      }, {
        default: vue.withCtx(() => [
          vue.renderSlot(_ctx.$slots, "default", {}, () => [
            vue.createElementVNode("view", { class: "is-add" }, [
              vue.createElementVNode("view", { class: "icon-add" }),
              vue.createElementVNode("view", { class: "icon-add rotate" })
            ])
          ], true)
        ]),
        _: 3
        /* FORWARDED */
      }, 8, ["readonly", "image-styles", "files-list", "limit", "disablePreview", "delIcon", "onUploadFiles", "onChoose", "onDelFile"])) : vue.createCommentVNode("v-if", true),
      $props.fileMediatype !== "image" || $options.showType !== "grid" ? (vue.openBlock(), vue.createBlock(_component_upload_file, {
        key: 2,
        readonly: $props.readonly,
        "list-styles": $props.listStyles,
        "files-list": $options.filesList,
        showType: $options.showType,
        delIcon: $props.delIcon,
        onUploadFiles: $options.uploadFiles,
        onChoose: $options.choose,
        onDelFile: $options.delFile
      }, {
        default: vue.withCtx(() => [
          vue.renderSlot(_ctx.$slots, "default", {}, () => [
            vue.createElementVNode("button", {
              type: "primary",
              size: "mini"
            }, "选择文件")
          ], true)
        ]),
        _: 3
        /* FORWARDED */
      }, 8, ["readonly", "list-styles", "files-list", "showType", "delIcon", "onUploadFiles", "onChoose", "onDelFile"])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_1$3 = /* @__PURE__ */ _export_sfc(_sfc_main$r, [["render", _sfc_render$8], ["__scopeId", "data-v-6223573f"], ["__file", "F:/HBuilderProjects/FreeMarket/uni_modules/uni-file-picker/components/uni-file-picker/uni-file-picker.vue"]]);
  const _sfc_main$q = /* @__PURE__ */ vue.defineComponent({
    __name: "new_post",
    setup(__props) {
      const imgList = vue.ref([]);
      function uploadFile2(e) {
        uni.uploadFile({
          url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.files.prefix + cfg.api.files.upload_file,
          filePath: e.tempFilePaths[0],
          name: "file",
          success(res) {
          }
        });
      }
      function removeFile(e) {
      }
      return (_ctx, _cache) => {
        const _component_uni_file_picker = resolveEasycom(vue.resolveDynamicComponent("uni-file-picker"), __easycom_1$3);
        return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
          vue.createElementVNode("view", null, [
            vue.createCommentVNode(" 标题 "),
            vue.createElementVNode("input", { placeholder: "帖子标题" }),
            vue.createCommentVNode(" 正文 "),
            vue.createElementVNode("textarea", { placeholder: "正文" }),
            vue.createCommentVNode(" 按钮 "),
            vue.createElementVNode("button", null, "发表"),
            vue.createCommentVNode(" 配图 "),
            vue.createVNode(_component_uni_file_picker, {
              modelValue: imgList.value,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => imgList.value = $event),
              fileMediatype: "image",
              limit: "9",
              title: "配图",
              onSelect: uploadFile2,
              onDelete: removeFile
            }, null, 8, ["modelValue"])
          ])
        ]);
      };
    }
  });
  const PagesNew_postNew_post = /* @__PURE__ */ _export_sfc(_sfc_main$q, [["__file", "F:/HBuilderProjects/FreeMarket/pages/new_post/new_post.vue"]]);
  const _sfc_main$p = /* @__PURE__ */ vue.defineComponent({
    __name: "new_goods",
    setup(__props) {
      const newGoods = vue.ref({
        goods_id: "",
        owner: getApp().globalData.login.userid,
        goods_name: "",
        price: 0,
        desc: "",
        status: "",
        imgs: [],
        post_date: "",
        isDel: false
      });
      const price_str = vue.ref(newGoods.value.price.toString());
      const operation = vue.ref("");
      const imgList = vue.ref([]);
      const pricePopup = vue.ref(null);
      onLoad((option) => {
        operation.value = option.operation;
        if (operation.value === "modify") {
          uni.request({
            url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.goods.prefix + cfg.api.goods.goods_info,
            method: "POST",
            data: {
              goods_id: option.goods_id,
              isEdit: true
            },
            success(res) {
              formatAppLog("log", "at pages/new_goods/new_goods.vue:95", res);
              if (res.statusCode === 200) {
                newGoods.value = res.data;
                imgList.value = JSON.parse(JSON.stringify(res.data.imgs));
                for (let i2 in imgList.value) {
                  imgList.value[i2].url = cfg.server + ":" + cfg.port + "/" + imgList.value[i2].url;
                }
                formatAppLog("log", "at pages/new_goods/new_goods.vue:103", imgList.value);
                formatAppLog("log", "at pages/new_goods/new_goods.vue:104", newGoods.value);
              }
            }
          });
        }
      });
      function showPrice() {
        price_str.value = newGoods.value.price.toString();
        pricePopup.value.open();
      }
      function keyboard(input) {
        formatAppLog("log", "at pages/new_goods/new_goods.vue:136", input);
        switch (input) {
          case "clear": {
            price_str.value = "0";
            break;
          }
          case "<": {
            price_str.value = price_str.value.slice(0, price_str.value.length - 1);
            formatAppLog("log", "at pages/new_goods/new_goods.vue:150", price_str.value.length);
            formatAppLog("log", "at pages/new_goods/new_goods.vue:151", 0, price_str.value.length - 1);
            formatAppLog("log", "at pages/new_goods/new_goods.vue:152", price_str.value);
            if (price_str.value.length === 0)
              price_str.value = "0";
            break;
          }
          case "ok": {
            const tmp = price_str.value.split(".");
            if (tmp.length === 2 && tmp[1].length > 2) {
              tmp[1] = tmp[1].slice(0, 2);
              price_str.value = tmp[0].concat(".".concat(tmp[1]));
            }
            newGoods.value.price = price_str.value * 1;
            pricePopup.value.close();
            break;
          }
          default: {
            if (price_str.value === "0") {
              if (input === ".")
                price_str.value += input;
              else
                price_str.value = input;
            } else {
              price_str.value = price_str.value.concat(input);
              if (input === ".") {
                const regex = /[.]/g;
                const dict = price_str.value.match(regex);
                formatAppLog("log", "at pages/new_goods/new_goods.vue:178", dict);
                formatAppLog("log", "at pages/new_goods/new_goods.vue:180", dict.length);
                if (dict && dict.length > 1)
                  price_str.value = price_str.value.slice(0, price_str.value.length - 1);
              }
            }
            formatAppLog("log", "at pages/new_goods/new_goods.vue:187", price_str.value);
            break;
          }
        }
      }
      function uploadFile2(e) {
        formatAppLog("log", "at pages/new_goods/new_goods.vue:202", "upload", e);
        formatAppLog("log", "at pages/new_goods/new_goods.vue:203", newGoods.value.imgs);
        uni.uploadFile({
          url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.files.prefix + cfg.api.files.upload_file,
          filePath: e.tempFilePaths[0],
          name: "file",
          success(res) {
            formatAppLog("log", "at pages/new_goods/new_goods.vue:214", res);
            if (res.statusCode === 200) {
              const url_t = JSON.parse(res.data)[0].path.split("\\");
              const url = "files\\\\".concat(url_t[1]);
              newGoods.value.imgs.push({
                name: JSON.parse(res.data)[0].filename,
                url,
                extname: e.tempFiles[0].extname
              });
              formatAppLog("log", "at pages/new_goods/new_goods.vue:225", newGoods.value.imgs);
            }
          }
        });
      }
      function removeFile(e) {
        newGoods.value.imgs = newGoods.value.imgs.filter((i2) => i2.name !== e.tempFile.name);
        imgList.value = imgList.value.filter((i2) => i2.name !== e.tempFile.name);
        formatAppLog("log", "at pages/new_goods/new_goods.vue:241", "imgList:", imgList.value);
        formatAppLog("log", "at pages/new_goods/new_goods.vue:242", newGoods.value.imgs);
      }
      function doGoods() {
        formatAppLog("log", "at pages/new_goods/new_goods.vue:246", newGoods.value);
        if (newGoods.value.imgs.length === 0) {
          newGoods.value.imgs.push(cfg.empty_image);
        }
        if (operation.value === "new") {
          formatAppLog("log", "at pages/new_goods/new_goods.vue:251", "new");
          uni.request({
            url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.goods.prefix + cfg.api.goods.add_goods,
            method: "POST",
            data: {
              new_goods: {
                owner: newGoods.value.owner,
                goods_name: newGoods.value.goods_name,
                desc: newGoods.value.desc,
                price: newGoods.value.price,
                status: newGoods.value.status,
                imgs: newGoods.value.imgs
              }
            },
            success(res) {
              formatAppLog("log", "at pages/new_goods/new_goods.vue:270", res);
              if (res.statusCode === 200) {
                uni.switchTab({
                  url: "/pages/index/index"
                });
                uni.showToast({
                  icon: "success",
                  title: "商品添加成功"
                });
              }
            }
          });
        } else if (operation.value === "modify") {
          formatAppLog("log", "at pages/new_goods/new_goods.vue:283", "modify");
          uni.request({
            url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.goods.prefix + cfg.api.goods.modify_goods,
            method: "POST",
            data: {
              modify_form: newGoods.value,
              userid: getApp().globalData.login.userid
            },
            success(res) {
              formatAppLog("log", "at pages/new_goods/new_goods.vue:296", res);
              uni.switchTab({
                url: "/pages/index/index"
              });
              if (res.statusCode === 200) {
                uni.showToast({
                  icon: "success",
                  title: "商品修改成功"
                });
              }
            }
          });
        }
      }
      return (_ctx, _cache) => {
        const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
        const _component_uni_file_picker = resolveEasycom(vue.resolveDynamicComponent("uni-file-picker"), __easycom_1$3);
        const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_3);
        return vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          null,
          [
            vue.createElementVNode("view", { class: "content" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => newGoods.value.goods_name = $event),
                  placeholder: "商品名"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, newGoods.value.goods_name]
              ]),
              vue.createElementVNode("view", { class: "price" }, [
                vue.createElementVNode("text", null, "价格"),
                vue.createElementVNode("view", { onClick: showPrice }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    "￥" + vue.toDisplayString(newGoods.value.price),
                    1
                    /* TEXT */
                  ),
                  vue.createVNode(_component_uni_icons, { type: "right" })
                ])
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => newGoods.value.status = $event),
                  placeholder: "商品状况"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, newGoods.value.status]
              ]),
              vue.withDirectives(vue.createElementVNode(
                "textarea",
                {
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => newGoods.value.desc = $event),
                  placeholder: "商品简介"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, newGoods.value.desc]
              ]),
              vue.createElementVNode("view", null, [
                vue.createElementVNode(
                  "button",
                  { onClick: doGoods },
                  vue.toDisplayString(operation.value === "new" ? "添加" : "修改"),
                  1
                  /* TEXT */
                )
              ]),
              vue.createVNode(_component_uni_file_picker, {
                modelValue: imgList.value,
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => imgList.value = $event),
                fileMediatype: "image",
                limit: "9",
                title: "商品图片",
                onSelect: uploadFile2,
                onDelete: removeFile
              }, null, 8, ["modelValue"])
            ]),
            vue.createVNode(
              _component_uni_popup,
              {
                ref_key: "pricePopup",
                ref: pricePopup,
                type: "bottom"
              },
              {
                default: vue.withCtx(() => [
                  vue.createElementVNode("view", { class: "price-input" }, [
                    vue.createElementVNode(
                      "view",
                      { class: "display" },
                      " 价格：￥" + vue.toDisplayString(price_str.value),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "keyboard" }, [
                      vue.createElementVNode("view", { class: "number" }, [
                        vue.createElementVNode("button", {
                          onClick: _cache[4] || (_cache[4] = ($event) => keyboard(`7`))
                        }, "7"),
                        vue.createElementVNode("button", {
                          onClick: _cache[5] || (_cache[5] = ($event) => keyboard(`8`))
                        }, "8"),
                        vue.createElementVNode("button", {
                          onClick: _cache[6] || (_cache[6] = ($event) => keyboard(`9`))
                        }, "9"),
                        vue.createElementVNode("button", {
                          onClick: _cache[7] || (_cache[7] = ($event) => keyboard(`4`))
                        }, "4"),
                        vue.createElementVNode("button", {
                          onClick: _cache[8] || (_cache[8] = ($event) => keyboard(`5`))
                        }, "5"),
                        vue.createElementVNode("button", {
                          onClick: _cache[9] || (_cache[9] = ($event) => keyboard(`6`))
                        }, "6"),
                        vue.createElementVNode("button", {
                          onClick: _cache[10] || (_cache[10] = ($event) => keyboard(`1`))
                        }, "1"),
                        vue.createElementVNode("button", {
                          onClick: _cache[11] || (_cache[11] = ($event) => keyboard(`2`))
                        }, "2"),
                        vue.createElementVNode("button", {
                          onClick: _cache[12] || (_cache[12] = ($event) => keyboard(`3`))
                        }, "3"),
                        vue.createElementVNode("button", {
                          onClick: _cache[13] || (_cache[13] = ($event) => keyboard(`<`))
                        }, [
                          vue.createVNode(_component_uni_icons, { type: "left" })
                        ]),
                        vue.createElementVNode("button", {
                          onClick: _cache[14] || (_cache[14] = ($event) => keyboard(`0`))
                        }, "0"),
                        vue.createElementVNode("button", {
                          onClick: _cache[15] || (_cache[15] = ($event) => keyboard(`.`))
                        }, ".")
                      ]),
                      vue.createElementVNode("view", { class: "action" }, [
                        vue.createElementVNode("button", {
                          onClick: _cache[16] || (_cache[16] = ($event) => keyboard(`clear`))
                        }, "清除"),
                        vue.createElementVNode("button", {
                          onClick: _cache[17] || (_cache[17] = ($event) => keyboard(`ok`))
                        }, "确定")
                      ])
                    ])
                  ])
                ]),
                _: 1
                /* STABLE */
              },
              512
              /* NEED_PATCH */
            )
          ],
          64
          /* STABLE_FRAGMENT */
        );
      };
    }
  });
  const PagesNew_goodsNew_goods = /* @__PURE__ */ _export_sfc(_sfc_main$p, [["__file", "F:/HBuilderProjects/FreeMarket/pages/new_goods/new_goods.vue"]]);
  const _sfc_main$o = /* @__PURE__ */ vue.defineComponent({
    __name: "chat",
    setup(__props) {
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view");
      };
    }
  });
  const PagesChatChat = /* @__PURE__ */ _export_sfc(_sfc_main$o, [["__file", "F:/HBuilderProjects/FreeMarket/pages/chat/chat.vue"]]);
  const _sfc_main$n = /* @__PURE__ */ vue.defineComponent({
    __name: "login",
    setup(__props) {
      getApp();
      const loginForm = vue.ref({
        username: "",
        password: ""
      });
      function login() {
        try {
          uni.request({
            url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.user.prefix + cfg.api.user.login,
            method: "POST",
            data: {
              login_form: loginForm.value
            },
            success(res) {
              formatAppLog("log", "at pages/login/login.vue:46", res);
              if (res.statusCode === 200) {
                uni.setStorage({
                  key: "user_login",
                  data: res.data
                });
                getApp().globalData.login = res.data;
                uni.$emit("user");
                uni.switchTab({
                  url: "/pages/my/my"
                });
                uni.showToast({
                  icon: "success",
                  title: "登录成功"
                });
              } else {
                uni.showToast({
                  icon: "error",
                  title: "登录失败"
                });
              }
            }
          });
        } catch (e) {
          formatAppLog("log", "at pages/login/login.vue:71", e);
        }
      }
      function gotoRegister() {
        uni.navigateTo({
          url: "/pages/register/register"
        });
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
          vue.createElementVNode("view", { class: "item" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => loginForm.value.username = $event),
                placeholder: "用户名"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, loginForm.value.username]
            ]),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => loginForm.value.password = $event),
                placeholder: "密码",
                password: "true"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, loginForm.value.password]
            ])
          ]),
          vue.createElementVNode("view", { class: "action" }, [
            vue.createElementVNode("button", { onClick: login }, "登录"),
            vue.createElementVNode("button", { onClick: gotoRegister }, "注册")
          ])
        ]);
      };
    }
  });
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$n, [["__scopeId", "data-v-e4e4508d"], ["__file", "F:/HBuilderProjects/FreeMarket/pages/login/login.vue"]]);
  const _sfc_main$m = /* @__PURE__ */ vue.defineComponent({
    __name: "register",
    setup(__props) {
      getApp();
      const registerForm = vue.ref({
        username: "",
        email: "",
        password: "",
        password_confirm: ""
      });
      function verifyEmail() {
        uni.request({
          url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.user.prefix + cfg.api.user.verify_email + registerForm.value.email,
          success(res) {
            formatAppLog("log", "at pages/register/register.vue:55", res);
          }
        });
      }
      function register() {
        try {
          uni.request({
            url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.user.prefix + cfg.api.user.register,
            method: "POST",
            data: {
              register_form: registerForm.value
            },
            success(res) {
              formatAppLog("log", "at pages/register/register.vue:74", "res", res);
              if (res.statusCode === 200) {
                uni.navigateTo({
                  url: "/pages/login/login"
                });
                uni.showToast({
                  title: "注册成功",
                  icon: "success"
                });
              } else {
                uni.showToast({
                  title: "注册失败",
                  icon: "error"
                });
              }
            },
            fail(err) {
              formatAppLog("log", "at pages/register/register.vue:91", "err", err);
              uni.showToast({
                title: "服务器出了问题",
                icon: "error"
              });
            }
          });
        } catch (e) {
          formatAppLog("log", "at pages/register/register.vue:99", e);
        }
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
          vue.createTextVNode(" register "),
          vue.createElementVNode("view", { class: "item" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => registerForm.value.username = $event),
                placeholder: "用户名"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, registerForm.value.username]
            ]),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => registerForm.value.email = $event),
                placeholder: "邮箱",
                onBlur: verifyEmail
              },
              null,
              544
              /* HYDRATE_EVENTS, NEED_PATCH */
            ), [
              [vue.vModelText, registerForm.value.email]
            ]),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => registerForm.value.password = $event),
                placeholder: "密码",
                password: "true"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, registerForm.value.password]
            ]),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => registerForm.value.password_confirm = $event),
                placeholder: "确认密码",
                password: "true"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, registerForm.value.password_confirm]
            ])
          ]),
          vue.createElementVNode("view", { class: "action" }, [
            vue.createElementVNode("button", { onClick: register }, "确认注册")
          ])
        ]);
      };
    }
  });
  const PagesRegisterRegister = /* @__PURE__ */ _export_sfc(_sfc_main$m, [["__scopeId", "data-v-bac4a35d"], ["__file", "F:/HBuilderProjects/FreeMarket/pages/register/register.vue"]]);
  const _sfc_main$l = {
    name: "UniSection",
    emits: ["click"],
    props: {
      type: {
        type: String,
        default: ""
      },
      title: {
        type: String,
        required: true,
        default: ""
      },
      titleFontSize: {
        type: String,
        default: "14px"
      },
      titleColor: {
        type: String,
        default: "#333"
      },
      subTitle: {
        type: String,
        default: ""
      },
      subTitleFontSize: {
        type: String,
        default: "12px"
      },
      subTitleColor: {
        type: String,
        default: "#999"
      },
      padding: {
        type: [Boolean, String],
        default: false
      }
    },
    computed: {
      _padding() {
        if (typeof this.padding === "string") {
          return this.padding;
        }
        return this.padding ? "10px" : "";
      }
    },
    watch: {
      title(newVal) {
        if (uni.report && newVal !== "") {
          uni.report("title", newVal);
        }
      }
    },
    methods: {
      onClick() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-section" }, [
      vue.createElementVNode("view", {
        class: "uni-section-header",
        onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
      }, [
        $props.type ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: vue.normalizeClass(["uni-section-header__decoration", $props.type])
          },
          null,
          2
          /* CLASS */
        )) : vue.renderSlot(_ctx.$slots, "decoration", { key: 1 }, void 0, true),
        vue.createElementVNode("view", { class: "uni-section-header__content" }, [
          vue.createElementVNode(
            "text",
            {
              style: vue.normalizeStyle({ "font-size": $props.titleFontSize, "color": $props.titleColor }),
              class: vue.normalizeClass(["uni-section__content-title", { "distraction": !$props.subTitle }])
            },
            vue.toDisplayString($props.title),
            7
            /* TEXT, CLASS, STYLE */
          ),
          $props.subTitle ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              style: vue.normalizeStyle({ "font-size": $props.subTitleFontSize, "color": $props.subTitleColor }),
              class: "uni-section-header__content-sub"
            },
            vue.toDisplayString($props.subTitle),
            5
            /* TEXT, STYLE */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("view", { class: "uni-section-header__slot-right" }, [
          vue.renderSlot(_ctx.$slots, "right", {}, void 0, true)
        ])
      ]),
      vue.createElementVNode(
        "view",
        {
          class: "uni-section-content",
          style: vue.normalizeStyle({ padding: $options._padding })
        },
        [
          vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
        ],
        4
        /* STYLE */
      )
    ]);
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$7], ["__scopeId", "data-v-637fd36b"], ["__file", "F:/HBuilderProjects/FreeMarket/uni_modules/uni-section/components/uni-section/uni-section.vue"]]);
  const _sfc_main$k = /* @__PURE__ */ vue.defineComponent({
    __name: "comment_input",
    emits: ["submit"],
    setup(__props, { emit }) {
      const content = vue.ref("");
      const _comment = vue.ref(null);
      function open() {
        _comment.value.open();
      }
      function submit() {
        _comment.value.close();
        emit("submit", content.value);
      }
      return (_ctx, _cache) => {
        const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_3);
        return vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          null,
          [
            vue.createElementVNode("view", { class: "content" }, [
              vue.createElementVNode("view", {
                class: "comment-box",
                onClick: open
              }, [
                vue.createCommentVNode(" flex-direction属性为row-reverse "),
                vue.createElementVNode("text", null, "评论")
              ])
            ]),
            vue.createVNode(
              _component_uni_popup,
              {
                "background-color": "#fff",
                ref_key: "_comment",
                ref: _comment,
                type: "bottom"
              },
              {
                default: vue.withCtx(() => [
                  vue.createElementVNode("form"),
                  vue.createElementVNode("view", { class: "input-container" }, [
                    vue.withDirectives(vue.createElementVNode(
                      "textarea",
                      {
                        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => content.value = $event),
                        placeholder: "有没有什么想吐槽的"
                      },
                      null,
                      512
                      /* NEED_PATCH */
                    ), [
                      [vue.vModelText, content.value]
                    ]),
                    vue.createElementVNode("button", { onClick: submit }, "发表")
                  ])
                ]),
                _: 1
                /* STABLE */
              },
              512
              /* NEED_PATCH */
            )
          ],
          64
          /* STABLE_FRAGMENT */
        );
      };
    }
  });
  const commentInput = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["__scopeId", "data-v-35eeb961"], ["__file", "F:/HBuilderProjects/FreeMarket/components/comment_input/comment_input.vue"]]);
  const _sfc_main$j = {
    name: "common_report",
    data() {
      return {};
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    return vue.openBlock(), vue.createElementBlock("view", {
      class: "report",
      onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit(`call`))
    }, [
      vue.createVNode(_component_uni_icons, {
        customPrefix: "iconfont",
        type: "icon-report"
      }),
      vue.createElementVNode("text", null, "举报")
    ]);
  }
  const commonReport = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$6], ["__file", "F:/HBuilderProjects/FreeMarket/components/common_report/common_report.vue"]]);
  const _sfc_main$i = {
    name: "comment_display",
    // emits: ['report'],
    components: {
      commonReport
    },
    data() {
      return {
        default_avatar: cfg.default_avatar
      };
    },
    props: {
      _data: Array
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_commonReport = vue.resolveComponent("commonReport");
    const _component_uni_card = resolveEasycom(vue.resolveDynamicComponent("uni-card"), __easycom_0$4);
    return vue.openBlock(), vue.createElementBlock("view", { style: { "margin-top": "3vh" } }, [
      $props._data.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, "还没有评论欸")) : vue.createCommentVNode("v-if", true),
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($props._data, (i2, index) => {
          return vue.openBlock(), vue.createElementBlock("view", {
            class: "card",
            key: index
          }, [
            vue.createVNode(_component_uni_card, {
              title: i2.comment_by.username || i2.comment_by,
              isFull: true,
              "sub-title": new Date(i2.post_date).toLocaleString(),
              thumbnail: i2.comment_by.headImg || $data.default_avatar
            }, {
              default: vue.withCtx(() => [
                vue.createElementVNode("view", { class: "uni-card__content" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(i2.content),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", {
                  slot: "actions",
                  class: "uni-card__actions"
                }, [
                  vue.createVNode(_component_commonReport, {
                    onCall: ($event) => _ctx.$emit("report", i2.comment_id)
                  }, null, 8, ["onCall"])
                ])
              ]),
              _: 2
              /* DYNAMIC */
            }, 1032, ["title", "sub-title", "thumbnail"])
          ]);
        }),
        128
        /* KEYED_FRAGMENT */
      ))
    ]);
  }
  const commentDisplay = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$5], ["__scopeId", "data-v-a34d7f72"], ["__file", "F:/HBuilderProjects/FreeMarket/components/comment_display/comment_display.vue"]]);
  const _sfc_main$h = {
    name: "contentLoading",
    data() {
      return {};
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", null, " LOADING ");
  }
  const contentLoading = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$4], ["__file", "F:/HBuilderProjects/FreeMarket/components/content_loading/content_loading.vue"]]);
  const _sfc_main$g = {
    name: "contentError",
    data() {
      return {};
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    return vue.openBlock(), vue.createElementBlock("view", { class: "filled" }, [
      vue.createVNode(_component_uni_icons, {
        type: "clear",
        size: "100"
      }),
      vue.createTextVNode(" 咦，好像粗了什么错欸。 ")
    ]);
  }
  const contentError = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$3], ["__scopeId", "data-v-cee91399"], ["__file", "F:/HBuilderProjects/FreeMarket/components/content_error/content_error.vue"]]);
  const _sfc_main$f = /* @__PURE__ */ vue.defineComponent({
    __name: "report_popup",
    setup(__props) {
      onLoad(() => {
        formatAppLog("log", "at components/report_popup/report_popup.vue:44", "onLoad");
      });
      onShow(() => {
        formatAppLog("log", "at components/report_popup/report_popup.vue:48", "onShow");
      });
      function onSubmit(e) {
        formatAppLog("log", "at components/report_popup/report_popup.vue:52", e.detail.value);
        uni.request({
          url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.user.prefix + cfg.api.user.create_report,
          method: "POST",
          data: {
            report_form: {
              ...e.detail.value
            }
          },
          success(res) {
            formatAppLog("log", "at components/report_popup/report_popup.vue:66", res);
          }
        });
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { style: { "width": "100vw", "height": "20rem", "background-color": "white" } }, [
          vue.createTextVNode(" 举报理由： "),
          vue.createElementVNode(
            "form",
            { onSubmit },
            [
              vue.createElementVNode("radio-group", {
                name: "reason",
                change: ""
              }, [
                vue.createElementVNode("label", null, [
                  vue.createElementVNode("radio", {
                    color: "#1296db",
                    value: "law violation"
                  }),
                  vue.createTextVNode(" 违反法律法规 ")
                ]),
                vue.createElementVNode("label", null, [
                  vue.createElementVNode("radio", {
                    color: "#1296db",
                    value: ""
                  }),
                  vue.createTextVNode(" 敏感内容 ")
                ]),
                vue.createElementVNode("label", null, [
                  vue.createElementVNode("radio", {
                    color: "#1296db",
                    value: "inappropriate"
                  }),
                  vue.createTextVNode(" 内容不适 ")
                ]),
                vue.createElementVNode("label", null, [
                  vue.createElementVNode("radio", {
                    color: "#1296db",
                    value: ""
                  }),
                  vue.createTextVNode(" 虚假信息 ")
                ]),
                vue.createElementVNode("label", null, [
                  vue.createElementVNode("radio", {
                    color: "#1296db",
                    value: "other"
                  }),
                  vue.createTextVNode(" 其他 "),
                  vue.createElementVNode("textarea", {
                    name: "other_reason",
                    maxlength: "-1"
                  })
                ])
              ]),
              vue.createElementVNode("button", { "form-type": "submit" }, "提交")
            ],
            32
            /* HYDRATE_EVENTS */
          )
        ]);
      };
    }
  });
  const reportPopup = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["__file", "F:/HBuilderProjects/FreeMarket/components/report_popup/report_popup.vue"]]);
  const _sfc_main$e = /* @__PURE__ */ vue.defineComponent({
    __name: "browse_goods",
    setup(__props) {
      const content = vue.ref({});
      vue.ref({
        to: "",
        reason: ""
      });
      const query = vue.ref({});
      const isLoading = vue.ref(true);
      const isError = vue.ref(false);
      const report = vue.ref(null);
      onLoad((option) => {
        uni.showNavigationBarLoading();
        query.value.id = option.id;
        query.value.userid = option.userid;
        request(query.value);
      });
      onError((err) => {
        formatAppLog("log", "at pages/browse_goods/browse_goods.vue:107", err);
      });
      function request(data) {
        uni.request({
          url: "http://localhost:4000/api/goods/goods_info",
          method: "POST",
          data: {
            goods_id: data.id,
            userid: data.userid
          },
          success(res) {
            formatAppLog("log", "at pages/browse_goods/browse_goods.vue:120", res);
            content.value = res.data;
            if (content.value.error)
              isError.value = true;
            formatAppLog("log", "at pages/browse_goods/browse_goods.vue:124", content.value);
          },
          fail() {
            isError.value = true;
            uni.setNavigationBarTitle({
              title: "出错了"
            });
          },
          complete() {
            isLoading.value = false;
            uni.hideNavigationBarLoading();
          }
        });
      }
      function getSubmit(c2) {
        formatAppLog("log", "at pages/browse_goods/browse_goods.vue:141", c2);
        uni.request({
          url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.user.prefix + cfg.api.user.create_comment,
          method: "POST",
          data: {
            comment_form: {
              content: c2,
              comment_to: content.value.goods_id,
              comment_by: getApp().globalData.login.userid
            }
          },
          success(res) {
            formatAppLog("log", "at pages/browse_goods/browse_goods.vue:157", res);
            if (res.statusCode === 200) {
              const t2 = res.data;
              t2.comment_by = getApp().globalData.login;
              content.value.comments.push(t2);
            }
          }
        });
      }
      function comment() {
        uni.createSelectorQuery().select("#comment").boundingClientRect((data) => {
          uni.createSelectorQuery().select(".main_content").boundingClientRect((res) => {
            uni.pageScrollTo({
              duration: 100,
              scrollTop: data.top - res.top
            });
          }).exec();
        }).exec();
      }
      function favorite() {
        uni.request({
          url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.user.prefix + cfg.api.user.favorite,
          method: "POST",
          data: {
            favorite_form: {
              userid: getApp().globalData.login.userid,
              refer_to: content.value.goods_id
            }
          },
          success(res) {
            formatAppLog("log", "at pages/browse_goods/browse_goods.vue:201", res);
            if (res.statusCode === 200) {
              uni.showToast({
                icon: "success",
                title: res.data.msg
              });
              content.value.isFavorite = !content.value.isFavorite;
            }
          }
        });
      }
      function want() {
      }
      function call_goods() {
        formatAppLog("log", "at pages/browse_goods/browse_goods.vue:222", "reach call");
        call_report(content.value.goods_id);
      }
      function call_report(id) {
        formatAppLog("log", "at pages/browse_goods/browse_goods.vue:227", id);
        uni.navigateTo({
          url: "/pages/report/report?refer_to=" + id + "&report_by=" + getApp().globalData.login.userid
        });
      }
      return (_ctx, _cache) => {
        const _component_uni_card = resolveEasycom(vue.resolveDynamicComponent("uni-card"), __easycom_0$4);
        const _component_uni_section = resolveEasycom(vue.resolveDynamicComponent("uni-section"), __easycom_0$1);
        const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
        const _component_uni_popup = resolveEasycom(vue.resolveDynamicComponent("uni-popup"), __easycom_3);
        return vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          null,
          [
            vue.createCommentVNode(" loading "),
            isLoading.value ? (vue.openBlock(), vue.createBlock(contentLoading, { key: 0 })) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" error "),
            isError.value ? (vue.openBlock(), vue.createBlock(contentError, { key: 1 })) : vue.createCommentVNode("v-if", true),
            !isError.value ? (vue.openBlock(), vue.createElementBlock("scroll-view", {
              key: 2,
              class: "content",
              style: { "height": "auto" }
            }, [
              vue.createElementVNode("view", { class: "main_content" }, [
                vue.createVNode(_component_uni_card, {
                  isFull: "true",
                  title: content.value.owner.username || content.value.owner,
                  subTitle: new Date(content.value.post_date).toLocaleString(),
                  thumbnail: content.value.owner.headImg || vue.unref(cfg).default_avatar
                }, {
                  default: vue.withCtx(() => [
                    vue.createElementVNode(
                      "text",
                      null,
                      "￥" + vue.toDisplayString(content.value.price) + " | " + vue.toDisplayString(content.value.status),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      null,
                      vue.toDisplayString(content.value.desc),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { id: "imgs" }, [
                      (vue.openBlock(true), vue.createElementBlock(
                        vue.Fragment,
                        null,
                        vue.renderList(content.value.imgs, (i2, index) => {
                          return vue.openBlock(), vue.createElementBlock("image", {
                            key: index,
                            src: vue.unref(cfg).server + `:` + vue.unref(cfg).port + `/` + i2.url
                          }, null, 8, ["src"]);
                        }),
                        128
                        /* KEYED_FRAGMENT */
                      ))
                    ]),
                    vue.createElementVNode("view", {
                      slot: "actions",
                      class: "uni-card__actions"
                    }, [
                      vue.createVNode(commonReport, { onCall: call_goods })
                    ])
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["title", "subTitle", "thumbnail"])
              ]),
              vue.createVNode(_component_uni_section, {
                id: "comment",
                titleFontSize: "20px",
                title: "评论",
                type: "line",
                class: "content comments"
              }, {
                default: vue.withCtx(() => [
                  vue.createVNode(commentInput, { onSubmit: getSubmit }),
                  vue.createVNode(commentDisplay, {
                    _data: content.value.comments,
                    onReport: call_report
                  }, null, 8, ["_data"])
                ]),
                _: 1
                /* STABLE */
              }),
              !content.value.error ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "bottom-tab"
              }, [
                vue.createVNode(_component_uni_icons, {
                  color: "#1296db",
                  size: "40",
                  type: "chat",
                  onClick: comment
                }),
                vue.createVNode(_component_uni_icons, {
                  color: "#1296db",
                  size: "40",
                  type: content.value.isFavorite ? "star-filled" : "star",
                  onClick: favorite
                }, null, 8, ["type"]),
                vue.createElementVNode("button", { onClick: want }, "我想要")
              ])) : vue.createCommentVNode("v-if", true),
              vue.createVNode(
                _component_uni_popup,
                {
                  type: "bottom",
                  ref_key: "report",
                  ref: report
                },
                {
                  default: vue.withCtx(() => [
                    vue.createVNode(reportPopup)
                  ]),
                  _: 1
                  /* STABLE */
                },
                512
                /* NEED_PATCH */
              )
            ])) : vue.createCommentVNode("v-if", true)
          ],
          64
          /* STABLE_FRAGMENT */
        );
      };
    }
  });
  const PagesBrowse_goodsBrowse_goods = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__scopeId", "data-v-fdc5c65b"], ["__file", "F:/HBuilderProjects/FreeMarket/pages/browse_goods/browse_goods.vue"]]);
  const _sfc_main$d = /* @__PURE__ */ vue.defineComponent({
    __name: "edit_info",
    setup(__props) {
      const date = vue.reactive({
        current: new Date()
      });
      vue.reactive({
        province: [],
        cities: []
      });
      const info = vue.ref({});
      onLoad(() => {
        info.value = getApp().globalData.login;
        formatAppLog("log", "at pages/edit_info/edit_info.vue:53", info.value);
      });
      function onSubmit(e) {
        formatAppLog("log", "at pages/edit_info/edit_info.vue:57", e.detail.value);
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "_form" }, [
          vue.createElementVNode(
            "form",
            { onSubmit },
            [
              vue.createElementVNode("label", null, [
                vue.createTextVNode(" 用户名 "),
                vue.createElementVNode("input", {
                  name: "username",
                  placeholder: "用户名"
                })
              ]),
              vue.createElementVNode("label", null, [
                vue.createTextVNode(" 简介 "),
                vue.createElementVNode("input", {
                  name: "desc",
                  placeholder: "简介"
                })
              ]),
              vue.createElementVNode("label", null, [
                vue.createTextVNode(" 性别 "),
                vue.createElementVNode("radio-group", { name: "gender" }, [
                  vue.createElementVNode("radio", { value: "male" }, "男"),
                  vue.createElementVNode("radio", { value: "female" }, "女"),
                  vue.createElementVNode("radio", { value: "others" }, "其他")
                ])
              ]),
              vue.createElementVNode("label", null, [
                vue.createTextVNode(" 生日 "),
                vue.createElementVNode("picker", {
                  name: "birthday",
                  mode: "date",
                  value: date.current
                }, vue.toDisplayString(date.current), 9, ["value"])
              ]),
              vue.createElementVNode("label", null, [
                vue.createTextVNode(" 城市 "),
                vue.createElementVNode("picker")
              ]),
              vue.createElementVNode("button", { "form-type": "submit" }, "确认修改")
            ],
            32
            /* HYDRATE_EVENTS */
          )
        ]);
      };
    }
  });
  const PagesEdit_infoEdit_info = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["__scopeId", "data-v-176afe41"], ["__file", "F:/HBuilderProjects/FreeMarket/pages/edit_info/edit_info.vue"]]);
  const _sfc_main$c = /* @__PURE__ */ vue.defineComponent({
    __name: "search",
    setup(__props) {
      const type = vue.ref("");
      const history = vue.ref(["item1", "item2", "item itemi", "item3"]);
      const searchText = vue.ref("");
      const isClear = vue.ref(false);
      const focusOn = vue.ref(false);
      const start_at = vue.ref(0);
      const result = vue.ref([]);
      onLoad((option) => {
        type.value = option.type;
        operateHistory("w");
      });
      function operateHistory(op) {
        formatAppLog("log", "at pages/search/search.vue:79", op);
        if (op === "r")
          ;
        else {
          if (op === "w") {
            formatAppLog("log", "at pages/search/search.vue:88", "w");
          } else if (op === "d") {
            formatAppLog("log", "at pages/search/search.vue:92", "d");
          } else if (op === "c") {
            formatAppLog("log", "at pages/search/search.vue:96", "c");
          }
        }
      }
      function onChange() {
        isClear.value = searchText.value.length > 0;
      }
      function doSearch(txt, isItem, isNew) {
        const key = isItem ? txt : searchText.value;
        if (isNew)
          start_at.value = 0;
        uni.request({
          url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.user.prefix + cfg.api.user.search,
          method: "POST",
          data: {
            search_form: {
              keyword: key,
              type: type.value,
              start_at: start_at.value,
              amount: 10
            }
          },
          success(res) {
            formatAppLog("log", "at pages/search/search.vue:135", res);
            if (res.statusCode === 200) {
              start_at.value = res.data.next_index;
              result.value = res.data.data;
              focusOn.value = true;
              formatAppLog("log", "at pages/search/search.vue:141", result.value);
            }
          }
        });
      }
      function clearText() {
        searchText.value = "";
        isClear.value = false;
      }
      function delHistory(i2) {
        formatAppLog("log", "at pages/search/search.vue:153", "del");
        history.value = history.value.filter((_i) => _i !== i2);
      }
      function clearHistory() {
        history.value = [];
      }
      return (_ctx, _cache) => {
        const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
        return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
          vue.createElementVNode("view", {
            class: "search-full-scale",
            onClick: _cache[2] || (_cache[2] = ($event) => focusOn.value = false)
          }, [
            vue.createElementVNode("view", {
              class: "search-btn",
              onClick: _cache[0] || (_cache[0] = ($event) => doSearch(``, false, true))
            }, "搜索"),
            vue.withDirectives(vue.createVNode(
              _component_uni_icons,
              {
                onClick: clearText,
                type: "clear",
                size: "4vh"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vShow, isClear.value]
            ]),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                onInput: onChange,
                "auto-focus": "true",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => searchText.value = $event),
                placeholder: "search"
              },
              null,
              544
              /* HYDRATE_EVENTS, NEED_PATCH */
            ), [
              [vue.vModelText, searchText.value]
            ]),
            vue.createVNode(_component_uni_icons, {
              type: "search",
              size: "4vh"
            })
          ]),
          !focusOn.value ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
            vue.createElementVNode("view", { class: "option" }, [
              vue.createElementVNode("view", null, "历史记录"),
              vue.createElementVNode("view", { onClick: clearHistory }, "清空")
            ]),
            vue.createElementVNode("view", { class: "history" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(history.value, (i2, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "history-item",
                    key: index
                  }, [
                    vue.createElementVNode("view", {
                      onClick: ($event) => doSearch(i2, true, true)
                    }, vue.toDisplayString(i2), 9, ["onClick"]),
                    vue.createVNode(_component_uni_icons, {
                      type: "close",
                      class: "item-close",
                      onClick: ($event) => delHistory(i2)
                    }, null, 8, ["onClick"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "result"
          }, [
            vue.createTextVNode(
              vue.toDisplayString(result.value) + " ",
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", null, "再怎么找也没有了")
          ]))
        ]);
      };
    }
  });
  const PagesSearchSearch = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__file", "F:/HBuilderProjects/FreeMarket/pages/search/search.vue"]]);
  const _sfc_main$b = /* @__PURE__ */ vue.defineComponent({
    __name: "browse_post",
    setup(__props) {
      getApp();
      const post = vue.ref({});
      onLoad((option) => {
        formatAppLog("log", "at pages/browse_post/browse_post.vue:43", option);
        uni.showNavigationBarLoading();
        request(option);
      });
      function getSubmit(c2) {
        formatAppLog("log", "at pages/browse_post/browse_post.vue:50", c2);
      }
      function request(data) {
        uni.request({
          url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.post.prefix + cfg.api.post.read_post,
          method: "POST",
          data: {
            post_id: data.id,
            userid: data.userid
          },
          // 只要能发起请求并得到服务器响应就算success
          success(res) {
            formatAppLog("log", "at pages/browse_post/browse_post.vue:67", res);
            if (res.statusCode === 200) {
              post.value = res.data.data;
              uni.setNavigationBarTitle({
                title: post.value.title
              });
            }
          },
          complete() {
            uni.hideNavigationBarLoading();
          }
        });
      }
      return (_ctx, _cache) => {
        const _component_uni_section = resolveEasycom(vue.resolveDynamicComponent("uni-section"), __easycom_0$1);
        return vue.openBlock(), vue.createElementBlock("view", { class: "content post" }, [
          vue.createElementVNode("view", { class: "imgs" }, [
            vue.createTextVNode(
              vue.toDisplayString(post.value.imgs) + " ",
              1
              /* TEXT */
            ),
            vue.createElementVNode("swiper", { circular: "" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(post.value.imgs, (i2, index) => {
                  return vue.openBlock(), vue.createElementBlock(
                    "swiper-item",
                    null,
                    vue.toDisplayString(i2),
                    1
                    /* TEXT */
                  );
                }),
                256
                /* UNKEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createElementVNode(
            "view",
            { class: "text" },
            vue.toDisplayString(post.value.content),
            1
            /* TEXT */
          ),
          vue.createVNode(_component_uni_section, {
            id: "comment",
            titleFontSize: "20px",
            title: "评论",
            type: "line",
            class: "content comments"
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(commentInput, { onSubmit: getSubmit }),
              vue.createVNode(commentDisplay, {
                _data: post.value.comments
              }, null, 8, ["_data"])
            ]),
            _: 1
            /* STABLE */
          })
        ]);
      };
    }
  });
  const PagesBrowse_postBrowse_post = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__file", "F:/HBuilderProjects/FreeMarket/pages/browse_post/browse_post.vue"]]);
  const _sfc_main$a = /* @__PURE__ */ vue.defineComponent({
    __name: "history-goods",
    props: {
      data: { type: null, required: true }
    },
    setup(__props) {
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { class: "frame" }, [
          __props.data.imgs.length !== 0 ? (vue.openBlock(), vue.createElementBlock("image", {
            key: 0,
            src: `${vue.unref(cfg).server}:${vue.unref(cfg).port}/${__props.data.imgs[0].url}`
          }, null, 8, ["src"])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "info" }, [
            vue.createCommentVNode(" {{ data }} "),
            vue.createElementVNode(
              "p",
              null,
              vue.toDisplayString(__props.data.goods_name),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "p",
              null,
              vue.toDisplayString(__props.data.desc),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "p",
              null,
              " ￥" + vue.toDisplayString(__props.data.price),
              1
              /* TEXT */
            )
          ])
        ]);
      };
    }
  });
  const historyGoods = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-9788bc81"], ["__file", "F:/HBuilderProjects/FreeMarket/components/history-unit/sub/history-goods.vue"]]);
  const _sfc_main$9 = /* @__PURE__ */ vue.defineComponent({
    __name: "history-post",
    props: {
      data: { type: null, required: true }
    },
    setup(__props) {
      return (_ctx, _cache) => {
        return null;
      };
    }
  });
  const historyPost = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__file", "F:/HBuilderProjects/FreeMarket/components/history-unit/sub/history-post.vue"]]);
  const _sfc_main$8 = /* @__PURE__ */ vue.defineComponent({
    __name: "history-unit",
    props: {
      data: { type: null, required: true },
      type: { type: String, required: true }
    },
    setup(__props) {
      const props = __props;
      function goto() {
        formatAppLog("log", "at components/history-unit/history-unit.vue:24", "type:", props.type);
        if (props.type === "goods")
          formatAppLog("log", "at components/history-unit/history-unit.vue:26", "g");
        else if (props.type === "post")
          formatAppLog("log", "at components/history-unit/history-unit.vue:27", "p");
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", { onClick: goto }, [
          vue.createCommentVNode(" 访问日期 "),
          vue.createTextVNode(
            " " + vue.toDisplayString(__props.data.post_date) + " ",
            1
            /* TEXT */
          ),
          vue.createCommentVNode(" 数据 "),
          __props.type === "goods" ? (vue.openBlock(), vue.createBlock(historyGoods, {
            key: 0,
            data: __props.data.detail
          }, null, 8, ["data"])) : __props.type === "post" ? (vue.openBlock(), vue.createBlock(historyPost, {
            key: 1,
            data: __props.data.detail
          }, null, 8, ["data"])) : vue.createCommentVNode("v-if", true)
        ]);
      };
    }
  });
  const __easycom_1$2 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__file", "F:/HBuilderProjects/FreeMarket/components/history-unit/history-unit.vue"]]);
  const _sfc_main$7 = /* @__PURE__ */ vue.defineComponent({
    __name: "history",
    setup(__props) {
      const data = vue.ref([]);
      const start_at = vue.ref(0);
      const type = vue.ref("goods");
      const current = vue.ref(0);
      const segItems = vue.ref(["商 品", "帖 子"]);
      const enableBottomRequest = vue.ref(true);
      onLoad(() => {
        request(true);
      });
      onPullDownRefresh(() => {
        request(true);
      });
      onReachBottom(() => {
        enableBottomRequest.value && request(false);
      });
      function switchSegments(e) {
        current.value = e.currentIndex;
        if (current.value === 0)
          type.value = "goods";
        else if (current.value === 1)
          type.value = "post";
        formatAppLog("log", "at pages/history/history.vue:54", type.value);
        request(true);
      }
      function request(start_type) {
        const count = 5;
        if (start_type)
          start_at.value = 0;
        uni.request({
          url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.user.prefix + cfg.api.user.get_history,
          method: "POST",
          data: {
            filter: {
              userid: getApp().globalData.login.userid,
              type: type.value,
              query: { userid: getApp().globalData.login.userid },
              start_at: start_at.value,
              count
            }
          },
          success(res) {
            formatAppLog("log", "at pages/history/history.vue:80", res);
            if (res.statusCode === 200) {
              enableBottomRequest.value = res.data.data.length === count;
              if (start_type)
                data.value = res.data.data;
              else {
                data.value = data.value.concat(res.data.data);
                start_at.value = res.data.next_index;
              }
            }
          },
          complete() {
            uni.stopPullDownRefresh();
          }
        });
      }
      return (_ctx, _cache) => {
        const _component_uni_segmented_control = resolveEasycom(vue.resolveDynamicComponent("uni-segmented-control"), __easycom_0$2);
        const _component_history_unit = resolveEasycom(vue.resolveDynamicComponent("history-unit"), __easycom_1$2);
        return vue.openBlock(), vue.createElementBlock("view", null, [
          vue.createVNode(_component_uni_segmented_control, {
            class: "segs",
            current: current.value,
            styleType: "text",
            values: segItems.value,
            onClickItem: switchSegments
          }, null, 8, ["current", "values"]),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList(data.value, (i2, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "items",
                key: index
              }, [
                vue.createVNode(_component_history_unit, {
                  type: type.value,
                  data: i2
                }, null, 8, ["type", "data"])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.withDirectives(vue.createElementVNode(
            "view",
            null,
            "再怎么找也没有了",
            512
            /* NEED_PATCH */
          ), [
            [vue.vShow, !enableBottomRequest.value]
          ])
        ]);
      };
    }
  });
  const PagesHistoryHistory = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__file", "F:/HBuilderProjects/FreeMarket/pages/history/history.vue"]]);
  const _sfc_main$6 = {
    name: "UniBadge",
    emits: ["click"],
    props: {
      type: {
        type: String,
        default: "error"
      },
      inverted: {
        type: Boolean,
        default: false
      },
      isDot: {
        type: Boolean,
        default: false
      },
      maxNum: {
        type: Number,
        default: 99
      },
      absolute: {
        type: String,
        default: ""
      },
      offset: {
        type: Array,
        default() {
          return [0, 0];
        }
      },
      text: {
        type: [String, Number],
        default: ""
      },
      size: {
        type: String,
        default: "small"
      },
      customStyle: {
        type: Object,
        default() {
          return {};
        }
      }
    },
    data() {
      return {};
    },
    computed: {
      width() {
        return String(this.text).length * 8 + 12;
      },
      classNames() {
        const {
          inverted,
          type,
          size,
          absolute
        } = this;
        return [
          inverted ? "uni-badge--" + type + "-inverted" : "",
          "uni-badge--" + type,
          "uni-badge--" + size,
          absolute ? "uni-badge--absolute" : ""
        ].join(" ");
      },
      positionStyle() {
        if (!this.absolute)
          return {};
        let w2 = this.width / 2, h2 = 10;
        if (this.isDot) {
          w2 = 5;
          h2 = 5;
        }
        const x2 = `${-w2 + this.offset[0]}px`;
        const y2 = `${-h2 + this.offset[1]}px`;
        const whiteList = {
          rightTop: {
            right: x2,
            top: y2
          },
          rightBottom: {
            right: x2,
            bottom: y2
          },
          leftBottom: {
            left: x2,
            bottom: y2
          },
          leftTop: {
            left: x2,
            top: y2
          }
        };
        const match = whiteList[this.absolute];
        return match ? match : whiteList["rightTop"];
      },
      dotStyle() {
        if (!this.isDot)
          return {};
        return {
          width: "10px",
          minWidth: "0",
          height: "10px",
          padding: "0",
          borderRadius: "10px"
        };
      },
      displayValue() {
        const {
          isDot,
          text,
          maxNum
        } = this;
        return isDot ? "" : Number(text) > maxNum ? `${maxNum}+` : text;
      }
    },
    methods: {
      onClick() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-badge--x" }, [
      vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
      $props.text ? (vue.openBlock(), vue.createElementBlock(
        "text",
        {
          key: 0,
          class: vue.normalizeClass([$options.classNames, "uni-badge"]),
          style: vue.normalizeStyle([$options.positionStyle, $props.customStyle, $options.dotStyle]),
          onClick: _cache[0] || (_cache[0] = ($event) => $options.onClick())
        },
        vue.toDisplayString($options.displayValue),
        7
        /* TEXT, CLASS, STYLE */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$2], ["__scopeId", "data-v-c97cb896"], ["__file", "F:/HBuilderProjects/FreeMarket/uni_modules/uni-badge/components/uni-badge/uni-badge.vue"]]);
  const _sfc_main$5 = {
    name: "UniListItem",
    emits: ["click", "switchChange"],
    props: {
      direction: {
        type: String,
        default: "row"
      },
      title: {
        type: String,
        default: ""
      },
      note: {
        type: String,
        default: ""
      },
      ellipsis: {
        type: [Number, String],
        default: 0
      },
      disabled: {
        type: [Boolean, String],
        default: false
      },
      clickable: {
        type: Boolean,
        default: false
      },
      showArrow: {
        type: [Boolean, String],
        default: false
      },
      link: {
        type: [Boolean, String],
        default: false
      },
      to: {
        type: String,
        default: ""
      },
      showBadge: {
        type: [Boolean, String],
        default: false
      },
      showSwitch: {
        type: [Boolean, String],
        default: false
      },
      switchChecked: {
        type: [Boolean, String],
        default: false
      },
      badgeText: {
        type: String,
        default: ""
      },
      badgeType: {
        type: String,
        default: "success"
      },
      badgeStyle: {
        type: Object,
        default() {
          return {};
        }
      },
      rightText: {
        type: String,
        default: ""
      },
      thumb: {
        type: String,
        default: ""
      },
      thumbSize: {
        type: String,
        default: "base"
      },
      showExtraIcon: {
        type: [Boolean, String],
        default: false
      },
      extraIcon: {
        type: Object,
        default() {
          return {
            type: "",
            color: "#000000",
            size: 20
          };
        }
      },
      border: {
        type: Boolean,
        default: true
      },
      customStyle: {
        type: Object,
        default() {
          return {
            padding: "",
            backgroundColor: "#FFFFFF"
          };
        }
      },
      keepScrollPosition: {
        type: Boolean,
        default: false
      }
    },
    watch: {
      "customStyle.padding": {
        handler(padding) {
          if (typeof padding == "number") {
            padding += "";
          }
          let paddingArr = padding.split(" ");
          if (paddingArr.length === 1) {
            this.padding = {
              "top": padding,
              "right": padding,
              "bottom": padding,
              "left": padding
            };
          } else if (paddingArr.length === 2) {
            this.padding = {
              "top": padding[0],
              "right": padding[1],
              "bottom": padding[0],
              "left": padding[1]
            };
          } else if (paddingArr.length === 4) {
            this.padding = {
              "top": padding[0],
              "right": padding[1],
              "bottom": padding[2],
              "left": padding[3]
            };
          }
        },
        immediate: true
      }
    },
    // inject: ['list'],
    data() {
      return {
        isFirstChild: false,
        padding: {
          top: "",
          right: "",
          bottom: "",
          left: ""
        }
      };
    },
    mounted() {
      this.list = this.getForm();
      if (this.list) {
        if (!this.list.firstChildAppend) {
          this.list.firstChildAppend = true;
          this.isFirstChild = true;
        }
      }
    },
    methods: {
      /**
       * 获取父元素实例
       */
      getForm(name = "uniList") {
        let parent = this.$parent;
        let parentName = parent.$options.name;
        while (parentName !== name) {
          parent = parent.$parent;
          if (!parent)
            return false;
          parentName = parent.$options.name;
        }
        return parent;
      },
      onClick() {
        if (this.to !== "") {
          this.openPage();
          return;
        }
        if (this.clickable || this.link) {
          this.$emit("click", {
            data: {}
          });
        }
      },
      onSwitchChange(e) {
        this.$emit("switchChange", e.detail);
      },
      openPage() {
        if (["navigateTo", "redirectTo", "reLaunch", "switchTab"].indexOf(this.link) !== -1) {
          this.pageApi(this.link);
        } else {
          this.pageApi("navigateTo");
        }
      },
      pageApi(api2) {
        let callback = {
          url: this.to,
          success: (res) => {
            this.$emit("click", {
              data: res
            });
          },
          fail: (err) => {
            this.$emit("click", {
              data: err
            });
          }
        };
        switch (api2) {
          case "navigateTo":
            uni.navigateTo(callback);
            break;
          case "redirectTo":
            uni.redirectTo(callback);
            break;
          case "reLaunch":
            uni.reLaunch(callback);
            break;
          case "switchTab":
            uni.switchTab(callback);
            break;
          default:
            uni.navigateTo(callback);
        }
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$6);
    const _component_uni_badge = resolveEasycom(vue.resolveDynamicComponent("uni-badge"), __easycom_1$1);
    return vue.openBlock(), vue.createElementBlock("view", {
      class: vue.normalizeClass([{ "uni-list-item--disabled": $props.disabled }, "uni-list-item"]),
      style: vue.normalizeStyle({ "background-color": $props.customStyle.backgroundColor }),
      "hover-class": !$props.clickable && !$props.link || $props.disabled || $props.showSwitch ? "" : "uni-list-item--hover",
      onClick: _cache[1] || (_cache[1] = (...args) => $options.onClick && $options.onClick(...args))
    }, [
      !$data.isFirstChild ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          class: vue.normalizeClass(["border--left", { "uni-list--border": $props.border }])
        },
        null,
        2
        /* CLASS */
      )) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["uni-list-item__container", { "container--right": $props.showArrow || $props.link, "flex--direction": $props.direction === "column" }]),
          style: vue.normalizeStyle({ paddingTop: $data.padding.top, paddingLeft: $data.padding.left, paddingRight: $data.padding.right, paddingBottom: $data.padding.bottom })
        },
        [
          vue.renderSlot(_ctx.$slots, "header", {}, () => [
            vue.createElementVNode("view", { class: "uni-list-item__header" }, [
              $props.thumb ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "uni-list-item__icon"
              }, [
                vue.createElementVNode("image", {
                  src: $props.thumb,
                  class: vue.normalizeClass(["uni-list-item__icon-img", ["uni-list--" + $props.thumbSize]])
                }, null, 10, ["src"])
              ])) : $props.showExtraIcon ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "uni-list-item__icon"
              }, [
                vue.createVNode(_component_uni_icons, {
                  color: $props.extraIcon.color,
                  size: $props.extraIcon.size,
                  type: $props.extraIcon.type
                }, null, 8, ["color", "size", "type"])
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ], true),
          vue.renderSlot(_ctx.$slots, "body", {}, () => [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["uni-list-item__content", { "uni-list-item__content--center": $props.thumb || $props.showExtraIcon || $props.showBadge || $props.showSwitch }])
              },
              [
                $props.title ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: vue.normalizeClass(["uni-list-item__content-title", [$props.ellipsis !== 0 && $props.ellipsis <= 2 ? "uni-ellipsis-" + $props.ellipsis : ""]])
                  },
                  vue.toDisplayString($props.title),
                  3
                  /* TEXT, CLASS */
                )) : vue.createCommentVNode("v-if", true),
                $props.note ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 1,
                    class: "uni-list-item__content-note"
                  },
                  vue.toDisplayString($props.note),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ],
              2
              /* CLASS */
            )
          ], true),
          vue.renderSlot(_ctx.$slots, "footer", {}, () => [
            $props.rightText || $props.showBadge || $props.showSwitch ? (vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: 0,
                class: vue.normalizeClass(["uni-list-item__extra", { "flex--justify": $props.direction === "column" }])
              },
              [
                $props.rightText ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: 0,
                    class: "uni-list-item__extra-text"
                  },
                  vue.toDisplayString($props.rightText),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true),
                $props.showBadge ? (vue.openBlock(), vue.createBlock(_component_uni_badge, {
                  key: 1,
                  type: $props.badgeType,
                  text: $props.badgeText,
                  "custom-style": $props.badgeStyle
                }, null, 8, ["type", "text", "custom-style"])) : vue.createCommentVNode("v-if", true),
                $props.showSwitch ? (vue.openBlock(), vue.createElementBlock("switch", {
                  key: 2,
                  disabled: $props.disabled,
                  checked: $props.switchChecked,
                  onChange: _cache[0] || (_cache[0] = (...args) => $options.onSwitchChange && $options.onSwitchChange(...args))
                }, null, 40, ["disabled", "checked"])) : vue.createCommentVNode("v-if", true)
              ],
              2
              /* CLASS */
            )) : vue.createCommentVNode("v-if", true)
          ], true)
        ],
        6
        /* CLASS, STYLE */
      ),
      $props.showArrow || $props.link ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
        key: 1,
        size: 16,
        class: "uni-icon-wrapper",
        color: "#bbb",
        type: "arrowright"
      })) : vue.createCommentVNode("v-if", true)
    ], 14, ["hover-class"]);
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$1], ["__scopeId", "data-v-c7524739"], ["__file", "F:/HBuilderProjects/FreeMarket/uni_modules/uni-list/components/uni-list-item/uni-list-item.vue"]]);
  const _sfc_main$4 = {
    name: "uniList",
    "mp-weixin": {
      options: {
        multipleSlots: false
      }
    },
    props: {
      stackFromEnd: {
        type: Boolean,
        default: false
      },
      enableBackToTop: {
        type: [Boolean, String],
        default: false
      },
      scrollY: {
        type: [Boolean, String],
        default: false
      },
      border: {
        type: Boolean,
        default: true
      },
      renderReverse: {
        type: Boolean,
        default: false
      }
    },
    // provide() {
    // 	return {
    // 		list: this
    // 	};
    // },
    created() {
      this.firstChildAppend = false;
    },
    methods: {
      loadMore(e) {
        this.$emit("scrolltolower");
      },
      scroll(e) {
        this.$emit("scroll", e);
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-list uni-border-top-bottom" }, [
      $props.border ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "uni-list--border-top"
      })) : vue.createCommentVNode("v-if", true),
      vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
      $props.border ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "uni-list--border-bottom"
      })) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render], ["__scopeId", "data-v-c2f1266a"], ["__file", "F:/HBuilderProjects/FreeMarket/uni_modules/uni-list/components/uni-list/uni-list.vue"]]);
  const _sfc_main$3 = /* @__PURE__ */ vue.defineComponent({
    __name: "settings",
    setup(__props) {
      function goto(url) {
        uni.navigateTo({
          url
        });
      }
      return (_ctx, _cache) => {
        const _component_uni_list_item = resolveEasycom(vue.resolveDynamicComponent("uni-list-item"), __easycom_0);
        const _component_uni_list = resolveEasycom(vue.resolveDynamicComponent("uni-list"), __easycom_1);
        return vue.openBlock(), vue.createElementBlock("view", null, [
          vue.createVNode(_component_uni_list, { border: "true" }, {
            default: vue.withCtx(() => [
              vue.createVNode(_component_uni_list_item, {
                title: "更改账户信息",
                clickable: "true",
                onClick: _cache[0] || (_cache[0] = ($event) => goto("/pages/edit_info/edit_info"))
              }),
              vue.createVNode(_component_uni_list_item, {
                title: "账户安全",
                clickable: "true"
              }),
              vue.createVNode(_component_uni_list_item, {
                title: "用户协议",
                clickable: "true"
              }),
              vue.createVNode(_component_uni_list_item, {
                title: "关于本应用",
                clickable: "true"
              })
            ]),
            _: 1
            /* STABLE */
          }),
          vue.createElementVNode("button", { class: "logout" }, "退出登录")
        ]);
      };
    }
  });
  const PagesSettingsSettings = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__file", "F:/HBuilderProjects/FreeMarket/pages/settings/settings.vue"]]);
  const _sfc_main$2 = /* @__PURE__ */ vue.defineComponent({
    __name: "mygoods",
    setup(__props) {
      const data = vue.ref([]);
      const end_index = vue.ref(0);
      onLoad(() => {
        request(false);
      });
      onPullDownRefresh(() => {
        request(true);
      });
      function request(type) {
        if (type)
          end_index.value = 0;
        const amount = 4;
        uni.request({
          url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.goods.prefix + cfg.api.goods.goods_display,
          method: "POST",
          data: {
            filter: {
              start_at: end_index.value,
              amount,
              owner: getApp().globalData.login.userid
            }
          },
          success(res) {
            formatAppLog("log", "at pages/mygoods/mygoods.vue:46", res);
            if (res.statusCode === 200) {
              data.value = res.data.data;
            }
          }
        });
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", null, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList(data.value, (i2, index) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: index,
                  class: "items"
                },
                vue.toDisplayString(i2),
                1
                /* TEXT */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]);
      };
    }
  });
  const PagesMygoodsMygoods = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__file", "F:/HBuilderProjects/FreeMarket/pages/mygoods/mygoods.vue"]]);
  const _sfc_main$1 = /* @__PURE__ */ vue.defineComponent({
    __name: "report",
    setup(__props) {
      const to = vue.ref("");
      onLoad((option) => {
        formatAppLog("log", "at pages/report/report.vue:42", "onLoad");
        formatAppLog("log", "at pages/report/report.vue:43", "option:", option);
        to.value = option.refer_to;
        formatAppLog("log", "at pages/report/report.vue:45", to.value);
      });
      function onSubmit(e) {
        formatAppLog("log", "at pages/report/report.vue:49", e.detail.value);
        uni.request({
          url: cfg.server + ":" + cfg.port + cfg.api.prefix + cfg.api.user.prefix + cfg.api.user.create_report,
          method: "POST",
          data: {
            report_form: {
              ...e.detail.value,
              report_by: getApp().globalData.login.userid,
              refer_to: to.value
            }
          },
          success(res) {
            formatAppLog("log", "at pages/report/report.vue:74", res);
            uni.navigateBack();
          }
        });
      }
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("view", null, [
          vue.createTextVNode(" 举报理由： "),
          vue.createElementVNode(
            "form",
            { onSubmit },
            [
              vue.createElementVNode("radio-group", {
                name: "reason",
                change: ""
              }, [
                vue.createElementVNode("label", null, [
                  vue.createElementVNode("radio", {
                    color: "#1296db",
                    value: "law violation"
                  }),
                  vue.createTextVNode(" 违反法律法规 ")
                ]),
                vue.createElementVNode("label", null, [
                  vue.createElementVNode("radio", {
                    color: "#1296db",
                    value: ""
                  }),
                  vue.createTextVNode(" 敏感内容 ")
                ]),
                vue.createElementVNode("label", null, [
                  vue.createElementVNode("radio", {
                    color: "#1296db",
                    value: "inappropriate content"
                  }),
                  vue.createTextVNode(" 内容不适 ")
                ]),
                vue.createElementVNode("label", null, [
                  vue.createElementVNode("radio", {
                    color: "#1296db",
                    value: "fake content"
                  }),
                  vue.createTextVNode(" 虚假信息 ")
                ]),
                vue.createElementVNode("label", null, [
                  vue.createElementVNode("radio", {
                    color: "#1296db",
                    value: "other"
                  }),
                  vue.createTextVNode(" 其他 "),
                  vue.createElementVNode("textarea", {
                    name: "other_reason",
                    maxlength: "-1"
                  })
                ])
              ]),
              vue.createElementVNode("button", { "form-type": "submit" }, "提交")
            ],
            32
            /* HYDRATE_EVENTS */
          )
        ]);
      };
    }
  });
  const PagesReportReport = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__file", "F:/HBuilderProjects/FreeMarket/pages/report/report.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/discover/discover", PagesDiscoverDiscover);
  __definePage("pages/message/message", PagesMessageMessage);
  __definePage("pages/my/my", PagesMyMy);
  __definePage("pages/favorite/favorite", PagesFavoriteFavorite);
  __definePage("pages/exchange/exchange", PagesExchangeExchange);
  __definePage("pages/new_post/new_post", PagesNew_postNew_post);
  __definePage("pages/new_goods/new_goods", PagesNew_goodsNew_goods);
  __definePage("pages/chat/chat", PagesChatChat);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/register/register", PagesRegisterRegister);
  __definePage("pages/browse_goods/browse_goods", PagesBrowse_goodsBrowse_goods);
  __definePage("pages/edit_info/edit_info", PagesEdit_infoEdit_info);
  __definePage("pages/search/search", PagesSearchSearch);
  __definePage("pages/browse_post/browse_post", PagesBrowse_postBrowse_post);
  __definePage("pages/history/history", PagesHistoryHistory);
  __definePage("pages/settings/settings", PagesSettingsSettings);
  __definePage("pages/mygoods/mygoods", PagesMygoodsMygoods);
  __definePage("pages/report/report", PagesReportReport);
  const _sfc_main = {
    onLaunch() {
      try {
        uni.getStorage({
          key: "user_login",
          success(res) {
            formatAppLog("log", "at App.vue:10", res);
            getApp().globalData.login = res.data;
          }
        });
      } catch (e) {
      }
    },
    onShow() {
    },
    onHide() {
    },
    globalData: {
      text: "abc",
      login: {}
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "F:/HBuilderProjects/FreeMarket/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue, uni.VueShared);
