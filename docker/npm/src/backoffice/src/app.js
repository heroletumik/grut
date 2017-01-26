StellarSdk.Network.use(new StellarSdk.Network(process.env.STELLAR_NETWORK));

var Conf = require('./config/Config.js');
var queue = require('queue');
var q = queue();

// Loading spinner
m.onLoadingStart = function () {
    q.push(true);
    document.getElementById('spinner').style.display = 'block';
};
m.onLoadingEnd = function () {
    q.pop();
    if (!q.length) {
        document.getElementById('spinner').style.display = 'none';
    }
};

// Wrapper for notification which stops animation
m.flashError = function (msg) {
    m.onLoadingEnd();
    $.Notification.notify('error', 'top center', Conf.tr("Error"), msg);
};
m.flashApiError = function (err) {
    if (err && typeof err.message != 'undefined' && err.message == 'Invalid signature') {
        window.location.href = '/';
        return;
    }
    m.onLoadingEnd();
    var msg = err.message ? Conf.tr(err.message) + (err.description ? ': ' + Conf.tr(err.description) : '') : Conf.tr('Unknown error. Contact support');
    $.Notification.notify('error', 'top center', Conf.tr("Error"), msg);
};
m.flashSuccess = function (msg) {
    m.onLoadingEnd();
    $.Notification.notify('success', 'top center', Conf.tr("Success"), msg);
};

m.getPromptValue = function (label) {
    return new Promise(function (resolve, reject) {
        jPrompt(label, '', Conf.tr("Message"), Conf.tr("OK"), Conf.tr("Cancel"), function (result) {
            if (result) {
                resolve(result);
            } else {
                reject(new Error(Conf.tr("Empty password")));
            }
        });
    });
};


// Routing
m.route.mode = 'pathname';
m.route(document.getElementById('app'), "/", {
    "/": require('./pages/Login.js'),
    "/logout": require('./pages/Logout.js'),
    "/sign": require('./pages/Sign.js'),
    "/home": require('./pages/Home.js'),
    "/admins" : require('./pages/Admins/Admins.js'),
    "/emission" : require('./pages/Emission/List.js'),
    "/emission/generate" : require('./pages/Emission/Generate.js'),
    "/emission/process" : require('./pages/Emission/Process.js'),
    "/companies" : require('./pages/Companies/List.js'),
    "/companies/create" : require('./pages/Companies/Create.js'),
    "/analytics" : require('./pages/Analytics/Index.js'),
    "/analytics/account/:accountId" : require('./pages/Analytics/Account.js'),
    "/commissions/assets" : require('./pages/Commission/Assets.js'),
    "/commissions/types" : require('./pages/Commission/Types.js'),
    "/commissions/accounts" : require('./pages/Commission/Accounts.js'),
    "/commissions/manage" : require('./pages/Commission/Manage.js'),
    "/invoices/statistics" : require('./pages/Invoices/Statistics'),
    "/bans/list" : require('./pages/Bans/List.js'),
    "/bans/create" : require('./pages/Bans/Create.js'),
    "/agents/manage" : require('./pages/Agents/Manage.js'),
    "/agents/create" : require('./pages/Agents/Create.js'),
    "/agents/enrollments" : require('./pages/Agents/Enrollments.js'),
    "/generalagent" : require('./pages/GeneralAgent/List.js'),
    "/generalagent/distribution" : require('./pages/GeneralAgent/Distribution.js'),
});