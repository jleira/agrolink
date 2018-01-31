import { Component } from '@angular/core';
import { ViewController, NavParams, LoadingController, ToastController, ModalController, AlertController } from 'ionic-angular';
import { FormulariosProvider } from '../../providers/formularios/formularios';
import { DateTime } from 'ionic-angular/components/datetime/datetime';

@Component({

  templateUrl: 'tarea.html'

})
export class tareaPage {

  fechaminima;
  fechamaxima;
  fechaa;
  fechadecierrea;
  encargadoa;
  nombrea: string;
  descripciona;
  noconformidad;
  caso;
  editar: boolean;
  tareaid;

  constructor(
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public formulario: FormulariosProvider,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController
  ) {

    this.noconformidad = this.navParams.get('noconformidad');
    this.fechamaxima = this.navParams.get('fecha');
    let dt = new Date();
    let month = ("0" + (dt.getMonth() + 1)).slice(-2);
    let day = ("0" + dt.getDate()).slice(-2);
    let year = dt.getFullYear();
    this.fechaminima = year + '-' + month + '-' + day;
    console.log(this.fechaminima, this.fechamaxima);

  }
  ionViewDidLoad() {
    this.caso = this.navParams.get('caso');
    if (this.caso == 1) {//vamos a agregar una tarea
      this.nombrea = "";
      this.descripciona = "";
      this.fechaa = "";
      this.encargadoa = "";

      this.editar = false;
    } else if (this.caso == 2) {
      console.log(this.navParams.get('tarea'));
      this.nombrea = this.navParams.get('tarea').nombre;
      this.descripciona = this.navParams.get('tarea').detalle;
      this.fechaa = this.navParams.get('tarea').fechaPautadaCierre;
      this.encargadoa = this.navParams.get('tarea').encargado;
      if (this.navParams.get('tarea').estado == 0) {
        this.fechadecierrea = 'Tarea en proceso';
      } else {
        this.fechadecierrea = this.navParams.get('tarea').fechaRealCierre;
      }
      this.editar = true;
    } else if (this.caso == 3) {
      this.tareaid = this.navParams.get('tarea').id;
      this.nombrea = this.navParams.get('tarea').nombre;
      this.descripciona = this.navParams.get('tarea').detalle;
      this.fechaa = this.navParams.get('tarea').fechaPautadaCierre;
      this.encargadoa = this.navParams.get('tarea').encargado;
      if (this.navParams.get('tarea').estado == 0) {
        this.fechadecierrea = 'Tarea en proceso';
      } else {
        this.fechadecierrea = this.navParams.get('tarea').fechaRealCierre;
      }
      this.editar = false;
    }
  }

  guardartareanueva(values) {
    console.log(values);
    let msj:string;
    if(this.caso==1){
       msj="Una vez agregada una tarea no podra ser eliminada";
    }else if(this.caso==3)
    {
      msj="Esta seguro que desea editar esta tarea";
    }

    console.log(values);
    if (values.nombre == "" || values.encargado == "" || values.fecha == "" || values.detalle == "") {
      let prompt = this.alertCtrl.create({
        title: 'todos los campos deben estar llenos',
        buttons: [{
          text: 'Aceptar',
          handler: data => { }
        }
        ]
      })
      prompt.present();
    } else {
      let prompt2 = this.alertCtrl.create({
        title: msj,
        buttons: [{
          text: 'Cancelar',
          handler: data => { }
        },
        {
          text: 'Aceptar',
          handler: data => {
            if (this.caso == 1) {
              this.guardartarea(values);
            } else if (this.caso == 3) {
              this.editartareaid(this.tareaid, values, 0);
            }


          }
        }
        ]
      })
      prompt2.present();
    }

  }

  dismiss() {
    this.viewCtrl.dismiss();
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


  guardartarea(data: any) {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Guardando tarea...'
    });
    loading.present();
    let dt = new Date();
    let month = ("0" + (dt.getMonth() + 1)).slice(-2);
    let day = ("0" + dt.getDate()).slice(-2);
    let year = dt.getFullYear();

    this.formulario.agregartarea(this.noconformidad, data.nombre,
      data.detalle, data.encargado, data.fecha, 0, year + '-' + month + '-' + day).then((data) => {
        this.handleError('Tarea guardada');
        loading.dismiss();
        this.dismiss();
      }, err => {
        this.handleError('error al guardar tarea, intentelo nuevamente');
        loading.dismiss();
      })

  }

  editartareaid(id, values, estado) {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Editando tarea...'
    });
    loading.present();

    this.formulario.tareaseditar(id, values.nombre, values.detalle, values.encargado, values.fecha, estado, null).then((data) => {
      this.handleError('Tarea Editada');
      loading.dismiss();
      this.dismiss();
    }, err => {
      this.handleError('error al editar tarea, intentelo nuevamente');
      loading.dismiss();

    })
  }

}