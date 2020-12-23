/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

// Packages
import React from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Input,
  CustomInput,
  TabContent, TabPane
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

// Styles
import "./ModalLogin.scss";

// Data
import data from './data.json';

import PingAuthN from '../Integration/PingAuthN'; /* PING INTEGRATION */
import Session from '../Utils/Session'; /* PING INTEGRATION: */
import JSONSearch from '../Utils/JSONSearch'; /* PING INTEGRATION: */
import ModalLoginPassword from '../ModalLoginPassword/ModalLoginPassword'; /* PING INTEGRATION: */

class ModalLogin extends React.Component {
  constructor() {
    super();

    this.state = {
      isOpen: false,
      activeTab: '1',
      loginMethodUnset: true,
      loginMethodFormGroupClass: '',
      deviceRef: "",          /* PING INTEGRATION: */
      loginMethod: "",        /* PING INTEGRATION: */
      deviceList: [],         /* PING INTEGRATION: */
      otp: "",                /* PING INTEGRATION: */
      userName: '',           /* PING INTEGRATION */
      email: ''               /* PING INTEGRATION */
    };
    this.PingAuthN = new PingAuthN();
    this.Session = new Session();
    this.JSONSearch = new JSONSearch();
  }

  /* BEGIN PING INTEGRATION: */
  // function as class property. // Note: Per reactjs.org this syntax is experimental and not standardized yet. (Stage 3 proposal).
  //Used to update device selection tabPane based on user's list of paired devices.
  deviceExists = (type) => {
    let deviceFound = false;
    const deviceListFlat = this.state.deviceList.flat();

    if (deviceListFlat.indexOf(type) > -1) {
      deviceFound = true;
    }

    return deviceFound;
  }
  /* END PING INTEGRATION: */

  onClosed() {
    this.setState({
      activeTab: '1',
      loginMethodUnset: true,
      loginMethod: "",        /* PING INTEGRATION: */
      deviceList: [],         /* PING INTEGRATION: */
      nextTab: "",            /* PING INTEGRATION: */
      loginMethodFormGroupClass: '' // Doubt we need this. See comment below on same var.
    });
  }
  toggle(tab) {
    this.setState({
      isOpen: !this.state.isOpen
    });
    /* BEGIN PING INTEGRATION: calling from NavbarMain upon return.
    Can't call toggleTab or we'll end up in endless loop. */
    //TODO better explanation needs to be here. WTF?
    if (tab == '4') {
      this.setState({
        activeTab: tab
      });
    }
    /* END PING INTEGRATION: */
  }
  toggleTab(tab) {
    console.log("toggleTab tab", tab);
    this.setState({
      activeTab: tab
    });
  }

  setLoginMethod(event) {
    /* BEGIN PING INTEGRATION: */
    const delimiterPos = event.target.id.lastIndexOf("_");
    const deviceSelection = event.target.id.substring(delimiterPos + 1);
    const deviceList = this.state.deviceList;
    const deviceRefIndex = deviceList.findIndex((element, index) => { 
      return element.includes(deviceSelection); 
    });
    console.log("deviceRefIndex", deviceRefIndex);

    this.setState(previousState => {
      return {
        deviceRef: previousState.deviceList[deviceRefIndex][1],
        loginMethodUnset: false,
        loginMethod: deviceSelection, /* TODO PING INTEGRATION:  don't think we need this anymore. Could be kept around for validation against deviceRef. */
        loginMethodFormGroupClass: 'form-group-light' //Doubt we need this. Was probably T3 placeholder since they didn't know how we would Implement Ping integration.
      }
    });
    console.log("deviceRef", this.state.deviceRef);
    console.log("nextTab", this.state.nextTab);
    
    /* END PING INTEGRATION: */
  }

  // BEGIN PING INTEGRATIONS
  handleIDChange(event) {
    // grabbing whatever the user is typing in the ID first form as they type, and
    // saving it to state. (Controlled input).
    this.setState({ userName: event.target.value });
  }

  handleOTPChange(event) {
    // grabbing whatever the user is typing in the ID first form as they type, and
    // saving it to state. (Controlled input).
    this.setState({ otp: event.target.value });
  }

  handleEmailChange(event) {
    //This is not used since PF is handling SSPR to demo Velocity templates.
    // Keeping it here in case Velocity templates get nixed from demos.
    // Grabbing whatever the user is typing in the email form as they type, and
    // saving it to state.
    this.setState({ email: event.target.value });
  }

