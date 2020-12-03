import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateUpdateProductPage } from './create-update-product.page';

const routes: Routes = [
  {
    path: '',
    component: CreateUpdateProductPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateUpdateProductPageRoutingModule {}
