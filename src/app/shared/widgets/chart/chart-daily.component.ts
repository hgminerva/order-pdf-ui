import { Component, OnInit, NgZone, Input, ElementRef, ViewChild, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common';

import { OHLCDataModel } from '../../../models/data/ohlc-data-model';
import { IndicatorCCIDataModel } from '../../../models/indicator/cci-data-model';
import { IndicatorMSIDataModel } from '../../../models/indicator/msi-data-model';
import { IndicatorRSIDataModel } from '../../../models/indicator/rsi-data-model';

import { StockChartService } from 'src/app/services/magenta/stock-chart.service';
import { IndicatorCCIService } from 'src/app/services/indicator/indicator-cci.service';
import { IndicatorMSIService } from 'src/app/services/indicator/indicator-msi.service';
import { IndicatorRSIService } from 'src/app/services/indicator/indicator-rsi.service';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";

@Component({
  selector: 'app-widget-chart-daily',
  templateUrl: './chart-daily.component.html',
  styleUrls: ['./chart-daily.component.scss']
})
export class ChartDailyComponent implements OnInit {
  // ================
  // Inputs injectors
  // ================
  @Input() _input_data: Subject<any>;
  // ===================
  // DOM update bindings
  // ===================
  @ViewChild('chartLabel') _chartLabel: ElementRef;
  @ViewChild('chartCursorData') _chartCursorData: ElementRef;
  // ==========
  // Properties
  // ==========
  public _chart: am4charts.XYChart;
  public _chartType: string = "Daily1";

  public _rawData: any;
  public _data: any;

  public _fullscreen: boolean = false;

  public _showSpinner: boolean = false;
  public _sidebarOpen: boolean = false;
  public _sidebar_condition: string;
  public _sidebar_tradeAction: string;

  public _sidebar_ema: string;
  public _sidebar_msi: string;
  public _sidebar_cci: string;
  public _sidebar_rsi: string;

  public _sidebar_toggleVolume: boolean = false;
  public _sidebar_toggleMagentaChannel: boolean = false;

  // ============
  // Constructors
  // ============
  constructor(private zone: NgZone,
              private sanitizer: DomSanitizer,
              private _stockChartService: StockChartService,
              private _indicatorCCIService: IndicatorCCIService,
              private _indicatorMSIService: IndicatorMSIService,
              private _indicatorRSIService: IndicatorRSIService,) {

  }

  ngOnInit(): void {
    this._input_data.subscribe(data => {
      this._rawData = data;
      this.getChartData();
   });
  }
  // =====
  // Chart
  // =====
  computeMonthlyData(data: any) : any {
    var monthlyData: any[] = [];

    let quoteDate = data[0].quoteDate;
    let quoteWeek = data[0].quoteWeek;
    let quoteMonth = data[0].quoteMonth;
    let openPrice = data[0].openPrice;
    let highPrice = data[0].highPrice;
    let lowPrice = data[0].lowPrice;
    let closePrice  = data[0].closePrice;

    for (var i = 0; i < data.length; i++) {
      if(quoteMonth != data[i].quoteMonth) {
        monthlyData.push({
          "quoteDate": quoteDate,
          "quoteWeek": quoteWeek,
          "quoteMonth": quoteMonth,
          "openPrice": openPrice,
          "highPrice": highPrice,
          "lowPrice": lowPrice,
          "closePrice": closePrice,
          "volume": data[i].volume,
          "ema3": data[i].ema3,
          "ema8": data[i].ema8,
          "msik": data[i].msik,
          "msikp": data[i].msikp,
          "msid": data[i].msid
        });
        quoteDate = data[i].quoteDate;
        quoteWeek = data[i].quoteWeek;
        quoteMonth = data[i].quoteMonth;
        openPrice = data[i].openPrice;
        highPrice = data[i].highPrice;
        lowPrice = data[i].lowPrice;
      } else {
        if(data[i].highPrice > highPrice) highPrice = data[i].highPrice;
        if(data[i].lowPrice < lowPrice) lowPrice = data[i].lowPrice;
        closePrice = data[i].closePrice;
      }
      if(i == data.length - 1) {
        monthlyData.push({
          "quoteDate": quoteDate,
          "quoteWeek": quoteWeek,
          "quoteMonth": quoteMonth,
          "openPrice": openPrice,
          "highPrice": highPrice,
          "lowPrice": lowPrice,
          "closePrice": closePrice,
          "volume": data[i].volume,
          "ema3": data[i].ema3,
          "ema8": data[i].ema8,
          "msik": data[i].msik,
          "msikp": data[i].msikp,
          "msid": data[i].msid
        });
      }
    }

    return monthlyData;
  }
  getChartData(): void {
    // default raw data
    let data: any[] = [];
    for (var i = 0; i < this._rawData.stockPrices.length; i++) {
      data.push({
        "quoteDate": new Date(this._rawData.stockPrices[i].quoteDate),
        "quoteWeek": this.getWeek(this._rawData.stockPrices[i].quoteDate),
        "quoteMonth": this.getMonth(this._rawData.stockPrices[i].quoteDate),
        "openPrice": this._rawData.stockPrices[i].openPrice,
        "highPrice": this._rawData.stockPrices[i].highPrice,
        "lowPrice": this._rawData.stockPrices[i].lowPrice,
        "closePrice": this._rawData.stockPrices[i].closePrice,
        "volume": this._rawData.stockPrices[i].volume,
        "ema3": 0,
        "ema8": 0,
        "msik": 0,
        "msikp": 0,
        "msid": 0
      });
    }

    switch(this._chartType) {
      case "Weekly1":
        this._showSpinner = true;
        const observable = this._stockChartService.getEODDataWeekly(this._rawData.symbol);
        let weeklyData: any[] = [];
        observable.subscribe(response => {
          for (var i = 0; i < response.stockPrices.length; i++) {
            weeklyData.push({
              "quoteDate": new Date(response.stockPrices[i].quoteDate),
              "quoteWeek": this.getWeek(response.stockPrices[i].quoteDate),
              "quoteMonth": this.getMonth(response.stockPrices[i].quoteDate),
              "openPrice": response.stockPrices[i].openPrice,
              "highPrice": response.stockPrices[i].highPrice,
              "lowPrice": response.stockPrices[i].lowPrice,
              "closePrice": response.stockPrices[i].closePrice,
              "volume": response.stockPrices[i].volume,
              "ema3": 0,
              "ema8": 0,
              "msik": 0,
              "msikp": 0,
              "msid": 0
            });
          }
          this.prepareChartData(weeklyData);
          this.createChart();
        });
        break;
      case "Monthly1":
        data = this.computeMonthlyData(data);
        this.prepareChartData(data);
        this.createChart();
        break;
      default:
        this.prepareChartData(data);
        this.createChart();
        break;
    }
  }
  prepareChartData(data: any): void {
    let ohlc : OHLCDataModel[] = [];
    let cciData: IndicatorCCIDataModel[] = [];
    let msiData: IndicatorMSIDataModel[] = [];
    let rsiData: IndicatorRSIDataModel[] = [];

    let chartData: any[] = [];
    let plotData: any[] = [];

    data.sort((d1,d2) => new Date(d1.quoteDate).getTime() - new Date(d2.quoteDate).getTime());

    for (let i:number = 0; i < data.length; i++) {
      ohlc.push({
        date: data[i].quoteDate,
        open: data[i].openPrice,
        high: data[i].highPrice,
        low: data[i].lowPrice,
        close: data[i].closePrice
      });
    }

    cciData = this._indicatorCCIService.computeCCI(ohlc,21);
    msiData = this._indicatorMSIService.computeMSI(ohlc);
    rsiData = this._indicatorRSIService.computeRSI(ohlc,14);

    //console.log(rsiData);

    for (let i:number = 0; i < data.length; i++) {
      chartData.push({
        "quoteDate": data[i].quoteDate,
        "quoteWeek": data[i].quoteWeek,
        "quoteMonth": data[i].quoteMonth,
        "openPrice": data[i].openPrice,
        "highPrice": data[i].highPrice,
        "lowPrice": data[i].lowPrice,
        "closePrice": data[i].closePrice,
        "volume": data[i].volume,
        "ema3": msiData[i].ema3,
        "ema8": msiData[i].ema8,
        "msik": msiData[i].k,
        "msikp": msiData[i].kp,
        "msid": msiData[i].d,
        "cci": cciData[i].cci,
        "rsi": rsiData[i].rsi
      });
    }

    var chartMaxLength: number = 120;
    var chartExtensionLength: number = 30;

    if(this._chartType == "Daily2") { chartMaxLength = 252; chartExtensionLength = 50; }          // 1 Year Daily Data
    else if(this._chartType == "Weekly1") { chartMaxLength = 156; chartExtensionLength = 30; }    // 3 Years Weekly Data
    else if(this._chartType == "Monthly1") { chartMaxLength = 120; chartExtensionLength = 30; }   // 10 Years Monthly Data
    else { chartMaxLength = 60; chartExtensionLength = 10; }                                      // 3 Months Daily Data

    // trim the data
    var startIndex = chartData.length - chartMaxLength;
    if(startIndex-1 < 0) startIndex = 1;
    for (var i = startIndex-1; i < chartData.length; i++) {
      plotData.push({
        "quoteDate": chartData[i].quoteDate,
        "quoteWeek": chartData[i].quoteWeek,
        "quoteMonth": chartData[i].quoteMonth,
        "openPrice": chartData[i].openPrice,
        "highPrice": chartData[i].highPrice,
        "lowPrice": chartData[i].lowPrice,
        "closePrice": chartData[i].closePrice,
        "volume": chartData[i].volume,
        "ema3": chartData[i].ema3,
        "ema8": chartData[i].ema8,
        "msik": chartData[i].msik,
        "msikp": chartData[i].msikp,
        "msid": chartData[i].msid,
        "cci": chartData[i].cci,
        "rsi": chartData[i].rsi,
      });
    }
    // extend the data
    var lastQuoteDate = new Date(chartData[chartData.length-1].quoteDate);
    var extendedDate = new Date(lastQuoteDate.setDate(lastQuoteDate.getDate() + 1));
    for (var i = 0; i < chartExtensionLength; i++) {
      plotData.push({
        "quoteDate": extendedDate
      });
      extendedDate = new Date(extendedDate.setDate(extendedDate.getDate() + 1));
    }

    this._data = plotData;

  }
  createChart(): void {
    if(this._rawData != null) {
      if(this._rawData.stockPrices.length > 0) {
        this._showSpinner = true;

        this.displayChartLabel(this._rawData.exchange,
                               this._rawData.symbol,
                               this._rawData.symbolDescription,
                               this._rawData.stockPrices[0].closePrice,
                               this._rawData.stockPrices[1].closePrice);

        // this._data = this.prepareChartData();

        // am4core.useTheme(am4themes_dark);
        // am4core.useTheme(am4themes_animated);

        this.destroyChart();

        let chart = am4core.create("dailychart", am4charts.XYChart);
        chart.paddingRight = 20;
        chart.dateFormatter.inputDateFormat = "YY-MM-DD";
        chart.responsive.enabled = true;
        chart.data = this._data;

        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.skipEmptyPeriods = true;

        let priceAxis = chart.yAxes.push(new am4charts.ValueAxis());
        priceAxis.tooltip.disabled = true;

        let priceSeries = chart.series.push(new am4charts.CandlestickSeries());
        priceSeries.name = "priceSeries";
        priceSeries.yAxis = priceAxis;
        priceSeries.dataFields.dateX  = "quoteDate";
        priceSeries.dataFields.valueY = "closePrice";
        priceSeries.dataFields.openValueY = "openPrice";
        priceSeries.dataFields.lowValueY = "lowPrice";
        priceSeries.dataFields.highValueY = "highPrice";
        priceSeries.tooltipText = "{valueY.value}";
        priceSeries.strokeWidth = 2;
        priceSeries.dropFromOpenState.properties.fill = am4core.color("#EC1E27");
        priceSeries.dropFromOpenState.properties.stroke = am4core.color("#EC1E27");
        priceSeries.riseFromOpenState.properties.fill = am4core.color("#8BC540");
        priceSeries.riseFromOpenState.properties.stroke = am4core.color("#8BC540");

        let volumeAxis = chart.yAxes.push(new am4charts.ValueAxis());
        volumeAxis.tooltip.disabled = true;
        volumeAxis.renderer.grid.template.disabled = true;
        volumeAxis.renderer.labels.template.disabled = true;

        let volumeSeries = chart.series.push(new am4charts.ColumnSeries());
        volumeSeries.yAxis = volumeAxis;
        volumeSeries.dataFields.valueY = "volume";
        volumeSeries.dataFields.dateX = "quoteDate";
        volumeSeries.columns.template.fillOpacity = .1;
        volumeSeries.clustered = false;
        volumeSeries.strokeWidth = 0;

        let ema3Series = chart.series.push(new am4charts.LineSeries());
        ema3Series.yAxis = priceAxis;
        ema3Series.name = "ema3Series";
        ema3Series.dataFields.valueY = "ema3";
        ema3Series.dataFields.dateX = "quoteDate";
        ema3Series.strokeWidth = 1
        ema3Series.tooltip.disabled = true;
        ema3Series.stroke = am4core.color("green");
        ema3Series.hidden = true;

        let ema8Series = chart.series.push(new am4charts.LineSeries());
        ema8Series.yAxis = priceAxis;
        ema8Series.name = "ema8Series";
        ema8Series.dataFields.valueY = "ema8";
        ema8Series.dataFields.dateX = "quoteDate";
        ema8Series.strokeWidth = 1
        ema8Series.tooltip.disabled = true;
        ema8Series.stroke = am4core.color("red");
        ema8Series.hidden = true;

        let channelMaxSeries = chart.series.push(new am4charts.LineSeries());
        channelMaxSeries.yAxis = priceAxis;
        channelMaxSeries.name = "channelMaxSeries";
        channelMaxSeries.dataFields.valueY = "value";
        channelMaxSeries.dataFields.dateX = "date";
        channelMaxSeries.strokeWidth = 1
        channelMaxSeries.tooltip.disabled = true;
        channelMaxSeries.stroke = am4core.color("#98FB98");
        channelMaxSeries.data = this.computeMagentaChannelData("MAX");

        let channelMidSeries = chart.series.push(new am4charts.LineSeries());
        channelMidSeries.yAxis = priceAxis;
        channelMidSeries.name = "channelMidSeries";
        channelMidSeries.dataFields.valueY = "value";
        channelMidSeries.dataFields.dateX = "date";
        channelMidSeries.strokeWidth = 2
        channelMidSeries.tooltip.disabled = true;
        channelMidSeries.stroke = am4core.color("#FF00FF");
        channelMidSeries.data = this.computeMagentaChannelData("MID");

        let channelMinSeries = chart.series.push(new am4charts.LineSeries());
        channelMinSeries.yAxis = priceAxis;
        channelMinSeries.name = "channelMinSeries";
        channelMinSeries.dataFields.valueY = "value";
        channelMinSeries.dataFields.dateX = "date";
        channelMinSeries.strokeWidth = 1
        channelMinSeries.tooltip.disabled = true;
        channelMinSeries.stroke = am4core.color("#F08080");
        channelMinSeries.data = this.computeMagentaChannelData("MIN");

        if(this._sidebar_toggleVolume == false) {
          volumeSeries.hidden = true;
        } else {
          volumeSeries.hidden = false;
        }
        if(this._sidebar_toggleMagentaChannel == false) {
          channelMaxSeries.hidden = true;
          channelMidSeries.hidden = true;
          channelMinSeries.hidden = true;
        } else {
          channelMaxSeries.hidden = false;
          channelMidSeries.hidden = false;
          channelMinSeries.hidden = false;
        }

        // look for the start index and end index to plot the ema range
        let coefficient = 0;
        let count = 0;
        let startIndex = 0;
        let endIndex = this._data.length - 1;
        for(let i = endIndex; i < this._data.length; i--) {
          if(this._data[i].closePrice != null) {
            endIndex = i;
            break;
          }
        }
        for(let i = endIndex; i>=0; i--) {
          startIndex = i;
          coefficient = this.computeDataCorrelationCoefficient(startIndex, endIndex);
          if (count > 30 && coefficient <= 0.9) {
            break;
          }
          count++;
        }

        // plot the ema range
        var emaRange: any = [];
        var e: number = 0;
        for(let i=startIndex+1;i<=endIndex;i++) {
          emaRange[e] = dateAxis.axisRanges.create();
          emaRange[e].date = this._data[i-1].quoteDate;
          emaRange[e].endDate = this._data[i].quoteDate;
          if (this._data[i].ema3 >= this._data[i].ema8) {
            emaRange[e].axisFill.fill = am4core.color("green");;
          } else {
            emaRange[e].axisFill.fill = am4core.color("red");
          }
          emaRange[e].axisFill.fillOpacity = 0.3;
          e++;
        }

        let chartCursor = new am4charts.XYCursor();
        chart.cursor = chartCursor;

        let watermark = new am4core.Label();
        watermark.text = this._rawData.exchange + ':' + this._rawData.symbol + "\n" +
                          "[font-size: 15px]" + this._rawData.symbolDescription + "[/]";
        watermark.fontSize = 30;
        watermark.opacity = 0.2;
        watermark.align = "right";
        watermark.valign = "top";
        chart.plotContainer.children.push(watermark);

        chart.cursor.events.on("cursorpositionchanged",
          (ev) => this.chartCursorPositionChanged(ev));

        chart.events.on("ready",(ev) => {
          this._showSpinner = false; });



        this._chart = chart;
      }
    }
  }
  destroyChart(): void {
    this.zone.runOutsideAngular(() => {
      if (this._chart) {
        this._chart.dispose();
      }
    });
  }
  displayChartLabel(exchange: string,
                    symbol: string,
                    symbolDescription: string,
                    closePrice: number,
                    previousClosePrice: number): void {

    let chartLabelHtml = exchange + ':<b>' + symbol + '</b>   ' +  '(' + symbolDescription + ')     ';

    if(closePrice > previousClosePrice) {
      chartLabelHtml +=  '<font color="palegreen" size="3"> +';
    } else if(closePrice == previousClosePrice) {
      chartLabelHtml +=  '<font color="gold" size="3"> ';
    } else {
      chartLabelHtml+=  '<font color="lightcoral" size="3"> -';
    }

    chartLabelHtml  +=  closePrice + '</font>';

    this._chartLabel.nativeElement.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML,this.sanitizer.bypassSecurityTrustHtml(chartLabelHtml));
  }
  chartCursorPositionChanged(ev) {
    if(ev) {
      let xAxis = ev.target.chart.xAxes.getIndex(0);
      let xPosition = Math.floor(xAxis.toAxisPosition(ev.target.xPosition) * this._data.length);
      let quoteDate = xAxis.positionToDate(xAxis.toAxisPosition(ev.target.xPosition))
      let quoteDateString = quoteDate.toLocaleDateString();

      if(xPosition >= 0 && xPosition <= this._data.length-1 && this._data[xPosition].closePrice != null) {
        let chartCursorDataHtml = " ";
        chartCursorDataHtml = "<font color='gray'>Date:</font><b>" + quoteDateString + "</b>    " +
                              "<font color='gray'>Open:</font><b>" + this.numberWithCommas(this._data[xPosition].openPrice) + "</b>    " +
                              "<font color='gray'>High:</font><b>" + this.numberWithCommas(this._data[xPosition].highPrice) + "</b>    " +
                              "<font color='gray'>Low:</font><b>" + this.numberWithCommas(this._data[xPosition].lowPrice) + "</b>    " +
                              "<font color='gray'>Close:</font><b>" + this.numberWithCommas(this._data[xPosition].closePrice) + "</b>    " +
                              "<font color='gray'>Volume:</font><b>" + this.numberWithCommas(this._data[xPosition].volume) + "</b>";
        this._chartCursorData.nativeElement.innerHTML = this.sanitizer.sanitize(
          SecurityContext.HTML,this.sanitizer.bypassSecurityTrustHtml(chartCursorDataHtml));

        this.displayCondition(xPosition);
        this.displayTradeAction(xPosition);
      }
    }
  }
  chartValueAxisMinMax(data: any, type: string): number {
    let min = data[0].lowPrice;
    let max = data[0].highPrice;
    for(var i=0; i<data.length; i++) {
      if(data[i].lowPrice < min) min = data[i].lowPrice;
      if(data[i].highPrice > max) max = data[i].highPrice;
    }
    if(type=="Max") return max;
    else return min;
  }
  getWeeklyData(symbol: string): any {
    var returnData: any[];
    returnData = [];


  }
  // ==========================
  // Chart side bar information
  // ==========================
  displayCondition(xPosition: number) {
    this._sidebar_condition = "";
    if (xPosition >= 0) {
      if (this._data[xPosition].msikp >= this._data[xPosition].msid) {
        if (this._data[xPosition].msikp >= 20 && this._data[xPosition].msikp <= 80) {
          this._sidebar_condition = "Strong";
        }
        if (this._data[xPosition].msikp > 80) {
          this._sidebar_condition = "Fair";
        }
        if (this._data[xPosition].msikp < 20) {
          this._sidebar_condition = "Weak";
        }
      } else {
        if (this._data[xPosition].msikp >= 20 && this._data[xPosition].msikp <= 80) {
          this._sidebar_condition = "Strong";
        }
        if (this._data[xPosition].msikp > 80) {
          this._sidebar_condition = "Weak";
        }
        if (this._data[xPosition].msikp < 20) {
          this._sidebar_condition = "Fair";
        }
      }
    }
  }
  displayTradeAction(xPosition: number) {

    let cci: number = this._data[xPosition].cci;
    let rsi: number = this._data[xPosition].rsi;
    let ema3: number = this._data[xPosition].ema3;
    let ema8: number = this._data[xPosition].ema8;
    let kp: number = this._data[xPosition].msikp;
    let d: number = this._data[xPosition].msid;
    let close: number = this._data[xPosition].closePrice;

    let ta: string = "Wait or Hold";

    if(cci>0 && rsi>50 && ema3>ema8 && kp>d && (kp>20&&kp<80) && close>ema3) ta = "Buy Cover";
    if(cci<0 && rsi<50 && ema3<ema8 && kp<d && (kp>20&&kp<80) && close<ema3) ta = "Sell Short";

    if(cci<0 && rsi<50 && ema3<ema8 && kp<d && (kp>20&&kp<80) && close>ema8) ta = "Exit Longs and Short Stop";
    if(cci>0 && rsi<50 && ema3>ema8 && kp<d && (kp>20&&kp<80) && close<ema8) ta = "Exit Longs and Short Stop";
    if(cci<0 && rsi<50 && ema3>ema8 && kp>d && (kp>20&&kp<80) && close<ema8) ta = "Exit Longs and Short Stop";
    if(cci<0 && rsi>50 && ema3>ema8 && kp<d && (kp>20&&kp<80) && close<ema8) ta = "Exit Longs and Short Stop";
    if(cci>0 && rsi<50 && ema3<ema8 && kp<d && (kp>20&&kp<80))               ta = "Exit Longs and Short Stop";
    if(cci<0 && rsi<50 && ema3<ema8 && kp>d && (kp>20&&kp<80))               ta = "Exit Longs and Short Stop";
    if(cci<0 && rsi>50 && ema3<ema8 && kp<d && (kp>20&&kp<80))               ta = "Exit Longs and Short Stop";
    if(cci<0 && rsi<50 && ema3>ema8 && kp<d && (kp>20&&kp<80))               ta = "Exit Longs and Short Stop";

    if(cci>0 && rsi>50 && ema3>ema8 && kp>d && (kp>20&&kp<80) && close<ema8) ta = "Long Stop or Exit Short";
    if(cci>0 && rsi<50 && ema3<ema8 && kp>d && (kp>20&&kp<80) && close>ema8) ta = "Long Stop or Exit Short";
    if(cci>0 && rsi>50 && ema3<ema8 && kp<d && (kp>20&&kp<80) && close>ema8) ta = "Long Stop or Exit Short";
    if(cci<0 && rsi>50 && ema3<ema8 && kp>d && (kp>20&&kp<80) && close>ema8) ta = "Long Stop or Exit Short";
    if(cci>0 && rsi<50 && ema3>ema8 && kp>d && (kp>20&&kp<80))               ta = "Long Stop or Exit Short";
    if(cci>0 && rsi>50 && ema3>ema8 && kp<d && (kp>20&&kp<80))               ta = "Long Stop or Exit Short";
    if(cci<0 && rsi>50 && ema3>ema8 && kp>d && (kp>20&&kp<80))               ta = "Long Stop or Exit Short";
    if(cci>0 && rsi>50 && ema3<ema8 && kp>d && (kp>20&&kp<80))               ta = "Long Stop or Exit Short";

    if(cci>0 && rsi<50 && ema3>ema8 && kp>d && (kp>20&&kp<80) && close<ema8) ta = "Place Stop or Exit";
    if(cci>0 && rsi>50 && ema3>ema8 && kp<d && (kp>20&&kp<80) && close<ema8) ta = "Place Stop or Exit";
    if(cci<0 && rsi>50 && ema3>ema8 && kp>d && (kp>20&&kp<80) && close<ema8) ta = "Place Stop or Exit";
    if(cci<0 && rsi>50 && ema3<ema8 && kp<d && (kp>20&&kp<80) && close>ema8) ta = "Place Stop or Exit";
    if(cci>0 && rsi<50 && ema3<ema8 && kp<d && (kp>20&&kp<80) && close>ema8) ta = "Place Stop or Exit";
    if(cci<0 && rsi<50 && ema3<ema8 && kp>d && (kp>20&&kp<80) && close>ema8) ta = "Place Stop or Exit";
    if(cci>0 && rsi<50 && ema3>ema8 && kp>d && (kp>20&&kp<80))               ta = "Place Stop or Exit";
    if(cci<0 && rsi<50 && ema3>ema8 && kp>d && (kp>20&&kp<80))               ta = "Place Stop or Exit";
    if(cci<0 && rsi>50 && ema3>ema8 && kp<d && (kp>20&&kp<80))               ta = "Place Stop or Exit";
    if(cci>0 && rsi<50 && ema3<ema8 && kp>d && (kp>20&&kp<80))               ta = "Place Stop or Exit";
    if(cci>0 && rsi>50 && ema3<ema8 && kp<d && (kp>20&&kp<80))               ta = "Place Stop or Exit";
    if(cci<0 && rsi>50 && ema3<ema8 && kp>d && (kp>20&&kp<80))               ta = "Place Stop or Exit";

    if(cci<0 && rsi<50 && ema3<ema8 && kp<20)                                 ta = "Wait or Hold";
    if(cci<0 && rsi<50 && ema3<ema8 && kp>80)                                 ta = "Wait or Hold";
    if(cci>0 && rsi>50 && ema3>ema8 && kp<20)                                 ta = "Wait or Hold";
    if(cci>0 && rsi>50 && ema3>ema8 && kp>80)                                 ta = "Wait or Hold";

    this._sidebar_tradeAction  = ta;

    this._sidebar_ema = (Math.round(ema3*100)/100).toString() + " / " + (Math.round(ema8*100)/100).toString();
    this._sidebar_msi = (Math.round(kp*100)/100).toString() + " / " + (Math.round(d*100)/100).toString();
    this._sidebar_cci = (Math.round(cci*100)/100).toString();
    this._sidebar_rsi = (Math.round(rsi*100)/100).toString();
  }
  // ==============
  // Toogle methods
  // ==============
  toggleSidebar() : void {
    this._sidebarOpen = !this._sidebarOpen;
  }
  toggleChartVolume(checked: boolean) : void {
    if(this._chart != null) {
      if(checked == true) {
        this._chart.series.getIndex(1).show();
        this._sidebar_toggleVolume = true;
      } else {
        this._chart.series.getIndex(1).hide();
        this._sidebar_toggleVolume = false;
      }
    }
    this._sidebar_toggleVolume = checked;
  }
  toggleMagentaChannel(checked: boolean) : void {
    if(this._chart != null) {
      this._chart.series.each(function(series) {
        if(series.name == "channelMaxSeries" ||
           series.name == "channelMidSeries" ||
           series.name == "channelMinSeries") {
          if(checked == true) {
            series.show();
          } else {
            series.hide();
          }
        }
      });
    }
    this._sidebar_toggleMagentaChannel = checked;
  }
  toggleFullscreen(checked: boolean) : void {
    this._fullscreen = checked;
  }
  // ============
  // Other events
  // ============
  chartTypeChanged() : void {
    if(this._rawData != null) {
      this.getChartData();
    }
  }
  // ===========
  // Other tools
  // ===========
  computeDataCorrelationCoefficient(startX: number, endX: number) : number{
    var X = 0;
    var Y = 0;
    var sumOfX = 0;
    var sumOfY = 0;
    var sumOfX2 = 0;
    var sumOfY2 = 0;
    var sumOfXY = 0;

    for (var i = startX; i < endX; i++) {
        X = X + 1;
        Y = parseFloat(this._data[i].closePrice);
        sumOfX = sumOfX + X;
        sumOfY = sumOfY + Y;
        sumOfXY = sumOfXY + (X * Y);
        sumOfX2 = sumOfX2 + (X * X);
        sumOfY2 = sumOfY2 + (Y * Y);
    }
    //r = Σ (xy) / sqrt [ ( Σ x2 ) * ( Σ y2 ) ]
    return (sumOfXY - ((sumOfX * sumOfY) / X)) / Math.sqrt(((sumOfX2 - ((sumOfX * sumOfX) / X)) * (sumOfY2 - ((sumOfY * sumOfY) / X)))); // Pearson
  }
  computeMagentaChannelData(channel: string) : any[] {
    var channelLength: number = 0;
    var coefficient: number;

    // channel length
    let count = 0;
    let startIndex = 0;
    let endIndex = this._data.length - 1;

    for(var i=0;i<this._data.length;i++) if(this._data[i].closePrice == null) { endIndex = i-1; break; }

    for(let i = endIndex; i>=0; i--) {
      startIndex = i;
      coefficient = this.computeDataCorrelationCoefficient(startIndex, endIndex);
      if (count > 30 && coefficient <= 0.9) {
        break;
      }
      count++;
    }
    channelLength = endIndex - startIndex;

    // define the slope
    var m: number = 0;
    m = (parseFloat(this._data[endIndex].closePrice) - parseFloat(this._data[startIndex].closePrice)) / channelLength;

    // get the intercepts
    var b = [];
    for (var i = 0; i < channelLength ; i++) {
        b[i] = parseFloat(this._data[i + startIndex].closePrice) - (m * (i + 1));
    }

    b.sort(function (a, b) { return a - b; });
    var bMax: number = b[Math.floor(channelLength * .9)];
    var bMid: number = b[Math.floor(channelLength * .5)];
    var bMin: number = b[Math.floor(channelLength * .1)];

    var channelMaxdData = [
      { "date": this._data[startIndex].quoteDate, "value": (m + bMax)},
      { "date": this._data[endIndex].quoteDate, "value": ((m * (endIndex - startIndex + 1)) + bMax)}
    ];
    var channelMidData = [
      { "date": this._data[startIndex].quoteDate, "value": (m + bMid)},
      { "date": this._data[endIndex].quoteDate, "value": ((m * (endIndex - startIndex + 1)) + bMid)}
    ];
    var channelMinData = [
      { "date": this._data[startIndex].quoteDate, "value": (m + bMin)},
      { "date": this._data[endIndex].quoteDate, "value": ((m * (endIndex - startIndex + 1)) + bMin)}
    ];

    if(channel == "MAX") {
      return channelMaxdData;
    }else if(channel == "MID") {
      return channelMidData;
    } else {
      return channelMinData;
    }
  }
  numberWithCommas(x: number) : string{
    var nf = Intl.NumberFormat();
    //return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    return nf.format(x);
  }
  getWeek(thisDate: string): string {
    var d = new Date(thisDate);
    var tdt = new Date(thisDate);
    var dayn = (d.getDay() + 6) % 7;
    tdt.setDate(tdt.getDate() - dayn + 3);
    //tdt.setDate(tdt.getDate() - dayn + 4);
    //tdt.setDate(tdt.getDate() - dayn + 5);
    var firstThursday = tdt.valueOf();
    tdt.setMonth(0, 1);
    if (tdt.getDay() !== 4) {
        tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
    }
    var week =  1 + Math.ceil((firstThursday - tdt.valueOf()) / 604800000);
    return this.zeroPad(d.getUTCFullYear(),4) + this.zeroPad(week,2)
  }
  getMonth(thisDate: string): string {
    var d = new Date(thisDate);
    return this.zeroPad(d.getUTCFullYear(),4) + this.zeroPad(d.getUTCMonth(),2)
  }
  zeroPad(num, numZeros) : string {
    var n = Math.abs(num);
    var zeros = Math.max(0, numZeros - Math.floor(n).toString().length );
    var zeroString = Math.pow(10,zeros).toString().substr(1);
    if( num < 0 ) {
        zeroString = '-' + zeroString;
    }
    return zeroString+n;
  }
}
