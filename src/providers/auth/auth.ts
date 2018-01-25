import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { LoadingController, ToastController } from 'ionic-angular';

import 'rxjs/add/operator/map';
import { ReplaySubject, Observable } from "rxjs";
import { Storage } from "@ionic/storage";
import { AuthHttp } from "angular2-jwt";
import { SERVER_URL } from "../../config";
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { DbProvider } from '../db/db';
import { PerfilProvider } from '../../providers/perfil/perfil';
import { RegionProvider } from '../../providers/region/region';
import { UproductivaProvider } from '../../providers/uproductiva/uproductiva';
import { FormulariosProvider } from '../../providers/formularios/formularios';


let apiUrl = SERVER_URL;

@Injectable()
export class AuthProvider {
  authUser = new ReplaySubject<any>(1);

  constructor(public http: Http,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private readonly authHttp: AuthHttp,
    private readonly storage: Storage,
    public database: DbProvider,
    public perfil: PerfilProvider,
    public region: RegionProvider,
    public uproductiva: UproductivaProvider,
    public formularios: FormulariosProvider
  ) {

  }
  checkLogin() {
    this.storage.get('jwt').then(jwt => {
      this.authUser.next(jwt);
    });
  }

  login(values: any): Observable<any> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('X-Agrolink-Tenant', values.empresa);
    let options = new RequestOptions({ headers: headers });
    return this.http.post(`${apiUrl}api/login`, '{"identificador":"' + values.username + '","clave":"' + values.password + '"}', options)
      .map(response => (response.headers.get('authorization').substring(7))).map(
      jwt => {
        this.handleJwtResponse(jwt, values.empresa);
      });
  }
  private handleJwtResponse(jwt: string, empresa) {
    return this.storage.set('jwt', jwt)
      .then(() => {
        console.log(jwt);
        return this.authHttp.get(`${SERVER_URL}/api/users/findMyData/`).subscribe(
          data => {
            this.guardarinfo(data.json(), empresa);
            this.region.obtenerpaises().subscribe(() => {
            },
              err => {
                console.log('error paises');
                this.handleError2('Error al descargar la informacion de paises, intentelo nuevamente');
                this.logout();
                
              });
              this.region.obtenerdepartamentos().subscribe(()=>{
              },()=>{
                console.log('error departamentos');
                this.handleError2('Error al descargar la informacion de departamentos, intentelo nuevamente');
                this.logout();  
              });
              this.region.obtenermunicipios().subscribe(()=>{
              },()=>{
                console.log('error municipios');
                this.handleError2('Error al descargar la informacion de municipios, intentelo nuevamente');
                this.logout();  
              });
              this.region.obtenerregiones().subscribe(()=>{
              },()=>{
                console.log('error regiones');
                this.handleError2('Error al descargar la informacion de regiones, intentelo nuevamente');
                this.logout();  
              });
              this.authUser.next(jwt);
              this.uproductiva.descargarunidadesproductivasasignadas();






          },
          err => {
            console.log('error descargando informacion', err);
            this.logout();
            this.handleError2('Error al descargar la informacion de la persona logeada, intentelo nuevamente');
          }
        )
      })
  }


  login2(usuario, pass, empresa): Observable<any> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('X-Agrolink-Tenant', empresa);
    let options = new RequestOptions({ headers: headers });
    return this.http.post(`${apiUrl}api/login`, '{"identificador":"' + usuario + '","clave":"' + pass + '"}', options)
      .map(response => {
        response.headers.get('authorization').substring(7);
        return response.headers.get('authorization').substring(7);
      }).map(jwt => this.handleJwtResponse2(jwt));
  }
  private handleJwtResponse2(jwt: string) {
    return this.storage.set('jwt', jwt).then(() => jwt);
  }



  logout() {
    this.database.limpiardb().then((ok) => { }, () => { });
    this.storage.remove('jwt').then(() => this.authUser.next(null));
    this.storage.remove('nombre');
    this.storage.remove('identificador');
    this.storage.remove('roll');
    this.storage.remove('tipo_id');
    this.storage.remove('identificacion');
    this.storage.remove('mail');
    this.storage.remove('reload');
    this.storage.remove('empresa');

  }
  guardarinfo(value, empresa) {
    this.storage.set('codigo', value['codigo']);
    this.storage.set('nombre', value['nombre']);
    this.storage.set('identificador', value['identificador']);
    let roles = '';
    if (value.roles.length > 0) {
      value.roles.forEach(element => {
        if (element == 1) {
          if (roles == '') {
            roles = 'Administrador';
          } else {
            roles = roles + '-Administrador';
          }
        }
        if (element == 2) {
          if (roles == '') {
            roles = 'Auditor';
          } else {
            roles = roles + '-Auditor';
          }
        }
        if (element == 3) {
          if (roles == '') {
            roles = 'Promotor';
          } else {
            roles = roles + '-Promotor';
          }
        }
      });
      this.storage.set('roll', roles);
    }
    else {
      this.storage.set('roll', 'Sin rol asignada');
    }

    this.storage.set('tipo_id', value['cataTiidCodigo']['campo2']);
    this.storage.set('identificacion', value['numeroIdentificacion']);
    this.storage.set('mail', value['correoElectronico']);
    this.storage.set('empresa', empresa);
    return true;
  }

  handleError2(mensaje: string) {
    let message: string;
    message = mensaje;
    const toast = this.toastCtrl.create({
      message,
      duration: 5000,
      position: 'bottom'
    });

    toast.present();
  }

}

