const r2 = require('r2');
const formatter = require('../config/').formatter;

const readCexQuotation = async crypto => {

  try {

    let cexResponse = await r2.get(`https://cex.io/api/last_price/${crypto.code}/EUR`).json;
    let euro = Number(crypto.amount) * Number(cexResponse.lprice);
    
    let formattedEuro = formatter.format(euro);
    let cryptoCode = crypto.code;

    return {
      cryptoCode,
      euro,
      formattedEuro
    }

  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = {
  readCexQuotation
}