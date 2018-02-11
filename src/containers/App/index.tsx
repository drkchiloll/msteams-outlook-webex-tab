import * as React from 'react';
import * as Promise from 'bluebird';
import * as style from './style.css';
import * as openSocket from 'socket.io-client';
import * as Properties from '../../../properties.json';
import { Api, apiEmitter, time, Msal } from '../../middleware';
import { Drawer } from 'material-ui';
import {
  WebExSettings, ScheduleMeeting, NagPopup,
  EventsPanel, ScheduleButton, MeetNowButton,
  WebExMeetNowDialog as WebExMeetNow
} from '../../components';

const { msApp: { baseUrl } } = Properties;
const socket = openSocket(baseUrl);

const initialState = {
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
  attendees: [],
  organizer: null
};

export class App extends React.Component<any,any> {
  public api: Api;
  constructor(props) {
    super(props);
    this.state = {
      webExSettingsEditor: false,
      events: time.uidates(),
      newMeeting: JSON.parse(JSON.stringify(initialState.newMeeting)),
      organizer: null,
      attendees: [],
      newMeetingBtnLabel: 'Schedule Meeting',
      webex: { webExId: '', webExPassword: '' },
      webExAuthResult: '',
      meetNowDialog: false,
      choiceDialog: true,
      hasToken: false,
      hasSubentityId: true,
      disableSchedule: true
    };
    this.api = new Api();
    this.api.initialize();
    socket.on('notification_received', (data: any) => {
      return this.api.graphService
        .handleIncomingSocket(data, this.state.events)
        .then((events:any) => {
          if(events && events.newMeeting && events.attendees) {
            this.setState(events);
            this.api.graphService.getEvents();
          } else {
            this.setState({ events });
          }
        });
    });
    microsoftTeams.initialize();
  }

  styles = () => ({
    drawer: {
      display: this.state.choiceDialog ? 'none' : 'inline',
      fontSize: '90%'
    }
  })

  callTeams = function ({ url, width = 600, height = 800 }) {
    microsoftTeams.authentication.authenticate({
      url, width, height,
      successCallback: this.teamsSuccess,
      failureCallback: this.teamsFailure
    });
  }

