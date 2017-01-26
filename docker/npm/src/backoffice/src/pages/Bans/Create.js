var Conf    = require('../../config/Config.js'),
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

        this.bans_ip        = m.prop('');
        this.bans_banned_to = m.prop('');
        
        this.clearForm = function () {
            m.startComputation();
            ctrl.bans_ip('');
            ctrl.bans_banned_to('');            
            m.endComputation();
        }

        this.addBan = function (e) {
            e.preventDefault();
            m.onLoadingStart();

            ctrl.bans_ip(String(e.target.ip.value));
            ctrl.bans_banned_to(Number(e.target.banned_for.value));

            var form_data = {                
                ip           : ctrl.bans_ip(),
                banned_for   : ctrl.bans_banned_to()
            };            

            Auth.api().banIp(form_data)
                .then(function(result){
                    if (typeof result.message != 'undefined' && result.message == 'success') {
                        ctrl.clearForm();
                        m.flashSuccess(Conf.tr(result.message));
                    } else {
                        console.error('Unexpected response');
                        console.error(result);
                        m.flashError(Conf.tr(Conf.errors.service_error));
                    }
                })
                .catch(function(error) {
                    console.log(error);
                    m.flashError(Conf.tr(error.message || Conf.errors.service_error));
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
                        <div class="panel panel-primary panel-border">
                            <div class="panel-heading">
                                <h3 class="panel-title">{Conf.tr("Add ip to banlist")}</h3>
                            </div>
                            <div class="panel-body">
                                <div class="col-lg-6">
                                    <form class="form-horizontal" onsubmit={ctrl.addBan.bind(ctrl)}>
                                        <div class="form-group">
                                            <label for="code" class="col-md-2 control-label">{Conf.tr("Ip")}</label>
                                            <div class="col-md-4">
                                                <input class="form-control" 
                                                       name="ip" 
                                                       id="ip"
                                                       placeholder={Conf.tr("User ip")}
                                                       type="text" 
                                                       value="" 
                                                       required="required"/>
                                            </div>                                            
                                        </div>
                                        <div class="form-group">
                                            <label for="code" class="col-md-2 control-label">{Conf.tr("Banned for minutes")}</label>
                                            <div class="col-md-4">
                                                <input class="form-control" 
                                                       name="banned_for" 
                                                       id="banned_for"
                                                       placeholder={Conf.tr("Banned for")}
                                                       type="number" 
                                                       value="" 
                                                       required="required"/> 
                                            </div>
                                        </div>
                                        <div class="form-group m-b-0">
                                            <div class="col-sm-offset-2 col-sm-9">
                                                <button type="submit" class="btn btn-primary btn-custom waves-effect w-md waves-light m-b-5">
                                                {Conf.tr('Add')}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
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