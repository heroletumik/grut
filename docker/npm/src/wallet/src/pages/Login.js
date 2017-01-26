var AuthNavbar = require('../components/AuthNavbar.js');
var Auth = require('../models/Auth.js');
var Conf = require('../config/Config.js');

var Login = module.exports = {
    controller: function () {
        var ctrl = this;

        if (Auth.keypair()) {
            return m.route('/home');
        }

        this.login = function (e) {
            e.preventDefault();

            if (e.target.login.value && e.target.password.value) {
                m.onLoadingStart();
                Auth.login(e.target.login.value, e.target.password.value)
                    .then(function () {
                        m.onLoadingEnd();
                        m.route('/home');
                    })
                    .catch(err => {
                        console.error(err);
                        if (err.name === "ConnectionError") {
                            return m.flashError(Conf.tr("Service error. Please contact support"));
                        } else {
                            return m.flashError(Conf.tr("Login/password combination is invalid"));
                        }
                    })
            } else {
                m.flashError(Conf.tr('Please fill all the fields'));
            }
        };
    },

    view: function (ctrl) {
        return <div>
            {m.component(AuthNavbar)}

            <div class="wrapper-page">
                <div className="auth-form">
                    <div class="text-center">
                        <h3>{Conf.tr("Sign in")}</h3>
                    </div>
                    <form class="form-horizontal m-t-30" onsubmit={ctrl.login.bind(ctrl)}>
                            <div class="form-group">
                                <div class="col-xs-12">
                                    <input class="form-control" type="text" placeholder={Conf.tr("Username")}
                                           autocapitalize="none" name="login"/>
                                    <i class="md md-account-circle form-control-feedback l-h-34"></i>
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="col-xs-12">
                                    <input class="form-control" type="password" autocapitalize="none"
                                           placeholder={Conf.tr("Password")} name="password"/>
                                    <i class="md md-vpn-key form-control-feedback l-h-34"></i>
                            </div>
                        </div>

                        <div class="form-group m-t-20 text-center">
                            <button
                                class="form-control btn btn-primary btn-lg btn-custom waves-effect w-md waves-light m-b-5"
                                type="submit">{Conf.tr("Log in")}
                            </button>
                        </div>
                    </form>

                    <div class="m-t-10">
                        <a href="/sign" config={m.route} class="">{Conf.tr("Create account")}</a>
                        <a href="/recovery" config={m.route} class="pull-right">{Conf.tr("Forgot your password?")}</a>
                    </div>
                </div>
            </div>

            <footer class="visible-xs visible-sm footer-app">
                <div class="container">
                    <div class="row">
                        <div class="col-xs-12">
                            <a href="/assets/data/ProstirMobileWallet.apk" download="ProstirMobileWallet.apk">{Conf.tr("Tap here")}</a> {Conf.tr("to download Prostir mobile wallet application")}
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    }
};
