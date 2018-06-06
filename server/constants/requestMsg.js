
const UNAUTHORIZED = "Unauthorized!";
const DUPLICATED_ENTITY = "There is already one entity with same values!"

class RequestMsgs {

  static get UNAUTHORIZED() {
    return UNAUTHORIZED;
  }

  static get DUPLICATED_ENTITY() {
    return DUPLICATED_ENTITY;
  }
}

module.exports = RequestMsgs;
