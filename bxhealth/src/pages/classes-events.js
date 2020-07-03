import React from 'react'
import { Container, Button } from 'reactstrap';
import classNames from "classnames";

// Components
import NavbarMain from '../components/NavbarMain';
import WelcomeBar from '../components/WelcomeBar';
import FooterMain from '../components/FooterMain';
import Subnav from '../components/Subnav';
import ThingsICanDo from '../components/ThingsICanDo';
import DiscountsBenefits from '../components/DiscountsBenefits';

// Data
import data from '../data/classes-events.json';

// Styles
import "../styles/pages/authenticated.scss";
import "../styles/pages/classes-events.scss";

class ClassesEvents extends React.Component {
  constructor() {
    super();
    this.state = {
      isModalOpen: false,
      activeEvent: 1
    };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }
  closeModal(e) {
    e.preventDefault();
    this.setState({
      isModalOpen: false
    });
  }
  openModal(event) {
    this.setState({
      activeEvent: event,
      isModalOpen: true
    });
  }
  render() {
    // psmodal-active
    return(
      <div className={classNames("authenticated classes-events", { "psmodal-active": this.state.isModalOpen })}>
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
              <DiscountsBenefits />
            </div>
            <div className="content">
              <div className="authenticated-hdr">
                <h1>{ data.title }</h1>
                <ThingsICanDo text={data.dropdown} />
              </div>
              <div className="module">
                <h3>{data.subtitle}</h3>
                <p dangerouslySetInnerHTML={{__html: data.description}} />
                <div className="grey-columns">
                  {
                    Object.keys(data.events).map(key => {
                      return (
                        <div className="grey-column event">
                          <p className="date">{data.events[key].date}</p>
                          <h4>{data.events[key].title}</h4>
                          <p dangerouslySetInnerHTML={{__html: data.events[key].description}} />
                          <a href="#">{data.events[key].text_link}</a>
                          {
                            Object.keys(data.events[key].links).map(key2 => {
                              return (
                                <Button color="link" className="btn btn-primary" onClick={() => this.openModal(key)}>{data.events[key].links[key2].text}</Button>
                              )
                            })
                          }
                        </div>
                      );
                    })
                  }
                </div>
                <a href="#" className="see-all">See All Events</a>
              </div>      
              { this.state.isModalOpen &&
                <div className="psmodal psmodal-anywealthadvisor">
                  <a href="#" className="close" onClick={this.closeModal}><span className="sr-only">Close</span></a>
                  <h3>{data.modal.title}</h3>
                  <div className="auth-columns">
                    <div className="auth-column">
                      <div dangerouslySetInnerHTML={{__html: data.modal.description}} />
                      <img src="/images/icons/hand-mark.svg" alt="" className="icon" />
                    </div>
                    {
                      Object.keys(data.events).map(key => {
                        return (
                          <div  className={classNames("auth-column event", { "visible": this.state.activeEvent === key })}>
                            <p className="date">{data.events[key].date}</p>
                            <h4>{data.events[key].title}</h4>
                            <p dangerouslySetInnerHTML={{__html: data.events[key].description}} />
                            <p className="links">
                              {
                                Object.keys(data.events[key].links_registered).map(key2 => {
                                  return (
                                    <a href="#">{data.events[key].links_registered[key2].text}</a>
                                  )
                                })
                              }
                            </p>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        </Container>
        <FooterMain />
      </div>
    )
  }
}
export default ClassesEvents