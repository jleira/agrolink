import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { UproductivaProvider } from '../../providers/uproductiva/uproductiva';


@IonicPage()
@Component({
  selector: 'page-filtroup',
  templateUrl: 'filtroup.html',
})
export class FiltroupPage {

  opciones: any;
  vereda: any;
  mostrar = '0,1,2';//todas , pendientes, terminadas
  ordenar_por: any;
  orientacion: any;
  loading: any;
  items: any;
  veredaselec: any;
  territorio: any;
  seccion: boolean;
  seccion_select;
  todo;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public uproductiva: UproductivaProvider,
    public viewCtrl: ViewController
  ) {
    this.seccion = true;
  }

  enviar() {

    if (!this.mostrar) {
      this.mostrar = '0,1,2';
    }

    if (this.territorio) {
      if (this.territorio > 1) {

        if(this.vereda){
          this.vereda = this.vereda.join(',');
          if (this.vereda == "") {
            let veredas=[];
            this.opciones.forEach(element => {
              veredas.push(element.id);
            });
            this.vereda = veredas.join(',');
            }
        }else{
          let veredas=[];
          this.opciones.forEach(element => {
            veredas.push(element.id);
          });
          this.vereda = veredas.join(',');        
        }
      } else {
        this.vereda = false;
      }
    } else {
      this.territorio = 1;
      this.vereda = false;
    }
    if (!this.orientacion) {
      this.orientacion = false;
    }
    this.viewCtrl.dismiss({
      territorio: this.territorio,
      mostrar: this.mostrar,
      vereda: this.vereda,
      orientacion: this.orientacion
    });
  }
  close() {
    this.viewCtrl.dismiss(false);
  }
  enviar2() {
    if (this.territorio == 1) {
      this.seccion = true;
      this.seccion_select = "";
      this.todo = "";
      this.opciones = [];
      this.vereda = [];
    }
    if (this.territorio == 2) {
      this.seccion = false;
      this.seccion_select = "Paises";
      this.uproductiva.paises2().then((data: any) => { this.opciones = data; return this.opciones }, err => {
      });
      this.todo = "todos";
    }
    if (this.territorio == 3) {
      this.seccion = false;
      this.seccion_select = "Departamentos";
      this.uproductiva.departamentos2().then((data: any) => { this.opciones = data; return this.opciones }, err => {
      });
      this.todo = "todos";
    }
    if (this.territorio == 4) {
      this.seccion = false;
      this.seccion_select = "Municipios";
      this.uproductiva.municipios2().then((data: any) => { this.opciones = data; return this.opciones }, err => {
      });
      this.todo = "todos";

    }
    if (this.territorio == 5) {
      this.seccion = false;
      this.seccion_select = "Regiones";
      this.uproductiva.regiones2().then((data: any) => { this.opciones = data; return this.opciones }, err => {
      });
      this.todo = "todas";
    }
  }
}
