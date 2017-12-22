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
                  
                   let preg=pr.pregunta.respCodigo;
                  let pregunt=pr.pregunta.codigo;
                  if(preg===null){
                    this.database.guardarpregunta(pr.pregunta.codigo, pr.pregunta.enunciado, pr.posicion, pr.pregunta.cataTipeCodigo.codigo, pr.valorinicial, gid, requerido, '');                    
                  }else{
                    this.database.guardarpregunta(pr.pregunta.codigo, pr.pregunta.enunciado, pr.posicion, pr.pregunta.cataTipeCodigo.codigo, pr.valorinicial, gid, requerido, pr.pregunta.respCodigo.codigo);                    
                    
                    this.authHttp.get(`${SERVER_URL}/api/answers/find/${pr.pregunta.respCodigo.codigo}`).subscribe(
                      respuestas=>{
                        respuestas.json().valores.forEach(resp => {
                          this.database.guardarrespuesta(resp.codigo, resp.nombre, resp.valor, resp.tipoDato, pregunt, respuestas.json().codigo);
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
    console.log(err);
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
respuestasporpreguntas(preguntas, up, grupo){

   return this.database.respuestasporpregunta(preguntas).then(data=> {
  this.items=data;
  return this.items;
}).then(()=>{
  return this.database.respuestasguardadas(up, grupo).then((dt)=>{
    let da:any;
    da=dt;
    this.items.forEach(respuestas => {
      if(da!=false){
        respuestas.respuesta='esto es una prueb';
        da.forEach(valores => {
        
          if( respuestas.preguntaid==valores.pregunta){
            respuestas.observacion=valores.observacion;
            if (respuestas.tipo==210001 || respuestas.tipo==2100003){
              respuestas.respuesta=valores.valor;
            }else if(respuestas.tipo==210002){
              respuestas.respuesta=parseInt(valores.valor);
            }else if(respuestas.tipo==210004){
              let arrayvalores;
              arrayvalores=valores.valor.split('_');
              if(arrayvalores.indexOf(respuestas.valor.toString())!=-1){
                respuestas.respuesta=true;
              }else{
                respuestas.respuesta=false;
              }
            }
          }
        });
      }
    });
    return this.items;
  })
});
}
respuestasguardada(up, grupo){
  return this.database.respuestasguardadas(up, grupo).then((dt)=>{
    this.items=dt;    
    return this.items;
  })
}

guardar3001(unidadp, grup, codigopararespuestas, preguntaid ,codigosdelasrespuestas , valoresdelasrespuestas , valortext){
  this.database.guardarrespuestaporpregunta(unidadp, grup, codigopararespuestas, preguntaid ,codigosdelasrespuestas , valoresdelasrespuestas , valortext);

}
guardarobservacion(up, grupoidselected, respcodigo, preguntaid, observacion){
this.database.guardarobservacion(up, grupoidselected, respcodigo, preguntaid, observacion);
}



}
