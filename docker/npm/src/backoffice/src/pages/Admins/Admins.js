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

        this.admins = [];
        this.admins_data = m.prop([]);

        this.getAdmins = function () {
            m.onLoadingStart();
            Helpers.getAdminsList()
                .then(function(admins) {
                    ctrl.admins = admins;
                    return Auth.api().getAdminsList({
                        account_ids: admins
                    })
                })
                .then(function(data){
                    var formatted_data = [];
                    ctrl.admins.map(function(account_id){
                        formatted_data.push({account_id: account_id})
                    });
                    data.items.map(function(account_data){
                        formatted_data.map(function(admin_data){
                            if ("account_id" in admin_data && account_data.account_id == admin_data.account_id) {
                                admin_data.data = account_data;
                            }
                        })
                    });
                    m.startComputation();
                    ctrl.admins_data(formatted_data);
                    m.endComputation();
                })
                .catch(function(err){
                console.error(err);
                m.flashError(Conf.tr('Can not get admins list'));
            }).then(function(){
                m.onLoadingEnd();
            });
        };

        this.getAdmins();
    },

    view: function (ctrl) {
        return <div id="wrapper">
            {m.component(Navbar)}
            {m.component(Sidebar)}
            <div class="content-page">
                <div class="content">
                    <div class="container">
                        <div class="panel panel-color panel-primary">
                            <div class="panel-heading">
                                <h3 class="panel-title">{Conf.tr('Admins')}</h3>
                            </div>
                            <div class="panel-body">
                                <table class="table table-bordered">
                                    <thead>
                                    <tr>
                                        <th>{Conf.tr('Account ID')}</th>
                                        <th>{Conf.tr('Name')}</th>
                                        <th>{Conf.tr('Position')}</th>
                                        <th>{Conf.tr('Comment')}</th>
                                        <th>{Conf.tr('Actions')}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {ctrl.admins_data().map(function (account_data) {

                                        var additional_data = account_data.data || {};
                                        return <tr>
                                            <td>
                                                <span title={account_data.account_id}>{account_data.account_id}</span>
                                            </td>
                                            <td>
                                                <span>{additional_data.name || Conf.tr('No data yet')}</span>
                                            </td>
                                            <td>
                                                <span>{additional_data.position || Conf.tr('No data yet')}</span>
                                            </td>
                                            <td>
                                                <span>{additional_data.comment || Conf.tr('No data yet')}</span>
                                            </td>
                                            <td>
                                                { account_data.account_id != Auth.keypair().accountId() ?
                                                    <button type="submit"
                                                            onclick={Helpers.deleteMasterSigner.bind(ctrl, account_data.account_id)}
                                                            class="btn btn-danger btn-xs waves-effect waves-light">{Conf.tr('Delete')}</button>
                                                    :
                                                    Conf.tr('Your account')
                                                }
                                            </td>
                                        </tr>
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            {m.component(Footer)}
        </div>
    }
};