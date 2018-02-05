import * as React from 'react';
import autobind from 'autobind-decorator';
import { Msal } from '../../middleware/azure';

microsoftTeams.initialize();
export class AuthDialog extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = { user: null };
    Msal.authEvent.on('auth-cb-complete', (data) => {
      if(data) {
        this.authCallback(data);
      } else {
        return Msal.getToken().then(this.authCallback);
      }
    });
  }

  componentWillMount() {
    if(Msal.callback(window.location.hash)) {
      Msal.handleAuth(window.location.hash);
    } else {
      microsoftTeams.getContext((context:any) => {
        if(context) {
          let user = context.upn;
          Msal.redirect(user);
        }
      })
    }
  }

  @autobind
  authCallback(accessToken:string) {
    this.setState({ user: Msal.user() });
    microsoftTeams.getContext((context: any) => {
      microsoftTeams.authentication.notifySuccess(
        JSON.stringify({
          accessToken,
          signedInUser: Msal.user().name,
          context
        })
      )
    });
  }

  render() {
    const user = this.state.user;
    const { name, identityProvider } = user;
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