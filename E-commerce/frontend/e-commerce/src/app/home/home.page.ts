import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../models/product';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  product: Product[];
  constructor(private productService: ProductService, private router: Router) {}

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
}
