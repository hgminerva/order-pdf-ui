import { Injectable } from '@angular/core';
import { OHLCDataModel } from "../../models/data/ohlc-data-model"
import { IndicatorRSIDataModel } from "../../models/indicator/rsi-data-model"

@Injectable({
  providedIn: 'root'
})
export class IndicatorRSIService {

  constructor() { }

  public computeRSI(data: OHLCDataModel[], period: number) : IndicatorRSIDataModel[] {
    let rsiData: IndicatorRSIDataModel[] = [];
    let gain: number = 0;
    let loss: number = 0;
    let gainData: number[] = [];
    let averageGain: number = 0;
    let previousAverageGain: number = 0;
    let lossData: number[] = [];
    let averageLoss: number = 0;
    let previousAverageLoss: number = 0;
    let rs: number = 0;
    let rsi: number = 0;

    for (var i = 0; i < data.length; i++) {
      if(i==0) {
        // data
        gainData.push(0);
        lossData.push(0);
        // compute values
        gain = 0;
        loss = 0;
        averageGain = 0;
        averageLoss = 0;
        rs = 0;
        rsi = 0;
      }
      else {
        // compute gain and loss
        gain = 0; loss = 0;
        if(data[i].close > data[i-1].close) gain = data[i].close - data[i-1].close;
        if(data[i].close < data[i-1].close) loss = data[i-1].close - data[i].close;
        // data less than the period
        if(i < period) {
          gainData.push(gain);
          lossData.push(loss);
          averageGain = 0;
          averageLoss = 0;
          rs = 0;
          rsi = 0;
        // date is equal or more than the period
        } else {
          var totalGain = 0;
          var totalLoss = 0;
          if(i==period) {
             for(var g in gainData)  totalGain += gainData[g];
             for(var l in lossData)  totalLoss += lossData[l];
          } else {
            totalGain = (previousAverageGain * 13) + gain;
            totalLoss = (previousAverageLoss * 13) + loss;
          }
          averageGain = totalGain / period;
          averageLoss = totalLoss / period;
          if(averageLoss == 0) {
            rs = 0;
            rsi = 100;
          } else {
            rs = averageGain / averageLoss;
            rsi = 100 - (100/(1+rs));
          }
        }
      }
      // save
      rsiData.push({
        date: data[i].date,
        close: data[i].close,
        gain: gain,
        loss: loss,
        averageGain: averageGain,
        averageLoss: averageLoss,
        rs: rs,
        rsi: rsi,
      });

      previousAverageGain = averageGain;
      previousAverageLoss = averageLoss;
    }
    return rsiData;
  }
}
