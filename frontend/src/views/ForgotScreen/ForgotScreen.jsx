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
import axios from 'axios';
import appLogo from "../../assets/img/app_logo.png";
import study from "../../assets/img/study.png";

class ForgotScreen extends React.Component {
  constructor(props){
    super();
    this.state = {
        email : '',
        error: false,
        busy: false,
        password1:null,
        password2:null,
        errors:{}
    }
  }

  set(event){
    this.setState({
      [event.target.name] : event.target.value,
    });
  }

  handleReset(e){
    e.preventDefault();
    var formData = new FormData();
    formData.append('email',this.state.email)
    this.setState({busy:true},()=>{
      axios.post(`/api-auth/password/reset/`, formData)
      .then((res) => this.setState({ busy: false}, ()=>{
        alert('Email with reset link has been sent! Check your email.') 
        this.props.history.goBack();
      }))
      .catch((err) => this.setState({ busy: false, errors: err.response.data }, () => console.log(err)))
    })
  }

  handleConfirm(e){
    e.preventDefault();
    var formData = new FormData();
    formData.append('new_password1',this.state.password1);
    formData.append('new_password2',this.state.password2);
    formData.append('token',this.props.match.params.token);
    formData.append('uid',this.props.match.params.uid);
    this.setState({busy:true},()=>{
      axios.post(`/api-auth/password/reset/confirm/`, formData)
      .then((res) => this.setState({ busy: false}, ()=>{
        alert('Password Reset Successful! Login to continue.') 
        this.props.history.push('/');
      }))
      .catch((err) => this.setState({ busy: false, errors: err.response.data }, () => console.log(err)))
    })
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
                <h5>Reset you password</h5>
                {this.props.flag &&
                  <form onSubmit={(event)=> this.handleConfirm(event)} className="login-form">
                  {
                    Object.keys(errors)
                            .some(item=> item === "error") && 
                        <b><HelpBlock>{errors.error}</HelpBlock></b>
                  } 
                  <FormInputs
                    ncols={["col-md-12"]}
                    proprieties={[
                      {
                        label: `Password *`,
                        type: "password",
                        bsClass: "form-control",
                        placeholder: "Password",
                        name:'password1',
                        errors:errors,
                        value: this.state.password1,
                        onChange: this.set.bind(this)
                      }
                    ]}
                  />
                  <FormInputs
                    ncols={["col-md-12"]}
                    proprieties={[
                      {
                        label: `Confirm Password *`,
                        type: "password",
                        bsClass: "form-control",
                        placeholder: "Retype password",
                        name:'password2',
                        errors:errors,
                        value: this.state.password2,
                        onChange: this.set.bind(this)
                      }
                    ]}
                  />
                  <button type="submit" disabled={this.state.busy} className="login-btn">
                    {this.state.busy && <div className="loader"></div>}
                    Change Password
                  </button>
                  <Link to={"/"}>
                    <div className="forgot"> Go Back To Login Page </div>
                  </Link>
                  <img src={study} className="study"/>
                  <h5 style={{fontSize:12}}>Reset your userId by calling 124669009</h5>
                </form>
                }
                {!this.props.flag &&
                <form onSubmit={(event)=> this.handleReset(event)} className="login-form">
                  {
                    Object.keys(errors)
                            .some(item=> item === "error") && 
                        <b><HelpBlock>{errors.error}</HelpBlock></b>
                  } 
                  <FormInputs
                    ncols={["col-md-12"]}
                    proprieties={[
                      {
                        label: `Registered Email Id *`,
                        type: "text",
                        bsClass: "form-control",
                        placeholder: "Email",
                        name:'email',
                        errors:errors,
                        value: this.state.email,
                        onChange: this.set.bind(this)
                      }
                    ]}
                  />
                  <button type="submit" disabled={this.state.busy} className="login-btn">
                    {this.state.busy && <div className="loader"></div>}
                    Reset Password
                  </button>
                  <Link to={"/"}>
                    <div className="forgot"> Go Back To Login Page </div>
                  </Link>
                  <img src={study} className="study"/>
                  <h5 style={{fontSize:12}}>Reset your userId by calling 124669009</h5>
                </form>}
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

export default ForgotScreen;
