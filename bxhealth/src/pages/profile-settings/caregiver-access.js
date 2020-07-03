import React from 'react';
import {
  Container,
  Button,
  Form,
  FormGroup,
  Label,
  CustomInput,
} from 'reactstrap';
import classNames from "classnames";

// Components
import NavbarMain from '../../components/NavbarMain';
import WelcomeBar from '../../components/WelcomeBar';
import FooterMain from '../../components/FooterMain';
import Subnav from '../../components/Subnav';
import ThingsICanDo from '../../components/ThingsICanDo';
import AccountsSectionNav from '../../components/AccountsSectionNav';
import ClassesEvents from '../../components/ClassesEvents';

// Data
import data from '../../data/profile-settings/caregiver-access.json';
 
// Styles
import "../../styles/pages/profile-settings/communication-preferences.scss";

class CaregiverAccess extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      step: 1
    };

    this.showStep2 = this.showStep2.bind(this);
    this.showStep3 = this.showStep3.bind(this);
    this.close = this.close.bind(this);
  }

  showStep2() {
    this.setState({step: 2});
  }

  showStep3() {
    this.setState({step: 3});
  }

  close() {
    this.setState({step: 1});
  }

  render() {
    return(
      <div className="authenticated dashboard">
        <NavbarMain white />
        <WelcomeBar />
        <Container>
          <div className="inner">
            <div className="sidebar">
              {
                Object.keys(data.subnav).map(key => {
                  return (
                    <Subnav key={data.subnav[key].title} subnav={data.subnav[key]} />
                  );
                })      
              }
              <ClassesEvents />
            </div>
            <div className="content">
              <div className="authenticated-hdr">
                <h1>{data.title}</h1>
                <ThingsICanDo text={data.dropdown} />
                { this.state.step == 1 &&
                  <div className="module p-4 pr-5 module-step1">
                    <h2>{data.steps[0].title}</h2>
                    <p>{data.steps[0].description}</p>
                    <FormGroup>
                      <div class="form-inline float-right">
                        <input type="email" class="form-control" placeholder={data.steps[0].email_placeholder} />
                      </div>
                      <h3>{data.steps[0].email_title}</h3>
                    </FormGroup>
                    <h3>{data.steps[0].table_title}</h3>
                    <Form>
                      {
                        Object.keys(data.steps[0].communication_types).map(index => {
                          return (
                            <>
                              <FormGroup>
                                <Label for={data.steps[0].communication_types[index].name}>{data.steps[0].communication_types[index].label}</Label>
                                <CustomInput type="radio" id={`${data.steps[0].communication_types[index].name}_yes`} name={data.steps[0].communication_types[index].name} label="Yes" onClick={ this.showStep2 } />
                                <CustomInput type="radio" id={`${data.steps[0].communication_types[index].name}_no`} name={data.steps[0].communication_types[index].name} checked label="No" />
                              </FormGroup>
                            </>
                          );
                        })      
                      }
                      <FormGroup className="buttons submit-buttons">
                        <Button color="primary" disabled>Save</Button>     
                      </FormGroup>
                    </Form>
                  </div>
                }
                { this.state.step == 2 &&                  
                  <div className="module p-4 pr-5 module-step2">
                    <h2>{data.steps[0].title}</h2>
                    <p>{data.steps[0].description}</p>
                    <FormGroup>
                      <div class="form-inline float-right">
                        <input type="email" class="form-control" value="alexsmith_7822@gmail.com" placeholder={data.steps[0].email_placeholder} />
                      </div>
                      <h3>{data.steps[0].email_title}</h3>
                    </FormGroup>
                    <h3>{data.steps[0].table_title}</h3>
                    <Form>
                      {
                        Object.keys(data.steps[0].communication_types).map(index => {
                          return (
                            <>
                              <FormGroup>
                                <Label for={data.steps[0].communication_types[index].name}>{data.steps[0].communication_types[index].label}</Label>
                                <CustomInput type="radio" id={`${data.steps[0].communication_types[index].name}_yes`} name={data.steps[0].communication_types[index].name} label="Yes" checked />
                                <CustomInput type="radio" id={`${data.steps[0].communication_types[index].name}_no`} name={data.steps[0].communication_types[index].name} label="No" />
                              </FormGroup>
                            </>
                          );
                        })      
                      }
                      <FormGroup className="buttons submit-buttons">
                        <Button color="primary" onClick={ this.showStep3 }>Save</Button>     
                      </FormGroup>
                    </Form>
                  </div>
                }
                { this.state.step == 3 &&                  
                  <div className="module p-4 pr-5 module-step2">
                    <h2>{data.steps[2].title}</h2>
                    <p>{data.steps[2].description}</p>
                    <Form>
                      {
                        Object.keys(data.steps[0].communication_types).map(index => {
                          return (
                            <>
                              <FormGroup>
                                <Label for={data.steps[0].communication_types[index].name}>{data.steps[0].communication_types[index].label}</Label>
                                <CustomInput type="radio" id={`${data.steps[0].communication_types[index].name}_yes`} name={data.steps[0].communication_types[index].name} checked label="Yes" />
                                <CustomInput type="radio" id={`${data.steps[0].communication_types[index].name}_no`} name={data.steps[0].communication_types[index].name} label="No" />
                              </FormGroup>
                            </>
                          );
                        })      
                      }
                      <div class="float-left ml-4 mt-3">
                        <Button color="link">Change Caregiver</Button>
                      </div>
                      <FormGroup className="buttons submit-buttons">
                        <Button color="primary" disabled>Update</Button>     
                      </FormGroup>
                    </Form>
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
export default CaregiverAccess