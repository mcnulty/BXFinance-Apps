import React from 'react'
import { Container } from 'reactstrap';

// Components
import NavbarMain from '../components/NavbarMain';
import WelcomeBar from '../components/WelcomeBar';
import FooterMain from '../components/FooterMain';
import AccountsSubnav from '../components/AccountsSubnav';
import AccountsDropdown from '../components/AccountsDropdown';
import AccountsBalance from '../components/AccountsBalance';
import CardRewards from '../components/CardRewards';
import Session from '../components/Utils/Session'; /* PING INTEGRATION */
import PingData from '../components/Utils/PingData'; /* PING INTEGRATION */
import JSONSearch from '../components/Utils/JSONSearch'; /* PING INTEGRATION */
import PingOAuth from '../components/Utils/PingOAuth'; /* PING INTEGRATION: */
import OpenBanking from '../components/Utils/OpenBanking'; /* PING INTEGRATION: */

// Data
import data from '../data/accounts-dashboard.json';

// Styles
import "../styles/pages/accounts.scss";

class AccountsDashboard extends React.Component {
  constructor() {
    super();
    /* BEGIN PING INTEGRATION: */
    this.Session = new Session();
    this.PingData = new PingData();
    this.JSONSearch = new JSONSearch();
    this.PingOAuth = new PingOAuth(); 
    this.OpenBanking = new OpenBanking();
    /* END PING INTEGRATION: */
  }

  /* BEGIN PING INTEGRATION: */
  componentDidMount() {
    let acctIDsArr = [];
    //let authCode = '';
    let token = '';

    this.PingData.getUserEntry(this.Session.getAuthenticatedUserItem("uid")) //TODO move promise chaining into component. Shouldn't deal with that here.
    .then(response => response.json())
    .then(jsonData => {
      acctIDsArr = this.JSONSearch.findValues(jsonData, "bxFinanceUserAccountIDs");
      console.log("accts:", acctIDsArr);
      if (acctIDsArr.length) {
        console.log("TEST:","we see accts arr.");
        //Store their account IDs in their browser session. (as a string).
        this.Session.setAuthenticatedUserItem("accounts", acctIDsArr.join());
        //callOpenBanking API to get account balances.
        //this.OpenBanking.getAccountBalances(token);
      } else {
        console.log("TEST:", "we dont see accts arr.");
        this.PingOAuth.getToken(this.Session.getAuthenticatedUserItem("uid"))
        .then(token => {//need a catch() for this .then():
          this.OpenBanking.provisionAccounts(token);
          //TODO dont want openbanking to return accts. More promise chaos. On success of provisionAccounts(), call getUserEntry() again and update UI.
        });
      }
    }).catch(e => {
      throw new Error("GetUserEntry Exception: " + e);
    });
  }
  /* END PING INTEGRATION: */
  
  render() {
    return(
      <div className="accounts accounts-dashboard">
        <NavbarMain />
        <WelcomeBar firstName={this.Session.getAuthenticatedUserItem('firstName')} /> {/* PING INTEGRATION: added passing of firstName prop. */}
        <Container>
          <div className="inner">
            <div className="sidebar">
              {
                Object.keys(data.subnav).map(key => {
                  return (
                    <AccountsSubnav key={data.subnav[key].title} subnav={data.subnav[key]} />
                  );
                })      
              }
              <CardRewards />
            </div>
            <div className="content">
              <div className="accounts-hdr">
                <h1>{data.title}</h1>
                <AccountsDropdown text={data.dropdown} />
              </div>
              {
                Object.keys(data.balances).map(key => {
                  return (
                    <AccountsBalance key={data.balances[key].title} balance={data.balances[key]} />
                  );
                })      
              }
            </div>
          </div>
        </Container>
        <FooterMain />
      </div>
    )
  }
}
export default AccountsDashboard