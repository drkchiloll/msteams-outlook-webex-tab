import { Request, Response } from 'express';
import * as request from 'request';
import * as Promise from 'bluebird';
import { MsGraph } from '../lib';

import { io } from '../run';

export const msTeamsController = (() => {
  let c: any = {};

  c.token = function(req: Request, res: Response) {
    // console.log(req.query);
    res.redirect('/');
  };

  c.createEvent = function(req: Request, res: Response) {
    let { body, query: { token }} = req;
    let graph = new MsGraph({ token });
    graph.outlookService.createEvent(body).then((resp: any) => {
      res.send(resp);
    });
  };

  c.getEvents = function(req: Request, res: Response) {
    let { token, timezone } = req.query;
    let graph = new MsGraph({ token });
    graph.outlookService.get(timezone).then((events) => {
      // console.log(events);
      res.send(events);
    });
  };

  c.getUsers = function(req: Request, res: Response) {
    let { token, users } = req.query;
    let graph = new MsGraph({ token });
    graph.userService.get(users).then((users) => {
      res.send(users);
    })
  };

  c.getUserPhoto = function(req:Request, res:Response) {
    const { 
      query: { token },
      params: { id }
    } = req;
    let graph = new MsGraph({ token });
    graph
      .userService
      .getPhoto(id)
      .then((resp) => {
        if(!resp) resp = {message: 'no photo'};
        res.send(resp);
      })
  };

  c.subscriptions = function(req:Request, res:Response) {
    const { query: { token }} = req;
    let graph = new MsGraph({ token });
    graph._request({
      method: 'post',
      body: req.body,
      path: '/beta/subscriptions'
    }).then((result) => {
      console.log(result);
      res.send(result);
    })
  };

  c.hooks = function(req: Request, res: Response) {
    if(req.query.validationToken) return res.status(200).send(req.query.validationToken);
    console.log(req.body);
    res.status(202).send({});
    io.emit('notification_received', req.body);
  };

  c.conflictFinder = function(req:Request, res:Response) {
    let { token } = req.query;
    let graph = new MsGraph({ token });
    graph
      .outlookService
      .findMeetingTimes(req.body)
      .then((result:any) => {
        console.log(JSON.stringify(result));
        // console.log(result.meetingTimeSuggestions.length);
        res.send(result);
      });
  }

  return c;
})();