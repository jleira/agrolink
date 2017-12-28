import { Component } from '@angular/core';
import { IonicPage, LoadingController, ToastController } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { PerfilProvider } from '../../providers/perfil/perfil';
import { RegionProvider } from '../../providers/region/region';
import { UproductivaProvider } from '../../providers/uproductiva/uproductiva';
import { FormulariosProvider } from '../../providers/formularios/formularios';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  loading: any;
  loginData = { username: '', password: '' };
  data: any;

  constructor(
    public authService: AuthProvider,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public perfil: PerfilProvider,
    public region: RegionProvider,
    public uproductiva: UproductivaProvider,
    public formularios: FormulariosProvider
  ) {
  }
  login(value: any) {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Validando datos...'
    });

    loading.present();
    this.authService
      .login(value).finally(() => {
        loading.dismiss();
      })
      .subscribe(() => {
        this.perfil.getinfo();
        this.region.obtenerpaises();
        this.region.obtenerdepartamentos();
        this.region.obtenermunicipios();
        this.region.obtenerregiones();
        this.uproductiva.descargarunidadesproductivas();
        this.uproductiva.descargarunidadesproductivasasignadas();
       this.formularios.descargarformularios();

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
      duration: 5000,
      position: 'bottom'
    });

    toast.present();
  }



}
