/*
PING INTEGRATION
This entire component is Ping developed.
Implements functions to integrate with PingData
API endpoints.

@author Michael Sanchez

*/

export default class PingData {

    // Didn't abstract these since they shouldn't ever change.
    pdReSTURI = "/directory/v1/"; //TODO breakout the version segment to its own variable in case it changes.
    pdRootDN = "dc=" + process.env.REACT_APP_HOST.substring(process.env.REACT_APP_HOST.indexOf('.') + 1);
    pdPeopleRDN = 'ou=People,' + this.pdRootDN;
    pdConsentURI = "/consent";
    pdConsentVersion = "/v1";
    pdConsentResource = "/consents";

    /* 
    Get User Entry
    Fetches a user record from PD.
    
    @param uid the uid from the user's directory entry.
    @return response object
    */
    getUserEntry(uid) {

        const userRDN = 'uid=' + uid;
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Basic Y249ZG1hbmFnZXI6MkZlZGVyYXRlTTByZQ=="); /* TODO this should be obfuscated somehow. */

        const requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'manual'
        };
        const url = process.env.REACT_APP_HOST + this.pdReSTURI + userRDN + ',' + this.pdPeopleRDN;
        return fetch(url, requestOptions);
    }

    /* 
    Update user entry with bank accounts.

    @param acctIds an array of account IDs to add to the user entry.
    @return boolean to state success
    */
    updateUserEntry(acctIds, uid) {
        const userRDN = 'uid=' + uid;
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Basic Y249ZG1hbmFnZXI6MkZlZGVyYXRlTTByZQ==");
        //myHeaders.append("Cookie", "PF=YdzsRlxXm67qsRriWenYMf");

        //    console.log("acctIds", acctIds);
        let updateObj = { "modifications": [{ "attributeName": "bxFinanceUserAccountIDs", "modificationType": "set", "values": [{ "ids": [] }] }] };
        updateObj.modifications[0].values[0].ids = acctIds;
        //    console.log("updateObj", updateObj);

        const raw = JSON.stringify(updateObj);
        //    console.log("raw", raw);

        const requestOptions = {
            method: 'PATCH',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        //TODO add try catch error handling here. And stop the .then() logging. Remove or return the response.
        const url = process.env.REACT_APP_HOST + this.pdReSTURI + userRDN + ',' + this.pdPeopleRDN;
        fetch(url, requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));

        return true;

    }

    /* 
    Get User Consents
    @param token the AT for the authenticated user
    @param uid the user's uid from their user record.
    @return consent record in JSON format
    */
    getUserConsents(token, uid, definition) {
        let myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + token);

        const requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        const url = process.env.REACT_APP_HOST + this.pdConsentURI + this.pdConsentVersion + this.pdConsentResource + "?subject=" + uid + "&definition=" + definition;
        return fetch(url, requestOptions);
    }

    /* 
    Create User Consent
    @param token the AT for the authenticated user
    @param consent the JSON object of consents to update the "data" property of the consent object
    @return consent record in JSON format
    */
    createUserConsent(token, consent, uid, definition) {
        let myHeaders = new Headers();
        let consentObject = {};
        let raw = "";
        myHeaders.append("Authorization", "Bearer " + token);
        myHeaders.append("Content-Type", "application/json");

        if (definition == "share-account-balances") {
            consentObject = { "status": "accepted", "subject": "", "actor": "", "audience": "BXFinance", "definition": { "id": "", "version": "0.1", "locale": "en-us" }, "titleText": "Share Account Balances", "dataText": "Share Account Balances", "purposeText": "Share Account Balances", "data": { "share-balance": [] }, "consentContext": {} }
            consentObject.subject = uid;
            consentObject.actor = uid;
            consentObject.data["share-balance"] = consent;
            consentObject.definition.id = definition;
        } else { //share-comm-preferences
            consentObject = { "status": "accepted", "subject": "", "actor": "", "audience": "BXFinance", "definition": { "id": "", "version": "0.1", "locale": "en-us" }, "titleText": "Share Comms Preferences", "dataText": "Share Comms Preferences", "purposeText": "Share Comms Preferences", "data": {}, "consentContext": {} };
            consentObject.subject = uid;
            consentObject.actor = uid;
            consentObject.data = consent;
            consentObject.definition.id = definition;
        }
        raw = JSON.stringify(consentObject);

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        const url = process.env.REACT_APP_HOST + this.pdConsentURI + this.pdConsentVersion + this.pdConsentResource;
        return fetch(url, requestOptions);
    }

    /* 
    Update user Consent
    @param token the AT for the authenticated user
    @param consent the JSON object of consents to update the "data" property of the consent object
    @param consentId the id of the user's existing consent record
    @return consent record in JSON format
    */
    updateUserConsent(token, consent, consentId, definition) {
        let myHeaders = new Headers();
        let consentObject = { "data": {} };
        let raw = "";
        myHeaders.append("Authorization", "Bearer " + token);
        myHeaders.append("Content-Type", "application/json");

        if (definition == "share-account-balances") {
            consentObject = { "data": { "share-balance": [] } };
            consentObject.data["share-balance"] = consent;
        } else { //share-comm-preferences
            consentObject = { "data": {} };
            consentObject.data = consent;
        }
        raw = JSON.stringify(consentObject);

        const requestOptions = {
            method: 'PATCH',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        const url = process.env.REACT_APP_HOST + this.pdConsentURI + this.pdConsentVersion + this.pdConsentResource + "/" + consentId;
        return fetch(url, requestOptions);
    }
}