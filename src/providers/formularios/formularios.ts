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

  descargarformularios() {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'descargando Formularios'
    });

    loading.present();

    return this.authHttp.get(`${SERVER_URL}/api/inquiries/findByPeriodoUser`).map(
      data => {
        let tform;
        let per;
        loading.present();
        if (data.json()) {
          data.json().forEach(element => {
            if (element.cataTienCodigo == null) {
              tform = null;
            } else {
              tform = element.cataTienCodigo.codigo;
            }
            if (element.periodo == null) {
              per = null;
            } else {
              per = element.periodo.alias;
            }
            this.database.guardarformulario(element.codigo, element.nombre, element.observaciones, tform, per);
            let id = element.codigo;
            element.grupos.forEach(element2 => {
              this.database.guardargrupo(element2.idGrupoBase, element2.nombre, element2.posicion, id, element2.textoAyuda);
              let gid = element2.idGrupoBase;
              return this.authHttp.get(`${SERVER_URL}/api/grupoBasesPreguntasBases/findByGroup/${element2.idGrupoBase}`).map(
                preguntas => {
                  console.log('preguntas1', preguntas);
                  if (preguntas.json()) {
                    console.log('entro al if', preguntas);
                    preguntas.json().forEach(pr => {
                      let requerido;
                      if (pr.pregunta.requerido == true) {
                        requerido = 1;
                      } else {
                        requerido = 0;
                      }
                      if (pr.pregunta.adjuntos === true) {
                        pr.pregunta.adjuntos = 1;
                      }

                      let preg = pr.pregunta.respCodigo;
                      let pregunt = pr.pregunta.codigo;
                      if (preg === null) {
                        if (pr.pregunta.cataTipeCodigo.codigo === 3007) {//pregunta tipo tabla
                          return this.authHttp.get(`${SERVER_URL}/api/questions/findPreguntasOfTable/${pr.pregunta.codigo}`).map(
                            preguntatabla => {
                              this.database.guardarpregunta(pr.pregunta.codigo, pr.pregunta.enunciado, pr.posicion, pr.pregunta.cataTipeCodigo.codigo, pr.valorinicial, gid, requerido, '', pr.pregunta.adjuntos, preguntatabla.json()['header']['cuerpo']);
                              if (preguntatabla.json()) {
                                console.log('preguntastabla2', preguntatabla.json());

                                preguntatabla.json().preguntaTabla.forEach(element => {
                                  if (element.observacion === true) {
                                    element.observacion = 1;
                                    return this.database.guardarpreguntatabla(
                                      element.preguntaTablaId.codigoPreguntaPadre.codigo,
                                      element.preguntaTablaId.codigoPregunta.codigo,
                                      element.preguntaTablaId.codigoPregunta.enunciado,
                                      element.fila,
                                      element.preguntaTablaId.codigoPregunta.cataTipeCodigo.codigo,
                                      0,
                                      element.preguntaTablaId.codigoPregunta.requerido,
                                      null,
                                      element.observacion);
                                  } else {
                                    element.observacion = 0;
                                    return this.database.guardarpreguntatabla(
                                      element.preguntaTablaId.codigoPreguntaPadre.codigo,
                                      element.preguntaTablaId.codigoPregunta.codigo,
                                      element.preguntaTablaId.codigoPregunta.enunciado,
                                      element.fila,
                                      element.preguntaTablaId.codigoPregunta.cataTipeCodigo.codigo,
                                      0,
                                      element.preguntaTablaId.codigoPregunta.requerido,
                                      element.preguntaTablaId.codigoPregunta.respCodigo.codigo,
                                      element.observacion).then(() => {
                                        element.preguntaTablaId.codigoPregunta.respCodigo.valores.forEach(respuestastabla => {

                                          return this.database.guardarrespuestatabla(
                                            respuestastabla.codigo,
                                            respuestastabla.nombre,
                                            respuestastabla.valor,
                                            respuestastabla.valorConstante,
                                            respuestastabla.tipoDato,
                                            element.preguntaTablaId.codigoPregunta.codigo,
                                            respuestastabla.respCodigo);
                                        });
                                      }, (err) => {
                                      }
                                      );
                                  }


                                });
                              }
                            }
                          );
                        } else {
                          console.log(pr);
                          return this.database.guardarpregunta(pr.pregunta.codigo, pr.pregunta.enunciado, pr.posicion, pr.pregunta.cataTipeCodigo.codigo, pr.valorinicial, gid, requerido, '', pr.pregunta.adjuntos, '');

                        }
                      } else {
                        if (pr.pregunta.cataTipeCodigo.codigo === 3007) {

                          return this.authHttp.get(`${SERVER_URL}/api/questions/findPreguntasOfTable/${pr.pregunta.codigo}`).map(
                            preguntatabla => {
                              this.database.guardarpregunta(pr.pregunta.codigo, pr.pregunta.enunciado, pr.posicion, pr.pregunta.cataTipeCodigo.codigo, pr.valorinicial, gid, requerido, '', pr.pregunta.adjuntos, preguntatabla.json()['header']['cuerpo']);
                              if (preguntatabla.json()) {
                                console.log('preguntastabla3', preguntatabla.json());

                                preguntatabla.json().preguntaTabla.forEach(element => {
                                  return this.database.guardarpreguntatabla(
                                    element.preguntaTablaId.codigoPreguntaPadre.codigo,
                                    element.preguntaTablaId.codigoPregunta.codigo,
                                    element.preguntaTablaId.codigoPregunta.enunciado,
                                    element.fila,
                                    element.preguntaTablaId.codigoPregunta.cataTipeCodigo.codigo,
                                    0,
                                    element.preguntaTablaId.codigoPregunta.requerido,
                                    element.preguntaTablaId.codigoPregunta.respCodigo.codigo,
                                    element.observacion).then(() => {
                                      element.preguntaTablaId.codigoPregunta.respCodigo.valores.forEach(respuestastabla => {
                                        return this.database.guardarrespuestatabla(
                                          respuestastabla.codigo,
                                          respuestastabla.nombre,
                                          respuestastabla.valor,
                                          respuestastabla.valorConstante,
                                          respuestastabla.tipoDato,
                                          element.preguntaTablaId.codigoPregunta.codigo,
                                          respuestastabla.respCodigo);
                                      });
                                    }, (err) => {
                                    }
                                    );
                                });
                              }
                            }
                          );
                        } else {
                          this.database.guardarpregunta(pr.pregunta.codigo, pr.pregunta.enunciado, pr.posicion, pr.pregunta.cataTipeCodigo.codigo, pr.valorinicial, gid, requerido, pr.pregunta.respCodigo.codigo, pr.pregunta.adjuntos, '');
                          return this.authHttp.get(`${SERVER_URL}/api/answers/find/${pr.pregunta.respCodigo.codigo}`).map(
                            respuestas => {
                              console.log('respuestas3', respuestas);
                              if (respuestas.json()) {
                                respuestas.json().valores.forEach(resp => {
                                  return this.database.guardarrespuesta(resp.codigo, resp.nombre, resp.valor, resp.tipoDato, pregunt, respuestas.json().codigo).then(
                                    (ok) => {
                                    }, (err) => {
                                    });
                                });
                              }
                            }
                          );
                        }
                      }
                    });
                  }
                }
              );
            });

            loading.dismiss();
            this.authHttp.post(`${SERVER_URL}/api/inquiries/changeStatus/${element.codigo}`, 'CLOSED').map((responde) => {
              console.log(responde);
            }, err => this.handleError(err));
          });
        } else {
          this.handleError('No existe formulario asignado');
          //          this.auth.logout();
          loading.dismiss();
          return false;
        }
      }, err => {
        this.handleError('Error en el servidor al descaegar formularios,  contactese con el administrador ');
        //       this.auth.logout();
        console.log(err);
      })
  }

  gruposbase(caso) {
    return this.database.formularioid(caso).then((data: any) => {
      this.database.gruposbyid(data).then(grupodb => {
        this.items = grupodb;
        return this.items;
      });
      return this.items;
    });
  }
  preguntasgrupo(grupo) {
    return this.database.preguntasporgrupo(grupo).then((data: any) => {
      this.items = data;

      return this.items;
    });
  }
  respuestasporpreguntas(preguntas, up, grupo, tipo) {
    return this.database.respuestasporpregunta(preguntas).then(data => {
      this.items = data;
      return this.items;
    }).then(() => {
      return this.database.respuestasguardadas(up, grupo, tipo).then((dt) => {
        let da: any;
        da = dt;
        if (this.items) {
          this.items.forEach(respuestas => {
            if (da != false) {
              da.forEach(valores => {
                if (respuestas.preguntaid == valores.pregunta) {
                  respuestas.observacion = valores.observacion;
                  if (respuestas.tipo == 210001) {
                    respuestas.respuesta = valores.valor;
                    respuestas.ruta = valores.ruta;
                  } else if (respuestas.tipo == 210003) {
                    respuestas.respuesta = valores.valor;
                    respuestas.ruta = valores.ruta;
                  } else if (respuestas.tipo == 210002) {
                    respuestas.ruta = valores.ruta;
                    respuestas.respuesta = parseInt(valores.valor);
                  } else if (respuestas.tipo == 210004) {
                    respuestas.ruta = valores.ruta;
                    let arrayvalores;
                    if (valores.valor) {
                      arrayvalores = valores.valor.split('_');
                      if (arrayvalores.indexOf(respuestas.valor.toString()) != -1) {
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

        return this.items;
      })
    }).catch(err => { console.log(err) });
  }


  respuestasguardada(up, grupo, tipo) {
    return this.database.respuestasguardadas(up, grupo, tipo).then((dt) => {
      this.items = dt;
      return this.items;
    })
  }

  guardar3001(unidadp, grup, codigopararespuestas, preguntaid, codigosdelasrespuestas, valoresdelasrespuestas, valortext, tipoformulario) {
    this.database.guardarrespuestaporpregunta(unidadp, grup, codigopararespuestas, preguntaid, codigosdelasrespuestas, valoresdelasrespuestas, valortext, tipoformulario).catch((err) => { console.log(err) });

  }
  guardarobservacion(up, grupoidselected, respcodigo, preguntaid, observacion, tipof) {
    this.database.guardarobservacion(up, grupoidselected, respcodigo, preguntaid, observacion, tipof);
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

  respuestastablas(codigorespuesta, up, grupo, preguntapadre, tipo) {
    return this.database.respuestasapreguntastablas(codigorespuesta).then((data) => {
      this.items = data;
      return this.items;
    }).then(() => {
      this.items.forEach(element => {

        return this.database.respuestasguardadastabla(up, grupo, preguntapadre, element.preguntaid, element.codigo, tipo).then((respuesta) => {
          let respues = respuesta;
          element.respuesta = respuesta;
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
        });
      });
      return this.items;
    }).catch((err) => {
      console.log(err);
    });

  }
  guardarpreguntatabla(unidadp, grup, codigopararespuestas, preguntapadre, preguntaid, codigosdelasrespuestas, valoresdelasrespuestas, valortext, tipoformulario) {
    this.database.guardarrespuestaporpreguntatabla(unidadp, grup, codigopararespuestas, preguntapadre, preguntaid, codigosdelasrespuestas, valoresdelasrespuestas, valortext, tipoformulario);
  }
  guardarrespuestatabla(up, grupoidselected, codrespuesta, preguntaid, preguntapadre, valorcodigo, valorvalor, valor, tipocuestionario) {
    this.database.guardarrespuestaporpreguntatabla(up, grupoidselected, codrespuesta, preguntapadre, preguntaid, valorcodigo, valorvalor, valor, tipocuestionario);

  }
  guardarnoconformidades(unidadproductiva, tipo_formulario, categoria, detalle, descripcion, fechacreacion, fechaposiblecierre, estado) {
    return this.database.agregarnoconformidad(unidadproductiva, tipo_formulario, categoria, detalle, descripcion, fechacreacion, fechaposiblecierre, estado).then((dt) => {
      this.items = dt;
      return this.items;
    }, err => { console.log(err) })
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
          console.log(categoria.json());
          categoria.json().forEach(element => {
            this.database.agregarcategoria(element.codigo, element.campo2).then((ok) => {
              console.log('ok', ok);
            }, (err) => {
              console.log('err', err);
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
    }, err => { console.log(err) })
  }

  noconformidadid(id) {
    return this.database.noconformidadid(id).then((dt) => {
      this.items = dt;
      return this.items;
    }, err => { console.log(err) })
  }
  editarnoconformidad(id, columna, valor) {
    return this.database.editarnoconformidad(id, columna, valor).then((dt) => {
      this.items = dt;
      return this.items;
    }, err => { console.log(err) })
  }

  agregartarea(noconformidad, nombre, detalle, encargado, fecha, estado, fechacreacion) {
    return this.database.agregartarea(noconformidad, nombre, detalle, encargado, fecha, estado, fechacreacion).then((dt) => {
      this.items = dt;
      return this.items;
    }, err => { console.log(err) })
  }

  tareas(noconformidad) {
    return this.database.tareas(noconformidad).then((dt) => {
      this.items = dt;
      return this.items;
    }, err => { console.log(err) })
  }
  tareasporid(id) {
    return this.database.tareasporid(id).then((dt) => {
      this.items = dt;
      return this.items;
    }, err => { console.log(err) })
  }
  tareaseditar(id, nombre, detalle, encargado, fecha, estado, fechacierrereal) {
    return this.database.editartarea(id, nombre, detalle, encargado, fecha, estado, fechacierrereal).then((dt) => {
      this.items = dt;
      return this.items;
    }, err => { console.log(err) })
  }
  guardarubicacion(unidad, valor, caso) {
    this.database.guardarubicacion(unidad, valor, caso);
  }

  enviarrespuesta(formularioaenviar, up, tipo) {
    return this.storage.get('jwt').then(jwt => {
      return this.authHttp.post(`${SERVER_URL}/api/formulario/create/`, formularioaenviar).subscribe((data) => {
        console.log(data);
        if (data.status == 200) {
          this.cambiarunidadproductiva(up);
          this.handleError('Formulario para la unidad ' + up.nombre + ' Enviado exitosamente');

          return true;
        } else {
          return false;
        }
      })
    });
  }

  cambiarunidadproductiva(up) {
    console.log(up);
    this.database.cambiarestado(up.idUnidadProductiva, 2).then(() => {
      this.handleError('unidad ' + up.nombre + ' editada exitosamente');
    }, () => {
      this.handleError('No se puedo editar la unidad ' + up.nombre + ' a finalizada');
    });
  }

  enviarfoto(pregunta) {
    return this.storage.get('jwt').then((jwt) => {
      this.rutaimg = this.file.externalDataDirectory + `${pregunta.unidadproductiva}/${pregunta.grupo.toString()}`;
      console.log(this.rutaimg, pregunta);
    })
  }


  enviarfotoprueba(ruta, imgname) {
    this.handleError(ruta);
    this.handleError(imgname)

    return this.storage.get('jwt').then((jwt) => {
      let options: FileUploadOptions = {
        fileKey: 'file',
        fileName: imgname.replace(".png", ""),
        headers: {
          'Authorization': 'Bearer ' + jwt,
          'Content-Type': undefined
        },
        mimeType: 'image/*',
      }

      return this.fileTransfer.upload(ruta, `${SERVER_URL}api/photoupload/`, options)
        .then((data) => {
          this.handleError(JSON.stringify(data))
          return JSON.stringify(data);
        }, (err) => {
          this.handleError(JSON.stringify(err))

          return JSON.stringify(err);
        })

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
