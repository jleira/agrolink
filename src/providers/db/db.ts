import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Http } from '@angular/http';
import {SERVER_URL} from "../../config"

@Injectable()
export class DbProvider {

  private database: SQLiteObject;
  private dbReady = new BehaviorSubject<boolean>(false);

  constructor(
    private platform:Platform, 
    private sqlite:SQLite, 
    public http: Http
    ) {
    this.platform.ready().then(()=>{
      this.sqlite.create({
        name: 'agrolink.db',
        location: 'default'
      })
      .then((db:SQLiteObject)=>{
        this.database = db;
        this.createTables().then(()=>{     
          this.dbReady.next(true);
        }
      );
      })
    });
  }
private createTables(){    
  return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS paises (
            id INTEGER PRIMARY KEY,
            nombre TEXT
          );`
        ,{}).then(()=>{
  return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS departamentos (
            id INTEGER PRIMARY KEY,
            nombre TEXT,
            paisid INTEGER,
            FOREIGN KEY(paisid) REFERENCES paises(id)
            );`,{} )
        }).then(()=>{
  return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS municipios (
            id INTEGER PRIMARY KEY,
            nombre TEXT,
            departamentoid INTEGER,
            FOREIGN KEY(departamentoid) REFERENCES departamentos(id)
            );`,{} )
        }).then(()=>{
  return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS regiones (
            id INTEGER PRIMARY KEY,
            nombre TEXT,
            prefijo TEXT,
            municipioid INTEGER,
            FOREIGN KEY(municipioid) REFERENCES municipios(id)
            );`,{} )
        }).then(()=>{
  return this.database.executeSql(
          `CREATE TABLE IF NOT EXISTS productores (
            idProductor INTEGER PRIMARY KEY,
            nombre TEXT,
            identificacion INTEGER,
            telefono TEXT,
            annoIngreso TEXT,
            ultimaAplicacion TEXT
            );`,{} )
        }).then(()=>{
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
            IdProductor INTEGER,
            FOREIGN KEY(regionId) REFERENCES regiones(id)
            );`,{} )
        }).then(()=>{
          return this.database.executeSql(
                  `CREATE TABLE IF NOT EXISTS formularios (
                    id INTEGER PRIMARY KEY,
                    nombre TEXT,
                    observaciones TEXT,
                    tipo INTEGER,
                    periodo TEXT
                  );`,{} )
        }).then(()=>{
          return this.database.executeSql(
                  `CREATE TABLE IF NOT EXISTS pruebas (
                    nombre TEXT
                    );`,{} )
        }).then(()=>{
        return this.database.executeSql(
            `CREATE TABLE IF NOT EXISTS grupos (
              idgrupobase INTEGER PRIMARY KEY,
              nombre TEXT,
              posicion INTEGER,
              formularioid INTEGER,              
              textoayuda TEXT,
              FOREIGN KEY(formularioid) REFERENCES formularios(id)
            );`,{} )
        }).then(()=>{
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
                FOREIGN KEY(grupoid) REFERENCES grupos(idgrupobase)
              );`,{} )
          }).then(()=>{
            return this.database.executeSql(
                `CREATE TABLE IF NOT EXISTS respuestas (
                  codigo INTEGER PRIMARY KEY,
                  nombre TEXT,
                  valor INTEGER,
                  tipo INTEGER,
                  preguntaid INTEGER,
                  FOREIGN KEY(preguntaid) REFERENCES preguntas(codigo)
                );`,{} )
            }).then(()=>{
              return this.database.executeSql(
                  `CREATE TABLE IF NOT EXISTS respuestasguardadas (
                    id INTEGER PRIMARY KEY,
                    unidadproductiva TEXT,
                    grupo INTEGER,
                    pregunta INTEGER,
                    respuestascodigo INTEGER, 
                    codigorespuesta INTEGER,
                    valorrespuesta INTEGER,
                    valor TEXT,
                    observacion TEXT


                  );`,{} )
              }).catch((err)=>console.log("error detected creating tables", err));
        
}
private isReady(){ 
  return new Promise((resolve, reject) =>{
              if(this.dbReady.getValue()){resolve();}
              else{
                this.dbReady.subscribe((ready)=>{
                  if(ready){ 
                    resolve(); 
                  }
                });
              }  
            })
}

