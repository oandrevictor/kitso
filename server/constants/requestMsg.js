
const UNAUTHORIZED = "Unauthorized!";
const DUPLICATED_ENTITY = "There is already one entity with same values!";
const RESOURCE_NOT_FOUND = "Resource not found!";


class RequestMsgs {

  static get UNAUTHORIZED() {
    return UNAUTHORIZED;
  }

  static get DUPLICATED_ENTITY() {
    return DUPLICATED_ENTITY;
  }

  static get RESOURCE_NOT_FOUND() {
    return RESOURCE_NOT_FOUND;
  }
}

module.exports = RequestMsgs;
