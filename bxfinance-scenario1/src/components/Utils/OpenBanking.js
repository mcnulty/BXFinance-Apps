/*
PING INTEGRATION
This entire component is Ping developed.
Implements functions to integrate with 
David Babbit's mock OpenBanking APIs, hosted on Heroku.

@author Michael Sanchez
@see https://github.com/babbtx/mock-simple-aspsp
*/


export default class OpenBanking {

    // Didn't abstract these since they shouldn't ever change.
    mockOBhost = "https://demo-openbanking-api-server.herokuapp.com/OpenBanking";
    mockOBAPIver = "/v2";
    mockOBbalURI = "/balances";
    mockOBacctsURI = "/accounts";

    /* 
    Get Account Balances

    @param
    @return response object
    */
}