import React from 'react';
import {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  Form
} from "react-bootstrap";
import { FormInputs } from "../../components/FormInputs/FormInputs.jsx";
import { Card } from "../../components/Card/Card.jsx";
import Button from "../../components/CustomButton/CustomButton.jsx";
import LinearProgress from '@material-ui/core/LinearProgress';
import { Link } from 'react-router-dom';
import { login } from '../../auth';

import appLogo from "../../assets/img/app_logo.png";
import study from "../../assets/img/study.png";

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
    event.preventDefault();
    this.setState({ busy: true });
    login(this.state.username, this.state.password, (isLoggedIn, res) => {
      console.log(isLoggedIn)
      if (isLoggedIn){
        this.props.getUser((user) => {
          console.log("user", user);
          if(user.type === 'student')
            this.props.history.push("/");
          else
            this.props.history.push("/dashboard");
        });
      }
      else {
        console.log('Authentication Failed');
        this.setState({ error: true, busy : false });
      }
    });
  }

  render() {
    return(
      <div className="wrapper login-wrapper">
        <div className="header">
            <div className="logo">
              <img src={appLogo} />
            </div>
        </div>
        <center>
        <div className="login-card">
          <Card 
            plain
            content={
              <div className="card" style={{margin:0}}>
                <div className="card-head">
                  Education Panel
                </div>
                <h5>Login to access your account</h5>
                <form onSubmit={(event) => this.userLogin(event)} className="login-form">
                  <FormInputs
                    ncols={["col-md-12"]}
                    proprieties={[
                      {
                        label: `Username *`,
                        type: "text",
                        bsClass: "form-control",
                        placeholder: "Username",
                        name:'username',
                        value: this.state.username,
                        onChange: this.setUsername.bind(this)
                      }
                    ]}
                  />
                  <FormInputs
                    ncols={["col-md-12"]}
                    proprieties={[
                      {
                        label: "Passoword *",
                        type: "password",
                        bsClass: "form-control",
                        placeholder: "Password",
                        name:'password',
                        value: this.state.password,
                        onChange: this.setPassword.bind(this)
                      }
                    ]}
                  />
                  <button type="submit" disabled={this.state.busy} className="login-btn">
                    Login
                  </button>
                  <Link to={"/forgot-password/"}>
                    <div className="forgot"> Forgot Password? </div>
                  </Link>
                  <img src={study} className="study"/>
                  <h5 style={{fontSize:12}}>Reset your userId by calling 124669009</h5>
                </form>
              </div>
            }
          />
        </div>
        </center>
        <div className="footer-login">
          Admission Cum Scholarship Test
        </div>
      </div>
    );
  }
}

export default LoginScreen;
