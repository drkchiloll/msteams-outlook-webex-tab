import * as React from 'react';
import * as Promise from 'bluebird';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { AutoComplete } from 'material-ui';

export class UserSearch extends React.Component<any,any> {

  render() {
    return (
      <AutoComplete 
        floatingLabelText='Invite Someone'
        filter={AutoComplete.noFilter}
        fullWidth={true}
        openOnFocus={true}
        dataSource={[{value: 'someValue', text: 'someText'}]} />
    );
  }
}