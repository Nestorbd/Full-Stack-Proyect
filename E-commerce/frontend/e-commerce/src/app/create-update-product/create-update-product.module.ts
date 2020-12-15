import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateUpdateProductPageRoutingModule } from './create-update-product-routing.module';

import { CreateUpdateProductPage } from './create-update-product.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CreateUpdateProductPageRoutingModule
  ],
  declarations: [CreateUpdateProductPage]
})
export class CreateUpdateProductPageModule {}
