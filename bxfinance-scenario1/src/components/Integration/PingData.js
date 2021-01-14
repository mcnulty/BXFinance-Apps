/*
PING INTEGRATION
This entire component is Ping developed.
Implements functions to integrate with PingData
API endpoints.

@author Michael Sanchez
*/

export default class PingData {

    // Didn't abstract these since they shouldn't ever change. Right??? Maybe move these to JSON data file?
    pdReSTURI = "/directory/v1/"; //TODO breakout the version segment to its own variable in case it changes.
    pdRootDN = "dc=bxfinance.org";
    pdPeopleRDN = 'ou=People,' + this.pdRootDN;
    pdConsentURI = "/consent";
    pdConsentVersion = "/v1";
    pdConsentResource = "/consents";
    pdSubtreeResource = "/subtree?";
    dgScimURI = "/scim";
    dgScimVersion = "/v2";
    dgUsersResource = "/Users"
    dgOpenBankingURI = "/OpenBanking";
    dgOpenBankingVersion = "/v2";
    dgBalancesResource = "/balances";
    
    /* 
    Get User Entry
    Fetches a user record from PD.
    @param uid the uid from the user's directory entry.
    @return response object
    */
    getUserEntry(uid) {
        const userRDN = 'uid=' + encodeURIComponent(uid);
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Basic Y249ZG1hbmFnZXI6MkZlZGVyYXRlTTByZQ=="); /* TODO this should be obfuscated somehow. */

        const requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'manual'
        };
        const url = this.pdReSTURI + userRDN + ',' + this.pdPeopleRDN;
        return fetch(url, requestOptions);
    }

    /* 
    Update user entry with bank accounts.
    @param acctIds an array of account IDs to add to the user entry.
    @param uid The uid of the user fo which we are updating a user entry
    @return boolean to state success
    */
    async updateUserEntry(acctIds, uid) {
        console.info("PingData.js", "Updating user entry in PD.");

        const userRDN = 'uid=' + uid;
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Basic Y249ZG1hbmFnZXI6MkZlZGVyYXRlTTByZQ==");

        let updateObj = { "modifications": [{ "attributeName": "bxFinanceUserAccountIDs", "modificationType": "set", "values": [{ "ids": [] }] }] };
        updateObj.modifications[0].values[0].ids = acctIds;

        const raw = JSON.stringify(updateObj);

        const requestOptions = {
            method: 'PATCH',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };

        //TODO add error handling here in case failed requset. Rare in our environment, butt still.
        const url = this.pdReSTURI + userRDN + ',' + this.pdPeopleRDN;
        const response = await fetch(url, requestOptions);
        const jsonData = await response.json();
        return Promise.resolve(jsonData);
    }

    /* 
    Get Searchable Users
    Fetches all users in the people dn for the suggestable search feature in the AnyAdvisor/Marketing portals.
    We filter out user that have the attribute bxFinanceUserType, because they are not banking users, but partners in the demo.
    @param searchScope to what level in the directory to searchScope
    @param limit max number of records to return. You could get less based on number of records found or PD configured limits
    @return response object
    */
    getSearchableUsers({ searchScope = "singleLevel", limit = "100" }) {
        console.info("PingData.js", "Getting all searchable users (banking customers) from PD.");

        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Basic Y249ZG1hbmFnZXI6MkZlZGVyYXRlTTByZQ==");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        // TODO we need some attribute or way to filter user to only include ones created for demos.
        const url = this.pdReSTURI + this.pdPeopleRDN + this.pdSubtreeResource + "searchScope=" + searchScope + "&limit=" + limit + "&filter=not(bxFinanceUserType pr)";

        return fetch(url, requestOptions);
    }

    /* 
    Get User Consents
    This is called from customer apps for consent management.
    @param token the AT for the authenticated user
    @param uid the user's uid from their user record.
    @param definition the consent definition ID.
    @return consent record in JSON format
    */
    getUserConsents(token, uid, definition) {
        console.info("PingData.js", "Getting user's consents from PD.");

        let myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + token);

        const requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        const url = this.pdConsentURI + this.pdConsentVersion + this.pdConsentResource + "?subject=" + encodeURIComponent(uid) + "&definition=" + definition;
        return fetch(url, requestOptions);
    }

    /* 
    Create User Consent
    @param token the AT for the authenticated user
    @param consent the JSON object of consents to update the "data" property of the consent object
    @param uid the uid of the user fo which we are creating a consent record
    @param definition the consent definition ID.
    @return consent record in JSON format
    */
    createUserConsent(token, consent, uid, definition) {
        console.info("PingData.js", "Creating user's consent record in PD.");

        let myHeaders = new Headers();
        let consentObject = {};
        let raw = "";
        myHeaders.append("Authorization", "Bearer " + token);
        myHeaders.append("Content-Type", "application/json");

        //  We build the consent object template for the specified definition, and then update the data field with user's consent choices.
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
        const url = this.pdConsentURI + this.pdConsentVersion + this.pdConsentResource;
        return fetch(url, requestOptions);
    }

    /* 
    Update user Consent
    @param token the AT for the authenticated user
    @param consent the JSON object of consents to update the "data" property of the consent object
    @param consentId the id of the user's existing consent record
    @param definition the consent definition ID.
    @return consent record in JSON format
    */
    updateUserConsent(token, consent, consentId, definition) {
        console.info("PingData.js", "Updating user's consent record' in PD.");

        let myHeaders = new Headers();
        let consentObject = { "data": {} };
        let raw = "";
        myHeaders.append("Authorization", "Bearer " + token);
        myHeaders.append("Content-Type", "application/json");
        console.info("Updating it to:", consent);
        
        //  We build the consent object template for the specified definition, and then update the data field with user's consent choices.
        if (definition == "share-account-balances") {
            const status = consent.length > 0 ? "accepted" : "revoked";
            consentObject = { "status": status, "data": { "share-balance": [] } };
            consentObject.data["share-balance"] = consent;
        } else { //share-comm-preferences
            let status = "revoked";
            let consentValues = Object.values(consent);
            status = consentValues.find(val => val === true) ? "accepted" : "revoked";
            consentObject = { "status": status, "data": {} };
            consentObject.data = consent;
        }
        raw = JSON.stringify(consentObject);

        const requestOptions = {
            method: 'PATCH',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        const url = this.pdConsentURI + this.pdConsentVersion + this.pdConsentResource + "/" + consentId;
        return fetch(url, requestOptions);
    }

    /* 
    Get User Consented Data
    This is called from AnyWealth Advisor and AnyMarketing portals. Uses DG for consent enforcement.
    @param token the access token of the marketingApp
    @param forWhom whether this DG call is for an AnyWealthAdvisor or AnyMarketing rep.
    @param uid the uid of the user data being requested
    @return response object
    */
    async getUserConsentData(token, forWhom, uid) {
        console.info("PingData.js", "Getting consented data through DG.");

        const myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + token);
        let url;
    
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        
        if (forWhom == "marketing") {
            console.info("Getting AnyMarketing consent data.");
            const filterValue = '\"' + uid + '\"';
            url = this.dgScimURI + this.dgScimVersion + this.dgUsersResource + "?filter=uid eq " + filterValue;
        } else {//advisor
            console.info("Getting AnyWealth Advisor consent data.");
            url = this.dgOpenBankingURI + this.dgOpenBankingVersion + this.dgBalancesResource
        }
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();
        return jsonResponse;
    }
    
}