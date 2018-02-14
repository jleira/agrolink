import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { UproductivaProvider } from '../../providers/uproductiva/uproductiva';

@IonicPage()
@Component({
  selector: 'page-updetalles',
  templateUrl: 'updetalles.html',
})
export class UpdetallesPage {

  idup;
  detalles:any;
  productor:any;
  reg;
  municipio;
  departamento;
  pais;
  constructor(public navCtrl: NavController, public navParams: NavParams, public uproductiva: UproductivaProvider,  public viewCtrl: ViewController) {
    this.idup="asi";
  }

  ionViewWillEnter() {
   let uni=this.navParams.get('ids');
    this.uproductiva.detallesf(uni.idUnidadProductiva,uni.tipo).then((data:any)=>{
      this.detalles=data;    
      this.datosregion(data[0]['regionId']);
    });

return this.idup,this.detalles,this.productor;    
  }
datosregion(id){
  this.uproductiva.detallesregion(id).then((dataregion:any)=>{
    this.reg=dataregion['nombre'];
    this.datosmunicipio(dataregion['municipioid']);
    return this.reg;
  });
  return this.reg;
}
datosmunicipio(id){
  this.municipio=id;
  this.uproductiva.detallesmunicipio(id).then((datamunicipio:any)=>{
  this.municipio=datamunicipio['nombre'];
  this.datosdepartamento(datamunicipio['departamentoid']);
   return this.municipio;
  });
  return this.municipio;
}
datosdepartamento(id){
  this.uproductiva.detallesdepartamento(id).then((datadepartamento:any)=>{
    this.departamento=datadepartamento['nombre'];
    this.datospais(datadepartamento['paisid']);
    return this.departamento;
  });
  return this.departamento;
}
datospais(id){
  this.uproductiva.detallespais(id).then((datapais:any)=>{
    this.pais=datapais['nombre'];

    return this.pais;
  });
  return this.pais;
}

dismiss() {
    this.viewCtrl.dismiss();
  }

}