  componentWillMount() {
    if(this.api.token) this.setState({ hasToken: true });
    microsoftTeams.getContext((context: microsoftTeams.Context) => {
      if(context.subEntityId) {
        window.location.pathname = '/join-webex';
      } else {
        this.setState({ hasSubentityId: false });
      }
    });
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ choiceDialog: false });
      this.credCheck();
    }, 2000);
    apiEmitter.on('newevent', ({ prop, event }) => {
      let { events } = this.state;
      if(event.isCancelled) {
        this.api.graphService.deleteEvent(event.id);
      }
      if(!events[prop].find(({ id }) => id === event.id)) {
        events[prop].push(event);
        events[prop].sort((a: any, b: any) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        this.setState({ events });
      }
    });
    apiEmitter.on('event-service-success', () =>
      this.setState({ disableSchedule: false }))
    apiEmitter.on('error_event', () =>
      this.setState({ meetNowDialog: true, disableSchedule: true }));
    // localStorage.clear();
  }

  teamsSuccess = (result) => {
    const { accessToken, signedInUser, context } = JSON.parse(result);
    return this.authActions({
      accessToken, signedInUser, context
    }).then(this.promiseHandler);
  }

  teamsFailure = (e) => {
    Msal.logout();
    setTimeout(() => {
      this.credCheck()
    }, 500);
  }

  getMe = () => this.api.graphService.getMe();

  credCheck = () => {
    let { webExSettingsEditor, webex } = this.state;
    if(!this.api.webex) {
      webExSettingsEditor = true;
      this.setState({ webExSettingsEditor });
    } else {
      this.setState({ webex: this.api.webex });
    }
    if(!this.api.token) {
      this.callTeams({ url: '/auth' });
    } else {
      return this.getMe()
        .then((resp: any) => {
          if(resp && resp.status) {
            // alert('Attempt to retrieve Token Silently');
            return Msal.silent().then((result: any) => {
              if(typeof result === 'string') {
                return this.authActions({
                  accessToken: result,
                  signedInUser: this.api.signedInUser,
                  context: JSON.parse(localStorage.getItem('msTeamsContext'))
                }).then(this.credCheck);
              } else {
                return this.callTeams({ url: '/auth' });
              }
            })
          } else {
            return this.promiseHandler();
          }
        })
    }
  }

  authActions = ({accessToken, signedInUser='', context={}}) => {
    this.api.setToken(accessToken);
    if(signedInUser) this.api.setUser(signedInUser);
    if(Object.keys(context).length > 0) {
      this.api.setTeamsContext(context);
    }
    this.api.initialize();
    return Promise.resolve(null);
  }

  promiseHandler = () => {
    let promises = [];
    if(this.state.webex.webExId) {
      promises.push(this.api.graphService.getEvents());
    }
    if(!this.api.graphService.verifySubscription()) {
      promises.push(this.api.graphService.createSubscription());
    }
    if(promises.length > 0) return Promise.all(promises);
  }

  scheduleEvent = () => {
    let { organizer, newMeeting } = this.state;
    newMeeting.newEvent = true;
    if(!organizer) {
      return this.getMe()
        .then((me) => {
          if(me.status) {
            return this.credCheck().then((result) => {
              return this.scheduleEvent();
            })
          }
          organizer = me;
          organizer['me'] = true;
          return this.api.graphService.getUserPhoto(organizer.id)
            .then((binaryImg: any) => {
              if(binaryImg) {
                organizer.photo = binaryImg;
              }
              this.setState({ newMeeting, organizer });
            });
        });
    } else {
      this.setState({ newMeeting });
    }
  }

  eventFormHandler = (name, value) => {
    let { newMeeting } = this.state;
    newMeeting[name] = value;
    if(name === 'newEvent' && !value) {
      this.setState(initialState)
    }
    this.setState({ newMeeting });
  }

  addParticipant = (attendee) => {
    let { attendees } = this.state;
    attendees.unshift(attendee);
    this.setState({ attendees });
  }

  removeParticipant = (attendeeId) => {
    let { attendees } = this.state;
    let idx = attendees.findIndex(attendee =>
      attendee.id === attendeeId);
    attendees.splice(idx, 1);
    this.setState({ attendees });
  }

  meetNowActions = () => {
    return this.getMe()
      .then((resp: any) => {
        if(resp.status) {
          Msal.silent().then((result:any) => {
            if(typeof result === 'string') {
              return this.authActions({
                accessToken: result
              }).then((resp:any) => {
                if(!resp) return this.meetNowActions();
              })
            } else {
              this.callTeams({ url: '/auth' });
            }
          })
        } else {
          this.setState({ meetNowDialog: true });
        }
      })
  }

  deepCopy = (organizer, attendees, events) => ({
    admin: JSON.parse(JSON.stringify(organizer)),
    participants: JSON.parse(JSON.stringify(attendees)),
    meetings: JSON.parse(JSON.stringify(events))
  })

  render() {
    const {
      meetNowDialog, newMeeting, newMeetingBtnLabel,
      choiceDialog, hasSubentityId, events,
      organizer, attendees, hasToken, disableSchedule,
      webex
    } = this.state;
    const {
      admin, participants, meetings
    } = this.deepCopy(organizer, attendees, events);

    return (
      <div>
        {
          meetNowDialog ?
            <WebExMeetNow api={this.api}
              dialogOpen={meetNowDialog}
              webex={this.state.webex}
              close={() => this.setState({ meetNowDialog: false })} />
            :
          newMeeting.newEvent ?
            <ScheduleMeeting formHandler={this.eventFormHandler}
              buttonLabel={newMeetingBtnLabel}
              create={this.createMeeting}
              add={this.addParticipant}
              remove={this.removeParticipant}
              newMeeting={newMeeting}
              admin={admin}
              attendees={participants}
              api={this.api} /> :
          choiceDialog && !hasSubentityId ?
            <NagPopup hasToken={hasToken} /> :
            null
        }
        <div style={this.styles().drawer}>
          <Drawer docked={true} width={285} open={true} >
            <EventsPanel events={meetings}/>
            <ScheduleButton
              schedule={this.scheduleEvent}
              disabled={disableSchedule} />
            <MeetNowButton
              webexId={webex.webExId}
              meetNow={this.meetNowActions} />
          </Drawer>
        </div>
        <WebExSettings
          toggleSettings={(isOpen)=>this.setState({webExSettingsEditor: isOpen})}
          api={this.api}
          webex={this.state.webex}
          save={this.saveWebExSettings}
          authResult={this.state.webExAuthResult}
          onWebExChange={this.handleWebExInputs}
          webExSettingsEditor={this.state.webExSettingsEditor} />
      </div>
    );
  }

  createMeeting = () => {
    this.setState({ newMeetingBtnLabel: null });
    let { newMeeting, attendees } = JSON.parse(JSON.stringify(this.state));
    let outlookEvent: any =
      this.api.graphService.generateMeetingRequest(newMeeting, attendees);
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

  handleWebExInputs = (propName, value) => {
    let { webex, webExAuthResult } = this.state;
    if(propName === 'authResult') {
      this.setState({ webExAuthResult: '' });
    } else {
      webex[propName] = value;
      this.setState({ webex });
    }
  }

  saveWebExSettings = () => {
    let { webex } = this.state;
    return this.api
      .webExAuthentication(webex)
      .then(result => {
        if(result && result.authentication) {
          if(result.authentication === 'SUCCESS') {
            localStorage.setItem('webex', JSON.stringify(this.state.webex));
            this.api.initialize();
            this.api.graphService.getEvents();
          }
          this.setState({ webExAuthResult: result.authentication });
        } else {
          this.setState({ webExAuthResult: 'unknown error' });
        }
      });
  }
}
