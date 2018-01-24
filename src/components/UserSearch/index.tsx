import * as React from 'react';
import * as Promise from 'bluebird';
import autobind from 'autobind-decorator';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { AutoComplete, MenuItem, Avatar } from 'material-ui';
import { Api } from '../../middleware';

const initialState:any = {
  users: [{id:'0', displayName: ''}], autoCompleteHeight: 25,
  searchText: ''
};

export class UserSearch extends React.Component<any,any> {
  state = {
    users: [{id:'0', displayName: ''}], searchText: '',
    autoCompleteHeight: 25
  }
  
  api:Api = this.props.api;

  styles = {
    spinner: {
      vertialAlign: 'middle', marginTop: '-20px',
      marginLeft: '110px', color: '#9575CD'
    }
  };

  handleDisplayName(n) {
    if(n.includes(' ')) {
      return n.split(' ')[0].substring(0,1).toUpperCase() +
        n.split(' ')[1].substring(0,1).toUpperCase();
    } else {
      return n.substring(0,2).toUpperCase();
    }
  }

  @autobind
  userModel() {
    let userView = JSON.parse(JSON.stringify(this.state.users));
    let { searchText } = this.state;
    return userView.map((user:any, i:any) => {
      if(!user.displayName && searchText) {
        return {
          text: searchText,
          value: (
            <MenuItem primaryText={
              <div style={this.styles.spinner} >
                <i className='mdi mdi-rotate-right mdi-spin mdi-18px' />
              </div>
            } />
          )
        }
      } else if(!searchText) {
        return {text: searchText, value: <MenuItem primaryText='' />}
      } else {
        return {
          text: searchText,
          value: (
            <MenuItem key={user.id}
              innerDivStyle={{position: 'relative', top: 10, lineHeight: 0.95}}
              primaryText={
                <div>{user.displayName}<br/>
                  <em style={{
                    display:
                      user.displayName.includes('matches') || !user.mail ? 'none' : 'inline-block',
                      marginBottom: '1px'
                  }}>
                    {user.mail}
                  </em>
                </div>
              }/>
          )
        }
      }
    });
  }

  @autobind
  userSearch(text) {
    this.setState({ searchText: text });
    if(!text) return this.setState(initialState);
    this.api.graphService
      .getUsersWithQuery(text)
      .then(({ value }) => {
        if(value.length === 0) {
          let users = initialState.users;
          users[0].displayName = `We didn't find any matches`;
          this.setState({ users, autoCompleteHeight: 65 });
        } else {
          return Promise.reduce(value, (a, user:any) => {
            a.push(user);
            this.setState({users: a, autoCompleteHeight: 'auto'});
            return a;
          },[]);
        }
      });
  }

  @autobind
  attendeeSelect(input, index) {
    let { users } = this.state;
    this.setState({ searchText: users[index].displayName });
    let selectedUser: any = users[index];
    return this.api.graphService
      .getUserPhoto(selectedUser.id)
      .then((photo) => {
        selectedUser.photo = photo;
        return selectedUser;
      })
      .then(this.props.addAttendee)
      .then(() => this.setState(initialState));
  }

  render() {
    return (
      <AutoComplete
        searchText={this.state.searchText}
        floatingLabelText='Invite Someone'
        listStyle={{ maxHeight: 200, overflow: 'auto', margin: 0, padding: 0 }}
        menuStyle={{ height: this.state.autoCompleteHeight }}
        filter={AutoComplete.noFilter}
        fullWidth={true}
        openOnFocus={true}
        dataSource={this.userModel()}
        onUpdateInput={this.userSearch}
        onNewRequest={this.attendeeSelect} />
    );
  }
}