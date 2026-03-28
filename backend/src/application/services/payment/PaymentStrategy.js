export class PaymentStrategy {

  /**
   * Authorize funds before ride completion
   * @param {Object} context
   * @returns {Promise<Object>}
   */
  async authorize(context) {
    throw new Error("authorize() must be implemented");
  }

  /**
   * Capture funds after ride completion
   * @param {Object} context
   * @returns {Promise<Object>}
   */
  async capture(context) {
    throw new Error("capture() must be implemented");
  }

  /**
   * Refund payment
   * @param {Object} context
   * @returns {Promise<Object>}
   */
  async refund(context) {
    throw new Error("refund() must be implemented");
  }
}