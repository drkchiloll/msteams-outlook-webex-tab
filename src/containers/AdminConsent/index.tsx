import * as React from 'react';
import autobind from 'autobind-decorator';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { Paper, FlatButton, Divider, Subheader } from 'material-ui';
import * as Properties from '../../../properties.json';
const {msApp: {clientId, authority, baseUrl}} = Properties;

export class AdminConsent extends React.Component<any, any> {
  state = {
    img: { height: 600, width: 400 }
  };

  componentDidMount() {
    this.calculateImgSize();
    window.addEventListener('resize', this.calculateImgSize);
  }

  urlBuilder() {
    const redirectUri = baseUrl + '/adminconsent';
    return authority + '/common/adminconsent?client_id=' +
      `${clientId}&redirect_uri=${redirectUri}&state=12345`;
  }

  @autobind
  execConsent() {
    window.open(this.urlBuilder(), 'Consent Request');
  }

  @autobind
  calculateImgSize() {
    const { innerHeight, innerWidth } = window;
    if(innerHeight <= 425) {
      this.setState({img: {height: 250, width: 150}});
    } else if(innerHeight >= 699) {
      this.setState({img: {height: 600, width: 400}});
    } else if(innerHeight <= 605) {
      this.setState({ img: { height: 500, width: 350 }});
    }
  }

  render() {
    const { img: {height, width }} = this.state;
    return (
      <Paper zDepth={3} >
        <Subheader>Admin Consent</Subheader>
        <Grid fluid>
          <Row>
            <Col xs={12} md={6}>
              <img src='/consent_example.png' height={height} width={width} />  
            </Col>
          </Row>
          <Row>
            <Col xs={8} md={4}>
              <FlatButton label='Grant Consent' onClick={this.execConsent} />
            </Col>
          </Row>
        </Grid>
      </Paper>
    );
  }
}