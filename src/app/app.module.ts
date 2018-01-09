import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login/login';
import { PerfilPage } from '../pages/perfil/perfil';
import { UnidadproductivaPage } from '../pages/unidadproductiva/unidadproductiva';
import { UpdetallesPage} from '../pages/updetalles/updetalles';
import { FiltroupPage} from '../pages/filtroup/filtroup';
import { FormulariosPage} from '../pages/formularios/formularios';
import { ImagePage} from '../pages/formularios/imagenes';
import { NuevanoconformidadPage} from '../pages/formularios/noconformidad';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AuthProvider } from '../providers/auth/auth';
import { PerfilProvider } from '../providers/perfil/perfil';


import {Http, HttpModule, RequestOptions} from '@angular/http';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {JwtHelper, AuthConfig, AuthHttp} from "angular2-jwt";
import {CustomFormsModule} from 'ng2-validation';
import {Storage, IonicStorageModule} from "@ionic/storage";
import { RegionProvider } from '../providers/region/region';
import { UproductivaProvider } from '../providers/uproductiva/uproductiva';
import { DbProvider } from '../providers/db/db';

import { SQLite } from '@ionic-native/sqlite';
import { FormulariosProvider } from '../providers/formularios/formularios';

import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';




export function authHttpServiceFactory(http: Http, options: RequestOptions, storage: Storage) {
  const authConfig = new AuthConfig({
    tokenGetter: (() => storage.get('jwt')),
  });
  return new AuthHttp(authConfig, http, options);
}

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    LoginPage,
    PerfilPage,
    UnidadproductivaPage,
    UpdetallesPage,
    FiltroupPage,
    FormulariosPage,
    ImagePage,
    NuevanoconformidadPage
    ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: 'myapp',
      driverOrder: ['sqlite', 'indexeddb', 'websql']
    }),
    CustomFormsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    LoginPage,
    PerfilPage,
    UnidadproductivaPage,
    UpdetallesPage,
    FiltroupPage,
    FormulariosPage,
    ImagePage,
    NuevanoconformidadPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    JwtHelper, {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions, Storage]
    },
    SQLite,
    AuthProvider,
    PerfilProvider,
    RegionProvider,
    UproductivaProvider,
    DbProvider,
    FormulariosProvider,
    Camera,
    File
  ]
})
export class AppModule {}
