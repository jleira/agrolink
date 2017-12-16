import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import {JwtHelper, AuthHttp,  AuthConfig} from "angular2-jwt";
import {SERVER_URL} from "../../config";
import {Storage} from "@ionic/storage";
import { DbProvider } from '../db/db';

@Injectable()
export class RegionProvider {
  regiones:any;
  depa:any;
  veredas:any;
  constructor(public http: Http,jwtHelper: JwtHelper,
    public database:DbProvider,
    private readonly  authHttp: AuthHttp,
    private readonly storage: Storage) {
  }
  obtenerpaises(){
    this.storage.get('jwt').then(jwt => {   
              this.authHttp.get(`${SERVER_URL}/api/pais/`).subscribe(
                  data =>{ 
                  if(!(data.json()==null)){
                    this.guardarpais(data.json())
                  }}
                  );
          })
  };

  guardarpais(value){
  value.forEach(element => {
   this.database.agregarregion(1,element['idPais'],element['nombre'],null,null);
  });
  }

  obtenerdepartamentos(){
    this.storage.get('jwt').then(jwt => {   
              this.authHttp.get(`${SERVER_URL}/api/departamentos/`).subscribe(
                    data =>{ 
                      if(!(data.json()==null)){
                        console.log(data);
                        this.guardardepartamento(data.json());
                      }});
          })
  };
  guardardepartamento(value){
  value.forEach(element => {
    this.database.agregarregion(2,element['idDepartamento'],element['nombre'],element['pais']['idPais'],null);
  });
  }
  obtenermunicipios(){
    this.storage.get('jwt').then(jwt => {   
              this.authHttp.get(`${SERVER_URL}/api/municipios/findAllActive/`).subscribe(
                    data =>{ 
                      if(!(data.json()==null)){
                        console.log(data);
                        this.guardarmunicipio(data.json())
                      }});
    })
  };
  guardarmunicipio(value){
  value.forEach(element => {
    this.database.agregarregion(3,element['idMunicipio'],element['nombre'],element['departamento']['idDepartamento'],null);
  });
  }
  
  obtenerregiones(){
    this.storage.get('jwt').then(jwt => {   
              this.authHttp.get(`${SERVER_URL}/api/regiones/findAllActive/`).subscribe(
                    data =>{ 
                      if(!(data.json()==null)){
                        console.log(data);
                     this.guardarregion(data.json())
                    }});
          })
  };
  guardarregion(value){
  value.forEach(element => {
    this.database.agregarregion(4,element['idRegion'],element['nombre'],element['municipio']['idMunicipio'],element['prefijo']);
  });
  }

  departamentosenpais(paises){
   return this.database.departamentosenpaises(paises).then((datapais:any)=>{
        this.regiones=datapais.join();
        return this.regiones;
    });
  }
  municipiosendepartamentos(departamentos){
    return this.database.municipiosendepa(departamentos).then((datadepa:any)=>{
        this.depa=datadepa.join();
        return this.depa;
   });
  }
  regionesenmunicipio(municipios){
   return this.database.regionesenmunicipio(municipios).then((datadere:any)=>{
     this.veredas=datadere.join();
      return this.veredas;
   });
  }

}
