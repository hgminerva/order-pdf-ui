import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { StockChartService } from '../../../services/magenta/stock-chart.service';

import { PcrDataModel } from './../../../models/screener/pcr-data-model';

@Component({
  selector: 'app-screener-detail',
  templateUrl: './screener-detail.component.html',
  styleUrls: ['./screener-detail.component.scss']
})
export class ScreenerDetailComponent implements OnInit {

  constructor(
    private screenerDetailDialog: MatDialogRef<ScreenerDetailComponent>,
    @Inject(MAT_DIALOG_DATA) private screenerDetailData: any,
    private stockChartService: StockChartService
  ) { }

  public _showSpinner: boolean = true;
  public isPcrSpinnerContentHidden: boolean = true;

  public isButtonPCRDisabled: boolean = true;

  public pcrDataModel: PcrDataModel = new PcrDataModel();

  public getPCRData(): void {
    setTimeout(() => {
      this.isButtonPCRDisabled = false;

      this._showSpinner = false;
      this.isPcrSpinnerContentHidden = false;

      this.pcrDataModel.order_number = this.screenerDetailData.currentRow.order_number;
      this.pcrDataModel.customer_name = this.screenerDetailData.currentRow.customer_name;
      this.pcrDataModel.email = this.screenerDetailData.currentRow.email;
      this.pcrDataModel.customer_address = this.screenerDetailData.currentRow.customer_address;
      this.pcrDataModel.product_code = this.screenerDetailData.currentRow.product_code;
      this.pcrDataModel.result = this.screenerDetailData.currentRow.result;
    }, 500);
  }

  public buttonSavePCRClick(): void {
    this.isButtonPCRDisabled = true;
    
    this.stockChartService.updatePcrData(this.pcrDataModel).subscribe(
      data => {
        this.screenerDetailDialog.close(200);
        this.isButtonPCRDisabled = false;
      }
    );
  }

  public buttonClosePCRClick(): void {
    this.screenerDetailDialog.close(null);
  }

  ngOnInit(): void {
    this.getPCRData();
  }

}
