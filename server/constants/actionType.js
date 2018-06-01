const WATCHED_TYPE = "watched";
const RATED_TYPE = "rated";
const FOLLOWED_TYPE = "followed";

class ActionType {

    static get WATCHED() {
        return WATCHED_TYPE;
    }

    static get RATED() {
        return RATED_TYPE;
    }

    static get FOLLOWED() {
        return FOLLOWED_TYPE;
    }
}

module.exports = ActionType;