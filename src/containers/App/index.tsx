import * as React from 'react';
const { Component } = React;
import * as Promise from 'bluebird';
import * as style from './style.css';
import { RouteComponentProps } from 'react-router';
import autobind from 'autobind-decorator';
import { UserAgentApplication } from 'msalx';
import * as moment from 'moment';
import * as momenttz from 'moment-timezone';
import * as openSocket from 'socket.io-client';
import * as Properties from '../../../properties.json';

import {
  Api, WebExAuth, apiEmitter, time
} from '../../middleware';

const {
  msApp: {
    clientId, authority, scopes,
    webApi, tenant, redirectUri,
    headers, contentUrl, baseUrl
  }
} = Properties;

const socket = openSocket(baseUrl);

import {
  RaisedButton, FontIcon, Drawer,
  List, Subheader, ListItem,
  makeSelectable, TextField,
  DatePicker, SelectField, MenuItem,
  Paper, AutoComplete, Avatar,
  IconButton, Dialog, FlatButton,
  Menu
} from 'material-ui';

export namespace App {
  export interface Props extends RouteComponentProps<void> {}
  export interface State {
    accessToken: string;
    webExSettingsEditor: boolean;
    events: any;
    searchText: string;
    evtHtml: any;
    organizer: any;
    attendees: any;
    users: any;
    autoCompleteMenuHeight: any;
    newMeeting: any;
    newMeetingBtnLabel: string;
    webex: any;
    webExAuthResult: string;
    meetNowDialog: boolean;
    choiceDialog: boolean;
    hasSubentityId: boolean;
  }
}

import { Grid, Row, Col } from 'react-flexbox-grid';
import {
  EventForm, EventDates, WebExSettings,
  WebExMeetNowDialog, UserSearch, Participant
} from '../../components';

const initalState = {
  newMeeting: {
    title: '',
    newEvent: false,
    location: '',
    startDate: new Date(),
    endDate: new Date(),
    startTime: '',
    endTime: '',
    start: { dateTime: '', timeZone: '' },
    end: { dateTime: '', timeZone: '' }
  },
  attendees: []
};

export class App extends Component<App.Props, App.State> {
  clientApplication = new UserAgentApplication(
    clientId, authority,
    (errDesc:string, token:string, err:string, tokenType: string) => {
      alert(token);
      console.log(tokenType);
    }, { redirectUri: 'https://msteams-webexdev.ngrok.io/teams-webex' }
  )

  callTeams = function(fromEmitter?) {
    microsoftTeams.authentication.authenticate({
      url: '/auth',
      width: 575,
      height: 650,
      successCallback: (result) => {
        let {
          accessToken, signedInUser, context
        } = JSON.parse(result);
        this.authActions({
          accessToken, signedInUser, context, fromEmitter
        }).then(() => {
          this.setState({ accessToken });
          if(this.state.webex.webExId) {
            this.getEvents();
          }
          if(!this.api.graphService.verifySubscription()) {
            return this.api.graphService.createSubscription();
          } else {
            return;
          }
        })
      },
      failureCallback: function(err) { alert(err.toString()) }
    });
  }

  api:Api = null;

