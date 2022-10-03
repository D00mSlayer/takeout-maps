import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  clearStorage () {
    localStorage.removeItem('testObj');
  }

  setItemToStorage (data: string) {
    localStorage.setItem('testObj', data);
  }

  getItemFromStorage () {
    return localStorage.getItem('testObj');
  }

}
