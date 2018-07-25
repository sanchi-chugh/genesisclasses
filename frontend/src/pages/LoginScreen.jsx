import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { login } from '../auth';

const styles = theme => ({
  container: {
    width: '100%',
    maxWidth : '450px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '80%',
  },
  card: {
      minWidth: 275,
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    title: {
      marginBottom: 16,
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
});

class LoginScreen extends React.Component {
  constructor(props){
    super();
    this.setState = {
        username : '',
        password : ''
    }
  }

setUsername(event){
  this.setState({
    username : event.target.value
});
}
setPassword(event){
  this.setState({
    password : event.target.value
});
}

userLogin(event){
    event.preventDefault();
    login(this.state.username, this.state.password);
}

  render() {
  const { classes } = this.props;
 return(
<div className={classes.container} >
   <Card className={classes.card}>
          <CardContent>
<center>
  <Typography variant="headline" component="h2">
Login
            </Typography>
<form noValidate autoComplete="off">
   <TextField
             id="required"
             label="Username"
             defaultValue = ""
             className={classes.textField}
             margin="normal"
             onChange = {(event) => this.setUsername(event)}
           />
 <br />
  <TextField
           id="password-input"
           label="Password"
           className={classes.textField}
           defaultValue = ""
           type="password"
           margin="normal"
          onChange = {(event) => this.setPassword(event)}
         />
<br /> <br />
         <Button variant="contained" color="primary" className={classes.button} onClick={(event) => this.userLogin(event)}>
                 Login
               </Button>
  <p>Forgot Password?</p>
</form>
</center>

</CardContent>
</Card>
</div>
);
}
}

export default withStyles(styles, { withTheme : true })(LoginScreen);
