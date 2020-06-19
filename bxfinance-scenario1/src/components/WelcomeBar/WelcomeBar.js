// Packages
import React from 'react';
import { Container, Row, Col } from 'reactstrap';

// Styles
import "./WelcomeBar.scss";

const WelcomeBar = (props) => {
  return (
    <div className="welcome-bar">
      <Container>
        <Row>
          <Col lg="12">
            <p>Welcome, Jane</p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default WelcomeBar;