  // Handler for various TabPane UIs.
  // TODO T3 used numeric IDs for the TabPanes in render(). With our handler, 
  // it would be easier to visually map in the code if they had text IDs related to the UI of the TabPane. I.e. "IDF", "Devices", etc.
  handleSubmit(tab) {
    console.log("handeSubmit tab", tab);
    //Need to parse this as JSON because the browser's sessionStorage object only stores strings.
    const cachedFlowResponse = JSON.parse(this.Session.getAuthenticatedUserItem("flowResponse"));
    console.log("cachedFlowResponse", cachedFlowResponse);

    if (window.location.search) {/* TODO what do we do if they submit with no querystring? Is that even possible? If not, do we even need the test for window.location.search??? */
      let data = "";

      switch (tab) {
        case "1":
          // IDF form. This is the default state. Will probably never called from here.
          this.toggleTab("1");
          break;
        case "2":
          //Password modal or P1MFA. If password, we toggle to a new UI.
          data = this.state.userName;
          this.PingAuthN.handleAuthNflow({ flowResponse: cachedFlowResponse, body: data })
            .then(response => response.json())
            .then(jsonResult => {
              let success = this.Session.setAuthenticatedUserItem("flowResponse", JSON.stringify(jsonResult));
              console.log("jsonResult test", JSON.stringify(jsonResult));
              if (jsonResult.status === "USERNAME_PASSWORD_REQUIRED") {
                //Close ModalLogin. We need to get password.
                this.toggle();
                //pop the username/password modal.
                this.refs.modalLoginPassword.toggle(this.state.userName);
              } else if (jsonResult.status === "AUTHENTICATION_REQUIRED") {
                this.PingAuthN.handleAuthNflow({ flowResponse: jsonResult, body: "" })
                  .then(response => response.json())
                  .then(jsonResponse => {
                    let success = this.Session.setAuthenticatedUserItem("flowResponse", JSON.stringify(jsonResponse));
                    if (jsonResponse.status === "DEVICE_SELECTION_REQUIRED") {
                      let devices = jsonResponse.devices.map((device) => {
                        return [device.type, device.id];
                      });
                      console.log("devices", devices.toString());
                      this.setState({ deviceList: devices });
                      this.toggleTab(tab);
                      console.log("jsonResponse", JSON.stringify(jsonResponse));
                      console.log("state", JSON.stringify(this.state));
                    } // TODO do we need to handle something other than device selection???
                  });
              }
            })
            .catch(e => {
              console.error("handleAuthNflow exception:", e);
            });
          break;
        case "3":
          data = this.state.deviceRef;
          this.PingAuthN.handleAuthNflow({ flowResponse: cachedFlowResponse, body: data })
            .then(response => response.json())
            .then(jsonResult => {
              let success = this.Session.setAuthenticatedUserItem("flowResponse", JSON.stringify(jsonResult)); //TODO is there a better solution for this?
              console.log("jsonResult test", JSON.stringify(jsonResult));
              if (jsonResult.status === "OTP_REQUIRED") {
                console.log("after submitting otp device", JSON.stringify(jsonResult));
                this.toggleTab(tab);
              } else if (jsonResult.status === "PUSH_CONFIRMATION_WAITING") {
                console.log("after submitting mobile device", JSON.stringify(jsonResult));
                this.handleSubmit("7");
              }
            })
            .catch(e => {
              console.error("handleAuthNflow exception:", e);
            });
          break;
        case "4":
          //Tab 4 is forgot username, so send them to PF endpoint so we can demo Velocity templates.
          window.location.assign(data.pfAcctRecoveryURI);
          break;
        case "5":
          // We should never hit this case since PF is handling SSPR.
          // Need implementation if we move SSPR to authN API.
          this.toggleTab(tab);
          break;
        case "6":
          // Tab 6 is newly created for OTP submitted/success.
          data = this.state.otp;
          this.toggleTab(tab);
          this.PingAuthN.handleAuthNflow({ flowResponse: cachedFlowResponse, body: data })
            .then(response => response.json())
            .then(jsonResponse => {
              let success = this.Session.setAuthenticatedUserItem("flowResponse", JSON.stringify(jsonResponse));
              console.log("jsonResponse", JSON.stringify(jsonResponse));
              if (jsonResponse.status === "MFA_COMPLETED") {
                this.PingAuthN.handleAuthNflow({ flowResponse: jsonResponse, body: "" })
                  .then(response => response.json())
                  .then(jsonResult => {
                    let success = this.Session.setAuthenticatedUserItem("flowResponse", JSON.stringify(jsonResult)); //TODO is there a better solution for this?
                    console.log("jsonResult test", JSON.stringify(jsonResult));
                    if (jsonResult.status === "RESUME") {
                      this.PingAuthN.handleAuthNflow({ flowResponse: jsonResult })
                    }
                  });
              }
            })
            .catch(e => {
              console.error("handleAuthNflow exception:", e);
            });
          break;
        case "7":
          // Tab 7 is newly created for mobile push sent/success.
          this.toggleTab(tab);
          const polling = () => {
            this.PingAuthN.handleAuthNflow({ flowResponse: cachedFlowResponse })
            .then(response => response.json())
            .then(jsonResponse => {
              let success = this.Session.setAuthenticatedUserItem("flowResponse", JSON.stringify(jsonResponse));
              console.log("jsonResponse", JSON.stringify(jsonResponse));
              if (jsonResponse.status === "MFA_COMPLETED") {
                this.PingAuthN.handleAuthNflow({ flowResponse: jsonResponse, body: "" })
                  .then(response => response.json())
                  .then(jsonResult => {
                    let success = this.Session.setAuthenticatedUserItem("flowResponse", JSON.stringify(jsonResult)); //TODO is there a better solution for this?
                    console.log("jsonResult test", JSON.stringify(jsonResult));
                    if (jsonResult.status === "RESUME") {
                      window.clearInterval(pollingID);
                      this.PingAuthN.handleAuthNflow({ flowResponse: jsonResult })
                    }
                  });
              }
            })
            .catch(e => {
              console.error("handleAuthNflow exception:", e);
            });
          }
          let pollingID = window.setInterval(polling, 3000);
          break; //This is breaking from the case statement. Not to be confused with the loop break.
      }

      /* if (jsonResult.status === "RESUME") {
        let success = this.Session.removeAuthenticatedUserItem("flowResponse");
        // Let handleAuthNflow handle it.
        this.PingAuthN.handleAuthNflow({ flowResponse: jsonResult });
      }  *///TODO do we need an else{} to catch other status? Is that possible in our demo use cases?
    }
  }

