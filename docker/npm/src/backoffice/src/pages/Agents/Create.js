var Conf = require('../../config/Config.js'),
    Navbar  = require('../../components/Navbar.js'),
    Footer  = require('../../components/Footer.js'),
    Sidebar = require('../../components/Sidebar.js'),
    Auth    = require('../../models/Auth');

module.exports = {
    controller: function () {
        var ctrl = this;

        if (!Auth.username()) {
            return m.route('/');
        }

        this.companies = m.prop([]);

        this.getCompanies = function () {
            m.onLoadingStart();
            Auth.api().getCompaniesList()
                .then(function(companies){
                    if (typeof companies.items != 'undefined') {
                        if (companies.items.length > 0) {
                            m.startComputation();
                            ctrl.companies(companies.items);
                            m.endComputation();
                        }
                    } else {
                        console.error('Unexpected response');
                        console.error(companies);
                    }
                })
                .catch(function(error) {
                    console.error(error);
                })
                .then(function() {
                    m.onLoadingEnd();
                });
        };

        this.getCompanies();

        this.createAgent = function (e) {
            e.preventDefault();

            m.onLoadingStart();

            var form_data = {
                company_code : e.target.cmp_code.value,
                type         : parseInt(e.target.type.value),
                asset        : Conf.asset
            };

            Auth.api().createAgent(form_data)
                .then(function(result){
                    if (typeof result.message != 'undefined' && result.message == 'success') {
                        m.flashSuccess(Conf.tr('Success') + '. ' + Conf.tr('Enrollment was sent to email'));
                    } else {
                        console.error('Unexpected response');
                        console.error(result);
                        m.flashError(Conf.tr(Conf.errors.service_error));
                    }
                })
                .catch(function(error) {
                    console.error(error);
                    m.flashApiError(error);
                });

        }

    },

    view: function (ctrl) {
        return <div id="wrapper">
            {m.component(Navbar)}
            {m.component(Sidebar)}
            <div class="content-page">
                <div class="content">
                    <div class="container">
                        {(ctrl.companies().length) ?
                            <div class="panel panel-primary panel-border">
                                <div class="panel-heading">
                                    <h3 class="panel-title">{Conf.tr("Create new agent")}</h3>
                                </div>
                                <div class="panel-body">
                                    <div class="col-lg-6">
                                        <form class="form-horizontal" onsubmit={ctrl.createAgent.bind(ctrl)}>
                                            <div class="form-group">
                                                <label for="select"
                                                       class="col-lg-2 control-label">{Conf.tr("Company")}</label>
                                                <div class="col-lg-6">
                                                    <select class="form-control" name="cmp_code">
                                                        {ctrl.companies().map(function (company) {
                                                            return <option value={company.code}>{company.title}</option>
                                                        })}
                                                    </select>
                                                </div>
                                            </div>

                                            <div class="form-group">
                                                <label for="select"
                                                       class="col-lg-2 control-label">{Conf.tr("Type")}</label>
                                                <div class="col-lg-6">
                                                    <select class="form-control" name="type"
                                                            id="type">
                                                        <option
                                                            value={StellarSdk.xdr.AccountType.accountMerchant().value}>{Conf.tr("Merchant")}</option>
                                                        <option
                                                            value={StellarSdk.xdr.AccountType.accountDistributionAgent().value}>{Conf.tr("Distrubution")}</option>
                                                        <option
                                                            value={StellarSdk.xdr.AccountType.accountSettlementAgent().value}>{Conf.tr("Settlement")}</option>
                                                        <option
                                                            value={StellarSdk.xdr.AccountType.accountExchangeAgent().value}>{Conf.tr("Exchange")}</option>
                                                    </select>
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
                            <div>
                                {(!ctrl.companies().length) ?
                                    <div class="portlet">
                                        <div class="portlet-heading bg-warning">
                                            <h3 class="portlet-title">
                                                {Conf.tr('No companies found')}
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
                                        <div id="bg-warning" class="panel-collapse collapse in">
                                            <div class="portlet-body">
                                                {Conf.tr('Please')}<a href='/companies/create' config={m.route}> {Conf.tr("create")}</a>!
                                            </div>
                                        </div>
                                    </div>
                                    :
                                    ''
                                }
                            </div>
                        }
                    </div>
                </div>
            </div>
            {m.component(Footer)}
        </div>
    }
};