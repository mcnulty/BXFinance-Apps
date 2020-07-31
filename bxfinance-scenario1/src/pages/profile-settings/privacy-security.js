import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  CustomInput
} from 'reactstrap';
import classNames from "classnames";

// Components
import NavbarMain from '../../components/NavbarMain';
import WelcomeBar from '../../components/WelcomeBar';
import FooterMain from '../../components/FooterMain';
import AccountsSubnav from '../../components/AccountsSubnav';
import AccountsDropdown from '../../components/AccountsDropdown';
import CardRewards from '../../components/CardRewards';

// Data
import data from '../../data/profile-settings/privacy-security.json';
 
// Styles
import "../../styles/pages/profile-settings/privacy-security.scss";

class PrivacySecurity extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      isOpen: false,
      isModalOpen: false
    };

    this.showStep1 = this.showStep1.bind(this);
    this.showStep2 = this.showStep2.bind(this);
    this.close = this.close.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }

  showStep1() {
    this.setState({step: 1});
  }

  showStep2() {
    this.setState({step: 2});
  }

  close() {
    this.setState({step: 1});
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  toggleModal() {
    this.setState({
      isModalOpen: !this.state.isModalOpen
    });
  }

  render() {
    const partner1 = data.steps[0].partners[0];
    const partner2 = data.steps[0].partners[1];
    const partner3 = data.steps[0].partners[2];
    return(
      <div className="accounts privacy-security">
        <NavbarMain />
        <WelcomeBar />
        <Container>
        <div className="inner">
            <div className="sidebar">
              {
                Object.keys(data.subnav).map(key => {
                  return (
                    <AccountsSubnav key={data.subnav[key].title} subnav={data.subnav[key]} />
                  );
                })      
              }
              <CardRewards />
            </div>
            <div className="content">
              <div className="accounts-hdr">
                <h1>{data.title}</h1>
                <AccountsDropdown text={data.dropdown} />
              </div>
              <div className="module">
                { this.state.step == 1 &&
                  <div className="edit">
                    <h2>{data.steps[0].title}</h2>
                    <p>{data.steps[0].description}</p>
                    <h3>{data.steps[0].table_title}</h3>
                    <Form className="edit">
                      <Container>
                        <div>
                          <Row>
                            <Col md={12} lg={4}><img src={process.env.PUBLIC_URL + partner1.logo} alt="" /></Col>
                            <Col md={12} lg={4}>
                              <CustomInput type="radio" id={`${partner1.name}_yes`} name={partner1.name} label="Yes" />
                              <CustomInput type="radio" id={`${partner1.name}_no`} checked name={partner1.name} label="No" />
                            </Col>
                            <Col md={12} lg={4}><a href="#" className="partner-overlay">{partner1.learn_more}</a></Col>
                          </Row>
                        </div>
                        <div>
                          <Row className="gray">
                            <Col md={12} lg={4}><img src={process.env.PUBLIC_URL + partner2.logo} alt="" /></Col>
                            <Col md={12} lg={4}>
                              <CustomInput type="radio" id={`${partner2.name}_yes`} name={partner2.name} label="Yes" />
                              <CustomInput type="radio" id={`${partner2.name}_no`} checked name={partner2.name} label="No" />
                            </Col>
                            <Col md={12} lg={4}><a href="#" className="partner-overlay">{partner2.learn_more}</a></Col>
                          </Row>
                        </div>

                        <div>
                          <Row>
                            <Col md={12} lg={4}><img src={process.env.PUBLIC_URL + partner3.logo} alt="" /></Col>
                            <Col md={12} lg={4}>
                              <CustomInput type="radio" id={`${partner3.name}_yes`} checked={this.state.isOpen} name={partner3.name} label="Yes" onClick={this.toggle} />
                              <CustomInput type="radio" id={`${partner3.name}_no`} checked={!this.state.isOpen} name={partner3.name} label="No" onClick={this.toggle} />
                            </Col>
                            <Col md={12} lg={4}><a href="#" className="partner-overlay" onClick={this.toggleModal}>{partner3.learn_more}</a></Col>
                          </Row>
                          <Row className={classNames("accounts-access", { "visible": this.state.isOpen })}>
                            <Col>
                              <p>{partner3.permissions_hdr}</p>
                              {
                                Object.keys(partner3.permissions).map(index2 => {
                                  return (
                                  <FormGroup check>
                                    <Label className="custom-checkbox" check>
                                      <Input type="checkbox" /> {partner3.permissions[index2].label}
                                      <span class="checkmark"><span></span></span>
                                    </Label>
                                  </FormGroup>
                                  )
                                })
                              }                     
                            </Col>
                          </Row>
                          { this.state.isModalOpen &&
                            <div className="psmodal psmodal-anywealthadvisor">
                              <a href="#" className="close" onClick={this.toggleModal}><span className="sr-only">Close</span></a>
                              <div dangerouslySetInnerHTML={{__html: partner3.modal}} />
                            </div>
                          }
                        </div>

                        <Row>
                          <Col>
                            <FormGroup className="buttons submit-buttons">  
                              <Button color="primary" onClick={ this.showStep2 }>{data.steps[0].btn_save}</Button>
                              <a href="/banking/profile-settings" className="text-info cancel">{data.steps[0].btn_cancel}</a> 
                            </FormGroup>
                          </Col>
                        </Row>
                      </Container>
                    </Form>
                  </div>
                }
                { this.state.step == 2 &&
                  <div className="confirmation">
                    <h3>{data.steps[1].title}</h3>
                    <p>{data.steps[1].description}</p>                    
                    {
                      Object.keys(data.steps[1].partners).map(index => {
                        return (
                          <>
                            <p className="form-header">{data.steps[1].partners[index].title}</p>
                            <Form>
                            {
                              Object.keys(data.steps[1].partners[index].permissions).map(index2 => {
                                const permission = data.steps[1].partners[index].permissions[index2];
                                return (
                                  <FormGroup check>
                                    <Label className="custom-checkbox" check>
                                      <Input type="checkbox" checked={permission.checked} disabled /> {permission.label}
                                      <span class="checkmark"><span></span></span>
                                    </Label>
                                  </FormGroup>
                                )
                              })
                            }
                            </Form>
                            <div className="anywealthadvisor">
                              <p>{data.steps[1].partners[index].banner}</p>
                              <Button href={data.steps[1].partners[index].cta_destination}>{data.steps[1].partners[index].cta_text}</Button>
                            </div>
                          </>
                        );
                      })      
                    }
                    <div dangerouslySetInnerHTML={{__html: data.steps[1].other_things}} />                    
                    <FormGroup className="buttons submit-buttons">
                      <Button color="primary" onClick={ this.showStep1 }>{data.steps[1].btn_back}</Button>
                    </FormGroup>
                  </div>
                }
              </div>
            </div>
          </div>
        </Container>
        <FooterMain />
      </div>
    )
  }
}
export default PrivacySecurity
