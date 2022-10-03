import { Injectable } from '@angular/core';
import { DEFAULTCOORDS } from './constants'

@Injectable({
  providedIn: 'root'
})
export class LocationServiceService {

  constructor() { }

  getPosition(): Promise<any>
  {
    return new Promise((resolve, reject) => {

      navigator.geolocation.getCurrentPosition(resp => {

          resolve({lng: resp.coords.longitude, lat: resp.coords.latitude});
        },
        err => {
          // reject(err);
          resolve({lng: DEFAULTCOORDS.lng, lat: DEFAULTCOORDS.lat});
        });
    });

  }

}
