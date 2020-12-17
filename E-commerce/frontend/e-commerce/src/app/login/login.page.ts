import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  SignInForm: FormGroup;

  constructor(public fb: FormBuilder, private userService: UserService, private router: Router, private alertController: AlertController, private modalController: ModalController) {
    this.SignInForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })
   }

  ngOnInit() {
  }

  closeModal() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  signUp(){
    this.router.navigateByUrl('/sign-in');
    this.closeModal();
  }

  onFormSubmitSignIn() {
    if (!this.SignInForm.valid) {
      return false;
    } else {
      let user = {
        id: null,
        name: null,
        lastName: null,
        username: this.SignInForm.value.username,
        email: null,
        password: this.SignInForm.value.password,
        isAdmin: null
      }
      this.userService.compareUserName(user.username).subscribe(compareUserName => {
        if (!compareUserName) {
          this.presentAlert("Username not yet registered", "Sign In");
          return;
        } 
        this.userService.signIn(user)
        .subscribe((res) => {
          if (!res.access_token) {
            this.presentAlert("invalid credentials", "Sign In");
            return;
          }
          // this.router.navigateByUrl("home");
            this.router.navigateByUrl("home").then( () =>{
              
              location.reload();
            });
        }, err => {
          this.presentAlert("password not valid!", "Sign In");
        });
        
      }, err => {
        this.presentAlert("username or password not valid", "Sign In");
      });
      
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
