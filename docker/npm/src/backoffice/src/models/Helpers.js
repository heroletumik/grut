var Conf = require('../config/Config');
var Auth = require('../models/Auth');

var Helpers = {

    getDateFromTimestamp: function (timestamp) {
        if (timestamp) {
            var pad = "00";
            var a = new Date(timestamp * 1000);
            var year    = a.getFullYear();
            var month   = Number(pad.substring(0, pad.length - a.getMonth().toString().length)    + a.getMonth().toString()) + 1;
            var date    = pad.substring(0, pad.length - a.getDate().toString().length)     + a.getDate().toString();
            var hour    = pad.substring(0, pad.length - a.getHours().toString().length)    + a.getHours().toString();
            var min     = pad.substring(0, pad.length - a.getMinutes().toString().length)  + a.getMinutes().toString();
            var sec     = pad.substring(0, pad.length - a.getSeconds().toString().length)  + a.getSeconds().toString();
            var date_format = date + '.' + month + '.' + year + ' ' + hour + ':' + min + ':' + sec ;
            return date_format;
        } else {
            return '';
        }
    },

    getDateOnlyFromTimestamp: function (timestamp) {

        if (timestamp) {
            var pad = "00";
            var a = new Date(timestamp * 1000);
            var year    = a.getFullYear();
            var month   = Number(pad.substring(0, pad.length - a.getMonth().toString().length)    + a.getMonth().toString()) + 1;
            var date    = pad.substring(0, pad.length - a.getDate().toString().length)     + a.getDate().toString();
            var date_format = date + '.' + month + '.' + year;
            return date_format;
        } else {
            return '';
        }

    },

    getTimeFromSeconds: function (sec) {
        var dt = new Date();
        dt.setTime(sec*1000);
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

    getTextAgentType: function (type) {
        var prefix = 'account';
        var text_type = StellarSdk.xdr.AccountType._byValue.get(type).name;
        text_type = text_type.slice(prefix.length);
        return Conf.tr(text_type);
    },

    getAdminsList: function () {
        var admins = [];
        return new Promise(function (resolve, reject) {
            Conf.horizon.accounts().accountId(Conf.master_key)
                .call()
                .then(function (data) {
                    if (typeof data.signers == 'undefined') {
                        reject('Unexpected response');
                    }
                    data.signers.forEach(function (signer) {
                        if (signer.weight == Conf.roles.admin) {
                            //don't add master account
                            if (signer.signertype > 0 ) {
                                admins.push(signer.public_key);
                            }
                        }
                    });
                    resolve(admins);
                })
                .catch(function (error) {
                    reject(error);
                })
        });
    },
    getEmissionKeysList: function () {
        var emmission_keys = [];
        return new Promise(function (resolve, reject) {
            Conf.horizon.accounts().accountId(Conf.master_key)
                .call()
                .then(function (data) {
                    if (typeof data.signers == 'undefined') {
                        reject('Unexpected response');
                    }
                    data.signers.forEach(function (signer) {
                        if (signer.weight == Conf.roles.emission) {
                            emmission_keys.push(signer.public_key);
                        }
                    });
                    resolve(emmission_keys);
                })
                .catch(function (error) {
                    reject(error);
                })
        });
    },
    getGeneralAgentKeysList: function () {
        var gagent_keys = [];
        return new Promise(function (resolve, reject) {
            Conf.horizon.accounts().accountId(Conf.g_agent_pub)
                .call()
                .then(function (data) {
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
                })
                .catch(function (error) {
                    reject(error);
                })
        });
    },

    deleteMasterSigner: function (account_id, e) {
            m.onLoadingStart();
            var adminKeyPair = null;
            m.getPromptValue(Conf.tr("Enter password"))
                .then(function (pwd) {
                    return StellarWallet.getWallet({
                        server: Conf.keyserver_host + '/v2',
                        username: Auth.username(),
                        password: pwd
                    })
                })
                .then(function (wallet) {
                    adminKeyPair = StellarSdk.Keypair.fromSeed(wallet.getKeychainData());
                    return Conf.horizon.loadAccount(Conf.master_key);
                })
                .then(source => {
                    var tx = new StellarSdk.TransactionBuilder(source)
                        .addOperation(StellarSdk.Operation.setOptions({
                            signer: {
                                pubKey: account_id,
                                weight: 0,
                                signerType: StellarSdk.xdr.SignerType.signerGeneral().value
                            }
                        }))
                        .build();
                    tx.sign(adminKeyPair);
                    return Conf.horizon.submitTransaction(tx);
                })
                .then(function () {
                    $(e.target).closest('tr').fadeOut();
                    m.onLoadingEnd();
                })
                .catch(function (e) {
                    m.flashError(Conf.tr("Cannot delete signer"));
                    console.log(e);
                });
        },

    deleteGeneralAgentSigner: function (account_id, e) {
            m.onLoadingStart();
            var g_agent_keypair = null;
            m.getPromptValue(Conf.tr("Enter mnemonic of general agent"))
                .then(function (mnemonic) {
                    return StellarSdk.Keypair.fromSeed(StellarSdk.getSeedFromMnemonic(mnemonic));
                })
                .then(function (g_agent) {
                    g_agent_keypair = g_agent;
                    return Conf.horizon.loadAccount(g_agent_keypair.accountId());
                })

                .then(source => {
                    var tx = new StellarSdk.TransactionBuilder(source)
                        .addOperation(StellarSdk.Operation.setOptions({
                            signer: {
                                pubKey: account_id,
                                weight: 0,
                                signerType: StellarSdk.xdr.SignerType.signerGeneral().value
                            }
                        }))
                        .build();
                    tx.sign(g_agent_keypair);
                    return Conf.horizon.submitTransaction(tx);
                })
                .then(function () {
                    $(e.target).closest('tr').fadeOut();
                    m.onLoadingEnd();
                })
                .catch(function (e) {
                    m.flashError(Conf.tr("Cannot delete signer"));
                    console.log(e);
                });
        },

    getEnrollmentStageStatus: function (stage_status) {
        return Conf.tr(Conf.enrollments_statuses[stage_status]);
    },
    capitalizeFirstLetter: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    getTextAccountType: function (value) {
        var textAccountType = 'Unknown';
        Conf.account_types.map(function (type) {
            if (type.code == value) {
                textAccountType = type.name;
            }
        });
        return textAccountType;
    },
    getCodeAccountType: function (value) {
        var codeAccountType = -1;
        Conf.account_types.map(function (type) {
            if (type.name == value) {
                codeAccountType = type.code.toString();
            }
        });
        return codeAccountType;
    },
    saveCommissionOperation: function (opts, flat, percent) {

        return Conf.horizon.loadAccount(Conf.master_key)
            .then(function (source) {
                var op = StellarSdk.Operation.setCommission(opts, flat.toString(), percent.toString());
                var tx = new StellarSdk.TransactionBuilder(source).addOperation(op).build();
                tx.sign(Auth.keypair());
                return Conf.horizon.submitTransaction(tx);
            })
            .then(function () {
                m.flashSuccess(Conf.tr("Saved successfully"));
            })
            .catch(err => {
                console.error(err);
                return m.flashError(Conf.tr('Can not save commission'));
            })
    },
    deleteCommissionOperation: function (opts) {

        return Conf.horizon.loadAccount(Conf.master_key)
            .then(function (source) {
                var op = StellarSdk.Operation.deleteCommission(opts);
                var tx = new StellarSdk.TransactionBuilder(source).addOperation(op).build();
                tx.sign(Auth.keypair());
                return Conf.horizon.submitTransaction(tx);
            })
            .then(function () {
                m.flashSuccess(Conf.tr("Deleted successfully"));
            })
            .catch(err => {
                console.error(err);
                return m.flashError(Conf.tr('Can not delete commission'));
            })
    },
    approveEnrollment: function (account_id, account_type, tx_trust, enrollment_id, e) {
            m.onLoadingStart();

            return Conf.horizon.loadAccount(Conf.master_key)
                .then(function (source) {
                    var tx = new StellarSdk.TransactionBuilder(source)
                        .addOperation(StellarSdk.Operation.createAccount({
                            destination: account_id,
                            accountType: account_type
                        }))
                        .build();
                    tx.sign(Auth.keypair());

                    return Conf.horizon.submitTransaction(tx);
                })
                .then(function () {

                    return Conf.horizon.submitTransaction(new StellarSdk.Transaction(tx_trust));
                })
                .then(function () {

                    return Auth.api().enrollmentApprove({id:enrollment_id});
                })
                .then(function (response) {
                    if (typeof response.message != 'undefined' && response.message == 'success') {

                        return m.flashSuccess(Conf.tr(response.message));
                    } else {
                        console.error('Unexpected response');
                        console.error(response);

                        return m.flashError(Conf.tr(Conf.errors.service_error));
                    }
                })
                .catch(function (error) {
                    console.error(error);

                    return m.flashApiError(error);
                })
                .then(function () {
                    m.onLoadingEnd();
                    m.route(m.route());
                });
    },
    encryptData: function (data, password) {
        if (typeof data !== 'string') {
            throw new TypeError('data must be a String.');
        }

        if (typeof password !== 'string') {
            throw new TypeError('password must be a String.');
        }

        var encrypted = sjcl.encrypt(password, data);
        return btoa(encrypted);
    },

    download: function (fileNameToSaveAs, textToWrite) {
        /* Saves a text string as a blob file */
        var ie     = navigator.userAgent.match(/MSIE\s([\d.]+)/),
            ie11   = navigator.userAgent.match(/Trident\/7.0/) && navigator.userAgent.match(/rv:11/),
            ieEDGE = navigator.userAgent.match(/Edge/g),
            ieVer  = (ie ? ie[1] : (ie11 ? 11 : (ieEDGE ? 12 : -1)));

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

    long2ip: function (ip) {
    //   example 1: long2ip( 3221234342 )
    //   returns 1: '192.0.34.166'

    if (!isFinite(ip)) {
        return false
    }

    return [ip >>> 24, ip >>> 16 & 0xFF, ip >>> 8 & 0xFF, ip & 0xFF].join('.')
}

};
module.exports = Helpers;