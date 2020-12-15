import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product';
import { Storage } from '@ionic/storage';
import { from } from 'rxjs';

// const httpOptions = {
//   headers: new HttpHeaders({
//     'Content-Type': 'application/x-www-form-urlencoded'
//   })
// };


const apiUrl = 'http://localhost:4000/api/productos';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  currentProductId: number;
  isUpdateProduct: boolean = false;
  constructor(private http: HttpClient, private storage: Storage) {
    
    
   }

  setIsUpdateProduct(isUpdate:boolean){
    this.isUpdateProduct = isUpdate;
  }

  setCurrentProductId(id: number){
    this.currentProductId = id;
  }
  getCurrentProductId(){
    return this.currentProductId;
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

  getProductId(id: number): Observable<Product>{
    return this.http.get<Product>(apiUrl+"/"+id);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(apiUrl);
  }

  compareProductName(name: string){
    return this.http.get(apiUrl+"/name/compare/"+name);
  }

  deleteProduct(id: number){
      return this.http.delete(apiUrl + "/" + id); 
  }

  addProduct(product: Product): Observable<any>{
    let bodyencoded = new URLSearchParams();
    bodyencoded.append("name", product.name);
    bodyencoded.append("description", product.description);
    bodyencoded.append("price", product.price.toString());
    bodyencoded.append("tax_rate", product.tax_rate.toString());
    bodyencoded.append("img",  null);
    bodyencoded.append("category", product.category);
    bodyencoded.append("quantity", product.quantity.toString());
    bodyencoded.append("available", product.available.toString());
    let body = bodyencoded.toString();

   // return this.http.post(apiUrl, body);
return from(this.getHeader().then(myOptions=>{
  console.log(body)
  return this.http.post(apiUrl, body, myOptions);
}))
  }

   updateProduct(product: Product): Observable<any>{
     console.log(product)
    let bodyencoded = new URLSearchParams();
    bodyencoded.append("name", product.name);
    bodyencoded.append("description", product.description);
    bodyencoded.append("price", product.price.toString());
    bodyencoded.append("tax_rate", product.tax_rate.toString());
    bodyencoded.append("img",  null);
    bodyencoded.append("category", product.category);
    bodyencoded.append("quantity", product.quantity.toString());
    bodyencoded.append("available", product.available.toString());
    let body = bodyencoded;

    //return this.http.put(apiUrl + "/" + product.id, body);
   return  from(this.getHeader().then(myOptions=>{
      console.log(body)
     return this.http.put(apiUrl + "/update/" + product.id, body, myOptions);
    }))
  }
}
