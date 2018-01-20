import { Component } from '@angular/core';
import { ViewController, NavParams, ModalController, ToastController, NavController, AlertController, LoadingController } from 'ionic-angular';
import { UproductivaProvider } from '../../providers/uproductiva/uproductiva';
import { DbProvider } from '../../providers/db/db';
import { FormulariosPage } from '../formularios/formularios';
import { FormulariosProvider } from '../../providers/formularios/formularios';
import { Storage } from "@ionic/storage";
import { AuthProvider } from '../../providers/auth/auth';

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
    public loadingCtrl: LoadingController
  ) {
    this.evento = [];
    this.habilitarenvio = false;
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
    this.storage.get('empresa').then((empresa) => {
      this.empresa = empresa;
    });
    this.storage.get('identificador').then(usuario => {
      this.usuario = usuario;
    });
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }

  comprobarunidades(tipo, $event) {
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
      caso: 4, grupo: pregunta.grupo.idgrupobase, up: pregunta.up.idUnidadProductiva, gruponombre: pregunta.grupo.nombre, tipo: pregunta.tipo
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
      this.enviarunidadesseleccionadas();
    },
      (err) => {
        console.log(err);
        this.handleError(err);
      });
  }
  enviarunidadesseleccionadas() {
    console.log(this.tipo, this.evento);
    this.evento.forEach(up => {
      let enviar = [];
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
        if (this.tipo == 1001) {//promotoria
          datosdeinicio = up.iniciopromotoria.split(',');
          if (datosdeinicio[1] == 'error') {
            datosdeinicio[1] = 10.00000;
          }
          if (datosdeinicio[2] = 'error') {
            datosdeinicio[1] = -10.00000;
          }
          fechainicio = datosdeinicio[0];
          latitudeinicio = datosdeinicio[1];
          longitudeinicio = datosdeinicio[2];
          datosdefinalizacion = up.finpromotoria.split(',');
          if (datosdefinalizacion[1] == 'error') {
            datosdefinalizacion[1] = 30.00000;
          }
          if (datosdefinalizacion[2] = 'error') {
            datosdefinalizacion[2] = -50.00005;
          }
          fechafin = datosdefinalizacion[0];
          latitudefin = datosdefinalizacion[1];
          longitudefin = datosdefinalizacion[2];

        } else {
          datosdeinicio = up.inicioauditoria.split(',');
          fechainicio = datosdeinicio[0];
          if (datosdeinicio[1] == 'error') {
            datosdeinicio[1] = 10.000;
          }
          if (datosdeinicio[2] == 'error') {
            datosdeinicio[2] = 10.000;
          }
          latitudeinicio = datosdeinicio[1];
          longitudeinicio = datosdeinicio[2];
          datosdefinalizacion = up.finauditoria.split(',');
          if (datosdefinalizacion[1] = 'error') {
            datosdefinalizacion[1] = 10.000;
          }
          if (datosdefinalizacion[2] = 'error') {
            datosdefinalizacion[2] = 10.000;
          }
          fechafin = datosdefinalizacion[0];
          latitudefin = datosdefinalizacion[1];
          longitudefin = datosdefinalizacion[2];
        }
        let formularioRespuesta = [];
        this.db.respuestasparaunidad(up.idUnidadProductiva, this.tipo).then((data) => {
          data.forEach((respuestasdigitadas) => {
            let valor = respuestasdigitadas.codigorespuesta.split('_');
            if (valor.length > 0) {
              let i = 0;
              let indicador = respuestasdigitadas.valorrespuesta.split('_');
              valor.forEach(element => {
                let respuestassacadas;
                respuestassacadas = {
                  formularioRespuestaId: {
                    idGrupoBase: respuestasdigitadas.grupo,
                    idPregunta: respuestasdigitadas.pregunta,
                    idRespuesta: respuestasdigitadas.respuestascodigo,
                    idValorRespuesta: parseInt(valor[i])
                  },
                  valor: respuestasdigitadas.valor,
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
                  idRespuesta: respuestasdigitadas.respuestascodigo,
                  idValorRespuesta: parseInt(respuestasdigitadas.codigorespuesta)
                },
                valor: respuestasdigitadas.valor,
                valorIndicador: parseInt(respuestasdigitadas.valorrespuesta),
                photoSrc: respuestasdigitadas.ruta,
                observacion: respuestasdigitadas.observacion
              }
              formularioRespuesta.push(respuestassacadas);
            }
          })
        }).then(() => {
          return this.db.respuestastablaparaunidad(up.idUnidadProductiva, this.tipo).then((respuestastabla) => {
            if (respuestastabla) {
              respuestastabla.forEach((respuestasdigitadas) => {
                if(respuestasdigitadas.ruta){
                  this.formulario.enviarfoto(respuestasdigitadas);
                  console.log(respuestasdigitadas.ruta);
                }
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
          }).then(()=>{
            return this.db.noconformidades(up.idUnidadProductiva, this.tipo).then((noconformidad) => {
              if (noconformidad) {
                let noconformidade = noconformidad;
                let no_conformidades = [];
                noconformidad.forEach((nconformidad) => {
                  this.db.tareas(nconformidad.id).then((tareas) => {
                    let no_conformidadesf;
                    tareas.forEach((tareaguardada)=>{
                      if(tareaguardada.heredado!=1){
                        tareaguardada.id==null;
                      }
                      
                    });
                    if (tareas) {
                      no_conformidadesf = {
                        "no_conformidad": {
                          "categoria": { codigo: nconformidad.categoria },
                          "detalle": nconformidad.detalle,
                          "descripcion": nconformidad.descripcion,
                          "fechaPautadaCierre": nconformidad.fechaposiblecierre,
                          "fechaRealCierre": nconformidad.fechaposiblecierre,
                          "estado": nconformidad.estado,
                          "fechaCreacion": nconformidad.fechacreacion,
                          "tareas": tareas
                        }
                      }
                      no_conformidades.push(no_conformidadesf);

                    } else {
                      no_conformidadesf = {
                        "no_conformidad": {
                          "categoria": { codigo: nconformidad.categoria },
                          "detalle": nconformidad.detalle,
                          "descripcion": nconformidad.descripcion,
                          "fechaPautadaCierre": nconformidad.fechaposiblecierre,
                          "fechaRealCierre": nconformidad.fechaposiblecierre,
                          "estado": nconformidad.estado,
                          "fechaCreacion": nconformidad.fechacreacion,
                          "tareas": null
                        }
                      }
                      no_conformidades.push(no_conformidadesf);
                    }
                  })
                })
                let datosaenviar = {
                  formulario: {
                    "formularioBase": { codigo: formulario },
                    "asignacion": { idAsignacion: up.idAsignacion }, fechaInicial: datosdeinicio[0],
                    localizacionInicial: {
                      "longitude": datosdeinicio[1],
                      "latitude": datosdeinicio[2]
                    },
                    fechaFinal: datosdefinalizacion[0],
                    localizacionFinal: {
                      "longitude": datosdefinalizacion[1],
                      "latitude": datosdefinalizacion[2]
                    }
                  }, formularioRespuesta,
                  no_conformidades
                };
                console.log('prueba', datosaenviar);
                this.formulario.enviarrespuesta(datosaenviar, up, this.tipo).then((ok)=>{
                  let envio=ok;
                  if(ok){
                    this.handleError('formulario de la unidad productiva '+up.nombre+' envidado correctamente');
                  }else{
                    this.handleError('formulario de la unidad productiva '+up.nombre+' no se puedo enviar, intentelonuevamente');
                  }
                });;
              }else{
                let datosaenviar= {
                  formulario: {
                    "formularioBase": { codigo: formulario },
                    "asignacion": { idAsignacion: up.idAsignacion }, fechaInicial: datosdeinicio[0],
                    localizacionInicial: {
                      "longitude": datosdeinicio[1],
                      "latitude": datosdeinicio[2]
                    },
                    fechaFinal: datosdefinalizacion[0],
                    localizacionFinal: {
                      "longitude": datosdefinalizacion[1],
                      "latitude": datosdefinalizacion[2]
                    }
                  }, formularioRespuesta
                };
                console.log('pruebas sin no conformidades', datosaenviar);
                this.formulario.enviarrespuesta(datosaenviar,up,this.tipo).then((ok)=>{
                  let envio=ok;
                  if(ok){
                    this.handleError('formulario de la unidad productiva '+up.nombre+' envidado correctamente');
                  }else{
                    this.handleError('formulario de la unidad productiva '+up.nombre+' no se puedo enviar, intentelonuevamente');
                  }
                });
              }
            })

          });
        })


      });

    })
  }




}