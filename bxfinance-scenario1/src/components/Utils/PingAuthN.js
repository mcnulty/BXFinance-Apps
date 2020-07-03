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
    pfSPRefIdAdapterInstanceId = "BXFSPRefID"; /* If we ever end up with more adapters, might make sense to abstract the IDs. */

    /* 
    AuthN API endpoint
    @param  method the HTTP request verb
    @param flowId the flowId from the initiated authN API response
    @param contentType the content type required for the submitted payload
    @param body the payload to send in the API body in JSON format
    @return response object
    */
    authnAPI(method, flowId, contentType, body) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('X-XSRF-Header', 'PingFederate');

        let tmp = contentType !== undefined && headers.append('Content-Type', contentType);

        const options = {
            headers: headers,
            method: method,
            body: body,
            credentials: 'include'
        }
        const url = process.env.REACT_APP_HOST + this.pfAuthnAPIURI + flowId;
        return fetch(url, options);
    }

    /* 
    Agentless IK Pickup endpoint
    @param REF the ref Id returned with the authenticated user
    @return response object
     */
    pickUpAPI(REF) {
        const refId = REF;
        let myHeaders = new Headers();
        myHeaders.append("ping.instanceid", this.pfSPRefIdAdapterInstanceId);
        myHeaders.append("Authorization", "Basic cmVhY3QtdXNlcjoyRmVkZXJhdGVNMHJl"); /* TODO this should be obfuscated somehow. Client exposure risk. */

        let requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow'
        };

        const url = process.env.REACT_APP_HOST + this.pfPickupURI
        /* fetch(url + refId, requestOptions)
            .then(response => response.json())
            .then(result => console.info("PICKUP RESULTS:", result))
            .catch(error => console.error('ERROR', error)); */

        return fetch(url + refId, requestOptions);
    }

    /* 
    Handler for different authN API flow status
    @param flowResponse the response object in JSON format
    @param userName the userName of the authenticating user
    */
    handleFlowStatus(flowResponse, userName) {
        switch (flowResponse.status) {
            case "IDENTIFIER_REQUIRED":
                let payload = '{\n  \"identifier\": \"' + userName + '\"\n}';
                this.authnAPI("POST", flowResponse.id, "application/vnd.pingidentity.submitIdentifier+json", payload)
                    .then(response => response.json())
                    .then(data => this.handleFlowStatus(data))
                    .catch(error => console.error("HANDLEFLOWSTATUS ERROR", error));
                break;
            case "RESUME":
                window.location.href = flowResponse.resumeUrl;
                break;
            default:
                console.warn("WTF", "handleFlowStatus defaulted with flowId = " + flowResponse.id);
        }
    }
}