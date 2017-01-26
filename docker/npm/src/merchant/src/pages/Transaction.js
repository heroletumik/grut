var Conf    = require('../config/Config.js'),
    Navbar  = require('../components/NavbarFullWidth.js'),
    Footer  = require('../components/FooterFullWidth.js'),
    Helpers = require('../models/Helpers'),
    Auth    = require('../models/Auth'),
    Qr      = require('qrcode-npm/qrcode');

module.exports = {
    controller: function () {
        var ctrl = this;

        this.order_id = m.prop(m.route.param("order_id"));

        if (!ctrl.order_id()) {
            return m.route('/');
        }

        this.order_data  = m.prop(false);
        this.qr          = m.prop(false);

        this.api = new StellarWallet.Api(Conf.api_url, StellarSdk.Keypair.random());

        m.onLoadingStart();
        ctrl.api.getOrder({order_id: ctrl.order_id()})
            .then(function(order_data){

                if (typeof order_data.status == 'undefined'){
                    return m.flashError(Conf.tr('Bad order data'));
                }

                if (order_data.status != Conf.statuses.STATUS_WAIT_PAYMENT){
                    return m.flashError(Conf.tr('Order has been already handled'));
                }

                // QR-CODE
                var jsonData = {
                    account: order_data.store_data.merchant_id,
                    amount: order_data.amount,
                    asset: order_data.currency,
                    t: Conf.payment_type,
                    m: Conf.payment_prefix + order_data.id
                };
                var jsonDataStr = JSON.stringify(jsonData);

                //calculate the qrCode size
                var qrSize = 5;
                // 5 = (496b), 6 = (608b), 7 = (704b), 8 = 108 (880b), 9 = 130 (1056b)
                var lenInBytes = Qr.qrcode.stringToBytes(jsonDataStr).length * 8 + 16;
                if (lenInBytes > 496)  qrSize++;
                if (lenInBytes > 608)  qrSize++;
                if (lenInBytes > 704)  qrSize++;
                if (lenInBytes > 880)  qrSize++;
                if (lenInBytes > 1056) qrSize++;
                var qr = Qr.qrcode(qrSize, 'Q');
                qr.addData(jsonDataStr);
                qr.make();

                var imgTag = qr.createImgTag(4);

                //set stream on payment
                Conf.horizon.transactions().forAccount(order_data.store_data.merchant_id)
                    .cursor('now')
                    .stream({
                        onmessage: function (transaction) {
                            var order_id = getOrderIdFromTX(transaction);
                            if (order_id && order_id == order_data.id) {
                                return onSuccessPayment(ctrl.order_data().success_url);
                            }
                        }
                    });

                m.startComputation();
                ctrl.order_data(order_data);
                ctrl.qr(m.trust(imgTag));
                m.endComputation();
            })
            .catch(function(error) {
                console.error(error);
                return m.flashApiError(error);
            })
            .then(function() {
                m.onLoadingEnd();
            });

        function getOrderIdFromTX(transaction) {
            if (
                typeof transaction != 'undefined' && typeof transaction.memo != 'undefined' &&
                transaction.memo.toString().length > Conf.payment_prefix.length
                )
            {
                var prefix   = transaction.memo.substr(0, Conf.payment_prefix.length);
                if (prefix != Conf.payment_prefix) {
                    return false;
                }

                return transaction.memo.substr(Conf.payment_prefix.length);
            }

            return false;
        }

        this.confirmPayment = function (e){
            e.preventDefault();
            m.onLoadingStart();
            if (!e.target.login || !e.target.login.value) {
                return m.flashError(Conf.tr('Fill all required fields'));
            }
            if (!e.target.password || !e.target.password.value) {
                return m.flashError(Conf.tr('Fill all required fields'));
            }

            var wallet_data = null;

            StellarWallet.getWallet({
                server:   Conf.keyserver_host + '/v2',
                username: e.target.login.value,
                password: e.target.password.value
            }).then(function (wallet) {
                wallet_data = wallet;

                return Auth.loadAccountById(StellarSdk.Keypair.fromSeed(wallet_data.getKeychainData()).accountId());
            }).then(function (account_data) {
                if (
                    account_data.type_i != StellarSdk.xdr.AccountType.accountRegisteredUser().value &&
                    account_data.type_i != StellarSdk.xdr.AccountType.accountAnonymousUser().value
                ) {

                    return m.flashError(Conf.tr('Bad account type'));
                }

                return Conf.horizon.loadAccount(account_data.id);

            }).then(function (source){
                var memo = StellarSdk.Memo.text(Conf.payment_prefix + ctrl.order_data().id);
                var tx = new StellarSdk.TransactionBuilder(source, {memo: memo})
                    .addOperation(StellarSdk.Operation.payment({
                        destination: ctrl.order_data().store_data.merchant_id,
                        amount: parseFloat(ctrl.order_data().amount).toFixed(2).toString(),
                        asset: new StellarSdk.Asset(ctrl.order_data().currency, Conf.master_key)
                    }))
                    .build();
                tx.sign(StellarSdk.Keypair.fromSeed(wallet_data.getKeychainData()));

                return Conf.horizon.submitTransaction(tx);

            }).catch(error => {
                console.error(error);
                return m.flashError(Conf.tr('Cannot make transfer'));
            }).then(() => {
                m.onLoadingEnd();
            })
        };

        function onSuccessPayment(success_url) {
            m.flashSuccess(Conf.tr('Payment successfully complete. You will be redirected to merchant site in 5 seconds'));
            setTimeout(function(){
                window.location.href = success_url;
            }, 5000);
        }

    },

    view: function (ctrl) {
        return <div id="wrapper">
            {m.component(Navbar)}
            <div class="content-page no_margin_left">
                <div class="content">
                    <div class="container">
                        { ctrl.order_data() ?
                            <div class="col-lg-8 col-lg-offset-2">
                                <div class="col-lg-12">
                                    <div class="panel panel-color panel-success">
                                        <div class="panel-heading">
                                            <h3 class="panel-title">{Conf.tr('Payment confirmation')}</h3>
                                            <p class="panel-sub-title font-13">{Conf.tr('Auth for complete payment or use alternative methods')}</p>
                                        </div>
                                        <div class="panel-body">
                                            <div class="col-lg-4">
                                                <blockquote>
                                                    <p>{Conf.tr('Payment amount')}:</p>
                                                    <p><span class="label label-success">{ctrl.order_data().amount} {ctrl.order_data().currency}</span></p>
                                                </blockquote>
                                            </div>
                                            <div class="col-lg-4">
                                                <blockquote>
                                                    <p>{Conf.tr('Payment details')}:</p>
                                                    <p><span class="label label-success">{ctrl.order_data().details || Conf.tr('Empty details')}</span></p>
                                                </blockquote>
                                            </div>
                                            <div class="col-lg-4">
                                                <blockquote>
                                                    <p>{Conf.tr('Merchant')}:</p>
                                                    <p><span class="label label-success">{ctrl.order_data().store_data.url}</span></p>
                                                </blockquote>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-6">
                                    <div class="panel panel-border panel-primary">
                                        <div class="panel-heading">
                                            <h3 class="panel-title">{Conf.tr('Payment by login/password')}</h3>
                                        </div>
                                        <div class="panel-body text-center">
                                            <form class="form-horizontal m-t-20" method="POST" onsubmit={ctrl.confirmPayment.bind(ctrl)}>
                                                <div class="form-group">
                                                    <div class="col-lg-12">
                                                        <input class="form-control" type="text" required="required" name="login" placeholder={Conf.tr('Login')}/>
                                                            <i class="md md-account-circle form-control-feedback l-h-34"></i>
                                                    </div>
                                                </div>
                                                <div class="form-group">
                                                    <div class="col-lg-12">
                                                        <input class="form-control" type="password" required="required" name="password" placeholder={Conf.tr('password')}/>
                                                            <i class="md md-vpn-key form-control-feedback l-h-34"></i>
                                                    </div>
                                                </div>
                                                <div class="form-group text-right m-t-20 text-center">
                                                    <div class="col-lg-12">
                                                        <button class="btn btn-primary btn-custom w-md waves-effect waves-light" type="submit">{Conf.tr('Confirm payment')}</button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-6">
                                    <div class="panel panel-border panel-primary">
                                        <div class="panel-heading">
                                            <h3 class="panel-title">{Conf.tr('Other methods')}</h3>
                                        </div>
                                        <div class="panel-body text-center">
                                            <div class="text-center">
                                                <div class="col-md-12">
                                                    <span class="label label-warning">{Conf.tr('QRCode')}</span>
                                                    <div class="row">
                                                        {ctrl.qr()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            :
                            <div class="col-lg-8 col-lg-offset-2">
                                <code>{Conf.tr('Check payment data')}...</code>
                            </div>
                        }
                    </div>
                </div>
            </div>
            {m.component(Footer)}
        </div>
    }
};