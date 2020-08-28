// Packages
import React from 'react';
import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink
} from 'reactstrap';
import { Link, NavLink as RRNavLink } from 'react-router-dom';

// Components
import ModalRegister from '../ModalRegister';
import ModalRegisterConfirm from '../ModalRegisterConfirm';
import ModalLogin from '../ModalLogin';
import PingAuthN from '../Utils/PingAuthN'; /* PING INTEGRATION */
import Session from '../Utils/Session'; /* PING INTEGRATION */
import ModalError from '../ModalError'; /* PING INTEGRATION: */
import './NavbarMain.scss';

// Data
import data from './data.json';

class NavbarMain extends React.Component {

  constructor() {
    super();
    this.state = {
      isOpen: false,
      loggedOut: true
    };
    this.PingAuthN = new PingAuthN(); /* PING INTEGRATION */
    this.Session = new Session(); /* PING INTEGRATION */
  }
  triggerModalRegister() {
    this.refs.modalRegister.toggle();
  }
  onModalRegisterSubmit() {
    this.refs.modalRegister.toggle();
    this.refs.modalRegisterConfirm.toggle();
  }
  triggerModalRegisterConfirm() {
    this.refs.modalRegisterConfirm.toggle();
  }
  triggerModalLogin() {
    /* BEGIN PING INTEGRATION */
    if (!window.location.search) {
      window.location.href = process.env.REACT_APP_HOST + data.startSSOURI;
    }/* END PING INTEGRATION */
    else { 
      this.refs.modalLogin.toggle(); //This is left here just in case the user closes the modal and clicks "sign in" after we already have a flowId in the URL.
    }
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  /* BEGIN PING INTEGRATION */
  startSLO() {
    this.Session.clearUserAppSession();
    const url = process.env.REACT_APP_HOST + "/sp/startSLO.ping?TargetResource=" + process.env.REACT_APP_HOST + process.env.PUBLIC_URL;
    window.location.href = url; 
  }
  /* END PING INTEGRATION: */

  componentDidMount() {
    // BEGIN PING INTEGRATION
    const isLoggedOut = (this.Session.getAuthenticatedUserItem("subject") === null || this.Session.getAuthenticatedUserItem("subject") === 'undefined') ? true : false;
    this.setState({ loggedOut: isLoggedOut});
    
    // Check for a querystring; Will be fowId or REF.
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      
      // Coming back from authN API or Agentless adapter.
      if (params.get("flowId")) {
        this.PingAuthN.handleAuthNflow({ flowId: params.get("flowId") })
          .then(response => response.json())
          .then(jsonResult => {
            console.log("TEST", "Got flowId");
            console.log("STATUS:", jsonResult.status);
            console.log("RESULTS:", JSON.stringify(jsonResult));
            let success = this.Session.setAuthenticatedUserItem("flowResponse", JSON.stringify(jsonResult)); //TODO do we still need this?
            if (jsonResult.status == "IDENTIFIER_REQUIRED") {
              //pop the ID first modal. 
              this.refs.modalLogin.toggle();
            }
            else if (jsonResult.status == "USERNAME_PASSWORD_REQUIRED") {
              //TODO I dont think this needs to be here. we will never hit this case in this component. we always start with IDENTIFIER_REQUIRED so we've moved over to ModalLogin.js.
              //pop the username/password modal.
              this.refs.modalLoginPassword.toggle();
            }
          })
          .catch(error => console.error('HANDLESUBMIT ERROR', error));
      } // Coming back as authenticated user from Agentless IK.
      else if (params.get("REF")) {
        const REF = params.get("REF");
        const targetApp = decodeURIComponent(params.get("TargetResource"));
        const adapter = (targetApp.includes("marketing") || targetApp.includes("advisor")) ? "AdvisorSPRefID" : "BXFSPRefID";

        this.PingAuthN.pickUpAPI(REF, adapter)
          .then(response => response.json())
          .then((jsonData) => {
            if (jsonData.resumePath) { // Means we are in a SLO request. SSO doesnt use resumePath.
              this.Session.clearUserAppSession();
              window.location.href = process.env.REACT_APP_HOST + jsonData.resumePath + "?source=" + adapter;
            }
            if (jsonData.bxFinanceUserType == "AnyWealthAdvisor" || jsonData.bxFinanceUserType == "AnyMarketing") {
              this.Session.setAuthenticatedUserItem("email", jsonData.Email);
              this.Session.setAuthenticatedUserItem("subject", jsonData.subject);
              this.Session.setAuthenticatedUserItem("firstName", jsonData.FirstName);
              this.Session.setAuthenticatedUserItem("lastName", jsonData.LastName);
              this.Session.setAuthenticatedUserItem("uid", jsonData.uid);
              this.Session.setAuthenticatedUserItem("bxFinanceUserType", jsonData.bxFinanceUserType);
            } else { //banking customer
              this.Session.setAuthenticatedUserItem("email", jsonData.Email);
              this.Session.setAuthenticatedUserItem("subject", jsonData.subject);
              this.Session.setAuthenticatedUserItem("firstName", jsonData.FirstName);
              this.Session.setAuthenticatedUserItem("lastName", jsonData.LastName);
              this.Session.setAuthenticatedUserItem("uid", jsonData.uid);
              this.Session.setAuthenticatedUserItem("pfSessionId", jsonData.sessionid);
              this.Session.setAuthenticatedUserItem("street", jsonData.street);
              this.Session.setAuthenticatedUserItem("mobile", jsonData.mobile);
              this.Session.setAuthenticatedUserItem("city", jsonData.city);
              this.Session.setAuthenticatedUserItem("zipcode", jsonData.postalCode);
              const fullAddress = jsonData.street + ", " + jsonData.city + ", " + jsonData.postalCode;
              this.Session.setAuthenticatedUserItem("fullAddress", fullAddress);
            }
            // Send them to the target app
            // TODO can we do this SPA style with history.push?
            window.location.href = targetApp;
          })
          .catch(error => {
            console.error("Agentless Pickup Error:", error);
            this.refs.modalError.toggle();
          });
      }
    }
    // END PING INTEGRATION
    // Original T3 code in this lifecycle method removed.
  }

