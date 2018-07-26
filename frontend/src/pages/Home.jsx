import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
});

class Home extends Component {
  // const { classes } = props;
  render() {
    return (
      <div>
        <Grid container spacing={24}>
          {this.props.user ? this.props.user.type : 'NULL'}
        </Grid>
      </div>
    );  
  }  
}

export default withStyles(styles, { withTheme: true })(Home);