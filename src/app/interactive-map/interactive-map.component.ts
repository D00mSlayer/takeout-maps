import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '.././local-storage.service'
import { LocationServiceService } from '.././location-service.service'
import * as L from "leaflet";
import * as _ from 'underscore';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { SemanticInterfaceObject } from '.././semantic-interface';
// import 'leaflet-arrowheads';
// import * as GeometryUtil from "leaflet-geometryutil";

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

  bounds: any[] = [];

  constructor(
    private localStorageService: LocalStorageService,
    private locationService: LocationServiceService
  ) { }

  ngOnInit(): void {
    this.mapData = JSON.parse(this.localStorageService.getItemFromStorage('mapJSON') || '{}');
    this.payData = JSON.parse(this.localStorageService.getItemFromStorage('payJSON') || '{}');
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

  // convertAllDatesToTZ = () => {
  //   let timelineObjects = this.mapData.timelineObjects || [];
  //   _.each(timelineObjects, (each) => {

  //   })
  // }

  valueChanged = (event: MatDatepickerInputEvent<Date>) => {
    this.layers = [];
    this.bounds = [];
    let timelineObjects = this.mapData.timelineObjects || [];
    _.each(timelineObjects, (each) => {
      if (this.isActivitySegment(each)) this.processActivitySegment(event, each);
      if (this.isPlaceVisit(each)) this.processPlaceVisit(event, each);
    });
    if (_.isEmpty(this.bounds)) return;
    let tempBounds = new L.LatLngBounds(this.bounds);
    this.map.fitBounds(tempBounds);
  }

  processActivitySegment = (event: MatDatepickerInputEvent<Date>, activitySegment) => {
    // debugger
    let isDateWithinRange = this.isDateWithinRange(
      this.convertToDate(
        this.convertToTZ(activitySegment.activitySegment.duration.startTimestamp, 'Asia/Kolkata')
      ),
      this.convertToDate(
        this.convertToTZ(activitySegment.activitySegment.duration.endTimestamp, 'Asia/Kolkata')
      ),
      event.value as Date
    );
    if (!isDateWithinRange) return;

    // let polyLine = [
    //   [activitySegment.activitySegment.startLocation.latitudeE7/10000000, activitySegment.activitySegment.startLocation.longitudeE7/10000000],
    //   [activitySegment.activitySegment.endLocation.latitudeE7/10000000, activitySegment.activitySegment.endLocation.longitudeE7/10000000]
    // ];
    this.layers.push(L.polyline(
      [
        [activitySegment.activitySegment.startLocation.latitudeE7/10000000, activitySegment.activitySegment.startLocation.longitudeE7/10000000],
        [activitySegment.activitySegment.endLocation.latitudeE7/10000000, activitySegment.activitySegment.endLocation.longitudeE7/10000000]
      ]
    ));
    this.bounds.push([activitySegment.activitySegment.startLocation.latitudeE7/10000000, activitySegment.activitySegment.startLocation.longitudeE7/10000000]);
    this.bounds.push([activitySegment.activitySegment.endLocation.latitudeE7/10000000, activitySegment.activitySegment.endLocation.longitudeE7/10000000]);

    // this.layers.push(L.polyline(
    //   [
    //     [45.51, -122.68],
    //     [37.77, -122.43],
    //     [34.04, -118.2]
    //   ]
    // ))


  }

  processPlaceVisit = (event: MatDatepickerInputEvent<Date>, placeVisit) => {
    let isPlaceVisitWithinRange = this.isDateWithinRange(
      this.convertToDate(
        this.convertToTZ(placeVisit.placeVisit.duration.startTimestamp, 'Asia/Kolkata')
      ),
      this.convertToDate(
        this.convertToTZ(placeVisit.placeVisit.duration.endTimestamp, 'Asia/Kolkata')
      ),
      event.value as Date
    );
    if (!isPlaceVisitWithinRange) return;

    // if (!placeVisit.placeVisit.centerLatE7) return;
    // if (!placeVisit.placeVisit.centerLngE7) return;
    let marker = L.marker(
      [placeVisit.placeVisit.location.latitudeE7/10000000, placeVisit.placeVisit.location.longitudeE7/10000000],
      {
        icon: L.icon({
          iconSize: [32, 32],
          // iconAnchor: [10, 41],
          // popupAnchor: [2, -40],
          // specify the path here
          // iconUrl: "assets/icons/sent-money.png",
          iconUrl: "assets/icons/map-visit.png",
          // iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
          // shadowUrl: "assets/icons/marker-shadow.png"
        })
      }
    );
    this.layers.push(marker);
    this.bounds.push([placeVisit.placeVisit.location.latitudeE7/10000000, placeVisit.placeVisit.location.longitudeE7/10000000]);
    this.bounds.push([placeVisit.placeVisit.location.latitudeE7/10000000, placeVisit.placeVisit.location.longitudeE7/10000000]);
  }

  // valueChanged(event: MatDatepickerInputEvent<Date>) {

  //   let timelineObjects = this.mapData.timelineObjects || [];
  //   _.each(timelineObjects, function(each) {
  //     console.log(this)
  //     // if (this.isActivitySegment(each)) this.processActivitySegment(each);
  //   }, this);

  //   this.updateTimelineData(event);
  //   this.updatePayData(event);
  // }


  updatePayData(event: MatDatepickerInputEvent<Date>) {
    // debugger
    _.each(this.payData, function (each) {
      // this.layers.push(L.polyline([[45.51, -122.68], [37.77, -122.43], [34.04, -118.2]]))
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
            iconSize: [32, 32],
            // iconAnchor: [10, 41],
            // popupAnchor: [2, -40],
            // specify the path here
            // iconUrl: "assets/icons/sent-money.png",
            iconUrl: "assets/icons/map-visita.png",
            // iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
            // shadowUrl: "assets/icons/marker-shadow.png"
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
