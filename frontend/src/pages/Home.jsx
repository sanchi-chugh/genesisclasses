import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import axios from 'axios';

const styles = theme => ({
});

class Home extends Component {
  // const { classes } = props;
  state = {
    user : null,
  }
  
  componentWillMount() {
    axios.get('/api-auth/user/',{
      headers: {Authorization: `Token ${localStorage.token}`}
    }).then((res) => {
      this.setState({ user: res.data.profile }, () => console.log("done"));
    });
  }
  
  render() {
    console.log("sdf", this.state.user);
    return (
      <div>
        <Grid container spacing={24}>
          {this.state.user ? this.state.user.type : 'NULL'}
        </Grid>
      </div>
    );  
  }  
}

export default withStyles(styles, { withTheme: true })(Home);