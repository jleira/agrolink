import { Injectable } from '@angular/core';
import { Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {ReplaySubject, Observable} from "rxjs";
import {Storage} from "@ionic/storage";
import {JwtHelper,  AuthHttp} from "angular2-jwt";
import {SERVER_URL} from "../../config";
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { DbProvider } from '../db/db';

let apiUrl = SERVER_URL;


/*
  Generated class for the AuthProvider provider. 

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider {
  authUser = new ReplaySubject<any>(1);
  
  constructor(public http: Http,
    private readonly authHttp: AuthHttp,
    private readonly storage: Storage,
    private readonly jwtHelper: JwtHelper,
    public database:DbProvider) {}
    checkLogin() {
      this.storage.get('jwt').then(jwt => {        
          this.authUser.next(jwt);          
      });
/* 
        if (jwt && !this.jwtHelper.isTokenExpired(jwt)) {
          this.authHttp.get(`${apiUrl}/autenticate`)
            .subscribe(() => this.authUser.next(jwt),
              (err) => this.storage.remove('jwt').then(() => this.authUser.next(null)));
          // OR
          // this.authUser.next(jwt);
        }
        else {
          this.storage.remove('jwt').then(() => this.authUser.next(null));
        }
      });
/*/
    }
    login(values: any): Observable<any> {
      return this.http.post(`${apiUrl}/login`, '{"identificador":"'+values.username+'","clave":"'+values.password+'"}')
   .map(response => (
    response.headers.get('authorization').substring(7)
)).map(jwt => this.handleJwtResponse(jwt));
    }
    private handleJwtResponse(jwt: string) {
      return this.storage.set('jwt', jwt)
        .then(() => {
          this.database.creartablas().then(()=>{},()=>{});
          return this.authHttp.get(`${SERVER_URL}/api/users/findMyData/`).subscribe(
            data =>  this.guardarinfo(data.json()),
            err =>{console.log(err);
          }
          )
      }).then(()=>{
        this.authUser.next(jwt);

      })
        .then(() => jwt);
    }
    logout() {
      this.database.limpiardb().then((ok)=>{},()=>{} );
      this.storage.remove('jwt').then(() => this.authUser.next(null));
      this.storage.remove('nombre');
      this.storage.remove('identificador');
      this.storage.remove('roll');
      //this.storage.set('roll', 'Auditor Interno');
      this.storage.remove('tipo_id');
      this.storage.remove('identificacion');
      this.storage.remove('mail');
      this.storage.remove('reload');
      
    }
    guardarinfo(value){
      this.storage.set('codigo', value['codigo']);
      this.storage.set('nombre', value['nombre']);
      this.storage.set('identificador', value['identificador']);
      this.storage.set('roll', value['roles']);
      //this.storage.set('roll', 'Auditor Interno');
      this.storage.set('tipo_id', value['cataTiidCodigo']['campo2']);
      this.storage.set('identificacion', value['numeroIdentificacion']);
      this.storage.set('mail', value['correoElectronico']);
    }
}

