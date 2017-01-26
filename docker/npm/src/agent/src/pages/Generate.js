var Conf = require('../config/Config.js');
var Wrapper = require('../components/Wrapper.js');
var Helpers = require('../components/Helpers.js');
var Auth = require('../models/Auth.js');

Array.prototype.last = function() {
    return this[this.length-1];
}

module.exports = {
    controller: function () {
        var ctrl = this;

        if (!Auth.keypair()) {
            return m.route('/');
        }

        this.cards_count    = m.prop(1);
        this.cards_amount   = m.prop(1);
        this.cards_sum      = m.prop(this.cards_count() * this.cards_amount());

        this.agent_balances = m.prop([]);
        this.agent_assets   = m.prop([]);

        this.initAgentAssets = function () {

            return Auth.loadAccountById(Auth.keypair().accountId())
                .then(account_data => {
                    m.startComputation();
                    ctrl.agent_assets([]);
                    account_data.balances.map(function(balance) {
                        if (typeof balance.asset_code != 'undefined') {
                            ctrl.agent_assets().push(balance.asset_code);
                        }
                    });
                    m.endComputation();
                })
        };

        this.initAgentBalances = function () {

            return Auth.loadAccountById(Auth.keypair().accountId())
                .then(account_data => {
                    m.startComputation();
                    ctrl.agent_balances([]);
                    account_data.balances.map(function(balance) {
                        if (typeof balance.asset_code != 'undefined') {
                            ctrl.agent_balances().push(balance);
                        }
                    });
                    m.endComputation();
                })
        };

        this.getBalanceByAsset = function (asset_code) {

            var asset_balance = 0;

            ctrl.agent_balances().every(function(balance) {
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
        this.initAgentAssets()
            .then(() => {
                ctrl.initAgentBalances();
            })
            .then(() => {
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

            var amount          = ctrl.cards_amount();
            var asset           = Conf.asset;
            var accounts_data   = {};
            ctrl.initAgentBalances()
                .then(() => {
                    var balance = ctrl.getBalanceByAsset(Conf.asset);
                    if (balance < ctrl.cards_sum()) {
                        return Promise.reject(Conf.tr('Not enough balance'));
                    }

                    return Conf.horizon.loadAccount(Auth.keypair().accountId());
                })
                .then(function (source) {
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
                    tx.sign(Auth.keypair());//StellarSdk.Keypair.fromSeed(Auth.wallet().getKeychainData()));
                    console.log(tx.toEnvelope().toXDR().toString("base64"));
                    //return Conf.horizon.submitTransaction(tx);
                    return Auth.api().createCards({
                        tx: tx.toEnvelope().toXDR().toString("base64"),
                        data: JSON.stringify(accounts_data)
                    });
                })
                .then(function() {
                    return m.flashSuccess(Conf.tr('Success. Cards will be confirmed in few moments'))
                })
                .then(function(){
                    return ctrl.initAgentBalances();
                })
                .catch(error => {
                    console.error(error);
                    if (error && typeof error.name != 'undefined' && error.name == 'ApiError') {
                        return m.flashApiError(error);
                    }
                    return m.flashError(error);
                })
                .then(() => {
                    m.onLoadingEnd();
                })
        };
    },

    view: function (ctrl) {
        return m.component(Wrapper, {
            title: Conf.tr('Cards'),
            subtitle: Conf.tr('This page allows to create prepaid cards that can be distributed physically'),
            tpl: <div class="row">
                    <div class="col-lg-12">
                        <div class="panel panel-border panel-primary">
                            <div class="panel-heading">
                                <h3 class="panel-title">{Conf.tr('Agent balances')}</h3>
                            </div>
                            <div class="panel-body">
                                {
                                    ctrl.agent_balances().map(function (balance) {
                                        return <p>{parseFloat(balance.balance).toFixed(2)+" "+balance.asset_code}</p>
                                    })
                                }
                            </div>
                        </div>
                    </div>
                <div class="col-lg-12">
                    <div class="panel panel-color panel-primary">
                        <div class="panel-heading">
                            <h3 class="panel-title">{Conf.tr('Create new prepaid cards')}</h3>
                        </div>
                        <div class="panel-body">
                            <div id="card_form">
                                <form role="form" onsubmit={ctrl.generateCards.bind(ctrl)}>
                                    <div class="row">
                                        <div class="col-md-2">
                                            <div class="form-group">
                                                <label class="control-label"
                                                       for="cards_count">{Conf.tr('Amount of cards')}</label>
                                                <input class="vertical-spin form-control"
                                                       oninput={ctrl.updateCardsSum.bind(ctrl)}
                                                       min="1" max="100" step="1"
                                                       value={ctrl.cards_count()}
                                                       id="cards_count"
                                                       name="cards_count" type="number"/>
                                            </div>
                                        </div>
                                        <div style="float:left;"><h2 style="padding-top: 17px;">*</h2></div>
                                        <div class="col-md-2">
                                            <div class="form-group">
                                                <label class="control-label"
                                                       for="cards_amount">{Conf.tr('Value of a card')}</label>
                                                <input class="vertical-spin form-control"
                                                       oninput={ctrl.updateCardsSum.bind(ctrl)}
                                                       min="1" max="10000" step="1"
                                                       value={ctrl.cards_amount()}
                                                       id="cards_amount"
                                                       name="cards_amount" type="number"/>
                                            </div>
                                        </div>
                                        <div style="float:left;"><h2 style="padding-top: 12px;">=</h2></div>
                                        <div class="col-md-2">
                                            <div class="form-group">
                                                <label class="control-label"
                                                       for="cards_amount">{Conf.tr('Total amount')}</label>
                                                <input class="vertical-spin form-control"
                                                       name="cards_sum" id="cards_sum"
                                                       disabled=""
                                                       value={ctrl.cards_sum()}/>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-md-2">
                                            <div class="form-group">
                                                <button type="submit"
                                                        class="btn btn-primary waves-effect w-md waves-light m-b-5">
                                                    {Conf.tr('Create')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        });
    }
};
