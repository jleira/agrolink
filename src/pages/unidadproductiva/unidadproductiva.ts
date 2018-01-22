import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,  LoadingController, ToastController, ModalController,PopoverController } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { UproductivaProvider } from '../../providers/uproductiva/uproductiva';
import { RegionProvider } from '../../providers/region/region';
import { UpdetallesPage} from '../updetalles/updetalles';
import { FiltroupPage} from '../filtroup/filtroup';
import {Storage} from "@ionic/storage";


@IonicPage()
@Component({
  selector: 'page-unidadproductiva',
  templateUrl: 'unidadproductiva.html',
})
export class UnidadproductivaPage {

  loading: any;
  searchTerm: string = '';
  searchControl: FormControl;
  items: any;
  opciones: any;
  searching: any = false;
  prueba:any;
  reg:any;
  reg2:any;
  paises:any;
  departamentos:any;
  municipios:any;
  regiones:any;
  auditor=false;
  promotor=false;
 
  constructor(
    public uproductiva: UproductivaProvider,
    public region: RegionProvider,
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController, 
    private toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public popoverCtrl: PopoverController,
    private readonly storage: Storage
  ) {
      this.searchControl = new FormControl();
      this.reg="prueba";
      this.auditor=false;
      this.promotor=false;
      this.storage.get('roll').then( roll =>
        {
            if(roll){
              if(roll.indexOf("Auditor")>-1){
                this.auditor=true;
              }
              if(roll.indexOf("Promotor")>-1){
                this.promotor=true;      
              }      
            }
        }
      );
  }

