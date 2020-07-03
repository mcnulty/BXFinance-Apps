import React from 'react';
import ReactDOM from 'react-dom';
import './styles/main.scss';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import Home from './pages/home';
import Dashboard from './pages/dashboard';
import ClassesEvents from './pages/classes-events';
import ProfileSettings from './pages/profile-settings';
import CommunicationPrefernces from './pages/profile-settings/communications-preferences';
import CaregiverAccess from './pages/profile-settings/caregiver-access';
import AnyVirtualHealth from './pages/any-virtual-health';
import * as serviceWorker from './serviceWorker';

const routing = (
  <Router basename={`${process.env.PUBLIC_URL}`}>
    <Switch>
      <Route path="/dashboard/profile-settings">
        <ProfileSettings />
      </Route>
      <Route path="/dashboard/caregiver-access">
        <CaregiverAccess />
      </Route>
      <Route path="/dashboard/communication-preferences">
        <CommunicationPrefernces />
      </Route>
      <Route path="/dashboard">
        <Dashboard />
      </Route>
      <Route path="/classes-events">
        <ClassesEvents />
      </Route>
      <Route path="/any-virtual-health">
        <AnyVirtualHealth />
      </Route>
      <Route path="/">
        <Home />
      </Route>
    </Switch>
  </Router>
)

ReactDOM.render(routing, document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
