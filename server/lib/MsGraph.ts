import * as request from 'request';
import * as Primise from 'bluebird';
import { outlookServFactory } from '../services';
import { Properties } from '../properties';

const { MsGraph: { uri, headers }} = Properties;

export class MsGraph {
  outlookService: any;
  headers: any;
  constructor({ token }) {
    headers['Authorization'] = `Bearer ${token}`;
    this.headers = headers;
    this.outlookService = outlookServFactory(this);
  }

  private _options(params: any) {
    return {
      uri: uri + params.path,
      headers: this.headers,
      method: params.method,
      json: true,
      body: params.body || {}
    };
  }

  _request({body, method, path}) {
    const reqOptions = this._options({ body, path, method });
    return new Promise((resolve, reject) => {
      request(reqOptions, (err, resp, body) => {
        return resolve(body);
      });
    });
  }
}