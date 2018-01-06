import * as express from 'express';
import { webExController, msTeamsController } from '../controllers';

export const router: express.Router = express.Router();

router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

router.route('/meetings')
  .get(webExController.getMeetings)
  .post(webExController.createMeeting)

router.route('/meeting/:meetingKey')
  .get(webExController.getMeeting)

router.route('/webex-joinurl')
  .post(webExController.getJoinUrls)

router.route('/webex-hostjoinurl')
  .post(webExController.getHostJoinUrl)

router.route('/outlook-events')
  .get(msTeamsController.getEvents)
  .post(msTeamsController.createEvent)

router.route('/users')
  .get(msTeamsController.getUsers)

router.route('/users/:id/photo')
  .get(msTeamsController.getUserPhoto)

router.post('/subscriptions', msTeamsController.subscriptions);

router.route('/webhook')
  .post(msTeamsController.hooks)