import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  clearStorage (key: string) {
    localStorage.removeItem('testObj');
    localStorage.removeItem(key);
  }

  setItemToStorage (key: string, data: string) {
    localStorage.setItem(key, data);
  }

  getItemFromStorage (key: string) {
    return localStorage.getItem(key);
  }

}
