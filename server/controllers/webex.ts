import { Request, Response } from 'express';
import * as Promise from 'bluebird';
import { Properties } from '../properties';
import { WebEx } from '../lib/WebEx';

import { MeetingService } from '../models';

export const webExController = (() => {
  let cntrler: any = {};

  cntrler.createInstance = function({ webExId, webExPassword }) {
    return new WebEx({ webExID: webExId, password: webExPassword });
  };

  cntrler.requestHandler = function(args) {
    const { webex } = JSON.parse(JSON.stringify(args));
    delete args.webex
    return {
      client: cntrler.createInstance(webex),
      data: args
    };
  };

  cntrler.authenticate = function(req: Request, res: Response) {
    let { webExId, webExPassword } = req.body;
    const client = cntrler.createInstance({ webExId, webExPassword });
    client
      .userService
      .authenticate()
      .then(resp => res.send(resp));
  };

  cntrler.getMeetings = function(req: Request, res: Response) {
    let { webExId, webExPassword } = JSON.parse(JSON.stringify(req.body));
    delete req.body.webExId;
    delete req.body.webExPassowrd;
    const client = cntrler.createInstance({ webExId, webExPassword });
    client.meetingsService.getSummary().then((xml: string) => {
      res.status(200).send(xml);
    });
  };

  cntrler.getMeeting = function(req: Request, res: Response) {
    let { meetingKey } = req.params;
    let { webExId, webExPassword } = JSON.parse(JSON.stringify(req.body));
    delete req.body.webExId;
    delete req.body.webExPassowrd;
    const client = cntrler.createInstance({ webExId, webExPassword });
    client.meetingsService.get({ meetingKey }).then((resp: string) => {
      res.status(200).send(resp);
    });
  };

  cntrler.deleteMeeting = function(req: Request, res: Response) {
    const { client } = cntrler.requestHandler(req.body);
    const { meetingKey } = req.params;
    client.meetingsService
      .delete(meetingKey)
      .then((resp:any) => {
        console.log(resp);
        return res.send(resp);
      });
  }

  cntrler.createMeeting = function(req: Request, res: Response) {
    const { webex, meeting } = req.body;
    const client = cntrler.createInstance(webex);
    client
      .meetingsService
      .create(meeting)
      .then((resp:any) => {
        if(resp && resp.error) return res.status(401);
        res.send(resp)
      })
  };

  cntrler.meetNow = function(req: Request, res: Response) {
    const { webex, meeting } = req.body;
    const client: WebEx = cntrler.createInstance(webex);
    return client
      .meetingsService
      .createInstantly({
        webExId: webex.webExId,
        webExPassword: webex.webExPassword,
        agenda: meeting.agenda
      })
      .then((result) => res.send(result));
  };

  cntrler.getJoinUrls = function(req: Request, res: Response) {
    const { webex, meetingKey, meetingPassword, attendee } = req.body;
    const client = cntrler.createInstance(webex);
    client
      .meetingsService
      .joinUrls({meetingKey, meetingPassword, attendee})
      .then((xml: any) => res.send(xml));
  };

  cntrler.getHostJoinUrl = function(req: Request, res: Response) {
    const { webex, meetingKey } = req.body;
    const client = cntrler.createInstance(webex);
    client
      .meetingsService
      .hostJoinUrl({ meetingKey })
      .then((resp: any) => res.send(resp));
  };

  return cntrler;
})();
