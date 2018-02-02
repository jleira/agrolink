import { Component } from '@angular/core';
import { ViewController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { DbProvider } from '../../providers/db/db';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, DirectoryEntry } from '@ionic-native/file';

@Component({

  templateUrl: 'imagenes.html'

})
export class ImagePage {
  img: any;
  caso;
  items;
  msj;
  unidad;
  constructor(
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private camera: Camera,
    private file: File,
    public db: DbProvider,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController
  ) {
    this.caso = navParams.get('caso');
    if (this.caso == 1) {
      this.img = navParams.get('urlimg');
    } else if (this.caso == 2) {
      this.items = navParams.get('pendientes');
      this.msj = navParams.get('msj');
    } else if (this.caso == 3) {
      this.unidad = navParams.get('unidad');
    }

  }

  escogerimagen() {

    let alert = this.alertCtrl.create({
      title: 'Desea actualizar el mapa',
      message: 'Para escoger una foto de la galeria del telefono seleccione la opcion Galeria, si desea tomar una foto escoja camara',
      buttons: [
        {
          text: 'Galeria',
          handler: () => {
            return this.galeria();
          }
        },
        {
          text: 'Camara',
          handler: () => {
            return this.getPicture();

          }
        }
      ]
    });
    alert.present();
  }


  dismiss() {
    this.viewCtrl.dismiss();
  }


  getPicture() {
    let options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then(imageData => {
      let loading = this.loadingCtrl.create({
        spinner: 'bubbles',
        content: 'Actualizando mapa...'
      });
      loading.present();

      this.unidad.mapa = imageData;
      this.db.agregarmapa(this.unidad.idUnidadProductiva, imageData).then((data) => {
        this.handlermsj('Mapa Actualizado');
        loading.dismiss();
      }, err => {
        this.handlermsj('Error al actualizar mapa');
        this.unidad.mapa = null;
        loading.dismiss();
      })


    }).catch(error => {
      this.handlermsj('error al guardar mapa');
    });

  }


  galeria() {

    let options: CameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: true,
      encodingType: this.camera.EncodingType.PNG
    }
    this.camera.getPicture(options)
      .then(imageData => {
        let loading = this.loadingCtrl.create({
          spinner: 'bubbles',
          content: 'Actualizando mapa...'
        });
        loading.present();

        this.unidad.mapa = imageData;
        this.db.agregarmapa(this.unidad.idUnidadProductiva, imageData).then((data) => {
          this.handlermsj('Mapa Actualizado');
          loading.dismiss();
        }, err => {
          this.handlermsj('Error al actualizar mapa');
          this.unidad.mapa = null;
          loading.dismiss();
        })

      }).catch(error => {
        this.handlermsj('error al guardar mapa');
      });
  }


  handlermsj(error: string) {
    let message: string;
    message = error;
    const toast = this.toastCtrl.create({
      message,
      duration: 5000,
      position: 'bottom'
    });
    toast.present();
  }


}