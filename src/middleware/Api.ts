import * as Promise from 'bluebird';
import * as moment from 'moment';
import * as momenttz from 'moment-timezone';
import { EventEmitter } from 'events';
import * as Properties from '../../properties.json';

import axios from 'axios';

import {
  AxiosResponse, AxiosRequestConfig
} from 'axios';

const apiEmitter = new EventEmitter();

export { apiEmitter };

const {
  msApp: {
    clientId, authority, scopes,
    webApi, tenant, redirectUri,
    teamsUrl, contentUrl, baseUrl
  }
} = Properties;

export interface WebExAuth {
  webExId: string;
  webExPassword: string;
}

export interface WebExCreateMeetingParams {
  subject: string;
  agenda?: string;
  attendees: [{ displayName, mail }];
  startDate: string;
  duration: number,
  timeZone: string;
}

export interface WebExMeetingRequest {
  webex: WebExAuth;
  meeting: WebExCreateMeetingParams;
}

export interface ApiActions {
  webExAuthentication(WebExAuth): Promise<any>;
  webExCreateMeeting(WebExMeetingRequest): Promise<any>;
  webExGetJoinUrl(Object): Promise<any>;
}

export interface WebExMeetingResponse {
  meetingKey: string;
}

export interface WebExJoinUrlParameters {
  host: boolean;
  meetingKey: string;
  meetingPassword?: string;
  attendee?: {displayName, mail};
  meetingType?: string;
}

import { graphServiceFactory, GraphService } from './msgraph-service';

microsoftTeams.initialize();

export class Api {
  private headers: any = {'Content-Type':'application/json'};
  private webExMethod: string;
  token: string;
  signedInUser: string;
  signedInUserEmail: string;
  channelId: string;
  webex: WebExAuth;
  subscription: any;
  teamGroupId: string;
  graphService: any;
  constructor() {}

  resetLocalStorage() {
    localStorage.clear();
  }

  initialize() {
    this.token = localStorage.getItem('accessToken');
    this.signedInUser = localStorage.getItem('signedInUser');
    try {
      this.webex = JSON.parse(localStorage.getItem('webex'));
    } catch(e) {
      this.webex = { webExId: '', webExPassword: '' }
    }
    try {
      let {
        upn, groupId, channelId, entityId, subEntityId
      } = JSON.parse(localStorage.getItem('msTeamsContext'));
      this.signedInUserEmail = upn;
      this.teamGroupId = groupId;
      this.channelId = channelId;
    } catch(e) {
      this.signedInUserEmail = null;
      this.teamGroupId = null;
    }
    try { this.subscription = JSON.parse(localStorage.getItem('subscription')) }
    catch(e) { this.subscription = null; }

    this.graphService = graphServiceFactory(this);
  }

  setToken(token) {
    localStorage.setItem('accessToken', token);
    this.token = token;
  }

  setUser(user) {
    localStorage.setItem('signedInUser', user);
    this.signedInUser = user;
  }

  setTeamsContext(msTeamsContext) {
    localStorage.setItem('msTeamsContext', JSON.stringify(msTeamsContext));
    this.signedInUserEmail = msTeamsContext.upn;
    this.teamGroupId = msTeamsContext.groupId;
  }

  setSubscription(subscription) {
    localStorage.setItem('subscription', JSON.stringify(subscription));
  }

  private _axiosoptions(opts:any): AxiosRequestConfig {
    let options: AxiosRequestConfig = {
      url: opts.path,
      method: opts.method,
      headers: this.headers
    };
    if(opts.data) options['data'] = opts.data;
    if(opts.params) options['params'] = opts.params;
    return options;
  }

  private _axiosrequest(params) {
    return axios(
      this._axiosoptions(params)
    ).then((resp: AxiosResponse<any>) => resp.data);
  }

  _dateFormatter(date: Date): string {
    return momenttz.utc(date).tz(momenttz.tz.guess()).format('YYYY-MM-DD');
  }

