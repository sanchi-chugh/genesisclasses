import React from 'react';
import {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  Form,
  HelpBlock
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
        errors:{}
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
      if (isLoggedIn){
        this.props.getUser((user) => {
          console.log("user", user);
          if(user.type === 'student' && user.complete)
            this.props.history.push("/home");
          else if(user.type === "student" && !user.complete)
            this.props.history.push("/completeDetails");
          else
            this.props.history.push("/bulkStudents");
        });
      }
      else {
        console.log('Authentication Failed', res);
        this.setState({ errors: res.data , busy : false });
      }
    });
  }

  render() {
    const { errors } = this.state;
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
                  {
                    Object.keys(errors)
                            .some(item=> item === "error") && 
                        <b><HelpBlock>{errors.error}</HelpBlock></b>
                  } 
                  <FormInputs
                    ncols={["col-md-12"]}
                    proprieties={[
                      {
                        label: `Username *`,
                        type: "text",
                        bsClass: "form-control",
                        placeholder: "Username",
                        name:'username',
                        errors:errors,
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
                        errors:errors,
                        value: this.state.password,
                        onChange: this.setPassword.bind(this)
                      }
                    ]}
                  />
                  <button type="submit" disabled={this.state.busy} className="login-btn">
                    Login
                  </button>
                  {this.state.busy && <div className="login-loading"><div className="loader"></div>Validating Credentials...</div>}
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
