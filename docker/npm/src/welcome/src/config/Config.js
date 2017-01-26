var Localize = require('localize');
var Locales = require('../locales/translations.js');

var conf = {
    master_key:         process.env.MASTER_KEY,
    wallet_host:        process.env.KEYSERVER_HOST,
    horizon_host:       process.env.HORIZON_HOST,
    api_url:            process.env.API_HOST
};

StellarSdk.Network.use(new StellarSdk.Network(process.env.STELLAR_NETWORK));
conf.horizon = new StellarSdk.Server(conf.horizon_host);

conf.locales = Locales;

conf.loc = new Localize(conf.locales);
conf.loc.throwOnMissingTranslation(false);
conf.loc.userLanguage = (localStorage.getItem('locale')) ? (localStorage.getItem('locale')) :
    (navigator.language || navigator.userLanguage).toLowerCase().split('-')[0];
conf.loc.setLocale(conf.loc.userLanguage);
conf.loc.changeLocale = function (locale, e) {
    e.preventDefault();
    m.startComputation();
    conf.loc.setLocale(locale);
    localStorage.setItem('locale', locale);
    m.endComputation();
};
conf.tr = conf.loc.translate; //short alias for translation

var errors = require('../errors/Errors');
conf.errors = errors;

var Config = module.exports = conf;
