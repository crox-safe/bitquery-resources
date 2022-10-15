# TradingView + Bitquery

![TradingViewXBitquery|690x345](https://global.discourse-cdn.com/standard11/uploads/bitquery/original/1X/3d4c3b18a61e9e8404ad5b631e0ac07edc59b325.jpeg)

## Table of Contents

1. [Introduction](#introduction)
2. [Requirements](#requirements)
3. [Code](#code)
4. [Overview](#overview)

## Introduction

In this short post we will see how to use https://www.tradingview.com/lightweight-charts/ with a react application.

> To run just use: \
> `npm install` \
> Edit file `bitqueryData.js` with your API Key \
> `npm start`

What will it be useful for? This mini application will help us to create an OHLC chart to represent the price of a token, in this case WBNB/BUSD.

This application will be quite simple, however **if the article has enough support we will update the application to be able to**:

- Display the marketcap
- Show the total trades
- Show the last purchases and sales
- Other analytics

So don't forget to comment on this article and let us know what features you would like to see!

## Requirements

Some of the things we will need are:

- [Bitquery API Key](https://community.bitquery.io/t/sign-up-on-bitquery-and-get-api-key/1161)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable)
- OHLC Query (see this [example](https://graphql.bitquery.io/ide/OHLC-Day-w-Filters--BSC))
- [Axios](https://github.com/axios/axios) (`npm install axios --save`)
- [React Wrapper for Lightweight Charts](https://github.com/trash-and-fire/lightweight-charts-react-wrapper)

Also, you don't need to be a javascript or react expert to understand the code.

## Code

To start with our application we will use the `create-react-app` package to create the application in a fast way.

```bash
npx create-react-app bitquery-tradingview
cd bitquery-tradingview
```

Now install axios:
`npm install axios --save`

What we will do now is to create the following files with the following codes:

`src/components/ChartBitquery.js`:

```javascript
import { useEffect, useState } from "react";

import { Chart, CandlestickSeries } from "lightweight-charts-react-wrapper";
import { getTokenInfo } from "../utils/bitqueryData";
export function ChartBitquery() {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState();

  useEffect(() => {
    getTokenInfo().then((data) => {
      setData(data);
      setLoading(false);
    });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <Chart width={800} height={600}>
        <CandlestickSeries data={data.ohlcData}>
          <br />
          <div style={{ fontWeight: "bold", fontSize: "40px" }}>
            Currencies: {data.baseSymbol} / {data.quoteSymbol}
          </div>
          <br />
        </CandlestickSeries>
      </Chart>
    </div>
  );
}
```

#### What is this?

This component will help us to obtain the OHLC data using a `useEffect` without dependencies to load only once the chart and the data. If the data is being obtained it will show a text `Loading...`, when it finishes loading it will return the component.
Remember to put your API Key in `API_KEY`

`src/utils/bitqueryData.js`:

```javascript
import axios from "axios";

const ENDPOINT = "https://graphql.bitquery.io";
const API_KEY = "API-KEY";

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
```

#### What is this?

- We define the endpoint and the api key
- We create the function `getBitqueryData` to get the result of a query without having to rewrite the code.
- We create `dateFunc` that will be used to pass a `Date` object to subtract days and use it in the `since` and `till` fields of Bitquery.
- We create the function `getTokenInfo` which will allow us to obtain the token symbols as well as the OHLC.

Now we will go to the `App.js` file and delete everything and put this:
`App.js`:

```javascript
import { ChartBitquery } from "./components/ChartBitquery";

export default function App() {
  return <ChartBitquery />;
}
```

This will allow us to load our component in our application.

We have already finished the code, it's as simple as that!
In order to test our application we will execute:

`npm start`

This will raise a page on `localhost:3000` (or another port if you have it running).

![image|591x500, 75%](https://global.discourse-cdn.com/standard11/uploads/bitquery/original/1X/3db67c983ab20b5232232f9b8b352457ab7df4e5.png)

## Overview:

In this short article we saw how to create a chart with TradingView and Bitquery, if you want us to update the post with new features add a comment and interact!

Something that will be very useful will be to read this article:

https://community.bitquery.io/t/how-to-use-bitquery-in-a-secure-way-in-the-front-end/1177

--- Bitquery Resources ---

[Bitquery Page](https://bitquery.io/)

[Bitquery Forum](https://community.bitquery.io/)

[Bitquery Telegram](https://t.me/Bloxy_info)
