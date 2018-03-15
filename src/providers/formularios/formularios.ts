import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

import { JwtHelper, AuthHttp, AuthConfig } from "angular2-jwt";
import { SERVER_URL } from "../../config";
import { Storage } from "@ionic/storage";
import { DbProvider } from '../db/db';
import { ToastController, LoadingController } from 'ionic-angular';
import { File, DirectoryEntry } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';


@Injectable()
export class FormulariosProvider {
  form: any;
  grupos: any;
  items: any;
  rutaimg;
  fileTransfer: FileTransferObject = this.transfer.create();
  constructor(
    public http: Http, jwtHelper: JwtHelper,
    private readonly authHttp: AuthHttp,
    private readonly storage: Storage,
    public database: DbProvider,
    private file: File,
    private transfer: FileTransfer,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,

  ) {

  }
  formularioid(caso) {
    return this.database.formularioid(caso).then((data: any) => {
      return this.items = data;
    });
  }
  gruposbase(caso) {
    return this.database.formularioid(caso).then((data: any) => {
      return this.database.gruposbyid(data).then(grupodb => {
        this.items = grupodb;
        return this.items;
      });
    });
  }
  preguntasgrupo(grupo, tipo) {
    return this.database.preguntasporgrupo(grupo, tipo).then((data: any) => {
      this.items = data;

      return this.items;
    });
  }


  preguntasgrupo2(unidad, grupo, tipo) {
    return this.database.preguntasporgrupo(grupo, tipo).then((data: any) => {
      data.forEach(preguntas => {
        this.database.respuestasporpreguntaf(preguntas.codigorespuesta).then((respuestasdisponibles: any) => {
          respuestasdisponibles.forEach(posiblerespuesta => {
            this.database.respuestasguardadasporpregunta(unidad, grupo, tipo, preguntas.codigo).then((dataguardada: any) => {
              if (dataguardada.length) {                
                posiblerespuesta.respuesta=false;

              }else{
                posiblerespuesta.observacion = dataguardada.observacion;
                if (posiblerespuesta.tipo == 210001) {
                  posiblerespuesta.respuesta = dataguardada.valorseleccionado;
                  posiblerespuesta.ruta = dataguardada.ruta;
                } else if (posiblerespuesta.tipo == 210003) {
                  posiblerespuesta.respuesta = dataguardada.valorseleccionado;
                  posiblerespuesta.ruta = dataguardada.ruta;
                } else if (posiblerespuesta.tipo == 210002) {
                  posiblerespuesta.ruta = dataguardada.ruta;
                  posiblerespuesta.respuesta = parseInt(dataguardada.valorseleccionado);
                } else if (posiblerespuesta.tipo == 210004) {

                  posiblerespuesta.ruta = dataguardada.ruta;
                  let arrayvalores;
                  if (dataguardada.codigorespuestaseleccionada) {
                    arrayvalores = dataguardada.codigorespuestaseleccionada.split('_');
                    if (arrayvalores.indexOf(posiblerespuesta.codigo.toString()) != -1) {
                      posiblerespuesta.respuesta = true;
                    } else {
                      posiblerespuesta.respuesta = null;
                    }
                  } else {
                    posiblerespuesta.respuesta = null;
                  };

                } else {
                  posiblerespuesta.ruta = dataguardada.ruta;
                }

              }
            })
          });
          preguntas.respuestas=respuestasdisponibles;
        })

      });

    });
  }







