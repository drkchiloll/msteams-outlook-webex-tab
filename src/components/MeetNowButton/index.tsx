import * as React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

const styles: any = {
  icon: {
    color: 'white',
    fontSize: '1.1em'
  }
};

export const MeetNowButton = ({webexId, meetNow}:any) =>
  <RaisedButton label='Meet Now'
    fullWidth={true}
    disabled={webexId ? false : true}
    primary={true}
    labelPosition='after'
    icon={<i className='mdi mdi-cisco-webex mdi-18px' style={styles.icon} />}
    onClick={meetNow} />