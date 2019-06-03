import React, { Component } from "react";
import {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  Badge,
  HelpBlock
} from "react-bootstrap";

import moment from 'moment';

import { Checkbox, Icon} from 'antd';
import { FormInputs } from "../../components/FormInputs/FormInputs.jsx";
import { Card } from "../../WebAppComponents/Card/Card.jsx";
import axios from "axios";
import { LinearProgress } from "@material-ui/core";
import Button from "../../components/CustomButton/CustomButton.jsx";


class EditProfile extends Component {

  constructor() {
    super();
    this.state = {
      busy: true,
      user: null,
      updatingStudent: false,
      studentUpdated: false,
      errors:{}
    };
  }

  componentDidMount() {
    console.log(this.props.user)
    this.setState({
      busy:false,
      user:{
        ...this.props.user,
        dateOfBirth: moment(new Date(this.props.user.dateOfBirth)).format("YYYY-MM-DD"),
        file: null
      }
    })
   }

  async handleEdit(e){
    e.preventDefault();
    this.setState({ updatingStudent: true }, () => {
      var formData = new FormData();
      formData.append('first_name',this.state.user.first_name)
      formData.append('last_name',this.state.user.last_name)
      formData.append('contact_number',this.state.user.contact_number)
      formData.append('email',this.state.user.email)
      formData.append('endAccessDate',moment(new Date(this.state.user.endAccessDate)).format("YYYY-MM-DD"))
      formData.append('joiningDate',moment(new Date(this.state.user.joiningDate)).format("YYYY-MM-DD"))
      formData.append('course',this.state.user.course.join(','))
      formData.append('centre',this.state.user.centre)
      formData.append('father_name',this.state.user.father_name)
      formData.append('gender',this.state.user.gender)
      if(this.state.user.dateOfBirth !== null && this.state.user.dateOfBirth !== '')
        formData.append('dateOfBirth',this.state.user.dateOfBirth)
      else
        formData.append('dateOfBirth','')
      formData.append('address',this.state.user.address)
      formData.append('city',this.state.user.city)
      formData.append('state',this.state.user.state)
      formData.append('pinCode',this.state.user.pinCode)
      if(this.props.flag){
        formData.append('username', this.state.user.username)
        formData.append('password1', this.state.user.password1)
        formData.append('password2', this.state.user.password2)
      }
      if(this.state.user.clear){
        formData.append('image','')
      }else if(this.state.user.file !== null){
        formData.append('image',this.state.user.file,this.state.user.file.name)
      }
      axios.put(`/api/app/profile/update/`, formData, {
        headers: {
          Authorization: `Token ${localStorage.token}`,
        },
      })
      .then((res) => this.setState({ updatingStudent: false, studentUpdated:true },async ()=>{
        if(this.props.flag){
          await this.props.completeProfile();
          this.props.getUser();
          this.props.history.push("/home");
        }else{
          this.props.getUser();
          this.props.history.push('/home/editProfile');
        }
        this.props.handleClick('tr','Updated Successfully');
      }))
      .catch((err) => this.setState({ updatingStudent: false, errors: err.response.data }, () => console.log(err)))
    });
  }

  handleFormDataChange(e) {
    if(e.target.name === 'image'){
      if(e.target.files.length){
        document.getElementById('text').innerHTML = `<a href="${URL.createObjectURL(e.target.files[0])}" target="_blank">${e.target.files[0].name}</a>`
        let file = e.target.files[0]
        this.setState({ 
          user: {
          ...this.state.user,
          file : file,
          image:URL.createObjectURL(e.target.files[0])
      }});
      }
    }else if(e.target.name==='clear'){
      this.setState({ 
        user:{
          ...this.state.user,
          clear: e.target.checked
        }
      });
    }else{
      this.setState({ user: {
        ...this.state.user,
        [e.target.name] : e.target.value
    }});
    }
  }

