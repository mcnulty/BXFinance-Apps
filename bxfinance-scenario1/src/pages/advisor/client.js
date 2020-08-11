// Packages
import React from 'react';
import {
  Button, Jumbotron, Row, Col, Card, CardBody,
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
  Media
} from 'reactstrap';
import { Link, NavLink as RRNavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedinIn, faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';

// Components
import NavbarMain from '../../components/NavbarMain';
import FooterMain from '../../components/FooterMain';
import AccountsSubnav from '../../components/AccountsSubnav';
import Session from '../../components/Utils/Session'; /* PING INTEGRATION: */

// Data
import data from '../../data/advisor.json';

// Styles
import '../../styles/pages/advisor.scss';

// Autocomplete Suggestion List
const SuggestionsList = props => {
  const {
    suggestions,
    inputValue,
    onSelectSuggestion,
    displaySuggestions,
    selectedSuggestion
  } = props;

  if (inputValue && displaySuggestions) {
    if (suggestions.length > 0) {
      return (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => {
            const isSelected = selectedSuggestion === index;
            const classname = `suggestion ${isSelected ? "selected" : ""}`;
            return (
              <li
                key={index}
                className={classname}
                onClick={() => onSelectSuggestion(index)}
              >
                {suggestion}
              </li>
            );
          })}
        </ul>
      );
    } else {
      return <ul className="suggestions-list"><li className="suggestion">No suggestions available...</li></ul>;
    }
  }
  return <div></div>;
};

// Search Autocomplete
const SearchAutocomplete = () => {
  const [inputValue, setInputValue] = React.useState("");
  const [filteredSuggestions, setFilteredSuggestions] = React.useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = React.useState(0);
  const [displaySuggestions, setDisplaySuggestions] = React.useState(false);
  const onChange = event => {
    const value = event.target.value;
    setInputValue(value);
    const filteredSuggestions = data.clients.suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(filteredSuggestions);
    setDisplaySuggestions(true);
  };
  const onSelectSuggestion = index => {
    setSelectedSuggestion(index);
    setInputValue(filteredSuggestions[index]);
    setFilteredSuggestions([]);
    setDisplaySuggestions(false);
  };
  return (
    <div>
      <form className="form-search form-inline float-right">
        <input className="form-control user-input" type="text" placeholder={data.clients.search_placeholder} onChange={onChange} value={inputValue} />
        <SuggestionsList
          inputValue={inputValue}
          selectedSuggestion={selectedSuggestion}
          onSelectSuggestion={onSelectSuggestion}
          displaySuggestions={displaySuggestions}
          suggestions={filteredSuggestions}
        />
        <img src={process.env.PUBLIC_URL + "/images/icons/search.svg"} className="img-search" />
      </form>
    </div>
  );
};

// AdvisorClient Page
class AdvisorClient extends React.Component {
  constructor() {
    super();
    this.Session = new Session(); /* PING INTEGRATION: */
  }
  render() {
    return (
      <div className="accounts advisor">
        <NavbarMain data={data} />
        <section className="welcome-bar">
          <Container>
            <Row>
              <Col lg="12">
                <p>{data.welcome_bar}{this.Session.getAuthenticatedUserItem("firstName")}</p>
              </Col>
            </Row>
          </Container>
        </section>
        <section className="section-content">
          <Container>
            <Row>
              <Col lg="4">
                <h5>{data.profile.advisor.title}</h5>
                <Card className="card-side">
                  <CardBody>
                    <Media>
                      <Media left href="#">
                        <Media object src={process.env.PUBLIC_URL + "/images/anywealthadvisor-photo.png"} alt="Generic placeholder image" />
                      </Media>
                      <Media body>
                        {/* PING INTEGRATION */}
                        <strong>{this.Session.getAuthenticatedUserItem("firstName") + " " + this.Session.getAuthenticatedUserItem("lastName")}</strong>
                        <span dangerouslySetInnerHTML={{ __html: data.profile.advisor.content }}></span>
                        <Button color="link">{data.profile.advisor.button}</Button>
                      </Media>
                    </Media>
                  </CardBody>
                </Card>
                <h5 className="mt-5">{data.alerts.title}</h5>
                <Card className="card-side mb-5">
                  <CardBody>
                    {
                      Object.keys(data.alerts.messages).map(key => {
                        return (
                          <p key={key} dangerouslySetInnerHTML={{ __html: data.alerts.messages[key] }}></p>
                        );
                      })
                    }
                    <Button color="link">{data.alerts.button}</Button>
                  </CardBody>
                </Card>
              </Col>
              <Col lg="8">
                <div>
                  <Row>
                    <Col>
                      <h5 className="mb-4">{data.clients.title}</h5>
                    </Col>
                    <Col>
                      <SearchAutocomplete />
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Card className="client-detail">
                        <CardBody>
                          <Row>
                            <Col md="4" className="col-side">
                              <Media>
                                <Media body>
                                  <p dangerouslySetInnerHTML={{__html: data.client_detail.side.content}}></p>
                                  <Button color="primary">{data.client_detail.side.button}</Button>
                                </Media>
                              </Media>
                            </Col>
                            <Col md="8" className="col-content">
                              <p><strong>{data.client_detail.content.title}</strong></p>
                              {data.client_detail.content.accounts.map((item, i) => {
                                return (
                                  <Row key={i}>
                                    <Col md="8">{item.account}</Col>
                                    <Col md="4">{item.amount}</Col>
                                  </Row>
                                );
                              })}
                              <p className="mt-3" dangerouslySetInnerHTML={{__html: data.client_detail.content.links}}></p>
                              <Row>
                                <Col md="8">
                                  <p><strong>{data.client_detail.content.portfolio_overview}</strong></p>
                                  <img src={process.env.PUBLIC_URL + "/images/advisor-client-chart.png"} className="img-fluid" />
                                </Col>
                                <Col md="4">
                                  <p><strong>{data.client_detail.content.portfolio_view}</strong></p>
                                  <img src={process.env.PUBLIC_URL + "/images/advisor-client-pie-chart.png"} className="img-fluid" />
                                </Col>
                              </Row>
                            </Col>
                          </Row>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </div>
                <div>
                  <h5 className="mb-3">{data.clients_recent.title}</h5>
                  <p dangerouslySetInnerHTML={{ __html: data.clients_recent.content }}></p>
                  <Button color="link">{data.clients_recent.button}</Button>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
        <FooterMain />
      </div>
    );
  }
}

export default AdvisorClient;
