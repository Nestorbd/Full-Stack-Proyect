import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  })
};
const apiUrl = 'http://localhost:4000/api/productos';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  currentProductId: number;

  constructor(private http: HttpClient) { }

  setCurrentProductId(id: number){
    this.currentProductId = id;
  }
  getCurrentProductId(){
    return this.currentProductId;
  }
  getProductId(id: number): Observable<Product>{
    return this.http.get<Product>(apiUrl+"/"+id);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(apiUrl);
  }
}
