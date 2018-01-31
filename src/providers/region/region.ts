import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { LoadingController } from 'ionic-angular';
import { JwtHelper, AuthHttp } from "angular2-jwt";
import { SERVER_URL } from "../../config";
import { DbProvider } from '../db/db';

@Injectable()
export class RegionProvider {
  regiones: any;
  depa: any;
  veredas: any;
  constructor(public http: Http, 
    jwtHelper: JwtHelper,
    public database: DbProvider,
    public loadingCtrl: LoadingController,
    private readonly authHttp: AuthHttp
    ) {
  }
  obtenerpaises() {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Descargando informarcion del paises...'
    });
    loading.present();
    return this.authHttp.get(`${SERVER_URL}/api/pais/`).map(
      data => {
        loading.dismiss();
        if (!(data.json() == null)) {
          return this.guardarpais(data.json())
        } else {
          return false;
        }
       }, (err) => {
        return false;
      }
    );
  };

  guardarpais(value) {
    value.forEach(element => {
      this.database.agregarregion(1, element['idPais'], element['nombre'], null, null).then(
        (ok) => { },
        (err) => { }
      );
    });
  }

  obtenerdepartamentos() {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Descargando informarcion del departamentos...'
    });
    loading.present();
    return this.authHttp.get(`${SERVER_URL}/api/departamentos/`).map(
      data => {
        loading.dismiss();
        if (!(data.json() == null)) {
         return this.guardardepartamento(data.json());
        }
      }, () => {
        loading.dismiss();
      });
  };
  guardardepartamento(value) {
    value.forEach(element => {
      this.database.agregarregion(2, element['idDepartamento'], element['nombre'], element['pais']['idPais'], null).then((ok)=>{
      });
    });
  }
  obtenermunicipios() {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Descargando informarcion del munipios...'
    });
    loading.present();
    return this.authHttp.get(`${SERVER_URL}/api/municipios/findAllActive/`).map(
      data => {
        loading.dismiss();
        if (!(data.json() == null)) {
         return this.guardarmunicipio(data.json())
        }
      },()=>{
        loading.dismiss;
      });
  };
  guardarmunicipio(value) {
    value.forEach(element => {
      this.database.agregarregion(3, element['idMunicipio'], element['nombre'], element['departamento']['idDepartamento'], null).then((ok)=>{
      });
    });
  }

  obtenerregiones() {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Descargando informarcion del regiones...'
    });
    loading.present();
    return this.authHttp.get(`${SERVER_URL}/api/regiones/findAllActive/`).map(
      data => {
        loading.dismiss();
        if (!(data.json() == null)) {
         return this.guardarregion(data.json())
        }
      }, () => { loading.dismiss() });
  };
  guardarregion(value) {
    value.forEach(element => {
      this.database.agregarregion(4, element['idRegion'], element['nombre'], element['municipio']['idMunicipio'], element['prefijo']).then((ok)=>{
      },err=>{});
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
