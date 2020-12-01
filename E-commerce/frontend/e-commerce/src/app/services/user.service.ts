import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../models/user';
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

  constructor(private http: HttpClient) { }

  setCurrentUserId(id: number){
    this.currentUserId = id;
  }
  getCurrentUserId(){
    return this.currentUserId;
  }

  signIn(user: User): Observable<any>{
    let bodyencoded = new URLSearchParams();
    bodyencoded.append("email", user.email);
    bodyencoded.append("password", user.password);
    let body = bodyencoded.toString();

    return this.http.post(apiUrl+"/signin", body, httpOptions);
  }
  getUserId(id: number): Observable<User>{
    return this.http.get<User>(apiUrl+"/"+id);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(apiUrl);
  }

  addUser(user: User): Observable<any>{
    let bodyencoded = new URLSearchParams();
    bodyencoded.append("name", user.name);
    bodyencoded.append("username", user.username);
    bodyencoded.append("email", user.email);
    bodyencoded.append("password", user.password);
    let body = bodyencoded.toString();

    return this.http.post(apiUrl, body, httpOptions);

  }

   updateUser(user: User): Observable<any>{
    let bodyencoded = new URLSearchParams();
    bodyencoded.append("name", user.name);
    bodyencoded.append("username", user.username);
    bodyencoded.append("email", user.email);
    bodyencoded.append("password", user.password);
    let body = bodyencoded.toString();

    return this.http.put(apiUrl + "/" + user.id, body, httpOptions);
  }
}