/*
PING INTEGRATION
This entire component is Ping developed.
Implements functions to integrate with PingFed
OAuth-related API endpoints.

@author Michael Sanchez

*/

import Session from '../Utils/Session';

export default class PingOAuth {
    constructor() {
        this.Session = new Session();
    }

    // Didn't abstract these since they shouldn't ever change.
    pfAuthZAPIURI = "/as/authorization.oauth2?";
    pfTokenAPIURI = "/as/token.oauth2?";

    /* 
    Get AuthZ Code
    We defaulted all params except for uid, 
    which is user specifc. As a demo site we only have 1
    auth code client. But if we add more in the future, this
    will already support that.

    @param
    @param
    @param
    @param
    @param
    @param
    @return string
    */
   //TODO I *think* we can get rid of the UID and swaprods params now that we aren't using them. Need thorough regression testing when removed.
    async getAuthCode({uid, swaprods = "2FederateM0re!", client = "pa_wam", responseType = "code", redirectURI = process.env.REACT_APP_HOST + "/app/banking", scopes = ""} = {}) {
        console.info("PingOAuth.js", "Getting an auth code for the getToken() call.");

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlEncodedBody");
        myHeaders.append("Authorization", "Basic cGFfd2FtOjJGZWRlcmF0ZU0wcmU=");

        const urlEncodedBody = new URLSearchParams();
        
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlEncodedBody,
            redirect: 'follow'
        };
        
        const url = this.pfAuthZAPIURI + "response_type=" + responseType + "&client_id=" + client + "&redirect_uri=" + redirectURI + "&scope=" + scopes;
        const response = await fetch(url, requestOptions);
        const authCode = response.url.substring(response.url.search("=") + 1);

        return authCode;
    }

    /* 
    Get Token
    We defaulted all params except for code,
    which is code flow specifc. As a demo site we only have 1
    auth code client. But if we add more in the future, this
    will already support that.

    @param
    @param
    @param
    @return string base64 encoded
    */
   //TODO might need to change syntax for destructuring here. See "named and optional arguments" https://medium.com/dailyjs/named-and-optional-arguments-in-javascript-using-es6-destructuring-292a683d5b4e
   //TODO I *think* we can get rid of the UID and swaprods params now that we aren't using them. Need thorough regression testing when removed.
    async getToken({uid, swaprods = "2FederateM0re!", client = "pa_wam", responseType = "code", redirectURI = process.env.REACT_APP_HOST + "/app/banking", scopes = ""} = {}) {
        console.info("PingAuthN.js", "Getting a token.");

        if (responseType == "code") {
            console.info("PingAuthN.js", "Using auth code grant");
            const authCode = await this.getAuthCode({uid:this.Session.getAuthenticatedUserItem("uid"), scopes:scopes});
            let grantType = "authorization_code";

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlEncodedBody");
            myHeaders.append("Authorization", "Basic cGFfd2FtOjJGZWRlcmF0ZU0wcmU=");

            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                redirect: 'follow'
            };
            const url = this.pfTokenAPIURI + "grant_type=" + grantType + "&redirect_uri=" + redirectURI + "&code=" + authCode;
            const response = await fetch(url, requestOptions);
            const jsonData = await response.json();
            const token = await jsonData.access_token;
            console.info("PingAuthN.js", "TOKEN: " + token); //TODO file name is wrong in this log entry across entire component.

            return token; //TODO there should only be one return statement.

        } else if (client == "marketingApp" || client == "anywealthadvisorApp") {
            console.info("PingAuthN.js", "Using client credentials grant");
            let grantType = "client_credentials";
            var myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
            myHeaders.append("username", uid);

            var urlencoded = new URLSearchParams();
            urlencoded.append("client_id", client);
            urlencoded.append("client_secret", "2Federate");

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: urlencoded,
                redirect: 'follow'
            };

            const url = this.pfTokenAPIURI + "grant_type=" + grantType;
            const response = await fetch(url, requestOptions);
            const jsonData = await response.json();
            const token = await jsonData.access_token;
            console.info("PingAuthN.js Token =", token);

            return token;
                
        } else {
            // If you ended up here, you coded yourself into this problem.
            throw new Error("PingAuthN.js", "Unexpected response_type or client exception in getToken().");
        }
    }
}