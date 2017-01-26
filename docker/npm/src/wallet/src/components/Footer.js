var Conf = require('../config/Config.js');
var Session = require('../models/Session.js');

module.exports = {
    controller: function() {
        var ctrl = this;

        window.addEventListener('keydown', function (e) {
            if (e.keyCode == 27) {
                if (Session.modalMessage()) {
                    Session.closeModal();
                    m.redraw();
                }
            }
        });
    },

    view: function(ctrl) {
        return <div>
            {Session.modalMessage()?
                m('div#session-modal', {
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
                            [m(".portlet", [
                                m(".portlet-heading.bg-primary", {style: {borderRadius: 0}}, [
                                    m("h3.portlet-title", Session.modalTitle()),
                                    m(".portlet-widgets", [
                                        m("a[href='#']", {
                                            onclick: function(e){e.preventDefault(); Session.closeModal()},
                                        }, [m("i.ion-close-round")])
                                    ]),
                                    m(".clearfix")
                                ]),
                                m(".portlet-body", {style: {wordWrap: 'break-word'}}, Session.modalMessage())
                            ])]
                        ]),
                        m(".clearfix")
                    ])
                ])
                :
                ''
            }
            <div class="footer-wrap footer-sticky">
                <footer>
                    <div class="container">
                        <div class="row">
                            <div class="col-sm-4 col-md-3 col-md-offset-1 col-lg-3 col-lg-offset-2">
                                <section class="widget">
                                    <div class="widget-heading">
                                        <h4>{Conf.tr("Contacts")}</h4>
                                    </div>
                                    <div class="footer-contact-info">
                                        <ul>
                                            <li>
                                                <p>
                                                    <i class="fa fa-building"></i>&nbsp;
                                                    <a href="https://bank.gov.ua/control/uk/publish/article?art_id=75431&amp;cat_id=36046">{Conf.tr("The National Bank of Ukraine")}</a>
                                                </p>
                                            </li>
                                            <li>
                                                <p>
                                                    <i class="fa fa-map-marker"></i>&nbsp;{Conf.tr("9 Instytutska St., 01601 Kyiv")}
                                                </p>
                                            </li>
                                            <li>
                                                <p>
                                                    <i class="fa fa-envelope"></i>&nbsp;
                                                    <a href="mailto:prostir@bank.gov.ua" style="color: #71cbee;">prostir@bank.gov.ua</a>
                                                </p>
                                            </li>
                                        </ul>
                                    </div>
                                </section>
                            </div>
                            <div class="col-sm-8 col-md-6 col-md-offset-1 col-lg-5 col-lg-offset-0">
                                <p>{Conf.tr("The website is for information only. The National Bank of Ukraine is not responsible for possible consequences resulting from the use of information on the website. The National Bank of Ukraine owns the copyright to the materials posted on the website, unless otherwise expressly stated in the text. The materials can be used for further dissemination only with prior consent of the National Bank of Ukraine and with reference to the source. All changes and amendments to such information can be made only with the National Bank of Ukraine’s prior consent.")}</p>
                            </div>
                        </div>
                    </div>
                </footer>
                <div class="footer-bottom">
                    <div class="container text-center">
                        2016 © {Conf.tr("Made by")} <a href="http://atticlab.net/">AtticLab</a>
                    </div>
                </div>
            </div>
        </div>
    }
};