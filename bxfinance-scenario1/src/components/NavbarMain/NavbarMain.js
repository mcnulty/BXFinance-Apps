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
import IdleTimer from 'react-idle-timer'; /* PING INTEGRATION: */
import { IdleTimeOutModal } from '../ModalTimeout/IdleTimeOutModal'; /* PING INTEGRATION: */
import { useLocation } from 'react-router-dom' /* PING INTEGRATION: */
// Data
import data from './data.json';

class NavbarMain extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      loggedOut: true, /* PING INTEGRATION: */
      timeout: 1000 * 60 * 30, /* PING INTEGRATION: for react-idle-timer */
      showTimeoutModal: false, /* PING INTEGRATION: for react-idle-timer */
      isTimedOut: false /* PING INTEGRATION: for react-idle-timer */
    };
    /* BEGIN PING INTEGRATION: */
    this.PingAuthN = new PingAuthN();
    this.Session = new Session();
    this.IdleTimer = null;
    this.onAction = this._onAction.bind(this); /* PING INTEGRATION: for react-idle-timer */
    this.onActive = this._onActive.bind(this); /* PING INTEGRATION: for react-idle-timer */
    this.onIdle = this._onIdle.bind(this); /* PING INTEGRATION: for react-idle-timer */
    this.handleClose = this.handleClose.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    /* END PING INTEGRATION: */
    //TODO these are replacing the values from the data.json file beacuse we need dynamic params. Need better place for this now.
    this.pfRegURI = "/sp/startSSO.ping?SpSessionAuthnAdapterId=idprofiledefaultIdentityProfile&TargetResource=" + process.env.REACT_APP_HOST + process.env.PUBLIC_URL + "/?letme=in&PolicyAction=identity.registration";
    this.startSSOURI = "/idp/startSSO.ping?PartnerSpId=" + process.env.REACT_APP_HOST;
  }

  /* BEGIN PING INTEGRATION: for react-idle-timer */
  _onAction(e) {
    console.log('user did something', e);
    this.setState({ isTimedOut: false });
  }

  _onActive(e) {
    console.log('user is active', e);
    this.setState({ isTimedOut: false });
  }

  _onIdle(e) {
    console.log('user is idle', e);
    // const isTimedOut = this.state.isTimedOut;
    if (this.state.isTimedOut) {
      this.startSLO();
    } else {
      this.setState({
        showTimeoutModal: true,
        isTimedOut: true,
      });
      this.IdleTimer.reset();
    }

  }
  handleClose() {
    console.log("We are closing the timeout modal.");
    this.setState({ showTimeoutModal: false });
    window.location.href = this.startSSOURI; //TODO we Send back through PF to renew the session. This should be done via API.
  }
  handleLogout() {
    console.log("We are logging out from the timeout modal.");
    this.startSLO();
  }
  /* END PING INTEGRATION: */

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
    // Decided to just trigger an authn flow anytime we call this method.
    window.location.href = this.startSSOURI;
    /* The below logic had the risk of submitting username to an expired flowId if the user just sat there for a time. 
    if (!window.location.search) {
      window.location.href = this.startSSOURI;
    }
    else { 
      this.refs.modalLogin.toggle(); //This is left here just in case the user closes the modal and clicks "sign in" after we already have a flowId in the URL.
    } END PING INTEGRATION */
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  /* BEGIN PING INTEGRATION */
  startSLO() {
    console.info("NavbarMain.js", "Logging out via SLO.");

    //end the local app session
    this.Session.clearUserAppSession();
    //An advisor should just be taken back to P14E dock. A partner persona shouldn't get SLO'd.
    if (window.location.pathname === "/app/advisor/client") {
      window.location.href = "https://desktop.pingone.com/anywealthadvisor/";
    } else {
      //Banking customers get SLO'd.
      const url = "/sp/startSLO.ping?TargetResource=" + process.env.REACT_APP_HOST + process.env.PUBLIC_URL + "/";
      window.location.href = url;
    }

  }
  /* END PING INTEGRATION: */

  componentDidMount() {
    // BEGIN PING INTEGRATION
    const isLoggedOut = (this.Session.getAuthenticatedUserItem("subject") === null || this.Session.getAuthenticatedUserItem("subject") === 'undefined') ? true : false;
    this.setState({ loggedOut: isLoggedOut });

    // Check for a querystring; Will be fowId or REF in our current use cases.
    if (window.location.search) {
      let testNum = Math.random();
      const params = new URLSearchParams(window.location.search);

      // Coming back from authN API or Agentless adapter.
      if (params.get("flowId")) {
        this.PingAuthN.handleAuthNflow({ flowId: params.get("flowId") })
          .then(response => response.json())
          .then(jsonResult => {
            let success = this.Session.setAuthenticatedUserItem("flowResponse", JSON.stringify(jsonResult)); //TODO do we still need this?
            if (jsonResult.status == "IDENTIFIER_REQUIRED") {
              //pop the ID first modal. 
              this.refs.modalLogin.toggle();
            } else if (jsonResult.status == "FAILED") {
              this.refs.modalError.toggle("Authentication", jsonResult.userMessage);
            }
            else if (jsonResult.status == "USERNAME_PASSWORD_REQUIRED") {
              //TODO I dont think this needs to be here. we will never hit this case in this component. we always start with IDENTIFIER_REQUIRED so we've moved over to ModalLogin.js.
              //pop the username/password modal.
              this.refs.modalLoginPassword.toggle();
            }
          })
          .catch(error => console.error('HANDLESUBMIT ERROR', error));
      } // Coming back as authenticated user or SLO request from Agentless IK.
      else if (params.get("REF")) {
        const REF = params.get("REF");
        let targetApp = decodeURIComponent(params.get("TargetResource"));
        const adapter = (targetApp.includes("marketing") || targetApp.includes("advisor")) ? "AdvisorSPRefID" : "BXFSPRefID";

        this.PingAuthN.pickUpAPI(REF, adapter)
          .then(response => response.json())
          .then((jsonData) => {
            console.log("Pickup response", jsonData);
            if (jsonData.resumePath) { // Means we are in a SLO request. SSO doesnt use resumePath.
              this.Session.clearUserAppSession();
              /* 
              SP-init front-channel SLO with AIK won't work in a pure SPA.
              All sessions are properly revoked but the PF cookie changes after
              the REF pickup, so the resumePath returns an Expired page.
              Since all sessions are cleaned up, we are just handling the redirect
              back to the TargetResource ourselves which is /app/.
              */
              targetApp = process.env.REACT_APP_HOST + process.env.PUBLIC_URL + "/";
              //targetApp = jsonData.resumePath + "?source=" + adapter;
            }
            else if (jsonData.bxFinanceUserType == "AnyWealthAdvisor" || jsonData.bxFinanceUserType == "AnyMarketing") {
              this.Session.setAuthenticatedUserItem("email", jsonData.Email);
              this.Session.setAuthenticatedUserItem("subject", jsonData.subject);
              this.Session.setAuthenticatedUserItem("firstName", jsonData.FirstName);
              this.Session.setAuthenticatedUserItem("lastName", jsonData.LastName);
              this.Session.setAuthenticatedUserItem("uid", jsonData.uid);
              this.Session.setAuthenticatedUserItem("bxFinanceUserType", jsonData.bxFinanceUserType);
            } else if (jsonData.uid) { //banking customer
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
            // TODO can we do this SPA style with history.push? We would need to map targetApp to respective Router path.
            window.location.href = targetApp;
          })
          .catch(error => {
            console.error("Agentless Pickup Error:", error);
            this.refs.modalError.toggle("Session Pickup Error", error);
          });
      } //Just came home from registering as a new user, so auto trigger login flow for better UX.
      else if (params.get("letme")) {
        console.info("NavbarMain.js", "Returning from registration, so triggering log in process.");
        this.triggerModalLogin();
      }
    }
    // END PING INTEGRATION
    // Original T3 code in this lifecycle method removed.
  }

  render() {
    const { match } = this.props;
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
                    <NavLink href={this.pfRegURI}>{data.menus.utility.register_intro} <strong>{data.menus.utility.register}</strong></NavLink>
                  </NavItem>}
                {/* END PING INTEGRATION */}
              </Nav>
            </Collapse>
          </Container>
          {/* BEGIN PING INTEGRATION */}
          {!this.state.loggedOut &&
            <IdleTimer
              ref={ref => { this.IdleTimer = ref }}
              element={document}
              onActive={this.onActive}
              onIdle={this.onIdle}
              onAction={this.onAction}
              debounce={250}
              timeout={this.state.timeout} />}
          {!this.state.loggedOut &&
            <IdleTimeOutModal
              showModal={this.state.showTimeoutModal}
              handleClose={this.handleClose}
              handleLogout={this.handleLogout}
            />}
          {/* END PING INTEGRATION */}
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
                <NavLink href={this.pfRegURI}><img src={process.env.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.logout} className="mr-1" /> {data.menus.utility.register}</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
        <ModalRegister ref="modalRegister" onSubmit={this.onModalRegisterSubmit.bind(this)} />
        <ModalRegisterConfirm ref="modalRegisterConfirm" />
        <ModalLogin ref="modalLogin" />
        <ModalError ref="modalError" />{/* PING INTEGRATION */}
      </section>
    );
  }
}

export default NavbarMain;
