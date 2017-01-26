var Conf       = require('../../config/Config.js'),
    Navbar     = require('../../components/Navbar.js'),
    Footer     = require('../../components/Footer.js'),
    Auth       = require('../../models/Auth'),
    Helpers   = require('../../models/Helpers'),
    Sidebar    = require('../../components/Sidebar.js');

module.exports = {
    controller: function () {
        var ctrl = this;

        if (!Auth.username()) {
            return m.route('/');
        }

        this.emission_mnemonic = m.prop(false);

        this.parseFile = function (result) {
            return new Promise(function(resolve, reject) {
                var bad_file = false;
                try {
                    if (!result) {
                        throw new Error('Bad file');
                    }
                    var data = JSON.parse(result);
                    if (typeof data.operation == 'undefined') {
                        bad_file = true;
                    }
                    if (data.operation != 'emission_create') {
                        bad_file = true;
                    }
                    if (!data.account && !data.seed && !data.hash) {
                        bad_file = true;
                    }
                } catch (e) {
                    bad_file = true;
                }
                if (bad_file) {
                    reject("Bad file");
                }
                resolve(data);
            });
        };

        this.generateTx = function (e) {
            m.onLoadingStart();

            var user_password = '';
            var user_repassword = '';

            m.getPromptValue(Conf.tr("Enter password to crypt emission"))
                .then(function (user_password_answer) {
                    user_password = user_password_answer;
                    return m.getPromptValue(Conf.tr("Repeat password"));
                })
                .then(function (user_repassword_answer) {
                    user_repassword = user_repassword_answer;
                    if (user_password != user_repassword) {
                        throw new Error(Conf.tr("Passwords doesn't match"));
                    }
                    return Conf.horizon.loadAccount(Conf.master_key);
                })
                .then(function (source) {
                    var emission_keypair = StellarSdk.Keypair.random();
                    var tx = new StellarSdk.TransactionBuilder(source)
                        .addOperation(StellarSdk.Operation.setOptions({
                            signer: {
                                pubKey: emission_keypair.accountId(),
                                weight: StellarSdk.xdr.SignerType.signerEmission().value,
                                signerType: StellarSdk.xdr.SignerType.signerEmission().value
                            }
                        }))
                        .build();
                    var data = JSON.stringify({
                        tx:         tx.toEnvelope().toXDR().toString("base64"),
                        seed:       Helpers.encryptData(emission_keypair.seed(), user_password),
                        account:    emission_keypair.accountId(),
                        operation:  'emission_create'
                    });
                    Helpers.download('generate_emission_key.smb', data);
                    m.onLoadingEnd();
                    $(e.target).trigger('reset');
                })
                .catch(function (e) {
                    console.log(e);
                    m.flashError(typeof e.message == 'string' && e.message.length > 0 ? Conf.tr(e.message) : Conf.tr('Stellar error'));
                });

        };

        this.uploadTx = function (e) {
            m.onLoadingStart();

            var file = e.target.files[0];
            if (!file) {
                return m.flashError(Conf.tr("Bad file"));
            }

            var reader = new FileReader();
            reader.readAsText(file);

            reader.onload = function (evt) {

                var data = null;

                ctrl.parseFile(evt.target.result)
                    .then(function(file_data){
                        data = file_data;

                        return m.getPromptValue(Conf.tr("Enter password to decrypt emission"))

                    }).then(function(password){
                        data.seed = sjcl.decrypt(password, atob(data.seed));
                        var tx = new StellarSdk.Transaction(data.tx);

                        return Conf.horizon.submitTransaction(tx)
                    })
                    .then(function (response) {
                        data.hash = response.hash;

                        return Conf.horizon.transactions()
                            .transaction(data.hash)
                            .call();
                    })
                    .then((tx_result) => {
                        if (!tx_result || tx_result.id !== data.hash) {
                            return m.flashError(Conf.tr("Transaction hash not found"));
                        }

                        return Conf.horizon.accounts()
                            .accountId(Conf.master_key)
                            .call()
                    })
                    .then((master) => {
                        if (!master.id) {
                            return m.flashError(Conf.tr("Server configuration error, Failed to get master account. Contact support"));
                        }
                        var found = _.find(master.signers, function(signer) {
                            return signer.public_key === data.account
                        });
                        if (!found) {
                            return m.flashError(Conf.tr("Operation completed, but account $[1] is not signer of master key", data.account));
                        }
                        if (found.weight !== Conf.roles.emission) {
                            return m.flashError(Conf.tr("Operation completed, but account $[1] is not emission key", data.account));
                        }
                        return data.seed;
                    })
                    .then((seed) => {
                        m.flashSuccess(Conf.tr("Emission key was generated"));
                        m.onLoadingEnd();
                        $(e.target).trigger('reset');
                        m.startComputation();
                        ctrl.emission_mnemonic(StellarSdk.getMnemonicFromSeed(seed));
                        m.endComputation();
                    })
                    .catch(function (err) {
                        console.error(err);
                        $("#upload_tx").replaceWith($("#upload_tx").val('').clone(true));
                        return m.flashError(Conf.tr("Transaction loading error"));
                    });
            };
            reader.onerror = function (evt) {
                m.flashError(Conf.tr("Error read file"));
            };
        }
    },

    view: function (ctrl) {
        return <div id="wrapper">
            {m.component(Navbar)}
            {m.component(Sidebar)}
            <div class="content-page">
                <div class="content">
                    <div class="container">
                        <div class="panel panel-primary panel-border">
                            <div class="panel-heading">
                                <h3 class="panel-title">{Conf.tr('Generate Emission Keys')}</h3>
                            </div>
                            <div class="panel-body">
                                {!ctrl.emission_mnemonic() ?
                                    <div class="buttons" id="emission_buttons">
                                        <button class="btn btn-default" onclick={ctrl.generateTx.bind(ctrl)}
                                                id="generate_tx">{Conf.tr('Generate Emission Key')}</button>
                                        &nbsp;
                                        <div class="fileUpload btn btn-inverse" onchange={ctrl.uploadTx.bind(ctrl)}>
                                            <span>{Conf.tr('Upload Signed Transaction')}</span><input type="file" accept=".smbx"
                                                                                                      id="upload_tx"/>
                                        </div>
                                    </div>
                                :
                                    <div id="emission_form">
                                        <h4>{Conf.tr('Remember - mnemonic phrase is NOT recoverable')}</h4>
                                        <kbd id="emission_encrypted_key" style="word-break: break-word; display: block;">{ctrl.emission_mnemonic()}</kbd>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {m.component(Footer)}
        </div>
    }
};