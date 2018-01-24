import axios from 'axios';

import {
  AxiosInstance,
  AxiosRequestConfig
} from 'axios';

import { stringify } from 'querystring';
import * as Promise from 'bluebird';
import * as properties from '../../properties.json';
const { msApp: {
  uri, webApi, connectorUrl, teamsUrl, clientId, contentUrl
} } = properties;

import { Api } from './index';

export function graphServiceFactory(api: Api) {
  const statusFn = (status) =>
    (status) => status >= 200 && status <= 500;

  const graphBeta = axios.create({ baseURL: uri });
  graphBeta.defaults.headers.common['Authorization'] = `Bearer ${api.token}`;
  graphBeta.defaults.validateStatus = statusFn(status);
  const graphApi = axios.create({ baseURL: webApi });
  graphApi.defaults.headers.common['Authorization'] = `Bearer ${api.token}`;
  graphApi.defaults.validateStatus = (status) =>
    status >= 200 && status <= 500

  const _errors = (status) => {
    let resolver:any;
    switch(status) {
      case 401:
        resolver = { status };
        break;
      case 404:
      default:
        resolver = null;
    }
    return Promise.resolve(resolver);
  }

  const _options = ({path, method='get', data={}, params={}}) => {
    let options:any = { url: path, method };
    if(method==='post') options['data'] = data;
    if(Object.keys(params).length > 0) options['params'] = params;
    return options;
  };

  const axiosrequest = (requestor: AxiosInstance, options) => {
    let requestoptions:any = _options(options);
    if(options.path.includes('photo')) requestoptions['responseType'] = 'arraybuffer';
    return requestor.request(requestoptions)
      .then((resp:any) => {
        if(resp.status >= 400) return _errors(resp.status);
        else return resp.data;
      })
  };

  const graph: any = {};

  graph.userParams = () => ({ select: 'id,displayName,mail'});

  graph.userFilter = (user:string) => ({
    filter: `startsWith(displayName,'${user}') or startsWith(surname,'${user}')`
  })

  graph.getMe = function() {
    return axiosrequest(graphBeta, {
      path: '/beta/me', params: this.userParams()
    });
  };

  graph.getUserPhoto = function(id) {
    return axiosrequest(graphApi, {
      path: `/users/${id}/photo/$value`
    }).then((resp:any) => {
      if(resp) return Buffer.from(resp, 'binary');
      return resp;
    })
  };

  graph.getTeam = function() {
    if(!api.token && !api.signedInUser && !api.teamGroupId) api.initialize();
    return axiosrequest(graphBeta, {
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
      }
    })
  };

  graph.getUsersWithQuery = function(query) {
    return axiosrequest(graphBeta, {
      path: '/beta/users',
      params: { ...Object.assign(this.userParams(), this.userFilter(query)) }
    });
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