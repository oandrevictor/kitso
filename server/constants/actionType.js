const WATCHED_TYPE = "watched";
const RATED_TYPE = "rated";
const FOLLOWED_USER_TYPE = "followed";
const FOLLOWED_PAGE_TYPE = "followed-page";

class ActionType {

    static get WATCHED() {
        return WATCHED_TYPE;
    }

    static get RATED() {
        return RATED_TYPE;
    }

    static get FOLLOWED_USER() {
        return FOLLOWED_USER_TYPE;
    }

    static get FOLLOWED_PAGE() {
        return FOLLOWED_PAGE_TYPE;
    }
}

module.exports = ActionType;