import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SignInPageRoutingModule } from './sign-in-routing.module';

import { SignInPage } from './sign-in.page';

import { IonicStorageModule } from '@ionic/storage';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SignInPageRoutingModule,
    IonicStorageModule.forRoot()
  ],
  declarations: [SignInPage]
})
export class SignInPageModule {}
