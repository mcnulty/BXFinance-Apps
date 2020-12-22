/*
PING INTEGRATION
This entire component is Ping developed.
Implements functions to integrate with 
David Babbit's mock OpenBanking APIs, hosted on Heroku.
I like to call it the OpenBabbitt API.

@author Michael Sanchez
@see https://github.com/babbtx/mock-simple-aspsp
*/

import JSONSearch from '../Utils/JSONSearch';
import PingData from './PingData';

export default class OpenBanking {

    constructor() {
        // Didn't abstract these since they shouldn't ever change. I say that now.
        this.mockOBConsenthost = "/OpenBanking";
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
    async provisionAccounts(token) {
        //If we had to time to be cool, we could have extracted the uid from the token.
        console.info("OpenBanking.js", "Provisioning bank accounts.");

        let acctIdsArr = [];
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + token);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        const url = this.mockOBhost + this.mockOBAPIver + this.mockOBacctsURI;

        const response = await fetch(url, requestOptions);
        const jsonData = await response.json();
        return Promise.resolve(jsonData);
    }

    /* 
      Get Account Balances
      @param token the access token for the authenticated user.
      @return response object
      */
    getAccountBalances(token) {
        console.info("OpenBanking.js", "Getting bank account balances.");

        var myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + token);

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        const url = this.mockOBhost + this.mockOBAPIver + this.mockOBbalURI;
        return fetch(url, requestOptions);
    }

    /* 
    Transfer Money
    @param amount the dollar amount the user wants to transfer
    @param token the access token from PF for the authenticated user
    @return boolean stating success
    */
    transferMoney(amount, token) {
        console.info("OpenBanking.js", "Transferring money.");

        let myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer " + token);

        const requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        const url = this.xfrMoneyURI + amount;
        return fetch(url, requestOptions);
    }
}
