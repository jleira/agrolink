import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import {JwtHelper, AuthHttp,  AuthConfig} from "angular2-jwt";
import {SERVER_URL} from "../../config";
import {Storage} from "@ionic/storage";
import { DbProvider } from '../db/db';

@Injectable()
export class FormulariosProvider {
form:any;
grupos:any;
items: any;

  constructor(
    public http: Http,jwtHelper: JwtHelper,
    private readonly  authHttp: AuthHttp,
    private readonly storage: Storage,
    public database:DbProvider
  ) {
  }
descargarformularios(){
  
  this.storage.get('jwt').then(jwt => {

    this.authHttp.get(`${SERVER_URL}/api/inquiries/findByPeriodoUser`).subscribe(

      data=>{
//      console.log('iquieres',JSON.stringify(data.json()));      
        let ind=0;
        let tform;
        let per;        
        data.json().forEach(element => {
          ind=ind+1;
          if(element.cataTienCodigo==null){
            tform=null;
          }else{
            tform=element.cataTienCodigo.codigo;
          }
          if(element.periodo==null){
            per=null;
          }else{
            per=element.periodo.alias;
        }
          this.database.guardarformulario(element.codigo, element.nombre, element.observaciones, tform, per);
          let id=element.codigo;
          element.grupos.forEach(element2 => {
            this.database.guardargrupo(element2.idGrupoBase, element2.nombre, element2.posicion, id, element2.textoAyuda);
           let gid=element2.idGrupoBase;
            this.authHttp.get(`${SERVER_URL}/api/grupoBasesPreguntasBases/findByGroup/${element2.idGrupoBase}`).subscribe(
              preguntas=>{

                preguntas.json().forEach(pr => {
                  let requerido;
                  if(pr.requerido)
                  {
                    requerido=1;
                  }else{
                    requerido=0;
                  }
                  if(pr.pregunta.adjuntos===true){
                    pr.pregunta.adjuntos=1;
                  }
                   let preg=pr.pregunta.respCodigo;
                  let pregunt=pr.pregunta.codigo;
                  
                  if(preg===null){
                    if(pr.pregunta.cataTipeCodigo.codigo===3007){//pregunta tipo tabla
                      console.log(' vamos a descargar la cabecera',pr.pregunta.codigo);
//http://localhost:10080/Agrolink/api/questions/findPreguntasOfTable/{codigoPreguntaTabla}
this.authHttp.get(`${SERVER_URL}/api/questions/findPreguntasOfTable/${pr.pregunta.codigo}`).subscribe(
  preguntatabla=>{
    console.log(JSON.parse(atob(preguntatabla.json()['header']['cuerpo'])));
  }
);
                    }
                    this.database.guardarpregunta(pr.pregunta.codigo, pr.pregunta.enunciado, pr.posicion, pr.pregunta.cataTipeCodigo.codigo, pr.valorinicial, gid, requerido, '',pr.pregunta.adjuntos);
                    
                  }else{
                   
                      this.database.guardarpregunta(pr.pregunta.codigo, pr.pregunta.enunciado, pr.posicion, pr.pregunta.cataTipeCodigo.codigo, pr.valorinicial, gid, requerido, pr.pregunta.respCodigo.codigo,pr.pregunta.adjuntos);

                      this.authHttp.get(`${SERVER_URL}/api/answers/find/${pr.pregunta.respCodigo.codigo}`).subscribe(
                        respuestas=>{
                          respuestas.json().valores.forEach(resp => {
                            this.database.guardarrespuesta(resp.codigo, resp.nombre, resp.valor, resp.tipoDato, pregunt, respuestas.json().codigo).then(
                              (ok)=>{
                                //console.log('ok',JSON.stringify(ok))
                              },(orr)=>{
                              //  console.log('orr',JSON.stringify(orr))
                              });
                          });
                        }
                      );
                    
                    
                    

                  }
                  

                });
              }
            );
          });

        });
  }), (err)=>{
  };

  });

}

gruposbase(caso){
 return this.database.formularioid(caso).then((data:any)=>{
   this.database.gruposbyid(data).then(grupodb=>{
    this.items=grupodb;
    return this.items;
   });
  return this.items;
  });
}
preguntasgrupo(grupo){
  return this.database.preguntasporgrupo(grupo).then((data:any)=>{
    this.items=data;
  
   return this.items;
   });
}
respuestasporpreguntas(preguntas, up, grupo, tipo){

   return this.database.respuestasporpregunta(preguntas).then(data=> {
  this.items=data;
  return this.items;
}).then(()=>{
  return this.database.respuestasguardadas(up, grupo, tipo).then((dt)=>{
    let da:any;
    da=dt;
    this.items.forEach(respuestas => {
      if(da!=false){
 
        
        da.forEach(valores => {
        
          if( respuestas.preguntaid==valores.pregunta){
            respuestas.observacion=valores.observacion;
            if (respuestas.tipo==210001){
              respuestas.respuesta=valores.valor;
              respuestas.ruta=valores.ruta;
            }else if (respuestas.tipo==210003){
              respuestas.respuesta=valores.valor;
              respuestas.ruta=valores.ruta;
            }else if(respuestas.tipo==210002){
              respuestas.ruta=valores.ruta;
              respuestas.respuesta=parseInt(valores.valor);
            }else if(respuestas.tipo==210004){
              respuestas.ruta=valores.ruta;
              let arrayvalores;
              if(valores.valor){
                arrayvalores=valores.valor.split('_');
                if(arrayvalores.indexOf(respuestas.valor.toString())!=-1){
                  respuestas.respuesta=true;
                }else{
                  respuestas.respuesta=false;
                }
              }else{
                respuestas.respuesta=false;

              };

            }else{
              respuestas.ruta=valores.ruta;
              
            }
          }
        });
      }

    });
    return this.items;
  })
});
}
respuestasguardada(up, grupo, tipo){
  return this.database.respuestasguardadas(up, grupo, tipo).then((dt)=>{
    this.items=dt;    
    return this.items;
  })
}

guardar3001(unidadp, grup, codigopararespuestas, preguntaid ,codigosdelasrespuestas , valoresdelasrespuestas , valortext,tipoformulario){
  this.database.guardarrespuestaporpregunta(unidadp, grup, codigopararespuestas, preguntaid ,codigosdelasrespuestas , valoresdelasrespuestas , valortext, tipoformulario);

}
guardarobservacion(up, grupoidselected, respcodigo, preguntaid, observacion, tipof){
this.database.guardarobservacion(up, grupoidselected, respcodigo, preguntaid, observacion, tipof);
}
guardarimagen(up, grupoidselected, respcodigo, preguntaid, imagen, tipof){
 return this.database.guardarimagen(up, grupoidselected, respcodigo, preguntaid, imagen, tipof).then((dt)=>{
  this.items=dt;    
  return this.items;
});
  }


}
