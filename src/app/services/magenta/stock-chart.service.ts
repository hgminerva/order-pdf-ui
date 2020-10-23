import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { StockPriceModel } from '../../models/magenta/stock-price-model';
import { StockPriceWrapperModel } from '../../models/magenta/stock-price-wrapper-model';

import { ScreenerDataModel } from '../../models/screener/screener-data-model';
import { PcrDataModel } from '../../models/screener/pcr-data-model';

@Injectable({
  providedIn: 'root'
})
export class StockChartService {

  readonly apiURL = "https://www.magentatrader.com/api/version4";

  constructor(private http: HttpClient) { }

  public getStockPriceWrapper(symbol: string): any {
    const stockPriceWrapperObservable = new Observable(observer => {
      let stockPriceWrapperModel = new StockPriceWrapperModel();
      let stockPrices = new Array<StockPriceModel>();
      this.http.get<any>(this.apiURL + "/getStockPrice/" + symbol).subscribe(data => {
        stockPriceWrapperModel.exchange = data.Exchange;
        stockPriceWrapperModel.symbol = data.Symbol;
        stockPriceWrapperModel.symbolDescription = data.SymbolDescription;

        for (var i = 0; i < data.StockPrices.length; i++) {
          stockPrices.push({
            quoteDate: data.StockPrices[i].QuoteDate,
            openPrice: data.StockPrices[i].OpenPrice,
            highPrice: data.StockPrices[i].HighPrice,
            lowPrice: data.StockPrices[i].LowPrice,
            closePrice: data.StockPrices[i].ClosePrice,
            volume: data.StockPrices[i].Volume
          });
        }
        stockPriceWrapperModel.stockPrices = stockPrices;

        observer.next(stockPriceWrapperModel);
      });
    });
    return stockPriceWrapperObservable;
  }

  public getScreenerData(objParameters: any): Observable<ScreenerDataModel[]> {
    const screenerDataObservable = new Observable<ScreenerDataModel[]>(observer => {
      let screenerDataModelArray: ScreenerDataModel[] = [];

      let tradeAction = objParameters.tradeAction;
      let candleType = objParameters.candleType;
      let trend = objParameters.trend;

      let options: any = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
      this.http.get("https://www.magentatrader.com/api/version4/getScreener/" + tradeAction + "/" + candleType + "/" + trend, options).subscribe(
        results => {
          if (results["length"] > 0) {
            for (var i = 0; i < results["length"]; i++) {
              screenerDataModelArray.push({
                Symbol: this.replaceSymbol(results[i].Exchange, results[i].SymbolDescription),
                SymbolRaw: results[i].SymbolDescription,
                Description: results[i].Description,
                Exchange: results[i].Exchange,
                Price: results[i].ClosePrice,
                Vol: Math.round(results[i].Volume / 10000) / 100
              });
            }

            observer.next(screenerDataModelArray);
          }
        }
      );
    });

    return screenerDataObservable;
  }

  public getPcrData(): Observable<PcrDataModel[]> {
    const pcrDataObservable = new Observable<PcrDataModel[]>(observer => {

      let pcrDataModelArray: PcrDataModel[] = [];
      let options: any = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

      // this.http.get("http://127.0.0.1:8000/api/orders", options).subscribe(
      //   results => {
      //     if (results["data"].length > 0) {
      //       for (var i = 0; i < results["data"].length; i++) {
      //         pcrDataModelArray.push({
      //           id: results["data"][i].id,
      //           order_number: results["data"][i].order_number,
      //           customer_name: results["data"][i].customer_name,
      //           email: results["data"][i].email,
      //           customer_address: results["data"][i].customer_address,
      //           product_code: results["data"][i].product_code,
      //           result: results["data"][i].result
      //         });
      //       }
      //       observer.next(pcrDataModelArray);
      //     }
      //   }
      // );

      pcrDataModelArray.push({
        id: 0,
        order_number: "0000000001",
        customer_name: "Harold Glenn Minerva",
        email: "hgminerva@gmail.com",
        customer_address: "Minglanilla Cebu City",
        product_code: "PRC-00001",
        result: "Negative"
      });

      pcrDataModelArray.push({
        id: 0,
        order_number: "0000000002",
        customer_name: "Noah Oliver Rigonan",
        email: "oliverrigonan@gmail.com",
        customer_address: "Sambag Uno, Cebu City",
        product_code: "PRC-00005",
        result: "Negative"
      });

      observer.next(pcrDataModelArray);
    });
    return pcrDataObservable;
  }

  public updatePcrData(objData: PcrDataModel): any {
    const o = new Observable(observer => {
      let options: any = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

      this.http.put<any>("http://127.0.0.1:8000/api/orders", JSON.stringify(objData), options).subscribe(data => {
        observer.next(data)
      });
    });

    return o;
  }

  public importPcrData(objDatas: string): any {
    const o = new Observable(observer => {

      let JSONParsed = JSON.parse(objDatas);
      let JSONData = [];

      if (JSONParsed["length"] > 0) {
        for (let i = 0; i <= JSONParsed["length"] - 1; i++) {
          JSONData.push({
            order_number: JSONParsed[i]["order_number"],
            customer_name: JSONParsed[i]["customer_name"],
            email: JSONParsed[i]["email"],
            customer_address: JSONParsed[i]["customer_address"],
            product_code: JSONParsed[i]["product_code"],
            result: JSONParsed[i]["result"]
          });
        }
      }

      let options: any = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

      this.http.put<any>("http://127.0.0.1:8000/api/orders", JSON.stringify(JSONData), options).subscribe(data => {
        observer.next(data)
      });
    });

    return o;
  }


  public replaceSymbol(exchange, symbol) {
    let returnSymbol;

    if (exchange == "TSX") {
      returnSymbol = symbol.replace("TSX-", "");
    } else if (exchange == "FOREX") {
      returnSymbol = symbol.replace("FX-", "");
    } else if (exchange == "PSE") {
      returnSymbol = symbol.replace("PSE-", "");
    } else {
      returnSymbol = symbol;
    }

    return returnSymbol;
  }

  public getEODDataWeekly(symbol: string): any {
    let stockPriceWrapperModel = new StockPriceWrapperModel();
    let stockPrices = new Array<StockPriceModel>();

    const observable = new Observable(observer => {
      this.http.get<any>(this.apiURL + "/getStockPriceEod/" + symbol + "/w").subscribe(data => {
        stockPriceWrapperModel.exchange = data.Exchange;
        stockPriceWrapperModel.symbol = data.Symbol;
        stockPriceWrapperModel.symbolDescription = data.SymbolDescription;

        for (var i = 0; i < data.StockPrices.length; i++) {
          stockPrices.push({
            quoteDate: data.StockPrices[i].QuoteDate,
            openPrice: data.StockPrices[i].OpenPrice,
            highPrice: data.StockPrices[i].HighPrice,
            lowPrice: data.StockPrices[i].LowPrice,
            closePrice: data.StockPrices[i].ClosePrice,
            volume: data.StockPrices[i].Volume
          });
        }
        stockPriceWrapperModel.stockPrices = stockPrices;

        observer.next(stockPriceWrapperModel);
      });
    });
    return observable;
  }

  public updateEodData(symbol: string): any {
    const o = new Observable(observer => {
      this.http.get<any>(this.apiURL + "/getStockPriceEodAndUpdate/" + symbol).subscribe(data => {
        observer.next(data)
      });
    });
    return o;
  }


}
