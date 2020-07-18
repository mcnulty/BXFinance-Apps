/*
PING INTEGRATION
This entire component is Ping developed.
Implements functions to integrate with 
David Babbit's mock OpenBanking APIs, hosted on Heroku.
I like to call it the OpenBabbitt API.

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
      Provision Banking accounts for user.
      @param token the access token for the authenticated user.
      @response object
      */
    provisionAccounts(token) {
        //console.log("provisionAccts token:", token);
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + token);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch("https://demo-openbanking-api-server.herokuapp.com/OpenBanking/v2/accounts", requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
            //TODO 
    }

    /* 
      Get Account Balances for user.
      @param token the access token for the authenticated user.
      @return response object
      */
    getAccountBalances(token) {
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + token);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        fetch("https://demo-openbanking-api-server.herokuapp.com/OpenBanking/v2/balances/", requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
    }
}
