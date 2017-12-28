import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import {JwtHelper, AuthHttp,  AuthConfig} from "angular2-jwt";
import {SERVER_URL} from "../../config";
import {Storage} from "@ionic/storage";

@Injectable()
export class PerfilProvider {

  constructor(
    public http: Http,jwtHelper: JwtHelper,
    private readonly  authHttp: AuthHttp,
    private readonly storage: Storage
  ) { }
  getinfo(){
    this.storage.get('jwt').then(jwt => {
      
              this.authHttp.get(`${SERVER_URL}/api/users/findMyData/`).subscribe(
                    data => this.guardarinfo(data.json()),
                    err =>{console.log(err);
                    return this.getinfo();}
                  );
          })
  };

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