import { Component } from '@angular/core';
import { IonicPage, LoadingController, ToastController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
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
      }else{
        this.msj='erroes en el servidor, consulte con su administrador'; 
      }
    },
     (err)=>{ 
       loading.dismiss();
       this.msj='erroes en el servidor, consulte con su administrador';
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
