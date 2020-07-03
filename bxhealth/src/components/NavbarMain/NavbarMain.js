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
import classNames from "classnames";

// Components
import ModalRegister from '../ModalRegister';
import ModalRegisterConfirm from '../ModalRegisterConfirm';
import ModalRegisterCaregiver from '../ModalRegisterCaregiver';
import ModalRegisterCaregiverConfirm from '../ModalRegisterCaregiverConfirm';
import ModalLogin from '../ModalLogin';
// import ModalLoginCaregiver from '../ModalLoginCaregiver';

// Styles
import './NavbarMain.scss';

// Data
import data from './data.json';

class NavbarMain extends React.Component {
  constructor() {
    super();
    this.state = {
      isOpen: false
    };
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
  triggerModalRegisterCaregiver() {
    this.refs.modalRegisterCaregiver.toggle();
  }
  onModalRegisterCaregiverSubmit() {
    this.refs.modalRegisterCaregiver.toggle();
    this.refs.modalRegisterCaregiverConfirm.toggle();
  }
  triggerModalRegisterCaregiverConfirm() {
    this.refs.modalRegisterCaregiverConfirm.toggle();
  }
  triggerModalLogin() {
    this.refs.modalLogin.toggle();
  }
  triggerCaregiverModalLogin() {
    this.refs.modalLoginCaregiver.toggle();
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  componentDidMount () {
    if ( window.location.search === "?register=true") {
      // this.refs.modalRegisterConfirm.toggle();
    }
    if ( window.location.search === "?register_caregiver=true") {
      // this.triggerCaregiverModalLogin();
    }
  }
  render() {
    return (
      <section className={classNames("navbar-main", { "white": this.props.white })}>
        {/* DESKTOP NAV */}
        <Navbar expand="md" className="navbar-desktop">
          <Container>
            { !this.props.white && 
              <Link to="/" className="navbar-brand"><img src={process.env.PUBLIC_URL + "/images/logo.svg"} alt={data.brand} /></Link>
            }
            { this.props.white && 
              <Link to="/" className="navbar-brand"><img src={process.env.PUBLIC_URL + "/images/logo-white.svg"} alt={data.brand} /></Link>
            }
            <NavbarToggler onClick={this.toggle.bind(this)} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="justify-content-end ml-auto navbar-nav-utility" navbar>
                <NavItem>
                  { !this.props.white &&
                    <NavLink><img src={process.env.PUBLIC_URL + "/images/icons/search.svg"} alt={data.menus.utility.search} /></NavLink>
                  }
                  { this.props.white &&
                    <NavLink><img src={process.env.PUBLIC_URL + "/images/icons/search-white.svg"} alt={data.menus.utility.search} /></NavLink>
                  }
                </NavItem>
                <NavItem>
                  { !this.props.white &&
                    <NavLink><img src={process.env.PUBLIC_URL + "/images/icons/map-marker.svg"} alt={data.menus.utility.locations} /></NavLink>
                  }
                  { this.props.white &&
                    <NavLink><img src={process.env.PUBLIC_URL + "/images/icons/map-marker-white.svg"} alt={data.menus.utility.locations} /></NavLink>
                  }
                </NavItem>
                <NavItem>
                  { !this.props.white &&
                    <NavLink><img src={process.env.PUBLIC_URL + "/images/icons/support.svg"} alt={data.menus.utility.support} /></NavLink>
                  }
                  { this.props.white &&
                    <NavLink><img src={process.env.PUBLIC_URL + "/images/icons/support-white.svg"} alt={data.menus.utility.support} /></NavLink>
                  }
                </NavItem>
                <NavItem className="login">
                  <NavLink href="#" onClick={this.triggerModalLogin.bind(this)}>
                { !this.props.white &&
                      <img src={process.env.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.logout} className="mr-1" />
                    }
                    { this.props.white &&
                      <img src={process.env.PUBLIC_URL + "/images/icons/user-white.svg"} alt={data.menus.utility.logout} className="mr-1" />
                    }
                    {data.menus.utility.login}
                  </NavLink>
                </NavItem>
                <NavItem className="login-caregiver">
                  <NavLink href="#" onClick={this.triggerCaregiverModalLogin.bind(this)}>
                    { !this.props.white &&
                      <img src={process.env.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.logout} className="mr-1" />
                    }
                    { this.props.white &&
                      <img src={process.env.PUBLIC_URL + "/images/icons/user-white.svg"} alt={data.menus.utility.logout} className="mr-1" />
                    }
                    {data.menus.utility.login_caregiver}
                  </NavLink>
                </NavItem>
                <NavItem className="logout d-none">
                  <Link to="/" className="nav-link">
                    { !this.props.white &&
                      <img src={process.env.PUBLIC_URL + "/images/icons/user.svg"} alt={data.menus.utility.logout} className="mr-1" />
                    }
                    { this.props.white &&
                      <img src={process.env.PUBLIC_URL + "/images/icons/user-white.svg"} alt={data.menus.utility.logout} className="mr-1" />
                    }
                    {data.menus.utility.logout}
                  </Link>
                </NavItem>
                <NavItem className="register">
                  {data.menus.utility.register_intro} 
                  <NavLink href="#" onClick={this.triggerModalRegister.bind(this)}>{data.menus.utility.register}</NavLink>
                  <NavLink href="#" onClick={this.triggerModalRegisterCaregiver.bind(this)} className="register-caregiver">{data.menus.utility.register_caregiver}</NavLink>
                </NavItem>
              </Nav>
            </Collapse>
          </Container>
        </Navbar>
        <Navbar expand="md" className="navbar-desktop">
          <Container>
            <Nav className="mr-auto navbar-nav-main" navbar>
              { this.props && this.props.data && this.props.data.menus && this.props.data.menus.primary ? (
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
            <Link to="/" className="navbar-brand"><img src={process.env.PUBLIC_URL + "/images/logo-white.svg"} alt={data.brand} /></Link>
          </div>
          <div className="mobilenav-login">
            <NavLink href="#" className="login" onClick={this.triggerModalLogin.bind(this)}>Sign In</NavLink>
            <Link to="/" className="nav-link logout d-none">Sign Out</Link>
          </div>
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="navbar-nav-main navbar-light bg-light" navbar>
              { this.props && this.props.data && this.props.data.menus && this.props.data.menus.primary ? (
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
            <Nav className="navbar-nav-utility" navbar >
              <NavItem>
                <NavLink><img src={process.env.PUBLIC_URL + "/images/icons/search-white.svg"} alt={data.menus.utility.search} className="mr-1" /> {data.menus.utility.search}</NavLink>
              </NavItem>
              <NavItem>
                <NavLink><img src={process.env.PUBLIC_URL + "/images/icons/map-marker-white.svg"} alt={data.menus.utility.locations} className="mr-1" /> {data.menus.utility.locations}</NavLink>
              </NavItem>
              <NavItem>
                <NavLink><img src={process.env.PUBLIC_URL + "/images/icons/support-white.svg"} alt={data.menus.utility.support} className="mr-1" /> {data.menus.utility.support}</NavLink>
              </NavItem>
              <NavItem className="login">
                <NavLink href="#" onClick={this.triggerModalLogin.bind(this)}><img src={process.env.PUBLIC_URL + "/images/icons/user-white.svg"} alt={data.menus.utility.login} className="mr-1" /> {data.menus.utility.login}</NavLink>
              </NavItem>
              <NavItem className="login">
                <NavLink href="#" onClick={this.triggerModalLogin.bind(this)}><img src={process.env.PUBLIC_URL + "/images/icons/user-white.svg"} alt={data.menus.utility.login_caregiver} className="mr-1" /> {data.menus.utility.login_caregiver}</NavLink>
              </NavItem>
              <NavItem className="logout d-none">
                <Link to="/" className="nav-link"><img src={process.env.PUBLIC_URL + "/images/icons/user-white.svg"} alt={data.menus.utility.logout} className="mr-1" /> {data.menus.utility.logout}</Link>
              </NavItem>
              <NavItem className="register">
                {data.menus.utility.register_intro} 
                <NavLink href="#" onClick={this.triggerModalRegister.bind(this)}>{data.menus.utility.register}</NavLink>
                <NavLink href="#" onClick={this.triggerModalRegisterCaregiver.bind(this)} className="register-caregiver">{data.menus.utility.register_caregiver}</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
        <ModalRegister ref="modalRegister" onSubmit={this.onModalRegisterSubmit.bind(this)} />
        <ModalRegisterConfirm ref="modalRegisterConfirm" />
        <ModalRegisterCaregiver ref="modalRegisterCaregiver" onSubmit={this.onModalRegisterCaregiverSubmit.bind(this)} />
        <ModalRegisterCaregiverConfirm ref="modalRegisterCaregiverConfirm" />
        <ModalLogin caregiver="false" ref="modalLogin" />
        <ModalLogin caregiver="true" ref="modalLoginCaregiver" />
      </section>
    );
  }
}

export default NavbarMain;
