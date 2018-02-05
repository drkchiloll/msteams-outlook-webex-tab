import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, Switch } from 'react-router';
import { createBrowserHistory } from 'history';

import {
  MuiThemeProvider,
  getMuiTheme,
  colors
} from 'material-ui/styles';

const {
  purple500, deepPurple500,
  deepPurple300, deepPurple200
} = colors;

const muiTheme = getMuiTheme({
  palette: {
    textColor: deepPurple300,
    primary1Color: deepPurple500,
    primary2Color: deepPurple500,
    primary3Color: deepPurple500
  },
  datePicker: {
    selectColor: deepPurple500,
    headerColor: deepPurple500,
    calendarTextColor: deepPurple300
  },
  textField: {
    floatingLabelColor: deepPurple300,
    focusColor: deepPurple300,
    hintColor: deepPurple300,
    textColor: deepPurple300
  },
  fontFamily: `'Times New Roman'`
});

import {
  App, AuthDialog, ConfigDialog, JoinWebEx, AdminConsent
} from './containers';

const history = createBrowserHistory();

ReactDOM.render(
  <MuiThemeProvider muiTheme={muiTheme}>
    <Router history={history}>
      <Switch>
        <Route exact path="/teams-webex" component={ App } />
        <Route path="/config" component={ ConfigDialog } />
        <Route path="/auth" component={ AuthDialog } />
        <Route path='/join-webex' component={JoinWebEx} />
        <Route path='/adminconsent' component={AdminConsent} />
      </Switch>
    </Router>
  </MuiThemeProvider>,
  document.getElementById('root')
);
