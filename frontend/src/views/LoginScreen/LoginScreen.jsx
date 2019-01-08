import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Link } from 'react-router-dom';
import { login } from '../../auth';

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
  forgot: {
    textDecoration: 'none',
  },
});

class LoginScreen extends React.Component {
  constructor(props){
    super();
    this.state = {
        username : '',
        password : '',
        error: false,
        busy: false,
    }
  }

  setUsername(event){
    this.setState({
      username : event.target.value,
      error: false,
    });
  }

  setPassword(event){
    this.setState({
      password : event.target.value,
      error: false,
    });
  }

  userLogin(event){
    this.setState({ busy: true });
    login(this.state.username, this.state.password, (isLoggedIn, res) => {
      console.log(this.props.getUser)
      if (isLoggedIn){
        this.props.getUser((user) => {
          console.log("user", user);
          this.props.history.push("/home/");
        });
      }
      else {
        console.log('Authentication Failed');
        this.setState({ error: true, busy : false });
      }
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
                Login
              </Typography>
              <Typography style={
                this.state.error ? 
                  {visibility: 'visible'} :
                  {visibility: 'hidden'}
                }
              >
                Invalid Credentials
              </Typography>
              <form noValidate autoComplete="off">
                <TextField
                  id="required"
                  label="Username"
                  defaultValue = ""
                  className={classes.textField}
                  margin="normal"
                  onChange = {(event) => this.setUsername(event)}
                  error={this.state.error}
                />
                <br />
                <TextField
                  id="password-input"
                  label="Password"
                  className={classes.textField}
                  defaultValue = ""
                  type="password"
                  margin="normal"
                  error={this.state.error}
                  onChange = {(event) => this.setPassword(event)}
                />
                <br /> <br />
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={(event) => this.userLogin(event)}
                  disabled={this.state.busy}
                >
                  Login
                </Button>
                <br />
                <br />
                <Link className={classes.forgot} to={"/forgot-password/"}>
                  <Typography> Forgot Password? </Typography>
                </Link>
              </form>
            </center>
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme : true })(LoginScreen);
