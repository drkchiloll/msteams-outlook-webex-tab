import * as React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

const styles: any = {
  icon: { color: '#D1C4E9' },
  button: {
    position: 'relative',
    bottom: 2,
    marginTop: '15px'
  }
};

export const ScheduleButton = ({schedule}) =>
  <RaisedButton label='Schedule a Meeting'
    style={styles.button}
    fullWidth={true}
    primary={true}
    labelPosition='after'
    icon={<i style={styles.icon} className='mdi mdi-calendar mdi-18px' />}
    onClick={schedule} />