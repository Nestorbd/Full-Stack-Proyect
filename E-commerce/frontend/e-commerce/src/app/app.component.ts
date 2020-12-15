import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { UserService } from './services/user.service';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import * as jQuery from 'jquery';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private userService: UserService,
    private storage: Storage, 
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.loginOrJustEnter();
    });
  }

  signOut(){
    this.userService.signOut();
  }

  loginOrJustEnter(){
    
    this.userService.isLoggedIn().then(loggedIn => {

      if(loggedIn){
      console.log("Logeado")
      this.storage.get("username").then(username =>{
        document.getElementById("userDropdown").innerText = username;
        document.getElementById("userDropdown").style.display = "block";
        document.getElementById("sign-in").style.display = "none";
      });
    //  let username = this.userService.getCurrentUserName();
    //  document.getElementById("userDropdown").innerText = username;
    //  document.getElementById("userDropdown").style.display = "block";
    //  document.getElementById("sign-up").style.display = "none";
        return true;
      } else{
        console.log("NO Logeado")
        document.getElementById("userDropdown").style.display = "none";
        document.getElementById("sign-in").style.display = "block";
        return false;
      }
      
    })
  }

  darkTheme(event){
    if(event.detail.checked){
      document.body.setAttribute('color-theme','dark');
    }else{
      document.body.setAttribute('color-theme','light');
    }
    
  }
}
