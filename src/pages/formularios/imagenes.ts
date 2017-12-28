import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({

   templateUrl: 'imagenes.html'

})
export class ImagePage {
    img:any;

   constructor (public viewCtrl: ViewController, 
             public navParams: NavParams) {
                 this.img=navParams.get('urlimg');
                 console.log(this.img);
                }


}