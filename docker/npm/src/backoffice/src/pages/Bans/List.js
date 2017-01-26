var Conf        = require('../../config/Config.js'),
    Navbar      = require('../../components/Navbar.js'),
    Footer      = require('../../components/Footer.js'),
    Sidebar     = require('../../components/Sidebar.js'),
    Helpers     = require('../../models/Helpers'),
    Auth        = require('../../models/Auth'),
    Pagination  = require('../../components/Pagination.js');


function draggable(element, isInitialized) {
    if (!isInitialized) {        
        $(element).popover();
    }
}


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
        this.pagination_data = m.prop({func: "getBansList", page: ctrl.page()});
        this.list = m.prop([]);

        this.getStatistics = function () {
            m.onLoadingStart();
            Auth.api().getBansList({limit: ctrl.limit, offset: ctrl.offset})
                .then(function(list) {
                    if (typeof list.items != 'undefined') {
                        m.startComputation();
                        ctrl.list(list.items);
                        ctrl.is_initialized(true);
                        m.endComputation();
                    } else {
                        console.error('Unexpected response');
                        console.error(list);
                    }
                })
                .catch(function(err){
                    console.error(err);
                    m.flashApiError(err);
                })
                .then(function(){
                    m.onLoadingEnd();
                });
        };

        this.getStatistics();

        this.deleteBan = function (ip) {

            swal({
                title: Conf.tr("Delete ban") + '?',
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: Conf.tr("Yes, delete it"),
            })
                .then(function () {
                var form_data = {
                    ip : String(ip),
                    banned_for : 0
                };

                Auth.api().banIp(form_data)
                    .then(function(result){
                        if (typeof result.message != 'undefined' && result.message == 'success') {
                            m.flashSuccess(Conf.tr(result.message));
                        } else {
                            console.error('Unexpected response');
                            console.error(result);
                            m.flashError(Conf.tr(Conf.errors.service_error));
                        }
                    })
                    .then(function(){
                        return ctrl.getStatistics();
                    })
                    .catch(function(error) {
                        console.log(error);
                        m.flashError(Conf.tr(error.message || Conf.errors.service_error));
                    });
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
                        {(ctrl.is_initialized()) ?
                            <div>
                                { ctrl.list().length ?
                                    <div class="panel panel-color panel-primary">
                                        <div class="panel-heading">
                                            <h3 class="panel-title">{Conf.tr('Ip ban list and bad requests statistic')}</h3>
                                        </div>
                                        <div class="panel-body">
                                            <table class="table table-bordered">
                                                <thead>
                                                <tr>
                                                    <th>{Conf.tr('Ip')}</th>
                                                    <th>{Conf.tr('Banned to')}</th>
                                                    <th>{Conf.tr('Missed for minute')} {m("i[class='md md-info']" +
                                                                                            "[data-container='body']" +
                                                                                            "[title='']" +
                                                                                            "[data-toggle='popover']" +
                                                                                            "[data-placement='right']" +
                                                                                            "[data-content='"+Conf.tr("Bad request per minute")+"']" +
                                                                                            "[data-original-title='']", {config: draggable})}</th>
                                                    <th>{Conf.tr('Missed for day')} {m("i[class='md md-info']" +
                                                                                        "[data-container='body']" +
                                                                                        "[title='']" +
                                                                                        "[data-toggle='popover']" +
                                                                                        "[data-placement='right']" +
                                                                                        "[data-content='"+Conf.tr("Bad request per day")+"']" +
                                                                                        "[data-original-title='']", {config: draggable})}</th>
                                                    <th>{Conf.tr("Remove")}</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {
                                                    ctrl.list().map(function (statistic) {
                                                        return <tr>
                                                            <td>{Helpers.long2ip(statistic.ip)}</td>
                                                            <td>{Helpers.getDateFromTimestamp(statistic.banned_to)}</td>
                                                            <td>{statistic.missed_for_minute}</td>
                                                            <td>{statistic.missed_for_day}</td>
                                                            <td class="col-sm-1">
                                                            <button
                                                               class="btn btn-danger btn-custom waves-effect w-md waves-light m-b-5"
                                                               onclick={ctrl.deleteBan.bind(ctrl, Helpers.long2ip(statistic.ip))}
                                                            >{Conf.tr('Remove')}</button>
                                                            </td>
                                                        </tr>
                                                    })
                                                }
                                                </tbody>
                                            </table>
                                            {m.component(Pagination, {pagination: ctrl.pagination_data()})}
                                        </div>
                                    </div>
                                    :
                                    <div class="portlet">
                                        <div class="portlet-heading bg-warning">
                                            <h3 class="portlet-title">
                                                {Conf.tr('Bans not found')}
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
