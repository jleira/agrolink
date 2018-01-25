import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { JwtHelper, AuthHttp } from "angular2-jwt";
import { SERVER_URL } from "../../config";
import { Storage } from "@ionic/storage";
import { DbProvider } from '../db/db';

@Injectable()
export class RegionProvider {
  regiones: any;
  depa: any;
  veredas: any;
  constructor(public http: Http, jwtHelper: JwtHelper,
    public database: DbProvider,
    private readonly authHttp: AuthHttp,
    private readonly storage: Storage) {
  }
  obtenerpaises() {
    return this.authHttp.get(`${SERVER_URL}/api/pais/`).map(
      data => {
        if (!(data.json() == null)) {
          return this.guardarpais(data.json())
        } else {
          return false;
        }
      }, (err) => {
        console.log('err', err);
        return false;
      }
    );
  };

  guardarpais(value) {
    console.log('paises', value);
    value.forEach(element => {
      this.database.agregarregion(1, element['idPais'], element['nombre'], null, null).then(
        (ok) => { },
        (err) => { }
      );
    });
  }

  obtenerdepartamentos() {
    return this.authHttp.get(`${SERVER_URL}/api/departamentos/`).map(
      data => {
        if (!(data.json() == null)) {
         return this.guardardepartamento(data.json());
        }
      }, () => {});
  };
  guardardepartamento(value) {
    console.log('departamentos', value);
    value.forEach(element => {
      this.database.agregarregion(2, element['idDepartamento'], element['nombre'], element['pais']['idPais'], null).then((ok)=>{
        console.log('ok',ok);
      });
    });
  }
  obtenermunicipios() {
    return this.authHttp.get(`${SERVER_URL}/api/municipios/findAllActive/`).map(
      data => {
        if (!(data.json() == null)) {
         return this.guardarmunicipio(data.json())
        }
      });
  };
  guardarmunicipio(value) {
    console.log('muicipios', value);
    value.forEach(element => {
      this.database.agregarregion(3, element['idMunicipio'], element['nombre'], element['departamento']['idDepartamento'], null).then((ok)=>{
        console.log('ok',ok);
      });;
    });
  }

  obtenerregiones() {
    return this.authHttp.get(`${SERVER_URL}/api/regiones/findAllActive/`).map(
      data => {
        if (!(data.json() == null)) {
         return this.guardarregion(data.json())
        }
      }, () => {  });
  };
  guardarregion(value) {
    console.log('regiones', value);
    
    value.forEach(element => {
      this.database.agregarregion(4, element['idRegion'], element['nombre'], element['municipio']['idMunicipio'], element['prefijo']).then((ok)=>{
        console.log('ok',ok);
      },err=>{console.log('err',err)});
    });
  }

  departamentosenpais(paises) {
    return this.database.departamentosenpaises(paises).then((datapais: any) => {
      this.regiones = datapais.join();
      return this.regiones;
    });
  }
  municipiosendepartamentos(departamentos) {
    return this.database.municipiosendepa(departamentos).then((datadepa: any) => {
      this.depa = datadepa.join();
      return this.depa;
    });
  }
  regionesenmunicipio(municipios) {
    return this.database.regionesenmunicipio(municipios).then((datadere: any) => {
      this.veredas = datadere.join();
      return this.veredas;
    });
  }

}
