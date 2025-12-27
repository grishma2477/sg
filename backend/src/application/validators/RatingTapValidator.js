export class RatingTapValidator {
  static validate(ratingValue, taps) {
    if (!ratingValue) {
      throw new Error("Stars must be selected first");
    }

    if (ratingValue.stars <= 2 && taps.length === 0) {
      throw new Error("Low ratings require feedback");
    }
  }
}