  componentDidMount() {
    const rememberMe = this.Session.getCookie("rememberMe");
    if (rememberMe.length)
      this.setState({ userName: rememberMe });
  }
  // END PING INTEGRATIONS

  render() {
    const closeBtn = <div />;
    return (
      <div>
        <Modal isOpen={this.state.isOpen} toggle={this.toggle.bind(this)} onClosed={this.onClosed.bind(this)} className="modal-login">
          <ModalHeader toggle={this.toggle.bind(this)} close={closeBtn}><img src={process.env.PUBLIC_URL + "/images/logo.svg"} alt="logo" /></ModalHeader>
          <ModalBody>
            <form>
              <TabContent activeTab={this.state.activeTab}>
                <TabPane tabId="1">{/* Identifier first */}
                  <h4>{data.titles.welcome}</h4>
                  <FormGroup className="form-group-light">
                    <Label for="username">{data.form.fields.username.label}</Label>
                    <Input onChange={this.handleIDChange.bind(this)} type="text" name="username" id="username" placeholder={data.form.fields.username.placeholder} value={this.state.userName} /> {/* PING INTEGRATION added onChange. */}
                  </FormGroup>
                  <FormGroup className="form-group-light">
                    {/* <CustomInput type="checkbox" id="remember" label={data.form.fields.remember.label} /> */}
                  </FormGroup>
                  <div className="mb-3">
                    <Button type="button" color="primary" onClick={() => { this.handleSubmit('2'); }}>{data.form.buttons.next}</Button> {/* PING INTEGRATION see onClick function. */}
                  </div>
                  <div>
                    <Button type="button" color="link" size="sm" className="text-info pl-0" onClick={() => { this.handleSubmit('4'); }}>{data.form.buttons.reset}</Button> {/* PING INTEGRATION: see onclick function. */}
                  </div>
                </TabPane>
                <TabPane tabId="2">{/* Device/login selection. */}
                  <h4>{data.titles.login_method}</h4>
                  <FormGroup className={this.state.loginMethodFormGroupClass}>
                    <div>{/* BEGIN PING INTEGRATION */}
                      {this.deviceExists("iPhone") &&
                        <CustomInput type="radio" id="login_method_iPhone" name="login_method" label={data.form.fields.login_method.options.faceid} className="form-check-inline" onClick={this.setLoginMethod.bind(this)} />}
                      {/* NOT SUPPORTING THIS FOR DEMOS {this.deviceExists("TOTP") &&
                        <CustomInput type="radio" id="login_method_TOTP" name="login_method" label={data.form.fields.login_method.options.totp} className="form-check-inline" onClick={this.setLoginMethod.bind(this)} />} */}
                      {this.deviceExists("SMS") &&
                        <CustomInput type="radio" id="login_method_SMS" name="login_method" label={data.form.fields.login_method.options.text} className="form-check-inline" onClick={this.setLoginMethod.bind(this)} />}
                      {this.deviceExists("Email") &&
                        <CustomInput type="radio" id="login_method_Email" name="login_method" label={data.form.fields.login_method.options.email} className="form-check-inline" onClick={this.setLoginMethod.bind(this)} />}
                    </div>{/* END PING INTEGRATION */}
                  </FormGroup>
                  <div className="mb-4 text-center">
                    <Button type="button" color="primary" disabled={this.state.loginMethodUnset} onClick={() => { this.handleSubmit("3"); }}>{data.form.buttons.login}</Button>
                  </div>
                  <div className="text-center">
                    <Button type="button" color="link" size="sm" className="text-info" onClick={this.toggle.bind(this)}>{data.form.buttons.help}</Button>
                  </div>
                </TabPane>
                <TabPane tabId="3">{/* MFA sent, check phone msg. */}
                  <div className="mobile-loading" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/login-device-outline.jpg)` }}>
                    <div className="spinner">
                      <FontAwesomeIcon icon={faCircleNotch} size="3x" className="fa-spin" />
                    </div>
                    <p>{data.mobile.loading}</p>
                  </div>
                  {/* BEGIN PING INTEGRATION: adding missing OTP entry text field. */}
                  {this.state.deviceSelection !== "iPhone" && 
                  <FormGroup className="form-group-light">
                    <Label for="otp">{data.form.fields.otp.label}</Label>
                    <Input onChange={this.handleOTPChange.bind(this)} type="text" name="otp" id="otp" placeholder={data.form.fields.otp.placeholder} value={this.state.otp} />
                    </FormGroup>}
                  {this.state.deviceSelection !== "iPhone" &&
                  <div className="mb-3">
                    <Button type="button" color="primary" onClick={() => { this.handleSubmit('6'); }}>{data.form.buttons.next}</Button> {/* PING INTEGRATION see onClick function. */}
                  </div>}
                  {/* END PING INTEGRATION */}
                  <div className="mt-4 text-center">
                    <Button type="button" color="link" size="sm" className="text-info" onClick={this.toggle.bind(this)}>{data.form.buttons.help}</Button>
                  </div>
                </TabPane>
                <TabPane tabId="4">{/* Recover userName. This is now handled by PF to demo Velocity templates. */}
                  <h4>{data.form.buttons.recover_username}</h4>
                  <FormGroup className="form-group-light">
                    <Label for="email">{data.form.fields.email.label}</Label>
                    <Input onChange={this.handleEmailChange.bind(this)} type="text" name="email" id="email" placeholder={data.form.fields.email.placeholder} />
                  </FormGroup>
                  <div className="mb-3">
                    <Button type="button" color="primary" onClick={() => { this.handleSubmit('5'); }}>{data.form.buttons.recover_username}</Button> {/* PING INTEGRATION: See onClick function. */}
                  </div>
                </TabPane>
                <TabPane tabId="5">{/* Not using TabPane 5. SSPR handled by PF. May use in the future. */}
                  <h4>{data.titles.recover_username_success}</h4>
                  <div className="mb-3 text-center">
                    <Button type="button" color="primary" onClick={() => { this.handleSubmit('1'); }}>{data.form.buttons.login}</Button>
                  </div>
                </TabPane>
                {/* BEGIN PING INTEGRATION: added TabPanes for OTP submission and mobile push success. */}
                <TabPane tabId="6">{/* OTP sent. */}
                  <h4>{data.titles.otp_success}</h4>
                  <div className="mt-4 text-center">
                    <Button type="button" color="link" size="sm" className="text-info" onClick={this.toggle.bind(this)}>{data.form.buttons.help}</Button>
                  </div>
                </TabPane>
                <TabPane tabId="7">{/* Mobile app push sent. */}
                  <h4>{data.titles.mobile_success}</h4>
                  <div className="mt-4 text-center">
                    <Button type="button" color="link" size="sm" className="text-info" onClick={this.toggle.bind(this)}>{data.form.buttons.help}</Button>
                  </div>
                </TabPane>
                {/* END PING INTEGRATION */}
              </TabContent>
            </form>
          </ModalBody>
        </Modal>
        <ModalLoginPassword ref="modalLoginPassword" />
      </div>
    );
  }
}

export default ModalLogin;
