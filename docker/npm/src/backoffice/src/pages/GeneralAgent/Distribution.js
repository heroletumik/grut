var Conf       = require('../../config/Config.js'),
    Navbar     = require('../../components/Navbar.js'),
    Footer     = require('../../components/Footer.js'),
    Auth       = require('../../models/Auth'),
    Helpers   = require('../../models/Helpers'),
    Sidebar    = require('../../components/Sidebar.js');

module.exports = {
    controller: function () {
        var ctrl = this;

        if (!Auth.username()) {
            return m.route('/');
        }

        this.dagent = m.prop('');
        this.amount = m.prop('');

        this.is_initialized = m.prop(false);
        this.g_agent_balance = m.prop(false);

        this.getGeneralAgentBalance = function () {
            Auth.loadAccountById(Conf.g_agent_pub).then(g_agent => {
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
            })
        };

        ctrl.getGeneralAgentBalance();

        this.distribution = function (e) {
            e.preventDefault();
            m.onLoadingStart();

            if (!e.target.account_id || !e.target.amount) {
                return m.flashError(Conf.tr('Fill all required fields'))
            }

            if (!StellarSdk.Keypair.isValidPublicKey(e.target.account_id.value.toString())) {
                return m.flashError(Conf.tr('Check distribution agent account id'))
            }

            //TODO: check amount field

            var gagent_signer_keypair = null;
            var account = e.target.account_id.value;
            var amount  = e.target.amount.value;

            m.getPromptValue(Conf.tr("Enter general agent signer mnemonic phrase"))
                .then(function (gagent_mnemonic) {
                    gagent_signer_keypair = StellarSdk.Keypair.fromSeed(StellarSdk.getSeedFromMnemonic(gagent_mnemonic));
                    return Conf.horizon.loadAccount(Conf.g_agent_pub);
                })
                .then(source => {
                    var tx = new StellarSdk.TransactionBuilder(source)
                        .addOperation(StellarSdk.Operation.payment({
                            destination: account,
                            amount: parseFloat(amount).toFixed(2).toString(),
                            asset: new StellarSdk.Asset(Conf.asset, Conf.master_key)
                        }))
                        .build();

                    tx.sign(StellarSdk.Keypair.fromSeed(gagent_signer_keypair.seed()));

                    return Conf.horizon.submitTransaction(tx);
                })
                .then(function() {
                    m.flashSuccess(Conf.tr('Distribution successful'));
                })
                .catch(err => {
                    console.log(err);
                    m.flashError(Conf.tr('Service Error. Cannot create emission transaction'));
                })
                .then(() => {
                    m.onLoadingEnd();
                    $(e.target).trigger('reset');
                })
        };
    },

    view: function (ctrl) {
        return <div id="wrapper">
            {m.component(Navbar)}
            {m.component(Sidebar)}
            <div class="content-page">
                <div class="content">
                    <div class="container">
                        {(ctrl.is_initialized()) ?
                            <div>
                                <div class="panel panel-primary panel-border">
                                    <div class="panel-heading">
                                        <h3 class="panel-title">{Conf.tr('Transfer to distribution agent')}</h3>
                                    </div>
                                    <div class="panel-body">
                                        <div class="alert alert-info">
                                            {Conf.tr('General agent balance')}: {ctrl.g_agent_balance()} {Conf.asset}
                                        </div>
                                        <form class="form-horizontal" role="form" onsubmit={ctrl.distribution.bind(ctrl)}>
                                            <div class="form-group">
                                                <label for="cmp_code" class="col-md-2 control-label">{Conf.tr("Distribution agent account id")}</label>
                                                <div class="col-md-4">
                                                    <input class="form-control" name="account_id" id="account_id"
                                                           type="text" value={ctrl.dagent()} required="required"/>
                                                </div>
                                            </div>
                                            <div class="form-group">
                                                <label for="cmp_code" class="col-md-2 control-label">{Conf.tr("Amount")}</label>
                                                <div class="col-md-4">
                                                <input class="form-control" type="number" required="required" id="distribution_amount"
                                                       min="0.01"
                                                       step="0.01"
                                                       value={ctrl.amount()}
                                                       name="amount"/>
                                                </div>
                                            </div>
                                            <div class="form-group m-b-0">
                                                <div class="col-sm-offset-2 col-sm-3">
                                                    <button type="submit"
                                                            class="btn btn-primary btn-custom waves-effect w-md waves-light m-b-5">
                                                        Create
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            :
                            <div class="portlet">
                                <div class="portlet-heading bg-primary">
                                    <h3 class="portlet-title">
                                        {Conf.tr('Wait for data loading')}...
                                    </h3>
                                    <div class="portlet-widgets">
                                        <a data-toggle="collapse" data-parent="#accordion1" href="#bg-warning">
                                            <i class="ion-minus-round"></i>
                                        </a>
                                        <span class="divider"></span>
                                        <a href="#" data-toggle="remove"><i class="ion-close-round"></i></a>
                                    </div>
                                    <div class="clearfix"></div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
            {m.component(Footer)}
        </div>
    }
};