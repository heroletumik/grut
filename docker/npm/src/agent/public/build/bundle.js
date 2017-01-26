"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
    }, { "fs": 16, "path": 18 }], 3: [function (require, module, exports) {
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
    }, { "events": 17, "inherits": 1 }], 4: [function (require, module, exports) {
        module.exports = {
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
    }, {}], 5: [function (require, module, exports) {
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
    }, { "../config/Config.js": 7, "../models/Auth.js": 11 }], 6: [function (require, module, exports) {
        var Auth = require('../models/Auth.js');
        var Helpers = require('../components/Helpers.js');
        var Conf = require('../config/Config.js');
        var Session = require('../models/Session.js');

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

            view: function view(ctrl, data) {
                var content = !data || !data.tpl ? '' : data.tpl;
                var title = !data || !data.title ? Conf.tr("Dashboard") : data.title;

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
                    }, [m(".row", [m(".col-md-4.col-md-offset-4", [[m(".portlet.text-center", [m(".portlet-heading.bg-primary", { style: { borderRadius: 0 } }, [m("h3.portlet-title", Session.modalTitle() || Conf.tr('Message')), m(".portlet-widgets", [m("a[href='#']", {
                        onclick: function onclick(e) {
                            e.preventDefault();Session.closeModal();
                        }
                    }, [m("i.ion-close-round")])]), m(".clearfix")]), m(".portlet-body", Session.modalMessage())])]]), m(".clearfix")])]) : '', { tag: "div", attrs: { id: "wrapper" }, children: [{ tag: "div", attrs: { class: "topbar" }, children: [{ tag: "div", attrs: { class: "topbar-left hidden-xs" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "a", attrs: { href: "/", class: "logo" }, children: [{ tag: "span", attrs: {}, children: ["SmartMoney ", Conf.tr("Agent")] }, " "] }] }] }, { tag: "div", attrs: { class: "navbar navbar-default", role: "navigation" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "" }, children: [{ tag: "div", attrs: { class: "pull-left" }, children: [{ tag: "button", attrs: { class: "button-menu-mobile open-left waves-effect" }, children: [{ tag: "i", attrs: { class: "md md-menu" } }] }, { tag: "span", attrs: { class: "clearfix" } }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "#", onclick: Auth.logout }, children: [{ tag: "i", attrs: { class: "fa fa-power-off m-r-5" } }, Conf.tr("Logout")] }] }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: { class: "dropdown" }, children: [{ tag: "a", attrs: { class: "dropdown-toggle", "data-toggle": "dropdown", href: "#" }, children: [{ tag: "i", attrs: { class: "fa fa-language fa-fw" } }, " ", { tag: "i", attrs: { class: "fa fa-caret-down" } }] }, { tag: "ul", attrs: { class: "dropdown-menu dropdown-user" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'en'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/flags/en.png" } }, " English"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ua'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/flags/ua.png" } }, " Українська"] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ru'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/img/flags/ru.png" } }, " Русский"] }] }] }] }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "#", onclick: ctrl.updateTTL.bind(ctrl), title: Conf.tr('Time before the session close') }, children: [{ tag: "div", attrs: { id: "spinner-progress", class: "c100 small small-cust green p" + ctrl.css_class() }, children: [{ tag: "span", attrs: { id: "spinner-time" }, children: [!ctrl.ttl() ? '' : Helpers.getTimeFromSeconds(ctrl.ttl())] }, { tag: "div", attrs: { class: "slice" }, children: [{ tag: "div", attrs: { class: "bar" } }, { tag: "div", attrs: { class: "fill" } }] }] }] }] }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right hidden-xs" }, children: [{ tag: "li", attrs: {}, children: [{ tag: "button", attrs: { class: "refresh btn btn-icon waves-effect waves-light btn-purple m-b-5",
                                                        onclick: ctrl.refreshPage.bind(ctrl) }, children: [" ", { tag: "i", attrs: { class: "fa fa-refresh" } }, " "] }] }] }] }] }] }] }, { tag: "div", attrs: { class: "left side-menu" }, children: [{ tag: "div", attrs: { class: "sidebar-inner slimscrollleft" }, children: [{ tag: "div", attrs: { id: "sidebar-menu" }, children: [{ tag: "ul", attrs: {}, children: [{ tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "/cards", config: m.route, class: "waves-effect waves-primary" }, children: [{ tag: "i", attrs: { class: "md  md-dns" } }, " ", { tag: "span", attrs: {}, children: [Conf.tr("Scratch cards")] }] }] }, { tag: "li", attrs: {}, children: [{ tag: "a", attrs: { href: "/cards/generate", config: m.route, class: "waves-effect waves-primary" }, children: [{ tag: "i", attrs: { class: "md  md-dns" } }, " ", { tag: "span", attrs: {}, children: [Conf.tr("Create scratch cards")] }] }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }, { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "content" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-sm-12" }, children: [{ tag: "div", attrs: { class: "page-title-box" }, children: [{ tag: "ol", attrs: { class: "breadcrumb pull-right" }, children: [{ tag: "li", attrs: { class: "active" }, children: ["Smartmoney"] }, { tag: "li", attrs: { class: "active" }, children: [title] }] }, { tag: "h4", attrs: { class: "page-title" }, children: [title] }, data.subtitle ? { tag: "p", attrs: { class: "page-sub-title font-13" }, children: [data.subtitle] } : ''] }] }] }, content] }] }, { tag: "footer", attrs: { class: "footer text-right" }, children: ["2016 © AtticLab"] }] }] }] };
            }
        };
    }, { "../components/Helpers.js": 4, "../config/Config.js": 7, "../models/Auth.js": 11, "../models/Session.js": 12 }], 7: [function (require, module, exports) {
        (function (process) {
            var Localize = require('localize');
            var Locales = require('../locales/translations.js');

            var conf = {
                master_key: "GAWIB7ETYGSWULO4VB7D6S42YLPGIC7TY7Y2SSJKVOTMQXV5TILYWBUA",
                keyserver_host: "http://keys.local",
                horizon_host: "http://horizon.local",
                api_url: "http://api.local"
            };

            conf.asset = 'EUAH';

            StellarSdk.Network.use(new StellarSdk.Network("euah.network"));

            conf.horizon = new StellarSdk.Server(conf.horizon_host);

            conf.onpage = 10;

            conf.pagination = {
                limit: 10
            };

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

            module.exports = conf;
        }).call(this, require("rH1JPG"));
    }, { "../locales/translations.js": 10, "localize": 2, "rH1JPG": 19 }], 8: [function (require, module, exports) {
        var errors = {
            assets_get_fail: 'Failed to get anonymous assets from horizon',
            assets_empty: 'List of assets is empty',
            assets_get_timeout: 'Request to horizon exceeded timeout time'
        };

        var Errors = module.exports = errors;
    }, {}], 9: [function (require, module, exports) {
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
            $.Notification.notify('error', 'top center', "Error", msg);
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
            $.Notification.notify('success', 'top center', "Success", msg);
        };

        m.getPromptValue = function (label) {
            var errMsg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (!errMsg) errMsg = Conf.tr('Empty value');
            return new Promise(function (resolve, reject) {
                jPrompt(label, '', Conf.tr('Message'), Conf.tr('OK'), Conf.tr('Cancel'), function (result) {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(new Error(errMsg));
                    }
                });
            });
        };

        // Routing
        m.route.mode = 'pathname';
        m.route(document.getElementById('app'), "/", {
            "/": require('./pages/Login.js'),
            "/cards": require('./pages/Cards.js'),
            "/cards/generate": require('./pages/Generate.js')
        });
    }, { "./config/Config.js": 7, "./pages/Cards.js": 13, "./pages/Generate.js": 14, "./pages/Login.js": 15, "queue": 3 }], 10: [function (require, module, exports) {
        module.exports = {
            "Dashboard": {
                ru: "Панель управления",
                ua: "Панель керування"
            },
            "Logout": {
                ru: "Выйти",
                ua: "Вийти"
            },
            "Create new prepaid cards": {
                ru: 'Создать новые скретч-карты',
                ua: 'Створити нові скретч-карти'
            },
            "Amount of cards": {
                ru: "Количество карточек",
                ua: "Кількість карток"
            },
            "Value of a card": {
                ru: "Стоимость карты",
                ua: "Вартість картки"
            },
            "Total amount": {
                ru: "Общая сумма",
                ua: "Загальна сума"
            },
            "Create": {
                ru: "Создать",
                ua: "Створити"
            },
            "This page allows to create prepaid cards that can be distributed physically": {
                ru: "Эта страница позволяет создавать предоплаченные карты, которые потом могут быть распечатаны для последующего распространения",
                ua: "Ця сторінка дозволяє створювати передплачені картки, які потім можуть бути роздруковані для подальшого розповсюдження"
            },
            "Cards": {
                ru: "Карты",
                ua: "Картки"
            },
            "Cards, created by the agent": {
                ru: "Скретч-карты",
                ua: "Скретч-картки"
            },
            "Amount": {
                ru: "Количество",
                ua: "Кількість"
            },
            "Currency": {
                ru: "Валюта",
                ua: "Валюта"
            },
            "Account": {
                ru: "Счет",
                ua: "Рахунок"
            },
            "Date of creation": {
                ru: "Дата создания",
                ua: "Дата створення"
            },
            "Date of usage": {
                ru: "Дата использования",
                ua: "Дата використання"
            },
            "Card info": {
                ru: "Информация о карте",
                ua: "Інформація про картку"
            },
            "Show QR": {
                ru: "Показать QR-код",
                ua: "Показати QR-код"
            },
            "Card data": {
                ru: "Данные скретч-карты",
                ua: "Дані скретч-картки"
            },
            "Create new": {
                ru: "Создать новую",
                ua: "Створити нову"
            },
            "There is no cards created yet": {
                ru: "Нету созданных скретч-карт",
                ua: "Немає створенних скретч-карток"
            },
            "Card account": {
                ru: "Счет скретч-карты",
                ua: "Рахунок скретч-картки"
            },
            "Max cards at time": {
                ru: "Максимально карт за один раз",
                ua: "Максимально карток за один раз"
            },
            "Check amount of cards parameter": {
                ru: "Проверьте ",
                ua: "Вийти"
            },
            "Not enough balance": {
                ru: "Недостаточно средств",
                ua: "Недостатньо грошей"
            },
            "Success. Cards will be confirmed in few minutes": {
                ru: "Успешно. Скретч-карты будут подтверждены через несколько минут",
                ua: "Успішно. Скретч-картки будут підтверджені через кілка хвилин"
            },
            "Agent balances": {
                ru: "Балансы агента",
                ua: "Баланси агента"
            },
            "Login/password combination is invalid": {
                ru: "Неправильный логин или пароль",
                ua: "Невірний логін або пароль"
            },
            "Agent dashboard": {
                ru: "Панель агента",
                ua: "Панель агента"
            },
            "Username": {
                ru: "Логин",
                ua: "Логін"
            },
            "Password": {
                ru: "Пароль",
                ua: "Пароль"
            },
            "Log in": {
                ru: "Войти",
                ua: "Увійти"
            },
            "Prev": {
                ru: "Предыдущая",
                ua: "Попередня"
            },
            "Next": {
                ru: "Следующая",
                ua: "Наступна"
            },
            "Agent": {
                ru: "Агент",
                ua: "Агент"
            },
            "Time before the session close": {
                ru: "Время до закрытия сессии",
                ua: "Час до зачинення сессії"
            },
            "Scratch cards": {
                ru: "Скретч-карты",
                ua: "Скретч-картки"
            },
            "Create scratch cards": {
                ru: "Создать скретч-карты",
                ua: "Створити скретч-картки"
            }
        };
    }, {}], 11: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Errors = require('../errors/Errors.js');

        var Auth = {

            keypair: m.prop(false),
            wallet: m.prop(false),
            username: m.prop(false),
            api: m.prop(false),
            ttl: m.prop(0),
            time_live: m.prop(0),

            loadAccountById: function loadAccountById(id) {
                return Conf.horizon.accounts().accountId(id).call();
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
                    if (account_data.type_i != StellarSdk.xdr.AccountType.accountDistributionAgent().value) {

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
                window.location.href = "/";
            },

            destroySession: function destroySession() {
                m.startComputation();
                Auth.keypair(null);
                m.endComputation();
                m.route('/');
            }

        };

        module.exports = Auth;
    }, { "../config/Config.js": 7, "../errors/Errors.js": 8 }], 12: [function (require, module, exports) {
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
    }, {}], 13: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Wrapper = require('../components/Wrapper.js');
        var Helpers = require('../components/Helpers.js');
        var Auth = require('../models/Auth.js');
        var Pagination = require('../components/Pagination.js');
        var Session = require('../models/Session.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.keypair()) {
                    return m.route('/');
                }

                this.is_initialized = m.prop(false);

                this.page = m.route.param('page') ? m.prop(Number(m.route.param('page'))) : m.prop(1);
                this.limit = Conf.pagination.limit;
                this.offset = (ctrl.page() - 1) * ctrl.limit;
                this.pagination_data = m.prop({ func: "getCardsList", page: ctrl.page() });

                this.cardsList = m.prop([]);

                this.getCardsList = function () {
                    m.onLoadingStart();

                    return Auth.api().getCardsList({ limit: ctrl.limit, offset: ctrl.offset }).then(function (cards) {
                        if (typeof cards.items != 'undefined') {
                            m.startComputation();
                            ctrl.cardsList(cards.items);
                            ctrl.is_initialized(true);
                            m.endComputation();
                        } else {
                            console.error('Unexpected response');
                            console.error(cards);
                        }
                    }).catch(function (error) {
                        console.error(error);
                        return m.flashApiError(error);
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.getCardsList();

                this.getCard = function (card, e) {
                    e.preventDefault();
                    m.onLoadingStart();
                    return ctrl.generateQRCode(Auth.wallet().getKeychainData(), card.seed).then(function (qrcode) {
                        m.startComputation();
                        Session.modal(m.trust('<div class="panel panel-color panel-primary text-center">' + '<div class="panel-heading">' + '<h3 class="panel-title">' + Conf.tr('Value of a card') + ': ' + parseFloat(card.amount).toFixed(2) + ' ' + card.asset + '</h3>' + '<p class="panel-sub-title font-13 text-muted">' + Conf.tr('Card account') + ': ' + card.account_id + '</p>' + '</div>' + '<div class="panel-body">' + '<div id="qrCode">' + qrcode + '</div>' + '</div>' + '</div>'), Conf.tr("Your QRCode"));
                        m.endComputation();
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.generateQRCode = function (agent_seed, card_seed) {

                    return new Promise(function (resolve) {
                        //consts
                        var typeNumber = 8;
                        var errorCorrectionLevel = 'L';
                        var WALLET_QR_OPERATION_TYPE = 2;
                        var size = 5;

                        var seed = sjcl.decrypt(agent_seed, atob(card_seed));
                        var qr = qrcode(typeNumber, errorCorrectionLevel);
                        var card_data = {
                            't': WALLET_QR_OPERATION_TYPE,
                            'seed': seed
                        };

                        qr.addData(JSON.stringify(card_data));
                        qr.make();

                        resolve(m.trust(qr.createImgTag(size, 2)));
                    });
                };
            },

            view: function view(ctrl) {
                return m.component(Wrapper, {
                    title: Conf.tr("Cards"),
                    tpl: ctrl.is_initialized() ? { tag: "div", attrs: {}, children: [!ctrl.cardsList().length ? { tag: "div", attrs: { class: "alert alert-warning" }, children: [{ tag: "p", attrs: {}, children: [Conf.tr('There is no cards created yet')] }, { tag: "p", attrs: {}, children: [{ tag: "a", attrs: { href: "/cards/generate", config: m.route }, children: [Conf.tr('Create new')] }] }] } : { tag: "div", attrs: { class: "col-md-12" }, children: [{ tag: "div", attrs: { class: "panel panel-color panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Cards, created by the agent')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "table-responsive" }, children: [{ tag: "table", attrs: { class: "table" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Amount')] }, { tag: "th", attrs: {}, children: [Conf.tr('Currency')] }, { tag: "th", attrs: {}, children: [Conf.tr('Account')] }, { tag: "th", attrs: {}, children: [Conf.tr('Date of creation')] }, { tag: "th", attrs: {}, children: [Conf.tr('Date of usage')] }, { tag: "th", attrs: {}, children: [Conf.tr('Card info')] }] }] }, { tag: "tbody", attrs: {}, children: [ctrl.cardsList().map(function (card) {
                                                    return { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [parseFloat(card.amount).toFixed(2)] }, { tag: "td", attrs: {}, children: [card.asset] }, { tag: "td", attrs: {}, children: [card.account_id] }, { tag: "td", attrs: {}, children: [Helpers.getDateFromTimestamp(card.created_date)] }, { tag: "td", attrs: {}, children: [card.is_used ? Helpers.getDateFromTimestamp(card.used_date) : '-'] }, { tag: "td", attrs: {}, children: [{ tag: "button", attrs: { class: "btn btn-primary btn-xs",
                                                                    onclick: ctrl.getCard.bind(ctrl, card)
                                                                }, children: [Conf.tr('Show QR')] }] }] };
                                                })] }] }] }, m.component(Pagination, { pagination: ctrl.pagination_data() })] }] }] }] } : { tag: "div", attrs: { class: "portlet" }, children: [{ tag: "div", attrs: { class: "portlet-heading bg-primary" }, children: [{ tag: "h3", attrs: { class: "portlet-title" }, children: [Conf.tr('Wait for data loading'), "..."] }, { tag: "div", attrs: { class: "portlet-widgets" }, children: [{ tag: "a", attrs: { "data-toggle": "collapse", "data-parent": "#accordion1", href: "#bg-warning" }, children: [{ tag: "i", attrs: { class: "ion-minus-round" } }] }, { tag: "span", attrs: { class: "divider" } }, { tag: "a", attrs: { href: "#", "data-toggle": "remove" }, children: [{ tag: "i", attrs: { class: "ion-close-round" } }] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] }
                });
            }
        };
    }, { "../components/Helpers.js": 4, "../components/Pagination.js": 5, "../components/Wrapper.js": 6, "../config/Config.js": 7, "../models/Auth.js": 11, "../models/Session.js": 12 }], 14: [function (require, module, exports) {
        var Conf = require('../config/Config.js');
        var Wrapper = require('../components/Wrapper.js');
        var Helpers = require('../components/Helpers.js');
        var Auth = require('../models/Auth.js');

        Array.prototype.last = function () {
            return this[this.length - 1];
        };

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (!Auth.keypair()) {
                    return m.route('/');
                }

                this.cards_count = m.prop(1);
                this.cards_amount = m.prop(1);
                this.cards_sum = m.prop(this.cards_count() * this.cards_amount());

                this.agent_balances = m.prop([]);
                this.agent_assets = m.prop([]);

                this.initAgentAssets = function () {

                    return Auth.loadAccountById(Auth.keypair().accountId()).then(function (account_data) {
                        m.startComputation();
                        ctrl.agent_assets([]);
                        account_data.balances.map(function (balance) {
                            if (typeof balance.asset_code != 'undefined') {
                                ctrl.agent_assets().push(balance.asset_code);
                            }
                        });
                        m.endComputation();
                    });
                };

                this.initAgentBalances = function () {

                    return Auth.loadAccountById(Auth.keypair().accountId()).then(function (account_data) {
                        m.startComputation();
                        ctrl.agent_balances([]);
                        account_data.balances.map(function (balance) {
                            if (typeof balance.asset_code != 'undefined') {
                                ctrl.agent_balances().push(balance);
                            }
                        });
                        m.endComputation();
                    });
                };

                this.getBalanceByAsset = function (asset_code) {

                    var asset_balance = 0;

                    ctrl.agent_balances().every(function (balance) {
                        if (balance.asset_code == asset_code) {
                            asset_balance = balance.balance;
                            return false;
                        }
                        return true;
                    });

                    return asset_balance;
                };

                //init agent data
                m.onLoadingStart();
                this.initAgentAssets().then(function () {
                    ctrl.initAgentBalances();
                }).then(function () {
                    m.onLoadingEnd();
                });

                this.updateCardsSum = function (e) {
                    m.startComputation();
                    if (e.target.id == 'cards_count') {
                        ctrl.cards_count(e.target.value);
                    }
                    if (e.target.id == 'cards_amount') {
                        ctrl.cards_amount(e.target.value);
                    }
                    ctrl.cards_sum(ctrl.cards_count() * ctrl.cards_amount());
                    m.endComputation();
                };

                this.generateCards = function (e) {
                    e.preventDefault();

                    m.onLoadingStart();

                    if (ctrl.cards_count() > 100) {
                        return m.flashError(Conf.tr('Max cards at time') + ': 100');
                    }

                    if (ctrl.cards_count() <= 0) {
                        return m.flashError(Conf.tr('Check amount of cards parameter'));
                    }

                    var amount = ctrl.cards_amount();
                    var asset = Conf.asset;
                    var accounts_data = {};
                    ctrl.initAgentBalances().then(function () {
                        var balance = ctrl.getBalanceByAsset(Conf.asset);
                        if (balance < ctrl.cards_sum()) {
                            return Promise.reject(Conf.tr('Not enough balance'));
                        }

                        return Conf.horizon.loadAccount(Auth.keypair().accountId());
                    }).then(function (source) {
                        //var memo = StellarSdk.Memo.text("card_creation");
                        var accountKeypair = null;
                        var txBuilder = new StellarSdk.TransactionBuilder(source); //, {memo: memo});

                        for (var c = 0; c < ctrl.cards_count(); c++) {
                            accountKeypair = StellarSdk.Keypair.random();

                            accounts_data[accountKeypair.accountId()] = btoa(sjcl.encrypt(Auth.wallet().getKeychainData(), accountKeypair.seed()));
                            txBuilder.addOperation(StellarSdk.Operation.createAccount({
                                destination: accountKeypair.accountId(),
                                accountType: StellarSdk.xdr.AccountType.accountScratchCard().value,
                                asset: new StellarSdk.Asset(asset, Conf.master_key),
                                amount: amount.toString()
                            }));
                        }

                        var tx = txBuilder.build();
                        tx.sign(Auth.keypair()); //StellarSdk.Keypair.fromSeed(Auth.wallet().getKeychainData()));
                        console.log(tx.toEnvelope().toXDR().toString("base64"));
                        //return Conf.horizon.submitTransaction(tx);
                        return Auth.api().createCards({
                            tx: tx.toEnvelope().toXDR().toString("base64"),
                            data: JSON.stringify(accounts_data)
                        });
                    }).then(function () {
                        return m.flashSuccess(Conf.tr('Success. Cards will be confirmed in few moments'));
                    }).then(function () {
                        return ctrl.initAgentBalances();
                    }).catch(function (error) {
                        console.error(error);
                        if (error && typeof error.name != 'undefined' && error.name == 'ApiError') {
                            return m.flashApiError(error);
                        }
                        return m.flashError(error);
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };
            },

            view: function view(ctrl) {
                return m.component(Wrapper, {
                    title: Conf.tr('Cards'),
                    subtitle: Conf.tr('This page allows to create prepaid cards that can be distributed physically'),
                    tpl: { tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-12" }, children: [{ tag: "div", attrs: { class: "panel panel-border panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Agent balances')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [ctrl.agent_balances().map(function (balance) {
                                        return { tag: "p", attrs: {}, children: [parseFloat(balance.balance).toFixed(2) + " " + balance.asset_code] };
                                    })] }] }] }, { tag: "div", attrs: { class: "col-lg-12" }, children: [{ tag: "div", attrs: { class: "panel panel-color panel-primary" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Create new prepaid cards')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { id: "card_form" }, children: [{ tag: "form", attrs: { role: "form", onsubmit: ctrl.generateCards.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-md-2" }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { class: "control-label",
                                                                for: "cards_count" }, children: [Conf.tr('Amount of cards')] }, { tag: "input", attrs: { class: "vertical-spin form-control",
                                                                oninput: ctrl.updateCardsSum.bind(ctrl),
                                                                min: "1", max: "100", step: "1",
                                                                value: ctrl.cards_count(),
                                                                id: "cards_count",
                                                                name: "cards_count", type: "number" } }] }] }, { tag: "div", attrs: { style: "float:left;" }, children: [{ tag: "h2", attrs: { style: "padding-top: 17px;" }, children: ["*"] }] }, { tag: "div", attrs: { class: "col-md-2" }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { class: "control-label",
                                                                for: "cards_amount" }, children: [Conf.tr('Value of a card')] }, { tag: "input", attrs: { class: "vertical-spin form-control",
                                                                oninput: ctrl.updateCardsSum.bind(ctrl),
                                                                min: "1", max: "10000", step: "1",
                                                                value: ctrl.cards_amount(),
                                                                id: "cards_amount",
                                                                name: "cards_amount", type: "number" } }] }] }, { tag: "div", attrs: { style: "float:left;" }, children: [{ tag: "h2", attrs: { style: "padding-top: 12px;" }, children: ["="] }] }, { tag: "div", attrs: { class: "col-md-2" }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "label", attrs: { class: "control-label",
                                                                for: "cards_amount" }, children: [Conf.tr('Total amount')] }, { tag: "input", attrs: { class: "vertical-spin form-control",
                                                                name: "cards_sum", id: "cards_sum",
                                                                disabled: "",
                                                                value: ctrl.cards_sum() } }] }] }] }, { tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-md-2" }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "button", attrs: { type: "submit",
                                                                class: "btn btn-primary waves-effect w-md waves-light m-b-5" }, children: [Conf.tr('Create')] }] }] }] }] }] }] }] }] }] }
                });
            }
        };
    }, { "../components/Helpers.js": 4, "../components/Wrapper.js": 6, "../config/Config.js": 7, "../models/Auth.js": 11 }], 15: [function (require, module, exports) {
        var Auth = require('../models/Auth.js');
        var Conf = require('../config/Config.js');

        var Login = module.exports = {
            controller: function controller() {
                var ctrl = this;

                if (Auth.keypair()) {
                    return m.route('/cards');
                }

                this.login = function (e) {
                    e.preventDefault();

                    m.onLoadingStart();
                    Auth.login(e.target.login.value, e.target.password.value).then(function () {
                        m.onLoadingEnd();
                        m.route('/cards');
                    }).catch(function (err) {
                        console.log(err);
                        m.flashError(Conf.tr('Login/password combination is invalid'));
                    });
                };
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { class: "wrapper-page" }, children: [{ tag: "div", attrs: { class: "text-center" }, children: [{ tag: "h1", attrs: { class: "text-primary" }, children: ["SmartMoney"] }, { tag: "div", attrs: { class: "text-muted" }, children: [Conf.tr('Agent dashboard')] }] }, { tag: "form", attrs: { class: "form-horizontal m-t-20", onsubmit: ctrl.login.bind(ctrl) }, children: [{ tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "text", required: "required", placeholder: Conf.tr("Username"),
                                        autocapitalize: "none",
                                        name: "login" } }, { tag: "i", attrs: { class: "md md-account-circle form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group" }, children: [{ tag: "div", attrs: { class: "col-xs-12" }, children: [{ tag: "input", attrs: { class: "form-control", type: "password", required: "required", autocapitalize: "none",
                                        placeholder: Conf.tr("Password"),
                                        name: "password" } }, { tag: "i", attrs: { class: "md md-vpn-key form-control-feedback l-h-34" } }] }] }, { tag: "div", attrs: { class: "form-group m-t-20 text-center" }, children: [{ tag: "button", attrs: { class: "btn btn-inverse btn-lg btn-custom waves-effect w-md waves-light m-b-5",
                                    type: "submit" }, children: [Conf.tr("Log in")] }] }] }] };
            }
        };
    }, { "../config/Config.js": 7, "../models/Auth.js": 11 }], 16: [function (require, module, exports) {}, {}], 17: [function (require, module, exports) {
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
    }, {}], 18: [function (require, module, exports) {
        (function (process) {
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

            // Split a filename into [root, dir, basename, ext], unix version
            // 'root' is just a slash, or nothing.
            var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
            var splitPath = function splitPath(filename) {
                return splitPathRe.exec(filename).slice(1);
            };

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
                var result = splitPath(path),
                    root = result[0],
                    dir = result[1];

                if (!root && !dir) {
                    // No dirname whatsoever
                    return '.';
                }

                if (dir) {
                    // It has a dirname, strip trailing slash
                    dir = dir.substr(0, dir.length - 1);
                }

                return root + dir;
            };

            exports.basename = function (path, ext) {
                var f = splitPath(path)[2];
                // TODO: make this comparison case-insensitive on windows?
                if (ext && f.substr(-1 * ext.length) === ext) {
                    f = f.substr(0, f.length - ext.length);
                }
                return f;
            };

            exports.extname = function (path) {
                return splitPath(path)[3];
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
    }, { "rH1JPG": 19 }], 19: [function (require, module, exports) {
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
    }, {}] }, {}, [9]);