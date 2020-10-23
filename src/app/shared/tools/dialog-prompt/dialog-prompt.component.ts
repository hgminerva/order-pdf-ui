import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { StockChartService } from '../../../services/magenta/stock-chart.service';

@Component({
  selector: 'app-dialog-prompt',
  templateUrl: './dialog-prompt.component.html',
  styleUrls: ['./dialog-prompt.component.scss']
})
export class DialogPromptComponent implements OnInit {
  public dialogSource: string = this._dialogParams.dialogSource;
  public dialogTitle: string = this._dialogParams.dialogTitle;
  public dialogContent: string = this._dialogParams.dialogContent;
  public dialogParams: string = this._dialogParams.dialogParams;
  public dialogIsMessageOnly: boolean = this._dialogParams.dialogIsMessageOnly;

  public isOkButtonDisabled: boolean = false;
  public isCloseButtonDisabled: boolean = false;

  constructor(private _dialogPrompt: MatDialogRef<DialogPromptComponent>,
              @Inject(MAT_DIALOG_DATA) private _dialogParams: any,
              private _toastr: ToastrService,
              private _stockChartService: StockChartService,) { }

  public buttonCloseClick(): void {
    this._dialogPrompt.close(false);
  }

  public buttonOkClick(): void {
    if(this.dialogSource == "Update Symbol") {
      this._stockChartService.updateEodData(this._dialogParams.symbol).subscribe( data => {
        if(data == "Ok") {
          this._toastr.success('The symbol EOD is now updated.');
          this._dialogPrompt.close(true);
        } else {
          this._toastr.error('Unable to update symbol EOD.');
        }
      });
    }
  }

  ngOnInit(): void {
  }

}
