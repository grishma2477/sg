export class TapValue {
  constructor({ key, category, pointValue }) {
    this.key = key;
    this.category = category; 
    this.pointValue = pointValue;
    Object.freeze(this);
  }
}
