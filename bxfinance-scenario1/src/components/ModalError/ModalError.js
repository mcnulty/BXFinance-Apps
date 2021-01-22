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
import { Redirect } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

// Styles
import "./ModalError.scss";

// Data
import data from './data.json';

class ModalError extends React.Component {
  constructor() {
    super();
    this.state = {
      isOpen: false,
      errorTitle: "Unexpected Error.",
      errorMsg: "Please contact Technical Enablement.",
      callBack: ""
    };
    this.toggle = this.toggle.bind(this);
  }
  toggle(title, msg, callBack) {
    this.setState({
      isOpen: !this.state.isOpen,
      errorTitle: title,
      errorMsg: msg,
      callBack: callBack
    });
  }
  continueBtn() {
    if (typeof this.state.callBack === 'function') {
      this.state.callBack();
    } else {
      window.location.assign("/app/");
    }
  }
  render() {
    const closeBtn = <div />;
    return (
      <div>
        <Modal isOpen={this.state.isOpen} toggle={this.toggle.bind(this)} className="modal-error">
          <ModalHeader toggle={this.toggle.bind(this)} close={closeBtn}><img src={process.env.PUBLIC_URL + "/images/logo.svg"} alt="logo" /></ModalHeader>
          <ModalBody>
            <h4>{this.state.errorTitle}</h4>
            <div>{this.state.errorMsg}</div>
            <Button color="primary" onClick={this.continueBtn.bind(this)}>{data.button}</Button>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default ModalError;
