var Conf = require('../config/Config.js');
var Errors = require('../errors/Errors.js');

var Auth = {
    setDefaults: function () {
        this.keypair    = m.prop(false);
        this.type       = m.prop(false);
        this.username   = m.prop(false);
        this.balances   = m.prop([]);
        this.assets     = m.prop([]);
        this.payments   = m.prop([]);
        this.wallet     = m.prop(false);
        this.api        = m.prop(false);
        this.ttl        = m.prop(0);
        this.time_live  = m.prop(0);
    },

    updateBalances: function (account_id) {

        var assets = [];
        var balances = [];
        var account = null;

        return Auth.loadAccountById(account_id)
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
                
                m.startComputation();
                Auth.balances(balances);
                Auth.assets(assets);
                m.endComputation();

                return account;
            })
    },

    login: function (login, password) {

        var master = null;

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

                    if (is_admin) {
                        throw new Error('Login/password combination is invalid');
                    }
                }

                return wallet;
            })
            .then(function (wallet) {
                m.startComputation();
                Auth.wallet(wallet);
                Auth.keypair(StellarSdk.Keypair.fromSeed(wallet.getKeychainData()));
                Auth.username(wallet.username);
                Auth.api(new StellarWallet.Api(Conf.api_host, Auth.keypair()));
                m.endComputation();
                return Auth.api().initNonce();
            })
            .then(function(ttl){
                m.startComputation();
                Auth.ttl(ttl);
                Auth.time_live(Number(ttl));
                m.endComputation();
            });
    },

    mnemonicLogin: function (mnemonic) {
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
            if (seed === null) {throw new Error(Conf.tr("Invalid mnemonic phrase"));}
            Auth.keypair(StellarSdk.Keypair.fromSeed(seed));
            Auth.api(new StellarWallet.Api(Conf.api_host, Auth.keypair()));
            Auth.username(null);
            m.endComputation();
            Auth.api().initNonce()
                .then(function(ttl){
                    m.startComputation();
                    Auth.ttl(ttl);
                    Auth.time_live(Number(ttl));
                    m.endComputation();
                    resolve();
                });
        });
    },

    registration: function (accountKeypair, login, password) {
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
        m.route('/');
        m.endComputation();
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

Auth.setDefaults();

module.exports = Auth;