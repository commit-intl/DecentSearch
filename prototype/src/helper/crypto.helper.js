const { generateKeyPair } = require('crypto');

const generateRsaPair = () =>
  new Promise((resolve, reject) => {

    generateKeyPair('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: ''
      }
    }, (err, publicKey, privateKey) => {
      if (err) {
        return reject(err);
      } else {
        return resolve({ public: publicKey, private: privateKey });
      }
    });
  });

module.exports = {
  generateRsaPair
};
