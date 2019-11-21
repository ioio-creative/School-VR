import promisify from 'utils/js/myPromisify';


const authUrlRoot = 'http://localhost:59825';
const authUrl = `${authUrlRoot}/api/auth/authenticatelicense`;
const authUrlAuthCode = 'ZpQrkvmSH5jgfpqPM3F9MCTc';

const postAuthenticateLicense = (licenseKey, macAddress, callBack) => {
  fetch(authUrl, {
    method: 'POST',
    body: JSON.stringify({
      apiAuthCode: authUrlAuthCode,
      licenseKey: licenseKey,
      macAddress: macAddress
    }),
    headers: {
      'Content-Type': 'application/json' //'text/plain'
    }
  })
    .then(res => {
      // !!!Note!!! use '!=' instead of '!==' for status code check
      if (res.status != 200) {
        throw new Error('Error when postAuthenticateLicense\n'
          + `url: ${authUrl}\n`
          + `status: ${res.status}\n`
          + `licenseKey: ${licenseKey}\n`
          + `macAddress: ${macAddress}`
        );
      }
      return res.json();
    })
    .then(resJson => {
      callBack(null, {
        isAuthenticated: resJson.isAuthenticated
      });
    })
    .catch((err) => {
      callBack(err, null);
    });
}

const postAuthenticateLicensePromise = promisify(postAuthenticateLicense);


export {
  postAuthenticateLicense,
  postAuthenticateLicensePromise
};