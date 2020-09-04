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
        //TODO move these out of the constructor. Not sure why I did this. Not necessary. Didn't do it anywhere else. That's what I get for working on a Saturday.
        this.mockOBConsenthost = process.env.REACT_APP_HOST + "/OpenBanking";
        // this.mockOBhost = "https://demo-openbanking-api-server.herokuapp.com/OpenBanking";
        this.mockOBhost = "https://babbtx-aspsp.herokuapp.com/OpenBanking";
        this.mockOBAPIver = "/v2";
        this.mockOBbalURI = "/balances";
        this.mockOBacctsURI = "/accounts";
        this.JSONSearch = new JSONSearch();
        this.PingData = new PingData();
        this.xfrMoneyURI = "/transferMoney?amount=";
    }


    /* 
      Provision Banking Accounts
      Provisions new accounts and balances and updates the user entry in PD.
      Design pattern debate: Whether to just return the accounts response (strict single responsiblilty), or
      or as is now, fulfills all tasks of "provisioning an acct", which should include upating the user entry.
      @param token the access token for the authenticated user.
      @response object
      */
    provisionAccounts(token, uid) {
        let acctIdsArr = [];
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + token);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        const url = this.mockOBhost + this.mockOBAPIver + this.mockOBacctsURI;
        fetch(url, requestOptions)
            .then(response => response.json())
            .then(jsonData => {
                console.log("jsonData:", JSON.stringify(jsonData));
                acctIdsArr = this.JSONSearch.findValues(jsonData, "AccountId");
                console.log("acctIdsArr:", acctIdsArr);
                this.PingData.updateUserEntry(acctIdsArr, uid);
            })
            .catch(error => console.log('error', error));
        //TODO try catch error handling to return true or false.
        return true;
    }

    /* 
      Get Account Balances
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
        const url = this.mockOBhost + this.mockOBAPIver + this.mockOBbalURI;
        return fetch(url, requestOptions);
        /* const response = fetch(url, requestOptions);
        const jsonData = response.json();
        console.log("accounts json", JSON.stringify(jsonData.Data.Balance));
        return jsonData.Data.Balance; */
    }

    /* 
    Transfer Money
    @param amount the dollar amount the user wants to transfer
    @param token the access token from PF for the authenticated user
    @return boolean stating success
    */
    transferMoney(amount, token) {
        console.log("transferMoney", arguments);
        console.log("token", token);

        let myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + token);

        const requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        const url = process.env.REACT_APP_HOST + this.xfrMoneyURI + amount;
        return fetch(url, requestOptions);
        /* .then(response => response.text())
        .then(result => console.log("XFR Response",result))
        .catch(error => console.log('error', error)); */
    }
}
