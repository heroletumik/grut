var Conf = require('../config/Config.js'),
    Auth = require('../models/Auth.js'),
    Footer = require('../components/FooterFullWidth.js');

var Login = module.exports = {
    controller: function () {
        var ctrl = this;

        if (Auth.keypair()) {
            return m.route('/stores');
        }

        this.login = function (e) {
            e.preventDefault();

            m.onLoadingStart();
            Auth.login(e.target.login.value, e.target.password.value)
                .then(function () {
                    m.onLoadingEnd();
                    m.route('/stores');
                })
                .catch(err => {
                    console.error(err);
                    m.flashError(Conf.tr('Login/password combination is invalid'));
                })
        };
    },

    view: function (ctrl) {
        return <div>
            <div class="text-right languages">
                <a onclick={Conf.loc.changeLocale.bind(ctrl, 'en')} href="#">EN</a>
                <a onclick={Conf.loc.changeLocale.bind(ctrl, 'ua')} href="#">UA</a>
                <a onclick={Conf.loc.changeLocale.bind(ctrl, 'ru')} href="#">RU</a>
            </div>
            <div class="wrapper-page">
                <div class="text-center logo">
                    <img src="/assets/img/logo.svg" alt="Smartmoney logo"/>
                    <h4>{Conf.tr('Merchant dashboard')}</h4>
                </div>

                <form class="form-horizontal m-t-20" onsubmit={ctrl.login.bind(ctrl)}>

                    <div class="form-group">
                        <div class="col-xs-12">
                            <input class="form-control" type="text" required="required"
                                   placeholder={Conf.tr("Username")}
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
                        <button class="btn btn-primary btn-lg btn-custom waves-effect w-md waves-light m-b-5"
                                type="submit">{Conf.tr("Log in")}
                        </button>
                    </div>
                </form>
            </div>
            {m.component(Footer)}
        </div>
    }
};
