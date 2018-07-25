import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  menu: {
    width: 200,
  },
});

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };
const LoginScreen = (props) => {
 return(
   <TextField
             required
             id="required"
             label="Username"
             defaultValue="Hello World"
             className={classes.textField}
             margin="normal"
           />
  <TextField
           id="password-input"
           label="Password"
           className={classes.textField}
           type="password"
           autoComplete="current-password"
           margin="normal"
         />
         <Button variant="contained" color="primary" className={classes.button}>
                 Primary
               </Button>
);
}
