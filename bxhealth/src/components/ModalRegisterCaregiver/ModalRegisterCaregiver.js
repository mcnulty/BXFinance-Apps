/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

// Packages
import React from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
  CustomInput,
  Row,
  Col,
  Popover,
  PopoverHeader,
  PopoverBody
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';

// Styles
import "./ModalRegisterCaregiver.scss";

// Data
import data from './data.json';

class ModalRegisterCaregiver extends React.Component {
  constructor() {
    super();
    this.state = {
      isOpen: false,
      isPopoverOpen: false
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  togglePopover() {
    this.setState({
      isPopoverOpen: !this.state.isPopoverOpen
    });
  }
  render() {
    return (
      <div>
        <Modal isOpen={this.state.isOpen} toggle={this.toggle.bind(this)} className="modal-xl modal-register">
          <ModalHeader toggle={this.toggle.bind(this)}><img src="/images/logo.svg" alt="logo" /></ModalHeader>
          <h4>{data.title}</h4>
          <ModalBody>
            <Form>
              <Row form className="form-row-light">
                <Col md={6}>
                  <FormGroup>
                    <Label for="firstname">{data.form.fields.firstname.label}</Label>
                    <Input type="text" name="firstname" id="firstname" placeholder={data.form.fields.firstname.placeholder} />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="lastname">{data.form.fields.lastname.label}</Label>
                    <Input type="text" name="lastname" id="lastname" placeholder={data.form.fields.lastname.placeholder} />
                  </FormGroup>
                </Col>
              </Row>
              <Row form className="form-row-light">
                <Col md={6}>
                  <FormGroup>
                    <Label for="username">{data.form.fields.username.label}</Label>
                    <Input type="text" name="username" id="username" placeholder={data.form.fields.username.placeholder} />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="email">{data.form.fields.email.label}</Label>
                    <Input type="email" name="email" id="email" placeholder={data.form.fields.email.placeholder} />
                  </FormGroup>
                </Col>
              </Row>
              <Row form className="form-row-light">
                <Col md={6}>
                  <FormGroup>
                    <Label for="phone">{data.form.fields.phone.label}</Label>
                    <Input type="tel" name="phone" id="phone" placeholder={data.form.fields.phone.placeholder} />
                  </FormGroup>
                </Col>
                <Col md={6}>
                </Col>
              </Row>
              <Row form className="form-row-light">
                <Col md={6}>
                  <FormGroup>
                    <Label for="password">{data.form.fields.password.label}</Label>
                    <Input type="password" name="password" id="password" placeholder={data.form.fields.password.placeholder} />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="password_confirm">{data.form.fields.password_confirm.label}</Label>
                    <Input type="password" name="password_confirm" id="password_confirm" placeholder={data.form.fields.password_confirm.placeholder} />
                  </FormGroup>
                </Col>
              </Row>
              <Row form className="form-row-light mt-3">
                <Col md={6}>
                </Col>
                <Col md={6} className="text-right">
                  <Button type="button" color="primary" onClick={this.props.onSubmit}>{data.form.buttons.submit}</Button>
                  <Button type="button" color="link text-info" className="ml-3" onClick={this.toggle.bind(this)}>{data.form.buttons.cancel}</Button>
                </Col>
              </Row>
            </Form>
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default ModalRegisterCaregiver;
