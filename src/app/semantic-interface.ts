interface SourceInfo {
    deviceTag?: number;
}

interface StartLocation {
    latitudeE7?: number;
    longitudeE7?: number;
    sourceInfo?: SourceInfo;
}

interface EndLocation {
    latitudeE7?: number;
    longitudeE7?: number;
    sourceInfo?: SourceInfo;
}

interface Duration {
    startTimestamp?: Date;
    endTimestamp?: Date;
}

interface Activity {
    activityType?: string;
    probability?: number;
}

interface Waypoint {
    latE7?: number;
    lngE7?: number;
}

interface WaypointPath {
    waypoints?: Waypoint[];
    source?: string;
    distanceMeters?: number;
    travelMode?: string;
    confidence?: number;
}

interface ParkingEventLocation {
    latitudeE7?: number;
    longitudeE7?: number;
    accuracyMetres?: number;
}

interface ParkingEvent {
    location?: ParkingEventLocation;
    method?: string;
    locationSource?: string;
    timestamp?: Date;
}

interface ActivitySegment {
    startLocation?: StartLocation;
    endLocation?: EndLocation;
    duration?: Duration;
    distance?: number;
    activityType?: string;
    confidence?: string;
    activities?: Activity[];
    waypointPath?: WaypointPath;
    parkingEvent?: ParkingEvent;
}

interface PlaceVisitLocation {
    latitudeE7?: number;
    longitudeE7?: number;
    placeId?: string;
    address?: string;
    name?: string;
    sourceInfo?: SourceInfo;
    locationConfidence?: number;
    calibratedProbability?: number;
}

interface OtherCandidateLocation {
    latitudeE7?: number;
    longitudeE7?: number;
    placeId?: string;
    address?: string;
    name?: string;
    locationConfidence?: number;
    calibratedProbability?: number;
}

interface PlaceVisit {
    location?: PlaceVisitLocation;
    duration?: Duration;
    placeConfidence?: string;
    centerLatE7: number;
    centerLngE7: number;
    visitConfidence?: number;
    otherCandidateLocations?: OtherCandidateLocation[];
    editConfirmationStatus?: string;
    locationConfidence?: number;
    placeVisitType?: string;
    placeVisitImportance?: string;
}

interface TimelineObject {
    activitySegment?: ActivitySegment;
    placeVisit: PlaceVisit;
}

export interface SemanticInterfaceObject {
    timelineObjects?: TimelineObject[];
}