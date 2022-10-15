import axios from "axios";

const ENDPOINT = "https://graphql.bitquery.io";
const API_KEY = "";

const getBitqueryData = async (query) => {
  const res = await axios({
    method: "POST",
    url: ENDPOINT,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-API-KEY": API_KEY,
    },
    data: JSON.stringify({ query }),
    mode: "cors",
  });
  return await res.data;
};

const dateFunc = (startDate, days, add) => {
  /**
   * Function to add or subtract days
   * @param  {Date} startDate Date object JS
   * @param  {Number} days Days to be added or subtracted
   * @param  {bool}  add Add or subtract arg
   * @return {string}      Return string with "yyyy-mm-dd" style
   */

  if (add) {
    return new Date(new Date().setDate(startDate.getDate() + days))
      .toISOString()
      .split("T")[0];
  } else {
    return new Date(new Date().setDate(startDate.getDate() - days))
      .toISOString()
      .split("T")[0];
  }
};

export const getTokenInfo = async () => {
  let tillDate = new Date();
  let sinceDate = dateFunc(tillDate, 60);
  tillDate = tillDate.toISOString().split("T")[0];

  let queryOHLC = `{
  ethereum(network: bsc) {
    dexTrades(
      options: {asc: "timeInterval.day"}
      date: {since: "${sinceDate}", till: "${tillDate}"}
      priceAsymmetry: {lteq: 10},
      tradeAmountUsd: {gteq: 1}
      exchangeName: {in: ["Pancake", "Pancake v2"]}
      baseCurrency: {is: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}
      quoteCurrency: {is: "0xe9e7cea3dedca5984780bafc599bd69add087d56"}
    ) {
      timeInterval {
        day(count: 1)
      }
      baseCurrency {
        symbol
        address
      }
      baseAmount
      quoteCurrency {
        symbol
        address
      }
      high: quotePrice(calculate: maximum)
      low: quotePrice(calculate: minimum)
      open: minimum(of: block, get: quote_price)
      close: maximum(of: block, get: quote_price)
    }
  }
}
`;

  let data = await getBitqueryData(queryOHLC);

  const output = data.data.ethereum;

  const ohlcData = [];
  output.dexTrades.map((item) =>
    ohlcData.push({
      time: item.timeInterval.day,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    })
  );

  return {
    quoteSymbol: output.dexTrades[0].quoteCurrency.symbol,
    baseSymbol: output.dexTrades[0].baseCurrency.symbol,
    ohlcData: ohlcData,
  };
};
