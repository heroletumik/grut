var Conf = require('../config/Config.js'),
    Navbar = require('../components/Navbar.js'),
    Footer = require('../components/Footer.js'),
    Auth      = require('../models/Auth');

module.exports = {
    controller: function () {
        var ctrl = this;

        this.accepted = m.prop(false);
        this.declined = m.prop(false);

        if (!Auth.enrollment()) {
            return m.route('/u');
        }
        if (Auth.type() != 'user') {
            return m.route('/u');
        }

        this.acceptEnrollment = function (e) {
            e.preventDefault();
            m.onLoadingStart();
            if (!e.target.login || !e.target.password || !e.target.password_confirm) {
                return m.flashError(Conf.tr('Fill all required fields'));
            }
            if (e.target.password.value != e.target.password_confirm.value) {
                return m.flashError(Conf.tr('Passwords must be equal'));
            }
            StellarWallet.createWallet({
                server: Conf.wallet_host + '/v2',
                username: e.target.login.value,
                password: e.target.password.value,
                accountId: Auth.keypair().accountId(),
                publicKey: Auth.keypair().rawPublicKey().toString('base64'),
                keychainData: Auth.keypair().seed(),
                mainData: 'mainData',
                kdfParams: {
                    algorithm: 'scrypt',
                    bits: 256,
                    n: Math.pow(2, 11),
                    r: 8,
                    p: 1
                }
            }).then(function(wallet) {
                var sequence = '0';
                var userAccount = new StellarSdk.Account(Auth.keypair().accountId(), sequence);

                var tx = new StellarSdk.TransactionBuilder(userAccount).addOperation(
                    StellarSdk.Operation.changeTrust({
                        asset: new StellarSdk.Asset(Auth.enrollment().asset, Conf.master_key)
                    })).build();
                tx.sign(Auth.keypair());
                var xdr = tx.toEnvelope().toXDR().toString("base64");
                return Auth.api().enrollmentAccept({
                    id: Auth.enrollment().id,
                    token: Auth.enrollment().otp,
                    account_id: Auth.keypair().accountId(),
                    tx_trust: xdr,
                    login: e.target.login.value
                });
            }).then(function(response){
                console.log(response);
                m.startComputation();
                ctrl.accepted(true);
                m.endComputation();
                swal(Conf.tr("Accepted") + "!",
                    Conf.tr("Enrollment successfully accepted"),
                    "success"
                );
            }).catch(function(err){
                console.error(err);
                return m.flashApiError(err);
            }).then(function(){
                m.onLoadingEnd();
            })
        };

        this.declineEnrollment = function () {
            m.onLoadingStart();
            swal({
                title: Conf.tr("Decline enrollment") + '?',
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: Conf.tr("Yes, decline it"),
                cancelButtonText: Conf.tr("Cancel"),
                closeOnConfirm: true,
                html: false
            }, function(isConfirm){

                if (isConfirm) {
                    return Auth.api().enrollmentDecline({
                        id: Auth.enrollment().id,
                        token: Auth.enrollment().otp
                    }).then(function(response){
                        m.startComputation();
                        ctrl.declined(true);
                        m.endComputation();
                        swal(Conf.tr("Declined") + "!",
                            Conf.tr("Your enrollment has been declined"),
                            "success"
                        );
                    }).catch(function(err){
                        console.error(err);
                        return m.flashApiError(err);
                    }).then(function(){
                        m.onLoadingEnd();
                    })
                } else {
                    m.onLoadingEnd();
                }

            });
        }
    },

    view: function (ctrl) {
        return <div id="wrapper">
            {m.component(Navbar)}
            <div class="content-page">
                <div class="content">
                    <div class="container">
                        <div class="col-md-8 col-md-offset-2">
                            {
                                ctrl.accepted() || ctrl.declined() ?
                                    <div>
                                    {
                                        ctrl.accepted() ?
                                            <div class="alert alert-success">
                                                {Conf.tr("Enrollment successfully accepted")}
                                            </div>
                                        :
                                            <div class="alert alert-warning">
                                                <strong>{Conf.tr('Warning') + "!"}</strong> {Conf.tr("Your enrollment has been declined")}
                                            </div>
                                    }
                                    </div>
                                    :
                                    <div class="panel panel-color panel-primary">
                                        <div class="panel-heading">
                                            <h3 class="panel-title">{Conf.tr('User registration')}</h3>
                                            <p class="panel-sub-title font-13">
                                                {Conf.tr('Compose your login and password or decline enrollment')}
                                            </p>
                                        </div>
                                        <div class="panel-body">
                                            <div class="col-md-6">
                                                <form id="reg_form" method="post" role="form" onsubmit={ctrl.acceptEnrollment.bind(ctrl)}>
                                                    <div class="form-group">
                                                        <div>{Conf.tr('Login')}:</div>
                                                        <input type="text" class="form-control" id="login" name="login" required="required"/>
                                                    </div>

                                                    <div class="form-group">
                                                        <div>{Conf.tr('Password')}:</div>
                                                        <input type="password" class="form-control" id="password" name="password" required="required"/>
                                                    </div>

                                                    <div class="form-group">
                                                        <div>{Conf.tr('Repeat password')}:</div>
                                                        <input type="password" class="form-control" id="password_confirm" name="password_confirm" required="required"/>
                                                    </div>

                                                    <div class="form-group m-b-0">
                                                        <div class="col-md-offset-1 col-md-10 text-center">
                                                            <button type="submit" class="btn btn-primary btn-custom waves-effect w-md waves-light m-b-5 m-r-15">
                                                                {Conf.tr("Accept")}
                                                            </button>
                                                            <button type="button" class="btn btn-danger btn-custom waves-effect w-md waves-light m-b-5 m-r-0"
                                                                    onclick={ctrl.declineEnrollment}
                                                            >
                                                                {Conf.tr("Decline")}
                                                            </button>
                                                        </div>
                                                    </div>

                                                </form>
                                            </div>
                                            <div class="col-md-6">
                                                <table class="table m-0">
                                                    <tbody>
                                                        <tr>
                                                            <th>{Conf.tr('Full name')}</th>
                                                            <td>{Auth.enrollment().user_data.surname} {Auth.enrollment().user_data.name} {Auth.enrollment().user_data.middle_name}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{Conf.tr('Passport')}</th>
                                                            <td>{Auth.enrollment().user_data.passport}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{Conf.tr('IPN code')}</th>
                                                            <td>{Auth.enrollment().user_data.ipn_code}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{Conf.tr('Address')}</th>
                                                            <td>{Auth.enrollment().user_data.address}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{Conf.tr('Phone')}</th>
                                                            <td>{Auth.enrollment().user_data.phone}</td>
                                                        </tr>
                                                        <tr>
                                                            <th>{Conf.tr('Email')}</th>
                                                            <td>{Auth.enrollment().user_data.email}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
            {m.component(Footer)}
        </div>
    }
};