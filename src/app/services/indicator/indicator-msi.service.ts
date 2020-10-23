import { Injectable } from '@angular/core';
import { OHLCDataModel } from "../../models/data/ohlc-data-model"
import { IndicatorMSIDataModel } from "../../models/indicator/msi-data-model"

@Injectable({
  providedIn: 'root'
})
export class IndicatorMSIService {

  constructor() { }

  public computeMSI(data: OHLCDataModel[]) : IndicatorMSIDataModel[] {
    let msiData: IndicatorMSIDataModel[] = [];

    let macd_index: number = 0;
    let ema3_closePrices: number = 0;
    let ema3_previous: number = 0;
    let ema3: number = 0;
    let ema8_closePrices: number = 0;
    let ema8_previous: number = 0;
    let ema8: number = 0;

    //data.sort((a,b) => { return new Date(a.date).getTime() - new Date(b.date).getTime(); });

    for (var i = 0; i < data.length; i++) {
      msiData.push({
        date: data[i].date,
        open: data[i].open,
        high: data[i].high,
        low: data[i].low,
        close: data[i].close,
        ema3: 0,
        ema8: 0,
        k: 0,
        kp: 0,
        d: 0,
      });
    }

    for (var i = 0; i < msiData.length; i++) {
      // EMA 3
      if (macd_index < 2) {
          ema3_closePrices = ema3_closePrices + msiData[i].close;
      } else if(macd_index == 2) {
          ema3 = ema3_closePrices / 3;
          ema3_previous = ema3;
          msiData[i].ema3 = ema3;
      } else if (macd_index > 2) {
          ema3 = (msiData[i].close * (2 / (3 + 1)) + ema3_previous * (1 - (2 / (3 + 1))));
          ema3_previous = ema3;
          msiData[i].ema3 = ema3;
      }
      // EMA 8
      if (macd_index < 7) {
          ema8_closePrices = ema8_closePrices + msiData[i].close;
      } else if(macd_index == 7) {
          ema8 = ema8_closePrices / 8;
          ema8_previous = ema8;
          msiData[i].ema8 = ema8;
      } else if (macd_index > 7) {
          ema8 = (msiData[i].close * (2 / (8 + 1)) + ema8_previous * (1 - (2 / (8 + 1))));
          ema8_previous = ema8;
          msiData[i].ema8 = ema8;
      }
      macd_index++;
    }

    let msi_index: number = 1;
    let msik_days: number = 12;
    let msik_lcollection: number[] = [];
    let msik_hcollection: number[] = [];
    let msik_lowest: number;
    let msik_highest: number;
    let msik_total: number = 0;
    let msikp_days: number = 3;
    let msikp_collection: number[] = [];
    let msikp_total: number = 0;
    let msid_days: number = 3;
    let msid_collection = [];
    for (var i = 0; i < msiData.length; i++) {
      // k collection
      if (msi_index <= msik_days) {
        msik_lcollection[msi_index - 1] = msiData[i].low;
        msik_hcollection[msi_index - 1] = msiData[i].high;
      } else {
        for (var l = 0; l < msik_days - 1; l++) msik_lcollection[l] = msik_lcollection[l + 1];
        for (var h = 0; h < msik_days - 1; h++) msik_hcollection[h] = msik_hcollection[h + 1];

        msik_lcollection[msik_days - 1] = msiData[i].low;
        msik_hcollection[msik_days - 1] = msiData[i].high;
      }
      // k lowest and highest
      if (msi_index >= msik_days) {
        for (var l = 0; l < msik_days; l++) {
          if (l == 0) msik_lowest = msik_lcollection[l];
          if (l > 0) if (msik_lcollection[l] < msik_lowest) msik_lowest = msik_lcollection[l];
        }
        for (var h = 0; h < msik_days; h++) {
          if (h == 0) msik_highest = msik_hcollection[h];
          if (h > 0) if (msik_hcollection[h] > msik_highest) msik_highest = msik_hcollection[h];
        }
      }
      // k value
      if (msi_index >= msik_days) {
          if (msik_highest - msik_lowest > 0) {
            msiData[i].k = 100 * ((msiData[i].close - msik_lowest) / (msik_highest - msik_lowest));
          }
      }
      // kp k collection
      if ((msi_index >= msik_days) && (msi_index < msik_days + msikp_days)) {
          msikp_collection[msi_index - msik_days] = msiData[i].k;
      } else if (msi_index >= msik_days + msikp_days) {
          for (var p = 0; p < msikp_days - 1; p++) msikp_collection[p] = msikp_collection[p + 1];
          msikp_collection[msikp_days - 1] = msiData[i].k;
      }
      // kp value
      if (msi_index >= msik_days + msikp_days - 1) {
          msik_total = 0;
          for (var p = 0; p < msikp_days; p++) msik_total = msik_total + msikp_collection[p];
          msiData[i].kp = msik_total / msikp_days;
      }
      // d kp collection
      if ((msi_index >= msik_days + msikp_days) && (msi_index < msik_days + msikp_days + msid_days)) {
          msid_collection[msi_index - msik_days - msikp_days] = msiData[i].kp;
      } else if (msi_index >= msik_days + msikp_days + msid_days) {
          for (var d = 0; d < msid_days - 1; d++) msid_collection[d] = msid_collection[d + 1];
          msid_collection[msid_days - 1] = msiData[i].kp;
      }
      // d value
      if (msi_index >= msik_days + msikp_days + msid_days - 1) {
          msikp_total = 0;
          for (var d = 0; d < msid_days; d++) msikp_total = msikp_total + msid_collection[d];
          msiData[i].d = msikp_total / msid_days;
      }
      msi_index++;
    }

    return msiData;
  }
}
