var Conf = require('../config/Config.js'),
    Auth = require('../models/Auth'),
    Helpers = require('../models/Helpers');


module.exports = {

    controller: function () {
        var ctrl = this;
        this.ttl = m.prop(false);
        this.css_class = m.prop('');

        this.refreshPage = function () {
            m.route(m.route());
        };
        var spinner_interval = setInterval(function(){
            var ttl = Auth.api().getNonceTTL();
            var time_live = Auth.api().getTimeLive();
            if (ttl <= 1) {
                Auth.destroySession();
                clearInterval(spinner_interval);
            }

            var percent = Math.round(100 - (ttl * 100) / time_live);
            var css_class = "c100 p" + percent + " small small-cust green";
            document.getElementById('spinner-progress').className = css_class;
            document.getElementById('spinner-time').innerHTML = Helpers.getTimeFromSeconds(ttl);
        }, 1000);

        // check that it runs only once
        this.updateTTL = function () {
            Auth.api().initNonce()
                .then(function(ttl){
                });
        };

        this.initSpinner = function () {
            var ttl = Auth.ttl();
            var css_class = "0";
            m.startComputation();
            ctrl.ttl(ttl);
            ctrl.css_class(css_class);
            m.endComputation();
        };

        this.initSpinner();
    },

    view: function (ctrl) {
        return <div class="topbar">
            <div class="topbar-left">
                <div class="text-center">
                    <a href="/home" config={m.route} class="logo"><i class="md md-equalizer"></i> <span>SmartMoney</span> </a>
                </div>
            </div>

            <div class="navbar navbar-default" role="navigation">
                <div class="container">
                    <div class="">
                        <div class="pull-left">
                            <button class="button-menu-mobile open-left waves-effect">
                                <i class="md md-menu"></i>
                            </button>
                            <span class="clearfix"></span>
                        </div>

                        <ul class="nav navbar-nav navbar-right pull-right hidden-xs">
                            <li>
                                <a href="#" onclick={Auth.logout}><i class="fa fa-power-off m-r-5"></i>
                                    {Conf.tr("Logout")}
                                </a>
                            </li>
                        </ul>

                        <ul class="nav navbar-nav navbar-right pull-right hidden-xs">
                            <li class="dropdown">
                                <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                                    <i class="fa fa-language fa-fw"></i> <i class="fa fa-caret-down"></i>
                                </a>
                                <ul class="dropdown-menu dropdown-user">
                                    <li>
                                        <a onclick={Conf.loc.changeLocale.bind(ctrl, 'en')} href="#"><img src="/assets/img/flags/en.png" /> English</a>
                                        <a onclick={Conf.loc.changeLocale.bind(ctrl, 'ua')} href="#"><img src="/assets/img/flags/ua.png" /> Українська</a>
                                        <a onclick={Conf.loc.changeLocale.bind(ctrl, 'ru')} href="#"><img src="/assets/img/flags/ru.png" /> Русский</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                        <ul class="nav navbar-nav navbar-right pull-right hidden-xs">
                            <li>
                                <a href="#" onclick={ctrl.updateTTL.bind(ctrl)} title={Conf.tr('Time to end the session')}>
                                    <div id="spinner-progress" class={"c100 small small-cust green p" + ctrl.css_class()}>
                                        <span id="spinner-time">
                                            {
                                                !ctrl.ttl() ?
                                                    ''
                                                    :
                                                    Helpers.getTimeFromSeconds(ctrl.ttl())
                                            }
                                        </span>
                                        <div class="slice">
                                            <div class="bar"></div>
                                            <div class="fill"></div>
                                        </div>
                                    </div>
                                </a>
                            </li>
                        </ul>
                        <ul class="nav navbar-nav navbar-right pull-right hidden-xs">
                            <li>
                                <button class="refresh btn btn-icon waves-effect waves-light btn-purple m-b-5"
                                        onclick={ctrl.refreshPage.bind(ctrl)}> <i class="fa fa-refresh"></i> </button>
                            </li>
                        </ul>

                    </div>
                </div>
            </div>
        </div>
    }
};
