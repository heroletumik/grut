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
    }, { "fs": 14, "path": 16 }], 3: [function (require, module, exports) {
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
    }, { "events": 15, "inherits": 1 }], 4: [function (require, module, exports) {
        module.exports = {
            controller: function controller() {
                var ctrl = this;
            },

            view: function view(ctrl) {
                return { tag: "footer", attrs: { class: "footer footer-full-width" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-xs-12 text-center" }, children: ["© 2016 made by ", { tag: "a", attrs: { href: "http://atticlab.net" }, children: ["AtticLab"] }] }] }] }] };
            }
        };
    }, {}], 5: [function (require, module, exports) {
        var Conf = require('../config/Config');

        var Helpers = {

            formatAmount: function formatAmount(amount) {
                return parseFloat(parseFloat(amount).toFixed(2));
            },

            buildPaymentsChart: function buildPaymentsChart(array) {

                var handle_array = _.clone(array).reverse();
                var series = [handle_array];
                //smil-animations Chart
                var chart = new Chartist.Line('#smil-left-animations', {
                    labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'],
                    series: series /*[
                                   [12, 9, 7, 8, 5, 4, 6, 2, 3, 3, 4, 6],
                                   [4,  5, 3, 7, 3, 5, 5, 3, 4, 4, 5, 5],
                                   [5,  3, 4, 5, 6, 3, 3, 4, 5, 6, 3, 4],
                                   [3,  4, 5, 6, 7, 6, 4, 5, 6, 7, 6, 3]
                                   ]*/
                }, {
                    low: 0
                });

                // Let's put a sequence number aside so we can use it in the event callbacks
                var seq = 0,
                    delays = 20,
                    durations = 125;

                // Once the chart is fully created we reset the sequence
                chart.on('created', function () {
                    seq = 0;
                });

                // On each drawn element by Chartist we use the Chartist.Svg API to trigger SMIL animations
                chart.on('draw', function (data) {
                    seq++;

                    if (data.type === 'line') {
                        // If the drawn element is a line we do a simple opacity fade in. This could also be achieved using CSS3 animations.
                        data.element.animate({
                            opacity: {
                                // The delay when we like to start the animation
                                begin: seq * delays + 200,
                                // Duration of the animation
                                dur: durations,
                                // The value where the animation should start
                                from: 0,
                                // The value where it should end
                                to: 1
                            }
                        });
                    } else if (data.type === 'label' && data.axis === 'x') {
                        data.element.animate({
                            y: {
                                begin: seq * delays,
                                dur: durations,
                                from: data.y + 100,
                                to: data.y,
                                // We can specify an easing function from Chartist.Svg.Easing
                                easing: 'easeOutQuart'
                            }
                        });
                    } else if (data.type === 'label' && data.axis === 'y') {
                        data.element.animate({
                            x: {
                                begin: seq * delays,
                                dur: durations,
                                from: data.x - 100,
                                to: data.x,
                                easing: 'easeOutQuart'
                            }
                        });
                    } else if (data.type === 'point') {
                        data.element.animate({
                            x1: {
                                begin: seq * delays,
                                dur: durations,
                                from: data.x - 10,
                                to: data.x,
                                easing: 'easeOutQuart'
                            },
                            x2: {
                                begin: seq * delays,
                                dur: durations,
                                from: data.x - 10,
                                to: data.x,
                                easing: 'easeOutQuart'
                            },
                            opacity: {
                                begin: seq * delays,
                                dur: durations,
                                from: 0,
                                to: 1,
                                easing: 'easeOutQuart'
                            }
                        });
                    } else if (data.type === 'grid') {
                        // Using data.axis we get x or y which we can use to construct our animation definition objects
                        var pos1Animation = {
                            begin: seq * delays,
                            dur: durations,
                            from: data[data.axis.units.pos + '1'] - 30,
                            to: data[data.axis.units.pos + '1'],
                            easing: 'easeOutQuart'
                        };

                        var pos2Animation = {
                            begin: seq * delays,
                            dur: durations,
                            from: data[data.axis.units.pos + '2'] - 100,
                            to: data[data.axis.units.pos + '2'],
                            easing: 'easeOutQuart'
                        };

                        var animations = {};
                        animations[data.axis.units.pos + '1'] = pos1Animation;
                        animations[data.axis.units.pos + '2'] = pos2Animation;
                        animations['opacity'] = {
                            begin: seq * delays,
                            dur: durations,
                            from: 0,
                            to: 1,
                            easing: 'easeOutQuart'
                        };

                        data.element.animate(animations);
                    }
                });
            },

            getNormalizeDate: function getNormalizeDate(data, onlytime) {

                var dformat = null;
                var d = new Date(data);

                if (onlytime) {
                    dformat = [d.getHours().padLeft(), d.getMinutes().padLeft(), d.getSeconds().padLeft()].join(':');
                } else {
                    dformat = [d.getDate().padLeft(), (d.getMonth() + 1).padLeft(), d.getFullYear()].join('.') + ' ' + [d.getHours().padLeft(), d.getMinutes().padLeft(), d.getSeconds().padLeft()].join(':');
                }

                return dformat;
            },

            getTextAccountType: function getTextAccountType(type_i) {
                switch (type_i) {
                    case 0:
                        return Conf.tr('Anonymous');
                    case 1:
                        return Conf.tr('Registered user');
                    case 2:
                        return Conf.tr('Merchant');
                    case 3:
                        return Conf.tr('Distribution agent');
                    case 4:
                        return Conf.tr('Settlement agent');
                    case 5:
                        return Conf.tr('Exchange agent');
                    case 6:
                        return Conf.tr('Bank account');
                    case 7:
                        return Conf.tr('Scratch card');
                    case 8:
                        return Conf.tr('Commission account');
                    case 9:
                        return Conf.tr('General agent');
                    default:
                        return Conf.tr('Unknown type');

                }
            }
        };
        module.exports = Helpers;
    }, { "../config/Config": 7 }], 6: [function (require, module, exports) {
        var Conf = require('../config/Config.js');

        module.exports = {

            controller: function controller() {
                var ctrl = this;
            },

            view: function view(ctrl) {
                return { tag: "header", attrs: { id: "topnav" }, children: [{ tag: "div", attrs: { class: "topbar-main" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "logo" }, children: [{ tag: "a", attrs: { href: "/", class: "logo" }, children: [{ tag: "img", attrs: { src: "/assets/images/logo/" + Conf.logo_src, alt: "" } }, { tag: "span", attrs: {}, children: [Conf.tr('Ledger viewer')] }] }] }, { tag: "ul", attrs: { class: "nav navbar-nav navbar-right pull-right" }, children: [{ tag: "div", attrs: { class: "menu-extras" }, children: [{ tag: "div", attrs: { class: "text-right flags" }, children: [{ tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'ua'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/images/ua.png", alt: "UA" } }] }, { tag: "a", attrs: { onclick: Conf.loc.changeLocale.bind(ctrl, 'en'), href: "#" }, children: [{ tag: "img", attrs: { src: "/assets/images/uk.png", alt: "EN" } }] }] }] }] }] }] }] };
            }
        };
    }, { "../config/Config.js": 7 }], 7: [function (require, module, exports) {
        (function (process) {
            var Localize = require('localize');
            var Locales = require('../locales/translations.js');

            var conf = {
                horizon_host: "",
                master_public_key: "",
                stellar_network: "",
                merchant_prefix: 'mo:',
                copyright_link: 'http://atticlab.net'
            };

            conf.limit = 25;

            var resizefunc = [];

            StellarSdk.Network.use(new StellarSdk.Network(conf.stellar_network));
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

            conf.logo_src = conf.loc.userLanguage === 'ua' ? 'logo-white-ua.svg' : 'logo-white.svg';

            var errors = require('../errors/Errors');
            conf.errors = errors;

            Number.prototype.padLeft = function (base, chr) {
                var len = String(base || 10).length - String(this).length + 1;
                return len > 0 ? new Array(len).join(chr || '0') + this : this;
            };

            var Config = module.exports = conf;
        }).call(this, require("rH1JPG"));
    }, { "../errors/Errors": 8, "../locales/translations.js": 10, "localize": 2, "rH1JPG": 17 }], 8: [function (require, module, exports) {
        var errors = {
            account_not_found: 'Account not found',
            service_error: 'Service error. Please, try again'
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
            "/": require('./pages/Home.js'),
            "/account/:account_id": require('./pages/Account.js'),
            "/transaction/:transaction_id": require('./pages/Transaction.js')
        });
    }, { "./config/Config.js": 7, "./pages/Account.js": 11, "./pages/Home.js": 12, "./pages/Transaction.js": 13, "queue": 3 }], 10: [function (require, module, exports) {
        module.exports = {
            "Recent transactions sum": {
                'ru': "Сума останніх транзакцій",
                'ua': "Сума останніх транзакцій"
            },
            "Last transaction time": {
                'ru': "Час останної транзакції",
                'ua': "Час останної транзакції"
            },
            "Max": {
                'ru': "Найбільша",
                'ua': "Найбільша"
            },
            "Average": {
                'ru': "Середня",
                'ua': "Середня"
            },
            "Min": {
                'ru': "Найменьша",
                'ua': "Найменьша"
            },
            "Account id": {
                'ru': "Номер счета",
                'ua': "Номер рахунку"
            },
            "Emissions": {
                'ru': "Ключів емісії",
                'ua': "Ключів емісії"
            },
            "Admins": {
                'ru': "Адміністраторів",
                'ua': "Адміністраторів"
            },
            "Last transactions": {
                'ru': "Останні транзакції",
                'ua': "Останні транзакції"
            },
            "Transaction ID": {
                'ru': "ID транзакції",
                'ua': "ID транзакції"
            },
            "Payments from": {
                'ru': "Відправник",
                'ua': "Відправник"
            },
            "Payments to": {
                'ru': "Отримувач",
                'ua': "Отримувач"
            },
            "Amount": {
                'ru': "Сума",
                'ua': "Сума"
            },
            "Payments": {
                'ru': "Транзакції",
                'ua': "Транзакції"
            },
            "Last received funds amount": {
                'ru': "Сума останніх отриманих коштів",
                'ua': "Сума останніх отриманих коштів"
            },
            "Last spent funds amount": {
                'ru': "Сума останніх витрачених коштів",
                'ua': "Сума останніх витрачених коштів"
            },
            "Account ID": {
                'ru': "Рахунок",
                'ua': "Рахунок"
            },
            "Account type": {
                'ru': "Тип рахунку",
                'ua': "Тип рахунку"
            },
            "Account balance": {
                'ru': "Баланс рахунку",
                'ua': "Баланс рахунку"
            },
            "Anonymous": {
                'ru': "Анонімний",
                'ua': "Анонімний"
            },
            "Registered user": {
                'ru': "Зареєстрований користувач",
                'ua': "Зареєстрований користувач"
            },
            "Merchant": {
                'ru': "Мерчант",
                'ua': "Мерчант"
            },
            "Distribution agent": {
                'ru': "Агент з розповсюдження",
                'ua': "Агент з розповсюдження"
            },
            "Settlement agent": {
                'ru': "Агент з погашення",
                'ua': "Агент з погашення"
            },
            "Exchange agent": {
                'ru': "Агент з обміну",
                'ua': "Агент з обміну"
            },
            "Bank account": {
                'ru': "Банківский рахунок",
                'ua': "Банківский рахунок"
            },
            "Scratch card": {
                'ru': "Скретч-картка",
                'ua': "Скретч-картка"
            },
            "Commission account": {
                'ru': "Комісійний рахунок",
                'ua': "Комісійний рахунок"
            },
            "General agent": {
                'ru': "Генеральний агент",
                'ua': "Генеральний агент"
            },
            "Unknown type": {
                'ru': "Невідомий тип рахунку",
                'ua': "Невідомий тип рахунку"
            },
            "Account information": {
                'ru': "Інформація по рахунку",
                'ua': "Інформація по рахунку"
            },
            "Transaction info": {
                'ru': "Інформація по транзакції",
                'ua': "Інформація по транзакції"
            },
            "Transaction type": {
                'ru': "Тип транзакції",
                'ua': "Тип транзакції"
            },
            "Date of create": {
                'ru': "Дата створення",
                'ua': "Дата створення"
            },
            "Account": {
                'ru': "Рахунок",
                'ua': "Рахунок"
            },
            "Memo": {
                'ru': "Мемо",
                'ua': "Мемо"
            },
            "Operations count": {
                'ru': "Кількість операцій",
                'ua': "Кількість операцій"
            },
            "Information about agents will be hidden": {
                'ru': "Інформація по агентам буде схована",
                'ua': "Інформація по агентам буде схована"
            },
            "Attention": {
                'ru': "Увага",
                'ua': "Увага"
            }

        };
    }, {}], 11: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Navbar = require('../components/Navbar.js'),
            Helpers = require('../components/Helpers.js'),
            Footer = require('../components/Footer.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                this.account_id = m.route.param('account_id');
                this.is_agent = m.prop(false);
                this.account_type = m.prop(false);
                this.payments_data = m.prop([]);
                this.payments_amount = m.prop([]);
                this.total_sum_plus = m.prop(0);
                this.total_sum_minus = m.prop(0);
                this.account_data = m.prop(null);

                this.updatePaymentsStatistic = function () {
                    m.onLoadingStart();
                    return new Promise(function (resolve) {
                        var total_plus = 0;
                        var total_minus = 0;

                        ctrl.payments_data().map(function (payment) {
                            if (payment.to == ctrl.account_id) {
                                total_plus += payment.amount * 1;
                            } else {
                                total_minus += payment.amount * 1;
                            }
                        });

                        m.startComputation();
                        ctrl.total_sum_plus(total_plus);
                        ctrl.total_sum_minus(total_minus);
                        m.endComputation();
                        m.onLoadingEnd();
                        resolve();
                    });
                };

                this.getAccountInfo = function () {
                    m.onLoadingStart();
                    Conf.horizon.accounts().accountId(ctrl.account_id).call().then(function (account_data) {
                        m.startComputation();
                        ctrl.account_data(account_data);
                        switch (account_data.type_i) {
                            case 3:
                            case 4:
                            case 5:
                                ctrl.is_agent(true);
                        }
                        ctrl.account_type(Helpers.getTextAccountType(account_data.type_i));
                        m.endComputation();
                    }).catch(function (err) {
                        console.error(err);
                        m.flashError(Conf.tr('Can not get account info'));
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.getPayments = function () {
                    m.onLoadingStart();
                    return new Promise(function (resolve, reject) {
                        Conf.horizon.payments().forAccount(ctrl.account_id).limit(Conf.limit).order('desc').call().then(function (result) {
                            if (!_.isEmpty(result.records)) {
                                _.each(result.records.reverse(), function (res) {
                                    m.startComputation();

                                    ctrl.payments_data().unshift(res);
                                    ctrl.payments_amount().unshift(res.amount);
                                    while (ctrl.payments_data().length > Conf.limit) {
                                        ctrl.payments_data().pop();
                                        ctrl.payments_amount().pop();
                                    }

                                    m.endComputation();
                                });
                                Helpers.buildPaymentsChart(ctrl.payments_amount());
                            };
                        }).then(function () {
                            Conf.horizon.payments().cursor('now').stream({
                                onmessage: function onmessage(message) {
                                    var res = message.data ? JSON.parse(message.data) : message;

                                    m.startComputation();
                                    ctrl.payments_data().unshift(res);
                                    ctrl.payments_amount().unshift(res.amount);
                                    while (ctrl.payments_data().length > Conf.limit) {
                                        ctrl.payments_data().pop();
                                        ctrl.payments_amount().pop();
                                    }

                                    m.endComputation();

                                    Helpers.buildPaymentsChart(ctrl.payments_amount());
                                    ctrl.updatePaymentsStatistic();
                                },
                                onerror: function onerror(error) {}
                            });
                        }).then(function () {
                            m.onLoadingEnd();
                        }).then(function () {
                            resolve();
                        }).catch(function (err) {
                            console.error(err);
                            reject(err);
                        });
                    });
                };

                this.getPayments().then(ctrl.updatePaymentsStatistic).then(ctrl.getAccountInfo);
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-sm-12 col-lg-6" }, children: [{ tag: "div", attrs: { class: "widget-simple text-center card-box" }, children: [{ tag: "h3", attrs: { class: "text-primary" }, children: [{ tag: "span", attrs: { class: "counter", id: "total_sum_plus" }, children: [ctrl.total_sum_plus()] }, " ₴"] }, { tag: "p", attrs: { class: "text-muted" }, children: [Conf.tr('Last received funds amount')] }] }] }, { tag: "div", attrs: { class: "col-sm-12 col-lg-6" }, children: [{ tag: "div", attrs: { class: "widget-simple text-center card-box" }, children: [{ tag: "h3", attrs: { class: "text-danger" }, children: [{ tag: "span", attrs: { class: "counter", id: "total_sum_minus" }, children: [ctrl.total_sum_minus()] }, " ₴"] }, { tag: "p", attrs: { class: "text-muted" }, children: [Conf.tr('Last spent funds amount')] }] }] }] }, { tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-12" }, children: [{ tag: "div", attrs: { class: "panel panel-default panel-color" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Account information')] }] }, { tag: "div", attrs: { class: "panel-body" }, children: [ctrl.account_data() ? { tag: "div", attrs: {}, children: [ctrl.is_agent() ? { tag: "div", attrs: { class: "alert alert-danger" }, children: [{ tag: "strong", attrs: {}, children: [Conf.tr('Attention'), "!"] }, " ", Conf.tr('Information about agents will be hidden')] } : '', { tag: "p", attrs: {}, children: [Conf.tr('Account ID'), ": ", ctrl.account_id] }, { tag: "p", attrs: {}, children: [Conf.tr('Account type'), ": ", ctrl.account_type()] }, { tag: "p", attrs: {}, children: [Conf.tr('Account balance'), ":", ctrl.account_data().balances.map(function (b) {
                                                                return b.asset_type != 'native' ? { tag: "span", attrs: { class: "label label-success m-l-10" }, children: [parseFloat(b.balance).toFixed(2), " ", b.asset_code] } : '';
                                                            })] }] } : Conf.tr('Loading') + '...'] }] }] }] }, { tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-12 hidden-xs" }, children: [{ tag: "div", attrs: { class: "card-box" }, children: [{ tag: "h4", attrs: { class: "m-t-0 header-title" }, children: [{ tag: "b", attrs: {}, children: [Conf.tr('Last transactions')] }] }, { tag: "div", attrs: { id: "smil-left-animations", class: "ct-chart ct-golden-section" } }] }] }] }, { tag: "div", attrs: { class: "card-box hidden-xs" }, children: [{ tag: "h4", attrs: { class: "m-t-0 header-title" }, children: [Conf.tr('Payments')] }, { tag: "table", attrs: { class: "table table-striped m-0" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Transaction ID')] }, { tag: "th", attrs: {}, children: [Conf.tr('Payments from')] }, { tag: "th", attrs: {}, children: [Conf.tr('Payments to')] }, { tag: "th", attrs: {}, children: [Conf.tr('Amount')] }] }] }, { tag: "tbody", attrs: {}, children: [ctrl.payments_data().map(function (payment) {
                                                    return { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [{ tag: "a", attrs: { href: "/transaction/" + payment._links.transaction.href.split(/[\/ ]+/).pop(), config: m.route }, children: [payment.id] }] }, { tag: "td", attrs: {}, children: [{ tag: "a", attrs: { href: "/account/" + payment.from, config: m.route }, children: [_.trunc(payment.from, { length: 15 })] }] }, { tag: "td", attrs: {}, children: [{ tag: "a", attrs: { href: "/account/" + payment.to, config: m.route }, children: [_.trunc(payment.to, { length: 15 })] }] }, { tag: "td", attrs: {}, children: [{ tag: "div", attrs: { class: "label label-success" }, children: [payment.fee.type_i > 0 ? parseFloat(payment.amount - payment.fee.amount_changed).toFixed(2) + ' + ' + parseFloat(payment.fee.amount_changed).toFixed(2) : parseFloat(payment.amount).toFixed(2), payment.asset_code] }] }] };
                                                })] }] }] }, { tag: "div", attrs: { class: "payments visible-xs" }, children: [ctrl.payments_data().map(function (payment) {
                                            return { tag: "div", attrs: { class: "payment" }, children: [{ tag: "p", attrs: {}, children: [{ tag: "span", attrs: {}, children: [Conf.tr('Payment from'), ": "] }, { tag: "a", attrs: { href: "/account/" + payment.from, config: m.route }, children: [_.trunc(payment.from, { length: 15 })] }] }, { tag: "p", attrs: {}, children: [{ tag: "span", attrs: {}, children: [Conf.tr('Payment to'), ": "] }, { tag: "a", attrs: { href: "/account/" + payment.to, config: m.route }, children: [_.trunc(payment.to, { length: 15 })] }] }, { tag: "hr", attrs: {} }, { tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-xs-7" }, children: [{ tag: "span", attrs: {}, children: [Conf.tr('Transaction id'), ": "] }, { tag: "a", attrs: { href: "/transaction/" + payment._links.transaction.href.split(/[\/ ]+/).pop(), config: m.route }, children: [payment.id] }] }, { tag: "div", attrs: { class: "col-xs-5 text-right" }, children: [{ tag: "span", attrs: { class: "label label-success" }, children: [{ tag: "i", attrs: { class: "fa fa-sign-in fa-fw", "aria-hidden": "true" } }, " ", payment.fee.type_i > 0 ? parseFloat(payment.amount - payment.fee.amount_changed).toFixed(2) + ' + ' + parseFloat(payment.fee.amount_changed).toFixed(2) : parseFloat(payment.amount).toFixed(2), payment.asset_code] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] };
                                        })] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../components/Footer.js": 4, "../components/Helpers.js": 5, "../components/Navbar.js": 6, "../config/Config.js": 7 }], 12: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Navbar = require('../components/Navbar.js'),
            Helpers = require('../components/Helpers.js'),
            Footer = require('../components/Footer.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                this.payments_data = m.prop([]);
                this.payments_amount = m.prop([]);
                this.total_sum = m.prop(0);
                this.last_tx_time = m.prop(0);

                this.max_tx = m.prop(0);
                this.avg_tx = m.prop(0);
                this.min_tx = m.prop(0);

                this.cnt_adm = m.prop(0);
                this.cnt_ems = m.prop(0);

                this.updatePaymentsStatistic = function () {

                    m.onLoadingStart();
                    return new Promise(function (resolve) {

                        var total = 0;
                        var min = 0;
                        var max = 0;

                        ctrl.payments_data().map(function (res, index) {
                            if (index == 0) {
                                min = Helpers.formatAmount(res.amount);
                                max = Helpers.formatAmount(res.amount);
                            }
                            total += Helpers.formatAmount(res.amount);
                            if (res.amount < min) {
                                min = Helpers.formatAmount(res.amount);
                            }
                            if (res.amount > max) {
                                max = Helpers.formatAmount(res.amount);
                            }
                        });

                        m.startComputation();
                        ctrl.total_sum(Helpers.formatAmount(total));
                        ctrl.max_tx(Helpers.formatAmount(max));
                        ctrl.min_tx(Helpers.formatAmount(min));
                        ctrl.avg_tx(Helpers.formatAmount(Math.floor(total / ctrl.payments_data().length)));
                        m.endComputation();

                        m.onLoadingEnd();
                        resolve();
                    });
                };

                this.updateSignersStatistic = function () {
                    m.onLoadingStart();
                    //get master signers
                    return Conf.horizon.accounts().accountId(Conf.master_public_key).call().then(function (source) {

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

                        m.startComputation();
                        ctrl.cnt_adm(cnt_adm);
                        ctrl.cnt_ems(cnt_ems);
                        m.endComputation();
                    }).then(function () {
                        m.onLoadingEnd();
                    }).catch(function (err) {
                        console.error(err);
                    });
                };

                this.getPayments = function () {
                    m.onLoadingStart();

                    return new Promise(function (resolve, reject) {
                        Conf.horizon.payments().limit(Conf.limit).order('desc').call().then(function (result) {
                            if (!_.isEmpty(result.records)) {
                                _.each(result.records.reverse(), function (res, key) {
                                    m.startComputation();
                                    if (key + 1 == result.records.length) {
                                        ctrl.last_tx_time(Helpers.getNormalizeDate(res.closed_at, true));
                                    }

                                    ctrl.payments_data().unshift(res);
                                    ctrl.payments_amount().unshift(Helpers.formatAmount(res.amount));
                                    while (ctrl.payments_data().length > Conf.limit) {
                                        ctrl.payments_data().pop();
                                        ctrl.payments_amount().pop();
                                    }
                                    m.endComputation();
                                });
                                Helpers.buildPaymentsChart(ctrl.payments_amount());
                            };
                            resolve();
                        }).then(function () {
                            return Conf.horizon.payments().cursor('now').stream({
                                onmessage: function onmessage(message) {
                                    var res = message.data ? JSON.parse(message.data) : message;

                                    m.startComputation();
                                    ctrl.payments_data().unshift(res);
                                    ctrl.payments_amount().unshift(Helpers.formatAmount(res.amount));
                                    while (ctrl.payments_data().length > Conf.limit) {
                                        ctrl.payments_data().pop();
                                        ctrl.payments_amount().pop();
                                    }
                                    ctrl.last_tx_time(Helpers.getNormalizeDate(res.closed_at, true));
                                    m.endComputation();

                                    Helpers.buildPaymentsChart(ctrl.payments_amount());
                                    ctrl.updatePaymentsStatistic();
                                },
                                onerror: function onerror(error) {}
                            });
                        }).then(function () {
                            m.onLoadingEnd();
                        }).catch(function (err) {
                            console.error(err);
                            reject(err);
                        });
                    });
                };

                this.getPayments().then(ctrl.updateSignersStatistic).then(ctrl.updatePaymentsStatistic);
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-xs-12 col-md-6 col-lg-4" }, children: [{ tag: "div", attrs: { class: "widget-simple text-center card-box" }, children: [{ tag: "div", attrs: { class: "col-lg-6 be2in1" }, children: [{ tag: "h3", attrs: { class: "text-primary" }, children: [{ tag: "span", attrs: { class: "counter", id: "total_sum" }, children: [ctrl.total_sum()] }, " ₴"] }, { tag: "p", attrs: { class: "text-muted" }, children: [Conf.tr('Recent transactions sum')] }] }, { tag: "div", attrs: { class: "col-lg-6 be2in1" }, children: [{ tag: "h3", attrs: { class: "text-primary" }, children: [{ tag: "span", attrs: { id: "last_tx_time" }, children: [ctrl.last_tx_time()] }] }, { tag: "p", attrs: { class: "text-muted" }, children: [Conf.tr('Last transaction time')] }] }] }] }, { tag: "div", attrs: { class: "col-xs-12 col-md-6 col-lg-4" }, children: [{ tag: "div", attrs: { class: "widget-simple text-center card-box padd_10" }, children: [{ tag: "div", attrs: { class: "col-lg-4 be3in1" }, children: [{ tag: "h3", attrs: { class: "text-primary" }, children: [{ tag: "span", attrs: { class: "counter", id: "max_tx" }, children: [ctrl.max_tx()] }, " ₴"] }, { tag: "p", attrs: { class: "text-muted" }, children: [Conf.tr('Max')] }] }, { tag: "div", attrs: { class: "col-lg-4 be3in1" }, children: [{ tag: "h3", attrs: { class: "text-primary" }, children: [{ tag: "span", attrs: { class: "counter", id: "avg_tx" }, children: [ctrl.avg_tx()] }, " ₴"] }, { tag: "p", attrs: { class: "text-muted" }, children: [Conf.tr('Average')] }] }, { tag: "div", attrs: { class: "col-lg-4 be3in1" }, children: [{ tag: "h3", attrs: { class: "text-primary" }, children: [{ tag: "span", attrs: { class: "counter", id: "min_tx" }, children: [ctrl.min_tx()] }, " ₴"] }, { tag: "p", attrs: { class: "text-muted" }, children: [Conf.tr('Min')] }] }] }] }, { tag: "div", attrs: { class: "col-xs-12 col-md-12 col-lg-4" }, children: [{ tag: "div", attrs: { class: "widget-simple text-center card-box" }, children: [{ tag: "div", attrs: { class: "col-lg-6 be2in1" }, children: [{ tag: "h3", attrs: { class: "text-primary" }, children: [{ tag: "span", attrs: { class: "counter", id: "cnt_adm" }, children: [ctrl.cnt_adm()] }] }, { tag: "p", attrs: { class: "text-muted" }, children: [Conf.tr('Admins')] }] }, { tag: "div", attrs: { class: "col-lg-6 be2in1" }, children: [{ tag: "h3", attrs: { class: "text-primary" }, children: [{ tag: "span", attrs: { class: "counter", id: "cnt_ems" }, children: [ctrl.cnt_ems()] }] }, { tag: "p", attrs: { class: "text-muted" }, children: [Conf.tr('Emissions')] }] }] }] }, { tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-12 hidden-xs" }, children: [{ tag: "div", attrs: { class: "card-box" }, children: [{ tag: "h4", attrs: { class: "m-t-0 header-title" }, children: [{ tag: "b", attrs: {}, children: [Conf.tr('Last transactions')] }] }, { tag: "div", attrs: { id: "smil-left-animations", class: "ct-chart ct-golden-section" } }] }] }] }, { tag: "div", attrs: { class: "card-box hidden-xs" }, children: [{ tag: "h4", attrs: { class: "m-t-0 header-title" }, children: [Conf.tr('Payments')] }, { tag: "table", attrs: { class: "table table-striped m-0" }, children: [{ tag: "thead", attrs: {}, children: [{ tag: "tr", attrs: {}, children: [{ tag: "th", attrs: {}, children: [Conf.tr('Transaction ID')] }, { tag: "th", attrs: {}, children: [Conf.tr('Payments from')] }, { tag: "th", attrs: {}, children: [Conf.tr('Payments to')] }, { tag: "th", attrs: {}, children: [Conf.tr('Amount')] }] }] }, { tag: "tbody", attrs: {}, children: [ctrl.payments_data().map(function (payment) {
                                                    return { tag: "tr", attrs: {}, children: [{ tag: "td", attrs: {}, children: [{ tag: "a", attrs: { href: "/transaction/" + payment._links.transaction.href.split(/[\/ ]+/).pop(), config: m.route }, children: [payment.id] }] }, { tag: "td", attrs: {}, children: [{ tag: "a", attrs: { href: "/account/" + payment.from, config: m.route }, children: [_.trunc(payment.from, { length: 15 })] }] }, { tag: "td", attrs: {}, children: [{ tag: "a", attrs: { href: "/account/" + payment.to, config: m.route }, children: [_.trunc(payment.to, { length: 15 })] }] }, { tag: "td", attrs: {}, children: [{ tag: "div", attrs: { class: "label label-success" }, children: [payment.fee.type_i > 0 ? parseFloat(payment.amount - payment.fee.amount_changed).toFixed(2) + ' + ' + parseFloat(payment.fee.amount_changed).toFixed(2) : parseFloat(payment.amount).toFixed(2), payment.asset_code] }] }] };
                                                })] }] }] }, { tag: "div", attrs: { class: "payments visible-xs" }, children: [ctrl.payments_data().map(function (payment) {
                                            return { tag: "div", attrs: { class: "payment" }, children: [{ tag: "p", attrs: {}, children: [{ tag: "span", attrs: {}, children: [Conf.tr('Payment from'), ": "] }, { tag: "a", attrs: { href: "/account/" + payment.from, config: m.route }, children: [_.trunc(payment.from, { length: 15 })] }] }, { tag: "p", attrs: {}, children: [{ tag: "span", attrs: {}, children: [Conf.tr('Payment to'), ": "] }, { tag: "a", attrs: { href: "/account/" + payment.to, config: m.route }, children: [_.trunc(payment.to, { length: 15 })] }] }, { tag: "hr", attrs: {} }, { tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-xs-7" }, children: [{ tag: "span", attrs: {}, children: [Conf.tr('Transaction id'), ": "] }, { tag: "a", attrs: { href: "/transaction/" + payment._links.transaction.href.split(/[\/ ]+/).pop(), config: m.route }, children: [payment.id] }] }, { tag: "div", attrs: { class: "col-xs-5 text-right" }, children: [{ tag: "span", attrs: { class: "label label-success" }, children: [{ tag: "i", attrs: { class: "fa fa-sign-in fa-fw", "aria-hidden": "true" } }, " ", payment.fee.type_i > 0 ? parseFloat(payment.amount - payment.fee.amount_changed).toFixed(2) + ' + ' + parseFloat(payment.fee.amount_changed).toFixed(2) : parseFloat(payment.amount).toFixed(2), payment.asset_code] }] }, { tag: "div", attrs: { class: "clearfix" } }] }] };
                                        })] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../components/Footer.js": 4, "../components/Helpers.js": 5, "../components/Navbar.js": 6, "../config/Config.js": 7 }], 13: [function (require, module, exports) {
        var Conf = require('../config/Config.js'),
            Navbar = require('../components/Navbar.js'),
            Helpers = require('../components/Helpers.js'),
            Footer = require('../components/Footer.js');

        module.exports = {
            controller: function controller() {
                var ctrl = this;

                this.tx_id = m.route.param('transaction_id');
                this.tx_data = m.prop(null);
                this.tx_type = m.prop(null);
                this.tx_label = m.prop(null);
                this.account_data = m.prop(null);
                this.account_type = m.prop(null);

                this.getTxInfo = function () {
                    m.onLoadingStart();
                    Conf.horizon.transactions().transaction(ctrl.tx_id).call().then(function (transaction) {
                        m.startComputation();
                        ctrl.tx_data(transaction);

                        switch (transaction.memo) {

                            case 'card_creation':
                                ctrl.tx_type(Conf.tr('Card creation'));
                                ctrl.tx_label('success');
                                break;

                            case 'funding_card':
                                ctrl.tx_type(Conf.tr('Funding card'));
                                ctrl.tx_label('purple');
                                break;

                            case 'by_invoice':
                                ctrl.tx_type(Conf.tr('By invoice'));
                                ctrl.tx_label('warning');
                                break;
                            default:
                                ctrl.tx_type(Conf.tr('Regular'));
                                ctrl.tx_label('primary');
                        }

                        if (Conf.merchant_prefix && typeof transaction.memo != 'undefined' && transaction.memo.substring(0, Conf.merchant_prefix.length) == Conf.merchant_prefix) {
                            ctrl.tx_type(Conf.tr('Merchant'));
                            ctrl.tx_label('warning');
                        }
                        m.endComputation();

                        return Conf.horizon.accounts().accountId(transaction.source_account).call();
                    }).then(function (account) {
                        m.startComputation();
                        ctrl.account_data(account);
                        ctrl.account_type(Helpers.getTextAccountType(account.type_i));
                        m.endComputation();
                    }).catch(function (err) {
                        console.log(err);
                    }).then(function () {
                        m.onLoadingEnd();
                    });
                };

                this.getTxInfo();
            },

            view: function view(ctrl) {
                return { tag: "div", attrs: { id: "wrapper" }, children: [m.component(Navbar), { tag: "div", attrs: { class: "content-page" }, children: [{ tag: "div", attrs: { class: "wrapper" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-12" }, children: [{ tag: "div", attrs: { class: "panel panel-default panel-color" }, children: [{ tag: "div", attrs: { class: "panel-heading" }, children: [{ tag: "h3", attrs: { class: "panel-title" }, children: [Conf.tr('Transaction info')] }] }, ctrl.account_data() ? { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "user-box" }, children: [{ tag: "img", attrs: { src: "/assets/images/users/" + ctrl.account_data().type_i + ".png", width: "70" } }, { tag: "div", attrs: {}, children: [{ tag: "p", attrs: {}, children: [ctrl.account_type()] }] }] }] } : Conf.tr('Loading') + '...', ctrl.tx_data() ? { tag: "div", attrs: { class: "panel-body" }, children: [{ tag: "div", attrs: { class: "container" }, children: [{ tag: "div", attrs: { class: "row" }, children: [{ tag: "div", attrs: { class: "col-lg-2 wrp-tb-tr" }, children: [{ tag: "div", attrs: {}, children: [Conf.tr('Transaction type'), ":", { tag: "div", attrs: {}, children: [{ tag: "span", attrs: {}, children: [{ tag: "label", attrs: { class: "label label-" + ctrl.tx_label() }, children: [ctrl.tx_type()] }] }] }] }] }, { tag: "div", attrs: { class: "col-lg-2 wrp-tb-tr" }, children: [{ tag: "div", attrs: {}, children: [Conf.tr('Date of create'), ":"] }, { tag: "div", attrs: {}, children: [Helpers.getNormalizeDate(ctrl.tx_data().created_at)] }] }, { tag: "div", attrs: { class: "col-lg-2 wrp-tb-tr" }, children: [{ tag: "div", attrs: {}, children: [Conf.tr('Account'), ":"] }, { tag: "div", attrs: { class: "acc_overflow" }, children: [ctrl.tx_data().source_account] }] }, { tag: "div", attrs: { class: "col-lg-2 wrp-tb-tr" }, children: [{ tag: "div", attrs: {}, children: [Conf.tr('Memo'), ": "] }, { tag: "div", attrs: {}, children: [ctrl.tx_data().memo] }] }, { tag: "div", attrs: { class: "col-lg-2 wrp-tb-tr" }, children: [{ tag: "div", attrs: {}, children: [Conf.tr('Operations count'), ":"] }, { tag: "div", attrs: {}, children: [ctrl.tx_data().operation_count] }] }, { tag: "div", attrs: { class: "col-lg-2 wrp-tb-tr" }, children: [{ tag: "div", attrs: {}, children: [Conf.tr('Transaction ID'), ":"] }, { tag: "div", attrs: { class: "acc_overflow" }, children: [ctrl.tx_data().id] }] }] }] }] } : Conf.tr('Loading') + '...'] }] }] }] }] }] }, m.component(Footer)] };
            }
        };
    }, { "../components/Footer.js": 4, "../components/Helpers.js": 5, "../components/Navbar.js": 6, "../config/Config.js": 7 }], 14: [function (require, module, exports) {}, {}], 15: [function (require, module, exports) {
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
    }, {}], 16: [function (require, module, exports) {
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
    }, { "rH1JPG": 17 }], 17: [function (require, module, exports) {
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