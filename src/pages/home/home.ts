import { Component } from '@angular/core';
import { NavController, ToastController,LoadingController } from 'ionic-angular';
import {Storage} from "@ionic/storage";
import { Nav, Platform, ModalController } from 'ionic-angular';
import { UnidadproductivaPage } from '../unidadproductiva/unidadproductiva';
import { CasoespecialPage } from '../casoespecial/casoespecial';
import { FormulariosPage }  from '../formularios/formularios';
import {  EnviardatosPage } from './sinc';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, DirectoryEntry } from '@ionic-native/file';
import { FormulariosProvider } from '../../providers/formularios/formularios';
import { audit } from 'rxjs/operators/audit';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  user: string;
  rol: string;
  message: string;
  paises:any;
  mensajes;
  productor:any;
  auditor:boolean;
  promotor:boolean;
  constructor(
    public formulario: FormulariosProvider,
    public modalCtrl: ModalController,
    public navCtrl: NavController, 
    private readonly storage: Storage,
    private camera: Camera,
    private file: File,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,     
    
  ) {
    this.auditor=false;
    this.promotor=false;
    this.storage.get('nombre').then( decoded =>
      {
          this.user=decoded;
      }
    );
    this.storage.get('roll').then( roll =>
      {
          this.rol=roll;
          if(this.rol){
            if(this.rol.indexOf("Auditor")>-1){
              this.auditor=true;
            }
            if(this.rol.indexOf("Promotor")>-1){
              this.promotor=true;      
            }      
          }

      }
    );
  


  }

 ionViewWillEnter() {

}

abririmagen(ruta){
  console.log(ruta);
}

  openPage(caso) {
    if (caso==1){
      this.navCtrl.push(FormulariosPage,{caso:1});
    }else if (caso==2){
      this.navCtrl.push(FormulariosPage,{caso:2});
    } else if (caso==3) {
      this.navCtrl.setRoot(UnidadproductivaPage);
    }else if (caso==4) {
      this.agregarnoconformidad();
  }

  }
  agregarnoconformidad(){
    let modal = this.modalCtrl.create(EnviardatosPage,{'up': 1, 'tipo':2});
    modal.present();

  }
  casoespecial(){
    this.navCtrl.push(CasoespecialPage,{caso:1});
  }

/*   getPicture() {
    this.mensajes="";
    let options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.CAMERA,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE
    }
    let targetPath = this.file.externalDataDirectory;
    let nombrecarpetapadre = 'UNIDAD1';// unidad productiva 
    let idgrupo = '1';
    let preguntaid = 1;


    this.camera.getPicture(options).then(imageData => {

      return this.file.createDir(targetPath, nombrecarpetapadre, false).then(() => {
      }, () => {
      }).then(() => {
        return this.file.createDir(targetPath + `/${nombrecarpetapadre}`, idgrupo.toString(), false).then(() => {
        }, () => { });
      }).then(() => {
        return this.file.copyFile(
          this.file.externalCacheDirectory, imageData.replace(this.file.externalCacheDirectory, ""),
          targetPath + `/${nombrecarpetapadre}/${idgrupo.toString()}`,
          imageData.replace(this.file.externalCacheDirectory, "")).then(() => {
            this.handleError('imagen ruta: '+targetPath + `/${nombrecarpetapadre}/${idgrupo.toString()}`);
              this.formulario.enviarfotoprueba(targetPath + `${nombrecarpetapadre}/${idgrupo.toString()}`,imageData.replace(this.file.externalCacheDirectory, "")).then((data)=>{
                this.mensajes=data
              },(err)=>{
                this.mensajes=err
              });
                      }, () => { });
      }).then((ok
      ) => {
        this.file.removeFile(this.file.externalCacheDirectory, imageData.replace(this.file.externalCacheDirectory, ""
        )).then((ok) => {
          console.log(JSON.stringify(ok));
        }, (err) => { console.log(JSON.stringify(err)) });
      })
    }
    ).catch(error => {
      console.error(JSON.stringify(error));
    });
  }

  galeria() {
    this.mensajes="";
    
    let targetPath = this.file.externalDataDirectory;
    let nombrecarpetapadre = 'Unidad2';// unidad productiva 
    let idgrupo = '2';
    let preguntaid = '2';

    let options: CameraOptions = {
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: true,
      encodingType: this.camera.EncodingType.PNG
    }
    this.camera.getPicture(options)
      .then(imageData => {
        let image = "data:image/png;base64," + imageData;
        let block = image.split(";");
        let contentType = block[0].split(":")[1];
        let realData = block[1].split(",")[1];
        let blob = this.b64toBlob(realData, contentType, 512);
        let imgname = Date.now().toString() + '.png';
        
        return this.file.createDir(targetPath, nombrecarpetapadre, false).then(() => { }, () => { }).then(() => {
          return this.file.createDir(targetPath + `/${nombrecarpetapadre}`, idgrupo.toString(), false).then(() => {
          }, () => { });
        }).then(() => {
          return this.file.writeFile(targetPath + `${nombrecarpetapadre}/${idgrupo.toString()}/`, imgname, blob).then((ok) => { }, (err) => { });
        }).then(() => {
          this.formulario.enviarfotoprueba(targetPath + `${nombrecarpetapadre}/${idgrupo.toString()}`,imgname).then((data)=>{
            this.mensajes=data
          },(err)=>{
            this.mensajes=err
          });
        })
      }).catch(error => {
        console.error('error', error);
      });
  }

  b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  } */

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

}
