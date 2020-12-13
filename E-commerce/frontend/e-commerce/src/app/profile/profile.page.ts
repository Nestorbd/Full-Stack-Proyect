import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { Storage } from '@ionic/storage';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  constructor(private userService: UserService,private router: Router, private storage: Storage,  private alertController: AlertController) { }

  ngOnInit() {
    this.getUser();
  }

  ionViewDidEnter(){
    this.getUser();
  }

//  getUser() {
//    const self = this;
//     this.storage.get("username").then((username)=>{
//       const selfito = self;
//        this.userService.findOneUser(username).then(function(userito){
//          console.log("Userito:");
//          console.log(userito);
//          return userito;
//         //selfito.user = userito;
//     }).subscribe((user)=>{})
  
//   })

 // }

 getUser() {
  this.userService.findActualUser().subscribe(user => { 
     document.getElementById("user-name").innerText = user.name;
     document.getElementById("user-username").innerText = user.username;
     document.getElementById("user-email").innerText = user.email;
  }),err => {
    this.presentAlert("Error", "get user");
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
