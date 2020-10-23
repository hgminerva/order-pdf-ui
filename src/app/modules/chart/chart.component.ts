import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';

import { StockChartService } from 'src/app/services/magenta/stock-chart.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { DialogPromptComponent } from 'src/app/shared/tools/dialog-prompt/dialog-prompt.component';
import { ScreenerRightsideComponent } from 'src/app/shared/widgets/screener/screener-rightside.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {
  @ViewChild('inputSymbol') _inputSymbol: ElementRef;

  public _chartDaily_data: Subject<any> = new Subject();
  public _chartDaily_symbol: string = "";
  public _chartSeasonality_data: Subject<any> = new Subject();
  public _chartSeasonality_symbol: string = "";
  public _stockPriceWrapper: any;
  public _defaultSymbol: String;

  public _tabIndex: number = 0;

  public _showSpinner: boolean;

  constructor(private _stockChartService: StockChartService,
              private _router: Router,
              private _route: ActivatedRoute,
              private _matDialogRef: MatDialog,
              private _dialogPrompt: MatDialog,) {
  }

  ngOnInit(): void {
    if (localStorage.getItem("access_token") == "") {
      setTimeout(() => {
        this._router.navigate(['/']);
      }, 500);
    }
    this._route.params.subscribe( params => this._defaultSymbol = params.symbol);

    if(this._defaultSymbol != null) {
      let symbol = this._defaultSymbol.toUpperCase();
      this.drawChart(symbol);
    }

  }

  updateStockChart(event: any): void {
    let symbol = event.target.value.toUpperCase();
    this.drawChart(symbol);
  }

  drawChart(symbol: string): void {
    if(symbol != null) {
      this._showSpinner = true;
      const stockPriceWrapperObservable = this._stockChartService.getStockPriceWrapper(symbol);
      stockPriceWrapperObservable.subscribe(stockPriceWrapper => {
        if(stockPriceWrapper.stockPrices.length > 0) {
          this._stockPriceWrapper = stockPriceWrapper
          if(this._tabIndex==0) {
            this._chartDaily_data.next(stockPriceWrapper);
            this._chartDaily_symbol = stockPriceWrapper.symbol;
          }
          if(this._tabIndex==1) {
            this._chartSeasonality_data.next(stockPriceWrapper);
            this._chartSeasonality_symbol = stockPriceWrapper.symbol;
          }
        }
        this._showSpinner = false;
      });
    }
  }

  tabChanged(): void {
    if(this._tabIndex==0) {
        if(this._stockPriceWrapper != null && (this._chartDaily_symbol != this._stockPriceWrapper.symbol)) {
          this._chartDaily_data.next(this._stockPriceWrapper);
          this._chartDaily_symbol = this._stockPriceWrapper.symbol;
        }
    }
    if(this._tabIndex==1) {
      if(this._stockPriceWrapper != null && (this._chartSeasonality_symbol != this._stockPriceWrapper.symbol)) {
        this._chartSeasonality_data.next(this._stockPriceWrapper);
        this._chartSeasonality_symbol = this._stockPriceWrapper.symbol;
      }
    }
  }

  openScreener(): void {
    const userRegistrationlDialogRef = this._matDialogRef.open(ScreenerRightsideComponent, {
      width: '1200px',
      height: '550px',
      disableClose: false,
      data: {
        isDialog: true,
        sourceComponent: "ChartComponent",
      },
    });

    userRegistrationlDialogRef.afterClosed().subscribe(result => {
      if (result.data != "") { this.drawChart(result.data); }
    });
  }

  updateSymbolData(): void {
    let symbol = this._inputSymbol.nativeElement.value;

    if(symbol == "") {
      const openDialog = this._dialogPrompt.open(DialogPromptComponent, {
        width: '450px',
        data: {
          dialogSource: "Error Message",
          dialogTitle: "Error message",
          dialogContent: "Please specify the symbol.", 
          dialogParams: {},
          dialogIsMessageOnly: true 
        },
        disableClose: true
      });
    } else {
      const openDialog = this._dialogPrompt.open(DialogPromptComponent, {
        width: '450px',
        data: {
          dialogSource: "Update Symbol",
          dialogTitle: "Update and reload " + symbol,
          dialogContent: "This process may take a couple of minutes.  Are you sure you want to update and reload the symbol?", 
          dialogParams: {"symbol": symbol},
          dialogIsMessageOnly: false 
        },
        disableClose: true
      });
      openDialog.afterClosed().subscribe(result => {
        if (result == true) {
          this.drawChart(symbol);
        }
      });
    }

  }

}
