var limit = 25;
StellarSdk.Network.use(new StellarSdk.Network(conf.stellar_network));
var server = new StellarSdk.Server(conf.horizon_host);

var get_params = _.object(_.compact(_.map(location.search.slice(1).split('&'), function(item) {
        if (item) return item.split('=');
    })
));

if(get_params.lang){
    localStorage.setItem("user_lang", get_params.lang);
}

//check user language
var userLang = (navigator.language || navigator.userLanguage).toLowerCase().split('-')[0];

var language = ['ua'/*,['ru']*/].indexOf(userLang) != -1 ? userLang : 'en';

if (localStorage.getItem("user_lang")) {
    language = localStorage.getItem("user_lang");
}

//by default en
var locale = locale_en;

switch(language){
    case 'ua':
        locale = locale_ua;
        break;
    case 'ru':
        locale = locale_ru;
        break;
}

Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
};

var tpl_header = _.template($('#tpl-header').html());
$('#topnav').prepend(tpl_header({
    logo_src: language === 'ua' ? 'logo-white-ua.svg' : 'logo-white.svg',
    locale: window.locale || null
}));

var tpl = _.template($('#tpl-global').html());
$('#global').prepend(tpl({
    locale:  window.locale || null
}));

var tpl_footer = _.template($('#tpl-footer').html());
$('#footer-div').prepend(tpl_footer({
    copyright_link: window.conf.copyright_link,
    locale: window.locale || null
}));

function getNormalizeDate(data, onlytime){

    var dformat = null;
    var d = new Date(data);

    if(onlytime){
        dformat = [d.getHours().padLeft(), d.getMinutes().padLeft(), d.getSeconds().padLeft()].join(':');
    } else {
        dformat = [d.getDate().padLeft(), (d.getMonth()+1).padLeft(),  d.getFullYear()].join('.')
            + ' ' +
            [d.getHours().padLeft(), d.getMinutes().padLeft(), d.getSeconds().padLeft()].join(':');
    }

    return dformat;
}

function getAccountInfo(acc){
    server.accounts()
        .accountId(acc)
        .call()
        .then(function (accountResult) {
            var tpl = _.template($('#acc_balance_data').html());
            $('#acc_balance').prepend(tpl({
                account: accountResult
            }));
        })
        .catch(function (err) {
            console.error(err);
        })
}


function txInfo(tx){    
    server.transactions()
        .transaction(tx)
        .call()
        .then(function (transactionResult) {

            
            server.accounts()
                .accountId(transactionResult.source_account)
                .call()
                .then(function (accountResult) {
                    var tpl = _.template($('#tx_tpl_acc').html());
                    $('#tx_image').prepend(tpl({
                        acc: accountResult,
                    }));
                })
                .catch(function (err) {
                    console.error(err);
                })

            var tpl = _.template($('#tx_tpl_handler').html());
            $('#tx_data').prepend(tpl({
                transaction:     transactionResult,
                merchant_prefix: window.merchant_prefix || null
            }));
            // return transactionResult;

        })
        // .then(function (tx_res) {
        //     console.log(tx_res);
        //     var tpl = _.template($('#op_tpl_handler').html());
        //     $('#op_data').prepend(tpl({
        //         operations:      tx_res.operations(),
        //     }));
        //
        //     var tpl_mobile = _.template($('#mob_op_tpl_handler').html());
        //     $('#mob_op_data').prepend(tpl_mobile({
        //         operations:      tx_res.operations(),
        //     }));
        //
        // })
        .catch(function (err) {
            console.log(err)
        })
}


function accountPaymentsInfo(accountForPaymentsList){
    server.payments().forAccount(accountForPaymentsList)
        .limit(limit)
        .order('desc')
        .call()
        .then(function (result) {
            server.payments()
                .cursor('now')
                .stream({
                    onmessage: function(message) {
                        var result = message.data ? JSON.parse(message.data) : message;
                        addRecord(result, accountForPaymentsList, true);

                        buildPaymentsChart(
                            [
                                chart_left_data
                            ]
                        );

                    },
                    onerror: function(error) {
                    }
                });

            if (!_.isEmpty(result.records)) {
                _.each(result.records.reverse(), function(rec, key){

                    if(key+1 == result.records.length){
                        addRecord(rec, accountForPaymentsList, true);
                    } else {
                        addRecord(rec, accountForPaymentsList);
                    }
                });


                buildPaymentsChart(
                    [
                        chart_left_data
                    ]
                );

            };
        })
        .catch(function (err) {
            console.error(err);
        })
}

