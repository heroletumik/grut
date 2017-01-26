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
    $.Notification.notify('error', 'top center', "Error", msg);
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
    $.Notification.notify('success', 'top center', "Success", msg);
};

m.getPromptValue = function (label, errMsg = false) {
    if (!errMsg) errMsg = Conf.tr('Empty value');
    return new Promise(function (resolve, reject) {
        jPrompt(label, '', Conf.tr('Message'), Conf.tr('OK'), Conf.tr('Cancel'), function (result) {
            if (result) {
                resolve(result);
            } else {
                reject(new Error(errMsg));
            }
        });
    });
};

// Routing
m.route.mode = 'pathname';
m.route(document.getElementById('app'), "/", {
    "/": require('./pages/Login.js'),
    "/cards": require('./pages/Cards.js'),
    "/cards/generate": require('./pages/Generate.js'),
});
