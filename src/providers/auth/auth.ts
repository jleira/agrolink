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
    console.log('cancelar inicial', this.cancelar);
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

         this.database.limpiardb().then((ok)=>{
          console.log(ok);
           this.authHttp.get(`${SERVER_URL}/api/users/findMyData/`).subscribe(
            data => {
              this.guardarinfo(data.json(), empresa);
  
              this.region.obtenerpaises().subscribe(() => {
              },
                err => {
                  console.log('error paises');
                  this.handleError2('Error al descargar la informacion de paises, intentelo nuevamente');
                  this.cancelar = 1;
                  console.log('cancelar paises', this.cancelar);

                  return this.logout();
                });
              this.region.obtenerdepartamentos().subscribe(() => {
              }, () => {
                console.log('error departamentos');
                this.handleError2('Error al descargar la informacion de departamentos, intentelo nuevamente');
                this.cancelar = 1;
                return this.logout();
              });
              this.region.obtenermunicipios().subscribe(() => {
              }, () => {
                console.log('error municipios');
                this.handleError2('Error al descargar la informacion de municipios, intentelo nuevamente');
                this.cancelar = 1;
                return this.logout();
              });
              this.region.obtenerregiones().subscribe(() => {
              }, () => {
                console.log('error regiones');
                this.handleError2('Error al descargar la informacion de regiones, intentelo nuevamente');
                this.cancelar = 1;
                return this.logout();
              });
              console.log('cancelar', this.cancelar);
              if (this.cancelar === 0) {
                let loadingform = this.loadingCtrl.create({
                  spinner: 'bubbles',
                  content: 'descargando formulario base'
                })
                loadingform.present();
                this.authHttp.get(`${SERVER_URL}/api/catalogValues/findByCatalog/22`).subscribe(
                  categoria => {
                    console.log(categoria.json());
                    if(categoria){
                      categoria.json().forEach(element => {
                        this.database.agregarcategoria(element.codigo, element.campo2).then((ok) => {
                          console.log('ok', ok);
                        }, (err) => {
                          console.log('error castegorias');
                          this.handleError2('Error al descargar las categorias de las no inconformidades , intentelo nuevamente');
                          this.cancelar = 1;
                          return this.logout();
                        });
                      });  
                    }else{
                      console.log('error castegorias');
                      this.handleError2('Error al descargar las categorias de las no inconformidades , intentelo nuevamente');
                      this.cancelar = 1;
                      return this.logout();
                    }
                  },err=>{
                    console.log('error castegorias');
                    this.handleError2('Error al descargar las categorias de las no inconformidades , intentelo nuevamente');
                    this.cancelar = 1;
                    return this.logout();
                  }
                );
                this.authHttp.get(`${SERVER_URL}api/inquiries/findByPeriodoUser`).subscribe(
                  data => {
  
                    if (data.json()) {
                      let tform;
                      let per;
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
                        this.database.guardarformulario(element.codigo, element.nombre, element.observaciones, tform, per).then((ok) => {
                        }, err => {
                          this.handleError2('Error interno en el dispositivo, intentelonuevake nuevamente');
                          this.cancelar = 1;
                          return this.logout();
                        });
                        let id = element.codigo;
                        element.grupos.forEach(element2 => {
                          this.database.guardargrupo(element2.idGrupoBase, element2.nombre, element2.posicion, id, element2.textoAyuda).then((ok) => {
                          }, err => {
                            this.handleError2('Error interno en el dispositivo, intentelonuevake nuevamente');
                            this.cancelar = 1;
                            return this.logout();
                          });
                          let gid = element2.idGrupoBase;
                          this.authHttp.get(`${SERVER_URL}/api/grupoBasesPreguntasBases/findByGroup/${element2.idGrupoBase}`).subscribe((preguntas) => {
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
                                        this.database.guardarpregunta(pr.pregunta.codigo, pr.pregunta.enunciado, pr.posicion, pr.pregunta.cataTipeCodigo.codigo, pr.valorinicial, gid, requerido, '', pr.pregunta.adjuntos, preguntatabla.json()['header']['cuerpo']).then(
                                          () => {
                                          }, err => {
                                            this.handleError2('Error interno en el dispositivo, intentelonuevake nuevamente');
                                            this.cancelar = 1;
                                            return this.logout();
                                          });
                                        if (preguntatabla.json()) {
                                          preguntatabla.json().preguntaTabla.forEach(element => {
                                            if (element.observacion === true) {
                                              element.observacion = 1;
                                              this.database.guardarpreguntatabla(
                                                element.preguntaTablaId.codigoPreguntaPadre.codigo,
                                                element.preguntaTablaId.codigoPregunta.codigo,
                                                element.preguntaTablaId.codigoPregunta.enunciado,
                                                element.fila,
                                                element.preguntaTablaId.codigoPregunta.cataTipeCodigo.codigo,
                                                0,
                                                element.preguntaTablaId.codigoPregunta.requerido,
                                                null,
                                                element.observacion).then(
                                                () => {
                                                }, err => {
                                                  this.handleError2('Error interno en el dispositivo, intentelo nuevamente');
                                                  this.cancelar = 1;
                                                  return this.logout();
                                                });
                                            } else {
                                              element.observacion = 0;
                                              this.database.guardarpreguntatabla(
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
  
                                                    this.database.guardarrespuestatabla(
                                                      respuestastabla.codigo,
                                                      respuestastabla.nombre,
                                                      respuestastabla.valor,
                                                      respuestastabla.valorConstante,
                                                      respuestastabla.tipoDato,
                                                      element.preguntaTablaId.codigoPregunta.codigo,
                                                      respuestastabla.respCodigo).then(
                                                      () => {
                                                      }, err => {
                                                        if(err.code == 6){

                                                        }else{
                                                        this.handleError2('Error interno en el dispositivo, intentelonuevake nuevamente');
                                                        this.cancelar = 1;
                                                       return this.logout();
                                                        }
                                                      });
                                                  });
                                                }, (err) => {
                                                  console.log('pregunta tabla',err);
                                                  this.handleError2('Error interno en el dispositivo, intentelonuevake nuevamente');
                                                  this.cancelar = 1;
                                                  return this.logout();
                                                }
                                                );
                                            }
  
  
                                          });
                                        } else {
                                          this.handleError2('no existen preguntas asignadas a la pregunta tabla ' + pr.pregunta.enunciado);
                                          this.cancelar = 1;
                                          return this.logout();
                                        }
                                      }, (err) => {
                                        if (err.status == 500) {
                                          this.handleError2('Error al descargar la informacion de la pregunta tabla  ' + pr.pregunta.enunciado + ' , error en el servidor');
                                        } else {
                                          this.handleError2('Error al descargar la informacion pregunta tabla  ' + pr.pregunta.enunciado + ', intentelo nuevamente');
                                        }
                                        return this.logout();

                                      }
                                    );
                                  } else {
                                    this.database.guardarpregunta(pr.pregunta.codigo, pr.pregunta.enunciado, pr.posicion, pr.pregunta.cataTipeCodigo.codigo, pr.valorinicial, gid, requerido, '', pr.pregunta.adjuntos, '').then(
                                      () => {
                                      }, err => {
                                        this.handleError2('Error interno en el dispositivo, intentelonuevake nuevamente');
                                        this.cancelar = 1;
                                        return this.logout();
                                      });
                                  }
                                } else {
                                  this.database.guardarpregunta(pr.pregunta.codigo, pr.pregunta.enunciado, pr.posicion, pr.pregunta.cataTipeCodigo.codigo, pr.valorinicial, gid, requerido, pr.pregunta.respCodigo.codigo, pr.pregunta.adjuntos, '').then(
                                    (ok) => {
                                    }, (err) => {
                                      this.handleError2('Error interno en el dispositivo, intentelonuevake nuevamente');
                                      this.cancelar = 1;
                                      return this.logout();
                                    });
                                  this.authHttp.get(`${SERVER_URL}/api/answers/find/${pr.pregunta.respCodigo.codigo}`).subscribe(
                                    respuestas => {
                                      if (respuestas.json()) {
                                        respuestas.json().valores.forEach(resp => {
                                          this.database.guardarrespuesta(resp.codigo, resp.nombre, resp.valor, resp.tipoDato, pregunt, respuestas.json().codigo).then(
                                            (ok) => {
                                            }, (err) => {
                                              this.handleError2('Error interno en el dispositivo, intentelo nuevamente');
                                              this.cancelar = 1;
                                              return this.logout();
                                            });
                                        });
                                      } else {
                                        this.handleError2('No existen respuestas para la pregunta ' + pr.pregunta.enunciado);
                                        return this.logout();
                                      }
                                    }, err => {
                                      if (err.status == 500) {
                                        this.handleError2('Error al descargar las respuestas de la pregunta tabla ' + pr.pregunta.enunciado + ' , error en el servidor');
                                      } else {
                                        this.handleError2('Error al descargar las respuestas de la pregunta tabla ' + pr.pregunta.enunciado + ', intentelo nuevamente');
                                      }
                                      return this.logout();

                                    });
                                }
                              })
                              //                            console.log(preguntas.json());
  
                            } else {
                              this.handleError2('no existen preguntas asignadas al grupo ' + element2.nombre);
                              this.cancelar = 1;
                              return this.logout();
                            }
                          }, (err) => {
                            if (err.status == 500) {
                              this.handleError2('Error al descargar la preguntas en el grupo ' + element2.nombre + ' , error en el servidor');
                            } else {
                              this.handleError2('Error al descargar la informacion en el grupo ' + element2.nombre + ', intentelo nuevamente');
                            }
                            return this.logout();
                          });
                        });
                      });
                    } else {
                      this.handleError2('No existen formularios habilitados para descarga');
                      this.cancelar = 1;
                      return this.logout();
                    }
                    loadingform.dismiss();
                  }, err => {
                    loadingform.dismiss();
                    console.log('error descargando informacion', err);
                    this.handleError2('Error al descargar la informacion de formularios base, intentelo nuevamente');
                    this.cancelar = 1;
                    return this.logout();
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
                          console.log(element);
                          if(element.auditor){
                            if (element.auditor.codigo === micodigo) {
                              tipo = 1002;
                              this.agregaru(element, long, lat, tipo);
                              this.noconformidades(element.unidadProductiva['idUnidadProductiva'], 1002);
                             // this.precargue(element.unidadProductiva['idUnidadProductiva'], 1002);
                            }  
                          }
                          if(element.promotor){
                            if (element.promotor.codigo === micodigo) {
                              tipo = 1001;
                              this.agregaru(element, long, lat, tipo);
                              this.noconformidades(element.unidadProductiva['idUnidadProductiva'], 1001);
                             // this.precargue(element.unidadProductiva['idUnidadProductiva'], 1002);
                            }  
                          }
                        });
                      },err=>{
                        console.log(err);
                      });
                    } else {
                      this.handleError2('No existen asignaciones');
                      this.cancelar = 1;
                      return this.logout();
                    }
                  }, () => {
  
                  }); 
  
              }
              loading.dismiss();
  
              this.authUser.next(jwt);
            },
            err => {
  
              if (err.status == 500) {
                this.handleError2('Error al descargar la informacion de la persona logeada, error en el servidor');
              } else {
                this.handleError2('Error al descargar la informacion de la persona logeada, intentelo nuevamente');
              }
              return this.logout();

            }
          )
        },err=>{
          console.log('error al limpiar db', err);
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
            roles = 'Auditor';
          } else {
            roles = roles + '-Auditor';
          }
        }
        if (element == 3) {
          if (roles == '') {
            roles = 'Promotor';
          } else {
            roles = roles + '-Promotor';
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
      console.log('agregar unidad',ok);
       this.validarproductor(element.unidadProductiva['productor']['idProductor']).then((data: any) => {
        if (data == 0) {
          this.database.agregarproductor(
            element.unidadProductiva['productor']['idProductor'],
            element.unidadProductiva['productor']['nombre'],
            element.unidadProductiva['productor']['identificacion'],
            element.unidadProductiva['productor']['telefono'],
            element.unidadProductiva['productor']['annoIngreso'],
            element.unidadProductiva['productor']['ultimaAplicacion']
          ).catch(err=>{
            console.log('e aqui el erroe ', err);
          })
        }
      },err=>{
        console.log(err);
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
        this.cancelar = 1;
        return this.logout();
      }
    );
  }

  noconformidades(unidad, tipo) {
    this.authHttp.get(`${SERVER_URL}api/noconformidades/findAllActiveByTypeFormulario/${tipo}/${unidad}`).subscribe((data) => {
      if (data.json()) {
        data.json().forEach(element => {
           this.database.agregarnoconformidadantigua(element.codigo,unidad, tipo, element.categoria, element.detalle, element.descripcion, element.fechaCreacion, element.fechaPautadaCierre,element.estatus,element.asignacion, element.fechaRealCierre).then(
            (ok)=>{},err=>{
              this.handleError2('Error interno en el dispositivo, intentelo nuevamente');

              return this.logout();
            }
          ); 
          element.tareas.forEach(element2 => {
            this.database.agregartareaantigua(element2.codigo, element2.noConformidad, element2.nombre, element2.descripcion, element2.encargado, element2.fechaPautadaCierre, element2.estado, element2.fechaCreacion, element2.fechaRealCierre).then((ok)=>{
            },()=>{
              this.handleError2('Error interno, intentelo nuevamente');
              return this.logout();
            })
          });
        });
       }
    }, err => {
      if (err.status == 500) {
        this.handleError2('Error al descargar las no conformidades pertenecientes a la unidad productiva ' + unidad + ', error en el servidor ');
      } else {
        this.handleError2('Error al descargar las no conformidades pertenecientes a la unidad productiva ' + unidad + ', intentelo nuevamente');
      }
      return this.logout();

    })
  }
  precargue(unidad, tipo) {
 /*    this.authHttp.get(`${SERVER_URL}api/forrmualrio/precarguededatos/${tipo}/${unidad}`).subscribe((data) => {
      if (data.json()) {
        data.json().forEach(element => {
//guardar respuesta, identificar si es tipotabla          this.database.agregarnoconformidad(unidad, tipo, element.categoria, element.detalle, element.descripcion, element.fechacreacion, element.fechaposiblecierre, element.estado).then(
            (ok)=>{},err=>{
              return this.logout();
                this.handleError2('Error interno en el dispositivo, intentelo nuevamente');
            }
          );
        });
      }
    }, err => {
      return this.logout();
      if (err.status == 500) {
        this.handleError2('Error al descargar las no conformidades pertenecientes a la unidad productiva ' + unidad + ', error en el servidor ');
      } else {
        this.handleError2('Error al descargar las no conformidades pertenecientes a la unidad productiva ' + unidad + ', intentelo nuevamente');
      }

    })

 */
  }


}

