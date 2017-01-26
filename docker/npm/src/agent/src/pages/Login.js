var Auth = require('../models/Auth.js');
var Conf = require('../config/Config.js');

var Login = module.exports = {
    controller: function () {
        var ctrl = this;

        if (Auth.keypair()) {
            return m.route('/cards');
        }

        this.login = function (e) {
            e.preventDefault();

            m.onLoadingStart();
            Auth.login(e.target.login.value, e.target.password.value)
                .then(function () {
                    m.onLoadingEnd();
                    m.route('/cards');
                })
                .catch(err => {
                    console.log(err);
                    m.flashError(Conf.tr('Login/password combination is invalid'));
                })
        };
    },

    view: function (ctrl) {
        return <div class="wrapper-page">

            <div class="text-center">
                <h1 class="text-primary">SmartMoney</h1>
                <div class="text-muted">{Conf.tr('Agent dashboard')}</div>
            </div>

            <form class="form-horizontal m-t-20" onsubmit={ctrl.login.bind(ctrl)}>

                <div class="form-group">
                    <div class="col-xs-12">
                        <input class="form-control" type="text" required="required" placeholder={Conf.tr("Username")}
                               autocapitalize="none"
                               name="login"/>
                        <i class="md md-account-circle form-control-feedback l-h-34"></i>
                    </div>
                </div>

                <div class="form-group">
                    <div class="col-xs-12">
                        <input class="form-control" type="password" required="required" autocapitalize="none"
                               placeholder={Conf.tr("Password")}
                               name="password"/>
                        <i class="md md-vpn-key form-control-feedback l-h-34"></i>
                    </div>
                </div>

                <div class="form-group m-t-20 text-center">
                    <button class="btn btn-inverse btn-lg btn-custom waves-effect w-md waves-light m-b-5"
                            type="submit">{Conf.tr("Log in")}
                    </button>
                </div>
            </form>
        </div>
    }
};
