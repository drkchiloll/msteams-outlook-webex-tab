import * as express from 'express';
import { webExController, msTeamsController } from '../controllers';

export const router: express.Router = express.Router();

router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

router.route('/webex-auth')
  .post(webExController.authenticate);

router.route('/webex-meetings')
  .get(webExController.getMeetings)
  .post(webExController.createMeeting)

router.post('/webex-meetnow', webExController.meetNow);

router.route('/webex-meeting/:meetingKey')
  .get(webExController.getMeeting)
  .delete(webExController.deleteMeeting)

router.route('/webex-joinurl')
  .post(webExController.getJoinUrls)

router.route('/webex-hostjoinurl')
  .post(webExController.getHostJoinUrl)

router.route('/msteams-dialoghandler')
  .post(msTeamsController.webExDialogConnector);

router.route('/webhook')
  .post(msTeamsController.hooks)