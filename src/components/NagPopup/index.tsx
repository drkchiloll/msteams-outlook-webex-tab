import * as React from 'react';
import { Dialog } from 'material-ui';

export const NagPopup = (props) => (
  <Dialog open={true}
    title={
      <span className='mdi mdi-cisco-webex mdi-24px'>
        &nbsp; Microsoft Teams/Cisco WebEx Integration
    </span>}>
    <br />
    This application requires Authorization and Authentication to your Office 365 Organization
    with certain permissions granted such as Reading User Data and the ability to Create Events in Outlook.
    This action also enables the Application to get Team members and/or lookup and add other users within
    your organization to a Meeting; If you have previously Authenticated and your Credentials haven't expired
    you will not be required to Authenticate again until such time your access token expires.
  </Dialog>
)