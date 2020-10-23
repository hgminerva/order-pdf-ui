import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { LoginService } from './login.service';
import { LoginModel } from './login.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    public loginService: LoginService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  public loginSubscribe: any;
  public loginModel: LoginModel = {
    UserName: "",
    Password: ""
  };

  public snackBarHorizontalPosition: MatSnackBarHorizontalPosition = 'left';
  public snackBarVerticalPosition: MatSnackBarVerticalPosition = 'bottom';

  public login(): void {
    let buttonLogin: Element = document.getElementById("buttonLogin");
    buttonLogin.setAttribute("disabled", "disabled");

    if (this.loginModel.UserName === "" || this.loginModel.Password === "") {
      this.snackBar.open("Username and Password empty.", '', {
        duration: 3000,
        horizontalPosition: this.snackBarHorizontalPosition,
        verticalPosition: this.snackBarVerticalPosition,
        panelClass: ["orange-snackbar"]
      });
    } else {
      this.loginService.login(this.loginModel.UserName, this.loginModel.Password);
      this.loginSubscribe = this.loginService.loginObservable.subscribe(
        data => {
          if (data[0]) {
            this.snackBar.open("Login Successful.", '', {
              duration: 3000,
              horizontalPosition: this.snackBarHorizontalPosition,
              verticalPosition: this.snackBarVerticalPosition,
              panelClass: ["green-snackbar"]
            });

            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 500);
          } else {
            this.snackBar.open(data[1], '', {
              duration: 3000,
              horizontalPosition: this.snackBarHorizontalPosition,
              verticalPosition: this.snackBarVerticalPosition,
              panelClass: ["orange-snackbar"]
            });

            buttonLogin.removeAttribute("disabled");
          }

          if (this.loginSubscribe != null) this.loginSubscribe.unsubscribe();
        }
      );
    }
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (this.loginSubscribe != null) this.loginSubscribe.unsubscribe();
  }
}
