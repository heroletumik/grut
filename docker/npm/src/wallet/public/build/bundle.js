"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);throw new Error("Cannot find module '" + o + "'");
            }var f = n[o] = { exports: {} };t[o][0].call(f.exports, function (e) {
                var n = t[o][1][e];return s(n ? n : e);
            }, f, f.exports, e, t, n, r);
        }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
        s(r[o]);
    }return s;
})({ 1: [function (require, module, exports) {}, {}], 2: [function (require, module, exports) {
        (function (process) {
            // .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
            // backported and transplited with Babel, with backwards-compat fixes

            // Copyright Joyent, Inc. and other Node contributors.
            //
            // Permission is hereby granted, free of charge, to any person obtaining a
            // copy of this software and associated documentation files (the
            // "Software"), to deal in the Software without restriction, including
            // without limitation the rights to use, copy, modify, merge, publish,
            // distribute, sublicense, and/or sell copies of the Software, and to permit
            // persons to whom the Software is furnished to do so, subject to the
            // following conditions:
            //
            // The above copyright notice and this permission notice shall be included
            // in all copies or substantial portions of the Software.
            //
            // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
            // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
            // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
            // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
            // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
            // USE OR OTHER DEALINGS IN THE SOFTWARE.

            // resolves . and .. elements in a path array with directory names there
            // must be no slashes, empty elements, or device names (c:\) in the array
            // (so also no leading and trailing slashes - it does not distinguish
            // relative and absolute paths)
            function normalizeArray(parts, allowAboveRoot) {
                // if the path tries to go above the root, `up` ends up > 0
                var up = 0;
                for (var i = parts.length - 1; i >= 0; i--) {
                    var last = parts[i];
                    if (last === '.') {
                        parts.splice(i, 1);
                    } else if (last === '..') {
                        parts.splice(i, 1);
                        up++;
                    } else if (up) {
                        parts.splice(i, 1);
                        up--;
                    }
                }

                // if the path is allowed to go above the root, restore leading ..s
                if (allowAboveRoot) {
                    for (; up--; up) {
                        parts.unshift('..');
                    }
                }

                return parts;
            }

            // path.resolve([from ...], to)
            // posix version
            exports.resolve = function () {
                var resolvedPath = '',
                    resolvedAbsolute = false;

                for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
                    var path = i >= 0 ? arguments[i] : process.cwd();

                    // Skip empty and invalid entries
                    if (typeof path !== 'string') {
                        throw new TypeError('Arguments to path.resolve must be strings');
                    } else if (!path) {
                        continue;
                    }

                    resolvedPath = path + '/' + resolvedPath;
                    resolvedAbsolute = path.charAt(0) === '/';
                }

                // At this point the path should be resolved to a full absolute path, but
                // handle relative paths to be safe (might happen when process.cwd() fails)

                // Normalize the path
                resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function (p) {
                    return !!p;
                }), !resolvedAbsolute).join('/');

                return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
            };

            // path.normalize(path)
            // posix version
            exports.normalize = function (path) {
                var isAbsolute = exports.isAbsolute(path),
                    trailingSlash = substr(path, -1) === '/';

                // Normalize the path
                path = normalizeArray(filter(path.split('/'), function (p) {
                    return !!p;
                }), !isAbsolute).join('/');

                if (!path && !isAbsolute) {
                    path = '.';
                }
                if (path && trailingSlash) {
                    path += '/';
                }

                return (isAbsolute ? '/' : '') + path;
            };

            // posix version
            exports.isAbsolute = function (path) {
                return path.charAt(0) === '/';
            };

            // posix version
            exports.join = function () {
                var paths = Array.prototype.slice.call(arguments, 0);
                return exports.normalize(filter(paths, function (p, index) {
                    if (typeof p !== 'string') {
                        throw new TypeError('Arguments to path.join must be strings');
                    }
                    return p;
                }).join('/'));
            };

            // path.relative(from, to)
            // posix version
            exports.relative = function (from, to) {
                from = exports.resolve(from).substr(1);
                to = exports.resolve(to).substr(1);

                function trim(arr) {
                    var start = 0;
                    for (; start < arr.length; start++) {
                        if (arr[start] !== '') break;
                    }

                    var end = arr.length - 1;
                    for (; end >= 0; end--) {
                        if (arr[end] !== '') break;
                    }

                    if (start > end) return [];
                    return arr.slice(start, end - start + 1);
                }

                var fromParts = trim(from.split('/'));
                var toParts = trim(to.split('/'));

                var length = Math.min(fromParts.length, toParts.length);
                var samePartsLength = length;
                for (var i = 0; i < length; i++) {
                    if (fromParts[i] !== toParts[i]) {
                        samePartsLength = i;
                        break;
                    }
                }

                var outputParts = [];
                for (var i = samePartsLength; i < fromParts.length; i++) {
                    outputParts.push('..');
                }

                outputParts = outputParts.concat(toParts.slice(samePartsLength));

                return outputParts.join('/');
            };

            exports.sep = '/';
            exports.delimiter = ':';

            exports.dirname = function (path) {
                if (typeof path !== 'string') path = path + '';
                if (path.length === 0) return '.';
                var code = path.charCodeAt(0);
                var hasRoot = code === 47 /*/*/;
                var end = -1;
                var matchedSlash = true;
                for (var i = path.length - 1; i >= 1; --i) {
                    code = path.charCodeAt(i);
                    if (code === 47 /*/*/) {
                            if (!matchedSlash) {
                                end = i;
                                break;
                            }
                        } else {
                        // We saw the first non-path separator
                        matchedSlash = false;
                    }
                }

                if (end === -1) return hasRoot ? '/' : '.';
                if (hasRoot && end === 1) {
                    // return '//';
                    // Backwards-compat fix:
                    return '/';
                }
                return path.slice(0, end);
            };

            function basename(path) {
                if (typeof path !== 'string') path = path + '';

                var start = 0;
                var end = -1;
                var matchedSlash = true;
                var i;

                for (i = path.length - 1; i >= 0; --i) {
                    if (path.charCodeAt(i) === 47 /*/*/) {
                            // If we reached a path separator that was not part of a set of path
                            // separators at the end of the string, stop now
                            if (!matchedSlash) {
                                start = i + 1;
                                break;
                            }
                        } else if (end === -1) {
                        // We saw the first non-path separator, mark this as the end of our
                        // path component
                        matchedSlash = false;
                        end = i + 1;
                    }
                }

                if (end === -1) return '';
                return path.slice(start, end);
            }

            // Uses a mixed approach for backwards-compatibility, as ext behavior changed
            // in new Node.js versions, so only basename() above is backported here
            exports.basename = function (path, ext) {
                var f = basename(path);
                if (ext && f.substr(-1 * ext.length) === ext) {
                    f = f.substr(0, f.length - ext.length);
                }
                return f;
            };

            exports.extname = function (path) {
                if (typeof path !== 'string') path = path + '';
                var startDot = -1;
                var startPart = 0;
                var end = -1;
                var matchedSlash = true;
                // Track the state of characters (if any) we see before our first dot and
                // after any path separator we find
                var preDotState = 0;
                for (var i = path.length - 1; i >= 0; --i) {
                    var code = path.charCodeAt(i);
                    if (code === 47 /*/*/) {
                            // If we reached a path separator that was not part of a set of path
                            // separators at the end of the string, stop now
                            if (!matchedSlash) {
                                startPart = i + 1;
                                break;
                            }
                            continue;
                        }
                    if (end === -1) {
                        // We saw the first non-path separator, mark this as the end of our
                        // extension
                        matchedSlash = false;
                        end = i + 1;
                    }
                    if (code === 46 /*.*/) {
                            // If this is our first dot, mark it as the start of our extension
                            if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
                        } else if (startDot !== -1) {
                        // We saw a non-dot and non-path separator before our dot, so we should
                        // have a good chance at having a non-empty extension
                        preDotState = -1;
                    }
                }

                if (startDot === -1 || end === -1 ||
                // We saw a non-dot character immediately before the dot
                preDotState === 0 ||
                // The (right-most) trimmed path component is exactly '..'
                preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
                    return '';
                }
                return path.slice(startDot, end);
            };

            function filter(xs, f) {
                if (xs.filter) return xs.filter(f);
                var res = [];
                for (var i = 0; i < xs.length; i++) {
                    if (f(xs[i], i, xs)) res.push(xs[i]);
                }
                return res;
            }

            // String.prototype.substr - negative index don't work in IE8
            var substr = 'ab'.substr(-1) === 'b' ? function (str, start, len) {
                return str.substr(start, len);
            } : function (str, start, len) {
                if (start < 0) start = str.length + start;
                return str.substr(start, len);
            };
        }).call(this, require("rH1JPG"));
    }, { "rH1JPG": 3 }], 3: [function (require, module, exports) {
        // shim for using process in browser

        var process = module.exports = {};

        process.nextTick = function () {
            var canSetImmediate = typeof window !== 'undefined' && window.setImmediate;
            var canPost = typeof window !== 'undefined' && window.postMessage && window.addEventListener;

            if (canSetImmediate) {
                return function (f) {
                    return window.setImmediate(f);
                };
            }

            if (canPost) {
                var queue = [];
                window.addEventListener('message', function (ev) {
                    var source = ev.source;
                    if ((source === window || source === null) && ev.data === 'process-tick') {
                        ev.stopPropagation();
                        if (queue.length > 0) {
                            var fn = queue.shift();
                            fn();
                        }
                    }
                }, true);

                return function nextTick(fn) {
                    queue.push(fn);
                    window.postMessage('process-tick', '*');
                };
            }

            return function nextTick(fn) {
                setTimeout(fn, 0);
            };
        }();

        process.title = 'browser';
        process.browser = true;
        process.env = {};
        process.argv = [];

        function noop() {}

        process.on = noop;
        process.addListener = noop;
        process.once = noop;
        process.off = noop;
        process.removeListener = noop;
        process.removeAllListeners = noop;
        process.emit = noop;

        process.binding = function (name) {
            throw new Error('process.binding is not supported');
        };

        // TODO(shtylman)
        process.cwd = function () {
            return '/';
        };
        process.chdir = function (dir) {
            throw new Error('process.chdir is not supported');
        };
    }, {}], 4: [function (require, module, exports) {
        /*
         * Date Format 1.2.3
         * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
         * MIT license
         *
         * Includes enhancements by Scott Trenda <scott.trenda.net>
         * and Kris Kowal <cixar.com/~kris.kowal/>
         *
         * Accepts a date, a mask, or a date and a mask.
         * Returns a formatted version of the given date.
         * The date defaults to the current date/time.
         * The mask defaults to dateFormat.masks.default.
         */

        (function (global) {
            'use strict';

            var dateFormat = function () {
                var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g;
                var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
                var timezoneClip = /[^-+\dA-Z]/g;

                // Regexes and supporting functions are cached through closure
                return function (date, mask, utc, gmt) {

                    // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
                    if (arguments.length === 1 && kindOf(date) === 'string' && !/\d/.test(date)) {
                        mask = date;
                        date = undefined;
                    }

                    date = date || new Date();

                    if (!(date instanceof Date)) {
                        date = new Date(date);
                    }

                    if (isNaN(date)) {
                        throw TypeError('Invalid date');
                    }

                    mask = String(dateFormat.masks[mask] || mask || dateFormat.masks['default']);

                    // Allow setting the utc/gmt argument via the mask
                    var maskSlice = mask.slice(0, 4);
                    if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
                        mask = mask.slice(4);
                        utc = true;
                        if (maskSlice === 'GMT:') {
                            gmt = true;
                        }
                    }

                    var _ = utc ? 'getUTC' : 'get';
                    var d = date[_ + 'Date']();
                    var D = date[_ + 'Day']();
                    var m = date[_ + 'Month']();
                    var y = date[_ + 'FullYear']();
                    var H = date[_ + 'Hours']();
                    var M = date[_ + 'Minutes']();
                    var s = date[_ + 'Seconds']();
                    var L = date[_ + 'Milliseconds']();
                    var o = utc ? 0 : date.getTimezoneOffset();
                    var W = getWeek(date);
                    var N = getDayOfWeek(date);
                    var flags = {
                        d: d,
                        dd: pad(d),
                        ddd: dateFormat.i18n.dayNames[D],
                        dddd: dateFormat.i18n.dayNames[D + 7],
                        m: m + 1,
                        mm: pad(m + 1),
                        mmm: dateFormat.i18n.monthNames[m],
                        mmmm: dateFormat.i18n.monthNames[m + 12],
                        yy: String(y).slice(2),
                        yyyy: y,
                        h: H % 12 || 12,
                        hh: pad(H % 12 || 12),
                        H: H,
                        HH: pad(H),
                        M: M,
                        MM: pad(M),
                        s: s,
                        ss: pad(s),
                        l: pad(L, 3),
                        L: pad(Math.round(L / 10)),
                        t: H < 12 ? 'a' : 'p',
                        tt: H < 12 ? 'am' : 'pm',
                        T: H < 12 ? 'A' : 'P',
                        TT: H < 12 ? 'AM' : 'PM',
                        Z: gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
                        o: (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                        S: ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
                        W: W,
                        N: N
                    };

                    return mask.replace(token, function (match) {
                        if (match in flags) {
                            return flags[match];
                        }
                        return match.slice(1, match.length - 1);
                    });
                };
            }();

            dateFormat.masks = {
                'default': 'ddd mmm dd yyyy HH:MM:ss',
                'shortDate': 'm/d/yy',
                'mediumDate': 'mmm d, yyyy',
                'longDate': 'mmmm d, yyyy',
                'fullDate': 'dddd, mmmm d, yyyy',
                'shortTime': 'h:MM TT',
                'mediumTime': 'h:MM:ss TT',
                'longTime': 'h:MM:ss TT Z',
                'isoDate': 'yyyy-mm-dd',
                'isoTime': 'HH:MM:ss',
                'isoDateTime': 'yyyy-mm-dd\'T\'HH:MM:sso',
                'isoUtcDateTime': 'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
                'expiresHeaderFormat': 'ddd, dd mmm yyyy HH:MM:ss Z'
            };

            // Internationalization strings
            dateFormat.i18n = {
                dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            };

            function pad(val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) {
                    val = '0' + val;
                }
                return val;
            }

            /**
             * Get the ISO 8601 week number
             * Based on comments from
             * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
             *
             * @param  {Object} `date`
             * @return {Number}
             */
            function getWeek(date) {
                // Remove time components of date
                var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

                // Change date to Thursday same week
                targetThursday.setDate(targetThursday.getDate() - (targetThursday.getDay() + 6) % 7 + 3);

                // Take January 4th as it is always in week 1 (see ISO 8601)
                var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

                // Change date to Thursday same week
                firstThursday.setDate(firstThursday.getDate() - (firstThursday.getDay() + 6) % 7 + 3);

                // Check if daylight-saving-time-switch occured and correct for it
                var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
                targetThursday.setHours(targetThursday.getHours() - ds);

                // Number of weeks between target Thursday and first Thursday
                var weekDiff = (targetThursday - firstThursday) / (86400000 * 7);
                return 1 + Math.floor(weekDiff);
            }

            /**
             * Get ISO-8601 numeric representation of the day of the week
             * 1 (for Monday) through 7 (for Sunday)
             * 
             * @param  {Object} `date`
             * @return {Number}
             */
            function getDayOfWeek(date) {
                var dow = date.getDay();
                if (dow === 0) {
                    dow = 7;
                }
                return dow;
            }

            /**
             * kind-of shortcut
             * @param  {*} val
             * @return {String}
             */
            function kindOf(val) {
                if (val === null) {
                    return 'null';
                }

                if (val === undefined) {
                    return 'undefined';
                }

                if ((typeof val === "undefined" ? "undefined" : _typeof(val)) !== 'object') {
                    return typeof val === "undefined" ? "undefined" : _typeof(val);
                }

                if (Array.isArray(val)) {
                    return 'array';
                }

                return {}.toString.call(val).slice(8, -1).toLowerCase();
            };

            if (typeof define === 'function' && define.amd) {
                define(function () {
                    return dateFormat;
                });
            } else if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object') {
                module.exports = dateFormat;
            } else {
                global.dateFormat = dateFormat;
            }
        })(this);
    }, {}], 5: [function (require, module, exports) {
        /*! kjua v0.1.1 - https://larsjung.de/kjua/ */
        !function (r, t) {
            "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) ? exports.kjua = t() : r.kjua = t();
        }(this, function () {
            return function (r) {
                function t(n) {
                    if (e[n]) return e[n].exports;var o = e[n] = { exports: {}, id: n, loaded: !1 };return r[n].call(o.exports, o, o.exports, t), o.loaded = !0, o.exports;
                }var e = {};return t.m = r, t.c = e, t.p = "", t(0);
            }([function (r, t, e) {
                "use strict";
                var n = e(1),
                    o = n.createCanvas,
                    i = n.canvasToImg,
                    a = n.dpr,
                    u = e(2),
                    f = e(3),
                    c = e(4);r.exports = function (r) {
                    var t = Object.assign({}, u, r),
                        e = f(t.text, t.ecLevel, t.minVersion, t.quiet),
                        n = t.ratio || a,
                        l = o(t.size, n),
                        s = l.getContext("2d");return s.scale(n, n), c(e, s, t), "image" === t.render ? i(l) : l;
                };
            }, function (r, t) {
                "use strict";
                var e = window,
                    n = e.document,
                    o = e.devicePixelRatio || 1,
                    i = function i(r) {
                    return n.createElement(r);
                },
                    a = function a(r, t) {
                    return r.getAttribute(t);
                },
                    u = function u(r, t, e) {
                    return r.setAttribute(t, e);
                },
                    f = function f(r, t) {
                    var e = i("canvas");return u(e, "width", r * t), u(e, "height", r * t), e.style.width = r + "px", e.style.height = r + "px", e;
                },
                    c = function c(r) {
                    var t = i("img");return u(t, "crossorigin", "anonymous"), u(t, "src", r.toDataURL("image/png")), u(t, "width", a(r, "width")), u(t, "height", a(r, "height")), t.style.width = r.style.width, t.style.height = r.style.height, t;
                };r.exports = { createCanvas: f, canvasToImg: c, dpr: o };
            }, function (r, t) {
                "use strict";
                r.exports = { render: "image", crisp: !0, minVersion: 1, ecLevel: "L", size: 200, ratio: null, fill: "#333", back: "#fff", text: "no text", rounded: 0, quiet: 0, mode: "plain", mSize: 30, mPosX: 50, mPosY: 50, label: "no label", fontname: "sans", fontcolor: "#333", image: null };
            }, function (r, t) {
                "use strict";
                var e = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (r) {
                    return typeof r === "undefined" ? "undefined" : _typeof(r);
                } : function (r) {
                    return r && "function" == typeof Symbol && r.constructor === Symbol ? "symbol" : typeof r === "undefined" ? "undefined" : _typeof(r);
                },
                    n = /code length overflow/i,
                    o = function () {
                    var e = function () {
                        function r(t, e) {
                            if ("undefined" == typeof t.length) throw new Error(t.length + "/" + e);var n = function () {
                                for (var r = 0; r < t.length && 0 == t[r];) {
                                    r += 1;
                                }for (var n = new Array(t.length - r + e), o = 0; o < t.length - r; o += 1) {
                                    n[o] = t[o + r];
                                }return n;
                            }(),
                                o = {};return o.getAt = function (r) {
                                return n[r];
                            }, o.getLength = function () {
                                return n.length;
                            }, o.multiply = function (t) {
                                for (var e = new Array(o.getLength() + t.getLength() - 1), n = 0; n < o.getLength(); n += 1) {
                                    for (var i = 0; i < t.getLength(); i += 1) {
                                        e[n + i] ^= a.gexp(a.glog(o.getAt(n)) + a.glog(t.getAt(i)));
                                    }
                                }return r(e, 0);
                            }, o.mod = function (t) {
                                if (o.getLength() - t.getLength() < 0) return o;for (var e = a.glog(o.getAt(0)) - a.glog(t.getAt(0)), n = new Array(o.getLength()), i = 0; i < o.getLength(); i += 1) {
                                    n[i] = o.getAt(i);
                                }for (var i = 0; i < t.getLength(); i += 1) {
                                    n[i] ^= a.gexp(a.glog(t.getAt(i)) + e);
                                }return r(n, 0).mod(t);
                            }, o;
                        }var t = function t(_t, e) {
                            var o = 236,
                                a = 17,
                                l = _t,
                                s = n[e],
                                g = null,
                                h = 0,
                                d = null,
                                w = new Array(),
                                y = {},
                                p = function p(r, t) {
                                h = 4 * l + 17, g = function (r) {
                                    for (var t = new Array(r), e = 0; r > e; e += 1) {
                                        t[e] = new Array(r);for (var n = 0; r > n; n += 1) {
                                            t[e][n] = null;
                                        }
                                    }return t;
                                }(h), m(0, 0), m(h - 7, 0), m(0, h - 7), E(), B(), M(r, t), l >= 7 && T(r), null == d && (d = x(l, s, w)), k(d, t);
                            },
                                m = function m(r, t) {
                                for (var e = -1; 7 >= e; e += 1) {
                                    if (!(-1 >= r + e || r + e >= h)) for (var n = -1; 7 >= n; n += 1) {
                                        -1 >= t + n || t + n >= h || (e >= 0 && 6 >= e && (0 == n || 6 == n) || n >= 0 && 6 >= n && (0 == e || 6 == e) || e >= 2 && 4 >= e && n >= 2 && 4 >= n ? g[r + e][t + n] = !0 : g[r + e][t + n] = !1);
                                    }
                                }
                            },
                                A = function A() {
                                for (var r = 0, t = 0, e = 0; 8 > e; e += 1) {
                                    p(!0, e);var n = i.getLostPoint(y);(0 == e || r > n) && (r = n, t = e);
                                }return t;
                            },
                                B = function B() {
                                for (var r = 8; h - 8 > r; r += 1) {
                                    null == g[r][6] && (g[r][6] = r % 2 == 0);
                                }for (var t = 8; h - 8 > t; t += 1) {
                                    null == g[6][t] && (g[6][t] = t % 2 == 0);
                                }
                            },
                                E = function E() {
                                for (var r = i.getPatternPosition(l), t = 0; t < r.length; t += 1) {
                                    for (var e = 0; e < r.length; e += 1) {
                                        var n = r[t],
                                            o = r[e];if (null == g[n][o]) for (var a = -2; 2 >= a; a += 1) {
                                            for (var u = -2; 2 >= u; u += 1) {
                                                -2 == a || 2 == a || -2 == u || 2 == u || 0 == a && 0 == u ? g[n + a][o + u] = !0 : g[n + a][o + u] = !1;
                                            }
                                        }
                                    }
                                }
                            },
                                T = function T(r) {
                                for (var t = i.getBCHTypeNumber(l), e = 0; 18 > e; e += 1) {
                                    var n = !r && 1 == (t >> e & 1);g[Math.floor(e / 3)][e % 3 + h - 8 - 3] = n;
                                }for (var e = 0; 18 > e; e += 1) {
                                    var n = !r && 1 == (t >> e & 1);g[e % 3 + h - 8 - 3][Math.floor(e / 3)] = n;
                                }
                            },
                                M = function M(r, t) {
                                for (var e = s << 3 | t, n = i.getBCHTypeInfo(e), o = 0; 15 > o; o += 1) {
                                    var a = !r && 1 == (n >> o & 1);6 > o ? g[o][8] = a : 8 > o ? g[o + 1][8] = a : g[h - 15 + o][8] = a;
                                }for (var o = 0; 15 > o; o += 1) {
                                    var a = !r && 1 == (n >> o & 1);8 > o ? g[8][h - o - 1] = a : 9 > o ? g[8][15 - o - 1 + 1] = a : g[8][15 - o - 1] = a;
                                }g[h - 8][8] = !r;
                            },
                                k = function k(r, t) {
                                for (var e = -1, n = h - 1, o = 7, a = 0, u = i.getMaskFunction(t), f = h - 1; f > 0; f -= 2) {
                                    for (6 == f && (f -= 1);;) {
                                        for (var c = 0; 2 > c; c += 1) {
                                            if (null == g[n][f - c]) {
                                                var l = !1;a < r.length && (l = 1 == (r[a] >>> o & 1));var s = u(n, f - c);s && (l = !l), g[n][f - c] = l, o -= 1, -1 == o && (a += 1, o = 7);
                                            }
                                        }if (n += e, 0 > n || n >= h) {
                                            n -= e, e = -e;break;
                                        }
                                    }
                                }
                            },
                                b = function b(t, e) {
                                for (var n = 0, o = 0, a = 0, u = new Array(e.length), f = new Array(e.length), c = 0; c < e.length; c += 1) {
                                    var l = e[c].dataCount,
                                        s = e[c].totalCount - l;o = Math.max(o, l), a = Math.max(a, s), u[c] = new Array(l);for (var g = 0; g < u[c].length; g += 1) {
                                        u[c][g] = 255 & t.getBuffer()[g + n];
                                    }n += l;var h = i.getErrorCorrectPolynomial(s),
                                        v = r(u[c], h.getLength() - 1),
                                        d = v.mod(h);f[c] = new Array(h.getLength() - 1);for (var g = 0; g < f[c].length; g += 1) {
                                        var w = g + d.getLength() - f[c].length;f[c][g] = w >= 0 ? d.getAt(w) : 0;
                                    }
                                }for (var y = 0, g = 0; g < e.length; g += 1) {
                                    y += e[g].totalCount;
                                }for (var p = new Array(y), m = 0, g = 0; o > g; g += 1) {
                                    for (var c = 0; c < e.length; c += 1) {
                                        g < u[c].length && (p[m] = u[c][g], m += 1);
                                    }
                                }for (var g = 0; a > g; g += 1) {
                                    for (var c = 0; c < e.length; c += 1) {
                                        g < f[c].length && (p[m] = f[c][g], m += 1);
                                    }
                                }return p;
                            },
                                x = function x(r, t, e) {
                                for (var n = u.getRSBlocks(r, t), c = f(), l = 0; l < e.length; l += 1) {
                                    var s = e[l];c.put(s.getMode(), 4), c.put(s.getLength(), i.getLengthInBits(s.getMode(), r)), s.write(c);
                                }for (var g = 0, l = 0; l < n.length; l += 1) {
                                    g += n[l].dataCount;
                                }if (c.getLengthInBits() > 8 * g) throw new Error("code length overflow. (" + c.getLengthInBits() + ">" + 8 * g + ")");for (c.getLengthInBits() + 4 <= 8 * g && c.put(0, 4); c.getLengthInBits() % 8 != 0;) {
                                    c.putBit(!1);
                                }for (;;) {
                                    if (c.getLengthInBits() >= 8 * g) break;if (c.put(o, 8), c.getLengthInBits() >= 8 * g) break;c.put(a, 8);
                                }return b(c, n);
                            };return y.addData = function (r) {
                                var t = c(r);w.push(t), d = null;
                            }, y.isDark = function (r, t) {
                                if (0 > r || r >= h || 0 > t || t >= h) throw new Error(r + "," + t);return g[r][t];
                            }, y.getModuleCount = function () {
                                return h;
                            }, y.make = function () {
                                p(!1, A());
                            }, y.createTableTag = function (r, t) {
                                r = r || 2, t = "undefined" == typeof t ? 4 * r : t;var e = "";e += '<table style="', e += " border-width: 0px; border-style: none;", e += " border-collapse: collapse;", e += " padding: 0px; margin: " + t + "px;", e += '">', e += "<tbody>";for (var n = 0; n < y.getModuleCount(); n += 1) {
                                    e += "<tr>";for (var o = 0; o < y.getModuleCount(); o += 1) {
                                        e += '<td style="', e += " border-width: 0px; border-style: none;", e += " border-collapse: collapse;", e += " padding: 0px; margin: 0px;", e += " width: " + r + "px;", e += " height: " + r + "px;", e += " background-color: ", e += y.isDark(n, o) ? "#000000" : "#ffffff", e += ";", e += '"/>';
                                    }e += "</tr>";
                                }return e += "</tbody>", e += "</table>";
                            }, y.createImgTag = function (r, t) {
                                r = r || 2, t = "undefined" == typeof t ? 4 * r : t;var e = y.getModuleCount() * r + 2 * t,
                                    n = t,
                                    o = e - t;return v(e, e, function (t, e) {
                                    if (t >= n && o > t && e >= n && o > e) {
                                        var i = Math.floor((t - n) / r),
                                            a = Math.floor((e - n) / r);return y.isDark(a, i) ? 0 : 1;
                                    }return 1;
                                });
                            }, y;
                        };t.stringToBytes = function (r) {
                            for (var t = new Array(), e = 0; e < r.length; e += 1) {
                                var n = r.charCodeAt(e);t.push(255 & n);
                            }return t;
                        }, t.createStringToBytes = function (r, t) {
                            var e = function () {
                                for (var e = g(r), n = function n() {
                                    var r = e.read();if (-1 == r) throw new Error();return r;
                                }, o = 0, i = {};;) {
                                    var a = e.read();if (-1 == a) break;var u = n(),
                                        f = n(),
                                        c = n(),
                                        l = String.fromCharCode(a << 8 | u),
                                        s = f << 8 | c;i[l] = s, o += 1;
                                }if (o != t) throw new Error(o + " != " + t);return i;
                            }(),
                                n = "?".charCodeAt(0);return function (r) {
                                for (var t = new Array(), o = 0; o < r.length; o += 1) {
                                    var i = r.charCodeAt(o);if (128 > i) t.push(i);else {
                                        var a = e[r.charAt(o)];"number" == typeof a ? (255 & a) == a ? t.push(a) : (t.push(a >>> 8), t.push(255 & a)) : t.push(n);
                                    }
                                }return t;
                            };
                        };var e = { MODE_NUMBER: 1, MODE_ALPHA_NUM: 2, MODE_8BIT_BYTE: 4, MODE_KANJI: 8 },
                            n = { L: 1, M: 0, Q: 3, H: 2 },
                            o = { PATTERN000: 0, PATTERN001: 1, PATTERN010: 2, PATTERN011: 3, PATTERN100: 4, PATTERN101: 5, PATTERN110: 6, PATTERN111: 7 },
                            i = function () {
                            var t = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]],
                                n = 1335,
                                i = 7973,
                                u = 21522,
                                f = {},
                                c = function c(r) {
                                for (var t = 0; 0 != r;) {
                                    t += 1, r >>>= 1;
                                }return t;
                            };return f.getBCHTypeInfo = function (r) {
                                for (var t = r << 10; c(t) - c(n) >= 0;) {
                                    t ^= n << c(t) - c(n);
                                }return (r << 10 | t) ^ u;
                            }, f.getBCHTypeNumber = function (r) {
                                for (var t = r << 12; c(t) - c(i) >= 0;) {
                                    t ^= i << c(t) - c(i);
                                }return r << 12 | t;
                            }, f.getPatternPosition = function (r) {
                                return t[r - 1];
                            }, f.getMaskFunction = function (r) {
                                switch (r) {case o.PATTERN000:
                                        return function (r, t) {
                                            return (r + t) % 2 == 0;
                                        };case o.PATTERN001:
                                        return function (r, t) {
                                            return r % 2 == 0;
                                        };case o.PATTERN010:
                                        return function (r, t) {
                                            return t % 3 == 0;
                                        };case o.PATTERN011:
                                        return function (r, t) {
                                            return (r + t) % 3 == 0;
                                        };case o.PATTERN100:
                                        return function (r, t) {
                                            return (Math.floor(r / 2) + Math.floor(t / 3)) % 2 == 0;
                                        };case o.PATTERN101:
                                        return function (r, t) {
                                            return r * t % 2 + r * t % 3 == 0;
                                        };case o.PATTERN110:
                                        return function (r, t) {
                                            return (r * t % 2 + r * t % 3) % 2 == 0;
                                        };case o.PATTERN111:
                                        return function (r, t) {
                                            return (r * t % 3 + (r + t) % 2) % 2 == 0;
                                        };default:
                                        throw new Error("bad maskPattern:" + r);}
                            }, f.getErrorCorrectPolynomial = function (t) {
                                for (var e = r([1], 0), n = 0; t > n; n += 1) {
                                    e = e.multiply(r([1, a.gexp(n)], 0));
                                }return e;
                            }, f.getLengthInBits = function (r, t) {
                                if (t >= 1 && 10 > t) switch (r) {case e.MODE_NUMBER:
                                        return 10;case e.MODE_ALPHA_NUM:
                                        return 9;case e.MODE_8BIT_BYTE:
                                        return 8;case e.MODE_KANJI:
                                        return 8;default:
                                        throw new Error("mode:" + r);} else if (27 > t) switch (r) {case e.MODE_NUMBER:
                                        return 12;case e.MODE_ALPHA_NUM:
                                        return 11;case e.MODE_8BIT_BYTE:
                                        return 16;case e.MODE_KANJI:
                                        return 10;default:
                                        throw new Error("mode:" + r);} else {
                                    if (!(41 > t)) throw new Error("type:" + t);switch (r) {case e.MODE_NUMBER:
                                            return 14;case e.MODE_ALPHA_NUM:
                                            return 13;case e.MODE_8BIT_BYTE:
                                            return 16;case e.MODE_KANJI:
                                            return 12;default:
                                            throw new Error("mode:" + r);}
                                }
                            }, f.getLostPoint = function (r) {
                                for (var t = r.getModuleCount(), e = 0, n = 0; t > n; n += 1) {
                                    for (var o = 0; t > o; o += 1) {
                                        for (var i = 0, a = r.isDark(n, o), u = -1; 1 >= u; u += 1) {
                                            if (!(0 > n + u || n + u >= t)) for (var f = -1; 1 >= f; f += 1) {
                                                0 > o + f || o + f >= t || 0 == u && 0 == f || a == r.isDark(n + u, o + f) && (i += 1);
                                            }
                                        }i > 5 && (e += 3 + i - 5);
                                    }
                                }for (var n = 0; t - 1 > n; n += 1) {
                                    for (var o = 0; t - 1 > o; o += 1) {
                                        var c = 0;r.isDark(n, o) && (c += 1), r.isDark(n + 1, o) && (c += 1), r.isDark(n, o + 1) && (c += 1), r.isDark(n + 1, o + 1) && (c += 1), 0 != c && 4 != c || (e += 3);
                                    }
                                }for (var n = 0; t > n; n += 1) {
                                    for (var o = 0; t - 6 > o; o += 1) {
                                        r.isDark(n, o) && !r.isDark(n, o + 1) && r.isDark(n, o + 2) && r.isDark(n, o + 3) && r.isDark(n, o + 4) && !r.isDark(n, o + 5) && r.isDark(n, o + 6) && (e += 40);
                                    }
                                }for (var o = 0; t > o; o += 1) {
                                    for (var n = 0; t - 6 > n; n += 1) {
                                        r.isDark(n, o) && !r.isDark(n + 1, o) && r.isDark(n + 2, o) && r.isDark(n + 3, o) && r.isDark(n + 4, o) && !r.isDark(n + 5, o) && r.isDark(n + 6, o) && (e += 40);
                                    }
                                }for (var l = 0, o = 0; t > o; o += 1) {
                                    for (var n = 0; t > n; n += 1) {
                                        r.isDark(n, o) && (l += 1);
                                    }
                                }var s = Math.abs(100 * l / t / t - 50) / 5;return e += 10 * s;
                            }, f;
                        }(),
                            a = function () {
                            for (var r = new Array(256), t = new Array(256), e = 0; 8 > e; e += 1) {
                                r[e] = 1 << e;
                            }for (var e = 8; 256 > e; e += 1) {
                                r[e] = r[e - 4] ^ r[e - 5] ^ r[e - 6] ^ r[e - 8];
                            }for (var e = 0; 255 > e; e += 1) {
                                t[r[e]] = e;
                            }var n = {};return n.glog = function (r) {
                                if (1 > r) throw new Error("glog(" + r + ")");return t[r];
                            }, n.gexp = function (t) {
                                for (; 0 > t;) {
                                    t += 255;
                                }for (; t >= 256;) {
                                    t -= 255;
                                }return r[t];
                            }, n;
                        }(),
                            u = function () {
                            var r = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12, 7, 37, 13], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]],
                                t = function t(r, _t2) {
                                var e = {};return e.totalCount = r, e.dataCount = _t2, e;
                            },
                                e = {},
                                o = function o(t, e) {
                                switch (e) {case n.L:
                                        return r[4 * (t - 1) + 0];case n.M:
                                        return r[4 * (t - 1) + 1];case n.Q:
                                        return r[4 * (t - 1) + 2];case n.H:
                                        return r[4 * (t - 1) + 3];default:
                                        return;}
                            };return e.getRSBlocks = function (r, e) {
                                var n = o(r, e);if ("undefined" == typeof n) throw new Error("bad rs block @ typeNumber:" + r + "/errorCorrectLevel:" + e);for (var i = n.length / 3, a = new Array(), u = 0; i > u; u += 1) {
                                    for (var f = n[3 * u + 0], c = n[3 * u + 1], l = n[3 * u + 2], s = 0; f > s; s += 1) {
                                        a.push(t(c, l));
                                    }
                                }return a;
                            }, e;
                        }(),
                            f = function f() {
                            var r = new Array(),
                                t = 0,
                                e = {};return e.getBuffer = function () {
                                return r;
                            }, e.getAt = function (t) {
                                var e = Math.floor(t / 8);return 1 == (r[e] >>> 7 - t % 8 & 1);
                            }, e.put = function (r, t) {
                                for (var n = 0; t > n; n += 1) {
                                    e.putBit(1 == (r >>> t - n - 1 & 1));
                                }
                            }, e.getLengthInBits = function () {
                                return t;
                            }, e.putBit = function (e) {
                                var n = Math.floor(t / 8);r.length <= n && r.push(0), e && (r[n] |= 128 >>> t % 8), t += 1;
                            }, e;
                        },
                            c = function c(r) {
                            var n = e.MODE_8BIT_BYTE,
                                o = t.stringToBytes(r),
                                i = {};return i.getMode = function () {
                                return n;
                            }, i.getLength = function (r) {
                                return o.length;
                            }, i.write = function (r) {
                                for (var t = 0; t < o.length; t += 1) {
                                    r.put(o[t], 8);
                                }
                            }, i;
                        },
                            l = function l() {
                            var r = new Array(),
                                t = {};return t.writeByte = function (t) {
                                r.push(255 & t);
                            }, t.writeShort = function (r) {
                                t.writeByte(r), t.writeByte(r >>> 8);
                            }, t.writeBytes = function (r, e, n) {
                                e = e || 0, n = n || r.length;for (var o = 0; n > o; o += 1) {
                                    t.writeByte(r[o + e]);
                                }
                            }, t.writeString = function (r) {
                                for (var e = 0; e < r.length; e += 1) {
                                    t.writeByte(r.charCodeAt(e));
                                }
                            }, t.toByteArray = function () {
                                return r;
                            }, t.toString = function () {
                                var t = "";t += "[";for (var e = 0; e < r.length; e += 1) {
                                    e > 0 && (t += ","), t += r[e];
                                }return t += "]";
                            }, t;
                        },
                            s = function s() {
                            var r = 0,
                                t = 0,
                                e = 0,
                                n = "",
                                o = {},
                                i = function i(r) {
                                n += String.fromCharCode(a(63 & r));
                            },
                                a = function a(r) {
                                if (0 > r) ;else {
                                    if (26 > r) return 65 + r;if (52 > r) return 97 + (r - 26);if (62 > r) return 48 + (r - 52);if (62 == r) return 43;if (63 == r) return 47;
                                }throw new Error("n:" + r);
                            };return o.writeByte = function (n) {
                                for (r = r << 8 | 255 & n, t += 8, e += 1; t >= 6;) {
                                    i(r >>> t - 6), t -= 6;
                                }
                            }, o.flush = function () {
                                if (t > 0 && (i(r << 6 - t), r = 0, t = 0), e % 3 != 0) for (var o = 3 - e % 3, a = 0; o > a; a += 1) {
                                    n += "=";
                                }
                            }, o.toString = function () {
                                return n;
                            }, o;
                        },
                            g = function g(r) {
                            var t = r,
                                e = 0,
                                n = 0,
                                o = 0,
                                i = {};i.read = function () {
                                for (; 8 > o;) {
                                    if (e >= t.length) {
                                        if (0 == o) return -1;throw new Error("unexpected end of file./" + o);
                                    }var r = t.charAt(e);if (e += 1, "=" == r) return o = 0, -1;r.match(/^\s$/) || (n = n << 6 | a(r.charCodeAt(0)), o += 6);
                                }var i = n >>> o - 8 & 255;return o -= 8, i;
                            };var a = function a(r) {
                                if (r >= 65 && 90 >= r) return r - 65;if (r >= 97 && 122 >= r) return r - 97 + 26;if (r >= 48 && 57 >= r) return r - 48 + 52;if (43 == r) return 62;if (47 == r) return 63;throw new Error("c:" + r);
                            };return i;
                        },
                            h = function h(r, t) {
                            var e = r,
                                n = t,
                                o = new Array(r * t),
                                i = {};i.setPixel = function (r, t, n) {
                                o[t * e + r] = n;
                            }, i.write = function (r) {
                                r.writeString("GIF87a"), r.writeShort(e), r.writeShort(n), r.writeByte(128), r.writeByte(0), r.writeByte(0), r.writeByte(0), r.writeByte(0), r.writeByte(0), r.writeByte(255), r.writeByte(255), r.writeByte(255), r.writeString(","), r.writeShort(0), r.writeShort(0), r.writeShort(e), r.writeShort(n), r.writeByte(0);var t = 2,
                                    o = u(t);r.writeByte(t);for (var i = 0; o.length - i > 255;) {
                                    r.writeByte(255), r.writeBytes(o, i, 255), i += 255;
                                }r.writeByte(o.length - i), r.writeBytes(o, i, o.length - i), r.writeByte(0), r.writeString(";");
                            };var a = function a(r) {
                                var t = r,
                                    e = 0,
                                    n = 0,
                                    o = {};return o.write = function (r, o) {
                                    if (r >>> o != 0) throw new Error("length over");for (; e + o >= 8;) {
                                        t.writeByte(255 & (r << e | n)), o -= 8 - e, r >>>= 8 - e, n = 0, e = 0;
                                    }n = r << e | n, e += o;
                                }, o.flush = function () {
                                    e > 0 && t.writeByte(n);
                                }, o;
                            },
                                u = function u(r) {
                                for (var t = 1 << r, e = (1 << r) + 1, n = r + 1, i = f(), u = 0; t > u; u += 1) {
                                    i.add(String.fromCharCode(u));
                                }i.add(String.fromCharCode(t)), i.add(String.fromCharCode(e));var c = l(),
                                    s = a(c);s.write(t, n);var g = 0,
                                    h = String.fromCharCode(o[g]);for (g += 1; g < o.length;) {
                                    var v = String.fromCharCode(o[g]);g += 1, i.contains(h + v) ? h += v : (s.write(i.indexOf(h), n), i.size() < 4095 && (i.size() == 1 << n && (n += 1), i.add(h + v)), h = v);
                                }return s.write(i.indexOf(h), n), s.write(e, n), s.flush(), c.toByteArray();
                            },
                                f = function f() {
                                var r = {},
                                    t = 0,
                                    e = {};return e.add = function (n) {
                                    if (e.contains(n)) throw new Error("dup key:" + n);r[n] = t, t += 1;
                                }, e.size = function () {
                                    return t;
                                }, e.indexOf = function (t) {
                                    return r[t];
                                }, e.contains = function (t) {
                                    return "undefined" != typeof r[t];
                                }, e;
                            };return i;
                        },
                            v = function v(r, t, e, n) {
                            for (var o = h(r, t), i = 0; t > i; i += 1) {
                                for (var a = 0; r > a; a += 1) {
                                    o.setPixel(a, i, e(a, i));
                                }
                            }var u = l();o.write(u);for (var f = s(), c = u.toByteArray(), g = 0; g < c.length; g += 1) {
                                f.writeByte(c[g]);
                            }f.flush();var v = "";return v += "<img", v += ' src="', v += "data:image/gif;base64,", v += f, v += '"', v += ' width="', v += r, v += '"', v += ' height="', v += t, v += '"', n && (v += ' alt="', v += n, v += '"'), v += "/>";
                        };return t;
                    }();return function (e) {
                        "function" == typeof define && define.amd ? define([], e) : "object" == (typeof t === "undefined" ? "undefined" : _typeof(t)) && (r.exports = e());
                    }(function () {
                        return e;
                    }), !function (r) {
                        r.stringToBytes = function (r) {
                            function t(r) {
                                for (var t = [], e = 0; e < r.length; e++) {
                                    var n = r.charCodeAt(e);128 > n ? t.push(n) : 2048 > n ? t.push(192 | n >> 6, 128 | 63 & n) : 55296 > n || n >= 57344 ? t.push(224 | n >> 12, 128 | n >> 6 & 63, 128 | 63 & n) : (e++, n = 65536 + ((1023 & n) << 10 | 1023 & r.charCodeAt(e)), t.push(240 | n >> 18, 128 | n >> 12 & 63, 128 | n >> 6 & 63, 128 | 63 & n));
                                }return t;
                            }return t(r);
                        };
                    }(e), e;
                }(),
                    i = function i(r, t) {
                    var i = arguments.length <= 2 || void 0 === arguments[2] ? 1 : arguments[2];i = Math.max(1, i);for (var a = i; 40 >= a; a += 1) {
                        try {
                            var u = function () {
                                var e = o(a, t);e.addData(r), e.make();var n = e.getModuleCount(),
                                    i = function i(r, t) {
                                    return r >= 0 && n > r && t >= 0 && n > t && e.isDark(r, t);
                                };return { v: { text: r, level: t, version: a, moduleCount: n, isDark: i } };
                            }();if ("object" === ("undefined" == typeof u ? "undefined" : e(u))) return u.v;
                        } catch (f) {
                            if (!n.test(f.message)) throw f;
                        }
                    }return null;
                },
                    a = function a() {
                    var r = arguments.length <= 0 || void 0 === arguments[0] ? "" : arguments[0],
                        t = arguments.length <= 1 || void 0 === arguments[1] ? "L" : arguments[1],
                        e = arguments.length <= 2 || void 0 === arguments[2] ? 1 : arguments[2],
                        n = arguments.length <= 3 || void 0 === arguments[3] ? 0 : arguments[3],
                        o = i(r, t, e);return o && !function () {
                        var r = o.isDark;o.moduleCount += 2 * n, o.isDark = function (t, e) {
                            return r(t - n, e - n);
                        };
                    }(), o;
                };r.exports = a;
            }, function (r, t, e) {
                "use strict";
                var n = e(5),
                    o = e(6),
                    i = function i(r, t) {
                    r.fillStyle = t.back, r.fillRect(0, 0, t.size, t.size);
                },
                    a = function a(r, t, e, n, o, i) {
                    r.isDark(o, i) && t.rect(i * n, o * n, n, n);
                },
                    u = function u(r, t, e) {
                    if (r) {
                        var o = e.rounded > 0 && e.rounded <= 100 ? n : a,
                            i = r.moduleCount,
                            u = e.size / i,
                            f = 0;e.crisp && (u = Math.floor(u), f = Math.floor((e.size - u * i) / 2)), t.translate(f, f), t.beginPath();for (var c = 0; i > c; c += 1) {
                            for (var l = 0; i > l; l += 1) {
                                o(r, t, e, u, c, l);
                            }
                        }t.fillStyle = e.fill, t.fill(), t.translate(-f, -f);
                    }
                },
                    f = function f(r, t, e) {
                    i(t, e), u(r, t, e), o(t, e);
                };r.exports = f;
            }, function (r, t) {
                "use strict";
                var e = function e(r) {
                    return { c: r, m: function m() {
                            var r;return (r = this.c).moveTo.apply(r, arguments), this;
                        }, l: function l() {
                            var r;return (r = this.c).lineTo.apply(r, arguments), this;
                        }, a: function a() {
                            var r;return (r = this.c).arcTo.apply(r, arguments), this;
                        } };
                },
                    n = function n(r, t, e, _n, o, i, a, u, f, c) {
                    a ? r.m(t + i, e) : r.m(t, e), u ? r.l(_n - i, e).a(_n, e, _n, o, i) : r.l(_n, e), f ? r.l(_n, o - i).a(_n, o, t, o, i) : r.l(_n, o), c ? r.l(t + i, o).a(t, o, t, e, i) : r.l(t, o), a ? r.l(t, e + i).a(t, e, _n, e, i) : r.l(t, e);
                },
                    o = function o(r, t, e, n, _o, i, a, u, f, c) {
                    a && r.m(t + i, e).l(t, e).l(t, e + i).a(t, e, t + i, e, i), u && r.m(n - i, e).l(n, e).l(n, e + i).a(n, e, n - i, e, i), f && r.m(n - i, _o).l(n, _o).l(n, _o - i).a(n, _o, n - i, _o, i), c && r.m(t + i, _o).l(t, _o).l(t, _o - i).a(t, _o, t + i, _o, i);
                },
                    i = function i(r, t, _i, a, u, f) {
                    var c = f * a,
                        l = u * a,
                        s = c + a,
                        g = l + a,
                        h = .005 * _i.rounded * a,
                        v = r.isDark,
                        d = u - 1,
                        w = u + 1,
                        y = f - 1,
                        p = f + 1,
                        m = v(u, f),
                        A = v(d, y),
                        B = v(d, f),
                        E = v(d, p),
                        T = v(u, p),
                        M = v(w, p),
                        k = v(w, f),
                        b = v(w, y),
                        x = v(u, y),
                        D = e(t);m ? n(D, c, l, s, g, h, !B && !x, !B && !T, !k && !T, !k && !x) : o(D, c, l, s, g, h, B && x && A, B && T && E, k && T && M, k && x && b);
                };r.exports = i;
            }, function (r, t) {
                "use strict";
                var e = function e(r, t) {
                    var e = t.size,
                        n = "bold " + .01 * t.mSize * e + "px " + t.fontname;r.strokeStyle = t.back, r.lineWidth = .01 * t.mSize * e * .1, r.fillStyle = t.fontcolor, r.font = n;var o = r.measureText(t.label).width,
                        i = .01 * t.mSize,
                        a = o / e,
                        u = (1 - a) * t.mPosX * .01,
                        f = (1 - i) * t.mPosY * .01,
                        c = u * e,
                        l = f * e + .75 * t.mSize * .01 * e;r.strokeText(t.label, c, l), r.fillText(t.label, c, l);
                },
                    n = function n(r, t) {
                    var e = t.size,
                        n = t.image.naturalWidth || 1,
                        o = t.image.naturalHeight || 1,
                        i = .01 * t.mSize,
                        a = i * n / o,
                        u = (1 - a) * t.mPosX * .01,
                        f = (1 - i) * t.mPosY * .01,
                        c = u * e,
                        l = f * e,
                        s = a * e,
                        g = i * e;r.drawImage(t.image, c, l, s, g);
                },
                    o = function o(r, t) {
                    var o = t.mode;"label" === o ? e(r, t) : "image" === o && n(r, t);
                };r.exports = o;
            }]);
        });
    }, {}], 6: [function (require, module, exports) {
        // # Localize
        // is a GNU gettext-inspired (but not conformant) localization library for
        // Node.js

        var path = require('path');
        var fs = require('fs');

        function Localize(translations, dateFormats, defaultLocale) {

            // Make sure the defaultLocale is something sane, and set the locale to
            // its value. Also configure ``Localize`` to throw an error if missing
            // a translation.
            defaultLocale = typeof defaultLocale === "string" ? defaultLocale : "en";
            var locale = defaultLocale;
            var missingTranslationThrow = true;

            // ## The *mergeObjs* function
            // is a simple helper function to create a new object based on input objects.
            function mergeObjs() {
                var outObj = {};
                for (var i in arguments) {
                    if (arguments[i] instanceof Object) {
                        /* jshint forin: false */
                        for (var j in arguments[i]) {
                            // Does not check for collisions, newer object
                            // definitions clobber old definitions
                            outObj[j] = arguments[i][j];
                        }
                    }
                }
                return outObj;
            }

            // ## The *setLocale* function
            // simply sets the locale to whatever is specified at the moment, as long as it
            // is a string.
            this.setLocale = function (newLocale) {
                if (typeof newLocale === "string") {
                    locale = newLocale;
                } else {
                    throw new Error("Locale must be a string");
                }
            };

            // ## The *strings* object
            // contains a series of key-val pairs to be used for translating very large strings
            // that aren't desirable to have duplicated in several locations
            this.strings = {};

            // ## The *getTranslations* function
            // is a recursive function that checks the specified directory, and all child
            // directories, for ``translations.json`` files, combines them into one JSON
            // object, and returns them.
            function getTranslations(currDir, translations, strings) {
                if (fs.existsSync(currDir)) {
                    // Load translations.json file in current directory, if any
                    if (fs.existsSync(path.join(currDir, "translations.json"))) {
                        translations = mergeObjs(translations, JSON.parse(fs.readFileSync(path.join(path.resolve(currDir), "translations.json"))));
                    }
                    var pathChildren;
                    // Load large text translations in translations subdirectory, if it exists
                    var translationPath = path.join(currDir, "translations");
                    if (fs.existsSync(translationPath) && fs.statSync(translationPath).isDirectory()) {
                        // Get all children in the translations directory
                        pathChildren = fs.readdirSync(translationPath);
                        // Filter out all non-default translations (the ones without a lang type)
                        pathChildren.filter(function (child) {
                            return !/^.*\..*\..*/.test(child);
                            // And map these default translations into an object containing the variable name to use,
                            // the default text, and an array of translations for this text
                        }).map(function (child) {
                            return {
                                name: child.replace(/\..*$/, ""),
                                defaultText: fs.readFileSync(path.join(translationPath, child), 'utf8'),
                                // To make the array of translations for this default translation, filter out
                                // all files that do not start with the primary translation filename (minus extension), with a special
                                // case to filter out the primary translation, as well
                                translations: pathChildren.filter(function (secondChild) {
                                    return new RegExp("^" + child.replace(/\..*$/, "")).test(secondChild) && child !== secondChild;
                                    // Then map this array of files into an object containing the language specified
                                    // and the translation text for this language
                                }).map(function (secondChild) {
                                    return {
                                        lang: secondChild.replace(/\.[^\.]*$/, "").replace(/^[^\.]*\./, ""),
                                        text: fs.readFileSync(path.join(translationPath, secondChild), 'utf8')
                                    };
                                })
                            };
                            // For each of these long-form translation objects, add the default text to the strings object using the
                            // desired variable name, and create a translation object for all defined languages for this text.
                        }).forEach(function (translation) {
                            strings[translation.name] = translation.defaultText;
                            translations[translation.defaultText] = {};
                            translation.translations.forEach(function (lang) {
                                translations[translation.defaultText][lang.lang] = lang.text;
                            });
                        });
                    }
                    // Recurse down each directory and get the translations for that directory
                    pathChildren = fs.readdirSync(currDir);
                    /* jshint forin: false */
                    for (var child in pathChildren) {
                        var childPath = path.resolve(path.join(currDir, pathChildren[child]));
                        if (fs.statSync(childPath).isDirectory()) {
                            var tempArray = getTranslations(childPath, translations, strings);
                            translations = tempArray[0];
                            strings = tempArray[1];
                        }
                    }
                } else {
                    throw new Error("Translation Path Invalid");
                }
                return [translations, strings];
            }

            // ## The *validateTranslations* function
            // determines whether or not the provided JSON object is in a valid
            // format for ``localize``.
            function validateTranslations(newTranslations) {
                if ((typeof newTranslations === "undefined" ? "undefined" : _typeof(newTranslations)) !== "object") {
                    return false;
                }
                /* jshint forin: false */
                for (var translation in newTranslations) {
                    if (typeof translation !== "string") {
                        return false;
                    }
                    if (_typeof(newTranslations[translation]) !== "object") {
                        return false;
                    }
                    for (var lang in newTranslations[translation]) {
                        if (typeof lang !== "string") {
                            return false;
                        }
                        if (typeof newTranslations[translation][lang] !== "string") {
                            return false;
                        }
                    }
                }
                return true;
            }

            // ## The *loadTranslations* function
            // takes a string or object, and attempts to append the specified translation
            // to its store of translations, either by loading all translations from the
            // specified directory (string), or appending the object directly.
            this.loadTranslations = function (newTranslations) {
                if (typeof newTranslations === "string") {
                    var tempArray = getTranslations(newTranslations, {}, this.strings);
                    newTranslations = tempArray[0];
                    this.strings = tempArray[1];
                }
                if (validateTranslations(newTranslations)) {
                    translations = mergeObjs(translations, newTranslations);
                } else {
                    throw new Error("Must provide a valid set of translations.");
                }
            };

            // Now that we have the infrastructure in place, let's verify that the
            // provided translations are valid.
            this.loadTranslations(translations);

            // ## The *clearTranslations* function
            // simply resets the translations variable to a clean slate.
            this.clearTranslations = function () {
                translations = {};
            };

            // ## The *getTranslations* function
            // simply returns the entire translations object, or returns that portion
            // of translations matched by the elements of a provided array of text to
            // translate
            this.getTranslations = function (textArr) {
                if (textArr instanceof Array) {
                    var outObj = {};
                    textArr.forEach(function (text) {
                        outObj[text] = translations[text];
                    });
                    return outObj;
                } else {
                    return translations;
                }
            };

            // ## The *throwOnMissingTranslation* function
            // lets the user decide if a missing translation should cause an Error
            // to be thrown. Turning it off for development and on for testing is
            // recommended. The function coerces whatever it receives into a bool.
            this.throwOnMissingTranslation = function (shouldThrow) {
                missingTranslationThrow = !!shouldThrow;
            };

            // ## The *buildString* function
            // is a string-building function inspired by both ``sprintf`` and
            // [jQuery Templates](http://api.jquery.com/category/plugins/templates/)
            // and a small helping of RegExp. The first argument to buildString is
            // the source string, which has special ``$[x]`` blocks, where ``x`` is
            // a number from 1 to Infinity, matching the nth argument provided.
            // Because of ``.toString()``, string formatting _a la_ ``sprintf`` is
            // avoided, and the numeric identification allows the same parameter to
            // be used multiple times, and the parameter order need not match the
            // string referencing order (important for translations)
            function buildString() {
                var outString = arguments[0];
                for (var i = 1; i < arguments.length; i++) {
                    outString = outString.replace(new RegExp("\\$\\[" + i + "\\]", "g"), arguments[i]);
                }
                return outString;
            }

            // ## The *translate* function
            // is a thin automatic substitution wrapper around ``buildString``. In
            // fact, it short-circuits to ``buildString`` when ``locale`` equals
            // ``defaultLocale``. Otherwise, it looks up the required translated
            // string and executes ``buildString`` on that, instead
            this.translate = function () {
                if (locale === defaultLocale) {
                    return buildString.apply(this, arguments);
                }
                var newText = translations[arguments[0]] && translations[arguments[0]][locale] ? translations[arguments[0]][locale] : null;
                if (missingTranslationThrow && typeof newText !== "string") {
                    throw new Error("Could not find translation for '" + arguments[0] + "' in the " + locale + " locale");
                } else if (typeof newText !== "string") {
                    newText = arguments[0];
                }
                var newArr = Array.prototype.splice.call(arguments, 1, arguments.length - 1);
                newArr.unshift(newText);
                return buildString.apply(this, newArr);
            };

            // ## The *validateDateFormats* function
            // determines whether or not the provided dateFormat object conforms to
            // the necessary structure
            function validateDateFormats(dateFormats) {
                if ((typeof dateFormats === "undefined" ? "undefined" : _typeof(dateFormats)) !== "object") {
                    return false;
                }
                /* jshint forin: false */
                for (var lang in dateFormats) {
                    if (typeof lang !== "string") {
                        return false;
                    }
                    if (_typeof(dateFormats[lang]) !== "object") {
                        return false;
                    }
                    if (!(dateFormats[lang].dayNames instanceof Array)) {
                        return false;
                    }
                    if (!(dateFormats[lang].monthNames instanceof Array)) {
                        return false;
                    }
                    if (_typeof(dateFormats[lang].masks) !== "object") {
                        return false;
                    }
                    if (typeof dateFormats[lang].masks["default"] !== "string") {
                        return false;
                    }
                    if (dateFormats[lang].dayNames.length !== 14) {
                        return false;
                    }
                    if (dateFormats[lang].monthNames.length !== 24) {
                        return false;
                    }
                    for (var i = 0; i < 24; i++) {
                        if (i < 14 && typeof dateFormats[lang].dayNames[i] !== "string") {
                            return false;
                        }
                        if (typeof dateFormats[lang].monthNames[i] !== "string") {
                            return false;
                        }
                    }
                }
                return true;
            }

            // ## The *loadDateFormats* function
            // appends the provided ``dateFormats`` object, if valid, to the current
            // ``dateFormats`` object. Otherwise, it throws an error.
            this.loadDateFormats = function (newDateFormats) {
                if (validateDateFormats(newDateFormats)) {
                    dateFormats = mergeObjs(dateFormats, newDateFormats);
                } else {
                    throw new Error("Invalid Date Format provided");
                }
            };

            // ## The *clearDateFormats* function
            // resets the ``dateFormats`` object to English dates.
            this.clearDateFormats = function () {
                dateFormats = {
                    "en": {
                        dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                        monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                        masks: {
                            "default": "ddd mmm dd yyyy HH:MM:ss",
                            shortDate: "m/d/yy",
                            mediumDate: "mmm d, yyyy",
                            longDate: "mmmm d, yyyy",
                            fullDate: "dddd, mmmm d, yyyy",
                            shortTime: "h:MM TT",
                            mediumTime: "h:MM:ss TT",
                            longTime: "h:MM:ss TT Z",
                            isoDate: "yyyy-mm-dd",
                            isoTime: "HH:MM:ss",
                            isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
                            isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
                        }
                    }
                };
            };

            // ## The *getDateFormats* function
            // returns the currently-defined ``dateFormats`` object
            this.getDateFormats = function () {
                return dateFormats;
            };

            // Now that we have the infrastructure in place, let's validate the
            // optional ``dateFormats`` object if provided, or initialize it.
            if (validateDateFormats(dateFormats)) {
                this.loadDateFormats(dateFormats);
            } else {
                this.clearDateFormats();
            }

            // The *localDate* function
            // provides easy-to-use date localization support. Based heavily on
            // [node-dateFormat](https://github.com/felixge/node-dateformat) by
            // Steven Levithan <stevenlevithan.com>
            // Scott Trenda <scott.trenda.net>
            // Kris Kowal <cixar.com/~kris.kowal/>
            // Felix Geisendörfer <debuggable.com>
            // MIT Licensed, as with this library. The resultant API is one where
            // a date string or object is the first argument, a mask string (being
            // either a key in the ``masks`` object or an arbitrary mask is the
            // second argument, and a third is a bool flag on whether local or UTC
            // time should be used.
            this.localDate = function () {
                var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
                    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
                    timezoneClip = /[^-+\dA-Z]/g,
                    pad = function pad(val, len) {
                    val = String(val);
                    len = len || 2;
                    while (val.length < len) {
                        val = "0" + val;
                    }return val;
                };

                // Regexes and supporting functions are cached through closure
                return function (date, mask, utc) {
                    // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
                    if (arguments.length === 1 && Object.prototype.toString.call(date) === "[object String]" && !/\d/.test(date)) {
                        mask = date;
                        date = undefined;
                    }

                    date = date || new Date();

                    if (!(date instanceof Date)) {
                        date = new Date(date);
                    }

                    if (isNaN(date)) {
                        throw new TypeError("Invalid date");
                    }

                    mask = String(dateFormats[locale].masks[mask] || mask || dateFormats[locale].masks["default"]);

                    // Allow setting the utc argument via the mask
                    if (mask.slice(0, 4) === "UTC:") {
                        mask = mask.slice(4);
                        utc = true;
                    }

                    var _ = utc ? "getUTC" : "get",
                        d = date[_ + "Date"](),
                        D = date[_ + "Day"](),
                        m = date[_ + "Month"](),
                        y = date[_ + "FullYear"](),
                        H = date[_ + "Hours"](),
                        M = date[_ + "Minutes"](),
                        s = date[_ + "Seconds"](),
                        L = date[_ + "Milliseconds"](),
                        o = utc ? 0 : date.getTimezoneOffset(),
                        flags = {
                        d: d,
                        dd: pad(d),
                        ddd: dateFormats[locale].dayNames[D],
                        dddd: dateFormats[locale].dayNames[D + 7],
                        m: m + 1,
                        mm: pad(m + 1),
                        mmm: dateFormats[locale].monthNames[m],
                        mmmm: dateFormats[locale].monthNames[m + 12],
                        yy: String(y).slice(2),
                        yyyy: y,
                        h: H % 12 || 12,
                        hh: pad(H % 12 || 12),
                        H: H,
                        HH: pad(H),
                        M: M,
                        MM: pad(M),
                        s: s,
                        ss: pad(s),
                        l: pad(L, 3),
                        L: pad(L > 99 ? Math.round(L / 10) : L),
                        t: H < 12 ? "a" : "p",
                        tt: H < 12 ? "am" : "pm",
                        T: H < 12 ? "A" : "P",
                        TT: H < 12 ? "AM" : "PM",
                        Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                        o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                        S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
                    };

                    return mask.replace(token, function ($0) {
                        return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
                    });
                };
            }();

            return this;
        }

        Localize.source = Localize.toString();
        module.exports = Localize;
    }, { "fs": 1, "path": 2 }], 7: [function (require, module, exports) {
        var Auth = require('../models/Auth.js');
        var Conf = require('../config/Config.js');

        module.exports = {

            controller: function controller() {
                var ctrl = this;
            },

            view: function view(ctrl) {
                return { tag: "header", attrs: { id: "top-nav" }, children: [{ tag: "div", attrs: { class: "topbar-main" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "a", attrs: { href: "/", config: m.route, class: "logo" }, children: [{ tag: "img", attrs: { src: "/assets/img/" + Conf.tr("logo-image") + ".svg", alt: "" } }] }, { tag: "div", attrs: { class: "menu-extras" }, children: [{ tag: "div", attrs: { class: "text-right flags" }, children: [{ tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ua'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/ua.png", alt: "UA" } }] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'en'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/uk.png", alt: "EN" } }] }] }] }] }] }] };
            }
        };
    }, { "../config/Config.js": 12, "../models/Auth.js": 16 }], 8: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Session = require('../models/Session.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                window.addEventListener('keydown', function (e) {
                    if (e.keyCode == 27) {
                        if (Session.modalMessage()) {
                            Session.closeModal();
                            m.redraw();
                        }
                    }
                });
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: {}, children: [Session.modalMessage() ? m('div#session-modal', {
                        style: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            padding: '7.5%',
                            paddingLeft: 0,
                            paddingRight: 0,
                            background: 'rgba(0, 0, 0, 0.75)',
                            zIndex: 9999,
                            width: '100%',
                            height: '100%'
                        }
                    }, [m(".row", [m(".col-md-4.col-md-offset-4", [[m(".portlet", [m(".portlet-heading.bg-primary", { style: { borderRadius: 0 } }, [m("h3.portlet-title", Session.modalTitle()), m(".portlet-widgets", [m("a[href='#']", {
                        onclick: function onclick(e) {
                            e.preventDefault();Session.closeModal();
                        }
                    }, [m("i.ion-close-round")])]), m(".clearfix")]), m(".portlet-body", { style: { wordWrap: 'break-word' } }, Session.modalMessage())])]]), m(".clearfix")])]) : '', { tag: "div", attrs: { class: "footer-wrap footer-sticky" }, children: [{ tag: "footer", attrs: {}, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-sm-4 col-md-3 col-md-offset-1 col-lg-3 col-lg-offset-2" }, children: [{ tag: "section", attrs: { class: "widget" }, children: [{ tag: "div", attrs: { class: "widget-heading" }, children: [{ tag: "h4", attrs: {}, children: [Conf.tr("Contacts")] }] }, { tag: "div", attrs: { class: "footer-contact-info" }, children: [{ tag: "ul", attrs: {}, children: [{ tag: "li", attrs: {}, children: [{ tag: "p", attrs: {}, children: [{ tag: "i", attrs: { class: "fa fa-building" } }, " ", { tag: "a", attrs: { href: "https://bank.gov.ua/control/uk/publish/article?art_id=75431&cat_id=36046" }, children: [Conf.tr("The National Bank of Ukraine")] }] }] }, { tag: "li", attrs: {}, children: [{ tag: "p", attrs: {}, children: [{ tag: "i", attrs: { class: "fa fa-map-marker" } }, " ", Conf.tr("9 Instytutska St., 01601 Kyiv")] }] }, { tag: "li", attrs: {}, children: [{ tag: "p", attrs: {}, children: [{ tag: "i", attrs: { class: "fa fa-envelope" } }, " ", { tag: "a", attrs: { href: "mailto:prostir@bank.gov.ua", style: "color: #71cbee;" }, children: ["prostir@bank.gov.ua"] }] }] }] }] }] }] }, { tag: "div", attrs: { class: "col-sm-8 col-md-6 col-md-offset-1 col-lg-5 col-lg-offset-0" }, children: [{ tag: "p", attrs: {}, children: [Conf.tr("The website is for information only. The National Bank of Ukraine is not responsible for possible consequences resulting from the use of information on the website. The National Bank of Ukraine owns the copyright to the materials posted on the website, unless otherwise expressly stated in the text. The materials can be used for further dissemination only with prior consent of the National Bank of Ukraine and with reference to the source. All changes and amendments to such information can be made only with the National Bank of Ukraine’s prior consent.")] }] }] }] }] }, { tag: "div", attrs: { class: "footer-bottom" }, children: [{ tag: "div", attrs: { class: "container text-center" }, children: ["2016 © ", Conf.tr("Made by"), " ", { tag: "a", attrs: { href: "http://atticlab.net/" }, children: ["AtticLab"] }] }] }] }] };
            }
        };
    }, { "../config/Config.js": 12, "../models/Session.js": 18 }], 9: [function (require, module, exports) {
        var Auth = require('../models/Auth.js');
        var Conf = require('../config/Config.js');
        var Helpers = require('../models/Helpers.js');

        module.exports = {

            controller: function controller() {
                var ctrl = this;
                this.ttl = m.prop(false);
                this.css_class = m.prop('');

                this.refreshPage = function () {
                    m.route(m.route());
                };

                var spinner_interval = setInterval(function () {
                    var ttl = Auth.api().getNonceTTL();
                    var time_live = Auth.api().getTimeLive();
                    if (ttl <= 1) {
                        Auth.destroySession();
                        clearInterval(spinner_interval);
                    }

                    var percent = Math.round(100 - ttl * 100 / time_live);
                    var css_class = "c100 p" + percent + " small small-cust green";
                    document.getElementById('spinner-progress').className = css_class;
                    document.getElementById('spinner-time').innerHTML = Helpers.getTimeFromSeconds(ttl);
                }, 1000);

                // check that it runs only once
                this.updateTTL = function () {
                    Auth.api().initNonce().then(function (ttl) {});
                };

                this.initSpinner = function () {
                    var ttl = Auth.ttl();
                    var css_class = "0";
                    m.startComputation();
                    ctrl.ttl(ttl);
                    ctrl.css_class(css_class);
                    m.endComputation();
                };

                this.initSpinner();

                this.visible = m.prop(false);

                this.toggleVisible = function () {
                    this.visible(!this.visible());

                    if (this.visible()) {
                        $('#mobile-spec-menu').css('max-height', $(window).height() - $('.topbar-main').height());
                    }
                };
            },

            view: function view(ctrl) {
                return { tag: "header", attrs: { id: "topnav" }, children: [{ tag: "div", attrs: { class: "topbar-main" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "a", attrs: { href: "/", config: m.route, class: "logo" }, children: [{ tag: "img", attrs: { src: "/assets/img/" + Conf.tr("logo-image") + ".svg", alt: "" } }] }, { tag: "div", attrs: { id: "navigation", style: ctrl.visible() ? 'display:block;' : '' }, children: [{ tag: "ul", attrs: { class: "navigation-menu", id: "mobile-spec-menu" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "/", config: m.route }, children: [{ tag: "i", attrs: { class: "fa fa-th" } }, Conf.tr("Dashboard")] }] }, { tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "/payments", config: m.route }, children: [{ tag: "i", attrs: { class: "fa fa-list" } }, Conf.tr("Payments")] }] }, { tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "/transfer", config: m.route }, children: [{ tag: "i", attrs: {
                                                    class: "fa fa-money" } }, Conf.tr("Transfer money")] }] }, { tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "/invoice", config: m.route }, children: [{ tag: "i", attrs: { class: "fa fa-credit-card" } }, Conf.tr("Create invoice")] }] }, Auth.username() ? { tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "/settings", config: m.route }, children: [{ tag: "i", attrs: { class: "fa fa-cogs" } }, Conf.tr("Settings")] }] } : '', { tag: "li", attrs: { class: "visible-xs" }, children: [{ tag: "a", attrs: { href: "#", style: "color: #000", onclick: Auth.logout }, children: [{ tag: "i", attrs: { class: "fa fa-power-off m-r-5" } }, Conf.tr("Logout")] }] }] }] }, { tag: "div", attrs: { class: "menu-extras" }, children: [{ tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs text-inverse" }, children: [{ tag: "li", attrs: { class: "flags" }, children: [{ tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ua'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/ua.png", alt: "UA" } }] }] }, { tag: "li", attrs: { class: "flags" }, children: [{ tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'en'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/uk.png", alt: "EN" } }] }] }, { tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "#", onclick: Auth.logout }, children: [{ tag: "i", attrs: { class: "fa fa-power-off m-r-5" } }, Conf.tr("Logout")] }] }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "#", onclick: ctrl.updateTTL.bind(ctrl), title: Conf.tr('Time to end the session') }, children: [{ tag: "div", attrs: { id: "spinner-progress", class: "c100 small small-cust green p" + ctrl.css_class() }, children: [{ tag: "span", attrs: { id: "spinner-time" }, children: [!ctrl.ttl() ? '' : Helpers.getTimeFromSeconds(ctrl.ttl())] }, { tag: "div", attrs: { class: "slice" }, children: [{ tag: "div", attrs: { class: "bar" } }, { tag: "div", attrs: { class: "fill" } }] }] }] }] }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "button", attrs: { class: "refresh btn btn-icon waves-effect waves-light btn-purple m-b-5",
                                                onclick: ctrl.refreshPage.bind(ctrl) }, children: [" ", { tag: "i", attrs: { class: "fa fa-refresh" } }, " "] }] }] }, { tag: "div", attrs: { class: "menu-item" }, children: [{ tag: "a", attrs: { onclick: ctrl.toggleVisible.bind(ctrl),
                                            class: ctrl.visible() ? 'open navbar-toggle' : 'navbar-toggle' }, children: [{ tag: "div", attrs: { class: "lines" }, children: [{ tag: "span", attrs: {} }, { tag: "span", attrs: {} }, { tag: "span", attrs: {} }] }] }] }] }] }] }] };
            }
        };
    }, { "../config/Config.js": 12, "../models/Auth.js": 16, "../models/Helpers.js": 17 }], 10: [function (require, module, exports) {
        var Auth = require('../models/Auth.js');
        var Conf = require('../config/Config.js');
        var DateFormat = require('dateformat');

        module.exports = {
            controller: function controller() {},

            view: function view(ctrl, data) {
                return !data || !data.payments.length ? { tag: "p", attrs: { class: "text-primary" }, children: [Conf.tr("No payments yet")] } : { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "visible-xs" }, children: [data.payments.map(function (payment, index) {
                            var trans_link = payment._links.transaction.href;
                            var trans_id = trans_link.substr(trans_link.lastIndexOf('/') + 1);
                            var accountId = payment.to == Auth.keypair().accountId() ? payment.from : payment.to;
                            //The reason for send an amount and asset code instead of payment id is that there is
                            //no method in SDK to get payment by id.
                            var trans_url = '/transaction/' + trans_id + '/' + accountId + '/' + payment.amount;
                            return { tag: "div", attrs: { class: "payment" }, children: [{ tag: "a", attrs: { class: "account_overflow", href: trans_url, config: m.route,
                                        title: accountId }, children: [accountId] }, { tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-xs-7" }, children: [{ tag: "p", attrs: { class: "text-muted" }, children: [DateFormat(payment.closed_at, 'dd.mm.yyyy HH:MM:ss')] }] }, { tag: "div", attrs: { class: "col-xs-5 text-right" }, children: [payment.to == Auth.keypair().accountId() ? { tag: "span", attrs: { class: "label label-success" }, children: [{ tag: "i", attrs: { class: "fa fa-sign-in fa-fw",
                                                    "aria-hidden": "true" } }, " ", parseFloat(payment.amount).toFixed(2), " ", payment.asset_code] } : { tag: "span", attrs: { class: "label label-danger" }, children: [{ tag: "i", attrs: { class: "fa fa-sign-out fa-fw",
                                                    "aria-hidden": "true" } }, " ", parseFloat(payment.amount).toFixed(2), " ", payment.asset_code] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] };
                        })] }, { tag: "div", attrs: { class: "hidden-xs" }, children: [{ tag: "table", attrs: { class: "table table-bordered" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Account id")] }, { tag: "th", attrs: {}, children: [Conf.tr("Date")] }, { tag: "th", attrs: {}, children: [Conf.tr("Amount")] }, { tag: "th", attrs: {}, children: [Conf.tr("Type")] }] }] }, { tag: "tbody", attrs: {}, children: [data.payments.map(function (payment) {
                                    var trans_link = payment._links.transaction.href;
                                    var trans_id = trans_link.substr(trans_link.lastIndexOf('/') + 1);
                                    var accountId = payment.to == Auth.keypair().accountId() ? payment.from : payment.to;
                                    //The reason for send an amount and asset code instead of payment id is that there is
                                    //no method in SDK to get payment by id.
                                    var trans_url = '/transaction/' + trans_id + '/' + accountId + '/' + payment.amount;
                                    return { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: { class: "account-td" }, children: [{ tag: "a", attrs: { class: "account_overflow", href: trans_url, config: m.route }, children: [accountId] }] }, { tag: "td", attrs: {}, children: [DateFormat(payment.closed_at, 'dd.mm.yyyy HH:MM:ss')] }, { tag: "td", attrs: {}, children: [parseFloat(payment.amount).toFixed(2), " ", payment.asset_code] }, { tag: "td", attrs: {}, children: [payment.to == Auth.keypair().accountId() ? { tag: "span", attrs: { class: "label label-payment label-success" }, children: [{ tag: "i", attrs: { class: "fa fa-sign-in fa-fw", "aria-hidden": "true" } }, " ", Conf.tr("Debit")] } : { tag: "span", attrs: { class: "label label-payment label-danger" }, children: [{ tag: "i", attrs: { class: "fa fa-sign-out fa-fw", "aria-hidden": "true" } }, " ", Conf.tr("Credit")] }] }] };
                                })] }] }] }] };
            }
        };
    }, { "../config/Config.js": 12, "../models/Auth.js": 16, "dateformat": 4 }], 11: [function (require, module, exports) {
        var Auth = require('../models/Auth.js');
        var Conf = require('../config/Config.js');
        var AuthNavbar = require('../components/AuthNavbar.js');

        var LAST_WIZARD_STAGE = 2;
        var WORDS_PER_PAGE = 4;

        var Wizard = module.exports = {
            controller: function controller() {
                var ctrl = this;
                this.mnemoWizardStage = m.prop(0);
                this.wordsPage = m.prop(0);
                this.randomWords = m.prop(new Array());
                this.checkWords = m.prop(Array.apply(null, Array(WORDS_PER_PAGE)).map(String.prototype.valueOf, ''));
                this.isSuccess = m.prop(false);
                this.nextDisabled = m.prop(false);

                this.doWordsStep = function (max, dir, e) {
                    e.preventDefault();
                    var newPage = ctrl.wordsPage() + dir;
                    m.startComputation();
                    if (newPage >= 0 && newPage < max) {
                        ctrl.wordsPage(newPage);
                    }
                    if (ctrl.wordsPage() == max - 1) {
                        ctrl.nextDisabled(false);
                    }
                    m.endComputation();
                };

                this.getUniqueRandomIndex = function (length, randomWords) {
                    var rndIndex = Math.floor(Math.random() * length);
                    if (randomWords.find(function (element) {
                        return element.index == rndIndex;
                    })) {
                        return this.getUniqueRandomIndex(length, randomWords);
                    }
                    return rndIndex;
                };

                this.showWizardStage = function (ctrl, data) {
                    switch (ctrl.mnemoWizardStage()) {
                        case 0:
                            return Wizard.view_wizard_stage_blank(ctrl);
                            break;
                        case 1:
                            return Wizard.view_wizard_stage_words(ctrl, data.phrase);
                            break;
                        case 2:
                            return Wizard.view_wizard_stage_check(ctrl, data.phrase);
                            break;
                        default:
                            return "";
                    }
                };

                this.doStep = function (dir, e) {
                    e.preventDefault();
                    var newStage = ctrl.mnemoWizardStage() + dir;
                    if (newStage >= 0 && newStage <= LAST_WIZARD_STAGE) {
                        m.startComputation();
                        if (!ctrl.nextDisabled() && dir == 1 || dir == -1) {
                            ctrl.nextDisabled(false);
                            ctrl.mnemoWizardStage(newStage);
                        }
                        m.endComputation();
                    }
                };

                this.setCheckWord = function (index, value) {
                    ctrl.checkWords()[index] = value;
                };

                this.complete = function (e) {
                    e.preventDefault();
                    try {
                        ctrl.checkWords().forEach(function (key, index) {
                            if (key.toLowerCase() != ctrl.randomWords()[index].word.toLowerCase()) {
                                throw Conf.tr('Bad word $[1]', ctrl.randomWords()[index].index + 1);
                            }
                        });
                    } catch (e) {
                        m.flashError(e);
                        return;
                    }
                    m.startComputation();
                    ctrl.isSuccess(true);
                    m.endComputation();
                };

                this.skip = function (e) {
                    e.preventDefault();

                    swal({
                        title: Conf.tr("Warning!"),
                        text: Conf.tr("Are you sure you want to skip the generation of mnemonic phrase? Without it, you will not be able to recover access to your funds in case of lost password"),
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: Conf.tr("Yes, skip it"),
                        cancelButtonText: Conf.tr("Cancel"),
                        allowOutsideClick: true,
                        closeOnConfirm: true,
                        html: false
                    }, function () {
                        m.route('/home');
                    });
                };
            },

            view: function view(ctrl, data) {
                if (ctrl.isSuccess()) return Wizard.view_success();
                return { tag: "div", attrs: {}, children: [m.component(AuthNavbar), { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-12" }, children: [{ tag: "div", attrs: { class: "panel panel-color m-b-0" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title unselectable" }, children: [Conf.tr("Mnemonic phrase generation")] }] }, { tag: "form", attrs: { role: "form", onsubmit: ctrl.complete.bind(ctrl) }, children: [ctrl.showWizardStage(ctrl, data)] }] }] }] }] }] };
            },

            view_wizard_stage_blank: function view_wizard_stage_blank(ctrl) {
                return { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "tab-pane m-t-10 fade in", id: "tab1" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: _defineProperty({ class: "form-group clearfix" }, "class", "col-md-12"), children: [{ tag: "div", attrs: {}, children: [{ tag: "p", attrs: { class: "text-danger" }, children: [{ tag: "span", attrs: { class: "dropcap text-danger" }, children: ["!"] }, Conf.tr("Warning! Store your mnemonic phrase in a safe and private place. We do not recommend storing it on your computer or online. Anyone who has your mnemonic phrase will be able to get access to your funds.")] }] }] }] }, { tag: "div", attrs: { class: "row m-t-15" }, children: [{ tag: "div", attrs: _defineProperty({ class: "form-group clearfix" }, "class", "col-md-12"), children: [{ tag: "p", attrs: { class: "text-success" }, children: [Conf.tr("For your safety, print the blank phrase sheet and write your mnemonic phrase in it")] }] }] }, { tag: "div", attrs: { class: "row m-t-15" }, children: [{ tag: "div", attrs: { class: "form-group clearfix col-md-12 text-center" }, children: [{ tag: "a", attrs: { class: "btn btn-success waves-effect waves-light",
                                            href: Conf.loc.userLanguage === 'en' ? "/assets/data/mnemonic-en.pdf" : "/assets/data/mnemonic-ua.pdf",
                                            download: "mnemonic.pdf" }, children: [" ", Conf.tr("Download")] }] }] }] }] }, { tag: "div", attrs: { class: "panel-footer" }, children: [{ tag: "button", attrs: {
                                class: "btn btn-warning waves-effect waves-light",
                                onclick: ctrl.skip.bind(ctrl) }, children: [Conf.tr("Skip")] }, { tag: "button", attrs: {
                                class: "btn btn-primary waves-effect waves-light pull-right",
                                onclick: ctrl.doStep.bind(ctrl, 1) }, children: [Conf.tr("Next")] }] }] };
            },

            view_wizard_stage_words: function view_wizard_stage_words(ctrl, data) {
                var mnemonic = data.split(" ");
                var pages = Math.round(mnemonic.length / WORDS_PER_PAGE);
                m.startComputation();
                if (ctrl.wordsPage() != pages - 1) ctrl.nextDisabled(true);
                m.endComputation();
                return { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "tab-pane m-t-10 fade in", id: "tab2" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-12" }, children: [{ tag: "p", attrs: {}, children: [{ tag: "i", attrs: { class: "fa fa-pencil m-r-5" } }, Conf.tr("Use a pen to legibly write down the following $[1] words onto your printed phrase sheet. It is important that you write down the words exactly as they appear here and in this order.", mnemonic.length)] }] }] }, { tag: "div", attrs: { class: "row m-t-15" }, children: [mnemonic.map(function (word, index) {
                                    if (index >= ctrl.wordsPage() * WORDS_PER_PAGE && index < ctrl.wordsPage() * WORDS_PER_PAGE + WORDS_PER_PAGE) return { tag: "div", attrs: { class: "col-lg-6" }, children: [index + 1, ". ", { tag: "b", attrs: {}, children: [word] }] };
                                })] }] }] }, { tag: "div", attrs: { class: "panel-footer" }, children: [ctrl.wordsPage() < 1 ? { tag: "button", attrs: { class: "btn btn-default waves-effect waves-light",
                                onclick: ctrl.doStep.bind(ctrl, -1) }, children: [Conf.tr("Back")] } : { tag: "button", attrs: {
                                class: "btn btn-default waves-effect waves-light",
                                onclick: ctrl.doWordsStep.bind(ctrl, pages, -1) }, children: [Conf.tr("Back")] }, ctrl.wordsPage() >= pages - 1 ? { tag: "button", attrs: { class: "btn btn-success waves-effect waves-light pull-right",
                                onclick: ctrl.doStep.bind(ctrl, 1) }, children: [Conf.tr("Next")] } : { tag: "button", attrs: {
                                class: "btn btn-primary waves-effect waves-light pull-right",
                                onclick: ctrl.doWordsStep.bind(ctrl, pages, 1) }, children: [Conf.tr("Next")] }] }] };
            },

            view_wizard_stage_check: function view_wizard_stage_check(ctrl, data) {
                var mnemonic = data.split(" ");
                var rndIndex = 0;
                if (!ctrl.randomWords().length) {
                    var randomWords = [];
                    for (var i = 0; i < WORDS_PER_PAGE; i++) {
                        rndIndex = ctrl.getUniqueRandomIndex(mnemonic.length, randomWords);
                        randomWords[i] = {
                            index: rndIndex,
                            word: mnemonic[rndIndex]
                        };
                    }
                    randomWords.sort(function (a, b) {
                        return a.index > b.index;
                    });
                    ctrl.randomWords(randomWords);
                }
                return { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "tab-pane m-t-10 fade in", id: "tab3" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-12" }, children: [{ tag: "p", attrs: {}, children: [Conf.tr("Using the completed phrase sheet as a reference, please enter the following words from your mnemonic phrase to complete the registration process.")] }] }] }, { tag: "div", attrs: { class: "form-group clearfix m-t-10" }, children: [{ tag: "div", attrs: { class: "form-horizontal" }, children: [ctrl.randomWords().map(function (data, index) {
                                        return { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { class: "col-md-1 control-label text-right" }, children: [data.index + 1, "."] }, { tag: "div", attrs: { class: "col-md-11" }, children: [{ tag: "input", attrs: { type: "text", class: "form-control phrase-control",
                                                        name: "words",
                                                        id: "word_" + index,
                                                        tabindex: index + 1,
                                                        onchange: m.withAttr("value", ctrl.setCheckWord.bind(ctrl, index)) }
                                                }] }] };
                                    })] }] }] }] }, { tag: "div", attrs: { class: "panel-footer" }, children: [{ tag: "button", attrs: {
                                class: 'btn btn-default waves-effect waves-light' + (ctrl.mnemoWizardStage() < 1 ? ' disabled' : ''),
                                onclick: ctrl.doStep.bind(ctrl, -1) }, children: [Conf.tr("Back")] }, { tag: "button", attrs: { class: "btn btn-success waves-effect waves-light pull-right", type: "submit" }, children: [Conf.tr("Complete")] }] }] };
            },

            view_success: function view_success() {
                return { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "panel panel-color panel-success" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Registration successful")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "p", attrs: {}, children: [Conf.tr("Now you can recover your account with your mnemonic phrase.")] }, { tag: "br", attrs: {} }, { tag: "br", attrs: {} }, { tag: "a", attrs: { href: "/", config: m.route,
                                            class: "btn btn-success btn-custom waves-effect w-md waves-light m-b-5" }, children: [Conf.tr("Log in")] }] }] }] }] }] };
            }
        };
    }, { "../components/AuthNavbar.js": 7, "../config/Config.js": 12, "../models/Auth.js": 16 }], 12: [function (require, module, exports) {
        (function (process) {
            var Localize = require('localize');
            var Locales = require('../locales/translations.js');

            var conf = {
                master_key: "",
                horizon_host: "",
                keyserver_host: "",
                api_host: "",
                info_host: ""
            };

            conf.assets_url = 'assets';

            conf.phone = {
                view_mask: "+99 (999) 999-99-99",
                db_mask: "999999999999",
                length: 10,
                prefix: "+38"
            };

            conf.asset = 'EUAH';

            StellarSdk.Network.use(new StellarSdk.Network(""));
            conf.horizon = new StellarSdk.Server(conf.horizon_host);
            conf.locales = Locales;

            conf.payments = {
                onpage: 10
            };

            conf.loc = new Localize(conf.locales);
            conf.loc.throwOnMissingTranslation(false);
            conf.loc.userLanguage = localStorage.getItem('locale') ? localStorage.getItem('locale') : (navigator.language || navigator.userLanguage).toLowerCase().split('-')[0];
            conf.loc.setLocale(conf.loc.userLanguage);
            conf.mnemonic = { langsList: ['eng', 'ukr'] };
            conf.mnemonic.locale = conf.loc.userLanguage == 'en' ? 'eng' : 'ukr';
            conf.mnemonic.totalWordsCount = 24;
            conf.loc.changeLocale = function (locale, e) {
                e.preventDefault();
                m.startComputation();
                conf.loc.setLocale(locale);
                conf.mnemonic.locale = locale == 'en' ? 'eng' : 'ukr';
                localStorage.setItem('locale', locale);
                m.endComputation();
            };
            conf.tr = conf.loc.translate; //short alias for translation

            var Config = module.exports = conf;
        }).call(this, require("rH1JPG"));
    }, { "../locales/translations.js": 15, "localize": 6, "rH1JPG": 3 }], 13: [function (require, module, exports) {
        var errors = {
            assets_get_fail: 'Failed to get anonymous assets from horizon',
            assets_empty: 'List of assets is empty',
            assets_get_timeout: 'Request to horizon exceeded timeout time'
        };

        var Errors = module.exports = errors;
    }, {}], 14: [function (require, module, exports) {
        var Conf = require('./config/Config.js');

        // Loading spinner
        m.onLoadingStart = function () {
            document.getElementById('spinner').style.display = 'block';
        };
        m.onLoadingEnd = function () {
            document.getElementById('spinner').style.display = 'none';
        };

        // Wrapper for notification which stops animation
        m.flashError = function (msg) {
            m.onLoadingEnd();
            $.Notification.notify('error', 'top center', Conf.tr("Error"), msg);
        };
        m.flashApiError = function (err) {
            if (err && typeof err.message != 'undefined' && err.message == 'Invalid signature') {
                window.location.href = '/';
                return;
            }
            m.onLoadingEnd();
            var msg = err.message ? Conf.tr(err.message) + (err.description ? ': ' + Conf.tr(err.description) : '') : Conf.tr('Unknown error. Contact support');
            $.Notification.notify('error', 'top center', Conf.tr("Error"), msg);
        };
        m.flashSuccess = function (msg) {
            m.onLoadingEnd();
            $.Notification.notify('success', 'top center', Conf.tr("Success"), msg);
        };

        // Routing
        m.route.mode = 'pathname';
        m.route(document.getElementById('app'), "/", {
            "/": require('./pages/Login.js'),
            "/home": require('./pages/Home.js'),
            "/logout": require('./pages/Logout.js'),
            "/invoice": require('./pages/Invoice.js'),
            "/sign": require('./pages/Sign.js'),
            "/transfer": require('./pages/Transfer.js'),
            "/settings": require('./pages/Settings.js'),
            //"/hd": require('./pages/Hd.js'),
            "/transaction/:trans_id/:target_acc/:amount": require('./pages/Transaction.js'),
            "/payments": require('./pages/Payments.js'),
            "/recovery": require('./pages/Recovery.js')
        });
    }, { "./config/Config.js": 12, "./pages/Home.js": 19, "./pages/Invoice.js": 20, "./pages/Login.js": 21, "./pages/Logout.js": 22, "./pages/Payments.js": 23, "./pages/Recovery.js": 24, "./pages/Settings.js": 25, "./pages/Sign.js": 26, "./pages/Transaction.js": 27, "./pages/Transfer.js": 28 }], 15: [function (require, module, exports) {
        var _module$exports;

        module.exports = (_module$exports = {
            "Dashboard": {
                'en': "Dashboard",
                'ru': "Обзор",
                'ua': "Огляд"
            },
            "Transfer money": {
                'en': "Transfer money",
                'ru': "Перевод денег",
                'ua': "Переказ грошей"
            },
            "Create invoice": {
                'en': "Create invoice",
                'ru': "Создать инвойс",
                'ua': "Створити інвойс"
            },
            "Settings": {
                'en': "Settings",
                'ru': "Настройки",
                'ua': "Налаштування"
            },
            "Login": {
                'en': "Login",
                'ru': "Войти",
                'ua': "Увійти"
            },
            "Logout": {
                'en': "Logout",
                'ru': "Выход",
                'ua': "Вихід"
            },
            "Substitution: $[1]": {
                "es": "Sustitución: $[1]",
                "sr": "замена: $[1]"
            },
            "Bad code": {
                'en': "Bad code",
                'ru': "Неверный код",
                'ua': "Невірний код"
            },
            "Check value": {
                'en': "Check value",
                'ru': "Проверьте значение",
                'ua': "Перевірте значення"
            },
            "Welcome": {
                'en': "Welcome",
                'ru': "Добро пожаловать",
                'ua': "Вітаємо"
            },
            "Account info": {
                'en': "Account info",
                'ru': "Информация о счете",
                'ua': "Інформація про рахунок"
            },
            "Type": {
                'en': "Type",
                'ru': "Тип",
                'ua': "Тип"
            },
            "Balance": {
                'en': "Balance",
                'ru': "Баланс",
                'ua': "Баланс"
            },
            "Account transactions": {
                'en': "Account transactions",
                'ru': "Операции по счету",
                'ua': "Операції по рахунку"
            },
            "Overview of recent transactions": {
                'en': "Overview of recent transactions",
                'ru': "Обзор последних операций",
                'ua': "Огляд останніх операцій"
            },
            "Account id": {
                'en': "Account id",
                'ru': "Номер счета",
                'ua': "Номер рахунку"
            },
            "Amount": {
                'en': "Amount",
                'ru': "Сумма",
                'ua': "Сума"
            },
            "Asset": {
                'en': "Asset",
                'ru': "Валюта",
                'ua': "Валюта"
            },
            "Debit": {
                'en': "Debit",
                'ru': "Дебет",
                'ua': "Дебет"
            },
            "Credit": {
                'en': "Credit",
                'ru': "Кредит",
                'ua': "Кредит"
            },
            "Login/password combination is invalid": {
                'en': "Login/password combination is invalid",
                'ru': "Неверный логин или пароль",
                'ua': "Невірний логін або пароль"
            },
            "Connection error": {
                'en': "Connection error",
                'ru': "Ошибка подключения",
                'ua': "Помилка з'єднання"
            },
            "Username": {
                'en': "Username",
                'ru': "Логин",
                'ua': "Логін"
            },
            "Password": {
                'en': "Password",
                'ru': "Пароль",
                'ua': "Пароль"
            },
            "Retype Password": {
                'en': "Retype Password",
                'ru': "Повторите пароль",
                'ua': "Повторіть пароль"
            },
            "Create account": {
                'ru': "Создать аккаунт",
                'ua': "Створити аккаунт"
            },
            "Log in": {
                'en': "Log in",
                'ru': "Войти",
                'ua': "Увійти"
            },
            "Please, fill all required fields": {
                'en': "Please, fill all required fields",
                'ru': "Пожалуйста, заполните все обязательные поля",
                'ua': "Будь ласка, заповніть всі обов'язкові поля"
            },
            "Password should have 6 chars min": {
                'en': "Password should have 6 chars min",
                'ru': "Минимальная длина пароля - 6 символов",
                'ua': "Мінімальна довжина пароля - 6 символів"
            },
            "Login should have 3 chars min": {
                'ru': "Минимальная длина логина - 3 символа",
                'ua': "Мінімальна довжина логіну - 3 символи"
            },
            "Passwords should match": {
                'en': "Passwords should match",
                'ru': "Пароли должны совпадать",
                'ua': "Паролі повинні співпадати"
            },
            "Login already used": {
                'en': "Login already used",
                'ru': "Логин уже используется",
                'ua': "Логін вже використовується"
            },
            "Service error. Please contact support": {
                'en': "Service error. Please contact support",
                'ru': "Системная ошибка. Обратитесь в службу поддержки",
                'ua': "Системна помилка. Зверніться в службу підтримки"
            },
            "Registration successful": {
                'en': "Registration successful",
                'ru': "Регистрация прошла успешно",
                'ua': "Реєстрація пройшла успішно"
            },
            "Print this QR-code and keep it in secure place. This is the only possible way to recover your password": {
                'en': "Print this QR-code and keep it in secure place. This is the only possible way to recover your password",
                'ru': "Распечатайте этот QR-код и храните его в надежном месте. Это единственний возможный способ восстановить пароль",
                'ua': "Роздрукуйте цей QR-код і зберігайте його в надійному місці. Це єдиний можливий спосіб відновити пароль"
            },
            "Save code": {
                'en': "Save code",
                'ru': "Сохранить код",
                'ua': "Зберегти код"
            },
            "Sign up new account": {
                'en': "Sign up new account",
                'ru': "Создать новый аккаунт",
                'ua': "Створити новий аккаунт"
            },
            "Characters and numbers allowed": {
                'en': "Characters and numbers allowed",
                'ru': "Символы и цифры разрешены",
                'ua': "Символи та цифри дозволені"
            },
            "6 characters minimum": {
                'en': "6 characters minimum",
                'ru': "Минимум 6 символов",
                'ua': "Мінімум 6 символів"
            }
        }, _defineProperty(_module$exports, "Log in", {
            'en': "Log in",
            'ru': "Войти",
            'ua': "Увійти"
        }), _defineProperty(_module$exports, "Sign up", {
            'en': "Sign up",
            'ru': "Зарегистрироваться",
            'ua': "Зареєструватися"
        }), _defineProperty(_module$exports, "Error", {
            'en': "Error",
            'ru': "Ошибка",
            'ua': "Помилка"
        }), _defineProperty(_module$exports, "Success", {
            'en': "Success",
            'ru': "Успешно",
            'ua': "Успішно"
        }), _defineProperty(_module$exports, "Invoice", {
            'en': "Invoice",
            'ru': "Счет-фактура",
            'ua': "Запит на отримання коштів"
        }), _defineProperty(_module$exports, "Invoice created", {
            'en': "Invoice created",
            'ru': "Счет-фактура создан",
            'ua': "Запит на отримання коштів створений"
        }), _defineProperty(_module$exports, "Create a new invoice", {
            'en': "Create a new invoice",
            'ru': "Создать новый счет-фактуру",
            'ua': "Створити новий запит на отримання коштів"
        }), _defineProperty(_module$exports, "Create", {
            'en': "Create",
            'ru': "Создать",
            'ua': "Створити"
        }), _defineProperty(_module$exports, "Invoice code", {
            'en': "Invoice code",
            'ru': "Код счета-фактуры",
            'ua': "Код запиту на отримання коштів"
        }), _defineProperty(_module$exports, "Copy this invoice code and share it with someone you need to get money from", {
            'en': "Copy this invoice code and share it with someone you need to get money from",
            'ru': "Скопируйте этот код счета-фактуры и поделитесь им с тем, от кого ожидаете средства",
            'ua': "Скопіюйте цей код запиту на отримання коштів та поділіться ним з тим, від кого очікуєте кошти"
        }), _defineProperty(_module$exports, "Create new", {
            'en': "Create new",
            'ru': "Создать новый",
            'ua': "Створити новий"
        }), _defineProperty(_module$exports, "New password cannot be same as old", {
            'en': "New password cannot be same as old",
            'ru': "Новый пароль не может быть таким же, как старый",
            'ua': "Новий пароль не може бути таким самим, як старий"
        }), _defineProperty(_module$exports, "Password changed", {
            'en': "Password changed",
            'ru': "Пароль изменен",
            'ua': "Пароль змінений"
        }), _defineProperty(_module$exports, "Cannot change password", {
            'en': "Cannot change password",
            'ru': "Не удается изменить пароль",
            'ua': "Не вдається змінити пароль"
        }), _defineProperty(_module$exports, "Invalid email", {
            'en': "Invalid email",
            'ru': "Неверный адрес электронной почты",
            'ua': "Невірна адреса електронної пошти"
        }), _defineProperty(_module$exports, "Invalid phone", {
            'en': "Invalid phone",
            'ru': "Неверный телефон",
            'ua': "Невірний телефон"
        }), _defineProperty(_module$exports, "Profile saved", {
            'en': "Profile saved",
            'ru': "Профиль сохранен",
            'ua': "Профіль збережений"
        }), _defineProperty(_module$exports, "Cannot update profile details", {
            'en': "Cannot update profile details",
            'ru': "Не удалось обновить данные профиля",
            'ua': "Не вдається оновити дані профілю"
        }), _defineProperty(_module$exports, "Change password", {
            'en': "Change password",
            'ru': "Изменить пароль",
            'ua': "Змінити пароль"
        }), _defineProperty(_module$exports, "Old password", {
            'en': "Old password",
            'ru': "Старый пароль",
            'ua': "Старий пароль"
        }), _defineProperty(_module$exports, "New password", {
            'en': "New password",
            'ru': "Новый пароль",
            'ua': "Новий пароль"
        }), _defineProperty(_module$exports, "Repeat new password", {
            'en': "Repeat new password",
            'ru': "Повторите новый пароль",
            'ua': "Повторіть новий пароль"
        }), _defineProperty(_module$exports, "Change", {
            'en': "Change",
            'ru': "Изменить",
            'ua': "Змінити"
        }), _defineProperty(_module$exports, "Change additional data", {
            'en': "Change additional data",
            'ru': "Изменить дополнительные данные",
            'ua': "Змінити додаткові дані"
        }), _defineProperty(_module$exports, "Phone", {
            'en': "Phone",
            'ru': "Телефон",
            'ua': "Телефон"
        }), _defineProperty(_module$exports, "Email", {
            'en': "Email",
            'ru': "Электронная почта",
            'ua': "Електронна пошта"
        }), _defineProperty(_module$exports, "Save", {
            'en': "Save",
            'ru': "Сохранить",
            'ua': "Зберегти"
        }), _defineProperty(_module$exports, "Can't load account by transaction", {
            'en': "Can't load account by transaction",
            'ru': "Не удается загрузить счет по транзакции",
            'ua': "Неможливо завантажити рахунок по транзакції"
        }), _defineProperty(_module$exports, "Transaction loading error", {
            'en': "Transaction loading error",
            'ru': "Ошибка при загрузке транзакции",
            'ua': "Помилка при завантаженні транзакції"
        }), _defineProperty(_module$exports, "Back", {
            'en': "Back",
            'ru': "Назад",
            'ua': "Назад"
        }), _defineProperty(_module$exports, "Transaction", {
            'en': "Transaction",
            'ru': "Транзакция",
            'ua': "Транзакція"
        }), _defineProperty(_module$exports, "Created at", {
            'en': "Created at",
            'ru': "Создан",
            'ua': "Створено"
        }), _defineProperty(_module$exports, "Transaction memo", {
            'en': "Transaction memo",
            'ru': "Описание транзакции",
            'ua': "Опис транзакції"
        }), _defineProperty(_module$exports, "Target account ID", {
            'en': "Target account ID",
            'ru': "Счет получателя",
            'ua': "Рахунок отримувача"
        }), _defineProperty(_module$exports, "Transaction amount", {
            'en': "Transaction amount",
            'ru': "Сумма транзакции",
            'ua': "Сума транзакції"
        }), _defineProperty(_module$exports, "Target account balances", {
            'en': "Target account balances",
            'ru': "Балансы получателя",
            'ua': "Баланси отримувача"
        }), _defineProperty(_module$exports, "Target account type", {
            'en': "Target account type",
            'ru': "Тип счета получателя",
            'ua': "Тип рахунку отримувача"
        }), _defineProperty(_module$exports, "Target account on infohost", {
            'en': "Target account on infohost",
            'ru': "Информация по получателю",
            'ua': "Інформація по отримувачу"
        }), _defineProperty(_module$exports, "Infohost", {
            'en': "Infohost",
            'ru': "Infohost",
            'ua': "Infohost"
        }), _defineProperty(_module$exports, "Repeat this payment", {
            'en': "Repeat this payment",
            'ru': "Повторить платеж",
            'ua': "Повторити платіж"
        }), _defineProperty(_module$exports, "Repeat", {
            'en': "Repeat",
            'ru': "Повторить",
            'ua': "Повторити"
        }), _defineProperty(_module$exports, "Invalid invoice currency", {
            'en': "Invalid invoice currency",
            'ru': "Неверная валюта счета-фактури",
            'ua': "Невірна валюта запиту на отриманная грошей"
        }), _defineProperty(_module$exports, "Invoice requested", {
            'en': "Invoice requested",
            'ru': "Счет-фактура запрошен",
            'ua': "Запит на отримання коштів запрошений"
        }), _defineProperty(_module$exports, "User not found! Check phone number", {
            'en': "User not found! Check phone number",
            'ru': "Пользователь не найден. Проверьте номер телефона",
            'ua': "Користувач не знайден. Перевірте номер телефону"
        }), _defineProperty(_module$exports, "User not found! Check email", {
            'en': "User not found! Check email",
            'ru': "Пользователь не найден. Проверьте адрес электронной почты",
            'ua': "Користувач не знайден. Перевірте адресу електронної пошти"
        }), _defineProperty(_module$exports, "Account is invalid", {
            'en': "Account is invalid",
            'ru': "Неверный счет",
            'ua': "Невірний рахунок"
        }), _defineProperty(_module$exports, "Amount is invalid", {
            'en': "Amount is invalid",
            'ru': "Неверная сумма",
            'ua': "Невірна сума"
        }), _defineProperty(_module$exports, "Memo text is too long", {
            'en': "Memo text is too long",
            'ru': "Слишком длинное описание",
            'ua': "Занадто довгий опис"
        }), _defineProperty(_module$exports, "Can't send money to distribution agent!", {
            'en': "Can't send money to distribution agent!",
            'ru': "Невозможно перевести средства агенту по распространению",
            'ua': "Неможливо переказати кошти агенту по розповсюдженню"
        }), _defineProperty(_module$exports, "Transfer successful", {
            'en': "Transfer successful",
            'ru': "Успешно переведено",
            'ua': "Кошти успішно переказано"
        }), _defineProperty(_module$exports, "Cannot make transfer", {
            'en': "Cannot make transfer",
            'ru': "Невозможно перевести",
            'ua': "Неможливо переказати"
        }), _defineProperty(_module$exports, "Can't load account for transaction", {
            'en': "Can't load account for transaction",
            'ru': "Не удается загрузить счет для транзакции",
            'ua': "Неможливо завантажити рахунок для транзакції"
        }), _defineProperty(_module$exports, "Transfer", {
            'en': "Transfer",
            'ru': "Перевод",
            'ua': "Переказ"
        }), _defineProperty(_module$exports, "Transfer type", {
            'en': "Transfer type",
            'ru': "Тип перевода",
            'ua': "Тип переказу"
        }), _defineProperty(_module$exports, "by account ID", {
            'en': "By account ID",
            'ru': "По счету",
            'ua': "По рахунку"
        }), _defineProperty(_module$exports, "by phone", {
            'en': "By phone",
            'ru': "По номеру телефона",
            'ua': "За номером телефону"
        }), _defineProperty(_module$exports, "by email", {
            'en': "By email",
            'ru': "По адресу эл. почты",
            'ua': "За адресою ел. пошти"
        }), _defineProperty(_module$exports, "Account ID should have 56 symbols", {
            'en': "Account ID should have 56 symbols",
            'ru': "Счет должен быть 56 символов",
            'ua': "Рухунок повинен бути 56 символів"
        }), _defineProperty(_module$exports, "Account ID", {
            'en': "Account ID",
            'ru': "Счет",
            'ua': "Рахунок"
        }), _defineProperty(_module$exports, "Phone number", {
            'en': "Phone number",
            'ru': "Номер телефона",
            'ua': "Номер телефону"
        }), _defineProperty(_module$exports, "Memo message", {
            'en': "Memo message",
            'ru': "Текст описание",
            'ua': "Текст опис"
        }), _defineProperty(_module$exports, "Request invoice", {
            'en': "Request invoice",
            'ru': "Запросить счет-фактуру",
            'ua': "Запит на отримання коштів"
        }), _defineProperty(_module$exports, "Request", {
            'en': "Request",
            'ru': "Запросить",
            'ua': "Запросити"
        }), _defineProperty(_module$exports, "Transaction ID", {
            'en': "Transaction ID",
            'ru': "ID транзакции",
            'ua': "ID транзакції"
        }), _defineProperty(_module$exports, "Date", {
            'en': "Date",
            'ru': "Дата",
            'ua': "Дата"
        }), _defineProperty(_module$exports, "Overview of transactions history", {
            'en': "Overview of transactions history",
            'ru': "Обзор истории операций",
            'ua': "Огляд історії операцій"
        }), _defineProperty(_module$exports, "Payments", {
            'en': "Payments",
            'ru': "Операции",
            'ua': "Операції"
        }), _defineProperty(_module$exports, "All transactions", {
            'en': "All transactions",
            'ru': "Все операции",
            'ua': "Всі операції"
        }), _defineProperty(_module$exports, "No payments yet", {
            'en': "No payments yet",
            'ru': "Платежей пока нет",
            'ua': "Платежів поки немає"
        }), _defineProperty(_module$exports, "anonymous_user", {
            'en': "Anonymous user",
            'ru': "Анонимный пользователь",
            'ua': "Анонімний користувач"
        }), _defineProperty(_module$exports, "registered_user", {
            'en': "Registered user",
            'ru': "Зарегестрированный пользователь",
            'ua': "Зареєстрований користувач"
        }), _defineProperty(_module$exports, "merchant", {
            'en': "Merchant",
            'ru': "Мерчант",
            'ua': "Мерчант"
        }), _defineProperty(_module$exports, "distribution_agent", {
            'en': "Distribution agent",
            'ru': "Агент по распостранению",
            'ua': "Агент з розповсюдження"
        }), _defineProperty(_module$exports, "settlement_agent", {
            'en': "settlement_agent",
            'ru': "settlement_agent",
            'ua': "settlement_agent"
        }), _defineProperty(_module$exports, "exchange_agent", {
            'en': "exchange_agent",
            'ru': "exchange_agent",
            'ua': "exchange_agent"
        }), _defineProperty(_module$exports, "Username already exists", {
            'en': "Username already exists",
            'ru': "Логин уже занят",
            'ua': "Логін вже зайнятий"
        }), _defineProperty(_module$exports, "Invalid username", {
            'en': "Invalid username",
            'ru': "Неверный логин",
            'ua': "Невірний логін"
        }), _defineProperty(_module$exports, "Invalid TOTP code", {
            'en': "Invalid TOTP code",
            'ru': "Неверный код TOTP",
            'ua': "Невірний код TOTP"
        }), _defineProperty(_module$exports, "Invalid signature", {
            'en': "Invalid signature",
            'ru': "Неверная подпись",
            'ua': "Невірний підпис"
        }), _defineProperty(_module$exports, "Forbidden", {
            'en': "Forbidden",
            'ru': "Запрещено",
            'ua': "Заборонено"
        }), _defineProperty(_module$exports, "Invalid parameter: phone", {
            'en': "Invalid parameter: phone",
            'ru': "Неверный параметр: телефон",
            'ua': "Неверній параметр: телефон"
        }), _defineProperty(_module$exports, "Invalid parameter: email", {
            'en': "Invalid parameter: email",
            'ru': "Неверный параметр: эл. почта",
            'ua': "Неверній параметр: ел. пошта"
        }), _defineProperty(_module$exports, "User with this phone exists", {
            'en': "User with this phone exists",
            'ru': "Пользователь с таким телефоном уже существует",
            'ua': "Користувач з таким телефоном вже існує"
        }), _defineProperty(_module$exports, "User with this email exists", {
            'en': "User with this email exists",
            'ru': "Пользователь с такой эл. почтой уже существует",
            'ua': "Користувач з такою ел. поштою вже існує"
        }), _defineProperty(_module$exports, "Nothing to update", {
            'en': "Nothing to update",
            'ru': "Данные не претерпели изменений",
            'ua': "Дані не зазнали змін"
        }), _defineProperty(_module$exports, "Empty required parameter", {
            'en': "Empty required parameter",
            'ru': "Некоторые обязательные параметры отсутствуют",
            'ua': "Деякі обов'язкові параметри відсутні"
        }), _defineProperty(_module$exports, "Empty parameter: account id", {
            'en': "Empty parameter: account id",
            'ru': "Пустой параметр: счет",
            'ua': "Порожній параметр: рахунок"
        }), _defineProperty(_module$exports, "Empty parameter: asset", {
            'en': "Empty parameter: asset",
            'ru': "Пустой параметр: валюта",
            'ua': "Порожній параметр: валюта"
        }), _defineProperty(_module$exports, "Empty parameter: invoice id", {
            'en': "Empty parameter: invoice id",
            'ru': "Пустой параметр: номер инфойса",
            'ua': "Порожній параметр: номер інвойсу"
        }), _defineProperty(_module$exports, "Invalid parameter: amount", {
            'en': "Invalid parameter: amount",
            'ru': "Неверный параметр: сумма",
            'ua': "Неверній параметр: сума"
        }), _defineProperty(_module$exports, "Invalid parameter: asset", {
            'en': "Invalid parameter: asset",
            'ru': "Неверный параметр: валюта",
            'ua': "Неверній параметр: валюта"
        }), _defineProperty(_module$exports, "Invalid parameter: account id", {
            'en': "Invalid parameter: account id",
            'ru': "Неверный параметр: счет",
            'ua': "Неверній параметр: рахунок"
        }), _defineProperty(_module$exports, "Invalid parameter: invoice id", {
            'en': "Invalid parameter: invoice id",
            'ru': "Неверный параметр: номер инфойса",
            'ua': "Неверній параметр: номер інвойсу"
        }), _defineProperty(_module$exports, "Database error", {
            'en': "Database error",
            'ru': "Ошибка базы данных",
            'ua': "Помилка бази даних"
        }), _defineProperty(_module$exports, "Can not create invoice id", {
            'en': "Can not create invoice id",
            'ru': "Не удалось создать инвойс",
            'ua': "Не вдалося створити інвойс"
        }), _defineProperty(_module$exports, "Invoice not found", {
            'en': "Invoice not found",
            'ru': "Инвойс не найден",
            'ua': "Інвойс не знайдено"
        }), _defineProperty(_module$exports, "Invoice has expired", {
            'en': "Invoice has expired",
            'ru': "Инвойс просрочен",
            'ua': "Інвойс прострочений"
        }), _defineProperty(_module$exports, "Invoice was already requested", {
            'en': "Invoice was already requested",
            'ru': "Инвойс уже использован",
            'ua': "Інвойс вже використаний"
        }), _defineProperty(_module$exports, "IP-address is blocked", {
            'en': "IP-address is blocked",
            'ru': "IP-адрес заблокирован",
            'ua': "IP-адреса заблокована"
        }), _defineProperty(_module$exports, "IP-address exceeded the minute limit of missed requests", {
            'en': "IP-address exceeded the minute limit of missed requests",
            'ru': "Минутный лимит неверных запросов для ip-адреса превышен",
            'ua': "Хвилинний ліміт невірних запитів для ip-адреси перевищено"
        }), _defineProperty(_module$exports, "IP-address exceeded the daily limit of missed requests", {
            'en': "IP-address exceeded the daily limit of missed requests",
            'ru': "Дневной лимит неверных запросов для ip-адреса превышен",
            'ua': "Денний ліміт невірних запитів для ip-адреси перевищено"
        }), _defineProperty(_module$exports, "IP-address exceeded the daily limit of requests", {
            'en': "IP-address exceeded the daily limit of requests",
            'ru': "Дневной лимит запросов для ip-адреса превышен",
            'ua': "Денний ліміт запитів для ip-адреси перевищено"
        }), _defineProperty(_module$exports, "Account is blocked", {
            'en': "Account is blocked",
            'ru': "Счет заблокирован",
            'ua': "Рахунок заблоковано"
        }), _defineProperty(_module$exports, "Account exceeded the minute limit of missed requests", {
            'en': "Account exceeded the minute limit of missed requests",
            'ru': "Минутный лимит неверных запросов для счета превышен",
            'ua': "Хвилинний ліміт невірних запитів для рахунку перевищено"
        }), _defineProperty(_module$exports, "Account exceeded the daily limit of missed requests", {
            'en': "Account exceeded the daily limit of missed requests",
            'ru': "Дневной лимит неверных запросов для счета превышен",
            'ua': "Денний ліміт невірних запитів для рахунку перевищено"
        }), _defineProperty(_module$exports, "Account exceeded the daily limit of requests", {
            'en': "Account exceeded the daily limit of requests",
            'ru': "Дневной лимит запросов для счета превышен",
            'ua': "Денний ліміт запитів для рахунку перевищено"
        }), _defineProperty(_module$exports, "Account does not exist", {
            'en': "Account does not exist",
            'ru': "Счет не существует",
            'ua': "Рахунок не існує"
        }), _defineProperty(_module$exports, "Unknown error", {
            'en': "Unknown error",
            'ru': "Неизвестная ошибка, обратитесь к администратору",
            'ua': "Невідома помилка, зверніться до адміністратора"
        }), _defineProperty(_module$exports, "UpdateError", {
            'en': "UpdateError",
            'ru': "Ошибка",
            'ua': "Помилка"
        }), _defineProperty(_module$exports, "Add funds", {
            'en': "Add funds",
            'ru': "Пополнить",
            'ua': "Поповнити"
        }), _defineProperty(_module$exports, "Your account", {
            'en': "Your account",
            'ru': "Ваш счет",
            'ua': "Ваш рахунок"
        }), _defineProperty(_module$exports, "Show account", {
            'en': "Show account",
            'ru': "Показать счет",
            'ua': "Показати рахунок"
        }), _defineProperty(_module$exports, "Mnemonic", {
            'en': "Mnemonic",
            'ru': "Мнемоника",
            'ua': "Мнемоніка"
        }), _defineProperty(_module$exports, "Mnemonic phrase", {
            'en': "Mnemonic phrase",
            'ru': "Мнемоническая фраза",
            'ua': "Мнемонічна фраза"
        }), _defineProperty(_module$exports, "Remember this mnemonic phrase to future login", {
            'en': "Remember this mnemonic phrase to future login",
            'ru': "Запомните эту мнемоническую фразу, чтобы получить доступ к Вашему кошельку в будущем",
            'ua': "Запам'ятайте цю мнемонічну фразу, щоб у майбутьому отримати доступ до Вашого гаманця"
        }), _defineProperty(_module$exports, "Invalid mnemonic phrase", {
            'en': "Invalid mnemonic phrase",
            'ru': "Неверная мнемоническая фраза",
            'ua': "Помилкова мнемонічна фраза"
        }), _defineProperty(_module$exports, "Enter your mnemonic phrase word number $[1] of $[2]", {
            'en': "Enter your mnemonic phrase word number $[1] of $[2].",
            'ru': "Введите Вашу мнемоническую фразу. Слово №$[1] из $[2].",
            'ua': "Введіть Вашу мнемонічну фразу. Слово №$[1] із $[2]."
        }), _defineProperty(_module$exports, "Bad word $[1]", {
            'en': "Bad word $[1]",
            'ru': "Неверное слово №$[1]",
            'ua': "Помилкове слово №$[1]"
        }), _defineProperty(_module$exports, "Mnemonic phrase generation", {
            'en': "Mnemonic phrase generation",
            'ru': "Генерация мнемонической фразы",
            'ua': "Генерація мнемонічної фрази"
        }), _defineProperty(_module$exports, "Complete", {
            'en': "Complete",
            'ru': "Завершить",
            'ua': "Закінчити"
        }), _defineProperty(_module$exports, "Next", {
            'en': "Next",
            'ru': "Далее",
            'ua': "Далі"
        }), _defineProperty(_module$exports, "Previous", {
            'en': "Previous",
            'ru': "Предыдущий",
            'ua': "Попередній"
        }), _defineProperty(_module$exports, "Warning! Store your mnemonic phrase in a safe and private place. We do not recommend storing it on your computer or online. Anyone who has your mnemonic phrase will be able to get access to your funds.", {
            'ru': "Важно! Берегите Вашу мнемоническую фразу в надежном и безопасном месте. Мы не советуем хранить фразу на компьютере или в сети Интернет. Каждый, кто будет иметь доступ к этой фразе, будет иметь доступ к Вашим деньгам.",
            'ua': "Важливо! Бережіть Вашу мнемонічну фразу в надійному та безпечному місці. Ми не радимо зберігати її на комп'ютері або в мережі Інтернет. Кожен, хто матиме доступ до цієї фрази, зможе отримати доступ до Ваших коштів."
        }), _defineProperty(_module$exports, "For your safety, print the blank phrase sheet and write your mnemonic phrase in it", {
            'ru': "В целях Вашей безопасности распечатайте лист для мнемонической фразы и запишите в него ручкой Вашу фразу",
            'ua': "В цілях Вашої безпеки роздрукуйте лист для мнемонічної фрази та запишіть в нього ручкою Вашу фразу"
        }), _defineProperty(_module$exports, "Download", {
            'en': "Download",
            'ru': "Загрузить",
            'ua': "Завантажити"
        }), _defineProperty(_module$exports, "Use a pen to legibly write down the following $[1] words onto your printed phrase sheet. It is important that you write down the words exactly as they appear here and in this order.", {
            'ru': "Воспользуйтесь ручкой чтобы записать представленные $[1] слов " + "в распечатанный ранее бланк. Очень важно записать эти слова " + "именно так, как они появляются и в таком же порядке.",
            'ua': "Скористайтесь ручкою для того, щоб записати показані $[1] слова " + "в роздрукований раніше бланк. Дуже важливо записати ці слова " + "саме так, як вони виникають і в такому же порядку."
        }), _defineProperty(_module$exports, "Using the completed phrase sheet as a reference, please enter the following words from your mnemonic phrase to complete the registration process.", {
            'ru': "Используя заполненный бланк как руководство " + "пожалуйста введите представленные номерами слова из Вашей " + "мнемонической фразы для проверки и завершения процесса регистрации.",
            'ua': "Використовуючи заповнений бланк як зразок " + "будь ласка введіть запропоновані номерами слова із Вашої " + "мнемонічної фрази для перевірки та завершення процесу реєстрації."
        }), _defineProperty(_module$exports, "Your mnemonic phrase created successfully.", {
            'ru': "Ваша мнемоническая фраза была успешно сгенерирована.",
            'ua': "Вашу мнемонічну фразу було успішно згенеровано."
        }), _defineProperty(_module$exports, "Now you can recover your account with your mnemonic phrase.", {
            'ru': "Теперь Вы сможете восстановить доступ в систему, используя свою мнемоническую фразу.",
            'ua': "Тепер Ви сможете відновити доступ до системи, використовуючи свою мнемонічну фразу."
        }), _defineProperty(_module$exports, "Account created successfully", {
            'ru': "",
            'ua': ""
        }), _defineProperty(_module$exports, "Log in to PROSTIR", {
            'ua': "Увійти до системи ПРОСТІР",
            'ru': "Войти в систему PROSTIR"
        }), _defineProperty(_module$exports, "Help", {
            'ua': "Допомога",
            'ru': "Помощь"
        }), _defineProperty(_module$exports, "Create a new account", {
            'ua': "Створити новий аккаунт",
            'ru': "Создать новый аккаунт"
        }), _defineProperty(_module$exports, "Forgot your password?", {
            'ua': "Забули пароль?",
            'ru': "Забыли пароль?"
        }), _defineProperty(_module$exports, "Log in to PROSTIR via mnemonic phrase", {
            'ua': "Увійти до системи ПРОСТІР за допомогою мнемонічної фрази",
            'ru': "Войти в систему ПРОСТІР с помощью мнемонической фразы"
        }), _defineProperty(_module$exports, "This is a QR-code with a mnemonic phrase that is used for account recovering. It is very important to keep your mnemonic phrase in a safe and private place", {
            'ua': "Це QR-код з мнемонічною фразою, яка використовується для відновлення вашого аккаунту. Дуже важливо зберігати вашу мнемонічну фразу в безпечному та надійному місці",
            'ru': "Это QR-код с мнемонической фразой, которая используется для восстановления учетной записи. Очень важно хранить вашу мнемоническую фразу в надежном и безопасном месте"
        }), _defineProperty(_module$exports, "Account successfully created", {
            'ua': "Аккаунт створено успішно",
            'ru': "Аккаунт создан успешно"
        }), _defineProperty(_module$exports, "Please fill all the fields", {
            'ua': "Будь-ласка заповніть всі поля",
            'ru': "Пожалуйста заполните все поля"
        }), _defineProperty(_module$exports, "Show older", {
            'ua': "Показати більше",
            'ru': "Показать больше"
        }), _defineProperty(_module$exports, "Sign in", {
            'ua': "Вхід",
            'ru': "Вход"
        }), _defineProperty(_module$exports, "The website is for information only. The National Bank of Ukraine is not responsible for possible consequences resulting from the use of information on the website. The National Bank of Ukraine owns the copyright to the materials posted on the website, unless otherwise expressly stated in the text. The materials can be used for further dissemination only with prior consent of the National Bank of Ukraine and with reference to the source. All changes and amendments to such information can be made only with the National Bank of Ukraine’s prior consent.", {
            'ua': "Сайт має виключно інформаційне значення. Національний банк України не несе відповідальності за можливі наслідки використання інформації на сайті. Крім випадків, коли інше прямо вказано у тексті, авторське право щодо матеріалів, розміщених на цьому сайті, належить Національному банку України. Матеріали сайту можуть бути використані для подальшого поширення виключно за попередньою згодою Національного банку України із посиланням на джерело. Всі зміни та правки до такої інформації можуть вноситися тільки за попередньою згодою Національного банку України.",
            'ru': ""
        }), _defineProperty(_module$exports, "PROSTIR", {
            'ua': "ПРОСТІР"
        }), _defineProperty(_module$exports, "All rights reserved", {
            'ua': "Всі права захищені",
            'ru': "Все права защищены"
        }), _defineProperty(_module$exports, "Contacts", {
            'ua': "Наші контакти",
            'ru': "Наши контакты"
        }), _defineProperty(_module$exports, "The National Bank of Ukraine", {
            'ua': "Національний Банк України",
            'ru': "Национальный Банк Украины"
        }), _defineProperty(_module$exports, "9 Instytutska St., 01601 Kyiv", {
            'ua': "01601, Київ, вул. Інститутська, 9",
            'ru': "01601, Киев, ул. Институтская, 9"
        }), _defineProperty(_module$exports, "Skip", {
            'ua': "Пропустити",
            'ru': "Пропустить"
        }), _defineProperty(_module$exports, "Are you sure you want to skip the generation of mnemonic phrase? Without it, you will not be able to recover access to your funds in case of lost password", {
            'ua': "Ви впевнені що хочете пропустити генерацію мнемонічної фрази? Без неї ви не сможете відновити доступ до ваших коштів при втраті пароля",
            'ru': "Вы уверены что хотите пропустить генерацию мнемонической фразы? Без нее вы не сможете восставновить доступ к вашим средствам при утере пароля."
        }), _defineProperty(_module$exports, "Yes, skip it", {
            'ua': "Так, пропустити",
            'ru': "Да, пропустить"
        }), _defineProperty(_module$exports, "Warning!", {
            'ua': "Увага!",
            'ru': "Внимание!"
        }), _defineProperty(_module$exports, "Cancel", {
            'ua': "Відміна",
            'ru': "Отмена"
        }), _defineProperty(_module$exports, "logo-image", {
            'ua': "logo-image-ua"
        }), _defineProperty(_module$exports, "Made by", {
            'ua': "Зроблено в",
            'ru': "Сделано в"
        }), _defineProperty(_module$exports, "Time to end the session", {
            'ua': "Час до кінця сесії",
            'ru': "Время до конца сессии"
        }), _defineProperty(_module$exports, "Login should contain only latin characters, numbers, - and _", {
            'ua': "Логін повинен складатися лише з латинських букв, цифр, знаків - та _",
            'ru': "Логин должен состоять только из латинских букв, цифр, знаков - и _"
        }), _defineProperty(_module$exports, "Tap here", {
            'ua': "Натисніть тут",
            'ru': "Нажмите тут"
        }), _defineProperty(_module$exports, "to download Prostir mobile wallet application", {
            'ua': "щоб завантажити мобільний додаток - Простір гаманець",
            'ru': "чтоб загрузить мобильное приложение - Простир кошелёк"
        }), _module$exports);
    }, {}], 16: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Errors = require('../errors/Errors.js');

        var Auth = {
            setDefaults: function setDefaults() {
                this.keypair = m.prop(false);
                this.type = m.prop(false);
                this.username = m.prop(false);
                this.balances = m.prop([]);
                this.assets = m.prop([]);
                this.payments = m.prop([]);
                this.wallet = m.prop(false);
                this.api = m.prop(false);
                this.ttl = m.prop(0);
                this.time_live = m.prop(0);
            },

            updateBalances: function updateBalances(account_id) {

                var assets = [];
                var balances = [];
                var account = null;

                return Auth.loadAccountById(account_id).then(function (source) {

                    var response = source.balances;
                    Object.keys(response).map(function (index) {
                        if (response[index].asset_type != 'native') {
                            balances.push({
                                balance: response[index].balance,
                                asset: response[index].asset_code
                            });
                            assets.push({
                                asset: response[index].asset_code
                            });
                        }
                    });

                    account = source;
                }).catch(function (err) {
                    console.log(err);
                    //step this err, because user can be not created yet (before first payment)
                }).then(function () {

                    m.startComputation();
                    Auth.balances(balances);
                    Auth.assets(assets);
                    m.endComputation();

                    return account;
                });
            },

            login: function login(_login, password) {

                var master = null;

                return this.loadAccountById(Conf.master_key).then(function (master_info) {
                    master = master_info;

                    return StellarWallet.getWallet({
                        server: Conf.keyserver_host + '/v2',
                        username: _login,
                        password: password
                    });
                }).then(function (wallet) {
                    var is_admin = false;
                    if (typeof master.signers != 'undefined') {
                        master.signers.forEach(function (signer) {
                            if (signer.weight == StellarSdk.xdr.SignerType.signerAdmin().value && signer.public_key == StellarSdk.Keypair.fromSeed(wallet.getKeychainData()).accountId()) {
                                is_admin = true;
                            }
                        });

                        if (is_admin) {
                            throw new Error('Login/password combination is invalid');
                        }
                    }

                    return wallet;
                }).then(function (wallet) {
                    m.startComputation();
                    Auth.wallet(wallet);
                    Auth.keypair(StellarSdk.Keypair.fromSeed(wallet.getKeychainData()));
                    Auth.username(wallet.username);
                    Auth.api(new StellarWallet.Api(Conf.api_host, Auth.keypair()));
                    m.endComputation();
                    return Auth.api().initNonce();
                }).then(function (ttl) {
                    m.startComputation();
                    Auth.ttl(ttl);
                    Auth.time_live(Number(ttl));
                    m.endComputation();
                });
            },

            mnemonicLogin: function mnemonicLogin(mnemonic) {
                return new Promise(function (resolve, reject) {
                    m.startComputation();
                    Auth.wallet(null);
                    var seed = null;
                    for (var i = 0; i < Conf.mnemonic.langsList.length; i++) {
                        try {
                            seed = StellarSdk.getSeedFromMnemonic(mnemonic, Conf.mnemonic.langsList[i]);
                            break;
                        } catch (e) {
                            continue;
                        }
                    }
                    if (seed === null) {
                        throw new Error(Conf.tr("Invalid mnemonic phrase"));
                    }
                    Auth.keypair(StellarSdk.Keypair.fromSeed(seed));
                    Auth.api(new StellarWallet.Api(Conf.api_host, Auth.keypair()));
                    Auth.username(null);
                    m.endComputation();
                    Auth.api().initNonce().then(function (ttl) {
                        m.startComputation();
                        Auth.ttl(ttl);
                        Auth.time_live(Number(ttl));
                        m.endComputation();
                        resolve();
                    });
                });
            },

            registration: function registration(accountKeypair, login, password) {
                return StellarWallet.createWallet({
                    server: Conf.keyserver_host + '/v2',
                    username: login,
                    password: password,
                    accountId: accountKeypair.accountId(),
                    publicKey: accountKeypair.rawPublicKey().toString('base64'),
                    keychainData: accountKeypair.seed(),
                    mainData: 'mainData',
                    kdfParams: {
                        algorithm: 'scrypt',
                        bits: 256,
                        n: Math.pow(2, 3),
                        r: 8,
                        p: 1
                    }
                });
            },

            logout: function logout() {
                window.location.href = '/';
            },

            destroySession: function destroySession() {
                m.startComputation();
                Auth.keypair(null);
                m.route('/');
                m.endComputation();
            },

            updatePassword: function updatePassword(old_pwd, new_pwd) {
                return StellarWallet.getWallet({
                    server: Conf.keyserver_host + '/v2',
                    username: Auth.username(),
                    password: old_pwd
                }).then(function (wallet) {
                    return wallet.changePassword({
                        newPassword: new_pwd,
                        secretKey: Auth.keypair()._secretKey.toString('base64')
                    });
                }).then(function (wallet) {
                    Auth.wallet(wallet);
                });
            },

            update: function update(data) {
                return Auth.wallet().update({
                    update: data,
                    secretKey: Auth.keypair()._secretKey.toString('base64')
                });
            },

            loadTransactionInfo: function loadTransactionInfo(tid) {
                return Conf.horizon.transactions().transaction(tid).call();
            },

            loadAccountById: function loadAccountById(aid) {
                return Conf.horizon.accounts().accountId(aid).call();
            }
        };

        Auth.setDefaults();

        module.exports = Auth;
    }, { "../config/Config.js": 12, "../errors/Errors.js": 13 }], 17: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Auth = require('../models/Auth.js');

        var Helpers = {

            getTimeFromSeconds: function getTimeFromSeconds(sec) {
                var dt = new Date();
                dt.setTime(sec * 1000);
                var minutes = dt.getMinutes();
                var seconds = dt.getSeconds();
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                return minutes + ":" + seconds;
            }

        };
        module.exports = Helpers;
    }, { "../config/Config.js": 12, "../models/Auth.js": 16 }], 18: [function (require, module, exports) {
        module.exports = {
            modalTitle: m.prop(null),
            modalMessage: m.prop(null),

            modal: function modal(msg, title) {
                this.modalMessage(msg);

                if (typeof title != 'undefined') {
                    this.modalTitle(title);
                }
            },

            closeModal: function closeModal() {
                this.modalMessage(null);
                this.modalTitle(null);
            }
        };
    }, {}], 19: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Navbar = require('../components/Navbar.js');
        var Payments = require('../components/Payments.js');
        var Footer = require('../components/Footer.js');
        var Auth = require('../models/Auth.js');
        var Session = require('../models/Session.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.keypair()) {
                    return m.route('/');
                }

                // We'll query balances on each page load until we receive some money and start a stream
                if (!Auth.payments().length) {
                    Auth.updateBalances(Auth.keypair().accountId()).then(function (source) {
                        if (source) {
                            Auth.type(source.type);
                        }

                        return Conf.horizon.payments().forAccount(Auth.keypair().accountId()).order('desc').limit(Conf.payments.onpage).call();
                    }).then(function (result) {
                        m.startComputation();
                        Auth.payments(result.records);
                        m.endComputation();

                        return Conf.horizon.payments().forAccount(Auth.keypair().accountId()).cursor('now').stream({
                            onmessage: function onmessage(message) {
                                var result = message.data ? JSON.parse(message.data) : message;
                                m.startComputation();
                                Auth.payments().unshift(result);
                                m.endComputation();

                                // Update user balance
                                Auth.updateBalances(Auth.keypair().accountId());
                            },
                            onerror: function onerror() {
                                console.log('Cannot get payment from stream');
                            }
                        });
                    }).catch(function (err) {
                        console.log(err);
                        // If you're here, everything's still ok - it means acc wasn't created yet
                    });
                }
            },

            view: function view(ctrl) {
                var type = Auth.type() ? Auth.type() : 'anonymous_user';
                return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-sm-6" }, children: [{ tag: "div", attrs: { class: "card-box widget-user info-block" }, children: [{ tag: "div", attrs: {}, children: [{ tag: "img", attrs: { src: "/assets/img/avatar-empty.png", class: "img-responsive", alt: "user" } }, { tag: "div", attrs: { class: "wid-u-info" }, children: [Auth.username() ? { tag: "h4", attrs: { class: "m-t-0 m-b-5" }, children: [Conf.tr("Welcome"), ", ", Auth.username()] } : '', { tag: "p", attrs: {}, children: [{ tag: "button", attrs: {
                                                        class: "btn-xs btn-warning waves-effect waves-light m-t-10",
                                                        onclick: function onclick() {
                                                            Session.modal(Auth.keypair().accountId(), Conf.tr("Your account"));
                                                        }
                                                    }, children: [Conf.tr("Show account")] }] }, { tag: "small", attrs: { class: "text-pink" }, children: [{ tag: "b", attrs: {}, children: [Conf.tr(type)] }] }] }] }] }] }, { tag: "div", attrs: { class: "col-sm-6" }, children: [{ tag: "div", attrs: { class: "widget-simple text-center card-box info-block" }, children: [{ tag: "h3", attrs: { class: "text-primary counter m-t-30" }, children: [Auth.balances().length ? Auth.balances().map(function (b) {
                                            return { tag: "div", attrs: {}, children: [{ tag: "span", attrs: {}, children: [parseFloat(b.balance).toFixed(2) + " " + b.asset] }] };
                                        }) : '0.00'] }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }, { tag: "div", attrs: { class: "panel panel-color panel-maincolor" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Overview of recent transactions")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [m.component(Payments, { payments: Auth.payments() })] }, { tag: "div", attrs: { class: "panel-footer text-center" }, children: [{ tag: "a", attrs: { href: "/payments", config: m.route,
                                        class: "btn btn-primary btn-custom waves-effect w-md btn-sm waves-light" }, children: [Conf.tr("All transactions")] }] }] }] }] }, m.component(Footer)];
            }
        };
    }, { "../components/Footer.js": 8, "../components/Navbar.js": 9, "../components/Payments.js": 10, "../config/Config.js": 12, "../models/Auth.js": 16, "../models/Session.js": 18 }], 20: [function (require, module, exports) {
        var Qr = require('../../node_modules/kjua/dist/kjua.min');
        // var Qr = require('../../node_modules/qrcode-npm/qrcode');
        var Conf = require('../config/Config.js');
        var Navbar = require('../components/Navbar.js');
        var Auth = require('../models/Auth.js');
        var Footer = require('../components/Footer.js');

        var Invoice = module.exports = {

            controller: function controller() {
                var ctrl = this;

                this.invoiceCode = m.prop(false);
                this.qr = m.prop(false);
                this.barcode = m.prop(false);

                if (!Auth.keypair()) {
                    return m.route('/');
                }

                //create invoice function
                this.createInvoice = function (e) {
                    e.preventDefault();

                    var amount = e.target.amount.value;

                    m.onLoadingStart();

                    Auth.api().createInvoice({ asset: Conf.asset, amount: parseFloat(parseFloat(amount).toFixed(2)) }).then(function (response) {
                        m.flashSuccess(Conf.tr("Invoice created"));

                        if (!response.id) {
                            m.flashError(Conf.tr("Invalid response. Contact support"));
                        }

                        ctrl.invoiceCode(response.id);

                        // QR-CODE
                        var qrData = {
                            "account": Auth.keypair().accountId(),
                            "amount": amount,
                            "asset": Conf.asset,
                            "t": 1
                        };

                        var qrCode = Qr({
                            text: JSON.stringify(qrData),
                            crisp: true,
                            fill: '#000',
                            ecLevel: 'Q',
                            size: 200,
                            minVersion: 4
                        });

                        m.startComputation();
                        ctrl.qr(qrCode);
                        // ctrl.barcode(m.trust('<img width="230" height="118"' +
                        //     'src="http://www.barcode-generator.org/zint/api.php?bc_number=13&bc_data=482000' +
                        //     id + '">'));
                        m.endComputation();
                    }).catch(function (err) {
                        m.flashApiError(err);
                        console.error(err);
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.newForm = function (e) {
                    this.invoiceCode(false);
                };
            },

            view: function view(ctrl) {
                var code = ctrl.qr();

                return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-6" }, children: [!ctrl.invoiceCode() ? { tag: "div", attrs: { class: "panel panel-color panel-maincolor" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Create a new invoice")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "form", attrs: { class: "form-horizontal", onsubmit: ctrl.createInvoice.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-4" }, children: [{ tag: "label", attrs: { for: "" }, children: [Conf.tr("Amount"), ":"] }, { tag: "input", attrs: { class: "form-control", type: "number", required: "required",
                                                            id: "amount",
                                                            min: "0.01",
                                                            step: "0.01",
                                                            placeholder: "0.00",
                                                            name: "amount" } }] }] }, { tag: "div", attrs: { class: "form-group m-t-20" }, children: [{ tag: "div", attrs: { class: "col-sm-7" }, children: [{ tag: "button", attrs: {
                                                            class: "btn btn-primary btn-custom w-md waves-effect waves-light",
                                                            type: "submit" }, children: [Conf.tr("Create")] }] }] }] }] }] } : { tag: "div", attrs: { class: "panel panel-border panel-inverse" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Invoice code")] }] }, { tag: "div", attrs: { class: "panel-body text-center" }, children: [{ tag: "h2", attrs: {}, children: [ctrl.invoiceCode()] }, { tag: "i", attrs: {}, children: [Conf.tr("Copy this invoice code and share it with someone you need to get money from")] }, { tag: "br", attrs: {} }, { tag: "br", attrs: {} }, { tag: "img", attrs: { src: code.src } }, { tag: "br", attrs: {} }, { tag: "br", attrs: {} }, { tag: "br", attrs: {} }, { tag: "br", attrs: {} }, { tag: "button", attrs: { class: "btn btn-purple waves-effect w-md waves-light m-b-5",
                                                onclick: ctrl.newForm.bind(ctrl) }, children: [Conf.tr("Create new")] }] }] }] }] }] }] }, m.component(Footer)];
            }
        };
    }, { "../../node_modules/kjua/dist/kjua.min": 5, "../components/Footer.js": 8, "../components/Navbar.js": 9, "../config/Config.js": 12, "../models/Auth.js": 16 }], 21: [function (require, module, exports) {
        var AuthNavbar = require('../components/AuthNavbar.js');
        var Auth = require('../models/Auth.js');
        var Conf = require('../config/Config.js');

        var Login = module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (Auth.keypair()) {
                    return m.route('/home');
                }

                this.login = function (e) {
                    e.preventDefault();

                    if (e.target.login.value && e.target.password.value) {
                        m.onLoadingStart();
                        Auth.login(e.target.login.value, e.target.password.value).then(function () {
                            m.onLoadingEnd();
                            m.route('/home');
                        }).catch(function (err) {
                            console.error(err);
                            if (err.name === "ConnectionError") {
                                return m.flashError(Conf.tr("Service error. Please contact support"));
                            } else {
                                return m.flashError(Conf.tr("Login/password combination is invalid"));
                            }
                        });
                    } else {
                        m.flashError(Conf.tr('Please fill all the fields'));
                    }
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: {}, children: [m.component(AuthNavbar), { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: { className: "auth-form" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "h3", attrs: {}, children: [Conf.tr("Sign in")] }] }, { tag: "form", attrs: { class: "form-horizontal m-t-30", onsubmit: ctrl.login.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text", placeholder: Conf.tr("Username"),
                                                autocapitalize: "none", name: "login" } }, { tag: "i", attrs: { class: "md md-account-circle form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password", autocapitalize: "none",
                                                placeholder: Conf.tr("Password"), name: "password" } }, { tag: "i", attrs: { class: "md md-vpn-key form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group m-t-20 text-center" }, children: [{ tag: "button", attrs: {
                                            class: "form-control btn btn-primary btn-lg btn-custom waves-effect w-md waves-light m-b-5",
                                            type: "submit" }, children: [Conf.tr("Log in")] }] }] }, { tag: "div", attrs: { class: "m-t-10" }, children: [{ tag: "a", attrs: { href: "/sign", config: m.route, class: "" }, children: [Conf.tr("Create account")] }, { tag: "a", attrs: { href: "/recovery", config: m.route, class: "pull-right" }, children: [Conf.tr("Forgot your password?")] }] }] }] }, { tag: "footer", attrs: { class: "visible-xs visible-sm footer-app" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "a", attrs: { href: "/assets/data/ProstirMobileWallet.apk", download: "ProstirMobileWallet.apk" }, children: [Conf.tr("Tap here")] }, " ", Conf.tr("to download Prostir mobile wallet application")] }] }] }] }] };
            }
        };
    }, { "../components/AuthNavbar.js": 7, "../config/Config.js": 12, "../models/Auth.js": 16 }], 22: [function (require, module, exports) {
        var Auth = require('../models/Auth.js');

        var Logout = module.exports = {
            controller: function controller() {
                Auth.logout();
                m.route('/');
            },

            view: function view(ctrl) {}
        };
    }, { "../models/Auth.js": 16 }], 23: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Navbar = require('../components/Navbar.js');
        var Footer = require('../components/Footer.js');
        var Auth = require('../models/Auth.js');
        var Payments = require('../components/Payments.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                this.current_cursor = m.prop(null);
                this.payments = m.prop([]);
                this.next = m.prop(false);

                if (!Auth.keypair()) {
                    return m.route('/');
                }

                this.checkNextPaymentsExist = function () {

                    m.startComputation();
                    ctrl.next(false);
                    m.endComputation();

                    return ctrl.current_cursor().next().then(function (next_result) {

                        if (next_result.records.length > 0) {
                            m.startComputation();
                            ctrl.next(true);
                            m.endComputation();
                        }
                    }).catch(function (err) {
                        m.flashError(err.name + (err.message ? ': ' + err.message : ''));
                    });
                };

                //show next payments
                this.loadMorePayments = function (e) {
                    e.preventDefault();

                    m.onLoadingStart();

                    ctrl.current_cursor().next().then(function (result) {
                        m.startComputation();
                        ctrl.current_cursor(result);
                        ctrl.payments(ctrl.payments().concat(result.records));
                        m.endComputation();

                        return ctrl.checkNextPaymentsExist();
                    }).catch(function (err) {
                        m.flashError(err.name + (err.message ? ': ' + err.message : ''));
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                Conf.horizon.payments().forAccount(Auth.keypair().accountId()).order('desc').limit(Conf.payments.onpage).call().then(function (result) {

                    m.startComputation();
                    ctrl.current_cursor(result);
                    ctrl.payments(result.records);
                    m.endComputation();

                    return ctrl.checkNextPaymentsExist();
                }).catch(function (err) {
                    // If you're here, everything's still ok - it means acc wasn't created yet
                });
            },

            view: function view(ctrl) {
                return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "panel panel-color panel-maincolor" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Account transactions")] }, { tag: "p", attrs: { class: "panel-sub-title font-13" }, children: [Conf.tr("Overview of recent transactions")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [m.component(Payments, { payments: ctrl.payments() })] }, ctrl.next() ? { tag: "div", attrs: { class: "panel-footer text-center" }, children: [{ tag: "button", attrs: { class: "btn btn-primary waves-effect w-md waves-light m-b-5",
                                        onclick: ctrl.loadMorePayments.bind(ctrl) }, children: [Conf.tr("Show older")] }] } : ''] }] }] }, m.component(Footer)];
            }
        };
    }, { "../components/Footer.js": 8, "../components/Navbar.js": 9, "../components/Payments.js": 10, "../config/Config.js": 12, "../models/Auth.js": 16 }], 24: [function (require, module, exports) {
        var AuthNavbar = require('../components/AuthNavbar.js');
        var Auth = require('../models/Auth.js');
        var Conf = require('../config/Config.js');

        var Login = module.exports = {
            controller: function controller() {
                var ctrl = this;
                this.wordNum = m.prop(1);

                if (Auth.keypair()) {
                    return m.route('/home');
                }

                this.login = function (e) {
                    e.preventDefault();

                    if (e.target.mnemonic.value) {
                        m.onLoadingStart();
                        Auth.mnemonicLogin(e.target.mnemonic.value).then(function () {
                            m.onLoadingEnd();
                            m.route('/home');
                        }).catch(function (err) {
                            m.flashError(err.message ? Conf.tr(err.message) : Conf.tr('Service error. Please contact support'));
                        });
                    }
                };

                this.phraseEdit = function (value) {
                    var words = value.split(' ');
                    if (words.length < Conf.mnemonic.totalWordsCount) {
                        ctrl.wordNum(words.length);
                    } else {
                        ctrl.wordNum(Conf.mnemonic.totalWordsCount);
                    }
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { class: "auth-wrapper" }, children: [m.component(AuthNavbar), { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: { className: "auth-form" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "h3", attrs: {}, children: [Conf.tr("Log in to PROSTIR via mnemonic phrase")] }] }, { tag: "form", attrs: { class: "form-horizontal m-t-20", onsubmit: ctrl.login.bind(ctrl) }, children: [{ tag: "div", attrs: { id: "by-mnemonic", class: "tab-pane" }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { class: "control-label text-right" }, children: [Conf.tr("Enter your mnemonic phrase word number $[1] of $[2]", ctrl.wordNum(), Conf.mnemonic.totalWordsCount)] }] }, { tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "textarea", attrs: { class: "form-control mnemonic-field",
                                                    placeholder: Conf.tr("Mnemonic phrase"),
                                                    autocapitalize: "none",
                                                    name: "mnemonic",
                                                    oninput: m.withAttr("value", ctrl.phraseEdit.bind(ctrl)) }
                                            }, { tag: "i", attrs: { class: "md md-spellcheck form-control-feedback l-h-34" } }] }] }] }, { tag: "div", attrs: { class: "form-group m-t-20 text-center" }, children: [{ tag: "button", attrs: {
                                            class: "btn btn-success btn-lg btn-custom waves-effect w-md waves-light m-b-5",
                                            type: "submit" }, children: [Conf.tr("Log in")] }] }] }, { tag: "div", attrs: { class: "m-t-10" }, children: [{ tag: "a", attrs: { href: "/", config: m.route, class: "" }, children: [Conf.tr("Back")] }] }] }] }] };
            }
        };
    }, { "../components/AuthNavbar.js": 7, "../config/Config.js": 12, "../models/Auth.js": 16 }], 25: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Navbar = require('../components/Navbar.js');
        var Auth = require('../models/Auth.js');
        var Footer = require('../components/Footer.js');

        var Settings = module.exports = {

            controller: function controller() {
                var ctrl = this;

                if (!Auth.keypair()) {
                    return m.route('/');
                }

                //return phone in pattern or prefix
                this.getPhoneWithViewPattern = function (number) {
                    if (number.substr(0, Conf.phone.prefix.length) != Conf.phone.prefix) {
                        number = Conf.phone.prefix;
                    }
                    return m.prop(VMasker.toPattern(number, { pattern: Conf.phone.view_mask, placeholder: "x" }));
                };

                this.addPhoneViewPattern = function (e) {
                    ctrl.phone = ctrl.getPhoneWithViewPattern(e.target.value);
                };

                this.phone = ctrl.getPhoneWithViewPattern(Conf.phone.prefix + Auth.wallet().phone);
                this.email = m.prop(Auth.wallet().email || '');

                this.changePassword = function (e) {
                    e.preventDefault();

                    if (!e.target.oldpassword.value || !e.target.password.value || !e.target.repassword.value) {
                        m.flashError(Conf.tr("Please, fill all required fields"));
                        return;
                    }

                    if (e.target.password.value.length < 6) {
                        m.flashError(Conf.tr("Password should have 6 chars min"));
                        return;
                    }

                    if (e.target.password.value != e.target.repassword.value) {
                        m.flashError(Conf.tr("Passwords should match"));
                        return;
                    }

                    if (e.target.oldpassword.value == e.target.password.value) {
                        m.flashError(Conf.tr("New password cannot be same as old"));
                        return;
                    }

                    m.onLoadingStart();
                    m.startComputation();

                    Auth.updatePassword(e.target.oldpassword.value, e.target.password.value).then(function () {
                        m.flashSuccess(Conf.tr("Password changed"));
                        e.target.reset();
                    }).catch(function (err) {
                        m.flashError(Conf.tr("Cannot change password"));
                    }).then(function () {
                        m.onLoadingEnd();
                        m.endComputation();
                    });
                };

                this.bindData = function (e) {
                    e.preventDefault();

                    //reformat phone to database format
                    e.target.phone.value = VMasker.toPattern(e.target.phone.value, Conf.phone.db_mask);
                    var phone_number = e.target.phone.value.substr(2) ? e.target.phone.value.substr(2) : '';

                    if (e.target.email.value != Auth.wallet().email || phone_number != Auth.wallet().phone) {

                        m.onLoadingStart();

                        var dataToUpdate = {};
                        if (e.target.email.value) {
                            //validate email
                            var email_re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                            if (!email_re.test(e.target.email.value)) {
                                return m.flashError(Conf.tr("Invalid email"));
                            }
                        }
                        dataToUpdate.email = e.target.email.value;
                        if (phone_number) {
                            //validate phone
                            if (phone_number.length > 0 && phone_number.match(/\d/g).length != Conf.phone.length) {
                                m.startComputation();
                                ctrl.phone = ctrl.getPhoneWithViewPattern(Conf.phone.prefix + phone_number);
                                m.endComputation();
                                return m.flashError(Conf.tr("Invalid phone"));
                            }
                        }
                        dataToUpdate.phone = phone_number;

                        Auth.update(dataToUpdate).then(function () {
                            m.flashSuccess(Conf.tr("Profile saved"));
                        }).catch(function (err) {
                            if (err.message) {

                                if (err.message == 'Nothing to update') {
                                    m.flashSuccess(Conf.tr(err.message));
                                } else {
                                    m.flashError(Conf.tr(err.message));
                                }
                            } else {
                                m.flashError(Conf.tr("Cannot update profile details"));
                            }
                        }).then(function () {
                            ctrl.phone = ctrl.getPhoneWithViewPattern(Conf.phone.prefix + Auth.wallet().phone);
                            ctrl.email = m.prop(Auth.wallet().email || '');
                            m.onLoadingEnd();
                            m.endComputation();
                        });
                    }
                };
            },

            view: function view(ctrl) {
                return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "div", attrs: { class: "panel panel-color panel-maincolor" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Change password")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "form", attrs: { class: "form-horizontal", onsubmit: ctrl.changePassword.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { for: "" }, children: [Conf.tr("Old password"), ":"] }, { tag: "input", attrs: { class: "form-control", type: "password", required: "required",
                                                            name: "oldpassword" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { for: "" }, children: [Conf.tr("New password"), ":"] }, { tag: "input", attrs: { class: "form-control", type: "password", required: "required",
                                                            name: "password" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { for: "" }, children: [Conf.tr("Repeat new password"), ":"] }, { tag: "input", attrs: { class: "form-control", type: "password", required: "required",
                                                            name: "repassword" } }] }] }, { tag: "div", attrs: { class: "form-group m-t-20" }, children: [{ tag: "div", attrs: { class: "col-sm-7" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-custom w-md waves-effect waves-light",
                                                            type: "submit" }, children: [Conf.tr("Change")] }] }] }] }] }] }] }, { tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "div", attrs: { class: "panel panel-color panel-maincolor" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Change additional data")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "form", attrs: { class: "form-horizontal", onsubmit: ctrl.bindData.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { for: "" }, children: [Conf.tr("Email"), ":"] }, { tag: "input", attrs: { class: "form-control", type: "text", name: "email",
                                                            oninput: m.withAttr("value", ctrl.email), value: ctrl.email() } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "label", attrs: { for: "" }, children: [Conf.tr("Phone"), ":"] }, { tag: "input", attrs: { class: "form-control", type: "text", name: "phone",
                                                            placeholder: Conf.phone.view_mask,
                                                            oninput: ctrl.addPhoneViewPattern.bind(ctrl),
                                                            value: ctrl.phone() } }] }] }, ctrl.phone() != Auth.wallet().phone || ctrl.email() != Auth.wallet().email ? { tag: "div", attrs: { class: "form-group m-t-20" }, children: [{ tag: "div", attrs: { class: "col-sm-7" }, children: [{ tag: "button", attrs: {
                                                            class: "btn btn-primary btn-custom w-md waves-effect waves-light",
                                                            type: "submit" }, children: [Conf.tr("Save")] }] }] } : ''] }] }] }] }] }] }] }, m.component(Footer)];
            }
        };
    }, { "../components/Footer.js": 8, "../components/Navbar.js": 9, "../config/Config.js": 12, "../models/Auth.js": 16 }], 26: [function (require, module, exports) {
        var AuthNavbar = require('../components/AuthNavbar.js');
        var Auth = require('../models/Auth.js');
        var Conf = require('../config/Config.js');
        var PhraseWizard = require('../components/PhraseWizard.js');
        var Qr = require('../../node_modules/kjua/dist/kjua.min');

        var Sign = module.exports = {
            controller: function controller() {
                var ctrl = this;
                if (Auth.keypair()) {
                    return m.route('/home');
                }
                this.qr = m.prop(false);
                this.mnemonic = m.prop(false);
                this.showMnemonic = m.prop(false);

                this.signup = function (e) {
                    e.preventDefault();

                    var login = e.target.login.value;
                    var password = e.target.password.value;
                    var rePassword = e.target.repassword.value;

                    if (!login || !password || !rePassword) {
                        return m.flashError(Conf.tr("Please, fill all required fields"));
                    }

                    if (login.length < 3) {
                        return m.flashError(Conf.tr("Login should have 3 chars min"));
                    }

                    var pattern = /^([A-Za-z0-9_-]{1,})$/;

                    if (!pattern.test(login)) {
                        return m.flashError(Conf.tr("Login should contain only latin characters, numbers, - and _"));
                    }

                    if (password.length < 6) {
                        return m.flashError(Conf.tr("Password should have 6 chars min"));
                    }

                    if (password != rePassword) {
                        return m.flashError(Conf.tr("Passwords should match"));
                    }

                    m.onLoadingStart();
                    var accountKeypair = StellarSdk.Keypair.random();
                    var mnemonicPhrase = StellarSdk.getMnemonicFromSeed(accountKeypair.seed(), Conf.mnemonic.locale);

                    Auth.registration(accountKeypair, login, password).then(function () {
                        return Auth.login(login, password);
                    }).then(function () {
                        var qr = Qr({
                            text: mnemonicPhrase,
                            crisp: true,
                            fill: '#000',
                            ecLevel: 'L',
                            size: 260
                        });
                        m.startComputation();
                        ctrl.qr(qr);
                        ctrl.mnemonic(mnemonicPhrase);
                        m.endComputation();
                    }).catch(function (err) {
                        m.flashError(err.message ? Conf.tr(err.message) : Conf.tr('Service error. Please contact support'));
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.goNext = function (e) {
                    e.preventDefault();
                    ctrl.showMnemonic(true);
                };
            },

            view: function view(ctrl) {
                if (ctrl.showMnemonic()) {
                    return Sign.viewMnemonic(ctrl);
                }

                if (ctrl.qr()) {
                    return Sign.viewQRCode(ctrl);
                }

                return { tag: "div", attrs: {}, children: [m.component(AuthNavbar), { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: { class: "auth-form" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "h3", attrs: {}, children: [Conf.tr("Create a new account")] }] }, { tag: "form", attrs: { class: "form-horizontal m-t-30", onsubmit: ctrl.signup.bind(ctrl) }, children: [{ tag: "div", attrs: { id: "by-login", class: "tab-pane active" }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text",
                                                    placeholder: Conf.tr("Username"),
                                                    autocapitalize: "none",
                                                    name: "login",
                                                    title: Conf.tr("Characters and numbers allowed") } }, { tag: "i", attrs: { class: "md md-account-circle form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password",
                                                    autocapitalize: "none",
                                                    placeholder: Conf.tr("Password"), name: "password",
                                                    title: Conf.tr("6 characters minimum") } }, { tag: "i", attrs: { class: "md md-vpn-key form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password",
                                                    autocapitalize: "none",
                                                    placeholder: Conf.tr("Retype Password"), name: "repassword",
                                                    title: Conf.tr("6 characters minimum") } }, { tag: "i", attrs: { class: "md md-vpn-key form-control-feedback l-h-34" } }] }] }] }, { tag: "div", attrs: { class: "form-group m-t-20 text-center" }, children: [{ tag: "button", attrs: { class: "form-control btn btn-primary btn-lg btn-custom waves-effect w-md waves-light m-b-5" }, children: [Conf.tr("Create")] }] }] }, { tag: "div", attrs: { class: "m-t-10" }, children: [{ tag: "a", attrs: { href: "/", config: m.route, class: "" }, children: [Conf.tr("Log in")] }] }] }] }] };
            },

            viewQRCode: function viewQRCode(ctrl) {
                var code = ctrl.qr();
                // ctrl.qr(false);

                return { tag: "div", attrs: {}, children: [m.component(AuthNavbar), { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "panel panel-color panel-success" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Account successfully created")] }, { tag: "p", attrs: { class: "panel-sub-title font-13" }, children: [Conf.tr("This is a QR-code with a mnemonic phrase that is used for account recovering. It is very important to keep your mnemonic phrase in a safe and private place"), "!"] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "p", attrs: {}, children: [{ tag: "img", attrs: { src: code.src, alt: "" } }] }, { tag: "p", attrs: {}, children: [{ tag: "a", attrs: { href: code.src, download: "qr_mnemonic.png" }, children: [Conf.tr("Save code")] }] }, { tag: "button", attrs: { className: "btn btn-success btn-custom waves-effect w-md waves-light m-b-5 m-t-10",
                                                onclick: ctrl.goNext.bind(ctrl) }, children: [Conf.tr("Next")] }] }] }] }] }] }] };
            },

            viewMnemonic: function viewMnemonic(ctrl) {
                return m.component(PhraseWizard, {
                    phrase: ctrl.mnemonic()
                });
            }

        };
    }, { "../../node_modules/kjua/dist/kjua.min": 5, "../components/AuthNavbar.js": 7, "../components/PhraseWizard.js": 11, "../config/Config.js": 12, "../models/Auth.js": 16 }], 27: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Navbar = require('../components/Navbar.js');
        var Footer = require('../components/Footer.js');
        var Auth = require('../models/Auth.js');
        var DateFormat = require('dateformat');

        var Transaction = module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.keypair()) {
                    return m.route('/');
                }

                this.navbar = new Navbar.controller();

                this.transaction = m.prop(false);
                this.account = m.prop(false);
                this.payment = m.prop(false);
                this.balances = m.prop([]);

                this.getAccount = function (aid) {
                    Auth.loadAccountById(aid).then(function (accountResult) {
                        m.startComputation();
                        ctrl.account(accountResult);
                        m.endComputation();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr("Can't load account by transaction"));
                    });
                };

                this.getTransaction = function (tid) {
                    Auth.loadTransactionInfo(tid).then(function (transactionResult) {
                        m.startComputation();
                        ctrl.transaction(transactionResult);
                        m.endComputation();
                    }).catch(function (err) {
                        console.log(err);
                        m.flashError(Conf.tr("Transaction loading error"));
                    });
                };

                this.getTransaction(m.route.param("trans_id"));
                this.getAccount(m.route.param("target_acc"));
            },

            view: function view(ctrl) {
                return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "panel panel-border panel-inverse" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Transaction")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "table", attrs: { class: "table table-bordered m-0 small-table" }, children: [{ tag: "tbody", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Created at"), ":"] }, { tag: "td", attrs: {}, children: [DateFormat(ctrl.transaction().created_at, 'dd.mm.yyyy HH:MM:ss')] }] }, { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Transaction ID"), ":"] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { class: "account_overflow" }, children: [ctrl.transaction().id] }] }] }, { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Transaction amount"), ":"] }, { tag: "td", attrs: {}, children: [parseFloat(m.route.param("amount")).toFixed(2)] }] }, ctrl.transaction().memo ? { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Transaction memo"), ":"] }, { tag: "td", attrs: {}, children: [ctrl.transaction().memo] }] } : '', { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Target account ID"), ":"] }, { tag: "td", attrs: {}, children: [{ tag: "a", attrs: { href: Conf.info_host + '/account?acc=' + ctrl.account().id,
                                                        target: "_blank"
                                                    }, children: [{ tag: "span", attrs: { class: "account_overflow" }, children: [ctrl.account().id] }] }] }] }, { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Target account type"), ":"] }, { tag: "td", attrs: {}, children: [ctrl.account().type] }] }] }] }] }, { tag: "div", attrs: { class: "panel-footer text-center" }, children: [{ tag: "a", attrs: { href: '/transfer' + '?account=' + ctrl.account().id + '&amount=' + parseFloat(m.route.param("amount")).toFixed(2),
                                        config: m.route,
                                        class: "btn btn-inverse btn-custom waves-effect w-md waves-light"
                                    }, children: [{ tag: "span", attrs: { class: "fa fa-repeat" } }, "  ", Conf.tr("Repeat")] }] }] }] }] }, m.component(Footer)];
            }
        };
    }, { "../components/Footer.js": 8, "../components/Navbar.js": 9, "../config/Config.js": 12, "../models/Auth.js": 16, "dateformat": 4 }], 28: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Navbar = require('../components/Navbar.js');
        var Auth = require('../models/Auth.js');
        var Footer = require('../components/Footer.js');

        var Invoice = module.exports = {

            controller: function controller() {
                var ctrl = this;

                //return phone in pattern or prefix
                this.getPhoneWithViewPattern = function (number) {
                    if (number.substr(0, Conf.phone.prefix.length) != Conf.phone.prefix) {
                        number = Conf.phone.prefix;
                    }
                    return m.prop(VMasker.toPattern(number, { pattern: Conf.phone.view_mask, placeholder: "x" }));
                };

                this.addPhoneViewPattern = function (e) {
                    ctrl.infoPhone = ctrl.getPhoneWithViewPattern(e.target.value);
                };

                this.infoAmount = m.prop(m.route.param("amount") ? m.route.param("amount") : '');
                this.infoAccount = m.prop(m.route.param("account") ? m.route.param("account") : '');
                this.infoPhone = ctrl.getPhoneWithViewPattern(Conf.phone.prefix);
                this.infoEmail = m.prop(m.route.param("email") ? m.route.param("email") : '');
                this.transferType = m.prop('byAccount');
                this.infoMemo = m.prop('by_account');

                if (!Auth.keypair()) {
                    return m.route('/');
                }

                this.changeTransferType = function (e) {
                    e.preventDefault();
                    m.startComputation();
                    this.transferType(e.target.value);
                    this.infoAccount = m.prop('');
                    this.infoPhone = ctrl.getPhoneWithViewPattern(Conf.phone.prefix);
                    this.infoEmail = m.prop('');
                    switch (e.target.value) {
                        case 'byAccount':
                            this.infoMemo('by_account');
                            break;
                        case 'byPhone':
                            this.infoMemo('by_phone');
                            break;
                        case 'byEmail':
                            this.infoMemo('by_email');
                            break;
                        default:
                            this.infoMemo('');
                    }
                    m.endComputation();
                };

                this.getInvoice = function (e) {
                    var _this = this;

                    e.preventDefault();
                    m.onLoadingStart();

                    Auth.api().getInvoice({
                        id: e.target.code.value
                    }).then(function (response) {
                        m.startComputation();
                        _this.infoAmount(response.amount);
                        _this.infoAccount(response.account);
                        _this.transferType('byAccount');

                        if (typeof response.memo == 'string' && response.memo.length > 0 && response.memo.length <= 14) {
                            _this.infoMemo(response.memo);
                        } else {
                            _this.infoMemo('by_invoice');
                        }
                        m.endComputation();

                        // Clear input data
                        e.target.code.value = '';

                        m.flashSuccess(Conf.tr("Invoice requested"));
                    }).catch(function (err) {
                        m.flashApiError(err);
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.commitPayment = function (e) {
                    e.preventDefault();

                    var accountId = e.target.account.value;
                    var memoText = e.target.memo.value.replace(/<\/?[^>]+(>|$)/g, ""); //delete html tags from memo
                    var amount = parseFloat(e.target.amount.value);

                    if (!amount || amount < 0) {
                        return m.flashError(Conf.tr("Amount is invalid"));
                    }

                    if (memoText.length > 14) {
                        return m.flashError(Conf.tr("Memo text is too long"));
                    }

                    switch (this.transferType()) {
                        case 'byAccount':
                            ctrl.processPayment(accountId, memoText, amount);
                            break;
                        case 'byPhone':
                            var phoneNum = VMasker.toPattern(e.target.phone.value, Conf.phone.db_mask).substr(2);

                            if (phoneNum.length > 0 && phoneNum.match(/\d/g).length != Conf.phone.length) {
                                return m.flashError(Conf.tr("Invalid phone"));
                            }

                            StellarWallet.getWalletDataByParams({
                                server: Conf.keyserver_host + "/v2",
                                phone: phoneNum
                            }).then(function (walletData) {
                                if (walletData && walletData.accountId) {
                                    ctrl.processPayment(walletData.accountId, memoText, amount);
                                }
                            }).catch(function (err) {
                                return m.flashError(Conf.tr("User not found! Check phone number"));
                            });
                            break;
                        case 'byEmail':
                            var email = e.target.email.value.toLowerCase();

                            if (email === '') {
                                return m.flashError(Conf.tr("Please fill all the fields"));
                            }

                            StellarWallet.getWalletDataByParams({
                                server: Conf.keyserver_host + "/v2",
                                email: email
                            }).then(function (walletData) {
                                if (walletData && walletData.accountId) {
                                    ctrl.processPayment(walletData.accountId, memoText, amount);
                                }
                            }).catch(function (err) {
                                return m.flashError(Conf.tr("User not found! Check email"));
                            });
                            break;
                    }
                };

                this.processPayment = function (accountId, memoText, amount) {
                    if (!StellarSdk.Keypair.isValidPublicKey(accountId)) {
                        return m.flashError(Conf.tr("Account is invalid"));
                    }

                    if (accountId == Auth.keypair().accountId()) {
                        return m.flashError(Conf.tr("You cannot send money to yourself"));
                    }

                    m.startComputation();
                    m.onLoadingStart();

                    return Conf.horizon.loadAccount(Auth.keypair().accountId()).then(function (source) {
                        var memo = StellarSdk.Memo.text(memoText);
                        var tx = new StellarSdk.TransactionBuilder(source, { memo: memo }).addOperation(StellarSdk.Operation.payment({
                            destination: accountId,
                            amount: amount.toString(),
                            asset: new StellarSdk.Asset(Conf.asset, Conf.master_key)
                        })).build();

                        tx.sign(Auth.keypair());

                        return Conf.horizon.submitTransaction(tx);
                    }).then(function () {
                        m.flashSuccess(Conf.tr("Transfer successful"));
                    }).catch(function (err) {
                        m.flashError(Conf.tr("Cannot make transfer"));
                    }).then(function () {
                        ctrl.infoAmount('');
                        ctrl.infoAccount('');
                        ctrl.infoPhone('');
                        ctrl.infoEmail('');
                        m.endComputation();
                    });
                };
            },

            view: function view(ctrl) {
                return [m.component(Navbar), { tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "form", attrs: { class: "col-lg-6", onsubmit: ctrl.commitPayment.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "panel panel-color panel-maincolor" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Transfer money")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: {}, children: [Conf.tr("Transfer type")] }, { tag: "select", attrs: { name: "transType", required: "required", class: "form-control",
                                                    onchange: ctrl.changeTransferType.bind(ctrl),
                                                    value: ctrl.transferType()
                                                }, children: [{ tag: "option", attrs: { value: "byAccount" }, children: [Conf.tr("by account ID")] }, { tag: "option", attrs: { value: "byPhone" }, children: [Conf.tr("by phone")] }, { tag: "option", attrs: { value: "byEmail" }, children: [Conf.tr("by email")] }] }] }, { tag: "div", attrs: _defineProperty({ class: "form-group"
                                            }, "class", ctrl.transferType() != 'byAccount' ? 'hidden' : ''), children: [{ tag: "label", attrs: {}, children: [Conf.tr("Account ID")] }, { tag: "input", attrs: { name: "account",
                                                    oninput: m.withAttr("value", ctrl.infoAccount), pattern: ".{56}",
                                                    title: Conf.tr("Account ID should have 56 symbols"),
                                                    class: "form-control",
                                                    value: ctrl.infoAccount() } }] }, { tag: "div", attrs: _defineProperty({ class: "form-group"
                                            }, "class", ctrl.transferType() != 'byPhone' ? 'hidden' : ''), children: [{ tag: "label", attrs: {}, children: [Conf.tr("Phone number")] }, { tag: "input", attrs: { name: "phone",
                                                    class: "form-control",
                                                    placeholder: Conf.phone.view_mask,
                                                    oninput: ctrl.addPhoneViewPattern.bind(ctrl),
                                                    value: ctrl.infoPhone() } }] }, { tag: "div", attrs: _defineProperty({ class: "form-group"
                                            }, "class", ctrl.transferType() != 'byEmail' ? 'hidden' : ''), children: [{ tag: "label", attrs: {}, children: [Conf.tr("Email")] }, { tag: "input", attrs: { name: "email",
                                                    type: "email",
                                                    class: "form-control",
                                                    oninput: m.withAttr("value", ctrl.infoEmail),
                                                    value: ctrl.infoEmail() } }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: {}, children: [Conf.tr("Amount")] }, { tag: "input", attrs: { type: "number", required: "required", name: "amount",
                                                    min: "0.01",
                                                    step: "0.01",
                                                    placeholder: "0.00",
                                                    class: "form-control",
                                                    oninput: m.withAttr("value", ctrl.infoAmount),
                                                    value: ctrl.infoAmount() } }] }, { tag: "div", attrs: { class: "form-group", style: "display:none;" }, children: [{ tag: "label", attrs: {}, children: [Conf.tr("Memo message")] }, { tag: "input", attrs: { name: "memo",
                                                    size: "14", maxlength: "14",
                                                    disabled: "disabled",
                                                    oninput: m.withAttr("value", ctrl.infoMemo),
                                                    class: "form-control",
                                                    value: ctrl.infoMemo() } }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-custom" }, children: [Conf.tr("Transfer")] }] }] }] }] }, { tag: "form", attrs: { class: "col-lg-6", onsubmit: ctrl.getInvoice.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "panel panel-color panel-maincolor" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Request invoice")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: {}, children: [Conf.tr("Invoice code")] }, { tag: "input", attrs: { type: "number", name: "code", required: "required", class: "form-control" } }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-custom" }, children: [Conf.tr("Request")] }] }] }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] }, m.component(Footer)];
            }

        };
    }, { "../components/Footer.js": 8, "../components/Navbar.js": 9, "../config/Config.js": 12, "../models/Auth.js": 16 }] }, {}, [14]);