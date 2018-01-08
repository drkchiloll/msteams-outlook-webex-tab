import * as React from 'react';
import * as Promise from 'bluebird';
import * as style from './style.css';
import { RouteComponentProps } from 'react-router';
import * as $ from 'jquery';
import autobind from 'autobind-decorator';
import { UserAgentApplication } from 'msalx';
import * as moment from 'moment';
import * as momenttz from 'moment-timezone';
import { microsoftTeams } from '../../microsoftTeams';
import { Properties } from '../../properties';
import * as openSocket from 'socket.io-client';
const {
  AzureApp: {
    clientId, authority, scopes,
    webApi, tenant, redirectUri,
    headers
  }
} = Properties;

const socket = openSocket(redirectUri);

import {
  RaisedButton, FontIcon, Drawer,
  List, Subheader, ListItem,
  makeSelectable, TextField,
  DatePicker, SelectField, MenuItem,
  Paper, AutoComplete, Avatar,
  IconButton
} from 'material-ui';

export namespace App {
  export interface Props extends RouteComponentProps<void> {}

  export interface State {
    signedInUser: string;
    isLoggedIn: boolean;
    accessToken: string;
    webExSettingsEditor: boolean;
    events: any;
    showPanel: boolean;
    searchText: string;
    evtHtml: any;
    organizer: any;
    attendees: any;
    users: any;
    autoCompleteMenuHeight: any;
    newMeeting: any;
    newMeetingBtnLabel: string;
    webex: any;
  }
}

