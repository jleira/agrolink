import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {Storage} from "@ionic/storage";
import { Nav, Platform, ModalController } from 'ionic-angular';
import { UnidadproductivaPage } from '../unidadproductiva/unidadproductiva';
import { CasoespecialPage } from '../casoespecial/casoespecial';
import { FormulariosPage }  from '../formularios/formularios';
import {  EnviardatosPage } from './sinc';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  user: string;
  rol: string;
  message: string;
  paises:any;
  productor:any;
  constructor(
    public modalCtrl: ModalController,
    public navCtrl: NavController, 
    private readonly storage: Storage  ) {
    this.storage.get('nombre').then( (decoded) =>
      {
        this.user = decoded;
        return this.user;
      }
    );

    this.storage.get('roll').then( (roll) =>
      {
        this.rol = roll;
        return this.rol;
      },
    );
  }

 ionViewWillEnter() {
    this.storage.get('nombre').then( decoded =>
      {this.user = decoded;
        return this.user;
      },
    );
    this.storage.get('roll').then( roll =>
      {this.rol = roll;
        return this.rol;
      },
    );
}

abririmagen(ruta){
  console.log(ruta);
}

  openPage(caso) {
    if (caso==1){
      this.navCtrl.push(FormulariosPage,{caso:1});
    }else if (caso==2){
      this.navCtrl.push(FormulariosPage,{caso:2});
    } else if (caso==3) {
      this.navCtrl.setRoot(UnidadproductivaPage);
    }else if (caso==4) {
      this.agregarnoconformidad();
  }

  }
  agregarnoconformidad(){
    let modal = this.modalCtrl.create(EnviardatosPage,{'up': 1, 'tipo':2});
    modal.present();

  }
  casoespecial(){
    this.navCtrl.push(CasoespecialPage,{caso:1});
  }

}
