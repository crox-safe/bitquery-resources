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
