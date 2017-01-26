var Conf = require('../config/Config.js'),
    Navbar = require('../components/Navbar.js'),
    Footer = require('../components/Footer.js'),
    Sidebar = require('../components/Sidebar.js');

module.exports = {
    controller: function () {
        var ctrl = this;
    },

    view: function (ctrl) {
        return <div id="wrapper">
            {m.component(Navbar)}
            {m.component(Sidebar)}
            <div class="content-page">
                <div class="content">
                    <div class="container">
                        <h1>Hello, World!</h1>
                    </div>
                </div>
            </div>
            {m.component(Footer)}
        </div>
    }
};