agregarregion(caso,id,nombre,padre,prefijo){
            if(caso==1){
              return this.isReady()
              .then(()=>{
                
                return this.database.executeSql(`INSERT INTO paises 
                  (id, nombre) VALUES (?, ?);`, 
                  [id, nombre]);
              });
            }else{
              if(caso==4){
                return this.isReady()
                .then(()=>{
                  return this.database.executeSql(`INSERT INTO regiones 
                    (id, nombre,prefijo,municipioid ) VALUES (?, ?,?,?);`, 
                    [id, nombre,prefijo,padre]);
                }); 
              }else{
                let item:any;
                let pid:any;
                
              if(caso==2){
                item='departamentos';
                pid='paisid';              
              }else if(caso==3){
                item='municipios';
                pid='departamentoid';
              }
              return this.isReady()
              .then(()=>{
                return this.database.executeSql(`INSERT INTO ${item} 
                  (id, nombre,${pid}) VALUES (?, ?,?);`, 
                  [id, nombre,padre]);
              });   
              }
          }
}

agregarproductor(id,nombre,identificacion,telefono,annoIngreso,UltimaAplicacion){
            return this.isReady()
            .then(()=>{
              return this.database.executeSql(`INSERT INTO productores 
                (idProductor, nombre,identificacion,telefono,annoIngreso,ultimaAplicacion ) VALUES (?, ?,?,?,?,?);`, 
                [id,nombre,identificacion,telefono,annoIngreso,UltimaAplicacion]);
            }); 
}
 agregarunidadproductiva(idUnidadProductiva,nombre,fechaIngreso,regionId,localizacion_longitude,localizacion_latitude,IdProductor){
            return this.isReady()
            .then(()=>{
              return this.database.executeSql(`INSERT INTO unidades_productivas
                (idUnidadProductiva,nombre,fechaIngreso,regionId,localizacion_longitude,localizacion_latitude,IdProductor, terminado, tipo ) VALUES (?, ?,?,?,?,?,?,?,?);`, 
                [idUnidadProductiva,nombre,fechaIngreso,regionId,localizacion_longitude,localizacion_latitude,IdProductor,0, 1001]);
            }); 
}

existeproductor(id:number){ 
            return this.isReady(
            ).then(()=>{
              return this.database.executeSql(`SELECT * FROM productores WHERE idProductor =  ${id}`, []).then((data)=>{
                let decide;
                if(data.rows.length){
                 decide=1;
                 return decide;
                }
               decide=0;
               return decide;
              })
            })
}


 
todasuproductivasap(caso){
  return this.isReady()
    .then(()=>{
      return this.database.executeSql(`SELECT idUnidadProductiva, nombre, regionId, IdProductor, terminado, tipo from unidades_productivas WHERE tipo =  ${caso}`, []).then((data)=>{
          let todas = [];
          for(let i=0; i<data.rows.length; i++){
            let todo = data.rows.item(i);
            this.nombreregion(todo.regionId).then((data:any)=> {
              todo.region=data;
            });
            this.nombreproductor(todo.IdProductor).then((data:any)=> {
              todo.productor=data;
            });
            todas.push(todo);
          }
          return todas;
          })
        })
}

