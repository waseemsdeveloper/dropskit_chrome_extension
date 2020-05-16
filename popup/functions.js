function dropskit_localStorage_saver(data) {
  return new Promise((resolve) => {
    chrome.storage.sync.set(data, resolve);
  })
}

function dropskit_localStorage_loader(keys) {
  return new Promise((resolve) => {

    chrome.storage.sync.get(keys, (data) => {

      if (Array.isArray(keys)) {
        resolve(data);
      } else {
        resolve(data); // this will return keys from local storage
        /*  resolve(data[keys]); */ // not working i don't know why :-(
      }
    });
  })
}

function showStatus(status, message) {

  if (status == 'error') {

    document.getElementById('error').style.display = 'block';
    document.getElementById('errorMsg').innerHTML = message;

    setTimeout(() => {
      document.getElementById('error').style.display = 'none';
    }, 5000);

  } else if (status == 'success') {

    document.getElementById('success').style.display = 'block';
    document.getElementById('successMsg').innerHTML = message;

    setTimeout(() => {
      document.getElementById('success').style.display = 'none';
    }, 5000);

  }
}