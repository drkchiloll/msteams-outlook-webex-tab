import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, Switch } from 'react-router';
import { createBrowserHistory } from 'history';

import { App, AuthDialog, ConfigDialog } from './containers';

const history = createBrowserHistory();

ReactDOM.render(
  <Router history={history}>
    <Switch>
      <Route exact path="/" component={ App } />
      <Route path="/config" component={ ConfigDialog } />
      <Route path="/auth" component={ AuthDialog } />
    </Switch>
  </Router>,
  document.getElementById('root')
);
