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
        urlEncodedBody.append("pf.pass", swaprods);

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlEncodedBody,
            redirect: 'follow'
        };
        // if async process already started, await wont have any effect.
        // add try catch around fetch calls
        const url = process.env.REACT_APP_HOST + this.pfAuthZAPIURI + "response_type=" + responseType + "&client_id=" + client + "&redirect_uri=" + redirectURI + "&scope=" + scopes;
        const response = await fetch(url, requestOptions);
        // console.log("response", response);
        const authCode = response.url.substring(response.url.search("=") + 1);
        // console.log("authcode extracted:", authCode);
        //console.log("getauthcoderesponse:", response);
        //return await fetch(url, requestOptions);;
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
    async getToken({uid, swaprods = "2FederateM0re", client = "pa_wam", responseType = "code", redirectURI = process.env.REACT_APP_HOST + "/app/banking", scopes = ""} = {}) {
        let grantType = "authorization_code"; //Defaulting to auth code for v1. If it changes in a later version this should be a defaulted param in the function.
        let response = {};
        //let authCode = '0';

        if (responseType == "code") {
            const authCode = await this.getAuthCode({uid:this.Session.getAuthenticatedUserItem("uid"), scopes:scopes});

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/x-www-form-urlEncodedBody");
            myHeaders.append("Authorization", "Basic cGFfd2FtOjJGZWRlcmF0ZU0wcmU=");
            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                redirect: 'follow'
            };
            let url = process.env.REACT_APP_HOST + this.pfTokenAPIURI + "grant_type=" + grantType + "&redirect_uri=" + redirectURI + "&code=" + authCode;
            const response = await fetch(url, requestOptions);
            const jsonData = await response.json();
            const token = await jsonData.access_token;
            console.log("TOKEN", token);

            return token;
        } else {
            //Assuming response_type=token (implicit) here based on our current PF configs. That assumptoin could change in future versions.
            //TODO implement implicit call here when needed. Not needed in v1 release. So throw error for now.
            throw new Error("Unexpected response_type exception in PingOAuth.getToken.");
        }
    }
}