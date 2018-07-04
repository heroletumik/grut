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
    }, { "fs": 1, "path": 2 }], 5: [function (require, module, exports) {
        module.exports = {
            controller: function controller() {
                var ctrl = this;
            },

            view: function view(ctrl) {
                return { tag: "footer", attrs: { class: "footer footer-full-width" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-xs-12 text-center" }, children: ["© 2016 made by ", { tag: "a", attrs: { href: "http://atticlab.net" }, children: ["AtticLab"] }] }] }] }] };
            }
        };
    }, {}], 6: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Auth = require('../models/Auth');

        module.exports = {

            controller: function controller() {
                var ctrl = this;
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { class: "topbar" }, children: [{ tag: "div", attrs: { class: "topbar-left" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "a", attrs: { href: "/home", config: m.route, class: "logo" }, children: [{ tag: "i", attrs: { class: "md md-equalizer" } }, " ", { tag: "span", attrs: {}, children: ["SmartMoney"] }, " "] }] }] }, { tag: "div", attrs: { class: "navbar navbar-default", role: "navigation" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "" }, children: [{ tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "#", onclick: Auth.logout }, children: [{ tag: "i", attrs: { class: "fa fa-power-off m-r-5" } }, Conf.tr("Logout")] }] }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: { class: "dropdown" }, children: [{ tag: "a", attrs: { class: "dropdown-toggle", "data-toggle": "dropdown", href: "#" }, children: [{ tag: "i", attrs: { class: "fa fa-language fa-fw" } }, " ", { tag: "i", attrs: { class: "fa fa-caret-down" } }] }, { tag: "ul", attrs: { class: "dropdown-menu dropdown-user" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'en'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/flags/en.png" } }, " English"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ua'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/flags/ua.png" } }, " Українська"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ru'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/flags/ru.png" } }, " Русский"] }] }] }] }] }] }] }] }] };
            }
        };
    }, { "../config/Config.js": 7, "../models/Auth": 11 }], 7: [function (require, module, exports) {
        (function (process) {
            var Localize = require('localize');
            var Locales = require('../locales/translations.js');

            var conf = {
                master_key: "",
                wallet_host: "",
                horizon_host: "",
                api_url: ""
            };

            StellarSdk.Network.use(new StellarSdk.Network(""));
            conf.horizon = new StellarSdk.Server(conf.horizon_host);

            conf.locales = Locales;

            conf.loc = new Localize(conf.locales);
            conf.loc.throwOnMissingTranslation(false);
            conf.loc.userLanguage = localStorage.getItem('locale') ? localStorage.getItem('locale') : (navigator.language || navigator.userLanguage).toLowerCase().split('-')[0];
            conf.loc.setLocale(conf.loc.userLanguage);
            conf.loc.changeLocale = function (locale, e) {
                e.preventDefault();
                m.startComputation();
                conf.loc.setLocale(locale);
                localStorage.setItem('locale', locale);
                m.endComputation();
            };
            conf.tr = conf.loc.translate; //short alias for translation

            var errors = require('../errors/Errors');
            conf.errors = errors;

            var Config = module.exports = conf;
        }).call(this, require("rH1JPG"));
    }, { "../errors/Errors": 8, "../locales/translations.js": 10, "localize": 4, "rH1JPG": 3 }], 8: [function (require, module, exports) {
        var errors = {
            account_not_found: 'Account not found',
            service_error: 'Service error. Please, try again'
        };

        var Errors = module.exports = errors;
    }, {}], 9: [function (require, module, exports) {
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

        m.getPromptValue = function (label) {
            return new Promise(function (resolve, reject) {
                jPrompt(label, '', Conf.tr("Message"), Conf.tr("OK"), Conf.tr("Cancel"), function (result) {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(new Error(Conf.tr("Empty password")));
                    }
                });
            });
        };

        // Routing
        m.route.mode = 'pathname';
        m.route(document.getElementById('app'), "/", {
            "/": require('./pages/AgentLogin.js'),
            "/u": require('./pages/UserLogin.js'),
            "/logout": require('./pages/Logout.js'),
            "/agent": require('./pages/Agent.js'),
            "/user": require('./pages/User.js')
        });
    }, { "./config/Config.js": 7, "./pages/Agent.js": 12, "./pages/AgentLogin.js": 13, "./pages/Logout.js": 14, "./pages/User.js": 15, "./pages/UserLogin.js": 16 }], 10: [function (require, module, exports) {
        var _module$exports;

        module.exports = (_module$exports = {
            "Dashboard": {
                'ru': "Обзор",
                'ua': "Огляд"
            },
            "Account data": {
                'ru': "Информацию по счету",
                'ua': "Інформація по рахунку"
            },
            "Account info": {
                'ru': "Информация о счете",
                'ua': "Інформація про рахунок"
            },
            "Account id": {
                'ru': "Номер счета",
                'ua': "Номер рахунку"
            },
            "Account login": {
                'ru': "Вход в аккаунт",
                'ua': "Вхід в аккаунт"
            },
            "Fill any field to get information about account": {
                'ru': "Заполните любое поле чтобы получить информацию по аккаунту",
                'ua': "Заповніть будь-яке поле щоб отримати інформацію по аккаунту"
            },
            "User not found!": {
                'ru': "Пользователь не найден. Проверьте номер телефона",
                'ua': "Користувач не знайден. Перевірте номер телефону"
            },
            "Error": {
                'ru': "Ошибка",
                'ua': "Помилка"
            },
            "Account ID should have 56 symbols": {
                'ru': "Счет должен быть 56 символов",
                'ua': "Рухунок повинен бути 56 символів"
            },
            "Phone number": {
                'ru': "Номер мобильного",
                'ua': "Номер мобільного"
            },
            "Your account": {
                'ru': "Ваш счет",
                'ua': "Ваш рахунок"
            },
            "Wallet username": {
                'ru': "Имя кошелька",
                'ua': "Ім'я гаманця"
            },
            "Back": {
                'ru': "Назад",
                'ua': "Назад"
            },
            "Sign in": {
                'ru': "Войти",
                'ua': "Увійти"
            },
            "English": {
                'ru': "Английский",
                'ua': "Англійська"
            },
            "Ukrainian": {
                'ru': "Украинский",
                'ua': "Українська"
            },
            "Russian": {
                'ru': "Русский",
                'ua': "Російська"
            },
            "Invalid email": {
                'ru': "Неверно указан адрес электронной почты",
                'ua': "Невірно вказана адреса електронної пошти"
            },
            "Invalid phone": {
                'ru': "Неправильно указан мобильный телефон",
                'ua': "Невірно вказаний мобільний телефон"
            },
            "Email": {
                'ru': "Электронная почта",
                'ua': "Електронна пошта"
            },
            "Wallet": {
                'ru': "Кошелек",
                'ua': "Гаманець"
            },
            "All fields are empty. Fill any field": {
                'ru': "Все поля пустые. Заполните любое поле",
                'ua': "Всі поля порожні. Заповніть будь-яке поле"
            },
            "Account not found": {
                'ru': "Аккаунт не найден",
                'ua': "Аккаунт не знайдено"
            },
            "Logout": {
                'ru': "Выйти",
                'ua': "Вийти"
            },

            "Account ID": {
                ua: 'ID рахунку',
                ru: 'ID счета'
            },
            "Account Info": {
                ru: 'Информацию по счету',
                ua: 'Інформація по рахунку'
            },
            "Account": {
                ru: 'Счет',
                ua: 'Рахунок'
            },
            "Actions": {
                ru: 'Управление',
                ua: 'Управлiння'
            },
            "Add": {
                ru: 'Создать',
                ua: 'Створити'
            },
            "Address": {
                ru: 'Адрес',
                ua: 'Адреса'
            },
            "Admin key already exists": {
                ru: 'Ключ администратора уже существует',
                ua: 'Ключ адміністратора вже існує'
            },
            "Admin key was generated and saved succesfully": {
                ru: 'Ключ администратора был создан и успешно сохранен',
                ua: 'Ключ адміністратора був створений і успішно збережений'
            },
            "Admins Account": {
                ru: 'Счета администраторов',
                ua: 'Рахунки адміністраторів'
            },
            "Admins": {
                ru: 'Администраторы',
                ua: 'Адмiнiстратори'
            },
            "Agent account": {
                ru: 'Счет агента',
                ua: 'Рахунок агента'
            },
            "Agent Id": {
                ru: 'ID агента',
                ua: 'ID агента'
            },
            "Agent type": {
                ru: 'Тип агента',
                ua: 'Тип агента'
            },
            "Agent Type": {
                ru: 'Тип агента',
                ua: 'Тип агента'
            },
            "Agent was successfully created": {
                ru: 'Агент $[1] был успешно сохранен',
                ua: 'Агент $[1] був успішно створений'
            },
            "Agents": {
                ru: 'Агенты',
                ua: 'Агенти'
            },
            "Amount": {
                ru: '',
                ua: 'Сума'
            },
            "Analytics": {
                ru: 'Аналитика',
                ua: 'Аналітика'
            },
            "Application log": {
                ru: '',
                ua: 'Журнал додатку'
            },
            "Approved": {
                ru: 'Подтверждено',
                ua: 'Підтверджено'
            },
            "Asset code": {
                ru: 'Код валюты',
                ua: 'Код валюти'
            },
            "Asset": {
                ru: 'Валюта',
                ua: 'Валюта'
            },
            "Back to agents list": {
                ru: 'Вернуться в список агентов',
                ua: 'Повернутися до списку агентів'
            },
            "Balances": {
                ru: 'Балансы',
                ua: 'Баланси'
            },
            "Block incoming payments": {
                ru: 'Блокирование входящих платежей',
                ua: 'Блокування вхідних платежів'
            },
            "Block outcoming payments": {
                ru: 'Блокирование исходящих платежей',
                ua: 'Блокування вихідних платежів'
            },
            "Block": {
                ru: 'Блокировать',
                ua: 'Блокувати'
            },
            "Code": {
                ru: 'Код',
                ua: 'Код'
            },
            "Companies": {
                ru: 'Компании',
                ua: 'Компанії'
            },
            "Company code": {
                ru: 'Код компании',
                ua: 'Код компанії'
            },
            "Company title": {
                ru: 'Название компании',
                ua: 'Назва компанії'
            },
            "Company was successfully created": {
                ru: 'Компания $[1] была успешно создана',
                ua: 'Компанія $[1] була успішно створена'
            },
            "Company": {
                ru: 'Компания',
                ua: 'Компанія'
            },
            "Contact email": {
                ru: 'Контактный e-mail',
                ua: 'Контактний e-mail'
            },
            "Create account": {
                ru: 'Создать счет',
                ua: 'Створити рахунок'
            },
            "Create new Admin": {
                ru: 'Создать нового администратора',
                ua: 'Створити нового адміністратора'
            },
            "Create new company": {
                ru: 'Создать новую компанию',
                ua: 'Створити нову компанію'
            },
            "Create new currency": {
                ru: 'Создать новую валюту',
                ua: 'Створити нову валюту'
            },
            "Create new agent": {
                ru: 'Создать нового агента',
                ua: 'Створити нового агента'
            },
            "Create payment document": {
                ru: 'Создать платежный документ',
                ua: 'Створити платіжний документ'
            },
            "Create quick payment document": {
                ru: 'Создать быстрый документ',
                ua: 'Створити швидкий документ'
            },
            "Create": {
                ru: 'Создать',
                ua: 'Створити'
            },
            "create": {
                ru: 'создайте',
                ua: 'створіть'
            },
            "Created": {
                ru: 'Создано',
                ua: 'Створено'
            },
            "Currencies": {
                ru: 'Валюты',
                ua: 'Валюти'
            },
            "Currency Code": {
                ru: 'Код валюты',
                ua: 'Код валюти'
            },
            "Currency CODE": {
                ru: 'Код валюты',
                ua: 'Код валюти'
            },
            "Currency Title": {
                ru: 'Название валюты',
                ua: 'Назва валюти'
            },
            "Currency was successfully created": {
                ru: 'Валюта $[1] была успешно создана',
                ua: 'Валюта $[1] була успішно створена'
            },
            "Currency": {
                ru: 'Валюта',
                ua: 'Валюта'
            },
            "Daily max in": {
                ru: 'Дневной лимит входящих операций',
                ua: 'Денний ліміт вхідних операцій'
            },
            "Daily max out": {
                ru: 'Дневной лимит исходящих операций',
                ua: 'Денний ліміт вихідних операцій'
            },
            "Declined": {
                ru: 'Отклонено',
                ua: 'Відхилено'
            },
            "Emission accounts": {
                ru: 'Счета эмитентов',
                ua: 'Рахунки емітентів'
            },
            "Emission": {
                ru: 'Эмисcия',
                ua: 'Емісія'
            },
            "Enrollments": {
                ru: 'Приглашения',
                ua: 'Запрошення'
            },
            "Enter": {
                ru: 'Войти',
                ua: 'Увійти'
            },
            "Signup": {
                ru: 'Зарегестрироваться',
                ua: 'Зареєструватися'
            },
            "Everything's fine": {
                ru: 'Все хорошо',
                ua: 'Все гаразд'
            },
            "From": {
                ru: 'Плательщик',
                ua: 'Платник'
            },
            "General Info": {
                ru: 'Общая информация',
                ua: 'Загальна інформація'
            },
            "Generate Admin Key": {
                ru: 'Сгенерировать ключ администратора',
                ua: 'Згенерувати ключ адміністратора'
            },
            "Generate admin keys": {
                ru: 'Генерация ключей администраторов',
                ua: 'Генерація ключів адміністраторів'
            },
            "Generate Emission Key": {
                ru: 'Сгенерировать ключ эмитента',
                ua: 'Згенерувати ключ емітента'
            },
            "Generate Emission Keys": {
                ru: 'Сгенерировать ключи эмитента',
                ua: 'Згенерувати ключ емітента'
            },
            "Generate keys": {
                ru: 'Генерировать ключ',
                ua: 'Генерувати ключ'
            },
            "Generate": {
                ru: 'Генерировать',
                ua: 'Генерувати'
            },
            "Horizon admin accounts": {
                ru: 'Счета администраторов Horizon',
                ua: 'Рахунки адміністраторів Horizon'
            },
            "ID": {
                ru: 'ID',
                ua: 'ID'
            },
            "Invalid account": {
                ru: 'Недействительный счет',
                ua: 'Недійсний рахунок'
            },
            "Keys": {
                ru: 'Ключи',
                ua: 'Ключі'
            },
            "Limits for account": {
                ru: 'Лимиты для счета',
                ua: 'Ліміти для рахунку'
            },
            "Limits": {
                ru: 'Лимиты',
                ua: 'Ліміти'
            },
            "Manage": {
                ru: 'Управление',
                ua: 'Керування'
            },
            "List": {
                ru: 'Просмотреть',
                ua: 'Переглянути'
            },
            "Local admin accounts": {
                ru: 'Внутренние счета администраторов',
                ua: 'Внутрiшнi рахунки адміністраторів'
            },
            "Login": {
                ru: 'Логин',
                ua: 'Логін'
            },
            "Edit": {
                ru: 'Изменить',
                ua: 'Змінити'
            },
            "Mark read": {
                ru: 'Обозначить как прочитанное',
                ua: 'Позначити як прочитане'
            },
            "Master Info": {
                ru: 'Главный счет',
                ua: 'Головний рахунок'
            },
            "Max operation in": {
                ru: 'Лимит входящих операций',
                ua: 'Ліміт вхідних операцій'
            },
            "Max operation out": {
                ru: 'Лимит исходящих операций',
                ua: 'Ліміт вихідних операцій'
            },
            "Message": {
                ru: 'Сообщение',
                ua: 'Повідомлення'
            },
            "Monthly max in": {
                ru: 'Месячный лимит входящих операций',
                ua: 'Щомісячний ліміт вхідних операцій'
            },
            "Monthly max out": {
                ru: 'Месячный лимит исходящих операция',
                ua: 'Щомісячний ліміт вихідних операцій'
            },
            "New Logs": {
                ru: 'Новые логи',
                ua: 'Нові логи'
            },
            "Next": {
                ru: 'Следующая',
                ua: 'Наступна'
            },
            "No admin keys found in horizon": {
                ru: 'Не найдено ключей администраторов в Horizon',
                ua: 'Не знайдено ключів адміністраторів у Horizon'
            },
            "No emission accounts found": {
                ru: 'Не найдено счета эмитентов',
                ua: 'Не знайдено рахункiв емітентів'
            },
            "No enrollments are added yet": {
                ru: 'Никаких приглашений ещё не было создано',
                ua: 'Жодних запрошень ще не було створено'
            },
            "No limit": {
                ru: 'Без ограничений',
                ua: 'Без обмежень'
            },
            "No notifications available": {
                ru: 'Нету сообщений в наличии',
                ua: 'Немає повідомлень в наявності'
            },
            "No one company found": {
                ru: 'Не найдено компаний',
                ua: 'Жодної компанії не знайдено'
            },
            "No one currency found": {
                ru: 'Не найдено валют',
                ua: 'Жодної валюти не знайдено'
            },
            "Not block": {
                ru: 'Не блокировать',
                ua: 'Не блокувати'
            },
            "Page": {
                ru: 'Страница',
                ua: 'Сторінка'
            },
            "Password": {
                ru: 'Пароль',
                ua: 'Пароль'
            },
            "Payments": {
                ru: 'Платежи',
                ua: 'Платежі'
            },
            "Phone": {
                ru: 'Телефон',
                ua: 'Телефон'
            },
            "Please insert encrypted key to Emission Daemon. Do not forget password!! Remember - password is NOT recoverable": {
                ru: 'Пожалуйста добавьте этот ключ в модуль эмиссии. Не забудьте пароль - его НЕЛЬЗЯ восстановить!',
                ua: 'Додайте цей ключ до модуля емicii. Не забудьте пароль - його неможливо відновити!'
            },
            "Please Sign In": {
                ru: 'Пожалуйста, авторизуйтесь',
                ua: 'Будь ласка, авторизуйтесь'
            },
            "Please": {
                ru: 'Пожалуйста',
                ua: 'Будь-ласка'
            },
            "Prev": {
                ru: 'Предыдущая',
                ua: 'Попередня'
            },
            "Registered Companies": {
                ru: 'Зарегестрированные компании',
                ua: 'Зареєстровані компанії'
            },
            "Registered Currencies": {
                ru: 'Зарегестрированные валюты',
                ua: 'Зареєстровані валюти'
            },
            "Registration address": {
                ru: 'Регистрационный адрес',
                ua: 'Реєстраційна адреса'
            },
            "Registration Code": {
                ru: 'Регистрационный код',
                ua: 'Реєстраційний код'
            },
            "Registration phone number": {
                ru: 'Регистрационный номер телефона',
                ua: 'Реєстраційний номер телефону'
            },
            "Registration Title": {
                ru: 'Регистрационное название',
                ua: 'Реєстраційна назва'
            },
            "Repeat Your Password": {
                ru: 'Повторите ваш пароль',
                ua: 'Повторіть пароль'
            },
            "Restricts for account": {
                ru: 'Ограничения для счета',
                ua: 'Обмеження для рахунку'
            },
            "Restricts": {
                ru: 'Ограничения',
                ua: 'Обмеження'
            },
            "Save": {
                ru: 'Сохранить',
                ua: 'Зберегти'
            },
            "Sequence": {
                ru: 'Последовательность',
                ua: 'Послідовність'
            },
            "SmartBank Admin Panel": {
                ru: 'Панель Администратора SmartBank',
                ua: "Панель Адмiнiстратора SmartBank"
            },
            "Status": {
                ru: 'Статус',
                ua: 'Статус'
            },
            "Date": {
                ru: 'Дата',
                ua: 'Дата'
            },
            "Subentries": {
                ru: 'Подразделения',
                ua: 'Підрозділи'
            },
            "Submit": {
                ru: 'Подтвердить',
                ua: 'Підтвердити'
            },
            "Title": {
                ru: 'Название',
                ua: 'Назва'
            },
            "To": {
                ru: 'Получатель',
                ua: 'Отримувач'
            },
            "Tools": {
                ru: 'Инструменты',
                ua: 'Інструменти'
            },
            "Type": {
                ru: 'Тип',
                ua: 'Тип'
            },
            "Upload Signed Transaction": {
                ru: 'Загрузить подписанную транзакцию',
                ua: 'Завантажити пiдписану транзакцiю'
            },
            "Value": {
                ru: 'Значение',
                ua: 'Значення'
            },
            "View details": {
                ru: 'Подробнее',
                ua: 'Детальніше'
            },
            "View emission account details": {
                ru: 'Детали счета эмитента',
                ua: 'Деталi рахунку емітента'
            },
            "Weight": {
                ru: 'Вес',
                ua: 'Вага'
            },
            "Wrong login/password combination": {
                ru: 'Неверный логин/пароль',
                ua: 'Невірний логін/пароль'
            },
            "Admin with this login already exists": {
                ru: 'Админ с таким логином уже существует',
                ua: 'Адмін з таким логіном вже існує'
            },
            "Password length must be minimum 6 chars": {
                ru: 'Минимальная длина пароля - 6 символов',
                ua: 'Мінімальна довжина пароля - 6 символів'
            },
            "Passwords do not match": {
                ru: 'Пароли не совпадают',
                ua: 'Паролі не співпадають'
            },
            "Service error. Cannot save admin": {
                ru: 'Сервисная ошибка. Невозможно создать учетную запись администратора',
                ua: 'Сервісна помилка. Неможливо створити обліковий запис адміністратора'
            },
            "Admin created!": {
                ru: 'Учетную запись администратора создано!',
                ua: 'Обліковий запис адміністратора створено!'
            },
            "Empty admin ID": {
                ru: 'Пустой ID администратора',
                ua: 'Порожній ID адміністратора'
            },
            "No such admin found": {
                ru: 'Учетную запись администратора не найдено',
                ua: 'Обліковий запис адміністратора не знайдено'
            },
            "Empty account ID": {
                ru: 'Пустой ID счета',
                ua: 'Порожній ID рахунку'
            },
            "No one currency found, please add first": {
                ru: 'Не найдено ни одной валюты. Пожалуйста, создайте',
                ua: 'Не знайдено жодної валюти. Будь ласка, створіть'
            },
            "No one company found, please add first": {
                ru: 'Не найдено ни одной компании. Пожалуйста, создайте',
                ua: 'Не знайдено жодної компанії. Будь ласка, створіть'
            },
            "Unable to save agent": {
                ru: 'Невозможно создать агента',
                ua: 'Неможливо зберегти агента'
            },
            "Failed to create agent": {
                ru: 'Ошибка при создании агента',
                ua: 'Помилка при створенні агента'
            },
            "Failed to create agent enrollment": {
                ru: 'Ошибка при создании приглашения для агента',
                ua: 'Помилка при створенні запрошення для агента'
            },
            "Agent was created. Enrollment was sent to": {
                ru: 'Агент был создан. Приглашение было отправлено на',
                ua: 'Агент створений. Запрошення було відправлено на'
            },
            "E-mail wasn\"t sent, check SMTP details": {
                ru: 'E-mail не отправлено. Проверьте настройки SMTP',
                ua: 'E-mail не надіслано. Перевірте налаштування SMTP'
            },
            "Failed to add company": {
                ru: 'Ошибка при создании компании',
                ua: 'Помилка при створенні компанії'
            },
            "Document created!": {
                ru: 'Документ создано',
                ua: 'Документ створено!'
            },
            "Cannot create payment doc": {
                ru: 'Невозможно создать платежный документ',
                ua: 'Неможливо створити платіжний документ'
            },
            "Agent account not found in DB": {
                ru: 'Счет агента $[1] не найден в базе данных',
                ua: 'Рахунок агента $[1] не знайдено у базі даних'
            },
            "Empty token": {
                ru: 'Пустой токен',
                ua: 'Порожній токен'
            },
            "Enrollment is not available": {
                ru: 'Приглашение недоступно',
                ua: 'Запрошення недоступне'
            },
            "Enrollment has expired": {
                ru: 'Время действия приглашения закончилось',
                ua: 'Термін дії запрошення закінчився'
            },
            "Failed to get account info": {
                ru: 'Ошибка при получении информации по счету',
                ua: 'Помилка при отриманні інформації по рахунку'
            },
            "Failed to get master account info": {
                ru: 'Ошибка при получении информации по главному счету',
                ua: 'Помилка при отриманні інформації по головному рахунку'
            },
            "Account id is not aproved yet": {
                ru: 'Счет ещё не создан',
                ua: 'Рахунок ще не створено'
            },
            "Latest logs": {
                ru: 'Последние записи',
                ua: 'Останні записи'
            },
            "6 characters minimum": {
                ru: 'Минимум 6 символов',
                ua: 'Мінімум 6 символів'
            },
            "Errors": {
                ru: 'Ошибки',
                ua: 'Помилки'
            },
            "Empty company code": {
                ru: 'Проверьте код компании',
                ua: 'Перевірте код компанії'
            },
            "Empty company title": {
                ru: 'Проверьте название компании',
                ua: 'Перевірте назву компанії'
            },
            "Empty company address": {
                ru: 'Проверьте адрес компании',
                ua: 'Перевірте адресу компанії'
            },
            "Empty company phone": {
                ru: 'Проверьте телефон компании',
                ua: 'Перевірте телефон компанії'
            },
            "Empty company email": {
                ru: 'Проверьте email компании',
                ua: 'Перевірте email компанії'
            },

            "Currency code is too short": {
                ru: 'Код валюты слишком короткий',
                ua: 'Код валюти занадто короткий'
            },
            "Currency code is too long": {
                ru: 'Код валюты слишком длинный',
                ua: 'Код валюти занадто довгий'
            },
            "Currency title is too long": {
                ru: 'Название валюты слишком длинное',
                ua: 'Назва валюти занадто довга'
            },
            "Empty currency title": {
                ru: 'Проверьте название валюты',
                ua: 'Перевірте назву валюти'
            },
            "Empty currency code": {
                ru: 'Проверьте код валюты',
                ua: 'Перевірте код валюти'
            },

            "Currency already exists": {
                ru: 'Валюта $[1] с кодом $[2] уже существует',
                ua: 'Валюта $[1] з кодом $[2] вже існує'
            },
            "Company already exists": {
                ru: 'Компания $[1] с кодом $[2] уже существует',
                ua: 'Компанія $[2] з кодом $[2] вже існує'
            },

            "Main": {
                ru: 'Главная',
                ua: 'Головна'
            },
            "No payments found": {
                ru: 'Платежи не найдены',
                ua: 'Платежі не знайдено'
            },
            "Registered agents": {
                ru: 'Зарегестрированные агенты',
                ua: 'Зареєстровані агенти'
            },
            "No agents found": {
                ru: 'Ниодного агента не найдено',
                ua: 'Жодного агента не знайдено'
            },

            "Agent is already exists": {
                ru: 'Агент уже существует',
                ua: 'Агент вже існує'
            },

            "Registered": {
                ru: 'Зарегистрированные',
                ua: 'Зареєстровані'
            },
            "Registered users": {
                ru: 'ЗАрегестрированные пользователи',
                ua: 'Зареєстровані користувачі'
            },
            "Registered user Id": {
                ru: 'ID пользователя',
                ua: 'ID користувача'
            },
            "Name": {
                ru: 'Имя',
                ua: 'Ім`я'
            },
            "Surname": {
                ru: 'Фамилия',
                ua: 'Прізвище'
            },
            "Middle name": {
                ru: 'Отчество',
                ua: 'По-батькові'
            },
            "Ident. code": {
                ru: 'Идент. код',
                ua: 'Ідент. код'
            },
            "Passport": {
                ru: 'Серия и номер паспорта',
                ua: 'Серія і номер паспорту'
            },
            "Create new registered user": {
                ru: 'Создать нового зарегестрированного пользователя',
                ua: 'Створити нового зареєстрованого користувача'
            },
            "Registered user was successfully created": {
                ru: 'Зарегестрированный пользователь $[1] был успешно создан',
                ua: 'Зареєстрований користувач $[1] був успішно створений'
            },
            "No registered users found": {
                ru: 'Не найдено ни одного зарегестрированного пользователя',
                ua: 'Не знайдено жодного зареєстрованого користувача'
            },
            "See all": {
                ru: 'Показать все',
                ua: 'Показати всі'
            },
            "from": {
                ru: 'С',
                ua: 'З'
            },
            "to": {
                ru: 'по',
                ua: 'по'
            },
            "Apply": {
                ru: 'Применить',
                ua: 'Застосувати'
            },

            "Copyright tag": {
                ru: 'сделано в',
                ua: 'made by'
            },
            "Commission": {
                ru: 'Комиссия',
                ua: 'Комісія'
            },
            "For roles": {
                ru: 'Для ролей',
                ua: 'Для ролей'
            },
            "For accounts": {
                ru: 'Для счетов',
                ua: 'Для рахунків'
            },
            "Choose variant of direction": {
                ru: 'Выберите направление',
                ua: 'Виберіть напрямок'
            },
            "Direction": {
                ru: 'Направление',
                ua: 'Напрямок'
            },
            "From account": {
                ru: 'Со счета',
                ua: 'З рахунку'
            },
            "To account": {
                ru: 'На счет',
                ua: 'На рахунок'
            },
            "From account to account": {
                ru: 'Со счета на счет',
                ua: 'З рахунку на рахунок'
            },
            "From account to type": {
                ru: 'Со счета на тип',
                ua: 'З рахунку до типу'
            },
            "From type to account": {
                ru: 'С типа на счет',
                ua: 'З типу на рахунок'
            },
            "Show": {
                ru: 'Показать',
                ua: 'Показати'
            },
            "From type": {
                ru: 'С типа',
                ua: 'З типу'
            },
            "To type": {
                ru: 'На тип',
                ua: 'На тип'
            },
            "Commission for direction": {
                ru: 'Комиссия для направления',
                ua: 'Комісія для напрямку'
            },
            "Close": {
                ru: 'Закрыть',
                ua: 'Закрити'
            },
            "Delete": {
                ru: 'Удалить',
                ua: 'Видалити'
            },
            "Flat fee": {
                ru: 'Фиксированная',
                ua: 'Фіксована'
            },
            "Percent fee": {
                ru: 'Процентная',
                ua: 'Процентна'
            },
            "Flat": {
                ru: 'Фиксированная',
                ua: 'Фіксована'
            },
            "Percent": {
                ru: 'Процентная',
                ua: 'Процентна'
            },
            "Edit commissions": {
                ru: 'Редактирование комиссий',
                ua: 'Редагування комісій'
            },
            "Account type": {
                ru: 'Тип счета',
                ua: 'Тип рахунку'
            },
            "From account type": {
                ru: 'С типа счета',
                ua: 'З типу рахунку'
            },
            "To account type": {
                ru: 'На тип счета',
                ua: 'На тип рахунку'
            },
            "anonymous": {
                ru: 'Анонимный',
                ua: 'Анонімний'
            },
            "Anonymous": {
                ru: 'Анонимный',
                ua: 'Анонімний'
            },
            "registered": {
                ru: 'Зарегестрированный',
                ua: 'Зареєстрований'
            }
        }, _defineProperty(_module$exports, "Registered", {
            ru: 'Зарегестрированный',
            ua: 'Зареєстрований'
        }), _defineProperty(_module$exports, "Merchant", {
            ru: 'Мерчант',
            ua: 'Мерчант'
        }), _defineProperty(_module$exports, "merchant", {
            ru: 'Мерчант',
            ua: 'Мерчант'
        }), _defineProperty(_module$exports, "Distribution", {
            ru: 'Агент по распространению',
            ua: 'Агент з розповсюдження'
        }), _defineProperty(_module$exports, "distribution", {
            ru: 'Агент по распространению',
            ua: 'Агент з розповсюдження'
        }), _defineProperty(_module$exports, "Settlement", {
            ru: 'Агент по погашению',
            ua: 'Агент з погашення'
        }), _defineProperty(_module$exports, "settlement", {
            ru: 'Агент по погашению',
            ua: 'Агент з погашення'
        }), _defineProperty(_module$exports, "Exchange", {
            ru: 'Агент по обмену',
            ua: 'Агент з обміну'
        }), _defineProperty(_module$exports, "exchange", {
            ru: 'Агент по обмену',
            ua: 'Агент з обміну'
        }), _defineProperty(_module$exports, "Bank", {
            ru: 'Банк',
            ua: 'Банк'
        }), _defineProperty(_module$exports, "bank", {
            ru: 'Банк',
            ua: 'Банк'
        }), _defineProperty(_module$exports, "Saved successfully", {
            ru: 'Успешно сохранено',
            ua: 'Успішно збережено'
        }), _defineProperty(_module$exports, "Deleted successfully", {
            ru: 'Успешно удалено',
            ua: 'Успішно видалено'
        }), _defineProperty(_module$exports, "Success", {
            ru: 'Успешно',
            ua: 'Успішно'
        }), _defineProperty(_module$exports, "success", {
            ru: 'Успешно',
            ua: 'Успішно'
        }), _defineProperty(_module$exports, "Show types commission", {
            ru: 'Пказать комиссию по типам',
            ua: 'Показати комісію по типам'
        }), _defineProperty(_module$exports, "From type", {
            ru: 'С типа',
            ua: 'З типу'
        }), _defineProperty(_module$exports, "For types", {
            ru: 'Для типов',
            ua: 'Для типів'
        }), _defineProperty(_module$exports, "For assets (globally)", {
            ru: 'Для валют (глобально)',
            ua: 'Для валют (глобально)'
        }), _defineProperty(_module$exports, "Choose account type for edit commissions", {
            ru: 'Выберите тип счета для редактирования комиссий',
            ua: 'Оберіть тип рахунку для редагування комісій'
        }), _defineProperty(_module$exports, "Types commission for", {
            ru: 'Комиссия для типа',
            ua: 'Комісія для типу'
        }), _defineProperty(_module$exports, "Edit types commission", {
            ru: 'Изменить комиссию для типа',
            ua: 'Змінити комісію для типу'
        }), _defineProperty(_module$exports, "Quick emission", {
            ru: 'Быстрая эмиссия',
            ua: 'Швидка емісія'
        }), _defineProperty(_module$exports, "Repeat password", {
            ru: 'Подтвердите пароль',
            ua: 'Підтвердіть пароль'
        }), _defineProperty(_module$exports, "Wrong password", {
            ru: 'Неверный пароль',
            ua: 'Невірний пароль'
        }), _defineProperty(_module$exports, "Cannot decrypt", {
            ru: 'Система не может расшифровать приватный ключ',
            ua: 'Система не може розшифрувати приватний ключ'
        }), _defineProperty(_module$exports, "No set account", {
            ru: 'Счет не указан',
            ua: 'Рахунок не вказаний'
        }), _defineProperty(_module$exports, "No set bi val", {
            ru: 'Блокирование входящих операций: значение не указано',
            ua: 'Блокування вхідних операцій: значення не вказане'
        }), _defineProperty(_module$exports, "No set bo val", {
            ru: 'Блокирование исходящих операций: значение не указано',
            ua: 'Блокування вихідних операцій: значення не вказане'
        }), _defineProperty(_module$exports, "No set values", {
            ru: 'Значения не указаны',
            ua: 'Значення не вказані'
        }), _defineProperty(_module$exports, "Pass to encrypt", {
            ru: 'Укажите пароль для шифрования Вашего приватного ключа',
            ua: 'Вкажіть пароль для шифрування Вашого приватного ключа'
        }), _defineProperty(_module$exports, "Enter password to encrypt emission", {
            ru: 'Укажите пароль для шифрования приватного ключа эмиссии',
            ua: 'Вкажіть пароль для шифрування емісійного приватного ключа'
        }), _defineProperty(_module$exports, "Repeat password", {
            ru: 'Повторите пароль',
            ua: 'Повторіть пароль'
        }), _defineProperty(_module$exports, "No pass", {
            ru: 'Укажите пароль',
            ua: 'Вкажіть пароль'
        }), _defineProperty(_module$exports, "Passwords doesn't match", {
            ru: 'Пароли не совпадают',
            ua: 'Паролі не співпадають'
        }), _defineProperty(_module$exports, "Bad file", {
            ru: 'Файл указан неверно',
            ua: 'Файл задано невірно'
        }), _defineProperty(_module$exports, "No sign admin", {
            ru: 'Невозможно сгенерировать подписанный счет администратора',
            ua: 'Неможливо згенерувати підписаний рахунок адміністратора'
        }), _defineProperty(_module$exports, "Error read file", {
            ru: 'Ошибка при чтении файла',
            ua: 'Помилка при читанні файлу'
        }), _defineProperty(_module$exports, "No admin key", {
            ru: 'Для создания счета необходимо иметь ключ администратора',
            ua: 'Для створенная рахунку необхідно мати ключ адміністратора'
        }), _defineProperty(_module$exports, "Cannot create agent", {
            ru: 'Не удалось созлдать агента',
            ua: 'Не вдалося створити агента'
        }), _defineProperty(_module$exports, "Cannot create account", {
            ru: 'Не удалось создать счет',
            ua: 'Не вдалося створити рахунок'
        }), _defineProperty(_module$exports, "Invalid sign file", {
            ru: 'Неверный формат файла',
            ua: 'Невірний формат файлу'
        }), _defineProperty(_module$exports, "Invalid operation with file", {
            ru: 'Неверная операция с файлом',
            ua: 'Невірна операция з файлом'
        }), _defineProperty(_module$exports, "Ensure file is correct", {
            ru: 'Убедитесь в корректности загружаемого файла',
            ua: 'Переконайтеся у корректності завантажуванного файла'
        }), _defineProperty(_module$exports, "Cannot create emission key", {
            ru: 'Не удалось создать ключ эмиссии',
            ua: 'Не вдалося створити ключ емісії'
        }), _defineProperty(_module$exports, "Bad limit value", {
            ru: 'Значение указано не верно, лимит установлено на 0. Проверьте указанные лимиты',
            ua: 'Значення вказано не вірно, ліміт встановлено на 0. Перевірте вказані ліміти'
        }), _defineProperty(_module$exports, "Enter pass", {
            ru: 'Укажите пароль',
            ua: 'Вкажіть пароль'
        }), _defineProperty(_module$exports, "Save success", {
            ru: 'Операция пройшло успешно',
            ua: 'Операція пройшла успішно'
        }), _defineProperty(_module$exports, "Stellar error", {
            ru: 'Ошибка. Обратитесь к администратору!',
            ua: 'Помилка. Зверніться до адміністратора!'
        }), _defineProperty(_module$exports, "Error save", {
            ru: 'Ошибка при сохранении',
            ua: 'Помилка при збереженні'
        }), _defineProperty(_module$exports, "OK", {
            ru: 'Подтвердить',
            ua: 'Підтвердити'
        }), _defineProperty(_module$exports, "Cancel", {
            ru: 'Отмена',
            ua: 'Відміна'
        }), _defineProperty(_module$exports, "Empty password", {
            ru: 'Пустой пароль',
            ua: 'Порожній пароль'
        }), _defineProperty(_module$exports, "Cannot get commissions", {
            ru: 'Не удалось получить комиссии',
            ua: 'Не вдалося отримати комісії'
        }), _defineProperty(_module$exports, "Cannot delete commissions", {
            ru: 'Не удалось удалить комиссии',
            ua: 'Не вдалося видалити комісію'
        }), _defineProperty(_module$exports, "Cannot delete signer", {
            ru: 'Не удалось удалить подписанта',
            ua: 'Не вдалося видалити підписанта'
        }), _defineProperty(_module$exports, "Delete commission", {
            ru: 'Комиссия удалена',
            ua: 'Комісія видалена'
        }), _defineProperty(_module$exports, "Commission saved", {
            ru: 'Комиссия сохранена',
            ua: 'Комісія збережена'
        }), _defineProperty(_module$exports, "Enter password", {
            ru: 'Пожалуйста, введите апроль',
            ua: 'Будь ласка, введіть пароль'
        }), _defineProperty(_module$exports, "Asset not exist", {
            ru: 'Валюта не найдена',
            ua: 'Валюта не знайдена'
        }), _defineProperty(_module$exports, "In Safari browser may be problems with downloading files. If Safari opened file in a new tab, instead of downloading, please click ⌘+S and save the file with the extension .smb (For example: file.smb)", {
            ru: 'В браузере Safari возможны проблемы со скачиванием файлов. Если Safari вместо скачивания, открыл файл в новой вкладке, пожалуйста, нажмите ⌘+S и сохраните файл с расширением .smb (Например: file.smb)',
            ua: 'У браузері Safari можливі проблеми зі скачування файлів. Якщо Safari замість завантаження, відкрив файл у новій вкладці, будь-ласка, натисніть ⌘+S і збережіть файл із розширенням .smb (Наприклад: file.smb)'
        }), _defineProperty(_module$exports, "Account exists", {
            ru: 'Администратор с таким логином уже существует',
            ua: 'Адмін з таким логіном вже існує'
        }), _defineProperty(_module$exports, "User registration", {
            ru: 'Регистрация пользователя',
            ua: 'Реєстрація користувача'
        }), _defineProperty(_module$exports, "Agent registration", {
            ru: 'Регистрация агента',
            ua: 'Реєстрація агента'
        }), _defineProperty(_module$exports, "Fill all required fields", {
            ru: 'Заполните все обязательный поля',
            ua: 'Заповніть всі обов\'язкові поля'
        }), _defineProperty(_module$exports, "Accepted", {
            ru: 'Принято',
            ua: 'Прийняте'
        }), _defineProperty(_module$exports, "Accept", {
            ru: 'Принять',
            ua: 'Прийняти'
        }), _defineProperty(_module$exports, "Declined", {
            ru: 'Отклонено',
            ua: 'Відхилено'
        }), _defineProperty(_module$exports, "Decline", {
            ru: 'Отклонить',
            ua: 'Відхилити'
        }), _defineProperty(_module$exports, "Enrollment successfully accepted", {
            ru: 'Приглашение успешно принято',
            ua: 'Запрошення успішно прийняте'
        }), _defineProperty(_module$exports, "Decline enrollment", {
            ru: 'Отклонить приглашение',
            ua: 'Відхилити запрошення'
        }), _defineProperty(_module$exports, "Service error. Please contact support", {
            ru: 'Сервисная ошибка. Обратитесь в службу поддержки',
            ua: 'Сервісна помилка. Зверніться у службу підтримки'
        }), _defineProperty(_module$exports, "Unknown error. Contact support", {
            ru: 'Неизвестная ошибка. Обратитесь в службу поддержки',
            ua: 'Невідома помилка. Зверніться у службу підтримки'
        }), _defineProperty(_module$exports, "Passwords must be equal", {
            ru: 'Пароли должны совпадать',
            ua: 'Паролі повинні співпадати'
        }), _defineProperty(_module$exports, "Your enrollment has been declined", {
            ru: 'Ваше приглашение было отклонено',
            ua: 'Ваше запрошення було відхилено'
        }), _defineProperty(_module$exports, "Token", {
            ru: 'Пароль',
            ua: 'Пароль'
        }), _defineProperty(_module$exports, "Warning", {
            ru: 'Внимание',
            ua: 'Увага'
        }), _defineProperty(_module$exports, "Compose your login and password or decline enrollment", {
            ru: 'Придумайте логин и пароль или отклоните приглашение',
            ua: 'Придумайте логін і пароль або відхиліть запрошення'
        }), _defineProperty(_module$exports, "Company code", {
            ru: 'Код компании',
            ua: 'Код компанії'
        }), _defineProperty(_module$exports, "Company title", {
            ru: 'Название компании',
            ua: 'Назва компанії'
        }), _defineProperty(_module$exports, "Company address", {
            ru: 'Адрес компании',
            ua: 'Адреса компанії'
        }), _defineProperty(_module$exports, "Company phone", {
            ru: 'Телефон компании',
            ua: 'Телефон компанії'
        }), _defineProperty(_module$exports, "Company email", {
            ru: 'Емейл компании',
            ua: 'Емейл компанії'
        }), _defineProperty(_module$exports, "Yes, decline it", {
            ru: 'Да, отклонить',
            ua: 'Так, відхилити'
        }), _defineProperty(_module$exports, "Full name", {
            ru: 'Полное имя',
            ua: 'Повне ім\'я'
        }), _defineProperty(_module$exports, "IPN code", {
            ru: 'Идентификационный код',
            ua: 'Ідентифікаційний код'
        }), _defineProperty(_module$exports, "Address", {
            ru: 'Адрес',
            ua: 'Адреса'
        }), _defineProperty(_module$exports, "Phone", {
            ru: 'Телефон',
            ua: 'Телефон'
        }), _defineProperty(_module$exports, "Email", {
            ru: 'Емейл',
            ua: 'Емейл'
        }), _module$exports);
    }, {}], 11: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Errors = require('../errors/Errors.js');

        var Auth = {

            setDefaults: function setDefaults() {
                this.keypair = m.prop(false);
                this.type = m.prop(false);
                this.api = m.prop(false);
                this.enrollment = m.prop(false);
            },

            userLogin: function userLogin(token) {

                Auth.type('user');
                Auth.keypair(StellarSdk.Keypair.random());
                Auth.api(new StellarWallet.Api(Conf.api_url, Auth.keypair()));

                return Auth.api().getUserEnrollment({ token: token }).then(function (enrollment) {
                    Auth.enrollment(enrollment);
                }).catch(function (err) {
                    console.error(err);
                    return m.flashApiError(err);
                });
            },

            agentLogin: function agentLogin(company_code, token) {

                Auth.type('agent');
                Auth.keypair(StellarSdk.Keypair.random());
                Auth.api(new StellarWallet.Api(Conf.api_url, Auth.keypair()));

                return Auth.api().getAgentEnrollment({ company_code: company_code, token: token }).then(function (enrollment) {
                    console.log(enrollment);
                    Auth.enrollment(enrollment);
                }).catch(function (err) {
                    console.error(err);
                    return m.flashApiError(err);
                });
            },

            logout: function logout() {
                window.location.href = '/';
            }
        };

        Auth.setDefaults();

        module.exports = Auth;
    }, { "../config/Config.js": 7, "../errors/Errors.js": 8 }], 12: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Navbar = require('../components/Navbar.js'),
            Footer = require('../components/Footer.js'),
            Auth = require('../models/Auth');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                this.accepted = m.prop(false);
                this.declined = m.prop(false);

                if (!Auth.enrollment()) {
                    return m.route('/');
                }
                if (Auth.type() != 'agent') {
                    return m.route('/');
                }

                this.acceptEnrollment = function (e) {
                    e.preventDefault();
                    m.onLoadingStart();
                    if (!e.target.login || !e.target.password || !e.target.password_confirm) {
                        return m.flashError(Conf.tr('Fill all required fields'));
                    }
                    if (e.target.password.value != e.target.password_confirm.value) {
                        return m.flashError(Conf.tr('Passwords must be equal'));
                    }
                    StellarWallet.createWallet({
                        server: Conf.wallet_host + '/v2',
                        username: e.target.login.value,
                        password: e.target.password.value,
                        accountId: Auth.keypair().accountId(),
                        publicKey: Auth.keypair().rawPublicKey().toString('base64'),
                        keychainData: Auth.keypair().seed(),
                        mainData: 'mainData',
                        kdfParams: {
                            algorithm: 'scrypt',
                            bits: 256,
                            n: Math.pow(2, 11),
                            r: 8,
                            p: 1
                        }
                    }).then(function () {
                        return Conf.horizon.assets().call();
                    }).then(function (assets) {

                        // var sequence = '0';
                        // var userAccount = new StellarSdk.Account(Auth.keypair().accountId(), sequence);
                        //
                        // var tx = new StellarSdk.TransactionBuilder(userAccount).addOperation(
                        //     StellarSdk.Operation.changeTrust({
                        //         asset: new StellarSdk.Asset(Auth.enrollment().asset, Conf.master_key)
                        //     })).build();
                        // tx.sign(Auth.keypair());
                        // var xdr = tx.toEnvelope().toXDR().toString("base64");
                        // return Auth.api().enrollmentAccept({
                        //     id: Auth.enrollment().id,
                        //     token: Auth.enrollment().otp,
                        //     account_id: Auth.keypair().accountId(),
                        //     tx_trust: xdr,
                        //     login: e.target.login.value
                        // });

                        //TODO: SMAR-400 Return code before SMAR-392

                        var sequence = '0';
                        var agentAccount = new StellarSdk.Account(Auth.keypair().accountId(), sequence);
                        var txBuilder = new StellarSdk.TransactionBuilder(agentAccount);

                        assets.records.map(function (asset) {

                            txBuilder.addOperation(StellarSdk.Operation.changeTrust({
                                asset: new StellarSdk.Asset(asset.asset_code, Conf.master_key)
                            }));
                        });

                        var tx = txBuilder.build();
                        tx.sign(Auth.keypair());
                        var xdr = tx.toEnvelope().toXDR().toString("base64");
                        return Auth.api().enrollmentAccept({
                            id: Auth.enrollment().id,
                            token: Auth.enrollment().otp,
                            account_id: Auth.keypair().accountId(),
                            tx_trust: xdr,
                            login: e.target.login.value
                        });
                    }).then(function (response) {
                        console.log(response);
                        m.startComputation();
                        ctrl.accepted(true);
                        m.endComputation();
                        swal(Conf.tr("Accepted") + "!", Conf.tr("Enrollment successfully accepted"), "success");
                    }).catch(function (err) {
                        console.error(err);
                        return m.flashApiError(err);
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.declineEnrollment = function () {
                    m.onLoadingStart();
                    swal({
                        title: Conf.tr("Decline enrollment") + '?',
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: Conf.tr("Yes, decline it"),
                        closeOnConfirm: false,
                        html: false
                    }, function () {
                        return Auth.api().enrollmentDecline({
                            id: Auth.enrollment().id,
                            token: Auth.enrollment().otp
                        }).then(function (response) {
                            console.log(response);
                            m.startComputation();
                            ctrl.declined(true);
                            m.endComputation();
                            swal(Conf.tr("Declined") + "!", Conf.tr("Your enrollment has been declined"), "success");
                        }).catch(function (err) {
                            console.error(err);
                            return m.flashApiError(err);
                        }).then(function () {
                            m.onLoadingEnd();
                        });
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "col-md-8 col-md-offset-2" }, children: [ctrl.accepted() || ctrl.declined() ? { tag: "div", attrs: {}, children: [ctrl.accepted() ? { tag: "div", attrs: { class: "alert alert-success" }, children: [Conf.tr("Enrollment successfully accepted")] } : { tag: "div", attrs: { class: "alert alert-warning" }, children: [{ tag: "strong", attrs: {}, children: [Conf.tr('Warning') + "!"] }, " ", Conf.tr("Your enrollment has been declined")] }] } : { tag: "div", attrs: { class: "panel panel-color panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Agent registration')] }, { tag: "p", attrs: { class: "panel-sub-title font-13" }, children: [Conf.tr('Compose your login and password or decline enrollment')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "col-md-6" }, children: [{ tag: "form", attrs: { id: "reg_form", method: "post", role: "form", onsubmit: ctrl.acceptEnrollment.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: {}, children: [Conf.tr('Login'), ":"] }, { tag: "input", attrs: { type: "text", class: "form-control", id: "login", name: "login", required: "required" } }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: {}, children: [Conf.tr('Password'), ":"] }, { tag: "input", attrs: { type: "password", class: "form-control", id: "password", name: "password", required: "required" } }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: {}, children: [Conf.tr('Repeat password'), ":"] }, { tag: "input", attrs: { type: "password", class: "form-control", id: "password_confirm", name: "password_confirm", required: "required" } }] }, { tag: "div", attrs: { class: "form-group m-b-0" }, children: [{ tag: "div", attrs: { class: "col-md-offset-1 col-md-10 text-center" }, children: [{ tag: "button", attrs: { type: "submit", class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5 m-r-15" }, children: [Conf.tr("Accept")] }, { tag: "button", attrs: { type: "button", class: "btn btn-danger btn-custom waves-effect w-md waves-light m-b-5 m-r-0",
                                                                    onclick: ctrl.declineEnrollment
                                                                }, children: [Conf.tr("Decline")] }] }] }] }] }, { tag: "div", attrs: { class: "col-md-6" }, children: [{ tag: "table", attrs: { class: "table m-0" }, children: [{ tag: "tbody", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Company code')] }, { tag: "td", attrs: {}, children: [Auth.enrollment().company_data.code] }] }, { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Company title')] }, { tag: "td", attrs: {}, children: [Auth.enrollment().company_data.title] }] }, { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Company address')] }, { tag: "td", attrs: {}, children: [Auth.enrollment().company_data.address] }] }, { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Company phone')] }, { tag: "td", attrs: {}, children: [Auth.enrollment().company_data.phone] }] }, { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Company email')] }, { tag: "td", attrs: {}, children: [Auth.enrollment().company_data.email] }] }] }] }] }] }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../components/Footer.js": 5, "../components/Navbar.js": 6, "../config/Config.js": 7, "../models/Auth": 11 }], 13: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Auth = require('../models/Auth.js'),
            Navbar = require('../components/Navbar.js'),
            Footer = require('../components/Footer.js');

        var Login = module.exports = {
            controller: function controller() {
                var ctrl = this;
                if (Auth.enrollment()) {
                    return m.route('/user');
                }

                this.login = function (e) {
                    e.preventDefault();

                    m.onLoadingStart();
                    Auth.agentLogin(e.target.company_code.value, e.target.token.value).then(function () {
                        m.onLoadingEnd();
                        m.route('/agent');
                    }).catch(function (err) {
                        m.flashError(err.message ? Conf.tr(err.message) : Conf.tr('Service error. Please contact support'));
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "text-right languages" }, children: [{ tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'en'), href: "#" }, children: ["EN"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ua'), href: "#" }, children: ["UA"] }] }, { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: { class: "text-center logo" }, children: [{ tag: "img", attrs: { src: "/assets/img/logo.svg", alt: "Smartmoney logo" } }, { tag: "h4", attrs: {}, children: [Conf.tr('Welcome host')] }] }, { tag: "form", attrs: { class: "form-horizontal m-t-20", onsubmit: ctrl.login.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text", required: "required",
                                            placeholder: Conf.tr("Company code"),
                                            autocapitalize: "none",
                                            name: "company_code" } }, { tag: "i", attrs: { class: "md md-account-circle form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password", required: "required",
                                            placeholder: Conf.tr("Token"),
                                            autocapitalize: "none",
                                            name: "token" } }, { tag: "i", attrs: { class: "md md-account-circle form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group m-t-20 text-center" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-lg btn-custom waves-effect w-md waves-light m-b-5",
                                        type: "submit" }, children: [Conf.tr("Login")] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../components/Footer.js": 5, "../components/Navbar.js": 6, "../config/Config.js": 7, "../models/Auth.js": 11 }], 14: [function (require, module, exports) {
        var Auth = require('../models/Auth.js');

        var Logout = module.exports = {
            controller: function controller() {
                Auth.logout();
                m.route('/');
            },

            view: function view(ctrl) {}
        };
    }, { "../models/Auth.js": 11 }], 15: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Navbar = require('../components/Navbar.js'),
            Footer = require('../components/Footer.js'),
            Auth = require('../models/Auth');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                this.accepted = m.prop(false);
                this.declined = m.prop(false);

                if (!Auth.enrollment()) {
                    return m.route('/u');
                }
                if (Auth.type() != 'user') {
                    return m.route('/u');
                }

                this.acceptEnrollment = function (e) {
                    e.preventDefault();
                    m.onLoadingStart();
                    if (!e.target.login || !e.target.password || !e.target.password_confirm) {
                        return m.flashError(Conf.tr('Fill all required fields'));
                    }
                    if (e.target.password.value != e.target.password_confirm.value) {
                        return m.flashError(Conf.tr('Passwords must be equal'));
                    }
                    StellarWallet.createWallet({
                        server: Conf.wallet_host + '/v2',
                        username: e.target.login.value,
                        password: e.target.password.value,
                        accountId: Auth.keypair().accountId(),
                        publicKey: Auth.keypair().rawPublicKey().toString('base64'),
                        keychainData: Auth.keypair().seed(),
                        mainData: 'mainData',
                        kdfParams: {
                            algorithm: 'scrypt',
                            bits: 256,
                            n: Math.pow(2, 11),
                            r: 8,
                            p: 1
                        }
                    }).then(function (wallet) {
                        var sequence = '0';
                        var userAccount = new StellarSdk.Account(Auth.keypair().accountId(), sequence);

                        var tx = new StellarSdk.TransactionBuilder(userAccount).addOperation(StellarSdk.Operation.changeTrust({
                            asset: new StellarSdk.Asset(Auth.enrollment().asset, Conf.master_key)
                        })).build();
                        tx.sign(Auth.keypair());
                        var xdr = tx.toEnvelope().toXDR().toString("base64");
                        return Auth.api().enrollmentAccept({
                            id: Auth.enrollment().id,
                            token: Auth.enrollment().otp,
                            account_id: Auth.keypair().accountId(),
                            tx_trust: xdr,
                            login: e.target.login.value
                        });
                    }).then(function (response) {
                        console.log(response);
                        m.startComputation();
                        ctrl.accepted(true);
                        m.endComputation();
                        swal(Conf.tr("Accepted") + "!", Conf.tr("Enrollment successfully accepted"), "success");
                    }).catch(function (err) {
                        console.error(err);
                        return m.flashApiError(err);
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.declineEnrollment = function () {
                    m.onLoadingStart();
                    swal({
                        title: Conf.tr("Decline enrollment") + '?',
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: Conf.tr("Yes, decline it"),
                        cancelButtonText: Conf.tr("Cancel"),
                        closeOnConfirm: true,
                        html: false
                    }, function (isConfirm) {

                        if (isConfirm) {
                            return Auth.api().enrollmentDecline({
                                id: Auth.enrollment().id,
                                token: Auth.enrollment().otp
                            }).then(function (response) {
                                m.startComputation();
                                ctrl.declined(true);
                                m.endComputation();
                                swal(Conf.tr("Declined") + "!", Conf.tr("Your enrollment has been declined"), "success");
                            }).catch(function (err) {
                                console.error(err);
                                return m.flashApiError(err);
                            }).then(function () {
                                m.onLoadingEnd();
                            });
                        } else {
                            m.onLoadingEnd();
                        }
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "col-md-8 col-md-offset-2" }, children: [ctrl.accepted() || ctrl.declined() ? { tag: "div", attrs: {}, children: [ctrl.accepted() ? { tag: "div", attrs: { class: "alert alert-success" }, children: [Conf.tr("Enrollment successfully accepted")] } : { tag: "div", attrs: { class: "alert alert-warning" }, children: [{ tag: "strong", attrs: {}, children: [Conf.tr('Warning') + "!"] }, " ", Conf.tr("Your enrollment has been declined")] }] } : { tag: "div", attrs: { class: "panel panel-color panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('User registration')] }, { tag: "p", attrs: { class: "panel-sub-title font-13" }, children: [Conf.tr('Compose your login and password or decline enrollment')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "col-md-6" }, children: [{ tag: "form", attrs: { id: "reg_form", method: "post", role: "form", onsubmit: ctrl.acceptEnrollment.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: {}, children: [Conf.tr('Login'), ":"] }, { tag: "input", attrs: { type: "text", class: "form-control", id: "login", name: "login", required: "required" } }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: {}, children: [Conf.tr('Password'), ":"] }, { tag: "input", attrs: { type: "password", class: "form-control", id: "password", name: "password", required: "required" } }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: {}, children: [Conf.tr('Repeat password'), ":"] }, { tag: "input", attrs: { type: "password", class: "form-control", id: "password_confirm", name: "password_confirm", required: "required" } }] }, { tag: "div", attrs: { class: "form-group m-b-0" }, children: [{ tag: "div", attrs: { class: "col-md-offset-1 col-md-10 text-center" }, children: [{ tag: "button", attrs: { type: "submit", class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5 m-r-15" }, children: [Conf.tr("Accept")] }, { tag: "button", attrs: { type: "button", class: "btn btn-danger btn-custom waves-effect w-md waves-light m-b-5 m-r-0",
                                                                    onclick: ctrl.declineEnrollment
                                                                }, children: [Conf.tr("Decline")] }] }] }] }] }, { tag: "div", attrs: { class: "col-md-6" }, children: [{ tag: "table", attrs: { class: "table m-0" }, children: [{ tag: "tbody", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Full name')] }, { tag: "td", attrs: {}, children: [Auth.enrollment().user_data.surname, " ", Auth.enrollment().user_data.name, " ", Auth.enrollment().user_data.middle_name] }] }, { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Passport')] }, { tag: "td", attrs: {}, children: [Auth.enrollment().user_data.passport] }] }, { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('IPN code')] }, { tag: "td", attrs: {}, children: [Auth.enrollment().user_data.ipn_code] }] }, { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Address')] }, { tag: "td", attrs: {}, children: [Auth.enrollment().user_data.address] }] }, { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Phone')] }, { tag: "td", attrs: {}, children: [Auth.enrollment().user_data.phone] }] }, { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Email')] }, { tag: "td", attrs: {}, children: [Auth.enrollment().user_data.email] }] }] }] }] }] }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../components/Footer.js": 5, "../components/Navbar.js": 6, "../config/Config.js": 7, "../models/Auth": 11 }], 16: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Auth = require('../models/Auth.js'),
            Navbar = require('../components/Navbar.js'),
            Footer = require('../components/Footer.js');

        var Login = module.exports = {
            controller: function controller() {
                var ctrl = this;
                if (Auth.enrollment()) {
                    return m.route('/user');
                }

                this.login = function (e) {
                    e.preventDefault();

                    m.onLoadingStart();
                    Auth.userLogin(e.target.token.value).then(function () {
                        m.onLoadingEnd();
                        m.route('/user');
                    }).catch(function (err) {
                        m.flashError(err.message ? Conf.tr(err.message) : Conf.tr('Service error. Please contact support'));
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "text-right languages" }, children: [{ tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'en'), href: "#" }, children: ["EN"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ua'), href: "#" }, children: ["UA"] }] }, { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: { class: "text-center logo" }, children: [{ tag: "img", attrs: { src: "/assets/img/logo.svg", alt: "Smartmoney logo" } }, { tag: "h4", attrs: {}, children: [Conf.tr('Welcome host')] }] }, { tag: "form", attrs: { class: "form-horizontal m-t-20", onsubmit: ctrl.login.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password", required: "required",
                                            placeholder: Conf.tr("Token"),
                                            autocapitalize: "none",
                                            name: "token" } }, { tag: "i", attrs: { class: "md md-account-circle form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group m-t-20 text-center" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-lg btn-custom waves-effect w-md waves-light m-b-5",
                                        type: "submit" }, children: [Conf.tr("Login")] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../components/Footer.js": 5, "../components/Navbar.js": 6, "../config/Config.js": 7, "../models/Auth.js": 11 }] }, {}, [9]);