// Packages
import React, { useState } from 'react';

// Styles
import "./ThingsICanDo.scss";

const ThingsICanDo = (props) => {
  
  return (
    <div className="things-i-can-do">
      <a href="#">{props.text}</a>
    </div>
  );
};

export default ThingsICanDo;