  respuestasporpreguntas(codigosrespuesta, up, grupo, tipo) {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando informacion...'
    });
    loading.present();
    return this.database.respuestasporpregunta(codigosrespuesta).then(data => {
      this.items = data;
      return this.items;
    }, err => {
      loading.dismiss();
      this.handleError('Error cargando información, inténtelo de nuevo');
    }).then(() => {
      return this.database.respuestasguardadas(up, grupo, tipo).then((dt) => {
        let da: any;
        da = dt;
        if (this.items) {
          this.items.forEach(respuestas => {
            if (da != false) {
              da.forEach(valores => {
                if (respuestas.codigorespuestapadre == valores.codigorespuestapadre) {
                  respuestas.observacion = valores.observacion;
                  if (respuestas.tipo == 210001) {
                    respuestas.respuesta = valores.valorseleccionado;
                    respuestas.ruta = valores.ruta;
                  } else if (respuestas.tipo == 210003) {
                    respuestas.respuesta = valores.valorseleccionado;
                    respuestas.ruta = valores.ruta;
                  } else if (respuestas.tipo == 210002) {
                    respuestas.ruta = valores.ruta;
                    respuestas.respuesta = parseInt(valores.valorseleccionado);
                  } else if (respuestas.tipo == 210004) {
                    respuestas.ruta = valores.ruta;
                    let arrayvalores;
                    if (valores.valorrespuestaseleccionada) {
                      arrayvalores = valores.codigorespuestaseleccionada.split('_');
                      if (arrayvalores.indexOf(respuestas.codigo.toString()) != -1) {
                        respuestas.respuesta = true;
                      } else {
                        respuestas.respuesta = false;
                      }
                    } else {
                      respuestas.respuesta = false;
                    };
                  } else {
                    respuestas.ruta = valores.ruta;
                  }
                }
              });
            }

          });
        }
        loading.dismiss();
        return this.items;
      })
    }).catch(err => {
      loading.dismiss();
      this.handleError('Error cargando información, inténtelo de nuevo');
    });
  }


  respuestasguardada(up, grupo, tipo) {
    return this.database.respuestasguardadas(up, grupo, tipo).then((dt) => {
      this.items = dt;
      return this.items;
    })
  }

  guardar3001(unidadp, grup, codigopararespuestas, preguntaid, codigosdelasrespuestas, valoresdelasrespuestas, valortext, tipoformulario) {
    this.database.guardarrespuestaporpregunta(unidadp, grup, codigopararespuestas, preguntaid, codigosdelasrespuestas, valoresdelasrespuestas, valortext, tipoformulario).then(() =>
      this.database.respuestasguardadast().then((d) => { }, err => {  })
    ).catch((err) => {  });

  }
  guardarobservacion(up, grupoidselected, respcodigo, preguntaid, observacion, tipof) {
   return this.database.guardarobservacion(up, grupoidselected, respcodigo, preguntaid, observacion, tipof).then((d)=>{
     this.items=d;
     return this.items;
   })
  }
  guardarimagen(up, grupoidselected, respcodigo, preguntaid, imagen, tipof) {
    return this.database.guardarimagen(up, grupoidselected, respcodigo, preguntaid, imagen, tipof).then((dt) => {
      this.items = dt;
      return this.items;
    });
  }
  preguntasconrespuestastabla(preguntaid) {
    return this.database.preguntastablaporid(preguntaid).then((dt) => {
      this.items = dt;
      return this.items;
    })
  }
  respuestastablas(codigorespuesta, up, grupo, preguntapadre, tipo, preguntaid) {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando informacion...'
    });
    return this.database.respuestasapreguntastablas(codigorespuesta).then((data) => {
      this.items = data;
      return this.items;
    }).then(() => {
      let inicial = 0;
      let cant = this.items.length;
      this.items.forEach(element => {
        return this.database.respuestasguardadastabla(up, grupo, preguntapadre, preguntaid, element.codigo, tipo).then((respuesta) => {
          let respues = respuesta;
          if (element.tipo == 210001) {
            if (!respuesta) {
              element.respuesta = '';
            } else {
              element.respuesta = respuesta;
            }
          } else if (element.tipo == 210002) {
            if (!respuesta) {
              element.respuesta = '';
            } else {
              element.respuesta = parseInt(respues.toString());
            }
          } else if (element.tipo == 210003) {
            if (!respuesta) {
              element.respuesta = '';
            } else {
              element.respuesta = respuesta;
            }
          } else if (element.tipo == 210004) {
            element.respuesta = respuesta;
          }
          inicial = inicial + 1;
          if (inicial == cant) {
          }
        }, err => {
          inicial = inicial + 1;
          if (inicial == cant) {
          }
        });
      });
      return this.items;
    }).catch((err) => {
      this.handleError('Error cargando información, inténtelo de nuevo');
    });

  }
  guardarpreguntatabla(unidadp, grup, codigopararespuestas, preguntapadre, preguntaid, codigosdelasrespuestas, valoresdelasrespuestas, valortext, tipoformulario) {
    this.database.guardarrespuestaporpreguntatabla(unidadp, grup, codigopararespuestas, preguntapadre, preguntaid, codigosdelasrespuestas, valoresdelasrespuestas, valortext, tipoformulario);
  }
  guardarrespuestatabla(up, grupoidselected, codrespuesta, preguntaid, preguntapadre, valorcodigo, valorvalor, valor, tipocuestionario) {
    this.database.guardarrespuestaporpreguntatabla(up, grupoidselected, codrespuesta, preguntapadre, preguntaid, valorcodigo, valorvalor, valor, tipocuestionario).then((ok) => { }, (err) => { });
  }

  guardarnoconformidades(unidadproductiva, tipo_formulario, categoria, detalle, descripcion, fechacreacion, fechaposiblecierre, estado) {
    return this.database.agregarnoconformidad(unidadproductiva, tipo_formulario, categoria, detalle, descripcion, fechacreacion, fechaposiblecierre, estado).then((dt) => {
      this.items = dt;
      return this.items;
    }, err => { })
  }
  noconformidades(unidadproductiva, tipo_formulario) {
    return this.database.noconformidades(unidadproductiva, tipo_formulario).then((data) => {
      this.items = data;
      return this.items;
    })
  }
  todasnoconformidades() {
    return this.database.todasnoconformidades().then((data) => {
      this.items = data;
      return this.items;
    })
  }


  descargarcategorias() {
    this.storage.get('jwt').then(jwt => {

      this.authHttp.get(`${SERVER_URL}/api/catalogValues/findByCatalog/22`).subscribe(
        categoria => {
          categoria.json().forEach(element => {
            this.database.agregarcategoria(element.codigo, element.campo2).then((ok) => {
            }, (err) => {
            });
          });
        }
      );
    });
  }

  categoria() {
    return this.database.categorias().then((dt) => {
      this.items = dt;
      return this.items;
    }, err => {})
  }

  noconformidadid(id) {
    return this.database.noconformidadid(id).then((dt) => {
      this.items = dt;
      return this.items;
    }, err => {  })
  }
  editarnoconformidad(id, columna, valor) {
    return this.database.editarnoconformidad(id, columna, valor).then((dt) => {
      this.items = dt;
      return this.items;
    }, err => { })
  }

  agregartarea(noconformidad, nombre, detalle, encargado, fecha, estado, fechacreacion) {
    return this.database.agregartarea(noconformidad, nombre, detalle, encargado, fecha, estado, fechacreacion).then((dt) => {
      this.items = dt;
      return this.items;
    }, err => {  })
  }

  tareas(noconformidad) {
    return this.database.tareas(noconformidad).then((dt) => {
      this.items = dt;
      return this.items;
    }, err => { })
  }
  tareasporid(id) {
    return this.database.tareasporid(id).then((dt) => {
      this.items = dt;
      return this.items;
    }, err => { })
  }
  tareaseditar(id, nombre, detalle, encargado, fecha, estado, fechacierrereal) {
    return this.database.editartarea(id, nombre, detalle, encargado, fecha, estado, fechacierrereal).then((dt) => {
      this.items = dt;
      return this.items;
    }, err => { })
  }
  guardarubicacion(unidad, datofecha, latitud, longitud, caso) {
    this.database.guardarubicacion(unidad, datofecha, latitud, longitud, caso).then((d) => {  }, err => {});
  }

  enviarrespuesta(formularioaenviar, up, tipo) {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Enviando informacion para la unidad ' + up.nombre + ' ...'
    });
    let datosaenviar=formularioaenviar;
    datosaenviar.formulario.mapa=null;
    loading.present();
    console.log('datos enviados ',JSON.stringify(datosaenviar));

    return this.authHttp.post(`${SERVER_URL}/api/formulario/create/`, formularioaenviar).subscribe((data) => {
      if (data.status == 200) {
        this.cambiarunidadproductiva(up);
        this.handleError('Formulario para la unidad ' + up.nombre + ' Enviado exitosamente');

      } else {
        this.handleError('Error al enviar formulario ' + up.nombre);
      }
      loading.dismiss();

      return data;
    },err=>{
      loading.dismiss();
      this.handleError('Error al enviar formulario para la unidad ' + up.nombre);
            
    }) 

  }

  cambiarunidadproductiva(up) {
    this.database.cambiarestado(up.idUnidadProductiva, 2, up.tipo).then(() => {
      this.handleError('unidad ' + up.nombre + ' finalizada exitosamente');
    }, () => {
      this.handleError('No se puedo editar la unidad ' + up.nombre + ' a finalizada');
    });
  }

  enviarfoto(pregunta) {
    return this.storage.get('jwt').then((jwt) => {
      this.rutaimg = this.file.externalDataDirectory + `${pregunta.unidadproductiva}/${pregunta.grupo.toString()}`;
    })
  }


  enviarfotoprueba(ruta, imgname, idunidad) {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Enviando foto ...'
    });
    loading.present();
    this.storage.get('jwt').then((jwt) => {
      let options: FileUploadOptions = {
        fileKey: 'file',
        fileName: imgname.replace(".jpg", ""),
        headers: {
          'Authorization': 'Bearer ' + jwt,
          'Content-Type': undefined
        },
        mimeType: 'image/*'
      }

      return this.fileTransfer.upload(ruta, `${SERVER_URL}api/photoupload/${idunidad}`, options)
        .then((data) => {
          this.handleError('Foto enviada');
          loading.dismiss();
        }, (err) => {
          this.handleError(JSON.stringify(err));
          loading.dismiss();
        })

    }, err=>{
      loading.dismiss();
      this.handleError('error al subir imagen para la unidad '+ idunidad);
      console.log('err',err);
    })

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
}
