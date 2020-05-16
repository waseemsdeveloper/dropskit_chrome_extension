var api = "https://app.adsflycircle.com/";

function setToLocalStorage(data) {
    return new Promise((resolve) => {
        console.log('data');
        chrome.storage.sync.set(data, resolve);
    })
}

/* function getFromLocalStorage(keys) {
    return new Promise((resolve) => {
        chrome.storage.sync.get(keys, (data) => {
            if (Array.isArray(keys)) {
                resolve(data)
            } else {
                resolve(data[keys])
            }
        });
    })
} */

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    switch (request.calling) {
        case "uploadToEbay":
            let ute = new EbayToDropskit('aws', 'token');
            ute.uploadToEbay().then(sendResponse);

            return true;

        case "dropskit_token_validator":

            let dtv = new EbayToDropskit();
            dtv.dropskit_token_validator(request.email, request.token).then(sendResponse);

            return true;

        case 'dropskit_auto_signin_robot':

            let dasr = new EbayToDropskit('aws', 'asw');
            dasr.dropskit_auto_signin_robot();

            return true;

        case "dropskit_revise_lister":

            let drvl = new EbayToDropskit('aws', 'aws');
            drvl.dropskit_revise_lister(request.file);

            return true;

        case "dropskit_uploader_bot":
            console.log('triggered');
            let dub = new EbayToDropskit('aws', 'aws');
            dub.dropskit_uploader_bot();

            return true;

        case "dropskit_uploader_bot_stop":
            console.log('stopppppp');
            let dubs = new EbayToDropskit('aws', 'aws');
            dubs.stop_dropskit_uploader_bot();

            return true;

        case "testing":
            console.log('testing');
            let testing = new EbayToDropskit('aws', 'aws');
            testing.okay();

            return true;
    }
}

);