nombreregion(id:number){
        return this.isReady(
        ).then(()=>{
          return this.database.executeSql(`SELECT nombre FROM regiones WHERE id =  ${id}`, []).then((data)=>{
            let region;
            if(data.rows.length){
              let todo=data.rows.item(0).nombre;
              region=todo;
            }else{
              let todo;
              todo="no existe region con este id";
              region=todo;          
            }
            return region;
          })
        })
}    
nombreproductor(id:number){
        return this.isReady(
        ).then(()=>{
          return this.database.executeSql(`SELECT nombre FROM productores WHERE idProductor =  ${id}`, []).then((data)=>{
            let productor;
            if(data.rows.length){
              let todo=data.rows.item(0).nombre;
              productor=todo;
            }else{
              let todo;
              todo="no existe productor con este id: "+ id;
              productor=todo;          
            }
            return productor;
          })
        })
}


unidadproductivaporid(id){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`SELECT * from unidades_productivas WHERE  idUnidadProductiva =  (?)`, [id])
          .then((data)=>{
            let todas = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i);
              this.datosregion(todo.regionId).then((data:any)=> {
                todo.municipioid=data.municipioid;
                todo.regionnombre=data.nombre;
              });
              this.datosproductor(todo.IdProductor).then((data:any)=> {
                todo.productornombre=data.nombre;
                todo.identificacion=data.identificacion;
                todo.telefono=data.telefono;
                todo.annoIngreso=data.annoIngreso;
                todo.ultimaAplicacion=data.ultimaAplicacion;
              });
              todas.push(todo);
            }
            return todas;
          })
  })

}

datosregion(id){
  return this.isReady(
  ).then(()=>{
    return this.database.executeSql(`SELECT * FROM regiones WHERE id =  ${id}`, []).then((data)=>{
      let region;
      if(data.rows.length){
        let todo=data.rows.item(0);
        region=todo;
      }else{
        let todo;
        todo="no existe productor con este id: "+ id;
        region=todo;          
      }
      return region;
    })
  })
}

datosproductor(id){
  return this.isReady(
  ).then(()=>{
    return this.database.executeSql(`SELECT * FROM productores WHERE idProductor =  ${id}`, []).then((data)=>{
      let productor;
      if(data.rows.length){
        let todo=data.rows.item(0);
        productor=todo;
        
      }else{
        let todo;
        todo="no existe productor con este id: "+ id;
        productor=todo;          
      }
      return productor;
    })
  })
}

detallesregion(id){
  return this.isReady(
  ).then(()=>{
  return this.database.executeSql(`SELECT * FROM regiones WHERE id =  ${id}`, []).then((data)=>{
    let region;
    if(data.rows.length){
      let todo=data.rows.item(0);
      region=todo;
    }else{
      let todo;
      todo="no existe productor con este id: "+ id;
      region=todo;          
    }
    return region;
  })
  })
}

detallesmunicipio(id){
  return this.isReady(
  ).then(()=>{
    return this.database.executeSql(`SELECT * FROM municipios WHERE id =  ${id}`, []).then((data)=>{
      let municipio;
      if(data.rows.length){
        let todo=data.rows.item(0);
        municipio=todo;
      }else{
        let todo;
        todo="no existe productor con este id: "+ id;
        municipio=todo;          
      }
      return municipio;
    })
  })
}

detallesdepartamento(id){
  return this.isReady(
  ).then(()=>{
    return this.database.executeSql(`SELECT * FROM departamentos WHERE id =  ${id}`, []).then((data)=>{
      let departamento;
      if(data.rows.length){
        let todo=data.rows.item(0);
        departamento=todo;
      }else{
        let todo;
        todo="no existe productor con este id: "+ id;
        departamento=todo;          
      }
      return departamento;
    })
  })
}

detallespais(id){
  return this.isReady(
  ).then(()=>{
    return this.database.executeSql(`SELECT * FROM paises WHERE id =  ${id}`, []).then((data)=>{
      let pais;
      if(data.rows.length){
        let todo=data.rows.item(0);
        pais=todo;
      }else{
        let todo;
        todo="no existe productor con este id: "+ id;
        pais=todo;          
      }
      return pais;
    })
  })
}

