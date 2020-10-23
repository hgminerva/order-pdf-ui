import { Injectable, Output, EventEmitter  } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  @Output() getCurrentUsername: EventEmitter<any> = new EventEmitter();

  constructor(
    private httpClient: HttpClient,
    private router: Router
  ) { }
  
  //public defaultAPIHostURL: "https://magentatrader4-api.azurewebsites.net";

  public loginSource = new Subject<[boolean, string]>();
  public loginObservable = this.loginSource.asObservable();

  public login(username: string, password: string): void {
    //let url = "https://magentatrader4-api.azurewebsites.net/token";
    //let body = "username=" + username + "&password=" + password + "&grant_type=password";
    //let options = { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) };

    //this.httpClient.post(url, body, options).subscribe(
      //response => {
        //localStorage.setItem('access_token', response["access_token"]);
        //localStorage.setItem('expires_in', response["expires_in"]);
        //localStorage.setItem('token_type', response["token_type"]);
        //localStorage.setItem('username', response["userName"]);
        
        localStorage.setItem('access_token', "sample_token");
        localStorage.setItem('expires_in', "sample_expiry");
        localStorage.setItem('token_type', "sample_token_type");
        localStorage.setItem('username', "admin");

        this.loginSource.next([true, "Login successful."]);

        this.getCurrentUsername.emit("admin");
      //},
      //error => {
        //this.loginSource.next([false, error["error"].error_description]);
      //}
    //)


  }

  public logout(): void {
    localStorage.setItem('access_token', "");
    localStorage.setItem('expires_in', "");
    localStorage.setItem('token_type', "");
    localStorage.setItem('username', "");
    
    this.getCurrentUsername.emit("");
  }

}
