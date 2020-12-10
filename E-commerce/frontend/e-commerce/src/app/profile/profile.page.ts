import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
user: User;
  constructor(private userService: UserService,private router: Router, private storage: Storage) { }

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

 getUser(){
   this.userService.findActualUser().then(user => {
     console.log("getUser");
     console.log(user);
     return user;
   })
 }
}
