import React from 'react'
import { Container } from 'reactstrap';

// Components
import NavbarMain from '../../components/NavbarMain';
import WelcomeBar from '../../components/WelcomeBar';
import FooterMain from '../../components/FooterMain';
import Subnav from '../../components/Subnav';
import ThingsICanDo from '../../components/ThingsICanDo';
import AccountsSectionNav from '../../components/AccountsSectionNav';
import ClassesEvents from '../../components/ClassesEvents';

// Data
import data from '../../data/profile-settings.json';
 
// Styles
import "../../styles/pages/accounts.scss";

class ProfileSettings extends React.Component {
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
                {
                  Object.keys(data.sections).map(key => {
                    return (
                      <AccountsSectionNav data={data.sections[key]} />
                    );
                  })      
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
export default ProfileSettings