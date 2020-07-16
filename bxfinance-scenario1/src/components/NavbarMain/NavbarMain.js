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
      window.location.href = process.env.REACT_APP_HOST + data.startSSOURI
    }/* END PING INTEGRATION */
    //We're not triggering the login modal unless we come back with a flowId.
    this.refs.modalLogin.toggle();
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
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
        const REF = params.get("REF");
        const targetApp = decodeURIComponent(params.get("TargetResource"));

        this.PingAuthN.pickUpAPI(REF)
          .then(response => response.json())
          .then((jsonData) => {
            this.Session.setAuthenticatedUserItem("email", jsonData.Email);
            this.Session.setAuthenticatedUserItem("subject", jsonData.subject);
            this.Session.setAuthenticatedUserItem("firstName", jsonData.FirstName);
            this.Session.setAuthenticatedUserItem("lastName", jsonData.LastName);
            this.Session.setAuthenticatedUserItem("uid", jsonData.uid);
            this.Session.setAuthenticatedUserItem("pfSessionId", jsonData.sessionid);

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
                <NavItem className="login">
                  <NavLink href="#" onClick={this.triggerModalLogin.bind(this)}><img src={process.env.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.login} className="mr-1" /> {data.menus.utility.login}</NavLink>
                </NavItem>
                <NavItem className="logout d-none">
                  <Link to="/" onClick={() => this.Session.killAuthenticatedUser()} className="nav-link"><img src={process.env.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.logout} className="mr-1" /> {data.menus.utility.logout}</Link>
                </NavItem>
                <NavItem className="register">
                  {/* PING INTEGRATION: added env var and link to PF LIP reg form. */}
                  <NavLink href={process.env.REACT_APP_HOST + data.pfRegURI}>{data.menus.utility.register_intro} <strong>{data.menus.utility.register}</strong></NavLink>
                </NavItem>
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
