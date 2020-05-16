class EbayToDropskit {

    constructor(email, token) {
        chrome.storage.sync.get((data) => {
            var padu = data.domain;
        });

        this.api_end_point = "http://test.dropskit.com/dropskit/api/";
        this.email = email;
        this.token = token;
    }
    // This function is used to check sign in every custom minutes  
    dropskit_auto_signin_checker() {
        var url = "https://bulksell.ebay.com/ws/eBayISAPI.dll?FileExchangeUploadForm";
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.addEventListener('readystatechange', function (response) {
                if (response.currentTarget.readyState !== 4 || response.currentTarget.status !== 200) {
                    return;
                }
                try {
                    if (response.currentTarget.responseURL.includes('signin.ebay.com')) {
                        /*   chrome.tabs.create({ url: response.currentTarget.responseURL, active: false }, function () {
                              chrome.webNavigation.onCompleted.addListener(function (details) {
                                  chrome.tabs.sendMessage(details.tabId, { action: "autoSignInMonitor" });
                                  chrome.tabs.remove(details.tabId);
                              });
                          }); */
                    } else {
                        resolve(true);
                    }
                } catch (e) {
                    resolve(false);
                }
            });
            xhr.open('GET', url);
            xhr.send();
        });
    }
    // set time intervel to run automatically
    dropskit_auto_signin_robot() {
        if (this.timeForChecker) {
            clearInterval(this.timeForChecker);
        }
        this.timeForChecker = setInterval(() => {
            this.dropskit_auto_signin_checker().then((resp) => {
            });
        }, 60000);
    }
    dropskit_upload() {
        if (this.timeForUpload) {
            clearInterval(this.timeForUpload);
        }
        this.timeForUpload = setInterval(() => {
            this.testing().then((resp) => {
            });
        }, 60000);
    }
    // this function is used to check signin in every other functions.
    dropskit_check_login_status() {
        var api_end_point = "https://bulksell.ebay.com/ws/eBayISAPI.dll?FileExchangeUploadForm";
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.addEventListener('readystatechange', function (response) {
                var isIt = response.currentTarget;
                if (isIt.readyState !== 4 || isIt.status !== 200) {
                    return;
                }
                const { responseText } = isIt;
                const responseURL = isIt.responseURL;
                try {
                    if (responseURL.includes('//signin.ebay.com')) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                } catch (e) {
                    resolve(false);
                }
            });
            xhr.open('GET', api_end_point);
            xhr.send();
        });
    }
    dropskit_token_validator(email, token) {

        const url = this.api_end_point + 'validate.php?' + 'email=' + email + '&token=' + token;

        return new Promise(resolve => {
            try {

                const xhr = new XMLHttpRequest();

                xhr.addEventListener("readystatechange", function () {

                    if (this.readyState === 4) {
                        //  console.log(this.responseText);
                        if (this.responseText.includes('invalid credentials')) {
                            resolve({ status: 'error', message: 'Invalid credentials.' });
                        } else {
                            resolve({ status: 'success', message: 'Valid credentials.' });
                        }
                    }
                });

                xhr.open('GET', url);
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xhr.send();

            } catch (e) {
                resolve(false);
            }
        });
    }
    dropskit_file_reciever() {

        let url = this.api_end_point + 'listing_files.php?' + 'email=wsajjadh@gmail.com&' + 'token=dropskit12345';

        try {
            return new Promise(resolve => {
                var xhr = new XMLHttpRequest();

                xhr.addEventListener('readystatechange', function (response) {
                    if (this.readyState == 4) {
                        resolve(this.responseText);
                        console.log(response.currentTarget.responseText);
                    }

                });
                console.log(url);
                xhr.open('GET', url);
                xhr.send();
            });
        } catch (e) {
            resolve(false);
        }
    }
    uploadToEbay() {
        return new Promise(resolve => {
            this.dropskit_check_login_status().then((resp) => {
                if (resp) {
                    resolve('logged in');
                } else {
                    var login = "<a target='_blank' href='https://bulksell.ebay.com/ws/eBayISAPI.dll?FileExchangeUploadForm'>login</a>";
                    resolve({ error: 1, message: 'Please ' + login + ' into your eBay account' });
                }
            });
        });
    }

    testing() {

        this.dropskit_file_reciever().then(function (response) {

            function processUploaded(currentTarget) {
                return new Promise(resolve => {
                    const { responseURL, responseText } = currentTarget;

                    var statuses = [{
                        text: 'Upload Success',
                        type: 'SUCCESS',
                    }, {
                        text: 'Ebay Error: The system has already processed',
                        type: 'ERROR',
                        code: 'FILENAME',
                    }, {
                        text: 'Ebay Error: Invalid email address specified',
                        type: 'ERROR',
                        code: 'EMAIL'
                    }, {
                        text: 'Ebay Error: Upload for the day exceeded the limit',
                        type: 'ERROR',
                        code: 'LIMIT',
                    }];

                    let status = statuses.find((s) => responseText.includes(s.text));

                    if (!status) {

                        var signInText = "<a target='_blank' href='https://bulksell.ebay.com/ws/eBayISAPI.dll?FileExchangeUploadForm'>sign in to your eBay account here</a>";
                        status = responseURL.includes(`//signin.ebay.com`)
                            ? { text: 'Please ' + signInText + ' and then try again', type: 'ERROR', code: 'LOGIN' }
                            : { text: 'Ebay Error: Unknown error at uploading file at ebay', type: 'ERROR', code: 'UNKNOWN', responseText };
                    }
                    if (status.type === 'SUCCESS') {
                        const searchedText = 'Your ref # is ';
                        const refStartIndex = responseText.indexOf(searchedText) + searchedText.length;
                        const refStopIndex = responseText.indexOf('.', refStartIndex);
                        var ref = responseText.substring(refStartIndex, refStopIndex);

                        resolve({ error: 0, message: 'Uploaded to eBay, Pending eBay Processing', reffId: ref });

                    } else if (status.type === 'ERROR') {
                        //console.log('test4');
                        console.log(status);
                        resolve({ error: 1, message: status.text });
                    }
                });
            }

            function reqListener() {

                var api_end_point = `https://bulksell.ebay.com/ws/eBayISAPI.dll?FileExchangeUploadSuccess`;
                var data = new FormData();
                var blob = new Blob([this.responseText], { type: 'text/csv' });
                var name = 'dropskit-listing-' + Date.now() + '.csv';

                return new Promise(resolve => {
                    try {
                        const xhr = new XMLHttpRequest();
                        xhr.addEventListener('readystatechange', function ({ currentTarget }) {
                            const { readyState, status } = currentTarget;
                            if (readyState !== 4 || status !== 200) {
                                return;
                            }
                            processUploaded(currentTarget).then((resp) => {
                                
                                console.log('aaaa');
                                chrome.runtime.sendMessage({ calling: 'dropskit_upload' });
                               
                                resolve(resp);
                                
                            });
                        });
                        xhr.open('POST', api_end_point);
                        const headers = [
                            ['Pragma', 'no-cache'],
                            ['Cache-Control', 'no-cache'],
                            ['Upgrade-Insecure-Requests', '1'],
                            ['Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'],
                            ['Access-Control-Allow-Origin', '*'],
                        ];
                        const fData = [
                            ['emailAddress', 'wsajjadh@gmail.com'],
                            ['uploadFile', blob, name],
                            ['Upload', 'Upload'],
                            ['mid', ''],
                            ['hmid', ''],
                        ];

                        headers.forEach(header => xhr.setRequestHeader(...header));
                        fData.forEach(item => data.append(...item));
                        xhr.send(data);
                    } catch (e) {
                        resolve(false);
                    }
                });

            }

            var oReq = new XMLHttpRequest();
            oReq.addEventListener("load", reqListener);
            oReq.open("GET", response);
            oReq.send();

        });
    }
}