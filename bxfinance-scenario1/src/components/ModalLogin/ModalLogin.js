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

// Components
import FormPassword from '../../components/FormPassword';

// Styles
import "./ModalLogin.scss";

// Data
import data from './data.json';

import PingAuthN from '../Utils/PingAuthN'; /* PING INTEGRATION */
import Session from '../Utils/Session'; /* PING INTEGRATION: */

class ModalLogin extends React.Component {
  constructor() {
    super();

    this.state = {
      isOpen: false,
      activeTab: '1',
      loginMethodUnset: true,
      loginMethodFormGroupClass: '',
      userName: '', /* PING INTEGRATION */
      email: '' /* PING INTEGRATION */
    };
    this.PingAuthN = new PingAuthN();
    this.Session = new Session();
  }
  onClosed() {
    this.setState({
      activeTab: '1',
      loginMethodUnset: true,
      loginMethodFormGroupClass: ''
    });
  }
  toggle(tab) {
    this.setState({
      isOpen: !this.state.isOpen
    });
    /* BEGIN PING INTEGRATION: calling from NavbarMain upon return.
    Can't call toggleTab or we'll end up in endless loop. */
    if (tab == '4') {
      this.setState({
        activeTab: tab
      });
    }
    /* END PING INTEGRATION: */
  }
  toggleTab(tab) {
    /* BEGIN PING INTEGRATION: tab 2 modal is device selection 
    which we don't use so we don't change state. Only call our handler. 
    Tab 4 is forgot username, so send them to PF endpoint. */
    if (tab == '2' || tab == '5') {
      this.handleSubmit(tab);
    } else if (tab == '4') {
      window.location.href = process.env.REACT_APP_HOST + data.pfAcctRecoveryURI; /* TODO When SSPR with AuthN API is fixed, this ideally should be switched to a fetch(). No redirects for true SPA. TTM syndrome */
    } else {
      /* END PING INTEGRATION */
      this.setState({
        activeTab: tab
      });
    }
  }
  setLoginMethod() {
    this.setState({
      loginMethodUnset: false,
      loginMethodFormGroupClass: 'form-group-light'
    });
  }
  // BEGIN PING INTEGRATIONS
  handleIDChange(event) {
    // grabbing whatever the user is typing in the ID first form as they type, and
    // saving it to state. (Controlled input).
    this.setState({ userName: event.target.value });
  }
  handleEmailChange(event) {
    // grabbing whatever the user is typing in the email form as they type, and
    // saving it to state. (Controlled input).
    this.setState({ email: event.target.value });
  }

