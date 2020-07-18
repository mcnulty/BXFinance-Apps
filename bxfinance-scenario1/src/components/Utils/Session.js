/*
PING INTEGRATION
This entire component is Ping developed.
Implements functions to integrate with the browser
session storage API to maintain user state during
an authenticated session.

@author Michael Sanchez
@see https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
*/

export default class Session {

    /* 
    Gets an item from the current origin's session storage.

    @param key the item name in storage
    @return DOMString
    */
    getAuthenticatedUserItem(key) {
        return sessionStorage.getItem(key);
    }

    /* 
    Sets an item in the current origin's sessions storage.

    @param key the item name to set in storage
    @return boolean
    @throws storageFullException Particularly, in Mobile Safari 
                                (since iOS 5) it always throws when 
                                the user enters private mode. 
                                (Safari sets the quota to 0 bytes in 
                                private mode, unlike other browsers, 
                                which allow storage in private mode 
                                using separate data containers.)
    */
    setAuthenticatedUserItem(key, value) {
        try {
            sessionStorage.setItem(key, value);
            return true;
        } catch (error) {
            // Fail with the utmost grace and leisure
            console.error("setAuthenticateduserItem Error:", error); /* TODO this should be removed for prod. Change this to a throw new error() ? */
            return error; /* TODO risk of throwing this error is minimal. Do we handle errors in app in v1??? */
        }
    }

    /* 
    Removes an item from the current origin's session storage.

    @param key the item name in storage to remove 
    @return boolean
    */
    removeAuthenticatedUserItem(key) {
        sessionStorage.removeItem(key);
        return true;
    }

    /* 
    Clears out everything in the current origin's sessions storage.

    @return true
     */
    killAuthenticatedUser() {
        sessionStorage.clear();
        return true;
    }
}