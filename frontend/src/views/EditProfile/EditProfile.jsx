import React, { Component } from "react";
import {
  Grid,
  Row,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  Badge
} from "react-bootstrap";

import { Checkbox, Icon} from 'antd';
import { FormInputs } from "../../components/FormInputs/FormInputs.jsx";
import { Card } from "../../WebAppComponents/Card/Card.jsx";
import Axios from "axios";


class EditProfile extends Component {

  constructor() {
    super();
    this.state = {
      busy: true,
      user: null
    };
  }

  componentDidMount() {
    console.log(this.props.user)
    this.setState({
      busy:false,
      user:this.props.user
    })
   }

  handleFormDataChange(){

  }

  render() {
    if(this.state.busy){
      return null
    }
    return (
      <div className="content home-content">
        <h4 className="title-heading">Edit Profile</h4>
        <div className="edit-profile-container">
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
                  value:this.state.user.first_name,
                  onChange:this.handleFormDataChange.bind(this)
                },
                {
                  label: "Last Name *",
                  type: "text",
                  bsClass: "form-control",
                  placeholder: "Last Name",
                  name:'last_name',
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
                  value:this.state.user.city,
                  onChange:this.handleFormDataChange.bind(this)
                },
                {
                  label: "State *",
                  type: "text",
                  bsClass: "form-control",
                  placeholder: "State",
                  name:'state',
                  value:this.state.user.state,
                  onChange:this.handleFormDataChange.bind(this)
                },
                {
                  label: "Postal Code *",
                  type: "number",
                  bsClass: "form-control",
                  placeholder: "ZIP Code",
                  name:'pinCode',
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
                  value:this.state.user.dateOfBirth,
                  onChange:this.handleFormDataChange.bind(this)
                },
                {
                  label: "Contact Number *",
                  type: "phone-number",
                  bsClass: "form-control",
                  placeholder: "Contact Number",
                  name:'contact_number',
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
                  value:this.state.user.email,
                  onChange:this.handleFormDataChange.bind(this)
                },
              ]}
            />
            <ControlLabel className="form-input">Image</ControlLabel>
              {   this.state.user.image === null ? 
                    <Col  md={12}>
                        <div>No Image Available</div>
                    </Col>:
                  <Row md={12}>
                    <Col xs={4}>
                        <a href={this.state.user.image} target="_blank">{this.state.user.image.split('/')[4]}</a> 
                    </Col>
                    <Col xs={4}>
                        <Checkbox onChange={this.handleFormDataChange.bind(this)} name="clear" >CLEAR</Checkbox><br/>
                    </Col>
                  </Row>
              }
              <br/>
            <FormControl
                type="file"
                placeholder="Image"
                name='image'
                onChange={this.handleFormDataChange.bind(this)}
            /> <br/>
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
        </div>
      </div>
    );
  }
}

export default EditProfile;
