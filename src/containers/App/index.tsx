import * as React from 'react';
import * as style from './style.css';
import { RouteComponentProps } from 'react-router';
import {  } from '../../components';
import * as $ from 'jquery';
import autobind from 'autobind-decorator';

import { microsoftTeams } from '../../microsoftTeams';

import { Properties } from '../../properties';
const {
  AzureApp: {
    clientId, authority, scopes,
    webApi, tenant, redirectUri
  }
} = Properties;

import {
  UserAgentApplication
} from 'msalx';

export namespace App {
  export interface Props extends RouteComponentProps<void> {}

  export interface State {
    isLoggedIn: boolean;
    accessToken: string;
  }
}

export class App extends React.Component<App.Props, App.State> {
  clientApplication = new UserAgentApplication(
    clientId, authority,
    (errDesc:string, token:string, err:string, tokenType: string) => {
      console.log(token);
      console.log(tokenType);
    }, { redirectUri }
  )

  // Using setTimeout because we don't want to Call this TOO Early
  callTeams = function() {
    return setTimeout(() => {
      microsoftTeams.authentication.authenticate({
        url: '/auth',
        width: 650,
        height: 550,
        successCallback: (t) => {
          // Note: token is only good for one hour
          this.setState({ accessToken: t });
          this.callApiWithToken({
            path: '/beta/me/outlook/events',
            accessToken: t
          });
        },
        failureCallback: function (err) { }
      });
    }, 250);
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      accessToken: null
    };
    microsoftTeams.initialize();
    if(window.self !== window.top) {
      this.callTeams();
    } else {
      if(this.clientApplication.isCallback(window.location.hash)) {
        this.clientApplication.handleAuthenticationResponse(
          window.location.hash
        );
      } else {
        this.clientApplication
          .loginPopup(scopes)
          .then(this.getAccessToken)
          .then((accessToken) =>
            this.callApiWithToken({
              path: '/me/calendar/events',
              accessToken
            }))
      }
    }
  }

  @autobind
  getAccessToken() {
    return this.clientApplication
      .acquireTokenSilent(scopes)
      .then((accessToken: string) => {
        // console.log(accessToken);
        this.setState({ accessToken });
        return accessToken;
      });
  }

  @autobind
  callApiWithToken({path, accessToken, method='get', todo={}}) {
    return $.ajax({
      url: webApi + path,
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(todo)
    }).then((resp: any) => {
      if(resp &&
         resp.error &&
         resp.error.message === 'Access Token has expired'
      ) {
        return this.getAccessToken().then((accessToken: string) => 
          this.callApiWithToken({ path, accessToken, method, todo }))
      } else {
        return resp;
      }
    });
  }

  @autobind
  actions({ action }) {}

  render() {
    const { children } = this.props;
    return (
      <div className={style.normal}>
        {children}
        <p>Authenticated</p>
      </div>
    );
  }
}
