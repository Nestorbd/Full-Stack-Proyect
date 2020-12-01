import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {
  SignInForm: FormGroup;
  SignUpForm: FormGroup;
  constructor(public fb:FormBuilder, private userService:UserService, private router: Router) {
    this.SignInForm = this.fb.group({
      username: [''],
      password: ['']
    })
    this.SignUpForm = this.fb.group({
      name: [''],
      username: [''],
      email: [''],
      confirmEmail:[''],
      password: [''],
      confirmPassword:['']
    })
   }

  ngOnInit() {
  }


  onFormSubmitSignIn(){
    if(!this.SignInForm.valid){
      return false;
    } else {
      let user = {
        id: null,
        name: null,
        username: this.SignInForm.value.username,
        email: null,
        password: this.SignInForm.value.password
      }
      this.userService.signIn(user)
      .subscribe((res) => {
        this.router.navigateByUrl("/home");
      })
    }
  }

  onFormSubmitSignUp(){
    if(!this.SignUpForm.valid){
      return false;
    } else {
      let user = {
        id: null,
        name: this.SignUpForm.value.name,
        username: this.SignUpForm.value.username,
        email: this.SignUpForm.value.email,
        password: this.SignUpForm.value.password
      }
      this.userService.addUser(user)
      .subscribe((res) => {
        this.router.navigateByUrl("/home");
      })
    }
  }
}
