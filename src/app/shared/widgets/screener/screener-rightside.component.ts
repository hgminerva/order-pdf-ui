import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { DatePipe } from '@angular/common'
import { Router } from '@angular/router';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { PcrDataModel } from '../../../models/screener/pcr-data-model';
import { StockChartService } from '../../../services/magenta/stock-chart.service';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ScreenerDetailComponent } from './../screener-detail/screener-detail.component';
import { ScreenerImportComponent } from './../screener-import/screener-import.component';
import { ScreenerPdfComponent } from './../screener-pdf/screener-pdf.component';

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
    @Inject(MAT_DIALOG_DATA) private _dialogInputData: any,
    private screenerDetailDialog: MatDialog,
    private screenerImportDialog: MatDialog,
    private screenerPdfDialog: MatDialog,
  ) { }

  ngOnInit() {
    this.getPcrData();

    if (this._dialogInputData != null) {
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
    let exportData = [];

    exportData.push({
      order_number: "Order Number",
      customer_name: "Customer Name",
      email: "Emal",
      customer_address: "Address",
      product_code: "Product Code",
      result: "Result"
    });

    if (this.pcrData.length > 0) {
      for (let i = 0; i < this.pcrData.length; i++) {
        exportData.push({
          order_number: this.pcrData[i].order_number,
          customer_name: this.pcrData[i].customer_name,
          email: this.pcrData[i].email,
          customer_address: this.pcrData[i].customer_address,
          product_code: this.pcrData[i].product_code,
          result: this.pcrData[i].result
        });
      }
    }

    let newDate: Date = new Date();
    let exportDate: string = this.datepipe.transform(newDate, 'yyyyMMddHHmmss');

    new ngxCsv(exportData, "PCR_" + exportDate);
  }

  public buttonImportCSV(): void {
    const openDialog = this.screenerImportDialog.open(ScreenerImportComponent, {
      width: '500px',
      data: {

      },
      disableClose: true
    });

    openDialog.afterClosed().subscribe(result => {
      if (result != null) {
        this.getPcrData();
      }
    });
  }

  public buttonOpenChart(data: any): void {
    const openDialog = this.screenerDetailDialog.open(ScreenerDetailComponent, {
      width: '500px',
      data: {
        currentRow: data
      },
      disableClose: true
    });

    openDialog.afterClosed().subscribe(result => {
      if (result != null) {
        this.getPcrData();
      }
    });
  }

  public buttonOpenChartPDF(data: any): void {
    const openDialog = this.screenerPdfDialog.open(ScreenerPdfComponent, {
      width: '1200px',
      data: {

      },
      disableClose: true
    });

    openDialog.afterClosed().subscribe(result => {
      if (result != null) {
      }
    });
  }

  public buttonCloseDialog(): void {
    /*     this._dialogRef.close({ data: "" }); */
  }
}
