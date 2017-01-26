var Auth = require('../models/Auth.js');
var Conf = require('../config/Config.js');

module.exports = {

    controller: function () {
        var ctrl = this;
    },

    view: function (ctrl) {
        return <header id="top-nav">
            <div class="topbar-main">
                <div class="container">

                    <a href="/" config={m.route} class="logo">
                        <img src={"/assets/img/" + Conf.tr("logo-image") + ".svg"} alt=""/>
                    </a>

                    <div class="menu-extras">
                        <div class="text-right flags">
                            <a onclick={Conf.loc.changeLocale.bind(ctrl, 'ua')} href="#">
                                <img src="/assets/img/ua.png" alt="UA"/>
                            </a>
                            <a onclick={Conf.loc.changeLocale.bind(ctrl, 'en')} href="#">
                                <img src="/assets/img/uk.png" alt="EN"/>
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </header>
    }
};
