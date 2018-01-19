import * as React from 'react';
import autobind from 'autobind-decorator';
import {
  UserAgentApplication
} from 'msalx';

// The Following File Needs to be Updated for your App
import * as Properties from '../../../properties.json';

let {
  msApp: {
    clientId, authority, scopes,
    webApi, tenant, redirectUri
  }
} = Properties;

microsoftTeams.initialize();

export class AuthDialog extends React.Component<any, any> {
  clientApplication = new UserAgentApplication(
    clientId, authority,
    (errDesc: string, token: string, err: string, tokenType: string) => {
      // console.log(token);
      // console.log(tokenType);
      if(tokenType === 'id_token') {
        this.setState({ isLoggedIn: true });
        this.getToken();
      }
    }
  )
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      counter: 5
    };
  }

  componentWillMount() {
    if(this.clientApplication.isCallback(window.location.hash)) {
      // console.log('callback');
      this.clientApplication.handleAuthenticationResponse(
        window.location.hash
      );
    } else {
      this.clientApplication.loginRedirect(scopes);
    }
  }

  getToken() {
    this.clientApplication
      .acquireTokenSilent(scopes)
      .then((accessToken: string) => {
        microsoftTeams.getContext((context:any) => {
          microsoftTeams.authentication.notifySuccess(JSON.stringify({
            accessToken,
            signedInUser: this.clientApplication.getUser().name,
            context
          }));
        })
      });
  }

  render() {
    const user = this.clientApplication.getUser();
    const { name, identityProvider, } = user;
    return (
      <div>
        {
          <section className="ms-Persona ms-Persona--header">
            <div className="ms-Persona ms-Persona--xl">
              <div className="ms-Persona-details">
                <p className="ms-font-m">
                  { name ? `Authorized As` : 'Welcome Admin' }
                </p>
                <p className="ms-font-xxl"
                  style={{display : name ? 'inline' : 'none' }}>
                  <strong>{name}</strong>
                </p>
                <p className="ms-font-m-plus">
                  { name ? identityProvider : 'Authorizing' }
                </p>
              </div>
            </div>
          </section>
        }
      </div>
    );
  }
}