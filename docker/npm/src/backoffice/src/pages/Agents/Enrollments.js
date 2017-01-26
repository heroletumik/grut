var Conf = require('../../config/Config.js'),
    Navbar = require('../../components/Navbar.js'),
    Footer = require('../../components/Footer.js'),
    Sidebar = require('../../components/Sidebar.js'),
    Helpers   = require('../../models/Helpers'),
    Auth      = require('../../models/Auth'),
    Pagination  = require('../../components/Pagination.js'),
    Session = require('../../models/Session.js');

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
        this.pagination_data = m.prop({func: "getEnrollmentsList", page: ctrl.page()});

        this.enrollments   = m.prop([]);

        this.getEnrollments = function () {
            m.onLoadingStart();
            return Auth.api().getEnrollmentsList({
                    limit: ctrl.limit,
                    offset: ctrl.offset,
                    type: 'agent'
                })
                .then(function(enrollments){
                    if (typeof enrollments.items != 'undefined') {
                        m.startComputation();
                        ctrl.enrollments(enrollments.items);
                        ctrl.is_initialized(true);
                        m.endComputation();
                    } else {
                        console.error('Unexpected response');
                        console.error(enrollments);
                    }
                })
                .catch(function(error) {
                    console.error(error);
                })
                .then(function() {
                    m.onLoadingEnd();
                });
        };

        this.getEnrollments();
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
                            {(ctrl.enrollments().length) ?
                                <div class="panel panel-color panel-primary">
                                    <div class="panel-heading">
                                        <h3 class="panel-title">{Conf.tr('Enrollments')}</h3>
                                    </div>
                                    <div class="panel-body">
                                        <table class="table table-bordered">
                                            <thead>
                                            <tr>
                                                <th>{Conf.tr('Enrollment ID')}</th>
                                                <th>{Conf.tr('Company code')}</th>
                                                <th>{Conf.tr('Agent type')}</th>
                                                <th>{Conf.tr('Show agent data')}</th>
                                                <th>{Conf.tr('Enrollment status')}</th>
                                                <th>{Conf.tr('Approve status')}</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {ctrl.enrollments().map(function (enrollment) {
                                                return <tr
                                                    class={
                                                        enrollment.stage == Conf.enrollment_created ?
                                                            "active"
                                                            :
                                                            enrollment.stage == Conf.enrollment_approved ?
                                                                "success"
                                                                :
                                                                "danger"
                                                    }
                                                >
                                                    <td>
                                                        <span>{enrollment.id}</span>
                                                    </td>
                                                    <td>
                                                        <span title={Conf.tr("Company code")}>{enrollment.company_data.code}</span>
                                                    </td>
                                                    <td>
                                                        <span title={Conf.tr("Agent type")}>{Helpers.getTextAgentType(enrollment.agent_data.type)}</span>
                                                    </td>
                                                    <td>
                                                        {
                                                            enrollment.login ?
                                                                <button
                                                                    class="btn-xs btn-primary waves-effect waves-light"
                                                                    onclick={function(){
                                                                        Session.modal(
                                                                            <table class="table">
                                                                                <tr>
                                                                                    <td>{Conf.tr('Login')}:</td>
                                                                                    <td><code>{enrollment.login}</code></td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td>{Conf.tr('Account ID')}:</td>
                                                                                    <td><code>{enrollment.account_id}</code></td>
                                                                                </tr>
                                                                            </table>
                                                                            , Conf.tr('Agent details'))
                                                                    }}
                                                                >{Conf.tr('Show')}</button>
                                                                :
                                                                Conf.tr("Not created yet")
                                                        }
                                                    </td>
                                                    <td>
                                                        <span title={Conf.tr("Enrollment status")}>{Helpers.getEnrollmentStageStatus(enrollment.stage)}</span>
                                                    </td>
                                                    <td>
                                                            <span title={Conf.tr("Create status")}>
                                                                {
                                                                    enrollment.agent_data.account_id ?
                                                                        Conf.tr("Agent created")
                                                                        :
                                                                        enrollment.stage == Conf.enrollment_approved ?
                                                                            <button class="btn btn-primary btn-xs"
                                                                                    onclick={Helpers.approveEnrollment.bind(ctrl, enrollment.account_id, enrollment.agent_data.type, enrollment.tx_trust, enrollment.id)}
                                                                            >
                                                                                {Conf.tr("Create agent")}
                                                                            </button>
                                                                            :
                                                                            enrollment.stage == Conf.enrollment_declined ?
                                                                                Conf.tr("Agent decline enrollment")
                                                                                :
                                                                                Conf.tr("Wait for enrollment approve")
                                                                }
                                                                </span>
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
                                            {Conf.tr("No enrollments are added yet")}
                                        </h3>
                                        <div class="portlet-widgets">
                                            <span class="divider"></span>
                                            <a href="#" data-toggle="remove"><i class="ion-close-round"></i></a>
                                        </div>
                                        <div class="clearfix"></div>
                                    </div>
                                </div>
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