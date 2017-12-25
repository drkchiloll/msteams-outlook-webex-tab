import * as express from 'express';
import {
  webex, msteams
} from '../controllers';

export const router: express.Router = express.Router();

router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

router
  .route('/auth')
  .post(webex.generic);

router
  .route('/token')
  .post(msteams.token);

router.route('/meetings')
  .get(webex.getMeetings);

router.route('/meetings/:meetingKey')
  .get(webex.getMeeting)
