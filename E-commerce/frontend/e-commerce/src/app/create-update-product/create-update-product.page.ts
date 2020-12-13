import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
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
checked: boolean;
  constructor(public fb: FormBuilder, private productService: ProductService, private router: Router, private alertController: AlertController) { 
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
    this.isUpdateOrCreate();
  }


  
onChangeChecked(){ 
  console.log(this.checked)
  }
  isUpdateOrCreate(){
if(this.productService.isUpdateProduct){
  document.getElementById("create-update").innerText = "Update";
}else{
  document.getElementById("create-update").innerText = "Create";
}
  }


  onFormSubmitCreateUpdate(){
    if(!this.productForm.valid) {
      this.presentAlert("Something date is not valid", "Update or Create a Product");
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
              available: this.checked
            }
            this.productService.updateProduct(product)
            .subscribe((res) => {
             // this.router.navigateByUrl("/home");
            }),err => {
              this.presentAlert("Something error to uptade product", "Update a Product");
            }
         
      }else{
        this.productService.compareProductName(this.productForm.value.name).subscribe(name =>{
          if(!name){
            let product = {
              id: null, 
              name: this.productForm.value.name,
              description: this.productForm.value.description,
              price: this.productForm.value.price,
              tax_rate: this.productForm.value.tax_rate,
              img: this.productForm.value.img,
              category: this.productForm.value.category,
              quantity: this.productForm.value.quantity,
              available: this.checked
            }
            this.productService.addProduct(product)
            .subscribe((res) => {
              this.router.navigateByUrl("/home");
            }), err => {
              this.presentAlert("Something error create product", "Create a Product");
            }
          }else{
            this.presentAlert("This product already exists", "Create a Product");
          }
        }), err => {
          this.presentAlert("Something error to compare product", "Create a Product");
        }
      }
    }
  }

  async presentAlert(message: string, origin: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Error',
      subHeader: message,
      message: 'Could not ' + origin + '. Try again.',
      buttons: ['OK']
    });

    await alert.present();
  }

}
