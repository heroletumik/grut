var Auth = require('../models/Auth.js');
var Helpers = require('../components/Helpers.js');
var Conf = require('../config/Config.js');
var Session = require('../models/Session.js');

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

    view: function (ctrl, data) {
        var content = (!data || !data.tpl) ? '' : data.tpl;
        var title = (!data || !data.title) ? Conf.tr("Dashboard") : data.title;

        return <div>
            {Session.modalMessage()?
                m('div', {
                    style: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        padding: '7.5%',
                        paddingLeft: 0,
                        paddingRight: 0,
                        background: 'rgba(0, 0, 0, 0.75)',
                        zIndex: 9999,
                        width: '100%',
                        height: '100%'
                    },
                },[
                    m(".row", [
                        m(".col-md-4.col-md-offset-4", [
                            [m(".portlet.text-center", [
                                m(".portlet-heading.bg-primary", {style: {borderRadius: 0}}, [
                                    m("h3.portlet-title", Session.modalTitle() || Conf.tr('Message')),
                                    m(".portlet-widgets", [
                                        m("a[href='#']", {
                                            onclick: function(e){e.preventDefault(); Session.closeModal()}
                                        }, [m("i.ion-close-round")])
                                    ]),
                                    m(".clearfix")
                                ]),
                                m(".portlet-body", Session.modalMessage())
                            ])]
                        ]),
                        m(".clearfix")
                    ])
                ])
                :
                ''
            }

            <div id="wrapper">

            <div class="topbar">
                <div class="topbar-left hidden-xs">
                    <div class="text-center">
                        <a href="/" class="logo"><span>SmartMoney {Conf.tr("Agent")}</span> </a>
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
                                    <a href="#" onclick={ctrl.updateTTL.bind(ctrl)} title={Conf.tr('Time before the session close')}>
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

            <div class="left side-menu">
                <div class="sidebar-inner slimscrollleft">
                    <div id="sidebar-menu">
                        <ul>
                            <li>
                                <a href="/cards" config={m.route} class="waves-effect waves-primary">
                                    <i class="md  md-dns"></i> <span>{Conf.tr("Scratch cards")}</span>
                                </a>
                            </li>
                            <li>
                                <a href="/cards/generate" config={m.route} class="waves-effect waves-primary">
                                    <i class="md  md-dns"></i> <span>{Conf.tr("Create scratch cards")}</span>
                                </a>
                            </li>
                        </ul>
                        <div class="clearfix"></div>
                    </div>
                    <div class="clearfix"></div>
                </div>
            </div>

            <div class="content-page">
                <div class="content">
                    <div class="container">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="page-title-box">
                                    <ol class="breadcrumb pull-right">
                                        <li class="active">Smartmoney</li>
                                        <li class="active">{title}</li>
                                    </ol>
                                    <h4 class="page-title">{title}</h4>
                                    {data.subtitle ?
                                        <p class="page-sub-title font-13">{data.subtitle}</p>
                                    :
                                    ''
                                    }
                                </div>
                            </div>
                        </div>
                        {content}
                    </div>
                </div>

                <footer class="footer text-right">
                    2016 © AtticLab
                </footer>

                </div>
            </div>
        </div>
    }
};