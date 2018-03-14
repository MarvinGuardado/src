import { Component } from '@angular/core';
import { NavController, 
  AlertController, // To Add Button
  ActionSheetController // To delete
 } from 'ionic-angular';

import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from '@firebase/util';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  currentUser:any;
  PublRef:any;
  LikeRef: any;
  noLikeRef: any;
  publicaciones: AngularFireList<any>;
  likes: AngularFireList<any>;
  noLikes: AngularFireList<any>;

  searchQuery: string = '';
  
  constructor(
    public navCtrl: NavController, 
    public alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,
    public afDatabase: AngularFireDatabase,
    public afAuth: AngularFireAuth,
  ) {
    this.PublRef = afDatabase.list('publicaciones');
    this.publicaciones = this.PublRef.valueChanges();

    this.LikeRef = afDatabase.list('likes');
    this.likes = this.LikeRef.valueChanges();

    this.noLikeRef = afDatabase.list('noLikes');
    this.noLikes = this.noLikeRef.valueChanges();


    this.initializeItems();


    afAuth.authState.subscribe(user => {
      if (!user) {
        this.currentUser = null;
        return;
      }
      this.currentUser = {uid:user.uid, photoURL: user.photoURL, nombre: user.displayName};
      
    });
  }


  initializeItems() {

  	
    this.items=['Marvin Guardado', 'Loren Guardado','Luis Hernandez','Hristo Oviedo'] ;
    
  }


   getItems(ev: any) {
 
    this.initializeItems();

    let val = ev.target.value;
    
    if (val && val.trim() != '') {
      this.items = this.items.filter((item) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }


getCosa(){

	return this.af.database.publicador('/publicaciones');
}




  agregarPublicacion(){
    let prompt = this.alertCtrl.create({
     title: 'publicacion nueva',
      inputs: [
        {
          name: 'title',
          placeholder: 'publicacion'
        },
      ],
  
      buttons: [
        {
          text: 'Cancelar',
          handler: data => {
          console.log('Cancel clicked');
          }
        },
        {
          text: 'Publicar',
          handler: data => {
            const newPublRef = this.PublRef.push({});
   
            newPublRef.set({
              id: newPublRef.key,
              contenido: data.title,
              uid: this.currentUser.uid,
              publicador: this.currentUser.nombre,
              publicadorPhoto: this.currentUser.photoURL,
              likes: 0,
              noLikes: 0,
              estadoLike: 'thumbs-up',
              modo: 'publico'
            });
          }
        }
      ]
    });
    prompt.present();
  }

  cerrarSesion(){
  	let actionSheet = this.actionSheetCtrl.create({
      title: 'que quieres hacer?',
      buttons: [
        {
          text: 'Cerrar Sesion',
          handler: () => {
          	 this.afAuth.auth.signOut();

            } 
          
        },{
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        ]
    });
    actionSheet.present()

    }

    Publico(publicacionId,modo){
    	let actionSheet = this.actionSheetCtrl.create({
      title: 'Escoja un modo de privacidad :',
      buttons: [
        {
          text: 'Publico',
          handler: () => {
          		this.PublRef.update(publicacionId, {
         		modo:'Publico',lastUpdatedBy: this.currentUser.uid}); 
            } 
          
        },{
          text: 'Privado',
          handler: () => {

          		this.PublRef.update(publicacionId, {
         		modo:'Privado',lastUpdatedBy: this.currentUser.uid
        		}); 

            } 
          
        },{
          text: 'Mis Amigos',
          handler: () => {
          		this.PublRef.update(publicacionId, {
         		modo:'Mis amigos',lastUpdatedBy: this.currentUser.uid
        		}); 
            } 
          
        },{
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        ]
    });
    actionSheet.present()
    }
  

  removePubl(publicacionId: string, uid: string){

  	if (uid == this.currentUser.uid){

  		this.PublRef.remove(publicacionId);
  		

        
  	}

  }


  login() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then((response)=>{
      console.log('resultado login google:', response);
      
      const userRef = this.afDatabase.list('users');

      userRef.update(response.user.uid, 
        {
          userId: response.user.uid, 
          displayName: response.user.displayName,
          photoURL: response.user.photoURL,
         
        });
      
      
    });
  }

  loginWithEmail() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.EmailAuthProvider()).then((xx)=>{

    });
  }
  logout() {
    this.afAuth.auth.signOut();
  }


  like(publicacionId,likes){


  		const  newLikeRef = this.LikeRef.push({});

  		newLikeRef.set({
              id: newLikeRef.key,
              uid: this.currentUser.uid,
              likeador: this.currentUser.nombre,
              pubId: publicacionId
            });

  		this.PublRef.update(publicacionId, {

	            likes: (likes+1) });

  		
  }

  

	noLike(publicacionId,noLikes){


  		const  newNoLikeRef = this.noLikeRef.push({});

  		newNoLikeRef.set({
              id: newNoLikeRef.key,
              uid: this.currentUser.uid,
              noLikeador: this.currentUser.nombre,
              pubId: publicacionId
            });


  		this.PublRef.update(publicacionId, {

	            noLikes: ( noLikes+1) });

  		
	}


	getUsers(usuario: string){
			
			this.currentUser = this.afDatabase.list('users', 
		    ref => ref.orderByChild('displayName').startAt(usuario));
			
	}
  	

	getPublicacionFiltro(filtro: string){
		this.publicaciones= this.afDatabase.list('/publicaciones',{
			query:{
			orderByChild: 'likes',
			equalTo: filtro
		}
		}) as AngularFireList<any>;
		return this.publicaciones; 
		
	}

}


