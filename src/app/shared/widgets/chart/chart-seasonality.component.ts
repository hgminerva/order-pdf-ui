import { Component, OnInit, NgZone, ElementRef, ViewChild, SecurityContext, ChangeDetectorRef, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import { ProgressLoaderComponent } from 'src/app/shared/tools/progress-loader/progress-loader.component';
import { MatDialog } from '@angular/material/dialog';
import { AnimationFrameScheduler } from 'rxjs/internal/scheduler/AnimationFrameScheduler';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";

@Component({
  selector: 'app-widget-chart-seasonality',
  templateUrl: './chart-seasonality.component.html',
  styleUrls: ['./chart-seasonality.component.scss']
})
export class ChartSeasonalityComponent implements OnInit {
  @Input() _input_data: Subject<any>;

  // the chart
  _chart: am4charts.XYChart;
  _recreateChart: boolean = false;
  _showChartDiv: boolean = false;

  // chart side bar toggle
  _sideBarOpen: boolean = false;

  // chart series toggle
  _showSeason10: boolean = true;
  _showSeason5: boolean = true;
  _showVolume: boolean = true;
  _showSeasonY: boolean[] = [false,false,false,false,false,false,false,false,false,false];
  _showMagentaChannel: boolean = true;

  // seasonality yearly data
  _seasonYear: any = [];
  _seasonYearCount: number = 0;

  // seasonality scanner data and default value
  _scannerData: any = [];
  _scannerDataValue: string = "30";
  _scannerDataCountUp: number = 0;
  _scannerDataCountDown: number = 0;
  _scannerDataTotalDisplay: string = "";

  // msi conditions
  _msiCondition: string = "";
  _msiTradeAction: string = "";

  _showSpinner: boolean = false;

  // DOM update bindings
  @ViewChild('chartLabel') _chartLabel: ElementRef;
  @ViewChild('chartCursorData') _chartCursorData: ElementRef;

  constructor(private zone: NgZone,
              private sanitizer: DomSanitizer,
              private cdr: ChangeDetectorRef,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    for(var i=1;i<=252;i++)
    {
      this._scannerData[i-1] = {
                                 "index": i,
                                 "value": i + " Day(s) Scanner",
                                 "direction": "UP"
                               }
    }
    this._scannerDataValue = "30";
    // recreate the chart if new data is inputed
    this._input_data.subscribe(data => {
      this.createStockChart(data);
   });
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy() {
    this.destroyStockChart();
  }

  // ========================
  // Create and destroy chart
  // ========================
  createStockChart(stockPriceWrapper: any): void {
    if(stockPriceWrapper != null) {
      if(stockPriceWrapper.stockPrices.length > 0) {
        //this.zone.runOutsideAngular(() => {

          this._showSpinner = true;

          // ==================
          // Setup the raw data
          // ==================
          var rawData: any[];
          var initialClosingPriceData: number[];
          var seasonIndex: number;
          var yearCount: number;

          this._seasonYear =  [];
          this._seasonYearCount =  0;
          this._scannerDataCountUp = 0;
          this._scannerDataCountDown = 0;
          this._scannerDataTotalDisplay = "";

          this._chartLabel.nativeElement.innerHTML = this.sanitizer.sanitize(
            SecurityContext.HTML,this.sanitizer.bypassSecurityTrustHtml(""));

          initialClosingPriceData = [];
          rawData = [];
          seasonIndex = 126;
          yearCount = 0;
          for (var i = 0; i < stockPriceWrapper.stockPrices.length; i++) {
            rawData.push({
              "quoteDate": new Date(stockPriceWrapper.stockPrices[i].quoteDate),
              "openPrice": stockPriceWrapper.stockPrices[i].openPrice,
              "highPrice": stockPriceWrapper.stockPrices[i].highPrice,
              "lowPrice": stockPriceWrapper.stockPrices[i].lowPrice,
              "closePrice": stockPriceWrapper.stockPrices[i].closePrice,
              "volume": stockPriceWrapper.stockPrices[i].volume,
              "season10": 0,
              "season5": 0,
              "seasonIndex": seasonIndex,
              "ema3": 0,
              "ema8": 0,
              "msik": 0,
              "msikp": 0,
              "msid": 0
            });

            seasonIndex--;
            if (seasonIndex == 0) {
              seasonIndex = 252;
              if (yearCount > 0) {
                initialClosingPriceData.push(stockPriceWrapper.stockPrices[i].closePrice);
              }
              yearCount++;
            } else {
                if (i == stockPriceWrapper.stockPrices.length - 1) {
                    if (yearCount > 0) {
                      initialClosingPriceData.push(stockPriceWrapper.stockPrices[i].closePrice);
                    }
                }
            }
          }
          // ===========================
          // Compute for the seasonality
          // ===========================
          var seasonYearlyData: number[][] = [];
          var closePriceYearlyData: number[][] = [];
          var season10Data: number[] = [];
          var season5Data: number[] = [];
          var season10: number = 0;
          var season5: number = 0;
          var seasonYearCount: number = 0;

          seasonIndex = 251;
          yearCount = 0;
          // Initialize seasonYearlyData[][] and closePriceYearlyData[][] by 12 years with 252 days
          for (var i = 0; i < 12; i++) {
            seasonYearlyData[i] = [];
            for (var d = 0; d < 252; d++) seasonYearlyData[i].push(0);
            closePriceYearlyData[i] = [];
            for (var d = 0; d < 252; d++) closePriceYearlyData[i].push(0);
          }
          // Compute yearly seasonality data
          for (var i = 126; i < rawData.length; i++) {
            if (initialClosingPriceData[yearCount] > 0) {
              season10 = ((rawData[i].closePrice - initialClosingPriceData[yearCount]) / initialClosingPriceData[yearCount]) * 100;
            } else {
              season10 = 0;
            }

            if (yearCount < 5) {
              season5 = season10;
            } else {
              season5 = 0;
            }

            rawData[i].season10 = season10;
            rawData[i].season5 = season5;

            seasonYearlyData[yearCount][seasonIndex] = season10;
            closePriceYearlyData[yearCount][seasonIndex] = rawData[i].closePrice;

            seasonIndex--;
            if (seasonIndex == -1) {
              seasonIndex = 251;
              yearCount++;
            }else if(seasonIndex == 250) {
              this._seasonYear[yearCount] = {
                                              "year":rawData[i].quoteDate.getFullYear(),
                                              "value":0
                                            };
            }
          }
          seasonYearCount = this._seasonYear.length;
          this._seasonYearCount = seasonYearCount;

          // Sum seasonality data
          for (var i = 0; i < 252; i++) {
            season10 = 0;
            season5 = 0;
            for (var y = 0; y < this._seasonYearCount; y++) {
              season10 += seasonYearlyData[y][i];
                if (y < 5) season5 += seasonYearlyData[y][i];
            }
            season10Data[i] = season10;
            season5Data[i] = season5;
          }

          // ===================
          // Compute for the MSI
          // ===================
          // Compute for ema3 and ema8
          var macd_index = 0;
          var ema3_closePrices = 0;
          var ema3_previous = 0;
          var ema3 = 0;
          var ema8_closePrices = 0;
          var ema8_previous = 0;
          var ema8 = 0;
          for (var i = stockPriceWrapper.stockPrices.length - 1; i >= 0; i--) {
            // EMA 3
            if (macd_index < 2) {
                ema3_closePrices = ema3_closePrices + stockPriceWrapper.stockPrices[i].closePrice;
            } else if(macd_index == 2) {
                ema3 = ema3_closePrices / 3;
                ema3_previous = ema3;
                rawData[i].ema3 = ema3;
            } else if (macd_index > 2) {
                ema3 = (stockPriceWrapper.stockPrices[i].closePrice * (2 / (3 + 1)) + ema3_previous * (1 - (2 / (3 + 1))));
                ema3_previous = ema3;
                rawData[i].ema3 = ema3;
            }
            // EMA 8
            if (macd_index < 7) {
                ema8_closePrices = ema8_closePrices + stockPriceWrapper.stockPrices[i].closePrice;
            } else if(macd_index == 7) {
                ema8 = ema8_closePrices / 8;
                ema8_previous = ema8;
                rawData[i].ema4 = ema8;
            } else if (macd_index > 7) {
                ema8 = (stockPriceWrapper.stockPrices[i].closePrice * (2 / (8 + 1)) + ema8_previous * (1 - (2 / (8 + 1))));
                ema8_previous = ema8_closePrices;
                rawData[i].ema8 = ema8;
            }
            macd_index++;
          }

          // Compute for the msi
          var msi_index = 1;
          var msik_days = 12;
          var msik_lcollection = [];
          var msik_hcollection = [];
          var msik_lowest;
          var msik_highest;
          var msik_total = 0;
          var msikp_days = 3;
          var msikp_collection = [];
          var msikp_total = 0;
          var msid_days = 3;
          var msid_collection = [];
          for (var i = stockPriceWrapper.stockPrices.length - 1; i >= 0; i--) {
            // k collection
            if (msi_index <= msik_days) {
              msik_lcollection[msi_index - 1] = stockPriceWrapper.stockPrices[i].lowPrice;
              msik_hcollection[msi_index - 1] = stockPriceWrapper.stockPrices[i].highPrice;
            } else {
              for (var l = 0; l < msik_days - 1; l++) msik_lcollection[l] = msik_lcollection[l + 1];
              for (var h = 0; h < msik_days - 1; h++) msik_hcollection[h] = msik_hcollection[h + 1];

              msik_lcollection[msik_days - 1] = stockPriceWrapper.stockPrices[i].lowPrice;
              msik_hcollection[msik_days - 1] = stockPriceWrapper.stockPrices[i].highPrice;
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
                  rawData[i].msik = 100 * ((rawData[i].closePrice - msik_lowest) / (msik_highest - msik_lowest));
                }
            }
            // kp k collection
            if ((msi_index >= msik_days) && (msi_index < msik_days + msikp_days)) {
                msikp_collection[msi_index - msik_days] = rawData[i].msik;
            } else if (msi_index >= msik_days + msikp_days) {
                for (var p = 0; p < msikp_days - 1; p++) msikp_collection[p] = msikp_collection[p + 1];
                msikp_collection[msikp_days - 1] = rawData[i].msik;
            }
            // kp value
            if (msi_index >= msik_days + msikp_days - 1) {
                msik_total = 0;
                for (p = 0; p < msikp_days; p++) msik_total = msik_total + msikp_collection[p];
                rawData[i].msikp = msik_total / msikp_days;
            }
            // d kp collection
            if ((msi_index >= msik_days + msikp_days) && (msi_index < msik_days + msikp_days + msid_days)) {
                msid_collection[msi_index - msik_days - msikp_days] = rawData[i].msikp;
            } else if (msi_index >= msik_days + msikp_days + msid_days) {
                for (d = 0; d < msid_days - 1; d++) msid_collection[d] = msid_collection[d + 1];
                msid_collection[msid_days - 1] = rawData[i].msikp;
            }
            // d value
            if (msi_index >= msik_days + msikp_days + msid_days - 1) {
                msikp_total = 0;
                for (d = 0; d < msid_days; d++) msikp_total = msikp_total + msid_collection[d];
                rawData[i].msid = msikp_total / msid_days;
            }

            msi_index++;
          }

          // ====================
          // Create the plot data
          // ====================
          var plotData: any[];
          var lastQuoteDate: Date;
          var extendedDate: Date;

          plotData = [];
          lastQuoteDate = new Date(stockPriceWrapper.stockPrices[0].quoteDate);
          extendedDate = new Date(lastQuoteDate.setDate(lastQuoteDate.getDate() + 1));
          for (var i = 0; i < 252; i++) {
            if (i > 125) {
              plotData.push({
                quoteDate: extendedDate,
                season10: (season10Data[i] / 10).toFixed(2),
                season5: (season5Data[i] / 5).toFixed(2),
                seasonY0: seasonYearlyData[0][i].toFixed(2),
                seasonY1: seasonYearlyData[1][i].toFixed(2),
                seasonY2: seasonYearlyData[2][i].toFixed(2),
                seasonY3: seasonYearlyData[3][i].toFixed(2),
                seasonY4: seasonYearlyData[4][i].toFixed(2),
                seasonY5: seasonYearlyData[5][i].toFixed(2),
                seasonY6: seasonYearlyData[6][i].toFixed(2),
                seasonY7: seasonYearlyData[7][i].toFixed(2),
                seasonY8: seasonYearlyData[8][i].toFixed(2),
                seasonY9: seasonYearlyData[9][i].toFixed(2),
                seasonIndex: i+1,
                ema3: 0,
                ema8: 0,
                msik: 0,
                msikp: 0,
                msid: 0
              });
              extendedDate = new Date(extendedDate.setDate(extendedDate.getDate() + 1));
            } else {
              plotData.push({
                  quoteDate: rawData[125-i].quoteDate,
                  openPrice: rawData[125-i].openPrice,
                  highPrice: rawData[125-i].highPrice,
                  lowPrice: rawData[125-i].lowPrice,
                  closePrice: rawData[125-i].closePrice,
                  volume: rawData[125-i].volume,
                  season10: (season10Data[i] / 10).toFixed(2),
                  season5: (season5Data[i] / 5).toFixed(2),
                  seasonY0: seasonYearlyData[0][i].toFixed(2),
                  seasonY1: seasonYearlyData[1][i].toFixed(2),
                  seasonY2: seasonYearlyData[2][i].toFixed(2),
                  seasonY3: seasonYearlyData[3][i].toFixed(2),
                  seasonY4: seasonYearlyData[4][i].toFixed(2),
                  seasonY5: seasonYearlyData[5][i].toFixed(2),
                  seasonY6: seasonYearlyData[6][i].toFixed(2),
                  seasonY7: seasonYearlyData[7][i].toFixed(2),
                  seasonY8: seasonYearlyData[8][i].toFixed(2),
                  seasonY9: seasonYearlyData[9][i].toFixed(2),
                  seasonIndex: i+1,
                  ema3: rawData[125-i].ema3,
                  ema8: rawData[125-i].ema8,
                  msik: rawData[125-i].msik,
                  msikp: rawData[125-i].msikp,
                  msid: rawData[125-i].msid
              });
            }
          }
          // ================
          // Create the chart
          // ================
          this.destroyStockChart();

          this.displayChartLabel(stockPriceWrapper.exchange,
                                  stockPriceWrapper.symbol,
                                  stockPriceWrapper.symbolDescription,
                                  stockPriceWrapper.stockPrices[0].closePrice,
                                  stockPriceWrapper.stockPrices[1].closePrice);

          // the chart
          // am4core.useTheme(am4themes_dark);
          // am4core.useTheme(am4themes_animated);

          let chart = am4core.create("chartdiv", am4charts.XYChart);
          chart.paddingRight = 20;
          chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";
          chart.responsive.enabled = true;

          // x axis (date category axis)
          let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
          dateAxis.skipEmptyPeriods = true;

          // volume series - [0]
          let volumeAxis = chart.yAxes.push(new am4charts.ValueAxis());
          volumeAxis.tooltip.disabled = true;
          volumeAxis.renderer.grid.template.disabled = true;
          volumeAxis.renderer.labels.template.disabled = true;

          let volumeSeries = chart.series.push(new am4charts.ColumnSeries());
          volumeSeries.yAxis = volumeAxis;
          volumeSeries.dataFields.valueY = "volume";
          volumeSeries.dataFields.dateX = "quoteDate";
          volumeSeries.columns.template.fillOpacity = .3;
          volumeSeries.clustered = false;
          volumeSeries.strokeWidth = 0;

          // price series - [1]
          let priceAxis = chart.yAxes.push(new am4charts.ValueAxis());
          priceAxis.tooltip.disabled = true;
          priceAxis.strictMinMax = true;

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

          // seasonality series - [2], [3], [4-13]
          let season10Axis = chart.yAxes.push(new am4charts.ValueAxis());
          season10Axis.tooltip.disabled = true;
          season10Axis.strokeWidth = 0;
          season10Axis.renderer.grid.template.disabled = true;
          season10Axis.renderer.labels.template.disabled = true;
          season10Axis.strictMinMax = true;

          let season10series = chart.series.push(new am4charts.LineSeries());
          season10series.name = "season10series";
          season10series.yAxis = season10Axis;
          season10series.dataFields.dateX = "quoteDate";
          season10series.dataFields.valueY = "season10";
          season10series.stroke = am4core.color("#FFD700");
          season10series.strokeWidth = 1;
          season10series.tooltip.disabled = true;

          let season5Axis = chart.yAxes.push(new am4charts.ValueAxis());
          season5Axis.tooltip.disabled = true;
          season5Axis.strokeWidth = 0;
          season5Axis.renderer.grid.template.disabled = true;
          season5Axis.renderer.labels.template.disabled = true;
          season5Axis.strictMinMax = true;

          let season5series = chart.series.push(new am4charts.LineSeries());
          season5series.name = "season5series";
          season5series.yAxis = season5Axis;
          season5series.dataFields.dateX = "quoteDate";
          season5series.dataFields.valueY = "season5";
          season5series.stroke = am4core.color("#80DED0");
          season5series.strokeWidth = 1;
          season5series.tooltip.disabled = true;

          var yearAxis: any = [];
          var yearSeries: any = [];
          for (var i = 0; i < seasonYearCount; i++) {
            yearAxis[i] = chart.yAxes.push(new am4charts.ValueAxis());
            yearAxis[i].tooltip.disabled = true;
            yearAxis[i].renderer.grid.template.disabled = true;
            yearAxis[i].renderer.labels.template.disabled = true;
            yearAxis[i].strokeWidth = 0;
            yearAxis[i].strictMinMax = true;

            yearSeries[i] = chart.series.push(new am4charts.LineSeries());
            yearSeries[i].name = "yearSeries" + i;
            yearSeries[i].yAxis = yearAxis[i];
            yearSeries[i].dataFields.dateX = "quoteDate";
            yearSeries[i].dataFields.valueY = "seasonY" + i;
            yearSeries[i].stroke = am4core.color("#A9A9A9");
            yearSeries[i].strokeWidth = 1;
            yearSeries[i].tooltip.disabled = true;
            yearSeries[i].hidden = true;
          }

          // cursor
          let chartCursor = new am4charts.XYCursor();
          chart.cursor = chartCursor;

          // data
          let data = [];
          for (var i = 251; i >= 0; i--) {
            data.push({
              "quoteDate": plotData[251-i].quoteDate,
              "openPrice": plotData[251-i].openPrice,
              "highPrice": plotData[251-i].highPrice,
              "lowPrice": plotData[251-i].lowPrice,
              "closePrice": plotData[251-i].closePrice,
              "volume": plotData[251-i].volume,
              "season10": plotData[251-i].season10,
              "season5": plotData[251-i].season5,
              "seasonY0": plotData[251-i].seasonY0,
              "seasonY1": plotData[251-i].seasonY1,
              "seasonY2": plotData[251-i].seasonY2,
              "seasonY3": plotData[251-i].seasonY3,
              "seasonY4": plotData[251-i].seasonY4,
              "seasonY5": plotData[251-i].seasonY5,
              "seasonY6": plotData[251-i].seasonY6,
              "seasonY7": plotData[251-i].seasonY7,
              "seasonY8": plotData[251-i].seasonY8,
              "seasonY9": plotData[251-i].seasonY9,
              "seasonIndex": plotData[251-i].seasonIndex,
              "ema3": plotData[251-i].ema3,
              "ema8": plotData[251-i].ema8,
              "msik": plotData[251-i].msik,
              "msikp": plotData[251-i].msikp,
              "msid": plotData[251-i].msid
            });
          }
          chart.data = data;

          // watermark
          let watermark = new am4core.Label();
          watermark.text = stockPriceWrapper.exchange + ':' + stockPriceWrapper.symbol + "\n" +
                            "[font-size: 15px]" + stockPriceWrapper.symbolDescription + "[/]";
          watermark.fontSize = 30;
          watermark.opacity = 0.2;
          watermark.align = "right";
          watermark.valign = "top";

          chart.plotContainer.children.push(watermark);

          // mid guide
          let midGuide = dateAxis.axisRanges.create();
          midGuide.date = data[125].quoteDate;
          midGuide.endDate = data[125].quoteDate;
          midGuide.axisFill.strokeDasharray = "3,3";
          midGuide.axisFill.stroke = am4core.color("#FFB6C1");

          // msi guide
          /*for (var i = 1; i <= 125; i++) {

          }

          // magenta channel
          let channelMaxSeries = chart.series.push(new am4charts.LineSeries());
          channelMaxSeries.yAxis = priceAxis;
          channelMaxSeries.name = "channelMaxSeries";
          channelMaxSeries.dataFields.valueY = "value";
          channelMaxSeries.dataFields.dateX = "date";
          channelMaxSeries.strokeWidth = 1
          channelMaxSeries.tooltip.disabled = true;
          channelMaxSeries.stroke = am4core.color("#98FB98");
          channelMaxSeries.data = this.computeMagentaChannelData(data, "MAX");

          let channelMidSeries = chart.series.push(new am4charts.LineSeries());
          channelMidSeries.yAxis = priceAxis;
          channelMidSeries.name = "channelMidSeries";
          channelMidSeries.dataFields.valueY = "value";
          channelMidSeries.dataFields.dateX = "date";
          channelMidSeries.strokeWidth = 2
          channelMidSeries.tooltip.disabled = true;
          channelMidSeries.stroke = am4core.color("#FF00FF");
          channelMidSeries.data = this.computeMagentaChannelData(data, "MID");

          let channelMinSeries = chart.series.push(new am4charts.LineSeries());
          channelMinSeries.yAxis = priceAxis;
          channelMinSeries.name = "channelMinSeries";
          channelMinSeries.dataFields.valueY = "value";
          channelMinSeries.dataFields.dateX = "date";
          channelMinSeries.strokeWidth = 1
          channelMinSeries.tooltip.disabled = true;
          channelMinSeries.stroke = am4core.color("#F08080");
          channelMinSeries.data = this.computeMagentaChannelData(data, "MIN");
          */

          // zoom events
          dateAxis.events.on("selectionextremeschanged",
            (ev) => this.calibratePriceAxis(ev, data, priceAxis));

          dateAxis.events.on("selectionextremeschanged",
            (ev) => this.calibrateSeason10Axis(ev, data, season10Axis));

          dateAxis.events.on("selectionextremeschanged",
            (ev) => this.calibrateSeason5Axis(ev, data, season5Axis));

          dateAxis.events.on("selectionextremeschanged",
            (ev) => this.calibrateSeasonYAxis(ev, data, seasonYearCount, yearAxis));

          // cursor position event
          chart.cursor.events.on("cursorpositionchanged",
            (ev) => this.cursorPositionChanged(ev, data, closePriceYearlyData));

          chart.events.on("ready",(ev) => {
            this._showSpinner = false;
          });

          this._chart = chart;
        //});
      } else {
        this.destroyStockChart();
        this._chartLabel.nativeElement.innerHTML = this.sanitizer.sanitize(
          SecurityContext.HTML,this.sanitizer.bypassSecurityTrustHtml("Symbol not found."));
      }
    }
  }

  destroyStockChart(): void {
    this.zone.runOutsideAngular(() => {
      if (this._chart) {
        this._chart.dispose();
      }
    });
  }

  // ================================
  // Chart events and other functions
  // ================================
  displayChartLabel(exchange: string,
                    symbol: string,
                    symbolDescription: string,
                    closePrice: number,
                    previousClosePrice: number): void {

    let chartLabelHtml = exchange + ':<b>' + symbol + '</b>   ' +  '(' + symbolDescription + ')     ';

    if(closePrice > previousClosePrice) {
      chartLabelHtml +=  '<font color="palegreen" size="3"> +';
    } else if(closePrice = previousClosePrice) {
      chartLabelHtml +=  '<font color="gold" size="3"> ';
    } else {
      chartLabelHtml+=  '<font color="lightcoral" size="3"> -';
    }

    chartLabelHtml  +=  closePrice + '</font>';

    this._chartLabel.nativeElement.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML,this.sanitizer.bypassSecurityTrustHtml(chartLabelHtml));
  }

  cursorPositionChanged(ev, data: any, closePriceYearlyData: any) : void{
    if(ev) {
      // Display chart legend header data values
      let xAxis = ev.target.chart.xAxes.getIndex(0);
      let xPosition = Math.floor(xAxis.toAxisPosition(ev.target.xPosition) * 252);
      let quoteDate = xAxis.positionToDate(xAxis.toAxisPosition(ev.target.xPosition))
      let quoteDateString = quoteDate.toLocaleDateString();

      let chartCursorDataHtml = " ";
      if(xPosition < 126) {
        chartCursorDataHtml = "<font color='gray'>Date:</font><b>" + quoteDateString + "</b>    " +
                              "<font color='gray'>Open:</font><b>" + this.numberWithCommas(data[xPosition].openPrice) + "</b>    " +
                              "<font color='gray'>High:</font><b>" + this.numberWithCommas(data[xPosition].highPrice) + "</b>    " +
                              "<font color='gray'>Low:</font><b>" + this.numberWithCommas(data[xPosition].lowPrice) + "</b>    " +
                              "<font color='gray'>Close:</font><b>" + this.numberWithCommas(data[xPosition].closePrice) + "</b>    " +
                              "<font color='gray'>Volume:</font><b>" + this.numberWithCommas(data[xPosition].volume) + "</b>";
      }
      this._chartCursorData.nativeElement.innerHTML = this.sanitizer.sanitize(
        SecurityContext.HTML,this.sanitizer.bypassSecurityTrustHtml(chartCursorDataHtml));

      // Display season yearly data values
      let range = parseInt(this._scannerDataValue);
      let startX = Math.floor(xAxis.toAxisPosition(ev.target.xPosition) * 252);
      let endX = startX + range;
      let direction = "UP";
      let directionUp = 0;
      let directionUpTotal = 0;
      let directionDown = 0;
      let directionDownTotal = 0;

      for(var y=0;y<this._seasonYearCount;y++) {
        if(startX >= 0 && startX <251) {
          let startClosePrice = closePriceYearlyData[y][startX + 1];
          let endClosePrice = closePriceYearlyData[y][endX];
          let valuePercentage = 100;

          if(endClosePrice > startClosePrice) {
            if(startClosePrice > 0) {
              valuePercentage = ((endClosePrice - startClosePrice) / startClosePrice) * 100;

              direction = "UP";
              directionUp++;
              directionUpTotal += valuePercentage;
            }
          } else {
            if(endClosePrice > 0) {
              valuePercentage = ((startClosePrice - endClosePrice) / endClosePrice) * 100;

              direction = "DOWN";
              directionDown++;
              directionDownTotal += valuePercentage;
            }
          }
          this._seasonYear[y].value = valuePercentage.toFixed(2);
          this._seasonYear[y].direction = direction;
          this._scannerDataCountUp = directionUp;
          this._scannerDataCountDown = directionDown;
          if(directionUp > directionDown) {
            this._scannerDataTotalDisplay = directionUp + "/" + directionDown + " - " + (directionUpTotal/directionUp).toFixed(2) + "%";
          } else {
            this._scannerDataTotalDisplay = directionDown + "/" + directionUp + " - " + (directionDownTotal/directionDown).toFixed(2) + "%";
          }
        }

        //msi conditions
        this._msiCondition = "";
        if (xPosition >= 0 && xPosition <= 125) {
          if (data[xPosition].msikp >= data[xPosition].msid) {
            if (data[xPosition].msikp >= 20 && data[xPosition].msikp <= 80) {
              this._msiCondition = "Strong";
            }
            if (data[xPosition].msikp > 80) {
              this._msiCondition = "Fair";
            }
            if (data[xPosition].msikp < 20) {
              this._msiCondition = "Weak";
            }
          } else {
            if (data[xPosition].msikp >= 20 && data[xPosition].msikp <= 80) {
              this._msiCondition = "Strong";
            }
            if (data[xPosition].msikp > 80) {
              this._msiCondition = "Weak";
            }
            if (data[xPosition].msikp < 20) {
              this._msiCondition = "Fair";
            }
          }
        }

        //msi trade action
        this._msiTradeAction  = "Place Stop";
        if ((data[xPosition].msikp > data[xPosition].msid) &&
            (data[xPosition].msikp > 20 && data[xPosition].msikp < 80) &&
            (data[xPosition].ema3 > data[xPosition].ema8) &&
            (data[xPosition].closePrice > data[xPosition].ema3)) {
              this._msiTradeAction = "Buy/Cover";
        }
        if ((data[xPosition].msikp > data[xPosition].msid) &&
            (data[xPosition].msikp > 20 && data[xPosition].msikp < 80) &&
            (data[xPosition].ema3 < data[xPosition].ema8)) {
              this._msiTradeAction = "Place Stop";
        }
        if ((data[xPosition].msikp > data[xPosition].msid) &&
            (data[xPosition].msikp < 20) &&
            (data[xPosition].ema3 > data[xPosition].ema8)) {
              this._msiTradeAction = "Place Stop";
        }
        if ((data[xPosition].msikp > data[xPosition].msid) &&
            (data[xPosition].msikp < 20) &&
            (data[xPosition].ema3 < data[xPosition].ema8)) {
              this._msiTradeAction = "Place Stop";
        }
        if ((data[xPosition].msikp > data[xPosition].msid) &&
            (data[xPosition].msikp > 80) &&
            (data[xPosition].ema3 > data[xPosition].ema8)) {
              this._msiTradeAction = "Hold/Wait";
        }
        if ((data[xPosition].msikp > data[xPosition].msid) &&
            (data[xPosition].msikp > 80) &&
            (data[xPosition].ema3 < data[xPosition].ema8)) {
              this._msiTradeAction = "Place Stop";
        }

        if ((data[xPosition].msikp < data[xPosition].msid) &&
            (data[xPosition].msikp > 20 && data[xPosition].msikp < 80) &&
            (data[xPosition].ema3 < data[xPosition].ema8) &&
            (data[xPosition].closePrice < data[xPosition].ema3)) {
              this._msiTradeAction = "Sell/Short";
        }
        if ((data[xPosition].msikp < data[xPosition].msid) &&
            (data[xPosition].msikp > 20 && data[xPosition].msikp < 80) &&
            (data[xPosition].ema3 > data[xPosition].ema8)) {
              this._msiTradeAction = "Place Stop";
        }
        if ((data[xPosition].msikp < data[xPosition].msid) &&
            (data[xPosition].msikp < 20) &&
            (data[xPosition].ema3 < data[xPosition].ema8)) {
              this._msiTradeAction = "Hold/Wait";
        }
        if ((data[xPosition].msikp < data[xPosition].msid) &&
            (data[xPosition].msikp < 20) &&
            (data[xPosition].ema3 > data[xPosition].ema8)) {
              this._msiTradeAction = "Place Stop";
        }
        if ((data[xPosition].msikp < data[xPosition].msid) &&
            (data[xPosition].msikp > 80) &&
            (data[xPosition].ema3 < data[xPosition].ema8)) {
              this._msiTradeAction = "Place Stop";
        }
        if ((data[xPosition].msikp < data[xPosition].msid) &&
            (data[xPosition].msikp > 80) &&
            (data[xPosition].ema3 > data[xPosition].ema8)) {
              this._msiTradeAction = "Place Stop";
        }
      }
      this.cdr.detectChanges();
    }
  }

  calibratePriceAxis(ev, data: any, priceAxis: any): void {
    var axis = ev.target;
    var startX = Math.floor(axis.start * 252);
    var endX = Math.floor(axis.end * 252);
    var minClosePrice: number = 0;
    var maxClosePrice: number = 0;
    for (var i = startX; i < endX; i++) {
      if (i == startX) {
        minClosePrice = parseFloat(data[i].closePrice);
        maxClosePrice = parseFloat(data[i].closePrice);
      } else {
        if (parseFloat(data[i].closePrice) < minClosePrice) minClosePrice = parseFloat(data[i].closePrice);
        if (parseFloat(data[i].closePrice) > maxClosePrice) maxClosePrice = parseFloat(data[i].closePrice);
      }
    }

    var upClosePrice: number = 0;
    var downClosePrice: number = 0;
    if(endX > 124) {
      upClosePrice = maxClosePrice - parseFloat(data[125].closePrice);
      downClosePrice = parseFloat(data[125].closePrice) - minClosePrice;
      if (upClosePrice > downClosePrice) {
        priceAxis.max = maxClosePrice;
        priceAxis.min = minClosePrice - (upClosePrice - downClosePrice);
      } else if (upClosePrice < downClosePrice) {
        priceAxis.max = maxClosePrice + (downClosePrice - upClosePrice);
        priceAxis.min = minClosePrice;
      }
    } else {
      priceAxis.max = maxClosePrice;
      priceAxis.min = minClosePrice;
    }


  }

  calibrateSeason10Axis(ev, data: any, season10Axis: any) : void {
    var axis = ev.target;
    var startX = Math.floor(axis.start * 252);
    var endX = Math.floor(axis.end * 252);
    var minSeason10: number = 0;
    var maxSeason10: number = 0;
    for (var i = startX; i < endX; i++) {
      if (i == startX) {
        minSeason10 = parseFloat(data[i].season10);
        maxSeason10 = parseFloat(data[i].season10);
      } else {
        if (parseFloat(data[i].season10) < minSeason10) minSeason10 = parseFloat(data[i].season10);
        if (parseFloat(data[i].season10) > maxSeason10) maxSeason10 = parseFloat(data[i].season10);
      }
    }

    var upSeason10: number = 0;
    var downSeason10: number = 0;
    if(endX > 124) {
      upSeason10 = maxSeason10 - parseFloat(data[125].season10);
      downSeason10 = parseFloat(data[125].season10) - minSeason10;
      if (upSeason10 > downSeason10) {
        season10Axis.max = maxSeason10;
        season10Axis.min = minSeason10 - (upSeason10 - downSeason10);
      } else if (upSeason10 < downSeason10) {
        season10Axis.max = maxSeason10 + (downSeason10 - upSeason10);
        season10Axis.min = minSeason10;
      }
    } else {
      season10Axis.max = maxSeason10;
      season10Axis.min = minSeason10;
    }
  }

  calibrateSeason5Axis(ev, data: any, season5Axis: any) : void {
    var axis = ev.target;
    var startX = Math.floor(axis.start * 252);
    var endX = Math.floor(axis.end * 252);
    var minSeason5: number = 0;
    var maxSeason5: number = 0;
    for (var i = startX; i < endX; i++) {
      if (i == startX) {
        minSeason5 = parseFloat(data[i].season5);
        maxSeason5 = parseFloat(data[i].season5);
      } else {
        if (parseFloat(data[i].season5) < minSeason5) minSeason5 = parseFloat(data[i].season5);
        if (parseFloat(data[i].season5) > maxSeason5) maxSeason5 = parseFloat(data[i].season5);
      }
    }

    var upSeason5: number = 0;
    var downSeason5: number = 0;
    if (endX > 124) {
      upSeason5 = maxSeason5 - parseFloat(data[125].season5);
      downSeason5 = parseFloat(data[125].season5) - minSeason5;
      if (upSeason5 > downSeason5) {
        season5Axis.max = maxSeason5;
        season5Axis.min = minSeason5 - (upSeason5 - downSeason5);
      } else if (upSeason5 < downSeason5) {
        season5Axis.max = maxSeason5 + (downSeason5 - upSeason5);
        season5Axis.min = minSeason5;
      }
    } else {
      season5Axis.max = maxSeason5;
      season5Axis.min = minSeason5;
    }
  }

  calibrateSeasonYAxis(ev, data: any, seasonYearCount: number, yearAxis: any[]) : void {
    var axis = ev.target;
    var startX = Math.floor(axis.start * 252);
    var endX = Math.floor(axis.end * 252);
    var minSeasonY: number = 0;
    var maxSeasonY: number = 0;
    var upSeasonY: number = 0;
    var downSeasonY: number = 0;
    for (var y = 0; y < seasonYearCount; y++) {
      minSeasonY = 0;
      maxSeasonY = 0;
      for (var i = startX; i < endX; i++) {
        if (i == startX) {
          minSeasonY = parseFloat(data[i]["seasonY"+y]);
          maxSeasonY = parseFloat(data[i]["seasonY"+y]);
        } else {
          if (parseFloat(data[i]["seasonY"+y]) < minSeasonY) minSeasonY = parseFloat(data[i]["seasonY"+y]);
          if (parseFloat(data[i]["seasonY"+y]) > maxSeasonY) maxSeasonY = parseFloat(data[i]["seasonY"+y]);
        }
      }

      upSeasonY = 0;
      downSeasonY = 0;
      if (endX > 124) {
        upSeasonY = maxSeasonY - parseFloat(data[125]["seasonY"+y]);
        downSeasonY = parseFloat(data[125]["seasonY"+y]) - minSeasonY;
        if (upSeasonY > downSeasonY) {
          yearAxis[y].max = maxSeasonY;
          yearAxis[y].min = minSeasonY - (upSeasonY - downSeasonY);
        } else if (upSeasonY < downSeasonY) {
          yearAxis[y].max = maxSeasonY + (downSeasonY - upSeasonY);
          yearAxis[y].min = minSeasonY;
        }
      } else {
        yearAxis[y].max = maxSeasonY;
        yearAxis[y].min = minSeasonY;
      }
    }
  }

  computeMagentaChannelData(data: any, channel: string) : any[] {
    var startX: number = 0;
    var endX: number  = 251;
    var channelMaxLength: number = 30;
    var channelLength: number = 0;

    var coefficient: number;

    var channelStartX: number = startX > 125 ? 125 : startX;
    var channelEndX: number = endX > 125 ? 125 : endX;

    if (endX > 125) {
      channelLength = 126 - startX;
    } else {
      channelLength = endX - startX;
    }

    if(channelLength > 30) {
      let countX = 0;
      for (var i = channelEndX; i > startX; i--) {
        if (countX > 30) {
          coefficient = this.computeDataCorrelationCoefficient(data, i, channelEndX);
          if (coefficient <= 0.9) {
            channelStartX = i;
            break;
          }
        }
        countX++;
      }
    }
    channelLength = channelEndX - channelStartX;

    // define the slope
    var m: number = 0;
    if (endX > 125) {
      m = (parseFloat(data[125].closePrice) - parseFloat(data[channelStartX].closePrice)) / channelLength;
    } else {
      m = (parseFloat(data[channelEndX].closePrice) - parseFloat(data[channelStartX].closePrice)) / channelLength;
    }

    // get the intercepts
    var b = [];
    for (var i = 0; i < channelLength ; i++) {
        b[i] = parseFloat(data[i + channelStartX].closePrice) - (m * (i + 1));
    }

    b.sort(function (a, b) { return a - b; });
    var bMax: number = b[Math.floor(channelLength * .9)];
    var bMid: number = b[Math.floor(channelLength * .5)];
    var bMin: number = b[Math.floor(channelLength * .1)];

    var channelMaxdData = [
      { "date": data[channelStartX].quoteDate, "value": (m + bMax)},
      { "date": data[251].quoteDate, "value": ((m * (251 - channelStartX + 1)) + bMax)}
    ];
    var channelMidData = [
      { "date": data[channelStartX].quoteDate, "value": (m + bMid)},
      { "date": data[251].quoteDate, "value": ((m * (251 - channelStartX + 1)) + bMid)}
    ];
    var channelMinData = [
      { "date": data[channelStartX].quoteDate, "value": (m + bMin)},
      { "date": data[251].quoteDate, "value": ((m * (251 - channelStartX + 1)) + bMin)}
    ];

    if(channel == "MAX") {
      return channelMaxdData;
    }else if(channel == "MID") {
      return channelMidData;
    } else {
      return channelMinData;
    }
  }

  // ==============
  // Toogle methods
  // ==============
  toggleSidebar() : void {
    this._sideBarOpen = !this._sideBarOpen;
  }

  toggleSeason10(ev:any){
    if(ev.currentTarget.checked == true) {
      this._chart.series.getIndex(2).show();
    } else {
      this._chart.series.getIndex(2).hide();
    }
  }

  toggleSeason5(ev:any){
    if(ev.currentTarget.checked == true) {
      this._chart.series.getIndex(3).show();
    } else {
      this._chart.series.getIndex(3).hide();
    }
  }

  toggleVolume(ev: any) {
    if(ev.currentTarget.checked == true) {
      this._chart.series.getIndex(0).show();
    } else {
      this._chart.series.getIndex(0).hide();
    }
  }

  toggleSeasonY(ev: any, index: number) {
    if(ev.currentTarget.checked == true) {
      this._chart.series.getIndex(4+index).show();
    } else {
      this._chart.series.getIndex(4+index).hide();
    }
  }

  toggleMagentaChannel(ev: any) {
    this._chart.series.each(function(series) {
      if(series.name == "channelMaxSeries" ||
         series.name == "channelMidSeries" ||
         series.name == "channelMinSeries") {
        if(ev.currentTarget.checked == true) {
          series.show();
        } else {
          series.hide();
        }
      }
    });
  }

  // =====
  // Tools
  // =====
  numberWithCommas(x: number) : string{
    var nf = Intl.NumberFormat();
    //return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    return nf.format(x);
  }

  computeDataCorrelationCoefficient(data: any, startX: number, endX: number) : number{
    var X = 0;
    var Y = 0;
    var sumOfX = 0;
    var sumOfY = 0;
    var sumOfX2 = 0;
    var sumOfY2 = 0;
    var sumOfXY = 0;

    for (var i = startX - 1; i < endX - 1; i++) {
        X = X + 1;
        Y = parseFloat(data[i].closePrice);
        sumOfX = sumOfX + X;
        sumOfY = sumOfY + Y;
        sumOfXY = sumOfXY + (X * Y);
        sumOfX2 = sumOfX2 + (X * X);
        sumOfY2 = sumOfY2 + (Y * Y);
    }
    //r = Σ (xy) / sqrt [ ( Σ x2 ) * ( Σ y2 ) ]
    return (sumOfXY - ((sumOfX * sumOfY) / X)) / Math.sqrt(((sumOfX2 - ((sumOfX * sumOfX) / X)) * (sumOfY2 - ((sumOfY * sumOfY) / X)))); // Pearson
  }
}
