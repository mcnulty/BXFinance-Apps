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

    this.PingData.getUserEntry(this.Session.getAuthenticatedUserItem("uid"))
    .then(response => response.json())
    .then(jsonData => {
      acctIDsArr = this.JSONSearch.findValues(jsonData, "bxFinanceUserAccountIDs");
      if (acctIDsArr.length) {
        //Store their account IDs in their browser session. (as a string).
        this.Session.setAuthenticatedUserItem("accounts", acctIDsArr.join());
        

      } else {
        // provision accts and update array
      }
    })
      //.then(jsonData => console.log("test:", this.JSONSearch.findValues(jsonData, "bxFinanceUserAccountIDs")))
    //.then(jsonData => console.log("test:", JSON.stringify(jsonData)))
    /* .then(jsonData => {
      tmpArr = this.JSONSearch.getValues(jsonData, "bxFinanceUserAccountIDs");
      console.info("Search Results:", tmpArr);
    }) */;
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