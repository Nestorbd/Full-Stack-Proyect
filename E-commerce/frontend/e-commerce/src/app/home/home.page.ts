import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../models/product';
import { ProductService } from '../services/product.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  
  product: Product[];
  constructor(private productService: ProductService,private userService: UserService,private router: Router) {}

  ngOnInit() {
    this.getAllProducts();
  }

  ionViewDidEnter(){
    this.getAllProducts();
  }

  getAllProducts(){
    this.productService.getProducts().subscribe( products => {
      this.product = products;
        })
  }

  deleteProduct(id: number){
    this.productService.deleteProduct(id).subscribe( () => {
      this.getAllProducts();
    })
  }
  createProduct(){
    this.productService.setIsUpdateProduct(false);
    this.router.navigateByUrl("/create-update-product");
  }
  updateProduct(id: number){
    this.productService.setIsUpdateProduct(true);
    this.productService.setCurrentProductId(id);
    this.router.navigateByUrl("/create-update-product")
  }

}
