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
  decide: any;
  constructor(
    public uproductiva: UproductivaProvider,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public db: DbProvider
  ) {
    this.uproductiva.llamarunidadesproductivasiniciadas().then((data) => {
      this.up = data;
      if(this.up.length == 0){
        this.up=false;
      }
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
            console.log(formulario);
            if(formulario==null){
              return false;
            }else{
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
            }

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