  // Handler for "Next" and "Recover Username" buttons.
  handleSubmit(tab) {
    let identifier = '';
    let flowResponse = {};
    console.log("handlesubmittab:", tab);
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const flowId = params.get('flowId'); /* TODO will we ever have something other than a flowId to handle? */
      
      console.log("handlesubmit flowid", flowId);
      
      identifier = tab == '2' ? this.state.userName : this.state.email; //TODO if not 2 we assume 5. Will there ever be other tab IDs.
      flowResponse = JSON.parse(this.Session.getAuthenticatedUserItem("flowResponse"));
      this.PingAuthN.handleFlowStatus(flowResponse, identifier);

      /* this.PingAuthN.authnAPI("GET", flowId)
        .then(response => response.json())
        .then(jsonResult => this.PingAuthN.handleFlowStatus(jsonResult, identifier))
        .catch(error => console.error('HANDLESUBMIT ERROR', error)); */
    } /* TODO what do we do if they submit with no querystring? Is that even possible?*/
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
                    <Input onChange={this.handleIDChange.bind(this)} type="text" name="username" id="username" placeholder={data.form.fields.username.placeholder} /> {/* PING INTEGRATION added onChange. */}
                  </FormGroup>
                  <FormPassword name="password" label={data.form.fields.password.label} placeholder={data.form.fields.password.placeholder} />
                  <FormGroup className="form-group-light">
                    <CustomInput type="checkbox" id="remember" label={data.form.fields.remember.label} />
                  </FormGroup>
                  <div className="mb-3">
                    <Button type="button" color="primary" onClick={() => { this.toggleTab('2'); }}>{data.form.buttons.next}</Button> {/* PING INTEGRATION see onClick function. */}
                  </div>
                  <div>
                    <Button type="button" color="link" size="sm" className="text-info pl-0" onClick={() => { this.toggleTab('4'); }}>{data.form.buttons.reset}</Button> {/* PING INTEGRATION: see onclick function. */}
                  </div>
                  <div>
                    <Button type="button" color="link" size="sm" className="text-info pl-0" onClick={() => { this.toggleTab('5'); }}>{data.form.buttons.reset_password}</Button>
                  </div>
                </TabPane>
                <TabPane tabId="2">{/* Device/login selection. We dont use tab 2. This is handled by PF. */}
                  <h4>{data.titles.login_method}</h4>
                  <FormGroup className={this.state.loginMethodFormGroupClass}>
                    <div>
                      <CustomInput type="radio" id="login_method_email" name="login_method" label={data.form.fields.login_method.options.email} className="form-check-inline" onClick={this.setLoginMethod.bind(this)} />
                      <CustomInput type="radio" id="login_method_text" name="login_method" label={data.form.fields.login_method.options.text} className="form-check-inline" onClick={this.setLoginMethod.bind(this)} />
                      <CustomInput type="radio" id="login_method_faceid" name="login_method" label={data.form.fields.login_method.options.faceid} className="form-check-inline" onClick={this.setLoginMethod.bind(this)} />
                    </div>
                  </FormGroup>
                  <div className="mb-4 text-center">
                    <Button type="button" color="primary" disabled={this.state.loginMethodUnset} onClick={() => { this.toggleTab('3'); }}>{data.form.buttons.login}</Button>
                  </div>
                  <div className="text-center">
                    <Button type="button" color="link" size="sm" className="text-info" onClick={this.toggle.bind(this)}>{data.form.buttons.help}</Button>
                  </div>
                </TabPane>
                <TabPane tabId="3">{/* MFA sent, check phone msg. We dont use tab 3. This is handled by PF. */}
                  <div className="mobile-loading" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/images/login-device-outline.jpg)` }}>
                    <div className="spinner">
                      <FontAwesomeIcon icon={faCircleNotch} size="3x" className="fa-spin" />
                    </div>
                    <p>{data.mobile.loading}</p>
                  </div>
                  <div className="mt-4 text-center">
                    <Button type="button" color="link" size="sm" className="text-info" onClick={this.toggle.bind(this)}>{data.form.buttons.help}</Button>
                  </div>
                </TabPane>
                <TabPane tabId="4">{/* Recover userName. */}
                  <h4>{data.form.buttons.recover_username}</h4>
                  <FormGroup className="form-group-light">
                    <Label for="email">{data.form.fields.email.label}</Label>
                    <Input onChange={this.handleEmailChange.bind(this)} type="text" name="email" id="email" placeholder={data.form.fields.email.placeholder} />
                  </FormGroup>
                  <div className="mb-3">
<<<<<<< HEAD
                    <Button type="button" color="primary" onClick={() => { this.toggleTab('5'); }}>{data.form.buttons.recover_username}</Button> {/* PING INTEGRATION: See onClick function. */}
                  </div>
                </TabPane>
                <TabPane tabId="5">{/* TODO Do we need this? Recover username success. Are we not just sending back to /app and pop modal? */}
=======
                    <Button type="button" color="primary" onClick={() => { this.toggleTab('6'); }}>{data.form.buttons.recover_username}</Button>
                  </div>
                </TabPane>
                <TabPane tabId="5">
                  <h4>{data.form.buttons.recover_password}</h4>
                  <FormGroup className="form-group-light">
                    <Label for="email">{data.form.fields.email.label}</Label>
                    <Input type="text" name="email" id="email" placeholder={data.form.fields.email.placeholder} />
                  </FormGroup>
                  <div className="mb-3">
                    <Button type="button" color="primary" onClick={() => { this.toggleTab('6'); }}>{data.form.buttons.recover_password}</Button>
                  </div>
                </TabPane>
                <TabPane tabId="6">
>>>>>>> master
                  <h4>{data.titles.recover_username_success}</h4>
                  <div className="mb-3 text-center">
                    <Button type="button" color="primary" onClick={() => { this.toggleTab('1'); }}>{data.form.buttons.login}</Button>
                  </div>
                </TabPane>
              </TabContent>
            </form>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default ModalLogin;
