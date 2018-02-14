import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class DbProvider {

  private database: SQLiteObject;
  private dbReady = new BehaviorSubject<boolean>(false);

  constructor(
    private platform: Platform,
    private sqlite: SQLite
  ) {
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'agrolink.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          this.database = db;
          this.createTables().then(() => {
            this.dbReady.next(true);
          }
          );
        })
    });

  }
  creartablas() {
    return this.createTables();
  }

  private createTables() {
    return this.database.executeSql(
      `CREATE TABLE IF NOT EXISTS paises (
            id INTEGER PRIMARY KEY,
            nombre TEXT
          );`
      , {}).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS departamentos (
            id INTEGER PRIMARY KEY,
            nombre TEXT,
            paisid INTEGER
            );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS municipios (
            id INTEGER PRIMARY KEY,
            nombre TEXT,
            departamentoid INTEGER
            );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS regiones (
            id INTEGER PRIMARY KEY,
            nombre TEXT,
            prefijo TEXT,
            municipioid INTEGER
            );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS productores (
            idProductor INTEGER PRIMARY KEY,
            nombre TEXT,
            identificacion INTEGER,
            telefono TEXT,
            annoIngreso TEXT,
            ultimaAplicacion TEXT
            );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS unidades_productivas (            
            idUnidadProductiva TEXT,
            nombre TEXT,
            fechaIngreso TEXT,
            regionId INTEGER,
            localizacion_longitude TEXT,
            localizacion_latitude TEXT,
            terminado INTEGER,
            tipo INTEGER,
            idAsignacion INTEGER,
            IdProductor INTEGER,
            fechainicio TEXT,
            latitudinicio TEXT,
            longitudinicio TEXT,
            fechafin TEXT,
            latitudfin TEXT,
            longitudfin TEXT,
            mapa TEXT,
            datosproductor TEXT
            );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS formularios (
                    id INTEGER PRIMARY KEY,
                    nombre TEXT,
                    observaciones TEXT,
                    tipo INTEGER,
                    periodo TEXT
                  );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS pendientes (
                    id INTEGER,
                    img TEXT,
                    estado INTEGER
                    );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS grupos (
              idgrupobase INTEGER,
              nombre TEXT,
              posicion INTEGER,
              formularioid INTEGER,              
              textoayuda TEXT
            );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS preguntas (
                codigo INTEGER,
                enunciado TEXT,
                posicion INTEGER,
                tipo INTEGER,
                valorinicial TEXT,
                grupoid INTEGER,
                estado INTEGER,
                requerido INTEGER,
                codigorespuesta INTEGER,
                archivo INTEGER,
                encabezado TEXT,
                tipoformulario INTEGER
              );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS respuestas (
                  codigo INTEGER PRIMARY KEY,
                  nombre TEXT,
                  valor INTEGER,
                  tipo INTEGER,
                  codigorespuestapadre INTEGER
                );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS respuestasguardadas (
                    id INTEGER PRIMARY KEY,
                    unidadproductiva TEXT,
                    grupo INTEGER,
                    pregunta INTEGER,
                    codigorespuestapadre INTEGER, 
                    codigorespuestaseleccionada TEXT,
                    valorrespuestaseleccionada TEXT,
                    valorseleccionado TEXT,
                    observacion TEXT,
                    ruta TEXT,
                    tipoformulario INTEGER
           );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS preguntastabla (
            preguntaid INTEGER PRIMARY KEY,
            preguntapadre INTEGER,
            enunciado TEXT,
            fila INTEGER,
            codigorespuesta INTEGER,
            observacion INTEGER
            );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS respuestastabla (
            codigo INTEGER PRIMARY KEY,
            nombre TEXT,
            valor INTEGER,
            constante TEXT,
            tipo INTEGER,
            codigorespuesta INTEGER
                    );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS respuestasguardadastabla (
                    id INTEGER PRIMARY KEY,
                    unidadproductiva TEXT,
                    grupo INTEGER,
                    preguntapadre INTERGER,
                    preguntaid INTEGER,
                    respuestascodigo INTEGER, 
                    codigorespuesta TEXT,
                    valorrespuesta TEXT,
                    valor TEXT,
                    observacion TEXT,
                    ruta TEXT,
                    tipoformulario INTEGER


                  );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS noconformidades (
                    id INTEGER PRIMARY KEY,
                    unidadproductiva TEXT,
                    tipo INTEGER,
                    categoria INTEGER,
                    descripcion TEXT,
                    detalle TEXT,
                    fechacreacion TEXT,
                    heredada INTEGER,
                    fechaposiblecierre TEXT, 
                    estado INTEGER,
                    fechafinalizado TEXT,
                    asignacion INTEGER
                  );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS listacategoria ( 
                    id INTEGER,
                    nombre TEXT
                  );`, {})
      }).then(() => {
        return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS tareas (
                    id INTEGER PRIMARY KEY,
                    noconformidad INTEGER,
                    nombre TEXT,
                    detalle TEXT,
                    encargado TEXT,
                    heredada INTEGER,
                    fechaPautadaCierre TEXT,
                    estado INTEGER,
                    fechaCreacion TEXT,
                    fechaRealCierre TEXT

                  );`, {})
      }).catch((err) => console.log("error detected creating tables", err));
  }
  private isReady() {
    return new Promise((resolve, reject) => {
      if (this.dbReady.getValue()) { resolve(); }
      else {
        this.dbReady.subscribe((ready) => {
          if (ready) {
            resolve();
          }
        });
      }
    })
  }

  

  agregarregion(caso, id, nombre, padre, prefijo) {
    if (caso == 1) {
      return this.isReady()
        .then(() => {

          return this.database.executeSql(`INSERT INTO paises 
                  (id, nombre) VALUES (?, ?);`,
            [id, nombre]);
        });
    } else {
      if (caso == 4) {
        return this.isReady()
          .then(() => {
            return this.database.executeSql(`INSERT INTO regiones 
                    (id, nombre,prefijo,municipioid ) VALUES (?, ?,?,?);`,
              [id, nombre, prefijo, padre]);
          });
      } else {
        let item: any;
        let pid: any;

        if (caso == 2) {
          item = 'departamentos';
          pid = 'paisid';
        } else if (caso == 3) {
          item = 'municipios';
          pid = 'departamentoid';
        }
        return this.isReady()
          .then(() => {
            return this.database.executeSql(`INSERT INTO ${item} 
                  (id, nombre,${pid}) VALUES (?, ?,?);`,
              [id, nombre, padre]);
          });
      }
    }
  }

  agregarproductor(id, nombre, identificacion, telefono, annoIngreso, UltimaAplicacion) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`INSERT INTO productores 
                (idProductor, nombre,identificacion,telefono,annoIngreso,ultimaAplicacion ) VALUES (?, ?,?,?,?,?);`,
          [id, nombre, identificacion, telefono, annoIngreso, UltimaAplicacion]);
      });
  }
  agregarunidadproductiva(idUnidadProductiva, nombre, fechaIngreso, regionId, localizacion_longitude, localizacion_latitude, IdProductor, tipo, idAsignacion) {
    return this.isReady()
      .then(() => {

        return this.database.executeSql(`INSERT INTO unidades_productivas
                (idUnidadProductiva,nombre,fechaIngreso,regionId,localizacion_longitude,localizacion_latitude,IdProductor, terminado, tipo,idAsignacion ) VALUES (?, ?,?,?,?,?,?,?,?, ?);`,
          [idUnidadProductiva, nombre, fechaIngreso, regionId, localizacion_longitude, localizacion_latitude, IdProductor, 0, tipo, idAsignacion]);
      });
  }


  agregarunidadproductivamovil(idUnidadProductiva, nombre, fechaIngreso,
     regionId, localizacion_longitude, localizacion_latitude, IdProductor, 
     tipo, idAsignacion,datosproductor ){
      return this.isReady()
      .then(() => {

        return this.database.executeSql(`INSERT INTO unidades_productivas
                (idUnidadProductiva,nombre,fechaIngreso,regionId,localizacion_longitude,localizacion_latitude,IdProductor, terminado, tipo,idAsignacion, datosproductor ) VALUES (?, ?,?,?,?,?,?,?,?,?,?);`,
          [idUnidadProductiva, nombre, fechaIngreso, regionId, localizacion_longitude, localizacion_latitude, IdProductor, 0, tipo, idAsignacion, datosproductor]);
      });


  }

  existeproductor(id: number) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT idProductor FROM productores WHERE idProductor =  ${id}`, []).then((data) => {
        let decide;
        if (data.rows.length > 0) {
          decide = 1;
        } else {
          decide = 0;
        }
        return decide;
      })
    })
  }



  todasuproductivasap(caso) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT idUnidadProductiva, nombre, regionId, IdProductor, terminado, tipo, mapa from unidades_productivas WHERE tipo IN (${caso},1003)`, []).then((data) => {
          let todas = [];
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            this.nombreregion(todo.regionId).then((data: any) => {
              todo.region = data;
            });
            this.nombreproductor(todo.IdProductor).then((data: any) => {
              todo.productor = data;
            });
            todas.push(todo);
          }
          return todas;
        }, err => { })
      })
  }

  nombreregion(id: number) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT nombre FROM regiones WHERE id =  ${id}`, []).then((data) => {
        let region;
        if (data.rows.length) {
          let todo = data.rows.item(0).nombre;
          region = todo;
        } else {
          let todo;
          todo = "no existe region con este id";
          region = todo;
        }
        return region;
      })
    })
  }
  nombreproductor(id: number) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT nombre FROM productores WHERE idProductor =  ${id}`, []).then((data) => {
        let productor;
        if (data.rows.length) {
          let todo = data.rows.item(0).nombre;
          productor = todo;
        } else {
          let todo;
          todo = '';
          productor = todo;
        }
        return productor;
      })
    })
  }


  unidadproductivaporid(id,tipo) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT * from unidades_productivas WHERE  idUnidadProductiva =  (?) and tipo = (?)`, [id,tipo])
          .then((data) => {
            let todas = [];
            for (let i = 0; i < data.rows.length; i++) {
              let todo = data.rows.item(i);
              this.datosregion(todo.regionId).then((data: any) => {
                todo.municipioid = data.municipioid;
                todo.regionnombre = data.nombre;
              });
              this.datosproductor(todo.IdProductor).then((data: any) => {
                todo.productornombre = data.nombre;
                todo.identificacion = data.identificacion;
                todo.telefono = data.telefono;
                todo.annoIngreso = data.annoIngreso;
                todo.ultimaAplicacion = data.ultimaAplicacion;
              });
              todas.push(todo);
            }
            return todas;
          })
      })

  }

  datosregion(id) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM regiones WHERE id =  ${id}`, []).then((data) => {
        let region;
        if (data.rows.length) {
          let todo = data.rows.item(0);
          region = todo;
        } else {
          let todo;
          todo = "no existe productor con este id: " + id;
          region = todo;
        }
        return region;
      })
    })
  }

  datosproductor(id) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM productores WHERE idProductor =  ${id}`, []).then((data) => {
        let productor;
        if (data.rows.length) {
          let todo = data.rows.item(0);
          productor = todo;

        } else {
          let todo;
          todo = "no existe productor con este id: " + id;
          productor = todo;
        }
        return productor;
      })
    })
  }

  detallesregion(id) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM regiones WHERE id =  ${id}`, []).then((data) => {
        let region;
        if (data.rows.length) {
          let todo = data.rows.item(0);
          region = todo;
        } else {
          let todo;
          todo = "no existe productor con este id: " + id;
          region = todo;
        }
        return region;
      })
    })
  }

  detallesmunicipio(id) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM municipios WHERE id =  ${id}`, []).then((data) => {
        let municipio;
        if (data.rows.length) {
          let todo = data.rows.item(0);
          municipio = todo;
        } else {
          let todo;
          todo = "no existe productor con este id: " + id;
          municipio = todo;
        }
        return municipio;
      })
    })
  }

  detallesdepartamento(id) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM departamentos WHERE id =  ${id}`, []).then((data) => {
        let departamento;
        if (data.rows.length) {
          let todo = data.rows.item(0);
          departamento = todo;
        } else {
          let todo;
          todo = "no existe productor con este id: " + id;
          departamento = todo;
        }
        return departamento;
      })
    })
  }

  detallespais(id) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM paises WHERE id =  ${id}`, []).then((data) => {
        let pais;
        if (data.rows.length) {
          let todo = data.rows.item(0);
          pais = todo;
        } else {
          let todo;
          todo = "no existe productor con este id: " + id;
          pais = todo;
        }
        return pais;
      })
    })
  }

  departamentosenpaises(id: any) {
    return this.isReady()
      .then(() => {
        let ids = id.join();
        return this.database.executeSql(`SELECT id from departamentos WHERE paisid IN (${ids})`, [])
          .then((data) => {
            let todos = [];
            for (let i = 0; i < data.rows.length; i++) {
              let todo = data.rows.item(i).id;
              todos.push(todo);
            }
            return todos;
          })
      })
  }
  municipiosendepa(id: any) {
    return this.isReady()
      .then(() => {
        let ids = id;

        return this.database.executeSql(`SELECT id from municipios WHERE departamentoid IN (${ids})`, [])
          .then((data) => {
            let todos = [];
            for (let i = 0; i < data.rows.length; i++) {
              let todo = data.rows.item(i).id;
              todos.push(todo);
            }
            return todos;
          })
      })
  }
  regionesenmunicipio(id: any) {
    return this.isReady()
      .then(() => {
        let ids = id;
        return this.database.executeSql(`SELECT id from regiones WHERE municipioid IN (${ids})`, [])
          .then((data) => {
            let todos = [];
            for (let i = 0; i < data.rows.length; i++) {
              let todo = data.rows.item(i).id;
              todos.push(todo);
            }
            return todos;
          })
      })
  }


  todoslospaisesid() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT id from paises`, [])
          .then((data) => {
            let todos = [];
            for (let i = 0; i < data.rows.length; i++) {
              let todo = data.rows.item(i).id;
              todos.push(todo);
            }
            return todos;
          })
      })
  }

  todoslospaises() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT * from paises`, [])
          .then((data) => {
            let todos = [];
            for (let i = 0; i < data.rows.length; i++) {
              let todo = data.rows.item(i);
              //cast binary numbers back to booleansunidades_productivas
              todos.push(todo);
            }
            return todos;
          })
      })
  }
  todoslosdepartamentosid() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT id from departamentos`, [])
          .then((data) => {
            let todos = [];
            for (let i = 0; i < data.rows.length; i++) {
              let todo = data.rows.item(i).id;
              todos.push(todo);
            }
            return todos;
          })
      })
  }
  todoslosmunicipiosid() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT id from municipios`, [])
          .then((data) => {
            let todos = [];
            for (let i = 0; i < data.rows.length; i++) {
              let todo = data.rows.item(i).id;
              todos.push(todo);
            }
            return todos;
          })
      })
  }
  todoslosregionesid() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT id from regiones`, [])
          .then((data) => {
            let todos = [];
            for (let i = 0; i < data.rows.length; i++) {
              let todo = data.rows.item(i).id;
              todos.push(todo);
            }
            return todos;
          })
      })
  }

  todoslosdepartamentos() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT * from departamentos`, [])
          .then((data) => {
            let todos = [];
            for (let i = 0; i < data.rows.length; i++) {
              let todo = data.rows.item(i);
              todos.push(todo);
            }
            return todos;
          })
      })
  }
  todoslosmunicipios() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT * from municipios`, [])
          .then((data) => {
            let todos = [];
            for (let i = 0; i < data.rows.length; i++) {
              let todo = data.rows.item(i);
              todos.push(todo);
            }
            return todos;
          })
      })
  }
  todoslasregiones() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT * from regiones`, [])
          .then((data) => {
            let todos = [];
            for (let i = 0; i < data.rows.length; i++) {
              let todo = data.rows.item(i);
              todos.push(todo);
            }
            return todos;
          })
      })
  }

  guardarformulario(codigo, nombre, observaciones, tipo, periodo) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`INSERT INTO formularios (id, nombre, observaciones, tipo, periodo) VALUES (?, ?, ?, ?, ?);`,
          [codigo, nombre, observaciones, tipo, periodo]);
      });
  }
  guardarp(data) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`INSERT INTO pruebas (nombre) VALUES (?);`,
          [data]);
      });
  }
  guardargrupo(idGrupoBase, nombre, posicion, id, textoAyuda) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`INSERT INTO grupos (idgrupobase, nombre, posicion, formularioid, textoayuda) VALUES (?, ?, ?, ?, ?);`,
          [idGrupoBase, nombre, posicion, id, textoAyuda]);
      });
  }
  guardarpregunta(codigo, enunciado, posicion, tipo, valorinicial, grupobase, requerido, codresp, archivo, encabezado, tipoformulario) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`INSERT INTO preguntas 
        (codigo, enunciado, posicion, tipo, valorinicial, grupoid, requerido, codigorespuesta, archivo, encabezado, tipoformulario) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [codigo, enunciado, posicion, tipo, valorinicial, grupobase, requerido, codresp, archivo, encabezado, tipoformulario]);
      });
  }



  guardarrespuesta(codigo, nombre, valor, tipo, codigorespuestapadre) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`INSERT INTO respuestas (codigo, nombre, valor, tipo, codigorespuestapadre) VALUES (?, ?, ?, ?, ?);`,
          [codigo, nombre, valor, tipo, codigorespuestapadre]);
      });
  }


  guardarrespuestatabla(codigo, nombre , valor , constante ,tipo , codigorespuesta  ) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`INSERT INTO respuestastabla (codigo, nombre , valor , constante ,tipo , codigorespuesta ) 
        VALUES (?, ?, ?, ?, ?, ?);`,
          [codigo, nombre , valor , constante ,tipo , codigorespuesta ]);
      });
  }





  guardarprueba() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`INSERT INTO formularios
      (id, nombre, observaciones, clase, periodo) VALUES ( 1, 'prueb', 'esto es una prueba', 101, '2017 10126');`,
          []);
      });
  }

  formularioid(tipo) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT id FROM formularios WHERE tipo =  ${tipo} `, []).then((data) => {
        let id;
        if (data.rows.length) {
          let todo = data.rows.item(0).id;
          id = todo;
        } else {
          let todo;
          todo = null;
          id = todo;
        }
        return id;
      })
    })
  }
  gruposbyid(id) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM grupos WHERE formularioid =  ${id}  ORDER BY posicion ASC`, []).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todos.push(todo);
          }
        } else {
          let todo;
          todo = null;
          todos = todo;
        }
        return todos;
      })
    })
  }

  preguntasporgrupo(grupo, tipo) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM preguntas WHERE grupoid = ${grupo} AND tipoformulario = ${tipo}  ORDER BY posicion ASC`, []).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todo.preguntas = [];
            todo.respuestas = [];
            todo.identificador = 'respuesta' + i;
            todos.push(todo);
          }
        } else {
          let todo;
          todo = null;
          todos = todo;
        }
        return todos;
      })


    })
  }

  preguntasporgruporequeridas(grupo) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT codigo, enunciado,tipo  FROM preguntas WHERE grupoid =  ${grupo} AND requerido = 1`, []).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todos.push(todo);
          }
        } else {
          let todo;
          todo = null;
          todos = todo;
        }
        return todos;
      })


    })
  }


  respuestasporpregunta(codigosrespuesta) {
    let ids = codigosrespuesta.join();
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM respuestas WHERE codigorespuestapadre IN (${ids})`, []).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todo.respuesta = false;
            todo.observacion = '';
            todo.ruta = '';
            todos.push(todo);
          }
        } else {
          let todo;
          todo = false;
          todos = todo;
        }
        return todos;
      })
    })

  }

  respuestasporpreguntaf(codigosrespuesta) {
    let ids = codigosrespuesta;
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM respuestas WHERE codigorespuestapadre = ${ids}`, []).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todo.respuesta = false;
            todo.observacion = '';
            todo.ruta = '';
            todos.push(todo);
          }
        } 
        return todos;
      })
    })

  }


  
  respuestasguardadas(up, grupo, tipo) {
    let upi = up;
    let grupoi = grupo;
    let tipoe = tipo;
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM respuestasguardadas WHERE unidadproductiva = (?)  AND grupo =(?) AND tipoformulario =(?)`, [upi, grupoi, tipo]).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todos.push(todo);
          }
        } else {
          let todo;
          todo = false;
          todos = todo;
        }
        return todos;
      })
    })

  }
  respuestasguardadasporpregunta(up, grupo, tipo,codigopregunta) {
    let upi = up;
    let grupoi = grupo;
    let tipoe = tipo;
    let pregunta = codigopregunta;
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM respuestasguardadas WHERE unidadproductiva = (?)  AND grupo =(?) AND tipoformulario =(?) AND pregunta =(?)`, [upi, grupoi, tipo, pregunta]).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todos=todo;
          }
        }
        return todos;
      })
    })

  }
