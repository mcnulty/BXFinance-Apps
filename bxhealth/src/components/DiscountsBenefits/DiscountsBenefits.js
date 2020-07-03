// Packages
import React from 'react';
import { Button, Card, CardBody, CardTitle, CardText } from 'reactstrap';

// Styles
import "./DiscountsBenefits.scss";

// Data
import data from './data.json';

class DiscountsBenefits extends React.Component {
  render() {
    return (
      <div>
        <Card className="discounts-events-module">
          <CardBody>
            <CardTitle tag="h3">{data.title}</CardTitle>
            <CardText>{data.content}</CardText>
            <a href="#" className="text-info">{data.button}</a>
          </CardBody>        
        </Card>
      </div>
    );
  }
}

export default DiscountsBenefits;
