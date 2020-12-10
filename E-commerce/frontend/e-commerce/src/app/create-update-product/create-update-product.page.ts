import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product';

@Component({
  selector: 'app-create-update-product',
  templateUrl: './create-update-product.page.html',
  styleUrls: ['./create-update-product.page.scss'],
})
export class CreateUpdateProductPage implements OnInit {
productForm:FormGroup;
product:Product;
  constructor(public fb: FormBuilder, private productService: ProductService, private router: Router) { 
    this.productForm = this.fb.group({
      name: [''],
      description: [''],
      price: [''],
      tax_rate: [''],
      img: [''],
      category: [''],
      quantity: [''],
      available: ['']
    })
    if(this.productService.isUpdateProduct){
this.productService.getProductId(this.productService.getCurrentProductId()).subscribe(product => {
  this.product = product;
  this.productForm = this.fb.group({
      name: [this.product.name],
      description: [this.product.description],
      price: [this.product.price],
      tax_rate: [this.product.tax_rate],
      img: [this.product.img],
      category: [this.product.category],
      quantity: [this.product.quantity],
      available: [this.product.available]
  })
})
    }
  }

  ngOnInit() {
    console.log(this.productService.isUpdateProduct)
  }

  onFormSubmitCreateUpdate(){
    if(!this.productForm.valid) {
      return false;
    } else {
      if(this.productService.isUpdateProduct){
        let product = {
          id: this.productService.getCurrentProductId(), 
          name: this.productForm.value.name,
          description: this.productForm.value.description,
          price: this.productForm.value.price,
          tax_rate: this.productForm.value.tax_rate,
          img: this.productForm.value.img,
          category: this.productForm.value.category,
          quantity: this.productForm.value.quantity,
          available: this.productForm.value.available
        }
        this.productService.updateProduct(product)
        .subscribe((res) => {
          this.router.navigateByUrl("/home");
        })

      }else{
        
        let product = {
          id: null, 
          name: this.productForm.value.name,
          description: this.productForm.value.description,
          price: this.productForm.value.price,
          tax_rate: this.productForm.value.tax_rate,
          img: this.productForm.value.img,
          category: this.productForm.value.category,
          quantity: this.productForm.value.quantity,
          available: this.productForm.value.available
        }
        this.productService.addProduct(product)
        .subscribe((res) => {
          this.router.navigateByUrl("/home");
        })
      }
    
    }
  }

}
