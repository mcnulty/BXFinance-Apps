/* 
PING INTEGRATION
This entire component is Ping developed.
Implements functions to integrate with PingFed
authentication-related API endpoints.

@author Michael Sanchez

*/
export default class PingAuthN {

    // Didn't abstract these since they shouldn't ever change.
    pfAuthnAPIURI = "/pf-ws/authn/flows/";
    pfPickupURI = "/ext/ref/pickup?REF=";
    //TODO remove if stable. pfSPRefIdAdapterInstanceId = "BXFSPRefID";

    /* 
    AuthN API endpoint
    @param  method the HTTP request verb
    @param flowId the flowId from the initiated authN API response
    @param contentType the content type required for the submitted payload
    @param body the payload to send in the API body in JSON format
    @return response object
    */
    authnAPI({method, flowId, contentType, body}) {
        console.log("authnAPI ARGS:", arguments);
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('X-XSRF-Header', 'PingFederate');
        console.log("authnApi flowid", flowId);
        // TODO this look syntactically stupid. Review/refactor.
        let tmp = contentType !== undefined && headers.append('Content-Type', contentType);

        const requestOptions = {
            headers: headers,
            method: method,
            body: body,
            credentials: 'include'
        }
        const url = process.env.REACT_APP_HOST + this.pfAuthnAPIURI + flowId;
        return fetch(url, requestOptions);
    }

    /* 
    Agentless IK Pickup endpoint
    @param REF the ref Id returned with the authenticated user
    @return response object
     */
    pickUpAPI(REF, adapter) {
        const refId = REF;
        const myHeaders = new Headers();
        myHeaders.append("ping.instanceid", adapter);
        myHeaders.append("Authorization", "Basic cmVhY3QtdXNlcjoyRmVkZXJhdGVNMHJl"); /* TODO should we obfuscate somehow. */

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow'
        };

        const url = process.env.REACT_APP_HOST + this.pfPickupURI + refId

        return fetch(url, requestOptions);
    }

    /* 
    Handle AuthN Flow
    Handler for different authN API flows. UI components shouldn't deal with
    API calls. They just need to know about the user and what their next move is.
    @param flowResponse the response object in JSON format
    @param identifier the userName or email of the authenticating user
    @param swaprods the user's password if doing password authentication
    */
    handleAuthNflow({flowId, flowResponse, identifier, swaprods, rememberMe}) {
        console.log("handleAuthNflow ARGS:", arguments);
        let payload = '{}';
        if (!flowResponse){ flowResponse = {}; } //This won't exist if we only get a flowId. So create it to let switch/case default kick in.
        console.log("flowResponse.status", flowResponse.status);
        switch (flowResponse.status) {
            case "IDENTIFIER_REQUIRED":
                console.log("handleAuthNflow","IN IDENTIFIER");
                payload = '{\n  \"identifier\": \"' + identifier + '\"\n}';
                return this.authnAPI({method:"POST", flowId:flowResponse.id, contentType:"application/vnd.pingidentity.submitIdentifier+json", body:payload});
                    /* .then(response => response.json())
                    .then(data => {
                        this.handleAuthNflow({flowResponse:data})
                    })
                    .catch(error => console.error("HandleAuthNflow ERROR", error)); */
                break;
            case "RESUME":
                console.log("handleAuthNflow", "IN RESUME");
                console.log("resumeUrl", flowResponse.resumeUrl);
                window.location.href = flowResponse.resumeUrl;
                break;
            case "USERNAME_PASSWORD_REQUIRED":
                console.log("handleAuthNflow", "IN USERNAME_PASSWORD_REQUIRED");
                console.log("flowresponse:", flowResponse);
                console.log("swaprods:", swaprods);
                payload = '{\n \"username\": \"' + flowResponse.username + '\", \"password\": \"' + swaprods + '\", \"rememberMyUsername\": \"' + rememberMe + '\", \"captchaResponse\": \"\" \n}';
                console.log("payload",payload);
                return this.authnAPI({method:"POST", flowId:flowResponse.id, contentType:"application/vnd.pingidentity.checkUsernamePassword+json", body:payload});
                break;
            default: // No status yet, need to get it.
                console.log("handleAuthNflow", "In default: getting flow status.");
                return this.authnAPI({method:"GET", flowId:flowId});
        }
    }
}