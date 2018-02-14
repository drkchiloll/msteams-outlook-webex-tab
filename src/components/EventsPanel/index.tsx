import * as React from 'react';
import { Subheader, List, ListItem, RaisedButton } from 'material-ui';
import { Time } from '../../middleware';

export const EventsPanel = ({ events }) => {
  return (
    <List>
      <Subheader> Agenda </Subheader>
      { Object.keys(events).map((key, i) =>
        <ListItem key={`${i}_eventItem`}
          primaryText={key}
          initiallyOpen={true}
          innerDivStyle={{ fontSize: '90%', marginLeft: '2px' }}
          style={{ height: 39 }}
          primaryTogglesNestedList={true}
          nestedItems={(() => {
            if(events[key].length === 0) {
              return [
                <ListItem primaryText='No upcoming meetings'
                  key='upMeet_0'
                  open={true}
                  style={{height: 35}}
                  innerDivStyle={{
                    fontSize: '90%',
                    paddingTop: 10,
                    paddingBottom: 10,
                    marginBottom: 0
                  }} />
              ]
            } else {
              return events[key].map(event =>
                <ListItem key={event.id}
                  value={event.id}
                  innerDivStyle={{
                    fontSize: '90%',
                    borderLeft: 'solid 4px #673AB7',
                    marginLeft: 30,
                    marginBottom: 10,
                    height: 33
                  }}
                  primaryText={
                    <div style={{ top: 8, position: 'absolute' }}>
                      {event.subject}<br />
                      {Time.eventView(event.startDate)}
                      {' - ' + Time.eventView(event.endDate)} <br />
                      <i className='mdi mdi-cisco-webex mdi-18px'
                        style={{ color: 'rgb(55,103,52)' }} />
                      &nbsp;Cisco WebEx Meeting
                    </div>
                  }
                  secondaryTextLines={2}
                  rightIconButton={
                    <RaisedButton label='Join'
                      disabled={!event.joinUrl}
                      style={{
                        marginTop: '15px',
                        marginRight: '10px',
                        width: '60px',
                        minWidth: '60px'
                      }}
                      onClick={() =>
                        window.open(event.joinUrl, 'launchMeeting')} />
                  } />)
            }
          })()} />
      ) }
    </List>
  )
};