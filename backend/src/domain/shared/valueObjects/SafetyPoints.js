export class SafetyPoints {
  constructor(value) {
    this.value = value;
    Object.freeze(this);
  }
}