  _formatTime(date: string, time:string) {
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
          return date + 'T' + (parseInt(time.split(':')[0], 10) + 12) +
            ':' + time.split(':')[1].split(' ')[0];
      }
    }
  }

  private _normalizeDates(dates:any) {
    let start = moment(dates.startDate).format('YYYY-MM-DD'),
        end = moment(dates.endDate).format('YYYY-MM-DD'),
        timeZone = momenttz.tz.guess();
    return {
      start: {
        dateTime: moment(this._formatTime(start, dates.startTime))
          .format('YYYY-MM-DDTHH:mm:ss'),
        timeZone: momenttz.tz(timeZone).format('z')
      },
      end: {
        dateTime: moment(this._formatTime(end, dates.endTime))
          .format('YYYY-MM-DDTHH:mm:ss'),
        timeZone: momenttz.tz(timeZone).format('z')
      }
    };
  }

  webExDeleteMeeting(meetingKey) {
    return this._axiosrequest({
      path: `/api/webex-meeting/${meetingKey}`,
      method: 'delete',
      data: { webex: { ...this.webex } }
    });
  }

  webExAuthentication(webex:WebExAuth) {
    return this._axiosrequest({
      path: '/api/webex-auth', method: 'post', data: webex
    });
  }

  webExGenerateMeetingRequest(meeting) {
    return {
      webex: { ...this.webex },
      meeting: {
        subject: meeting.subject,
        attendees: (() => {
          return meeting.attendees.map(attendee => {
            delete attendee.photo;
            return attendee;
          })
        })(),
        startDate: moment(new Date(meeting.startDate)).format('MM/DD/YYYY HH:mm:ss'),
        duration: meeting.duration || 20,
        timeZone: momenttz.tz.guess()
      }
    }
  }

  webExCreateMeeting(params:any) {
    return this._axiosrequest({
      path: '/api/webex-meetings',
      method: 'post',
      data: params
    });
  }

  msteamsGenerateMeetingRequest(meeting, attendees) {
    const { startDate, startTime, endDate, endTime } = meeting;
    return {
      subject: meeting.title,
      location: { displayName: meeting.location },
      attendees: (() => {
        return attendees.map((attendee) => ({
          emailAddress: { address: attendee.mail, name: attendee.displayName },
          type: 'required'
        }))
      })(),
      ...this._normalizeDates({startDate,startTime,endDate,endTime})
    };
  }

  msteamsCreateMeeting(meeting) {
    return this._axiosrequest({
      path: `/api/outlook-events`,
      method: 'post',
      data: meeting,
      params: { token: this.token, timezone: momenttz.tz.guess() }
    });
  }

  webExGetJoinUrl(params:WebExJoinUrlParameters) {
    let path: string, body: any;
    const webex = { ...this.webex }
    if(params.host) {
      path = `/api/webex-hostjoinurl`;
      body = {
        meetingKey: params.meetingKey
      };
    } else {
      path = `/api/webex-joinurl`;
      body = {
        meetingKey: params.meetingKey,
        attendee: params.attendee
      };
      if(!params.meetingType) {
        body['meetingPassword'] = 'pass123';
      }
    }
    body['webex'] = webex;
    return this._axiosrequest({
      path, method: 'post', data: body
    });
  }

  msteamsComposeDeepLink(subEntityId) {
    let deepLinkUrl = teamsUrl + '/l/entity/';
    let deepLinkParameters = `${clientId}/webexdev-scheduler?` +
      `webUrl=${contentUrl}/webex-joiner&label=Join WebEx&` +
      `context={"subEntityId":${JSON.stringify(subEntityId)},"canvasUrl":` +
      `"${contentUrl}","channelId":"${this.channelId}"}`;
    return deepLinkUrl + encodeURI(deepLinkParameters);
  }

  msteamsDialogBuilder(subEntityId, organizer) {
    let actionCards = [{
      '@type': 'OpenUri',
      name: 'Join the Conference',
      targets: [{ os: 'default', uri: this.msteamsComposeDeepLink(subEntityId)}]
    }]
    return this._axiosrequest({
      path: '/api/msteams-dialoghandler',
      method: 'post',
      data: { actionCards, organizer }
    });
  }

  msteamsGetOutlookEvents({ token }) {
    let timezone = momenttz.tz.guess();
    return this._axiosrequest({
      path: '/api/outlook-events',
      method: 'get',
      params: { token: this.token, timezone }
    }).then((resp:any) => {
      if(resp && resp.status === 401) return null;
      return resp;
    });
  }

  msteamsResetObject = {
    newEvent: false,
    start: {dateTime:'', timeZone:''},
    end: {dateTime:'', timeZone:''},
    title: '',
    loation: '',
    startDate: new Date(),
    startTime: '',
    endDate: new Date(),
    endTime: '',
  };

  msteamsEventsProcessing(evts) {
    const events = evts;
    return Promise.map(Object.keys(events), (key:string) => {
      return Promise.map(events[key], (evt:any, i: any) => {
        if(!evt.webExMeetingKey) return;
        return this.webExGetJoinUrl({
          meetingKey: evt.webExMeetingKey,
          host: evt.isOrganizer,
          attendee: { displayName: this.signedInUser, mail: this.signedInUserEmail },
        }).then(({joinUrl}) => {
          events[key][i]['joinUrl'] = joinUrl;
          return evt;
        });
      });
    }).then(() => events);
  }

  msteamsOutlookTimeFinder({ token, user }) {}

  webExLaunchPersonalRoom(attendees) {
    return this._axiosrequest({
      path: '/api/webex-meetnow',
      method: 'post',
      data: {
        webex: {...this.webex},
        meeting: { agenda: 'the agenda'}
      }
    }).then((result:any) => {
      if(!result) {
        // Schedule One
        return Promise.map(attendees, (att:any) => {
          return { displayName: att.displayName, mail: att.mail };
        }).then(formattedAttendees => {
          return this.webExGenerateMeetingRequest({
            subject: 'Instant Scheduled Meeting',
            attendees: formattedAttendees,
            startDate: moment().format('MM/DD/YYYY HH:mm:ss')
          });
        }).then(meetingRequest => {
          return this.webExCreateMeeting(meetingRequest);
        });
      } else {
        return { meetingKey: result.meetingKey };
      }
    })
  }
}