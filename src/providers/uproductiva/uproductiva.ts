import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { LoadingController, ToastController } from 'ionic-angular';
import { SERVER_URL } from "../../config";
import { JwtHelper, AuthHttp, AuthConfig } from "angular2-jwt";
import { DbProvider } from '../db/db';
import { Storage } from "@ionic/storage";
import { retry } from 'rxjs/operator/retry';

@Injectable()
export class UproductivaProvider {

  items: any;
  lista: any;
  paises: any;
  departamentos: any;
  municipios: any;
  regiones: any;
  idup: any;
  detalles: any;

  constructor(
    public http: Http, jwtHelper: JwtHelper,
    public database: DbProvider,
    public loadingCtrl: LoadingController,
    private readonly authHttp: AuthHttp,
    private readonly storage: Storage
  ) {
  }


  guardarunidades(value) {

   return this.storage.get('codigo').then((micodigo) => {
      value.forEach(element => {
        let tipo;
        let lat;
        let long;
        if (element.unidadProductiva['localizacion'] == null) {
          lat = null;
          long = null;
        } else {
          lat = element.unidadProductiva['localizacion']['latitude'];
          long = element.unidadProductiva['localizacion']['longitude'];
        }
         if (element.auditor.codigo === micodigo) {
          tipo = 1002;
          return this.agregar(element,long,lat,tipo);
        }
        if (element.promotor.codigo === micodigo) {
          tipo = 1001;
         return this.agregar(element,long,lat,tipo);
        }        
      });
    });
  }

  agregar(element,long,lat,tipo){
    this.database.agregarunidadproductiva(element.unidadProductiva['idUnidadProductiva'],element.unidadProductiva['nombre'],element.unidadProductiva['fechaIngreso'],
      element.unidadProductiva['region']['idRegion'],long,lat,element.unidadProductiva['productor']['idProductor'],tipo,element.idAsignacion
    ).then((ok) => {console.log('ok',ok);
        this.validarproductor(element.unidadProductiva['productor']['idProductor']).then((data: any) => {
            if (data == 0) {
              this.database.agregarproductor(
                element.unidadProductiva['productor']['idProductor'],
                element.unidadProductiva['productor']['nombre'],
                element.unidadProductiva['productor']['identificacion'],
                element.unidadProductiva['productor']['telefono'],
                element.unidadProductiva['productor']['annoIngreso'],
                element.unidadProductiva['productor']['ultimaAplicacion']
              ).then(
                (ok) => {console.log('ok',ok)},
                (err) => {console.log('err',err) }
                );
            }
          },err=>{console.log('err',err) }
        )
      },
      (err) => {console.log('err',err) }
      );
  }




  filterItems(searchTerm) {


    /*        
   if(searchTerm==""){
    return this.items;
           }
    return this.items.filter((item) => {
             return item.region == searchTerm ;
           });    
    */
  }
  unidadespendientesporregiones(regs: any, orientacion) {
    let reg = regs;
    return this.database.unidadesporregionpendientes(reg).then((data: any) => {
      this.items = data;
      return this.items;
    });
  }
  unidadesterminadasporregiones(regs: any, orientacion) {
    let reg = regs;
    return this.database.unidadesporregionterminadas(reg).then((data: any) => {
      this.items = data;
      return this.items;
    });
  }
  unidadestodasporregiones(regs: any, orientacion) {
    let reg = regs;

    return this.database.unidadesporregiontodas(reg, orientacion).then((data: any) => {
      this.items = data;
      return this.items;
    });
  }
  unidadespendientes() {
    return this.database.unidadespendientes().then((data: any) => {
      this.items = data;
      return this.items;
    });
  }
  unidadesterminadas() {
    return this.database.unidadesterminadas().then((data: any) => {
      this.items = data;
      return this.items;
    });
  }
  detallesregion(id: any) {
    let idups = id;
    return this.database.detallesregion(idups).then((data: any) => {
      this.items = data;
      return this.items;
    });
  }
  detallesmunicipio(id: any) {
    let idupm = id;
    return this.database.detallesmunicipio(idupm).then((data: any) => {
      this.items = data;
      return this.items;
    });
  }
  detallesdepartamento(id: any) {
    let idupd = id;
    return this.database.detallesdepartamento(idupd).then((data: any) => {
      this.items = data;
      return this.items;
    });
  }
  detallespais(id: any) {
    let idupp = id;
    return this.database.detallespais(idupp).then((data: any) => {
      this.items = data;
      return this.items;
    });
  }

  detallesf(id: any) {
    this.idup = id;
    return this.database.unidadproductivaporid(this.idup).then((data: any) => {
      this.items = data;
      return this.items;
    });
  }

  llamaruproductivas() {
    return this.database.todasuproductivas().then((data: any) => {
      this.items = data;
      return this.items;
    })
  }
  llamarunidadesproductivasiniciadas(tipo) {
    return this.database.todasuproductivasiniciadas(tipo).then((data: any) => {
      this.items = data;
      return this.items;
    })
  }
  llamaruproductivasap(caso) {
    return this.database.todasuproductivasap(caso).then((data: any) => {
      this.items = data;

      return this.items;
    })
  }

  descargarunidadesproductivasasignadas() {
     return this.authHttp.get(`${SERVER_URL}/api/asignaciones/user`).map(
        data => {
          if (!(data.json() == null)) {
           return this.guardarunidades(data.json());
          }
        }
      );
  }
  
  



  validarproductor(idproductor: number) {
    return this.database.existeproductor(idproductor).then(
      (ok) => {
        return ok
      },
      (err) => { }
    );
  }

  paises2() {
    return this.database.todoslospaises().then((data: any) => {
      let paises = data;
      return paises;
    })
  }
  departamentos2() {
    return this.database.todoslosdepartamentos().then((data: any) => {
      let departamentos = data;
      return departamentos;
    })
  }
  municipios2() {
    return this.database.todoslosmunicipios().then((data: any) => {
      let municipios = data;
      return municipios;
    })
  }
  regiones2() {
    return this.database.todoslasregiones().then((data: any) => {
      let regiones = data;
      return regiones;
    })
  }
  todoslospaises() {
    return this.database.todoslospaisesid().then((data: any) => {
      let regio = data;
      return regio;
    })
  }
  todoslosdepartamentos() {
    return this.database.todoslosdepartamentosid().then((data: any) => {
      let regio = data;
      return regio;
    })
  }
  todoslosmunicipios() {
    return this.database.todoslosmunicipiosid().then((data: any) => {
      let regio = data;
      return regio;
    })
  }
  todoslosregiones() {
    return this.database.todoslosregionesid().then((data: any) => {
      let regio = data;
      return regio;
    })
  }

}