  render() {
    return (
      <section className="navbar-main">
        {/* DESKTOP NAV */}
        <Navbar color="dark" dark expand="md" className="navbar-desktop">
          <Container>
            <Link to="/" className="navbar-brand"><img src={process.env.PUBLIC_URL + "/images/logo-white.png"} alt={data.brand} /></Link>
            <NavbarToggler onClick={this.toggle.bind(this)} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="justify-content-end ml-auto navbar-nav-utility" navbar>
                <NavItem>
                  <NavLink><img src={process.env.PUBLIC_URL + "/images/icons/search.svg"} alt={data.menus.utility.search} /></NavLink>
                </NavItem>
                <NavItem>
                  <NavLink><img src={process.env.PUBLIC_URL + "/images/icons/map-marker.svg"} alt={data.menus.utility.locations} /></NavLink>
                </NavItem>
                <NavItem>
                  <NavLink><img src={process.env.PUBLIC_URL + "/images/icons/support.svg"} alt={data.menus.utility.support} /></NavLink>
                </NavItem>
                {/* BEGIN PING INTEGRATION: added conditional rendering logic for Sign In/Out links. */}
                {/* TODO might need to change this to check state instead. Getting inconsistent results. */}
                {this.state.loggedOut &&
                  <NavItem className="login">
                    <NavLink href="#" onClick={this.triggerModalLogin.bind(this)}><img src={process.env.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.login} className="mr-1" /> {data.menus.utility.login}</NavLink>
                  </NavItem>}
                {!this.state.loggedOut &&
                  <NavItem className="logout">
                  <Link to="/" onClick={this.startSLO.bind(this)} className="nav-link"><img src={process.env.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.logout} className="mr-1" /> {data.menus.utility.logout}</Link>
                  </NavItem>}
                {this.state.loggedOut &&
                  <NavItem className="register">
                    <NavLink href={process.env.REACT_APP_HOST + data.pfRegURI}>{data.menus.utility.register_intro} <strong>{data.menus.utility.register}</strong></NavLink>
                  </NavItem>}
                {/* END PING INTEGRATION */}
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
        <Navbar color="dark" dark expand="md" className="navbar-desktop">
          <Container>
            <Nav className="mr-auto navbar-nav-main" navbar>
              {this.props && this.props.data && this.props.data.menus && this.props.data.menus.primary ? (
                this.props.data.menus.primary.map((item, i) => {
                  return (
                    <NavItem key={i}>
                      <NavLink to={item.url} activeClassName="active" exact tag={RRNavLink}>{item.title}</NavLink>
                    </NavItem>
                  );
                })
              ) : (
                  data.menus.primary.map((item, i) => {
                    return (
                      <NavItem key={i}>
                        <NavLink to={item.url} activeClassName="active" tag={RRNavLink}>{item.title}</NavLink>
                      </NavItem>
                    );
                  })
                )}
            </Nav>
          </Container>
        </Navbar>
        {/* MOBILE NAV */}
        <Navbar color="dark" dark expand="md" className="navbar-mobile">
          <div className="mobilenav-menu">
            <NavbarToggler onClick={this.toggle.bind(this)} />
          </div>
          <div className="mobilenav-brand">
            <Link to="/" className="navbar-brand"><img src={process.env.PUBLIC_URL + "/images/logo-white.png"} alt={data.brand} /></Link>
          </div>
          <div className="mobilenav-login">
            <NavLink href="#" className="login" onClick={this.triggerModalLogin.bind(this)}>Sign In</NavLink>
            <Link to="/" className="nav-link logout d-none">Sign Out</Link>
          </div>
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="navbar-nav-main navbar-light bg-light" navbar>
              {this.props && this.props.data && this.props.data.menus && this.props.data.menus.primary ? (
                this.props.data.menus.primary.map((item, i) => {
                  return (
                    <NavItem key={i}>
                      <NavLink to={item.url} activeClassName="active" exact tag={RRNavLink}>{item.title}</NavLink>
                    </NavItem>
                  );
                })
              ) : (
                  data.menus.primary.map((item, i) => {
                    return (
                      <NavItem key={i}>
                        <NavLink to={item.url} activeClassName="active" exact tag={RRNavLink}>{item.title}</NavLink>
                      </NavItem>
                    );
                  })
                )}
            </Nav>
            <Nav className="navbar-nav-utility" navbar>
              <NavItem>
                <NavLink><img src={process.env.PUBLIC_URL + "/images/icons/search.svg"} alt={data.menus.utility.search} className="mr-1" /> {data.menus.utility.search}</NavLink>
              </NavItem>
              <NavItem>
                <NavLink><img src={process.env.PUBLIC_URL + "/images/icons/map-marker.svg"} alt={data.menus.utility.locations} className="mr-1" /> {data.menus.utility.locations}</NavLink>
              </NavItem>
              <NavItem>
                <NavLink><img src={process.env.PUBLIC_URL + "/images/icons/support.svg"} alt={data.menus.utility.support} className="mr-1" /> {data.menus.utility.support}</NavLink>
              </NavItem>
              <NavItem className="login">
                <NavLink href="#" onClick={this.triggerModalLogin.bind(this)}><img src={process.env.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.login} className="mr-1" /> {data.menus.utility.login}</NavLink>
              </NavItem>
              <NavItem className="logout d-none">
                <Link to="/" className="nav-link"><img src={process.env.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.logout} className="mr-1" /> {data.menus.utility.logout}</Link>
              </NavItem>
              <NavItem className="register">
                {/* PING INTEGRATION: added env var and link to PF LIP reg form. */}
                <NavLink href={process.env.REACT_APP_HOST + data.pfRegURI}><img src={process.env.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.logout} className="mr-1" /> {data.menus.utility.register}</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
        <ModalRegister ref="modalRegister" onSubmit={this.onModalRegisterSubmit.bind(this)} />
        <ModalRegisterConfirm ref="modalRegisterConfirm" />
        <ModalLogin ref="modalLogin" />
        <ModalError ref="modalError" />
      </section>
    );
  }
}

export default NavbarMain;
