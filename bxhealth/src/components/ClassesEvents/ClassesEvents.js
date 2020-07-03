// Packages
import React from 'react';
import { Button, Card, CardBody, CardTitle, CardText } from 'reactstrap';

// Styles
import "./ClassesEvents.scss";

// Data
import data from './data.json';

class ClassesEvents extends React.Component {
  render() {
    return (
      <div>
        <Card className="classes-events-module">
          <CardBody>
            <CardTitle tag="h3">{data.title}</CardTitle>
            <CardText>{data.content}</CardText>
            <Button href="/classes-events" color="link" className="text-info">{data.button}</Button>
          </CardBody>        
        </Card>
      </div>
    );
  }
}

export default ClassesEvents;
