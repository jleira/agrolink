import { Component } from '@angular/core';
import { ViewController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { FormulariosProvider } from '../../providers/formularios/formularios';
import { DateTime } from 'ionic-angular/components/datetime/datetime';

@Component({

  templateUrl: 'noconformidad.html'

})
export class NuevanoconformidadPage {
  img: any;
  up;
  tipo;
  id: number;
  descripcion: string;
  detalle: string;
  categoria;
  fecha;
  tareas;
  productor;
  categorias: any;
  habilitartarea: boolean;
  habilitarcreacion: boolean;
  fechadecierre;
  constructor(
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public formulario: FormulariosProvider
  ) {

    this.productor = this.navParams.get('productor');
    this.up = this.navParams.get('up');
    this.tipo = this.navParams.get('tipo');
    let idd = this.navParams.get('id');

    if (idd) {
      this.habilitarcreacion = false;
      this.id = idd;
      this.habilitartarea = true;
      this.formulario.tareas(idd).then((data) => {
        if(data)
        {
          data.forEach(element => {
            element.fechaPautadaCierre = this.fechatoinp(element.fechaPautadaCierre);
            element.fechaRealCierre = this.fechatoinp(element.fechaRealCierre);
          });
  
        }

        this.tareas = data;
        console.log(this.tareas);
        return this.tareas;
      });
      this.formulario.noconformidadid(this.id).then((data) => {
        this.descripcion = data[0].descripcion;
        this.detalle = data[0].detalle;
        this.fecha = data[0].fechaposiblecierre;
        this.fechadecierre = data[0].fechafinalizado;

        if (data[0].estado == 0) {
          this.habilitartarea = true;

        } else {
          this.habilitartarea = false;
        }
        console.log(data);
        return (this.descripcion, this.descripcion, this.detalle);

      });
    } else {
      this.habilitarcreacion = true;
      this.habilitartarea = false;
    }
    this.formulario.categoria().then((categoriasg) => {
      this.categorias = categoriasg;
    })
  }
  noconformidad(values) {
    let dt = new Date();
    let month = ("0" + (dt.getMonth() + 1)).slice(-2);
    let day = ("0" + dt.getDate()).slice(-2);
    let year = dt.getFullYear();
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Validando datos...'
    });
    loading.present();
    this.formulario.guardarnoconformidades(this.up, this.tipo, values.categoria, values.detalle, values.descripcion, year + '-' + month + '-' + day, values.fecha, 0).then((data) => {
      if (data) {
        this.habilitartarea = true;
        this.id = data;
        this.categoria = values.categoria;
        this.detalle = values.detalle;
        this.descripcion = values.descripcion;
        this.fecha = values.fecha;
        this.fechadecierre = 'Noconformidad en progreso';
        this.habilitarcreacion = false;
      } else {
        this.handleError('Error guardando no conformidad, intente guardar nuevamente');
      }
      loading.dismiss();
    }).catch((err) => {
      this.handleError('Error guardando no conformidad, intente guardar nuevamente');
      console.log(err);
      loading.dismiss();

    });
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }

  agregartarea() {
    let prompt = this.alertCtrl.create({
      title: 'Nueva tarea',
      message: "Agregar nueva tarea, ára la fecha de culminacion ingresela con el siguente formato (año-mes-dia) ejemplo('30/12/2018')",
      inputs: [
        {
          name: 'nombre',
          placeholder: 'ingrese nombre',
        },
        {
          name: 'descripcion',
          placeholder: 'ingrese descripcion'
        },
        {
          name: 'encargado',
          placeholder: 'ingrese nombre',
          value: this.productor
        },
        {
          name: 'fecha',
          placeholder: 'fecha de culminacion'
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
          text: 'Crear',
          handler: data => {
            if (data.fecha == '' || data.nombre == '' || data.encargado == '') {
              this.handleError('Los campos nombre, fecha y prodcutor son requeridos');
            } else {
              if (this.validarFormatoFecha(data.fecha)) {
                if (this.existeFecha(data.fecha)) {
                  let fechac = this.fecha.split('-');
                  let y = fechac[0];
                  let m = fechac[1];
                  let d = fechac[2];
                  if (this.validarFechaMenorActual(data.fecha)) {
                    data.fecha = this.fechatodb(data.fecha);
                    this.guardartarea(data);
                  }
                  else {
                    this.handleError('La fehca no puede ser superior a la fecha de cierre de la no conformidad');
                  }
                } else {
                  this.handleError('La fecha ingresada no existe');
                }
              }
              else {
                this.handleError('Formato de fecha no valido');
              }
            }
          }
        }
      ]
    });
    prompt.present();
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

  editarnoconformidad(id, columna, valor) {
    let dt = new Date();
    let month = dt.getMonth() + 1;
    let day = dt.getDate();
    let year = dt.getFullYear();
    return this.formulario.editarnoconformidad(id, columna, valor).then((data) => {
      console.log(data);
    })
  }
  guardartarea(data: any) {
    let dt = new Date();
    let month = dt.getMonth() + 1;
    let day = dt.getDate();
    let year = dt.getFullYear();

    this.formulario.agregartarea(this.id, data.nombre, data.descripcion, data.encargado, data.fecha, 0, year + '-' + month + '-' + day).then((data) => {
      console.log(data);
      this.formulario.tareas(this.id).then((tar) => { 
        tar.forEach(element => {
          element.fechaPautadaCierre = this.fechatoinp(element.fechaPautadaCierre);
          element.fechaRealCierre = this.fechatoinp(element.fechaRealCierre);
        });
        this.tareas = tar;
      })
    }, err => {
      this.handleError('error al guardar tarea, intentelo nuevamente');
    })

  }

  editartareaid(id, data, estado) {
    console.log(data);
    data.fecha = this.fechatodb(data.fecha);
    this.formulario.tareaseditar(id, data.nombre, data.descripcion, data.encargado, data.fecha, estado, null).then((data) => {
      console.log(data);
      this.formulario.tareas(this.id).then((tar) => {
        tar.forEach(element => {
          element.fechaPautadaCierre = this.fechatoinp(element.fechaPautadaCierre);
          element.fechaRealCierre = this.fechatoinp(element.fechaRealCierre);
        });
        this.tareas = tar;
        console.log(this.tareas);
      })
    }, err => {
      this.handleError('error al guardar tarea, intentelo nuevamente');
    }).catch((err) => {
      console.log(err);
      this.handleError('error al guardar tarea, intentelo nuevamente');

    })
  }
  finalizartareaid(id, data, estado) {
    let fechacierrereal;
    let dt = new Date();
    let month = dt.getMonth() + 1;
    let day = dt.getDate();
    let year = dt.getFullYear();
    fechacierrereal = year + '-' + month + '-' + day;

    data.fechaPautadaCierre = this.fechatodb(data.fechaPautadaCierre);
    this.formulario.tareaseditar(id, data.nombre, data.detalle, data.encargado, data.fechaPautadaCierre, estado, fechacierrereal).then((data) => {

      this.formulario.tareas(this.id).then((tar) => {
        tar.forEach(element => {
          element.fechaPautadaCierre = this.fechatoinp(element.fechaPautadaCierre);
          element.fechaRealCierre = this.fechatoinp(element.fechaRealCierre);
        });
        this.tareas = tar;
         })
    }, err => {
      this.handleError('error al guardar tarea, intentelo nuevamente');
    }).catch((err) => {
      console.log(err);
      this.handleError('error al guardar tarea, intentelo nuevamente');

    })
  }

  editartarea(item: any) {
    let prompt = this.alertCtrl.create({
      title: 'Editar tarea ' + item.id,
      message: "Edite los campos, pára la fecha de culminacion ingresela con el siguente formato (año-mes-dia) ejemplo('2018-12-30)",
      inputs: [
        {
          name: 'nombre',
          placeholder: 'ingrese nombre',
          value: item.nombre
        }, {
          name: 'descripcion',
          placeholder: 'ingrese descripcion',
          value: item.detalle
        }, {
          name: 'encargado',
          placeholder: 'ingrese nombre',
          value: item.encargado
        }, {
          name: 'fecha',
          placeholder: 'fecha de culminacion',
          value: item.fechaposibleculminacion
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
          text: 'Editar',
          handler: data => {
            if (data.fecha == '' || data.nombre == '' || data.encargado == '') {
              this.handleError('Los campos nombre, fecha y prodcutor son requeridos');
            } else {
              if (this.validarFormatoFecha(data.fecha)) {
                if (this.existeFecha(data.fecha)) {
                  console.log(this.fecha.split('-'));
                  let fechac = this.fecha.split('-');
                  let y = fechac[0];
                  let m = fechac[1];
                  let d = fechac[2];
                  if (this.validarFechaMenorActual(data.fecha)) {
                    this.editartareaid(item.id, data, 0);
                  }
                  else {
                    this.handleError('La fecha debe ser menor a la fehca de cierre de la no conformidad');
                  }
                } else {
                  this.handleError('La fecha ingresada no existe');
                }
              }
              else {
                this.handleError('Formato de fecha no valido');
              }
            }
          }
        }
      ]
    });
    prompt.present();
  }
  verdetalles(tareaid) {
    console.log(tareaid);
    let mensaje: string;
    let estado;
    let fechacierre;
    //
    if (tareaid.estado == 0) {
      estado = 'en proceso';
    }

    if (tareaid.estado == 1) {
      estado = 'terminado';
    }
    if (tareaid.fechaRealCierre == '') {
      tareaid.fechaRealCierre = 'tarea en proceso'
    }
    mensaje = 'id:' + tareaid.id + '\n descripcion: ' + tareaid.detalle + '\nfecha programada de cierre: ' + tareaid.fechaPautadaCierre
      + ' \n estado:' + estado + '\n fecha de cierre: ' + tareaid.fechaRealCierre;
    let prompt = this.alertCtrl.create({
      title: tareaid.nombre,
      message: mensaje,
      buttons: [
        {
          text: 'Cerrar',
          handler: data => {
          }
        }
      ]
    });
    prompt.present();
  }


  validarFechaMenorActual(date) {
    let x = new Date();
    let fecha = date.split("/");
    x.setFullYear(fecha[2], fecha[1] - 1, fecha[0]);
    let fechac = this.fecha.split('-');
    let y = fechac[0];
    let m = fechac[1];
    let d = fechac[2];
    let fechacomparacion = new Date();
    fechacomparacion.setFullYear(y, m - 1, d);

    if (x > fechacomparacion)
      return false;
    else
      return true;
  }
  existeFecha(fecha) {
    var fechaf = fecha.split("/");
    var d = fechaf[0];
    var m = fechaf[1];
    var y = fechaf[2];
    return m > 0 && m < 13 && y > 0 && y < 32768 && d > 0 && d <= (new Date(y, m, 0)).getDate();
  }
  validarFormatoFecha(campo) {
    let RegExPattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
    if ((campo.match(RegExPattern)) && (campo != '')) {
      return true;
    } else {
      return false;
    }
  }
  finalizartarea(tareaid) {
    //
    let mensaje;
    mensaje = 'Una vez termianda la tarea no se podra editar no cambiar su estado';
    let prompt = this.alertCtrl.create({
      title: 'Desea terminar la ' + tareaid.nombre,
      message: mensaje,
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
          }
        }, {
          text: 'Cambiar estado',
          handler: data => {
            this.finalizartareaid(tareaid.id, tareaid, 1);
          }
        }

      ]
    });
    prompt.present();
  }

  fechatoinp(fecha) {
    if (fecha !== null) {
      let fechac = fecha.split('-');
      let y = fechac[0];
      let m = fechac[1];
      let d = fechac[2];
      return d + '/' + m + '/' + y;

    } else {
      return "Tarea en proceso";
    }

  }
  fechatodb(fecha) {
    let fechac = fecha.split('/');
    let d = fechac[0];
    let m = fechac[1];
    let y = fechac[2];
    return y + '-' + m + '-' + d;
  }

  finalizarnoconformidad() {
    let habilitarfinalizar=true;
    this.tareas.forEach(element => {
      if(element.estado==0){
        habilitarfinalizar=false;
      }
    });

    if(habilitarfinalizar==true){
      let dt = new Date();
      let month = dt.getMonth() + 1;
      let day = dt.getDate();
      let year = dt.getFullYear();
      this.formulario.editarnoconformidad(this.id, 'fechafinalizado', year + '-' + month + '-' + day).then((data) => {
        console.log(data);
      }).then(() => {
        this.formulario.editarnoconformidad(this.id, 'estado', 1).then(() => {
          this.habilitartarea = false;
          this.habilitarcreacion = false;
        });
  
  
      }).catch((err) => {
        this.handleError('error, intentelo nuevamente');
        console.log(err);
      })
    }else{
      this.handleError('Para cerrar la no conformidad primero debe culminar todas las tareas ');
    }


  }



}