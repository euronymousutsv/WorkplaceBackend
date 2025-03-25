// this is the template for all successfull api response
// using it this way will make it easier to implement in the frontend and easier to read
export default class ApiResponse<T> {
  statusCode: StatusCode;
  data: T;
  message: string;
  success: boolean;

  constructor(
    statusCode: StatusCode,
    data: T,
    message: string = "Successful Request",
    success: boolean = true
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success;
  }
}

// contawisn all the status code which can be used instead of hardcoding the values.
export enum StatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
  ACCEPTED = 202,
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  NOT_MODIFIED = 304,
  TEMPORARY_REDIRECT = 307,
  PERMANENT_REDIRECT = 308,
  UNSUPPORTED_MEDIA_TYPE = 415,
  TOO_MANY_REQUESTS = 429,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  GATEWAY_TIMEOUT = 504,
  PRECONDITION_FAILED = 412,
  LENGTH_REQUIRED = 411,
  INSUFFICIENT_STORAGE = 507,
}
