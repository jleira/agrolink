import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { TIPO_FECHA } from "../../config";
import { FORMULARIO_PROMOTORIA } from "../../config";
import { Geolocation } from '@ionic-native/geolocation';
import { DbProvider } from '../../providers/db/db';
import { UpdetallesPage } from '../updetalles/updetalles';
import { FormulariosPage } from '../formularios/formularios';
import { JwtHelper, AuthHttp} from "angular2-jwt";
import { Http } from '@angular/http';
import { SERVER_URL } from "../../config";
import { Storage } from "@ionic/storage";
import { FormulariosProvider } from '../../providers/formularios/formularios';
import { File } from '@ionic-native/file';
import { AuthProvider } from '../../providers/auth/auth';
/**
 * Generated class for the CasoespecialPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-casoespecial',
  templateUrl: 'casoespecial.html',
})

export class CasoespecialPage {
  rutaimg;
  items;
  datolongitud: any;
  datolatitud: any;
  caso: number;
  regiones = [];
  TIPO_FECHA = TIPO_FECHA;
  idunidadp = '';
  preguntassinresponder: any;
  evento;
  habilitarenvio;
  tipo;
  empresa;
  usuario;
  constructor(
    public authService: AuthProvider,
    public loadingCtrl: LoadingController,
    public http: Http,
    jwtHelper: JwtHelper,
    private readonly authHttp: AuthHttp,
    public navCtrl: NavController,
    public navParams: NavParams,
    private geolocation: Geolocation,
    public db: DbProvider,
    public viewCtrl: ViewController,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public storage: Storage,
    public formulario: FormulariosProvider,
    public file: File
  ) {
    this.rutaimg = this.file.externalDataDirectory;
    this.evento = [];


    this.habilitarenvio = false;
    this.items = [];
    this.generarid();
    this.tipo = FORMULARIO_PROMOTORIA;
    this.caso = navParams.get('caso');
    if (this.caso == 2) {
      this.geolocation.getCurrentPosition().then((resp) => {
        this.datolatitud = resp.coords.latitude.toString();
        this.datolongitud = resp.coords.longitude.toString();
      }).catch((error) => {
        this.datolatitud = null;
        this.datolongitud = null;
      });

      this.db.todoslasregiones().then((data) => {
        this.regiones = data;
      });



    }



  }

  ionViewDidEnter() {
    console.log(this.caso);
    if (this.caso == 1) {
      this.traerunidades('0,1,2');
    } if (this.caso == 3) {
      this.storage.get('empresa').then((empresa) => {
        this.empresa = empresa;
      });
      this.storage.get('identificador').then(usuario => {
        this.usuario = usuario;
      });

      this.traerunidades('1');
      if (this.evento.length == 0) {

      } else {
        this.comprobarunidades(FORMULARIO_PROMOTORIA, this.evento);
      }
    }

  }

  agregarunidad(caso) {
    this.navCtrl.push(CasoespecialPage, {
      caso: 2
    });
  }

  agregarunidadn(datos) {
    console.log(datos);
    if (datos.nombrep == "" || datos.identificacion == "" || datos.telefono == "" || datos.fechan == "" ||
      datos.grupoe == "" || datos.genero == "" || datos.region == "" || datos.nombreu == "") {
      let prompt = this.alertCtrl.create({
        title: 'AGREGAR UNIDAD PRODUCTIVA',
        message: "Todos los campos deben estar lleno",
        buttons: [
          {
            text: 'Aceptar'
          }
        ]
      });
      prompt.present();
    } else {

      let prompt = this.alertCtrl.create({
        title: 'AGREGAR UNIDAD PRODUCTIVA',
        message: "Una vez creada la unidad productiva esta no podra ser editada",
        buttons: [
          {
            text: 'Cancelar',
          },
          {
            text: 'Aceptar',
            handler: data => {
              let datosproductor = {
                nombre: datos.nombrep,
                identificacion: datos.identificacion,
                telefono: datos.telefono,
                fechaNacimiento: datos.fechan,
                grupoEtnico: datos.grupoe,
                genero: datos.genero,
              };
              console.log(datosproductor);

              this.db.agregarunidadproductivamovil(
                this.idunidadp,
                datos.nombreu,
                null,
                datos.region,
                this.datolongitud,
                this.datolatitud,
                null,
                FORMULARIO_PROMOTORIA,
                '',
                JSON.stringify(datosproductor)).then(() => {
                  this.handleError('Unidad creada exitosamente');
                  this.dismiss();
                }, (err) => {
                  console.log(err);
                  this.handleError('No se pudo crear la unidad, intentelo nuevamente');
                });
            }
          }
        ]
      });
      prompt.present();



    }


  }
  dismiss() {
    this.viewCtrl.dismiss();
  }

  generarid() {
    console.log('id generado');
    let codigogenerado = this.rand_code('0123456789ABCDEFGHUIJK', 5);

    this.db.unidadproductivaporid(codigogenerado,1001).then((ok) => {
      if (ok.length > 0) {
        this.generarid();
      } else {
        this.idunidadp = codigogenerado;
      }
    }, (e) => { console.log('e', e) });



  }

  rand_code(chars, lon) {
    let code = "";
    for (let x = 0; x < lon; x++) {
      let rand = Math.floor(Math.random() * chars.length);
      code += chars.substr(rand, 1);
    }
    console.log(code);

    return code;
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

  traerunidades(caso) {
    this.db.unidadescreadas(caso).then((data) => {
      console.log(data);
      if (data) {
        this.items = data;
      } else {
        this.items = [];
      }

    })
  }
  abrirformulario(unidad) {

    this.navCtrl.push(FormulariosPage, {
      caso: 3, tipo: unidad.tipo, up: unidad, productor: unidad.productor
    });
  }

  abrirdetalles(id: any) {
    let idu = id;
    let modal = this.modalCtrl.create(UpdetallesPage, { 'ids': idu });
    modal.present();
  }

  enviarunidades() {
    this.navCtrl.push(CasoespecialPage, {
      caso: 3
    });
  }

  comprobarunidades(tipo, $event) {
    console.log(tipo, $event);
    this.preguntassinresponder = [];
    this.evento = $event;
    $event.forEach(up => {
      let formulario;
      this.db.formularioid(tipo).then((formularioid) => {
        formulario = formularioid;
        if (formulario == null) {
          if (tipo == 1001) {
            this.handleError('No se encuentran formularios para audiotoria registrados en el movil');
            this.habilitarenvio = false;
          } else {
            this.handleError('No se encuentran formularios para promotoria registrados en el movil');
            this.habilitarenvio = false;
          }
        } else {
          this.db.gruposbyid(formulario).then((grupo) => {
            let grupos = grupo;
            if (grupos) {
              grupos.forEach(grupoi => {
                this.db.preguntasporgruporequeridas(grupoi.idgrupobase).then((pregunta) => {
                  if (pregunta) {
                    pregunta.forEach(preguntaid => {
                      console.log(up.idUnidadProductiva, grupoi.idgrupobase, preguntaid.codigo, tipo, preguntaid.tipo);
                      return this.db.verficarrespuestas(up.idUnidadProductiva, grupoi.idgrupobase, preguntaid.codigo, tipo, preguntaid.tipo).then(tienerespuesta => {
                        console.log(up.idUnidadProductiva, grupoi.idgrupobase, preguntaid.codigo, tipo, preguntaid.tipo);
                        console.log(tienerespuesta);

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
            } else {
              this.handleError('No se encuentran preguntas registradas para este formulario');
            }
          });
        }
      })
    });

  }
  abrirpagina(pregunta) {
    this.navCtrl.push(FormulariosPage, {
      caso: 4, grupo: pregunta.grupo.idgrupobase, up: pregunta.up, gruponombre: pregunta.grupo.nombre, tipo: pregunta.tipo
    });
  }



  login() {
    let prompt = this.alertCtrl.create({
      title: 'Login',
      message: "Ingrese contraseña para enviar contraseña",
      inputs: [
        {
          name: 'pass',
          placeholder: 'contraseña',
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Enviar',
          handler: data => {
            this.loginp(data);
          }
        }
      ]
    });
    prompt.present();


  }


  loginp(pass) {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Validando datos...'
    });

    loading.present();
    this.authService.login2(this.usuario, pass.pass, this.empresa).finally(() => {
      loading.dismiss();
    }).subscribe(() => {
      this.enviartodo();
      // this.trampita();
    },
      (err) => {
        console.log(err);
        this.handleError(err);
      });
  }

  enviartodo() {
    if (this.evento) {
      this.evento.forEach(up => {
        let productor = JSON.parse(up.datosproductor);
        let nunidad = {
          "productor": {
            idProductor: null,
            nombre: productor.nombre,
            identificacion: productor.identificacion,
            telefono: productor.telefono,
            fechaNacimiento: productor.fechaNacimiento,
            grupoEtnico: productor.grupoEtnico,
            genero: productor.genero,
            estado: true,
            annoIngreso: null,
            createdBy: null,
            created: null,
            modified: null
          },
          unidadProductiva: {
            idUnidadProductiva: null,
            nombre: up.nombre,
            fechaIngreso: null,
            idRegion: up.regionId,
            nivel: 1,
            estado: true,
            longitud: up.localizacion_longitude,
            latitud: up.localizacion_latitude
          }
        }
        console.log('unidad enviada', nunidad);
        this.authHttp.post(`${SERVER_URL}/api/unidadesproductivas/create/movil`, nunidad).subscribe((data) => {


          console.log('id unidad respuesta', data.json().idAsignacion);
          this.db.cambiarunidades(up.idUnidadProductiva, data.json().unidadProductiva.idUnidadProductiva, data.json().idAsignacion).then((ok) => {
            console.log(ok);
            let unidadantigua = up.idUnidadProductiva;
            up.idUnidadProductiva = data.json().unidadProductiva.idUnidadProductiva;
          
            up.idAsignacion=data.json().idAsignacion;
            console.log('up', up);
            if (up.mapa) {
              up.mapa = "data:image/png:base64," + up.mapa;
            }


            console.log(up);
            this.db.formularioid(this.tipo).then((formularioid) => {
              let formulario = formularioid;

              let formularioRespuesta = [];
              this.db.respuestasparaunidad(up.idUnidadProductiva, this.tipo).then((data) => {
                data.forEach((respuestasdigitadas) => {
                  if (respuestasdigitadas.ruta) {
                    this.formulario.enviarfotoprueba(this.rutaimg + `${unidadantigua}/${respuestasdigitadas.grupo.toString()}/${respuestasdigitadas.ruta}`, respuestasdigitadas.ruta, respuestasdigitadas.unidadproductiva);
                  }
                  let valor = respuestasdigitadas.codigorespuestaseleccionada.split('_');
                  if (valor.length > 0) {
                    let i = 0;
                    let indicador = respuestasdigitadas.valorrespuestaseleccionada.split('_');
                    valor.forEach(element => {

                      let respuestassacadas;
                      respuestassacadas = {
                        formularioRespuestaId: {
                          idGrupoBase: respuestasdigitadas.grupo,
                          idPregunta: respuestasdigitadas.pregunta,
                          idRespuesta: respuestasdigitadas.codigorespuestapadre,
                          idValorRespuesta: parseInt(valor[i])
                        },
                        valor: respuestasdigitadas.valorseleccionado,
                        valorIndicador: parseInt(indicador[i]),
                        photoSrc: respuestasdigitadas.ruta,
                        observacion: respuestasdigitadas.observacion
                      }
                      formularioRespuesta.push(respuestassacadas);
                      i = i + 1;
                    });
                  } else {
                    let respuestassacadas;
                    respuestassacadas = {
                      formularioRespuestaId: {
                        idGrupoBase: respuestasdigitadas.grupo,
                        idPregunta: respuestasdigitadas.pregunta,
                        idRespuesta: respuestasdigitadas.codigorespuestapadre,
                        idValorRespuesta: parseInt(respuestasdigitadas.codigorespuestaseleccionada)
                      },
                      valor: respuestasdigitadas.valorseleccionado,
                      valorIndicador: parseInt(respuestasdigitadas.valorrespuestaseleccionada),
                      photoSrc: respuestasdigitadas.ruta,
                      observacion: respuestasdigitadas.observacion
                    }
                    formularioRespuesta.push(respuestassacadas);
                  }
                });
              }).then(() => {
                return this.db.respuestastablaparaunidad(up.idUnidadProductiva, this.tipo).then((respuestastabla) => {
                  if (respuestastabla) {
                    respuestastabla.forEach((respuestasdigitadas) => {

                      let respuestassacadas;
                      respuestassacadas = {
                        formularioRespuestaId: {
                          idGrupoBase: respuestasdigitadas.grupo,
                          idPregunta: respuestasdigitadas.preguntaid,
                          idRespuesta: respuestasdigitadas.respuestascodigo,
                          idValorRespuesta: parseInt(respuestasdigitadas.codigorespuesta)
                        },
                        valor: respuestasdigitadas.valor,
                        valorIndicador: parseInt(respuestasdigitadas.valorrespuesta),
                        photoSrc: null,
                        observacion: null
                      }
                      formularioRespuesta.push(respuestassacadas);
                    })
                  }
                })

              }).then(() => {
                return this.db.noconformidades(up.idUnidadProductiva, this.tipo).then((noconformidad) => {

                  if (noconformidad) {
                    let no_conformidades = [];
                    noconformidad.forEach((nconformidad) => {

                      this.db.tareas(nconformidad.id).then((tareas) => {
                        let no_conformidadesf;
                        let codigonc: any;
                        let asignacionc;
                        if (nconformidad.heredada == 1) {
                          codigonc = nconformidad.id;
                        } else {
                          codigonc = null;
                        }
                        if (nconformidad.asignacion) {
                          asignacionc = nconformidad.asignacion;
                        } else {
                          asignacionc = up.idAsignacion;
                        }
                        if (tareas) {
                          let tareajson = [];
                          tareas.forEach((elementa) => {
                            let codigota: any;
                            console.log(elementa);
                            if (elementa.heredada == 1) {
                              codigota = elementa.id;
                            } else {
                              codigota = null;
                            }

                            tareajson.push({
                              "codigo": codigota,
                              "noConformidad": codigonc,
                              "nombre": elementa.nombre,
                              "descripcion": elementa.detalle,
                              "encargado": elementa.encargado,
                              "estado": elementa.estado,
                              "fechaPautadaCierre": elementa.fechaPautadaCierre,
                              "fechaRealCierre": elementa.fechaRealCierre,
                              "fechaCreacion": elementa.fechaCreacion,
                              "activo": 1,
                              "fechaModificacion": null,
                              "usuarioCreacion": 1,
                              "usuarioModificacion": 1
                            });
                          })
                          no_conformidadesf = {
                            "noConformidad": {
                              "codigo": codigonc,
                              "asignacion": asignacionc,
                              "categoria": nconformidad.categoria,
                              "detalle": nconformidad.detalle,
                              "descripcion": nconformidad.descripcion,
                              "fechaPautadaCierre": nconformidad.fechaposiblecierre,
                              "fechaModificacion": null,
                              "fechaRealCierre": nconformidad.fechafinalizado,
                              "status": nconformidad.estado,
                              "fechaCreacion": nconformidad.fechacreacion,
                              "usuarioCreacion": null,
                              "usuarioModificacion": null,
                              "activo": 1
                            },
                            "tareas": tareajson
                          }
                          no_conformidades.push(no_conformidadesf);

                        } else {
                          no_conformidadesf = {
                            "noConformidad": {
                              "codigo": codigonc,
                              "asignacion": asignacionc,
                              "categoria": nconformidad.categoria,
                              "detalle": nconformidad.detalle,
                              "descripcion": nconformidad.descripcion,
                              "fechaPautadaCierre": nconformidad.fechaposiblecierre,
                              "fechaModificacion": null,
                              "fechaRealCierre": nconformidad.fechafinalizado,
                              "status": nconformidad.estado,
                              "fechaCreacion": nconformidad.fechacreacion,
                              "usuarioCreacion": null,
                              "usuarioModificacion": null,
                              "activo": 1
                            },
                            "tareas": null
                          }
                          no_conformidades.push(no_conformidadesf);
                        }
                      })
                    });
                    let datosaenviar = {
                      formulario: {
                        "formularioBase": { codigo: formulario },
                        "asignacion": up.idAsignacion,
                        'mapa': up.mapa,
                        fechaInicial: up.fechainicio,
                        localizacionInicial: {
                          "longitude": 10.10001,
                          "latitude": 10.000
                        },
                        fechaFinal: up.fechafin,
                        localizacionFinal: {
                          "longitude": 10.0000,
                          "latitude": 10.000
                        }
                      }, formularioRespuesta,
                      no_conformidades
                    };
                    console.log('prueba', datosaenviar);
                    this.formulario.enviarrespuesta(datosaenviar, up, this.tipo)
                  } else {
                    let datosaenviar = {
                      formulario: {
                        "formularioBase": { codigo: formulario },
                        "asignacion": up.idAsignacion,
                        'mapa': up.mapa,
                        fechaInicial: up.fechainicio,
                        localizacionInicial: {
                          "longitude": 10.0000,
                          "latitude": 10.000
                        },
                        fechaFinal: up.fechafin,
                        localizacionFinal: {
                          "longitude": 10.000,
                          "latitude": 10.000
                        },
                      }, formularioRespuesta
                    };


                    console.log('pruebas sin no conformidades', datosaenviar);
                    this.formulario.enviarrespuesta(datosaenviar, up, this.tipo)
                  }


                });
              });



            });

          });




        }, err => {
          console.log('err', err);
        })
      })
      this.items=[];
      this.evento = [];
      this.habilitarenvio = false;
//      this.traerunidades('1');

    } else {
//      this.traerunidades('1');

      this.handleError('Debe recargar la pagina para enviar nuevamente los formularios');
    }


  }


}
