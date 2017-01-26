var Conf = require('../config/Config.js'),
    Auth = require('../models/Auth.js'),
    Navbar = require('../components/Navbar.js'),
    Footer = require('../components/FooterFullWidth.js');

var Login = module.exports = {
    controller: function () {
        var ctrl = this;

        window.Conf = Conf;
        window.Auth = Auth;

        if (Auth.keypair()) {
            return m.route('/home');
        }

        this.login = function (e) {
            e.preventDefault();

            m.onLoadingStart();
            Auth.login(e.target.login.value, e.target.password.value)
                .then(function () {
                    m.onLoadingEnd();
                    m.route('/home');
                    return true;
                })
                .catch(err => {
                    m.flashError(err.message ? Conf.tr(err.message) : Conf.tr('Service error. Please contact support'));
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
                    <h4>{Conf.tr('Admin Dashboard')}</h4>
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
                        <div class="m-t-10">
                            <a href="/sign" config={m.route}
                               class="">{Conf.tr("Create an account")}</a>
                        </div>
                    </div>
                </form>
            </div>
            {m.component(Footer)}
        </div>
    }
};
