import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { FormulariosProvider } from '../../providers/formularios/formularios';

@Component({

  templateUrl: 'noconformidad.html'

})
export class NuevanoconformidadPage {
  img: any;
  up;
  tipo;
  categorias: Array<{ id: number, note: string }>;
  
  constructor(
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public formulario: FormulariosProvider
  ) {
      this.up = this.navParams.get('up');
      this.tipo=this.navParams.get('tipo');
      this.formulario.categoria().then((categoriasg)=>{
  this.categorias=categoriasg; 
})
  }
  noconformidad(values){
    let dt = new Date();
    let month = dt.getMonth()+1;
    let day = dt.getDate();
    let year = dt.getFullYear();
    console.log(values.fecha)

    console.log(this.up, this.tipo,values.categoria,values.detalle, values.descripcion, year+ '-' +month + '-' + day, values.fecha ,0);
    this.formulario.guardarnoconformidades(this.up, this.tipo,values.categoria,values.detalle, values.descripcion, year+ '-' +month + '-' + day, values.fecha ,0).then((data)=>{
      console.log(data);
    });
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }

}