import { Request, Response } from 'express';
import * as request from 'request';
import * as Promise from 'bluebird';
import { MsGraph } from '../lib';

import { io } from '../run';

export interface MsTeamsReqQuery {
  token: string;
  timeZone?: string;
}

export interface CreateEventObject {
  subject: string;
  body?: { contentType, content },
  start: { dateTime, timeZone },
  end: { dateTime, timeZone },
  location: { displayName },
  attendees: [{ emailAddress: {address, name}, type }]
}

export interface CreateEventRequest extends Request {
  body: CreateEventObject;
  query: MsTeamsReqQuery
}

export interface MSTeamsController {
  me(Request,Response): Response;
  createEvent(CreateEventRequest,Response): Response;
  getEvents(Request,Response): Response;
  getUsers(Request,Response): Response;
  getUserPhoto(Request,Response): Response;
  createSubscription(Request,Response): Response;
  deleteSubscription(Request,Response): Response;
  hooks(Request,Response): Response;
  conflictFinder(Request,Response): Response;
  teamMembers(Request,Response): Response;
  webExDialogConnector(Request,Response): Response;
}

export const msTeamsController: MSTeamsController = (() => {
  let c: any = {};

  c.me = function(req:Request, res:Response) {
    let { token } = req.query;
    let graph = new MsGraph({ token });
    graph
      .userService
      .getMe()
      .then((result:any) => res.send(result));
  };

  c.createEvent = function(req: CreateEventRequest, res: Response) {
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

  c.createSubscription = function(req:Request, res:Response) {
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

  c.deleteSubscription = function(req:Request, res:Response) {
    const { params: {id}, query: {token} } = req;
    let graph = new MsGraph({ token });
    graph._request({
      method: 'delete',
      body: {},
      path: `/beta/subscription/${id}`
    }).then((resp) => res.send({}));
  };

  c.hooks = function(req: Request, res: Response) {
    if(req.query.validationToken) {
      console.log(req.query.validationToken);
      return res.status(200).send(req.query.validationToken);
    } else {
      res.status(202).send({});
    }
    // alert(JSON.stringify(req.body));
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
  };

  c.teamMembers = function(req:Request, res:Response) {
    let { token, groupId } = req.query;
    let graph = new MsGraph({ token });
    return graph
      .msTeamsService
      .listMembers(groupId)
      .then(value => res.send(value));
  };

  c.webExDialogConnector = function(req:Request, res:Response) {
    res.send({});
    let { actionCards, organizer } = req.body;
    let graph = new MsGraph({ token: 'no token needed' });
    graph
      .msTeamsService
      .postActionCard(actionCards, organizer)
      .then((resp:any) => res.send(resp));
  }

  return c;
})();