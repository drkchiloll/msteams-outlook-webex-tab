import axios from 'axios';
import { AxiosInstance } from 'axios';
import * as Promise from 'bluebird';
import { Api, apiEmitter, Time } from './index';
import { Properties } from './props';
const { msApp: {
  uri, webApi, connectorUrl, teamsUrl, clientId, contentUrl, baseUrl
} } = Properties;

export function graphServiceFactory(api: Api) {
  const graphBeta = axios.create({ baseURL: uri });
  graphBeta.defaults.headers.common['Authorization'] = `Bearer ${api.token}`;
  graphBeta.defaults.validateStatus = (status) => status >= 200 && status <= 505;
  const graphApi = axios.create({ baseURL: webApi });
  graphApi.defaults.headers.common['Authorization'] = `Bearer ${api.token}`;
  graphApi.defaults.validateStatus = (status) =>
    status >= 200 && status <= 505;

  const _errors = (status) => {
    // alert(status);
    let resolver:any;
    switch(status) {
      case 401:
        resolver = { status };
        break;
      case 503: // Service Unavailable
        resolver = { message: 'service unavailable' };
        break;
      default:
        resolver = null;
    }
    return Promise.resolve(resolver);
  }

  const _options = ({path, method='get', data={}, params={}}) => {
    let options:any = { url: path, method };
    if(method==='post' || method==='delete') options['data'] = data;
    if(Object.keys(params).length > 0) options['params'] = params;
    return options;
  };

  const graph: any = {};

  graph._axiosrequest = function(requestor: AxiosInstance, options) {
    let requestoptions: any = _options(options);
    if(options.path.includes('photo')) requestoptions['responseType'] = 'arraybuffer';
    if(options.path === '/me/events' && options.method === 'get') {
      const transformRequest = [(data, headers) => {
        headers.common['Prefer'] = `outlook.timezone="${Time.formatZone()}"`;
        return data;
      }];
      requestoptions['transformRequest'] = transformRequest;
    }
    return requestor
      .request(requestoptions)
      .then((resp: any) => {
        if(resp.status >= 400) {
          // if(resp.status===401 || resp.status===403) alert(JSON.stringify(resp.data));
          if(options.path.includes('events')) {
            apiEmitter.emit('error_event', {});
            return null;
          }
          return _errors(resp.status);
        } else return resp.data;
      });
  };

  graph.userParams = () => ({ select: 'id,displayName,mail' });

  graph.userFilter = (user:string) => ({
    filter: `startsWith(displayName,'${user}') or startsWith(surname,'${user}')`
  });

  graph.getMe = function() {
    return this._axiosrequest(graphBeta, {
      path: '/beta/me', params: this.userParams()
    });
  };

  graph.getUserPhoto = function(id) {
    return this._axiosrequest(graphApi, {
      path: `/users/${id}/photo/$value`
    }).then((resp:any) => {
      if(resp) return Buffer.from(resp, 'binary');
      return resp;
    })
  };

  graph.getTeam = function() {
    if(!api.token && !api.signedInUser && !api.teamGroupId) api.initialize();
    return this._axiosrequest(graphBeta, {
      path: `/beta/groups/${api.teamGroupId}/members`,
      params: this.userParams()
    }).then((resp) => {
      let members: any;
      if(resp) {
        members = resp.value;
        return Promise.map(members, (user:any) => {
          if(user.displayName === api.signedInUser) user.me = true;
          else user.me = false;
          return this.getUserPhoto(user.id).then((photo:any) => {
            if(photo) user.photo = Buffer.from(photo, 'binary');
            else user.photo = null;
            return user;
          })
        })
      } else {

      }
    })
  };

  graph.getUsersWithQuery = function(query) {
    return this._axiosrequest(graphBeta, {
      path: '/beta/users',
      params: { ...Object.assign(this.userParams(), this.userFilter(query)) }
    });
  };

  graph.verifySubscription = function(): boolean {
    let subscription:any;
    try {
      subscription = JSON.parse(localStorage.getItem('subscription'));
    } catch(e) { subscription = undefined }
    let expiryDate:any;
    if(subscription) {
      expiryDate = Time.MOMENT(api.subscription.expirationDateTime).format();
    }
    return !subscription ? false :
      Time.MOMENT().utc().isAfter(Time.MOMENT(expiryDate))
      ? false : true;
  };  

  graph.createSubscription = function() {
    const subscription = {
      changeType: 'created,updated,deleted',
      notificationUrl: `${baseUrl}/api/webhook`,
      resource: 'me/events',
      clientState: 'subscription-identifier',
      expirationDateTime: Time.MOMENT().add(1, 'days').utc().format()
    };
    return this._axiosrequest(graphApi, {
      path: '/subscriptions',
      method: 'post',
      data: subscription
    }).then((subscription) => {
      if(subscription) {
        api.setSubscription(subscription);
        return true;
      } else {
        return false;
      }
    })
  };

  graph.teamsDeepLinkBuilder = function(subEntityId) {
    let deepLinkUrl = teamsUrl + '/l/entity/';
    let deepLinkParameters = `${clientId}/webexdev-scheduler?` +
      `webUrl=${contentUrl}/webex-joiner&label=Join WebEx&` +
      `context={"subEntityId":${JSON.stringify(subEntityId)},"canvasUrl":` +
      `"${contentUrl}","channelId":"${api.channelId}"}`;
    return deepLinkUrl + encodeURI(deepLinkParameters);
  };

  graph.dialogActionCardBuilder = function(entity) {
    return [{
      '@type': 'OpenUri',
      'name': 'Join the Conference',
      targets: [{ os: 'default', uri: this.teamsDeepLinkBuilder(entity) }]
    }]
  };

  graph.handleSubscriptionDeletion = function(eventId, events) {
    let event: any;
    Object.keys(events).forEach(key => {
      if(events[key].find(evt => evt.id == eventId)) {
        event = events[key].find(evt => evt.id==eventId);
        event['prop'] = key;
        event['index'] = events[key].findIndex(evt => evt.id==eventId);
      }
    });
    return new Promise((resolve, reject) => {
      resolve(event);
    })
  };

  graph.eventPropertyFilter = () =>
    'id,subject,bodyPreview,isOrganizer,isCancelled,'+
    'start,end,organizer,attendees';

  graph.getEvents = function() {
    const eventDateFilter = Time.MOMENT()
      .startOf(Time.DAY)
      .subtract(1, Time.DAYS)
      .format(Time.outlookformat);
    let events: any = Time.uidates();
    return this._axiosrequest(graphApi, {
      path: '/me/events',
      method: 'get',
      params: {
        '$filter': `start/dateTime ge '${eventDateFilter}'`,
        '$orderby': 'end/dateTime',
        '$select': this.eventPropertyFilter()
      }
    }).then(({value}) => {
      if(value && value.length > 0) {
        return Promise.map(value, (event:any) => {
          const {
            id, subject, bodyPreview,
              isOrganizer, isCancelled,
              start, end, organizer, attendees
          } = event;
          let outlookEvent: any = {
            id, subject,
            isOrganizer, isCancelled,
            webExMeetingKey: bodyPreview || '',
            startDate: Time.cal(start.dateTime),
            endDate: Time.cal(end.dateTime),
            attendees: (() => {
              return attendees.map(attendee => ({
                name: attendee.emailAddress.name || '',
                emailAddress: attendee.emailAddress.address,
                status: attendee.status.response,
                type: attendee.type
              }))
            })()
          };
          const prop = Time.findEventProp(start.dateTime);
          if(bodyPreview) {
            api.webExGetJoinUrl({
              meetingKey: bodyPreview,
              host: isOrganizer,
              attendee: {
                displayName: api.signedInUser, mail: api.signedInUserEmail
              }
            }).then(({joinUrl}) => {
              outlookEvent['joinUrl'] = joinUrl;
              apiEmitter.emit('newevent', {
                prop, event: outlookEvent
              });
            })
          } else {
            apiEmitter.emit('newevent', {
              prop, event: outlookEvent
            });
          }
          return;
        });
      } else if(value && value.length === 0) {
        apiEmitter.emit('event-service-success');
      }
    });
  };

  graph.deleteEvent = function(id) {
    return this._axiosrequest(graphBeta, {
      path: `/beta/me/events/${id}`,
      method: 'delete'
    })
  };

  graph.generateMeetingRequest = (meeting, attendees) => ({
    subject: meeting.title,
    location: { displayName: meeting.location },
    attendees: (() => 
      attendees.map((attendee:any) => ({
        emailAddress: { address: attendee.mail, name: attendee.displayName },
        type: 'required'
      })
    ))(),
    ...Time.normalizeDates({
        startDate: meeting.startDate,
        startTime: meeting.startTime,
        endDate: meeting.endDate,
        endTime: meeting.endTime
      })
  });

  graph.createEvent = function(meeting) {
    return this._axiosrequest(graphBeta, {
      path: '/beta/me/events',
      method: 'post',
      data: meeting
    });
  };

  graph.resetMeeting = JSON.parse(JSON.stringify({
    newEvent: false,
    start: { dateTime: '', timeZone: '' },
    end: { dateTime: '', timeZone: '' },
    title: '',
    loation: '',
    startDate: new Date(),
    startTime: '',
    endDate: new Date(),
    endTime: '',
  }));

  graph.handleIncomingSocket = function(eventUpdates:any, events: any) {
    const deleteEvent = eventUpdates.value.find(change => change.changeType === 'deleted');
    if(deleteEvent) {
      const eventId = deleteEvent.resourceData.id;
      return this.handleSubscriptionDeletion(eventId, events)
        .then((event) => {
          if(event.webExMeetingKey && event.isOrganizer) {
            return api.webExDeleteMeeting(event.webExMeetingKey).then(() => event);
          } else {
            return event;
          }
        })
        .then((event) => {
          events[event.prop].splice(event.index, 1);
          return events;
        });
    } else {
      return Promise.resolve({
        newMeeting: this.resetMeeting,
        attendees: [],
        newMeetingBtnLabel: 'Schedule Meeting'
      });
    }
  };

  return graph;
}

export interface GraphService {
  getMe(): Promise<any>;
  getUserPhoto(userId:string): Promise<any>;
  getTeam(): Promise<any>;
  getUsersWithQuery(userTextQuery:string): Promise<any>;
  getEvents(): Promise<any>;
  postConnectorCard(actions: any, organizer:any): Promise<any>;
}