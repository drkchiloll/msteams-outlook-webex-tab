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
  RaisedButton,
  FontIcon,
  Drawer,
  List,
  Subheader,
  ListItem,
  ListItemProps,
  makeSelectable,
  TextField,
  Divider,
  DatePicker,
  SelectField,
  MenuItem,
  Paper,
  AutoComplete,
  CircularProgress,
  RefreshIndicator,
  Avatar,
  IconButton,
  Dialog
} from 'material-ui';

export namespace App {
  export interface Props extends RouteComponentProps<void> {
    nestedItems: ListItemProps;
  }

  export interface State {
    signedInUser: string;
    isLoggedIn: boolean;
    accessToken: string;
    scheduleDialog: boolean;
    events: any;
    showPanel: boolean;
    newEvent: any;
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
            this.openScheduleDialog();
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
      scheduleDialog: false,
      evtHtml: <div></div>,
      events: null,
      showPanel: false,
      newEvent: false,
      newMeeting: {
        title: '',
        location: '',
        startDate: '',
        endDate: '',
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
      webex: {}
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
      this.getEvents().then(() => {
        this.setState({
          newEvent: false,
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
    let { organizer } = this.state;
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
            newEvent: true,
            organizer
          });
        });
      });
    } else {
      this.setState({ newEvent: true });
    }
  }

  @autobind
  meetingProps({target: {name}}:any, value:string) {
    let { newMeeting } = this.state;
    newMeeting[name] = value;
    this.setState({ newMeeting });
  }

  dateFormatter(date: Date): string {
    return momenttz.utc(date).tz(momenttz.tz.guess()).format('YYYY-MM-DD');
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
          display: this.state.newEvent ? 'inline-block' : 'none'
        }} zDepth={2} >
          <div style={{marginLeft: '10px'}}>
            <Row><Col xs={12}><h3>New Meeting</h3></Col></Row>
            <Row>
              <Col xs={8}>
                <TextField
                  name='title'
                  hintText='Title'
                  style={{width: 570, maxWidth: 570 }}
                  onChange={this.meetingProps} />
              </Col> 
            </Row>
            <Row>
              <Col xs={8}>
                <TextField
                  name='location'
                  hintText='Location'
                  style={{ width: 570, maxWidth: 570 }}
                  onChange={this.meetingProps} />
              </Col>
            </Row>
            <Row>
              <Col sm={3}>
                <DatePicker
                  hintText='Start'
                  hintStyle={{ color: '#9575CD' }}
                  style={{ marginTop: 10 }}
                  textFieldStyle={{ width: 130, minWidth: 130 }}
                  container='inline'
                  mode='landscape'
                  formatDate={(date: Date) => {
                    return moment(date).format('MM/DD/YYYY');
                  }}
                  autoOk={true}
                  onChange={(err: any, date: Date) => {
                    let e:any = { target: { name: 'startDate' } };
                    this.meetingProps(e, this.dateFormatter(date))
                  }} />
              </Col>
              <Col sm={2}>
                <SelectField
                  value={(() => {
                    return this.state.newMeeting.startTime || (() => {
                      let start = moment();
                      let remainder = 30 - start.minute() % 30;
                      return moment(start).add(remainder, 'minutes').format('h:mm a');
                    })()
                  })()}
                  onChange={(e:any, key: number, value) => {
                    let { newMeeting } = this.state;
                    let startDate, startTime: string;
                    newMeeting.startTime = value;
                    if(newMeeting.startDate) startDate = newMeeting.startDate;
                    else startDate = moment().format('YYYY-MM-DD');
                    let dateTime = this.formatTime(startDate, value);
                    // newMeeting.endTime = moment(dateTime).add(30, 'minutes').format('h:mm a');
                    // newMeeting.endDate = newMeeting.startDate;
                    newMeeting.start.dateTime = dateTime;
                    newMeeting.start.timeZone = momenttz.tz.guess();
                    // newMeeting.end.dateTime = newMeeting.endDate + 'T' + 
                    //   moment(dateTime).add(30, 'minutes').format('HH:mm');
                    this.setState({ newMeeting });
                  }}
                  style={{ width: 120, minWidth: 120, marginTop: 10, marginRight: '30px' }}>
                  {this.menuItems()}
                </SelectField>
              </Col>
              <Col sm={3}>
                <DatePicker
                  hintText='End'
                  hintStyle={{ color: '#9575CD' }}
                  style={{ marginTop: 10, marginLeft: '30px' }}
                  textFieldStyle={{ width: 130, minWidth: 130 }}
                  container='inline'
                  mode='landscape'
                  formatDate={(date: Date) => {
                    return moment(date).format('MM/DD/YYYY');
                  }}
                  autoOk={true}
                  onChange={(err: any, date: Date) => {
                    let e: any = { target: { name: 'endDate' } };
                    this.meetingProps(e, this.dateFormatter(date))
                  }} />
              </Col>
              <Col sm={2}>
                <SelectField
                  value={(() => {
                    return this.state.newMeeting.endTime || (() => {
                      let start = moment();
                      let remainder = 30 - start.minute() % 30;
                      return moment(start).add((remainder + 30), 'minutes').format('h:mm a');
                    })()
                  })()}
                  style={{ width: 120, minWidth: 120, marginTop: 10, marginLeft: '20px' }}
                  onChange={(e:any, key: number, value: string) => {
                    let { newMeeting } = this.state;
                    let endDate, endTime;
                    newMeeting.endTime = value;
                    if(newMeeting.endDate) endDate = newMeeting.endDate;
                    else endDate = moment().format('YYYY-MM-DD');
                    let dateTime = this.formatTime(endDate, value);
                    newMeeting.end.dateTime = dateTime;
                    newMeeting.end.timeZone = momenttz.tz.guess();
                    this.setState({ newMeeting });
                  }} >
                  {this.menuItems()}
                </SelectField>
              </Col>
            </Row>
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
                  onNewRequest={({text}, index) => {
                    let { users, attendees } = this.state;
                    let _id = text;
                    let user = users[index];
                    return this.callServer({
                      method: 'get',
                      path: `users/${user.id}/photo`
                    }).then((binaryImg:any) => {
                      if(binaryImg && !binaryImg.message) {
                        let img = new Buffer(binaryImg, 'binary').toString('base64');
                        user.photo = `data:image/jpg;base64,${img}`;
                      }
                      return user;
                    }).then(() => {
                      // console.log(user);
                      attendees.push(user);
                      this.setState({ attendees });
                      setTimeout(() => {
                        this.setState({
                          searchText: '',
                          users: null,
                          autoCompleteMenuHeight: 25
                        });
                      }, 250)
                    })
                  }}
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
                                <Row><Col xs={12}><em>Unknown</em></Col></Row>
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
          </div>
        </Paper>
        <Dialog
          title='WebEx Credentials'
          actions={[
            <RaisedButton 
              label='Cancel'
              primary={true}
              onClick={this.closeScheduleDialog} />,
            <RaisedButton 
              label='Submit'
              primary={true}
              onClick={this.closeScheduleDialog} />
          ]}
          modal={false}
          open={this.state.scheduleDialog}
          onRequestClose={() => {
            this.closeScheduleDialog();
          }} >
          <Grid>
            <Row>
              <Col xs={3}>
                <TextField 
                  hintText='WebEx ID'
                  onChange={(e, val) => {
                    let { webex } = this.state;
                    webex.webExId = val;
                    this.setState({ webex });
                  }} />
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                <TextField
                  hintText='WebEx Password'
                  onChange={(e, val) => {
                    let { webex } = this.state;
                    webex.webExPassword = val;
                    this.setState({ webex });
                  }} />
              </Col>
            </Row>
          </Grid>

        </Dialog>
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
  openScheduleDialog() {
    this.setState({ scheduleDialog: true });
  }

  @autobind
  closeScheduleDialog() {
    this.setState({ scheduleDialog: false });
    localStorage.setItem('webex', JSON.stringify(this.state.webex));
    this.getEvents();
    return this.callServer({
      path: 'subscriptions',
      method: 'post',
      body: {
        changeType: 'created,updated',
        notificationUrl: 'https://4579cec4.ngrok.io/api/webhook',
        resource: 'me/events',
        clientState: 'subscription-identifier',
        expirationDateTime: moment().add('1', 'days').utc().format()
      }
    });
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

  menuItems() {
    return [
      <MenuItem key={`time_0`} value={'12:00 am'} primaryText={'12:00 am'} />,
      <MenuItem key={`time_1`} value={'12:30 am'} primaryText={'12:30 am'} />,
      <MenuItem key={`time_2`} value={'1:00 am'} primaryText={'1:00 am'} />,
      <MenuItem key={`time_3`} value={'1:30 am'} primaryText={'1:30 am'} />,
      <MenuItem key={`time_4`} value={'2:00 am'} primaryText={'2:00 am'} />,
      <MenuItem key={`time_5`} value={'2:30 am'} primaryText={'2:30 am'} />,
      <MenuItem key={`time_6`} value={'3:00 am'} primaryText={'3:00 am'} />,
      <MenuItem key={`time_7`} value={'3:30 am'} primaryText={'3:30 am'} />,
      <MenuItem key={`time_8`} value={'4:00 am'} primaryText={'4:00 am'} />,
      <MenuItem key={`time_9`} value={'4:30 am'} primaryText={'4:30 am'} />,
      <MenuItem key={`time_10`} value={'5:00 am'} primaryText={'5:00 am'} />,
      <MenuItem key={`time_11`} value={'5:30 am'} primaryText={'5:30 am'} />,
      <MenuItem key={`time_12`} value={'6:00 am'} primaryText={'6:00 am'} />,
      <MenuItem key={`time_13`} value={'6:30 am'} primaryText={'6:30 am'} />,
      <MenuItem key={`time_14`} value={'7:00 am'} primaryText={'7:00 am'} />,
      <MenuItem key={`time_15`} value={'7:30 am'} primaryText={'7:30 am'} />,
      <MenuItem key={`time_16`} value={'8:00 am'} primaryText={'8:00 am'} />,
      <MenuItem key={`time_17`} value={'8:30 am'} primaryText={'8:30 am'} />,
      <MenuItem key={`time_18`} value={'9:00 am'} primaryText={'9:00 am'} />,
      <MenuItem key={`time_19`} value={'9:30 am'} primaryText={'9:30 am'} />,
      <MenuItem key={`time_20`} value={'10:00 am'} primaryText={'10:00 am'} />,
      <MenuItem key={`time_21`} value={'10:30 am'} primaryText={'10:30 am'} />,
      <MenuItem key={`time_22`} value={'11:00 am'} primaryText={'11:00 am'} />,
      <MenuItem key={`time_23`} value={'11:30 am'} primaryText={'11:30 am'} />,
      <MenuItem key={`time_24`} value={'12:00 pm'} primaryText={'12:00 pm'} />,
      <MenuItem key={`time_25`} value={'12:30 pm'} primaryText={'12:30 pm'} />,
      <MenuItem key={`time_26`} value={'1:00 pm'} primaryText={'1:00 pm'} />,
      <MenuItem key={`time_27`} value={'1:30 pm'} primaryText={'1:30 pm'} />,
      <MenuItem key={`time_28`} value={'2:00 pm'} primaryText={'2:00 pm'} />,
      <MenuItem key={`time_29`} value={'2:30 pm'} primaryText={'2:30 pm'} />,
      <MenuItem key={`time_30`} value={'3:00 pm'} primaryText={'3:00 pm'} />,
      <MenuItem key={`time_31`} value={'3:30 pm'} primaryText={'3:30 pm'} />,
      <MenuItem key={`time_32`} value={'4:00 pm'} primaryText={'4:00 pm'} />,
      <MenuItem key={`time_33`} value={'4:30 pm'} primaryText={'4:30 pm'} />,
      <MenuItem key={`time_34`} value={'5:00 pm'} primaryText={'5:00 pm'} />,
      <MenuItem key={`time_35`} value={'5:30 pm'} primaryText={'5:30 pm'} />,
      <MenuItem key={`time_36`} value={'6:00 pm'} primaryText={'6:00 pm'} />,
      <MenuItem key={`time_37`} value={'6:30 pm'} primaryText={'6:30 pm'} />,
      <MenuItem key={`time_38`} value={'7:00 pm'} primaryText={'7:00 pm'} />,
      <MenuItem key={`time_39`} value={'7:30 pm'} primaryText={'7:30 pm'} />,
      <MenuItem key={`time_40`} value={'8:00 pm'} primaryText={'8:00 pm'} />,
      <MenuItem key={`time_41`} value={'8:30 pm'} primaryText={'8:30 pm'} />,
      <MenuItem key={`time_42`} value={'9:00 pm'} primaryText={'9:00 pm'} />,
      <MenuItem key={`time_43`} value={'9:30 pm'} primaryText={'9:30 pm'} />,
      <MenuItem key={`time_44`} value={'10:00 pm'} primaryText={'10:00 pm'} />,
      <MenuItem key={`time_45`} value={'10:30 pm'} primaryText={'10:30 pm'} />,
      <MenuItem key={`time_46`} value={'11:00 pm'} primaryText={'11:00 pm'} />,
      <MenuItem key={`time_47`} value={'11:30 pm'} primaryText={'11:30 pm'} />
    ]
  }
}
