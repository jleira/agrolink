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
  return this.storage.get('jwt').then(jwt => {
      
             return this.authHttp.get(`${SERVER_URL}/api/users/findMyData/`).subscribe(
                    data =>{ 
                    return this.guardarinfo(data.json())},
                    err =>{
                    }
                  );
          })
  };

guardarinfo(value){
  this.storage.set('codigo', value['codigo']);
  this.storage.set('nombre', value['nombre']);
  this.storage.set('identificador', value['identificador']);
  let roles='';
  if(value.roles.length>0){
    value.roles.forEach(element => {
      if(element==1){
        if(roles==''){
          roles='Administrador';
        }else{
          roles=roles+'-Administrador';
        }
      } 
      if(element == 2){
        if(roles==''){
          roles='Auditor';
        }else{
          roles=roles+'-Auditor';
        }
      }
      if(element == 3 ){
        if(roles==''){
          roles='Promotor';
        }else{
          roles=roles+'-Promotor';
        }
      }      
    });
    this.storage.set('roll', roles);
     } 
     else{
    this.storage.set('roll', 'Sin rol asignada');
  }
  this.storage.set('tipo_id', value['cataTiidCodigo']['campo2']);
  this.storage.set('identificacion', value['numeroIdentificacion']);
  this.storage.set('mail', value['correoElectronico']);
  return true;
}
}