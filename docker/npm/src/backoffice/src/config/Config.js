var Localize = require('localize');
var Locales = require('../locales/translations.js');
var trim = require('lodash.trim');

var conf = {
    master_key:         process.env.MASTER_KEY,
    g_agent_pub:        process.env.G_AGENT_KEY,
    horizon_host:       trim(process.env.HORIZON_HOST, '/'),
    keyserver_host:     trim(process.env.KEYSERVER_HOST, '/'),
    api_url:            trim(process.env.API_HOST, '/'),
    roles: {
        admin   : 1,
        emission: 2
    },
    general_agent_signer_weight: 1
};

conf.assets_url = 'assets';
conf.asset = 'EUAH';

conf.directions = [
    'From account',
    'To account',
    'From account to account',
    'From account to type',
    'From type to account'
];

conf.account_types = [
    {name: 'anonymous',     code: function() {return StellarSdk.xdr.AccountType.accountAnonymousUser().value}()},
    {name: 'registered',    code: function() {return StellarSdk.xdr.AccountType.accountRegisteredUser().value}()},
    {name: 'merchant',      code: function() {return StellarSdk.xdr.AccountType.accountMerchant().value}()},
    {name: 'distribution',  code: function() {return StellarSdk.xdr.AccountType.accountDistributionAgent().value}()},
    {name: 'settlement',    code: function() {return StellarSdk.xdr.AccountType.accountSettlementAgent().value}()},
    {name: 'exchange',      code: function() {return StellarSdk.xdr.AccountType.accountExchangeAgent().value}()},
    {name: 'bank',          code: function() {return StellarSdk.xdr.AccountType.accountBank().value}()}
];

conf.phone = {
    view_mask: "+99 (999) 999-99-99",
    db_mask  : "999999999999",
    length   : 10,
    prefix   : "+38"
};

StellarSdk.Network.use(new StellarSdk.Network(process.env.STELLAR_NETWORK));
conf.horizon = new StellarSdk.Server(conf.horizon_host);

conf.locales = Locales;

conf.payments = {
    onpage: 10,
    onmain: 5
};

conf.pagination = {
    limit: 10
};

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

conf.enrollment_created  = 2;
conf.enrollment_approved = 4;
conf.enrollment_declined = 8;

conf.enrollments_statuses = {
    2 : 'created',
    4 : 'approved',
    8 : 'declined'
}

var Config = module.exports = conf;
