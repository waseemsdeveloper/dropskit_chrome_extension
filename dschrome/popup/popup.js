$(function () {

});

class Core {

    constructor() {
        this.credentials = {};
        this.config = {};
        window.onload = () => this.start_robot()
    }

    dropkit_email_validator(email) {
        var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        return pattern.test(email);
    }

    dropskit_credential_validator() {
        return new Promise(resolve => {
            if ((!document.getElementById('email').value) || (!document.getElementById('token').value)) {
                let message = 'Please fill all fields';
                let status = 'error';
                showStatus(status, message);
                resolve(false);
            } else if (!this.dropkit_email_validator(document.getElementById('email').value)) {
                let message = 'Please enter valid email';
                let status = 'error';
                showStatus(status, message);
                resolve(false);
            } else {
                $('#spinnerSave').show();
                chrome.runtime.sendMessage({ calling: 'dropskit_token_validator', email: document.getElementById('email').value, token: document.getElementById('token').value }, (response) => {
                    $('#spinnerSave').hide();
                    if (response.status == 'error' || response.status == 'success') {
                        showStatus(response.status, response.message);
                        resolve(false);

                        // save settings to local storage in function.js
                        dropskit_localStorage_saver({ domain: document.getElementById('domain').value });
                        dropskit_localStorage_saver({ token: document.getElementById('token').value });
                        dropskit_localStorage_saver({ email: document.getElementById('email').value });

                        chrome.runtime.sendMessage({ calling: 'dropskit_auto_signin_robot' });
                    }
                    resolve(true);
                });
            }
        });
    }

    start_robot() {

        dropskit_localStorage_loader().then((credentials) => {
            if ((credentials.email) && (credentials.token) && (credentials.token)) {
                document.getElementById('domain').value = credentials.domain;
                document.getElementById('email').value = credentials.email;
                document.getElementById('token').value = credentials.token;
            }
        });

        document.getElementById('save').addEventListener('click', () => {

            this.dropskit_credential_validator().then(function (response) {
                if (response) {
                    alert('aaa');
                    // save settings to local storage in function.js
                    // i don't why this function is not running here
                    // but running at dropskit_credential_validator()
                    dropskit_localStorage_saver({ token: document.getElementById('token').value });
                    dropskit_localStorage_saver({ email: document.getElementById('email').value });
                    document.getElementById('message').innerHTML = 'Settings saved successfully';

                    chrome.runtime.sendMessage({ calling: 'dropskit_auto_signin_robot' });
                }

            });

            chrome.runtime.sendMessage({ calling: 'dropskit_auto_signin_robot' });

            /*  chrome.runtime.sendMessage({ calling: "uploadToEbay" }, (response) => {
                 if (response.error == 1) {
                     $('#message').html(response.message);
                 } else {
                     console.log('signed in');
                 }
             }); */
        });

        document.getElementById('uploadToEbay').addEventListener('click', () => {
            chrome.runtime.sendMessage({ calling: "uploadToEbay" }, (response) => {
                if (response.error == 1) {
                    $('#message').html(response.message);
                } else {
                    console.log('signed in');
                }
            }
            );
        });
        document.getElementById('test').addEventListener('click', () => {
            chrome.runtime.sendMessage({ calling: "testing" }, () => {
                console.log('calling again. . . ');
                chrome.runtime.sendMessage({ calling: 'dropskit_upload' });
            });
        });
    }

}

window.inst = new Core();