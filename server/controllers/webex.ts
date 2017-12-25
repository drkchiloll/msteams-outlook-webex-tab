import { Request, Response } from 'express';
import * as Promise from 'bluebird';

import { Properties } from '../properties';
const { WebEx: { user, password } } = Properties;
import { WebEx } from '../lib/WebEx';

export const controller = (() => {
  let cntrler: any = {};

  cntrler.generic = function(req:Request, res:Response) {
    let client = new WebEx({ webExID: user, password });
    client.userService.get(user).then((xml: string) => {
      res.status(201).send(xml);
    });
  };

  cntrler.getMeetings = function(req: Request, res: Response) {
    let client = new WebEx({ webExID: user, password });
    client.meetingsService.getSummary().then((xml: string) => {
      res.status(200).send(xml);
    });
  };

  cntrler.getMeeting = function(req: Request, res: Response) {
    let { meetingKey } = req.params;
    let client = new WebEx({ webExID: user, password });
    client.meetingsService.get({ meetingKey }).then((resp: string) => {
      res.status(200).send(resp);
    });
  };

  return cntrler;
})();
