// Packages
import React from 'react';
import { Button, Card, CardBody, CardTitle, CardText } from 'reactstrap';

// Styles
import "./CardRewards.scss";

// Data
import data from './data.json';

class CardRewards extends React.Component {
  render() {
    return (
      <div>
        <Card className="card-rewards">
          <CardBody>
            <CardTitle tag="h3">{data.title}</CardTitle>
            <CardText>{data.content}</CardText>
            <Button color="link" className="text-info">{data.button}</Button>
          </CardBody>
          <img src={process.env.PUBLIC_URL + "/images/home-hero-card.png"} className="img-credit-card" alt="card" />
        </Card>
      </div>
    );
  }
}

export default CardRewards;
