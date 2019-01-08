import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import axios from 'axios';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';

const styles = theme => ({
  container: {
    width: '100%',
    maxWidth : '400px',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '50px',
    marginBottom: '50px',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '80%',
  },
  card: {
    minWidth: '230px',
    paddingTop: '30px',
    paddingBottom: '50px',
  },
  button: {
    width: '80%',
    marginTop: '20px',
  },
});

class ResetPassword extends React.Component {
  constructor(props){
    super();
    this.state = {
      busy: false,
      error: false,
      errorMessage: '',
      password1: '',
      password2: '',
    }
  }

  handlePasswordChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ busy: true }, () => {
      axios.post("/api-auth/password/reset/confirm/", {
        new_password1: this.state.password1,
        new_password2: this.state.password2,
        uid: this.props.match.params.uid,
        token: this.props.match.params.token,
      })
      .then(() => {
        this.setState({ busy: false, sent: true }, () => {
          this.props.history.push("/login/")
        });
      })
      .catch((err) => {
        this.setState({ 
          busy: false,
          sent: false,
          error: true,
          errorMessage: 'Invalid/Expired Link',
        })
      })
    });
  }

  componentDidMount() {
    ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
      if (value !== this.state.password1) {
        return false;
      }
      return true;
    });
  }

  render() {
    const { classes } = this.props;
    return(
      <div className={classes.container} >
        <LinearProgress
          style={
            this.state.busy ? 
              {visibility: 'visible'} :
              {visibility: 'hidden'}
            }
          color="primary"
        />
        <Card className={classes.card}>
          <CardContent>
            <center>
              <Typography variant="headline" component="h2">
                Reset Password
              </Typography>
              <br /><br />
              <Typography>
                Create your new password
              </Typography>
              {this.state.error ? (
                <Typography style={{color: 'red'}}>
                  {this.state.errorMessage}
                </Typography>
                ) : ''}
              <ValidatorForm autoComplete="off" onSubmit={this.handleSubmit}>
                <TextValidator
                  label="New Password"
                  type="password"
                  name="password1"
                  value={this.state.password1}
                  className={classes.textField}
                  margin="normal"
                  validators={['required', 'minStringLength:8',]}
                  errorMessages={['This Field is required',
                                  'Must be at least 8 characters long',]}
                  onChange={this.handlePasswordChange}
                />
                <br />
                <TextValidator
                  label="Confirm New Password"
                  type="password"
                  name="password2"
                  value={this.state.password2}
                  className={classes.textField}
                  margin="normal"
                  validators={['required', 'isPasswordMatch',]}
                  errorMessages={['This Field is required',
                                  'Passwords do not match',]}
                  onChange={this.handlePasswordChange}
                />
                <br /> <br />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  className={classes.button}
                  disabled={this.state.busy}
                >
                  Reset
                </Button>
              </ValidatorForm>
            </center>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme : true })(ResetPassword);
