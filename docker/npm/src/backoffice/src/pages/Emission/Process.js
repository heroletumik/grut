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

        this.parseFile = function (result) {
            return new Promise(function(resolve, reject) {
                var bad_file = false;
                try {
                    if (!result) {
                        throw new Error('Bad file');
                    }
                    var data = JSON.parse(result);
                    if (typeof data.operation == 'undefined') {
                        bad_file = true;
                    }
                    if (data.operation != 'emission') {
                        bad_file = true;
                    }
                    if (!data.tx) {
                        bad_file = true;
                    }
                } catch (e) {
                    bad_file = true;
                }
                if (bad_file) {
                    reject("Bad file");
                }
                resolve(data);
            });
        };

        this.generateTx = function (e) {
            e.preventDefault();
            m.onLoadingStart();

            return Conf.horizon.loadAccount(Conf.master_key)
                .then(source => {
                    var tx = new StellarSdk.TransactionBuilder(source)
                        .addOperation(StellarSdk.Operation.payment({
                            destination: Conf.g_agent_pub,
                            amount: parseFloat(e.target.amount.value).toFixed(2).toString(),
                            asset: new StellarSdk.Asset(Conf.asset, Conf.master_key)
                        }))
                        .build();

                    var data = JSON.stringify({
                        tx: tx.toEnvelope().toXDR().toString("base64"),
                        operation: 'emission'
                    });

                    Helpers.download('emission_process.smb', data);
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

        this.uploadTx = function (e) {
            m.onLoadingStart();

            var file = e.target.files[0];
            if (!file) {
                return m.flashError(Conf.tr("Bad file"));
            }

            var reader = new FileReader();
            reader.readAsText(file);

            reader.onload = function (evt) {

                ctrl.parseFile(evt.target.result)
                    .then(function(data){
                        var tx = new StellarSdk.Transaction(data.tx);

                        return Conf.horizon.submitTransaction(tx)
                    })
                    .then(function () {
                        m.flashSuccess(Conf.tr("Emission successful complete"));
                        $(e.target).trigger('reset');
                    })
                    .catch(function (err) {
                        console.error(err);
                        return m.flashError(Conf.tr("Transaction loading error"));
                    })
                    .then(function () {
                        m.onLoadingEnd();
                        $("#upload_tx").replaceWith($("#upload_tx").val('').clone(true));
                    })

            };
            reader.onerror = function (evt) {
                m.flashError(Conf.tr("Error read file"));
            };
        }
    },

    view: function (ctrl) {
        return <div id="wrapper">
            {m.component(Navbar)}
            {m.component(Sidebar)}
            <div class="content-page">
                <div class="content">
                    <div class="container">
                        <div class="panel panel-primary panel-border">
                            <div class="panel-heading">
                                <h3 class="panel-title">{Conf.tr('Emission for general agent')}</h3>
                            </div>
                            <div class="panel-body">
                                <form role="form" onsubmit={ctrl.generateTx.bind(ctrl)}>
                                    <div class="form-group be_relative">
                                        <label>{Conf.tr("Amount")}</label>
                                        <input class="form-control" type="number" required="required" id="emission_amount"
                                               min="0.01"
                                               step="0.01"
                                               name="amount"/>
                                    </div>

                                    <div class="form-group m-t-20">
                                        <button id="make_emission_tx"
                                                class="btn btn-inverse m-r-5">
                                            {Conf.tr('Download tx file')}
                                        </button>

                                        <div class="be_relative" style="display: inline-block;">
                                            <div class="fileUpload btn btn-success"
                                                 onchange={ctrl.uploadTx.bind(ctrl)}
                                            >
                                                <span>{Conf.tr('Upload signed tx')}</span> <input type="file" accept=".smbx" id="load_emission_tx"/>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {m.component(Footer)}
        </div>
    }
};