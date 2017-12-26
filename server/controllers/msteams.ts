import { Request, Response } from 'express';
import * as request from 'request';
import * as Promise from 'bluebird';
import { MsGraph } from '../lib';

export const controller = (() => {
  let c: any = {};

  c.token = function(req: Request, res: Response) {
    console.log(req.query);
    res.redirect('/');
  };

  c.createEvent = function(req: Request, res: Response) {
    let { token } = req.body;
    let graph = new MsGraph({ token });
    graph.outlookService.createEvent({
      subject: 'App Integration Team',
      body: {
        contentType: 'html',
        content: 'Team Formation meeting'
      },
      start: {
        dateTime: '2017-12-27T10:00:00',
        timeZone: 'Central Standard Time'
      },
      end: {
        dateTime: '2017-12-27T12:00:00',
        timeZone: 'Central Standard Time'
      },
      location: { displayName: 'WebEx Conference' },
      attendees: [{
        emailAddress: {
          address: 'samuel.womack1@gmail.com',
          name: 'Alter Ego Sam'
        },
        type: 'required'
      }]
    }).then((resp: any) => {
      res.send(resp);
    });
  };

  return c;
})();