function paymentsInfo(){    
    server.payments()
        .limit(limit)
        .order('desc')
        .call()
        .then(function (result) {
            server.payments()
                .cursor('now')
                .stream({
                    onmessage: function(message) {
                        var result = message.data ? JSON.parse(message.data) : message;
                        addRecord(result, null, true);

                        buildPaymentsChart(
                            [
                                chart_left_data
                            ]
                        );

                    },
                    onerror: function(error) {
                    }
                });

            if (!_.isEmpty(result.records)) {                
                _.each(result.records.reverse(), function(rec, key){
                    if(key+1 == result.records.length){
                        addRecord(rec, null, true);
                    } else {
                        addRecord(rec);
                    }

                });

                buildPaymentsChart(
                    [
                        chart_left_data
                    ]
                );

            };
        })
        .catch(function (err) {
            console.error(err);
        })
}

function addRecord(rec, cur_acc, refresh_boxes){
    if (rec.type != 'payment') {
        return
    };
    //StellarSdk.xdr.AccountType.accountAnonymousUser().value       - 0
    //StellarSdk.xdr.AccountType.accountRegisteredUser().value      - 1
    //StellarSdk.xdr.AccountType.accountMerchant().value            - 2
    //StellarSdk.xdr.AccountType.accountDistributionAgent().value   - 3
    //StellarSdk.xdr.AccountType.accountSettlementAgent().value     - 4
    //StellarSdk.xdr.AccountType.accountExchangeAgent().value       - 5
    //StellarSdk.xdr.AccountType.accountBank().value                - 6

    var tpl = _.template($('#tpl-tx-table-tr').html());
    $('#tx-table').prepend(tpl({
        payment: rec,
        cur_acc: cur_acc || null,
        locale:  window.locale || null
    }));

    var tpl_mobile = _.template($('#tpl-mobile-div').html());
    $('#mobile-div').prepend(tpl_mobile({
        payment: rec,
        cur_acc: cur_acc || null,
        locale:  window.locale || null
    }));

    if(typeof chart_left_data != 'undefined'){
        chart_left_data.push(rec.amount);
        while (chart_left_data.length > limit) {
            chart_left_data.shift();
        }
    }

    if(typeof chart_right_data != 'undefined'){
        chart_right_data.push(rec.amount);
        while (chart_right_data.length > limit) {
            chart_right_data.shift();
        }
    }

    // We don't want too many items
    $('#tx-table tr:nth-child(n '+ (limit + 1)+')').remove();
    // We don't want too many items
    $('#mobile-div .payment:nth-child(n '+ (limit + 1)+')').remove();

    //if need to refresh static boxes
    if (refresh_boxes){

        $('#last_tx_time').html(getNormalizeDate(rec.closed_at, true));

        //for account
        if (cur_acc) {

            var total_plus  = 0;
            var total_minus = 0;

            $('.amounts').each(function() {

                if($(this).data('plus')){
                    total_plus += $(this).html() * 1;
                } else {
                    total_minus += $(this).html() * 1;
                }
            });

            $('#total_sum_plus').html(total_plus);
            $('#total_sum_minus').html(total_minus);

            $('.counter').counterUp({
                delay: 100,
                time: 1200
            });

        } else {
        //for mainpage
            var total = 0;

            var min = null;
            var max = null;

            $('.amounts').each(function() {

                var payment_amount = $(this).html() * 1;
                total += payment_amount;

                if(!min){
                    min = payment_amount;
                }
                if(!max){
                    max = payment_amount;
                }

                if (payment_amount < min) { min = payment_amount;}
                if (payment_amount > max) { max = payment_amount;}

            });

            $('#total_sum').html(total);

            $('#max_tx').html(max);
            $('#min_tx').html(min);
            $('#avg_tx').html(parseFloat(total / $('.amounts').length).toFixed(2));

            //get master signers
            return server.accounts()
                .accountId(window.conf.master_public_key)
                .call()
                .then(function(source){

                    var signers = source.signers;

                    var cnt_adm = 0;
                    var cnt_ems = 0;

                    Object.keys(signers).forEach(function(key) {
                        var signer = signers[key];
                        if (signer.weight == StellarSdk.xdr.SignerType.signerAdmin().value && signer.signertype) {
                            cnt_adm++;
                        } else if (signer.weight == StellarSdk.xdr.SignerType.signerEmission().value && signer.signertype) {
                            cnt_ems++;
                        }
                    });

                    $('#cnt_adm').html(cnt_adm);
                    $('#cnt_ems').html(cnt_ems);

                    $('.counter').counterUp({
                        delay: 100,
                        time: 1200
                    });


                })
                .catch(function (err) {
                    console.error(err);
                });

        }
    }

    setTimeout(function(){
        $('#tx-table .bg-success').removeClass('bg-success');
    }, 500);
}


