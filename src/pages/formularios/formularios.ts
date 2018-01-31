import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, PopoverController, ModalController, ToastController } from 'ionic-angular';
import { UproductivaProvider } from '../../providers/uproductiva/uproductiva';
import { FormulariosProvider } from '../../providers/formularios/formularios';
import { DbProvider } from '../../providers/db/db';
import { observeOn } from 'rxjs/operators/observeOn';
import { retry } from 'rxjs/operator/retry';
import { ImagePage } from './imagenes';
import { NuevanoconformidadPage } from './noconformidad';

import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, DirectoryEntry } from '@ionic-native/file';
import { Geolocation } from '@ionic-native/geolocation';


@IonicPage()
@Component({
  selector: 'page-formularios',
  templateUrl: 'formularios.html',
})
export class FormulariosPage {
  loading: any;
  caso: any;
  items: any;
  respuestas;
  resp: any;
  final: any;
  grupo: any;
  up: any;//nombre
  unidadproductiva;
  respuestasguardades: any;
  grupoidselected: any;
  rutaimg: any;
  tipocuestionario;
  tipo;
  productor;
  datoguardar: any;

  constructor(
    private toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public uproductiva: UproductivaProvider,
    public formulario: FormulariosProvider,
    private camera: Camera,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private file: File,
    private geolocation: Geolocation,
    public db: DbProvider,
    public popoverCtrl: PopoverController) {
    this.caso = navParams.get('caso');
    console.log(this.caso);

  }

  ionViewWillUnload() {//
    console.log('vamos a ver si devuelve');
    console.log(this.caso);
    let preguntasrequeridas = [];


    if (this.caso == 4) {
      let requeridas = 0;
      this.items.forEach(element => {
        if (element.requerido == 1) {
          console.log();
          requeridas = requeridas + 1;
        }
      });
      console.log(requeridas);
      let requeridas2 = 0;
      this.items.forEach(element => {
        if (element.requerido == 1) {
          this.db.verficarrespuestas(this.up, this.grupoidselected, element.codigo, this.tipocuestionario, element.tipo).then(
            tienerespuesta => {
              requeridas2 = requeridas2 + 1;
              if (tienerespuesta) {
              } else {
                preguntasrequeridas.push(element.enunciado);
                console.log(requeridas2, requeridas);
              }
              if (requeridas2 == requeridas) {
                this.avisopreguntaspendientes(preguntasrequeridas, 'Las siguientes preguntas del grupo ' + this.grupo + ' y la unidad ' + this.up + ' deben ser respondidas');
              }

            },()=>{
              requeridas2 = requeridas2 + 1;
            });
        }
      });
    }




    if (this.caso == 3) {
      let gruposporrsponder = [];
      console.log(this.items);
      let requeridas = 0;

      this.items.forEach(element => {
        this.db.preguntasporgruporequeridas(element.idgrupobase).then((pregunta) => {
          if (pregunta) {
            requeridas = requeridas + 1;
            console.log('requeridas', requeridas);
          }
        });
      });
      let requeridas2 = 0;
      this.items.forEach(element => {
        let decide = 0;

        this.db.preguntasporgruporequeridas(element.idgrupobase).then((pregunta) => {
          if (pregunta) {
            pregunta.forEach(preguntaid => {
              return this.db.verficarrespuestas(this.up, element.idgrupobase, preguntaid.codigo, this.tipocuestionario, preguntaid.tipo).then(tienerespuesta => {
                console.log(this.up, element.idgrupobase, preguntaid.codigo, this.tipo, preguntaid.tipo, element);

                console.log(tienerespuesta)
                if (tienerespuesta) {
                } else {
                  if (decide == 0) {
                    requeridas2 = requeridas2 + 1;
                    gruposporrsponder.push(element.nombre);
                    decide = 1;
                    console.log(requeridas2, requeridas);

                    if (requeridas == requeridas2) {
                      this.avisopreguntaspendientes(gruposporrsponder, 'Los siguientes grupos de la unidad ' + this.up + ' tienen preguntas requeridas pendientes');
                    }
                  }
                }
              })
            });
          }
        });
      });

    }
  }

