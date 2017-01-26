var Conf = require('../config/Config.js');
var Errors = require('../errors/Errors.js');

var Auth = {
    setDefaults: function () {
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

    updateBalances: function (account_id) {

        var assets = [];
        var balances = [];
        var account = null;

        return getAnonymousAssets()
            .then(assets_list => {
                Object.keys(assets_list).map(function (index) {
                    if (assets_list[index].asset_type != 'native') {
                        assets.push({
                            asset: assets_list[index].asset_code
                        });
                    }
                });

                // Use this function instead of load account to gather more data
                return Auth.loadAccountById(account_id);
            })
            .then(source => {

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

            })
            .catch(err => {
                console.log(err);
                //step this err, because user can be not created yet (before first payment)
            })
            .then(function () {

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
            })
    },

    login: function (login, password) {

        m.onLoadingStart();
        var master = null;
        var wallet = null;
        var keypair = null;

        return this.loadAccountById(Conf.master_key)
            .then(function (master_info) {

                master = master_info;

                return StellarWallet.getWallet({
                    server: Conf.keyserver_host + '/v2',
                    username: login,
                    password: password
                });
            })
            .then(function (wallet) {
                var is_admin = false;

                if (typeof master.signers != 'undefined') {
                    master.signers.forEach(function (signer) {
                        if (signer.weight == StellarSdk.xdr.SignerType.signerAdmin().value &&
                            signer.public_key == StellarSdk.Keypair.fromSeed(wallet.getKeychainData()).accountId()) {
                            is_admin = true;
                        }
                    });

                    if (!is_admin) {
                        throw new Error('Login/password combination is invalid');
                    }
                }

                return wallet;
            })
            .then(function (wallet_info) {
                wallet = wallet_info;
                keypair = StellarSdk.Keypair.fromSeed(wallet.getKeychainData());

                m.startComputation();
                Auth.api(new StellarWallet.Api(Conf.api_url, keypair));
                m.endComputation();

                return Auth.api().initNonce();
            })
            .then(function(ttl) {
                m.startComputation();
                Auth.ttl(ttl);
                Auth.time_live(Number(ttl));
                m.endComputation();

                return Auth.api().getAdmin({account_id: keypair.accountId()})
            })
            .then(function (admin) {
                if (admin && admin.name) {
                    m.startComputation();
                    Auth.keypair(keypair);
                    Auth.username(wallet.username);
                    m.endComputation();
                    m.onLoadingEnd()
                } else {
                    return m.flashError(Conf.tr(Conf.errors.service_error));
                }
            })
            .catch(function (err) {
                console.error(err);

                if (err && err.message === 'Record is not found') {
                    swal({
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        html: '<h3>' + Conf.tr("Fill in your name and position") + '</h3>' +
                        '<input id="admin-name" class="swal2-input" placeholder="' + Conf.tr("Your name") + '" autofocus>' +
                        '<input id="admin-position" class="swal2-input" placeholder="' + Conf.tr("Your position") + '">' +
                        '<input id="admin-comment" class="swal2-input" placeholder="' + Conf.tr('Comment') + '">',
                        preConfirm: function () {
                            return new Promise(function (resolve, reject) {
                                var name = document.querySelector('#admin-name').value;
                                var position = document.querySelector('#admin-position').value;
                                var comment = document.querySelector('#admin-comment').value;

                                if (!name || !position || !comment) {
                                    reject(Conf.tr("Please fill in all fields"));
                                }

                                resolve({
                                    name    : name,
                                    position: position,
                                    comment : comment
                                });
                            })
                        }
                    })
                    .then(function (admin) {
                        Auth.api().createAdmin({
                            account_id: keypair.accountId(),
                            name: admin.name,
                            position: admin.position,
                            comment: admin.comment
                        })
                            .then(function (res) {
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
                            })
                            .catch(function(err) {
                                console.error(err);
                                return m.flashApiError(err);
                            });
                    });
                } else {
                    return m.flashError(Conf.tr(Conf.errors.service_error));
                }
            });
    },

    registration: function (login, password) {
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

    logout: function () {
        window.location.href = '/';
    },

    destroySession: function () {
        m.startComputation();
        Auth.keypair(null);
        m.endComputation();
        m.route('/');
    },
    
    updatePassword: function (old_pwd, new_pwd) {
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
        })
    },

    update: function (data) {
        return Auth.wallet().update({
            update: data,
            secretKey: Auth.keypair()._secretKey.toString('base64')
        });
    },

    loadTransactionInfo: function (tid) {
        return Conf.horizon.transactions()
            .transaction(tid)
            .call()
    },

    loadAccountById: function (aid) {
        return Conf.horizon.accounts()
            .accountId(aid)
            .call();
    }
};

function getAnonymousAssets() {

    return m.request({method: "GET", url: Conf.horizon_host + Conf.assets_url})
        .then(response => {
            if (typeof response._embedded == 'undefined' || typeof response._embedded.records == 'undefined') {
                throw new Error(Conf.tr(Errors.assets_empty));
            }

            let assets_list = response._embedded.records;

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