function showModal(title, html){
    $('#modal').find('.modal-title').html(title);
    $('#modal').find('.modal-body').html(html);
    $('#modal').modal('show');
}

function buildPaymentsChart(series){

    //smil-animations Chart
    var chart = new Chartist.Line('#smil-left-animations', {
        labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
            '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'],
        series: series/*[
            [12, 9, 7, 8, 5, 4, 6, 2, 3, 3, 4, 6],
            [4,  5, 3, 7, 3, 5, 5, 3, 4, 4, 5, 5],
            [5,  3, 4, 5, 6, 3, 3, 4, 5, 6, 3, 4],
            [3,  4, 5, 6, 7, 6, 4, 5, 6, 7, 6, 3]
        ]*/
    }, {
        low: 0
    });


// Let's put a sequence number aside so we can use it in the event callbacks
    var seq = 0,
        delays = 20,
        durations = 125;

// Once the chart is fully created we reset the sequence
    chart.on('created', function() {
        seq = 0;
    });

// On each drawn element by Chartist we use the Chartist.Svg API to trigger SMIL animations
    chart.on('draw', function(data) {
        seq++;

        if(data.type === 'line') {
            // If the drawn element is a line we do a simple opacity fade in. This could also be achieved using CSS3 animations.
            data.element.animate({
                opacity: {
                    // The delay when we like to start the animation
                    begin: seq * delays + 200,
                    // Duration of the animation
                    dur: durations,
                    // The value where the animation should start
                    from: 0,
                    // The value where it should end
                    to: 1
                }
            });
        } else if(data.type === 'label' && data.axis === 'x') {
            data.element.animate({
                y: {
                    begin: seq * delays,
                    dur: durations,
                    from: data.y + 100,
                    to: data.y,
                    // We can specify an easing function from Chartist.Svg.Easing
                    easing: 'easeOutQuart'
                }
            });
        } else if(data.type === 'label' && data.axis === 'y') {
            data.element.animate({
                x: {
                    begin: seq * delays,
                    dur: durations,
                    from: data.x - 100,
                    to: data.x,
                    easing: 'easeOutQuart'
                }
            });
        } else if(data.type === 'point') {
            data.element.animate({
                x1: {
                    begin: seq * delays,
                    dur: durations,
                    from: data.x - 10,
                    to: data.x,
                    easing: 'easeOutQuart'
                },
                x2: {
                    begin: seq * delays,
                    dur: durations,
                    from: data.x - 10,
                    to: data.x,
                    easing: 'easeOutQuart'
                },
                opacity: {
                    begin: seq * delays,
                    dur: durations,
                    from: 0,
                    to: 1,
                    easing: 'easeOutQuart'
                }
            });
        } else if(data.type === 'grid') {
            // Using data.axis we get x or y which we can use to construct our animation definition objects
            var pos1Animation = {
                begin: seq * delays,
                dur: durations,
                from: data[data.axis.units.pos + '1'] - 30,
                to: data[data.axis.units.pos + '1'],
                easing: 'easeOutQuart'
            };

            var pos2Animation = {
                begin: seq * delays,
                dur: durations,
                from: data[data.axis.units.pos + '2'] - 100,
                to: data[data.axis.units.pos + '2'],
                easing: 'easeOutQuart'
            };

            var animations = {};
            animations[data.axis.units.pos + '1'] = pos1Animation;
            animations[data.axis.units.pos + '2'] = pos2Animation;
            animations['opacity'] = {
                begin: seq * delays,
                dur: durations,
                from: 0,
                to: 1,
                easing: 'easeOutQuart'
            };

            data.element.animate(animations);
        }
    });
}
