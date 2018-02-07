import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,ViewController, ModalController, ToastController, AlertController} from 'ionic-angular';
import { TIPO_FECHA, FORMULARIO_AUDITORIA } from "../../config";
import { Geolocation } from '@ionic-native/geolocation';
import { DbProvider } from '../../providers/db/db';
import { FORMULARIO_PROMOTORIA } from "../../config";
import { UpdetallesPage} from '../updetalles/updetalles';
import { FormulariosPage} from '../formularios/formularios';



/**
 * Generated class for the CasoespecialPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-casoespecial',
  templateUrl: 'casoespecial.html',
})

export class CasoespecialPage {
  items;
  datolongitud: any;
  datolatitud: any;
  caso: number;
  regiones=[];
  TIPO_FECHA = TIPO_FECHA;
  idunidadp='';
  preguntassinresponder: any;
  evento;
  habilitarenvio;
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private geolocation: Geolocation,
    public db: DbProvider, 
    public viewCtrl: ViewController, 
    public toastCtrl: ToastController, 
    public alertCtrl:AlertController,
    public modalCtrl: ModalController
  ) {
    this.habilitarenvio=false;
    this.items=[];
    this.generarid();
    this.caso = navParams.get('caso');
    if (this.caso == 2) {
      this.geolocation.getCurrentPosition().then((resp) => {
        this.datolatitud = resp.coords.latitude.toString();
        this.datolongitud = resp.coords.longitude.toString();
      }).catch((error) => {
        this.datolatitud = null;
        this.datolongitud = null;
      });

      this.db.todoslasregiones().then((data) => {
        this.regiones=data;
      });

    }



  }

  ionViewDidEnter() {
    console.log(this.caso);
    if(this.caso==1){
      this.traerunidades('0,1,2');
    }if(this.caso==3){
      this.traerunidades('1');
      if (this.evento.length == 0) {

      } else {
        this.comprobarunidades(FORMULARIO_PROMOTORIA, this.evento);
      }
    }

  }

  agregarunidad(caso) {
    this.navCtrl.push(CasoespecialPage, {
      caso: 2
    });
  }

  agregarunidadn(datos){
  console.log(datos);
if(datos.nombrep =="" || datos.identificacion =="" || datos.telefono =="" || datos.fechan =="" || 
datos.grupoe =="" || datos.genero =="" || datos.region =="" || datos.nombreu ==""   ){
  let prompt = this.alertCtrl.create({
    title: 'AGREGAR UNIDAD PRODUCTIVA',
    message: "Todos los campos deben estar lleno",
    buttons: [
      {
        text: 'Aceptar'
      }
    ]
  });
  prompt.present();
}else{

  let prompt = this.alertCtrl.create({
    title: 'AGREGAR UNIDAD PRODUCTIVA',
    message: "Una vez creada la unidad productiva esta no podra ser editada",
    buttons: [
      {
        text: 'Cancelar',
       },
       {
        text: 'Aceptar',
        handler: data => {
          let datosproductor={
            nombre: datos.nombrep,
            identificacion: datos.identificacion,
            telefono: datos.telefono,
            fechaNacimiento: datos.fechan,
            grupoEtnico: datos.grupoe,
            genero: datos.genero,
          };
          console.log(datosproductor);
          
          this.db.agregarunidadproductivamovil(
            this.idunidadp, 
            datos.nombreu, 
            null,
            datos.region, 
            this.datolongitud, 
            this.datolatitud, 
            null, 
            FORMULARIO_PROMOTORIA,
            '',
            JSON.stringify(datosproductor)).then(()=>{
              this.handleError('Unidad creada exitosamente');
              this.dismiss();
            },(err)=>
            {console.log(err);
              this.handleError('No se pudo crear la unidad, intentelo nuevamente');
          });
        }
      }
    ]
  });
  prompt.present();



}


  }
  dismiss() {
    this.viewCtrl.dismiss();
  }
  
 generarid(){
console.log('id generado');
let codigogenerado=this.rand_code('0123456789ABCDEFGHUIJK',5);

  this.db.unidadproductivaporid(codigogenerado).then((ok)=>{
    if(ok.length>0){
      this.generarid();
    }else{
      this.idunidadp=codigogenerado;
    }
  },(e)=>{console.log('e',e)});



 }

 rand_code(chars, lon){
  let code = "";
  for (let x=0; x < lon; x++)
  {
  let rand = Math.floor(Math.random()*chars.length);
  code += chars.substr(rand, 1);
  }
  console.log(code);

  return code;
  }

  handleError(error: string) {
    let message: string;
    message = error;
    const toast = this.toastCtrl.create({
      message,
      duration: 5000,
      position: 'bottom'
    });
    toast.present();
  }

  traerunidades(caso){
    this.db.unidadescreadas(caso).then((data)=>{
      console.log(data);
      if(data){
        this.items=data;
      }else{
        this.items=[];
      }

    })
  }
  abrirformulario(unidad){
 
    this.navCtrl.push(FormulariosPage, {
      caso: 3, tipo: unidad.tipo, up: unidad, productor: unidad.productor
    });
  }

  abrirdetalles(id: any) {
    let idu=id;
      let modal = this.modalCtrl.create(UpdetallesPage,{'ids': idu});
    modal.present();
  }

  enviarunidades(){
    this.navCtrl.push(CasoespecialPage, {
      caso: 3
    });
  }

  comprobarunidades(tipo, $event) {
    console.log(tipo, $event);
    this.preguntassinresponder = [];
    this.evento = $event;
    $event.forEach(up => {
      let formulario;
      let enviar = [];
      this.db.formularioid(tipo).then((formularioid) => {
        formulario = formularioid;
        if (formulario == null) {
          if (tipo == 1001) {
            this.handleError('No se encuentran formularios para audiotoria registrados en el movil');
            this.habilitarenvio = false;
          } else {
            this.handleError('No se encuentran formularios para promotoria registrados en el movil');
            this.habilitarenvio = false;
          }
        } else {
          this.db.gruposbyid(formulario).then((grupo) => {
            let grupos = grupo;
            let preguntas = [];
            if (grupos) {
              grupos.forEach(grupoi => {
                this.db.preguntasporgruporequeridas(grupoi.idgrupobase).then((pregunta) => {
                  if (pregunta) {
                    pregunta.forEach(preguntaid => {
                      console.log(up.idUnidadProductiva, grupoi.idgrupobase, preguntaid.codigo, tipo, preguntaid.tipo);
                      return this.db.verficarrespuestas(up.idUnidadProductiva, grupoi.idgrupobase, preguntaid.codigo, tipo, preguntaid.tipo).then(tienerespuesta => {
                        console.log(up.idUnidadProductiva, grupoi.idgrupobase, preguntaid.codigo, tipo, preguntaid.tipo);
                        console.log(tienerespuesta);

                        if (tienerespuesta) {
                          if (this.preguntassinresponder.length == 0) {
                            this.habilitarenvio = true;
                          }
                        } else {
                          let datatopush = { 'preguntaid': preguntaid, 'grupo': grupoi, 'up': up, 'tipo': tipo };
                          this.habilitarenvio = false;
                          this.preguntassinresponder.push(datatopush);
                        }
                      })
                    });
                  }
                });
              });
            } else {
              this.handleError('No se encuentran preguntas registradas para este formulario');
            }
          });
        }
      })
    });

  }
  abrirpagina(pregunta) {
     this.navCtrl.push(FormulariosPage, {
      caso: 4, grupo: pregunta.grupo.idgrupobase, up: pregunta.up, gruponombre: pregunta.grupo.nombre, tipo: pregunta.tipo
    });
  }




}
