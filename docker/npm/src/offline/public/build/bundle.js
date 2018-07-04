"use strict";

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
    }, {}], 2: [function (require, module, exports) {
        (function (process) {
            StellarSdk.Network.use(new StellarSdk.Network(""));

            window.getPromptValue = function (label, message) {
                return new Promise(function (resolve, reject) {
                    jPrompt(message, '', label, locale.js_button_ok, locale.js_button_cancel, function (result) {
                        resolve(result);
                    });
                });
            };

            window.uploadFile = function (file) {
                var reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                reader.fileName = file.name;
                reader.onload = function (evt) {
                    if (evt.target.result) {
                        var data = JSON.parse(evt.target.result);
                        if (typeof data.operation != 'undefined') {
                            var tx = new StellarSdk.Transaction(data.tx);
                            if (data.operation == 'emission') {
                                if (data.tx) {
                                    getPromptValue(locale.js_message, locale.js_enter_em_mnemonic).then(function (emission_mnemonic) {
                                        if (typeof emission_mnemonic == 'string' && emission_mnemonic.length > 0) {
                                            var emission = StellarSdk.Keypair.fromSeed(StellarSdk.getSeedFromMnemonic(emission_mnemonic));
                                            tx.sign(emission);
                                            data.tx = tx.toEnvelope().toXDR().toString("base64");
                                            var fileName = typeof evt.target.fileName === 'undefined' ? 'signed_emission.smb' : evt.target.fileName;
                                            download('signed_' + fileName + 'x', JSON.stringify(data));
                                        }
                                        clearDropzone();
                                    }).catch(function (e) {
                                        console.error(e);
                                        return flashAlert(locale.js_cannot_decrypt + ': ' + locale.js_wrong_password, 'error');
                                    });
                                } else {
                                    return flashAlert(locale.dictInvalidFileType, 'error');
                                }
                            } else {
                                if (data.tx && data.account && data.seed) {
                                    getPromptValue(locale.js_message, locale.js_enter_master_mnemonic).then(function (master_mnemonic) {
                                        if (typeof master_mnemonic == 'string' && master_mnemonic.length > 0) {
                                            var master = StellarSdk.Keypair.fromSeed(StellarSdk.getSeedFromMnemonic(master_mnemonic));
                                            tx.sign(master);
                                            data.tx = tx.toEnvelope().toXDR().toString("base64");
                                            var fileName = typeof evt.target.fileName === 'undefined' ? 'signed_transaction.smb' : evt.target.fileName;
                                            download('signed_' + fileName + 'x', JSON.stringify(data));
                                        }
                                        clearDropzone();
                                    }).catch(function (e) {
                                        console.error(e);
                                        return flashAlert(locale.js_cannot_decrypt + ': ' + locale.js_wrong_password, 'error');
                                    });
                                } else {
                                    return flashAlert(locale.dictInvalidFileType, 'error');
                                }
                            }
                        } else {
                            return flashAlert(locale.dictInvalidFileType, 'error');
                        }
                    }
                };
                reader.onerror = function (evt) {
                    alert('Error reading file');
                };
            };

            window.download = function (fileNameToSaveAs, textToWrite) {
                /* Saves a text string as a blob file*/
                var ie = navigator.userAgent.match(/MSIE\s([\d.]+)/),
                    ie11 = navigator.userAgent.match(/Trident\/7.0/) && navigator.userAgent.match(/rv:11/),
                    ieEDGE = navigator.userAgent.match(/Edge/g),
                    ieVer = ie ? ie[1] : ie11 ? 11 : ieEDGE ? 12 : -1;

                if (ie && ieVer < 10) {
                    return console.log("No blobs on IE ver<10");
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
                        alert(locale.js_safari_download_message);
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
            };

            window.clearDropzone = function () {
                Dropzone.forElement(".dropzone").removeAllFiles(true);
            };

            window.flashAlert = function (msg, cls) {
                if (typeof cls == 'undefined') {
                    cls = 'info';
                }

                $.Notification.notify(cls, 'top right', locale.js_message, msg);
                Dropzone.forElement(".dropzone").removeAllFiles(true);
            };
        }).call(this, require("rH1JPG"));
    }, { "rH1JPG": 1 }] }, {}, [2]);