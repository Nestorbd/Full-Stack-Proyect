import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-product-view',
  templateUrl: './product-view.page.html',
  styleUrls: ['./product-view.page.scss'],
})
export class ProductViewPage implements OnInit {
  constructor(private productService: ProductService, private alertController: AlertController) {}

  ngOnInit() {
    this.getProduct();
  }

  getProduct(){
    this.productService.getProductId(this.productService.getCurrentProductId()).subscribe(product => {
      document.getElementById("product-name").innerText = product.name;
      document.getElementById("product-price").innerText = 'Price: '+product.price.toString()+'€';
      document.getElementById("product-description").innerText = product.description;
    }),err => {
      this.presentAlert("Error", "get product");
    };
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
