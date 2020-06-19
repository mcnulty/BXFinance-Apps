import React from 'react';
import ReactDOM from 'react-dom';
import './styles/main.scss';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import Home from './pages/home';
import AccountsDashboard from './pages/accounts-dashboard';
import AccountsPayTransfer from './pages/pay-transfer/index';
import AccountsTransfer from './pages/pay-transfer/accounts-transfer';
import * as serviceWorker from './serviceWorker';

const routing = (
  <Router>
    <Switch>
      <Route path="/banking/pay-and-transfer">
        <AccountsPayTransfer />
      </Route>
      <Route path="/banking/transfer-money">
        <AccountsTransfer />
      </Route>
      <Route path="/banking">
        <AccountsDashboard />
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
