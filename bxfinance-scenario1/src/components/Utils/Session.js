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
    constructor() {
        this.clearUserAppSession = this.clearUserAppSession.bind(this);
    }
    /* 
    Gets an item from the current origin's session storage.
    @param key the item name in storage
    @return DOMString
    */
    getAuthenticatedUserItem(key) {
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
    Remove Authenticated User Item
    Removes an item from the current origin's session storage.
    @param key the item name in storage to remove 
    @return boolean
    */
    removeAuthenticatedUserItem(key) {
        sessionStorage.removeItem(key);
        return true;
    }

    /* 
    Kill Authenticated User
    Clears out everything in the current origin's sessions storage.
    @return true
     */
    clearUserAppSession() {
        sessionStorage.clear();
        return true;
    }

    /* 
    Start Single Logout
    @return void
    */
   startSLO() {
       const success = this.clearUserAppSession();
       //TODO This needs to be put back once SLO is debugged. for now just sending to the home page
       /* let rootDiv = document.getElementById("root"); //Grab the root div for the app
       let logoutForm = document.createElement('form'); // Create a new form element
       logoutForm.setAttribute("action", "/sp/startSLO.ping"); // Add the action attribute we want to POST to
       logoutForm.setAttribute("id", "logoutForm"); // Add an Id Attribute
       logoutForm.setAttribute("method", "post"); // Add the method attribute
       rootDiv.appendChild(logoutForm); //Add the form to the DOM
       document.forms["logoutForm"].submit(); //Submit the form, obviously. */
       window.location.href = process.env.REACT_APP_HOST + "/app"; //TODO remove this once SLO is fixed.
   }
}