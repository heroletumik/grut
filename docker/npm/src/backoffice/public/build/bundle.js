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
    }, {}], 2: [function (require, module, exports) {
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
    }, {}], 3: [function (require, module, exports) {
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
    }, { "fs": 47, "path": 49 }], 4: [function (require, module, exports) {
        (function (global) {
            /**
             * lodash (Custom Build) <https://lodash.com/>
             * Build: `lodash modularize exports="npm" -o ./`
             * Copyright jQuery Foundation and other contributors <https://jquery.org/>
             * Released under MIT license <https://lodash.com/license>
             * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
             * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
             */

            /** Used as references for various `Number` constants. */
            var INFINITY = 1 / 0;

            /** `Object#toString` result references. */
            var symbolTag = '[object Symbol]';

            /** Used to match leading and trailing whitespace. */
            var reTrim = /^\s+|\s+$/g;

            /** Used to compose unicode character classes. */
            var rsAstralRange = "\\ud800-\\udfff",
                rsComboMarksRange = "\\u0300-\\u036f\\ufe20-\\ufe23",
                rsComboSymbolsRange = "\\u20d0-\\u20f0",
                rsVarRange = "\\ufe0e\\ufe0f";

            /** Used to compose unicode capture groups. */
            var rsAstral = '[' + rsAstralRange + ']',
                rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']',
                rsFitz = "\\ud83c[\\udffb-\\udfff]",
                rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
                rsNonAstral = '[^' + rsAstralRange + ']',
                rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}",
                rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]",
                rsZWJ = "\\u200d";

            /** Used to compose unicode regexes. */
            var reOptMod = rsModifier + '?',
                rsOptVar = '[' + rsVarRange + ']?',
                rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
                rsSeq = rsOptVar + reOptMod + rsOptJoin,
                rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

            /** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
            var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

            /** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
            var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']');

            /** Detect free variable `global` from Node.js. */
            var freeGlobal = (typeof global === "undefined" ? "undefined" : _typeof(global)) == 'object' && global && global.Object === Object && global;

            /** Detect free variable `self`. */
            var freeSelf = (typeof self === "undefined" ? "undefined" : _typeof(self)) == 'object' && self && self.Object === Object && self;

            /** Used as a reference to the global object. */
            var root = freeGlobal || freeSelf || Function('return this')();

            /**
             * Converts an ASCII `string` to an array.
             *
             * @private
             * @param {string} string The string to convert.
             * @returns {Array} Returns the converted array.
             */
            function asciiToArray(string) {
                return string.split('');
            }

            /**
             * The base implementation of `_.findIndex` and `_.findLastIndex` without
             * support for iteratee shorthands.
             *
             * @private
             * @param {Array} array The array to inspect.
             * @param {Function} predicate The function invoked per iteration.
             * @param {number} fromIndex The index to search from.
             * @param {boolean} [fromRight] Specify iterating from right to left.
             * @returns {number} Returns the index of the matched value, else `-1`.
             */
            function baseFindIndex(array, predicate, fromIndex, fromRight) {
                var length = array.length,
                    index = fromIndex + (fromRight ? 1 : -1);

                while (fromRight ? index-- : ++index < length) {
                    if (predicate(array[index], index, array)) {
                        return index;
                    }
                }
                return -1;
            }

            /**
             * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
             *
             * @private
             * @param {Array} array The array to inspect.
             * @param {*} value The value to search for.
             * @param {number} fromIndex The index to search from.
             * @returns {number} Returns the index of the matched value, else `-1`.
             */
            function baseIndexOf(array, value, fromIndex) {
                if (value !== value) {
                    return baseFindIndex(array, baseIsNaN, fromIndex);
                }
                var index = fromIndex - 1,
                    length = array.length;

                while (++index < length) {
                    if (array[index] === value) {
                        return index;
                    }
                }
                return -1;
            }

            /**
             * The base implementation of `_.isNaN` without support for number objects.
             *
             * @private
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
             */
            function baseIsNaN(value) {
                return value !== value;
            }

            /**
             * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
             * that is not found in the character symbols.
             *
             * @private
             * @param {Array} strSymbols The string symbols to inspect.
             * @param {Array} chrSymbols The character symbols to find.
             * @returns {number} Returns the index of the first unmatched string symbol.
             */
            function charsStartIndex(strSymbols, chrSymbols) {
                var index = -1,
                    length = strSymbols.length;

                while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
                return index;
            }

            /**
             * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
             * that is not found in the character symbols.
             *
             * @private
             * @param {Array} strSymbols The string symbols to inspect.
             * @param {Array} chrSymbols The character symbols to find.
             * @returns {number} Returns the index of the last unmatched string symbol.
             */
            function charsEndIndex(strSymbols, chrSymbols) {
                var index = strSymbols.length;

                while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
                return index;
            }

            /**
             * Checks if `string` contains Unicode symbols.
             *
             * @private
             * @param {string} string The string to inspect.
             * @returns {boolean} Returns `true` if a symbol is found, else `false`.
             */
            function hasUnicode(string) {
                return reHasUnicode.test(string);
            }

            /**
             * Converts `string` to an array.
             *
             * @private
             * @param {string} string The string to convert.
             * @returns {Array} Returns the converted array.
             */
            function stringToArray(string) {
                return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
            }

            /**
             * Converts a Unicode `string` to an array.
             *
             * @private
             * @param {string} string The string to convert.
             * @returns {Array} Returns the converted array.
             */
            function unicodeToArray(string) {
                return string.match(reUnicode) || [];
            }

            /** Used for built-in method references. */
            var objectProto = Object.prototype;

            /**
             * Used to resolve the
             * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
             * of values.
             */
            var objectToString = objectProto.toString;

            /** Built-in value references. */
            var _Symbol = root.Symbol;

            /** Used to convert symbols to primitives and strings. */
            var symbolProto = _Symbol ? _Symbol.prototype : undefined,
                symbolToString = symbolProto ? symbolProto.toString : undefined;

            /**
             * The base implementation of `_.slice` without an iteratee call guard.
             *
             * @private
             * @param {Array} array The array to slice.
             * @param {number} [start=0] The start position.
             * @param {number} [end=array.length] The end position.
             * @returns {Array} Returns the slice of `array`.
             */
            function baseSlice(array, start, end) {
                var index = -1,
                    length = array.length;

                if (start < 0) {
                    start = -start > length ? 0 : length + start;
                }
                end = end > length ? length : end;
                if (end < 0) {
                    end += length;
                }
                length = start > end ? 0 : end - start >>> 0;
                start >>>= 0;

                var result = Array(length);
                while (++index < length) {
                    result[index] = array[index + start];
                }
                return result;
            }

            /**
             * The base implementation of `_.toString` which doesn't convert nullish
             * values to empty strings.
             *
             * @private
             * @param {*} value The value to process.
             * @returns {string} Returns the string.
             */
            function baseToString(value) {
                // Exit early for strings to avoid a performance hit in some environments.
                if (typeof value == 'string') {
                    return value;
                }
                if (isSymbol(value)) {
                    return symbolToString ? symbolToString.call(value) : '';
                }
                var result = value + '';
                return result == '0' && 1 / value == -INFINITY ? '-0' : result;
            }

            /**
             * Casts `array` to a slice if it's needed.
             *
             * @private
             * @param {Array} array The array to inspect.
             * @param {number} start The start position.
             * @param {number} [end=array.length] The end position.
             * @returns {Array} Returns the cast slice.
             */
            function castSlice(array, start, end) {
                var length = array.length;
                end = end === undefined ? length : end;
                return !start && end >= length ? array : baseSlice(array, start, end);
            }

            /**
             * Checks if `value` is object-like. A value is object-like if it's not `null`
             * and has a `typeof` result of "object".
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
             * @example
             *
             * _.isObjectLike({});
             * // => true
             *
             * _.isObjectLike([1, 2, 3]);
             * // => true
             *
             * _.isObjectLike(_.noop);
             * // => false
             *
             * _.isObjectLike(null);
             * // => false
             */
            function isObjectLike(value) {
                return !!value && (typeof value === "undefined" ? "undefined" : _typeof(value)) == 'object';
            }

            /**
             * Checks if `value` is classified as a `Symbol` primitive or object.
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to check.
             * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
             * @example
             *
             * _.isSymbol(Symbol.iterator);
             * // => true
             *
             * _.isSymbol('abc');
             * // => false
             */
            function isSymbol(value) {
                return (typeof value === "undefined" ? "undefined" : _typeof(value)) == 'symbol' || isObjectLike(value) && objectToString.call(value) == symbolTag;
            }

            /**
             * Converts `value` to a string. An empty string is returned for `null`
             * and `undefined` values. The sign of `-0` is preserved.
             *
             * @static
             * @memberOf _
             * @since 4.0.0
             * @category Lang
             * @param {*} value The value to process.
             * @returns {string} Returns the string.
             * @example
             *
             * _.toString(null);
             * // => ''
             *
             * _.toString(-0);
             * // => '-0'
             *
             * _.toString([1, 2, 3]);
             * // => '1,2,3'
             */
            function toString(value) {
                return value == null ? '' : baseToString(value);
            }

            /**
             * Removes leading and trailing whitespace or specified characters from `string`.
             *
             * @static
             * @memberOf _
             * @since 3.0.0
             * @category String
             * @param {string} [string=''] The string to trim.
             * @param {string} [chars=whitespace] The characters to trim.
             * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
             * @returns {string} Returns the trimmed string.
             * @example
             *
             * _.trim('  abc  ');
             * // => 'abc'
             *
             * _.trim('-_-abc-_-', '_-');
             * // => 'abc'
             *
             * _.map(['  foo  ', '  bar  '], _.trim);
             * // => ['foo', 'bar']
             */
            function trim(string, chars, guard) {
                string = toString(string);
                if (string && (guard || chars === undefined)) {
                    return string.replace(reTrim, '');
                }
                if (!string || !(chars = baseToString(chars))) {
                    return string;
                }
                var strSymbols = stringToArray(string),
                    chrSymbols = stringToArray(chars),
                    start = charsStartIndex(strSymbols, chrSymbols),
                    end = charsEndIndex(strSymbols, chrSymbols) + 1;

                return castSlice(strSymbols, start, end).join('');
            }

            module.exports = trim;
        }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
    }, {}], 5: [function (require, module, exports) {
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
    }, { "events": 48, "inherits": 2 }], 6: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Auth = require('../models/Auth'),
            Helpers = require('../models/Helpers');

        module.exports = {
            controller: function controller(direction, inputs) {
                var ctrl = this;
                if (!Auth.username()) {
                    return m.route('/');
                }

                this.is_manage = m.prop(false);
                this.flat_fee = m.prop(false);
                this.percent_fee = m.prop(false);

                this.manageCommission = function (direction, e) {
                    e.preventDefault();
                    var from_account;
                    var from_type;
                    var to_account;
                    var to_type;
                    if (e.target.from_acc) {
                        from_account = e.target.from_acc.value;
                    }
                    if (e.target.from_type) {
                        from_type = e.target.from_type.value;
                    }
                    if (e.target.to_acc) {
                        to_account = e.target.to_acc.value;
                    }
                    if (e.target.to_type) {
                        to_type = e.target.to_type.value;
                    }
                    if (!from_account && !from_type && !to_account && !to_type) {
                        return m.flashError(Conf.tr('Check require params'));
                    }
                    if (from_account) {
                        if (!StellarSdk.Keypair.isValidPublicKey(from_account)) {
                            return m.flashError(Conf.tr('Bad account id'));
                        }
                    }
                    if (to_account) {
                        if (!StellarSdk.Keypair.isValidPublicKey(to_account)) {
                            return m.flashError(Conf.tr('Bad account id'));
                        }
                    }
                    var asset = new StellarSdk.Asset(Conf.asset, Conf.master_key);
                    this.getCommissions(from_account || to_account, from_account, to_account, from_type, to_type, asset, direction).then(function (commission) {
                        m.startComputation();
                        ctrl.freezeCommissionParameters();
                        ctrl.flat_fee(commission.flat);
                        ctrl.percent_fee(commission.percent);
                        ctrl.is_manage(true);
                        m.endComputation();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr('Can not get commissions'));
                    });
                };

                this.getCommissions = function (target, from, to, from_type, to_type, asset, direction) {

                    if (!StellarSdk.Keypair.isValidPublicKey(target)) {
                        return m.flashError(Conf.tr('Bad account id'));
                    }

                    m.startComputation();
                    ctrl.flat_fee(0);
                    ctrl.percent_fee(0);
                    m.endComputation();
                    return new Promise(function (resolve, reject) {
                        return Conf.horizon.commission().forAccount(target).forAsset(asset).call().then(function (commissions) {

                            var data = {};

                            data.flat = 0;
                            data.percent = 0;

                            commissions.records.every(function (commission) {
                                switch (direction) {
                                    case Conf.directions[0]:
                                        if (commission.hasOwnProperty('from') && !commission.hasOwnProperty('to') && !commission.hasOwnProperty('from_account_type_i') && !commission.hasOwnProperty('to_account_type_i')) {
                                            data.flat = commission.flat_fee;
                                            data.percent = commission.percent_fee;

                                            return false;
                                        }

                                        break;

                                    case Conf.directions[1]:
                                        if (!commission.hasOwnProperty('from') && commission.hasOwnProperty('to') && !commission.hasOwnProperty('from_account_type_i') && !commission.hasOwnProperty('to_account_type_i')) {
                                            data.flat = commission.flat_fee;
                                            data.percent = commission.percent_fee;

                                            return false;
                                        }

                                        break;

                                    case Conf.directions[2]:
                                        if (commission.hasOwnProperty('from') && commission.from == from && commission.hasOwnProperty('to') && commission.to == to && !commission.hasOwnProperty('from_account_type_i') && !commission.hasOwnProperty('to_account_type_i')) {
                                            data.flat = commission.flat_fee;
                                            data.percent = commission.percent_fee;

                                            return false;
                                        }

                                        break;

                                    case Conf.directions[3]:
                                        if (commission.hasOwnProperty('from') && commission.from == from && !commission.hasOwnProperty('to') && !commission.hasOwnProperty('from_account_type_i') && commission.hasOwnProperty('to_account_type_i') && commission.to_account_type_i == to_type) {
                                            data.flat = commission.flat_fee;
                                            data.percent = commission.percent_fee;

                                            return false;
                                        }

                                        break;

                                    case Conf.directions[4]:
                                        if (!commission.hasOwnProperty('from') && commission.hasOwnProperty('to') && commission.to == to && commission.hasOwnProperty('from_account_type_i') && commission.from_account_type_i == from_type && !commission.hasOwnProperty('to_account_type_i')) {
                                            data.flat = commission.flat_fee;
                                            data.percent = commission.percent_fee;

                                            return false;
                                        }

                                        break;
                                }

                                return true;
                            });
                            resolve(data);
                        }).catch(function (err) {
                            reject(err);
                        });
                    });
                };

                this.freezeCommissionParameters = function () {
                    m.startComputation();
                    document.getElementById('direction').disabled = true;

                    if (!!document.getElementById('from_acc')) {
                        document.getElementById('from_acc').disabled = true;
                    }
                    if (!!document.getElementById('to_acc')) {
                        document.getElementById('to_acc').disabled = true;
                    }
                    if (!!document.getElementById('from_type')) {
                        document.getElementById('from_type').disabled = true;
                    }
                    if (!!document.getElementById('to_type')) {
                        document.getElementById('to_type').disabled = true;
                    }
                    m.endComputation();
                };

                this.unfreezeCommissionParameters = function () {
                    m.startComputation();
                    document.getElementById('direction').disabled = false;

                    if (!!document.getElementById('from_acc')) {
                        document.getElementById('from_acc').disabled = false;
                    }
                    if (!!document.getElementById('to_acc')) {
                        document.getElementById('to_acc').disabled = false;
                    }
                    if (!!document.getElementById('from_type')) {
                        document.getElementById('from_type').disabled = false;
                    }
                    if (!!document.getElementById('to_type')) {
                        document.getElementById('to_type').disabled = false;
                    }
                    m.endComputation();
                };

                this.closeManageForm = function () {
                    ctrl.unfreezeCommissionParameters();
                    m.startComputation();
                    ctrl.is_manage(false);
                    m.endComputation();
                };

                this.saveCommissions = function (inputs, e) {
                    m.onLoadingStart();
                    var opts = {};
                    if (inputs.from_acc) {
                        opts.from = document.getElementById('from_acc').value;
                    }
                    if (inputs.to_acc) {
                        opts.to = document.getElementById('to_acc').value;
                    }
                    if (inputs.from_type) {
                        opts.from_type = document.getElementById('from_type').value;
                    }
                    if (inputs.to_type) {
                        opts.to_type = document.getElementById('to_type').value;
                    }
                    opts.asset = new StellarSdk.Asset(Conf.asset, Conf.master_key);

                    var flat = document.getElementById('flat').value;
                    var percent = document.getElementById('percent').value;

                    return Helpers.saveCommissionOperation(opts, flat, percent).then(function () {
                        m.startComputation();
                        ctrl.flat_fee(flat);
                        ctrl.percent_fee(percent);
                        m.endComputation();
                    });
                };

                this.deleteCommission = function (inputs, e) {
                    m.onLoadingStart();
                    var opts = {};
                    if (inputs.from_acc) {
                        opts.from = document.getElementById('from_acc').value;
                    }
                    if (inputs.to_acc) {
                        opts.to = document.getElementById('to_acc').value;
                    }
                    if (inputs.from_type) {
                        opts.from_type = document.getElementById('from_type').value;
                    }
                    if (inputs.to_type) {
                        opts.to_type = document.getElementById('to_type').value;
                    }
                    opts.asset = new StellarSdk.Asset(Conf.asset, Conf.master_key);

                    return Helpers.deleteCommissionOperation(opts).then(function () {
                        ctrl.closeManageForm();
                    });
                };
            },

            view: function view(ctrl, direction, inputs) {
                return { tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "div", attrs: { class: "panel panel-primary panel-border" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Fee for direction"), ": ", Conf.tr(direction)] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "form", attrs: { class: "form-horizontal", id: "commission_form", role: "form", method: "post", onsubmit: ctrl.manageCommission.bind(ctrl, direction) }, children: [inputs().from_acc ? { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "from_acc", class: "col-md-2 control-label" }, children: [Conf.tr("From account")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text", name: "from_acc", id: "from_acc", required: "required" } }] }] } : '', inputs().from_type ? { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "select", class: "col-md-2 control-label" }, children: [Conf.tr("From type")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "select", attrs: { class: "form-control", name: "from_type", id: "from_type" }, children: [Conf.account_types.map(function (type) {
                                                return { tag: "option", attrs: { value: type.code }, children: [Conf.tr(Helpers.capitalizeFirstLetter(type.name))] };
                                            })] }] }] } : '', inputs().to_acc ? { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "to_acc", class: "col-md-2 control-label" }, children: [Conf.tr("To account")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text", name: "to_acc", id: "to_acc", required: "required" } }] }] } : '', inputs().to_type ? { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "select", class: "col-md-2 control-label" }, children: [Conf.tr("To type")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "select", attrs: { class: "form-control", name: "to_type", id: "to_type" }, children: [Conf.account_types.map(function (type) {
                                                return { tag: "option", attrs: { value: type.code }, children: [Conf.tr(Helpers.capitalizeFirstLetter(type.name))] };
                                            })] }] }] } : '', ctrl.is_manage() ? { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "flat", class: "col-md-2 control-label" }, children: [Conf.tr("Flat fee")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: { class: "form-control", type: "number", min: "0", placeholder: "0.00", id: "flat",
                                                    value: ctrl.flat_fee() } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "percent", class: "col-md-2 control-label" }, children: [Conf.tr("Percent fee")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: { class: "form-control", type: "number", min: "0", placeholder: "0.00", id: "percent",
                                                    value: ctrl.percent_fee() } }] }] }, { tag: "div", attrs: { class: "form-group m-b-0" }, children: [{ tag: "div", attrs: { class: "col-md-offset-2 col-md-10" }, children: [{ tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "button", attrs: { type: "button", class: "btn btn-inverse btn-custom waves-effect waves-light m-b-5 m-r-5",
                                                        onclick: ctrl.closeManageForm.bind(ctrl) }, children: [Conf.tr("Close")] }, { tag: "button", attrs: { type: "button", class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5 m-r-5",
                                                        onclick: ctrl.saveCommissions.bind(ctrl, inputs()) }, children: [Conf.tr("Save")] }, ctrl.flat_fee() || ctrl.percent_fee() ? { tag: "button", attrs: { type: "button", class: "btn btn-danger btn-custom waves-effect w-md waves-light m-b-5 m-r-5",
                                                        onclick: ctrl.deleteCommission.bind(ctrl, inputs()) }, children: [Conf.tr("Delete")] } : ''] }] }] }] } : { tag: "div", attrs: { class: "form-group m-b-0" }, children: [{ tag: "div", attrs: { class: "col-sm-offset-2 col-sm-8" }, children: [{ tag: "button", attrs: {
                                                type: "submit",
                                                class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5" }, children: [Conf.tr("Manage")] }] }] }] }] }] }] };
            }
        };
    }, { "../config/Config.js": 15, "../models/Auth": 19, "../models/Helpers": 20 }], 7: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Session = require('../models/Session.js');

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
                    }, [m(".row", [m(".col-md-4.col-md-offset-4", [[m(".portlet", [m(".portlet-heading.bg-primary", { style: { borderRadius: 0 } }, [m("h3.portlet-title", Session.modalTitle() || Conf.tr('Message')), m(".portlet-widgets", [m("a[href='#']", {
                        onclick: function onclick(e) {
                            e.preventDefault();Session.closeModal();
                        }
                    }, [m("i.ion-close-round")])]), m(".clearfix")]), m(".portlet-body", Session.modalMessage())])]]), m(".clearfix")])]) : '', { tag: "footer", attrs: { class: "footer" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: ["© 2016 made by ", { tag: "a", attrs: { href: "http://atticlab.net" }, children: ["AtticLab"] }] }] }] }] }] };
            }
        };
    }, { "../config/Config.js": 15, "../models/Session.js": 22 }], 8: [function (require, module, exports) {
        module.exports = {
            controller: function controller() {
                var ctrl = this;
            },

            view: function view(ctrl) {
                return { tag: "footer", attrs: { class: "footer footer-full-width" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-xs-12 text-center" }, children: ["© 2016 made by ", { tag: "a", attrs: { href: "http://atticlab.net" }, children: ["AtticLab"] }] }] }] }] };
            }
        };
    }, {}], 9: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Auth = require('../models/Auth');

        module.exports = {
            controller: function controller(account_id) {
                var ctrl = this;

                this.assets = m.prop([]);
                this.limits = m.prop([]);

                this.getData = function (account_id) {

                    m.onLoadingStart();

                    return Conf.horizon.accounts().limits(account_id).call().then(function (limits) {
                        m.startComputation();
                        ctrl.limits(limits.limits);
                        m.endComputation();
                    }).then(function () {
                        return Conf.horizon.assets().call();
                    }).then(function (assets) {
                        m.startComputation();

                        // find agent's limits for an asset
                        assets.records.forEach(function (asset) {

                            asset['limits'] = {
                                max_operation_out: "-1",
                                daily_max_out: "-1",
                                monthly_max_out: "-1",
                                max_operation_in: "-1",
                                daily_max_in: "-1",
                                monthly_max_in: "-1"
                            };

                            var found_limits = _.find(ctrl.limits(), function (limit) {
                                return limit.asset_code === asset.asset_code;
                            });

                            if (found_limits) {
                                delete found_limits.asset_code;
                                for (var key in found_limits) {
                                    if (found_limits.hasOwnProperty(key)) {
                                        found_limits[key] = parseFloat(found_limits[key]);
                                    }
                                }

                                asset['limits'] = found_limits;
                            }
                        });

                        ctrl.assets(assets.records);
                        m.endComputation();
                    }).then(function () {
                        m.onLoadingEnd();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr("Error requesting data"));
                    });
                };

                this.handleCheckBox = function (e) {
                    var $closestInput = $(e.target).closest('td').find(':input[type="number"]');

                    if ($(e.target).is(":checked")) {
                        $closestInput.fadeOut('fast');
                        ctrl.assets()[$closestInput[0].name].limits[$closestInput[0].className] = "-1";
                    } else {
                        $closestInput.fadeIn('fast');
                        ctrl.assets()[$closestInput[0].name].limits[$closestInput[0].className] = 0.01;
                    }
                };

                this.handleLimitChange = function (e) {
                    ctrl.assets()[e.target.name].limits[e.target.className] = e.target.value.toString();
                };

                this.saveLimits = function (e) {
                    e.preventDefault();

                    var adminKeyPair = null;

                    m.onLoadingStart();

                    m.getPromptValue(Conf.tr("Enter password to save limits")).then(function (pwd) {
                        return StellarWallet.getWallet({
                            server: Conf.keyserver_host + '/v2',
                            username: Auth.username(),
                            password: pwd
                        });
                    }).then(function (wallet) {
                        adminKeyPair = StellarSdk.Keypair.fromSeed(wallet.getKeychainData());
                        return Conf.horizon.loadAccount(Conf.master_key);
                    }).then(function (source) {
                        ctrl.assets().forEach(function (asset) {

                            if (typeof asset.limits.asset_code != 'undefined') {
                                delete asset.limits.asset_code;
                            }

                            for (var key in asset.limits) {
                                if (asset.limits.hasOwnProperty(key)) {
                                    if (asset.limits[key] > 0) {
                                        asset.limits[key] = asset.limits[key].toString();
                                    } else {
                                        asset.limits[key] = "-1";
                                    }
                                }
                            }

                            var op = StellarSdk.Operation.setAgentLimits(account_id, asset.asset_code, asset.limits);
                            var tx = new StellarSdk.TransactionBuilder(source).addOperation(op).build();
                            tx.sign(adminKeyPair);
                            return Conf.horizon.submitTransaction(tx);
                        });
                    }).then(function () {
                        m.onLoadingEnd();
                        m.flashSuccess(Conf.tr("Limits saved successfully"));
                    }).catch(function (err) {
                        console.log(err);
                        m.flashError(Conf.tr("Error saving limits") + " | " + err);
                    });
                };

                this.getData(account_id);
            },

            view: function view(ctrl, account_id) {
                return { tag: "div", attrs: { class: "panel panel-primary panel-border" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Limits for account"), " ", { tag: "span", attrs: { id: "accountID" }, children: [account_id] }] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "table", attrs: { class: "table table-striped m-b-20" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Asset code")] }, { tag: "th", attrs: {}, children: [Conf.tr("Max operation out")] }, { tag: "th", attrs: {}, children: [Conf.tr("Daily max out")] }, { tag: "th", attrs: {}, children: [Conf.tr("Monthly max out")] }, { tag: "th", attrs: {}, children: [Conf.tr("Max operation in")] }, { tag: "th", attrs: {}, children: [Conf.tr("Daily max in")] }, { tag: "th", attrs: {}, children: [Conf.tr("Monthly max in")] }] }] }, { tag: "tbody", attrs: {}, children: [ctrl.assets().map(function (asset, i) {
                                    return { tag: "tr", attrs: { class: "asset_code" }, children: [{ tag: "td", attrs: { class: "asset_name" }, children: [asset.asset_code] }, { tag: "td", attrs: {}, children: [{ tag: "input", attrs: { type: "number", min: "0.01", step: "0.01",
                                                    style: asset.limits.max_operation_out < 0 ? "display: none" : '',
                                                    value: asset.limits.max_operation_out,
                                                    class: "max_operation_out", name: i,
                                                    oninput: ctrl.handleLimitChange.bind(ctrl),
                                                    onchange: ctrl.handleLimitChange.bind(ctrl) } }, { tag: "p", attrs: {}, children: [{ tag: "div", attrs: { class: "checkbox checkbox-primary" }, children: [m("input", {
                                                        type: "checkbox",
                                                        onclick: ctrl.handleCheckBox.bind(ctrl),
                                                        checked: asset.limits.max_operation_out < 0
                                                    }), { tag: "label", attrs: { for: "max_operation_out_no_limit" }, children: [Conf.tr("No limit")] }] }] }] }, { tag: "td", attrs: {}, children: [{ tag: "input", attrs: { type: "number", min: "0.01", step: "0.01",
                                                    style: asset.limits.daily_max_out < 0 ? "display: none" : '',
                                                    value: asset.limits.daily_max_out,
                                                    class: "daily_max_out", name: i,
                                                    oninput: ctrl.handleLimitChange.bind(ctrl) } }, { tag: "p", attrs: {}, children: [{ tag: "div", attrs: { class: "checkbox checkbox-primary" }, children: [m("input", {
                                                        type: "checkbox",
                                                        onclick: ctrl.handleCheckBox.bind(ctrl),
                                                        checked: asset.limits.daily_max_out < 0
                                                    }), { tag: "label", attrs: { for: "daily_max_out_no_limit" }, children: [Conf.tr("No limit")] }] }] }] }, { tag: "td", attrs: {}, children: [{ tag: "input", attrs: { type: "number", min: "0.01", step: "0.01",
                                                    style: asset.limits.monthly_max_out < 0 ? "display: none" : '',
                                                    value: asset.limits.monthly_max_out,
                                                    class: "monthly_max_out", name: i,
                                                    oninput: ctrl.handleLimitChange.bind(ctrl) } }, { tag: "p", attrs: {}, children: [{ tag: "div", attrs: { class: "checkbox checkbox-primary" }, children: [m("input", {
                                                        type: "checkbox",
                                                        onclick: ctrl.handleCheckBox.bind(ctrl),
                                                        checked: asset.limits.monthly_max_out < 0
                                                    }), { tag: "label", attrs: { for: "monthly_max_out_no_limit" }, children: [Conf.tr("No limit")] }] }] }] }, { tag: "td", attrs: {}, children: [{ tag: "input", attrs: { type: "number", min: "0.01", step: "0.01",
                                                    style: asset.limits.max_operation_in < 0 ? "display: none" : '',
                                                    value: asset.limits.max_operation_in,
                                                    class: "max_operation_in", name: i,
                                                    oninput: ctrl.handleLimitChange.bind(ctrl) } }, { tag: "p", attrs: {}, children: [{ tag: "div", attrs: { class: "checkbox checkbox-primary" }, children: [m("input", {
                                                        type: "checkbox",
                                                        onclick: ctrl.handleCheckBox.bind(ctrl),
                                                        checked: asset.limits.max_operation_in < 0
                                                    }), { tag: "label", attrs: { for: "max_operation_in_no_limit" }, children: [Conf.tr("No limit")] }] }] }] }, { tag: "td", attrs: {}, children: [{ tag: "input", attrs: { type: "number", min: "0.01", step: "0.01",
                                                    style: asset.limits.daily_max_in < 0 ? "display: none" : '',
                                                    value: asset.limits.daily_max_in,
                                                    class: "daily_max_in", name: i,
                                                    oninput: ctrl.handleLimitChange.bind(ctrl) } }, { tag: "p", attrs: {}, children: [{ tag: "div", attrs: { class: "checkbox checkbox-primary" }, children: [m("input", {
                                                        type: "checkbox",
                                                        onclick: ctrl.handleCheckBox.bind(ctrl),
                                                        checked: asset.limits.daily_max_in < 0
                                                    }), { tag: "label", attrs: { for: "daily_max_in_no_limit" }, children: [Conf.tr("No limit")] }] }] }] }, { tag: "td", attrs: {}, children: [{ tag: "input", attrs: { type: "number", min: "0.01", step: "0.01",
                                                    style: asset.limits.monthly_max_in < 0 ? "display: none" : '',
                                                    value: asset.limits.monthly_max_in,
                                                    class: "monthly_max_in", name: i,
                                                    oninput: ctrl.handleLimitChange.bind(ctrl) } }, { tag: "p", attrs: {}, children: [{ tag: "div", attrs: { class: "checkbox checkbox-primary" }, children: [m("input", {
                                                        type: "checkbox",
                                                        onclick: ctrl.handleCheckBox.bind(ctrl),
                                                        checked: asset.limits.monthly_max_in < 0
                                                    }), { tag: "label", attrs: { for: "monthly_max_in_no_limit" }, children: [Conf.tr("No limit")] }] }] }] }] };
                                })] }] }, { tag: "button", attrs: { id: "saveLimitsForAccount", type: "submit", onclick: ctrl.saveLimits.bind(ctrl),
                                class: "btn btn-primary btn-custom waves-effect w-md waves-light m-r-5" }, children: [Conf.tr("Save")] }] }] };
            }
        };
    }, { "../config/Config.js": 15, "../models/Auth": 19 }], 10: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Auth = require('../models/Auth'),
            Helpers = require('../models/Helpers'),
            Session = require('../models/Session.js');

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
                return { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "topbar" }, children: [{ tag: "div", attrs: { class: "topbar-left" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "a", attrs: { href: "/home", config: m.route, class: "logo" }, children: [{ tag: "i", attrs: { class: "md md-equalizer" } }, { tag: "span", attrs: {}, children: ["SmartMoney"] }, " "] }] }] }, { tag: "div", attrs: { class: "navbar navbar-default", role: "navigation" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "" }, children: [{ tag: "div", attrs: { class: "pull-left" }, children: [{ tag: "button", attrs: { class: "button-menu-mobile open-left waves-effect" }, children: [{ tag: "i", attrs: { class: "md md-menu" } }] }, { tag: "span", attrs: { class: "clearfix" } }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "#", onclick: Auth.logout }, children: [{ tag: "i", attrs: { class: "fa fa-power-off m-r-5" } }, Conf.tr("Logout")] }] }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: { class: "dropdown" }, children: [{ tag: "a", attrs: { class: "dropdown-toggle", "data-toggle": "dropdown", href: "#" }, children: [{ tag: "i", attrs: { class: "fa fa-language fa-fw" } }, " ", { tag: "i", attrs: { class: "fa fa-caret-down" } }] }, { tag: "ul", attrs: { class: "dropdown-menu dropdown-user" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'en'), href: "#" }, children: [{ tag: "img", attrs: {
                                                                src: "/assets/img/flags/en.png" } }, " English"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ua'), href: "#" }, children: [{ tag: "img", attrs: {
                                                                src: "/assets/img/flags/ua.png" } }, " Українська"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ru'), href: "#" }, children: [{ tag: "img", attrs: {
                                                                src: "/assets/img/flags/ru.png" } }, " Русский"] }] }] }] }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "#", onclick: ctrl.updateTTL.bind(ctrl),
                                                    title: Conf.tr('Time to end the session') }, children: [{ tag: "div", attrs: { id: "spinner-progress",
                                                        class: "c100 small small-cust green p" + ctrl.css_class() }, children: [{ tag: "span", attrs: { id: "spinner-time" }, children: [!ctrl.ttl() ? '' : Helpers.getTimeFromSeconds(ctrl.ttl())] }, { tag: "div", attrs: { class: "slice" }, children: [{ tag: "div", attrs: { class: "bar" } }, { tag: "div", attrs: { class: "fill" } }] }] }] }] }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "button", attrs: { class: "btn btn-icon waves-effect waves-light btn-purple m-b-5",
                                                    onclick: ctrl.refreshPage.bind(ctrl) }, children: [{ tag: "i", attrs: { class: "fa fa-refresh" } }] }] }] }] }] }] }] }] };
            }
        };
    }, { "../config/Config.js": 15, "../models/Auth": 19, "../models/Helpers": 20, "../models/Session.js": 22 }], 11: [function (require, module, exports) {
        var Auth = require('../models/Auth.js'),
            Conf = require('../config/Config.js');

        module.exports = {
            controller: function controller(data) {
                var ctrl = this;

                this.current_page = m.prop(data.pagination.page);
                this.next_page_offset = m.prop(ctrl.current_page() * Conf.pagination.limit);
                this.func = m.prop(data.pagination.func);
                this.btn_prev = m.prop(false);
                this.btn_next = m.prop(false);
                this.previous_page = m.prop(ctrl.current_page() - 1);
                this.next_page = m.prop(ctrl.current_page() + 1);

                this.has_previous_page = function () {
                    return ctrl.previous_page() >= 1;
                };

                this.getNextPageItems = function () {
                    return Auth.api()[ctrl.func()]({ limit: Conf.pagination.limit, offset: ctrl.next_page_offset() });
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
    }, { "../config/Config.js": 15, "../models/Auth.js": 19 }], 12: [function (require, module, exports) {
        var Auth = require('../models/Auth.js'),
            Conf = require('../config/Config.js'),
            DateFormat = require('dateformat');

        module.exports = {
            controller: function controller() {},

            view: function view(ctrl, data) {
                return !data || !data.payments.length ? { tag: "p", attrs: { class: "text-primary" }, children: [Conf.tr("No payments yet")] } : { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "hidden-xs" }, children: [{ tag: "table", attrs: { class: "table table-striped m-0" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("ID")] }, { tag: "th", attrs: {}, children: [Conf.tr("Date")] }, { tag: "th", attrs: {}, children: [Conf.tr("Amount")] }, { tag: "th", attrs: {}, children: [Conf.tr("From")] }, { tag: "th", attrs: {}, children: [Conf.tr("To")] }] }] }, { tag: "tbody", attrs: {}, children: [data.payments.map(function (payment) {
                                    return { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [payment.id] }, { tag: "td", attrs: {}, children: [DateFormat(payment.closed_at, 'dd.mm.yyyy HH:MM:ss')] }, { tag: "td", attrs: {}, children: [parseFloat(payment.amount).toFixed(2)] }, { tag: "td", attrs: {}, children: [{ tag: "a", attrs: { href: "/analytics/account/" + payment.from, config: m.route }, children: [{ tag: "span", attrs: { title: payment.from }, children: [payment.from.substr(0, 15) + '...'] }] }] }, { tag: "td", attrs: {}, children: [{ tag: "a", attrs: { href: "/analytics/account/" + payment.to, config: m.route }, children: [{ tag: "span", attrs: { title: payment.to }, children: [payment.to.substr(0, 15) + '...'] }] }] }] };
                                })] }] }] }] };
            }
        };
    }, { "../config/Config.js": 15, "../models/Auth.js": 19, "dateformat": 1 }], 13: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Auth = require('../models/Auth');

        module.exports = {
            controller: function controller(account_id) {
                var ctrl = this;

                this.block_incoming = m.prop(false);
                this.block_outcoming = m.prop(false);
                this.restricts = m.prop(false);

                this.getTraits = function () {
                    m.onLoadingStart();

                    return Conf.horizon.accounts().traits(account_id).call().then(function (traits) {
                        m.startComputation();
                        ctrl.block_incoming(traits.block_incoming_payments);
                        ctrl.block_outcoming(traits.block_outcoming_payments);
                        ctrl.restricts(true);
                        m.endComputation();
                    }).then(function () {
                        m.onLoadingEnd();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr("Error requesting data"));
                    });
                };

                this.saveTraits = function (e) {
                    e.preventDefault();

                    m.onLoadingStart();

                    m.getPromptValue(Conf.tr("Enter password to save limits")).then(function (pwd) {
                        return StellarWallet.getWallet({
                            server: Conf.keyserver_host + '/v2',
                            username: Auth.username(),
                            password: pwd
                        });
                    }).then(function (wallet) {
                        var admin_keypair = StellarSdk.Keypair.fromSeed(wallet.getKeychainData());
                        return Conf.horizon.restrictAgentAccount(account_id, ctrl.block_outcoming(), ctrl.block_incoming(), admin_keypair, Conf.master_key);
                    }).then(function () {
                        m.onLoadingEnd();
                        m.flashSuccess(Conf.tr("Restricts saved successfully"));
                    }).catch(function (err) {
                        console.log(err);
                        m.flashError(Conf.tr("Error saving restricts") + " | " + err);
                    });
                };

                this.getTraits();
            },

            view: function view(ctrl, account_id) {
                return { tag: "div", attrs: { class: "panel panel-primary panel-border" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Restricts for account"), " ", { tag: "span", attrs: { id: "accountID" }, children: [account_id] }] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [ctrl.restricts() ? { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "checkbox checkbox-primary" }, children: [m("input", {
                                    type: "checkbox",
                                    id: "block_incoming",
                                    onclick: m.withAttr('checked', ctrl.block_incoming),
                                    checked: ctrl.block_incoming()
                                }), { tag: "label", attrs: { for: "block_incoming_payments" }, children: [Conf.tr("Block incoming payments")] }] }, { tag: "hr", attrs: {} }, { tag: "div", attrs: { class: "checkbox checkbox-primary" }, children: [m("input", {
                                    type: "checkbox",
                                    id: "block_outcoming",
                                    onclick: m.withAttr('checked', ctrl.block_outcoming),
                                    checked: ctrl.block_outcoming()
                                }), { tag: "label", attrs: { for: "block_outcoming_payments" }, children: [Conf.tr("Block outcoming payments")] }] }, { tag: "hr", attrs: {} }, { tag: "button", attrs: { id: "saveRestrictsForAccount", type: "submit", onclick: ctrl.saveTraits.bind(ctrl),
                                    class: "btn btn-primary btn-custom waves-effect w-md waves-light m-r-5" }, children: [Conf.tr("Save")] }] } : { tag: "div", attrs: { class: "alert alert-dismissible alert-warning" }, children: [{ tag: "button", attrs: { type: "button", class: "close", "data-dismiss": "alert" }, children: ["×"] }, { tag: "p", attrs: {}, children: [Conf.tr("Invalid account")] }] }] }] };
            }
        };
    }, { "../config/Config.js": 15, "../models/Auth": 19 }], 14: [function (require, module, exports) {
        var menuItems = require('../models/Menu-items');
        var Conf = require('../config/Config.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                // check if current sub-menu item is in parent menu to keep sub-menu opened
                this.isRouteInSubItems = function (subItems) {
                    return _.find(subItems, function (keys) {
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
    }, { "../config/Config.js": 15, "../models/Menu-items": 21 }], 15: [function (require, module, exports) {
        (function (process) {
            var Localize = require('localize');
            var Locales = require('../locales/translations.js');
            var trim = require('lodash.trim');

            var conf = {
                master_key: "",
                g_agent_pub: "",
                horizon_host: trim("", '/'),
                keyserver_host: trim("", '/'),
                api_url: trim("", '/'),
                roles: {
                    admin: 1,
                    emission: 2
                },
                general_agent_signer_weight: 1
            };

            conf.assets_url = 'assets';
            conf.asset = 'EUAH';

            conf.directions = ['From account', 'To account', 'From account to account', 'From account to type', 'From type to account'];

            conf.account_types = [{ name: 'anonymous', code: function () {
                    return StellarSdk.xdr.AccountType.accountAnonymousUser().value;
                }() }, { name: 'registered', code: function () {
                    return StellarSdk.xdr.AccountType.accountRegisteredUser().value;
                }() }, { name: 'merchant', code: function () {
                    return StellarSdk.xdr.AccountType.accountMerchant().value;
                }() }, { name: 'distribution', code: function () {
                    return StellarSdk.xdr.AccountType.accountDistributionAgent().value;
                }() }, { name: 'settlement', code: function () {
                    return StellarSdk.xdr.AccountType.accountSettlementAgent().value;
                }() }, { name: 'exchange', code: function () {
                    return StellarSdk.xdr.AccountType.accountExchangeAgent().value;
                }() }, { name: 'bank', code: function () {
                    return StellarSdk.xdr.AccountType.accountBank().value;
                }() }];

            conf.phone = {
                view_mask: "+99 (999) 999-99-99",
                db_mask: "999999999999",
                length: 10,
                prefix: "+38"
            };

            StellarSdk.Network.use(new StellarSdk.Network(""));
            conf.horizon = new StellarSdk.Server(conf.horizon_host);

            conf.locales = Locales;

            conf.payments = {
                onpage: 10,
                onmain: 5
            };

            conf.pagination = {
                limit: 10
            };

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

            conf.enrollment_created = 2;
            conf.enrollment_approved = 4;
            conf.enrollment_declined = 8;

            conf.enrollments_statuses = {
                2: 'created',
                4: 'approved',
                8: 'declined'
            };

            var Config = module.exports = conf;
        }).call(this, require("rH1JPG"));
    }, { "../errors/Errors": 16, "../locales/translations.js": 18, "localize": 3, "lodash.trim": 4, "rH1JPG": 50 }], 16: [function (require, module, exports) {
        var errors = {
            account_not_found: 'Account not found',
            service_error: 'Service error. Please, try again'
        };

        var Errors = module.exports = errors;
    }, {}], 17: [function (require, module, exports) {
        (function (process) {
            StellarSdk.Network.use(new StellarSdk.Network(""));

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
                "/sign": require('./pages/Sign.js'),
                "/home": require('./pages/Home.js'),
                "/admins": require('./pages/Admins/Admins.js'),
                "/emission": require('./pages/Emission/List.js'),
                "/emission/generate": require('./pages/Emission/Generate.js'),
                "/emission/process": require('./pages/Emission/Process.js'),
                "/companies": require('./pages/Companies/List.js'),
                "/companies/create": require('./pages/Companies/Create.js'),
                "/analytics": require('./pages/Analytics/Index.js'),
                "/analytics/account/:accountId": require('./pages/Analytics/Account.js'),
                "/commissions/assets": require('./pages/Commission/Assets.js'),
                "/commissions/types": require('./pages/Commission/Types.js'),
                "/commissions/accounts": require('./pages/Commission/Accounts.js'),
                "/commissions/manage": require('./pages/Commission/Manage.js'),
                "/invoices/statistics": require('./pages/Invoices/Statistics'),
                "/bans/list": require('./pages/Bans/List.js'),
                "/bans/create": require('./pages/Bans/Create.js'),
                "/agents/manage": require('./pages/Agents/Manage.js'),
                "/agents/create": require('./pages/Agents/Create.js'),
                "/agents/enrollments": require('./pages/Agents/Enrollments.js'),
                "/generalagent": require('./pages/GeneralAgent/List.js'),
                "/generalagent/distribution": require('./pages/GeneralAgent/Distribution.js')
            });
        }).call(this, require("rH1JPG"));
    }, { "./config/Config.js": 15, "./pages/Admins/Admins.js": 23, "./pages/Agents/Create.js": 24, "./pages/Agents/Enrollments.js": 25, "./pages/Agents/Manage.js": 26, "./pages/Analytics/Account.js": 27, "./pages/Analytics/Index.js": 28, "./pages/Bans/Create.js": 29, "./pages/Bans/List.js": 30, "./pages/Commission/Accounts.js": 31, "./pages/Commission/Assets.js": 32, "./pages/Commission/Manage.js": 33, "./pages/Commission/Types.js": 34, "./pages/Companies/Create.js": 35, "./pages/Companies/List.js": 36, "./pages/Emission/Generate.js": 37, "./pages/Emission/List.js": 38, "./pages/Emission/Process.js": 39, "./pages/GeneralAgent/Distribution.js": 40, "./pages/GeneralAgent/List.js": 41, "./pages/Home.js": 42, "./pages/Invoices/Statistics": 43, "./pages/Login.js": 44, "./pages/Logout.js": 45, "./pages/Sign.js": 46, "queue": 5, "rH1JPG": 50 }], 18: [function (require, module, exports) {
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
            "Fee": {
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
            "Select way of direction": {
                ru: 'Выберите направление',
                ua: 'Оберіть напрямок'
            },
            "Select asset": {
                ru: 'Выберите валюту',
                ua: 'Оберіть валюту'
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
            "Fee for direction": {
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
            "Edit fees": {
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
        }), _defineProperty(_module$exports, "Show fee for types", {
            ru: 'Пказать комиссию по типам',
            ua: 'Показати комісію по типам'
        }), _defineProperty(_module$exports, "For types", {
            ru: 'Для типов',
            ua: 'Для типів'
        }), _defineProperty(_module$exports, "For assets (globally)", {
            ru: 'Для валют (глобально)',
            ua: 'Для валют (глобально)'
        }), _defineProperty(_module$exports, "Select account type to edit fees", {
            ru: 'Выберите тип счета для редактирования комиссий',
            ua: 'Оберіть тип рахунку для редагування комісій'
        }), _defineProperty(_module$exports, "Fee for type", {
            ru: 'Комиссия для типа',
            ua: 'Комісія для типу'
        }), _defineProperty(_module$exports, "Edit fee for type", {
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
        }), _defineProperty(_module$exports, "Cannot get fees", {
            ru: 'Не удалось получить комиссии',
            ua: 'Не вдалося отримати комісії'
        }), _defineProperty(_module$exports, "Cannot delete fees", {
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
        }), _defineProperty(_module$exports, "Fee account", {
            ru: 'Комиссионный счет',
            ua: 'Комісійний рахунок'
        }), _defineProperty(_module$exports, "Enter password", {
            ru: 'Пожалуйста, введите пароль',
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
        }), _defineProperty(_module$exports, "Time to end the session", {
            ru: 'Время до конца сессии',
            ua: 'Час до кінця сесії'
        }), _defineProperty(_module$exports, "Your name", {
            ru: 'Ваше имя',
            ua: 'Ваше ім\'я'
        }), _defineProperty(_module$exports, "Your position", {
            ru: 'Ваша должность',
            ua: 'Ваша посада'
        }), _defineProperty(_module$exports, "Comment", {
            ru: 'Комментарий',
            ua: 'Коментарій'
        }), _defineProperty(_module$exports, "Fill in your name and position", {
            ru: 'Заполните ваше имя и должность',
            ua: 'Заповніть ваше ім\'я та посаду'
        }), _defineProperty(_module$exports, "Please fill in all fields", {
            ru: 'Пожалуйста заполните все поля',
            ua: 'Будь-ласка заповніть всі поля'
        }), _defineProperty(_module$exports, "Service error. Please, try again", {
            ru: 'Сервисная ошибка. Пожалуйста, попробуйте еще раз',
            ua: 'Сервісна помилка. Будь-ласка, спробуйте ще раз'
        }), _module$exports);
    }, {}], 19: [function (require, module, exports) {
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

                return getAnonymousAssets().then(function (assets_list) {
                    Object.keys(assets_list).map(function (index) {
                        if (assets_list[index].asset_type != 'native') {
                            assets.push({
                                asset: assets_list[index].asset_code
                            });
                        }
                    });

                    // Use this function instead of load account to gather more data
                    return Auth.loadAccountById(account_id);
                }).then(function (source) {

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

                    //only unique values
                    var flags = {};
                    assets = assets.filter(function (item) {
                        if (flags[item.asset]) {
                            return false;
                        }
                        flags[item.asset] = true;
                        return true;
                    });

                    m.startComputation();
                    Auth.balances(balances);
                    Auth.assets(assets);
                    m.endComputation();

                    return account;
                });
            },

            login: function login(_login, password) {

                m.onLoadingStart();
                var master = null;
                var wallet = null;
                var keypair = null;

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

                        if (!is_admin) {
                            throw new Error('Login/password combination is invalid');
                        }
                    }

                    return wallet;
                }).then(function (wallet_info) {
                    wallet = wallet_info;
                    keypair = StellarSdk.Keypair.fromSeed(wallet.getKeychainData());

                    m.startComputation();
                    Auth.api(new StellarWallet.Api(Conf.api_url, keypair));
                    m.endComputation();

                    return Auth.api().initNonce();
                }).then(function (ttl) {
                    m.startComputation();
                    Auth.ttl(ttl);
                    Auth.time_live(Number(ttl));
                    m.endComputation();

                    return Auth.api().getAdmin({ account_id: keypair.accountId() });
                }).then(function (admin) {
                    if (admin && admin.name) {
                        m.startComputation();
                        Auth.keypair(keypair);
                        Auth.username(wallet.username);
                        m.endComputation();
                        m.onLoadingEnd();
                    } else {
                        return m.flashError(Conf.tr(Conf.errors.service_error));
                    }
                }).catch(function (err) {
                    console.error(err);

                    if (err && err.message === 'Record is not found') {
                        swal({
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            html: '<h3>' + Conf.tr("Fill in your name and position") + '</h3>' + '<input id="admin-name" class="swal2-input" placeholder="' + Conf.tr("Your name") + '" autofocus>' + '<input id="admin-position" class="swal2-input" placeholder="' + Conf.tr("Your position") + '">' + '<input id="admin-comment" class="swal2-input" placeholder="' + Conf.tr('Comment') + '">',
                            preConfirm: function preConfirm() {
                                return new Promise(function (resolve, reject) {
                                    var name = document.querySelector('#admin-name').value;
                                    var position = document.querySelector('#admin-position').value;
                                    var comment = document.querySelector('#admin-comment').value;

                                    if (!name || !position || !comment) {
                                        reject(Conf.tr("Please fill in all fields"));
                                    }

                                    resolve({
                                        name: name,
                                        position: position,
                                        comment: comment
                                    });
                                });
                            }
                        }).then(function (admin) {
                            Auth.api().createAdmin({
                                account_id: keypair.accountId(),
                                name: admin.name,
                                position: admin.position,
                                comment: admin.comment
                            }).then(function (res) {
                                if (typeof res.message != 'undefined' && res.message == 'success') {
                                    m.startComputation();
                                    Auth.keypair(keypair);
                                    Auth.username(wallet.username);
                                    m.endComputation();
                                    m.onLoadingEnd();
                                    m.route('/');
                                    return true;
                                } else {
                                    m.flashError(Conf.tr(Conf.errors.service_error));
                                }
                            }).catch(function (err) {
                                console.error(err);
                                return m.flashApiError(err);
                            });
                        });
                    } else {
                        return m.flashError(Conf.tr(Conf.errors.service_error));
                    }
                });
            },

            registration: function registration(login, password) {
                var accountKeypair = StellarSdk.Keypair.random();
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
                m.endComputation();
                m.route('/');
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

        function getAnonymousAssets() {

            return m.request({ method: "GET", url: Conf.horizon_host + Conf.assets_url }).then(function (response) {
                if (typeof response._embedded == 'undefined' || typeof response._embedded.records == 'undefined') {
                    throw new Error(Conf.tr(Errors.assets_empty));
                }

                var assets_list = response._embedded.records;

                Object.keys(assets_list).forEach(function (key) {
                    if (typeof assets_list[key].is_anonymous == 'undefined') {
                        delete assets_list[key];
                    }
                    if (!assets_list[key].is_anonymous) {
                        delete assets_list[key];
                    }
                });

                return assets_list;
            });
        }

        Auth.setDefaults();

        module.exports = Auth;
    }, { "../config/Config.js": 15, "../errors/Errors.js": 16 }], 20: [function (require, module, exports) {
        var Conf = require('../config/Config');
        var Auth = require('../models/Auth');

        var Helpers = {

            getDateFromTimestamp: function getDateFromTimestamp(timestamp) {
                if (timestamp) {
                    var pad = "00";
                    var a = new Date(timestamp * 1000);
                    var year = a.getFullYear();
                    var month = Number(pad.substring(0, pad.length - a.getMonth().toString().length) + a.getMonth().toString()) + 1;
                    var date = pad.substring(0, pad.length - a.getDate().toString().length) + a.getDate().toString();
                    var hour = pad.substring(0, pad.length - a.getHours().toString().length) + a.getHours().toString();
                    var min = pad.substring(0, pad.length - a.getMinutes().toString().length) + a.getMinutes().toString();
                    var sec = pad.substring(0, pad.length - a.getSeconds().toString().length) + a.getSeconds().toString();
                    var date_format = date + '.' + month + '.' + year + ' ' + hour + ':' + min + ':' + sec;
                    return date_format;
                } else {
                    return '';
                }
            },

            getDateOnlyFromTimestamp: function getDateOnlyFromTimestamp(timestamp) {

                if (timestamp) {
                    var pad = "00";
                    var a = new Date(timestamp * 1000);
                    var year = a.getFullYear();
                    var month = Number(pad.substring(0, pad.length - a.getMonth().toString().length) + a.getMonth().toString()) + 1;
                    var date = pad.substring(0, pad.length - a.getDate().toString().length) + a.getDate().toString();
                    var date_format = date + '.' + month + '.' + year;
                    return date_format;
                } else {
                    return '';
                }
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
            },

            getTextAgentType: function getTextAgentType(type) {
                var prefix = 'account';
                var text_type = StellarSdk.xdr.AccountType._byValue.get(type).name;
                text_type = text_type.slice(prefix.length);
                return Conf.tr(text_type);
            },

            getAdminsList: function getAdminsList() {
                var admins = [];
                return new Promise(function (resolve, reject) {
                    Conf.horizon.accounts().accountId(Conf.master_key).call().then(function (data) {
                        if (typeof data.signers == 'undefined') {
                            reject('Unexpected response');
                        }
                        data.signers.forEach(function (signer) {
                            if (signer.weight == Conf.roles.admin) {
                                //don't add master account
                                if (signer.signertype > 0) {
                                    admins.push(signer.public_key);
                                }
                            }
                        });
                        resolve(admins);
                    }).catch(function (error) {
                        reject(error);
                    });
                });
            },
            getEmissionKeysList: function getEmissionKeysList() {
                var emmission_keys = [];
                return new Promise(function (resolve, reject) {
                    Conf.horizon.accounts().accountId(Conf.master_key).call().then(function (data) {
                        if (typeof data.signers == 'undefined') {
                            reject('Unexpected response');
                        }
                        data.signers.forEach(function (signer) {
                            if (signer.weight == Conf.roles.emission) {
                                emmission_keys.push(signer.public_key);
                            }
                        });
                        resolve(emmission_keys);
                    }).catch(function (error) {
                        reject(error);
                    });
                });
            },
            getGeneralAgentKeysList: function getGeneralAgentKeysList() {
                var gagent_keys = [];
                return new Promise(function (resolve, reject) {
                    Conf.horizon.accounts().accountId(Conf.g_agent_pub).call().then(function (data) {
                        if (typeof data.signers == 'undefined') {
                            reject('Unexpected response');
                        }
                        data.signers.forEach(function (signer) {
                            if (signer.weight == Conf.general_agent_signer_weight) {
                                if (signer.public_key != Conf.g_agent_pub) {
                                    gagent_keys.push(signer.public_key);
                                }
                            }
                        });
                        resolve(gagent_keys);
                    }).catch(function (error) {
                        reject(error);
                    });
                });
            },

            deleteMasterSigner: function deleteMasterSigner(account_id, e) {
                m.onLoadingStart();
                var adminKeyPair = null;
                m.getPromptValue(Conf.tr("Enter password")).then(function (pwd) {
                    return StellarWallet.getWallet({
                        server: Conf.keyserver_host + '/v2',
                        username: Auth.username(),
                        password: pwd
                    });
                }).then(function (wallet) {
                    adminKeyPair = StellarSdk.Keypair.fromSeed(wallet.getKeychainData());
                    return Conf.horizon.loadAccount(Conf.master_key);
                }).then(function (source) {
                    var tx = new StellarSdk.TransactionBuilder(source).addOperation(StellarSdk.Operation.setOptions({
                        signer: {
                            pubKey: account_id,
                            weight: 0,
                            signerType: StellarSdk.xdr.SignerType.signerGeneral().value
                        }
                    })).build();
                    tx.sign(adminKeyPair);
                    return Conf.horizon.submitTransaction(tx);
                }).then(function () {
                    $(e.target).closest('tr').fadeOut();
                    m.onLoadingEnd();
                }).catch(function (e) {
                    m.flashError(Conf.tr("Cannot delete signer"));
                    console.log(e);
                });
            },

            deleteGeneralAgentSigner: function deleteGeneralAgentSigner(account_id, e) {
                m.onLoadingStart();
                var g_agent_keypair = null;
                m.getPromptValue(Conf.tr("Enter mnemonic of general agent")).then(function (mnemonic) {
                    return StellarSdk.Keypair.fromSeed(StellarSdk.getSeedFromMnemonic(mnemonic));
                }).then(function (g_agent) {
                    g_agent_keypair = g_agent;
                    return Conf.horizon.loadAccount(g_agent_keypair.accountId());
                }).then(function (source) {
                    var tx = new StellarSdk.TransactionBuilder(source).addOperation(StellarSdk.Operation.setOptions({
                        signer: {
                            pubKey: account_id,
                            weight: 0,
                            signerType: StellarSdk.xdr.SignerType.signerGeneral().value
                        }
                    })).build();
                    tx.sign(g_agent_keypair);
                    return Conf.horizon.submitTransaction(tx);
                }).then(function () {
                    $(e.target).closest('tr').fadeOut();
                    m.onLoadingEnd();
                }).catch(function (e) {
                    m.flashError(Conf.tr("Cannot delete signer"));
                    console.log(e);
                });
            },

            getEnrollmentStageStatus: function getEnrollmentStageStatus(stage_status) {
                return Conf.tr(Conf.enrollments_statuses[stage_status]);
            },
            capitalizeFirstLetter: function capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            },
            getTextAccountType: function getTextAccountType(value) {
                var textAccountType = 'Unknown';
                Conf.account_types.map(function (type) {
                    if (type.code == value) {
                        textAccountType = type.name;
                    }
                });
                return textAccountType;
            },
            getCodeAccountType: function getCodeAccountType(value) {
                var codeAccountType = -1;
                Conf.account_types.map(function (type) {
                    if (type.name == value) {
                        codeAccountType = type.code.toString();
                    }
                });
                return codeAccountType;
            },
            saveCommissionOperation: function saveCommissionOperation(opts, flat, percent) {

                return Conf.horizon.loadAccount(Conf.master_key).then(function (source) {
                    var op = StellarSdk.Operation.setCommission(opts, flat.toString(), percent.toString());
                    var tx = new StellarSdk.TransactionBuilder(source).addOperation(op).build();
                    tx.sign(Auth.keypair());
                    return Conf.horizon.submitTransaction(tx);
                }).then(function () {
                    m.flashSuccess(Conf.tr("Saved successfully"));
                }).catch(function (err) {
                    console.error(err);
                    return m.flashError(Conf.tr('Can not save commission'));
                });
            },
            deleteCommissionOperation: function deleteCommissionOperation(opts) {

                return Conf.horizon.loadAccount(Conf.master_key).then(function (source) {
                    var op = StellarSdk.Operation.deleteCommission(opts);
                    var tx = new StellarSdk.TransactionBuilder(source).addOperation(op).build();
                    tx.sign(Auth.keypair());
                    return Conf.horizon.submitTransaction(tx);
                }).then(function () {
                    m.flashSuccess(Conf.tr("Deleted successfully"));
                }).catch(function (err) {
                    console.error(err);
                    return m.flashError(Conf.tr('Can not delete commission'));
                });
            },
            approveEnrollment: function approveEnrollment(account_id, account_type, tx_trust, enrollment_id, e) {
                m.onLoadingStart();

                return Conf.horizon.loadAccount(Conf.master_key).then(function (source) {
                    var tx = new StellarSdk.TransactionBuilder(source).addOperation(StellarSdk.Operation.createAccount({
                        destination: account_id,
                        accountType: account_type
                    })).build();
                    tx.sign(Auth.keypair());

                    return Conf.horizon.submitTransaction(tx);
                }).then(function () {

                    return Conf.horizon.submitTransaction(new StellarSdk.Transaction(tx_trust));
                }).then(function () {

                    return Auth.api().enrollmentApprove({ id: enrollment_id });
                }).then(function (response) {
                    if (typeof response.message != 'undefined' && response.message == 'success') {

                        return m.flashSuccess(Conf.tr(response.message));
                    } else {
                        console.error('Unexpected response');
                        console.error(response);

                        return m.flashError(Conf.tr(Conf.errors.service_error));
                    }
                }).catch(function (error) {
                    console.error(error);

                    return m.flashApiError(error);
                }).then(function () {
                    m.onLoadingEnd();
                    m.route(m.route());
                });
            },
            encryptData: function encryptData(data, password) {
                if (typeof data !== 'string') {
                    throw new TypeError('data must be a String.');
                }

                if (typeof password !== 'string') {
                    throw new TypeError('password must be a String.');
                }

                var encrypted = sjcl.encrypt(password, data);
                return btoa(encrypted);
            },

            download: function download(fileNameToSaveAs, textToWrite) {
                /* Saves a text string as a blob file */
                var ie = navigator.userAgent.match(/MSIE\s([\d.]+)/),
                    ie11 = navigator.userAgent.match(/Trident\/7.0/) && navigator.userAgent.match(/rv:11/),
                    ieEDGE = navigator.userAgent.match(/Edge/g),
                    ieVer = ie ? ie[1] : ie11 ? 11 : ieEDGE ? 12 : -1;

                if (ie && ieVer < 10) {
                    console.log("No blobs on IE ver<10");
                    return;
                }

                var textFileAsBlob = new Blob([textToWrite], {
                    type: 'text/plain'
                });

                if (ieVer > -1) {
                    window.navigator.msSaveBlob(textFileAsBlob, fileNameToSaveAs);
                } else {

                    var is_safari = false;

                    var ua = navigator.userAgent.toLowerCase();
                    if (ua.indexOf('safari') != -1) {
                        if (ua.indexOf('chrome') == -1) {
                            is_safari = true;
                        }
                    }

                    if (is_safari) {
                        alert(Conf.tr("In Safari browser may be problems with downloading files. If Safari opened file in a new tab, instead of downloading, please click ⌘+S and save the file with the extension .smb (For example: file.smb)In Safari browser may be problems with downloading files. If Safari opened file in a new tab, instead of downloading, please click ⌘+S and save the file with the extension .smb (For example: file.smb)"));
                    }

                    var downloadLink = document.createElement("a");
                    downloadLink.download = fileNameToSaveAs;
                    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                    downloadLink.onclick = function (e) {
                        document.body.removeChild(e.target);
                    };
                    downloadLink.style.display = "none";
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                }
            },

            long2ip: function long2ip(ip) {
                //   example 1: long2ip( 3221234342 )
                //   returns 1: '192.0.34.166'

                if (!isFinite(ip)) {
                    return false;
                }

                return [ip >>> 24, ip >>> 16 & 0xFF, ip >>> 8 & 0xFF, ip & 0xFF].join('.');
            }

        };
        module.exports = Helpers;
    }, { "../config/Config": 15, "../models/Auth": 19 }], 21: [function (require, module, exports) {
        module.exports = [{
            name: 'Main',
            route: '/home',
            icon: 'md md-dashboard',
            subItems: null
        }, {
            name: 'Admins',
            route: '/admins',
            icon: 'md md-people',
            subItems: null
        }, {
            name: 'Emission',
            route: '',
            icon: 'md md-attach-money',
            subItems: [{
                name: 'List',
                route: '/emission'
            }, {
                name: 'Generate key',
                route: '/emission/generate'
            }, {
                name: 'Emission process',
                route: '/emission/process'
            }]
        }, {
            name: 'General agent',
            route: '',
            icon: 'md md-people',
            subItems: [{
                name: 'List',
                route: '/generalagent'
            }, {
                name: 'Distribution',
                route: '/generalagent/distribution'
            }]
        }, {
            name: 'Companies',
            route: '',
            icon: 'md md-face-unlock',
            subItems: [{
                name: 'List',
                route: '/companies'
            }, {
                name: 'Create',
                route: '/companies/create'
            }]
        }, {
            name: 'Analytics',
            route: '/analytics',
            icon: 'md md-trending-up',
            subItems: null
        }, {
            name: 'Fee',
            route: '',
            icon: 'md md-content-cut',
            subItems: [{
                name: 'For asset (EUAH)',
                route: '/commissions/assets'
            }, {
                name: 'For types',
                route: '/commissions/types'
            }, {
                name: 'For accounts',
                route: '/commissions/accounts'
            }, {
                name: 'Fee account',
                route: '/commissions/manage'
            }]
        }, {
            name: 'Invoices',
            route: '',
            icon: 'md md-import-export',
            subItems: [{
                name: 'Statistics',
                route: '/invoices/statistics'
            }]
        }, {
            name: 'Bans',
            route: '',
            icon: 'md md-security',
            subItems: [{
                name: 'List',
                route: '/bans/list'
            }, {
                name: 'Create',
                route: '/bans/create'
            }]
        }, {
            name: 'Agents',
            route: '',
            icon: 'md md-people-outline',
            subItems: [{
                name: 'Create',
                route: '/agents/create'
            }, {
                name: 'Enrollments',
                route: '/agents/enrollments'
            }, {
                name: 'Manage',
                route: '/agents/manage'
            }]
        }];
    }, {}], 22: [function (require, module, exports) {
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
    }, {}], 23: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Sidebar = require('../../components/Sidebar.js'),
            Helpers = require('../../models/Helpers'),
            Auth = require('../../models/Auth');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.username()) {
                    return m.route('/');
                }

                this.admins = [];
                this.admins_data = m.prop([]);

                this.getAdmins = function () {
                    m.onLoadingStart();
                    Helpers.getAdminsList().then(function (admins) {
                        ctrl.admins = admins;
                        return Auth.api().getAdminsList({
                            account_ids: admins
                        });
                    }).then(function (data) {
                        var formatted_data = [];
                        ctrl.admins.map(function (account_id) {
                            formatted_data.push({ account_id: account_id });
                        });
                        data.items.map(function (account_data) {
                            formatted_data.map(function (admin_data) {
                                if ("account_id" in admin_data && account_data.account_id == admin_data.account_id) {
                                    admin_data.data = account_data;
                                }
                            });
                        });
                        m.startComputation();
                        ctrl.admins_data(formatted_data);
                        m.endComputation();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr('Can not get admins list'));
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.getAdmins();
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "panel panel-color panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Admins')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "table", attrs: { class: "table table-bordered" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Account ID')] }, { tag: "th", attrs: {}, children: [Conf.tr('Name')] }, { tag: "th", attrs: {}, children: [Conf.tr('Position')] }, { tag: "th", attrs: {}, children: [Conf.tr('Comment')] }, { tag: "th", attrs: {}, children: [Conf.tr('Actions')] }] }] }, { tag: "tbody", attrs: {}, children: [ctrl.admins_data().map(function (account_data) {

                                                    var additional_data = account_data.data || {};
                                                    return { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: account_data.account_id }, children: [account_data.account_id] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: {}, children: [additional_data.name || Conf.tr('No data yet')] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: {}, children: [additional_data.position || Conf.tr('No data yet')] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: {}, children: [additional_data.comment || Conf.tr('No data yet')] }] }, { tag: "td", attrs: {}, children: [account_data.account_id != Auth.keypair().accountId() ? { tag: "button", attrs: { type: "submit",
                                                                    onclick: Helpers.deleteMasterSigner.bind(ctrl, account_data.account_id),
                                                                    class: "btn btn-danger btn-xs waves-effect waves-light" }, children: [Conf.tr('Delete')] } : Conf.tr('Your account')] }] };
                                                })] }] }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19, "../../models/Helpers": 20 }], 24: [function (require, module, exports) {
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

                this.companies = m.prop([]);

                this.getCompanies = function () {
                    m.onLoadingStart();
                    Auth.api().getCompaniesList().then(function (companies) {
                        if (typeof companies.items != 'undefined') {
                            if (companies.items.length > 0) {
                                m.startComputation();
                                ctrl.companies(companies.items);
                                m.endComputation();
                            }
                        } else {
                            console.error('Unexpected response');
                            console.error(companies);
                        }
                    }).catch(function (error) {
                        console.error(error);
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.getCompanies();

                this.createAgent = function (e) {
                    e.preventDefault();

                    m.onLoadingStart();

                    var form_data = {
                        company_code: e.target.cmp_code.value,
                        type: parseInt(e.target.type.value),
                        asset: Conf.asset
                    };

                    Auth.api().createAgent(form_data).then(function (result) {
                        if (typeof result.message != 'undefined' && result.message == 'success') {
                            m.flashSuccess(Conf.tr('Success') + '. ' + Conf.tr('Enrollment was sent to email'));
                        } else {
                            console.error('Unexpected response');
                            console.error(result);
                            m.flashError(Conf.tr(Conf.errors.service_error));
                        }
                    }).catch(function (error) {
                        console.error(error);
                        m.flashApiError(error);
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [ctrl.companies().length ? { tag: "div", attrs: { class: "panel panel-primary panel-border" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Create new agent")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "form", attrs: { class: "form-horizontal", onsubmit: ctrl.createAgent.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "select",
                                                            class: "col-lg-2 control-label" }, children: [Conf.tr("Company")] }, { tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "select", attrs: { class: "form-control", name: "cmp_code" }, children: [ctrl.companies().map(function (company) {
                                                                return { tag: "option", attrs: { value: company.code }, children: [company.title] };
                                                            })] }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "select",
                                                            class: "col-lg-2 control-label" }, children: [Conf.tr("Type")] }, { tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "select", attrs: { class: "form-control", name: "type",
                                                                id: "type" }, children: [{ tag: "option", attrs: {
                                                                    value: StellarSdk.xdr.AccountType.accountMerchant().value }, children: [Conf.tr("Merchant")] }, { tag: "option", attrs: {
                                                                    value: StellarSdk.xdr.AccountType.accountDistributionAgent().value }, children: [Conf.tr("Distrubution")] }, { tag: "option", attrs: {
                                                                    value: StellarSdk.xdr.AccountType.accountSettlementAgent().value }, children: [Conf.tr("Settlement")] }, { tag: "option", attrs: {
                                                                    value: StellarSdk.xdr.AccountType.accountExchangeAgent().value }, children: [Conf.tr("Exchange")] }] }] }] }, { tag: "div", attrs: { class: "form-group m-b-0" }, children: [{ tag: "div", attrs: { class: "col-sm-offset-2 col-sm-3" }, children: [{ tag: "button", attrs: { type: "submit",
                                                                class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5" }, children: ["Create"] }] }] }] }] }] }] } : { tag: "div", attrs: {}, children: [!ctrl.companies().length ? { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-warning" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('No companies found')] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }, { tag: "div", attrs: { id: "bg-warning", class: "panel-collapse collapse in" }, children: [{ tag: "div", attrs: { class: "portlet-body" }, children: [Conf.tr('Please'), { tag: "a", attrs: { href: "/companies/create", config: m.route }, children: [" ", Conf.tr("create")] }, "!"] }] }] } : ''] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19 }], 25: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Sidebar = require('../../components/Sidebar.js'),
            Helpers = require('../../models/Helpers'),
            Auth = require('../../models/Auth'),
            Pagination = require('../../components/Pagination.js'),
            Session = require('../../models/Session.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.username()) {
                    return m.route('/');
                }

                this.is_initialized = m.prop(false);

                this.page = m.route.param('page') ? m.prop(Number(m.route.param('page'))) : m.prop(1);
                this.limit = Conf.pagination.limit;
                this.offset = (ctrl.page() - 1) * ctrl.limit;
                this.pagination_data = m.prop({ func: "getEnrollmentsList", page: ctrl.page() });

                this.enrollments = m.prop([]);

                this.getEnrollments = function () {
                    m.onLoadingStart();
                    return Auth.api().getEnrollmentsList({
                        limit: ctrl.limit,
                        offset: ctrl.offset,
                        type: 'agent'
                    }).then(function (enrollments) {
                        if (typeof enrollments.items != 'undefined') {
                            m.startComputation();
                            ctrl.enrollments(enrollments.items);
                            ctrl.is_initialized(true);
                            m.endComputation();
                        } else {
                            console.error('Unexpected response');
                            console.error(enrollments);
                        }
                    }).catch(function (error) {
                        console.error(error);
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.getEnrollments();
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [ctrl.is_initialized() ? { tag: "div", attrs: {}, children: [ctrl.enrollments().length ? { tag: "div", attrs: { class: "panel panel-color panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Enrollments')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "table", attrs: { class: "table table-bordered" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Enrollment ID')] }, { tag: "th", attrs: {}, children: [Conf.tr('Company code')] }, { tag: "th", attrs: {}, children: [Conf.tr('Agent type')] }, { tag: "th", attrs: {}, children: [Conf.tr('Show agent data')] }, { tag: "th", attrs: {}, children: [Conf.tr('Enrollment status')] }, { tag: "th", attrs: {}, children: [Conf.tr('Approve status')] }] }] }, { tag: "tbody", attrs: {}, children: [ctrl.enrollments().map(function (enrollment) {
                                                        return { tag: "tr", attrs: {
                                                                class: enrollment.stage == Conf.enrollment_created ? "active" : enrollment.stage == Conf.enrollment_approved ? "success" : "danger"

                                                            }, children: [{ tag: "td", attrs: {}, children: [{ tag: "span", attrs: {}, children: [enrollment.id] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Company code") }, children: [enrollment.company_data.code] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Agent type") }, children: [Helpers.getTextAgentType(enrollment.agent_data.type)] }] }, { tag: "td", attrs: {}, children: [enrollment.login ? { tag: "button", attrs: {
                                                                        class: "btn-xs btn-primary waves-effect waves-light",
                                                                        onclick: function onclick() {
                                                                            Session.modal({ tag: "table", attrs: { class: "table" }, children: [{ tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [Conf.tr('Login'), ":"] }, { tag: "td", attrs: {}, children: [{ tag: "code", attrs: {}, children: [enrollment.login] }] }] }, { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [Conf.tr('Account ID'), ":"] }, { tag: "td", attrs: {}, children: [{ tag: "code", attrs: {}, children: [enrollment.account_id] }] }] }] }, Conf.tr('Agent details'));
                                                                        }
                                                                    }, children: [Conf.tr('Show')] } : Conf.tr("Not created yet")] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Enrollment status") }, children: [Helpers.getEnrollmentStageStatus(enrollment.stage)] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Create status") }, children: [enrollment.agent_data.account_id ? Conf.tr("Agent created") : enrollment.stage == Conf.enrollment_approved ? { tag: "button", attrs: { class: "btn btn-primary btn-xs",
                                                                            onclick: Helpers.approveEnrollment.bind(ctrl, enrollment.account_id, enrollment.agent_data.type, enrollment.tx_trust, enrollment.id)
                                                                        }, children: [Conf.tr("Create agent")] } : enrollment.stage == Conf.enrollment_declined ? Conf.tr("Agent decline enrollment") : Conf.tr("Wait for enrollment approve")] }] }] };
                                                    })] }] }, m.component(Pagination, { pagination: ctrl.pagination_data() })] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-warning" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr("No enrollments are added yet")] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-primary" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('Wait for data loading'), "..."] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Pagination.js": 11, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19, "../../models/Helpers": 20, "../../models/Session.js": 22 }], 26: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Sidebar = require('../../components/Sidebar.js'),
            Limits = require('../../components/Limits'),
            Restricts = require('../../components/Restricts'),
            Helpers = require('../../models/Helpers'),
            Auth = require('../../models/Auth'),
            Pagination = require('../../components/Pagination.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.username()) {
                    return m.route('/');
                }

                this.is_initialized = m.prop(false);

                this.page = m.route.param('page') ? m.prop(Number(m.route.param('page'))) : m.prop(1);
                this.limit = Conf.pagination.limit;
                this.offset = (ctrl.page() - 1) * ctrl.limit;
                this.pagination_data = m.prop({ func: "getAgentsList", page: ctrl.page() });

                this.selected_agent = m.prop(false); // account ID of selected agent for managing
                this.manage_limits = m.prop(false); // flag for showing form to manage agent's limits
                this.manage_restricts = m.prop(false); // flag for showing form to manage agent's restricts

                this.agents = m.prop([]);

                this.getAgents = function () {
                    m.onLoadingStart();
                    return Auth.api().getAgentsList({ limit: ctrl.limit, offset: ctrl.offset }).then(function (agents) {
                        if (typeof agents.items != 'undefined') {
                            m.startComputation();
                            ctrl.agents(agents.items);
                            ctrl.is_initialized(true);
                            m.endComputation();
                        } else {
                            console.error('Unexpected response');
                            console.error(agents);
                        }
                    }).catch(function (error) {
                        console.error(error);
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                ctrl.getAgents();

                this.resetEditForms = function () {
                    ctrl.selected_agent(false);
                    ctrl.manage_limits(false);
                    ctrl.manage_restricts(false);
                };

                this.toggleManageLimits = function (account_id) {
                    ctrl.resetEditForms();
                    ctrl.selected_agent(account_id);
                    ctrl.manage_limits(true);
                };

                this.toggleManageRestricts = function (account_id) {
                    ctrl.resetEditForms();
                    ctrl.selected_agent(account_id);
                    ctrl.manage_restricts(true);
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [ctrl.is_initialized() ? { tag: "div", attrs: {}, children: [ctrl.agents().length ? { tag: "div", attrs: { class: "panel panel-color panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Registered agents')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "table", attrs: { class: "table table-bordered" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr("Account ID")] }, { tag: "th", attrs: {}, children: [Conf.tr('Agent ID')] }, { tag: "th", attrs: {}, children: [Conf.tr('Company CODE')] }, { tag: "th", attrs: {}, children: [Conf.tr('Company')] }, { tag: "th", attrs: {}, children: [Conf.tr('Agent type')] }, { tag: "th", attrs: {}, children: [Conf.tr('Restricts')] }, { tag: "th", attrs: {}, children: [Conf.tr('Limits')] }] }] }, { tag: "tbody", attrs: {}, children: [ctrl.agents().map(function (agent) {
                                                        return { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [agent.account_id ? { tag: "span", attrs: { title: agent.account_id }, children: [agent.account_id.substr(0, 30) + '...', " "] } : { tag: "span", attrs: {}, children: [Conf.tr("Account ID is not approved yet")] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Agent ID") }, children: [agent.id] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Company Code") }, children: [agent.cmp_code] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Company") }, children: [agent.cmp_title] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Agent type") }, children: [Helpers.getTextAgentType(agent.type)] }] }, { tag: "td", attrs: { style: "text-align: center" }, children: [agent.account_id ? { tag: "button", attrs: { class: "btn btn-primary btn-custom waves-effect waves-light btn-xs manage-restricts",
                                                                        onclick: ctrl.toggleManageRestricts.bind(ctrl, agent.account_id) }, children: [Conf.tr("Edit")] } : ''] }, { tag: "td", attrs: {}, children: [agent.account_id ? { tag: "button", attrs: { class: "btn btn-primary btn-custom waves-effect waves-light btn-xs",
                                                                        onclick: ctrl.toggleManageLimits.bind(ctrl, agent.account_id) }, children: [Conf.tr("Edit")] } : ''] }] };
                                                    })] }] }, m.component(Pagination, { pagination: ctrl.pagination_data() })] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-warning" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('No agents found')] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }, { tag: "div", attrs: { id: "bg-warning", class: "panel-collapse collapse in" }, children: [{ tag: "div", attrs: { class: "portlet-body" }, children: [Conf.tr('Please'), { tag: "a", attrs: { href: "/agents/create", config: m.route }, children: [" ", Conf.tr("create")] }, "!"] }] }] }, ctrl.manage_limits() ? m.component(Limits, ctrl.selected_agent()) : '', ctrl.manage_restricts() ? m.component(Restricts, ctrl.selected_agent()) : ''] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-primary" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('Wait for data loading'), "..."] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Limits": 9, "../../components/Navbar.js": 10, "../../components/Pagination.js": 11, "../../components/Restricts": 13, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19, "../../models/Helpers": 20 }], 27: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Payments = require('../../components/Payments.js'),
            Sidebar = require('../../components/Sidebar.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.username()) {
                    return m.route('/');
                }

                this.payments = m.prop([]);

                this.btn_prev = m.prop(false);
                this.btn_next = m.prop(false);

                this.account = m.prop(m.route.param('accountId'));

                this.handleBtnToTop = function (e) {
                    e.preventDefault();

                    ctrl.getPayments();
                };

                this.getPayments = function (e) {
                    return Conf.horizon.payments().forAccount(ctrl.account()).order('desc').call().then(function (payments) {
                        m.startComputation();
                        ctrl.payments(payments.records);
                        m.endComputation();

                        ctrl.checkPrev();
                        return ctrl.checkNext();
                    }).catch(function (err) {
                        m.flashError(Conf.tr("Error requesting payments"));
                    });
                };

                this.next = function (e) {
                    e.preventDefault();

                    // get last record's paging token for cursor
                    var next_cursor = ctrl.payments().slice(-1).pop().paging_token;

                    return Conf.horizon.payments().forAccount(ctrl.account()).cursor(next_cursor).order('desc').call().then(function (payments) {
                        m.startComputation();
                        ctrl.payments(payments.records);
                        m.endComputation();

                        ctrl.checkPrev();
                        return ctrl.checkNext();
                    }).catch(function (err) {
                        m.flashError(Conf.tr("Error requesting payments"));
                    });
                };

                this.prev = function (e) {
                    e.preventDefault();

                    // get first record's paging token for cursor
                    var prev_cursor = ctrl.payments()[0].paging_token;

                    return Conf.horizon.payments().forAccount(ctrl.account()).cursor(prev_cursor).call().then(function (payments) {
                        m.startComputation();
                        var records = payments.records.sort(function (a, b) {
                            return parseInt(b.id) - parseInt(a.id);
                        });
                        ctrl.payments(records);

                        m.endComputation();

                        ctrl.checkPrev();
                        return ctrl.checkNext();
                    }).catch(function (err) {
                        m.flashError(Conf.tr("Error requesting payments"));
                    });
                };

                this.checkPrev = function () {
                    var prev_cursor = ctrl.payments()[0].paging_token;

                    return Conf.horizon.payments().forAccount(ctrl.account()).cursor(prev_cursor).limit(1).call().then(function (payments) {
                        m.startComputation();
                        payments.records && payments.records.length > 0 ? ctrl.btn_prev(true) : ctrl.btn_prev(false);
                        m.endComputation();
                    }).catch(function (err) {
                        m.flashError(Conf.tr("Error requesting payments"));
                    });
                };

                this.checkNext = function () {
                    var next_cursor = ctrl.payments().slice(-1).pop().paging_token;

                    return Conf.horizon.payments().forAccount(ctrl.account()).cursor(next_cursor).limit(1).order('desc').call().then(function (payments) {
                        m.startComputation();
                        payments.records && payments.records.length > 0 ? ctrl.btn_next(true) : ctrl.btn_next(false);
                        m.endComputation();
                    }).catch(function (err) {
                        m.flashError(Conf.tr("Error requesting payments"));
                    });
                };

                this.getPayments();
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "card-box" }, children: [{ tag: "h4", attrs: { class: "m-t-0 header-title" }, children: [Conf.tr("Payments") + ' - ' + Conf.tr("Account") + ' : ' + ctrl.account()] }, { tag: "div", attrs: { style: "float: right" }, children: [{ tag: "button", attrs: { class: "btn-outline", onclick: ctrl.handleBtnToTop.bind(ctrl) }, children: [Conf.tr("To the begining")] }] }, m.component(Payments, { payments: ctrl.payments() }), { tag: "ul", attrs: { class: "pager" }, children: [ctrl.btn_prev() ? { tag: "li", attrs: { className: "previous" }, children: [{ tag: "a", attrs: { href: "#", onclick: ctrl.prev.bind(ctrl) }, children: ["← ", Conf.tr("Prev")] }] } : '', ctrl.btn_next() ? { tag: "li", attrs: { class: "next" }, children: [{ tag: "a", attrs: { href: "#",
                                                    onclick: ctrl.next.bind(ctrl) }, children: [Conf.tr("Next"), "→"] }] } : ''] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Payments.js": 12, "../../components/Sidebar.js": 14, "../../config/Config.js": 15 }], 28: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Payments = require('../../components/Payments.js'),
            Sidebar = require('../../components/Sidebar.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.username()) {
                    return m.route('/');
                }

                this.payments = m.prop([]);

                this.date_from = m.prop(false);
                this.date_to = m.prop(false);

                this.btn_prev = m.prop(false);
                this.btn_next = m.prop(false);

                this.getFormattedDate = function (date) {
                    var f_date = new Date(date);
                    return f_date.getFullYear() + '-' + ("0" + (f_date.getMonth() + 1)).slice(-2) + '-' + ("0" + f_date.getDate()).slice(-2);
                };

                this.handleBtnToTop = function (e) {
                    e.preventDefault();

                    ctrl.getPayments();
                };

                this.getPayments = function (e) {
                    m.onLoadingStart();
                    return Conf.horizon.payments().order('desc').call().then(function (payments) {
                        m.startComputation();
                        ctrl.payments(payments.records);
                        ctrl.date_from(payments.records[payments.records.length - 1].closed_at);
                        ctrl.date_to(payments.records[0].closed_at);
                        m.endComputation();
                        return ctrl.checkPrev();
                    }).then(function () {
                        return ctrl.checkNext();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr("Error requesting payments"));
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.next = function (e) {
                    e.preventDefault();

                    // get last record's paging token for cursor
                    var next_cursor = ctrl.payments().slice(-1).pop().paging_token;

                    return Conf.horizon.payments().cursor(next_cursor).order('desc').call().then(function (payments) {
                        if (payments.records.length) {
                            m.startComputation();
                            ctrl.payments(payments.records);
                            ctrl.date_from(payments.records[payments.records.length - 1].closed_at);
                            ctrl.date_to(payments.records[0].closed_at);
                            m.endComputation();
                        }

                        return ctrl.checkPrev();
                    }).then(function () {
                        return ctrl.checkNext();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr("Error requesting payments"));
                    });
                };

                this.prev = function (e) {
                    e.preventDefault();

                    // get first record's paging token for cursor
                    var prev_cursor = ctrl.payments()[0].paging_token;

                    return Conf.horizon.payments().cursor(prev_cursor).call().then(function (payments) {
                        m.startComputation();
                        var records = payments.records.sort(function (a, b) {
                            return parseInt(b.id) - parseInt(a.id);
                        });
                        ctrl.payments(records);

                        ctrl.date_to(payments.records[0].closed_at);
                        ctrl.date_from(payments.records[payments.records.length - 1].closed_at);
                        m.endComputation();

                        return ctrl.checkPrev();
                    }).then(function () {
                        return ctrl.checkNext();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr("Error requesting payments"));
                    });
                };

                this.getPaymentsByDate = function () {
                    var date_from = new Date(ctrl.date_from()).toISOString();
                    var date_to = new Date(ctrl.date_to()).toISOString();

                    return Conf.horizon.payments().after(date_from).before(date_to).call().then(function (payments) {
                        m.startComputation();
                        var records = payments.records.sort(function (a, b) {
                            return parseInt(b.id) - parseInt(a.id);
                        });
                        ctrl.payments(records);
                        m.endComputation();

                        return ctrl.checkPrev();
                    }).then(function () {
                        return ctrl.checkNext();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr("Error requesting payments"));
                    });
                };

                this.handleDateFrom = function (e) {
                    ctrl.date_from(e.target.value);
                    ctrl.getPaymentsByDate();
                };

                this.handleDateTo = function (e) {
                    ctrl.date_to(e.target.value);
                    ctrl.getPaymentsByDate();
                };

                this.checkPrev = function () {

                    if (!ctrl.payments().length) {
                        return false;
                    }

                    m.onLoadingStart();
                    var prev_cursor = ctrl.payments()[0].paging_token;

                    return Conf.horizon.payments().cursor(prev_cursor).limit(1).call().then(function (payments) {
                        m.startComputation();
                        payments.records && payments.records.length > 0 ? ctrl.btn_prev(true) : ctrl.btn_prev(false);
                        m.endComputation();
                    }).then(function () {
                        m.onLoadingEnd();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr("Error requesting payments"));
                    });
                };

                this.checkNext = function () {

                    if (!ctrl.payments().length) {
                        return false;
                    }

                    m.onLoadingStart();
                    var next_cursor = ctrl.payments().slice(-1).pop().paging_token;

                    return Conf.horizon.payments().cursor(next_cursor).limit(1).order('desc').call().then(function (payments) {
                        m.startComputation();
                        payments.records && payments.records.length > 0 ? ctrl.btn_next(true) : ctrl.btn_next(false);
                        m.endComputation();
                    }).then(function () {
                        m.onLoadingEnd();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr("Error requesting payments"));
                    });
                };

                this.getPayments();
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "card-box" }, children: [{ tag: "h4", attrs: { class: "m-t-0 header-title" }, children: [Conf.tr("Payments")] }, { tag: "form", attrs: { class: "form-inline", method: "post" }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "date_from" }, children: [Conf.tr("from"), " "] }, { tag: "input", attrs: { class: "form-control", id: "date_from", type: "date", name: "date_from",
                                                    onchange: ctrl.handleDateFrom.bind(ctrl),
                                                    value: ctrl.getFormattedDate(ctrl.date_from()) } }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "date_from" }, children: [" ", Conf.tr("to"), " "] }, { tag: "input", attrs: { class: "form-control", id: "date_to", type: "date", name: "date_to",
                                                    onchange: ctrl.handleDateTo.bind(ctrl),
                                                    value: ctrl.getFormattedDate(ctrl.date_to()) } }] }, { tag: "div", attrs: { style: "float: right" }, children: [{ tag: "button", attrs: { class: "btn-outline", onclick: ctrl.handleBtnToTop.bind(ctrl) }, children: [Conf.tr("To the begining")] }] }] }, m.component(Payments, { payments: ctrl.payments() }), { tag: "ul", attrs: { class: "pager" }, children: [ctrl.btn_prev() ? { tag: "li", attrs: { className: "previous" }, children: [{ tag: "a", attrs: { href: "#", onclick: ctrl.prev.bind(ctrl) }, children: ["← ", Conf.tr("Prev")] }] } : '', ctrl.btn_next() ? { tag: "li", attrs: { class: "next" }, children: [{ tag: "a", attrs: { href: "#",
                                                    onclick: ctrl.next.bind(ctrl) }, children: [Conf.tr("Next"), "→"] }] } : ''] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Payments.js": 12, "../../components/Sidebar.js": 14, "../../config/Config.js": 15 }], 29: [function (require, module, exports) {
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

                this.bans_ip = m.prop('');
                this.bans_banned_to = m.prop('');

                this.clearForm = function () {
                    m.startComputation();
                    ctrl.bans_ip('');
                    ctrl.bans_banned_to('');
                    m.endComputation();
                };

                this.addBan = function (e) {
                    e.preventDefault();
                    m.onLoadingStart();

                    ctrl.bans_ip(String(e.target.ip.value));
                    ctrl.bans_banned_to(Number(e.target.banned_for.value));

                    var form_data = {
                        ip: ctrl.bans_ip(),
                        banned_for: ctrl.bans_banned_to()
                    };

                    Auth.api().banIp(form_data).then(function (result) {
                        if (typeof result.message != 'undefined' && result.message == 'success') {
                            ctrl.clearForm();
                            m.flashSuccess(Conf.tr(result.message));
                        } else {
                            console.error('Unexpected response');
                            console.error(result);
                            m.flashError(Conf.tr(Conf.errors.service_error));
                        }
                    }).catch(function (error) {
                        console.log(error);
                        m.flashError(Conf.tr(error.message || Conf.errors.service_error));
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "panel panel-primary panel-border" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Add ip to banlist")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "form", attrs: { class: "form-horizontal", onsubmit: ctrl.addBan.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "code", class: "col-md-2 control-label" }, children: [Conf.tr("Ip")] }, { tag: "div", attrs: { class: "col-md-4" }, children: [{ tag: "input", attrs: { class: "form-control",
                                                                name: "ip",
                                                                id: "ip",
                                                                placeholder: Conf.tr("User ip"),
                                                                type: "text",
                                                                value: "",
                                                                required: "required" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "code", class: "col-md-2 control-label" }, children: [Conf.tr("Banned for minutes")] }, { tag: "div", attrs: { class: "col-md-4" }, children: [{ tag: "input", attrs: { class: "form-control",
                                                                name: "banned_for",
                                                                id: "banned_for",
                                                                placeholder: Conf.tr("Banned for"),
                                                                type: "number",
                                                                value: "",
                                                                required: "required" } }] }] }, { tag: "div", attrs: { class: "form-group m-b-0" }, children: [{ tag: "div", attrs: { class: "col-sm-offset-2 col-sm-9" }, children: [{ tag: "button", attrs: { type: "submit", class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5" }, children: [Conf.tr('Add')] }] }] }] }] }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19 }], 30: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Sidebar = require('../../components/Sidebar.js'),
            Helpers = require('../../models/Helpers'),
            Auth = require('../../models/Auth'),
            Pagination = require('../../components/Pagination.js');

        function draggable(element, isInitialized) {
            if (!isInitialized) {
                $(element).popover();
            }
        }

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.username()) {
                    return m.route('/');
                }

                this.is_initialized = m.prop(false);

                this.page = m.route.param('page') ? m.prop(Number(m.route.param('page'))) : m.prop(1);
                this.limit = Conf.pagination.limit;
                this.offset = (ctrl.page() - 1) * ctrl.limit;
                this.pagination_data = m.prop({ func: "getBansList", page: ctrl.page() });
                this.list = m.prop([]);

                this.getStatistics = function () {
                    m.onLoadingStart();
                    Auth.api().getBansList({ limit: ctrl.limit, offset: ctrl.offset }).then(function (list) {
                        if (typeof list.items != 'undefined') {
                            m.startComputation();
                            ctrl.list(list.items);
                            ctrl.is_initialized(true);
                            m.endComputation();
                        } else {
                            console.error('Unexpected response');
                            console.error(list);
                        }
                    }).catch(function (err) {
                        console.error(err);
                        m.flashApiError(err);
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.getStatistics();

                this.deleteBan = function (ip) {

                    swal({
                        title: Conf.tr("Delete ban") + '?',
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: Conf.tr("Yes, delete it")
                    }).then(function () {
                        var form_data = {
                            ip: String(ip),
                            banned_for: 0
                        };

                        Auth.api().banIp(form_data).then(function (result) {
                            if (typeof result.message != 'undefined' && result.message == 'success') {
                                m.flashSuccess(Conf.tr(result.message));
                            } else {
                                console.error('Unexpected response');
                                console.error(result);
                                m.flashError(Conf.tr(Conf.errors.service_error));
                            }
                        }).then(function () {
                            return ctrl.getStatistics();
                        }).catch(function (error) {
                            console.log(error);
                            m.flashError(Conf.tr(error.message || Conf.errors.service_error));
                        });
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [ctrl.is_initialized() ? { tag: "div", attrs: {}, children: [ctrl.list().length ? { tag: "div", attrs: { class: "panel panel-color panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Ip ban list and bad requests statistic')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "table", attrs: { class: "table table-bordered" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Ip')] }, { tag: "th", attrs: {}, children: [Conf.tr('Banned to')] }, { tag: "th", attrs: {}, children: [Conf.tr('Missed for minute'), " ", m("i[class='md md-info']" + "[data-container='body']" + "[title='']" + "[data-toggle='popover']" + "[data-placement='right']" + "[data-content='" + Conf.tr("Bad request per minute") + "']" + "[data-original-title='']", { config: draggable })] }, { tag: "th", attrs: {}, children: [Conf.tr('Missed for day'), " ", m("i[class='md md-info']" + "[data-container='body']" + "[title='']" + "[data-toggle='popover']" + "[data-placement='right']" + "[data-content='" + Conf.tr("Bad request per day") + "']" + "[data-original-title='']", { config: draggable })] }, { tag: "th", attrs: {}, children: [Conf.tr("Remove")] }] }] }, { tag: "tbody", attrs: {}, children: [ctrl.list().map(function (statistic) {
                                                        return { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [Helpers.long2ip(statistic.ip)] }, { tag: "td", attrs: {}, children: [Helpers.getDateFromTimestamp(statistic.banned_to)] }, { tag: "td", attrs: {}, children: [statistic.missed_for_minute] }, { tag: "td", attrs: {}, children: [statistic.missed_for_day] }, { tag: "td", attrs: { class: "col-sm-1" }, children: [{ tag: "button", attrs: {
                                                                        class: "btn btn-danger btn-custom waves-effect w-md waves-light m-b-5",
                                                                        onclick: ctrl.deleteBan.bind(ctrl, Helpers.long2ip(statistic.ip))
                                                                    }, children: [Conf.tr('Remove')] }] }] };
                                                    })] }] }, m.component(Pagination, { pagination: ctrl.pagination_data() })] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-warning" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('Bans not found')] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-primary" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('Wait for data loading'), "..."] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Pagination.js": 11, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19, "../../models/Helpers": 20 }], 31: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Sidebar = require('../../components/Sidebar.js'),
            CommissionForm = require('../../components/CommissionForm'),
            Auth = require('../../models/Auth');

        module.exports = {
            controller: function controller() {
                var ctrl = this;
                if (!Auth.username()) {
                    return m.route('/');
                }

                this.direction = m.prop(false);

                this.inputs = m.prop({
                    from_acc: false,
                    to_acc: false,
                    from_type: false,
                    to_type: false
                });

                this.changeDirection = function (e) {
                    ctrl.setDirection(e.target.value);
                };

                this.setDirection = function (direction) {
                    m.startComputation();
                    ctrl.inputs().from_acc = false;
                    ctrl.inputs().to_acc = false;
                    ctrl.inputs().from_type = false;
                    ctrl.inputs().to_type = false;
                    ctrl.direction(direction);
                    switch (ctrl.direction()) {
                        case Conf.directions[0]:
                            ctrl.inputs().from_acc = true;
                            break;

                        case Conf.directions[1]:
                            ctrl.inputs().to_acc = true;
                            break;

                        case Conf.directions[2]:
                            ctrl.inputs().from_acc = true;
                            ctrl.inputs().to_acc = true;
                            break;

                        case Conf.directions[3]:
                            ctrl.inputs().from_acc = true;
                            ctrl.inputs().to_type = true;
                            break;

                        case Conf.directions[4]:
                            ctrl.inputs().to_acc = true;
                            ctrl.inputs().from_type = true;
                            break;
                    }
                    m.endComputation();
                };

                this.setDirection(Conf.directions[0]);

                this.assets = m.prop([]);

                this.getAssets = function () {
                    m.onLoadingStart();

                    return Conf.horizon.assets().call().then(function (assets) {
                        m.startComputation();
                        ctrl.assets(assets.records);
                        m.endComputation();
                    }).catch(function () {
                        m.flashError(Conf.tr("Error requesting currencies"));
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.getAssets();
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [ctrl.assets() ? { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "div", attrs: { class: "panel panel-primary panel-border" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Select way of direction")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "col-lg-12" }, children: [{ tag: "form", attrs: { class: "form-horizontal", id: "commission_form", role: "form",
                                                            method: "post" }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "select",
                                                                    class: "col-md-2 control-label" }, children: [Conf.tr("Direction")] }, { tag: "div", attrs: { class: "col-md-4" }, children: [{ tag: "select", attrs: { class: "form-control", name: "direction", id: "direction",
                                                                        onchange: ctrl.changeDirection.bind(ctrl) }, children: [Conf.directions.map(function (direction) {
                                                                        return { tag: "option", attrs: {
                                                                                value: direction }, children: [Conf.tr(direction)] };
                                                                    })] }] }] }] }] }] }] }] }, { tag: "div", attrs: { class: "clearfix" } }, ctrl.direction() ? m.component(CommissionForm, ctrl.direction(), ctrl.inputs) : ''] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-warning" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('No currencies found')] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }, { tag: "div", attrs: { id: "bg-warning", class: "panel-collapse collapse in" }, children: [{ tag: "div", attrs: { class: "portlet-body" }, children: [Conf.tr('Please'), { tag: "a", attrs: { href: "/currencies/create", config: m.route }, children: [" ", Conf.tr("create")] }, "!"] }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/CommissionForm": 6, "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19 }], 32: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Sidebar = require('../../components/Sidebar.js'),
            Helpers = require('../../models/Helpers'),
            Auth = require('../../models/Auth');

        module.exports = {
            controller: function controller() {
                var ctrl = this;
                if (!Auth.username()) {
                    return m.route('/');
                }

                this.flat_fee = m.prop(0);
                this.percent_fee = m.prop(0);

                this.getCommissions = function () {
                    var asset = new StellarSdk.Asset(Conf.asset, Conf.master_key);
                    this.getGlobalAssetCommissions(asset).then(function (commission) {
                        m.startComputation();
                        ctrl.flat_fee(commission.flat);
                        ctrl.percent_fee(commission.percent);
                        m.endComputation();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr('Can not get commissions'));
                    });
                };

                this.getGlobalAssetCommissions = function (asset) {

                    m.startComputation();
                    ctrl.flat_fee(0);
                    ctrl.percent_fee(0);
                    m.endComputation();

                    return new Promise(function (resolve, reject) {
                        return Conf.horizon.commission().forAsset(asset).call().then(function (commissions) {

                            var data = {};

                            data.flat = 0;
                            data.percent = 0;

                            commissions.records.every(function (commission) {
                                if (!commission.hasOwnProperty('from') && !commission.hasOwnProperty('to') && !commission.hasOwnProperty('from_account_type_i') && !commission.hasOwnProperty('to_account_type_i')) {
                                    data.flat = commission.flat_fee;
                                    data.percent = commission.percent_fee;

                                    return false;
                                }

                                return true;
                            });
                            resolve(data);
                        }).catch(function (err) {
                            reject(err);
                        });
                    });
                };

                this.getCommissions();

                this.saveAssetCommissions = function (e) {
                    m.onLoadingStart();
                    var opts = {};
                    opts.asset = new StellarSdk.Asset(Conf.asset, Conf.master_key);
                    var flat = document.getElementById('flat').value;
                    var percent = document.getElementById('percent').value;

                    return Helpers.saveCommissionOperation(opts, flat, percent).then(function () {
                        m.startComputation();
                        ctrl.flat_fee(flat);
                        ctrl.percent_fee(percent);
                        m.endComputation();
                    });
                };

                this.deleteAssetCommission = function (e) {
                    m.onLoadingStart();
                    var opts = {};
                    opts.asset = new StellarSdk.Asset(Conf.asset, Conf.master_key);

                    return Helpers.deleteCommissionOperation(opts).then(function () {
                        m.startComputation();
                        ctrl.flat_fee(0);
                        ctrl.percent_fee(0);
                        m.endComputation();
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "panel panel-primary panel-border" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Manage commissions for EUAH asset")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "form", attrs: { class: "form-horizontal", role: "form", method: "post", onsubmit: ctrl.saveAssetCommissions.bind(ctrl) }, children: [{ tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "flat", class: "col-md-2 control-label" }, children: [Conf.tr("Flat fee")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: { class: "form-control", type: "number", min: "0", placeholder: "0.00", id: "flat",
                                                                        value: ctrl.flat_fee() } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "percent", class: "col-md-2 control-label" }, children: [Conf.tr("Percent fee")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: { class: "form-control", type: "number", min: "0", placeholder: "0.00", id: "percent",
                                                                        value: ctrl.percent_fee() } }] }] }, { tag: "div", attrs: { class: "form-group m-b-0" }, children: [{ tag: "div", attrs: { class: "col-md-offset-2 col-md-10" }, children: [{ tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "button", attrs: { type: "button", class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5 m-r-5",
                                                                            onclick: ctrl.saveAssetCommissions.bind(ctrl) }, children: [Conf.tr("Save")] }, ctrl.flat_fee() || ctrl.percent_fee() ? { tag: "button", attrs: { type: "button", class: "btn btn-danger btn-custom waves-effect w-md waves-light m-b-5 m-r-5",
                                                                            onclick: ctrl.deleteAssetCommission.bind(ctrl) }, children: [Conf.tr("Delete")] } : ''] }] }] }] }] }] }] }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19, "../../models/Helpers": 20 }], 33: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Sidebar = require('../../components/Sidebar.js'),
            Helpers = require('../../models/Helpers'),
            Auth = require('../../models/Auth');

        module.exports = {
            controller: function controller() {
                var ctrl = this;
                if (!Auth.username()) {
                    return m.route('/');
                }

                this.balances = m.prop(false);
                this.comm_keypair = m.prop(false);

                this.getCommissionAccountBalances = function () {
                    m.onLoadingStart();
                    m.getPromptValue(Conf.tr("Enter commission account mnemonic phrase")).then(function (comm_mnemonic) {
                        m.startComputation();
                        ctrl.comm_keypair(StellarSdk.Keypair.fromSeed(StellarSdk.getSeedFromMnemonic(comm_mnemonic)));
                        m.endComputation();
                        return Auth.loadAccountById(ctrl.comm_keypair().accountId());
                    }).then(function (account_data) {
                        m.startComputation();
                        ctrl.balances(account_data.balances);
                        m.endComputation();
                    }).catch(function (err) {
                        console.error(err);
                        return m.flashError(Conf.tr('Can not get commission account balances'));
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                ctrl.getCommissionAccountBalances();

                this.withdraw = function (e) {
                    e.preventDefault();
                    if (!ctrl.comm_keypair()) {
                        return ctrl.getCommissionAccountBalances();
                    }
                    m.onLoadingStart();
                    if (!e.target.asset || !e.target.amount || !e.target.to_account) {
                        return m.flashError(Conf.tr('Fill all required fields'));
                    }
                    if (!StellarSdk.Keypair.isValidPublicKey(e.target.to_account.value)) {
                        return m.flashError(Conf.tr('Bad account id'));
                    }
                    return Conf.horizon.loadAccount(ctrl.comm_keypair().accountId()).then(function (source) {
                        var tx = new StellarSdk.TransactionBuilder(source).addOperation(StellarSdk.Operation.payment({
                            destination: e.target.to_account.value,
                            amount: parseFloat(e.target.amount.value).toFixed(2).toString(),
                            asset: new StellarSdk.Asset(e.target.asset.value, Conf.master_key)
                        })).build();

                        tx.sign(ctrl.comm_keypair());

                        return Conf.horizon.submitTransaction(tx);
                    }).then(function () {
                        return m.flashSuccess(Conf.tr('Successful withdraw'));
                    }).catch(function (err) {
                        console.error(err);
                        return m.flashError(Conf.tr('Can not make withdraw from commission account'));
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [ctrl.balances() && ctrl.comm_keypair() ? { tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-12" }, children: [{ tag: "div", attrs: { class: "panel panel-border panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Manage commission account balances')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "form", attrs: { class: "form-horizontal", role: "form", method: "post", onsubmit: ctrl.withdraw.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "to_account", class: "col-md-2 control-label" }, children: [Conf.tr("Withdraw to account")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text", name: "to_account", id: "to_account", required: "required" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "amount", class: "col-md-2 control-label" }, children: [Conf.tr("Amount")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text", name: "amount", id: "amount", required: "required" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "select",
                                                                    class: "col-md-2 control-label" }, children: [Conf.tr("Asset")] }, { tag: "div", attrs: { class: "col-md-4" }, children: [{ tag: "select", attrs: { class: "form-control", name: "asset", id: "asset" }, children: [ctrl.balances().map(function (balance) {
                                                                        {
                                                                            return typeof balance.asset_code != 'undefined' ? { tag: "option", attrs: { value: balance.asset_code }, children: [balance.asset_code, " [", parseFloat(balance.balance).toFixed(2), "]"] } : '';
                                                                        }
                                                                    })] }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-md-offset-2 col-md-3" }, children: [{ tag: "button", attrs: { type: "submit",
                                                                        class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5" }, children: [Conf.tr('Make withdraw')] }] }] }] }] }] }] }] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-warning" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('Wait for loading commission account data'), "..."] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19, "../../models/Helpers": 20 }], 34: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Sidebar = require('../../components/Sidebar.js'),
            Auth = require('../../models/Auth'),
            Helpers = require('../../models/Helpers'),
            Session = require('../../models/Session.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;
                if (!Auth.username()) {
                    return m.route('/');
                }

                this.commissions = m.prop(false);
                this.selected_asset = m.prop(false);
                this.selected_type = m.prop(false);
                this.selected_type_text = m.prop('Unknown');

                this.setParams = function (e) {
                    e.preventDefault();
                    ctrl.setParamsProcess(e.target.type.value, Conf.asset);
                };

                this.setParamsProcess = function (type, asset) {

                    ctrl.getTypeCommissions(type, asset).then(function (commissions) {
                        m.startComputation();
                        ctrl.commissions(commissions);
                        ctrl.selected_asset(asset);
                        ctrl.selected_type(type);
                        ctrl.selected_type_text(Helpers.getTextAccountType(ctrl.selected_type()));
                        m.endComputation();
                    }).catch(function () {
                        m.flashError(Conf.tr("Cannot get fees"));
                    });
                };

                this.getTypeCommissions = function (account_type, asset_code) {

                    var asset = new StellarSdk.Asset(asset_code, Conf.master_key);

                    return new Promise(function (resolve, reject) {
                        return Conf.horizon.commission().forAccountType(account_type.toString()).forAsset(asset).call().then(function (commissions) {
                            var data = [];
                            //get commissions between types
                            commissions.records.map(function (commission) {
                                if (!commission.hasOwnProperty('from') && !commission.hasOwnProperty('to') && commission.hasOwnProperty('from_account_type_i') && commission.from_account_type_i == account_type && commission.hasOwnProperty('to_account_type_i')) {

                                    var commission_values = {
                                        flat: commission.flat_fee,
                                        percent: commission.percent_fee
                                    };

                                    data[commission.to_account_type_i] = commission_values;
                                    //get commission for from only
                                } else if (!commission.hasOwnProperty('from') && !commission.hasOwnProperty('to') && commission.hasOwnProperty('from_account_type_i') && commission.from_account_type_i == account_type && !commission.hasOwnProperty('to_account_type_i')) {

                                    var commission_values = {
                                        flat: commission.flat_fee,
                                        percent: commission.percent_fee
                                    };

                                    data['from'] = commission_values;
                                    //get commission for to only
                                } else if (!commission.hasOwnProperty('from') && !commission.hasOwnProperty('to') && !commission.hasOwnProperty('from_account_type_i') && commission.hasOwnProperty('to_account_type_i') && commission.to_account_type_i == account_type) {

                                    var commission_values = {
                                        flat: commission.flat_fee,
                                        percent: commission.percent_fee
                                    };

                                    data['to'] = commission_values;
                                }
                            });
                            resolve(data);
                        }).catch(function (err) {
                            reject(err);
                        });
                    });
                };

                this.saveTypesCommissions = function (e) {
                    e.preventDefault();
                    Session.closeModal();
                    m.onLoadingStart();
                    var opts = {};
                    if (e.target.from) {
                        opts.from_type = e.target.from.value;
                    }
                    if (e.target.to) {
                        opts.to_type = e.target.to.value;
                    }
                    opts.asset = new StellarSdk.Asset(Conf.asset, Conf.master_key);

                    return Helpers.saveCommissionOperation(opts, e.target.flat.value.toString(), e.target.percent.value.toString()).then(function () {
                        ctrl.setParamsProcess(opts.from_type || opts.to_type, Conf.asset);
                        m.onLoadingEnd();
                    });
                };

                this.deleteTypesCommission = function (from, to, e) {
                    m.onLoadingStart();
                    var opts = {};

                    if (typeof from != 'undefined' && from !== null) {
                        opts.from_type = from.toString();
                    }
                    if (typeof to != 'undefined' && to !== null) {
                        opts.to_type = to.toString();
                    }

                    opts.asset = new StellarSdk.Asset(Conf.asset, Conf.master_key);

                    return Helpers.deleteCommissionOperation(opts).then(function () {
                        ctrl.setParamsProcess(from || to, Conf.asset);
                        m.onLoadingEnd();
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "panel panel-primary panel-border" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Select account type to edit fees")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "form", attrs: { class: "form-horizontal", id: "commission_form", role: "form", method: "post",
                                                        onsubmit: ctrl.setParams.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "select",
                                                                class: "col-md-2 control-label" }, children: [Conf.tr("Type")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "select", attrs: { class: "form-control", name: "type", id: "type" }, children: [Conf.account_types.map(function (type) {
                                                                    return { tag: "option", attrs: {
                                                                            value: type.code }, children: [Conf.tr(Helpers.capitalizeFirstLetter(type.name))] };
                                                                })] }] }] }, { tag: "div", attrs: { class: "form-group m-b-0" }, children: [{ tag: "div", attrs: { class: "col-sm-offset-2 col-sm-8" }, children: [{ tag: "button", attrs: {
                                                                    type: "submit",
                                                                    class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5" }, children: [Conf.tr("Manage")] }] }] }] }] }] }] }, ctrl.commissions() ? { tag: "div", attrs: { class: "card-box" }, children: [{ tag: "h4", attrs: { class: "m-t-0 header-title" }, children: [{ tag: "b", attrs: {}, children: [Conf.tr('Fee for type')] }, ": ", Conf.tr(ctrl.selected_type_text())] }, { tag: "table", attrs: { class: "table table-striped m-0" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('From')] }, { tag: "th", attrs: {}, children: [Conf.tr('To')] }, { tag: "th", attrs: {}, children: [Conf.tr('Flat')] }, { tag: "th", attrs: {}, children: [Conf.tr('Percent')] }, { tag: "th", attrs: {}, children: [Conf.tr('Manage')] }, { tag: "th", attrs: {}, children: [Conf.tr('Delete')] }] }] }, { tag: "tbody", attrs: {}, children: [Conf.account_types.map(function (type) {
                                                    return { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [Conf.tr(ctrl.selected_type_text())] }, { tag: "td", attrs: {}, children: [Conf.tr(type.name)] }, { tag: "td", attrs: {}, children: [ctrl.commissions()[type.code] && ctrl.commissions()[type.code].flat ? ctrl.commissions()[type.code].flat : '-'] }, { tag: "td", attrs: {}, children: [ctrl.commissions()[type.code] && ctrl.commissions()[type.code].percent ? ctrl.commissions()[type.code].percent : '-'] }, { tag: "td", attrs: {}, children: [{ tag: "button", attrs: { class: "btn btn-primary waves-effect waves-light",
                                                                    onclick: function onclick() {
                                                                        Session.modal({ tag: "form", attrs: { class: "form-horizontal", id: "commission_form",
                                                                                role: "form", method: "post",
                                                                                onsubmit: ctrl.saveTypesCommissions.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "from",
                                                                                        class: "col-md-2 control-label" }, children: [Conf.tr("From account type")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: {
                                                                                            class: "form-control", type: "text",
                                                                                            required: "required",
                                                                                            readonly: "readonly",
                                                                                            value: Conf.tr(ctrl.selected_type_text()) }
                                                                                    }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: {
                                                                                            class: "form-control", type: "hidden",
                                                                                            name: "from", id: "from",
                                                                                            required: "required",
                                                                                            readonly: "readonly",
                                                                                            value: ctrl.selected_type() }
                                                                                    }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "to",
                                                                                        class: "col-md-2 control-label" }, children: [Conf.tr("To account type")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: {
                                                                                            class: "form-control", type: "text",
                                                                                            required: "required",
                                                                                            readonly: "readonly",
                                                                                            value: Conf.tr(type.name) }
                                                                                    }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: {
                                                                                            class: "form-control", type: "hidden",
                                                                                            name: "to", id: "to",
                                                                                            required: "required",
                                                                                            readonly: "readonly",
                                                                                            value: type.code }
                                                                                    }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "flat",
                                                                                        class: "col-md-2 control-label" }, children: [Conf.tr("Flat fee")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: {
                                                                                            class: "form-control", type: "number",
                                                                                            min: "0", placeholder: "0.00",
                                                                                            name: "flat",
                                                                                            value: ctrl.commissions()[type.code] && ctrl.commissions()[type.code].flat ? ctrl.commissions()[type.code].flat : 0 }
                                                                                    }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "percent",
                                                                                        class: "col-md-2 control-label" }, children: [Conf.tr("Percent fee")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: {
                                                                                            class: "form-control", type: "number",
                                                                                            min: "0", placeholder: "0.00",
                                                                                            name: "percent",
                                                                                            value: ctrl.commissions()[type.code] && ctrl.commissions()[type.code].percent ? ctrl.commissions()[type.code].percent : 0 }
                                                                                    }] }] }, { tag: "div", attrs: { class: "form-group m-b-0" }, children: [{ tag: "div", attrs: { class: "col-sm-offset-2 col-sm-8" }, children: [{ tag: "button", attrs: {
                                                                                            type: "submit",
                                                                                            class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5" }, children: [Conf.tr("Save")] }] }] }] }, Conf.tr('Edit fees'));
                                                                    }
                                                                }, children: [Conf.tr('Manage')] }] }, { tag: "td", attrs: {}, children: [ctrl.commissions()[type.code] && ctrl.commissions()[type.code].flat || ctrl.commissions()[type.code] && ctrl.commissions()[type.code].percent ? { tag: "button", attrs: { type: "button",
                                                                    class: "btn btn-danger btn-custom waves-effect w-md waves-light",
                                                                    onclick: ctrl.deleteTypesCommission.bind(ctrl, ctrl.selected_type(), type.code) }, children: [Conf.tr("Delete")] } : '-'] }] };
                                                }),
                                                /*for from type only*/
                                                { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [Conf.tr(ctrl.selected_type_text())] }, { tag: "td", attrs: {}, children: ["-"] }, { tag: "td", attrs: {}, children: [ctrl.commissions()['from'] && ctrl.commissions()['from'].flat ? ctrl.commissions()['from'].flat : '-'] }, { tag: "td", attrs: {}, children: [ctrl.commissions()['from'] && ctrl.commissions()['from'].percent ? ctrl.commissions()['from'].percent : '-'] }, { tag: "td", attrs: {}, children: [{ tag: "button", attrs: { class: "btn btn-primary waves-effect waves-light",
                                                                onclick: function onclick() {
                                                                    Session.modal({ tag: "form", attrs: { class: "form-horizontal", id: "commission_form",
                                                                            role: "form", method: "post",
                                                                            onsubmit: ctrl.saveTypesCommissions.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "from",
                                                                                    class: "col-md-2 control-label" }, children: [Conf.tr("From account type")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: {
                                                                                        class: "form-control", type: "text",
                                                                                        required: "required", readonly: "readonly",
                                                                                        value: Conf.tr(ctrl.selected_type_text()) }
                                                                                }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: {
                                                                                        class: "form-control", type: "hidden",
                                                                                        name: "from", id: "from",
                                                                                        required: "required", readonly: "readonly",
                                                                                        value: ctrl.selected_type() }
                                                                                }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "flat",
                                                                                    class: "col-md-2 control-label" }, children: [Conf.tr("Flat fee")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: {
                                                                                        class: "form-control", type: "number",
                                                                                        min: "0", placeholder: "0.00", name: "flat",
                                                                                        value: ctrl.commissions()['from'] && ctrl.commissions()['from'].flat ? ctrl.commissions()['from'].flat : 0 }
                                                                                }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "percent",
                                                                                    class: "col-md-2 control-label" }, children: [Conf.tr("Percent fee")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: {
                                                                                        class: "form-control", type: "number",
                                                                                        min: "0", placeholder: "0.00",
                                                                                        name: "percent",
                                                                                        value: ctrl.commissions()['from'] && ctrl.commissions()['from'].percent ? ctrl.commissions()['from'].percent : 0 }
                                                                                }] }] }, { tag: "div", attrs: { class: "form-group m-b-0" }, children: [{ tag: "div", attrs: { class: "col-sm-offset-2 col-sm-8" }, children: [{ tag: "button", attrs: {
                                                                                        type: "submit",
                                                                                        class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5" }, children: [Conf.tr("Save")] }] }] }] }, Conf.tr('Edit fees'));
                                                                }
                                                            }, children: [Conf.tr('Manage')] }] }, { tag: "td", attrs: {}, children: [ctrl.commissions()['from'] && ctrl.commissions()['from'].flat || ctrl.commissions()['from'] && ctrl.commissions()['from'].percent ? { tag: "button", attrs: { type: "button",
                                                                class: "btn btn-danger btn-custom waves-effect w-md waves-light",
                                                                onclick: ctrl.deleteTypesCommission.bind(ctrl, ctrl.selected_type(), null) }, children: [Conf.tr("Delete")] } : '-'] }] },
                                                /*for to type only*/
                                                { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: ["-"] }, { tag: "td", attrs: {}, children: [Conf.tr(ctrl.selected_type_text())] }, { tag: "td", attrs: {}, children: [ctrl.commissions()['to'] && ctrl.commissions()['to'].flat ? ctrl.commissions()['to'].flat : '-'] }, { tag: "td", attrs: {}, children: [ctrl.commissions()['to'] && ctrl.commissions()['to'].percent ? ctrl.commissions()['to'].percent : '-'] }, { tag: "td", attrs: {}, children: [{ tag: "button", attrs: { class: "btn btn-primary waves-effect waves-light",
                                                                onclick: function onclick() {
                                                                    Session.modal({ tag: "form", attrs: { class: "form-horizontal", id: "commission_form",
                                                                            role: "form", method: "post",
                                                                            onsubmit: ctrl.saveTypesCommissions.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "from",
                                                                                    class: "col-md-2 control-label" }, children: [Conf.tr("To account type")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: {
                                                                                        class: "form-control", type: "text",
                                                                                        required: "required", readonly: "readonly",
                                                                                        value: Conf.tr(ctrl.selected_type_text()) }
                                                                                }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: {
                                                                                        class: "form-control", type: "hidden",
                                                                                        name: "to", id: "to",
                                                                                        required: "required", readonly: "readonly",
                                                                                        value: ctrl.selected_type() }
                                                                                }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "flat",
                                                                                    class: "col-md-2 control-label" }, children: [Conf.tr("Flat fee")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: {
                                                                                        class: "form-control", type: "number",
                                                                                        min: "0", placeholder: "0.00", name: "flat",
                                                                                        value: ctrl.commissions()['to'] && ctrl.commissions()['to'].flat ? ctrl.commissions()['to'].flat : 0 }
                                                                                }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "percent",
                                                                                    class: "col-md-2 control-label" }, children: [Conf.tr("Percent fee")] }, { tag: "div", attrs: { class: "col-md-8" }, children: [{ tag: "input", attrs: {
                                                                                        class: "form-control", type: "number",
                                                                                        min: "0", placeholder: "0.00",
                                                                                        name: "percent",
                                                                                        value: ctrl.commissions()['to'] && ctrl.commissions()['to'].percent ? ctrl.commissions()['to'].percent : 0 }
                                                                                }] }] }, { tag: "div", attrs: { class: "form-group m-b-0" }, children: [{ tag: "div", attrs: { class: "col-sm-offset-2 col-sm-8" }, children: [{ tag: "button", attrs: {
                                                                                        type: "submit",
                                                                                        class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5" }, children: [Conf.tr("Save")] }] }] }] }, Conf.tr('Edit fees'));
                                                                }
                                                            }, children: [Conf.tr('Manage')] }] }, { tag: "td", attrs: {}, children: [ctrl.commissions()['to'] && ctrl.commissions()['to'].flat || ctrl.commissions()['to'] && ctrl.commissions()['to'].percent ? { tag: "button", attrs: { type: "button",
                                                                class: "btn btn-danger btn-custom waves-effect w-md waves-light",
                                                                onclick: ctrl.deleteTypesCommission.bind(ctrl, null, ctrl.selected_type()) }, children: [Conf.tr("Delete")] } : '-'] }] }] }] }] } : ''] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19, "../../models/Helpers": 20, "../../models/Session.js": 22 }], 35: [function (require, module, exports) {
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

                this.cmp_code = m.prop('');
                this.cmp_title = m.prop('');
                this.cmp_address = m.prop('');
                this.cmp_phone = m.prop('');
                this.cmp_email = m.prop('');

                this.clearForm = function () {
                    m.startComputation();
                    ctrl.cmp_code('');
                    ctrl.cmp_title('');
                    ctrl.cmp_address('');
                    ctrl.cmp_phone('');
                    ctrl.cmp_email('');
                    m.endComputation();
                };

                this.createCompany = function (e) {
                    e.preventDefault();

                    m.onLoadingStart();

                    ctrl.cmp_code(e.target.code.value);
                    ctrl.cmp_title(e.target.title.value);
                    ctrl.cmp_address(e.target.address.value);
                    ctrl.cmp_phone(e.target.phone.value);
                    ctrl.cmp_email(e.target.email.value);

                    var form_data = {
                        code: ctrl.cmp_code(),
                        title: ctrl.cmp_title(),
                        address: ctrl.cmp_address(),
                        phone: ctrl.cmp_phone(),
                        email: ctrl.cmp_email()
                    };

                    Auth.api().createCompany(form_data).then(function (result) {
                        if (typeof result.message != 'undefined' && result.message == 'success') {
                            ctrl.clearForm();
                            m.flashSuccess(Conf.tr(result.message));
                        } else {
                            console.error('Unexpected response');
                            console.error(result);
                            m.flashError(Conf.tr(Conf.errors.service_error));
                        }
                    }).catch(function (error) {
                        console.log(error);
                        m.flashApiError(error);
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "panel panel-primary panel-border" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Create new company")] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "col-lg-6" }, children: [{ tag: "form", attrs: { class: "form-horizontal", onsubmit: ctrl.createCompany.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "cmp_code", class: "col-md-2 control-label" }, children: [Conf.tr("Code")] }, { tag: "div", attrs: { class: "col-md-4" }, children: [{ tag: "input", attrs: { class: "form-control", name: "code", id: "cmp_code",
                                                                placeholder: Conf.tr("Registration Code"),
                                                                type: "text", value: ctrl.cmp_code(), required: "required" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "cmp_title", class: "col-md-2 control-label" }, children: [Conf.tr("Title")] }, { tag: "div", attrs: { class: "col-md-6" }, children: [{ tag: "input", attrs: { class: "form-control", name: "title", id: "cmp_title",
                                                                placeholder: Conf.tr("Registration Title"),
                                                                type: "text", value: ctrl.cmp_title(), required: "required" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "cmp_address", class: "col-md-2 control-label" }, children: [Conf.tr("Address")] }, { tag: "div", attrs: { class: "col-md-6" }, children: [{ tag: "input", attrs: { class: "form-control", name: "address", id: "cmp_address",
                                                                placeholder: Conf.tr("Registration address"),
                                                                type: "text", value: ctrl.cmp_address(), required: "required" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "cmp_phone", class: "col-md-2 control-label" }, children: [Conf.tr("Phone")] }, { tag: "div", attrs: { class: "col-md-6" }, children: [{ tag: "input", attrs: { class: "form-control", name: "phone", id: "cmp_phone",
                                                                placeholder: Conf.tr("Registration phone number"),
                                                                type: "text", value: ctrl.cmp_phone(), required: "required" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "cmp_email", class: "col-md-2 control-label" }, children: [Conf.tr("Email")] }, { tag: "div", attrs: { class: "col-md-6" }, children: [{ tag: "input", attrs: { class: "form-control", name: "email", id: "cmp_email",
                                                                placeholder: Conf.tr("Contact email"),
                                                                type: "text", value: ctrl.cmp_email(), required: "required" } }] }] }, { tag: "div", attrs: { class: "form-group m-b-0" }, children: [{ tag: "div", attrs: { class: "col-sm-offset-2 col-sm-9" }, children: [{ tag: "button", attrs: { type: "submit", class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5" }, children: ["Add"] }] }] }] }] }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19 }], 36: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Sidebar = require('../../components/Sidebar.js'),
            Auth = require('../../models/Auth'),
            Pagination = require('../../components/Pagination.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;
                if (!Auth.username()) {
                    return m.route('/');
                }

                this.is_initialized = m.prop(false);

                this.page = m.route.param('page') ? m.prop(Number(m.route.param('page'))) : m.prop(1);
                this.limit = Conf.pagination.limit;
                this.offset = (ctrl.page() - 1) * ctrl.limit;
                this.pagination_data = m.prop({ func: "getCompaniesList", page: ctrl.page() });

                this.companies = m.prop([]);

                m.onLoadingStart();
                Auth.api().getCompaniesList({ limit: ctrl.limit, offset: ctrl.offset }).then(function (companies) {
                    if (typeof companies.items != 'undefined') {
                        m.startComputation();
                        ctrl.companies(companies.items);
                        ctrl.is_initialized(true);
                        m.endComputation();
                    } else {
                        console.error('Unexpected response');
                        console.error(companies);
                    }
                }).catch(function (error) {
                    console.error(error);
                    return m.flashApiError(error);
                }).then(function () {
                    m.onLoadingEnd();
                });
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [ctrl.is_initialized() ? { tag: "div", attrs: {}, children: [ctrl.companies().length ? { tag: "div", attrs: { class: "panel panel-color panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Registered companies')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "table", attrs: { class: "table table-bordered" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Code')] }, { tag: "th", attrs: {}, children: [Conf.tr('Title')] }, { tag: "th", attrs: {}, children: [Conf.tr('Address')] }, { tag: "th", attrs: {}, children: [Conf.tr('Phone')] }, { tag: "th", attrs: {}, children: [Conf.tr('Email')] }] }] }, { tag: "tbody", attrs: {}, children: [ctrl.companies().map(function (company) {
                                                        return { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Code") }, children: [company.code] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Title") }, children: [company.title] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Address") }, children: [company.address] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Phone") }, children: [company.phone] }] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: Conf.tr("Email") }, children: [company.email] }] }] };
                                                    })] }] }, m.component(Pagination, { pagination: ctrl.pagination_data() })] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-warning" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('No companies found')] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }, { tag: "div", attrs: { id: "bg-warning", class: "panel-collapse collapse in" }, children: [{ tag: "div", attrs: { class: "portlet-body" }, children: [Conf.tr('Please'), { tag: "a", attrs: { href: "/companies/create", config: m.route }, children: [" ", Conf.tr("create")] }, "!"] }] }] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-primary" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('Wait for data loading'), "..."] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Pagination.js": 11, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19 }], 37: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Auth = require('../../models/Auth'),
            Helpers = require('../../models/Helpers'),
            Sidebar = require('../../components/Sidebar.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.username()) {
                    return m.route('/');
                }

                this.emission_mnemonic = m.prop(false);

                this.parseFile = function (result) {
                    return new Promise(function (resolve, reject) {
                        var bad_file = false;
                        try {
                            if (!result) {
                                throw new Error('Bad file');
                            }
                            var data = JSON.parse(result);
                            if (typeof data.operation == 'undefined') {
                                bad_file = true;
                            }
                            if (data.operation != 'emission_create') {
                                bad_file = true;
                            }
                            if (!data.account && !data.seed && !data.hash) {
                                bad_file = true;
                            }
                        } catch (e) {
                            bad_file = true;
                        }
                        if (bad_file) {
                            reject("Bad file");
                        }
                        resolve(data);
                    });
                };

                this.generateTx = function (e) {
                    m.onLoadingStart();

                    var user_password = '';
                    var user_repassword = '';

                    m.getPromptValue(Conf.tr("Enter password to crypt emission")).then(function (user_password_answer) {
                        user_password = user_password_answer;
                        return m.getPromptValue(Conf.tr("Repeat password"));
                    }).then(function (user_repassword_answer) {
                        user_repassword = user_repassword_answer;
                        if (user_password != user_repassword) {
                            throw new Error(Conf.tr("Passwords doesn't match"));
                        }
                        return Conf.horizon.loadAccount(Conf.master_key);
                    }).then(function (source) {
                        var emission_keypair = StellarSdk.Keypair.random();
                        var tx = new StellarSdk.TransactionBuilder(source).addOperation(StellarSdk.Operation.setOptions({
                            signer: {
                                pubKey: emission_keypair.accountId(),
                                weight: StellarSdk.xdr.SignerType.signerEmission().value,
                                signerType: StellarSdk.xdr.SignerType.signerEmission().value
                            }
                        })).build();
                        var data = JSON.stringify({
                            tx: tx.toEnvelope().toXDR().toString("base64"),
                            seed: Helpers.encryptData(emission_keypair.seed(), user_password),
                            account: emission_keypair.accountId(),
                            operation: 'emission_create'
                        });
                        Helpers.download('generate_emission_key.smb', data);
                        m.onLoadingEnd();
                        $(e.target).trigger('reset');
                    }).catch(function (e) {
                        console.log(e);
                        m.flashError(typeof e.message == 'string' && e.message.length > 0 ? Conf.tr(e.message) : Conf.tr('Stellar error'));
                    });
                };

                this.uploadTx = function (e) {
                    m.onLoadingStart();

                    var file = e.target.files[0];
                    if (!file) {
                        return m.flashError(Conf.tr("Bad file"));
                    }

                    var reader = new FileReader();
                    reader.readAsText(file);

                    reader.onload = function (evt) {

                        var data = null;

                        ctrl.parseFile(evt.target.result).then(function (file_data) {
                            data = file_data;

                            return m.getPromptValue(Conf.tr("Enter password to decrypt emission"));
                        }).then(function (password) {
                            data.seed = sjcl.decrypt(password, atob(data.seed));
                            var tx = new StellarSdk.Transaction(data.tx);

                            return Conf.horizon.submitTransaction(tx);
                        }).then(function (response) {
                            data.hash = response.hash;

                            return Conf.horizon.transactions().transaction(data.hash).call();
                        }).then(function (tx_result) {
                            if (!tx_result || tx_result.id !== data.hash) {
                                return m.flashError(Conf.tr("Transaction hash not found"));
                            }

                            return Conf.horizon.accounts().accountId(Conf.master_key).call();
                        }).then(function (master) {
                            if (!master.id) {
                                return m.flashError(Conf.tr("Server configuration error, Failed to get master account. Contact support"));
                            }
                            var found = _.find(master.signers, function (signer) {
                                return signer.public_key === data.account;
                            });
                            if (!found) {
                                return m.flashError(Conf.tr("Operation completed, but account $[1] is not signer of master key", data.account));
                            }
                            if (found.weight !== Conf.roles.emission) {
                                return m.flashError(Conf.tr("Operation completed, but account $[1] is not emission key", data.account));
                            }
                            return data.seed;
                        }).then(function (seed) {
                            m.flashSuccess(Conf.tr("Emission key was generated"));
                            m.onLoadingEnd();
                            $(e.target).trigger('reset');
                            m.startComputation();
                            ctrl.emission_mnemonic(StellarSdk.getMnemonicFromSeed(seed));
                            m.endComputation();
                        }).catch(function (err) {
                            console.error(err);
                            $("#upload_tx").replaceWith($("#upload_tx").val('').clone(true));
                            return m.flashError(Conf.tr("Transaction loading error"));
                        });
                    };
                    reader.onerror = function (evt) {
                        m.flashError(Conf.tr("Error read file"));
                    };
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "panel panel-primary panel-border" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Generate Emission Keys')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [!ctrl.emission_mnemonic() ? { tag: "div", attrs: { class: "buttons", id: "emission_buttons" }, children: [{ tag: "button", attrs: { class: "btn btn-default", onclick: ctrl.generateTx.bind(ctrl),
                                                    id: "generate_tx" }, children: [Conf.tr('Generate Emission Key')] }, " ", { tag: "div", attrs: { class: "fileUpload btn btn-inverse", onchange: ctrl.uploadTx.bind(ctrl) }, children: [{ tag: "span", attrs: {}, children: [Conf.tr('Upload Signed Transaction')] }, { tag: "input", attrs: { type: "file", accept: ".smbx",
                                                        id: "upload_tx" } }] }] } : { tag: "div", attrs: { id: "emission_form" }, children: [{ tag: "h4", attrs: {}, children: [Conf.tr('Remember - mnemonic phrase is NOT recoverable')] }, { tag: "kbd", attrs: { id: "emission_encrypted_key", style: "word-break: break-word; display: block;" }, children: [ctrl.emission_mnemonic()] }] }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19, "../../models/Helpers": 20 }], 38: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Sidebar = require('../../components/Sidebar.js'),
            Helpers = require('../../models/Helpers'),
            Auth = require('../../models/Auth');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.username()) {
                    return m.route('/');
                }

                this.emissions = m.prop([]);

                this.getEmissionKeys = function () {
                    m.onLoadingStart();
                    Helpers.getEmissionKeysList().then(function (emm_keys) {
                        m.startComputation();
                        ctrl.emissions(emm_keys);
                        m.endComputation();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr('Can not get emission keys list'));
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.getEmissionKeys();
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [ctrl.emissions ? { tag: "div", attrs: { class: "panel panel-color panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Emission accounts')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "table", attrs: { class: "table table-bordered" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: ["#"] }, { tag: "th", attrs: {}, children: [Conf.tr('Account')] }, { tag: "th", attrs: {}, children: [Conf.tr('Actions')] }] }] }, { tag: "tbody", attrs: {}, children: [ctrl.emissions().map(function (em_key, index) {
                                                    return { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: { scope: "row" }, children: [index + 1] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: em_key }, children: [em_key] }] }, { tag: "td", attrs: {}, children: [{ tag: "button", attrs: { type: "submit", onclick: Helpers.deleteMasterSigner.bind(ctrl, em_key),
                                                                    class: "btn btn-danger btn-xs waves-effect waves-light" }, children: [Conf.tr('Delete')] }] }] };
                                                })] }] }] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-warning" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('No emission accounts found')] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }, { tag: "div", attrs: { id: "bg-warning", class: "panel-collapse collapse in" }, children: [{ tag: "div", attrs: { class: "portlet-body" }, children: [Conf.tr('Please'), { tag: "a", attrs: { href: "/emission/generate", config: m.route }, children: [" ", Conf.tr("create")] }, "!"] }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19, "../../models/Helpers": 20 }], 39: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Auth = require('../../models/Auth'),
            Helpers = require('../../models/Helpers'),
            Sidebar = require('../../components/Sidebar.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.username()) {
                    return m.route('/');
                }

                this.parseFile = function (result) {
                    return new Promise(function (resolve, reject) {
                        var bad_file = false;
                        try {
                            if (!result) {
                                throw new Error('Bad file');
                            }
                            var data = JSON.parse(result);
                            if (typeof data.operation == 'undefined') {
                                bad_file = true;
                            }
                            if (data.operation != 'emission') {
                                bad_file = true;
                            }
                            if (!data.tx) {
                                bad_file = true;
                            }
                        } catch (e) {
                            bad_file = true;
                        }
                        if (bad_file) {
                            reject("Bad file");
                        }
                        resolve(data);
                    });
                };

                this.generateTx = function (e) {
                    e.preventDefault();
                    m.onLoadingStart();

                    return Conf.horizon.loadAccount(Conf.master_key).then(function (source) {
                        var tx = new StellarSdk.TransactionBuilder(source).addOperation(StellarSdk.Operation.payment({
                            destination: Conf.g_agent_pub,
                            amount: parseFloat(e.target.amount.value).toFixed(2).toString(),
                            asset: new StellarSdk.Asset(Conf.asset, Conf.master_key)
                        })).build();

                        var data = JSON.stringify({
                            tx: tx.toEnvelope().toXDR().toString("base64"),
                            operation: 'emission'
                        });

                        Helpers.download('emission_process.smb', data);
                    }).catch(function (err) {
                        console.log(err);
                        m.flashError(Conf.tr('Service Error. Cannot create emission transaction'));
                    }).then(function () {
                        m.onLoadingEnd();
                        $(e.target).trigger('reset');
                    });
                };

                this.uploadTx = function (e) {
                    m.onLoadingStart();

                    var file = e.target.files[0];
                    if (!file) {
                        return m.flashError(Conf.tr("Bad file"));
                    }

                    var reader = new FileReader();
                    reader.readAsText(file);

                    reader.onload = function (evt) {

                        ctrl.parseFile(evt.target.result).then(function (data) {
                            var tx = new StellarSdk.Transaction(data.tx);

                            return Conf.horizon.submitTransaction(tx);
                        }).then(function () {
                            m.flashSuccess(Conf.tr("Emission successful complete"));
                            $(e.target).trigger('reset');
                        }).catch(function (err) {
                            console.error(err);
                            return m.flashError(Conf.tr("Transaction loading error"));
                        }).then(function () {
                            m.onLoadingEnd();
                            $("#upload_tx").replaceWith($("#upload_tx").val('').clone(true));
                        });
                    };
                    reader.onerror = function (evt) {
                        m.flashError(Conf.tr("Error read file"));
                    };
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "panel panel-primary panel-border" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Emission for general agent')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "form", attrs: { role: "form", onsubmit: ctrl.generateTx.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group be_relative" }, children: [{ tag: "label", attrs: {}, children: [Conf.tr("Amount")] }, { tag: "input", attrs: { class: "form-control", type: "number", required: "required", id: "emission_amount",
                                                        min: "0.01",
                                                        step: "0.01",
                                                        name: "amount" } }] }, { tag: "div", attrs: { class: "form-group m-t-20" }, children: [{ tag: "button", attrs: { id: "make_emission_tx",
                                                        class: "btn btn-inverse m-r-5" }, children: [Conf.tr('Download tx file')] }, { tag: "div", attrs: { class: "be_relative", style: "display: inline-block;" }, children: [{ tag: "div", attrs: { class: "fileUpload btn btn-success",
                                                            onchange: ctrl.uploadTx.bind(ctrl)
                                                        }, children: [{ tag: "span", attrs: {}, children: [Conf.tr('Upload signed tx')] }, " ", { tag: "input", attrs: { type: "file", accept: ".smbx", id: "load_emission_tx" } }] }] }] }] }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19, "../../models/Helpers": 20 }], 40: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Auth = require('../../models/Auth'),
            Helpers = require('../../models/Helpers'),
            Sidebar = require('../../components/Sidebar.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.username()) {
                    return m.route('/');
                }

                this.dagent = m.prop('');
                this.amount = m.prop('');

                this.is_initialized = m.prop(false);
                this.g_agent_balance = m.prop(false);

                this.getGeneralAgentBalance = function () {
                    Auth.loadAccountById(Conf.g_agent_pub).then(function (g_agent) {
                        var balances = g_agent.balances;
                        Object.keys(balances).map(function (index) {
                            if (typeof balances[index].asset_code != 'undefined' && balances[index].asset_code == Conf.asset) {
                                m.startComputation();
                                ctrl.g_agent_balance(parseFloat(balances[index].balance).toFixed(2));
                                m.endComputation();
                            }
                        });
                        m.startComputation();
                        ctrl.is_initialized(true);
                        m.endComputation();
                    });
                };

                ctrl.getGeneralAgentBalance();

                this.distribution = function (e) {
                    e.preventDefault();
                    m.onLoadingStart();

                    if (!e.target.account_id || !e.target.amount) {
                        return m.flashError(Conf.tr('Fill all required fields'));
                    }

                    if (!StellarSdk.Keypair.isValidPublicKey(e.target.account_id.value.toString())) {
                        return m.flashError(Conf.tr('Check distribution agent account id'));
                    }

                    //TODO: check amount field

                    var gagent_signer_keypair = null;
                    var account = e.target.account_id.value;
                    var amount = e.target.amount.value;

                    m.getPromptValue(Conf.tr("Enter general agent signer mnemonic phrase")).then(function (gagent_mnemonic) {
                        gagent_signer_keypair = StellarSdk.Keypair.fromSeed(StellarSdk.getSeedFromMnemonic(gagent_mnemonic));
                        return Conf.horizon.loadAccount(Conf.g_agent_pub);
                    }).then(function (source) {
                        var tx = new StellarSdk.TransactionBuilder(source).addOperation(StellarSdk.Operation.payment({
                            destination: account,
                            amount: parseFloat(amount).toFixed(2).toString(),
                            asset: new StellarSdk.Asset(Conf.asset, Conf.master_key)
                        })).build();

                        tx.sign(StellarSdk.Keypair.fromSeed(gagent_signer_keypair.seed()));

                        return Conf.horizon.submitTransaction(tx);
                    }).then(function () {
                        m.flashSuccess(Conf.tr('Distribution successful'));
                    }).catch(function (err) {
                        console.log(err);
                        m.flashError(Conf.tr('Service Error. Cannot create emission transaction'));
                    }).then(function () {
                        m.onLoadingEnd();
                        $(e.target).trigger('reset');
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [ctrl.is_initialized() ? { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "panel panel-primary panel-border" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Transfer to distribution agent')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "alert alert-info" }, children: [Conf.tr('General agent balance'), ": ", ctrl.g_agent_balance(), " ", Conf.asset] }, { tag: "form", attrs: { class: "form-horizontal", role: "form", onsubmit: ctrl.distribution.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "cmp_code", class: "col-md-2 control-label" }, children: [Conf.tr("Distribution agent account id")] }, { tag: "div", attrs: { class: "col-md-4" }, children: [{ tag: "input", attrs: { class: "form-control", name: "account_id", id: "account_id",
                                                                type: "text", value: ctrl.dagent(), required: "required" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { for: "cmp_code", class: "col-md-2 control-label" }, children: [Conf.tr("Amount")] }, { tag: "div", attrs: { class: "col-md-4" }, children: [{ tag: "input", attrs: { class: "form-control", type: "number", required: "required", id: "distribution_amount",
                                                                min: "0.01",
                                                                step: "0.01",
                                                                value: ctrl.amount(),
                                                                name: "amount" } }] }] }, { tag: "div", attrs: { class: "form-group m-b-0" }, children: [{ tag: "div", attrs: { class: "col-sm-offset-2 col-sm-3" }, children: [{ tag: "button", attrs: { type: "submit",
                                                                class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5" }, children: ["Create"] }] }] }] }] }] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-primary" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('Wait for data loading'), "..."] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19, "../../models/Helpers": 20 }], 41: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Sidebar = require('../../components/Sidebar.js'),
            Helpers = require('../../models/Helpers'),
            Auth = require('../../models/Auth');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.username()) {
                    return m.route('/');
                }

                this.gagent_signers = m.prop([]);
                this.gagent_signer_mnenonic = m.prop(false);

                this.getGeneralAgentKeys = function () {
                    m.onLoadingStart();
                    Helpers.getGeneralAgentKeysList().then(function (gagent_keys) {
                        m.startComputation();
                        ctrl.gagent_signers(gagent_keys);
                        m.endComputation();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr('Can not get general agent signers list'));
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.getGeneralAgentKeys();

                this.generateSigner = function (e) {
                    m.onLoadingStart();

                    var gagent_keypair = null;
                    var g_agent_signer_keypair = null;
                    m.getPromptValue(Conf.tr("Enter general agent mnemonic phrase")).then(function (gagent_mnemonic) {
                        gagent_keypair = StellarSdk.Keypair.fromSeed(StellarSdk.getSeedFromMnemonic(gagent_mnemonic));
                        return Conf.horizon.loadAccount(Conf.g_agent_pub);
                    }).then(function (source) {
                        g_agent_signer_keypair = StellarSdk.Keypair.random();
                        console.log(g_agent_signer_keypair.seed());
                        var tx = new StellarSdk.TransactionBuilder(source).addOperation(StellarSdk.Operation.setOptions({
                            signer: {
                                pubKey: g_agent_signer_keypair.accountId(),
                                weight: 1,
                                signerType: StellarSdk.xdr.SignerType.signerGeneral().value
                            }
                        })).build();

                        tx.sign(gagent_keypair);
                        return Conf.horizon.submitTransaction(tx);
                    }).then(function () {
                        m.startComputation();
                        ctrl.gagent_signer_mnenonic(StellarSdk.getMnemonicFromSeed(g_agent_signer_keypair.seed()));
                        m.endComputation();
                        ctrl.getGeneralAgentKeys();
                        return m.flashSuccess(Conf.tr('General agent signer successful created'));
                    }).catch(function (e) {
                        console.log(e);
                        m.flashError(typeof e.message == 'string' && e.message.length > 0 ? Conf.tr(e.message) : Conf.tr('Stellar error'));
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [ctrl.gagent_signers().length ? { tag: "div", attrs: { class: "panel panel-color panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('General agent signers')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "table", attrs: { class: "table table-bordered" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: ["#"] }, { tag: "th", attrs: {}, children: [Conf.tr('Account')] }, { tag: "th", attrs: {}, children: [Conf.tr('Actions')] }] }] }, { tag: "tbody", attrs: {}, children: [ctrl.gagent_signers().map(function (gagent_signer_key, index) {
                                                    return { tag: "tr", attrs: {}, children: [{ tag: "th", attrs: { scope: "row" }, children: [index + 1] }, { tag: "td", attrs: {}, children: [{ tag: "span", attrs: { title: gagent_signer_key }, children: [gagent_signer_key] }] }, { tag: "td", attrs: {}, children: [{ tag: "button", attrs: { type: "submit", onclick: Helpers.deleteGeneralAgentSigner.bind(ctrl, gagent_signer_key),
                                                                    class: "btn btn-danger btn-xs waves-effect waves-light" }, children: [Conf.tr('Delete')] }] }] };
                                                })] }] }] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-warning" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('No general agent signers accounts found')] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }, { tag: "div", attrs: { class: "buttons", id: "emission_buttons" }, children: [{ tag: "button", attrs: { class: "btn btn-default", onclick: ctrl.generateSigner.bind(ctrl),
                                            id: "generate_tx" }, children: [Conf.tr('Generate general agent signer')] }] }, ctrl.gagent_signer_mnenonic() ? { tag: "div", attrs: { id: "emission_form" }, children: [{ tag: "h4", attrs: {}, children: [Conf.tr('Please remember mnemonic phrase. It can not be recovery')] }, { tag: "kbd", attrs: { style: "word-break: break-word; display: block;" }, children: [ctrl.gagent_signer_mnenonic()] }] } : ''] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19, "../../models/Helpers": 20 }], 42: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Navbar = require('../components/Navbar.js'),
            Footer = require('../components/Footer.js'),
            Sidebar = require('../components/Sidebar.js'),
            Payments = require('../components/Payments.js'),
            DateFormat = require('dateformat'),
            Auth = require('../models/Auth');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.username()) {
                    return m.route('/');
                }

                this.loaded = m.prop(false); //loading flag
                this.cnt_adm = m.prop(0); //admins counter
                this.cnt_ems = m.prop(0); //emission keys counter
                this.last_payments = m.prop(false);
                this.last_payment_time = m.prop(false);

                this.getData = function () {
                    m.onLoadingStart();
                    return ctrl.getSignersCounters().then(function () {
                        return ctrl.getLastPayments();
                    }).then(function () {
                        m.startComputation();
                        //view will be redraw
                        ctrl.loaded(true);
                        m.endComputation();
                        //make animations here
                        $('#cnt_adm').html(ctrl.cnt_adm());
                        $('#cnt_ems').html(ctrl.cnt_ems());

                        setTimeout(function () {
                            $('.counter').counterUp({
                                delay: 100,
                                time: 1200
                            });
                        }, 10);
                    }).catch(function (err) {
                        console.error(err);
                        return m.flashError(Conf.tr('Can not load data. Contact support'));
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.getSignersCounters = function () {

                    return Auth.loadAccountById(Conf.master_key).then(function (source) {
                        var signers = source.signers;
                        var cnt_adm = 0;
                        var cnt_ems = 0;
                        Object.keys(signers).forEach(function (key) {
                            var signer = signers[key];
                            if (signer.weight == StellarSdk.xdr.SignerType.signerAdmin().value && signer.signertype) {
                                cnt_adm++;
                            } else if (signer.weight == StellarSdk.xdr.SignerType.signerEmission().value && signer.signertype) {
                                cnt_ems++;
                            }
                        });
                        ctrl.cnt_adm(cnt_adm);
                        ctrl.cnt_ems(cnt_ems);
                    }).catch(function (err) {
                        console.error(err);
                    });
                };

                this.getLastPayments = function () {

                    return Conf.horizon.payments().order('desc').limit(Conf.payments.onmain).call().then(function (result) {
                        m.startComputation();
                        ctrl.last_payments(result.records);
                        if (result.records.length > 0) {
                            ctrl.last_payment_time(result.records[0].closed_at);
                        }
                        m.endComputation();
                    });
                };

                this.getData();
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [ctrl.loaded() ? { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "text-center row" }, children: [{ tag: "div", attrs: { class: "col-xs-12 col-md-12 col-lg-4" }, children: [{ tag: "div", attrs: { class: "card-box" }, children: [{ tag: "h3", attrs: { class: "text-primary" }, children: [{ tag: "span", attrs: { class: "counter", id: "cnt_adm" }, children: [ctrl.cnt_adm()] }] }, { tag: "p", attrs: { class: "text-muted" }, children: [Conf.tr('Administators keys')] }] }] }, { tag: "div", attrs: { class: "col-xs-12 col-md-12 col-lg-4" }, children: [{ tag: "div", attrs: { class: "card-box" }, children: [{ tag: "h3", attrs: { class: "text-primary" }, children: [{ tag: "span", attrs: { class: "counter", id: "cnt_ems" }, children: [ctrl.cnt_ems()] }] }, { tag: "p", attrs: { class: "text-muted" }, children: [Conf.tr('Emission keys')] }] }] }, { tag: "div", attrs: { class: "col-xs-12 col-md-12 col-lg-4" }, children: [{ tag: "div", attrs: { class: "card-box" }, children: [{ tag: "h3", attrs: { class: "text-primary" }, children: [{ tag: "span", attrs: {}, children: [DateFormat(ctrl.last_payment_time(), 'dd.mm.yyyy HH:MM:ss')] }] }, { tag: "p", attrs: { class: "text-muted" }, children: [Conf.tr('Last transaction time')] }] }] }] }, { tag: "div", attrs: { class: "clearfix" } }, { tag: "div", attrs: { class: "panel panel-color panel-inverse hidden-md" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr("Last transactions")] }, { tag: "p", attrs: { class: "panel-sub-title font-13" }, children: [Conf.tr("Overview of last recent transactions"), "."] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [m.component(Payments, { payments: ctrl.last_payments() })] }, { tag: "div", attrs: { class: "panel-footer text-center" }, children: [{ tag: "a", attrs: { href: "/analytics", config: m.route,
                                                    class: "btn btn-primary btn-custom waves-effect w-md btn-sm waves-light" }, children: [Conf.tr("All transactions")] }] }] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-warning" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('Wait for loading data'), "..."] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../components/Footer.js": 7, "../components/Navbar.js": 10, "../components/Payments.js": 12, "../components/Sidebar.js": 14, "../config/Config.js": 15, "../models/Auth": 19, "dateformat": 1 }], 43: [function (require, module, exports) {
        var Conf = require('../../config/Config.js'),
            Navbar = require('../../components/Navbar.js'),
            Footer = require('../../components/Footer.js'),
            Sidebar = require('../../components/Sidebar.js'),
            Helpers = require('../../models/Helpers'),
            Auth = require('../../models/Auth'),
            Pagination = require('../../components/Pagination.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.username()) {
                    return m.route('/');
                }

                this.is_initialized = m.prop(false);

                this.page = m.route.param('page') ? m.prop(Number(m.route.param('page'))) : m.prop(1);
                this.limit = Conf.pagination.limit;
                this.offset = (ctrl.page() - 1) * ctrl.limit;
                this.pagination_data = m.prop({ func: "getInvoicesStatistics", page: ctrl.page() });

                this.statistics = m.prop([]);

                this.getStatistics = function () {
                    m.onLoadingStart();
                    Auth.api().getInvoicesStatistics({ limit: ctrl.limit, offset: ctrl.offset }).then(function (statistics) {
                        if (typeof statistics.items != 'undefined') {
                            m.startComputation();
                            ctrl.statistics(statistics.items);
                            ctrl.is_initialized(true);
                            m.endComputation();
                        } else {
                            console.error('Unexpected response');
                            console.error(statistics);
                        }
                    }).catch(function (err) {
                        console.error(err);
                        m.flashApiError(err);
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.getStatistics();
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), m.component(Sidebar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [ctrl.is_initialized() ? { tag: "div", attrs: {}, children: [ctrl.statistics().length ? { tag: "div", attrs: { class: "panel panel-color panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Invoices statistic')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "table", attrs: { class: "table table-bordered" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Date')] }, { tag: "th", attrs: {}, children: [Conf.tr('Created')] }, { tag: "th", attrs: {}, children: [Conf.tr('Used')] }, { tag: "th", attrs: {}, children: [Conf.tr('Expired')] }] }] }, { tag: "tbody", attrs: {}, children: [ctrl.statistics().map(function (statistic) {
                                                        return { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [Helpers.getDateOnlyFromTimestamp(statistic.date)] }, { tag: "td", attrs: {}, children: [statistic.all] }, { tag: "td", attrs: {}, children: [statistic.used] }, { tag: "td", attrs: {}, children: [statistic.expired] }] };
                                                    })] }] }, m.component(Pagination, { pagination: ctrl.pagination_data() })] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-warning" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('No invoices statistics found')] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-primary" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('Wait for data loading'), "..."] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../../components/Footer.js": 7, "../../components/Navbar.js": 10, "../../components/Pagination.js": 11, "../../components/Sidebar.js": 14, "../../config/Config.js": 15, "../../models/Auth": 19, "../../models/Helpers": 20 }], 44: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Auth = require('../models/Auth.js'),
            Navbar = require('../components/Navbar.js'),
            Footer = require('../components/FooterFullWidth.js');

        var Login = module.exports = {
            controller: function controller() {
                var ctrl = this;

                window.Conf = Conf;
                window.Auth = Auth;

                if (Auth.keypair()) {
                    return m.route('/home');
                }

                this.login = function (e) {
                    e.preventDefault();

                    m.onLoadingStart();
                    Auth.login(e.target.login.value, e.target.password.value).then(function () {
                        m.onLoadingEnd();
                        m.route('/home');
                        return true;
                    }).catch(function (err) {
                        m.flashError(err.message ? Conf.tr(err.message) : Conf.tr('Service error. Please contact support'));
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "text-right languages" }, children: [{ tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'en'), href: "#" }, children: ["EN"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ua'), href: "#" }, children: ["UA"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ru'), href: "#" }, children: ["RU"] }] }, { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: { class: "text-center logo" }, children: [{ tag: "img", attrs: { src: "/assets/img/logo.svg", alt: "Smartmoney logo" } }, { tag: "h4", attrs: {}, children: [Conf.tr('Admin Dashboard')] }] }, { tag: "form", attrs: { class: "form-horizontal m-t-20", onsubmit: ctrl.login.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text", required: "required",
                                            placeholder: Conf.tr("Username"),
                                            autocapitalize: "none",
                                            name: "login" } }, { tag: "i", attrs: { class: "md md-account-circle form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password", required: "required", autocapitalize: "none",
                                            placeholder: Conf.tr("Password"),
                                            name: "password" } }, { tag: "i", attrs: { class: "md md-vpn-key form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group m-t-20 text-center" }, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-lg btn-custom waves-effect w-md waves-light m-b-5",
                                        type: "submit" }, children: [Conf.tr("Log in")] }, { tag: "div", attrs: { class: "m-t-10" }, children: [{ tag: "a", attrs: { href: "/sign", config: m.route,
                                            class: "" }, children: [Conf.tr("Create an account")] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../components/FooterFullWidth.js": 8, "../components/Navbar.js": 10, "../config/Config.js": 15, "../models/Auth.js": 19 }], 45: [function (require, module, exports) {
        var Auth = require('../models/Auth.js');

        var Logout = module.exports = {
            controller: function controller() {
                Auth.logout();
                m.route('/');
            },

            view: function view(ctrl) {}
        };
    }, { "../models/Auth.js": 19 }], 46: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Auth = require('../models/Auth.js'),
            Helpers = require('../models/Helpers.js'),
            Navbar = require('../components/Navbar.js'),

        // sjcl = require('sjcl'),
        Footer = require('../components/FooterFullWidth.js');

        var Sign = module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (Auth.keypair()) {
                    return m.route('/home');
                }

                this.generateTx = function (e) {
                    e.preventDefault();
                    m.onLoadingStart();

                    var login = e.target.login.value;
                    var password = e.target.password.value;
                    var repassword = e.target.repassword.value;

                    if (!login || !password || !repassword) {
                        return m.flashError(Conf.tr('Please, fill all required fields'));
                    }

                    if (password.length < 6) {
                        return m.flashError(Conf.tr('Password should have 6 chars min'));
                    }

                    if (password != repassword) {
                        return m.flashError(Conf.tr('Passwords should match'));
                    }

                    var admin_keypair = StellarSdk.Keypair.random();

                    // Check if login already exists
                    return StellarWallet.isLoginExist({
                        server: Conf.keyserver_host + '/v2',
                        username: login
                    }).then(function () {
                        Conf.horizon.loadAccount(Conf.master_key).then(function (source) {
                            var tx = new StellarSdk.TransactionBuilder(source).addOperation(StellarSdk.Operation.setOptions({
                                signer: {
                                    pubKey: admin_keypair.accountId(),
                                    weight: StellarSdk.xdr.SignerType.signerAdmin().value,
                                    signerType: StellarSdk.xdr.SignerType.signerAdmin().value
                                }
                            })).build();
                            var data = JSON.stringify({
                                tx: tx.toEnvelope().toXDR().toString("base64"),
                                seed: Helpers.encryptData(admin_keypair.seed(), password),
                                account: admin_keypair.accountId(),
                                login: login,
                                operation: 'admin_create'
                            });
                            Helpers.download('create_admin_transaction.smb', data);
                            m.onLoadingEnd();
                            $(e.target).trigger('reset');
                        }).catch(function (e) {
                            console.error(e);
                            return m.flashError(Conf.tr('Transaction error'));
                        });
                    }).catch(function (err) {
                        console.error(err);
                        return m.flashError(Conf.tr('Login already exist'));;
                    });
                };

                this.uploadTx = function (e) {
                    m.onLoadingStart();

                    var file = e.target.files[0];
                    if (!file) {
                        return m.flashError(Conf.tr("Bad file"));
                    }

                    var reader = new FileReader();
                    reader.readAsText(file);

                    reader.onload = function (evt) {
                        if (!evt.target.result) {
                            return m.flashError(Conf.tr("Bad file"));
                        }
                        try {
                            var data = JSON.parse(evt.target.result);
                        } catch (e) {
                            return m.flashError(Conf.tr("Bad file"));
                        }
                        if (typeof data.operation == 'undefined') {
                            return m.flashError(Conf.tr("Bad file"));
                        }
                        if (data.operation != 'admin_create') {
                            return m.flashError(Conf.tr("Invalid operation with file ") + data.operation + " " + Conf.tr("Ensure file is correct"));
                        }
                        if (!data.account && !data.seed && !data.hash) {
                            return m.flashError(Conf.tr("Bad file"));
                        }
                        var tx = new StellarSdk.Transaction(data.tx);
                        m.getPromptValue(Conf.tr('Enter password')).then(function (password) {
                            try {
                                var seed = sjcl.decrypt(password, atob(data.seed));
                            } catch (err) {
                                m.flashError(Conf.tr("Bad password"));
                                throw new Error(Conf.tr('Bad password'));
                            }
                            var keypair = StellarSdk.Keypair.fromSeed(seed);
                            return StellarWallet.createWallet({
                                server: Conf.keyserver_host + '/v2',
                                username: data.login,
                                password: password,
                                accountId: keypair.accountId(),
                                publicKey: keypair.rawPublicKey().toString('base64'),
                                keychainData: keypair.seed(),
                                mainData: 'mainData',
                                kdfParams: {
                                    algorithm: 'scrypt',
                                    bits: 256,
                                    n: Math.pow(2, 11),
                                    r: 8,
                                    p: 1
                                }
                            });
                        }).then(function () {
                            return Conf.horizon.submitTransaction(tx);
                        }).then(function () {
                            m.route('/');
                            return m.flashSuccess(Conf.tr('Admin account created'));
                        }).catch(function (err) {
                            console.error(err);
                            $("#upload_tx").replaceWith($("#upload_tx").val('').clone(true));
                            m.flashError(Conf.tr("Can not create admin account"));
                        });
                    };
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: {}, children: [{ tag: "div", attrs: { class: "text-right languages" }, children: [{ tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'en'), href: "#" }, children: ["EN"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ua'), href: "#" }, children: ["UA"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ru'), href: "#" }, children: ["RU"] }] }, { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: { class: "text-center logo" }, children: [{ tag: "img", attrs: { src: "/assets/img/logo.svg", alt: "Smartmoney logo" } }, { tag: "h4", attrs: {}, children: [Conf.tr('Admin Dashboard')] }] }, { tag: "form", attrs: { class: "form-horizontal m-t-20", onsubmit: ctrl.generateTx.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text", required: "", name: "login",
                                            placeholder: Conf.tr('Login') }
                                    }, { tag: "i", attrs: { class: "md md-account-circle form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password", required: "", name: "password",
                                            placeholder: Conf.tr('Password') }
                                    }, { tag: "i", attrs: { class: "md md-vpn-key form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password", required: "", name: "repassword",
                                            placeholder: Conf.tr('Repeat password') }
                                    }, { tag: "i", attrs: { class: "md md-vpn-key form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group m-b-0" }, children: [{ tag: "div", attrs: { class: "col-md-offset-1 col-md-10 text-center" }, children: [{ tag: "button", attrs: { type: "submit", class: "btn btn-primary btn-custom waves-effect w-md waves-light m-b-5 m-r-15" }, children: [Conf.tr('Download for sign')] }, { tag: "div", attrs: { class: "fileUpload btn btn-inverse btn-custom waves-effect w-md waves-light m-b-5 m-r-0", onchange: ctrl.uploadTx.bind(ctrl) }, children: [{ tag: "span", attrs: {}, children: [Conf.tr('Upload signed')] }, { tag: "input", attrs: { type: "file", accept: ".smbx",
                                                id: "upload_tx" } }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../components/FooterFullWidth.js": 8, "../components/Navbar.js": 10, "../config/Config.js": 15, "../models/Auth.js": 19, "../models/Helpers.js": 20 }], 47: [function (require, module, exports) {}, {}], 48: [function (require, module, exports) {
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
    }, {}], 49: [function (require, module, exports) {
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
    }, { "rH1JPG": 50 }], 50: [function (require, module, exports) {
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
    }, {}] }, {}, [17]);