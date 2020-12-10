import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthResponse } from '../interfaces/auth-response';
import { User } from '../models/user';
import { Storage } from '@ionic/storage';


const apiUrl = 'http://localhost:4000/api/usuarios/';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  currentUserName: string;

  constructor(private http: HttpClient, private storage: Storage, private router: Router) {


  }



  setCurrentUserName(username: string) {
    this.currentUserName = username;
  }
  getCurrentUserName() {
    return this.currentUserName;
  }

  private getOptions(user: User) {
    let base64UserAndPassword = window.btoa(user.username + ":" + user.password);

    let basicAccess = 'Basic ' + base64UserAndPassword;

    let options = {
      headers: {
        'Authorization': basicAccess,
        'Content-Type': 'application/x-www-form-urlencoded',
      }
      //, withCredentials: true
    };

    return options;
  }

  private getHeader() {
    return this.storage.get("token").then(tokensito => {
      console.log("tokensito: " + tokensito);
      let basicAccess = 'Bearer ' + tokensito;

      let options = {
        headers: {
          'Authorization': basicAccess,
          'Content-Type': 'application/x-www-form-urlencoded',
        }
        //, withCredentials: true
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
          console.log("en res.user:");
          console.log(res);
          await this.storage.set("token", res.access_token);
          await this.storage.set("username", res.user.username);
          console.log("despues de los sets")
          console.log(res.access_token);
          console.log(this.storage.get("token"));
        }
      })
    );
  }

  async signOut() {
    await this.storage.remove("token");
    await this.storage.remove("username");
  }

  async isLoggedIn() {
    // return this.authSubject.asObservable();
    let token = await this.storage.get("token");
    if (token) { //Just check if exists. This should be checked with current date
      return true;
    }
    return false;
  }

  findOneUser(username: string) {
    console.log("estoy en findOneUser")
    return this.getHeader().then(myOptions => {
      console.log(myOptions);
      console.log(username);
      return this.http.get<User>(apiUrl + username, myOptions)
    });

  }

  findActualUser() {
    console.log("estoy en findOneUser")
    return this.getHeader().then(myOptions => {
      console.log(myOptions);
     return this.storage.get("username").then(username => {
        console.log(username);
        return this.http.get<User>(apiUrl + username, myOptions).subscribe(user =>{
          return user;
        })
      })
      
    });

  }
  // getUserId(id: number){
  //   return this.http.get(apiUrl+"/"+id, {headers: this.httpOptions});
  // }

  // getUsers(): Observable<User[]> {
  //   return this.http.get<User[]>(apiUrl);
  // }

  // addUser(user: User): Observable<any>{
  //   let bodyencoded = new URLSearchParams();
  //   bodyencoded.append("name", user.name);
  //   bodyencoded.append("username", user.username);
  //   bodyencoded.append("email", user.email);
  //   bodyencoded.append("password", user.password);
  //   let body = bodyencoded.toString();

  //   return this.http.post(apiUrl, body, httpOptions);

  // }

  //  updateUser(user: User): Observable<any>{
  //   let bodyencoded = new URLSearchParams();
  //   bodyencoded.append("name", user.name);
  //   bodyencoded.append("username", user.username);
  //   bodyencoded.append("email", user.email);
  //   bodyencoded.append("password", user.password);
  //   let body = bodyencoded.toString();

  //   return this.http.put(apiUrl + "/" + user.id, body, httpOptions);
  // }
}