var Localize = require('localize');
var Locales = require('../locales/translations.js');

var conf = {
    master_key:         process.env.MASTER_KEY,
    horizon_host:       process.env.HORIZON_HOST,
    keyserver_host:     process.env.KEYSERVER_HOST,
    api_host:           process.env.API_HOST,
    info_host:          process.env.INFO_HOST,
}

conf.assets_url = 'assets';

conf.phone = {
    view_mask:  "+99 (999) 999-99-99",
    db_mask:    "999999999999",
    length:     10,
    prefix:     "+38"
};

conf.asset = 'EUAH';

StellarSdk.Network.use(new StellarSdk.Network(process.env.STELLAR_NETWORK));
conf.horizon = new StellarSdk.Server(conf.horizon_host);
conf.locales = Locales;

conf.payments = {
    onpage: 10
};

conf.loc = new Localize(conf.locales);
conf.loc.throwOnMissingTranslation(false);
conf.loc.userLanguage = (localStorage.getItem('locale')) ? (localStorage.getItem('locale')) :
    (navigator.language || navigator.userLanguage).toLowerCase().split('-')[0];
conf.loc.setLocale(conf.loc.userLanguage);
conf.mnemonic = {langsList: ['eng', 'ukr']};
conf.mnemonic.locale = (conf.loc.userLanguage == 'en') ? 'eng' : 'ukr';
conf.mnemonic.totalWordsCount = 24;
conf.loc.changeLocale = function (locale, e) {
    e.preventDefault();
    m.startComputation();
    conf.loc.setLocale(locale);
    conf.mnemonic.locale = (locale == 'en') ? 'eng' : 'ukr';
    localStorage.setItem('locale', locale);
    m.endComputation();
};
conf.tr = conf.loc.translate; //short alias for translation

var Config = module.exports = conf;