  ionViewDidLoad() {
    this.cargardatos();
  }
  cargardatos() {
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Cargando informacion...'
    });

    loading.present();
        this.uproductiva.llamaruproductivas().then((data:any)=>{
          this.items=data;
          loading.dismiss(); 
          return this.items;
        });       
        if(this.items==""){
          this.handleError();
        }  
  }

  handleError() {
  let message: string;
    message='No tiene unidades asignadas en esta region';
     const toast = this.toastCtrl.create({
      message,
      showCloseButton: true,
      closeButtonText:'OK',
      position: 'bottom',
      duration: 10000
    });
      toast.present();
  }
  abrirdetalles(id: any) {
    this.prueba=id;
      let modal = this.modalCtrl.create(UpdetallesPage,{'ids': this.prueba});
    modal.present();

  }

  showPrompt() {
    let popover = this.popoverCtrl.create(FiltroupPage);
    popover.onDidDismiss(data => {
      this.prueba=JSON.stringify(data);

      let loading = this.loadingCtrl.create({
        spinner: 'bubbles',
        content: 'Cargando informacion...'
      });
  
      loading.present();
          
if(typeof data =="undefined"){
this.prueba="indefinido todo";
      }else{
        this.prueba=JSON.stringify(data);
        if(data['mostrar']==1){//mostrar todas
          if(data['territorio']==1){
            this.uproductiva.llamaruproductivas().then((datau:any)=>{
              this.items=datau;
              return this.items;
            });
          }else if(data['territorio']!=1){
            if(data['territorio']==2){//pais
              this.reg2=data['vereda'];
             this.region.departamentosenpais(data['vereda']).then((datapaises)=>{
               this.reg=datapaises;
              this.region.municipiosendepartamentos(this.reg).then((datam)=>{
                this.municipios=datam;
                this.region.regionesenmunicipio(this.municipios).then((datare)=>{
                  this.regiones=datare;
                  if(data['ordenar_por']){
                    this.uproductiva.unidadestodasporregiones(this.regiones,data['orientacion']).then((dataun:any)=>{
                      this.items=dataun;
                      return this.items;
                    });  
                  }else{
                    this.uproductiva.unidadestodasporregiones(this.regiones,'').then((dataun:any)=>{
                      this.items=dataun;
                      return this.items;
                    });
                    }


                });
               });
              });
            }else if(data['territorio']==3){//departamentos
              this.reg=data['vereda'].join();
              this.region.municipiosendepartamentos(this.reg).then((datam)=>{
                this.municipios=datam;
                this.region.regionesenmunicipio(this.municipios).then((datare)=>{
                  this.regiones=datare;
                  if(data['ordenar_por']){
                    this.uproductiva.unidadestodasporregiones(this.regiones,data['orientacion']).then((dataun:any)=>{
                      this.items=dataun;
                      return this.items;
                    });  
                  }else{
                    this.uproductiva.unidadestodasporregiones(this.regiones,'').then((dataun:any)=>{
                      this.items=dataun;
                      return this.items;
                    });
                    }
                });
               });
            } if(data['territorio']==4){//municipios
              this.reg=data['vereda'].join();
              this.region.regionesenmunicipio(this.reg).then((datare)=>{
                this.regiones=datare;
                if(data['ordenar_por']){
                  this.uproductiva.unidadestodasporregiones(this.regiones,data['orientacion']).then((dataun:any)=>{
                    this.items=dataun;
                    return this.items;
                  });  
                }else{
                  this.uproductiva.unidadestodasporregiones(this.regiones,'').then((dataun:any)=>{
                    this.items=dataun;
                    return this.items;
                  });
                  }
              });
            }
            if(data['territorio']==5){//regiones
              this.reg=data['vereda'].join();
              if(data['ordenar_por']){
                this.uproductiva.unidadestodasporregiones(this.reg,data['orientacion']).then((dataun:any)=>{
                  this.items=dataun;
                  return this.items;
                });  
              }else{
                this.uproductiva.unidadestodasporregiones(this.reg,'').then((dataun:any)=>{
                  this.items=dataun;
                  return this.items;
                });
                }
            }
          }

        }else if(data['mostrar']==2){//pendientes
          if(data['vereda']=="" && data['ordenar_por']== "" && data['orientacion']=="" && data['territorio']==1){
            this.uproductiva.unidadespendientes().then((datau:any)=>{
              this.items=datau;
              return this.items;
            });
          }else if(data['vereda']!="" && data['ordenar_por']== "" && data['orientacion']=="" && data['territorio']!=1){
            if(data['territorio']==2){//pais
              this.reg2=data['vereda'];
             this.region.departamentosenpais(data['vereda']).then((datapaises)=>{
               this.reg=datapaises;
              this.region.municipiosendepartamentos(this.reg).then((datam)=>{
                this.municipios=datam;
                this.region.regionesenmunicipio(this.municipios).then((datare)=>{
                  this.regiones=datare;
                  if(data['ordenar_por']){
                    this.uproductiva.unidadespendientesporregiones(this.regiones,data['orientacion']).then((dataun:any)=>{
                      this.items=dataun;
                      return this.items;
                    });
                  }else{
                    this.uproductiva.unidadespendientesporregiones(this.regiones,'').then((dataun:any)=>{
                      this.items=dataun;
                      return this.items;
                    });
                    }

                });
               });
              });
            }else if(data['territorio']==3){//departamentos
              this.reg=data['vereda'].join();
              this.region.municipiosendepartamentos(this.reg).then((datam)=>{
                this.municipios=datam;
                this.region.regionesenmunicipio(this.municipios).then((datare)=>{
                  this.regiones=datare;
                  if(data['ordenar_por']){
                    this.uproductiva.unidadespendientesporregiones(this.regiones,data['orientacion']).then((dataun:any)=>{
                      this.items=dataun;
                      return this.items;
                    });
                  }else{
                    this.uproductiva.unidadespendientesporregiones(this.regiones,'').then((dataun:any)=>{
                      this.items=dataun;
                      return this.items;
                    });
                    }
                });
               });
            } if(data['territorio']==4){//municipios
              this.reg=data['vereda'].join();
              this.region.regionesenmunicipio(this.reg).then((datare)=>{
                this.regiones=datare;
                if(data['ordenar_por']){
                  this.uproductiva.unidadespendientesporregiones(this.regiones,data['orientacion']).then((dataun:any)=>{
                    this.items=dataun;
                    return this.items;
                  });
                }else{
                  this.uproductiva.unidadespendientesporregiones(this.regiones,'').then((dataun:any)=>{
                    this.items=dataun;
                    return this.items;
                  });
                  }
              });
            }
            if(data['territorio']==5){//regiones
              this.reg=data['vereda'].join();
              if(data['ordenar_por']){
                this.uproductiva.unidadespendientesporregiones(this.reg,data['orientacion']).then((dataun:any)=>{
                  this.items=dataun;
                  return this.items;
                });
              }else{
                this.uproductiva.unidadespendientesporregiones(this.reg,'').then((dataun:any)=>{
                  this.items=dataun;
                  return this.items;
                });
                }
            }
          }

        }else if(data['mostrar']==3){//realizadas

          if(data['vereda']=="" && data['ordenar_por']== "" && data['orientacion']=="" && data['territorio']==1){
            this.uproductiva.unidadesterminadas().then((datau:any)=>{
              this.items=datau;
              return this.items;
            });
          }else if(data['vereda']!="" && data['ordenar_por']== "" && data['orientacion']=="" && data['territorio']!=1){
            if(data['territorio']==2){//pais
              this.reg2=data['vereda'];
             this.region.departamentosenpais(data['vereda']).then((datapaises)=>{
               this.reg=datapaises;
              this.region.municipiosendepartamentos(this.reg).then((datam)=>{
                this.municipios=datam;
                this.region.regionesenmunicipio(this.municipios).then((datare)=>{
                  this.regiones=datare;
                  if(data['ordenar_por']){
                    this.uproductiva.unidadesterminadasporregiones(this.regiones,data['orientacion']).then((dataun:any)=>{
                      this.items=dataun;
                      return this.items;
                    });
                  }else{
                    this.uproductiva.unidadesterminadasporregiones(this.regiones,'').then((dataun:any)=>{
                      this.items=dataun;
                      return this.items;
                    });
                    }

                }); 
               });
              });
            }else if(data['territorio']==3){//departamentos
              this.reg=data['vereda'].join();
              this.region.municipiosendepartamentos(this.reg).then((datam)=>{
                this.municipios=datam;
                this.region.regionesenmunicipio(this.municipios).then((datare)=>{
                  this.regiones=datare;
                  if(data['ordenar_por']){
                    this.uproductiva.unidadesterminadasporregiones(this.regiones,data['orientacion']).then((dataun:any)=>{
                      this.items=dataun;
                      return this.items;
                    });
                  }else{
                    this.uproductiva.unidadesterminadasporregiones(this.regiones,'').then((dataun:any)=>{
                      this.items=dataun;
                      return this.items;
                    });
                    }
                });
               });
            } if(data['territorio']==4){//municipios
              this.reg=data['vereda'].join();
              this.region.regionesenmunicipio(this.reg).then((datare)=>{
                this.regiones=datare;
                if(data['ordenar_por']){
                  this.uproductiva.unidadesterminadasporregiones(this.regiones,data['orientacion']).then((dataun:any)=>{
                    this.items=dataun;
                    return this.items;
                  });
                }else{
                  this.uproductiva.unidadesterminadasporregiones(this.regiones,'').then((dataun:any)=>{
                    this.items=dataun;
                    return this.items;
                  });
                  }
              });
            }
            if(data['territorio']==5){//regiones
              this.reg=data['vereda'].join(); 
              if(data['ordenar_por']){
                this.uproductiva.unidadesterminadasporregiones(this.reg,data['orientacion']).then((dataun:any)=>{
                  this.items=dataun;
                  return this.items;
                });
              }else{
                this.uproductiva.unidadesterminadasporregiones(this.reg,'').then((dataun:any)=>{
                  this.items=dataun;
                  return this.items;
                });
                }
            }
          }

          
        }

      }loading.dismiss();
    }
        );
    popover.present();
}

}