departamentosenpaises(id:any){
  return this.isReady()
  .then(()=>{
    let ids=id.join();
    return this.database.executeSql(`SELECT id from departamentos WHERE paisid IN (${ids})`, [])
          .then((data)=>{
            let todos = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i).id;
              todos.push(todo);
            }
            return todos;
          })
  })
}
municipiosendepa(id:any){
  return this.isReady()
  .then(()=>{
    let ids=id;
    return this.database.executeSql(`SELECT id from municipios WHERE departamentoid IN (${ids})`, [])
          .then((data)=>{
            let todos = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i).id;
              todos.push(todo);
            }
            return todos;
          })
  })
}
regionesenmunicipio(id:any){
  return this.isReady()
  .then(()=>{
    let ids=id;
    return this.database.executeSql(`SELECT id from regiones WHERE municipioid IN (${ids})`, [])
          .then((data)=>{
            let todos = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i).id;
              todos.push(todo);
            }
            return todos;
          })
  })
}

unidadesporregiontodas(id:any,orientacion){
  return this.isReady()
  .then(()=>{
    let regi=id;
    let ori=orientacion;
    if(orientacion==""){
      return this.database.executeSql(`SELECT idUnidadProductiva, nombre, regionId, IdProductor, terminado from unidades_productivas WHERE regionId IN (${regi})`, [])
      .then((data)=>{
        let todas = [];
        for(let i=0; i<data.rows.length; i++){
          let todo = data.rows.item(i);
          this.nombreregion(todo.regionId).then((data:any)=> {
            todo.region=data;
          });
          this.nombreproductor(todo.IdProductor).then((data:any)=> {
            todo.productor=data;
          });
          todas.push(todo);
        }
        return todas;
      })
    }else{
      return this.database.executeSql(`SELECT idUnidadProductiva, nombre, regionId, IdProductor, terminado from unidades_productivas WHERE regionId IN (${regi}) ORDER BY terminado ${orientacion} `, [])
      .then((data)=>{
        let todas = [];
        for(let i=0; i<data.rows.length; i++){
          let todo = data.rows.item(i);
          this.nombreregion(todo.regionId).then((data:any)=> {
            todo.region=data;
          });
          this.nombreproductor(todo.IdProductor).then((data:any)=> {
            todo.productor=data;
          });
          todas.push(todo);
        }
        return todas;
      })
    }
  }) 
}

unidadespendientes(){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`SELECT idUnidadProductiva, nombre, regionId, IdProductor, terminado from unidades_productivas WHERE terminado = 0`, [])
          .then((data)=>{
            let todas = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i);
              this.nombreregion(todo.regionId).then((data:any)=> {
                todo.region=data;
              });
              this.nombreproductor(todo.IdProductor).then((data:any)=> {
                todo.productor=data;
              });
              todas.push(todo);
            }
            return todas;
          })
  })
}

unidadesporregionpendientes(id:any){
  return this.isReady()
  .then(()=>{
    let regi=id;
    return this.database.executeSql(`SELECT idUnidadProductiva, nombre, regionId, IdProductor, terminado from unidades_productivas WHERE regionId IN (${regi}) AND terminado = 0`, [])
          .then((data)=>{
            let todas = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i);
              this.nombreregion(todo.regionId).then((data:any)=> {
                todo.region=data;
              });
              this.nombreproductor(todo.IdProductor).then((data:any)=> {
                todo.productor=data;
              });
              todas.push(todo);
            }
            return todas;
          })
  }) 
}

unidadesterminadas(){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`SELECT idUnidadProductiva, nombre, regionId, IdProductor, terminado from unidades_productivas WHERE terminado = 1`, [])
          .then((data)=>{
            let todas = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i);
              this.nombreregion(todo.regionId).then((data:any)=> {
                todo.region=data;
              });
              this.nombreproductor(todo.IdProductor).then((data:any)=> {
                todo.productor=data;
              });
              todas.push(todo);
            }
            return todas;
          })
  })
}

