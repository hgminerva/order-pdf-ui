import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { DatePipe } from '@angular/common'
import { Router } from '@angular/router';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { PcrDataModel } from '../../../models/screener/pcr-data-model';
import { StockChartService } from '../../../services/magenta/stock-chart.service';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface PcrResult {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-widget-screener-rightside',
  templateUrl: './screener-rightside.component.html',
  styleUrls: ['./screener-rightside.component.scss']
})
export class ScreenerRightsideComponent implements OnInit {
  public _isDialog: boolean = false;
  public _dialogSourceComponent: string = "";

  public pcrDisplayedColumns: string[] = [
    'button_edit',
    'button_report',
    'button_email',
    'order_number',
    'customer_name',
    'email',
    'customer_address',
    'product_code',
    'result'
  ];

  public pcrDataSource: MatTableDataSource<PcrDataModel>;
  public pcrData: PcrDataModel[] = []

  public _showSpinner: boolean = true;
  public isPcrSpinnerContentHidden: boolean = true;
  public isRefreshButtonDisabled: boolean = true;

  @ViewChild('pcrPaginator') public pcrPaginator: MatPaginator;
  @ViewChild('pcrSort') public pcrSort: MatSort;

  constructor(
    private stockChartService: StockChartService,
    public datepipe: DatePipe,
    private router: Router,
    private _dialogRef: MatDialogRef<ScreenerRightsideComponent>,
    @Inject(MAT_DIALOG_DATA) private _dialogInputData: any
  ) { }

  ngOnInit() {
    this.getPcrData();

    if(this._dialogInputData != null) {
      this._isDialog = this._dialogInputData.isDialog;
      this._dialogSourceComponent = this._dialogInputData.sourceComponent;
    }
  }
  // =========
  // Functions
  // =========
  public getPcrData(): void {
    this.pcrData = [];
    this.pcrDataSource = new MatTableDataSource(this.pcrData);
    this.pcrDataSource.paginator = this.pcrPaginator;
    this.pcrDataSource.sort = this.pcrSort;

    this.stockChartService.getPcrData().subscribe(
      data => {
        this._showSpinner = false;
        this.isPcrSpinnerContentHidden = false;

        this.isRefreshButtonDisabled = false;

        console.log(data);

        if (data.length > 0) {
          this.pcrData = data;
          this.pcrDataSource = new MatTableDataSource(this.pcrData);
          this.pcrDataSource.paginator = this.pcrPaginator;
          this.pcrDataSource.sort = this.pcrSort;
        }
      }
    );
  }
  public pcrFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.pcrDataSource.filter = filterValue.trim().toLowerCase();

    if (this.pcrDataSource.paginator) {
      this.pcrDataSource.paginator.firstPage();
    }
  }
  // ======
  // Events
  // ======
  public buttonGetResults(): void {
    this._showSpinner = true;
    this.isPcrSpinnerContentHidden = true;

    this.isRefreshButtonDisabled = true;

    this.getPcrData();
  }
  public buttonExportCSV(): void {
    // let exportData = [];

    // exportData.push({
    //   Symbol: "Symbol",
    //   Description: "Description",
    //   Exchange: "Exchange",
    //   Price: "Price",
    //   Vol: "Vol (M)"
    // });

    // if (this.screenerData.length > 0) {
    //   for (let i = 0; i < this.screenerData.length; i++) {
    //     exportData.push({
    //       Symbol: this.screenerData[i].Symbol,
    //       Description: this.screenerData[i].Description,
    //       Exchange: this.screenerData[i].Exchange,
    //       Price: this.screenerData[i].Price,
    //       Vol: this.screenerData[i].Vol
    //     });
    //   }
    // }

    // let newDate: Date = new Date();
    // let exportDate: string = this.datepipe.transform(newDate, 'yyyyMMddHHmmss');

    // new ngxCsv(exportData, "Screener_Rightside_" + exportDate);
  }
  public buttonOpenChart(symbol: String): void {
/*     this.router.navigate(['/chart', symbol]);
    if(this._isDialog == true) {
      this._dialogRef.close({ data: symbol });
    } else {
      this.router.navigate(['/chart', symbol]);
    } */
  }
  public buttonCloseDialog(): void {
/*     this._dialogRef.close({ data: "" }); */
  }
}
