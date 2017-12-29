import * as React from 'react';
import * as style from './style.css';
import { RouteComponentProps } from 'react-router';
import {  } from '../../components';
import * as $ from 'jquery';
import autobind from 'autobind-decorator';
import { UserAgentApplication } from 'msalx';
import * as moment from 'moment';
import * as momenttz from 'moment-timezone';
import { microsoftTeams } from '../../microsoftTeams';
import { Properties } from '../../properties';
const {
  AzureApp: {
    clientId, authority, scopes,
    webApi, tenant, redirectUri,
    headers
  }
} = Properties;

export namespace App {
  export interface Props extends RouteComponentProps<void> {}

  export interface State {
    isLoggedIn: boolean;
    accessToken: string;
    scheduleDialog: boolean;
    events: any;
    showPanel: boolean;
  }
}

import {
  RaisedButton,
  FontIcon,
  Drawer,
  List,
  Subheader,
  ListItem,
  makeSelectable
} from 'material-ui';

const SelectableList = makeSelectable(List);

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
          this.getEvents();
          // this.callApiWithToken({
          //   path: '/beta/me/outlook/events',
          //   accessToken: t
          // });
        },
        failureCallback: function (err) { }
      });
    }, 250);
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      accessToken: null,
      scheduleDialog: true,
      events: null,
      showPanel: false
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
          .then((accessToken) => {
            this.setState({ accessToken });
            return this.getEvents();
            // this.callApiWithToken({
            //   path: '/me/calendar/events',
            //   accessToken
          });
      }
    }
  }

  render() {
    const { children } = this.props;
    return (
      <div>
        <Drawer
          docked={true}
          width={315}
          open={true} >
          <p style={{
            marginLeft: '20px'
          }}>Agenda</p>
          {this.state.events || (<div></div>)}
          <RaisedButton
            label='Schedule A Meeting'
            style={{ bottom: 30, position: 'fixed'}}
            fullWidth={true}
            labelPosition='after'
            icon={<i style={{color: '#D1C4E9'}} className='fa fa-calendar fa-lg'/>}
            primary={true}/>
        </Drawer>
      </div>
    );
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
  getEvents() {
    this.callServer({
      method: 'get'
    });
  }

  @autobind
  openScheduleDialog() {
    this.setState({ scheduleDialog: false });
  }

  @autobind
  closeScheduleDialog() {
    this.setState({ scheduleDialog: true });
  }

  @autobind
  callServer({ method, body={}}) {
    let url = `https://4579cec4.ngrok.io/api/outlook-events`;
    if(method === 'get') {
      url += `?token=${this.state.accessToken}` +
        `&timezone=${momenttz.tz.guess()}`;
    }
    return $.ajax({
      url,
      method,
      headers,
      data: JSON.stringify(body),
    }).then((resp: any) => {
      let events = this.groups(resp);
      this.setState({ events });
    })
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
  nestedEvent(events) {
    return events.map(evt => {
      return (
        <ListItem
          key={evt.id}
          value={evt.id}
          style={{top: 0}}
          innerDivStyle = {{
            height: 55, borderLeft: 'solid 4px #673AB7',
            margin: '0px 0 12px 20px'}}
          primaryText={evt.subject}
          rightIconButton={
            <RaisedButton
              style={{marginTop:'25px', width: 50}}
              label='Join' />
          }
          secondaryText={
            <div>
              {moment(new Date(evt.startDate)).format('h:mm a')} - 
              {moment(new Date(evt.endDate)).format('h:mm a')} <br/>
              <FontIcon className='mdi mdi-light mdi-cisco-webex mdi-18px' color='#429637' />
              &nbsp;Cisco WebEx Meeting
            </div>
          }
          secondaryTextLines={2} />
      );
    })
  }

  @autobind
  groups(events) {
    return (
      <List>
        {
          Object.keys(events).map((key, i) => {
            return (
              <ListItem
                key={`${i}_listItem`}
                primaryText={key}
                initiallyOpen={true}
                primaryTogglesNestedList={true}
                nestedItems={this.nestedEvent(events[key])} />
            )
          })
        }
      </List>
    );
  }
}
