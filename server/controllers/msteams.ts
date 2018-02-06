import { Request, Response } from 'express';
import * as request from 'request';
import * as Promise from 'bluebird';
import { MsGraph } from '../lib';
import { io } from '../run';


export const msTeamsController: any = (() => {
  let c: any = {};

  c.hooks = function(req: Request, res: Response) {
    if(req.query.validationToken) {
      console.log(req.query.validationToken);
      return res.status(200).send(req.query.validationToken);
    } else res.status(202).send({});
    // console.log(req.body);
    io.emit('notification_received', req.body);
  };

  c.webExDialogConnector = function(req:Request, res:Response) {
    let { actionCards, organizer } = req.body;
    let graph = new MsGraph({ token: 'null' });
    graph
      .msTeamsService
      .postActionCard(actionCards, organizer)
      .then((resp:any) => {
        // console.log(resp.data);
        res.send({});
      });
  }

  return c;
})();