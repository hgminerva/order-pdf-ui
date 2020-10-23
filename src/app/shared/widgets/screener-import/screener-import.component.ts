import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { StockChartService } from '../../../services/magenta/stock-chart.service';

@Component({
  selector: 'app-screener-import',
  templateUrl: './screener-import.component.html',
  styleUrls: ['./screener-import.component.scss']
})
export class ScreenerImportComponent implements OnInit {

  constructor(
    private screenerImportDialog: MatDialogRef<ScreenerImportComponent>,
    @Inject(MAT_DIALOG_DATA) private screenerDetailData: any,
    private stockChartService: StockChartService
  ) { }

  public _showSpinner: boolean = true;
  public isPcrSpinnerContentHidden: boolean = true;

  public isButtonPCRDisabled: boolean = true;

  public CSVContent: string = "";
  public JSONData: string = "";

  public onFileSelect(input: HTMLInputElement): void {
    const files = input.files;
    if (files && files.length) {
      const fileToRead = files[0];
      const fileReader = new FileReader();

      fileReader.onload = function (readerEvt: any) {
        const textFromFileLoaded = readerEvt.target.result;
        this.CSVContent = textFromFileLoaded;

        let lines = this.CSVContent.split("\n");
        let result = [];

        let headers = [
          "InformationCode",
          "InformationGroup",
          "Value",
          "Particulars",
          "Username",
          "IsPrinted"
        ];

        for (let i = 1; i < lines.length - 1; i++) {
          let obj = {};
          let currentline = lines[i].split(",");

          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
          }

          result.push(obj);
        }

        this.JSONData = JSON.stringify(result);
      }.bind(this);
      fileReader.readAsText(fileToRead, "UTF-8");
    }
  }

  public buttonImportPCRClick(): void {
    this.isButtonPCRDisabled = true;

    this.stockChartService.importPcrData(this.JSONData).subscribe(
      data => {
        this.screenerImportDialog.close(200);
        this.isButtonPCRDisabled = false;
      }
    );
  }

  public buttonClosePCRClick(): void {
    this.screenerImportDialog.close(null);
  }

  ngOnInit(): void {
    this.isButtonPCRDisabled = false;

    setTimeout(() => {
      this.isButtonPCRDisabled = false;

      this._showSpinner = false;
      this.isPcrSpinnerContentHidden = false;
    }, 500);
  }
}
