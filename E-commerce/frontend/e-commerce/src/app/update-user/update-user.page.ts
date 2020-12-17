import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.page.html',
  styleUrls: ['./update-user.page.scss'],
})
export class UpdateUserPage implements OnInit {
  UpdateForm: FormGroup;
  checked: Boolean;
  constructor(public fb: FormBuilder, private userService: UserService, private router: Router, private alertController: AlertController, private storage: Storage) { 
    this.UpdateForm = this.fb.group({
      name: ['',Validators.required],
      lastName: ['',Validators.required],
      username: ['',Validators.required],
      email: ['',Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])],
      confirmEmail: ['',Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])],
      password: ['',Validators.required],
      confirmPassword: ['',Validators.required],
      termsAgree: ['',Validators.required]
    });
    this.userService.findActualUser().subscribe((user) => {
      this.UpdateForm = this.fb.group({
        name: [user.name],
        lastName: [user.lastName],
        username: [user.username],
        email: [user.email,Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])],
        confirmEmail: ['',Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
        ])],
        password: ['',Validators.required],
        confirmPassword: ['',Validators.required]
      });
    });
  }

  ngOnInit() {
  }



  validateUpdateForm() {
    if (!this.UpdateForm.valid) {
      return false;
    } else {
      let username = this.UpdateForm.value.username;
      let email = this.UpdateForm.value.email;
      let confirmEmail = this.UpdateForm.value.confirmEmail;
      let password = this.UpdateForm.value.password;
      let confirmPassword = this.UpdateForm.value.confirmPassword;

      this.userService.findActualUser().subscribe(user => {
        let id = user.id;
console.log(id);
console.log(username);
      this.userService.compareUserNamewithOtherUsers(username,id).subscribe(observableCompareUserName => {

        observableCompareUserName.subscribe(compareUserName =>{
          let validateUsername = false;
          let validateEmail = false;
          let validatePassword = false;
          if (compareUserName) {
            document.getElementById("username-match").style.display = "block";
            validateUsername = false;
          } else {
            document.getElementById("username-match").style.display = "none";
            validateUsername = true;
          }
          this.userService.compareEmailwithOtherUsers(email,id).subscribe(ObservablecompareUserEmail =>{

            ObservablecompareUserEmail.subscribe(compareUserEmail => {
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
              
              if (validateUsername && validateEmail && validatePassword) {
                this.onFormSubmitUpdateUser();
              }
            })
            
          })
        })
      });
      })

    }
  }

  onFormSubmitUpdateUser(){
    this.userService.findActualUser().subscribe(currentUser => {
      let user = {
        id: currentUser.id,
        name: this.UpdateForm.value.name,
        lastName: this.UpdateForm.value.lastName,
        username: this.UpdateForm.value.username,
        email: this.UpdateForm.value.email,
        password: this.UpdateForm.value.password,
        isAdmin: false
      }
      
      this.userService.updateUser(user)
        .subscribe((res) => {
          console.log(res)
          this.router.navigateByUrl("/profile").then(() => {
          //  location.reload();
          });
        }, err => {
          this.presentAlert("Error", "Update user");
        });
    })
    
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
