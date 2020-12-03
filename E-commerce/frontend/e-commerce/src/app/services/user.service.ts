import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from  'rxjs/operators';
import { AuthResponse } from '../interfaces/auth-response';
import { User } from '../models/user';
import { Storage } from '@ionic/storage';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  })
};
const apiUrl = 'http://localhost:4000/api/usuarios';

@Injectable({
  providedIn: 'root'
})
export class UserService {

 
  currentUserId: number;

  constructor(private http: HttpClient, private  storage:  Storage) { }

  setCurrentUserId(id: number){
    this.currentUserId = id;
  }
  getCurrentUserId(){
    return this.currentUserId;
  }

  private getOptions(user: User){
    let base64UserAndPassword = window.btoa(user.username + ":" + user.password);

    let basicAccess = 'Basic ' + base64UserAndPassword;

    let options = {
      headers: {
        'Authorization' : basicAccess,
        'Content-Type' : 'application/x-www-form-urlencoded',
      }
      //, withCredentials: true
    };

    return options;
  }

  signUp(user: User): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(apiUrl, user, this.getOptions(user)).pipe(
      tap(async (res:  AuthResponse ) => {

        if (res.user) {
          await this.storage.set("token", res.access_token);
        }
      })

    );
  }

 

  signIn(user: User): Observable<any>{
    return this.http.post(apiUrl, null, this.getOptions(user)).pipe(
      tap(async (res: AuthResponse) => {

        if (res.user) {
          await this.storage.set("token", res.access_token);
        }
      })
    );
  }

  async logout() {
    await this.storage.remove("token");
  }

  async isLoggedIn() {
    // return this.authSubject.asObservable();
    let token = await this.storage.get("token");
    if (token){ //Just check if exists. This should be checked with current date
      return true;
    }
    return false;
  }

  // getUserId(id: number): Observable<User>{
  //   return this.http.get<User>(apiUrl+"/"+id);
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