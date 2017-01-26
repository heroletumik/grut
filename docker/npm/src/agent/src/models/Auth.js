var Conf = require('../config/Config.js');
var Errors = require('../errors/Errors.js');

var Auth = {

    keypair: m.prop(false),
    wallet: m.prop(false),
    username: m.prop(false),
    api: m.prop(false),
    ttl: m.prop(0),
    time_live: m.prop(0),

    loadAccountById: function (id) {
        return Conf.horizon.accounts()
            .accountId(id)
            .call();
    },

    login: function (login, password) {

        var wallet_data = null;

        return StellarWallet.getWallet({
            server: Conf.keyserver_host + '/v2',
            username: login,
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

                Auth.api().initNonce()
                    .then(function(ttl){
                        Auth.ttl(ttl);
                        Auth.time_live(Number(ttl));
                    });

                m.endComputation();
            }
        })
    },

    logout: function () {
        window.location.href = "/";
    },

    destroySession: function () {
        m.startComputation();
        Auth.keypair(null);
        m.endComputation();
        m.route('/');
    },

};

module.exports = Auth;