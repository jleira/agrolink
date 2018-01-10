import { Component } from '@angular/core';
import { ViewController, NavParams, ModalController } from 'ionic-angular';
import { UproductivaProvider } from '../../providers/uproductiva/uproductiva';
import { DbProvider } from '../../providers/db/db';
@Component({

  templateUrl: 'sinc.html'

})
export class EnviardatosPage {
  img: any;
  up: any;
  constructor(
    public uproductiva: UproductivaProvider,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public db: DbProvider
  ) {
    this.uproductiva.llamaruproductivas().then((data) => {
      this.up = data;
    });
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }

  comprobarunidades(tipo, $event) {

        $event.forEach(up => {
          let formulario;
          let enviar=[];
          this.db.formularioid(tipo).then((formularioid) => {
            formulario = formularioid;
            this.db.gruposbyid(formulario).then((grupo) => {
              let grupos = grupo;
              let preguntas = [];
              grupos.forEach(grupoi => {
                this.db.preguntasporgrupo(grupoi.idgrupobase).then((pregunta) => {
                  preguntas.push(pregunta);
                });
              });
            //  console.log(preguntas);
            });
          }).then((ok) => {
      
      
            enviar.push({
              formulario: {
                formularioBase: {
                  "codigo": formulario,
                },
                "asignacion": {
                  idAsignacion: up.idAsignacion
                }
              }
            });
                console.log(enviar);
          });

        });

  }
}