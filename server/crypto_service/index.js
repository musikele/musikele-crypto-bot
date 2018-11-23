const formatter = require('./../config').formatter;
const walletReader = require('./../wallet_reader');
const cexService = require('./../cex_service');
const historyService = require('./../history_service');

const getCryptoTotal = async () => {

  const myCrypto = await walletReader.readWallet();

  let total = 0;
  let myCryptoLength = myCrypto.length;
  let index = 0;

  let result = {};
  result.currencies = [];
  result.total = {};

  for (let i = 0; i < myCrypto.length; i++) {

    const crypto = myCrypto[i];
    try {

      let {
        cryptoCode,
        euro,
        formattedEuro
      } = await cexService.readCexQuotation(crypto);
      result.currencies.push({
        cryptoCode,
        euro,
        formattedEuro
      })
      console.log(`Total Euro owned in ${cryptoCode}: ${formattedEuro}`)
      total += euro;
    } catch(e) {
      throw e;
    }

  }

  printTotal(total);
  result.total = {
    total,
    date: new Date()
  }
  return result;
}

const printTotal = (total) => {
  console.log();
  let formattedTotal = formatter.format(total);
  console.log(`Total money owned: ${formattedTotal}`);

  //historyService.saveDataPoint(formattedTotal);
}

//main();
module.exports = {
  getCryptoTotal
};