  render() {
    const { errors } = this.state;
    if(this.state.busy){
      return null
    }
    return (
      <div className="content home-content">
        <h4 className="title-heading">{this.props.flag ? "Complete Details" : "Edit Profile"}</h4>
        <div className="edit-profile-container">
          <form onSubmit={this.handleEdit.bind(this)}>
          <div className="edit-profile-form">
            <FormInputs
              ncols={["col-md-6", "col-md-6"]}
              proprieties={[
                {
                  label: `First Name *`,
                  type: "text",
                  bsClass: "form-control",
                  placeholder: "First Name",
                  name:'first_name',
                  errors:errors,
                  value:this.state.user.first_name,
                  onChange:this.handleFormDataChange.bind(this)
                },
                {
                  label: "Last Name *",
                  type: "text",
                  bsClass: "form-control",
                  placeholder: "Last Name",
                  name:'last_name',
                  errors:errors,
                  value:this.state.user.last_name,
                  onChange:this.handleFormDataChange.bind(this)
                }
              ]}
            />
            <FormInputs
              ncols={["col-md-12"]}
              proprieties={[
                {
                  label: `Father Name *`,
                  type: "text",
                  bsClass: "form-control",
                  placeholder: "Father Name",
                  name:'father_name',
                  errors:errors,
                  value:this.state.user.father_name,
                  onChange:this.handleFormDataChange.bind(this)
                },
              ]}
            />
            <FormInputs
              ncols={["col-md-12"]}
              proprieties={[
                {
                  label: "Address *",
                  type: "text",
                  bsClass: "form-control",
                  placeholder: "Home Adress",
                  name:'address',
                  errors:errors,
                  value:this.state.user.address,
                  onChange:this.handleFormDataChange.bind(this)
                }
              ]}
            />
            <FormInputs
              ncols={["col-md-4", "col-md-4", "col-md-4"]}
              proprieties={[
                {
                  label: "City *",
                  type: "text",
                  bsClass: "form-control",
                  placeholder: "City",
                  name:'city',
                  errors:errors,
                  value:this.state.user.city,
                  onChange:this.handleFormDataChange.bind(this)
                },
                {
                  label: "State *",
                  type: "text",
                  bsClass: "form-control",
                  placeholder: "State",
                  name:'state',
                  errors:errors,
                  value:this.state.user.state,
                  onChange:this.handleFormDataChange.bind(this)
                },
                {
                  label: "Postal Code *",
                  type: "number",
                  bsClass: "form-control",
                  placeholder: "ZIP Code",
                  name:'pinCode',
                  errors:errors,
                  value:this.state.user.pinCode,
                  onChange:this.handleFormDataChange.bind(this)
                }
              ]}
            />
            <Col md={12} style={{padding:0}}>
              <FormGroup>
                  <ControlLabel className="form-input">Gender *</ControlLabel>
                  <FormControl 
                    componentClass="select" 
                    value={this.state.user.gender} 
                    onChange={this.handleFormDataChange.bind(this)} 
                    name="gender">
                      <option value=''>Choose Gender...</option>
                      <option value='male'>Male</option>
                      <option value='female'>Female</option>   
                  </FormControl> 
                  {
                    Object.keys(errors)
                            .some(item=> item === "gender") && 
                                errors.gender.map(err=>
                                    <HelpBlock>{err}</HelpBlock>
                                )
                  } 
              </FormGroup>
            </Col>
            <FormInputs
              ncols={["col-md-6", "col-md-6"]}
              proprieties={[
                {
                  label: "Date Of Birth *",
                  type: "date",
                  bsClass: "form-control",
                  placeholder: "Date Of Birth",
                  name:'dateOfBirth',
                  errors: errors,
                  value:this.state.user.dateOfBirth,
                  onChange:this.handleFormDataChange.bind(this)
                },
                {
                  label: "Contact Number *",
                  type: "phone-number",
                  bsClass: "form-control",
                  placeholder: "Contact Number",
                  name:'contact_number',
                  errors: errors,
                  value:this.state.user.contact_number,
                  onChange:this.handleFormDataChange.bind(this)
                },
              ]}
            />
          </div>
          <div className="edit-profile-form">
            <FormInputs
              ncols={["col-md-12"]}
              proprieties={[
                {
                  label: "Email address *",
                  type: "email",
                  bsClass: "form-control",
                  placeholder: "Email",
                  name:'email',
                  errors: errors,
                  value:this.state.user.email,
                  onChange:this.handleFormDataChange.bind(this)
                },
              ]}
            />
            { this.props.flag && <div>
                    <FormInputs
                          ncols={["col-md-12"]}
                          proprieties={[
                            {
                              label: "Username *",
                              type: "text",
                              bsClass: "form-control",
                              placeholder: "Username",
                              name:'username',
                              errors: errors,
                              value:this.state.user.username,
                              onChange:this.handleFormDataChange.bind(this)
                            },
                          ]}
                        />
                        <FormInputs
                          ncols={["col-md-12"]}
                          proprieties={[
                            {
                              label: "Password *",
                              type: "password",
                              bsClass: "form-control",
                              placeholder: "Password",
                              name:'password1',
                              errors: errors,
                              value:this.state.user.password1,
                              onChange:this.handleFormDataChange.bind(this)
                            },
                          ]}
                        />
                        <FormInputs
                          ncols={["col-md-12"]}
                          proprieties={[
                            {
                              label: "Confirm Password *",
                              type: "password",
                              bsClass: "form-control",
                              placeholder: "Password",
                              name:'password2',
                              errors: errors,
                              value:this.state.user.password2,
                              onChange:this.handleFormDataChange.bind(this)
                            },
                          ]}
                        />
                    </div>}
            <ControlLabel className="form-input">Image</ControlLabel>
              {   this.state.user.image === null ? 
                    <Col  md={12}>
                        <div>No Image Available</div>
                    </Col>:
                  <Row md={12}>
                    <Col xs={4}>
                        <a href={this.state.user.image} target="_blank">{this.state.user.image.split('/')[5]}</a> 
                    </Col>
                    <Col xs={4}>
                        <Checkbox onChange={this.handleFormDataChange.bind(this)} name="clear" >CLEAR</Checkbox><br/>
                    </Col>
                  </Row>
              }
              {
                Object.keys(errors)
                        .some(item=> item === "gender") && 
                            errors.gender.map(err=>
                                <HelpBlock>{err}</HelpBlock>
                            )
              } 
            <label className="file">
                <FormControl
                    type="file"
                    placeholder="Profile Image"
                    name='image'
                    onChange={this.handleFormDataChange.bind(this)}
                />
                <span className="file-custom"><span id="text">Choose Image...</span></span>
            </label>
            {!this.props.flag && 
              <div>
                <Row xs={12} style={{marginBottom:'5px'}}>
                  <b><Col md={5}>Courses</Col></b>
                  <Col md={7}>{this.state.user.course.map(item => {return (<Badge style={{marginRight:2}}>{item.title}</Badge>)})}</Col>
                </Row>
                <Row xs={12} style={{marginBottom:'5px'}}>
                  <b><Col md={5}>Centre</Col></b>
                  <Col md={7}>{this.state.user.centre}</Col>
                </Row>
                <Row xs={12} style={{marginBottom:'5px'}}>
                  <b><Col md={5}>Joining Data</Col></b>
                  <Col md={7}>{this.state.user.joiningDate}</Col>
                </Row>
                <Row xs={12} style={{marginBottom:'5px'}}>
                  <b><Col md={5}>End Access Date</Col></b>
                  <Col md={7}>{this.state.user.endAccessDate}</Col>
                </Row>
              </div>
            }
            <LinearProgress
            style={
                this.state.updatingStudent ? 
                {visibility: 'visible'} :
                {visibility: 'hidden'}
                }
            color="primary"
            />
            <Button style={{backgroundColor: '#02458e', borderColor: '#02458e', padding: 0}} bsStyle="success" pullRight fill type="submit">
              EDIT PROFILE
            </Button>
            <div className="clearfix" />
          </div>
         </form>
        </div>
      </div>
    );
  }
}

export default EditProfile;
