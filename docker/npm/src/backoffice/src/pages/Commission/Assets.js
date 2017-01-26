var Conf     = require('../../config/Config.js'),
    Navbar   = require('../../components/Navbar.js'),
    Footer   = require('../../components/Footer.js'),
    Sidebar  = require('../../components/Sidebar.js'),
    Helpers  = require('../../models/Helpers'),
    Auth     = require('../../models/Auth');

module.exports = {
    controller: function () {
        var ctrl = this;
        if (!Auth.username()) {
            return m.route('/');
        }

        this.flat_fee       = m.prop(0);
        this.percent_fee    = m.prop(0);

        this.getCommissions = function () {
            var asset = new StellarSdk.Asset(Conf.asset, Conf.master_key);
            this.getGlobalAssetCommissions(asset)
                .then(commission => {
                    m.startComputation();
                    ctrl.flat_fee(commission.flat);
                    ctrl.percent_fee(commission.percent);
                    m.endComputation();
                })
                .catch(err => {
                    console.error(err);
                    m.flashError(Conf.tr('Can not get commissions'));
                })
        };

        this.getGlobalAssetCommissions = function (asset) {

            m.startComputation();
            ctrl.flat_fee(0);
            ctrl.percent_fee(0);
            m.endComputation();

            return new Promise(function (resolve, reject) {
                return Conf.horizon.commission()
                    .forAsset(asset)
                    .call()
                    .then(commissions => {

                        var data = {};

                        data.flat    = 0;
                        data.percent = 0;

                        commissions.records.every(function(commission){
                            if (
                                !commission.hasOwnProperty('from') &&
                                !commission.hasOwnProperty('to') &&
                                !commission.hasOwnProperty('from_account_type_i') &&
                                !commission.hasOwnProperty('to_account_type_i')
                            ) {
                                data.flat    = commission.flat_fee;
                                data.percent = commission.percent_fee;

                                return false;
                            }

                            return true;
                        });
                        resolve(data);
                    })
                    .catch(err => {
                        reject(err);
                    })
            });
        };

        this.getCommissions();

        this.saveAssetCommissions = function (e) {
            m.onLoadingStart();
            var opts = {};
            opts.asset = new StellarSdk.Asset(Conf.asset, Conf.master_key);
            var flat    = document.getElementById('flat').value;
            var percent = document.getElementById('percent').value;

            return Helpers.saveCommissionOperation(opts, flat, percent).then(function(){
                m.startComputation();
                ctrl.flat_fee(flat);
                ctrl.percent_fee(percent);
                m.endComputation();
            })

        };

        this.deleteAssetCommission = function (e) {
            m.onLoadingStart();
            var opts = {};
            opts.asset = new StellarSdk.Asset(Conf.asset, Conf.master_key);

            return Helpers.deleteCommissionOperation(opts).then(function(){
                m.startComputation();
                ctrl.flat_fee(0);
                ctrl.percent_fee(0);
                m.endComputation();
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
                        <div>
                            <div class="panel panel-primary panel-border">
                                <div class="panel-heading">
                                    <h3 class="panel-title">{Conf.tr("Manage commissions for EUAH asset")}</h3>
                                </div>
                                <div class="panel-body">
                                    <div class="col-lg-6">
                                        <form class="form-horizontal" role="form" method="post" onsubmit={ctrl.saveAssetCommissions.bind(ctrl)}>
                                            <div>
                                                <div class="form-group">
                                                    <label for="flat" class="col-md-2 control-label">{Conf.tr("Flat fee")}</label>
                                                    <div class="col-md-8">
                                                        <input class="form-control" type="number" min="0" placeholder="0.00" id="flat"
                                                               value={ctrl.flat_fee()} />
                                                    </div>
                                                </div>

                                                <div class="form-group">
                                                    <label for="percent" class="col-md-2 control-label">{Conf.tr("Percent fee")}</label>
                                                    <div class="col-md-8">
                                                        <input class="form-control" type="number" min="0" placeholder="0.00" id="percent"
                                                               value={ctrl.percent_fee()} />
                                                    </div>
                                                </div>

                                                <div class="form-group m-b-0">
                                                    <div class="col-md-offset-2 col-md-10">
                                                        <div class="col-md-8">
                                                            <button type="button" class="btn btn-primary btn-custom waves-effect w-md waves-light m-b-5 m-r-5"
                                                                    onclick={ctrl.saveAssetCommissions.bind(ctrl)}>
                                                                {Conf.tr("Save")}
                                                            </button>
                                                            {(ctrl.flat_fee() || ctrl.percent_fee()) ?
                                                                <button type="button" class="btn btn-danger btn-custom waves-effect w-md waves-light m-b-5 m-r-5"
                                                                        onclick={ctrl.deleteAssetCommission.bind(ctrl)}>
                                                                    {Conf.tr("Delete")}
                                                                </button>
                                                                :
                                                                ''
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {m.component(Footer)}
        </div>
    }
};