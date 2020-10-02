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
        console.info("Session.js", "Getting a item from local browser session.");

        return sessionStorage.getItem(key);
    }

    /* 
    Set Authenticated User Item
    Sets an item in the current origin's sessions storage.
    @param key the item name to set in storage
    @param value the string value of the key
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
        console.info("Session.js", "Saving an item into local browser session.");

        sessionStorage.setItem(key, value);
        return true;
    }

    /* 
    Remove Authenticated User Item
    Removes an item from the current origin's session storage.
    @param key the item name in storage to remove 
    @return boolean
    */
    removeAuthenticatedUserItem(key) {
        console.info("Session.js", "Removing an item from local browser session.");

        sessionStorage.removeItem(key);
        return true;
    }

    /* 
    Clear user App Session
    Clears out everything in the current origin's session storage.
    @return void
     */
    clearUserAppSession() {
        console.info("Session.js", "Removing local browser session.");

        sessionStorage.clear();
    }

    /* 
    Get cookie
    We set a cookie when users check "Remember Me" when logging in.
    We need to check for this cookie in a couple different places to set state.
    @param cookieName the name of the cookie we want the value of.
    @return cookie value, or an empty string if not found.
    */
    getCookie(cookieName) {
        console.info("Session.js", "Getting a cookie value from the browser.");

        const name = cookieName + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
}