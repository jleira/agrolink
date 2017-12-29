import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import {SERVER_URL} from "../../config";
import {JwtHelper, AuthHttp,  AuthConfig} from "angular2-jwt";
import { DbProvider } from '../db/db';
import {Storage} from "@ionic/storage";
import { retry } from 'rxjs/operator/retry';

@Injectable()
export class UproductivaProvider {
 
  items: any;
  lista:any; 
  paises:any;
  departamentos:any;
  municipios:any;
  regiones:any;
  idup:any;
  detalles:any;

  constructor(
    public http: Http,jwtHelper: JwtHelper,
    public database:DbProvider,
    private readonly  authHttp: AuthHttp,
    private readonly storage: Storage
  ) {
  }


  filterItems(searchTerm){
       
    
    /*        
   if(searchTerm==""){
    return this.items;
           }
    return this.items.filter((item) => {
             return item.region == searchTerm ;
           });    
    */
       }
       unidadespendientesporregiones(regs:any,orientacion){
        let reg=regs;
        return this.database.unidadesporregionpendientes(reg).then((data:any)=>{
          this.items=data;
          return this.items;
          });    
       }
       unidadesterminadasporregiones(regs:any,orientacion){
        let reg=regs;
        return this.database.unidadesporregionterminadas(reg).then((data:any)=>{
          this.items=data;
          return this.items;
          });    
       }
       unidadestodasporregiones(regs:any,orientacion){
        let reg=regs;

        return this.database.unidadesporregiontodas(reg,orientacion).then((data:any)=>{
          this.items=data;
          return this.items;
          });
        }
       unidadespendientes(){
      return this.database.unidadespendientes().then((data:any)=>{
        this.items=data;
        return this.items;
        });
      } 
      unidadesterminadas(){
        return this.database.unidadesterminadas().then((data:any)=>{
          this.items=data;
          return this.items;
          });
        } 
       detallesregion(id:any){
        let idups=id;
      return this.database.detallesregion(idups).then((data:any)=>{
        this.items=data;
        return this.items;
        });
      }
      detallesmunicipio(id:any){
        let idupm=id;
      return this.database.detallesmunicipio(idupm).then((data:any)=>{
        this.items=data;
        return this.items;
        });
      }
      detallesdepartamento(id:any){
        let idupd=id;
      return this.database.detallesdepartamento(idupd).then((data:any)=>{
        this.items=data;
        return this.items;
        });
      }
      detallespais(id:any){
        let idupp=id;
      return this.database.detallespais(idupp).then((data:any)=>{
        this.items=data;
        return this.items;
        });
      }

    detallesf(id:any){
      this.idup=id;
    return this.database.unidadproductivaporid(this.idup).then((data:any)=>{
      this.items=data;
      return this.items;
      });
    }

llamaruproductivas(){
      return this.database.todasuproductivas().then((data: any)=>{
        this.items=data;
        return this.items;
      })
}
llamaruproductivasap(caso){
  return this.database.todasuproductivasap(caso).then((data: any)=>{
    this.items=data;
    
    return this.items;
  })
}

descargarunidadesproductivas(){
  this.storage.get('jwt').then(jwt => {   
    this.authHttp.get(`${SERVER_URL}/api/unidadesproductivas/`).subscribe(
      data => {
        if(!(data.json()==null)){
  //        console.log(JSON.stringify(data.json()));
  //            this.guardarunidades(data.json());
          }
      }
    );
  })
}
descargarunidadesproductivasasignadas(){
  this.storage.get('jwt').then(jwt => {   
    this.authHttp.get(`${SERVER_URL}/api/asignaciones/user`).subscribe(
      data => {
        if(!(data.json()==null)){
              this.guardarunidades(data.json());
          }
      }
    );
  })


}
guardarunidades(value){
  
  this.storage.get('codigo').then((micodigo)=>{
    
    value.forEach(element => {
      let tipo;
      let lat;
      let long;

  
      if(element.unidadProductiva['localizacion']==null){
        lat=null;
        long=null;
      }else{
        lat=element.unidadProductiva['localizacion']['latitude'];
        long=element.unidadProductiva['localizacion']['longitude'];
      };
      if (element.auditor.codigo===micodigo && element.promotor.codigo===micodigo){
        tipo =1003;
      }else if(element.auditor.codigo===micodigo && element.promotor.codigo!=micodigo){
        tipo =1002;
      }else if(element.auditor.codigo!=micodigo && element.promotor.codigo===micodigo){
        tipo =1001;
      }
  

      this.database.agregarunidadproductiva(
        element.unidadProductiva['idUnidadProductiva'],
        element.unidadProductiva['nombre'],
        element.unidadProductiva['fechaIngreso'],
        element.unidadProductiva['region']['idRegion'],
        long,
        lat,
        element.unidadProductiva['productor']['idProductor'],
        tipo
      ).then(
        (ok)=>{
          this.validarproductor(element.unidadProductiva['productor']['idProductor']).then(
            (data:any)=>{
              if(data==0){
                this.database.agregarproductor(
                  element.unidadProductiva['productor']['idProductor'],
                  element.unidadProductiva['productor']['nombre'],
                  element.unidadProductiva['productor']['identificacion'],
                  element.unidadProductiva['productor']['telefono'],
                  element.unidadProductiva['productor']['annoIngreso'],
                  element.unidadProductiva['productor']['ultimaAplicacion']
                ).then(
                    (ok)=>{},
                    (err)=>{}
                  );
              }
            }
          )
        },
      (err)=>{}
      );
  
        });
  });

    }

    validarproductor(idproductor: number){
      return this.database.existeproductor(idproductor).then(
        (ok)=>{
      return ok},
    (err)=>{}
      );
    }

    paises2(){
    return this.database.todoslospaises().then((data:any)=>{
      let paises = data;
      return paises;
    })      
   }
    departamentos2(){
      return this.database.todoslosdepartamentos().then((data:any)=>{
        let departamentos = data;
        return departamentos;
      })      
      }
    municipios2(){
     return this.database.todoslosmunicipios().then((data:any)=>{
          let municipios = data;
          return municipios;
    })      
   }
    regiones2(){
     return this.database.todoslasregiones().then((data:any)=>{
        let regiones = data;
        return regiones;
  })      
  }
 todoslospaises(){
  return this.database.todoslospaisesid().then((data:any)=>{
    let regio = data;
    return regio;
})  
 }
 todoslosdepartamentos(){
  return this.database.todoslosdepartamentosid().then((data:any)=>{
    let regio = data;
    return regio;
})  
 }
 todoslosmunicipios(){
  return this.database.todoslosmunicipiosid().then((data:any)=>{
    let regio = data;
    return regio;
}) 
 }
 todoslosregiones(){
  return this.database.todoslosregionesid().then((data:any)=>{
    let regio = data;
    return regio;
}) 
 }

}
