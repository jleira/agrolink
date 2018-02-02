import { Component } from '@angular/core';
import { IonicPage, LoadingController, ToastController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { PerfilProvider } from '../../providers/perfil/perfil';
import { RegionProvider } from '../../providers/region/region';
import { UproductivaProvider } from '../../providers/uproductiva/uproductiva';
import { FormulariosProvider } from '../../providers/formularios/formularios';
import { Http} from '@angular/http';
import {SERVER_URL} from "../../config";
let apiUrl = SERVER_URL;


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  loading: any;
  loginData = { username: '', password: '' };
  data: any; 
  empresas:any;
  msj:string=null;
  constructor(public http: Http,
    public authService: AuthProvider,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public perfil: PerfilProvider,
    public region: RegionProvider,
    public uproductiva: UproductivaProvider,
    public formularios: FormulariosProvider
  ) {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Validando datos...'
      
    });
    loading.present();
    this.http.get(`${apiUrl}/api/accounts/name`).subscribe((data)=>{
      loading.dismiss();
      if(data.json()){
        this.empresas=data.json();
        console.log('1');
      }else{
        this.msj='erroes en el servidor, consulte con su administrador'; 
        console.log('2');

      }
    },
     (err)=>{ 
       loading.dismiss();
       this.msj='erroes en el servidor, consulte con su administrador';
       console.log('3');

    });

  }
  login(value: any) {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Validando datos...'
    });
    loading.present();
    
    this.authService.login(value).finally(()=>{
      loading.dismiss();
    }).subscribe(() => {

      },
      (err) => {
        this.handleError(err);
        });
  }
  handleError(error: any) {
    let message: string;
    if (error.status && error.status === 401) {
      message = 'Usuario y/o contraseña incorrecto';
    }
    else {
      message = `Unexpected error: ${error.statusText}`;
    }

    const toast = this.toastCtrl.create({
      message,
      duration: 10000,
      position: 'bottom'
    });
    toast.present();
  }

  handleError2(mensaje:string) {
    let message: string;
    message=mensaje;
    const toast = this.toastCtrl.create({
      message,
      duration: 5000,
      position: 'bottom'
    });
    toast.present();
  }


}
