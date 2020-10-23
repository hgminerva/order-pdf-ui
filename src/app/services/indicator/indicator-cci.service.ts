import { Injectable } from '@angular/core';
import { OHLCDataModel } from "../../models/data/ohlc-data-model"
import { IndicatorCCIDataModel } from "../../models/indicator/cci-data-model"

@Injectable({
  providedIn: 'root'
})
export class IndicatorCCIService {

  constructor() { }

  public computeCCI(data: OHLCDataModel[], period: number) : IndicatorCCIDataModel[] {
    let cciData: IndicatorCCIDataModel[] = [];
    let smaData: number[] = [];      // sma data array
    let sma: number = 0;
    let md: number = 0;
    let cci: number = 0;

    //data.sort((a,b) => { return new Date(a.date).getTime() - new Date(b.date).getTime(); });

    for (var i = 0; i < data.length; i++) {
      if(i < period) {
        smaData.push(data[i].close);
        cciData.push({ date: data[i].date, sma: 0, md: 0, cci: 0 });
      } else {
        if(i == period) {
          smaData.push(data[i].close);
        } else {
          smaData.splice(0,1);
          smaData.push(data[i].close);
        }
        // Simple moving average computation
        var total = 0;
        for(var s in smaData)  total += smaData[s];
        sma = total / period;
        // Mean deviation computation
        total = 0;
        for(var s in smaData) total += Math.abs(sma - smaData[s]);
        md = total / period;
        // commodity channel index compuation
        cci = (data[i].close - sma) / (0.015 * md);
        cciData.push({ date: data[i].date, sma: sma, md: md, cci: cci });
      }
    }

    return cciData;
  }
}
