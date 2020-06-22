// Packages
import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom'
import classNames from "classnames";

// Styles
import "./AccountsSectionNav.scss";

const AccountsSectionNav = (props) => {
  
  return (
    <div className={classNames("accounts-section-nav", { "white": props.data.white }, { "curved": props.data.curved })}>
      <div className="accounts-section-nav-text">
        <h4>{props.data.title}</h4>
        <p>{props.data.description}</p>
      </div>
      <Link to={props.data.button_href}><Button color="primary">{props.data.button_text}</Button></Link>
    </div>
  );
};

export default AccountsSectionNav;
