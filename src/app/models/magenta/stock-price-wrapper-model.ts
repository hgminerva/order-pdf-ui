import {StockPriceModel} from "./stock-price-model";

export class StockPriceWrapperModel {
  symbol: string;
  symbolDescription: string;
  exchange: string;
  stockPrices: Array<StockPriceModel>;
}