// Packages
import React from 'react';
import { Button, Card, CardBody, CardTitle, CardText } from 'reactstrap';

// Styles
import "./BookAppointment.scss";

// Data
import data from './data.json';

class BookAppointment extends React.Component {
  render() {
    return (
      <div>
        <Card className="book-appointment">
          <CardBody>
            <img src="/images/any-virtual-health-logo.svg" alt="AnyVirtualHealth" />
            <CardTitle tag="h3" dangerouslySetInnerHTML={{__html: data.title}} />
            <CardText>{data.content}</CardText>
            <Button color="link" className="text-info">{data.button}</Button>
          </CardBody>        
        </Card>
      </div>
    );
  }
}

export default BookAppointment;
