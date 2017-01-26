var Conf      = require('../../config/Config.js'),
    Navbar    = require('../../components/Navbar.js'),
    Footer    = require('../../components/Footer.js'),
    Sidebar   = require('../../components/Sidebar.js'),
    Limits    = require('../../components/Limits'),
    Restricts = require('../../components/Restricts'),
    Helpers   = require('../../models/Helpers'),
    Auth      = require('../../models/Auth'),
    Pagination  = require('../../components/Pagination.js');

module.exports = {
    controller: function () {
        var ctrl = this;

        if (!Auth.username()) {
            return m.route('/');
        }

        this.is_initialized = m.prop(false);

        this.page = (m.route.param('page')) ? m.prop(Number(m.route.param('page'))) : m.prop(1);
        this.limit = Conf.pagination.limit;
        this.offset = (ctrl.page() - 1) * ctrl.limit;
        this.pagination_data = m.prop({func: "getAgentsList", page: ctrl.page()});

        this.selected_agent   = m.prop(false); // account ID of selected agent for managing
        this.manage_limits    = m.prop(false); // flag for showing form to manage agent's limits
        this.manage_restricts = m.prop(false); // flag for showing form to manage agent's restricts

        this.agents = m.prop([]);

        this.getAgents = function () {
            m.onLoadingStart();
            return Auth.api().getAgentsList({limit: ctrl.limit, offset: ctrl.offset})
                .then(function(agents){
                    if (typeof agents.items != 'undefined') {
                        m.startComputation();
                        ctrl.agents(agents.items);
                        ctrl.is_initialized(true);
                        m.endComputation();
                    } else {
                        console.error('Unexpected response');
                        console.error(agents);
                    }
                })
                .catch(function(error) {
                    console.error(error);
                })
                .then(function() {
                    m.onLoadingEnd();
                });
        };

        ctrl.getAgents();

        this.resetEditForms = function () {
            ctrl.selected_agent(false);
            ctrl.manage_limits(false);
            ctrl.manage_restricts(false);
        }

        this.toggleManageLimits = function (account_id) {
            ctrl.resetEditForms();
            ctrl.selected_agent(account_id);
            ctrl.manage_limits(true);
        };

        this.toggleManageRestricts = function (account_id) {
            ctrl.resetEditForms();
            ctrl.selected_agent(account_id);
            ctrl.manage_restricts(true);
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
                                {(ctrl.agents().length) ?
                                    <div class="panel panel-color panel-primary">
                                        <div class="panel-heading">
                                            <h3 class="panel-title">{Conf.tr('Registered agents')}</h3>
                                        </div>
                                        <div class="panel-body">
                                            <table class="table table-bordered">
                                                <thead>
                                                <tr>
                                                    <th>{Conf.tr("Account ID")}</th>
                                                    <th>{Conf.tr('Agent ID')}</th>
                                                    <th>{Conf.tr('Company CODE')}</th>
                                                    <th>{Conf.tr('Company')}</th>
                                                    <th>{Conf.tr('Agent type')}</th>
                                                    <th>{Conf.tr('Restricts')}</th>
                                                    <th>{Conf.tr('Limits')}</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {ctrl.agents().map(function (agent) {
                                                    return <tr>
                                                        <td>
                                                            {agent.account_id ?
                                                                <span title={agent.account_id}>{agent.account_id.substr(0, 30) + '...'} </span>
                                                            :
                                                                <span>{Conf.tr("Account ID is not approved yet")}</span>
                                                            }
                                                        </td>
                                                        <td>
                                                            <span title={Conf.tr("Agent ID")}>{agent.id}</span>
                                                        </td>
                                                        <td>
                                                            <span title={Conf.tr("Company Code")}>{agent.cmp_code}</span>
                                                        </td>
                                                        <td>
                                                            <span title={Conf.tr("Company")}>{agent.cmp_title}</span>
                                                        </td>
                                                        <td>
                                                            <span title={Conf.tr("Agent type")}>{Helpers.getTextAgentType(agent.type)}</span>
                                                        </td>
                                                        <td style="text-align: center">
                                                            {agent.account_id ?
                                                                <button class="btn btn-primary btn-custom waves-effect waves-light btn-xs manage-restricts"
                                                                        onclick={ctrl.toggleManageRestricts.bind(ctrl, agent.account_id)}>{Conf.tr("Edit")}</button>
                                                                :
                                                                ''
                                                            }
                                                            </td>
                                                        <td>
                                                            {agent.account_id ?
                                                                <button class="btn btn-primary btn-custom waves-effect waves-light btn-xs"
                                                                        onclick={ctrl.toggleManageLimits.bind(ctrl, agent.account_id)}>{Conf.tr("Edit")}</button>
                                                                :
                                                                ''
                                                            }
                                                            </td>
                                                    </tr>
                                                })}
                                                </tbody>
                                            </table>
                                            {m.component(Pagination, {pagination: ctrl.pagination_data()})}
                                        </div>
                                    </div>
                                    :
                                    <div class="portlet">
                                        <div class="portlet-heading bg-warning">
                                            <h3 class="portlet-title">
                                                {Conf.tr('No agents found')}
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
                                                {Conf.tr('Please')}<a href='/agents/create' config={m.route}> {Conf.tr("create")}</a>!
                                            </div>
                                        </div>
                                    </div>
                                }

                                {ctrl.manage_limits() ?
                                    m.component(Limits, ctrl.selected_agent())
                                :
                                    ''
                                }

                                {ctrl.manage_restricts() ?
                                    m.component(Restricts, ctrl.selected_agent())
                                :
                                    ''
                                }
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