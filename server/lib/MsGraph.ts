import * as request from 'request';
import axios from 'axios';
import * as Primise from 'bluebird';
import {
  outlookServFactory,
  o365UserServFactory,
  MsTeamsServiceFactory,
} from '../services';

import { MSTeamsService } from '../models';

import { properties as Properties } from '../services';

const { msApp: {
  uri, connectorUrl
}} = Properties;

const graphrequest = axios.create({
  baseURL: uri
})

export interface UserService {
  get(any): Promise<any>;
  getMe(): Promise<any>;
  getPhoto(string): Promise<any>;
  getOne(string): Promise<any>;
}

export class MsGraph {
  outlookService: any;
  userService: UserService;
  msTeamsService: MSTeamsService;
  headers: any;
  constructor({ token }) {
    this.headers = {'Content-Type': 'application/json'}
    this.headers['Authorization'] = `Bearer ${token}`;
    this.outlookService = outlookServFactory(this);
    this.userService = o365UserServFactory(this);
    this.msTeamsService = MsTeamsServiceFactory(this);
    graphrequest.defaults.headers.common['Authorization'] = token;
  }

  connectorRequest(card) {
    return new Promise((resolve, reject) => {
      request.post({
        uri: connectorUrl, headers: this.headers,
        json: true, body: card
      }, (err, resp, body) => resolve(body));
    })
  };

  private _axiosoptions({ path, method='get', body={} }) {
    let options:any = {
      url: path,
      method
    };
    if(method === 'post') options.data = body;
    if(path.includes('photo')) options.responseType = 'arraybuffer';
    return options;
  }

  _axiosrequest(options) {
    return graphrequest.request(
      this._axiosoptions(options)
    ).then((resp:any) => {
      if(resp) {
        if(resp.status === 404) return null;
        else if(resp.status === 401) return { status: resp.status };
        else if(options.path.includes('photo')) {
          return resp;
        }
        else return resp.data;
      } else {
        return null;
      }
    }).catch(() => null);
  };

  private _options({path,method='get',body={}}: any) {
    let options: any = {
      uri: uri + path,
      headers: this.headers,
      method,
      json: true,
      body
    };
    if(path.includes('photo')) options.encoding = 'binary';
    return options;
  }

  _request({body={}, method='get', path}) {
    const reqOptions = this._options({ body, path, method });
    // console.log(reqOptions);
    return new Promise((resolve, reject) => {
      request(reqOptions, (err, resp, body) => {
        // console.log(body);
        if(resp) {
          if(resp.statusCode === 404) {
            // console.log(resp.statusCode);
            return resolve(null);
          } else if(resp.statusCode === 500) {
            console.log(body);
          } else if(resp.statusCode === 401) {
            return resolve({ status: resp.statusCode });
          } else {
            return resolve(body);
          }
        }
      });
    });
  }
}