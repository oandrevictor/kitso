const OK_STATUS = 200;
const BAD_REQUEST_STATUS = 400;
const UNAUTHORIZED_STATUS = 401;
const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const UNPROCESSABLE_ENTITY_STATUS = 422;
const INTERNAL_SERVER_ERROR_STATUS = 500;
const RESOURCE_NOT_FOUND = 34;

class RequestStatus {

  static get UNAUTHORIZED() {
    return UNAUTHORIZED_STATUS;
  }

  static get BAD_REQUEST() {
    return BAD_REQUEST_STATUS;
  }

  static get OK() {
    return OK_STATUS;
  }

  static get UNPROCESSABLE_ENTITY() {
    return UNPROCESSABLE_ENTITY_STATUS;
  }

  static get INTERNAL_SERVER_ERROR() {
    return INTERNAL_SERVER_ERROR_STATUS;
  }

  static get FORBIDDEN() {
    return FORBIDDEN_STATUS;
  }

  static get NOT_FOUND() {
    return NOT_FOUND_STATUS;
  }

  static get RESOURCE_NOT_FOUND() {
    return RESOURCE_NOT_FOUND;
  }
}

module.exports = RequestStatus;