  constructor(props) {
    super(props);
    this.state = {
      accessToken: null,
      webExSettingsEditor: false,
      evtHtml: this._renderEvents(time.uidates()),
      events: time.uidates(),
      newMeeting: {
        title: '',
        newEvent: false,
        location: '',
        startDate: new Date(),
        endDate: new Date(),
        startTime: '',
        endTime: '',
        start: { dateTime: '', timeZone: ''},
        end: { dateTime: '', timeZone: ''}
      },
      searchText: '',
      users: null,
      autoCompleteMenuHeight: 25,
      organizer: null,
      attendees: [],
      newMeetingBtnLabel: 'Schedule Meeting',
      webex: { webExId: '', webExPassword: '' },
      webExAuthResult: '',
      meetNowDialog: false,
      choiceDialog: true,
      hasSubentityId: true
    };
    this.api = new Api();
    this.api.initialize();
    socket.on('notification_received', (data: any) => {
      let { events } = this.state;
      const graphDelete = data.value.find(change => change.changeType==='deleted');
      let matchedEvent: any;
      if(graphDelete) {
        const eventId = graphDelete.resourceData.id;
        // This Cancels the WebEx Meeting
        return this.api.graphService
          .handleSubscriptionDeletion(eventId, events)
          .then((event) => {
            matchedEvent = event;
            if(matchedEvent.webExMeetingKey && matchedEvent.isOrganizer) {
              return this.api.webExDeleteMeeting(matchedEvent.webExMeetingKey);
            } else {
              return;
            }
          }).then(() => {
            events[matchedEvent.prop].splice(matchedEvent.index, 1);
            let evtHtml = this._renderEvents(events);
            this.setState({ events, evtHtml });
          });
      } else {
        let { newMeetingBtnLabel } = this.state;
        newMeetingBtnLabel = 'Schedule Meeting';
        this.setState({
          newMeeting: initalState.newMeeting,
          attendees: initalState.attendees,
          newMeetingBtnLabel
        });
        this.getEvents();
      }
    });
    microsoftTeams.initialize();
    apiEmitter.on('401', () => {
      this.callTeams(true);
    });
  }

