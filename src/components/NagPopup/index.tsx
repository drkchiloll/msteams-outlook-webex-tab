import * as React from 'react';
import { Dialog, CircularProgress } from 'material-ui';

const styles: any = (hasToken) => {
  return {
    progress: {
      display: hasToken ? 'inline' : 'none',
      position: 'absolute',
      left: window.innerWidth/2,
      top: window.innerHeight/3
    }
  }
};

export const NagPopup = ({hasToken}) => (
  <div>
    <div style={styles(hasToken).progress}>
      <CircularProgress size={60} thickness={4.5} />
    </div>
    <Dialog open={!hasToken}
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
  </div>
)