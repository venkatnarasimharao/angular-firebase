import { Injectable } from '@angular/core';
import {
  addDoc,
  Firestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  where,
  orderBy,
  query,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(public firestore: Firestore) {}

  createCollection(body: any, collectionName: string) {
    const dbInstance = collection(this.firestore, collectionName);
    return addDoc(dbInstance, body);
  }

  getDetails(uid: any, collectionName?: string, orderby?: string) {
    let dbInstance: any = collection(
      this.firestore,
      collectionName ? collectionName : 'shift'
    );
    if (uid && !orderby) {
      dbInstance = query(
        collection(this.firestore, collectionName ? collectionName : 'shift'),
        where('id', '==', uid)
      );
    }
    if (uid && orderby) {
      dbInstance = query(
        collection(this.firestore, collectionName ? collectionName : 'shift'),
        where('id', '==', uid),
        orderBy(orderby)
      );
    }
    return new Promise((resolve, reject) => {
      getDocs(dbInstance).then((response) => {
        let resp = [
          ...response.docs.map((item: any) => {
            return { ...item.data(), uuid: item.id };
          }),
        ];
        resolve(resp);
      });
    });
  }

  updateData(body: any, id: any) {
    const dataToUpdate = doc(this.firestore, 'shift', id);
    return updateDoc(dataToUpdate, body);
  }
}
