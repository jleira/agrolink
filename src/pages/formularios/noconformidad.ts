import { Component } from '@angular/core';
import { ViewController, NavParams, AlertController, LoadingController, ToastController, ModalController } from 'ionic-angular';
import { FormulariosProvider } from '../../providers/formularios/formularios';
import { DateTime } from 'ionic-angular/components/datetime/datetime';
import {tareaPage} from './tarea';
@Component({

  templateUrl: 'noconformidad.html'

})
export class NuevanoconformidadPage {
  img: any;
  up;
  tipo;
  id: number;
  descripcion: string;
  detalle: string;
  categoria;
  fecha;
  tareas;
  productor;
  categorias: any;
  habilitartarea: boolean;
  habilitarcreacion: boolean;
  fechadecierre;
  fechaminima;
  fechamaxima;
  
  constructor(
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public formulario: FormulariosProvider,
    public modalCtrl: ModalController,
  ) {
    let dt = new Date();
    let month = ("0" + (dt.getMonth() + 1)).slice(-2);
    let day = ("0" + dt.getDate()).slice(-2);
    let year = dt.getFullYear();
    this.fechaminima = year + '-' + month + '-' + day;
    this.fechamaxima = (year+3) + '-' + month + '-' + day;

    this.productor = this.navParams.get('productor');
    this.up = this.navParams.get('up');
    this.tipo = this.navParams.get('tipo');
    let idd = this.navParams.get('id');

    if (idd) {
      this.habilitarcreacion = false;
      this.id = idd;
      this.habilitartarea = true;
      this.formulario.tareas(idd).then((data) => {
        if(data)
        {
          let dt = new Date();
          let month = (dt.getMonth() + 1);
          let day = dt.getDate();
          let year = dt.getFullYear();
          let fechainicial = new Date();
          fechainicial.setFullYear(year, month, day);
          console.log('inicial',fechainicial);   
          data.forEach(element => {
            let fechac=new Date();
            let fechacomp=element.fechaPautadaCierre.split('-');
            fechac.setFullYear(fechacomp[0], fechacomp[1], fechacomp[2]);
            if(fechac>fechainicial){
              fechainicial=fechac;
            } 
          });
          this.fechaminima=fechainicial.getFullYear()+'-'+ ("0" + (fechainicial.getMonth() + 1)).slice(-2);+'-'+("0" + fechainicial.getDate()).slice(-2);
          this.fechamaxima=(fechainicial.getFullYear()+3)+'-'+ ("0" + (fechainicial.getMonth() + 1)).slice(-2);+'-'+("0" + fechainicial.getDate()).slice(-2);
        }

        this.tareas = data;
        console.log(this.tareas);
        return this.tareas;
      });
      this.formulario.noconformidadid(this.id).then((data) => {
        this.descripcion = data[0].descripcion;
        this.detalle = data[0].detalle;
        this.fecha = data[0].fechaposiblecierre;
        this.fechadecierre = data[0].fechafinalizado;

        if (data[0].estado == 0) {
          this.habilitartarea = true;

        } else {
          this.habilitartarea = false;
        }
        console.log(data);
        return (this.descripcion, this.descripcion, this.detalle);
 
      });
    } else {
      this.habilitarcreacion = true;
      this.habilitartarea = false;
    }
    this.formulario.categoria().then((categoriasg) => {
      this.categorias = categoriasg;
    })
  }
  noconformidad(values) {
    console.log(values);
    let dt = new Date();
    let month = ("0" + (dt.getMonth() + 1)).slice(-2);
    let day = ("0" + dt.getDate()).slice(-2);
    let year = dt.getFullYear();
    if (values.descripcion == "" || values.categoria == "" || values.fecha == "" || values.detalle == "") {
      let prompt = this.alertCtrl.create({
        title: 'todos los campos deben estar llenos',
        buttons: [{
          text: 'Aceptar',
          handler: data => { }
        }
        ]
      })
      prompt.present();
    }else{
      let loading = this.loadingCtrl.create({
        spinner: 'bubbles',
        content: 'Guardando datos...'
      });
      loading.present();
  
       this.formulario.guardarnoconformidades(this.up, this.tipo, values.categoria, values.detalle,
        values.descripcion, year + '-' + month + '-' + day, values.fecha, 0).then((data) => {
         this.habilitartarea = true;
         this.id = data;
         this.categoria = values.categoria;
         this.detalle = values.detalle;
         this.descripcion = values.descripcion;
         this.fecha = values.fecha;
         this.fechadecierre = 'Noconformidad en progreso';
         this.habilitarcreacion = false;
         this.handleError('inconformidad guardada');
       loading.dismiss();
           },err=>{
      this.handleError('Error guardando no conformidad, intente guardar nuevamente');
      loading.dismiss();
     })
     }
  }


