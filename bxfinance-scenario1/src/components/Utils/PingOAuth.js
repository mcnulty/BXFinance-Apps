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

    @param
    @param
    @param
    @param
    @param
    @param
    @return string
    */
    getAuthCode(uid, swaprods="2FederateM0re", client = "pa_wam", responseType = "code", redirectURI = process.env.REACT_APP_HOST+"/app/banking", scopes = "") {
        //swaprods... get it?
        console.log("TEST:","getting auth code")
        let authCode = '0';
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlEncodedBody");
        //myHeaders.append();

        const urlEncodedBody = new URLSearchParams();
        urlEncodedBody.append("pf.username", uid);
        urlEncodedBody.append("pf.pass", swaprods);

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlEncodedBody,
            redirect: 'follow'
        };

        const url = process.env.REACT_APP_HOST + this.pfAuthZAPIURI + "response_type=" + responseType + "&client_id=" + client + "&redirect_uri=" + redirectURI + "&scope=" + scopes;
        return fetch(url, requestOptions)
            .then(response => {
                authCode = this.getCodeFromResponse(response);
            })
            .catch(error => console.error(error));

        return authCode;
    }
    /* stoopid */
    getCodeFromResponse(data) {
        let code = data.url.substring(data.url.search("=") + 1);
        console.log("Real authcode:" , authCode);
        return code;
    }

    /* 
    Get Token from AS.
    We defaulted all params except for code,
    which is code flow specifc. As a demo site we only have 1
    auth code client. But if we add more in the future, this
    will already support that.

    @param
    @param
    @param
    @return string base64 encoded
    */
    // TODO this could be refactored to be the only public method. The app never needs the authCode. So getToken could call getAuthCode, then swap for token.    
    getToken(code, grantType = "authorization_code", redirectURI = process.env.REACT_APP_HOST + "/app/banking") {
        console.log("TEST:", "getting token")

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlEncodedBody");
        myHeaders.append("Authorization", "Basic UGluZ1Rva2VuOjJGZWRlcmF0ZU0wcmU=");

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'manual'
        };

        const url = process.env.REACT_APP_HOST + this.pfTokenAPIURI + "grant_type=" + grantType + "&redirect_uri=" + redirectURI + "&code=" + code;
        fetch(url, requestOptions)
            .then(response => response.text())
            .then(result => console.log("Tokenresult:", result))
            .catch(error => console.log('error', error));
    }
}