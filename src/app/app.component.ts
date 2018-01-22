import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage} from '../pages/login/login';
import { UnidadproductivaPage } from '../pages/unidadproductiva/unidadproductiva';

import { PerfilPage } from '../pages/perfil/perfil';

import { AuthProvider } from '../providers/auth/auth';
import {Storage} from "@ionic/storage";
import { DbProvider } from '../providers/db/db';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = null;
  pages: Array<{title: string, component: any ;icon: string}>;
  nombre: string;
  rol: string;
  prueba:number;  
empresa:string;

  constructor(
    public db:DbProvider,
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen, 
    public authService: AuthProvider,
    private readonly storage: Storage

  ) {
    this.pages = [
      { title: 'Inicio', component: HomePage , icon: 'home' },
      { title: 'Unidades Productivas', component: UnidadproductivaPage, icon: 'list'},
      { title: 'Perfil', component: PerfilPage, icon:'person'} 
    ];
    this.authService.authUser.subscribe(jwt => {
      if (jwt) {
        this.rootPage = HomePage;
        console.log('entro esperemos a ver q pasa ');
        this.storage.get('nombre').then( decoded =>
          {
            this.nombre = decoded;
          },
        );
        this.storage.get('roll').then( roll =>
          {
            this.rol = roll;
            return this.rol;
          },
        );
        this.storage.get('empresa').then( empresa =>
          {
            this.empresa = empresa;
            return this.empresa;
          },
        );
      }
      else {
        this.rootPage = LoginPage;
      }
    });

    authService.checkLogin();

    this.initializeApp();

    
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      setTimeout(() => {
        this.splashScreen.hide();        
      }, 100 - 1000);
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }
}
