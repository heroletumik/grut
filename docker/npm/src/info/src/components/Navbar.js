var Conf = require('../config/Config.js');

module.exports = {

    controller: function () {
        var ctrl = this;
    },

    view: function (ctrl) {
        return <header id="topnav">
                <div class="topbar-main">
                    <div class="container">
                        <div class="logo">
                            <a href="/" class="logo">
                                <img src={"/assets/images/logo/" + Conf.logo_src} alt=""/>
                                <span>{Conf.tr('Ledger viewer')}</span>
                            </a>
                        </div>
                        <ul class="nav navbar-nav navbar-right pull-right">
                            <div class="menu-extras">
                                <div class="text-right flags">
                                    <a onclick={Conf.loc.changeLocale.bind(ctrl, 'ua')} href="#">
                                        <img src="/assets/images/ua.png" alt="UA"/>
                                    </a>
                                    <a onclick={Conf.loc.changeLocale.bind(ctrl, 'en')} href="#">
                                        <img src="/assets/images/uk.png" alt="EN"/>
                                    </a>
                                </div>
                            </div>

                        </ul>
                    </div>
                </div>
        </header>
    }
};
