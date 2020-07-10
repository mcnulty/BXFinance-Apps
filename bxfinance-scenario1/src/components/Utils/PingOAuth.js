/*
PING INTEGRATION
This entire component is Ping developed.
Implements functions to integrate with PingFed
OAuth-related API endpoints.

@author Michael Sanchez

*/

export default class PingOAuth {

    // Didn't abstract these since they shouldn't ever change.
    pfAuthZAPIURI = "/as/authorization.oauth2?";
    pfTokenAPIURI = "/as/token.oauth2?";

    /* 
    Get AuthZ code from AS.
    We defaulted all params except for uid and password, 
    which are user specifc. As a demo site we only have 1
    auth code client. But if we add more in the future, this
    will already support that.
    */
    getAuthCode(uid, swaprods, client = "PingToken", responseType = "code", redirectURI = "https://changeme.com", scopes = "urn:pingdirectory:consent") {
        //swaprods... get it?

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        const urlencoded = new URLSearchParams();
        urlencoded.append("pf.username", uid);
        urlencoded.append("pf.pass", "2FederateM0re");

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'manual'
        };

        const url = process.env.REACT_APP_HOST + this.pfAuthZAPIURI + "response_type=" + responseType + "&client_id=" + client + "&redirect_uri=" + redirectURI + "&scope=" + scopes;
        fetch(url, requestOptions)
            .then(response => response.text())
            .then(result => console.log("Coderesult:", result))
            .catch(error => console.log('error', error));
    }

    /* 
    Get Token from AS.
    We defaulted all params except for code,
    which is code flow specifc. As a demo site we only have 1
    auth code client. But if we add more in the future, this
    will already support that.
    */
    getToken(code, grantType = "authorization_code", redirectURI = "https://changeme.com") {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
        myHeaders.append("Authorization", "Basic UGluZ1Rva2VuOjJGZWRlcmF0ZU0wcmU=");

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow'
        };

        const url = process.env.REACT_APP_HOST + this.pfTokenAPIURI + "grant_type=" + grantType + "&redirect_uri=" + redirectURI + "&code=" + code;
        fetch(url, requestOptions)
            .then(response => response.text())
            .then(result => console.log("Tokenresult:", result))
            .catch(error => console.log('error', error));
    }
}