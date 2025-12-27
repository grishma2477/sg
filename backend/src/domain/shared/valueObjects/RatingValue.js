export class RatingValue {
  constructor(stars) {
    this.stars = stars;
    Object.freeze(this);
  }
}
