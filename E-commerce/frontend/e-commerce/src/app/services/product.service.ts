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
  isUpdateProduct: boolean = false;
  constructor(private http: HttpClient) { }

  setIsUpdateProduct(isUpdate:boolean){
    this.isUpdateProduct = isUpdate;
  }

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

  deleteProduct(id: number): Observable<any>{
    return this.http.delete(apiUrl + "/" + id);
  }

  addProduct(product: Product): Observable<any>{
    let bodyencoded = new URLSearchParams();
    bodyencoded.append("name", product.name);
    bodyencoded.append("description", product.description);
    bodyencoded.append("price", product.price.toString());
    bodyencoded.append("tax_rate", product.tax_rate.toString());
    bodyencoded.append("img", product.img.toString());
    bodyencoded.append("category", product.category);
    bodyencoded.append("quantity", product.quantity.toString());
    bodyencoded.append("available", product.available.toString());
    let body = bodyencoded.toString();

    return this.http.post(apiUrl, body, httpOptions);

  }

   updateProduct(product: Product): Observable<any>{
    let bodyencoded = new URLSearchParams();
    bodyencoded.append("name", product.name);
    bodyencoded.append("description", product.description);
    bodyencoded.append("price", product.price.toString());
    bodyencoded.append("tax_rate", product.tax_rate.toString());
    bodyencoded.append("img", product.img.toString());
    bodyencoded.append("category", product.category);
    bodyencoded.append("quantity", product.quantity.toString());
    bodyencoded.append("available", product.available.toString());
    let body = bodyencoded.toString();

    return this.http.put(apiUrl + "/" + product.id, body, httpOptions);
  }
}
