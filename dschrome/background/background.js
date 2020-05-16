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
            let request_ute = new EbayToDropskit('aws', 'token');
            request_ute.uploadToEbay().then(sendResponse);

            return true;

        case "dropskit_token_validator":

            let dtv = new EbayToDropskit();
            dtv.dropskit_token_validator(request.email, request.token).then(sendResponse);

            return true;

        case 'dropskit_auto_signin_robot':

            let dasr = new EbayToDropskit('aws', 'asw');
            dasr.dropskit_auto_signin_robot();

            return true;

        case "poraw":
            sendResponse("poraw response");

            return true;

        case "testing":

            let testing = new EbayToDropskit('aws', 'aws');
            testing.testing(request.file);

            return true;

        case "dropskit_upload":
          //  console.log('triggered');
            let testing_upload = new EbayToDropskit('aws', 'aws');
            testing_upload.dropskit_upload();

            return true;
    }
}

);