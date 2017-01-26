var conf = {
    horizon_host: process.env.HORIZON_HOST,
    master_public_key: process.env.MASTER_KEY,
    stellar_network: process.env.STELLAR_NETWORK,
    merchant_prefix: 'mo:',
    copyright_link: 'http://atticlab.net'
};

var chart_left_data = [];
var resizefunc = [];