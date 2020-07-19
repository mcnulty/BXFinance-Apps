/*
PING INTEGRATION
This entire component is Ping developed.
Implements functions to integrate with 
David Babbit's mock OpenBanking APIs, hosted on Heroku.
I like to call it the OpenBabbitt API.

@author Michael Sanchez
@see https://github.com/babbtx/mock-simple-aspsp
*/

import JSONSearch from './JSONSearch';
import PingData from './PingData';

export default class OpenBanking {
    
    constructor() {
        // Didn't abstract these since they shouldn't ever change.
        this.mockOBConsenthost = process.env.REACT_APP_HOST + "/OpenBanking";
        this.mockOBhost = "https://demo-openbanking-api-server.herokuapp.com/OpenBanking";
        this.mockOBAPIver = "/v2";
        this.mockOBbalURI = "/balances";
        this.mockOBacctsURI = "/accounts";
        this.JSONSearch = new JSONSearch();
        this.PingData = new PingData();
    }
    

    /* 
      Provision Banking accounts for user.
      @param token the access token for the authenticated user.
      @response object
      */
    provisionAccounts(token) {
        let acctIdsArr = [];
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + token);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        const url = this.mockOBhost + this.mockOBAPIver + this.mockOBacctsURI;
        fetch(url , requestOptions)
            .then(response => response.json())
            .then(jsonData => {
                console.log("jsonData:", jsonData);
                acctIdsArr = this.JSONSearch.findValues(jsonData, "AccountId");
                console.log("acctIdsArr:", acctIdsArr);
                this.PingData.updateUserEntry(acctIdsArr);
            })
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
        const url = this.mockOBConsenthost + this.mockOBAPIver + this.mockOBbalURI;
        fetch(url, requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
    }
}
