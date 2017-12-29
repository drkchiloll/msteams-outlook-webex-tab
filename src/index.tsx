import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, Switch } from 'react-router';
import { createBrowserHistory } from 'history';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {
  purple500, deepPurple500, deepPurple200
} from 'material-ui/styles/colors';

const muiTheme = getMuiTheme({
  palette: {
    textColor: deepPurple200,
    primary1Color: deepPurple500
  },
  appBar: {
    height: 50,
  }
});

import { App, AuthDialog, ConfigDialog } from './containers';

const history = createBrowserHistory();

ReactDOM.render(
  <MuiThemeProvider muiTheme={muiTheme}>
    <Router history={history}>
      <Switch>
        <Route exact path="/" component={ App } />
        <Route path="/config" component={ ConfigDialog } />
        <Route path="/auth" component={ AuthDialog } />
      </Switch>
    </Router>
  </MuiThemeProvider>,
  document.getElementById('root')
);

/*
border-left: thick solid #ff0000; 66 150 55
*/
