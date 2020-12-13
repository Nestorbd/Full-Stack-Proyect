import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { User } from '../models/user';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {
  SignInForm: FormGroup;
  SignUpForm: FormGroup;
  checked: Boolean;
  constructor(public fb: FormBuilder, private userService: UserService, private router: Router, private alertController: AlertController) {
    this.SignInForm = this.fb.group({
      username: [''],
      password: ['']
    })
    this.SignUpForm = this.fb.group({
      name: [''],
      username: [''],
      email: [''],
      confirmEmail: [''],
      password: [''],
      confirmPassword: [''],
      termsAgree: ['']
    })
  }

  ngOnInit() {
  }

onChangeChecked(){ 
console.log(this.checked)
}
  onFormSubmitSignIn() {
    if (!this.SignInForm.valid) {
      return false;
    } else {
      let user = {
        id: null,
        name: null,
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
          this.router.navigateByUrl("home");
          //   this.router.navigateByUrl("home").then( () =>{
          //     location.reload();
          //   });
        }, err => {
          this.presentAlert("password not valid!", "Sign In");
        });
        
      }, err => {
        this.presentAlert("username or password not valid", "Sign In");
      });
      
    }
  }

  onFormSubmitSignUp() {
    let user: User = {
      id: null,
      name: this.SignUpForm.value.name,
      username: this.SignUpForm.value.username,
      email: this.SignUpForm.value.email,
      password: this.SignUpForm.value.password,
      isAdmin: false
    }
    this.userService.signUp(user)
      .subscribe(() => {
        this.router.navigateByUrl("home").then(() => {
          location.reload();
        });
      }, err => {
        this.presentAlert("Error", "Sign Up");
      });
  }

  validateSignUp() {
    if (!this.SignUpForm.valid) {
      return false;
    } else {
      let username = this.SignUpForm.value.username;
      let email = this.SignUpForm.value.email;
      let confirmEmail = this.SignUpForm.value.confirmEmail;
      let password = this.SignUpForm.value.password;
      let confirmPassword = this.SignUpForm.value.confirmPassword;

      this.userService.compareUserName(username).subscribe(compareUserName => {
        let validateUsername = false;
        let validateEmail = false;
        let validatePassword = false;
        let validateUseTerms = false;

        if (compareUserName) {
          document.getElementById("username-match").style.display = "block";
          validateUsername = false;
        } else {
          document.getElementById("username-match").style.display = "none";
          validateUsername = true;
        }
        this.userService.compareUserEmail(email).subscribe(compareUserEmail =>{
          let validateCompareEmail = false;

          if (compareUserEmail) {
            document.getElementById("email-match").style.display = "block";
            validateCompareEmail = false;
          } else {
            document.getElementById("email-match").style.display = "none";
            validateCompareEmail = true;
          }
          if (email != confirmEmail) {
            document.getElementById("email-confirm-match").style.display = "block";
            validateEmail = false;
          } else {
            document.getElementById("email-confirm-match").style.display = "none";
            validateEmail = true;
          }
          if (password != confirmPassword) {
            document.getElementById("password-confirm-match").style.display = "block";
            validatePassword = false;
          } else {
            document.getElementById("password-confirm-match").style.display = "none";
            validatePassword = true;
          }
          console.log(this.checked);
          if (!this.checked) {
            document.getElementById("check-terms-use").style.display = "block";
            validateUseTerms = false;
          } else {
            document.getElementById("check-terms-use").style.display = "none";
            validateUseTerms = true;
          }
          if (validateUsername && validateEmail && validatePassword && validateUseTerms) {
            this.onFormSubmitSignUp();
          }
        })
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
