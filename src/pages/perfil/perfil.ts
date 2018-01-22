import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import {JwtHelper, AuthHttp,  AuthConfig} from "angular2-jwt";
import {SERVER_URL} from "../../config";
import {Storage} from "@ionic/storage";
/**
 * Generated class for the PerfilPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {
  nombre: string;
  roll: string;
  tipo_id: string;
  id: string;
  correo: string;
  usuario: string;
  empresa: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,  
    jwtHelper: JwtHelper,
    private readonly  authHttp: AuthHttp,
    private readonly storage: Storage,
    public auth: AuthProvider
  ) {
    this.storage.get('nombre').then( d_nombre =>
      {this.nombre = d_nombre;
      },
    );
    this.storage.get('roll').then( d_roll =>
      {this.roll = d_roll;
      },
    );
    this.storage.get('tipo_id').then( d_tipo_id =>
      {this.tipo_id = d_tipo_id;
      },
    );
    this.storage.get('identificacion').then( d_id =>
      {this.id = d_id;
      },
    );
    this.storage.get('mail').then( d_correo =>
      {this.correo = d_correo;
      },
    );
    this.storage.get('identificador').then( d_usuario =>
      {this.usuario = d_usuario;
      },
    );
    this.storage.get('empresa').then( d_nombre =>
      {this.nombre = d_nombre;
      },
    );
  }
  logout() {
    this.auth.logout();
  } 
}
