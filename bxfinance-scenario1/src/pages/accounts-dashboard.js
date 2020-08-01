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
    this.state = {
      myAccounts: []
    }
    /* END PING INTEGRATION: */
  }

  /* BEGIN PING INTEGRATION: */
  componentDidMount() {
    let acctIDsArr = [];
    let acctIDsArrSimple = [];

    this.PingData.getUserEntry(this.Session.getAuthenticatedUserItem("uid"))
      .then(response => response.json())
      .then(jsonData => {
        acctIDsArr = this.JSONSearch.findValues(jsonData, "bxFinanceUserAccountIDs");
        acctIDsArrSimple = this.JSONSearch.findValues(acctIDsArr, "ids");
        this.Session.setAuthenticatedUserItem("accts", acctIDsArrSimple[0]);
        if (acctIDsArr.length) {
          console.log("TEST:", "we see accts array.");
          this.PingOAuth.getToken({uid: this.Session.getAuthenticatedUserItem("uid"), scopes: 'urn:pingdirectory:consent'})
            .then(token => {
              this.Session.setAuthenticatedUserItem("AT", token); //TODO need to re-use this token everywhere to avoid multiple getToken calls.
              this.OpenBanking.getAccountBalances(token)
                .then(response => response.json())
                .then(jsonData => {
                  this.setState({ myAccounts: jsonData.Data.Balance });
                })
                .catch(e => {
                  console.error("GetAccountBalances Exception", e)
                });
            })
            .catch(e => {
              console.error("GetToken Exception", e);
            });
        } else {
          console.log("TEST:", "we dont see accts arr.");
          this.PingOAuth.getToken({uid: this.Session.getAuthenticatedUserItem("uid"), scopes: 'urn:pingdirectory:consent'})
            .then(token => {
              this.Session.setAuthenticatedUserItem("at", token);
              this.OpenBanking.provisionAccounts(token, this.Session.getAuthenticatedUserItem("uid"));
              this.OpenBanking.getAccountBalances(token)
                .then(response => response.json())
                .then(jsonData => {
                  this.setState({ myAccounts: jsonData.Data.Balance });
                  acctIDsArr = this.JSONSearch.findValues(jsonData.Data.Balance, "AccountId");
                  this.Session.setAuthenticatedUserItem("accts", acctIDsArr);
                })
                .catch(e => {
                  console.error("GetAccountBalances Exception", e)
                });
            })
            .catch(e => {
              console.error("GetToken Exception", e);
            });
        }
      }).catch(e => {
        console.error("GetUserEntry Exception", e);
      });
  }
  /* END PING INTEGRATION: */

  render() {

    return (
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
                    <AccountsBalance key={data.balances[key].title} balance={data.balances[key]} myAccounts={this.state.myAccounts} />
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