var Auth = require('../models/Auth.js');
var Conf = require('../config/Config.js');
var Helpers = require('../models/Helpers.js');

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

        this.visible = m.prop(false);

        this.toggleVisible = function () {
            this.visible(!this.visible());

            if (this.visible()) {
                $('#mobile-spec-menu').css('max-height', $(window).height() - $('.topbar-main').height());
            }
        };
    },

    view: function (ctrl) {
        return <header id="topnav">
            <div class="topbar-main">
                <div class="container">

                    <a href="/" config={m.route} class="logo">
                        <img src={"/assets/img/" + Conf.tr("logo-image") + ".svg"} alt=""/>
                    </a>

                    <div id="navigation" style={ctrl.visible()? 'display:block;' : ''}>
                        <ul class="navigation-menu" id="mobile-spec-menu">
                            <li>
                                <a href="/" config={m.route}>
                                    <i class="fa fa-th"></i>{Conf.tr("Dashboard")}</a>
                            </li>
                            <li>
                                <a href="/payments" config={m.route}>
                                    <i class="fa fa-list"></i>{Conf.tr("Payments")}</a>
                            </li>
                            <li>
                                <a href="/transfer" config={m.route}><i
                                    class="fa fa-money"></i>{Conf.tr("Transfer money")}</a>
                            </li>

                            <li>
                                <a href="/invoice" config={m.route}>
                                    <i class="fa fa-credit-card"></i>{Conf.tr("Create invoice")}</a>
                            </li>
                            {(Auth.username()) ?
                                <li>
                                    <a href="/settings" config={m.route}>
                                        <i class="fa fa-cogs"></i>{Conf.tr("Settings")}
                                    </a>
                                </li>
                                : ''}
                            <li class="visible-xs">
                                <a href="#" style="color: #000" onclick={Auth.logout}><i class="fa fa-power-off m-r-5"></i>
                                    {Conf.tr("Logout")}
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="menu-extras">
                        <ul class="nav navbar-nav navbar-right pull-right hidden-xs text-inverse">
                            <li class="flags">
                                <a onclick={Conf.loc.changeLocale.bind(ctrl, 'ua')} href="#">
                                    <img src="/assets/img/ua.png" alt="UA"/>
                                </a>
                            </li>
                            <li class="flags">
                                <a onclick={Conf.loc.changeLocale.bind(ctrl, 'en')} href="#">
                                    <img src="/assets/img/uk.png" alt="EN"/>
                                </a>
                            </li>
                            <li>
                                <a href="#" onclick={Auth.logout}><i class="fa fa-power-off m-r-5"></i>
                                    {Conf.tr("Logout")}
                                </a>
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

                        <div class="menu-item">
                            <a onclick={ctrl.toggleVisible.bind(ctrl)}
                               class={ctrl.visible() ? 'open navbar-toggle' : 'navbar-toggle'}>
                                <div class="lines">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </a>
                        </div>
                    </div>

                </div>
            </div>

        </header>
    }
};