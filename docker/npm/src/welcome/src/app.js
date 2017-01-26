var Conf = require('./config/Config.js');

// Loading spinner
m.onLoadingStart = function () {
    document.getElementById('spinner').style.display = 'block';
};
m.onLoadingEnd = function () {
    document.getElementById('spinner').style.display = 'none';
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
    "/": require('./pages/AgentLogin.js'),
    "/u": require('./pages/UserLogin.js'),
    "/logout": require('./pages/Logout.js'),
    "/agent": require('./pages/Agent.js'),
    "/user": require('./pages/User.js')
});
