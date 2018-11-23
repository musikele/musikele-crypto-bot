const fs = require('fs');
const promisify = require('util').promisify;
const readFile = promisify(fs.readFile);

const readWallet = async () => {

  let  file = undefined;
  try {
    file = await readFile('my_crypto.json');
    const myCrypto = JSON.parse(file.toString());
    return myCrypto;
  }
  catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = {
  readWallet
}