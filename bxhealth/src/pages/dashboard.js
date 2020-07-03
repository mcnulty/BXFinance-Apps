import React from 'react'
import { Container, Button } from 'reactstrap';
import classNames from "classnames";

// Components
import NavbarMain from '../components/NavbarMain';
import WelcomeBar from '../components/WelcomeBar';
import FooterMain from '../components/FooterMain';
import Subnav from '../components/Subnav';
import ThingsICanDo from '../components/ThingsICanDo';
import ClassesEvents from '../components/ClassesEvents';
import BookAppointment from '../components/BookAppointment';

// Data
import data from '../data/dashboard.json';

// Styles
import "../styles/pages/authenticated.scss";
import "../styles/pages/dashboard.scss";

class Dashboard extends React.Component {
  constructor() {
    super();
    this.state = {
      member: true,
      caregiver: false,
      caregiver_unlinked: false
    };
  }
  componentDidMount () {
    if ( window.location.search === "?caregiver=true") {
      this.setState({
        member: false,
        caregiver: true
      });
    }
    if ( window.location.search === "?caregiver_unlinked=true") {
      this.setState({
        member: false,
        caregiver_unlinked: true
      });
    }
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
                this.state.member &&
                  Object.keys(data.subnav_member).map(key => {
                    return (
                      <Subnav key={data.subnav_member[key].title} subnav={data.subnav_member[key]} />
                    );
                  })
              }
              {
                (this.state.caregiver || this.state.caregiver_unlinked) &&
                  Object.keys(data.subnav_caregiver).map(key => {
                    return (
                      <Subnav key={data.subnav_caregiver[key].title} subnav={data.subnav_caregiver[key]} />
                    );
                  })
              }
              {
                this.state.member &&
                  <ClassesEvents />
              }
              {
                this.state.caregiver &&
                  <BookAppointment />
              }

            </div>
            <div className="content">
              <div className="authenticated-hdr">
                <h1>{ this.state.caregiver ? data.title_caregiver : data.title }</h1>
                <ThingsICanDo text={data.dropdown} />
                <div className="module">

                  {/* Caregiver View */}
                  { this.state.caregiver &&
                    <div className="caregiver">
                      {/* Links */}
                      <div class="grey-columns">
                        {
                          Object.keys(data.caregiver.columns).map(key => {
                            return (
                              <div class="grey-column">
                                <a href={data.caregiver.columns[key].href} class={data.caregiver.columns[key].icon_class}>{data.caregiver.columns[key].text}</a>
                              </div>
                            );
                          })
                        }
                      </div>
                      {/* Columns */}
                      <div className="auth-columns">
                        <div className="auth-column" dangerouslySetInnerHTML={{__html: data.caregiver.col_left}} />
                        <div className="auth-column" dangerouslySetInnerHTML={{__html: data.caregiver.col_right}} />                    
                      </div>
                    </div>
                  }

                  {/* Caregiver Unlinked View */}
                  { this.state.caregiver_unlinked &&
                    <div className="caregiver_unlinked">
                      <div className="auth-columns">
                        <div className="auth-column">
                          <div class="grey-columns">
                            <div class="grey-column ico-comment">                              
                              <h3>{data.caregiver_unlinked.h3}</h3>
                              <p>{data.caregiver_unlinked.p}</p>
                              <Button href={data.caregiver_unlinked.btn_href} color="link" className="btn btn-primary">{data.caregiver_unlinked.btn_text}</Button>
                            </div>
                          </div>
                        </div>
                        <div className="auth-column">
                          <h4>{data.caregiver_unlinked.h4}</h4>
                          <div dangerouslySetInnerHTML={{__html: data.caregiver_unlinked.list}} />  
                          <Button href={data.caregiver_unlinked.btn_2_href} color="link" className="btn btn-primary">{data.caregiver_unlinked.btn_2_text}</Button>
                        </div>
                      </div>
                    </div>
                  }

                  {/* Member View */}
                  { this.state.member &&
                    <div className="member">
                      <h3>{data.member.h3}</h3>
                      <div class="dashboard-header">
                        <p dangerouslySetInnerHTML={{__html: data.member.p}} />
                        <div class="dashboard-header-links">
                          <a href="#">{data.member.link1}</a>
                          <a href="#">{data.member.link2}</a>
                        </div>
                      </div>
                      <div class="grey-columns">
                        {
                          Object.keys(data.member.columns).map(key => {
                            return (
                              <div className={classNames("grey-column", data.member.columns[key].icon_class )}>
                                <h4>{data.member.columns[key].h4}</h4>
                                <p>{data.member.columns[key].p}</p>
                                <Button href={data.member.columns[key].btn_href} color="link" className="btn btn-primary">{data.member.columns[key].btn_text}</Button>
                              </div>
                            )
                          })
                        }
                      </div>
                      <h3>{data.member.quicklinks_hdr}</h3>
                      <ul class="quick-links">
                        {
                          Object.keys(data.member.quicklinks).map(key => {
                            return (
                              <li><a href={data.member.quicklinks[key].href} className={data.member.quicklinks[key].icon_class}>{data.member.quicklinks[key].text}</a></li>
                            )
                          })
                        }
                      </ul>
                    </div>
                  }

                </div>
              </div>              
            </div>
          </div>
        </Container>
        <FooterMain />
      </div>
    )
  }
}
export default Dashboard