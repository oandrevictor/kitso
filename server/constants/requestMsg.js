
const UNAUTHORIZED_MSG = "Unauthorized!";
const DUPLICATED_ENTITY = "There is already one entity with same values!"

class RequestMsgs {

    static get UNAUTHORIZED() {
        return UNAUTHORIZED_MSG;
    }

    static get DUPLICATED_ENTITY() {
        return DUPLICATED_ENTITY;
    }
}

module.exports = RequestMsgs;