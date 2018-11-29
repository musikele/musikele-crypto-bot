const CEXIO = require('cexio-api-node');
require('dotenv').config();

const cexPub = new CEXIO().promiseRest;

const apiKey = process.env.CEX_API_KEY;
const apiSecret = process.env.CEX_API_SECRET;
const clientId = process.env.CEX_CLIENT_ID;

const nowInUnixTime = Number((new Date().getTime() / 1000).toFixed(0));

if (!apiKey || !apiSecret || !clientId)
  throw new Error('one of apiKey, apiSecret or clientId is not set');

const cexAuth = new CEXIO(clientId, apiKey, apiSecret).promiseRest;

const MINIMUM_CEX_ACQUIRE = 20;
const MINIMUM_TIME_UNIT = 60 * 60;

async function main() {
  const currentBtcEurPrice = await getLastBtcEurPrice();
  console.log(`BTC/EURO: ${currentBtcEurPrice}`);

  const { totalEuroRemaining, totalBTCRemaining } = await getAccountData();
  console.log(`Totale Euro: ${totalEuroRemaining}`);
  console.log(
    `Totale BTC: ${totalBTCRemaining} (che corrispondono a EUR ${totalBTCRemaining *
      currentBtcEurPrice})`
  );

  try {
    await checkThereAreNoPendingOrders();
    console.log('non ci sono altri ordini in corso');
  } catch (e) {
    

    const {
      time: lastOrderAskedAt,
      id: lastOrderId,
      price: lastOrderPrice,
      amount: lastOrderAmount
    } = e.orders[0];

    const lastOrderDateAskedAt = new Date(Number(lastOrderAskedAt));
    const lastOrderDateAskedAtUnixTime = Number(
      (lastOrderDateAskedAt / 1000).toFixed(0)
    );
    if (nowInUnixTime >= lastOrderDateAskedAtUnixTime + MINIMUM_TIME_UNIT) {
      console.log(
        `Order is ${(
          (nowInUnixTime - lastOrderDateAskedAtUnixTime) /
          MINIMUM_TIME_UNIT
        ).toFixed(1)} hours old`
      );

      //controllo comunque che il prezzo non sia sceso troppo, se no vendi
      if (
        currentBtcEurPrice <=
        Number(lastOrderPrice) - Number(lastOrderPrice) * 0.01
      ) {
        console.log('Order is under 1% loss');
        const cancelOrderResult = await cexPub.cancel_order(lastOrderId);
        console.log(cancelOrderResult);

        // il prezzo è troppo basso, vendi subito
        const adjustedPriceToSell = (currentBtcEurPrice / 2).toFixed(1);
        const placeOrderResult = await cexPub.place_order(
          'BTC/EUR',
          'sell',
          lastOrderAmount,
          adjustedPriceToSell
        );
        console.log(placeOrderResult);
        return;
      }
    }
  }

  //check if a transaction has appened less then 1d ago

  const dateFrom = Number(nowInUnixTime - MINIMUM_TIME_UNIT);

  const archivedOrdersResponse = await cexPub.archived_orders(
    'BTC/EUR',
    1, //1, // limit
    nowInUnixTime, // dateTo
    dateFrom, //dateFrom
    nowInUnixTime, //lastTxDateTo
    dateFrom, //lastTxDateFrom
    'd' //status
  );

  console.log(
    `Ultimi eventi CEX: ${
      archivedOrdersResponse.length
    } - Ultimo evento su CEX: ${archivedOrdersResponse[0].lastTxTime}`
  );

  if (archivedOrdersResponse.length > 0) {
    const { lastTxTime } = archivedOrdersResponse[0];
    if (
      nowInUnixTime <=
      new Date(lastTxTime).getTime() / 1000 + MINIMUM_TIME_UNIT
    ) {
      console.log(
        `L'ultimo evento è accaduto ${MINIMUM_TIME_UNIT /
          3600} ore fa, chiudo e aspetto la prossima tornata`
      );
      return;
    }
  }

  //buy
  let nextOrderAmount = MINIMUM_CEX_ACQUIRE;
  if (totalEuroRemaining < MINIMUM_CEX_ACQUIRE) {
    console.log('Tempo di vendere');
    //add 1% to price to sell
    const adjustedPriceToSell = (
      currentBtcEurPrice +
      currentBtcEurPrice * 0.008
    ).toFixed(1);
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
  const reducedBtcEurPrice = currentBtcEurPrice + 10;
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
  .catch(e => console.log);

async function checkThereAreNoPendingOrders() {
  const openOrdersResult = await cexAuth.open_orders('BTC/EUR');
  console.log(`Ci sono ordini in corso? ${JSON.stringify(openOrdersResult)}`);
  if (openOrdersResult.length > 0) {
    const error = new Error('OrderAlreadyPresent');
    error.orders = openOrdersResult;
    throw error;
  }
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
