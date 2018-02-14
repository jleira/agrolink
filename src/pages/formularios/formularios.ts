import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, PopoverController, ModalController, ToastController } from 'ionic-angular';
import { UproductivaProvider } from '../../providers/uproductiva/uproductiva';
import { FormulariosProvider } from '../../providers/formularios/formularios';

import { observeOn } from 'rxjs/operators/observeOn';
import { retry } from 'rxjs/operator/retry';
import { ImagePage } from './imagenes';
import { NuevanoconformidadPage } from './noconformidad';
import { DbProvider } from '../../providers/db/db';
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
  datofecha: any;
  datolongitud:any;
  datolatitud:any;


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
 //     console.log(this.caso);
//      this.db.cambiarestado('OPTS1', 1 , 1001).then(()=>{console.log('echo ')});
  }




  ionViewWillUnload() {

    let preguntasrequeridas = [];


    if (this.caso == 4) {
      let requeridas = 0;
      let preguntasg = this.items;
      if (this.items) {
        preguntasg.forEach(element => {
          if (element.requerido == 1) {
            requeridas = requeridas + 1;
          }
        });
        let requeridas2 = 0;
        this.items.forEach(element => {
          if (element.requerido == 1) {
            this.db.verficarrespuestas(this.up, this.grupoidselected, element.codigo, this.tipocuestionario, element.tipo).then(
              tienerespuesta => {
                requeridas2 = requeridas2 + 1;
                if (tienerespuesta) {
                } else {
                  preguntasrequeridas.push(element.enunciado);
                }
                if (requeridas2 == requeridas) {
                  this.avisopreguntaspendientes(preguntasrequeridas, 'Las siguientes preguntas del grupo ' + this.grupo + ' y la unidad ' + this.up + ' deben ser respondidas');
                }

              }, () => {
                requeridas2 = requeridas2 + 1;
              });
          }
        });
      }
    }

    if (this.caso == 3) {
      let gruposporrsponder = [];
      let requeridas = 0;
      if (this.items) {
        this.items.forEach(element => {
          let decide1 = 0;

          this.db.preguntasporgruporequeridas(element.idgrupobase).then((pregunta) => {
            if (pregunta) {
              pregunta.forEach(preguntaid => {
                this.db.verficarrespuestas(this.up, element.idgrupobase, preguntaid.codigo, this.tipo, preguntaid.tipo).then(tienerespuestaa => {
                  if (tienerespuestaa) {
                  } else {
                    if (decide1 == 0) {
                      requeridas = requeridas + 1;
                      decide1 = 1;
                    }
                  }
                })
              })
            }
          });
        });
        let requeridas2 = 0;
        this.items.forEach(element => {
          let decide = 0;
          this.db.preguntasporgruporequeridas(element.idgrupobase).then((pregunta) => {
            if (pregunta) {
              pregunta.forEach(preguntaid => {
                this.db.verficarrespuestas(this.up, element.idgrupobase, preguntaid.codigo, this.tipo, preguntaid.tipo).then(tienerespuestaa => {
                  if (tienerespuestaa) {
                  } else {
                    if (decide == 0) {
                      requeridas2 = requeridas2 + 1;
                      gruposporrsponder.push(element.nombre);
                      decide = 1;
                      if (requeridas === requeridas2) {
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
  }

  avisopreguntaspendientes(itemspendientes, msj) {
    if (itemspendientes.length > 0) {
      let modal = this.popoverCtrl.create(ImagePage, { 'caso': 2, 'pendientes': itemspendientes, 'msj': msj });
      modal.present();
    }
  }


  ionViewDidEnter() {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando informacion...'
    });


    if (this.caso == 1) {//auditoria
      loading.present();
      return this.uproductiva.llamaruproductivasap(1002).then((data: any) => {
        data.forEach(element => {
          element.porcentaje = 0;
          let cantidaddepreguntas = 0;
          let parcial = 0;
          return this.formulario.gruposbase(1002).then((nuevop: any) => {
            if (nuevop) {
              nuevop.forEach(grupospn => {
                this.db.preguntasporgruporequeridas(grupospn.idgrupobase).then((pregunta) => {
                  if (pregunta) {
                    cantidaddepreguntas = cantidaddepreguntas + pregunta.length;
                    pregunta.forEach(preguntaid => {
                      this.db.verficarrespuestas(element.idUnidadProductiva, grupospn.idgrupobase, preguntaid.codigo, 1002, preguntaid.tipo).then(tienerespuestaa => {
                        if (tienerespuestaa) {
                          parcial = parcial + 1;
                          element.porcentaje = ((parcial / cantidaddepreguntas) * 100).toFixed(1);
                        } else {
                          parcial = parcial;
                          element.porcentaje = ((parcial / cantidaddepreguntas) * 100).toFixed(1);
                        }
                      }, err => {
                      })
                    })
                  } else {

                  };
                }, err => {

                });
              });
            } else {

            }
          }, err => {

          })
        });



        this.items = data;
        loading.dismiss();
        return this.items;
      });

    } else if (this.caso == 2) {//promotoria
      loading.present();
      return this.uproductiva.llamaruproductivasap(1001).then((data: any) => {
        data.forEach(element => {
          element.porcentaje = 0;
          let cantidaddepreguntas = 0;
          let parcial = 0;
          return this.formulario.gruposbase(1001).then((nuevop: any) => {
            if (nuevop) {
              nuevop.forEach(grupospn => {
                this.db.preguntasporgruporequeridas(grupospn.idgrupobase).then((pregunta) => {
                  if (pregunta) {
                    cantidaddepreguntas = cantidaddepreguntas + pregunta.length;
                    pregunta.forEach(preguntaid => {
                      this.db.verficarrespuestas(element.idUnidadProductiva, grupospn.idgrupobase, preguntaid.codigo, 1001, preguntaid.tipo).then(tienerespuestaa => {
                        if (tienerespuestaa) {
                          parcial = parcial + 1;
                          element.porcentaje = ((parcial / cantidaddepreguntas) * 100).toFixed(1);
                        } else {
                          parcial = parcial;
                          element.porcentaje = ((parcial / cantidaddepreguntas) * 100).toFixed(1);
                        }
                      }, err => {
                      })
                    })
                  } else {
                  };
                }, err => { });
              });
            } else {
            }
          }, err => {
          })
        });



        this.items = data;
        loading.dismiss();
        return this.items;
      });
    } else if (this.caso == 3) {
      loading.present();
      this.unidadproductiva = this.navParams.get('up');
      this.up = this.unidadproductiva.idUnidadProductiva;
      this.tipo = this.navParams.get('tipo');
      let casot = this.navParams.get('tipo');
      this.productor = this.navParams.get('productor');
      return this.formulario.gruposbase(casot).then(gpu => {
        if (gpu) {
          gpu.forEach(gruposp => {
            gruposp.porcentaje = 0;
            return this.db.preguntasporgruporequeridas(gruposp.idgrupobase).then((pregunta) => {
              if (pregunta) {
                let total = pregunta.length;
                let parcial = 0;
                pregunta.forEach(preguntaid => {
                  this.db.verficarrespuestas(this.up, gruposp.idgrupobase, preguntaid.codigo, this.tipo, preguntaid.tipo).then(tienerespuestaa => {
                    if (tienerespuestaa) {
                      parcial = parcial + 1;
                      gruposp.porcentaje = ((parcial / total) * 100).toFixed(1);
                    } else {
                      parcial = parcial;
                      gruposp.porcentaje = ((parcial / total) * 100).toFixed(1);
                    }
                  })
                })
              } else {
                return this.formulario.preguntasgrupo(gruposp.idgrupobase, this.tipo).then((data) => {
                  if (data) {
                    let total = data.length;
                    let parcial = 0;
                    data.forEach(preguntaid2 => {
                      this.db.verficarrespuestas(this.up, gruposp.idgrupobase, preguntaid2.codigo, this.tipo, preguntaid2.tipo).then(tienerespuestaa2 => {
                        if (tienerespuestaa2) {
                          parcial = parcial + 1;
                          gruposp.porcentaje = ((parcial / total) * 100).toFixed(1);
                        } else {
                          parcial = parcial;
                          gruposp.porcentaje = ((parcial / total) * 100).toFixed(1);
                        }
                      })
                    })

                  }
                })

              }
            });
          });
          this.items = gpu;
        } else {
          this.items = gpu;
        }
        loading.dismiss();
        this.items;
      }, err => {
      })

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
      this.datofecha=fechaentro;

       this.geolocation.getCurrentPosition().then((resp) => {
       this.datolatitud=resp.coords.latitude.toString();
       this.datolongitud=resp.coords.longitude.toString();
       this.handleError('ESTA ES LA UNICACION DEL TELEFONO, '+ this.datolatitud +' '+this.datolongitud);
      }).catch((error) => {
        this.datofecha=fechaentro;
        this.datolatitud=null;
        this.datolongitud=null;
        this.handleError('no se pudo acceder a la ubicacion del telefono ' + error.message);
      }).then(() => {
      });
      this.formulario.preguntasgrupo2(this.up, this.grupoidselected, this.tipo);
      this.formulario.preguntasgrupo(this.grupoidselected, this.tipo).then(preguntasg => {
        console.log(preguntasg);
        this.items = preguntasg;
        if (this.items) {
          let r = [];
          this.items.forEach(element => {
            if(element.codigorespuesta!==""){
              r.push(element.codigorespuesta);
            }
          });
          this.resp = r;
          console.log(this.resp);
          if(this.resp.length>0){
            return this.formulario.respuestasporpreguntas(this.resp, this.up, this.grupoidselected, this.tipocuestionario).then(data => {
              this.resp = data;
              this.items.forEach(element => {
                if (element.tipo == 3007) {
                  element.encabezado = JSON.parse(atob(element.encabezado));
                  this.formulario.preguntasconrespuestastabla(element.codigo).then((data) => {
                    if (data) {
                      data.forEach(pregunta => {
                        return this.formulario.respuestastablas(pregunta.codigorespuesta, this.up, this.grupoidselected, element.codigo, this.tipocuestionario, pregunta.preguntaid).then((respu) => {
                          pregunta.respuesta = respu;
                        });
                      });
                    }
                    element.preguntas = data;
                    return this.items;
                  }, (err) => {
                  })
                }
                let vr: any;
                if (this.resp) {
                  this.resp.forEach(element2 => {
                    if (element2.codigorespuestapadre == element.codigorespuesta) {
                      element.respuestas.push(element2);
                    }
                  });
                }
              })
              this.resp = JSON.stringify(this.resp);
            }).
              then(() => {
                this.final = this.items;
                console.log('final',this.final);
                loading.dismiss();
                return this.final;
              }).catch(()=>{
                loading.dismiss();              
              });
          }else{
            this.items.forEach(element => {
              if (element.tipo == 3007) {
                element.encabezado = JSON.parse(atob(element.encabezado));
                this.formulario.preguntasconrespuestastabla(element.codigo).then((data) => {
                  console.log('datos de preguntas',data);
                  if (data) {
                    data.forEach(pregunta => {
                      return this.formulario.respuestastablas(pregunta.codigorespuesta, this.up, this.grupoidselected, element.codigo, this.tipocuestionario,pregunta.preguntaid).then((respu) => {
                        pregunta.respuesta = respu;
                      },err=>{});
                    });
                  }//codigorespuestadelapregunta, unidadp, grupo, preguntaid(hijadela tabla),tipodeformulario
                  element.preguntas = data;
                  this.final=this.items;
                  loading.dismiss();
                  return this.final;
                }, (err) => {
                  loading.dismiss();
                })
              }
            })
          } 

        } else {
          loading.dismiss();
          this.handleError('No existen preguntas registradas en este grupo');
        }
      },err=>{

      }).catch(()=>{}); 
    }
    else if (this.caso == 5) {
      this.productor = this.navParams.get('productor');
      loading.present();
      this.unidadproductiva = this.navParams.get('up');

      this.up = this.unidadproductiva.idUnidadProductiva;
      this.tipo = this.navParams.get('tipo');
      this.formulario.noconformidades(this.up, this.tipo).then((data) => {
        this.items = data;
      });
      this.formulario.todasnoconformidades().then(ok => {
      })
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
      let modal = this.navCtrl.push(NuevanoconformidadPage, { 'up': this.up, 'tipo': this.tipo, 'id': cas, 'productor': this.productor });
    }
  }


  //nuevas funciones
  guardarfecha(valor, preguntaid, respcodigo, event) {
    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem();
    } else {
      this.formulario.guardar3001(this.up, this.grupoidselected, respcodigo, preguntaid, valor.codigo, valor.valor, event, this.tipocuestionario);
      this.guardarubicacion(this.up, this.datofecha, this.datolatitud, this.datolongitud);
    }
  }
  guardar3003(valor, preguntaid, respcodigo, respuestafinal) {
    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem();
    } else {
 
      this.formulario.guardar3001(this.up, this.grupoidselected, respcodigo, preguntaid, valor.codigo, valor.valor, respuestafinal, this.tipocuestionario);
      this.guardarubicacion(this.up, this.datofecha, this.datolatitud, this.datolongitud);    }
  }

  guardar3001(valor, preguntaid, respcodigo) {
    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem();
    } else {
      console.log(valor, preguntaid, respcodigo);
      this.formulario.guardar3001(this.up, this.grupoidselected, respcodigo, preguntaid, valor.codigo, valor.valor, true, this.tipocuestionario);
      this.guardarubicacion(this.up, this.datofecha, this.datolatitud, this.datolongitud);
    }
  }

  guardar3006(valor, preguntaid, respcodigo, respuestafinal) {
    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem;
    } else {
      this.formulario.guardar3001(this.up, this.grupoidselected, respcodigo, preguntaid, valor.codigo, valor.valor, respuestafinal, this.tipocuestionario);
      this.guardarubicacion(this.up, this.datofecha, this.datolatitud, this.datolongitud);
    }
  }
  guardar3002(valor, preguntaid, respcodigo) {
    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem;
    } else {
      console.log(valor, preguntaid, respcodigo);
      let codigosrespuestas: any = [];
      let valoresrespuesta: any = [];
      valor.forEach(element => {
        codigosrespuestas.push(element.codigo);
        valoresrespuesta.push(element.valor);
      });
      codigosrespuestas = codigosrespuestas.join('_');
      valoresrespuesta = valoresrespuesta.join('_');
      this.formulario.guardar3001(this.up, this.grupoidselected, respcodigo, preguntaid, codigosrespuestas, valoresrespuesta, true, this.tipocuestionario);
      this.guardarubicacion(this.up, this.datofecha, this.datolatitud, this.datolongitud);
    }
  }

  guardarobservacion(preguntaid, respcodigo, observacion) {
    this.formulario.guardarobservacion(this.up, this.grupoidselected, respcodigo, preguntaid, observacion, this.tipocuestionario);
    this.guardarubicacion(this.up, this.datofecha, this.datolatitud, this.datolongitud);
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
      this.navCtrl.push(FormulariosPage, {
        caso: 4, grupo: grupoid, up: this.unidadproductiva, gruponombre: nbre, tipo: this.navParams.get('tipo')
    });
  }


  presentConfirm(codigo, respcodigo) {

    let targetPath = this.file.externalDataDirectory;
    let idgrupo = codigo;

    let alert = this.alertCtrl.create({

      title: 'Desea adjuntar una imagen a esta pregunta',
      message: 'Para escoger una foto de la galeria del telefono seleccione la opcion Galeria, si desea tomar una foto escoja camara',
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
            this.guardarubicacion(this.up, this.datofecha, this.datolatitud, this.datolongitud);
          }, () => { });
      }).then((ok
      ) => {
        this.file.removeFile(this.file.externalCacheDirectory, imageData.replace(this.file.externalCacheDirectory, ""
        )).then((ok) => {

        }, (err) => {

        });
      }).then(() => {
        return this.recargaritem().then(() => { }, () => { });
      }).then(() => {
        loading.dismiss();
      });
    }
    ).catch(error => {
     
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
            this.guardarubicacion(this.up, this.datofecha, this.datolatitud, this.datolongitud);
          }, () => { });
        }).then(() => {
          return this.recargaritem().then(() => { }, () => { }).then(() => { }, () => { });
        }).then(() => {
          loading.dismiss();
        });
      }).catch(error => {
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
     this.datofecha=fechaentro;
     this.datolatitud=resp.coords.latitude.toString();
     this.datolongitud=resp.coords.longitude.toString();
    }).catch((error) => {
      this.datofecha=fechaentro;
      this.datolatitud=null;
      this.datolongitud=null;
      this.handleError('no se pudo acceder a la ubicacion del telefono ' + error.message);
    }).then(() => {
    });
    return this.formulario.preguntasgrupo(this.grupoidselected, this.tipo).then(preguntasg => {
      console.log(preguntasg);
      this.items = preguntasg;
      if (this.items) {
        let r = [];
        this.items.forEach(element => {
          if(element.codigorespuesta!==""){
            r.push(element.codigorespuesta);
          }
        });
        this.resp = r;
        console.log(this.resp);
        if(this.resp.length>0){
          return this.formulario.respuestasporpreguntas(this.resp, this.up, this.grupoidselected, this.tipocuestionario).then(data => {
            this.resp = data;
            this.items.forEach(element => {
              if (element.tipo == 3007) {
                element.encabezado = JSON.parse(atob(element.encabezado));
                this.formulario.preguntasconrespuestastabla(element.codigo).then((data) => {
                  if (data) {
                    data.forEach(pregunta => {
                      return this.formulario.respuestastablas(pregunta.codigorespuesta, this.up, this.grupoidselected, element.codigo, this.tipocuestionario, pregunta.preguntaid).then((respu) => {
                        pregunta.respuesta = respu;
                      });
                    });
                  }
                  element.preguntas = data;
                  return this.items;
                }, (err) => {
                })
              }
              let vr: any;
              if (this.resp) {
                this.resp.forEach(element2 => {
                  if (element2.codigorespuestapadre == element.codigorespuesta) {
                    element.respuestas.push(element2);
                  }
                });
              }
            })
            this.resp = JSON.stringify(this.resp);
          }).
            then(() => {
              this.final = this.items;
              console.log('final',this.final);
              loading.dismiss();
              return this.final;
            }).catch(()=>{
              loading.dismiss();              
            });
        }else{
          this.items.forEach(element => {
            if (element.tipo == 3007) {
              element.encabezado = JSON.parse(atob(element.encabezado));
              this.formulario.preguntasconrespuestastabla(element.codigo).then((data) => {
                console.log('datos de preguntas',data);
                if (data) {
                  data.forEach(pregunta => {
                    return this.formulario.respuestastablas(pregunta.codigorespuesta, this.up, this.grupoidselected, element.codigo, this.tipocuestionario,pregunta.preguntaid).then((respu) => {
                      pregunta.respuesta = respu;
                    },err=>{});
                  });
                }//codigorespuestadelapregunta, unidadp, grupo, preguntaid(hijadela tabla),tipodeformulario
                element.preguntas = data;
                this.final=this.items;
                loading.dismiss();
                return this.final;
              }, (err) => {
                loading.dismiss();
              })
            }
          })
        } 

      } else {
        loading.dismiss();
        this.handleError('No existen preguntas registradas en este grupo');
      }
    },err=>{

    }).catch(()=>{}); 
  }

  guardarfechapadre(valor, preguntapadre, preguntaid, fecha) { 

    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem();
    } else {
      if (fecha == "") {
      } else {
        this.formulario.guardarrespuestatabla(this.up, this.grupoidselected, valor.codigorespuesta, preguntaid, preguntapadre, valor.codigo, valor.valor, fecha, this.tipocuestionario);
        this.guardarubicacion(this.up, this.datofecha, this.datolatitud, this.datolongitud);
      }
    }
  }
  guardarpadre(valor, preguntapadre, preguntaid, event) {
console.log(valor, preguntapadre, preguntaid, event);
    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem();
    } else {

      if (event) {
        this.formulario.guardarrespuestatabla(this.up, this.grupoidselected, valor.codigorespuesta, preguntaid, preguntapadre, valor.codigo, valor.valor, event, this.tipocuestionario);
        this.guardarubicacion(this.up, this.datofecha, this.datolatitud, this.datolongitud);
      } else {
        if (event === false) {
          this.formulario.guardarrespuestatabla(this.up, this.grupoidselected, valor.codigorespuesta, preguntaid, preguntapadre, valor.codigo, valor.valor, event, this.tipocuestionario);

        }
      }
    }
  }
  guardarobservacionpadre($event, preguntapadre, preguntaid) {
    if (this.unidadproductiva.terminado == 2) {
      this.handleError('No se pueden editar las respuestas una vez envidas');
      this.recargaritem();
    } else {
      this.formulario.guardarrespuestatabla(this.up, this.grupoidselected, null, preguntaid, preguntapadre, '', '', $event.target.value, this.tipocuestionario);
      this.guardarubicacion(this.up, this.datofecha, this.datolatitud, this.datolongitud);
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
  guardarubicacion(unidad, datofecha, latitud, longitud ) {
    
    let c;
    if (this.tipocuestionario == 1002) {
      c = 2;
    } else {
      c = 1;
    }
    console.log('ubicacion',unidad, datofecha, latitud, longitud);
    this.formulario.guardarubicacion(unidad, datofecha, latitud, longitud, this.tipocuestionario);
  }


  comprobarunidades(tipo, unidad) {
    let formulario;
    let enviar = [];
  }

  abrirmapa(unidadproductiva){
    let modal = this.navCtrl.push(ImagePage, { 'caso': 3, 'unidad': unidadproductiva });
  }




}
