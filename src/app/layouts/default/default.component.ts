import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/modules/login/login.service';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {

  public sideBarOpen: boolean = false;
  public currentUsername: string = "";

  constructor(private loginService: LoginService) { 
    loginService.getCurrentUsername.subscribe(username=>this.secureComponent(username)); 
  }

  ngOnInit(): void {
  }

  secureComponent(username: string): void {
    this.currentUsername = username;
    if(this.currentUsername) {
      this.sideBarOpen = true;
    } else {
      this.sideBarOpen = false;
    }
  }

  sideBarToggler($event) {
    this.sideBarOpen = !this.sideBarOpen;
  }
}
