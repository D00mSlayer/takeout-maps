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
      iconSize: [32, 32],
      iconUrl: "assets/icons/map-visit.png",
    })
  };

  moneySentIcon = {
    icon: L.icon({
      iconSize: [48, 48],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40],
      iconUrl: "assets/icons/money-paid.png",
    })
  };

  moneyReceivedIcon = {
    icon: L.icon({
      iconSize: [25, 41],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40],
      iconUrl: "assets/icons/money-received.png",
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

  layers: any[] = [];

  placeVisitTimings: any[] = [];

  bounds: any[] = [];

  constructor(
    private localStorageService: LocalStorageService,
    private locationService: LocationServiceService
  ) { }

  ngOnInit(): void {
    this.mapData = JSON.parse(this.localStorageService.getItemFromStorage('mapJSON') || '{}');
    this.payData = JSON.parse(this.localStorageService.getItemFromStorage('payJSON') || '[]');
  }

  isActivitySegment = (obj) => {
    return _.has(obj, 'activitySegment');
  }

  isPlaceVisit = (obj) => {
    return _.has(obj, 'placeVisit');
  }

  convertToTZ = (date, tzString) => {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));
  }

  convertToDate = (date: Date) => {
    return new Date(date.toDateString());
  }

  valueChanged = (event: MatDatepickerInputEvent<Date>) => {
    this.placeVisitTimings = [];
    this.layers = [];
    this.bounds = [];

    this.processTimeline(event);
    this.processGooglePay();    

    if (_.isEmpty(this.bounds)) return;
    let tempBounds = new L.LatLngBounds(this.bounds);
    this.map.fitBounds(tempBounds);
  }

  processTimeline = (event: MatDatepickerInputEvent<Date>) => {
    let timelineObjects = this.mapData.timelineObjects || [];
    _.each(timelineObjects, (each) => {
      if (this.isActivitySegment(each)) this.processActivitySegment(event, each);
      if (this.isPlaceVisit(each)) this.processPlaceVisit(event, each);
    });
  }

  processGooglePay = () => {
    if (_.isEmpty(this.placeVisitTimings)) return;

    _.each(this.payData, (eachPayment) => {
      _.each(this.placeVisitTimings, (eachVisit) => {
        if (!this.isDateWithinRange(eachVisit[0], eachVisit[1], new Date(eachPayment.timestamp))) return;
        // debugger

        // moneySentIcon
        // moneyReceivedIcon
        let marker = L.marker([eachVisit[2], eachVisit[3]], (eachPayment.direction == 's') ? this.moneySentIcon : this.moneyReceivedIcon);
        this.layers.push(marker);
      })
    });
  }

  processActivitySegment = (event: MatDatepickerInputEvent<Date>, activitySegment) => {
    let startTimestamp = this.convertToTZ(activitySegment.activitySegment.duration.startTimestamp, 'Asia/Kolkata'),
      endTimestamp = this.convertToTZ(activitySegment.activitySegment.duration.endTimestamp, 'Asia/Kolkata'),
      isDateWithinRange = this.isDateWithinRange(
        this.convertToDate(startTimestamp),
        this.convertToDate(endTimestamp),
        event.value as Date
      );
    if (!isDateWithinRange) return;

    this.layers.push(L.polyline(
      [
        [activitySegment.activitySegment.startLocation.latitudeE7/10000000, activitySegment.activitySegment.startLocation.longitudeE7/10000000],
        [activitySegment.activitySegment.endLocation.latitudeE7/10000000, activitySegment.activitySegment.endLocation.longitudeE7/10000000]
      ]
    ));
    this.bounds.push([activitySegment.activitySegment.startLocation.latitudeE7/10000000, activitySegment.activitySegment.startLocation.longitudeE7/10000000]);
    this.bounds.push([activitySegment.activitySegment.endLocation.latitudeE7/10000000, activitySegment.activitySegment.endLocation.longitudeE7/10000000]);

  }

  processPlaceVisit = (event: MatDatepickerInputEvent<Date>, placeVisit) => {
    let startTimestamp = this.convertToTZ(placeVisit.placeVisit.duration.startTimestamp, 'Asia/Kolkata'),
      endTimestamp = this.convertToTZ(placeVisit.placeVisit.duration.endTimestamp, 'Asia/Kolkata'),
      isPlaceVisitWithinRange = this.isDateWithinRange(
        this.convertToDate(startTimestamp),
        this.convertToDate(endTimestamp),
        event.value as Date
      );
    if (!isPlaceVisitWithinRange) return;

    let latitudeE7 = placeVisit.placeVisit.location.latitudeE7/10000000,
      longitudeE7 = placeVisit.placeVisit.location.longitudeE7/10000000,
      marker = L.marker([latitudeE7, longitudeE7], this.markerIcon);

    this.layers.push(marker);
    this.placeVisitTimings.push([startTimestamp, endTimestamp, latitudeE7, longitudeE7]);
    this.bounds.push([placeVisit.placeVisit.location.latitudeE7/10000000, placeVisit.placeVisit.location.longitudeE7/10000000]);
    this.bounds.push([placeVisit.placeVisit.location.latitudeE7/10000000, placeVisit.placeVisit.location.longitudeE7/10000000]);
  }

  updatePayData(event: MatDatepickerInputEvent<Date>) {
    _.each(this.payData, function (each) {
      // this.layers.push(L.polyline([[45.51, -122.68], [37.77, -122.43], [34.04, -118.2]]))
    });
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
