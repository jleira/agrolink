import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({

   templateUrl: 'noconformidad.html'

})
export class NuevanoconformidadPage{
    img:any;
    categorias:Array<{id: number , note: string}>;
   constructor (public viewCtrl: ViewController, 
             public navParams: NavParams) {
                 this.categorias=[];
                 for (let i = 1; i < 11; i++) {
                    this.categorias.push({
                      id:  i,
                      note: 'categoria' + i
                    });
                  }
                }
                dismiss() {
                    this.viewCtrl.dismiss();
                  }

}