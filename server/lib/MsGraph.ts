// import * as request from 'request';
import axios from 'axios';
// import * as Primise from 'bluebird';
import { MsTeamsServiceFactory } from '../services';
import { MSTeamsService } from '../models';
import { properties as Properties } from '../services';
const { msApp: { connectorUrl }} = Properties;

export class MsGraph {
  msTeamsService: MSTeamsService;
  constructor({ token }) {
    this.msTeamsService = MsTeamsServiceFactory(this);
  }

  connector(card) {
    return axios({
      url: connectorUrl,
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      data: card
    });
  }
}