/*   id INTEGER PRIMARY KEY,
  unidadproductiva TEXT,
  grupo INTEGER,
  pregunta INTEGER,
  codigorespuestapadre INTEGER, 
  codigorespuestaseleccionada TEXT,
  valorrespuestaseleccionada TEXT,
  valorseleccionado TEXT,
  observacion TEXT,
  ruta TEXT,
  tipoformulario INTEGER
 */
  todasuproductivas() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT idUnidadProductiva, nombre, regionId, IdProductor, tipo, terminado, idAsignacion from unidades_productivas`, []).then((data) => {
          let todas = [];
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            this.nombreregion(todo.regionId).then((data: any) => {
              todo.region = data;
            });
            this.nombreproductor(todo.IdProductor).then((data: any) => {
              todo.productor = data;
            });
            todas.push(todo);
          }
          return todas;
        })
      })
  }
  todasuproductivasiniciadas(caso) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT * from unidades_productivas WHERE tipo =${caso} AND terminado = 1 AND idAsignacion !=''`, []).then((data) => {
          let todas = [];

          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todas.push(todo);
          }
          return todas;
        }, err => { })
      })
  }
  todasuproductivas2() {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT idUnidadProductiva, nombre, regionId, IdProductor, terminado from unidades_productivas`, []).then((data) => {
          let todas = [];
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            this.nombreregion(todo.regionId).then((data: any) => {
              todo.region = data;
            });
            this.nombreproductor(todo.IdProductor).then((data: any) => {
              todo.productor = data;
            });
            todas.push(todo);
          }
          return todas;
        })
      })
  }

  guardarrespuestaporpregunta(unidadp, grup, respuestascodigo, preguntaid, codigoresp, valorresp, valortext, tipoformulario) {
    let up = unidadp;
    let gr = grup;
    let pr = preguntaid;
    let tipop = tipoformulario;
    return this.isReady()
      .then(() => {
        return this.database.executeSql
          (`SELECT * FROM respuestasguardadas WHERE unidadproductiva = (?)  AND grupo =(?) AND pregunta =(?) AND tipoformulario =(?)`,
          [up, gr, pr, tipop]).then((data) => {
            let id;
            if (data.rows.length > 0) {
              id = data.rows.item(0).id;
            } else {
              id = false;
            }
            return id;
          }).then((idseleccion) => {

            if (idseleccion == false) {

              return this.database.executeSql(
                `INSERT INTO respuestasguardadas 
          (unidadproductiva, grupo, codigorespuestapadre ,pregunta, codigorespuestaseleccionada, valorrespuestaseleccionada, valorseleccionado , tipoformulario)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
                [unidadp, grup, respuestascodigo, preguntaid, codigoresp, valorresp, valortext, tipoformulario]);
            } else {
              return this.database.executeSql(
                `UPDATE respuestasguardadas SET codigorespuestaseleccionada = (?), valorrespuestaseleccionada = (?), valorseleccionado =(?) WHERE id=${idseleccion} ;`,
                [codigoresp, valorresp, valortext]);
            }
          })
      });

  }


  guardarobservacion(unidadp, grup, respuestascodigo, preguntaid, observacion, tipof) {
    let up = unidadp;
    let gr = grup;
    let pr = preguntaid;
    let tipop = tipof;

    return this.isReady()
      .then(() => {
        return this.database.executeSql
          (`SELECT * FROM respuestasguardadas WHERE unidadproductiva = (?)  AND grupo =(?) AND pregunta =(?) AND tipoformulario =(?)`,
          [up, gr, pr, tipop]).then((data) => {
            let id;
            if (data.rows.length > 0) {
              id = data.rows.item(0).id;
            } else {
              id = false;
            }
            return id;
          }).then((idseleccion) => {

            if (idseleccion == false) {

              return this.database.executeSql(
                `INSERT INTO respuestasguardadas 
          (unidadproductiva, grupo, respuestascodigo ,pregunta, observacion, tipoformulario )
          VALUES (?, ?, ?, ?, ?);`,
                [unidadp, grup, respuestascodigo, preguntaid, observacion, tipop]);

            } else {
              return this.database.executeSql(
                `UPDATE respuestasguardadas SET observacion = (?) WHERE id=${idseleccion} ;`,
                [observacion]);
            }
          })
      });

  }

  guardarimagen(unidadp, grup, respuestascodigo, preguntaid, ruta, tipof) {
    let up = unidadp;
    let gr = grup;
    let pr = preguntaid;
    let tipop = tipof;
    return this.isReady()
      .then(() => {
        return this.database.executeSql
          (`SELECT * FROM respuestasguardadas WHERE unidadproductiva = (?)  AND grupo =(?) AND pregunta =(?)  AND tipoformulario =(?)`,
          [up, gr, pr, tipop]).then((data) => {
            let id;
            if (data.rows.length > 0) {
              id = data.rows.item(0).id;
            } else {
              id = false;
            }
            return id;
          }).then((idseleccion) => {

            if (idseleccion == false) {

              return this.database.executeSql(
                `INSERT INTO respuestasguardadas 
          (unidadproductiva, grupo, respuestascodigo ,pregunta, ruta, tipoformulario )
          VALUES (?, ?, ?, ?, ?, ?);`,
                [unidadp, grup, respuestascodigo, preguntaid, ruta, tipop]).then(
                (ok) => {
                  return ok;
                },
                (err) => {
                  return err;
                });

            } else {
              return this.database.executeSql(
                `UPDATE respuestasguardadas SET ruta = (?) WHERE id=${idseleccion} ;`,
                [ruta]).then(
                (ok) => {
                  return ok;
                },
                (err) => {
                  return err;
                });;
            }
          })
      });

  }

  limpiardb() {

    return this.isReady().then(() => {
      return this.database.executeSql(
        `DELETE FROM paises;`, {})
        .then(() => {
          return this.database.executeSql(
            `DELETE FROM departamentos ;`, {})
        }).then(() => {
          return this.database.executeSql(
            `DELETE FROM municipios ;`, {})
        }).then(() => {
          return this.database.executeSql(
            `DELETE FROM regiones ;`, {})
        }).then(() => {
          return this.database.executeSql(
            `DELETE FROM productores;`, {})
        }).then(() => {
          return this.database.executeSql(
            `DELETE FROM unidades_productivas ;`, {})
        }).then(() => {
          return this.database.executeSql(
            `DELETE FROM formularios ;`, {})
        }).then(() => {
          return this.database.executeSql(
            `DELETE FROM grupos ;`, {})
        }).then(() => {
          return this.database.executeSql(
            `DELETE FROM preguntas;`, {})
        }).then(() => {
          return this.database.executeSql(
            `DELETE FROM respuestas;`, {})
        }).then(() => {
          return this.database.executeSql(
            `DELETE FROM respuestasguardadas;`, {})
        }).then(() => {
          return this.database.executeSql(
            `DELETE FROM preguntastabla;`, {})
        }).then(() => {
          return this.database.executeSql(
            `DELETE FROM respuestastabla;`, {})
        }).then(() => {
          return this.database.executeSql(
            `DELETE FROM respuestasguardadastabla;`, {})
        }).then(() => {
          return this.database.executeSql(
            `DELETE FROM noconformidades;`, {})
        }).then(() => {
          return this.database.executeSql(
            `DELETE FROM tareas;`, {})
        }).then(() => {
          return this.database.executeSql(
            `DELETE FROM listacategoria;`, {})
        });

    })
  }
  //


    respuestasguardadast(){
      return this.isReady(
      ).then(() => {
        return this.database.executeSql(`SELECT * FROM respuestasguardadas `, []).then((data) => {
          let todos = [];
          if (data.rows.length) {
            for (let i = 0; i < data.rows.length; i++) {
              let todo = data.rows.item(i);
              todo.respuesta = [];
              todos.push(todo);
            }
          }
          return todos;
        })
      })
    }
  guardarpreguntatabla(preguntaid, preguntapadre, enunciado, fila, codigorespuesta, observacion) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`INSERT INTO preguntastabla 
        (preguntaid, preguntapadre, enunciado, fila, codigorespuesta, observacion) VALUES (?, ?, ?, ?, ?, ?);`,
          [preguntaid, preguntapadre, enunciado, fila, codigorespuesta, observacion]);
      });
  }
  //                 INTEGER,
  preguntastablaporid(preguntaid) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM preguntastabla WHERE preguntapadre = ${preguntaid}`, []).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todo.respuesta = [];
            todos.push(todo);
          }
        } else {
          let todo;
          todo = false;
          todos = todo;
        }
        return todos;
      })
    })

  }
  respuestasapreguntastablas(codigorespuestapadre) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM respuestastabla WHERE codigorespuesta = ${codigorespuestapadre}`, []).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todo.respuesta = [];
            todos.push(todo);
          }
        } else {
          let todo;
          todo = false;
          todos = todo;
        }
        return todos;
      })
    })
  }

  guardarrespuestaporpreguntatabla(unidadp, grup, respuestascodigo, preguntapadre, preguntaid, codigoresp, valorresp, valortext, tipoformulario) {
    let up = unidadp;
    let gr = grup;
    let pr = preguntaid;
    let tipop = tipoformulario;
    let ppadre = preguntapadre;
    let cres = codigoresp;
    return this.isReady()
      .then(() => {
        return this.database.executeSql
          (`SELECT * FROM respuestasguardadastabla WHERE unidadproductiva = (?)  AND grupo =(?) AND preguntaid =(?) AND tipoformulario =(?) AND preguntapadre=(?) AND codigorespuesta=(?)`,
          [up, gr, pr, tipop, ppadre, cres]).then((data) => {
            let id;
            if (data.rows.length > 0) {
              id = data.rows.item(0).id;
            } else {
              id = false;
            }
            return id;
          }).then((idseleccion) => {
            if (idseleccion == false) {

              return this.database.executeSql(
                `INSERT INTO respuestasguardadastabla 
        (unidadproductiva, grupo, respuestascodigo ,preguntapadre ,preguntaid, codigorespuesta, valorrespuesta, valor , tipoformulario)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,

                [unidadp, grup, respuestascodigo, preguntapadre, preguntaid, codigoresp, valorresp, valortext, tipoformulario]);

            } else {
              return this.database.executeSql(
                `UPDATE respuestasguardadastabla SET codigorespuesta = (?), valorrespuesta = (?), valor =(?) WHERE id=${idseleccion} ;`,
                [codigoresp, valorresp, valortext]);
            }
          })
      }).catch(err => { });

  }

  respuestasguardadastabla(unidadp, grupo, preguntapadre, preguntaid, codigorespuesta, tipoformulario) {
//    console.log('respuestas de otro ',unidadp, grupo, preguntapadre, preguntaid, codigorespuesta, tipoformulario);
    let up = unidadp;
    let gr = grupo;
    let pr = preguntaid;
    let tipop = tipoformulario;
    let ppadre = preguntapadre;
    let cres = codigorespuesta;

    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT valor FROM respuestasguardadastabla WHERE 
    unidadproductiva = (?)  AND 
    grupo =(?) AND 
    preguntaid =(?) AND 
    tipoformulario =(?) AND 
    preguntapadre=(?) AND 
    codigorespuesta=(?)`,
          [up,
            gr,
            pr,
            tipop,
            ppadre,
            cres]).then((data) => {
              let todos = [];
              if (data.rows.length) {
                if (data.rows.item(0).valor == "true") {
                  data.rows.item(0).valor = true;
                
                }
                todos = data.rows.item(0).valor;

              } else {
                let todo;
                todo = false;
                todos = todo;
              }
              return todos;
            });
      });
  }

  agregarcategoria(id, nombre) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`INSERT INTO listacategoria 
              (id, nombre) VALUES (?,?);`,
          [id, nombre]);
      });
  }
  categorias() {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM listacategoria `, []).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todos.push(todo);
          }
        }
        return todos;
      })
    })

  }

  agregarnoconformidad(unidadproductiva, tipo_formulario, categoria, detalle, descripcion, fechacreacion, fechaposiblecierre, estado) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`INSERT INTO noconformidades 
              (unidadproductiva,tipo, categoria, descripcion, detalle, fechacreacion, fechaposiblecierre, estado) VALUES (?,?,?,?,?,?,?,?);`,
          [unidadproductiva, tipo_formulario, categoria, descripcion, detalle, fechacreacion, fechaposiblecierre, estado]);
      }).then((ok) => {

        return ok.insertId;
      }).catch(() => {
        return false
      });
  }
  agregarnoconformidadantigua(id, unidadproductiva, tipo_formulario, categoria, detalle, descripcion, fechacreacion, fechaposiblecierre, estado, asignacion, fechacierre) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`INSERT INTO noconformidades 
              (id,unidadproductiva,tipo, categoria, descripcion, detalle, fechacreacion, fechaposiblecierre, estado, fechafinalizado,heredada,asignacion) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);`,
          [id, unidadproductiva, tipo_formulario, categoria, descripcion, detalle, fechacreacion, fechaposiblecierre, estado, fechacierre, 1, asignacion]);
      })
  }

  agregartareaantigua(id, noconformidad, nombre, detalle, encargado, fecha, estado, fechacreacion, fechaRealCierre) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`INSERT INTO tareas 
              (id,noconformidad, nombre, detalle,encargado,fechaPautadaCierre, estado, fechaCreacion, fechaRealCierre, heredada) VALUES (?,?,?,?,?,?,?,?,?,?);`,
          [id, noconformidad, nombre, detalle, encargado, fecha, estado, fechacreacion, fechaRealCierre, 1]);
      })
  }
  agregartarea(noconformidad, nombre, detalle, encargado, fecha, estado, fechacreacion) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`INSERT INTO tareas 
              (noconformidad, nombre, detalle,encargado,fechaPautadaCierre, estado, fechaCreacion) VALUES (?,?,?,?,?,?,?);`,
          [noconformidad, nombre, detalle, encargado, fecha, estado, fechacreacion]);
      });
  }
  tareas(noconformidad) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM tareas WHERE noconformidad = (?)`, [noconformidad]).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todos.push(todo);
          }
        } else {
          todos = null;
        }
        return todos;
      })
    })
  }
  tareasporid(id) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM tareas WHERE id = (?)`, [id]).then((data) => {
        let todos = [];
        if (data.rows.length) {
          let todo = data.rows.item(0);
          todos = todo;
        } else {
          todos = null;
        }
        return todos;
      })
    })
  }

  editartarea(id, nombre, detalle, encargado, fecha, estado, fechacierrereal) {
    let identificador = id;
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(
        `UPDATE tareas SET nombre=(?), detalle=(?),encargado=(?),fechaPautadaCierre=(?),estado=(?), fechaRealCierre=(?) WHERE id=${identificador} ;`,
        [nombre, detalle, encargado, fecha, estado, fechacierrereal]);
    })
  }

  noconformidades(unidadproductiva, tipo_formulario) {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM noconformidades  WHERE unidadproductiva = (?)  AND  tipo =(?) `, [unidadproductiva, tipo_formulario]).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todos.push(todo);
          }
        } else {
          todos = null;
        }
        return todos;
      })
    })

  }

  todasnoconformidades() {
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM noconformidades`, []).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todos.push(todo);
          }
        } else {
          todos = null;
        }
        return todos;
      })
    })

  }

  noconformidadid(id) {
    let identificador = id;
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM noconformidades  WHERE id = (?)`, [identificador]).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todos.push(todo);
          }
        } else {
          todos = null;
        }
        return todos;
      })
    })
  }

  editarnoconformidad(id, columna, valor) {
    let identificador = id;
    let columnae = columna;
    let valore = valor;
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(
        `UPDATE noconformidades SET ${columnae} = '${valore}' WHERE id=${identificador} ;`,
        []);
    })
  }

  guardarubicacion(idUnidadProductiva,  datofecha, latitud, longitud, caso) {

    let idseleccion = idUnidadProductiva;
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT * from unidades_productivas WHERE  idUnidadProductiva =  (?) AND tipo =(?) `, [idseleccion, caso])
          .then((data) => {
            let todo = data.rows.item(0);
              if (todo.fechainicio === null) {
                return this.database.executeSql(
                  `UPDATE unidades_productivas SET fechainicio = (?), latitudinicio = (?), longitudinicio=(?) , terminado = 1 WHERE idUnidadProductiva = '${idseleccion}' AND tipo = ${todo.tipo};`,
                  [datofecha, latitud, longitud]).then((datae) => { return data; }).catch(err => { return err; });
              } else {
                return this.database.executeSql(
                  `UPDATE unidades_productivas SET fechafin = (?), latitudfin = (?), longitudfin=(?) WHERE idUnidadProductiva = '${idseleccion}' AND tipo = ${todo.tipo};`,
                  [datofecha, latitud, longitud]).then((datae) => { }).catch(err => { return err; });
              }
          },er=>{})
      })
  }



  verficarrespuestas(up, grupo, pregunta, tipo, tipopregunta) {
    return this.isReady(
    ).then(() => {
      if (tipopregunta == 3007) {
        return this.database.executeSql(`SELECT id FROM respuestasguardadastabla WHERE unidadproductiva = (?)  AND grupo =(?) AND preguntapadre=(?) AND tipoformulario =(?)`, [up, grupo, pregunta, tipo]).then((data) => {
          let tiene;
          if (data.rows.length) {
            tiene = true;
          } else {
            tiene = false;
          }
          return tiene;
        })
      } else {
        return this.database.executeSql(`SELECT id FROM respuestasguardadas WHERE unidadproductiva = (?)  AND grupo =(?) AND pregunta=(?) AND tipoformulario =(?)`, [up, grupo, pregunta, tipo]).then((data) => {
          let tiene;
          if (data.rows.length) {
            tiene = true;
          } else {
            tiene = false;
          }
          return tiene;
        })
      }

    }).catch((err) => { })

  }


  respuestasparaunidad(unidad, tipoformulario) {
    let upi = unidad;
    let tipoe = tipoformulario;
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM respuestasguardadas WHERE unidadproductiva = (?) AND tipoformulario =(?)`, [upi, tipoformulario]).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todos.push(todo);
          }
        } else {
          let todo;
          todo = null;
          todos = todo;
        }
        return todos;
      })
    })

  }

  respuestastablaparaunidad(unidad, tipoformulario) {
    let upi = unidad;
    let tipoe = tipoformulario;
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM respuestasguardadastabla WHERE unidadproductiva = (?) AND tipoformulario =(?)`, [upi, tipoformulario]).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            if (data.rows.item(i).valor == "" || data.rows.item(i).valor == "false") {
            } else {
              let todo = data.rows.item(i);
              todos.push(todo);
            }
          }
        } else {
          let todo;
          todo = null;
          todos = todo;
        }
        return todos;
      })
    })
  }


  noconformidad(unidad, tipoformulario) {
    let upi = unidad;
    let tipoe = tipoformulario;
    return this.isReady(
    ).then(() => {
      return this.database.executeSql(`SELECT * FROM noconformidades WHERE unidadproductiva = (?) AND tipo =(?)`, [upi, tipoformulario]).then((data) => {
        let todos = [];
        if (data.rows.length) {
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todos.push(todo);
          }
        } else {
          let todo;
          todo = null;
          todos = todo;
        }
        return todos;
      })
    })
  }

  cambiarestado(idUnidadProductiva, terminado, tipo) {
    let idseleccion = idUnidadProductiva;
    return this.isReady()
      .then(() => {
        return this.database.executeSql(
          `UPDATE unidades_productivas SET terminado = (?) WHERE idUnidadProductiva = '${idseleccion}' AND tipo= ${tipo} ;`,
          [terminado]).then((datae) => { return datae; }).catch(err => { return err; });
      })

  }


  agregarmapa(idUnidadProductiva, mapa) {
    let idseleccion = idUnidadProductiva;
    return this.isReady()
      .then(() => {
        return this.database.executeSql(
          `UPDATE unidades_productivas SET mapa = (?) WHERE idUnidadProductiva = '${idseleccion}' ;`,
          [mapa]).then((datae) => { return datae; }).catch(err => { return err; });
      })
  }
  unidadescreadas(caso) {
    return this.isReady()
      .then(() => {
        return this.database.executeSql(`SELECT * from unidades_productivas WHERE terminado IN (${caso},1003) AND idAsignacion =''`, []).then((data) => {
          let todas = [];
          for (let i = 0; i < data.rows.length; i++) {
            let todo = data.rows.item(i);
            todas.push(todo);
          }
          return todas;
        }, err => { })
      })
  }

  cambiarunidades(id,idnuevo,idAsignacion){

    return this.isReady().then(()=>{
      return this.database.executeSql(
        `UPDATE noconformidades SET unidadproductiva = (?) WHERE unidadproductiva = '${id}' ;`,
        [idnuevo])
    }).then(()=>{
      return this.database.executeSql(
        `UPDATE unidades_productivas SET idUnidadProductiva = (?), idAsignacion= (?) WHERE idUnidadProductiva = '${id}' ;`,
        [idnuevo, idAsignacion])
  }).then(() => {
      return this.database.executeSql(
        `UPDATE respuestasguardadas SET unidadproductiva = (?) WHERE unidadproductiva = '${id}' ;`,
        [idnuevo])
    }).then(()=>{
      return this.database.executeSql(
        `UPDATE respuestasguardadastabla SET unidadproductiva = (?) WHERE unidadproductiva = '${id}' ;`,
        [idnuevo])
    })

  }

  unidadesfiltro(regiones,terminado,tipo,orientacion){
    let stringregiones;
    if(regiones){
      stringregiones='regionId IN ('+ regiones+') AND ';
    }else{
      stringregiones='';
    }

    let stringorientacion;
    if(orientacion){
      stringorientacion='ORDER BY terminado '+ orientacion;
    }else{
      stringorientacion='';
    }
    return this.isReady()
    .then(() => {
      return this.database.executeSql(`SELECT * from unidades_productivas WHERE ${stringregiones} terminado IN (${terminado}) AND tipo IN (${tipo},1003) ${stringorientacion}`, []).then((data) => {
        let todas = [];
        for (let i = 0; i < data.rows.length; i++) {
          let todo = data.rows.item(i);
          this.nombreregion(todo.regionId).then((data: any) => {
            todo.region = data;
          });
          this.nombreproductor(todo.IdProductor).then((data: any) => {
            todo.productor = data;
          });

          todas.push(todo);
        }
        return todas;
      }, err => { })
    })
 

  }


}
