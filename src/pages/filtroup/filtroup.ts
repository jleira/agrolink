import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams , ViewController} from 'ionic-angular';
import { UproductivaProvider } from '../../providers/uproductiva/uproductiva';


@IonicPage()
@Component({
  selector: 'page-filtroup',
  templateUrl: 'filtroup.html',
})
export class FiltroupPage {

  opciones: any;
  mostrar: any = '';//todas , pendientes, terminadas
  vereda :any; // por defecto se muestran todas, en caso de que quiera ver una o varias en especifico
  ordenar_por:any;
  orientacion: any;
  loading: any;
  items: any;
  veredaselec:any;
  territorio:any;
  seccion:boolean;
  seccion_select;
  todo;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public uproductiva: UproductivaProvider,
  public viewCtrl: ViewController
  ) {
  }

  enviar(){
    if(this.mostrar ==""){
      this.mostrar=1;
     }    
     if( typeof this.orientacion =="undefined"){
       this.orientacion='DESC';
      };
      if( typeof this.vereda =="undefined"){
        this.vereda=this.veredaselec;
       };
       if( typeof this.territorio =="undefined"){
        this.territorio=1;
       };
       if( typeof this.ordenar_por =="undefined"){
        this.ordenar_por="";
       };

     this.viewCtrl.dismiss({
       territorio:this.territorio,
       mostrar : this.mostrar, 
       vereda : this.vereda, 
       ordenar_por: this.ordenar_por,
       orientacion:  this.orientacion
      } );
   }
   close(){
    this.viewCtrl.dismiss();        
  }
  enviar2(){
    
      console.log(this.territorio);
      if(this.territorio==1){
        this.seccion=true; 
        this.seccion_select="";
        this.todo="";
      }
      if(this.territorio==2){
        this.seccion=false;
        this.seccion_select="Paises";
        this.uproductiva.todoslospaises().then((data:any)=>{this.veredaselec=data;return this.vereda})
        this.opciones=this.uproductiva.paises2().then((data:any)=>{this.opciones=data;return this.opciones});

        this.todo="todos";
      }
      if(this.territorio==3){
        this.seccion=false;
        this.seccion_select="Departamentos";
        this.uproductiva.todoslosdepartamentos().then((data:any)=>{this.veredaselec=data;return this.vereda})
        this.opciones=this.uproductiva.departamentos2().then((data:any)=>{this.opciones=data;return this.opciones});
        this.todo="todos";
        
      }
      if(this.territorio==4){
        this.seccion=false;
        this.seccion_select="Municipios";
        this.uproductiva.todoslosmunicipios().then((data:any)=>{this.veredaselec=data;return this.vereda})
        this.opciones=this.uproductiva.municipios2().then((data:any)=>{this.opciones=data;return this.opciones});
        this.todo="todos";
        
      }
      if(this.territorio==5){
        this.seccion=false;
        this.seccion_select="Regiones";
        this.uproductiva.todoslosregiones().then((data:any)=>{this.veredaselec=data;return this.vereda})
        this.opciones=this.uproductiva.regiones2().then((data:any)=>{this.opciones=data;return this.opciones});    
        this.todo="todas";
      }
      
      return this.seccion, this.seccion_select, this.opciones,this.todo;
    }


}
