import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthResponse } from '../interfaces/auth-response';
import { User } from '../models/user';
import { Storage } from '@ionic/storage';
import { from } from 'rxjs';
import { map, concatAll } from 'rxjs/operators';

const apiUrl = 'http://localhost:4000/api/usuarios/';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  //currentUserName: string;
 currentUserIsAdmin: boolean = false;

  constructor(private http: HttpClient, private storage: Storage, private router: Router) {


  }



  // setCurrentUserName(username: string) {
  //   this.currentUserName = username;
  // }
  // getCurrentUserName() {
  //   return this.currentUserName;
  // }

  private getOptions(user: User) {
    let base64UserAndPassword = window.btoa(user.username + ":" + user.password);

    let basicAccess = 'Basic ' + base64UserAndPassword;

    let options = {
      headers: {
        'Authorization': basicAccess,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };

    return options;
  }

  private getHeader() {
    return this.storage.get("token").then(token => {
      let basicAccess = 'Bearer ' + token;

      let options = {
        headers: {
          'Authorization': basicAccess,
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      };

      return new Promise((resolve, reject) => { resolve(options) });
    });

  }

  signUp(user: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(apiUrl, user).pipe(
      tap(async (res: AuthResponse) => {

        if (res.user) {
          await this.storage.set("token", res.access_token);
          await this.storage.set("username", res.user.username);
        }
      })

    );
  }



  signIn(user: User): Observable<any> {
    return this.http.post(apiUrl + "signin", null, this.getOptions(user)).pipe(
      tap(async (res: AuthResponse) => {

        if (res.user) {
          await this.storage.set("token", res.access_token);
          await this.storage.set("username", res.user.username);
         // this.currentUserIsAdmin = res.user.isAdmin;
        }
      })
    );
  }

   

  async signOut() {
    await this.storage.remove("token");
    await this.storage.remove("username");
    // this.currentUserIsAdmin = false;
  }

  async isLoggedIn() {
    let token = await this.storage.get("token");
    if (token) { 
      await this.findActualUser().subscribe(user => {
        this.currentUserIsAdmin = user.isAdmin;
      })
      return true;
    }
    return false;
  }

  compareUserName(username: string){
    return this.http.get(apiUrl+"username/compare/"+username);
  }

  compareUserEmail(email: string){
    return this.http.get(apiUrl+"email/compare/"+email);
  }

  findActualUser(): Observable<any> {
    return from(
      Promise.all([
        this.getHeader(),
        this.storage.get("username")
      ])).pipe(
        map(values => {
          return this.http.get<User>(apiUrl + values[1], values[0]);
        }),
        concatAll()
      );
  }
}