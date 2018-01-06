import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';

export let app: express.Express = express();

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// routes

import { router as defaultRoute } from './default';
import { router as appRoute } from './app-routes';

app.use('/', defaultRoute);
app.use('/api', appRoute);

app.use((err:any, req:any, res:any, next:any) => {
  res.status(err.status || 500).json({
    message: err.message, error: err
  });
});
