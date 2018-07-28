import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Redirect } from 'react-router-dom';

const styles = theme => ({
});

class Home extends Component {
  // const { classes } = props;
  render() {
    if (this.props.user ) {
      const { user } = this.props;
      if (user.type === 'student') {
        if (!user.complete)
          return <Redirect to="/complete-profile/" />
      }
    }
    return (<div> nothing </div>)
  }  
}

export default withStyles(styles, { withTheme: true })(Home);