import { Grid, Row, Col } from 'react-flexbox-grid';
import {
  EventForm, EventDates, WebExSettings
} from '../../components';

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
        width: 575,
        height: 650,
        successCallback: ({
          accessToken, signedInUser
        }) => {
          // Note: token is only good for one hour
          let webex: any;
          webex = JSON.parse(localStorage.getItem('webex'));
          if(!webex) webex = {};
          this.setState({ accessToken, signedInUser, webex });
          if(this.state.webex.webExId) {
            return this.getEvents();
          } else {
            this.openWebExSettings();
          }
        },
        failureCallback: function (err) { }
      });
    }, 250);
  }

  usersHtml(users?) {
    if(!this.state.searchText && !users) {
      return [{
        text: this.state.searchText,
        value: <MenuItem primaryText={''} />
      }];
    } else if(!this.state.users && !users) {
      return [{
        text: this.state.searchText,
        value: (
          <MenuItem
            // style={{margin: 0, padding: 0, height: '10px'}}
            primaryText={
              <div style={{
                verticalAlign: 'middle',
                marginTop: '-20px',
                marginLeft: '100px',
                color: '#9575CD'
              }}>
                <i className='mdi mdi-rotate-right mdi-spin mdi-18px'/>
              </div>
            } />
        )
      }];
    } else {
      return users.map((user, i) => {
        return {
          text: this.state.searchText,
          value: (
            <MenuItem key={`user_${i}`}
              primaryText={<div>{user.displayName}</div>} />
          )
        }
      })
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      signedInUser: '',
      isLoggedIn: false,
      accessToken: null,
      webExSettingsEditor: false,
      evtHtml: <div></div>,
      events: null,
      showPanel: false,
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
      webex: { webExId: '', webExPassword: '' }
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
            let signedInUser = this.clientApplication.getUser().name;
            this.setState({ accessToken, signedInUser });
          });
      }
    }
    socket.on('notification_received', (data: any) => {
      let { newMeeting } = this.state;
      this.getEvents().then(() => {
        newMeeting.newEvent = false;
        this.setState({
          newMeeting,
          newMeetingBtnLabel: 'Schedule Meeting'
        });
      });
    });
  }

  componentWillMount() {
    // localStorage.removeItem('webex');
  }

  @autobind
  scheduleEvent() {
    let { organizer, newMeeting } = this.state;
    newMeeting.newEvent = true;
    if(!organizer) {
      this.callServer({
        method: 'get',
        path: 'users',
        query: `&users=${this.state.signedInUser}`
      }).then(({ value }: any) => {
        let organizer = value[0];
        this.callServer({
          method: 'get',
          path: `users/${organizer.id}/photo`
        }).then((binaryImg: any) => {
          if(binaryImg && !binaryImg.message) {
            let img = new Buffer(binaryImg, 'binary').toString('base64');
            organizer.photo = 'data:image/jpg;base64,' + img;
          }
          this.setState({
            newMeeting,
            organizer
          });
        });
      });
    } else {
      this.setState({ newMeeting });
    }
  }

  @autobind
  eventFormHandler(name, value) {
    if(name === 'endDate') alert(value);
    let { newMeeting } = this.state;
    newMeeting[name] = value;
    this.setState({ newMeeting });
    // alert(JSON.stringify(this.state.newMeeting));
  }

  formatTime(date:string, time:string) {
    if(time.split(' ')[1] === 'am') {
      switch(time.split(':')[0]) {
        case '12':
          return date + 'T' + '00:' + time.split(':')[1].split(' ')[0];
        case '11':
        case '10':
          return date + 'T' + time.split(' ')[0];
        default:
          return date + 'T' + '0' + time.split(' ')[0];
      }
    } else {
      switch(time.split(':')[0]) {
        case '12':
          return date + 'T' + time.split(' ')[0];
        default:
          return date + 'T' + (parseInt(time.split(':')[0],10) + 12) + 
            ':' + time.split(':')[1].split(' ')[0];
      }
    }
  }

  @autobind
  normalizeDates() {
    let { newMeeting:
      {startDate, startTime, endDate, endTime}
    } = this.state;
    let start = moment(startDate).format('YYYY-MM-DD'),
        end = moment(endDate).format('YYYY-MM-DD');
    return {
      start: {
        dateTime: moment(this.formatTime(start, startTime)).format('YYYY-MM-DDTHH:mm:ss'),
        timeZone: momenttz.tz(momenttz.tz.guess()).format('z')
      },
      end: {
        dateTime: moment(this.formatTime(end, endTime)).format('YYYY-MM-DDTHH:mm:ss'),
        timeZone: momenttz.tz(momenttz.tz.guess()).format('z')
      }
    };
  }

  @autobind
  attendeeSelector(input, index) {
    let { users, attendees } = this.state;
    let selectedUser = users[index];
    return this.callServer({
      method: 'get',
      path: `users/${selectedUser.id}/photo`
    }).then((binaryImg: any) => {
      if(binaryImg && !binaryImg.message) {
        let img = new Buffer(binaryImg, 'binary').toString('base64');
        selectedUser.photo = `data:image/jpg;base64,${img}`;
      }
      return selectedUser;
    }).then(() => {
      // Check Availability
      let req:any = {
        timeZone: momenttz.tz.guess(),
        attendees: [{
          type:'required',
          emailAddress: {
            name: selectedUser.displayName,
            address: selectedUser.mail
          }
        }],
        ...this.normalizeDates(),
        percentage: '80'
      };
      return this.callServer({
        method: 'post',
        path: `outlook-conflict-finder`,
        body: req
      });
    }).then((result:any) => {
      if(result.emptySuggestionsReason) {
        selectedUser.status = 'busy';
      } else {
        selectedUser.status = 'free';
      }
      attendees.push(selectedUser);
      this.setState({ attendees });
      this.setState({
        searchText: '',
        users: null,
        autoCompleteMenuHeight: 25
      });
    })
  }

  render() {
    const { children } = this.props;
    return (
      <div>
        <div style={{fontSize: '90%'}}>
          <Drawer
            docked={true}
            width={300}
            open={true} >
            {this.state.evtHtml}
            <RaisedButton
              label='Schedule A Meeting'
              style={{
                bottom: 25, position: 'relative', marginTop: '15px',
                display: this.state.events ? 'inline-block' : 'none'
              }}
              fullWidth={true}
              labelPosition='after'
              icon={<i style={{ color: '#D1C4E9' }} className="mdi mdi-calendar mdi-18px" />}
              primary={true}
              onClick={this.scheduleEvent} />
          </Drawer>
        </div>
        <Paper style={{
          left: 305, position: 'fixed', top: 0, height: 'auto',
          display: this.state.newMeeting.newEvent ? 'inline-block' : 'none',
          width: 650
        }} zDepth={2} >
          <Grid fluid>
            <EventForm inputChange={this.eventFormHandler}/>
            <EventDates
              inputChange={this.eventFormHandler}
              {...this.state.newMeeting} />
            <Row>
              <Col sm={4} >
                <AutoComplete
                  floatingLabelText='Invite someone'
                  menuStyle={{ height: this.state.autoCompleteMenuHeight, margin: 0, padding: 0 }}
                  listStyle={{ maxHeight: 200, overflow: 'auto' }}
                  filter={AutoComplete.noFilter}
                  dataSource={this.usersHtml(this.state.users)}
                  onUpdateInput={(text: string) => {
                    if(!text) 
                      return this.setState({
                        searchText: '',
                        users: null,
                        autoCompleteMenuHeight: 25
                      });
                    this.setState({ searchText: text });
                    this.callServer({
                      method: 'get',
                      path: 'users',
                      query: `&users=${text}`
                    }).then(({value}:any) => {
                      if(value.length === 0) {
                        value.push({
                          id: '0',
                          displayName: `We didn't find any matches`
                        });
                      }
                      this.setState({ users: value, autoCompleteMenuHeight: 'auto' });
                    });
                  }}
                  onNewRequest={this.attendeeSelector}
                  searchText={this.state.searchText}
                  openOnFocus={true} />
              </Col>
            </Row>
            <Row>
              <Col xs={5}><h4>Organizer</h4></Col>
            </Row>
            <Row>
              <Col xs={5}>
                  { this.state.organizer ?
                    <Paper style={{
                      display: 'inline-block',
                      margin: '0 32px 16px 0',
                      width: 250
                    }}>
                      <div style={{ margin: '10px 5px 10px 10px' }}>
                        <Row>
                          <Col xs={3}>
                            <Avatar src={this.state.organizer.photo} />
                          </Col>
                          <Col xs={8}>
                            <Row><Col xs={9}>{this.state.organizer.displayName}</Col></Row>
                            <Row><Col xs={3}><em>Organizer</em></Col></Row>
                          </Col>
                        </Row>
                      </div>
                    </Paper>
                    :
                    <div></div>}
              </Col>
            </Row>
            <Row>
              <Col xs={8}><h4>Participants</h4></Col>
            </Row>
            <Row>
              <Col xs={8}>
                {
                  this.state.attendees.length > 0 ?
                  this.state.attendees.map((attendee) => {
                    if(!attendee) return;
                    return (
                      <Paper style={{
                        display: 'inline-block',
                        margin: '0 32px 16px 0',
                        width: 250
                      }}
                        key={attendee.id} >
                        <div style={{ margin: '10px 5px 10px 10px' }}>
                          <Row>
                            <Col xs={2}>
                              {
                                attendee.photo ?
                                  <Avatar src={attendee.photo} /> :
                                  <Avatar color='#D1C4E9' backgroundColor='#673AB7'>
                                    {
                                      attendee.displayName.split(' ')[0].substring(0, 1).toUpperCase() +
                                      attendee.displayName.split(' ')[1].substring(0, 1).toUpperCase()
                                    }
                                  </Avatar>
                              }
                            </Col>
                            <Col xs={7}>
                              <div style={{ marginLeft: '15px' }}>
                                <Row><Col xs={12}>{attendee.displayName}</Col></Row>
                                <Row>
                                  <Col xs={12}>
                                    <em style={{
                                      color: attendee.status==='busy' ? 'red': ''
                                    }}>
                                      {attendee.status}
                                    </em>
                                  </Col>
                                </Row>
                              </div>
                            </Col>
                            <Col xs={2}>
                                <IconButton
                                  style={{ bottom: 5, position: 'relative' }}
                                  iconClassName='mdi mdi-close mdi-18px'
                                  onClick={() => {
                                    let { attendees } = this.state;
                                    let attendeeIdx = attendees.findIndex(att => 
                                      att.id === attendee.id)
                                    attendees.splice(attendeeIdx, 1);
                                    this.setState({ attendees });
                                  }} />
                            </Col>
                          </Row>
                        </div>
                      </Paper>
                    )
                  })
                  :
                  <div></div>
                }
              </Col>
              <Col xs={4}>
                <RaisedButton
                  style={{ bottom: 0, right: 0, position: 'absolute', width: 225 }}
                  primary={true}
                  label={
                    this.state.newMeetingBtnLabel ||
                    <i
                      className='mdi mdi-rotate-right mdi-spin mdi-18px'
                      style={{ marginLeft: '10px', verticalAlign: 'middle', color: '#EDE7F6' }}>
                    </i>
                  }
                  onClick={() => {
                    alert(JSON.stringify(this.state.newMeeting));
                    this.setState({ newMeetingBtnLabel: null });
                    let { newMeeting, attendees } = this.state;
                    let outlookEvent: any = {
                      subject: newMeeting.title,
                      location: { displayName: newMeeting.location },
                      start: newMeeting.start,
                      end: newMeeting.end,
                      attendees: (() => {
                        return attendees.map((attendee) => ({
                          emailAddress: { address: attendee.mail, name: attendee.displayName },
                          type: 'required'
                        }))
                      })()
                    };
                    const webexEvent = {
                      webExId: this.state.webex.webExId,
                      webExPassword: this.state.webex.webExPassword,
                      subject: newMeeting.title,
                      attendees,
                      startDate: moment(new Date(newMeeting.start.dateTime)).format('MM/DD/YYYY HH:mm:mm'),
                      duration: 20,
                      timeZone: newMeeting.start.timeZone
                    };
                    // Create the WebEx Event First
                    return this.callServer({
                      method: 'post',
                      path: 'meetings',
                      body: webexEvent
                    }).then(({meetingKey}:any) => {
                      outlookEvent.body = {
                        contentType: 'text',
                        content: meetingKey
                      };
                      return this.callServer({
                        method: 'post',
                        path: 'outlook-events',
                        body: outlookEvent
                      });
                    });
                  }} />
              </Col>
            </Row>
          </Grid>
        </Paper>
        <WebExSettings
          webex={this.state.webex}
          open={this.openWebExSettings}
          close={this.closeWebExSettings}
          onWebExChange={this.handleWebExCredentials}
          webExSettingsEditor={this.state.webExSettingsEditor} />
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
    let events: any;
    return this.callServer({
      path: 'outlook-events',
      method: 'get'
    }).then((events: any) => {
      events = events;
      return Promise.map(Object.keys(events), (key:string) => {
        return Promise.map(events[key], (evt: any, i: any) => {
          let path: string;
          let options: any = {
            webExId: this.state.webex.webExId,
            webExPassword: this.state.webex.webExPassword,
            meetingKey: evt.webExMeetingKey
          };
          if(evt.isOrganizer) {
            path = 'webex-hostjoinurl';
          } else {
            options.attendee = this.state.signedInUser;
            options.meetingPassword = 'pass123';
            path = 'webex-joinurl';
          }
          return this.callServer({
            path,
            method: 'post',
            body: options
          }).then(({joinUrl}: any) => {
            events[key][i].joinUrl = joinUrl;
            return evt;
          })
        })
      }).then(() => {
        let evtHtml = this._renderEvents(events);
        this.setState({ events, evtHtml });
        return;
      });
    });
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
  handleWebExCredentials(propName, value) {
    let { webex } = this.state;
    webex[propName] = value;
    this.setState({ webex });
  }

  @autobind
  openWebExSettings() {
    this.setState({ webExSettingsEditor: true });
  }

  @autobind
  closeWebExSettings() {
    this.setState({ webExSettingsEditor: false });
    // localStorage.setItem('webex', JSON.stringify(this.state.webex));
    // this.getEvents();
    // return this.callServer({
    //   path: 'subscriptions',
    //   method: 'post',
    //   body: {
    //     changeType: 'created,updated',
    //     notificationUrl: 'https://msteams-webex.ngrok.io/api/webhook',
    //     resource: 'me/events',
    //     clientState: 'subscription-identifier',
    //     expirationDateTime: moment().add('1', 'days').utc().format()
    //   }
    // });
  }

  @autobind
  callServer({ method, body = {}, path, query = '' }) {
    let url = `/api/${path}?token=${this.state.accessToken}`;
    if(method === 'get' && path.includes('outlook')) {
      url += `&timezone=${momenttz.tz.guess()}`;
    } else if(query) {
      url += query;
    }
    return $.ajax({
      url,
      method,
      headers,
      data: JSON.stringify(body)
    });
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
