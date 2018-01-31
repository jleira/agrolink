import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({

    templateUrl: 'imagenes.html'

})
export class ImagePage {
    img: any;
    caso;
    items;
    msj;
    constructor(public viewCtrl: ViewController,
        public navParams: NavParams) {
            this.caso=navParams.get('caso');
            if(this.caso==1){
                this.img = navParams.get('urlimg');
                console.log(this.img);
            }else{
                this.items=navParams.get('pendientes');
                this.msj=navParams.get('msj');

            }
            console.log(this.caso);

    }


}