  componentWillMount() {
    microsoftTeams.getContext((context: microsoftTeams.Context) => {
      if(context.subEntityId) {
        window.location.pathname = '/join-webex';
      } else {
        this.setState({ hasSubentityId: false });
      }
    });
    // Clear LocalStorage
    // this.api.resetLocalStorage();
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ choiceDialog: false });
      this.credCheck();
    }, 1500);
    apiEmitter.on('newevent', ({ prop, event }) => {
      let { events } = this.state;
      if(event.isCancelled) {
        this.api.graphService.deleteEvent(event.id);
      }
      if(!events[prop].find(({ id }) => id === event.id)) {
        events[prop].push(event);
        events[prop].sort((a: any, b: any) => {
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        });
        const evtHtml = this._renderEvents(events);
        this.setState({ events, evtHtml });
      }
    });
  }

  @autobind
  credCheck() {
    let { accessToken, webExSettingsEditor, webex } = this.state;
    if(!this.api.webex) {
      webExSettingsEditor = true;
      this.setState({ webExSettingsEditor });
    } else {
      this.setState({ webex: this.api.webex });
    }
    if(!accessToken && this.api.token && this.api.signedInUser)
      this.setState({ accessToken: this.api.token });
    if(this.api.token) {
      //Check if it's still Good
      this.api
        .graphService
        .getMe()
        .then((resp: any) => {
          if(resp && resp.status) {
            this.callTeams();
          } else {
            if(!this.api.graphService.verifySubscription()) {
              return this.api.graphService.createSubscription();
            } else {
              return;
            }
          }
        }).then(() => {
          if(this.api.webex.webExId || this.api.webex.webExPassword) {
            return this.getEvents()
          }
        })
    } else {
      let isInIFrame: boolean = top.location != self.location
      if(isInIFrame) this.callTeams();
      else {
        this.clientApplication
          .loginPopup(scopes)
          .then((value) => {})
      }
    }
  }

  @autobind
  authActions({ accessToken, signedInUser, context={}, fromEmitter=false }) {
    this.api.setToken(accessToken);
    this.api.setUser(signedInUser);
    if(Object.keys(context).length > 0) {
      this.api.setTeamsContext(context);
    }
    if(fromEmitter) apiEmitter.emit('authenticated');
    this.api.initialize();
    return Promise.resolve(null);
  }

  @autobind
  scheduleEvent() {
    let { organizer, newMeeting } = this.state;
    newMeeting.newEvent = true;
    if(!organizer) {
      return this.api.graphService
        .getMe()
        .then((me) => {
          organizer = me;
          organizer['me'] = true;
          return this.api.graphService.getUserPhoto(organizer.id);
        }).then((binaryImg: any) => {
          if(binaryImg) {
            organizer.photo = binaryImg;
          }
          this.setState({ newMeeting, organizer });
        });
    } else {
      this.setState({ newMeeting });
    }
  }

  @autobind
  eventFormHandler(name, value) {
    let { newMeeting } = this.state;
    newMeeting[name] = value;
    this.setState({ newMeeting });
  }

  @autobind
  addParticipant(attendee) {
    let { attendees } = this.state;
    attendees.unshift(attendee);
    this.setState({ attendees });
  }

  @autobind
  removeParticipant(attendeeId) {
    let { attendees } = this.state;
    let idx = attendees.findIndex(attendee =>
      attendee.id === attendeeId);
    attendees.splice(idx, 1);
    this.setState({ attendees });
  }

  render() {
    const admin = JSON.parse(JSON.stringify(this.state.organizer)) || '';
    const attendees = JSON.parse(JSON.stringify(this.state.attendees));
    return (
      <div>
        <Dialog
          title='Schedule New Meeting'
          modal={false}
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}
          open={this.state.newMeeting.newEvent}
          style={{
            position: 'relative', maxWidth: 'none', top: 0
          }}
          actions={[
            <FlatButton
              label='Cancel'
              primary={true}
              onClick={() => {
                this.eventFormHandler('newEvent', false);
              }} />,
            <FlatButton
              primary={true}
              disabled={!this.state.newMeeting.title}
              label={
                this.state.newMeetingBtnLabel ||
                <i className='mdi mdi-rotate-right mdi-spin mdi-18px'
                  style={{
                    marginLeft: '10px', verticalAlign: 'middle', color: '#673AB7'
                  }} />
              }
              onClick={this.createMeeting} />
          ]} >
          <Grid>
            <EventForm inputChange={this.eventFormHandler} />
            <EventDates
              inputChange={this.eventFormHandler}
              {...this.state.newMeeting}
              api={this.api} />
            <Row>
              <Col xsOffset={6} xs={5}>
                <div style={{ marginTop: '5px' }}>
                  <Subheader>Organizer</Subheader>
                  {
                    admin ?
                      <Participant user={admin} />
                      :
                      <div></div>
                  }
                  <Menu maxHeight={290} >
                    <Subheader>Participants</Subheader>
                    {
                      attendees.length > 0 ?
                        attendees.map((attendee: any) =>
                          (<Participant
                            key={attendee.id}
                            user={attendee}
                            remove={this.removeParticipant}
                          />))
                        :
                        null
                    }
                  </Menu>
                </div>
              </Col>
            </Row>
            <Row>
              <Col sm={12} >
                <div style={{
                  position: 'absolute',
                  top: 285,
                  width: '37%'
                }}>
                  <UserSearch api={this.api} addAttendee={this.addParticipant} />
                </div>
              </Col>
            </Row>
          </Grid>
        </Dialog>
        <Dialog title={
          <span className='mdi mdi-cisco-webex mdi-18px'>
            &nbsp;Welcome
          </span>}
          open={this.state.choiceDialog && !this.state.hasSubentityId}>
          <br/>
          This application requires Authorization and Authentication to your Office 365 Organization
          with certain permissions granted such as Reading User Data and the ability to Create Events in Outlook.
          This action also enables the Application to get Team members and/or lookup and add other users within
          your organization to a Meeting; If you have previously Authenticated and your Credentials haven't expired
          you will not be required to Authenticate again until such time your access token expires.
        </Dialog>
        <div style={{
          display: this.state.choiceDialog ? 'none' : 'inline-block',
          fontSize: '90%'
        }}>
          <Drawer
            docked={true}
            width={285}
            open={true} >
            {this.state.evtHtml}
            <div style={{ display: this.state.events ? 'inline-block': 'none' }}>
              <RaisedButton
                label='Schedule A Meeting'
                style={{
                  bottom: 2, position: 'relative', marginTop: '15px'
                }}
                fullWidth={true}
                labelPosition='after'
                icon={<i style={{ color: '#D1C4E9' }} className="mdi mdi-calendar mdi-18px" />}
                primary={true}
                onClick={this.scheduleEvent} />
              <WebExMeetNowDialog
                api={this.api}
                webex={this.state.webex}/>
            </div>
          </Drawer>
        </div>
        <WebExSettings
          api={this.api}
          webex={this.state.webex}
          open={this.openWebExSettings}
          save={this.saveWebExSettings}
          authResult={this.state.webExAuthResult}
          close={this.closeWebExSettings}
          onWebExChange={this.handleWebExInputs}
          webExSettingsEditor={this.state.webExSettingsEditor} />
      </div>
    );
  }

  @autobind
  createMeeting() {
    this.setState({ newMeetingBtnLabel: null });
    let { newMeeting, attendees } = this.state;
    let outlookEvent: any = this.api.graphService.generateMeetingRequest(newMeeting, attendees);
    const webExEvent: any = this.api.webExGenerateMeetingRequest({
      startDate: outlookEvent.start.dateTime,
      subject: outlookEvent.subject,
      duration: null,
      attendees
    });
    return this.api
      .webExCreateMeeting(webExEvent)
      .then(({ meetingKey }) => {
        outlookEvent['body'] = {
          contentType: 'text',
          content: meetingKey
        };
        return this.api.graphService.createEvent(outlookEvent);
      });
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
    this.api.graphService.getEvents();    
  }

  @autobind
  _renderEvents(events) {
    return (
      <List>
        <Subheader>Agenda</Subheader>
        {
          Object.keys(events).map((key, i) => {
            return (
              <ListItem
                key={`${i}_listItem`}
                primaryText={key}
                initiallyOpen={(() => {
                  // if(events[key].length === 0) return false;
                  // else return true;
                  return true;
                })()}
                innerDivStyle={{
                  fontSize: '90%',
                  marginLeft: '2px'
                }}
                style={{ height: 39 }}
                primaryTogglesNestedList={true}
                nestedItems={this.nestedEvent(events[key])}
              />
            )
          })
        }
      </List>
    );
  }

  @autobind
  handleWebExInputs(propName, value) {
    let { webex, webExAuthResult } = this.state;
    if(propName === 'authResult') {
      this.setState({ webExAuthResult: '' });
    } else {
      webex[propName] = value;
      this.setState({ webex });
    }
  }

  @autobind
  openWebExSettings() {
    this.setState({ webExSettingsEditor: true });
  }

  @autobind
  saveWebExSettings() {
    let { webex } = this.state;
    return this.api
      .webExAuthentication(webex)
      .then(result => {
        if(result && result.authentication) {
          if(result.authentication === 'SUCCESS') {
            localStorage.setItem('webex', JSON.stringify(this.state.webex));
            this.api.initialize();
            this.getEvents();
          }
          this.setState({ webExAuthResult: result.authentication });
        } else {
          this.setState({ webExAuthResult: 'unknown error' });
        }
      });
  }

  @autobind
  closeWebExSettings() {
    this.setState({ webExSettingsEditor: false });
  }

  @autobind
  nestedEvent(events) {
    if(events.length === 0) {
      return [(
        <ListItem
          primaryText={'No upcoming meetings'}
          key='upMeet_0'
          open={true}
          // disabled
          style={{height: 35}}
          innerDivStyle={{
            fontSize: '90%',
            paddingTop: 10,
            paddingBottom: 10,
            marginBottom: 0
          }} />
      )];
    } else {
      return events.map(evt => {
        return (
          <ListItem
            key={evt.id}
            value={evt.id}
            innerDivStyle={{
              fontSize: '90%',
              borderLeft: 'solid 4px #673AB7',
              marginLeft: 30,
              marginBottom: 10,
              height: 33
            }}
            primaryText={
              <div style={{top: 8, position: 'absolute'}}>
                {evt.subject}<br/>
                {moment(new Date(evt.startDate)).format('h:mm a')}
                {' - ' + moment(new Date(evt.endDate)).format('h:mm a')} <br/>
                <FontIcon
                  className='mdi mdi-cisco-webex mdi-18px'
                  color='rgb(55,103,52)' />
                &nbsp;Cisco WebEx Meeting
              </div>
            }
            rightIconButton={
              <RaisedButton
                labelStyle={{ fontSize: '90%' }}
                disabled={!evt.joinUrl}
                style={{
                  marginTop: '15px', marginRight: '10px',
                  width: '60px', minWidth: '60px'
                }}
                label='Join'
                onClick={() => {
                  window.open(evt.joinUrl, '_newtab');
                }} />
            }
            secondaryTextLines={2} />
        );
      })
    }
  }
}
