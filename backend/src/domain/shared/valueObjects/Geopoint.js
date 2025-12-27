export class GeoPoint {
  constructor({ lat, lng }) {
    this.lat = lat;
    this.lng = lng;
    Object.freeze(this);
  }
}
