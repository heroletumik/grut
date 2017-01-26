var Conf = require('../../config/Config.js'),
    Navbar = require('../../components/Navbar.js'),
    Footer = require('../../components/Footer.js'),
    Sidebar = require('../../components/Sidebar.js'),
    Helpers   = require('../../models/Helpers'),
    Auth      = require('../../models/Auth');

module.exports = {
    controller: function () {
        var ctrl = this;

        if (!Auth.username()) {
            return m.route('/');
        }

        this.gagent_signers = m.prop([]);
        this.gagent_signer_mnenonic = m.prop(false);

        this.getGeneralAgentKeys = function () {
            m.onLoadingStart();
            Helpers.getGeneralAgentKeysList()
                .then(function(gagent_keys) {
                    m.startComputation();
                    ctrl.gagent_signers(gagent_keys);
                    m.endComputation();
                }).catch(function(err){
                console.error(err);
                m.flashError(Conf.tr('Can not get general agent signers list'));
            }).then(function(){
                m.onLoadingEnd();
            });
        };

        this.getGeneralAgentKeys();

        this.generateSigner = function (e) {
            m.onLoadingStart();

            var gagent_keypair = null;
            var g_agent_signer_keypair = null;
            m.getPromptValue(Conf.tr("Enter general agent mnemonic phrase"))
                .then(function (gagent_mnemonic) {
                    gagent_keypair = StellarSdk.Keypair.fromSeed(StellarSdk.getSeedFromMnemonic(gagent_mnemonic));
                    return Conf.horizon.loadAccount(Conf.g_agent_pub);
                })
                .then(function (source) {
                    g_agent_signer_keypair = StellarSdk.Keypair.random();
                    console.log(g_agent_signer_keypair.seed());
                    var tx = new StellarSdk.TransactionBuilder(source)
                        .addOperation(StellarSdk.Operation.setOptions({
                            signer: {
                                pubKey: g_agent_signer_keypair.accountId(),
                                weight: 1,
                                signerType: StellarSdk.xdr.SignerType.signerGeneral().value
                            }
                        }))
                        .build();

                    tx.sign(gagent_keypair);
                    return Conf.horizon.submitTransaction(tx);
                })
                .then(function(){
                    m.startComputation();
                    ctrl.gagent_signer_mnenonic(StellarSdk.getMnemonicFromSeed(g_agent_signer_keypair.seed()));
                    m.endComputation();
                    ctrl.getGeneralAgentKeys();
                    return m.flashSuccess(Conf.tr('General agent signer successful created'));
                })
                .catch(function (e) {
                    console.log(e);
                    m.flashError(typeof e.message == 'string' && e.message.length > 0 ? Conf.tr(e.message) : Conf.tr('Stellar error'));
                });

        };
    },

    view: function (ctrl) {
        return <div id="wrapper">
            {m.component(Navbar)}
            {m.component(Sidebar)}
            <div class="content-page">
                <div class="content">
                    <div class="container">
                        {(ctrl.gagent_signers().length) ?
                            <div class="panel panel-color panel-primary">
                                <div class="panel-heading">
                                    <h3 class="panel-title">{Conf.tr('General agent signers')}</h3>
                                </div>
                                <div class="panel-body">
                                    <table class="table table-bordered">
                                        <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>{Conf.tr('Account')}</th>
                                            <th>{Conf.tr('Actions')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {ctrl.gagent_signers().map(function (gagent_signer_key, index) {
                                            return <tr>
                                                <th scope="row">{index + 1}</th>
                                                <td>
                                                    <span title={gagent_signer_key}>{gagent_signer_key}</span>
                                                </td>
                                                <td>
                                                    <button type="submit" onclick={Helpers.deleteGeneralAgentSigner.bind(ctrl, gagent_signer_key)}
                                                            class="btn btn-danger btn-xs waves-effect waves-light">{Conf.tr('Delete')}</button>
                                                </td>
                                            </tr>
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            :
                            <div class="portlet">
                                <div class="portlet-heading bg-warning">
                                    <h3 class="portlet-title">
                                        {Conf.tr('No general agent signers accounts found')}
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
                        <div class="buttons" id="emission_buttons">
                            <button class="btn btn-default" onclick={ctrl.generateSigner.bind(ctrl)}
                                    id="generate_tx">{Conf.tr('Generate general agent signer')}</button>
                        </div>
                        {
                            ctrl.gagent_signer_mnenonic() ?
                            <div id="emission_form">
                                <h4>{Conf.tr('Please remember mnemonic phrase. It can not be recovery')}</h4>
                                <kbd style="word-break: break-word; display: block;">{ctrl.gagent_signer_mnenonic()}</kbd>
                            </div>
                            :
                            ''
                        }
                    </div>
                </div>
            </div>
            {m.component(Footer)}
        </div>
    }
};