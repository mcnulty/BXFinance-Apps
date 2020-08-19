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
import Session from '../../components/Utils/Session'; /* PING INTEGRATION: */
import PingOAuth from '../../components/Utils/PingOAuth'; /* PING INTEGRATION: */
import PingData from '../../components/Utils/PingData'; /* PING INTEGRATION: */

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
      isModalOpen: false,
      anywealthadvisor: "no",            /* PING INTEGRATION: */
      anywealthadvisorChecked: false,    /* PING INTEGRATION: */
      acct_0: 0,                         /* PING INTEGRATION: */
      acct_1: 0,                         /* PING INTEGRATION: */
      acct_2: 0                          /* PING INTEGRATION: */
    };

    this.showStep1 = this.showStep1.bind(this);
    this.showStep2 = this.showStep2.bind(this);
    this.close = this.close.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleConsent = this.toggleConsent.bind(this);
    this.Session = new Session(); /* PING INTEGRATION: */
    this.PingOAuth = new PingOAuth(); /* PING INTEGRATION: */
    this.PingData = new PingData(); /* PING INTEGRATION: */
    this.consentDef = "share-account-balances"; /* PING INTEGRATION: */
  }

  showStep1() {
    this.setState({ step: 1 });
  }

  showStep2() {
    /* BEGIN PING INTEGRATION */
    if (this.state.consentId) {
      console.log("TEST", "Updating consents");
      let accountIds = [];
      let count;
      count = this.state.acct_0 > 0 && accountIds.push(this.state.acct_0);
      count = this.state.acct_1 > 0 && accountIds.push(this.state.acct_1);
      count = this.state.acct_2 > 0 && accountIds.push(this.state.acct_2);
      const consent = accountIds;
      this.PingData.updateUserConsent(this.Session.getAuthenticatedUserItem("AT"), consent, this.state.consentId, this.consentDef)
        .then(response => response.json())
        .then(consentData => {
          console.log("UpdateUserConsents", JSON.stringify(consentData));
          console.log("STATE", this.state);
        })
        .catch(e => {
          console.error("UpdateUserConsents Exception", e)
        });
    } else {
      console.log("TEST", "Creating consents");
      let accountIds = [];
      let count;
      count = this.state.acct_0 > 0 && accountIds.push(this.state.acct_0);
      count = this.state.acct_1 > 0 && accountIds.push(this.state.acct_1);
      count = this.state.acct_2 > 0 && accountIds.push(this.state.acct_2);
      const consent = accountIds;
      this.PingData.createUserConsent(this.Session.getAuthenticatedUserItem("AT"), consent, this.Session.getAuthenticatedUserItem("uid"), this.consentDef)
        .then(response => response.json())
        .then(consentData => {
          console.log("CreateUserConsents", JSON.stringify(consentData));
          console.log("STATE", this.state);
        })
        .catch(e => {
          console.error("CreateUserConsents Exception", e)
        });
    } /* END PING INTEGRATION */
    this.setState({ step: 2 });
  }

  close() {
    this.setState({ step: 1 });
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

  /* BEGIN PING INTEGRATION:  */
  //this function sets state of comm. pref. selected soley based on event obj passed in during onclick.
  // we extract the comm. type and consent pref. based on the substrings of the element ID. I.e "sms_yes".
  toggleConsent(event) {
    let consentState = {};
    let checkedState = {};
    const delimiterPos = event.target.id.indexOf("_");
    consentState[event.target.id.substring(0, delimiterPos)] = event.target.id.substring(delimiterPos + 1);
    this.setState(consentState);
    checkedState[event.target.id.substring(0, delimiterPos) + "Checked"] = event.target.id.substring(delimiterPos + 1) == "yes" ? true : false;
    this.setState(checkedState);
    //If the clicked "No" for Advisor consent, clear all account IDs from state.
    if (event.target.id.substring(delimiterPos + 1) == "no") {
      this.setState({
        acct_0: 0,
        acct_1: 0,
        acct_2: 0
      })
    }
    console.log("STATE", this.state);
  }

  toggeAccount(index, acctId) {
    console.log("TEST-index", index);
    console.log("TEST-acctId", acctId);
    let consentAcctState = {};
    if (acctId != 0) {
      consentAcctState["acct_" + index] = 0;
      this.setState(consentAcctState);
    } else {
      consentAcctState["acct_" + index] = acctId;
      this.setState(consentAcctState);
    }
  }
  /* END PING INTEGRATION:  */


  /* BEGIN PING INTEGRATION */
  componentDidMount() {
    let newState = {};
    if (this.Session.getAuthenticatedUserItem("AT")) {
      const token = this.Session.getAuthenticatedUserItem("AT");
      this.PingData.getUserConsents(token, this.Session.getAuthenticatedUserItem("uid"), this.consentDef)
        .then(response => response.json())
        .then(consentData => {
          console.log("getUserConsents", JSON.stringify(consentData));
          if (consentData.count > 0) {
            this.setState({
              anywealthadvisor: consentData._embedded.consents[0].data["share-balance"].length ? "yes" : "no",
              anywealthadvisorChecked: consentData._embedded.consents[0].data["share-balance"].length ? true : false,
              consentId: consentData._embedded.consents[0].id
            });
            //loop over share-balance array updating state for checkboxes.
            // This loop ensures we handle n number of accts on someones record to avoid complexity, 
            // since the page only ever displays and manages consent of the first 3. Otherwise the loop would need to exit after array[2].
            consentData._embedded.consents[0].data["share-balance"].forEach((acctId, index) => {
              newState["acct_" + index] = acctId;
              this.setState(newState);
            });
            console.log("STATE", this.state);
            this.toggle();
          }
        })
        .catch(e => {
          console.error("GetUserConsents Exception", e)
        });
    } else {
      this.PingOAuth.getToken({ uid: this.Session.getAuthenticatedUserItem("uid"), scopes: 'urn:pingdirectory:consent' })
        .then(token => {
          this.Session.setAuthenticatedUserItem("AT", token); //for later reuse to reduce getToken calls.
          this.PingData.getUserConsents(token, this.Session.getAuthenticatedUserItem("uid"), this.consentDef)
            .then(response => response.json())
            .then(consentData => {
              console.log("getUserConsents", JSON.stringify(consentData));
              if (consentData.count > 0) {
                this.setState({
                  anywealthadvisor: consentData._embedded.consents[0].data["share-balance"].length ? "yes" : "no",
                  anywealthadvisorChecked: consentData._embedded.consents[0].data["share-balance"].length ? true : false,
                  consentId: consentData._embedded.consents[0].id
                });
                //loop over share-balance array updating state for checkboxes.

                console.log("STATE", this.state);
              }
            })
            .catch(e => {
              console.error("GetUserConsents Exception", e)
            });
        })
        .catch(e => {
          console.error("GetToken Exception", e);
        });
    }
  }
  /* END PING INTEGRATION: */

  render() {
    const partner1 = data.steps[0].partners[0];
    const partner2 = data.steps[0].partners[1];
    const partner3 = data.steps[0].partners[2];
    let name = partner3.name; /* PING INTEGRATION: */

    return (
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
                {this.state.step == 1 &&
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
                              <CustomInput type="radio" id={`${partner1.name}_no`} readOnly checked name={partner1.name} label="No" />
                            </Col>
                            <Col md={12} lg={4}><a href="#" className="partner-overlay" onClick={this.toggleModal}>{partner1.learn_more}</a></Col>{/* TODO add back Learn More modal popup */}
                          </Row>
                        </div>
                        <div>
                          <Row className="gray">
                            <Col md={12} lg={4}><img src={process.env.PUBLIC_URL + partner2.logo} alt="" /></Col>
                            <Col md={12} lg={4}>
                              <CustomInput type="radio" id={`${partner2.name}_yes`} name={partner2.name} label="Yes" />
                              <CustomInput type="radio" id={`${partner2.name}_no`} readOnly checked name={partner2.name} label="No" />
                            </Col>
                            <Col md={12} lg={4}><a href="#" className="partner-overlay" onClick={this.toggleModal}>{partner2.learn_more}</a></Col>{/* TODO add back Learn More modal popup */}
                          </Row>
                        </div>
                        {/* PING INTEGRATION: This block "partner3" is only partner block modified for demos. The others are static.  */}
                        <div>
                          <Row>
                            <Col md={12} lg={4}><img src={process.env.PUBLIC_URL + partner3.logo} alt="" /></Col>
                            <Col md={12} lg={4}>
                              <CustomInput type="radio" onChange={(event) => this.toggleConsent(event)} id={`${partner3.name}_yes`} checked={this.state[name + "Checked"]} name={partner3.name} label="Yes" onClick={this.toggle} />
                              <CustomInput type="radio" onChange={(event) => this.toggleConsent(event)} id={`${partner3.name}_no`} checked={!this.state[name + "Checked"]} name={partner3.name} label="No" onClick={this.toggle} />
                            </Col>
                            <Col md={12} lg={4}><a href="#" className="partner-overlay" onClick={this.toggleModal}>{partner3.learn_more}</a></Col>
                          </Row>
                          <Row className={classNames("accounts-access", { "visible": this.state.isOpen })}>
                            <Col>
                              <p>{partner3.permissions_hdr}</p>
                              {
                                Object.keys(partner3.permissions).map(index2 => {
                                  return (
                                    <FormGroup key={index2} check>
                                      <Label className="custom-checkbox" check>
                                        <Input type="checkbox" onClick={() => this.toggeAccount(index2, this.state["acct_" + index2])} checked={this.state["acct_" + index2]} /> {partner3.permissions[index2].label}
                                        <span className="checkmark"><span></span></span>
                                      </Label>
                                    </FormGroup>
                                  )
                                })
                              }
                            </Col>
                          </Row>
                          {this.state.isModalOpen &&
                            <div className="psmodal psmodal-anywealthadvisor">
                              <a href="#" className="close" onClick={this.toggleModal}><span className="sr-only">Close</span></a>
                              <div dangerouslySetInnerHTML={{ __html: partner3.modal }} />
                            </div>
                          }
                        </div>

                        <Row>
                          <Col>
                            <FormGroup className="buttons submit-buttons">
                              <Button color="primary" onClick={this.showStep2}>{data.steps[0].btn_save}</Button>
                              <a href="/banking/profile-settings" className="text-info cancel">{data.steps[0].btn_cancel}</a>
                            </FormGroup>
                          </Col>
                        </Row>
                      </Container>
                    </Form>
                  </div>
                }
                {this.state.step == 2 &&
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
                    <div dangerouslySetInnerHTML={{ __html: data.steps[1].other_things }} />
                    <FormGroup className="buttons submit-buttons">
                      <Button color="primary" onClick={this.showStep1}>{data.steps[1].btn_back}</Button>
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
