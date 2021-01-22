/**
PING INTEGRATION:
This entire component is Ping-developed.
Implements functions to integrate with 
David Babbit's mock OpenBanking APIs, hosted on Heroku.
I like to call it the OpenBabbitt API.

@author Michael Sanchez
@see {@link https://github.com/babbtx/mock-simple-aspsp}
*/

import PingAuthN from './PingAuthN';

class OpenBanking {

    /**
    Configurations for the OpenBanking API.

    @property {string} mockOBhost OpenBaking API host.
    @property {string} mockOBAPIver OpenBanking API version.
    @property {string} mockOBbalURI OpenBanking API account balances path.
    @property {string} mockOBacctsURI OpenBanking API accounts path.
    @property {string} xfrMoneyURI OpenBanking API transfer money path.
    */
    constructor() {
        // Didn't abstract these since they shouldn't ever change. I say that now.
        this.mockOBhost = "/OpenBanking";
        this.mockOBAPIver = "/v2";
        this.mockOBbalURI = "/balances";
        this.mockOBacctsURI = "/accounts";
        this.xfrMoneyURI = "/transferMoney?amount=";
    }

    /**
      Provision Banking Accounts:
      Provisions new accounts and balances and updates the user entry in PingDirectory.
      Design pattern debate: Whether to just return the accounts response (strict single responsiblilty), or
      or as is now, fulfills all tasks of "provisioning an acct", which should include upating the user entry.

      @return {object} The response JSON object.
      */
    async provisionAccounts() {
        //If we had to time to be cool, we could have extracted the uid from the token.
        console.info("OpenBanking.js", "Provisioning bank accounts.");

        const requestOptions = {
            method: 'GET',
            redirect: 'follow',
            credentials: 'include'
        };
        const url = this.mockOBhost + this.mockOBAPIver + this.mockOBacctsURI;

        await PingAuthN.useSession();
        const response = await fetch(url, requestOptions);
        const jsonData = await response.json();
        return Promise.resolve(jsonData);
    }

    /**
      Get Account Balances:
      Retreives account balances to display on the Accounts Dashboard.

      @return {object} The response JSON object.
      */
    getAccountBalances() {
        console.info("OpenBanking.js", "Getting bank account balances.");
        const requestOptions = {
          method: 'GET',
          redirect: 'follow',
          credentials: 'include'
        };
        const url = this.mockOBhost + this.mockOBAPIver + this.mockOBbalURI;
        return PingAuthN.useSession().then(() => fetch(url, requestOptions));
    }

    /**
    Transfer Money:
    Initiates a money transfer between accounts.

    @param {number} amount The dollar amount the user wants to transfer.
    @return {boolean} Success state of the transfer.
    */
    transferMoney(amount) {
        console.info("OpenBanking.js", "Transferring money.");

        const requestOptions = {
            method: 'GET',
            redirect: 'follow',
            credentials: 'include'
        };
        const url = this.xfrMoneyURI + amount;
        return PingAuthN.useSession().then(() => fetch(url, requestOptions));
    }
};

export default OpenBanking;
