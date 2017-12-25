import { Request, Response } from 'express';
import * as request from 'request';
import * as Promise from 'bluebird';

export const controller = (() => {
  let c: any = {};

  c.token = function(req: Request, res: Response) {
    console.log(req.query);
    res.redirect('/');
  };

  return c;
})();