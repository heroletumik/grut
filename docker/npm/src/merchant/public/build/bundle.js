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
})({ 1: [function (require, module, exports) {
        if (typeof Object.create === 'function') {
            // implementation from standard node.js 'util' module
            module.exports = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor;
                ctor.prototype = Object.create(superCtor.prototype, {
                    constructor: {
                        value: ctor,
                        enumerable: false,
                        writable: true,
                        configurable: true
                    }
                });
            };
        } else {
            // old school shim for old browsers
            module.exports = function inherits(ctor, superCtor) {
                ctor.super_ = superCtor;
                var TempCtor = function TempCtor() {};
                TempCtor.prototype = superCtor.prototype;
                ctor.prototype = new TempCtor();
                ctor.prototype.constructor = ctor;
            };
        }
    }, {}], 2: [function (require, module, exports) {
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
    }, { "fs": 25, "path": 27 }], 3: [function (require, module, exports) {
        //---------------------------------------------------------------------
        //
        // QR Code Generator for JavaScript
        //
        // Copyright (c) 2009 Kazuhiko Arase
        //
        // URL: http://www.d-project.com/
        //
        // Licensed under the MIT license:
        //	http://www.opensource.org/licenses/mit-license.php
        //
        // The word 'QR Code' is registered trademark of
        // DENSO WAVE INCORPORATED
        //	http://www.denso-wave.com/qrcode/faqpatent-e.html
        //
        //---------------------------------------------------------------------

        exports.qrcode = function () {

            //---------------------------------------------------------------------
            // qrcode
            //---------------------------------------------------------------------

            /**
             * qrcode
             * @param typeNumber 1 to 10
             * @param errorCorrectLevel 'L','M','Q','H'
             */
            var qrcode = function qrcode(typeNumber, errorCorrectLevel) {

                var PAD0 = 0xEC;
                var PAD1 = 0x11;

                var _typeNumber = typeNumber;
                var _errorCorrectLevel = QRErrorCorrectLevel[errorCorrectLevel];
                var _modules = null;
                var _moduleCount = 0;
                var _dataCache = null;
                var _dataList = new Array();

                var _this = {};

                var makeImpl = function makeImpl(test, maskPattern) {

                    _moduleCount = _typeNumber * 4 + 17;
                    _modules = function (moduleCount) {
                        var modules = new Array(moduleCount);
                        for (var row = 0; row < moduleCount; row += 1) {
                            modules[row] = new Array(moduleCount);
                            for (var col = 0; col < moduleCount; col += 1) {
                                modules[row][col] = null;
                            }
                        }
                        return modules;
                    }(_moduleCount);

                    setupPositionProbePattern(0, 0);
                    setupPositionProbePattern(_moduleCount - 7, 0);
                    setupPositionProbePattern(0, _moduleCount - 7);
                    setupPositionAdjustPattern();
                    setupTimingPattern();
                    setupTypeInfo(test, maskPattern);

                    if (_typeNumber >= 7) {
                        setupTypeNumber(test);
                    }

                    if (_dataCache == null) {
                        _dataCache = createData(_typeNumber, _errorCorrectLevel, _dataList);
                    }

                    mapData(_dataCache, maskPattern);
                };

                var setupPositionProbePattern = function setupPositionProbePattern(row, col) {

                    for (var r = -1; r <= 7; r += 1) {

                        if (row + r <= -1 || _moduleCount <= row + r) continue;

                        for (var c = -1; c <= 7; c += 1) {

                            if (col + c <= -1 || _moduleCount <= col + c) continue;

                            if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
                                _modules[row + r][col + c] = true;
                            } else {
                                _modules[row + r][col + c] = false;
                            }
                        }
                    }
                };

                var getBestMaskPattern = function getBestMaskPattern() {

                    var minLostPoint = 0;
                    var pattern = 0;

                    for (var i = 0; i < 8; i += 1) {

                        makeImpl(true, i);

                        var lostPoint = QRUtil.getLostPoint(_this);

                        if (i == 0 || minLostPoint > lostPoint) {
                            minLostPoint = lostPoint;
                            pattern = i;
                        }
                    }

                    return pattern;
                };

                var setupTimingPattern = function setupTimingPattern() {

                    for (var r = 8; r < _moduleCount - 8; r += 1) {
                        if (_modules[r][6] != null) {
                            continue;
                        }
                        _modules[r][6] = r % 2 == 0;
                    }

                    for (var c = 8; c < _moduleCount - 8; c += 1) {
                        if (_modules[6][c] != null) {
                            continue;
                        }
                        _modules[6][c] = c % 2 == 0;
                    }
                };

                var setupPositionAdjustPattern = function setupPositionAdjustPattern() {

                    var pos = QRUtil.getPatternPosition(_typeNumber);

                    for (var i = 0; i < pos.length; i += 1) {

                        for (var j = 0; j < pos.length; j += 1) {

                            var row = pos[i];
                            var col = pos[j];

                            if (_modules[row][col] != null) {
                                continue;
                            }

                            for (var r = -2; r <= 2; r += 1) {

                                for (var c = -2; c <= 2; c += 1) {

                                    if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
                                        _modules[row + r][col + c] = true;
                                    } else {
                                        _modules[row + r][col + c] = false;
                                    }
                                }
                            }
                        }
                    }
                };

                var setupTypeNumber = function setupTypeNumber(test) {

                    var bits = QRUtil.getBCHTypeNumber(_typeNumber);

                    for (var i = 0; i < 18; i += 1) {
                        var mod = !test && (bits >> i & 1) == 1;
                        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
                    }

                    for (var i = 0; i < 18; i += 1) {
                        var mod = !test && (bits >> i & 1) == 1;
                        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
                    }
                };

                var setupTypeInfo = function setupTypeInfo(test, maskPattern) {

                    var data = _errorCorrectLevel << 3 | maskPattern;
                    var bits = QRUtil.getBCHTypeInfo(data);

                    // vertical
                    for (var i = 0; i < 15; i += 1) {

                        var mod = !test && (bits >> i & 1) == 1;

                        if (i < 6) {
                            _modules[i][8] = mod;
                        } else if (i < 8) {
                            _modules[i + 1][8] = mod;
                        } else {
                            _modules[_moduleCount - 15 + i][8] = mod;
                        }
                    }

                    // horizontal
                    for (var i = 0; i < 15; i += 1) {

                        var mod = !test && (bits >> i & 1) == 1;

                        if (i < 8) {
                            _modules[8][_moduleCount - i - 1] = mod;
                        } else if (i < 9) {
                            _modules[8][15 - i - 1 + 1] = mod;
                        } else {
                            _modules[8][15 - i - 1] = mod;
                        }
                    }

                    // fixed module
                    _modules[_moduleCount - 8][8] = !test;
                };

                var mapData = function mapData(data, maskPattern) {

                    var inc = -1;
                    var row = _moduleCount - 1;
                    var bitIndex = 7;
                    var byteIndex = 0;
                    var maskFunc = QRUtil.getMaskFunction(maskPattern);

                    for (var col = _moduleCount - 1; col > 0; col -= 2) {

                        if (col == 6) col -= 1;

                        while (true) {

                            for (var c = 0; c < 2; c += 1) {

                                if (_modules[row][col - c] == null) {

                                    var dark = false;

                                    if (byteIndex < data.length) {
                                        dark = (data[byteIndex] >>> bitIndex & 1) == 1;
                                    }

                                    var mask = maskFunc(row, col - c);

                                    if (mask) {
                                        dark = !dark;
                                    }

                                    _modules[row][col - c] = dark;
                                    bitIndex -= 1;

                                    if (bitIndex == -1) {
                                        byteIndex += 1;
                                        bitIndex = 7;
                                    }
                                }
                            }

                            row += inc;

                            if (row < 0 || _moduleCount <= row) {
                                row -= inc;
                                inc = -inc;
                                break;
                            }
                        }
                    }
                };

                var createBytes = function createBytes(buffer, rsBlocks) {

                    var offset = 0;

                    var maxDcCount = 0;
                    var maxEcCount = 0;

                    var dcdata = new Array(rsBlocks.length);
                    var ecdata = new Array(rsBlocks.length);

                    for (var r = 0; r < rsBlocks.length; r += 1) {

                        var dcCount = rsBlocks[r].dataCount;
                        var ecCount = rsBlocks[r].totalCount - dcCount;

                        maxDcCount = Math.max(maxDcCount, dcCount);
                        maxEcCount = Math.max(maxEcCount, ecCount);

                        dcdata[r] = new Array(dcCount);

                        for (var i = 0; i < dcdata[r].length; i += 1) {
                            dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
                        }
                        offset += dcCount;

                        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
                        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

                        var modPoly = rawPoly.mod(rsPoly);
                        ecdata[r] = new Array(rsPoly.getLength() - 1);
                        for (var i = 0; i < ecdata[r].length; i += 1) {
                            var modIndex = i + modPoly.getLength() - ecdata[r].length;
                            ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
                        }
                    }

                    var totalCodeCount = 0;
                    for (var i = 0; i < rsBlocks.length; i += 1) {
                        totalCodeCount += rsBlocks[i].totalCount;
                    }

                    var data = new Array(totalCodeCount);
                    var index = 0;

                    for (var i = 0; i < maxDcCount; i += 1) {
                        for (var r = 0; r < rsBlocks.length; r += 1) {
                            if (i < dcdata[r].length) {
                                data[index] = dcdata[r][i];
                                index += 1;
                            }
                        }
                    }

                    for (var i = 0; i < maxEcCount; i += 1) {
                        for (var r = 0; r < rsBlocks.length; r += 1) {
                            if (i < ecdata[r].length) {
                                data[index] = ecdata[r][i];
                                index += 1;
                            }
                        }
                    }

                    return data;
                };

                var createData = function createData(typeNumber, errorCorrectLevel, dataList) {

                    var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);

                    var buffer = qrBitBuffer();

                    for (var i = 0; i < dataList.length; i += 1) {
                        var data = dataList[i];
                        buffer.put(data.getMode(), 4);
                        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber));
                        data.write(buffer);
                    }

                    // calc num max data.
                    var totalDataCount = 0;
                    for (var i = 0; i < rsBlocks.length; i += 1) {
                        totalDataCount += rsBlocks[i].dataCount;
                    }

                    if (buffer.getLengthInBits() > totalDataCount * 8) {
                        throw new Error('code length overflow. (' + buffer.getLengthInBits() + '>' + totalDataCount * 8 + ')');
                    }

                    // end code
                    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
                        buffer.put(0, 4);
                    }

                    // padding
                    while (buffer.getLengthInBits() % 8 != 0) {
                        buffer.putBit(false);
                    }

                    // padding
                    while (true) {

                        if (buffer.getLengthInBits() >= totalDataCount * 8) {
                            break;
                        }
                        buffer.put(PAD0, 8);

                        if (buffer.getLengthInBits() >= totalDataCount * 8) {
                            break;
                        }
                        buffer.put(PAD1, 8);
                    }

                    return createBytes(buffer, rsBlocks);
                };

                _this.addData = function (data) {
                    var newData = qr8BitByte(data);
                    _dataList.push(newData);
                    _dataCache = null;
                };

                _this.isDark = function (row, col) {
                    if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
                        throw new Error(row + ',' + col);
                    }
                    return _modules[row][col];
                };

                _this.getModuleCount = function () {
                    return _moduleCount;
                };

                _this.make = function () {
                    makeImpl(false, getBestMaskPattern());
                };

                _this.createTableTag = function (cellSize, margin) {

                    cellSize = cellSize || 2;
                    margin = typeof margin == 'undefined' ? cellSize * 4 : margin;

                    var qrHtml = '';

                    qrHtml += '<table style="';
                    qrHtml += ' border-width: 0px; border-style: none;';
                    qrHtml += ' border-collapse: collapse;';
                    qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
                    qrHtml += '">';
                    qrHtml += '<tbody>';

                    for (var r = 0; r < _this.getModuleCount(); r += 1) {

                        qrHtml += '<tr>';

                        for (var c = 0; c < _this.getModuleCount(); c += 1) {
                            qrHtml += '<td style="';
                            qrHtml += ' border-width: 0px; border-style: none;';
                            qrHtml += ' border-collapse: collapse;';
                            qrHtml += ' padding: 0px; margin: 0px;';
                            qrHtml += ' width: ' + cellSize + 'px;';
                            qrHtml += ' height: ' + cellSize + 'px;';
                            qrHtml += ' background-color: ';
                            qrHtml += _this.isDark(r, c) ? '#000000' : '#ffffff';
                            qrHtml += ';';
                            qrHtml += '"/>';
                        }

                        qrHtml += '</tr>';
                    }

                    qrHtml += '</tbody>';
                    qrHtml += '</table>';

                    return qrHtml;
                };

                _this.createImgTag = function (cellSize, margin) {

                    cellSize = cellSize || 2;
                    margin = typeof margin == 'undefined' ? cellSize * 4 : margin;

                    var size = _this.getModuleCount() * cellSize + margin * 2;
                    var min = margin;
                    var max = size - margin;

                    return createImgTag(size, size, function (x, y) {
                        if (min <= x && x < max && min <= y && y < max) {
                            var c = Math.floor((x - min) / cellSize);
                            var r = Math.floor((y - min) / cellSize);
                            return _this.isDark(r, c) ? 0 : 1;
                        } else {
                            return 1;
                        }
                    });
                };

                return _this;
            };

            //---------------------------------------------------------------------
            // qrcode.stringToBytes
            //---------------------------------------------------------------------

            qrcode.stringToBytes = function (s) {
                var bytes = new Array();
                for (var i = 0; i < s.length; i += 1) {
                    var c = s.charCodeAt(i);
                    bytes.push(c & 0xff);
                }
                return bytes;
            };

            //---------------------------------------------------------------------
            // qrcode.createStringToBytes
            //---------------------------------------------------------------------

            /**
             * @param unicodeData base64 string of byte array.
             * [16bit Unicode],[16bit Bytes], ...
             * @param numChars
             */
            qrcode.createStringToBytes = function (unicodeData, numChars) {

                // create conversion map.

                var unicodeMap = function () {

                    var bin = base64DecodeInputStream(unicodeData);
                    var read = function read() {
                        var b = bin.read();
                        if (b == -1) throw new Error();
                        return b;
                    };

                    var count = 0;
                    var unicodeMap = {};
                    while (true) {
                        var b0 = bin.read();
                        if (b0 == -1) break;
                        var b1 = read();
                        var b2 = read();
                        var b3 = read();
                        var k = String.fromCharCode(b0 << 8 | b1);
                        var v = b2 << 8 | b3;
                        unicodeMap[k] = v;
                        count += 1;
                    }
                    if (count != numChars) {
                        throw new Error(count + ' != ' + numChars);
                    }

                    return unicodeMap;
                }();

                var unknownChar = '?'.charCodeAt(0);

                return function (s) {
                    var bytes = new Array();
                    for (var i = 0; i < s.length; i += 1) {
                        var c = s.charCodeAt(i);
                        if (c < 128) {
                            bytes.push(c);
                        } else {
                            var b = unicodeMap[s.charAt(i)];
                            if (typeof b == 'number') {
                                if ((b & 0xff) == b) {
                                    // 1byte
                                    bytes.push(b);
                                } else {
                                    // 2bytes
                                    bytes.push(b >>> 8);
                                    bytes.push(b & 0xff);
                                }
                            } else {
                                bytes.push(unknownChar);
                            }
                        }
                    }
                    return bytes;
                };
            };

            //---------------------------------------------------------------------
            // QRMode
            //---------------------------------------------------------------------

            var QRMode = {
                MODE_NUMBER: 1 << 0,
                MODE_ALPHA_NUM: 1 << 1,
                MODE_8BIT_BYTE: 1 << 2,
                MODE_KANJI: 1 << 3
            };

            //---------------------------------------------------------------------
            // QRErrorCorrectLevel
            //---------------------------------------------------------------------

            var QRErrorCorrectLevel = {
                L: 1,
                M: 0,
                Q: 3,
                H: 2
            };

            //---------------------------------------------------------------------
            // QRMaskPattern
            //---------------------------------------------------------------------

            var QRMaskPattern = {
                PATTERN000: 0,
                PATTERN001: 1,
                PATTERN010: 2,
                PATTERN011: 3,
                PATTERN100: 4,
                PATTERN101: 5,
                PATTERN110: 6,
                PATTERN111: 7
            };

            //---------------------------------------------------------------------
            // QRUtil
            //---------------------------------------------------------------------

            var QRUtil = function () {

                var PATTERN_POSITION_TABLE = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]];
                var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
                var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
                var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;

                var _this = {};

                var getBCHDigit = function getBCHDigit(data) {
                    var digit = 0;
                    while (data != 0) {
                        digit += 1;
                        data >>>= 1;
                    }
                    return digit;
                };

                _this.getBCHTypeInfo = function (data) {
                    var d = data << 10;
                    while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
                        d ^= G15 << getBCHDigit(d) - getBCHDigit(G15);
                    }
                    return (data << 10 | d) ^ G15_MASK;
                };

                _this.getBCHTypeNumber = function (data) {
                    var d = data << 12;
                    while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
                        d ^= G18 << getBCHDigit(d) - getBCHDigit(G18);
                    }
                    return data << 12 | d;
                };

                _this.getPatternPosition = function (typeNumber) {
                    return PATTERN_POSITION_TABLE[typeNumber - 1];
                };

                _this.getMaskFunction = function (maskPattern) {

                    switch (maskPattern) {

                        case QRMaskPattern.PATTERN000:
                            return function (i, j) {
                                return (i + j) % 2 == 0;
                            };
                        case QRMaskPattern.PATTERN001:
                            return function (i, j) {
                                return i % 2 == 0;
                            };
                        case QRMaskPattern.PATTERN010:
                            return function (i, j) {
                                return j % 3 == 0;
                            };
                        case QRMaskPattern.PATTERN011:
                            return function (i, j) {
                                return (i + j) % 3 == 0;
                            };
                        case QRMaskPattern.PATTERN100:
                            return function (i, j) {
                                return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
                            };
                        case QRMaskPattern.PATTERN101:
                            return function (i, j) {
                                return i * j % 2 + i * j % 3 == 0;
                            };
                        case QRMaskPattern.PATTERN110:
                            return function (i, j) {
                                return (i * j % 2 + i * j % 3) % 2 == 0;
                            };
                        case QRMaskPattern.PATTERN111:
                            return function (i, j) {
                                return (i * j % 3 + (i + j) % 2) % 2 == 0;
                            };

                        default:
                            throw new Error('bad maskPattern:' + maskPattern);
                    }
                };

                _this.getErrorCorrectPolynomial = function (errorCorrectLength) {
                    var a = qrPolynomial([1], 0);
                    for (var i = 0; i < errorCorrectLength; i += 1) {
                        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0));
                    }
                    return a;
                };

                _this.getLengthInBits = function (mode, type) {

                    if (1 <= type && type < 10) {

                        // 1 - 9

                        switch (mode) {
                            case QRMode.MODE_NUMBER:
                                return 10;
                            case QRMode.MODE_ALPHA_NUM:
                                return 9;
                            case QRMode.MODE_8BIT_BYTE:
                                return 8;
                            case QRMode.MODE_KANJI:
                                return 8;
                            default:
                                throw new Error('mode:' + mode);
                        }
                    } else if (type < 27) {

                        // 10 - 26

                        switch (mode) {
                            case QRMode.MODE_NUMBER:
                                return 12;
                            case QRMode.MODE_ALPHA_NUM:
                                return 11;
                            case QRMode.MODE_8BIT_BYTE:
                                return 16;
                            case QRMode.MODE_KANJI:
                                return 10;
                            default:
                                throw new Error('mode:' + mode);
                        }
                    } else if (type < 41) {

                        // 27 - 40

                        switch (mode) {
                            case QRMode.MODE_NUMBER:
                                return 14;
                            case QRMode.MODE_ALPHA_NUM:
                                return 13;
                            case QRMode.MODE_8BIT_BYTE:
                                return 16;
                            case QRMode.MODE_KANJI:
                                return 12;
                            default:
                                throw new Error('mode:' + mode);
                        }
                    } else {
                        throw new Error('type:' + type);
                    }
                };

                _this.getLostPoint = function (qrcode) {

                    var moduleCount = qrcode.getModuleCount();

                    var lostPoint = 0;

                    // LEVEL1

                    for (var row = 0; row < moduleCount; row += 1) {
                        for (var col = 0; col < moduleCount; col += 1) {

                            var sameCount = 0;
                            var dark = qrcode.isDark(row, col);

                            for (var r = -1; r <= 1; r += 1) {

                                if (row + r < 0 || moduleCount <= row + r) {
                                    continue;
                                }

                                for (var c = -1; c <= 1; c += 1) {

                                    if (col + c < 0 || moduleCount <= col + c) {
                                        continue;
                                    }

                                    if (r == 0 && c == 0) {
                                        continue;
                                    }

                                    if (dark == qrcode.isDark(row + r, col + c)) {
                                        sameCount += 1;
                                    }
                                }
                            }

                            if (sameCount > 5) {
                                lostPoint += 3 + sameCount - 5;
                            }
                        }
                    };

                    // LEVEL2

                    for (var row = 0; row < moduleCount - 1; row += 1) {
                        for (var col = 0; col < moduleCount - 1; col += 1) {
                            var count = 0;
                            if (qrcode.isDark(row, col)) count += 1;
                            if (qrcode.isDark(row + 1, col)) count += 1;
                            if (qrcode.isDark(row, col + 1)) count += 1;
                            if (qrcode.isDark(row + 1, col + 1)) count += 1;
                            if (count == 0 || count == 4) {
                                lostPoint += 3;
                            }
                        }
                    }

                    // LEVEL3

                    for (var row = 0; row < moduleCount; row += 1) {
                        for (var col = 0; col < moduleCount - 6; col += 1) {
                            if (qrcode.isDark(row, col) && !qrcode.isDark(row, col + 1) && qrcode.isDark(row, col + 2) && qrcode.isDark(row, col + 3) && qrcode.isDark(row, col + 4) && !qrcode.isDark(row, col + 5) && qrcode.isDark(row, col + 6)) {
                                lostPoint += 40;
                            }
                        }
                    }

                    for (var col = 0; col < moduleCount; col += 1) {
                        for (var row = 0; row < moduleCount - 6; row += 1) {
                            if (qrcode.isDark(row, col) && !qrcode.isDark(row + 1, col) && qrcode.isDark(row + 2, col) && qrcode.isDark(row + 3, col) && qrcode.isDark(row + 4, col) && !qrcode.isDark(row + 5, col) && qrcode.isDark(row + 6, col)) {
                                lostPoint += 40;
                            }
                        }
                    }

                    // LEVEL4

                    var darkCount = 0;

                    for (var col = 0; col < moduleCount; col += 1) {
                        for (var row = 0; row < moduleCount; row += 1) {
                            if (qrcode.isDark(row, col)) {
                                darkCount += 1;
                            }
                        }
                    }

                    var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
                    lostPoint += ratio * 10;

                    return lostPoint;
                };

                return _this;
            }();

            //---------------------------------------------------------------------
            // QRMath
            //---------------------------------------------------------------------

            var QRMath = function () {

                var EXP_TABLE = new Array(256);
                var LOG_TABLE = new Array(256);

                // initialize tables
                for (var i = 0; i < 8; i += 1) {
                    EXP_TABLE[i] = 1 << i;
                }
                for (var i = 8; i < 256; i += 1) {
                    EXP_TABLE[i] = EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
                }
                for (var i = 0; i < 255; i += 1) {
                    LOG_TABLE[EXP_TABLE[i]] = i;
                }

                var _this = {};

                _this.glog = function (n) {

                    if (n < 1) {
                        throw new Error('glog(' + n + ')');
                    }

                    return LOG_TABLE[n];
                };

                _this.gexp = function (n) {

                    while (n < 0) {
                        n += 255;
                    }

                    while (n >= 256) {
                        n -= 255;
                    }

                    return EXP_TABLE[n];
                };

                return _this;
            }();

            //---------------------------------------------------------------------
            // qrPolynomial
            //---------------------------------------------------------------------

            function qrPolynomial(num, shift) {

                if (typeof num.length == 'undefined') {
                    throw new Error(num.length + '/' + shift);
                }

                var _num = function () {
                    var offset = 0;
                    while (offset < num.length && num[offset] == 0) {
                        offset += 1;
                    }
                    var _num = new Array(num.length - offset + shift);
                    for (var i = 0; i < num.length - offset; i += 1) {
                        _num[i] = num[i + offset];
                    }
                    return _num;
                }();

                var _this = {};

                _this.get = function (index) {
                    return _num[index];
                };

                _this.getLength = function () {
                    return _num.length;
                };

                _this.multiply = function (e) {

                    var num = new Array(_this.getLength() + e.getLength() - 1);

                    for (var i = 0; i < _this.getLength(); i += 1) {
                        for (var j = 0; j < e.getLength(); j += 1) {
                            num[i + j] ^= QRMath.gexp(QRMath.glog(_this.get(i)) + QRMath.glog(e.get(j)));
                        }
                    }

                    return qrPolynomial(num, 0);
                };

                _this.mod = function (e) {

                    if (_this.getLength() - e.getLength() < 0) {
                        return _this;
                    }

                    var ratio = QRMath.glog(_this.get(0)) - QRMath.glog(e.get(0));

                    var num = new Array(_this.getLength());
                    for (var i = 0; i < _this.getLength(); i += 1) {
                        num[i] = _this.get(i);
                    }

                    for (var i = 0; i < e.getLength(); i += 1) {
                        num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
                    }

                    // recursive call
                    return qrPolynomial(num, 0).mod(e);
                };

                return _this;
            };

            //---------------------------------------------------------------------
            // QRRSBlock
            //---------------------------------------------------------------------

            var QRRSBlock = function () {

                var RS_BLOCK_TABLE = [

                // L
                // M
                // Q
                // H

                // 1
                [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],

                // 2
                [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],

                // 3
                [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],

                // 4
                [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],

                // 5
                [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],

                // 6
                [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],

                // 7
                [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],

                // 8
                [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],

                // 9
                [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],

                // 10
                [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16]];

                var qrRSBlock = function qrRSBlock(totalCount, dataCount) {
                    var _this = {};
                    _this.totalCount = totalCount;
                    _this.dataCount = dataCount;
                    return _this;
                };

                var _this = {};

                var getRsBlockTable = function getRsBlockTable(typeNumber, errorCorrectLevel) {

                    switch (errorCorrectLevel) {
                        case QRErrorCorrectLevel.L:
                            return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
                        case QRErrorCorrectLevel.M:
                            return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
                        case QRErrorCorrectLevel.Q:
                            return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
                        case QRErrorCorrectLevel.H:
                            return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
                        default:
                            return undefined;
                    }
                };

                _this.getRSBlocks = function (typeNumber, errorCorrectLevel) {

                    var rsBlock = getRsBlockTable(typeNumber, errorCorrectLevel);

                    if (typeof rsBlock == 'undefined') {
                        throw new Error('bad rs block @ typeNumber:' + typeNumber + '/errorCorrectLevel:' + errorCorrectLevel);
                    }

                    var length = rsBlock.length / 3;

                    var list = new Array();

                    for (var i = 0; i < length; i += 1) {

                        var count = rsBlock[i * 3 + 0];
                        var totalCount = rsBlock[i * 3 + 1];
                        var dataCount = rsBlock[i * 3 + 2];

                        for (var j = 0; j < count; j += 1) {
                            list.push(qrRSBlock(totalCount, dataCount));
                        }
                    }

                    return list;
                };

                return _this;
            }();

            //---------------------------------------------------------------------
            // qrBitBuffer
            //---------------------------------------------------------------------

            var qrBitBuffer = function qrBitBuffer() {

                var _buffer = new Array();
                var _length = 0;

                var _this = {};

                _this.getBuffer = function () {
                    return _buffer;
                };

                _this.get = function (index) {
                    var bufIndex = Math.floor(index / 8);
                    return (_buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
                };

                _this.put = function (num, length) {
                    for (var i = 0; i < length; i += 1) {
                        _this.putBit((num >>> length - i - 1 & 1) == 1);
                    }
                };

                _this.getLengthInBits = function () {
                    return _length;
                };

                _this.putBit = function (bit) {

                    var bufIndex = Math.floor(_length / 8);
                    if (_buffer.length <= bufIndex) {
                        _buffer.push(0);
                    }

                    if (bit) {
                        _buffer[bufIndex] |= 0x80 >>> _length % 8;
                    }

                    _length += 1;
                };

                return _this;
            };

            //---------------------------------------------------------------------
            // qr8BitByte
            //---------------------------------------------------------------------

            var qr8BitByte = function qr8BitByte(data) {

                var _mode = QRMode.MODE_8BIT_BYTE;
                var _data = data;
                var _bytes = qrcode.stringToBytes(data);

                var _this = {};

                _this.getMode = function () {
                    return _mode;
                };

                _this.getLength = function (buffer) {
                    return _bytes.length;
                };

                _this.write = function (buffer) {
                    for (var i = 0; i < _bytes.length; i += 1) {
                        buffer.put(_bytes[i], 8);
                    }
                };

                return _this;
            };

            //=====================================================================
            // GIF Support etc.
            //

            //---------------------------------------------------------------------
            // byteArrayOutputStream
            //---------------------------------------------------------------------

            var byteArrayOutputStream = function byteArrayOutputStream() {

                var _bytes = new Array();

                var _this = {};

                _this.writeByte = function (b) {
                    _bytes.push(b & 0xff);
                };

                _this.writeShort = function (i) {
                    _this.writeByte(i);
                    _this.writeByte(i >>> 8);
                };

                _this.writeBytes = function (b, off, len) {
                    off = off || 0;
                    len = len || b.length;
                    for (var i = 0; i < len; i += 1) {
                        _this.writeByte(b[i + off]);
                    }
                };

                _this.writeString = function (s) {
                    for (var i = 0; i < s.length; i += 1) {
                        _this.writeByte(s.charCodeAt(i));
                    }
                };

                _this.toByteArray = function () {
                    return _bytes;
                };

                _this.toString = function () {
                    var s = '';
                    s += '[';
                    for (var i = 0; i < _bytes.length; i += 1) {
                        if (i > 0) {
                            s += ',';
                        }
                        s += _bytes[i];
                    }
                    s += ']';
                    return s;
                };

                return _this;
            };

            //---------------------------------------------------------------------
            // base64EncodeOutputStream
            //---------------------------------------------------------------------

            var base64EncodeOutputStream = function base64EncodeOutputStream() {

                var _buffer = 0;
                var _buflen = 0;
                var _length = 0;
                var _base64 = '';

                var _this = {};

                var writeEncoded = function writeEncoded(b) {
                    _base64 += String.fromCharCode(encode(b & 0x3f));
                };

                var encode = function encode(n) {
                    if (n < 0) {
                        // error.
                    } else if (n < 26) {
                        return 0x41 + n;
                    } else if (n < 52) {
                        return 0x61 + (n - 26);
                    } else if (n < 62) {
                        return 0x30 + (n - 52);
                    } else if (n == 62) {
                        return 0x2b;
                    } else if (n == 63) {
                        return 0x2f;
                    }
                    throw new Error('n:' + n);
                };

                _this.writeByte = function (n) {

                    _buffer = _buffer << 8 | n & 0xff;
                    _buflen += 8;
                    _length += 1;

                    while (_buflen >= 6) {
                        writeEncoded(_buffer >>> _buflen - 6);
                        _buflen -= 6;
                    }
                };

                _this.flush = function () {

                    if (_buflen > 0) {
                        writeEncoded(_buffer << 6 - _buflen);
                        _buffer = 0;
                        _buflen = 0;
                    }

                    if (_length % 3 != 0) {
                        // padding
                        var padlen = 3 - _length % 3;
                        for (var i = 0; i < padlen; i += 1) {
                            _base64 += '=';
                        }
                    }
                };

                _this.toString = function () {
                    return _base64;
                };

                return _this;
            };

            //---------------------------------------------------------------------
            // base64DecodeInputStream
            //---------------------------------------------------------------------

            var base64DecodeInputStream = function base64DecodeInputStream(str) {

                var _str = str;
                var _pos = 0;
                var _buffer = 0;
                var _buflen = 0;

                var _this = {};

                _this.read = function () {

                    while (_buflen < 8) {

                        if (_pos >= _str.length) {
                            if (_buflen == 0) {
                                return -1;
                            }
                            throw new Error('unexpected end of file./' + _buflen);
                        }

                        var c = _str.charAt(_pos);
                        _pos += 1;

                        if (c == '=') {
                            _buflen = 0;
                            return -1;
                        } else if (c.match(/^\s$/)) {
                            // ignore if whitespace.
                            continue;
                        }

                        _buffer = _buffer << 6 | decode(c.charCodeAt(0));
                        _buflen += 6;
                    }

                    var n = _buffer >>> _buflen - 8 & 0xff;
                    _buflen -= 8;
                    return n;
                };

                var decode = function decode(c) {
                    if (0x41 <= c && c <= 0x5a) {
                        return c - 0x41;
                    } else if (0x61 <= c && c <= 0x7a) {
                        return c - 0x61 + 26;
                    } else if (0x30 <= c && c <= 0x39) {
                        return c - 0x30 + 52;
                    } else if (c == 0x2b) {
                        return 62;
                    } else if (c == 0x2f) {
                        return 63;
                    } else {
                        throw new Error('c:' + c);
                    }
                };

                return _this;
            };

            //---------------------------------------------------------------------
            // gifImage (B/W)
            //---------------------------------------------------------------------

            var gifImage = function gifImage(width, height) {

                var _width = width;
                var _height = height;
                var _data = new Array(width * height);

                var _this = {};

                _this.setPixel = function (x, y, pixel) {
                    _data[y * _width + x] = pixel;
                };

                _this.write = function (out) {

                    //---------------------------------
                    // GIF Signature

                    out.writeString('GIF87a');

                    //---------------------------------
                    // Screen Descriptor

                    out.writeShort(_width);
                    out.writeShort(_height);

                    out.writeByte(0x80); // 2bit
                    out.writeByte(0);
                    out.writeByte(0);

                    //---------------------------------
                    // Global Color Map

                    // black
                    out.writeByte(0x00);
                    out.writeByte(0x00);
                    out.writeByte(0x00);

                    // white
                    out.writeByte(0xff);
                    out.writeByte(0xff);
                    out.writeByte(0xff);

                    //---------------------------------
                    // Image Descriptor

                    out.writeString(',');
                    out.writeShort(0);
                    out.writeShort(0);
                    out.writeShort(_width);
                    out.writeShort(_height);
                    out.writeByte(0);

                    //---------------------------------
                    // Local Color Map

                    //---------------------------------
                    // Raster Data

                    var lzwMinCodeSize = 2;
                    var raster = getLZWRaster(lzwMinCodeSize);

                    out.writeByte(lzwMinCodeSize);

                    var offset = 0;

                    while (raster.length - offset > 255) {
                        out.writeByte(255);
                        out.writeBytes(raster, offset, 255);
                        offset += 255;
                    }

                    out.writeByte(raster.length - offset);
                    out.writeBytes(raster, offset, raster.length - offset);
                    out.writeByte(0x00);

                    //---------------------------------
                    // GIF Terminator
                    out.writeString(';');
                };

                var bitOutputStream = function bitOutputStream(out) {

                    var _out = out;
                    var _bitLength = 0;
                    var _bitBuffer = 0;

                    var _this = {};

                    _this.write = function (data, length) {

                        if (data >>> length != 0) {
                            throw new Error('length over');
                        }

                        while (_bitLength + length >= 8) {
                            _out.writeByte(0xff & (data << _bitLength | _bitBuffer));
                            length -= 8 - _bitLength;
                            data >>>= 8 - _bitLength;
                            _bitBuffer = 0;
                            _bitLength = 0;
                        }

                        _bitBuffer = data << _bitLength | _bitBuffer;
                        _bitLength = _bitLength + length;
                    };

                    _this.flush = function () {
                        if (_bitLength > 0) {
                            _out.writeByte(_bitBuffer);
                        }
                    };

                    return _this;
                };

                var getLZWRaster = function getLZWRaster(lzwMinCodeSize) {

                    var clearCode = 1 << lzwMinCodeSize;
                    var endCode = (1 << lzwMinCodeSize) + 1;
                    var bitLength = lzwMinCodeSize + 1;

                    // Setup LZWTable
                    var table = lzwTable();

                    for (var i = 0; i < clearCode; i += 1) {
                        table.add(String.fromCharCode(i));
                    }
                    table.add(String.fromCharCode(clearCode));
                    table.add(String.fromCharCode(endCode));

                    var byteOut = byteArrayOutputStream();
                    var bitOut = bitOutputStream(byteOut);

                    // clear code
                    bitOut.write(clearCode, bitLength);

                    var dataIndex = 0;

                    var s = String.fromCharCode(_data[dataIndex]);
                    dataIndex += 1;

                    while (dataIndex < _data.length) {

                        var c = String.fromCharCode(_data[dataIndex]);
                        dataIndex += 1;

                        if (table.contains(s + c)) {

                            s = s + c;
                        } else {

                            bitOut.write(table.indexOf(s), bitLength);

                            if (table.size() < 0xfff) {

                                if (table.size() == 1 << bitLength) {
                                    bitLength += 1;
                                }

                                table.add(s + c);
                            }

                            s = c;
                        }
                    }

                    bitOut.write(table.indexOf(s), bitLength);

                    // end code
                    bitOut.write(endCode, bitLength);

                    bitOut.flush();

                    return byteOut.toByteArray();
                };

                var lzwTable = function lzwTable() {

                    var _map = {};
                    var _size = 0;

                    var _this = {};

                    _this.add = function (key) {
                        if (_this.contains(key)) {
                            throw new Error('dup key:' + key);
                        }
                        _map[key] = _size;
                        _size += 1;
                    };

                    _this.size = function () {
                        return _size;
                    };

                    _this.indexOf = function (key) {
                        return _map[key];
                    };

                    _this.contains = function (key) {
                        return typeof _map[key] != 'undefined';
                    };

                    return _this;
                };

                return _this;
            };

            var createImgTag = function createImgTag(width, height, getPixel, alt) {

                var gif = gifImage(width, height);
                for (var y = 0; y < height; y += 1) {
                    for (var x = 0; x < width; x += 1) {
                        gif.setPixel(x, y, getPixel(x, y));
                    }
                }

                var b = byteArrayOutputStream();
                gif.write(b);

                var base64 = base64EncodeOutputStream();
                var bytes = b.toByteArray();
                for (var i = 0; i < bytes.length; i += 1) {
                    base64.writeByte(bytes[i]);
                }
                base64.flush();

                var img = '';
                img += '<img';
                img += " src=\"";
                img += 'data:image/gif;base64,';
                img += base64;
                img += '"';
                img += " width=\"";
                img += width;
                img += '"';
                img += " height=\"";
                img += height;
                img += '"';
                if (alt) {
                    img += " alt=\"";
                    img += alt;
                    img += '"';
                }
                img += '/>';

                return img;
            };

            //---------------------------------------------------------------------
            // returns qrcode function.

            return qrcode;
        }();
    }, {}], 4: [function (require, module, exports) {
        var inherits = require('inherits');
        var EventEmitter = require('events').EventEmitter;

        module.exports = Queue;

        function Queue(options) {
            if (!(this instanceof Queue)) return new Queue(options);

            EventEmitter.call(this);
            options = options || {};
            this.concurrency = options.concurrency || Infinity;
            this.timeout = options.timeout || 0;
            this.pending = 0;
            this.session = 0;
            this.running = false;
            this.jobs = [];
        }
        inherits(Queue, EventEmitter);

        var arrayMethods = ['push', 'unshift', 'splice', 'pop', 'shift', 'slice', 'reverse', 'indexOf', 'lastIndexOf'];

        for (var method in arrayMethods) {
            (function (method) {
                Queue.prototype[method] = function () {
                    return Array.prototype[method].apply(this.jobs, arguments);
                };
            })(arrayMethods[method]);
        }Object.defineProperty(Queue.prototype, 'length', { get: function get() {
                return this.pending + this.jobs.length;
            } });

        Queue.prototype.start = function (cb) {
            if (cb) {
                callOnErrorOrEnd.call(this, cb);
            }

            this.running = true;

            if (this.pending === this.concurrency) {
                return;
            }

            if (this.jobs.length === 0) {
                if (this.pending === 0) {
                    done.call(this);
                }
                return;
            }

            var self = this;
            var job = this.jobs.shift();
            var once = true;
            var session = this.session;
            var timeoutId = null;
            var didTimeout = false;

            function next(err, result) {
                if (once && self.session === session) {
                    once = false;
                    self.pending--;
                    if (timeoutId !== null) {
                        clearTimeout(timeoutId);
                    }

                    if (err) {
                        self.emit('error', err, job);
                    } else if (didTimeout === false) {
                        self.emit('success', result, job);
                    }

                    if (self.session === session) {
                        if (self.pending === 0 && self.jobs.length === 0) {
                            done.call(self);
                        } else if (self.running) {
                            self.start();
                        }
                    }
                }
            }

            if (this.timeout) {
                timeoutId = setTimeout(function () {
                    didTimeout = true;
                    if (self.listeners('timeout').length > 0) {
                        self.emit('timeout', next, job);
                    } else {
                        next();
                    }
                }, this.timeout);
            }

            this.pending++;
            job(next);

            if (this.jobs.length > 0) {
                this.start();
            }
        };

        Queue.prototype.stop = function () {
            this.running = false;
        };

        Queue.prototype.end = function (err) {
            this.jobs.length = 0;
            this.pending = 0;
            done.call(this, err);
        };

        function callOnErrorOrEnd(cb) {
            var self = this;
            this.on('error', onerror);
            this.on('end', onend);

            function onerror(err) {
                self.end(err);
            }
            function onend(err) {
                self.removeListener('error', onerror);
                self.removeListener('end', onend);
                cb(err);
            }
        }

        function done(err) {
            this.session++;
            this.running = false;
            this.emit('end', err);
        }
    }, { "events": 26, "inherits": 1 }], 5: [function (require, module, exports) {
        var Session = require('../models/Session.js');
        var Conf = require('../config/Config.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: {}, children: [Session.modalMessage() ? m('div', {
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
                    }, [m(".row", [m(".col-md-6.col-md-offset-3", [[m(".portlet", [m(".portlet-heading.bg-primary", { style: { borderRadius: 0 } }, [m("h3.portlet-title", Session.modalTitle() || Conf.tr('Message')), m(".portlet-widgets", [m("a[href='#']", {
                        onclick: function onclick(e) {
                            e.preventDefault();Session.closeModal();
                        }
                    }, [m("i.ion-close-round")])]), m(".clearfix")]), m(".portlet-body", Session.modalMessage())])]]), m(".clearfix")])]) : '', { tag: "footer", attrs: { class: "footer" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: ["© 2016 made by ", { tag: "a", attrs: { href: "http://atticlab.net" }, children: ["AtticLab"] }] }] }] }] }] };
            }
        };
    }, { "../config/Config.js": 11, "../models/Session.js": 18 }], 6: [function (require, module, exports) {
        module.exports = {
            controller: function controller() {
                var ctrl = this;
            },

            view: function view(ctrl) {
                return { tag: "footer", attrs: { class: "footer footer-full-width" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-xs-12 text-center" }, children: ["© 2016 made by ", { tag: "a", attrs: { href: "http://atticlab.net" }, children: ["AtticLab"] }] }] }] }] };
            }
        };
    }, {}], 7: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Auth = require('../models/Auth'),
            Helpers = require('../models/Helpers');

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
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { class: "topbar" }, children: [{ tag: "div", attrs: { class: "topbar-left" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "a", attrs: { href: "/home", config: m.route, class: "logo" }, children: [{ tag: "i", attrs: { class: "md md-equalizer" } }, " ", { tag: "span", attrs: {}, children: ["SmartMoney"] }, " "] }] }] }, { tag: "div", attrs: { class: "navbar navbar-default", role: "navigation" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "" }, children: [{ tag: "div", attrs: { class: "pull-left" }, children: [{ tag: "button", attrs: { class: "button-menu-mobile open-left waves-effect" }, children: [{ tag: "i", attrs: { class: "md md-menu" } }] }, { tag: "span", attrs: { class: "clearfix" } }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "#", onclick: Auth.logout }, children: [{ tag: "i", attrs: { class: "fa fa-power-off m-r-5" } }, Conf.tr("Logout")] }] }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: { class: "dropdown" }, children: [{ tag: "a", attrs: { class: "dropdown-toggle", "data-toggle": "dropdown", href: "#" }, children: [{ tag: "i", attrs: { class: "fa fa-language fa-fw" } }, " ", { tag: "i", attrs: { class: "fa fa-caret-down" } }] }, { tag: "ul", attrs: { class: "dropdown-menu dropdown-user" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'en'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/flags/en.png" } }, " English"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ua'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/flags/ua.png" } }, " Українська"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ru'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/flags/ru.png" } }, " Русский"] }] }] }] }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "#", onclick: ctrl.updateTTL.bind(ctrl), title: Conf.tr('Time to end the session') }, children: [{ tag: "div", attrs: { id: "spinner-progress", class: "c100 small small-cust green p" + ctrl.css_class() }, children: [{ tag: "span", attrs: { id: "spinner-time" }, children: [!ctrl.ttl() ? '' : Helpers.getTimeFromSeconds(ctrl.ttl())] }, { tag: "div", attrs: { class: "slice" }, children: [{ tag: "div", attrs: { class: "bar" } }, { tag: "div", attrs: { class: "fill" } }] }] }] }] }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "button", attrs: { class: "refresh btn btn-icon waves-effect waves-light btn-purple m-b-5",
                                                onclick: ctrl.refreshPage.bind(ctrl) }, children: [" ", { tag: "i", attrs: { class: "fa fa-refresh" } }, " "] }] }] }] }] }] }] };
            }
        };
    }, { "../config/Config.js": 11, "../models/Auth": 15, "../models/Helpers": 16 }], 8: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Auth = require('../models/Auth');

        module.exports = {

            controller: function controller() {
                var ctrl = this;
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { class: "topbar" }, children: [{ tag: "div", attrs: { class: "topbar-left" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "a", attrs: { href: "/", config: m.route, class: "logo" }, children: [{ tag: "i", attrs: { class: "md md-equalizer" } }, " ", { tag: "span", attrs: {}, children: ["SmartMoney"] }, " "] }] }] }, { tag: "div", attrs: { class: "navbar navbar-default", role: "navigation" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "" }, children: [{ tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: { class: "dropdown" }, children: [{ tag: "a", attrs: { class: "dropdown-toggle", "data-toggle": "dropdown", href: "#" }, children: [{ tag: "i", attrs: { class: "fa fa-language fa-fw" } }, " ", { tag: "i", attrs: { class: "fa fa-caret-down" } }] }, { tag: "ul", attrs: { class: "dropdown-menu dropdown-user" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'en'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/flags/en.png" } }, " English"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ua'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/flags/ua.png" } }, " Українська"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ru'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/flags/ru.png" } }, " Русский"] }] }] }] }] }] }] }] }] };
            }
        };
    }, { "../config/Config.js": 11, "../models/Auth": 15 }], 9: [function (require, module, exports) {
        var Auth = require('../models/Auth.js'),
            Conf = require('../config/Config.js');

        module.exports = {
            controller: function controller(data) {
                var ctrl = this;

                this.current_page = m.prop(data.pagination.page);
                this.next_page_offset = m.prop(ctrl.current_page() * Conf.pagination.limit);
                this.func = m.prop(data.pagination.func);
                this.params = m.prop(data.pagination.params || {});
                this.btn_prev = m.prop(false);
                this.btn_next = m.prop(false);
                this.previous_page = m.prop(ctrl.current_page() - 1);
                this.next_page = m.prop(ctrl.current_page() + 1);

                this.has_previous_page = function () {
                    return ctrl.previous_page() >= 1;
                };

                this.getNextPageItems = function () {
                    return Auth.api()[ctrl.func()](Object.assign(ctrl.params(), { limit: Conf.pagination.limit, offset: ctrl.next_page_offset() }));
                };

                //check prev/next buttons
                m.onLoadingStart();
                ctrl.getNextPageItems().then(function (list) {
                    if (typeof list.items != 'undefined' && list.items.length > 0) {
                        m.startComputation();
                        ctrl.btn_next(true);
                        m.endComputation();
                    }
                    m.startComputation();
                    ctrl.btn_prev(ctrl.has_previous_page());
                    m.endComputation();
                }).catch(function (err) {
                    console.error(err);
                    ctrl.btn_next(false);
                }).then(function () {
                    m.onLoadingEnd();
                });

                this.prev = function (e) {
                    e.preventDefault();
                    m.route(m.route().split("?")[0] + '?page=' + ctrl.previous_page());
                };

                this.next = function (e) {
                    e.preventDefault();
                    m.route(m.route().split("?")[0] + '?page=' + ctrl.next_page());
                };
            },

            view: function view(ctrl, data) {
                return { tag: "ul", attrs: { class: "pager" }, children: [ctrl.btn_prev() ? { tag: "li", attrs: { class: "previous" }, children: [{ tag: "a", attrs: { href: "#", onclick: ctrl.prev.bind(ctrl) }, children: [Conf.tr("Prev")] }] } : '', ctrl.btn_next() ? { tag: "li", attrs: { class: "next" }, children: [{ tag: "a", attrs: { href: "#", onclick: ctrl.next.bind(ctrl) }, children: [Conf.tr("Next")] }] } : ''] };
            }
        };
    }, { "../config/Config.js": 11, "../models/Auth.js": 15 }], 10: [function (require, module, exports) {
        var menuItems = require('../models/Menu-items');
        var Conf = require('../config/Config.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                // check if current sub-menu item is in parent menu to keep sub-menu opened
                this.isRouteInSubItems = function (subItems) {
                    return subItems.find(function (keys) {
                        return keys.route === m.route();
                    }) ? true : false;
                };

                // check if current menu or sub-menu item is selected to highlight it in menu
                this.isSelected = function (item) {
                    if (m.route() === item.route) {
                        return true;
                    } else if (item.subItems) {
                        return ctrl.isRouteInSubItems(item.subItems) ? true : false;
                    }
                };
            },
            view: function view(ctrl) {
                return { tag: "div", attrs: { class: "left side-menu" }, children: [{ tag: "div", attrs: { class: "sidebar-inner slimscrollleft" }, children: [{ tag: "div", attrs: { id: "sidebar-menu" }, children: [{ tag: "ul", attrs: {}, children: [menuItems.map(function (item) {
                                    return { tag: "li", attrs: { class: item.subItems ? 'has_sub' : '' }, children: [item.route ? { tag: "a", attrs: { href: item.route, config: m.route, class: ctrl.isSelected(item) ? "waves-effect waves-primary subdrop" : "waves-effect waves-primary" }, children: [{ tag: "i", attrs: { class: item.icon } }, " ", { tag: "span", attrs: {}, children: [" ", Conf.tr(item.name), " "] }, item.subItems ? { tag: "span", attrs: { class: "menu-arrow" } } : ''] } : { tag: "a", attrs: { href: "javascript:void(0);", class: ctrl.isSelected(item) ? "waves-effect waves-primary subdrop" : "waves-effect waves-primary" }, children: [{ tag: "i", attrs: { class: item.icon } }, " ", { tag: "span", attrs: {}, children: [" ", Conf.tr(item.name), " "] }, item.subItems ? { tag: "span", attrs: { class: "menu-arrow" } } : ''] }, item.subItems ? { tag: "ul", attrs: { className: "list-unstyled", style: ctrl.isRouteInSubItems(item.subItems) ? 'display: block' : '' }, children: [item.subItems.map(function (subItem) {
                                                return { tag: "li", attrs: { class: subItem.route === m.route() ? 'active' : '' }, children: [{ tag: "a", attrs: { href: subItem.route, config: m.route }, children: [Conf.tr(subItem.name)] }] };
                                            })] } : ''] };
                                })] }, { tag: "div", attrs: { class: "clearfix" } }] }, { tag: "div", attrs: { class: "clearfix" } }] }] };
            }
        };
    }, { "../config/Config.js": 11, "../models/Menu-items": 17 }], 11: [function (require, module, exports) {
        (function (process) {
            var Localize = require('localize');
            var Locales = require('../locales/translations.js');

            var conf = {
                master_key: "",
                keyserver_host: "",
                horizon_host: "",
                api_url: "",
                roles: {
                    admin: 1,
                    emission: 2
                }
            };

            conf.statuses = {
                STATUS_WAIT_PAYMENT: 1, //create order record in db, wait payment
                STATUS_WAIT_ANSWER: 2, //payment complete, wait answer from merchant domain
                STATUS_PARTIAL_PAYMENT: 3, //amount of payment is less than amount of order
                STATUS_FAIL: 4,
                STATUS_SUCCESS: 5
            };

            StellarSdk.Network.use(new StellarSdk.Network(""));
            conf.horizon = new StellarSdk.Server(conf.horizon_host);

            conf.locales = Locales;

            conf.payments = {
                onpage: 10
            };

            conf.pagination = {
                limit: 10
            };

            conf.payment_prefix = 'mo:';
            conf.payment_type = 1;

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
    }, { "../errors/Errors": 12, "../locales/translations.js": 14, "localize": 2, "rH1JPG": 28 }], 12: [function (require, module, exports) {
        var errors = {
            not_found: 'Account not found',
            account_not_found: 'Account not found',
            service_error: 'Service error. Please, try again'
        };

        var Errors = module.exports = errors;
    }, {}], 13: [function (require, module, exports) {
        var Conf = require('./config/Config.js');
        var queue = require('queue');
        var q = queue();

        // Loading spinner
        m.onLoadingStart = function () {
            q.push(true);
            document.getElementById('spinner').style.display = 'block';
        };
        m.onLoadingEnd = function () {
            q.pop();
            if (!q.length) {
                document.getElementById('spinner').style.display = 'none';
            }
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
            "/": require('./pages/Login.js'),
            "/logout": require('./pages/Logout.js'),
            "/stores": require('./pages/Stores/List.js'),
            "/stores/create": require('./pages/Stores/Create.js'),
            "/orders/:store_id": require('./pages/Orders.js'),
            "/transaction/:order_id": require('./pages/Transaction.js')
        });
    }, { "./config/Config.js": 11, "./pages/Login.js": 19, "./pages/Logout.js": 20, "./pages/Orders.js": 21, "./pages/Stores/Create.js": 22, "./pages/Stores/List.js": 23, "./pages/Transaction.js": 24, "queue": 4 }], 14: [function (require, module, exports) {
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
        }), _defineProperty(_module$exports, "Show types commission", {
            ru: 'Пказать комиссию по типам',
            ua: 'Показати комісію по типам'
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
        }), _defineProperty(_module$exports, "Dashboard", {
            ru: 'Панель управления',
            ua: 'Панель керування'
        }), _defineProperty(_module$exports, "Account ID", {
            ru: 'Счет',
            ua: 'Рахунок'
        }), _defineProperty(_module$exports, "Registered companies", {
            ru: 'Зарегистрированные компании',
            ua: 'Зареєстровані компанії'
        }), _defineProperty(_module$exports, "Add", {
            ru: 'Добавить',
            ua: 'Додати'
        }), _defineProperty(_module$exports, "Issuer", {
            ru: 'Эмитент',
            ua: 'Емітент'
        }), _defineProperty(_module$exports, "Amount", {
            ru: 'Сумма',
            ua: 'Сума'
        }), _defineProperty(_module$exports, "To the begining", {
            ru: 'В начало',
            ua: 'На початок'
        }), _defineProperty(_module$exports, "Create new asset", {
            ru: 'Создать новую валюту',
            ua: 'Створити нову валюту'
        }), _defineProperty(_module$exports, "Create", {
            ru: 'Создать',
            ua: 'Створити'
        }), _defineProperty(_module$exports, "Enrollment ID", {
            ru: 'ID приглашения',
            ua: 'ID запрошення'
        }), _defineProperty(_module$exports, "Agent login", {
            ru: 'Логин агента',
            ua: 'Логін агента'
        }), _defineProperty(_module$exports, "Agent Account ID", {
            ru: 'Счет агента',
            ua: 'Рахунок агента'
        }), _defineProperty(_module$exports, "Enrollment status", {
            ru: 'Статус приглашения',
            ua: 'Статус запрошення'
        }), _defineProperty(_module$exports, "Approve status", {
            ru: 'Статус приглашения',
            ua: 'Статус запрошення'
        }), _defineProperty(_module$exports, "Agent ID", {
            ru: 'ID агента',
            ua: 'ID агента'
        }), _defineProperty(_module$exports, "Company CODE", {
            ru: 'Код компании',
            ua: 'Код компанії'
        }), _defineProperty(_module$exports, "Information", {
            ru: 'Информация',
            ua: 'Інформація'
        }), _defineProperty(_module$exports, "Username", {
            ru: 'Пользователь',
            ua: 'Користувач'
        }), _defineProperty(_module$exports, "Create an account", {
            ru: 'Создать аккаунт',
            ua: 'Створити аккаунт'
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
        }), _defineProperty(_module$exports, "Stores", {
            ru: 'Магазины',
            ua: 'Магазини'
        }), _defineProperty(_module$exports, "Orders", {
            ru: 'Заказы',
            ua: 'Замовлення'
        }), _defineProperty(_module$exports, "Registered stores", {
            ru: 'Зарегистрированные магазины',
            ua: 'Зареєстровані магазини'
        }), _defineProperty(_module$exports, "Log in", {
            ru: 'Войти',
            ua: 'Увійти'
        }), _defineProperty(_module$exports, "Data", {
            ru: 'Данные',
            ua: 'Дані'
        }), _defineProperty(_module$exports, "Show keys", {
            ru: 'Показать ключи',
            ua: 'Показати ключі'
        }), _defineProperty(_module$exports, "Show orders", {
            ru: 'Показать заказы',
            ua: 'Показати замовлення'
        }), _defineProperty(_module$exports, "Store ID", {
            ru: 'ID магазина',
            ua: 'ID магазину'
        }), _defineProperty(_module$exports, "Secret key", {
            ru: 'Секретный ключ',
            ua: 'Секретний ключ'
        }), _defineProperty(_module$exports, "No stores found", {
            ru: 'Магазины не найдены',
            ua: 'Магазини не знайдені'
        }), _defineProperty(_module$exports, "No orders found", {
            ru: 'Заказы не найдены',
            ua: 'Замовлення не знайдені'
        }), _defineProperty(_module$exports, "Merchant dashboard", {
            ru: 'Панель управления мерчанта',
            ua: 'Панель керування мерчанта'
        }), _defineProperty(_module$exports, "Create new store", {
            ru: 'Создать новый магазин',
            ua: 'Створити новий магазин'
        }), _defineProperty(_module$exports, "Store url", {
            ru: 'URL магазина',
            ua: 'URL магазину'
        }), _defineProperty(_module$exports, "Store name", {
            ru: 'Название магазина',
            ua: 'Навза магазину'
        }), _defineProperty(_module$exports, "Time to end the session", {
            ru: 'Время до конца сессии',
            ua: 'Час до кінця сесії'
        }), _defineProperty(_module$exports, "Login/password combination is invalid", {
            ru: 'Неправильный логин или пароль',
            ua: 'Неправильний логін або пароль'
        }), _module$exports);
    }, {}], 15: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Errors = require('../errors/Errors.js');

        var Auth = {
            setDefaults: function setDefaults() {
                this.keypair = m.prop(false);
                this.username = m.prop(false);
                this.wallet = m.prop(false);
                this.api = m.prop(false);
                this.ttl = m.prop(0);
                this.time_live = m.prop(0);
            },

            login: function login(_login, password) {

                var wallet_data = null;

                return StellarWallet.getWallet({
                    server: Conf.keyserver_host + '/v2',
                    username: _login,
                    password: password
                }).then(function (wallet) {
                    wallet_data = wallet;

                    return Auth.loadAccountById(StellarSdk.Keypair.fromSeed(wallet_data.getKeychainData()).accountId());
                }).then(function (account_data) {
                    if (account_data.type_i != StellarSdk.xdr.AccountType.accountMerchant().value) {

                        return m.flashError(Conf.tr('Bad account type'));
                    } else {
                        m.startComputation();
                        Auth.wallet(wallet_data);
                        Auth.keypair(StellarSdk.Keypair.fromSeed(wallet_data.getKeychainData()));
                        Auth.username(wallet_data.username);
                        Auth.api(new StellarWallet.Api(Conf.api_url, Auth.keypair()));

                        Auth.api().initNonce().then(function (ttl) {
                            Auth.ttl(ttl);
                            Auth.time_live(Number(ttl));
                        });

                        m.endComputation();
                    }
                });
            },

            logout: function logout() {
                window.location.href = '/';
            },

            destroySession: function destroySession() {
                m.startComputation();
                Auth.keypair(null);
                m.endComputation();
                m.route('/');
            },

            loadAccountById: function loadAccountById(aid) {
                return Conf.horizon.accounts().accountId(aid).call();
            }
        };

        Auth.setDefaults();

        module.exports = Auth;
    }, { "../config/Config.js": 11, "../errors/Errors.js": 12 }], 16: [function (require, module, exports) {
        var Conf = require('../config/Config');
        var Auth = require('../models/Auth');

        var Helpers = {
            getDateFromTimestamp: function getDateFromTimestamp(timestamp) {
                var d = new Date(timestamp * 1000);
                var year = d.getFullYear();
                var month = this.transformToTwoDigits(d.getMonth() + 1);
                var day = this.transformToTwoDigits(d.getDate());
                var hours = this.transformToTwoDigits(d.getHours());
                var minutes = this.transformToTwoDigits(d.getMinutes());
                var seconds = this.transformToTwoDigits(d.getSeconds());

                return [day, month, year].join('.') + " " + [hours, minutes, seconds].join(':');
            },

            transformToTwoDigits: function transformToTwoDigits(number) {
                return number.toString().length < 2 ? '0' + number : number;
            },
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
    }, { "../config/Config": 11, "../models/Auth": 15 }], 17: [function (require, module, exports) {
        module.exports = [{
            name: 'Stores',
            route: '',
            icon: 'md md-attach-money',
            subItems: [{
                name: 'List',
                route: '/stores'
            }, {
                name: 'Create',
                route: '/stores/create'
            }]
        }];
    }, {}], 18: [function (require, module, exports) {
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
        var Conf = require('../config/Config.js'),
            Auth = require('../models/Auth.js'),
            Footer = require('../components/FooterFullWidth.js');

        var Login = module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (Auth.keypair()) {
                    return m.route('/stores');
                }

                this.login = function (e) {
                    e.preventDefault();

                    m.onLoadingStart();
                    Auth.login(e.target.login.value, e.target.password.value).then(function () {
                        m.onLoadingEnd();
                        m.route('/stores');
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr('Login/password combination is invalid'));
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "text-right languages" }, children: [{ tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'en'), href: "#" }, children: ["EN"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ua'), href: "#" }, children: ["UA"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ru'), href: "#" }, children: ["RU"] }] }, { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: { class: "text-center logo" }, children: [{ tag: "img", attrs: { src: "/assets/img/logo.svg", alt: "Smartmoney logo" } }, { tag: "h4", attrs: {}, children: [Conf.tr('Merchant dashboard')] }] }, { tag: "form", attrs: { class: "form-horizontal m-t-20", onsubmit: ctrl.login.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text", required: "required",
                                            placeholder: Conf.tr("Username"),
                                            autocapitalize: "none",
                                            name: "login" } }, { tag: "i", attrs: { class: "md md-account-circle form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password", required: "required", autocapitalize: "none",
                                            placeholder: Conf.tr("Password"),
                                            name: "password" } }, { tag: "i", attrs: { class: "md md-vpn-key form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group m-t-20 text-center" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-lg btn-custom waves-effect w-md waves-light m-b-5",
                                        type: "submit" }, children: [Conf.tr("Log in")] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../components/FooterFullWidth.js": 6, "../config/Config.js": 11, "../models/Auth.js": 15 }], 20: [function (require, module, exports) {
        var Auth = require('../models/Auth.js');

        var Logout = module.exports = {
            controller: function controller() {
                Auth.logout();
                m.route('/');
            },

            view: function view(ctrl) {}
        };
    }, { "../models/Auth.js": 15 }], 21: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Navbar = require('../components/Navbar.js'),
            Footer = require('../components/Footer.js'),
            Sidebar = require('../components/Sidebar.js'),
            Helpers = require('../models/Helpers'),
            Session = require('../models/Session.js'),
            Pagination = require('../components/Pagination.js'),
            Auth = require('../models/Auth');

        module.exports = {
            controller: function controller() {
                var ctrl = this;
                if (!Auth.username()) {
                    return m.route('/');
                }

                this.store_id = m.prop(m.route.param("store_id"));
                if (!ctrl.store_id()) {
                    return m.route('/stores');
                }

                this.is_initialized = m.prop(false);
                this.page = m.route.param('page') ? m.prop(Number(m.route.param('page'))) : m.prop(1);
                this.limit = Conf.pagination.limit;
                this.offset = (ctrl.page() - 1) * ctrl.limit;
                this.pagination_data = m.prop({ func: "getOrdersList", page: ctrl.page(), params: { store_id: ctrl.store_id() } });

                this.orders = m.prop([]);

                m.onLoadingStart();
                Auth.api().getOrdersList({ store_id: ctrl.store_id(), limit: ctrl.limit, offset: ctrl.offset }).then(function (orders) {
                    if (typeof orders.items != 'undefined') {
                        m.startComputation();
                        ctrl.orders(orders.items);
                        ctrl.is_initialized(true);
                        m.endComputation();
                    } else {
                        console.error('Unexpected response');
                        console.error(orders);
                    }
                }).catch(function (error) {
                    console.error(error);
                    return m.flashApiError(error);
                }).then(function () {
                    m.onLoadingEnd();
                });

                this.showErrorDetails = function (error_details, e) {
                    m.startComputation();
                    Session.modal({ tag: "table", attrs: { class: "table" }, children: [{ tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [{ tag: "code", attrs: {}, children: [error_details] }] }] }] }, Conf.tr("Error details"));
                    m.endComputation();
                };

                this.showPaymentDetails = function (payment_details, e) {

                    m.startComputation();
                    Session.modal({ tag: "table", attrs: { class: "table" }, children: [{ tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [Conf.tr('Payment date'), ":"] }, { tag: "td", attrs: {}, children: [{ tag: "code", attrs: {}, children: [" Helpers.getDateFromTimestamp(payment_details.date || false) + "] }] }] }, { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [Conf.tr('Payment amount'), ":"] }, { tag: "td", attrs: {}, children: [{ tag: "code", attrs: {}, children: [" parseFloat(payment_details.amount).toFixed(2) + "] }] }] }, { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [" ", Conf.tr('Payer'), ":"] }, { tag: "td", attrs: {}, children: [{ tag: "code", attrs: {}, children: [" payment_details.payer + "] }] }] }, { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [" ", Conf.tr('Payment details'), ":"] }, { tag: "td", attrs: {}, children: [{ tag: "code", attrs: {}, children: [" payment_details.details + "] }] }] }, { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [" ", Conf.tr('Transaction ID'), ":"] }, { tag: "td", attrs: {}, children: [{ tag: "code", attrs: {}, children: [" payment_details.tx + "] }] }] }] }, Conf.tr("Payment details"));
                    m.endComputation();
                };

                this.textStatus = function (status_id) {
                    switch (status_id) {
                        case Conf.statuses.STATUS_WAIT_PAYMENT:
                            return { tag: "label", attrs: { class: "label label-primary" }, children: [Conf.tr('Wait payment')] };
                            break;
                        case Conf.statuses.STATUS_WAIT_ANSWER:
                            return { tag: "label", attrs: { class: "label label-info" }, children: [Conf.tr('Wait answer')] };
                            break;
                        case Conf.statuses.STATUS_PARTIAL_PAYMENT:
                            return { tag: "label", attrs: { class: "label label-warning" }, children: [Conf.tr('Partial payment')] };
                            break;
                        case Conf.statuses.STATUS_FAIL:
                            return { tag: "label", attrs: { class: "label label-danger" }, children: [Conf.tr('Fail')] };
                            break;
                        case Conf.statuses.STATUS_SUCCESS:
                            return { tag: "label", attrs: { class: "label label-success" }, children: [Conf.tr('Success')] };
                            break;
                    }
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [ctrl.is_initialized() ? { tag: "div", attrs: {}, children: [ctrl.orders().length ? { tag: "div", attrs: { class: "panel panel-color panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Orders')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "table", attrs: { class: "table table-bordered" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('ID')] }, { tag: "th", attrs: {}, children: [Conf.tr('Order date')] }, { tag: "th", attrs: {}, children: [Conf.tr('Order amount')] }, { tag: "th", attrs: {}, children: [Conf.tr('Currency')] }, { tag: "th", attrs: {}, children: [Conf.tr('Store order id')] }, { tag: "th", attrs: {}, children: [Conf.tr('Status')] }, { tag: "th", attrs: {}, children: [Conf.tr('Payment details')] }, { tag: "th", attrs: {}, children: [Conf.tr('Error details')] }] }] }, { tag: "tbody", attrs: {}, children: [ctrl.orders().map(function (order) {
                                                        return { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("ID") }, children: [order.id] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Order date") }, children: [Helpers.getDateFromTimestamp(order.date)] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Order amount") }, children: [parseFloat(order.amount).toFixed(2)] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Order currency") }, children: [order.currency] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("ID on merchant store") }, children: [order.external_order_id] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Status") }, children: [ctrl.textStatus(order.status)] }] }, { tag: "td", attrs: {}, children: [order.tx ? { tag: "button", attrs: {
                                                                        class: "btn-xs btn-primary waves-effect waves-light",
                                                                        onclick: ctrl.showPaymentDetails.bind(ctrl, {
                                                                            date: order.payment_date,
                                                                            amount: order.payment_amount,
                                                                            payer: order.payer,
                                                                            tx: order.tx,
                                                                            details: order.details
                                                                        })
                                                                    }, children: [Conf.tr('Show keys')] } : '-'] }, { tag: "td", attrs: {}, children: [order.error_details ? { tag: "button", attrs: {
                                                                        class: "btn-xs btn-danger waves-effect waves-light",
                                                                        onclick: ctrl.showErrorDetails.bind(ctrl, order.error_details)
                                                                    }, children: [Conf.tr('Show keys')] } : '-'] }] };
                                                    })] }] }, m.component(Pagination, { pagination: ctrl.pagination_data() })] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-warning" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('No orders found')] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-primary" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('Wait for data loading'), "..."] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../components/Footer.js": 5, "../components/Navbar.js": 7, "../components/Pagination.js": 9, "../components/Sidebar.js": 10, "../config/Config.js": 11, "../models/Auth": 15, "../models/Helpers": 16, "../models/Session.js": 18 }], 22: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Sidebar = require('../../components/Sidebar.js'),
            Auth = require('../../models/Auth');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.username()) {
                    return m.route('/');
                }

                this.url = m.prop('');
                this.name = m.prop('');

                this.clearForm = function () {
                    m.startComputation();
                    ctrl.url('');
                    ctrl.name('');
                    m.endComputation();
                };

                this.createStore = function (e) {
                    e.preventDefault();

                    m.onLoadingStart();

                    ctrl.url(e.target.url.value);
                    ctrl.name(e.target.name.value);

                    var form_data = {
                        url: ctrl.url(),
                        name: ctrl.name()
                    };

                    Auth.api().createStore(form_data).then(function (result) {
                        if (typeof result.message != 'undefined' && result.message == 'success') {
                            ctrl.clearForm();
                            return m.flashSuccess(Conf.tr(result.message));
                        } else {
                            console.error('Unexpected response');
                            console.error(result);
                            return m.flashError(Conf.tr(Conf.errors.service_error));
                        }
                    }).catch(function (error) {
                        console.error(error);
                        return m.flashApiError(error);
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "panel panel-primary panel-border" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Create new store")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "form", attrs: { class: "form-horizontal", onsubmit: ctrl.createStore.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "cmp_code", class: "col-md-2 control-label" }, children: [Conf.tr("Store url")] }, { tag: "div", attrs: { class: "col-md-4" }, children: [{ tag: "input", attrs: { class: "form-control", name: "url",
                                                                placeholder: Conf.tr("Store url"),
                                                                type: "text", value: ctrl.url(), required: "required" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "cmp_title", class: "col-md-2 control-label" }, children: [Conf.tr("Store name")] }, { tag: "div", attrs: { class: "col-md-6" }, children: [{ tag: "input", attrs: { class: "form-control", name: "name",
                                                                placeholder: Conf.tr("Store name"),
                                                                type: "text", value: ctrl.name(), required: "required" } }] }] }, { tag: "div", attrs: { class: "form-group m-b-0" }, children: [{ tag: "div", attrs: { class: "col-sm-offset-2 col-sm-9" }, children: [{ tag: "button", attrs: { type: "submit", class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5" }, children: [Conf.tr('Create')] }] }] }] }] }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 5, "../../components/Navbar.js": 7, "../../components/Sidebar.js": 10, "../../config/Config.js": 11, "../../models/Auth": 15 }], 23: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Sidebar = require('../../components/Sidebar.js'),
            Helpers = require('../../models/Helpers'),
            Auth = require('../../models/Auth'),
            Session = require('../../models/Session.js'),
            Pagination = require('../../components/Pagination.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;
                if (!Auth.username()) {
                    return m.route('/');
                }

                this.page = m.route.param('page') ? m.prop(Number(m.route.param('page'))) : m.prop(1);
                this.limit = Conf.pagination.limit;
                this.offset = (ctrl.page() - 1) * ctrl.limit;
                this.pagination_data = m.prop({ func: "getStoresList", page: ctrl.page() });

                this.is_initialized = m.prop(false);

                this.stores = m.prop([]);
                this.store_id = m.prop(false);
                this.secret_key = m.prop(false);

                m.onLoadingStart();
                Auth.api().getStoresList({ limit: ctrl.limit, offset: ctrl.offset }).then(function (stores) {
                    if (typeof stores.items != 'undefined') {
                        m.startComputation();
                        ctrl.stores(stores.items);
                        ctrl.is_initialized(true);
                        m.endComputation();
                    } else {
                        console.error('Unexpected response');
                        console.error(stores);
                    }
                }).catch(function (error) {
                    console.error(error);
                    return m.flashApiError(error);
                }).then(function () {
                    m.onLoadingEnd();
                });

                this.showKeys = function (store_id, secret_key, e) {
                    ctrl.store_id(store_id);
                    ctrl.secret_key(secret_key);

                    m.startComputation();
                    Session.modal({ tag: "table", attrs: { class: "table" }, children: [{ tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [Conf.tr('Store ID'), ":"] }, { tag: "td", attrs: {}, children: [{ tag: "code", attrs: {}, children: [ctrl.store_id()] }] }] }, { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [Conf.tr('Secret key'), ":"] }, { tag: "td", attrs: {}, children: [{ tag: "code", attrs: {}, children: [ctrl.secret_key()] }] }] }] }, Conf.tr("Data"));
                    m.endComputation();
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [ctrl.is_initialized() ? { tag: "div", attrs: {}, children: [ctrl.stores().length ? { tag: "div", attrs: { class: "panel panel-color panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Registered stores')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "table", attrs: { class: "table table-bordered" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('URL')] }, { tag: "th", attrs: {}, children: [Conf.tr('Title')] }, { tag: "th", attrs: {}, children: [Conf.tr('Created')] }, { tag: "th", attrs: {}, children: [Conf.tr('Data')] }] }] }, { tag: "tbody", attrs: {}, children: [ctrl.stores().map(function (store) {
                                                        return { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("URL") }, children: [store.url] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Title") }, children: [store.name] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: {}, children: [Helpers.getDateFromTimestamp(store.date)] }] }, { tag: "td", attrs: {}, children: [{ tag: "button", attrs: {
                                                                        class: "btn-xs btn-warning waves-effect waves-light m-r-10",
                                                                        onclick: ctrl.showKeys.bind(ctrl, store.store_id, store.secret_key)
                                                                    }, children: [Conf.tr('Show keys')] }, { tag: "a", attrs: {
                                                                        class: "btn-xs btn-primary waves-effect waves-light",
                                                                        href: "/orders/" + store.store_id, config: m.route
                                                                    }, children: [Conf.tr('Show orders')] }] }] };
                                                    })] }] }, m.component(Pagination, { pagination: ctrl.pagination_data() })] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-warning" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('No stores found')] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }, { tag: "div", attrs: { id: "bg-warning", class: "panel-collapse collapse in" }, children: [{ tag: "div", attrs: { class: "portlet-body" }, children: [Conf.tr('Please'), { tag: "a", attrs: { href: "/stores/create", config: m.route }, children: [" ", Conf.tr("create")] }, "!"] }] }] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-primary" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('Wait for data loading'), "..."] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 5, "../../components/Navbar.js": 7, "../../components/Pagination.js": 9, "../../components/Sidebar.js": 10, "../../config/Config.js": 11, "../../models/Auth": 15, "../../models/Helpers": 16, "../../models/Session.js": 18 }], 24: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Navbar = require('../components/NavbarFullWidth.js'),
            Footer = require('../components/FooterFullWidth.js'),
            Helpers = require('../models/Helpers'),
            Auth = require('../models/Auth'),
            Qr = require('qrcode-npm/qrcode');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                this.order_id = m.prop(m.route.param("order_id"));

                if (!ctrl.order_id()) {
                    return m.route('/');
                }

                this.order_data = m.prop(false);
                this.qr = m.prop(false);

                this.api = new StellarWallet.Api(Conf.api_url, StellarSdk.Keypair.random());

                m.onLoadingStart();
                ctrl.api.getOrder({ order_id: ctrl.order_id() }).then(function (order_data) {

                    if (typeof order_data.status == 'undefined') {
                        return m.flashError(Conf.tr('Bad order data'));
                    }

                    if (order_data.status != Conf.statuses.STATUS_WAIT_PAYMENT) {
                        return m.flashError(Conf.tr('Order has been already handled'));
                    }

                    // QR-CODE
                    var jsonData = {
                        account: order_data.store_data.merchant_id,
                        amount: order_data.amount,
                        asset: order_data.currency,
                        t: Conf.payment_type,
                        m: Conf.payment_prefix + order_data.id
                    };
                    var jsonDataStr = JSON.stringify(jsonData);

                    //calculate the qrCode size
                    var qrSize = 5;
                    // 5 = (496b), 6 = (608b), 7 = (704b), 8 = 108 (880b), 9 = 130 (1056b)
                    var lenInBytes = Qr.qrcode.stringToBytes(jsonDataStr).length * 8 + 16;
                    if (lenInBytes > 496) qrSize++;
                    if (lenInBytes > 608) qrSize++;
                    if (lenInBytes > 704) qrSize++;
                    if (lenInBytes > 880) qrSize++;
                    if (lenInBytes > 1056) qrSize++;
                    var qr = Qr.qrcode(qrSize, 'Q');
                    qr.addData(jsonDataStr);
                    qr.make();

                    var imgTag = qr.createImgTag(4);

                    //set stream on payment
                    Conf.horizon.transactions().forAccount(order_data.store_data.merchant_id).cursor('now').stream({
                        onmessage: function onmessage(transaction) {
                            var order_id = getOrderIdFromTX(transaction);
                            if (order_id && order_id == order_data.id) {
                                return onSuccessPayment(ctrl.order_data().success_url);
                            }
                        }
                    });

                    m.startComputation();
                    ctrl.order_data(order_data);
                    ctrl.qr(m.trust(imgTag));
                    m.endComputation();
                }).catch(function (error) {
                    console.error(error);
                    return m.flashApiError(error);
                }).then(function () {
                    m.onLoadingEnd();
                });

                function getOrderIdFromTX(transaction) {
                    if (typeof transaction != 'undefined' && typeof transaction.memo != 'undefined' && transaction.memo.toString().length > Conf.payment_prefix.length) {
                        var prefix = transaction.memo.substr(0, Conf.payment_prefix.length);
                        if (prefix != Conf.payment_prefix) {
                            return false;
                        }

                        return transaction.memo.substr(Conf.payment_prefix.length);
                    }

                    return false;
                }

                this.confirmPayment = function (e) {
                    e.preventDefault();
                    m.onLoadingStart();
                    if (!e.target.login || !e.target.login.value) {
                        return m.flashError(Conf.tr('Fill all required fields'));
                    }
                    if (!e.target.password || !e.target.password.value) {
                        return m.flashError(Conf.tr('Fill all required fields'));
                    }

                    var wallet_data = null;

                    StellarWallet.getWallet({
                        server: Conf.keyserver_host + '/v2',
                        username: e.target.login.value,
                        password: e.target.password.value
                    }).then(function (wallet) {
                        wallet_data = wallet;

                        return Auth.loadAccountById(StellarSdk.Keypair.fromSeed(wallet_data.getKeychainData()).accountId());
                    }).then(function (account_data) {
                        if (account_data.type_i != StellarSdk.xdr.AccountType.accountRegisteredUser().value && account_data.type_i != StellarSdk.xdr.AccountType.accountAnonymousUser().value) {

                            return m.flashError(Conf.tr('Bad account type'));
                        }

                        return Conf.horizon.loadAccount(account_data.id);
                    }).then(function (source) {
                        var memo = StellarSdk.Memo.text(Conf.payment_prefix + ctrl.order_data().id);
                        var tx = new StellarSdk.TransactionBuilder(source, { memo: memo }).addOperation(StellarSdk.Operation.payment({
                            destination: ctrl.order_data().store_data.merchant_id,
                            amount: parseFloat(ctrl.order_data().amount).toFixed(2).toString(),
                            asset: new StellarSdk.Asset(ctrl.order_data().currency, Conf.master_key)
                        })).build();
                        tx.sign(StellarSdk.Keypair.fromSeed(wallet_data.getKeychainData()));

                        return Conf.horizon.submitTransaction(tx);
                    }).catch(function (error) {
                        console.error(error);
                        return m.flashError(Conf.tr('Cannot make transfer'));
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                function onSuccessPayment(success_url) {
                    m.flashSuccess(Conf.tr('Payment successfully complete. You will be redirected to merchant site in 5 seconds'));
                    setTimeout(function () {
                        window.location.href = success_url;
                    }, 5000);
                }
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), { tag: "div", attrs: { class: "content-page no_margin_left" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [ctrl.order_data() ? { tag: "div", attrs: { class: "col-lg-8 col-lg-offset-2" }, children: [{ tag: "div", attrs: { class: "col-lg-12" }, children: [{ tag: "div", attrs: { class: "panel panel-color panel-success" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Payment confirmation')] }, { tag: "p", attrs: { class: "panel-sub-title font-13" }, children: [Conf.tr('Auth for complete payment or use alternative methods')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "col-lg-4" }, children: [{ tag: "blockquote", attrs: {}, children: [{ tag: "p", attrs: {}, children: [Conf.tr('Payment amount'), ":"] }, { tag: "p", attrs: {}, children: [{ tag: "span", attrs: { class: "label label-success" }, children: [ctrl.order_data().amount, " ", ctrl.order_data().currency] }] }] }] }, { tag: "div", attrs: { class: "col-lg-4" }, children: [{ tag: "blockquote", attrs: {}, children: [{ tag: "p", attrs: {}, children: [Conf.tr('Payment details'), ":"] }, { tag: "p", attrs: {}, children: [{ tag: "span", attrs: { class: "label label-success" }, children: [ctrl.order_data().details || Conf.tr('Empty details')] }] }] }] }, { tag: "div", attrs: { class: "col-lg-4" }, children: [{ tag: "blockquote", attrs: {}, children: [{ tag: "p", attrs: {}, children: [Conf.tr('Merchant'), ":"] }, { tag: "p", attrs: {}, children: [{ tag: "span", attrs: { class: "label label-success" }, children: [ctrl.order_data().store_data.url] }] }] }] }] }] }] }, { tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "div", attrs: { class: "panel panel-border panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Payment by login/password')] }] }, { tag: "div", attrs: { class: "panel-body text-center" }, children: [{ tag: "form", attrs: { class: "form-horizontal m-t-20", method: "POST", onsubmit: ctrl.confirmPayment.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-lg-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text", required: "required", name: "login", placeholder: Conf.tr('Login') } }, { tag: "i", attrs: { class: "md md-account-circle form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-lg-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password", required: "required", name: "password", placeholder: Conf.tr('password') } }, { tag: "i", attrs: { class: "md md-vpn-key form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group text-right m-t-20 text-center" }, children: [{ tag: "div", attrs: { class: "col-lg-12" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-custom w-md waves-effect waves-light", type: "submit" }, children: [Conf.tr('Confirm payment')] }] }] }] }] }] }] }, { tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "div", attrs: { class: "panel panel-border panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Other methods')] }] }, { tag: "div", attrs: { class: "panel-body text-center" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "div", attrs: { class: "col-md-12" }, children: [{ tag: "span", attrs: { class: "label label-warning" }, children: [Conf.tr('QRCode')] }, { tag: "div", attrs: { class: "row" }, children: [ctrl.qr()] }] }] }] }] }] }] } : { tag: "div", attrs: { class: "col-lg-8 col-lg-offset-2" }, children: [{ tag: "code", attrs: {}, children: [Conf.tr('Check payment data'), "..."] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../components/FooterFullWidth.js": 6, "../components/NavbarFullWidth.js": 8, "../config/Config.js": 11, "../models/Auth": 15, "../models/Helpers": 16, "qrcode-npm/qrcode": 3 }], 25: [function (require, module, exports) {}, {}], 26: [function (require, module, exports) {
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

        function EventEmitter() {
            this._events = this._events || {};
            this._maxListeners = this._maxListeners || undefined;
        }
        module.exports = EventEmitter;

        // Backwards-compat with node 0.10.x
        EventEmitter.EventEmitter = EventEmitter;

        EventEmitter.prototype._events = undefined;
        EventEmitter.prototype._maxListeners = undefined;

        // By default EventEmitters will print a warning if more than 10 listeners are
        // added to it. This is a useful default which helps finding memory leaks.
        EventEmitter.defaultMaxListeners = 10;

        // Obviously not all Emitters should be limited to 10. This function allows
        // that to be increased. Set to zero for unlimited.
        EventEmitter.prototype.setMaxListeners = function (n) {
            if (!isNumber(n) || n < 0 || isNaN(n)) throw TypeError('n must be a positive number');
            this._maxListeners = n;
            return this;
        };

        EventEmitter.prototype.emit = function (type) {
            var er, handler, len, args, i, listeners;

            if (!this._events) this._events = {};

            // If there is no 'error' event listener then throw.
            if (type === 'error') {
                if (!this._events.error || isObject(this._events.error) && !this._events.error.length) {
                    er = arguments[1];
                    if (er instanceof Error) {
                        throw er; // Unhandled 'error' event
                    }
                    throw TypeError('Uncaught, unspecified "error" event.');
                }
            }

            handler = this._events[type];

            if (isUndefined(handler)) return false;

            if (isFunction(handler)) {
                switch (arguments.length) {
                    // fast cases
                    case 1:
                        handler.call(this);
                        break;
                    case 2:
                        handler.call(this, arguments[1]);
                        break;
                    case 3:
                        handler.call(this, arguments[1], arguments[2]);
                        break;
                    // slower
                    default:
                        len = arguments.length;
                        args = new Array(len - 1);
                        for (i = 1; i < len; i++) {
                            args[i - 1] = arguments[i];
                        }handler.apply(this, args);
                }
            } else if (isObject(handler)) {
                len = arguments.length;
                args = new Array(len - 1);
                for (i = 1; i < len; i++) {
                    args[i - 1] = arguments[i];
                }listeners = handler.slice();
                len = listeners.length;
                for (i = 0; i < len; i++) {
                    listeners[i].apply(this, args);
                }
            }

            return true;
        };

        EventEmitter.prototype.addListener = function (type, listener) {
            var m;

            if (!isFunction(listener)) throw TypeError('listener must be a function');

            if (!this._events) this._events = {};

            // To avoid recursion in the case that type === "newListener"! Before
            // adding it to the listeners, first emit "newListener".
            if (this._events.newListener) this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);

            if (!this._events[type])
                // Optimize the case of one listener. Don't need the extra array object.
                this._events[type] = listener;else if (isObject(this._events[type]))
                // If we've already got an array, just append.
                this._events[type].push(listener);else
                // Adding the second element, need to change to array.
                this._events[type] = [this._events[type], listener];

            // Check for listener leak
            if (isObject(this._events[type]) && !this._events[type].warned) {
                var m;
                if (!isUndefined(this._maxListeners)) {
                    m = this._maxListeners;
                } else {
                    m = EventEmitter.defaultMaxListeners;
                }

                if (m && m > 0 && this._events[type].length > m) {
                    this._events[type].warned = true;
                    console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
                    if (typeof console.trace === 'function') {
                        // not supported in IE 10
                        console.trace();
                    }
                }
            }

            return this;
        };

        EventEmitter.prototype.on = EventEmitter.prototype.addListener;

        EventEmitter.prototype.once = function (type, listener) {
            if (!isFunction(listener)) throw TypeError('listener must be a function');

            var fired = false;

            function g() {
                this.removeListener(type, g);

                if (!fired) {
                    fired = true;
                    listener.apply(this, arguments);
                }
            }

            g.listener = listener;
            this.on(type, g);

            return this;
        };

        // emits a 'removeListener' event iff the listener was removed
        EventEmitter.prototype.removeListener = function (type, listener) {
            var list, position, length, i;

            if (!isFunction(listener)) throw TypeError('listener must be a function');

            if (!this._events || !this._events[type]) return this;

            list = this._events[type];
            length = list.length;
            position = -1;

            if (list === listener || isFunction(list.listener) && list.listener === listener) {
                delete this._events[type];
                if (this._events.removeListener) this.emit('removeListener', type, listener);
            } else if (isObject(list)) {
                for (i = length; i-- > 0;) {
                    if (list[i] === listener || list[i].listener && list[i].listener === listener) {
                        position = i;
                        break;
                    }
                }

                if (position < 0) return this;

                if (list.length === 1) {
                    list.length = 0;
                    delete this._events[type];
                } else {
                    list.splice(position, 1);
                }

                if (this._events.removeListener) this.emit('removeListener', type, listener);
            }

            return this;
        };

        EventEmitter.prototype.removeAllListeners = function (type) {
            var key, listeners;

            if (!this._events) return this;

            // not listening for removeListener, no need to emit
            if (!this._events.removeListener) {
                if (arguments.length === 0) this._events = {};else if (this._events[type]) delete this._events[type];
                return this;
            }

            // emit removeListener for all listeners on all events
            if (arguments.length === 0) {
                for (key in this._events) {
                    if (key === 'removeListener') continue;
                    this.removeAllListeners(key);
                }
                this.removeAllListeners('removeListener');
                this._events = {};
                return this;
            }

            listeners = this._events[type];

            if (isFunction(listeners)) {
                this.removeListener(type, listeners);
            } else {
                // LIFO order
                while (listeners.length) {
                    this.removeListener(type, listeners[listeners.length - 1]);
                }
            }
            delete this._events[type];

            return this;
        };

        EventEmitter.prototype.listeners = function (type) {
            var ret;
            if (!this._events || !this._events[type]) ret = [];else if (isFunction(this._events[type])) ret = [this._events[type]];else ret = this._events[type].slice();
            return ret;
        };

        EventEmitter.listenerCount = function (emitter, type) {
            var ret;
            if (!emitter._events || !emitter._events[type]) ret = 0;else if (isFunction(emitter._events[type])) ret = 1;else ret = emitter._events[type].length;
            return ret;
        };

        function isFunction(arg) {
            return typeof arg === 'function';
        }

        function isNumber(arg) {
            return typeof arg === 'number';
        }

        function isObject(arg) {
            return (typeof arg === "undefined" ? "undefined" : _typeof(arg)) === 'object' && arg !== null;
        }

        function isUndefined(arg) {
            return arg === void 0;
        }
    }, {}], 27: [function (require, module, exports) {
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
    }, { "rH1JPG": 28 }], 28: [function (require, module, exports) {
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
    }, {}] }, {}, [13]);