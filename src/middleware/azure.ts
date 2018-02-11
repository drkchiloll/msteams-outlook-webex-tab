import { UserAgentApplication } from 'msx-silent';
import { EventEmitter } from 'events';
import * as Properties from '../../properties.json';
const { msApp: { clientId, scopes } } = Properties;

const client = new UserAgentApplication(
  clientId, null,
  (errDesc: string, token: string, err: string, tokenType: string) => {
    if(tokenType === 'id_token') {
      Msal.authEvent.emit('auth-cb-complete');
    }
  }, { cacheLocation: 'localStorage' }
);


export class Msal extends EventEmitter {
  public static authEvent = new EventEmitter();

  static callback(hash) {
    return client.isCallback(hash)
  }

  static handleAuth(hash) {
    client.handleAuthenticationResponse(hash);
  }

  static popup() {
    return client.loginPopup(['openid']);
  };

  static tokenRedirect() {
    const user = client.getUser();
    if(user) {
      client.acquireTokenRedirect(scopes);
    } else {
      this.redirect();
    }
  }

  static redirect(user?) {
    client.loginRedirect(scopes, `login_hint=${user}`);
  };

  static silent() {
    const user = client.getUser();
    return client.acquireTokenSilent(scopes, null, user)
      .catch((error: string) => ({ error }));
  }
 
  static getToken() {
    const user = client.getUser();
    return client.acquireTokenSilent(scopes, null, user)
      .catch((err) => alert(JSON.stringify(err)))
  };

  static user() {
    if(client.getUser()) {
      return client.getUser();
    } else {
      return { name: '', identityProvider: '' };
    }
  }

  static logout() {
    client.logout();
  }
}