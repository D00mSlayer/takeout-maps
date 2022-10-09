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
  payData: any = {};
  start?: Date;
  end?: Date;

  markerIcon = {
    icon: L.icon({
      iconSize: [25, 41],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40],
      iconUrl: "assets/icons/marker-icon.png",
      // iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
      shadowUrl: "assets/icons/marker-shadow.png"
      // shadowUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-shadow.png"
    })
  };

  moneySentIcon = {
    icon: L.icon({
      iconSize: [25, 41],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40],
      iconUrl: "assets/icons/sent-money.png",
      // iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
      // shadowUrl: "assets/icons/marker-shadow.png"
      // shadowUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-shadow.png"
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
    this.mapData = JSON.parse(this.localStorageService.getItemFromStorage('mapJSON') || '{}');
    this.payData = JSON.parse(this.localStorageService.getItemFromStorage('payJSON') || '{}');
  }

  valueChanged(event: MatDatepickerInputEvent<Date>) {
    this.updateTimelineData(event);
    this.updatePayData(event);
  }

  updatePayData(event: MatDatepickerInputEvent<Date>) {
    // debugger
    _.each(this.payData, function (each) {

    });
  }

  updateTimelineData(event: MatDatepickerInputEvent<Date>) {
    this.layers = [];
    var timelineObjects = this.mapData.timelineObjects || [];
    // debugger
    var placeVisits = _.filter(timelineObjects, function (each) {
      return _.has(each, 'placeVisit');
    });
    if (!placeVisits) return;
    var markers : any[] = [];
    var lnpA: any[] = [];
    let _this = this;
    _.each(placeVisits, function (each) {
      if (!each.placeVisit.centerLatE7) return;
      if (!each.placeVisit.centerLngE7) return;
      _this.start = new Date(new Date(each.placeVisit.duration.startTimestamp).toDateString());
      _this.end = new Date(new Date(each.placeVisit.duration.endTimestamp).toDateString());
      if (!_this.isDateWithinRange(_this.start, _this.end, event.value as Date)) return;
      var marker = L.marker(
        [each.placeVisit.centerLatE7/10000000, each.placeVisit.centerLngE7/10000000],
        {
          icon: L.icon({
            iconSize: [25, 41],
            iconAnchor: [10, 41],
            popupAnchor: [2, -40],
            // specify the path here
            // iconUrl: "assets/icons/sent-money.png",
            iconUrl: "assets/icons/marker-icon.png",
            // iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
            shadowUrl: "assets/icons/marker-shadow.png"
          })
        }
      );
      lnpA.push([each.placeVisit.centerLatE7/10000000, each.placeVisit.centerLngE7/10000000]);
      markers.push(marker);
    });
    if (_.isEmpty(markers)) return;
    if (_.isEmpty(lnpA)) return;
    var myBounds = new L.LatLngBounds(lnpA);
    this.layers = markers;
    this.layers.push(L.polyline([[45.51, -122.68], [37.77, -122.43], [34.04, -118.2]]))
    this.map.fitBounds(myBounds);
  }

  onMapReady(map: L.Map) {
    this.map = map;
    this.locationService.getPosition().then(pos=>
    {
      this.map.panTo(L.latLng(pos.lat, pos.lng))
       console.log(`GOT ----- Positon: ${pos.lng} ${pos.lat}`);
    });
  }

  isDateWithinRange(from: Date, to: Date, check: Date) {
    return check >= from && check <= to;
  }

}
