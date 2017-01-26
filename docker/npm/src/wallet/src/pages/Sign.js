var AuthNavbar = require('../components/AuthNavbar.js');
var Auth = require('../models/Auth.js');
var Conf = require('../config/Config.js');
var PhraseWizard = require('../components/PhraseWizard.js');
var Qr = require('../../node_modules/kjua/dist/kjua.min');

var Sign = module.exports = {
    controller: function () {
        var ctrl = this;
        if (Auth.keypair()) {
            return m.route('/home');
        }
        this.qr = m.prop(false);
        this.mnemonic = m.prop(false);
        this.showMnemonic = m.prop(false);

        this.signup = function (e) {
            e.preventDefault();
            
            var login = e.target.login.value;
            var password = e.target.password.value;
            var rePassword = e.target.repassword.value;

            if (!login || !password || !rePassword) {
                return m.flashError(Conf.tr("Please, fill all required fields"));
            }

            if (login.length < 3) {
                return m.flashError(Conf.tr("Login should have 3 chars min"));
            }

            var pattern = /^([A-Za-z0-9_-]{1,})$/;

            if (!pattern.test(login)) {
                return m.flashError(Conf.tr("Login should contain only latin characters, numbers, - and _"))
            }

            if (password.length < 6) {
                return m.flashError(Conf.tr("Password should have 6 chars min"));
            }

            if (password != rePassword) {
                return m.flashError(Conf.tr("Passwords should match"));
            }

            m.onLoadingStart();
            var accountKeypair = StellarSdk.Keypair.random();
            var mnemonicPhrase = StellarSdk.getMnemonicFromSeed(accountKeypair.seed(), Conf.mnemonic.locale);

            Auth.registration(accountKeypair, login, password)
                .then(function () {
                    return Auth.login(login, password);
                })
                .then(function () {
                    var qr = Qr({
                        text: mnemonicPhrase,
                        crisp: true,
                        fill: '#000',
                        ecLevel: 'L',
                        size: 260
                    });
                    m.startComputation();
                    ctrl.qr(qr);
                    ctrl.mnemonic(mnemonicPhrase);
                    m.endComputation();
                })
                .catch(err => {
                    m.flashError(err.message ? Conf.tr(err.message) : Conf.tr('Service error. Please contact support'));
                })
                .then(function () {
                    m.onLoadingEnd();
                });
        };

        this.goNext = function (e) {
            e.preventDefault();
            ctrl.showMnemonic(true);
        };
    },

    view: function (ctrl) {
        if (ctrl.showMnemonic()) {
            return Sign.viewMnemonic(ctrl);
        }

        if (ctrl.qr()) {
            return Sign.viewQRCode(ctrl);
        }

        return <div>
            {m.component(AuthNavbar)}
            <div class="wrapper-page">
                <div class="auth-form">
                    <div class="text-center">
                        <h3>{Conf.tr("Create a new account")}</h3>
                    </div>
                    <form class="form-horizontal m-t-30" onsubmit={ctrl.signup.bind(ctrl)}>
                        <div id="by-login" class="tab-pane active">
                            <div class="form-group">
                                <div class="col-xs-12">
                                    <input class="form-control" type="text"
                                           placeholder={Conf.tr("Username")}
                                           autocapitalize="none"
                                           name="login"
                                           title={Conf.tr("Characters and numbers allowed")}/>
                                    <i class="md md-account-circle form-control-feedback l-h-34"></i>
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="col-xs-12">
                                    <input class="form-control" type="password"
                                           autocapitalize="none"
                                           placeholder={Conf.tr("Password")} name="password"
                                           title={Conf.tr("6 characters minimum")}/>
                                    <i class="md md-vpn-key form-control-feedback l-h-34"></i>
                                </div>
                            </div>

                            <div class="form-group">
                                <div class="col-xs-12">
                                    <input class="form-control" type="password"
                                           autocapitalize="none"
                                           placeholder={Conf.tr("Retype Password")} name="repassword"
                                           title={Conf.tr("6 characters minimum")}/>
                                    <i class="md md-vpn-key form-control-feedback l-h-34"></i>
                                </div>
                            </div>
                        </div>

                        <div class="form-group m-t-20 text-center">
                            <button class="form-control btn btn-primary btn-lg btn-custom waves-effect w-md waves-light m-b-5">
                                {Conf.tr("Create")}</button>
                        </div>
                    </form>

                    <div class="m-t-10">
                        <a href="/" config={m.route} class="">{Conf.tr("Log in")}</a>
                    </div>
                </div>
            </div>
        </div>
    },

    viewQRCode: function (ctrl) {
        var code = ctrl.qr();
        // ctrl.qr(false);

        return <div>
            {m.component(AuthNavbar)}

            <div class="wrapper-page">
                <div>
                    <div class="panel panel-color panel-success">
                        <div class="panel-heading">
                            <h3 class="panel-title">{Conf.tr("Account successfully created")}</h3>
                            <p class="panel-sub-title font-13">{Conf.tr("This is a QR-code with a mnemonic phrase that is used for account recovering. It is very important to keep your mnemonic phrase in a safe and private place")}!</p>
                        </div>
                        <div class="panel-body">
                            <div class="text-center">
                                <p><img src={code.src} alt=""/></p>
                                <p><a href={code.src} download="qr_mnemonic.png">{Conf.tr("Save code")}</a></p>
                                <button className="btn btn-success btn-custom waves-effect w-md waves-light m-b-5 m-t-10"
                                        onclick={ctrl.goNext.bind(ctrl)}>{Conf.tr("Next")}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    },

    viewMnemonic: function (ctrl) {
        return m.component(PhraseWizard, {
            phrase: ctrl.mnemonic()
        })
    }


};
