const CEXIO = require('cexio-api-node');
require('dotenv').config();

const cexPub = new CEXIO().promiseRest;

const apiKey = process.env.CEX_API_KEY;
const apiSecret = process.env.CEX_API_SECRET;
const clientId = process.env.CEX_CLIENT_ID;

if (!apiKey || !apiSecret || !clientId)
  throw new Error('one of apiKey, apiSecret or clientId is not set');

const cexAuth = new CEXIO(clientId, apiKey, apiSecret).promiseRest;

const MINIMUM_CEX_ACQUIRE = 20;

async function main() {
  const lastBtcEurPrice = await getLastBtcEurPrice();
  console.log(`BTC/EURO: ${lastBtcEurPrice}`);

  const { totalEuroRemaining, totalBTCRemaining } = await getAccountData();
  console.log(`Totale Euro: ${totalEuroRemaining}`);
  console.log(
    `Totale BTC: ${totalBTCRemaining} (che corrispondono a EUR ${totalBTCRemaining *
      lastBtcEurPrice})`
  );

  try {
    await checkThereAreNoPendingOrders();
    console.log('non ci sono altri ordini in corso');
  } catch (orders) {
    throw new Error('TODO - still to fix this case');
  }

  let nextOrderAmount = MINIMUM_CEX_ACQUIRE;
  if (totalEuroRemaining < MINIMUM_CEX_ACQUIRE) {
    console.log('Tempo di vendere');
    //add 1% to price to sell
    const adjustedPriceToSell = lastBtcEurPrice + lastBtcEurPrice / 100;
    console.log(`prezzo di vendita: ${adjustedPriceToSell}`);
    //SELL
    const placeOrderResult = await cexPub.place_order(
      'BTC/EUR',
      'sell',
      totalBTCRemaining,
      adjustedPriceToSell
    );
    console.log(placeOrderResult);
    return;
  }
  console.log(`si compra ancora. Next Buy: ${nextOrderAmount}`);
  const reducedBtcEurPrice = lastBtcEurPrice + 10;
  const btcNextOrderAmount = nextOrderAmount / reducedBtcEurPrice;
  console.log(`in BTC: ${btcNextOrderAmount}`);

  //BUY
  const placeOrderResult = await cexPub.place_order(
    'BTC/EUR',
    'buy',
    btcNextOrderAmount,
    reducedBtcEurPrice
  );
  console.log(placeOrderResult);

  console.log(`Il prossimo ordine sarà di ${nextOrder}`);
}

main()
  .then(() => {
    console.log('Program finished.');
  })
  .catch(e => console.error);

async function checkThereAreNoPendingOrders() {
  const openOrdersResult = await cexAuth.open_orders('BTC/EUR');
  console.log(`Ci sono ordini in corso? ${JSON.stringify(openOrdersResult)}`);
  if (openOrdersResult.length > 0) throw new Error(openOrdersResult);
}

async function getAccountData() {
  const accountBalanceResult = await cexAuth.account_balance();
  const totalEuroRemaining = Number(accountBalanceResult.EUR.available);
  const totalBTCRemaining = Number(accountBalanceResult.BTC.available);
  return { totalEuroRemaining, totalBTCRemaining };
}

async function getLastBtcEurPrice() {
  const lastPriceResult = await cexPub.last_price('BTC/EUR');
  const lastBtcEurPrice = Number(lastPriceResult.lprice);
  return lastBtcEurPrice;
}
