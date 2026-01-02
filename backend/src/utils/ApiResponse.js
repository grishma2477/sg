export class ApiResponse {
  static success(data = {}, message = "SUCCESS") {
    return {
      success: true,
      message,
      data
    };
  }

  static error(message = "ERROR", code = 400, data = {}) {
    return {
      success: false,
      message,
      code,
      data
    };
  }
}