unidadesporregionterminadas(id:any){
  return this.isReady()
  .then(()=>{
    let regi=id;
    return this.database.executeSql(`SELECT idUnidadProductiva, nombre, regionId, IdProductor, terminado from unidades_productivas WHERE regionId IN (${regi}) AND terminado =1`, [])
          .then((data)=>{
            let todas = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i);
              this.nombreregion(todo.regionId).then((data:any)=> {
                todo.region=data;
              });
              this.nombreproductor(todo.IdProductor).then((data:any)=> {
                todo.productor=data;
              });
              todas.push(todo);
            }
            return todas;
          })
  }) 
}

todoslospaisesid(){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`SELECT id from paises`, [])
          .then((data)=>{
            let todos = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i).id;
              todos.push(todo);
            }
            return todos;
          })
  })
}

todoslospaises(){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`SELECT * from paises`, [])
          .then((data)=>{
            let todos = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i);
              //cast binary numbers back to booleansunidades_productivas
              todos.push(todo);
            }
            return todos;
          })
  })
}
todoslosdepartamentosid(){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`SELECT id from departamentos`, [])
          .then((data)=>{
            let todos = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i).id;
              todos.push(todo);
            }
            return todos;
          })
  })
}
todoslosmunicipiosid(){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`SELECT id from municipios`, [])
          .then((data)=>{
            let todos = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i).id;
              todos.push(todo);
            }
            return todos;
          })
  })
}
todoslosregionesid(){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`SELECT id from regiones`, [])
          .then((data)=>{
            let todos = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i).id;
              todos.push(todo);
            }
            return todos;
          })
  })
}

todoslosdepartamentos(){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`SELECT * from departamentos`, [])
          .then((data)=>{
            let todos = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i);
              todos.push(todo);
            }
            return todos;
          })
  })
}
todoslosmunicipios(){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`SELECT * from municipios`, [])
          .then((data)=>{
            let todos = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i);
              todos.push(todo);
            }
            return todos;
          })
  })
}
todoslasregiones(){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`SELECT * from regiones`, [])
          .then((data)=>{
            let todos = [];
            for(let i=0; i<data.rows.length; i++){
              let todo = data.rows.item(i);
              todos.push(todo);
            }
            return todos;
          })
  })
}