  dismiss() {
    this.viewCtrl.dismiss();
  }
  ionViewWillEnter() {
    console.log('entro aqui',this.id);
    this.formulario.tareas(this.id).then((tar) => { 
      console.log('tar',tar);
      this.tareas = tar;
    })

  }

  agregartarea() {
    let modal = this.modalCtrl.create(tareaPage, {'caso':1, 'noconformidad': this.id, 'fecha':this.fecha });
    modal.present();
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

  editarnoconformidad(id, columna, valor) {
    let dt = new Date();
    let month = dt.getMonth() + 1;
    let day = dt.getDate();
    let year = dt.getFullYear();
    return this.formulario.editarnoconformidad(id, columna, valor).then((data) => {
      console.log(data);
    })
  }

  finalizartareaid(id, data, estado) {
    let fechacierrereal;
    let dt = new Date();
    let month = ("0" + (dt.getMonth() + 1)).slice(-2);
    let day = ("0" + dt.getDate()).slice(-2);
    let year = dt.getFullYear();
    fechacierrereal = year + '-' + month + '-' + day;

    this.formulario.tareaseditar(id, data.nombre, data.detalle, data.encargado, data.fechaPautadaCierre, estado, fechacierrereal).then((data) => {

      this.formulario.tareas(this.id).then((tar) => {
        this.tareas = tar;
         })
    }, err => {
      this.handleError('error al guardar tarea, intentelo nuevamente');
    }).catch((err) => {
      console.log(err);
      this.handleError('error al guardar tarea, intentelo nuevamente');

    })
  }

  editartarea(item: any) {
    console.log(item);
    let modal = this.modalCtrl.create(tareaPage, {'caso':3, 'noconformidad': this.id, 'fecha':this.fecha, 'tarea':item });
    modal.present();
  }
  verdetalles(tareaid) {
    console.log(tareaid);
    let modal = this.modalCtrl.create(tareaPage, {'caso':2, 'noconformidad': this.id, 'fecha':this.fecha, 'tarea':tareaid });
    modal.present();
  }


  finalizartarea(tareaid) {
    //
    let mensaje;
    mensaje = 'Una vez termianda la tarea no se podra editar no cambiar su estado';
    let prompt = this.alertCtrl.create({
      title: 'Desea terminar la ' + tareaid.nombre,
      message: mensaje,
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
          }
        }, {
          text: 'Cambiar estado',
          handler: data => {
            this.finalizartareaid(tareaid.id, tareaid, 1);
          }
        }

      ]
    });
    prompt.present();
  }


  finalizarnoconformidad() {
    let habilitarfinalizar=true;
    this.tareas.forEach(element => {
      if(element.estado==0){
        habilitarfinalizar=false;
      }
    });

    if(habilitarfinalizar==true){
      let dt = new Date();
      let month = dt.getMonth() + 1;
      let day = dt.getDate();
      let year = dt.getFullYear();
      this.formulario.editarnoconformidad(this.id, 'fechafinalizado', year + '-' + month + '-' + day).then((data) => {
        console.log(data);
      }).then(() => {
        this.formulario.editarnoconformidad(this.id, 'estado', 1).then(() => {
          this.habilitartarea = false;
          this.habilitarcreacion = false;
        });
  
  
      }).catch((err) => {
        this.handleError('error, intentelo nuevamente');
        console.log(err);
      })
    }else{
      this.handleError('Para cerrar la no conformidad primero debe culminar todas las tareas ');
    }


  }



}