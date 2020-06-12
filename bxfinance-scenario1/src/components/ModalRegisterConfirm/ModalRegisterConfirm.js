/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

// Packages
import React from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col
} from 'reactstrap';

// Styles
import './ModalRegisterConfirm.scss';

// Data
import data from './data.json';

class ModalRegisterConfirm extends React.Component {
  constructor() {
    super();
    this.state = {
      isOpen: false
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  render() {
    return (
      <div>
        <Modal isOpen={this.state.isOpen} toggle={this.toggle.bind(this)} className="modal-xl modal-register-confirm">
          <ModalHeader toggle={this.toggle.bind(this)}></ModalHeader>
          <ModalBody>
            <Row>
              <Col md="6" lg="4" className="col-download">
                <h4>{data.download.title}</h4>
                <p dangerouslySetInnerHTML={{__html: data.download.content}}></p>
                <div className="mb-3"><img src="/images/app-store-logos.svg" /></div>
                <p dangerouslySetInnerHTML={{__html: data.download.learn}}></p>
              </Col>
              <Col md="6" lg="8" className="col-content">
                <img src="/images/logo.svg" alt="logo" />
                <h4>{data.confirmation.title}</h4>
                <div dangerouslySetInnerHTML={{__html: data.confirmation.content}}></div>
                <div className="mt-4">
                  <Button type="button" color="secondary" onClick={this.toggle.bind(this)}>{data.confirmation.buttons.learn}</Button>
                  <Button type="button" color="link text-info" className="ml-3" onClick={this.toggle.bind(this)}>{data.confirmation.buttons.close}</Button>
                </div>
              </Col>
            </Row>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default ModalRegisterConfirm;
