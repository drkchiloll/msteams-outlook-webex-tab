import * as request from 'request';
import * as Primise from 'bluebird';
import {
  outlookServFactory,
  o365UserServFactory
} from '../services';
import { Properties } from '../properties';

const { MsGraph: { uri, headers }} = Properties;

export class MsGraph {
  outlookService: any;
  userService: any;
  headers: any;
  constructor({ token }) {
    headers['Authorization'] = `Bearer ${token}`;
    this.headers = headers;
    this.outlookService = outlookServFactory(this);
    this.userService = o365UserServFactory(this);
  }

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
        if(resp && resp.statusCode === 404) {
          console.log(resp.statusCode);
          return resolve(null);
        } else if(resp && resp.statusCode === 500) {
          console.log(body);
        }
        return resolve(body);
      });
    });
  }
}