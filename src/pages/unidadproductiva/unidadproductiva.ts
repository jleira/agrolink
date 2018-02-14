import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, ModalController, PopoverController } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import { UproductivaProvider } from '../../providers/uproductiva/uproductiva';
import { RegionProvider } from '../../providers/region/region';
import { UpdetallesPage } from '../updetalles/updetalles';
import { FiltroupPage } from '../filtroup/filtroup';
import { Storage } from "@ionic/storage";
import { FormulariosPage } from '../formularios/formularios';
import { FORMULARIO_PROMOTORIA, FORMULARIO_AUDITORIA } from "../../config";

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
  prueba: any;
  reg: any;
  reg2: any;
  paises: any;
  departamentos: any;
  municipios: any;
  regiones: any;
  auditor = false;
  promotor = false;
  mostrar: string;
  territorio: number;
  vereda;
  orientacion;

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
    this.reg = "prueba";
    this.auditor = false;
    this.promotor = false;
    this.storage.get('roll').then(roll => {
      if (roll) {
        if (roll.indexOf("Auditor") > -1) {
          this.auditor = true;
        }
        if (roll.indexOf("Promotor") > -1) {
          this.promotor = true;
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
    this.uproductiva.llamaruproductivas().then((data: any) => {
      this.items = data;
      loading.dismiss();
      return this.items;
    });
    if (this.items == "") {
      this.handleError();
    }
  }

  handleError() {
    let message: string;
    message = 'No tiene unidades asignadas en esta region';
    const toast = this.toastCtrl.create({
      message,
      showCloseButton: true,
      closeButtonText: 'OK',
      position: 'bottom',
      duration: 10000
    });
    toast.present();
  }
  abrirdetalles(id: any) {
    this.prueba = id;
    let modal = this.modalCtrl.create(UpdetallesPage, { 'ids': this.prueba });
    modal.present();
  }

  showPrompt() {
    let profileModal = this.modalCtrl.create(FiltroupPage);
    profileModal.present();
    profileModal.onDidDismiss(data => {
      if (data) {
        console.log(data);

        this.orientacion = data.orientacion;
        this.mostrar = data.mostrar;
        if (data.territorio > 1) {
          if (data.territorio == 2) {
            this.region.departamentosenpais(data['vereda'].split(',')).then((datapaises) => {
              console.log('departamentos',datapaises);
              this.region.municipiosendepartamentos(datapaises.split(',')).then((datam) => {
                console.log('municipios',datam);
                this.region.regionesenmunicipio(datam).then((datare) => {
                  console.log('regiones', datare);
                  let tipos = FORMULARIO_AUDITORIA + ',' + FORMULARIO_PROMOTORIA;
                  console.log('datos a buscaar', this.mostrar.toString(), tipos.toString(), this.orientacion);
                  this.uproductiva.todaslasunidades(datare, this.mostrar.toString(), tipos.toString(), this.orientacion).then((data) => {
                    this.items = data;
                    return this.items;
                  })

                });
              });
            });
          } else if (data.territorio == 3) {
            this.region.municipiosendepartamentos(data.vereda.split(',')).then((datam) => {
              this.region.regionesenmunicipio(datam).then((datare) => {
                console.log('regiones', datare);
                let tipos = FORMULARIO_AUDITORIA + ',' + FORMULARIO_PROMOTORIA;
                console.log('datos a buscaar', this.mostrar.toString(), tipos.toString(), this.orientacion);
                this.uproductiva.todaslasunidades(datare, this.mostrar.toString(), tipos.toString(), this.orientacion).then((data) => {
                  this.items = data;
                  return this.items;
                })

              });
            });
          } else if (data.territorio == 4) {
              this.region.regionesenmunicipio(data.vereda.split(',')).then((datare) => {
                console.log('regiones', datare);
                let tipos = FORMULARIO_AUDITORIA + ',' + FORMULARIO_PROMOTORIA;
                console.log('datos a buscaar', this.mostrar.toString(), tipos.toString(), this.orientacion);
                this.uproductiva.todaslasunidades(datare, this.mostrar.toString(), tipos.toString(), this.orientacion).then((data) => {
                  this.items = data;
                  return this.items;
                })
              });
          }else if(data.territorio==5){
            let tipos = FORMULARIO_AUDITORIA + ',' + FORMULARIO_PROMOTORIA;
            this.uproductiva.todaslasunidades(data.vereda, this.mostrar.toString(), tipos.toString(), this.orientacion).then((data) => {
              this.items = data;
              return this.items;
            })
          }



        } else {
          let tipos = FORMULARIO_AUDITORIA + ',' + FORMULARIO_PROMOTORIA;
          this.uproductiva.todaslasunidades(false, this.mostrar.toString(), tipos.toString(), this.orientacion).then((data) => {
            this.items = data;
            return this.items;
          })

        }
      }
    });
  }


  abrirformulario(unidad) {

    this.navCtrl.push(FormulariosPage, {
      caso: 3, tipo: unidad.tipo, up: unidad, productor: unidad.productor
    });
  }


}
