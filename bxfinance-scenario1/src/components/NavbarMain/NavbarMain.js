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

// Styles
import './NavbarMain.scss';

// Data
import data from './data.json';

class NavbarMain extends React.Component {

  constructor() {
    super();
    this.state = {
      isOpen: false,
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
      window.location.href = process.env.REACT_APP_HOST + data.startSSOURI /* TODO this ideally should be switched to a fetch(). No redirects for true SPA. TTM syndrome */
    }/* END PING INTEGRATION */
    //We're not triggering the login modal unless we come back with a flowId.
    //this.refs.modalLogin.toggle();
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  /* PING INTEGRATION: SLO support when signing out */
  logEmOut() {
    const success = this.Session.killAuthenticatedUser(); //Kill the local app session.
    //TODO This needs to be put back once SLO is debugged. for now just sending to the home page
    /* let rootDiv = document.getElementById("root"); //Grab the root div for the app
    let logoutForm = document.createElement('form'); // Create a new form element
    logoutForm.setAttribute("action", "/sp/startSLO.ping"); // Add the action attribute we want to POST to
    logoutForm.setAttribute("id", "logoutForm"); // Add an Id Attribute
    logoutForm.setAttribute("method", "post"); // Add the method attribute
    rootDiv.appendChild(logoutForm); //Add the form to the DOM
    document.forms["logoutForm"].submit(); //Submit the form, obviously. */
    window.location.href = process.env.REACT_APP_HOST + "/app"; //TODO remove this once SLO is fixed.
  }

  componentDidMount() {
    // BEGIN PING INTEGRATION
    // Check for and create a query string params object
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      //const authID = params.get("flowId") ? params.get("flowId") : params.get("REF");

      // Coming back from authN API so grab the flowId.
      if (params.get("flowId")) {
        // call authn api to get status. 
        this.PingAuthN.authnAPI("GET", params.get("flowId"))
          .then(response => response.json())
          .then(jsonResult => {
            console.log("TEST", "Got flowId");
            let success = this.Session.setAuthenticatedUserItem("flowResponse", JSON.stringify(jsonResult));
            if (jsonResult.status == "IDENTIFIER_REQUIRED") {
              console.log("STATUS:", jsonResult.status)
              //pop the modal. Defaults it ID first.
              this.refs.modalLogin.toggle();
            }
            else if (jsonResult.status == "ACCOUNT_RECOVERY_USERNAME_REQUIRED") {
              console.log("STATUS:", jsonResult.status)
              this.refs.modalLogin.toggle('4');
            }
          })
          .catch(error => console.error('HANDLESUBMIT ERROR', error));
        //if status is identifier_required
        //this.refs.modalLogin.toggle();

      } // Coming back as authenticated user from Agentless IK.
      else if (params.get("REF")) {
        console.log("TEST", "Got REF");
        const REF = params.get("REF");
        const targetApp = decodeURIComponent(params.get("TargetResource"));
        const adapter = targetApp.includes("/banking") ? "BXFSPRefID" : "AdvisorSPRefID";

        this.PingAuthN.pickUpAPI(REF, adapter)
          .then(response => response.json())
          .then((jsonData) => {
            console.log("jsonData", JSON.stringify(jsonData));
            if (jsonData.resumePath) { // Means we are in a SLO request. AIK doesnt use resumePath.
              console.log("TEST", "In SLO");
              window.location.href = process.env.REACT_APP_HOST + jsonData.resumePath;
            }
            if (targetApp.includes("/advisor")) {
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
          })
          .catch(error => console.error("Pickup Error:", error));

        // Send them to the target app
        // TODO can we do this SPA style with history.push?
        window.location.href = targetApp;
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
                {!(this.Session.getAuthenticatedUserItem("subject")) &&
                  <NavItem className="login">
                    <NavLink href="#" onClick={this.triggerModalLogin.bind(this)}><img src={process.env.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.login} className="mr-1" /> {data.menus.utility.login}</NavLink>
                  </NavItem>}
                {(this.Session.getAuthenticatedUserItem("subject")) &&
                  <NavItem className="logout">
                    <Link to="/" onClick={this.logEmOut.bind(this)} className="nav-link"><img src={process.env.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.logout} className="mr-1" /> {data.menus.utility.logout}</Link>
                  </NavItem>}
                {!(this.Session.getAuthenticatedUserItem("subject")) &&
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
      </section>
    );
  }
}

export default NavbarMain;
