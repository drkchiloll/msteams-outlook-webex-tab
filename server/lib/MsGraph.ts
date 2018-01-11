import * as request from 'request';
import * as Primise from 'bluebird';
import {
  outlookServFactory,
  o365UserServFactory,
  MsTeamsServiceFactory,
} from '../services';

import { MSTeamsService } from '../models';

import { Properties } from '../properties';

const { MsGraph: {
  uri, headers, connectorUrl
}} = Properties;

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
    headers['Authorization'] = `Bearer ${token}`;
    this.headers = headers;
    this.outlookService = outlookServFactory(this);
    this.userService = o365UserServFactory(this);
    this.msTeamsService = MsTeamsServiceFactory(this);
  }

  connectorRequest(card) {
    return new Promise((resolve, reject) => {
      request.post({
        uri: connectorUrl, headers,
        json: true, body: card
      }, (err, resp, body) => resolve(body));
    })
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

  _request({body, method, path}) {
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