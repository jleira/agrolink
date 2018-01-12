import { Component } from '@angular/core';
import { ViewController, NavParams , AlertController, LoadingController, ToastController} from 'ionic-angular';
import { FormulariosProvider } from '../../providers/formularios/formularios';

@Component({

  templateUrl: 'noconformidad.html'

})
export class NuevanoconformidadPage {
  img: any;
  up;
  tipo;
  id:number;
  descripcion:string;
  detalle:string;
  categoria;
  fecha;
  tareas;
  
  categorias: Array<{ id: number, note: string }>;
  habilitartarea:boolean;
  constructor(
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    public navParams: NavParams,
    public formulario: FormulariosProvider
  ) {


      this.up = this.navParams.get('up');
      this.tipo=this.navParams.get('tipo');
      let idd = this.navParams.get('id');
      if (idd){
        this.id=idd;
        this.habilitartarea=true;
        this.formulario.tareas(idd).then((data)=>{
          this.tareas=data;
          console.log(this.tareas);
          return this.tareas;
        });
        this.formulario.noconformidadid(this.id).then((data)=>{
          this.descripcion=data[0].descripcion;
          this.detalle=data[0].detalle;
          this.fecha=data[0].fechaposiblecierre;
          console.log(data, this.descripcion, this.fecha, this.detalle);
          return (this.descripcion, this.descripcion, this.detalle);

        });
      }else{
        this.habilitartarea=false;
      }
      this.formulario.categoria().then((categoriasg)=>{
  this.categorias=categoriasg; 
})
  }
  noconformidad(values){
    let dt = new Date();
    let month = dt.getMonth()+1;
    let day = dt.getDate();
    let year = dt.getFullYear();
    let loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      content: 'Validando datos...'
    });


    loading.present();

    console.log(this.up, this.tipo,values.categoria,values.detalle, values.descripcion, year+ '-' +month + '-' + day, values.fecha ,0);
    this.formulario.guardarnoconformidades(this.up, this.tipo,values.categoria,values.detalle, values.descripcion, year+ '-' +month + '-' + day, values.fecha ,0).then((data)=>{
      if(data){
        this.habilitartarea=true;
        this.id=data;
        this.categorias=values.categoria;
        this.detalle=values.detalle; 
        this.descripcion=values.descripcion;
        this.fecha=values.fecha;
      }else{
          this.handleError('Error guardando no conformidad, intente guardar nuevamente');
      }
      loading.dismiss();
    }).catch((err)=>{
      console.log(err);
      loading.dismiss();

    });
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }

  agregartarea(){
    let prompt = this.alertCtrl.create({
      title: 'Nueva tarea',
      message: "Agregar nueva tarea",
      inputs: [
        {
          name: 'nombre',
          placeholder: 'ingrese nombre'
        },{
          name: 'descripcion',
          placeholder: 'ingrese descripcion'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            this.formulario.agregartarea(this.id,data.nombre,data.descripcion).then((data)=>{
              console.log(data);
              this.formulario.tareas(this.id).then((tar)=>{
                this.tareas=tar;
                console.log(this.tareas);
              })
            },err=>{
              this.handleError('error al guardar tarea, intentelo nuevamente');
            })
            console.log('Saved clicked', data);
          }
        }
      ]
    });
    prompt.present();

    }
    handleError(error: string) {
      let message: string;
      message= error;
      const toast = this.toastCtrl.create({
        message,
        duration: 5000,
        position: 'bottom'
      });
  
      toast.present();
    }

    editarnoconformidad(id,columna,valor){
      return this.formulario.editarnoconformidad(id,columna,valor).then((data)=>{
        console.log(data);
      })
    }
  }