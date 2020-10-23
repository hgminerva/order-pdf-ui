import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-screener-pdf',
  templateUrl: './screener-pdf.component.html',
  styleUrls: ['./screener-pdf.component.scss']
})
export class ScreenerPdfComponent implements OnInit {

  constructor(
    private screenerPdfDialog: MatDialogRef<ScreenerPdfComponent>,
    @Inject(MAT_DIALOG_DATA) private screenerDetailData: any
  ) { }

  public isButtonPCRDisabled: boolean = true;

  public buttonClosePCRClick(): void {
    this.screenerPdfDialog.close(null);
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.isButtonPCRDisabled = false;
    }, 500);
  }

}