  avisopreguntaspendientes(itemspendientes, msj) {
    if(itemspendientes.length>0){
      let modal = this.popoverCtrl.create(ImagePage, { 'caso': 2, 'pendientes': itemspendientes, 'msj': msj });
      modal.present();
  
    }


    /*     let alert = this.alertCtrl.create({
          title: 'Formulario incompleto',
          message: ,
          buttons: [
            {
              text: 'Ok',
              handler: () => {
                console.log('ok');
              }
            }
          ]
        });
        alert.present(); 
     */
  }


  ionViewDidLoad() {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando informacion...'
    });


    if (this.caso == 1) {//auditoria
      loading.present();
      this.uproductiva.llamaruproductivasap(1002).then((data: any) => {
        this.items = data;
        console.log(this.items);
        loading.dismiss();
      });
      this.uproductiva.llamaruproductivas().then((data) => { console.log(data) })

    } else if (this.caso == 2) {//promotoria
      loading.present();
      this.uproductiva.llamaruproductivasap(1001).then((data: any) => {
        this.items = data;
        console.log(data);
        loading.dismiss();
      });
    } else if (this.caso == 3) {
      loading.present();
      this.unidadproductiva = this.navParams.get('up');
      this.up = this.unidadproductiva.idUnidadProductiva;
      this.tipo = this.navParams.get('tipo');
      let casot = this.navParams.get('tipo');
      this.productor = this.navParams.get('productor');
      return this.formulario.gruposbase(casot).then(gpu => {
        this.items = gpu;
        loading.dismiss();
        return this.items;
      });

    } else if (this.caso == 4) {//promotoria
      loading.present();
      this.productor = this.navParams.get('productor');
      this.tipocuestionario = this.navParams.get('tipo');
      this.tipo = this.tipocuestionario;
      this.grupoidselected = this.navParams.get('grupo');
      this.unidadproductiva = this.navParams.get('up');
      this.up = this.unidadproductiva.idUnidadProductiva;
      this.grupo = this.navParams.get('gruponombre');
      this.rutaimg = this.file.externalDataDirectory + `${this.up}/${this.grupoidselected.toString()}`;
      let fechaentro;
      fechaentro = new Date();

      fechaentro = fechaentro.getFullYear() + '-' + ("0" + (fechaentro.getMonth() + 1)).slice(-2) + '-' + ("0" + fechaentro.getDate()).slice(-2) + ' ' + ("0" + fechaentro.getHours()).slice(-2) + ':' + ("0" + fechaentro.getMinutes()).slice(-2) + ':00';
      this.geolocation.getCurrentPosition().then((resp) => {
        this.datoguardar = fechaentro + ',' + resp.coords.latitude.toString() + ',' + resp.coords.longitude.toString();
        console.log(this.datoguardar);
      }).catch((error) => {
        this.datoguardar = fechaentro + ',' + error.message + ',' + error.message;
        this.handleError('no se pudo acceder a la ubicacion del telefono ' + error.message);
        console.log(this.datoguardar);
      }).then(() => {
      });
      this.formulario.preguntasgrupo(this.grupoidselected).then(preguntasg => {
        this.items = preguntasg;
        if (this.items) {
          let r = [];
          this.items.forEach(element => {
            r.push(element.codigo);
          });
          this.resp = r;
          return this.formulario.respuestasporpreguntas(this.resp, this.up, this.grupoidselected, this.tipocuestionario).then(data => {
            this.resp = data;
            //          console.log(data);
            this.items.forEach(element => {
              if (element.tipo == 3007) {
                console.log(atob(element.encabezado));
                element.encabezado = JSON.parse(atob(element.encabezado));

                this.formulario.preguntasconrespuestastabla(element.codigo).then((data) => {
                  if (data) {
                    data.forEach(pregunta => {
                      return this.formulario.respuestastablas(pregunta.codigorespuesta, this.up, this.grupoidselected, element.codigo, this.tipocuestionario).then((respu) => {
                        pregunta.respuesta = respu;
                      });
                    });
                  }
                  element.preguntas = data;
                  return this.items;
                }, (err) => {
                  console.log(err);

                }).then((data) => {

                });

              }
              let vr: any;
              if (this.resp) {
                this.resp.forEach(element2 => {
                  if (element2.preguntaid == element.codigo) {
                    element.respuestas.push(element2);
                  }
                });
              }
            })
            this.resp = JSON.stringify(this.resp);
          }).
            then(() => {
              this.final = this.items;
              console.log(this.final);

            }).then(() => {
              loading.dismiss();
              return this.final;
            });
        } else {
          loading.dismiss();
          this.handleError('No existen preguntas registradas en este grupo');
        }
      });
    }
    else if (this.caso == 5) {
      this.productor = this.navParams.get('productor');
      loading.present();
      this.unidadproductiva = this.navParams.get('up');
      //      console.log(this.unidadproductiva);
      this.up = this.unidadproductiva.idUnidadProductiva;
      this.tipo = this.navParams.get('tipo');
      console.log(this.up, this.tipo);
      this.formulario.noconformidades(this.up, this.tipo).then((data) => {
        this.items = data;
        console.log('no conformidades', this.items);
      });
      this.formulario.todasnoconformidades().then(ok => {
        console.log('estas son todas', ok);
      })
      //      console.log('no conformidad',this.up, this.tipo);
      loading.dismiss();
    }
  }


  agregarnoconformidad(id) {
    let cas;
    if (id == 0) {
      cas = false;
    } else {
      cas = id;
    }
    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden agregar inconformidades una vez envidadas las respuestas');
    } else {
      let modal = this.modalCtrl.create(NuevanoconformidadPage, { 'up': this.up, 'tipo': this.tipo, 'id': cas, 'productor': this.productor });
      modal.present();
    }
  }


  //nuevas funciones
  guardarfecha(valor, preguntaid, respcodigo, event) {
    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem;
    } else {
      this.formulario.guardar3001(this.up, this.grupoidselected, respcodigo, preguntaid, valor.codigo, valor.valor, event, this.tipocuestionario);
      this.guardarubicacion(this.up, this.datoguardar);
    }
  }
  guardar3003(valor, preguntaid, respcodigo, respuestafinal) {
    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem;
    } else {
      this.formulario.guardar3001(this.up, this.grupoidselected, respcodigo, preguntaid, valor.codigo, valor.valor, respuestafinal, this.tipocuestionario);
      this.guardarubicacion(this.up, this.datoguardar);
    }
  }

  guardar3001(valor, preguntaid, respcodigo) {
    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem;
    } else {
      this.formulario.guardar3001(this.up, this.grupoidselected, respcodigo, preguntaid, valor.codigo, valor.valor, valor.valor, this.tipocuestionario);
      this.guardarubicacion(this.up, this.datoguardar);
    }
  }

  guardar3006(valor, preguntaid, respcodigo, respuestafinal) {
    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem;
    } else {
      this.formulario.guardar3001(this.up, this.grupoidselected, respcodigo, preguntaid, valor.codigo, valor.valor, respuestafinal, this.tipocuestionario);
      this.guardarubicacion(this.up, this.datoguardar);
    }
  }
  guardar3002(valor, preguntaid, respcodigo) {
    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem;
    } else {
      let codigosrespuestas: any = [];
      let valoresrespuesta: any = [];
      valor.forEach(element => {
        codigosrespuestas.push(element.codigo);
        valoresrespuesta.push(element.valor);
      });
      codigosrespuestas = codigosrespuestas.join('_');
      valoresrespuesta = valoresrespuesta.join('_');
      this.formulario.guardar3001(this.up, this.grupoidselected, respcodigo, preguntaid, codigosrespuestas, valoresrespuesta, valoresrespuesta, this.tipocuestionario);
      this.guardarubicacion(this.up, this.datoguardar);
    }
  }

  guardarobservacion(preguntaid, respcodigo, observacion) {
    this.formulario.guardarobservacion(this.up, this.grupoidselected, respcodigo, preguntaid, observacion, this.tipocuestionario);
  }

  mostrargrupos(tipop, upva, productor) {
    if (this.caso == 1) {
      tipop = 1002;
    } else {
      tipop = 1001;
    }
    this.formulario.gruposbase(tipop).then(gps => {
      this.navCtrl.push(FormulariosPage, {
        caso: 3, tipo: tipop, up: upva, productor: productor
      });
    });
  }
  noconformidades(up, tipo) {
    this.navCtrl.push(FormulariosPage, {
      caso: 5, tipo: tipo, up: up, productor: this.productor
    });
  }

  mostrarpreguntas(grupoid, nbre) {
    this.formulario.preguntasgrupo(grupoid).then(preguntasg => {
      this.navCtrl.push(FormulariosPage, {
        caso: 4, grupo: grupoid, up: this.unidadproductiva, gruponombre: nbre, tipo: this.navParams.get('tipo')
      });
    });
  }


  presentConfirm(codigo, respcodigo) {

    let targetPath = this.file.externalDataDirectory;
    let nombrecarpetapadre = 'OC21';// unidad productiva 
    let idgrupo = codigo;

    console.log(this.file.externalCacheDirectory);
    let alert = this.alertCtrl.create({

      title: 'Desea adjuntar una imagen a esta pregunta',
      message: 'Para escoger una foto de la galeria del telefono seleccione la opcion Galeria, si desea tomar una foro escoja camara',
      buttons: [
        {
          text: 'Galeria',
          handler: () => {
            return this.galeria(codigo, respcodigo);
          }
        },
        {
          text: 'Camara',
          handler: () => {
            return this.getPicture(codigo, respcodigo);

          }
        }
      ]
    });
    alert.present();
  }

  getPicture(codigo, respcodigo) {
    let options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.CAMERA,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE
    }
    let targetPath = this.file.externalDataDirectory;
    let nombrecarpetapadre = this.up;// unidad productiva 
    let idgrupo = this.grupoidselected;
    let preguntaid = codigo;


    this.camera.getPicture(options).then(imageData => {
      let loading = this.loadingCtrl.create({
        spinner: 'bubbles',
        content: 'Cargando informacion...'
      });
      loading.present();
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
            this.formulario.guardarimagen(this.up, this.grupoidselected, respcodigo, preguntaid, imageData.replace(this.file.externalCacheDirectory, ""), this.tipocuestionario);
            this.guardarubicacion(this.up, this.datoguardar);
          }, () => { });
      }).then((ok
      ) => {
        this.file.removeFile(this.file.externalCacheDirectory, imageData.replace(this.file.externalCacheDirectory, ""
        )).then((ok) => {
          console.log(JSON.stringify(ok));
        }, (err) => { console.log(JSON.stringify(err)) });
      }).then(() => {
        return this.recargaritem().then(() => { }, () => { });
      }).then(() => {
        loading.dismiss();
      });
      //      console.log(imageData);
    }
    ).catch(error => {
      console.error(JSON.stringify(error));
    });
  }


  galeria(codigo, respcodigo) {
    let targetPath = this.file.externalDataDirectory;
    let nombrecarpetapadre = this.up;// unidad productiva 
    let idgrupo = this.grupoidselected;
    let preguntaid = codigo;

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
          content: 'Cargando informacion...'
        });
        loading.present();

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
          return this.formulario.guardarimagen(this.up, this.grupoidselected, respcodigo, preguntaid, imgname, this.tipocuestionario).then(() => {
            this.guardarubicacion(this.up, this.datoguardar);
          }, () => { });
        }).then(() => {
          return this.recargaritem().then(() => { }, () => { }).then(() => { }, () => { });
        }).then(() => {
          loading.dismiss();
        });
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
  }
  verimagen(link) {
    let popover = this.popoverCtrl.create(ImagePage, { 'caso': 1, urlimg: link });
    popover.present();
  }

  eliminarimagen(codigo, respcodigo) {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando informacion...'
    });
    loading.present();
    let preguntaid = codigo;
    this.formulario.guardarimagen(this.up, this.grupoidselected, respcodigo, preguntaid, '', this.tipocuestionario).then(() => { }, () => { }).then(() => {
      return this.recargaritem().then(() => { }, () => { }).then(() => {
        loading.dismiss();
      });
    });
  }

  recargaritem() {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando informacion...'
    });
    this.productor = this.navParams.get('productor');
    loading.present();
    this.tipocuestionario = this.navParams.get('tipo');
    this.grupoidselected = this.navParams.get('grupo');
    this.unidadproductiva = this.navParams.get('up');
    this.up = this.unidadproductiva.idUnidadProductiva;
    this.grupo = this.navParams.get('gruponombre');
    this.rutaimg = this.file.externalDataDirectory + `${this.up}/${this.grupoidselected.toString()}`;
    return this.formulario.preguntasgrupo(this.grupoidselected).then(preguntasg => {
      this.items = preguntasg;
      let r = [];
      this.items.forEach(element => {
        r.push(element.codigo);
      });
      this.resp = r;
      return this.formulario.respuestasporpreguntas(this.resp, this.up, this.grupoidselected, this.tipocuestionario).then(data => {
        this.resp = data;
        this.items.forEach(element => {
          if (element.tipo == 3007) {
            element.encabezado = JSON.parse(atob(element.encabezado));
            this.formulario.preguntasconrespuestastabla(element.codigo).then((data) => {
              data.forEach(pregunta => {
                return this.formulario.respuestastablas(pregunta.codigorespuesta, this.up, this.grupoidselected, element.codigo, this.tipocuestionario).then((respu) => {
                  pregunta.respuesta = respu;
                });
              });
              element.preguntas = data;
              return this.items;
            }, (err) => {
              console.log(err);
            }).then((data) => {
            });
          }
          let vr: any;
          if (this.resp) {
            this.resp.forEach(element2 => {
              if (element2.preguntaid == element.codigo) {
                element.respuestas.push(element2);
              }
            });
          }

        })
        this.resp = JSON.stringify(this.resp);
      }).
        then(() => {
          this.final = this.items;
          loading.dismiss();
          console.log('final', this.final);
          return this.final;
        });
    });

  }

  guardarfechapadre(valor, preguntapadre, preguntaid, fecha) {
    //    console.log(this.unidadproductiva,valor, preguntapadre, preguntaid, fecha);

    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem;
    } else {
      if (fecha == "") {
      } else {
        this.formulario.guardarrespuestatabla(this.up, this.grupoidselected, valor.codigorespuestapadre, preguntaid, preguntapadre, valor.codigo, valor.valor, fecha, this.tipocuestionario);
      }
    }
  }
  guardarpadre(valor, preguntapadre, preguntaid, event) {

    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem;
    } else {

      if (event) {
        this.formulario.guardarrespuestatabla(this.up, this.grupoidselected, valor.codigorespuestapadre, preguntaid, preguntapadre, valor.codigo, valor.valor, event, this.tipocuestionario);
      } else {
        if (event === false) {
          this.formulario.guardarrespuestatabla(this.up, this.grupoidselected, valor.codigorespuestapadre, preguntaid, preguntapadre, valor.codigo, valor.valor, event, this.tipocuestionario);

        }

      }
    }
  }
  guardarobservacionpadre($event, preguntapadre, preguntaid) {
    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem;
    } else {
      this.formulario.guardarrespuestatabla(this.up, this.grupoidselected, null, preguntaid, preguntapadre, '', '', $event.target.value, this.tipocuestionario);
    }
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
  guardarubicacion(unidad, valor) {
    if (valor == null) {
      let fechaentro: any = new Date();
      fechaentro = fechaentro.getFullYear() + '-' + ("0" + (fechaentro.getMonth() + 1)).slice(-2) + '-' + ("0" + fechaentro.getDate()).slice(-2) + ' ' + fechaentro.getHours() + ':' + fechaentro.getMinutes() + ':00';
      this.datoguardar = fechaentro + ',error,error';
      valor = this.datoguardar;
    }
    let c;
    if (this.tipocuestionario == 1002) {
      c = 2;
    } else {
      c = 1;
    }
    this.formulario.guardarubicacion(unidad, valor, c);
  }


  comprobarunidades(tipo, unidad) {
    let formulario;
    let enviar = [];


    /*               grupos.forEach(grupoi => {
                    this.db.preguntasporgruporequeridas(grupoi.idgrupobase).then((pregunta) => {
                      if (pregunta) {
                        pregunta.forEach(preguntaid => {
                          return this.db.verficarrespuestas(up.idUnidadProductiva, grupoi.idgrupobase, preguntaid.codigo, tipo, preguntaid.tipo).then(tienerespuesta => {
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
     */



  }




}
