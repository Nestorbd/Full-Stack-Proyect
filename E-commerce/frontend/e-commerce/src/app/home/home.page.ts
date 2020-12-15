import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../models/product';
import { ProductService } from '../services/product.service';
import { UserService } from '../services/user.service';
import { AlertController } from '@ionic/angular';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  
  product: Product[];
  constructor(private productService: ProductService,private userService: UserService,private router: Router,  private alertController: AlertController) {}

  ngOnInit() {
    this.getAllProducts();
  }

  ionViewDidEnter(){
    this.getAllProducts();

  }

  getAllProducts(){
    this.productService.getProducts().subscribe( products => {
      this.product = products;
        }),err => {
          this.presentAlert("Error", "get products");
        }
  }

  deleteProduct(id: number){
    this.productService.deleteProduct(id).subscribe( () => {
      this.getAllProducts();
    }),err => {
      this.presentAlert("Error", "delete product");
    }
  }
  createProduct(){
    this.productService.setIsUpdateProduct(false);
    this.router.navigateByUrl("/create-update-product");
  }
  updateProduct(id: number){
    this.productService.setIsUpdateProduct(true);
    this.productService.setCurrentProductId(id);
    this.router.navigateByUrl("/create-update-product");
  }
  viewProduct(id:number){
    this.productService.setCurrentProductId(id);
    this.router.navigateByUrl("/product-view");
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
