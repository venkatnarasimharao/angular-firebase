import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import {
  addDoc,
  Firestore,
  collection,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private fireauth: AngularFireAuth,
    private router: Router,
    public firestore: Firestore
  ) {}

  // login method
  login(email: string, password: string) {
    return this.fireauth.signInWithEmailAndPassword(email, password);
  }

  // register method
  register(email: string, password: string) {
    return this.fireauth.createUserWithEmailAndPassword(email, password);
  }

  createUser(res: any, admin: any) {
    let user = {
      id: res.user.uid,
      username: res.user.email,
      role: admin ? 'admin' : 'user',
    };
    const dbInstance = collection(this.firestore, 'Employee');
    addDoc(dbInstance, user)
      .then((user1) => {
        this.router.navigate(['/login']);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getDetails(collectionName: string, id?: string) {
    let dbInstance: any = collection(this.firestore, collectionName);
    if (id) {
      dbInstance = query(
        collection(this.firestore, collectionName),
        where('id', '==', id)
      );
    }
    return new Promise((resolve, reject) => {
      getDocs(dbInstance).then((response) => {
        let resp = [
          ...response.docs.map((item: any) => {
            return { ...item.data(), uid: item.id };
          }),
        ];
        resolve(resp);
      });
    });
  }

  // sign out
  logout() {
    this.fireauth.signOut().then(
      () => {
        sessionStorage.clear();
        this.router.navigate(['/login']);
      },
      (err: any) => {
        alert(err.message);
      }
    );
  }
}
