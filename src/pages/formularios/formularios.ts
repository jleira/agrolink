import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UproductivaProvider } from '../../providers/uproductiva/uproductiva';
import { FormulariosProvider } from '../../providers/formularios/formularios';
import { observeOn } from 'rxjs/operators/observeOn';
/**
 * Generated class for the FormulariosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-formularios',
  templateUrl: 'formularios.html',
})
export class FormulariosPage {
caso:any;
items:any;
respuestas;
prueba:any;
prueba2:any;
prueba3:any;
prueba4:any;
resp:any;
final:any;
grupo:any;
up:any;
respuestasguardades:any;
grupoidselected:any;


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public uproductiva: UproductivaProvider,
    public formulario: FormulariosProvider) {
    this.caso=navParams.get('caso');
   }

  ionViewDidLoad() {
    this.prueba=[];
    if(this.caso==1){//auditoria
      this.uproductiva.llamaruproductivasap(1002).then((data:any)=>{
        this.items=data;
     });  
    }else if(this.caso==2){//promotoria
       this.uproductiva.llamaruproductivasap(1001).then((data:any)=>{
       this.items=data;
       return this.items;
     });
    }else if(this.caso==3){//auditoria
      this.up=this.navParams.get('up');
      let casot=this.navParams.get('tipo');
     return this.formulario.gruposbase(casot).then(gps=>{
        if (gps==null){
          this.items="la variable retorno null";
        }else if(gps== "undefined"){
          this.items="la variable retorno indefinida";
          
        } else{
          this.items=gps;
        }
        return this.items;
      });
    }else if(this.caso==4){//promotoria
      this.grupoidselected=this.navParams.get('grupo');
      this.up=this.navParams.get('up');
      this.grupo=this.navParams.get('gruponombre');
      
      this.formulario.preguntasgrupo(this.grupoidselected).then(preguntasg=>{
        if (preguntasg==null){
          this.prueba="la variable retorno null";
        }else if(preguntasg== "undefined"){
          this.prueba="la variable retorno indefinida";
        } else{
          this.items=preguntasg;
        }
        let r=[];
        this.items.forEach(element => {
          r.push(element.codigo);
        });        
        this.resp=r;
        return this.formulario.respuestasporpreguntas(this.resp, this.up, this.grupoidselected ).then(data=>{
          this.resp=data;
          this.items.forEach(element => {
            let vr:any;
            this.resp.forEach(element2 => {
              if(element2.preguntaid==element.codigo){
                element.respuestas.push(element2);
              }
            });
      })
      this.resp=JSON.stringify(this.resp);
        }).
        then(()=>{
          this.final=this.items;          
          this.prueba=JSON.stringify(this.items);
          this.prueba3=JSON.stringify(this.final);
          

          return this.items, this.prueba, this.resp, this.final;          
        });

  
    });
  
  }
}

  asignarRespuestas(){
    }

  guardar3001(valor ,preguntaid, respcodigo) {
    this.formulario.guardar3001(this.up, this.grupoidselected, respcodigo, preguntaid,valor.codigo, valor.valor, valor.valor);
 }

 guardar3002(valor ,preguntaid, respcodigo) {

  let codigosrespuestas:any=[];
  let valoresrespuesta:any=[];
  this.prueba=JSON.stringify(valor);
  valor.forEach(element => { 
    codigosrespuestas.push(element.codigo);
    valoresrespuesta.push(element.valor);
  });
  codigosrespuestas=codigosrespuestas.join('_');
  valoresrespuesta=valoresrespuesta.join('_');
  this.formulario.guardar3001(this.up, this.grupoidselected, respcodigo, preguntaid, codigosrespuestas, valoresrespuesta, valoresrespuesta);
this.prueba2=[];
this.prueba2.push({up: this.up, grupo: this.grupoidselected, codigopararespuestas: respcodigo, preguntaid: preguntaid,codigosdelasrespuestas: codigosrespuestas, valoresrespuesta:valoresrespuesta, valoresrespuestatext:valoresrespuesta });
this.prueba2=JSON.stringify(this.prueba2);
}



 guardar3006(valor ,preguntaid, respcodigo, respuestafinal) {
  this.formulario.guardar3001(this.up, this.grupoidselected, respcodigo, preguntaid,valor.codigo, valor.valor, respuestafinal);
}

guardarobservacion(preguntaid, respcodigo, observacion) {
//  this.formulario.guardarobservacion(this.up, this.grupoidselected, respcodigo, preguntaid, observacion);
}

  mostrargrupos(tipop, upva){
      this.formulario.gruposbase(tipop).then(gps=>{
        if (gps==null){
          this.items="la variable retorno null";
        }else if(gps== "undefined"){
          this.items="la variable retorno indefinida";
          
        } else{

          this.prueba=JSON.stringify(gps);
        }
        this.navCtrl.push(FormulariosPage, {
          caso: 3,tipo: tipop, up: upva
        });
      });
  }

  mostrarpreguntas(grupoid, nbre){
    this.formulario.preguntasgrupo(grupoid).then(preguntasg=>{
      if (preguntasg==null){
        this.prueba="la variable retorno null";
      }else if(preguntasg== "undefined"){
        this.prueba="la variable retorno indefinida";
        
      } else{

        this.prueba=JSON.stringify(preguntasg);
      }
      this.navCtrl.push(FormulariosPage, {
        caso: 4, grupo: grupoid , up: this.up, gruponombre: nbre
      });
    });
}

  llamar2(){
    // this.formulario.(this.up, this.grupoidselected).then(data=>{
    //   this.prueba2=data ;
    //   return this.prueba2;
    // });
    // this.prueba3=[];
    // this.items.forEach(element => {
    //   this.prueba3.push(element.respuestas);
    // });
    // this.prueba3=JSON.stringify(this.prueba3);
 //

}

}
