import { Request, Response } from 'express';
import * as Promise from 'bluebird';
import { Properties } from '../properties';
const { WebEx: { user, password } } = Properties;
import { WebEx } from '../lib/WebEx';

export const webExController = (() => {
  let cntrler: any = {};

  cntrler.createInstance = function({ webExId, webExPassword }) {
    return new WebEx({ webExID: webExId, password: webExPassword });
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

  cntrler.createMeeting = function(req: Request, res: Response) {
    // { title/subject, attendees, startDate, duration, timeZone }
    let { webExId, webExPassword } = JSON.parse(JSON.stringify(req.body));
    delete req.body.webExId;
    delete req.body.webExPassword;
    // console.log(req.body);
    const client = cntrler.createInstance({ webExId, webExPassword });
    client
      .meetingsService
      .create(req.body)
      .then((resp:any) => {
        if(resp && resp.error) return res.status(401);
        res.send(resp)
      })
  };

  cntrler.getJoinUrls = function(req: Request, res: Response) {
    let { webExId, webExPassword } = JSON.parse(JSON.stringify(req.body));
    delete req.body.webExId;
    delete req.body.webExPassowrd;
    const client = cntrler.createInstance({ webExId, webExPassword });
    client
      .meetingsService
      .joinUrls(req.body)
      .then((xml: any) => res.send(xml));
  };

  cntrler.getHostJoinUrl = function(req: Request, res: Response) {
    let { webExId, webExPassword } = JSON.parse(JSON.stringify(req.body));
    delete req.body.webExId;
    delete req.body.webExPassowrd;
    const client = cntrler.createInstance({ webExId, webExPassword });
    client
      .meetingsService
      .hostJoinUrl(req.body)
      .then((resp: any) => {
        return res.send(resp);
      });
  }

  return cntrler;
})();
