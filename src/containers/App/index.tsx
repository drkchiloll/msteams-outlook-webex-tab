import * as React from 'react';
import * as style from './style.css';
import { RouteComponentProps } from 'react-router';
import {  } from '../../components';
import * as $ from 'jquery';
import autobind from 'autobind-decorator';
import { initializeIcons } from '@uifabric/icons';
initializeIcons();
// initializeIcons('/api/icons/');

import * as moment from 'moment';
import * as momenttz from 'moment-timezone';

import {
  PrimaryButton,
  DefaultButton,
  ButtonType,
  Label,
  IButtonProps,
  Dialog,
  DialogContent,
  DialogType,
  DialogFooter,
  Nav,
  Panel,
  PanelType
} from 'office-ui-fabric-react';

import { microsoftTeams } from '../../microsoftTeams';

import { Properties } from '../../properties';
const {
  AzureApp: {
    clientId, authority, scopes,
    webApi, tenant, redirectUri,
    headers
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
    scheduleDialog: boolean;
    events: any;
    showPanel: boolean;
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
  actions({ action }) {}

  @autobind
  groups(events) {
    return [{
      links: Object.keys(events).map((key:string) => {
        let event: any = {};
        if(events[key].length > 0) {
          event['name'] = key;
          event['url'] = '';
          event.isExpanded = true;
          event['links'] = events[key].map((evt:any) => {
            return {
              name: `${evt.subject}: `+
                `${moment(evt.startDate).format('h:mm a')} - `+
                `${moment(evt.endDate).format('h:mm a')}`,
              url: '', icon: 'TeamsLogo'
            };
          })
          return event;
        } else {
          event['name'] = key;
          event['url'] = '';
          event['links'] = [{ name: 'No upcoming meetings', url: ''}];
          event.isExpanded = true;
          return event
        }
      })
    }];
    /*
    moment.utc('2017-12-28T20:30:00').format()
     * [{
     *  links: [
     *    { name: Today, url:'', links: [{}]},
     *    { name: Tomorrow, url:'', links: [{}]},
     *    { name: 'Wednesday 12/28', url: '', links}
     *    { name: Thursday 12/29, url:'', links}
     *    ]
     * }]
     */
  }

  render() {
    const { children } = this.props;
    return (
        <div className='ms-Grid'>
          <div className='ms-Grid-col ms-sm4'>
            <p style={{marginBottom: 0, marginLeft: '15px'}}>
              <strong>Agenda</strong>
            </p>
            <Panel 
              type={PanelType.smallFixedNear}
              isOpen={true}
              headerText='Panel'
              isBlocking={false}
              hasCloseButton={false}
              isHiddenOnDismiss={false}>
            <span>Content</span>
            </Panel>
            {/* <Nav
              className='uifabnav'
              ariaLabel='Agenda'
              groups={this.state.events}
            /> */}
            <div style={{ position: 'fixed', bottom: 0 }}>
              <hr />
              <DefaultButton
                style={{ marginBottom: '25px' }}
                primary={true}
                iconProps={{ iconName: 'Calendar' }}
                text={'Schedule a Meeting'}
                onClick={this.openScheduleDialog} />
            </div>
          </div>
        <Dialog
          hidden={this.state.scheduleDialog}
          onDismiss={this.closeScheduleDialog}
          dialogContentProps={{
            type: DialogType.largeHeader,
            title: 'Create Event',
            subText: 'Create a WebEx Conference'
          }}
          modalProps={{
            isBlocking: false,
            containerClassName: 'ms-dialogMainOverride'
          }}>
          <DialogFooter>
            <PrimaryButton onClick={this.closeScheduleDialog} text='Save' />
            <DefaultButton onClick={this.closeScheduleDialog} text='Cancel' />
          </DialogFooter>
        </Dialog>
      </div>
    );
  }
}
