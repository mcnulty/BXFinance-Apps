/*
PING INTEGRATION
This entire component is Ping developed.
Implements functions to integrate with PingFed
OAuth-related API endpoints.

@author Michael Sanchez

*/

import Session from './Session';

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
    async getAuthCode({uid, swaprods = "2FederateM0re", client = "pa_wam", responseType = "code", redirectURI = process.env.REACT_APP_HOST + "/app/banking", scopes = ""} = {}) {
        //swaprods... get it?
        //console.log("TEST:", "getting auth code")
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlEncodedBody");
        myHeaders.append("Authorization", "Basic cGFfd2FtOjJGZWRlcmF0ZU0wcmU=");

        const urlEncodedBody = new URLSearchParams();
        urlEncodedBody.append("pf.username", uid);
        urlEncodedBody.append("pf.pass", swaprods); //TODO this is total gap. On passwordless authN, we don't know the password. 
                                                    //Will putting PA in place resolve this so we don't have to enforce "2FederateMore" for everyone?
                                                    //But then that lessens the SPA UX with all the redirects to get a token. This needs to be resolved for all other demos.

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlEncodedBody,
            redirect: 'follow'
        };
        
        const url = process.env.REACT_APP_HOST + this.pfAuthZAPIURI + "response_type=" + responseType + "&client_id=" + client + "&redirect_uri=" + redirectURI + "&scope=" + scopes;
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
    async getToken({uid, swaprods = "2FederateM0re", client = "pa_wam", responseType = "code", redirectURI = process.env.REACT_APP_HOST + "/app/banking", scopes = ""} = {}) {
        let response = {};

        if (responseType == "code") {
            console.log("Using auth code grant");
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
            const url = process.env.REACT_APP_HOST + this.pfTokenAPIURI + "grant_type=" + grantType + "&redirect_uri=" + redirectURI + "&code=" + authCode;
            const response = await fetch(url, requestOptions);
            const jsonData = await response.json();
            const token = await jsonData.access_token;
            console.log("TOKEN", token);

            return token;

        } else if (client == "marketingApp" || client == "anywealthadvisorApp") {
            console.log("Using client credentials grant");
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

            const url = process.env.REACT_APP_HOST + this.pfTokenAPIURI + "grant_type=" + grantType;
            const response = await fetch(url, requestOptions);
            const jsonData = await response.json();
            const token = await jsonData.access_token;
            console.log("TOKEN", token);

            return token;
                
        } else {
            //TODO implement implicit call here when needed. Not needed in v1 release. So throw error for now. 
            //(Seems a little harsh.)
            throw new Error("Unexpected response_type exception in PingOAuth.getToken.");
        }
    }
}