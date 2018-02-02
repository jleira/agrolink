import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { LoadingController, ToastController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { ReplaySubject, Observable } from "rxjs";
import { Storage } from "@ionic/storage";
import { AuthHttp } from "angular2-jwt";
import { SERVER_URL } from "../../config";
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import { DbProvider } from '../db/db';
import { PerfilProvider } from '../../providers/perfil/perfil';
import { RegionProvider } from '../../providers/region/region';
import { UproductivaProvider } from '../../providers/uproductiva/uproductiva';
import { FormulariosProvider } from '../../providers/formularios/formularios';
import { errorHandler } from '@angular/platform-browser/src/browser';


let apiUrl = SERVER_URL;

@Injectable()
export class AuthProvider {
  authUser = new ReplaySubject<any>(1);
  cancelar: number;
  constructor(public http: Http,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private readonly authHttp: AuthHttp,
    private readonly storage: Storage,
    public database: DbProvider,
    public perfil: PerfilProvider,
    public region: RegionProvider,
    public uproductiva: UproductivaProvider,
    public formularios: FormulariosProvider
  ) {
    this.cancelar = 0;
  }
  checkLogin() {
    this.storage.get('jwt').then(jwt => {
      this.authUser.next(jwt);
    });
  }

  login(values: any): Observable<any> {
    this.cancelar = 0;
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('X-Agrolink-Tenant', values.empresa);
    let options = new RequestOptions({ headers: headers });
    return this.http.post(`${apiUrl}api/login`, '{"identificador":"' + values.username + '","clave":"' + values.password + '"}', options)
      .map(response => (response.headers.get('authorization').substring(7))).map(
      jwt => {
        this.handleJwtResponse(jwt, values.empresa);
      });
  }
  private handleJwtResponse(jwt: string, empresa) {
    this.storage.set('jwt', jwt)
      .then(() => {

        let loading = this.loadingCtrl.create({
          spinner: 'bubbles',
          content: 'Descargando informarcion del perfil...'
        });
        loading.present();

        this.database.limpiardb().then((ok) => {
          this.authHttp.get(`${SERVER_URL}/api/users/findMyData/`).subscribe(
            data => {
              this.guardarinfo(data.json(), empresa);

              this.region.obtenerpaises().subscribe(() => {
              },
                err => {

                  if (this.cancelar == 0) {
                    this.handleError2('Error al descargar la informacion de paises, intentelo nuevamente');
                    this.logout();
                    this.cancelar = 1;
                  }
                });
              this.region.obtenerdepartamentos().subscribe(() => {
              }, () => {
                if (this.cancelar == 0) {
                  this.handleError2('Error al descargar la informacion de departamentos, intentelo nuevamente');
                  this.logout();
                  this.cancelar = 1;
                }
              });
              this.region.obtenermunicipios().subscribe(() => {
              }, () => {
                if (this.cancelar == 0) {
                  this.handleError2('Error al descargar la informacion de municipios, intentelo nuevamente');
                  this.logout();
                  this.cancelar = 1;
                }
              });
              this.region.obtenerregiones().subscribe(() => {
              }, () => {
                if (this.cancelar == 0) {
                  this.handleError2('Error al descargar la informacion de regiones, intentelo nuevamente');
                  this.logout();
                  this.cancelar = 1;
                }
              });
              if (this.cancelar === 0) {
                let loadingform = this.loadingCtrl.create({
                  spinner: 'bubbles',
                  content: 'descargando formulario base'
                })
                loadingform.present();
                this.authHttp.get(`${SERVER_URL}/api/catalogValues/findByCatalog/22`).subscribe(
                  categoria => {
                    if (categoria) {
                      categoria.json().forEach(element => {
                        this.database.agregarcategoria(element.codigo, element.campo2).then((ok) => {
                        }, (err) => {
                          if (this.cancelar == 0) {
                            this.handleError2('Error al descargar las categorias de las no inconformidades , intentelo nuevamente');
                            this.logout();
                            this.cancelar = 1;
                          }
                        });
                      });
                    } else {
                      if (this.cancelar == 0) {
                        this.handleError2('Error al descargar las categorias de las no inconformidades , intentelo nuevamente');
                        this.logout();
                        this.cancelar = 1;
                      }
                    }
                  }, err => {
                    if (this.cancelar == 0) {
                      this.handleError2('Error al descargar las categorias de las no inconformidades , intentelo nuevamente');
                      this.logout();
                      this.cancelar = 1;
                    }
                  }
                );
                 this.authHttp.get(`${SERVER_URL}api/inquiries/findByPeriodoUser`).subscribe(
                  data => {
                    if (data.json()) {
                      let tform;
                      let per;
                      data.json().forEach(element => {
                        if (element.periodo == null) {
                          per = null;
                        } else {
                          per = element.periodo.alias;
                        }
                        this.database.guardarformulario(element.codigo, element.nombre, element.observaciones, element.cataTienCodigo.codigo, per).then((ok) => {
                        }, err => {
                          if (this.cancelar == 0) {
                            this.handleError2('Error interno en el dispositivo, intentelo nuevamente');
                            this.logout();
                            this.cancelar = 1;
                          }
                        });
                        let idformulario = element.codigo;
                        element.grupos.forEach(element2 => {
                          this.database.guardargrupo(element2.idGrupoBase, element2.nombre, element2.posicion, idformulario, element2.textoAyuda).then((ok) => {
                          }, err => {
                            if (this.cancelar == 0) {
                              this.handleError2('Error interno en el dispositivo, intentelonuevake nuevamente');
                              this.logout();
                              this.cancelar = 1;
                            }
                          });
                          let idgrupo = element2.idGrupoBase;
                          this.authHttp.get(`${SERVER_URL}/api/grupoBasesPreguntasBases/findByGroup/${idgrupo}`).subscribe((preguntas) => {
                            if (preguntas.json()) {
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

                                    this.authHttp.get(`${SERVER_URL}/api/questions/findPreguntasOfTable/${pr.pregunta.codigo}`).subscribe(
                                      preguntatabla => {
                                        this.database.guardarpregunta(pr.pregunta.codigo, pr.pregunta.enunciado, pr.posicion, pr.pregunta.cataTipeCodigo.codigo, pr.valorinicial, idgrupo, requerido, '', pr.pregunta.adjuntos, preguntatabla.json()['header']['cuerpo'], element.cataTienCodigo.codigo).then(
                                          () => {
                                          }, err => {
                                            console.log(err);
                                            if (this.cancelar == 0) {
                                              this.handleError2('Error interno en el dispositivo, intentelonuevamente nuevamente');
                                              this.logout();
                                              this.cancelar = 1;
                                            }
                                          });
                                        if (preguntatabla.json()) {
                                          preguntatabla.json().preguntaTabla.forEach(preguntatablanueva => {
                                            if (preguntatablanueva.observacion === true) {
                                              preguntatablanueva.observacion = 1;
                                              this.database.guardarpreguntatabla(
                                                preguntatablanueva.preguntaTablaId.codigoPregunta.codigo,
                                                preguntatablanueva.preguntaTablaId.codigoPreguntaPadre.codigo,
                                                preguntatablanueva.preguntaTablaId.codigoPregunta.enunciado,
                                                preguntatablanueva.fila,
                                                null,
                                                preguntatablanueva.observacion).then(
                                                () => {
                                                }, err => {
                                                  console.log('err1',err);
                                                  if(err.code!==6){
                                                    if (this.cancelar == 0) {
                                                      this.handleError2('Error interno en el dispositivo, intentelo nuevamente');
                                                      this.logout();
                                                      this.cancelar = 1;
                                                    }
                                                  }
                                                  
                                                });
                                            } else {
                                              preguntatablanueva.observacion = 0;
                                              this.database.guardarpreguntatabla(
                                                preguntatablanueva.preguntaTablaId.codigoPregunta.codigo,
                                                preguntatablanueva.preguntaTablaId.codigoPreguntaPadre.codigo,
                                                preguntatablanueva.preguntaTablaId.codigoPregunta.enunciado,
                                                preguntatablanueva.fila,
                                                preguntatablanueva.preguntaTablaId.codigoPregunta.respCodigo.codigo,
                                                preguntatablanueva.observacion).then(() => {
                                                  preguntatablanueva.preguntaTablaId.codigoPregunta.respCodigo.valores.forEach(respuestastabla => {
                                                    this.database.guardarrespuestatabla(
                                                      respuestastabla.codigo,
                                                      respuestastabla.nombre,
                                                      respuestastabla.valor,
                                                      respuestastabla.valorConstante,
                                                      respuestastabla.tipoDato,
                                                      respuestastabla.respCodigo).then(
                                                      () => {
                                                      }, err => {
                                                        console.log('err 3r',err)
                                                        if (err.code === 6) {

                                                        } else {
                                                          if (this.cancelar == 0) {
                                                            this.handleError2('Error interno en el dispositivo, intentelo nuevamente');
                                                            this.logout();
                                                            this.cancelar = 1;
                                                          }
                                                        }
                                                      });
                                                  });
                                                }, (err) => {
                                                  console.log('epno',err);
                                                  if (this.cancelar == 0) {
                                                    if (err.code !== 6) {
                                                      this.handleError2('Error interno en el dispositivo, intentelo nuevamente');
                                                      this.logout();
                                                      this.cancelar = 1;

                                                    }
                                                  }
                                                }
                                                );
                                            }
                                          });
                                        } else {
                                          if (this.cancelar == 0) {
                                            this.handleError2('no existen preguntas asignadas a la pregunta tabla ' + pr.pregunta.enunciado);
                                            this.logout();
                                            this.cancelar = 1;
                                          }
                                        }
                                      }, (err) => {
                                        if (err.status == 500) {
                                          if (this.cancelar == 0) {
                                            this.logout();
                                            this.cancelar = 1;
                                            this.handleError2('Error al descargar la informacion de la pregunta tabla  ' + pr.pregunta.enunciado + ' , error en el servidor');
                                          }
                                        } else {
                                          if (this.cancelar == 0) {
                                            this.logout();
                                            this.cancelar = 1;
                                            this.handleError2('Error al descargar la informacion pregunta tabla  ' + pr.pregunta.enunciado + ', intentelo nuevamente');
                                          }
                                        }
                                      }
                                    ); 
                                  } else {
                                    this.database.guardarpregunta(pr.pregunta.codigo, pr.pregunta.enunciado, pr.posicion, pr.pregunta.cataTipeCodigo.codigo, pr.valorinicial, idgrupo, requerido, '', pr.pregunta.adjuntos, '', element.cataTienCodigo.codigo).then(
                                      () => {
                                      }, err => {
                                        console.log(err);
                                        if (this.cancelar == 0) {
                                          this.handleError2('Error interno en el dispositivo, intentelonuevake nuevamente');
                                          this.cancelar = 1;
                                        }
                                      });
                                  }
                                } else {
                                  this.database.guardarpregunta(pr.pregunta.codigo, pr.pregunta.enunciado, pr.posicion, pr.pregunta.cataTipeCodigo.codigo, pr.valorinicial, idgrupo, requerido, pr.pregunta.respCodigo.codigo, pr.pregunta.adjuntos, '', element.cataTienCodigo.codigo).then(
                                    (ok) => {
                                    }, (err) => {
                                      console.log(err);
                                      if (this.cancelar == 0) {
                                        this.handleError2('Error interno en el dispositivo, intentelonuevake nuevamente');
                                        this.logout();
                                        this.cancelar = 1;
                                      }
                                    });
                                  this.authHttp.get(`${SERVER_URL}/api/answers/find/${pr.pregunta.respCodigo.codigo}`).subscribe(
                                    respuestas => {
                                      if (respuestas.json()) {
                                        respuestas.json().valores.forEach(resp => {
                                          this.database.guardarrespuesta(resp.codigo, resp.nombre, resp.valor, resp.tipoDato, respuestas.json().codigo).then(
                                            (ok) => {
                                            }, (err) => {
                                              if (err.code === 6) {
                                                
                                              }else{
                                                if (this.cancelar == 0) {
                                                   this.handleError2('Error interno en el dispositivo, intentelo nuevamente');
                                                  this.logout();
                                                  this.cancelar = 1;
                                                 }
                                              }
                                            });
                                        });
                                      } else {
                                        if (this.cancelar == 0) {
                                          this.handleError2('No existen respuestas para la pregunta ' + pr.pregunta.enunciado);
                                          this.logout();
                                          this.cancelar = 1;
                                        }
                                      }
                                    }, err => {
                                      if (err.status == 500) {
                                        if (this.cancelar == 0) {
                                          this.logout();
                                          this.cancelar = 1;
                                          this.handleError2('Error al descargar las respuestas de la pregunta ' + pr.pregunta.enunciado + ' , error en el servidor');
                                        }

                                      } else {
                                        if (this.cancelar == 0) {
                                          this.logout();
                                          this.cancelar = 1;
                                          this.handleError2('Error al descargar las respuestas de la pregunta ' + pr.pregunta.enunciado + ', intentelo nuevamente');
                                        }
                                      }
                                    });
                                }
                              })

                            } else {
                              this.handleError2('no existen preguntas asignadas al grupo ' + element2.nombre);
                              if (this.cancelar == 0) {
                                this.logout();
                                this.cancelar = 1;
                              }
                            }
                          }, (err) => {
                            if (err.status == 500) {
                              if (this.cancelar == 0) {
                                this.logout();
                                this.cancelar = 1;
                                this.handleError2('Error al descargar la preguntas en el grupo ' + element2.nombre + ' , error en el servidor');
                              }
                            } else {
                              if (this.cancelar == 0) {
                                this.handleError2('Error al descargar la informacion en el grupo ' + element2.nombre + ', intentelo nuevamente');
                                this.logout();
                                this.cancelar = 1;
                              }
                            }

                          });
                        });
                      });
                    } else {
                      if (this.cancelar == 0) {
                        this.handleError2('No existen formularios habilitados para descarga');
                        this.logout();
                        this.cancelar = 1;
                      }
                    }
                    loadingform.dismiss();
                  }, err => {
                    loadingform.dismiss();
                    if (this.cancelar == 0) {
                      this.handleError2('Error al descargar la informacion de formularios base, intentelo nuevamente');
                      this.logout();
                      this.cancelar = 1;
                    }
                  }) 


                
                  this.authHttp.get(`${SERVER_URL}/api/asignaciones/user`).subscribe(
                  data => {
                    if (data.json()) {
                      this.storage.get('codigo').then((micodigo) => {
                        data.json().forEach(element => {
                          let tipo;
                          let lat;
                          let long;
                          if (element.unidadProductiva['localizacion'] == null) {
                            lat = null;
                            long = null;
                          } else {
                            lat = element.unidadProductiva['localizacion']['latitude'];
                            long = element.unidadProductiva['localizacion']['longitude'];
                          }
                          if (element.auditor) {
                            if (element.auditor.codigo === micodigo) {
                              tipo = 1002;
                              this.agregaru(element, long, lat, tipo);
                              this.noconformidades(element.unidadProductiva['idUnidadProductiva'], 1002);
                            }
                          }
                          if (element.promotor) {
                            if (element.promotor.codigo === micodigo) {
                              tipo = 1001;
                              this.agregaru(element, long, lat, tipo);
                              this.noconformidades(element.unidadProductiva['idUnidadProductiva'], 1001);

                            }
                          }
                        });
                      }, err => {
                        if (this.cancelar == 0) {
                          this.logout();
                          this.cancelar = 1;
                        }
                      });
                    } else {
                      this.handleError2('No existen asignaciones');
                      if (this.cancelar == 0) {
                        this.logout();
                        this.cancelar = 1;
                      }
                    }
                  }, () => {

                  });

              }
              loading.dismiss();

              this.authUser.next(jwt);
            },
            err => {

              if (err.status == 500) {
                if (this.cancelar == 0) {
                  this.handleError2('Error al descargar la informacion de la persona logeada, error en el servidor');
                  this.logout();
                  this.cancelar = 1;
                }

              } else {
                if (this.cancelar == 0) {
                  this.handleError2('Error al descargar la informacion de la persona logeada, intentelo nuevamente');
                  this.logout();
                  this.cancelar = 1;
                }
              }
            }
          )
        }, err => {
          loading.dismiss();
        })
      })
  }


  login2(usuario, pass, empresa): Observable<any> {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('X-Agrolink-Tenant', empresa);
    let options = new RequestOptions({ headers: headers });
    return this.http.post(`${apiUrl}api/login`, '{"identificador":"' + usuario + '","clave":"' + pass + '"}', options)
      .map(response => {
        response.headers.get('authorization').substring(7);
        return response.headers.get('authorization').substring(7);
      }).map(jwt => this.handleJwtResponse2(jwt));
  }
  private handleJwtResponse2(jwt: string) {
    return this.storage.set('jwt', jwt).then(() => jwt);
  }



  logout() {
    this.database.limpiardb().then((ok) => { }, () => { });
    this.storage.remove('jwt').then(() => this.authUser.next(null));
    this.storage.remove('nombre');
    this.storage.remove('identificador');
    this.storage.remove('roll');
    this.storage.remove('tipo_id');
    this.storage.remove('identificacion');
    this.storage.remove('mail');
    this.storage.remove('reload');
    this.storage.remove('empresa');

  }
  guardarinfo(value, empresa) {
    this.storage.set('codigo', value['codigo']);
    this.storage.set('nombre', value['nombre']);
    this.storage.set('identificador', value['identificador']);
    let roles = '';
    if (value.roles.length > 0) {
      value.roles.forEach(element => {
        if (element == 1) {
          if (roles == '') {
            roles = 'Administrador';
          } else {
            roles = roles + '-Administrador';
          }
        }
        if (element == 2) {
          if (roles == '') {
            roles = 'Promotor';
          } else {
            roles = roles + '-Promotor';
          }
        }
        if (element == 3) {
          if (roles == '') {
            roles = 'Auditor';
          } else {
            roles = roles + '-Auditor';
          }
        }
      });
      this.storage.set('roll', roles);
    }
    else {
      this.storage.set('roll', 'Sin rol asignada');
    }

    this.storage.set('tipo_id', value['cataTiidCodigo']['campo2']);
    this.storage.set('identificacion', value['numeroIdentificacion']);
    this.storage.set('mail', value['correoElectronico']);
    this.storage.set('empresa', empresa);
    return true;
  }

  handleError2(mensaje: string) {
    let message: string;
    message = mensaje;
    const toast = this.toastCtrl.create({
      message,
      duration: 15000,
      position: 'bottom'
    });

    toast.present();
  }


  agregaru(element, long, lat, tipo) {
    this.database.agregarunidadproductiva(element.unidadProductiva['idUnidadProductiva'], element.unidadProductiva['nombre'], element.unidadProductiva['fechaIngreso'],
      element.unidadProductiva['region']['idRegion'], long, lat, element.unidadProductiva['productor']['idProductor'], tipo, element.idAsignacion
    ).then((ok) => {
      this.validarproductor(element.unidadProductiva['productor']['idProductor']).then((data: any) => {
        if (data == 0) {
          this.database.agregarproductor(
            element.unidadProductiva['productor']['idProductor'],
            element.unidadProductiva['productor']['nombre'],
            element.unidadProductiva['productor']['identificacion'],
            element.unidadProductiva['productor']['telefono'],
            element.unidadProductiva['productor']['annoIngreso'],
            element.unidadProductiva['productor']['ultimaAplicacion']
          ).catch(err => {
          })
        }
      }, err => {
      })
    },
      (err) => {
      }
      );
  }

  validarproductor(idproductor: number) {
    return this.database.existeproductor(idproductor).then(
      (ok) => {
        return ok
      },
      (err) => {
        this.handleError2('Error interno en el dispositivo, intentelo nuevamente');
        if (this.cancelar == 0) {
          this.logout();
          this.cancelar = 1;
        }
      }
    );
  }

  noconformidades(unidad, tipo) {
    this.authHttp.get(`${SERVER_URL}api/noconformidades/findAllActiveByTypeFormulario/${tipo}/${unidad}`).subscribe((data) => {

      if (data.json()) {
        data.json().forEach(element => {
          this.database.agregarnoconformidadantigua(element.codigo, unidad, tipo, element.categoria, element.detalle, element.descripcion, element.fechaCreacion, element.fechaPautadaCierre, element.estatus, element.asignacion, element.fechaRealCierre).then(
            (ok) => { }, err => {
              if (this.cancelar == 0) {
                this.handleError2('Error interno en el dispositivo, intentelo nuevamente');
                this.logout();
                this.cancelar = 1;
              }
            }
          );
          element.tareas.forEach(element2 => {
            this.database.agregartareaantigua(element2.codigo, element2.noConformidad, element2.nombre, element2.descripcion, element2.encargado, element2.fechaPautadaCierre, element2.estado, element2.fechaCreacion, element2.fechaRealCierre).then((ok) => {
            }, () => {
              if (this.cancelar == 0) {
                this.handleError2('Error interno, intentelo nuevamente');
                this.logout();
                this.cancelar = 1;
              }
            })
          });
        });
      }
    }, err => {
      if (err.status == 500) {
        if (this.cancelar == 0) {
          this.logout();
          this.cancelar = 1;
          this.handleError2('Error al descargar las no conformidades pertenecientes a la unidad productiva ' + unidad + ', error en el servidor ');
        }
      } else {
        if (this.cancelar == 0) {
          this.logout();
          this.cancelar = 1;
          this.handleError2('Error al descargar las no conformidades pertenecientes a la unidad productiva ' + unidad + ', intentelo nuevamente');
        }
      }


    })
  }
  precargue(unidad, tipo) {
    /*    this.authHttp.get(`${SERVER_URL}api/forrmualrio/precarguededatos/${tipo}/${unidad}`).subscribe((data) => {
         if (data.json()) {
           data.json().forEach(element => {
   //guardar , identificar si es tipotabla          this.database.agregarnoconformidad(unidad, tipo, element.categoria, element.detalle, element.descripcion, element.fechacreacion, element.fechaposiblecierre, element.estado).then(
               (ok)=>{},err=>{
                 this.logout();
                   this.handleError2('Error interno en el dispositivo, intentelo nuevamente');
               }
             );
           });
         }
       }, err => {
         this.logout();
         if (err.status == 500) {
           this.handleError2('Error al descargar las no conformidades pertenecientes a la unidad productiva ' + unidad + ', error en el servidor ');
         } else {
           this.handleError2('Error al descargar las no conformidades pertenecientes a la unidad productiva ' + unidad + ', intentelo nuevamente');
         }
   
       })
   
    */
  }


}