guardarformulario(codigo, nombre, observaciones, tipo, periodo){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`INSERT INTO formularios (id, nombre, observaciones, tipo, periodo) VALUES (?, ?, ?, ?, ?);`, 
      [codigo, nombre, observaciones, tipo, periodo]);
  }); 
}
guardarp(data){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`INSERT INTO pruebas (nombre) VALUES (?);`, 
      [data]);
  }); 
}
guardargrupo(idGrupoBase, nombre, posicion, id, textoAyuda){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`INSERT INTO grupos (idgrupobase, nombre, posicion, formularioid, textoayuda) VALUES (?, ?, ?, ?, ?);`, 
      [idGrupoBase, nombre, posicion, id, textoAyuda]);
  }); 
}
guardarpregunta(codigo, enunciado, posicion, tipo, valorinicial, grupobase, requerido, codresp){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`INSERT INTO preguntas (codigo, enunciado, posicion, tipo, valorinicial, grupoid, requerido, codigorespuesta) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, 
      [codigo, enunciado, posicion, tipo, valorinicial, grupobase, requerido, codresp]);
  }); 
}
guardarrespuesta(codigo, nombre, valor, tipo, preguntaid){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`INSERT INTO respuestas (codigo, nombre, valor, tipo, preguntaid) VALUES (?, ?, ?, ?, ?);`, 
      [codigo, nombre, valor, tipo, preguntaid]);
  }); 
}

guardarprueba(){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`INSERT INTO formularios
      (id, nombre, observaciones, clase, periodo) VALUES ( 1, 'prueb', 'esto es una prueba', 101, '2017 10126');`, 
      []);
  }); 
}

formularioid(tipo){
  return this.isReady(
  ).then(()=>{
    return this.database.executeSql(`SELECT id FROM formularios WHERE tipo =  ${tipo} `, []).then((data)=>{
      let id;
      if(data.rows.length){
        let todo=data.rows.item(0).id;
        id=todo;
      }else{
        let todo;
        todo=null;
        id=todo;          
      }
      return id;
    })
  })
}
gruposbyid(id){
  return this.isReady(
  ).then(()=>{
    return this.database.executeSql(`SELECT * FROM grupos WHERE formularioid =  ${id}  ORDER BY posicion ASC`, []).then((data)=>{
      let todos=[];
      if(data.rows.length){
        for (let i = 0; i < data.rows.length; i++) {
          let todo = data.rows.item(i);          
          todos.push(todo);
        }
      }else{
        let todo;
        todo=null;
        todos=todo;          
      }
      return todos;
    })
  })
}

preguntasporgrupo(grupo){
  return this.isReady(
  ).then(()=>{
    return this.database.executeSql(`SELECT * FROM preguntas WHERE grupoid =  ${grupo}  ORDER BY posicion ASC`, []).then((data)=>{
      let todos=[];
      if(data.rows.length){
        for (let i = 0; i < data.rows.length; i++) {
          let todo = data.rows.item(i);         
          
            todo.respuestas=[];
            todo.identificador='respuesta'+i;
          todos.push(todo);
        }
      }else{
        let todo;
        todo=null;
        todos=todo;          
      }
      return todos;
    })


  })
}

respuestasporpregunta(pregunta){
  let ids=pregunta.join();
  return this.isReady(
  ).then(()=>{
    return this.database.executeSql(`SELECT * FROM respuestas WHERE preguntaid IN (${ids})`, []).then((data)=>{
      let todos=[];
      if(data.rows.length){
        for (let i = 0; i < data.rows.length; i++) {
          let todo = data.rows.item(i);
          todo.respuesta=[];
          todos.push(todo);
        }
      }else{
        let todo;
        todo='.l. jodete ';
        todos=todo;          
      }
      return todos;
    })
  })

}

todasuproductivas(){
  return this.isReady()
    .then(()=>{
      return this.database.executeSql(`SELECT idUnidadProductiva, nombre, regionId, IdProductor, terminado from unidades_productivas`, []).then((data)=>{
          let todas = [];
          for(let i=0; i<data.rows.length; i++){
            let todo = data.rows.item(i);
            this.nombreregion(todo.regionId).then((data:any)=> {
              todo.region=data;
            });
            this.nombreproductor(todo.IdProductor).then((data:any)=> {
              todo.productor=data;
            });
            todas.push(todo);
          }
          return todas;
          })
        })
}

todasuproductivas2(){
  return this.isReady()
    .then(()=>{
      return this.database.executeSql(`SELECT idUnidadProductiva, nombre, regionId, IdProductor, terminado from unidades_productivas`, []).then((data)=>{
          let todas = [];
          for(let i=0; i<data.rows.length; i++){
            let todo = data.rows.item(i);
            this.nombreregion(todo.regionId).then((data:any)=> {
              todo.region=data;
            });
            this.nombreproductor(todo.IdProductor).then((data:any)=> {
              todo.productor=data;
            });
            todas.push(todo);
          }
          return todas;
          })
        })
}


guardarrespuestaporpregunta(unidadp, grup, respuestascodigo, preguntaid ,codigoresp , valorresp , valortext){
  return this.isReady()
  .then(()=>{
    return this.database.executeSql(`INSERT INTO respuestasguardadas (unidadproductiva, grupo, pregunta, respuestascodigo, codigorespuesta, valorrespuesta, valor, observacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, 
      [unidadp, grup, respuestascodigo, preguntaid ,codigoresp , valorresp , valortext, '']);
  }); 
  
}

}
