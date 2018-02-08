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
formularioid(caso){
  return this.database.formularioid(caso).then((data: any) => {
   return this.items = data;
  });
}
  gruposbase(caso) {
    return this.database.formularioid(caso).then((data: any) => {
      console.log('idf', data);
     return this.database.gruposbyid(data).then(grupodb => {
        this.items = grupodb;
        console.log(this.items);
        return this.items;
      });
      
//      return this.items; 
    });
  }
  preguntasgrupo(grupo,tipo ) {
    return this.database.preguntasporgrupo(grupo,tipo).then((data: any) => {
      this.items = data;

      return this.items;
    });
  }
  respuestasporpreguntas(codigosrespuesta, up, grupo, tipo) {
    let loading= this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando informacion...'
    });
    loading.present();
    return this.database.respuestasporpregunta(codigosrespuesta).then(data => {
      console.log(data)
      this.items = data;
      return this.items;
    }, err=>{loading.dismiss();
      this.handleError('Error cargando informacion, intentelo nuevamente');
    }).then(() => {
      return this.database.respuestasguardadas(up, grupo, tipo).then((dt) => {
        console.log('guardado',dt);
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
                    console.log('prueba',valores.valorseleccionado);
                    respuestas.respuesta = valores.valorseleccionado;
                    respuestas.ruta = valores.ruta;
                  } else if (respuestas.tipo == 210002) {
                    respuestas.ruta = valores.ruta;
                    respuestas.respuesta = parseInt(valores.valorseleccionado);
                  } else if (respuestas.tipo == 210004) {
                    respuestas.ruta = valores.ruta;
                    let arrayvalores;
                    if (valores.valorrespuestaseleccionada) {
                      arrayvalores = valores.valorrespuestaseleccionada.split('_');
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
        loading.dismiss();
        return this.items;
      })
    }).catch(err => {         loading.dismiss();
      this.handleError('Error cargando informacion, intentelo nuevamente');
 });
  }


  respuestasguardada(up, grupo, tipo) {
    return this.database.respuestasguardadas(up, grupo, tipo).then((dt) => {
      this.items = dt;
      return this.items;
    })
  }

  guardar3001(unidadp, grup, codigopararespuestas, preguntaid, codigosdelasrespuestas, valoresdelasrespuestas, valortext, tipoformulario) {
    this.database.guardarrespuestaporpregunta(unidadp, grup, codigopararespuestas, preguntaid, codigosdelasrespuestas, valoresdelasrespuestas, valortext, tipoformulario).then(()=>
      this.database.respuestasguardadast().then((d)=>{console.log('d',d)},err=>{console.log('e',err)})
    ).catch((err) => { console.log(err) });
    
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
//codigorespuestadelapregunta, unidadp, grupo, preguntaid(hijadela tabla),tipodeformulario
  respuestastablas(codigorespuesta, up, grupo, preguntapadre, tipo, preguntaid) {
    let loading= this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando informacion...'
    });
    loading.present();
    
    return this.database.respuestasapreguntastablas(codigorespuesta).then((data) => {
      this.items = data;
      return this.items;
    }).then(() => {
      let inicial=0;
      let cant=this.items.length;
      this.items.forEach(element => {
        return this.database.respuestasguardadastabla(up, grupo, preguntapadre, preguntaid, element.codigo, tipo).then((respuesta) => {
//          console.log('encontro una respuesta',respuesta);
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
         inicial=inicial+1;
         if(inicial == cant){
          loading.dismiss();

         } 
        },err=>{
          inicial=inicial+1;
          if(inicial == cant){
           loading.dismiss();

          }
          this.handleError('error cargando informacion, intento nuevamente');});
      });
      return this.items;
    }).catch((err) => {
      this.handleError('error cargando informacion, intento nuevamente');
      loading.dismiss();
      console.log(err);
    });
 
  }
  guardarpreguntatabla(unidadp, grup, codigopararespuestas, preguntapadre, preguntaid, codigosdelasrespuestas, valoresdelasrespuestas, valortext, tipoformulario) {
    this.database.guardarrespuestaporpreguntatabla(unidadp, grup, codigopararespuestas, preguntapadre, preguntaid, codigosdelasrespuestas, valoresdelasrespuestas, valortext, tipoformulario);
  }
  guardarrespuestatabla(up, grupoidselected, codrespuesta, preguntaid, preguntapadre, valorcodigo, valorvalor, valor, tipocuestionario) {
    this.database.guardarrespuestaporpreguntatabla(up, grupoidselected, codrespuesta, preguntapadre, preguntaid, valorcodigo, valorvalor, valor, tipocuestionario).then((ok)=>{},(err)=>{console.log('este es el erorr',err)});
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
  guardarubicacion(unidad, datofecha, latitud, longitud, caso) {
    this.database.guardarubicacion(unidad, datofecha, latitud, longitud, caso).then((d)=>{console.log(d)},err=>{console.log(err)});
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
    this.database.cambiarestado(up.idUnidadProductiva, 2, up.tipo).then(() => {
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
