import { Component } from '@angular/core';
import { ViewController, NavParams, ModalController, ToastController, NavController, AlertController, LoadingController } from 'ionic-angular';
import { UproductivaProvider } from '../../providers/uproductiva/uproductiva';
import { DbProvider } from '../../providers/db/db';
import { FormulariosPage } from '../formularios/formularios';
import { FormulariosProvider } from '../../providers/formularios/formularios';
import { Storage } from "@ionic/storage";
import { AuthProvider } from '../../providers/auth/auth';
import { File, DirectoryEntry } from '@ionic-native/file';
import { HomePage } from './home';
import { FORMULARIO_AUDITORIA } from '../../config';
import { FORMULARIO_PROMOTORIA } from '../../config';
@Component({

  templateUrl: 'sinc.html'

})
export class EnviardatosPage {
  img: any;
  upp: any;
  upa: any;
  habilitarenvio;
  evento;
  tipo;
  preguntassinresponder: any;
  decide: any;
  usuario;
  empresa;
  rutaimg;
  auditor: boolean;
  promotor: boolean;
  auditorseleccionado: boolean;
  promotorseleccionado: boolean;

  constructor(
    public authService: AuthProvider,
    private toastCtrl: ToastController,
    public uproductiva: UproductivaProvider,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public db: DbProvider,
    public navCtrl: NavController,
    public formulario: FormulariosProvider,
    private readonly storage: Storage,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private file: File
  ) {
    this.auditorseleccionado = false;
    this.promotorseleccionado = false;
    this.storage.get('roll').then(roll => {
      if (roll) {
        console.log('roll', roll);
        if (roll.indexOf("Auditor") > -1) {
          this.formulario.formularioid(FORMULARIO_AUDITORIA).then((idf) => {
            if(idf){
              this.auditor = true;
            }
          });
        }
        if (roll.indexOf("Promotor") > -1) {
          this.formulario.formularioid(FORMULARIO_PROMOTORIA).then((idf) => {
            if(idf){
              this.promotor = true;
            }
          });
        }
      }
    }
    );

    this.evento = [];
    this.habilitarenvio = false;
    this.uproductiva.llamarunidadesproductivasiniciadas(1001).then((data) => {
      this.upp = data;
      if (this.upp.length == 0) {
        this.upp = false;
      }

    });
    this.uproductiva.llamarunidadesproductivasiniciadas(1002).then((data) => {
      this.upa = data;
      if (this.upa.length == 0) {

        this.upa = false;
      }
    });

    this.storage.get('empresa').then((empresa) => {
      this.empresa = empresa;
    });
    this.storage.get('identificador').then(usuario => {
      this.usuario = usuario;
    });
    this.rutaimg = this.file.externalDataDirectory;
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }
  habilitartipo($event) {
    console.log($event);
    if ($event == 1001) {
      this.auditorseleccionado = false;
      this.promotorseleccionado = true;

    } else {
      this.auditorseleccionado = true;
      this.promotorseleccionado = false;
    }
  }

  comprobarunidades(tipo, $event) {
    console.log(tipo, $event);
    this.tipo = tipo;
    this.preguntassinresponder = [];
    this.evento = $event;
    $event.forEach(up => {
      let formulario;
      let enviar = [];
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
            let preguntas = [];
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

  abrirpagina(pregunta) {
    this.tipo = pregunta.tipo;
    this.navCtrl.push(FormulariosPage, {
      caso: 4, grupo: pregunta.grupo.idgrupobase, up: pregunta.up, gruponombre: pregunta.grupo.nombre, tipo: pregunta.tipo
    });
  }


  ionViewWillEnter() {
    if (this.evento.length == 0) {

    } else {
      this.comprobarunidades(this.tipo, this.evento);
    }
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
        console.log('up', up);
        if(up.mapa){
          up.mapa="data:image/png:base64,"+up.mapa;
        }

        let enviar = [];
        console.log(up);
        this.db.formularioid(this.tipo).then((formularioid) => {
          let formulario = formularioid;
          let datosdeinicio;
          let datosdefinalizacion;
          let fechainicio;
          let fechafin;
          let latitudeinicio;
          let longitudeinicio;
          let latitudefin;
          let longitudefin;

          let formularioRespuesta = [];
          this.db.respuestasparaunidad(up.idUnidadProductiva, this.tipo).then((data) => {
            data.forEach((respuestasdigitadas) => {
              if (respuestasdigitadas.ruta) {
                this.formulario.enviarfotoprueba(this.rutaimg + `${respuestasdigitadas.unidadproductiva}/${respuestasdigitadas.grupo.toString()}/${respuestasdigitadas.ruta}`, respuestasdigitadas.ruta);
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
              console.log('nconformidad', noconformidad);
              if (noconformidad) {
                let noconformidade = noconformidad;
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
                          "fechaRealCierre": nconformidad.fechafinalizado ,
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
                 this.formulario.enviarrespuesta(datosaenviar, up, this.tipo).then((ok) => {
                  let envio = ok;
                  if (ok) {
                  } else {
                    this.handleError('formulario de la unidad productiva ' + up.nombre + ' no se puedo enviar, intentelonuevamente');
                  }
                }); 


              }else {
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
                this.formulario.enviarrespuesta(datosaenviar, up, this.tipo).then((ok) => {
                  let envio = ok;
                  if (ok) {
                    this.handleError('formulario de la unidad productiva ' + up.nombre + ' envidado correctamente');
                  } else {
                    this.handleError('formulario de la unidad productiva ' + up.nombre + ' no se puedo enviar, intentelonuevamente');
                  }
                });
              }


            });
          });



        });

      });
            this.evento=[];
            this.habilitarenvio=false;
             this.uproductiva.llamarunidadesproductivasiniciadas(1001).then((data) => {
              this.upa = data;
              if (this.upa.length == 0) {
                this.upa = false;
              }
            });

            this.uproductiva.llamarunidadesproductivasiniciadas(1002).then((data) => {
              this.upp = data;
              if (this.upp.length == 0) {
                this.upa = false;
              }
            });
      
          } else {
            this.uproductiva.llamarunidadesproductivasiniciadas(1001).then((data) => {
              this.upa = data;
              if (this.upa.length == 0) {
                this.upa = false;
              }
            });
            this.uproductiva.llamarunidadesproductivasiniciadas(1002).then((data) => {
              this.upp = data;
              if (this.upp.length == 0) {
                this.upa = false;
              }
            });
      
            this.handleError('Debe recargar la pagina para enviar nuevamente los formularios');
    }
  }

  trampita() {
    this.evento.forEach(element => {
      let loading = this.loadingCtrl.create({
        spinner: 'bubbles',
        content: 'Enviando datos...',
        duration: 10000
      })
      loading.present();
      loading.dismiss().then(() => {
        this.handleError('Formulario enviado par la unidad ' + element.nombre);
      });

    });



  }


}