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

class ForgotPassword extends React.Component {
  constructor(props){
    super();
    this.state = {
      busy: false,
      error: false,
      sent: false,
      email: '',
    }
  }

  handleEmailChange = (event) => {
    this.setState({ email: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ busy: true }, () => {
      axios.post("/api-auth/password/reset/", {
        email: this.state.email,
      })
      .then(() => this.setState({ busy: false, sent: true }))
      .catch((err) => this.setState({ busy: false, sent: false }))
    });
  }

  render() {
    const { classes } = this.props;
    if (this.state.sent) {
      return (
        <div className={classes.container} >
          <Card className={classes.card}>
            <center>
              <Typography variant="headline" component="h2">
                Reset Password
              </Typography>
              <CardContent>
                <Typography>
                  If an account with the given email exists then we have sent you a message to reset your password.
                  Click the link present in it to reset your password.
                </Typography>
              </CardContent>
            </center>
          </Card>
        </div>
      );
    }
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
                Enter your email and we'll send you a
                link to reset your password.
              </Typography>
              <ValidatorForm noValidate autoComplete="off" onSubmit={this.handleSubmit}>
                <TextValidator
                  name="email"
                  label="Email"
                  value={this.state.email}
                  validators={['required', 'isEmail']}
                  errorMessages={['email is required', 'email is invalid']}
                  className={classes.textField}
                  margin="normal"
                  error={this.state.error}
                  onChange={this.handleEmailChange}
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

export default withStyles(styles, { withTheme : true })(ForgotPassword);
