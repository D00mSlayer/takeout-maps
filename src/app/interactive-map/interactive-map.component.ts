import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '.././local-storage.service'
import { LocationServiceService } from '.././location-service.service'
import * as L from "leaflet";
import * as _ from 'underscore';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { SemanticInterfaceObject } from '.././semantic-interface';

@Component({
  selector: 'app-interactive-map',
  templateUrl: './interactive-map.component.html',
  styleUrls: ['./interactive-map.component.css'],
  providers: [LocalStorageService, LocationServiceService]
})
export class InteractiveMapComponent implements OnInit {

  map;
  mapData: SemanticInterfaceObject = {};
  start?: Date;
  end?: Date;

  markerIcon = {
    icon: L.icon({
      iconSize: [25, 41],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40],
      iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-shadow.png"
    })
  };

  options = {
    layers: [
      L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 12,
    center: L.latLng(0, 0)
  };

  layersControl = {
    baseLayers: {
      'Open Street Map': L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' }),
      'Open Cycle Map': L.tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    },
    overlays: {
      'Big Circle': L.circle([ 46.95, -122 ], { radius: 5000 }),
      'Big Square': L.polygon([[ 46.8, -121.55 ], [ 46.9, -121.55 ], [ 46.9, -121.7 ], [ 46.8, -121.7 ]])
    }
  };

  layers: any[] = [
    // L.circle([ 46.95, -122 ], { radius: 5000 }),
    // L.polygon([[ 46.8, -121.85 ], [ 46.92, -121.92 ], [ 46.87, -121.8 ]]),
    // L.marker([ 46.879966, -121.726909 ])
  ];

  constructor(
    private localStorageService: LocalStorageService,
    private locationService: LocationServiceService
  ) { }

  ngOnInit(): void {
    this.mapData = JSON.parse(this.localStorageService.getItemFromStorage() || '{}');
  }

  valueChanged(event: MatDatepickerInputEvent<Date>) {
    this.layers = [];
    // debugger
    // console.log(this.mapData)
    // console.log(event.value)
    // if (_.isEmpty(this.mapData)) return;
    // if (!_.has(this.mapData, 'timelineObjects')) return;
    var timelineObjects = this.mapData.timelineObjects || [];
    // console.log(timelineObjects)
    var placeVisits = _.filter(timelineObjects, function (each) {
      return _.has(each, 'placeVisit');
    });
    // console.log(placeVisits)
    if (!placeVisits) return;
    var markers : any[] = [];
    var lnpA: any[] = [];
    // debugger
    let _this = this;
    _.each(placeVisits, function (each) {
      // debugger
      if (!each.placeVisit.centerLatE7) return;
      if (!each.placeVisit.centerLngE7) return;
      _this.start = new Date(new Date(each.placeVisit.duration.startTimestamp).toDateString());
      _this.end = new Date(new Date(each.placeVisit.duration.endTimestamp).toDateString());
      // console.log(_this.isDateWithinRange(start, end, new Date(event.value as Date).toDateString()))
      // console.log(_this.start, _this.end, event.value)
      if (!_this.isDateWithinRange(_this.start, _this.end, event.value as Date)) return;
      // console.log(each.placeVisit.centerLatE7)
      var marker = L.marker(
        [each.placeVisit.centerLatE7/10000000, each.placeVisit.centerLngE7/10000000],
        {
          icon: L.icon({
            iconSize: [25, 41],
            iconAnchor: [10, 41],
            popupAnchor: [2, -40],
            // specify the path here
            iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-shadow.png"
          })
        }
      );
      lnpA.push([each.placeVisit.centerLatE7/10000000, each.placeVisit.centerLngE7/10000000]);
      markers.push(marker);
    });
    // console.log(markers)
    if (_.isEmpty(markers)) return;
    if (_.isEmpty(lnpA)) return;
    var myBounds = new L.LatLngBounds(lnpA);
    this.sample();
    // debugger
    this.layers = markers;
    this.map.fitBounds(myBounds);
  }

  sample() {
    console.log('samokel')
  }

  onMapReady(map: L.Map) {
    this.map = map;
    // this.initMarkers();
    console.log('onmread')
    this.locationService.getPosition().then(pos=>
    {
      // this.options['center'] = L.latLng(pos.lat, pos.lng)
      this.map.panTo(L.latLng(pos.lat, pos.lng))
       console.log(`Positon: ${pos.lng} ${pos.lat}`);
    });
  }

  isDateWithinRange(from: Date, to: Date, check: Date) {
    return check >= from && check <= to;
  }

  // initMarkers() {
  //   const popupInfo = `<b style="color: red; background-color: white">${
  //     this.popupText
  //   }</b>`;

  //   L.marker([this.homeCoords.lat, this.homeCoords.lon], this.markerIcon)
  //     .addTo(this.map)
  //     .bindPopup(popupInfo);
  // }

}
