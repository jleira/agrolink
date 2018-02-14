import { Component } from '@angular/core';
import {ModalController, NavController, ToastController, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from "@ionic/storage";
import { UnidadproductivaPage } from '../unidadproductiva/unidadproductiva';
import { CasoespecialPage } from '../casoespecial/casoespecial';
import { FormulariosPage } from '../formularios/formularios';
import { EnviardatosPage } from './sinc';
import { FormulariosProvider } from '../../providers/formularios/formularios';
import { AuthHttp } from "angular2-jwt";
import { FORMULARIO_AUDITORIA } from "../../config";
import { FORMULARIO_PROMOTORIA } from "../../config";
import { AuthProvider } from '../../providers/auth/auth';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  user: string;
  rol: string;
  message: string;
  paises: any;
  mensajes;
  productor: any;
  auditor: boolean;
  promotor: boolean;
  empresa;
  usuario;
  constructor(
    public authService: AuthProvider,
    public formulario: FormulariosProvider,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    private readonly storage: Storage,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    public authHttp: AuthHttp,
    public alertCtrl: AlertController

  ) {
  }

  ionViewWillEnter() {
    this.storage.get('empresa').then((empresa) => {
      this.empresa = empresa;
    });
    this.storage.get('identificador').then(usuario => {
      this.usuario = usuario;
    });

    this.auditor = false;
    this.promotor = false;
    this.storage.get('nombre').then(decoded => {
      this.user = decoded;
    }
    );
    this.storage.get('roll').then(roll => {
      this.rol = roll;
      if (this.rol) {
        if (this.rol.indexOf("Auditor") > -1) {
          this.formulario.formularioid(FORMULARIO_AUDITORIA).then((idf) => {
            if(idf){
              this.auditor = true;
            }
          });
        }
        if (this.rol.indexOf("Promotor") > -1) {
          this.formulario.formularioid(FORMULARIO_PROMOTORIA).then((idf) => {
            if(idf){
              this.promotor = true;          
            }
          });
        }
      }

    }
    );
  }


  openPage(caso) {
    if (caso == 1) {
      this.navCtrl.push(FormulariosPage, { caso: 1 });
    } else if (caso == 2) {
      this.navCtrl.push(FormulariosPage, { caso: 2 });
    } else if (caso == 3) {
      this.navCtrl.push(UnidadproductivaPage);
    } else if (caso == 4) {
      this.agregarnoconformidad();
    }

  }
  agregarnoconformidad() {
    let modal = this.modalCtrl.create(EnviardatosPage, { 'up': 1, 'tipo': 2 });
    modal.present();

  }
  casoespecial() {
    this.navCtrl.push(CasoespecialPage, { caso: 1 });
  }


  handleError(error: string) {
    let message: string;
    message = error;
    const toast = this.toastCtrl.create({
      message,
      duration: 7000,
      position: 'bottom'
    });
    toast.present();
  }

  descargardatos(){
    let alert = this.alertCtrl.create({

      title: 'Descargar datos',
      message: 'Unez vez descargada la informacion, se borraran todos los datos diligenciados del telefono',
      buttons: [
        {
          text: 'Validar',
          handler: () => {

           }
        },
        {
          text: 'Aceptar',
          handler: (datos) => {
            this.login();
  //          this.precargardatos(datos);   
          }
        }
      ]
    });
    alert.present();
  }
  
  login(){
    let alert = this.alertCtrl.create({

      title: 'Login',
      message: 'Una vez se valide la contraseña todos los datos de la app seran borrados',
      inputs: [
        {
          name: 'pass',
          placeholder: 'contraseña',
          type: 'password',
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {

           }
        },
        {
          text: 'Aceptar',
          handler: (datos) => {
            this.precargardatos(datos);
          }
        }
      ]
    });
    alert.present();
  }

  precargardatos(value: any) {

    let datos={
      username:this.usuario,
      password:value.pass,
      empresa:this.empresa
    }
      let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Validando datos...'
    });
    loading.present();
    
    this.authService.precarguededatos(datos).finally(()=>{
      loading.dismiss();
    }).subscribe(() => {

      this.ionViewWillEnter();  
      },
      (error) => {

        if (error.status && error.status === 401) {
          this.handleError('Usuario y/o contraseña incorrecto');

        }
        else {
          this.handleError(`Error : ${error.statusText}`);
        }
        }); 
  }


}
