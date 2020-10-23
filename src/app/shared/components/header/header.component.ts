import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { LoginService } from 'src/app/modules/login/login.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output() toggleSidebarForMe: EventEmitter<any> = new EventEmitter();

  public isLoggedIn: boolean = false;
  public currentUsername: string = "";

  public snackBarHorizontalPosition: MatSnackBarHorizontalPosition = 'left';
  public snackBarVerticalPosition: MatSnackBarVerticalPosition = 'bottom';

  public loginSubscribe: any;

  constructor(private loginService: LoginService,
              private router: Router,
              private snackBar: MatSnackBar) {
    loginService.getCurrentUsername.subscribe(username=>this.secureComponent(username));
  }

  ngOnInit(): void {
    this.secureComponent(localStorage.getItem("username"));
  }

  secureComponent(username: string): void {
    this.currentUsername = username;
    if(this.currentUsername) {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;

      setTimeout(() => {
        this.router.navigate(['/']);
      }, 500);
    }
  }

  logout() {
    this.loginService.logout();
  }

  toggleSidebar() {
    this.toggleSidebarForMe.emit();
  }
}
