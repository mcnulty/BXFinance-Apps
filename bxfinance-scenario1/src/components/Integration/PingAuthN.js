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
    authnAPI({ method, flowId, contentType, payload, action }) {
        console.info("PingAuthN.js", "Authenticating user with authN API.");

        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('X-XSRF-Header', 'PingFederate');
        if (contentType !== undefined) { headers.append('Content-Type', contentType); }

        const requestOptions = {
            headers: headers,
            method: method,
            body: payload,
            credentials: 'include'
        }
        let url = this.pfAuthnAPIURI + flowId;
        if (action !== undefined) { url += "?action=" + action; }
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
    handleAuthNflow({ flowId, flowResponse, swaprods, rememberMe, body }) {
        console.info("PingAuthN.js", "Handling flow response from authN API.");
        console.log("flowResponse", JSON.stringify(flowResponse));

        let payload = '{}';
        if (!flowResponse) { flowResponse = {}; } //This won't exist if we only get a flowId. So create it to let switch/case default kick in.
        switch (flowResponse.status) {
            case "IDENTIFIER_REQUIRED":
                console.info("PingAuthN.js", "IDENTIFIER_REQUIRED");
                payload = '{\n  \"identifier\": \"' + body + '\"\n}';
                return this.authnAPI({ method: "POST", flowId: flowResponse.id, contentType: "application/vnd.pingidentity.submitIdentifier+json", payload: payload });
                break;
            case "USERNAME_PASSWORD_REQUIRED":
                console.info("PingAuthN.js", "USERNAME_PASSWORD_REQUIRED");
                payload = '{\n \"username\": \"' + flowResponse.username + '\", \"password\": \"' + swaprods + '\", \"rememberMyUsername\": \"' + rememberMe + '\", \"captchaResponse\": \"\" \n}';
                return this.authnAPI({ method: "POST", flowId: flowResponse.id, contentType: "application/vnd.pingidentity.checkUsernamePassword+json", payload: payload });
                break;
            case "AUTHENTICATION_REQUIRED":
                console.info("PingAuthN.js", "AUTHENTICATION_REQUIRED");
                payload = '{' + body + '}';
                return this.authnAPI({ method: "POST", flowId: flowResponse.id, contentType: "application/vnd.pingidentity.authenticate+json", payload: payload });
                break;
            case "DEVICE_SELECTION_REQUIRED":
                console.info("PingAuthN.js", "DEVICE_SELECTION_REQUIRED");
                payload = '{\n \"deviceRef\": {\n \"id\":\"' + body + '\" \n} \n}';
                return this.authnAPI({ method: "POST", flowId: flowResponse.id, payload: payload, action: "selectDevice" });
                break;
            case "OTP_REQUIRED":
                console.info("PingAuthN.js", "OTP_REQUIRED");
                payload = '{\n \"otp\": \"' + body + '\" \n}';
                return this.authnAPI({ method: "POST", flowId: flowResponse.id, payload: payload, action: "checkOtp" });
                break;
                // this case is a placeholder for mobile push. Needs to be updated.
            case "PUSH_CONFIRMATION_WAITING":
                console.info("PingAuthN.js", "fubar_REQUIRED");
                payload = '{\n \"fubar\": \"' + body + '\" \n}';
                return this.authnAPI({ method: "POST", flowId: flowResponse.id, action: "poll" });
                break;
            case "MFA_COMPLETED":
                console.info("PingAuthN.js", "MFA_COMPLETED");
                payload = '{' + body + '}';
                return this.authnAPI({ method: "POST", flowId: flowResponse.id, payload: payload, action: "continueAuthentication" });
                break;
            case "RESUME":
                console.info("PingAuthN.js", "Authentication complete. Redirecting to resumeURL.");
                window.location.assign(flowResponse.resumeUrl);
                break;
            case "FAILED":
                console.warn("PingAuthN.js", flowResponse.message);
                return flowResponse;
            default: // Just started the authN API flow, only have a flowId.
                console.info("PingAuthN.js", "Starting authN API flow.");
                return this.authnAPI({ method: "GET", flowId: flowId });
        }
    }

    /* 
    Agentless IK Pickup endpoint
    @param REF the ref Id returned with the authenticated user
    @return response object
    */
    pickUpAPI(REF, adapter) {
        console.info("PingAuthN.js", "Attribute pickup from Agentless IK.");

        const refId = REF;
        const myHeaders = new Headers();
        myHeaders.append("ping.instanceid", adapter);
        myHeaders.append("Authorization", "Basic cmVhY3QtdXNlcjoyRmVkZXJhdGVNMHJl"); /* TODO should we obfuscate somehow. */

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            credentials: 'include'
        };

        const url = this.pfPickupURI + refId

        return fetch(url, requestOptions);
    }
}



/*
######## OTP FLOW ##########

GET https://demo.bxfinance.xyz/idp/startSSO.ping?PartnerSpId=https://demo.bxfinance.xyz
response = ?fowId=fubar

GET https://demo.bxfinance.xyz/pf-ws/authn/flows/dEEpL
response = "status": "IDENTIFIER_REQUIRED"

POST https://demo.bxfinance.xyz/pf-ws/authn/flows/dEEpL?action=submitIdentifier
{
  "identifier": "string"
}
Response = "status": "AUTHENTICATION_REQUIRED"

POST https://demo.bxfinance.xyz/pf-ws/authn/flows/dEEpL?action=authenticate   //with empty object literal
{}
response = "status": "DEVICE_SELECTION_REQUIRED"  // device list included in response - lines up with UI from T3.

POST https://demo.bxfinance.xyz/pf-ws/authn/flows/dEEpL?action=selectDevice
{
   "deviceRef":{
      "id":"ca5d9af8-8258-407c-9298-899713b09b38"
   }
}
response = "status": "OTP_REQUIRED"

POST https://demo.bxfinance.xyz/pf-ws/authn/flows/dEEpL?action=checkOtp
{
  "otp": "135298"
}
response = "status": "MFA_COMPLETED"

POST https://demo.bxfinance.xyz/pf-ws/authn/flows/dEEpL?action=continueAuthentication
//empty payload
response = "status": "RESUME" //includes resumeUrl for redirect;



######## MOBILE APP FLOW ##########

GET https://demo.bxfinance.xyz/idp/startSSO.ping?PartnerSpId=https://demo.bxfinance.xyz
response = ?fowId=fubar

GET https://demo.bxfinance.xyz/pf-ws/authn/flows/dEEpL
response = "status": "IDENTIFIER_REQUIRED"

POST https://demo.bxfinance.xyz/pf-ws/authn/flows/dEEpL?action=submitIdentifier
{
  "identifier": "string"
}
Response = "status": "AUTHENTICATION_REQUIRED"

POST https://demo.bxfinance.xyz/pf-ws/authn/flows/dEEpL?action=authenticate   //with empty object literal
{}
response = "status": "DEVICE_SELECTION_REQUIRED"  // device list included in response - lines up with UI from T3.

POST https://demo.bxfinance.xyz/pf-ws/authn/flows/dEEpL?action=selectDevice
{
   "deviceRef":{
      "id":"ca5d9af8-8258-407c-9298-899713b09b38"
   }
}
response =


*/