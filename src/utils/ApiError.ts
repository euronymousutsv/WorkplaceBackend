import { StatusCode } from "./apiResponse.js";

class ApiError<T> extends Error {
  public statusCode: StatusCode;
  public error: T;
  public success: boolean;
  public message: string;

  constructor(statusCode: StatusCode, error: T, message: string) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    this.success = false;
  }
}
export default ApiError;
